#!/usr/bin/env python3
"""
mistral_transcribe.py — transcribe audio with Mistral/Voxtral (POST /v1/audio/transcriptions).

Send a local audio file (uploaded as multipart/form-data), a public URL, or an
already-uploaded file id. Optionally detect the language, diarize speakers, request
word/segment timestamps, or stream partial text as it's produced.

Docs: https://docs.mistral.ai/api/endpoint/audio/transcriptions
Schema: ../references/audio-transcriptions.md
Default model: voxtral-mini-latest

Usage
-----
    python mistral_transcribe.py --file ./meeting.mp3
    python mistral_transcribe.py --file ./call.wav --language en --diarize --timestamps segment --json
    python mistral_transcribe.py --file-url https://example.com/clip.mp3 --stream

Exit codes: 0 ok · 2 missing API key · 1 other error.
"""
from __future__ import annotations

import argparse
import json
import mimetypes
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _client import http_multipart, http_sse, log, require_api_key  # noqa: E402

DEFAULT_MODEL = "voxtral-mini-latest"


def main(argv=None) -> int:
    p = argparse.ArgumentParser(description="Transcribe audio with Mistral/Voxtral.")
    src = p.add_mutually_exclusive_group(required=True)
    src.add_argument("--file", help="local audio file (mp3/wav/flac/ogg/m4a/...)")
    src.add_argument("--file-url", help="public URL to an audio file")
    src.add_argument("--file-id", help="id of a file already uploaded to /v1/files")
    p.add_argument("--model", default=DEFAULT_MODEL, help=f"model (default {DEFAULT_MODEL})")
    p.add_argument("--language", help="2-letter hint, e.g. 'en' (boosts accuracy)")
    p.add_argument("--temperature", type=float, help="sampling temperature")
    p.add_argument("--diarize", action="store_true", help="label speakers")
    p.add_argument("--timestamps", choices=("segment", "word"), action="append",
                   help="timestamp_granularities (repeatable)")
    p.add_argument("--stream", action="store_true", help="stream partial text (SSE)")
    p.add_argument("--out", help="write the transcript text to this file")
    p.add_argument("--json", action="store_true", help="print the full response JSON on stdout")
    p.add_argument("--quiet", action="store_true", help="suppress stderr progress logs")
    args = p.parse_args(argv)

    key = require_api_key()

    fields: dict = {"model": args.model}
    if args.language:
        fields["language"] = args.language
    if args.temperature is not None:
        fields["temperature"] = args.temperature
    if args.diarize:
        fields["diarize"] = "true"
    if args.timestamps:
        fields["timestamp_granularities[]"] = args.timestamps
    if args.file_url:
        fields["file_url"] = args.file_url
    if args.file_id:
        fields["file_id"] = args.file_id

    files = None
    if args.file:
        src_path = Path(args.file)
        if not src_path.is_file():
            print(f"ERROR: file not found: {args.file}", file=sys.stderr)
            return 1
        mime = mimetypes.guess_type(str(src_path))[0] or "application/octet-stream"
        files = {"file": (src_path.name, src_path.read_bytes(), mime)}

    if args.stream:
        fields["stream"] = "true"
        log("[transcribe] streaming /v1/audio/transcriptions ...", args.quiet)
        text_parts: list[str] = []
        for chunk in http_sse("/v1/audio/transcriptions", key, fields=fields, files=files):
            try:
                evt = json.loads(chunk)
            except json.JSONDecodeError:
                continue
            # Streaming text deltas appear as text/delta fields depending on event type.
            delta = evt.get("text") or evt.get("delta") or ""
            if delta:
                text_parts.append(delta)
                if not args.json:
                    print(delta, end="", flush=True)
        text = "".join(text_parts)
        if not args.json:
            print()
        if args.out:
            Path(args.out).write_text(text, encoding="utf-8")
        if args.json:
            print(json.dumps({"model": args.model, "text": text, "streamed": True}))
        return 0

    log(f"[transcribe] POST /v1/audio/transcriptions model={args.model}", args.quiet)
    result = http_multipart("/v1/audio/transcriptions", key, fields=fields, files=files)
    text = result.get("text", "")
    if args.out:
        Path(args.out).write_text(text, encoding="utf-8")
        log(f"[transcribe] wrote transcript -> {args.out}", args.quiet)
    print(json.dumps(result) if args.json else text)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
