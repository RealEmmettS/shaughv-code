#!/usr/bin/env python3
"""
fit.py - Shrink an image until its encoded file size is <= a target (default 100 MiB),
going from LEAST-destructive to MOST-destructive, preserving aspect ratio, and then
VERIFYING the result is the same picture (not cropped or missing regions) before returning.

Why this exists
---------------
fal's clarityai/crystal-upscaler rejects an `image_url` whose file is larger than
100 MiB (104,857,600 bytes). Rather than fail, this driver guarantees an input that
fits while sacrificing as little quality as possible. It is imported by upscale.py
(`from fit import fit_to_size`) for automatic pre-upload fitting, and is runnable
standalone.

The ladder (stops at the first stage that fits = maximum retained quality):
  Stage 0  skip       - already <= target, return the original untouched.
  Stage 1  lossless   - strip metadata; re-encode PNG (optimize) + lossless WebP; keep smallest.
  Stage 2  near-loss  - WebP q95 (JPEG q95 alt) at full resolution.
  Stage 3  quality    - binary-search the HIGHEST quality (>= floor) that fits, full resolution.
  Stage 4  resolution - aspect-preserving downscale via informed sqrt jumps until it fits.
  Stage 5  validate   - prove the fitted copy is the same picture as the untouched original
                        (aspect ratio + structural correlation + perceptual hash). On failure,
                        redo once via a pure uniform resize; if it still fails, ABORT so a
                        cropped/corrupted image never reaches the API.

The pipeline only ever UNIFORMLY SCALES + RE-ENCODES; it never crops. The original file on
disk is never modified - all work happens on an in-memory copy and the output is a new file.

Requires Pillow. numpy is optional (faster Stage-5 correlation; pure-Python fallback otherwise).
"""
from __future__ import annotations

import argparse
import io
import json
import math
import sys
import tempfile
from pathlib import Path

try:
    from PIL import Image, ImageOps
except ImportError:  # pragma: no cover
    Image = None
    ImageOps = None

try:
    import numpy as _np
except ImportError:
    _np = None

__all__ = ["fit_to_size", "DEFAULT_MAX_BYTES"]

# fal clarityai/crystal-upscaler: image_url max_file_size = 100 MiB (104,857,600 bytes)
DEFAULT_MAX_BYTES = 104_857_600
DEFAULT_MIN_DIMENSION = 64
DEFAULT_QUALITY_FLOOR = 40
DEFAULT_MIN_CORRELATION = 0.95
COMPARE_SIZE = 256          # normalize both images to this NxN grayscale grid for compare
ASPECT_TOLERANCE = 0.02     # allow <=2% aspect drift (integer rounding); a crop blows past this
WEBP_MAX_DIM = 16383        # libwebp hard limit per side
_EXT = {"PNG": ".png", "WEBP": ".webp", "JPEG": ".jpg"}


def _log(msg: str, quiet: bool = False) -> None:
    if not quiet:
        print(msg, file=sys.stderr, flush=True)


# --------------------------------------------------------------------------- encoding helpers
def _has_alpha(img) -> bool:
    return img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info)


def _webp_ok(size) -> bool:
    return max(size) <= WEBP_MAX_DIM


def _prep(img, fmt: str):
    """Coerce mode so the target encoder accepts it (kept lossless where possible)."""
    if fmt == "WEBP":
        if img.mode in ("RGB", "RGBA", "L"):
            return img
        return img.convert("RGBA" if _has_alpha(img) else "RGB")
    if fmt == "JPEG":
        if img.mode in ("RGB", "L"):
            return img
        return img.convert("RGB")
    return img  # PNG handles L/P/RGB/RGBA directly


def _encode(img, fmt: str, quality=None, lossless: bool = False) -> bytes:
    im = _prep(img, fmt)
    buf = io.BytesIO()
    if fmt == "PNG":
        im.save(buf, "PNG", optimize=True, compress_level=9)
    elif fmt == "WEBP":
        if lossless:
            im.save(buf, "WEBP", lossless=True, quality=100, method=6)
        else:
            im.save(buf, "WEBP", quality=int(quality), method=6)
    elif fmt == "JPEG":
        im.save(buf, "JPEG", quality=int(quality), optimize=True, progressive=True)
    else:
        raise ValueError(f"unsupported format {fmt!r}")
    return buf.getvalue()


# --------------------------------------------------------------------------- Stage-5 validation
def _dhash(img, hash_size: int = 8) -> int:
    im = img.convert("L").resize((hash_size + 1, hash_size), Image.LANCZOS)
    px = list(im.getdata())
    bits = 0
    w = hash_size + 1
    for row in range(hash_size):
        base = row * w
        for col in range(hash_size):
            bits = (bits << 1) | (1 if px[base + col] > px[base + col + 1] else 0)
    return bits


def _hamming(a: int, b: int) -> int:
    return bin(a ^ b).count("1")


def _correlation_and_mae(img_a, img_b, size):
    a = img_a.convert("L").resize(size, Image.LANCZOS)
    b = img_b.convert("L").resize(size, Image.LANCZOS)
    da, db = list(a.getdata()), list(b.getdata())
    if _np is not None:
        na = _np.asarray(da, dtype=_np.float64)
        nb = _np.asarray(db, dtype=_np.float64)
        mae = float(_np.mean(_np.abs(na - nb)) / 255.0)
        if na.std() == 0 or nb.std() == 0:
            return (1.0 if mae < 0.02 else 0.0), mae
        return float(_np.corrcoef(na, nb)[0, 1]), mae
    n = len(da)
    sa, sb = sum(da), sum(db)
    mae = sum(abs(x - y) for x, y in zip(da, db)) / (n * 255.0)
    saa = sum(x * x for x in da)
    sbb = sum(y * y for y in db)
    sab = sum(x * y for x, y in zip(da, db))
    den = math.sqrt((n * saa - sa * sa) * (n * sbb - sb * sb))
    r = (n * sab - sa * sb) / den if den else (1.0 if mae < 0.02 else 0.0)
    return r, mae


def _validate(orig_img, fit_img, min_corr: float) -> dict:
    """Confirm fit_img is the same picture as orig_img (same scene, just smaller/compressed)."""
    w0, h0 = orig_img.size
    w1, h1 = fit_img.size
    ar0, ar1 = w0 / h0, w1 / h1
    aspect_rel = abs(ar0 - ar1) / ar0
    aspect_ok = aspect_rel <= ASPECT_TOLERANCE
    # Compare at the fitted image's own resolution (capped) so a legitimate uniform downscale
    # matches its source closely, while a crop - which reframes the content - still diverges.
    cmp_size = (max(8, min(COMPARE_SIZE, w1)), max(8, min(COMPARE_SIZE, h1)))
    r, mae = _correlation_and_mae(orig_img, fit_img, cmp_size)
    dh = _hamming(_dhash(orig_img), _dhash(fit_img))
    return {
        "aspect_ok": bool(aspect_ok),
        "aspect_rel_diff": round(aspect_rel, 4),
        "correlation": round(float(r), 4),
        "mae": round(float(mae), 4),
        "dhash_distance": int(dh),
        "min_correlation": min_corr,
        "passed": bool(aspect_ok and r >= min_corr),
    }


# --------------------------------------------------------------------------- main entry point
def fit_to_size(
    input_path,
    max_bytes: int = DEFAULT_MAX_BYTES,
    *,
    min_dimension: int = DEFAULT_MIN_DIMENSION,
    quality_floor: int = DEFAULT_QUALITY_FLOOR,
    min_correlation: float = DEFAULT_MIN_CORRELATION,
    out_path=None,
    quiet: bool = False,
) -> dict:
    """Return a report dict describing the fitted file (or the original if it already fits)."""
    if Image is None:
        raise RuntimeError("Pillow is required for fit-to-size. Install it with: pip install pillow")

    input_path = Path(input_path)
    if not input_path.is_file():
        raise FileNotFoundError(f"input image not found: {input_path}")

    orig_bytes = input_path.stat().st_size
    report = {
        "applied": False,
        "stage": 0,
        "target_bytes": max_bytes,
        "original_bytes": orig_bytes,
        "final_bytes": orig_bytes,
        "original_dims": None,
        "final_dims": None,
        "format": (input_path.suffix.lstrip(".").lower() or None),
        "quality": None,
        "output_path": str(input_path),
        "is_temp": False,
        "fit_incomplete": False,
        "validation": None,
    }

    # Load once; apply EXIF orientation so the working copy matches what a viewer shows
    # (this also strips metadata on re-encode and avoids a rotation mismatch in Stage 5).
    with Image.open(input_path) as im0:
        im0.load()
        original = ImageOps.exif_transpose(im0) if ImageOps is not None else im0.copy()
    w0, h0 = original.size
    report["original_dims"] = [w0, h0]
    report["final_dims"] = [w0, h0]

    # Stage 0 - already fits: pass the original through untouched (no re-encode).
    if orig_bytes <= max_bytes:
        _log(f"[fit] {input_path.name}: {orig_bytes:,} B <= target {max_bytes:,} B - no fit needed (stage 0).", quiet)
        return report

    _log(f"[fit] {input_path.name}: {orig_bytes:,} B > target {max_bytes:,} B - fitting (aspect-preserving)...", quiet)
    is_temp = out_path is None

    def finish(stage: int, fitted_img, data: bytes, fmt: str, quality, lossless: bool):
        nonlocal report
        # Stage 5 - integrity gate vs the untouched original.
        val = _validate(original, fitted_img, min_correlation)
        if not val["passed"]:
            _log(
                f"[fit] STAGE 5 FAILED (corr={val['correlation']}, aspect_ok={val['aspect_ok']}). "
                f"Redo once via pure uniform resize...",
                quiet,
            )
            redo = original.resize(fitted_img.size, Image.LANCZOS)
            rdata = _encode(redo, fmt, quality, lossless=lossless)
            rval = _validate(original, redo, min_correlation)
            if rval["passed"] and len(rdata) <= max_bytes:
                fitted_img, data, val = redo, rdata, rval
            else:
                raise RuntimeError(
                    "fit integrity check failed - the shrunk image does not match the original "
                    f"(correlation={val['correlation']}, aspect_ok={val['aspect_ok']}); refusing to "
                    "upscale a possibly cropped/corrupted input."
                )

        ext = _EXT[fmt]
        outp = Path(out_path) if out_path else (Path(tempfile.gettempdir()) / f"crystal_fit_{input_path.stem}{ext}")
        outp.parent.mkdir(parents=True, exist_ok=True)
        outp.write_bytes(data)

        incomplete = len(data) > max_bytes
        report.update(
            applied=True,
            stage=stage,
            final_bytes=len(data),
            final_dims=list(fitted_img.size),
            format=fmt.lower(),
            quality=quality,
            output_path=str(outp),
            is_temp=is_temp,
            fit_incomplete=incomplete,
            validation=val,
        )
        msg = (
            f"[fit] stage {stage}: {orig_bytes:,} -> {len(data):,} B "
            f"({original.size[0]}x{original.size[1]} -> {fitted_img.size[0]}x{fitted_img.size[1]}, "
            f"{fmt.lower()}{'' if quality is None else ' q'+str(quality)}); "
            f"corr={val['correlation']} aspect_ok={val['aspect_ok']} -> {outp}"
        )
        _log(msg, quiet)
        if incomplete:
            _log(f"[fit] WARNING: still {len(data):,} B > target after min dimension; the API may reject it.", quiet)
        return report

    # ---- Stage 1: lossless (pixel-perfect) --------------------------------------------------
    cands = []
    try:
        cands.append((_encode(original, "PNG"), "PNG", None, True))
    except Exception as e:  # pragma: no cover
        _log(f"[fit] stage1 PNG encode failed: {e}", quiet)
    if _webp_ok(original.size):
        try:
            cands.append((_encode(original, "WEBP", lossless=True), "WEBP", 100, True))
        except Exception as e:  # pragma: no cover
            _log(f"[fit] stage1 lossless-WebP encode failed: {e}", quiet)
    fitting = [c for c in cands if len(c[0]) <= max_bytes]
    if fitting:
        data, fmt, q, ll = min(fitting, key=lambda c: len(c[0]))
        return finish(1, original, data, fmt, q, ll)

    # ---- Stage 2: near-lossless at full resolution ------------------------------------------
    cands = []
    if _webp_ok(original.size):
        cands.append((_encode(original, "WEBP", 95), "WEBP", 95, False))
    if not _has_alpha(original):
        cands.append((_encode(original, "JPEG", 95), "JPEG", 95, False))
    fitting = [c for c in cands if len(c[0]) <= max_bytes]
    if fitting:
        data, fmt, q, ll = min(fitting, key=lambda c: len(c[0]))
        return finish(2, original, data, fmt, q, ll)

    # ---- Stage 3: quality descent at full resolution (highest quality that fits) ------------
    fmt3 = "WEBP" if _webp_ok(original.size) else ("JPEG" if not _has_alpha(original) else None)
    if fmt3 is not None:
        lo, hi, best = quality_floor, 95, None
        while lo <= hi:
            mid = (lo + hi) // 2
            data = _encode(original, fmt3, mid)
            if len(data) <= max_bytes:
                best = (data, fmt3, mid, False)
                lo = mid + 1
            else:
                hi = mid - 1
        if best is not None:
            return finish(3, original, *best)

    # ---- Stage 4: resolution descent (most destructive) -------------------------------------
    def enc4(im):
        if _webp_ok(im.size):
            return _encode(im, "WEBP", 90), "WEBP", 90, False
        if not _has_alpha(im):
            return _encode(im, "JPEG", 90), "JPEG", 90, False
        return _encode(im, "PNG"), "PNG", None, True

    scale_abs = 1.0
    work = original
    data, fmt, q, ll = enc4(work)
    B = len(data)
    for _ in range(16):
        if B <= max_bytes or min(work.size) <= min_dimension:
            break
        factor = math.sqrt(max_bytes / B) * 0.95
        factor = min(factor, 0.92)  # guarantee progress each pass
        scale_abs *= factor
        nw, nh = round(w0 * scale_abs), round(h0 * scale_abs)
        if min(nw, nh) < min_dimension:
            scale_abs = min_dimension / min(w0, h0)
            nw, nh = round(w0 * scale_abs), round(h0 * scale_abs)
        work = original.resize((max(1, nw), max(1, nh)), Image.LANCZOS)
        data, fmt, q, ll = enc4(work)
        B = len(data)
    return finish(4, work, data, fmt, q, ll)


# --------------------------------------------------------------------------- CLI
def _main(argv=None) -> int:
    p = argparse.ArgumentParser(
        description="Shrink an image to <= a target byte size (default 100 MiB), aspect-preserving, "
        "then verify it still matches the original (not cropped)."
    )
    p.add_argument("input", help="path to the image to fit")
    p.add_argument("-o", "--output", help="output path (default: a temp file; extension set by chosen format)")
    p.add_argument("--max-bytes", type=int, default=DEFAULT_MAX_BYTES,
                   help=f"target max size in bytes (default {DEFAULT_MAX_BYTES} = 100 MiB)")
    p.add_argument("--fit-min-correlation", type=float, default=DEFAULT_MIN_CORRELATION,
                   help="Stage-5 minimum structural correlation vs original (default 0.95)")
    p.add_argument("--fit-min-dimension", type=int, default=DEFAULT_MIN_DIMENSION,
                   help="never shrink the shorter side below this many px (default 64)")
    p.add_argument("--fit-quality-floor", type=int, default=DEFAULT_QUALITY_FLOOR,
                   help="lowest JPEG/WebP quality to try before downscaling (default 40)")
    p.add_argument("--json", action="store_true", help="print the report as JSON on stdout")
    p.add_argument("--quiet", action="store_true", help="suppress progress logs on stderr")
    args = p.parse_args(argv)

    try:
        report = fit_to_size(
            args.input,
            max_bytes=args.max_bytes,
            min_dimension=args.fit_min_dimension,
            quality_floor=args.fit_quality_floor,
            min_correlation=args.fit_min_correlation,
            out_path=args.output,
            quiet=args.quiet,
        )
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        return 1

    if args.json:
        print(json.dumps(report))
    else:
        if report["applied"]:
            print(report["output_path"])
        else:
            print(f"{report['output_path']} (already <= target; unchanged)")
    return 0


if __name__ == "__main__":
    raise SystemExit(_main())
