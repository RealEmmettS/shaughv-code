#!/usr/bin/env python3
"""
mistral_ocr.py — run Mistral OCR (POST /v1/ocr) on a PDF, document, or image.

Mistral OCR turns a document into per-page Markdown (with optional extracted images,
tables, and confidence scores). Give it a public URL, an image URL, an already-uploaded
file id, OR a local file (which this script uploads to /v1/files with purpose=ocr first).

Docs: https://docs.mistral.ai/api/endpoint/ocr   ·   Schema: ../references/ocr.md
Default model: mistral-ocr-latest

Usage
-----
    python mistral_ocr.py --document-url https://arxiv.org/pdf/2201.04234
    python mistral_ocr.py --file ./contract.pdf --pages 0-3 --out contract.md
    python mistral_ocr.py --image-url https://example.com/receipt.png --include-images --json

Exit codes: 0 ok · 2 missing API key · 1 other error.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _client import delete_file, http_json, log, require_api_key, upload_file  # noqa: E402

DEFAULT_MODEL = "mistral-ocr-latest"


def build_document(args, key) -> tuple[dict, str | None]:
    """
    Resolve the OCR `document` chunk from whichever input flag was given.
    Returns (document, uploaded_file_id) where uploaded_file_id is set ONLY when we
    uploaded a local file ourselves — so the caller can delete it afterward and not
    pay to store a one-shot upload. A user-supplied --file-id is never auto-deleted.
    """
    if args.document_url:
        return {"type": "document_url", "document_url": args.document_url}, None
    if args.image_url:
        return {"type": "image_url", "image_url": args.image_url}, None
    if args.file_id:
        return {"type": "file", "file_id": args.file_id}, None
    if args.file:
        src = Path(args.file)
        if not src.is_file():
            print(f"ERROR: file not found: {args.file}", file=sys.stderr)
            raise SystemExit(1)
        log(f"[ocr] uploading {src.name} to /v1/files (purpose=ocr)...", args.quiet)
        fid = upload_file(src, key, purpose="ocr")
        log(f"[ocr] uploaded -> file_id {fid}", args.quiet)
        return {"type": "file", "file_id": fid}, fid
    print("ERROR: provide one of --document-url / --image-url / --file-id / --file",
          file=sys.stderr)
    raise SystemExit(1)


def parse_pages(spec: str):
    """'0,2-4' -> [0,2,3,4]; the API also accepts the raw string, but we normalize to a list."""
    out: list[int] = []
    for part in spec.split(","):
        part = part.strip()
        if "-" in part:
            a, b = part.split("-", 1)
            out.extend(range(int(a), int(b) + 1))
        elif part:
            out.append(int(part))
    return out


def main(argv=None) -> int:
    p = argparse.ArgumentParser(description="Run Mistral OCR on a document/image.")
    src = p.add_mutually_exclusive_group(required=True)
    src.add_argument("--document-url", help="public URL to a PDF/document")
    src.add_argument("--image-url", help="public URL to an image")
    src.add_argument("--file-id", help="id of a file already uploaded to /v1/files")
    src.add_argument("--file", help="local PDF/image (uploaded automatically)")
    p.add_argument("--model", default=DEFAULT_MODEL, help=f"OCR model (default {DEFAULT_MODEL})")
    p.add_argument("--pages", help="pages to process, e.g. '0-3' or '0,2,5' (0-indexed)")
    p.add_argument("--include-images", action="store_true",
                   help="return extracted images as base64 (include_image_base64)")
    p.add_argument("--table-format", choices=("markdown", "html"), help="table output format")
    p.add_argument("--confidence", choices=("word", "page"),
                   help="confidence_scores_granularity")
    p.add_argument("--out", help="write the concatenated page Markdown to this file")
    p.add_argument("--keep-upload", action="store_true",
                   help="keep a file we uploaded for --file (default: delete it after OCR)")
    p.add_argument("--json", action="store_true", help="print the full OCR JSON on stdout")
    p.add_argument("--quiet", action="store_true", help="suppress stderr progress logs")
    args = p.parse_args(argv)

    key = require_api_key()
    document, uploaded_id = build_document(args, key)

    payload: dict = {"model": args.model, "document": document}
    if args.pages:
        payload["pages"] = parse_pages(args.pages)
    if args.include_images:
        payload["include_image_base64"] = True
    if args.table_format:
        payload["table_format"] = args.table_format
    if args.confidence:
        payload["confidence_scores_granularity"] = args.confidence

    log(f"[ocr] POST /v1/ocr model={args.model}", args.quiet)
    try:
        result = http_json("/v1/ocr", key, method="POST", payload=payload)
    finally:
        # We have the result (or it failed) — drop any file WE uploaded so a one-shot
        # OCR doesn't leave a stored file accruing cost. User-supplied ids are untouched.
        if uploaded_id and not args.keep_upload:
            ok = delete_file(uploaded_id, key)
            log(f"[ocr] deleted uploaded file {uploaded_id}" if ok
                else f"[ocr] WARNING: could not delete uploaded file {uploaded_id}", args.quiet)

    pages = result.get("pages") or []
    markdown = "\n\n".join(pg.get("markdown", "") for pg in pages)
    if args.out:
        Path(args.out).write_text(markdown, encoding="utf-8")
        log(f"[ocr] wrote Markdown -> {args.out}", args.quiet)

    if args.json:
        print(json.dumps(result))
    else:
        usage = result.get("usage_info") or {}
        log(f"[ocr] {usage.get('pages_processed', len(pages))} page(s) processed", args.quiet)
        print(markdown)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
