#!/usr/bin/env python3
"""
upscale.py - Upscale/enhance an image with fal.ai's Clarity Crystal Upscaler
(model id: clarityai/crystal-upscaler), purpose-built for faces and portraits.

Design goals
------------
* Dependency-OPTIONAL: uses the `fal-client` SDK when installed (preferred - clean upload +
  queue polling), otherwise falls back to a pure-stdlib `urllib` client that talks to the
  fal queue REST API directly (data-URI input, no third-party packages required).
* Agent-friendly: a stable JSON contract on stdout (`--json`), all human/progress logs on
  stderr, and meaningful exit codes (0 ok, 2 missing key, 1 other error).
* Safe inputs: oversized local files (> 100 MiB, the API's `image_url` limit) are auto-shrunk
  by fit.py BEFORE upload, on a COPY, with a copy-then-verify integrity gate (never crops).

Auth: set the FAL_KEY environment variable (the value fal gives you, format `<id>:<secret>`).

Usage examples
--------------
    python upscale.py portrait.png --scale 2
    python upscale.py https://example.com/pic.jpg --scale 4 --format png -o big.png
    python upscale.py headshot.webp --scale 2 --creativity 0 --json
"""
from __future__ import annotations

import argparse
import base64
import importlib.util
import json
import mimetypes
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ENDPOINT = "clarityai/crystal-upscaler"
QUEUE_HOST = "https://queue.fal.run"
SYNC_HOST = "https://fal.run"
PRICE_PER_MEGAPIXEL = 0.016  # USD per OUTPUT megapixel (fal: cost ~ output resolution)
DEFAULT_MAX_BYTES = 104_857_600  # 100 MiB - image_url max_file_size

_HAS_FAL = importlib.util.find_spec("fal_client") is not None
try:
    from PIL import Image  # optional: only for the pre-flight cost estimate
except ImportError:
    Image = None


def _log(msg: str, quiet: bool = False) -> None:
    if not quiet:
        print(msg, file=sys.stderr, flush=True)


def _is_remote(s: str) -> bool:
    return s.startswith(("http://", "https://", "data:"))


def _fmt_scale(scale: float) -> str:
    return str(int(scale)) if float(scale).is_integer() else f"{scale:g}"


def _data_uri(path: Path) -> str:
    mime = mimetypes.guess_type(str(path))[0] or "application/octet-stream"
    b64 = base64.b64encode(path.read_bytes()).decode("ascii")
    return f"data:{mime};base64,{b64}"


# --------------------------------------------------------------------------- stdlib queue client
def _http_json(url, key, method="GET", payload=None, timeout=180, retries=3):
    """HTTP JSON request with retry/backoff on transient (5xx / network) errors."""
    data = json.dumps(payload).encode("utf-8") if payload is not None else None
    last = None
    for attempt in range(retries):
        req = urllib.request.Request(url, data=data, method=method)
        req.add_header("Authorization", f"Key {key}")
        req.add_header("Accept", "application/json")
        if data is not None:
            req.add_header("Content-Type", "application/json")
        try:
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                body = resp.read().decode("utf-8")
                return json.loads(body) if body else {}
        except urllib.error.HTTPError as e:
            body = e.read().decode("utf-8", "replace")
            if e.code in (429, 500, 502, 503, 504) and attempt < retries - 1:
                last = e
                time.sleep(1.5 * (attempt + 1))
                continue
            raise RuntimeError(f"HTTP {e.code} from {url}: {body[:500]}") from e
        except (urllib.error.URLError, TimeoutError) as e:
            last = e
            if attempt < retries - 1:
                time.sleep(1.5 * (attempt + 1))
                continue
            raise RuntimeError(f"network error calling {url}: {e}") from e
    raise RuntimeError(f"request to {url} failed after {retries} attempts: {last}")


def _run_stdlib(image_url, args, key):
    """Submit to the fal queue, poll status, fetch the result - using only the stdlib."""
    submit = _http_json(
        f"{QUEUE_HOST}/{ENDPOINT}", key, method="POST",
        payload={
            "image_url": image_url,
            "scale_factor": args.scale,
            "creativity": args.creativity,
            "output_format": args.format,
        },
    )
    request_id = submit.get("request_id")
    status_url = submit.get("status_url") or f"{QUEUE_HOST}/{ENDPOINT}/requests/{request_id}/status"
    response_url = submit.get("response_url") or f"{QUEUE_HOST}/{ENDPOINT}/requests/{request_id}"
    _log(f"[fal] queued request {request_id}", args.quiet)

    deadline = time.time() + 1800  # 30 min ceiling for very large jobs
    while True:
        st = _http_json(f"{status_url}?logs=1", key)
        status = st.get("status")
        if status == "COMPLETED":
            break
        if status not in ("IN_QUEUE", "IN_PROGRESS", None):
            raise RuntimeError(f"unexpected queue status {status!r}: {json.dumps(st)[:500]}")
        for entry in (st.get("logs") or []):
            if isinstance(entry, dict) and entry.get("message"):
                _log(f"[fal] {entry['message']}", args.quiet)
        if time.time() > deadline:
            raise RuntimeError("timed out waiting for the upscale to complete")
        time.sleep(2.0)

    result = _http_json(response_url, key)
    return result, request_id


def _run_fal_client(image_url, args):
    """Preferred path: the official fal-client SDK handles upload + queue polling."""
    import fal_client

    def on_update(update):
        if isinstance(update, fal_client.InProgress):
            for entry in (update.logs or []):
                if isinstance(entry, dict) and entry.get("message"):
                    _log(f"[fal] {entry['message']}", args.quiet)

    result = fal_client.subscribe(
        ENDPOINT,
        arguments={
            "image_url": image_url,
            "scale_factor": args.scale,
            "creativity": args.creativity,
            "output_format": args.format,
        },
        with_logs=True,
        on_queue_update=on_update,
    )
    request_id = getattr(result, "request_id", None)
    if isinstance(result, dict):
        request_id = result.get("request_id", request_id)
    return result, request_id


def _download(url: str, dest: Path) -> int:
    dest.parent.mkdir(parents=True, exist_ok=True)
    req = urllib.request.Request(url, headers={"Accept": "*/*"})
    with urllib.request.urlopen(req, timeout=300) as resp, open(dest, "wb") as fh:
        n = 0
        while True:
            chunk = resp.read(1 << 16)
            if not chunk:
                break
            fh.write(chunk)
            n += len(chunk)
    return n


def main(argv=None) -> int:
    p = argparse.ArgumentParser(
        description="Upscale/enhance an image with fal.ai Clarity Crystal Upscaler "
        "(clarityai/crystal-upscaler).",
        epilog="Set FAL_KEY in the environment first. Bills $0.016 per OUTPUT megapixel.",
    )
    p.add_argument("input", help="local image path, an http(s) URL, or a data: URI")
    p.add_argument("--scale", type=float, default=2.0, help="scale factor 1-200 (default 2)")
    p.add_argument("--creativity", type=float, default=0.0,
                   help="0-10; keep 0-2 for real faces/likeness, higher reconstructs damaged inputs (default 0)")
    p.add_argument("--format", choices=("png", "jpg"), default="png",
                   help="output format (default png; API default is jpg)")
    p.add_argument("-o", "--output", help="output path (default: <stem>_<scale>x.<format> next to a local input)")
    p.add_argument("--json", action="store_true", help="emit a machine-readable JSON summary on stdout")
    p.add_argument("--quiet", action="store_true", help="suppress progress logs on stderr")
    # fit-to-size controls (oversized inputs are auto-shrunk before upload)
    p.add_argument("--max-bytes", type=int, default=DEFAULT_MAX_BYTES,
                   help=f"max input file size before auto-fit kicks in (default {DEFAULT_MAX_BYTES} = 100 MiB)")
    p.add_argument("--no-fit", action="store_true", help="disable auto fit-to-size (error if input exceeds the limit)")
    p.add_argument("--fit-quality-floor", type=int, default=40, help="fit.py: lowest quality before downscaling")
    p.add_argument("--fit-min-dimension", type=int, default=64, help="fit.py: never shrink the short side below this")
    p.add_argument("--fit-min-correlation", type=float, default=0.95,
                   help="fit.py: Stage-5 min structural correlation vs the original")
    args = p.parse_args(argv)

    key = os.environ.get("FAL_KEY")
    if not key:
        print("ERROR: FAL_KEY is not set. Set it, e.g. (PowerShell):\n"
              "  $env:FAL_KEY = [Environment]::GetEnvironmentVariable('FAL_KEY','User')\n"
              "or get a key at https://fal.ai/dashboard/keys", file=sys.stderr)
        return 2

    if not (1 <= args.scale <= 200):
        print(f"ERROR: --scale must be between 1 and 200 (got {args.scale})", file=sys.stderr)
        return 1
    if not (0 <= args.creativity <= 10):
        print(f"ERROR: --creativity must be between 0 and 10 (got {args.creativity})", file=sys.stderr)
        return 1

    remote = _is_remote(args.input)
    src = None if remote else Path(args.input)
    if not remote and not src.is_file():
        print(f"ERROR: input file not found: {args.input}", file=sys.stderr)
        return 1

    # ---- pre-flight cost estimate (best effort) ----
    if not remote and Image is not None:
        try:
            with Image.open(src) as im:
                iw, ih = im.size
            est_mp = (iw * args.scale) * (ih * args.scale) / 1e6
            _log(f"[upscale] input {iw}x{ih}; est. output ~{iw*args.scale:.0f}x{ih*args.scale:.0f} "
                 f"(~{est_mp:.2f} MP, est. ~${est_mp*PRICE_PER_MEGAPIXEL:.3f})", args.quiet)
        except Exception:
            pass

    # ---- auto-fit oversized local inputs (on a copy, with integrity gate) ----
    fit_report = None
    upload_path = src
    if not remote and not args.no_fit and src.stat().st_size > args.max_bytes:
        sys.path.insert(0, str(Path(__file__).resolve().parent))
        try:
            from fit import fit_to_size
        except ImportError as e:
            print(f"ERROR: input exceeds {args.max_bytes} bytes and fit.py/Pillow is unavailable: {e}",
                  file=sys.stderr)
            return 1
        fit_report = fit_to_size(
            src, max_bytes=args.max_bytes, min_dimension=args.fit_min_dimension,
            quality_floor=args.fit_quality_floor, min_correlation=args.fit_min_correlation, quiet=args.quiet,
        )
        if fit_report.get("fit_incomplete"):
            print("ERROR: could not shrink the input under the size limit; aborting.", file=sys.stderr)
            return 1
        upload_path = Path(fit_report["output_path"])
    elif not remote and src.stat().st_size > args.max_bytes:  # --no-fit
        print(f"ERROR: input is {src.stat().st_size} bytes (> {args.max_bytes}) and --no-fit was given.",
              file=sys.stderr)
        return 1

    # ---- build image_url + run ----
    cleanup = fit_report is not None and fit_report.get("is_temp")
    try:
        if remote:
            image_url = args.input
            _log("[upscale] using remote input as-is", args.quiet)
            result, request_id = (_run_fal_client(image_url, args) if _HAS_FAL else _run_stdlib(image_url, args, key))
        elif _HAS_FAL:
            import fal_client
            _log(f"[upscale] uploading {upload_path.name} to fal storage...", args.quiet)
            image_url = fal_client.upload_file(str(upload_path))
            result, request_id = _run_fal_client(image_url, args)
        else:
            _log(f"[upscale] no fal-client; inlining {upload_path.name} as a data URI (stdlib path)...", args.quiet)
            image_url = _data_uri(upload_path)
            result, request_id = _run_stdlib(image_url, args, key)
    finally:
        if cleanup:
            try:
                Path(fit_report["output_path"]).unlink(missing_ok=True)
            except Exception:
                pass

    images = (result or {}).get("images") if isinstance(result, dict) else None
    if not images:
        print(f"ERROR: no images in result: {json.dumps(result)[:600] if isinstance(result, dict) else result}",
              file=sys.stderr)
        return 1
    img0 = images[0]
    out_url = img0["url"]
    width, height = img0.get("width"), img0.get("height")

    # ---- output path ----
    if args.output:
        out_path = Path(args.output)
    elif not remote:
        out_path = src.with_name(f"{src.stem}_{_fmt_scale(args.scale)}x.{args.format}")
    else:
        out_path = Path(f"upscaled_{_fmt_scale(args.scale)}x.{args.format}")

    _log(f"[upscale] downloading result -> {out_path}", args.quiet)
    nbytes = _download(out_url, out_path)

    # ---- exact dims/cost (fill from the file if the API omitted them) ----
    if (width is None or height is None) and Image is not None:
        try:
            with Image.open(out_path) as im:
                width, height = im.size
        except Exception:
            pass
    out_mp = (width * height / 1e6) if (width and height) else None
    cost = round(out_mp * PRICE_PER_MEGAPIXEL, 4) if out_mp is not None else None

    summary = {
        "input": args.input,
        "image_url": image_url if remote else f"(uploaded {upload_path.name})",
        "scale_factor": args.scale,
        "creativity": args.creativity,
        "output_format": args.format,
        "output_path": str(out_path),
        "output_url": out_url,
        "width": width,
        "height": height,
        "output_megapixels": round(out_mp, 3) if out_mp is not None else None,
        "cost_usd": cost,
        "file_bytes": nbytes,
        "request_id": request_id,
        "fit": fit_report,
    }

    if args.json:
        print(json.dumps(summary))
    else:
        dims = f"{width}x{height}" if width and height else "unknown size"
        costs = f"${cost}" if cost is not None else "n/a"
        print(f"Upscaled {args.input} x{_fmt_scale(args.scale)} -> {out_path} ({dims}, {summary['output_megapixels']} MP, ~{costs})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
