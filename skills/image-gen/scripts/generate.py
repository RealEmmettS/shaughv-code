#!/usr/bin/env python3
"""
image-gen — unified image generation & editing across providers:

  * Nano Banana 2 / Gemini  (Google)  — TWO interchangeable backends:
        - fal.ai     -> needs FAL_KEY        (provider="nano-banana", backend="fal", default)
        - Gemini API -> needs GEMINI_API_KEY (provider="nano-banana", backend="gemini")
  * MAI-Image-2.5           (Microsoft) via fal.ai    -> needs FAL_KEY
  * Reve                    (reve.com)  native API     -> needs REVE_API_KEY

It reads a single JSON "request spec", routes to the right provider/backend/endpoint,
handles the per-provider image-encoding quirks, calls the API, then writes the
resulting image(s) to disk and prints the saved paths.

The Gemini-native backend talks to Google directly (no fal.ai in the middle). It
gives finer control over the output and works with API keys vended from a Gemini
subscription. It tries Google's newest **Interactions API** first and, if that
errors, automatically falls back to the stable **generateContent** API — the
caller never has to choose.

Why a JSON spec instead of many flags: the parameter surface differs wildly per
provider, and inline JSON is painful to quote on PowerShell. A spec file keeps
the contract uniform and Windows-safe (mirrors the acumatica-thin-gi pattern).

USAGE
-----
    python generate.py --spec <spec.json> [--out-dir <dir>] [--env-file <path>] [--print-only]

    --spec       Path to the JSON request spec (see SPEC SHAPE below). Required.
    --out-dir    Where to save images. Default: the current user's Downloads folder.
    --env-file   Optional KEY=value file; its keys are loaded into the environment
                 BEFORE the credential check, so a freshly-supplied key works this
                 run without restarting the shell. Only fills keys not already set.
    --print-only Build and print the resolved endpoint + request body (base64 image
                 data redacted) WITHOUT calling the API or needing a key. For dry runs.

REQUIREMENTS
------------
    Env vars (provider/backend-scoped — only the chosen path's key is needed):
        FAL_KEY         fal.ai key  (Nano Banana 2 + MAI-Image-2.5, and nano-banana backend="fal")
        GEMINI_API_KEY  Google key  (nano-banana backend="gemini" — native Gemini API)
        REVE_API_KEY    Reve key    (Reve create/edit/remix)
    Python:   >= 3.9
    Packages: requests        (pip install requests)

SPEC SHAPE
----------
    {
      "provider": "nano-banana" | "mai" | "reve",
      "backend":  "fal" | "gemini",   # nano-banana only; default "fal". "gemini" = native Google API.
      "model":    "gemini-3.1-flash-image",  # gemini backend only; default below (= Nano Banana 2)
      "mode":     "generate" | "edit" | "remix",   # remix is Reve-only
      "prompt":   "text",        # on Reve edit this is the edit instruction
      "images":   ["C:/path/local.png", "https://..."],   # edit/remix only
      "aspect_ratio": "auto",    # optional
      "num_images":   1,         # optional, 1-4 (fal only; Reve + Gemini-native -> always 1)
      "output_format": "png",    # optional, png|jpeg|webp (fal + Gemini-native; Reve returns png)
      "resolution":   "1K",      # optional, Nano Banana (0.5K|1K|2K|4K); Gemini maps 0.5K->512
      "seed":         null,      # optional, Nano Banana fal backend only
      "params":  { ... }         # provider-specific passthrough (see references/*.md)
    }

    Gemini-native "params" knobs (all optional):
        "enable_web_search": true            # Grounding with Google Search (web)
        "enable_image_search": true          # Grounding with Google Image Search (gemini-3.1-flash-image)
        "thinking_level": "high" | "minimal" # reasoning depth (gemini-3.x)
        "interactions":      { ... }         # raw merge into the Interactions body
        "generate_content":  { ... }         # raw merge into the generateContent body

EXIT CODES
----------
    0  success
    1  usage / validation / missing-credential error
    2  API or network error
"""

import argparse
import base64
import json
import mimetypes
import os
import re
import sys
from datetime import date
from pathlib import Path

try:
    import requests
except ImportError:
    sys.stderr.write(
        "ERROR: the 'requests' package is required.\n"
        "Install it with:  pip install requests\n"
    )
    sys.exit(1)

# --- provider constants ------------------------------------------------------

FAL_MODEL_IDS = {
    "nano-banana": "fal-ai/nano-banana-2",
    "mai": "microsoft/mai-image-2.5",
}
FAL_PROVIDERS = set(FAL_MODEL_IDS)
REVE_MODE_PATH = {"generate": "create", "edit": "edit", "remix": "remix"}
# Reve accepts only this fixed aspect-ratio set (no "auto", no extreme ratios).
REVE_ASPECTS = {"16:9", "9:16", "3:2", "2:3", "4:3", "3:4", "1:1"}
EXT_FOR_FORMAT = {"png": "png", "jpeg": "jpg", "jpg": "jpg", "webp": "webp"}

# --- Gemini-native (Google) backend constants --------------------------------

GEMINI_DEFAULT_MODEL = "gemini-3.1-flash-image"   # a.k.a. Nano Banana 2
GEMINI_INTERACTIONS_URL = "https://generativelanguage.googleapis.com/v1beta/interactions"
GEMINI_GENERATE_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
GEMINI_API_REVISION = "2026-05-20"                # required header for the Interactions API
# Aspect ratios accepted by the Gemini 3.x image models (no "auto").
GEMINI_ASPECTS = {
    "1:1", "1:4", "1:8", "2:3", "3:2", "3:4", "4:1",
    "4:3", "4:5", "5:4", "8:1", "9:16", "16:9", "21:9",
}
# Spec resolution -> Gemini image_size token (uppercase K; 0.5K is the literal "512").
GEMINI_SIZE_MAP = {"0.5K": "512", "1K": "1K", "2K": "2K", "4K": "4K"}
GEMINI_MIME_FOR_FORMAT = {"png": "image/png", "jpeg": "image/jpeg", "jpg": "image/jpeg", "webp": "image/webp"}

POST_TIMEOUT = 300   # image generation can be slow
GET_TIMEOUT = 120


def die(msg, code=1):
    sys.stderr.write(f"ERROR: {msg}\n")
    sys.exit(code)


# --- helpers -----------------------------------------------------------------

def load_env_file(path):
    """Load KEY=value lines into os.environ. Existing non-empty vars win."""
    p = Path(path)
    if not p.is_file():
        die(f"--env-file not found: {path}")
    for raw in p.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, val = line.split("=", 1)
        key = key.strip()
        val = val.strip().strip('"').strip("'")
        if key and not os.environ.get(key):
            os.environ[key] = val


def resolve_backend(spec):
    """Effective backend for nano-banana ('fal' default | 'gemini'); 'fal' elsewhere."""
    backend = (spec.get("backend") or "fal").lower()
    if backend not in ("fal", "gemini"):
        die("spec.backend must be 'fal' or 'gemini'")
    if backend == "gemini" and spec.get("provider") != "nano-banana":
        die("backend='gemini' only applies to provider='nano-banana'")
    return backend


def needed_key(provider, backend):
    if provider == "reve":
        return "REVE_API_KEY"
    if provider == "nano-banana" and backend == "gemini":
        return "GEMINI_API_KEY"
    return "FAL_KEY"


def is_url(s):
    return isinstance(s, str) and s.lower().startswith(("http://", "https://"))


def read_image_bytes(ref):
    """Return raw bytes for a local path or an http(s) URL."""
    if is_url(ref):
        r = requests.get(ref, timeout=GET_TIMEOUT)
        r.raise_for_status()
        return r.content
    p = Path(ref)
    if not p.is_file():
        die(f"input image not found: {ref}")
    return p.read_bytes()


def guess_mime(ref):
    return mimetypes.guess_type(ref)[0] or "image/png"


def to_data_uri(ref):
    """fal wants a data: URI for inline images; pass real URLs through untouched."""
    if is_url(ref):
        return ref
    data = read_image_bytes(ref)
    mime = guess_mime(ref)
    return f"data:{mime};base64,{base64.b64encode(data).decode()}"


def to_raw_base64(ref):
    """Reve wants raw base64 (NO data: prefix), even for remote images."""
    return base64.b64encode(read_image_bytes(ref)).decode()


def to_b64_and_mime(ref):
    """Gemini wants raw base64 + an explicit mime_type (downloads URLs first)."""
    return guess_mime(ref), base64.b64encode(read_image_bytes(ref)).decode()


def slugify(text, maxlen=60):
    s = re.sub(r"[^a-z0-9]+", "-", (text or "image").lower())
    s = s.strip("-")[:maxlen].strip("-")
    return s or "image"


def unique_path(out_dir, stem, ext):
    """<out_dir>/<stem>.<ext>, appending -2, -3, ... on collision."""
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    candidate = out_dir / f"{stem}.{ext}"
    n = 2
    while candidate.exists():
        candidate = out_dir / f"{stem}-{n}.{ext}"
        n += 1
    return candidate


def _is_blobish(s):
    """A long, space-free string is almost certainly base64 / a data: URI, not a prompt."""
    return isinstance(s, str) and len(s) > 200 and " " not in s and "\n" not in s


def redact(obj):
    """Recursively shorten base64 image blobs for --print-only (prompts, with spaces, survive)."""
    if isinstance(obj, dict):
        return {k: redact(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [redact(v) for v in obj]
    if _is_blobish(obj):
        return f"<base64 {len(obj)} chars>"
    return obj


# --- request builders: fal ---------------------------------------------------

def build_fal(spec):
    provider, mode = spec["provider"], spec.get("mode", "generate")
    if mode == "remix":
        die("remix is only supported by the 'reve' provider")
    endpoint = f"https://fal.run/{FAL_MODEL_IDS[provider]}"
    if mode == "edit":
        endpoint += "/edit"

    body = {"prompt": spec["prompt"]}
    if spec.get("num_images"):
        body["num_images"] = spec["num_images"]
    if spec.get("aspect_ratio"):
        body["aspect_ratio"] = spec["aspect_ratio"]
    if spec.get("output_format"):
        body["output_format"] = spec["output_format"]
    # Nano Banana exposes resolution + seed; MAI does not.
    if provider == "nano-banana":
        if spec.get("resolution"):
            body["resolution"] = spec["resolution"]
        if spec.get("seed") is not None:
            body["seed"] = spec["seed"]

    if mode == "edit":
        imgs = spec.get("images") or []
        if not imgs:
            die("edit mode requires at least one entry in 'images'")
        body["image_urls"] = [to_data_uri(i) for i in imgs]

    body.update(spec.get("params") or {})   # advanced passthrough (see references)
    return endpoint, body


# --- request builders: reve --------------------------------------------------

def build_reve(spec):
    mode = spec.get("mode", "generate")
    if mode not in REVE_MODE_PATH:
        die(f"unknown mode '{mode}' for reve")
    endpoint = f"https://api.reve.com/v1/image/{REVE_MODE_PATH[mode]}"

    body = {}
    if mode == "edit":
        body["edit_instruction"] = spec["prompt"]
        imgs = spec.get("images") or []
        if len(imgs) != 1:
            die("reve edit requires exactly one entry in 'images'")
        body["reference_image"] = to_raw_base64(imgs[0])
    elif mode == "remix":
        body["prompt"] = spec["prompt"]
        imgs = spec.get("images") or []
        if not (1 <= len(imgs) <= 6):
            die("reve remix requires 1-6 entries in 'images'")
        body["reference_images"] = [to_raw_base64(i) for i in imgs]
    else:  # generate -> create
        body["prompt"] = spec["prompt"]

    ar = spec.get("aspect_ratio")
    if ar in REVE_ASPECTS:               # silently drop "auto"/unsupported ratios
        body["aspect_ratio"] = ar
    if spec.get("num_images", 1) and spec.get("num_images", 1) > 1:
        sys.stderr.write("NOTE: Reve produces one image per call; 'num_images' is ignored.\n")

    body.update(spec.get("params") or {})  # version, test_time_scaling, postprocessing
    return endpoint, body


# --- request builders: gemini-native -----------------------------------------

def gemini_model(spec):
    return spec.get("model") or GEMINI_DEFAULT_MODEL


def _gemini_aspect(spec):
    """Return a supported aspect ratio, or None to let the model decide ('auto'/unsupported)."""
    ar = spec.get("aspect_ratio")
    return ar if ar in GEMINI_ASPECTS else None


def _gemini_size(spec, model):
    """Image-size token; only the 3.x models accept it. None if unset/unsupported."""
    if not str(model).startswith("gemini-3"):
        return None
    return GEMINI_SIZE_MAP.get(spec.get("resolution"))


def _gemini_search_tool(params, style):
    """Build the google_search grounding tool for web and/or image search, or None."""
    web = bool(params.get("enable_web_search"))
    image = bool(params.get("enable_image_search"))
    if not (web or image):
        return None
    if style == "interactions":
        tool = {"type": "google_search"}
        if image:                              # web-only stays {type:google_search} (default)
            tool["search_types"] = (["web_search"] if web else []) + ["image_search"]
        return [tool]
    # generate_content
    gs = {}
    if image:
        st = {}
        if web:
            st["webSearch"] = {}
        st["imageSearch"] = {}
        gs["searchTypes"] = st
    return [{"google_search": gs}]


def _gemini_input_items(spec):
    """Interactions 'input': a text block plus any edit images."""
    items = [{"type": "text", "text": spec["prompt"]}]
    if spec.get("mode", "generate") == "edit":
        imgs = spec.get("images") or []
        if not imgs:
            die("edit mode requires at least one entry in 'images'")
        for ref in imgs:
            mime, b64 = to_b64_and_mime(ref)
            items.append({"type": "image", "mime_type": mime, "data": b64})
    return items


def build_gemini_interactions(spec, model):
    """Primary path: Google's newest Interactions API."""
    if spec.get("mode", "generate") == "remix":
        die("remix is only supported by the 'reve' provider")
    params = spec.get("params") or {}

    body = {"model": model, "input": _gemini_input_items(spec)}

    # response_format: forces image output and carries aspect/size/mime when set.
    rf = {"type": "image"}
    ar = _gemini_aspect(spec)
    if ar:
        rf["aspect_ratio"] = ar
    size = _gemini_size(spec, model)
    if size:
        rf["image_size"] = size
    fmt = (spec.get("output_format") or "").lower()
    if fmt in GEMINI_MIME_FOR_FORMAT:
        rf["mime_type"] = GEMINI_MIME_FOR_FORMAT[fmt]
    body["response_format"] = rf

    tools = _gemini_search_tool(params, "interactions")
    if tools:
        body["tools"] = tools
    if params.get("thinking_level"):
        body["generation_config"] = {"thinking_level": str(params["thinking_level"]).lower()}

    extra = params.get("interactions")
    if isinstance(extra, dict):
        body.update(extra)                 # raw power-user passthrough
    return GEMINI_INTERACTIONS_URL, body


def build_gemini_generate(spec, model):
    """Fallback path: the stable generateContent API."""
    if spec.get("mode", "generate") == "remix":
        die("remix is only supported by the 'reve' provider")
    params = spec.get("params") or {}

    parts = [{"text": spec["prompt"]}]
    if spec.get("mode", "generate") == "edit":
        imgs = spec.get("images") or []
        if not imgs:
            die("edit mode requires at least one entry in 'images'")
        for ref in imgs:
            mime, b64 = to_b64_and_mime(ref)
            parts.append({"inline_data": {"mime_type": mime, "data": b64}})

    gen_cfg = {"responseModalities": ["TEXT", "IMAGE"]}
    image_cfg = {}
    ar = _gemini_aspect(spec)
    if ar:
        image_cfg["aspectRatio"] = ar
    size = _gemini_size(spec, model)
    if size:
        image_cfg["imageSize"] = size
    if image_cfg:
        gen_cfg["imageConfig"] = image_cfg
    if params.get("thinking_level"):
        gen_cfg["thinkingConfig"] = {"thinkingLevel": str(params["thinking_level"]).capitalize()}

    body = {"contents": [{"parts": parts}], "generationConfig": gen_cfg}
    tools = _gemini_search_tool(params, "generate_content")
    if tools:
        body["tools"] = tools

    extra = params.get("generate_content")
    if isinstance(extra, dict):
        # shallow-merge generationConfig so callers can extend without clobbering it
        if isinstance(extra.get("generationConfig"), dict):
            gen_cfg.update(extra.pop("generationConfig"))
        body.update(extra)
    return GEMINI_GENERATE_URL.format(model=model), body


# --- callers (return list of image byte blobs) -------------------------------

def call_fal(endpoint, body, key):
    headers = {"Authorization": f"Key {key}", "Content-Type": "application/json"}
    r = requests.post(endpoint, json=body, headers=headers, timeout=POST_TIMEOUT)
    if r.status_code != 200:
        die(f"fal returned {r.status_code}: {r.text[:500]}", code=2)
    data = r.json()
    images = data.get("images") or []
    if not images:
        die(f"fal returned no images: {json.dumps(data)[:500]}", code=2)
    blobs = []
    for img in images:
        url = img.get("url")
        if not url:
            continue
        if url.startswith("data:"):                       # sync_mode data URI
            blobs.append(base64.b64decode(url.split(",", 1)[1]))
        else:
            ir = requests.get(url, timeout=GET_TIMEOUT)
            ir.raise_for_status()
            blobs.append(ir.content)
    return blobs


def call_reve(endpoint, body, key):
    headers = {
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    r = requests.post(endpoint, json=body, headers=headers, timeout=POST_TIMEOUT)
    if r.status_code != 200:
        ecode = r.headers.get("X-Reve-Error-Code", "")
        die(f"reve returned {r.status_code} ({ecode}): {r.text[:500]}", code=2)
    data = r.json()
    if data.get("content_violation"):
        die("reve flagged a content-policy violation; no image produced.", code=2)
    b64 = data.get("image")
    if not b64:
        die(f"reve returned no image: {json.dumps(data)[:300]}", code=2)
    return [base64.b64decode(b64)]


def _parse_gemini_interactions(data):
    """Pull final image bytes out of an Interactions response (skip interim 'thought' images)."""
    blobs = []
    # Convenience property: the final image block, surfaced at top level.
    oi = data.get("output_image")
    if isinstance(oi, dict) and oi.get("data"):
        try:
            return [base64.b64decode(oi["data"])]
        except (ValueError, TypeError):
            pass
    for step in data.get("steps") or []:
        if step.get("type") == "thought":          # interim composition images — not the result
            continue
        content = step.get("content")
        if isinstance(content, list):
            for block in content:
                if block.get("type") == "image" and block.get("data"):
                    blobs.append(base64.b64decode(block["data"]))
    return blobs


def _parse_gemini_generate(data):
    """Pull image bytes out of a generateContent response (skip 'thought' parts)."""
    blobs = []
    for cand in data.get("candidates") or []:
        content = cand.get("content") or {}
        for part in content.get("parts") or []:
            if part.get("thought"):
                continue
            inline = part.get("inline_data") or part.get("inlineData")
            if inline and inline.get("data"):
                mime = inline.get("mime_type") or inline.get("mimeType") or ""
                if not mime or mime.startswith("image"):
                    blobs.append(base64.b64decode(inline["data"]))
    return blobs


def call_gemini(spec, model, key):
    """
    Native Google path. Try the Interactions API first; if it errors (or yields no
    image), automatically fall back to generateContent. Dies only if BOTH fail.
    """
    errors = []

    # 1) Interactions API (Google's newest, recommended path)
    try:
        url, body = build_gemini_interactions(spec, model)
        headers = {
            "x-goog-api-key": key,
            "Content-Type": "application/json",
            "Api-Revision": GEMINI_API_REVISION,
        }
        r = requests.post(url, json=body, headers=headers, timeout=POST_TIMEOUT)
        if r.status_code == 200:
            blobs = _parse_gemini_interactions(r.json())
            if blobs:
                return blobs
            errors.append("interactions: HTTP 200 but no image in response")
        else:
            errors.append(f"interactions: HTTP {r.status_code}: {r.text[:300]}")
    except requests.RequestException as e:
        errors.append(f"interactions: network error: {e}")
    except ValueError as e:
        errors.append(f"interactions: bad JSON: {e}")

    # 2) generateContent (stable fallback)
    sys.stderr.write("NOTE: Interactions API path failed; falling back to generateContent.\n")
    try:
        url, body = build_gemini_generate(spec, model)
        headers = {"x-goog-api-key": key, "Content-Type": "application/json"}
        r = requests.post(url, json=body, headers=headers, timeout=POST_TIMEOUT)
        if r.status_code == 200:
            blobs = _parse_gemini_generate(r.json())
            if blobs:
                return blobs
            errors.append("generateContent: HTTP 200 but no image in response")
        else:
            errors.append(f"generateContent: HTTP {r.status_code}: {r.text[:300]}")
    except requests.RequestException as e:
        errors.append(f"generateContent: network error: {e}")
    except ValueError as e:
        errors.append(f"generateContent: bad JSON: {e}")

    die("Gemini-native generation failed on both API paths:\n  - " + "\n  - ".join(errors), code=2)


# --- main --------------------------------------------------------------------

def main():
    ap = argparse.ArgumentParser(description="Unified image generation/editing (fal.ai, Gemini, Reve).")
    ap.add_argument("--spec", required=True, help="Path to the JSON request spec.")
    ap.add_argument("--out-dir", default=None, help="Output directory (default: ~/Downloads).")
    ap.add_argument("--env-file", default=None, help="KEY=value file to load before the key check.")
    ap.add_argument("--print-only", action="store_true", help="Print resolved request, don't call.")
    args = ap.parse_args()

    if args.env_file:
        load_env_file(args.env_file)

    spec_path = Path(args.spec)
    if not spec_path.is_file():
        die(f"--spec not found: {args.spec}")
    try:
        spec = json.loads(spec_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        die(f"--spec is not valid JSON: {e}")

    provider = spec.get("provider")
    if provider not in (FAL_PROVIDERS | {"reve"}):
        die("spec.provider must be one of: nano-banana, mai, reve")
    if not spec.get("prompt"):
        die("spec.prompt is required")

    backend = resolve_backend(spec)
    gemini = provider == "nano-banana" and backend == "gemini"
    model = gemini_model(spec) if gemini else None

    if gemini:
        endpoint, body = build_gemini_interactions(spec, model)
    elif provider == "reve":
        endpoint, body = build_reve(spec)
    else:
        endpoint, body = build_fal(spec)

    key_name = needed_key(provider, backend)

    if args.print_only:
        print(f"provider : {provider}")
        if provider == "nano-banana":
            print(f"backend  : {backend}" + (f"  (model: {model})" if gemini else ""))
        print(f"endpoint : {endpoint}")
        if gemini:
            print(f"fallback : {GEMINI_GENERATE_URL.format(model=model)}  (used automatically if interactions fails)")
        print(f"key var  : {key_name} ({'set' if os.environ.get(key_name) else 'NOT set'})")
        print("body     :")
        print(json.dumps(redact(body), indent=2))
        return

    key = os.environ.get(key_name)
    if not key:
        die(
            f"missing {key_name} for provider '{provider}'"
            + (f" (backend '{backend}')" if provider == "nano-banana" else "")
            + f". Set it in your environment, or pass --env-file <path> with a line {key_name}=...",
        )

    if gemini:
        if spec.get("num_images", 1) and spec.get("num_images", 1) > 1:
            sys.stderr.write("NOTE: Gemini-native produces one image per call; 'num_images' is ignored.\n")
        blobs = call_gemini(spec, model, key)
    else:
        try:
            blobs = (call_reve if provider == "reve" else call_fal)(endpoint, body, key)
        except requests.RequestException as e:
            die(f"network error calling {provider}: {e}", code=2)

    out_dir = args.out_dir or (Path.home() / "Downloads")
    # fal + Gemini-native honor output_format; Reve always returns png.
    honors_format = provider in FAL_PROVIDERS
    fmt = (spec.get("output_format") or "png").lower() if honors_format else "png"
    ext = EXT_FOR_FORMAT.get(fmt, "png")
    stem_base = f"{date.today().isoformat()}_{slugify(spec.get('prompt'))}"

    saved = []
    for i, blob in enumerate(blobs):
        stem = stem_base if len(blobs) == 1 else f"{stem_base}_{i + 1}"
        path = unique_path(out_dir, stem, ext)
        path.write_bytes(blob)
        saved.append(str(path))

    for p in saved:
        print(p)


if __name__ == "__main__":
    main()
