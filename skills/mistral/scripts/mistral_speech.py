#!/usr/bin/env python3
"""
mistral_speech.py — text-to-speech with Mistral (POST /v1/audio/speech).

Synthesize spoken audio from text and write it to a file. Pick a voice (see the
voices endpoints / ../references/audio-speech.md) and an output format (mp3 default;
also wav/pcm/aac/flac/opus). The endpoint may return either base64 JSON or raw audio
bytes — this script handles both transparently.

Docs: https://docs.mistral.ai/api/endpoint/audio/speech
List voices: GET /v1/audio/voices

Usage
-----
    python mistral_speech.py --input "Hello from Mistral." --out hello.mp3
    python mistral_speech.py --input "Bonjour" --voice <voice_id> --format wav --out bonjour.wav
    echo "long text..." | python mistral_speech.py --stdin --out narration.mp3

Exit codes: 0 ok · 2 missing API key · 1 other error.
"""
from __future__ import annotations

import argparse
import base64
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _client import http_raw, log, require_api_key  # noqa: E402

EXT_FOR = {"mp3": "mp3", "wav": "wav", "pcm": "pcm", "aac": "aac", "flac": "flac", "opus": "opus"}


def main(argv=None) -> int:
    p = argparse.ArgumentParser(description="Generate speech (TTS) with Mistral.")
    g = p.add_mutually_exclusive_group(required=True)
    g.add_argument("--input", help="text to speak")
    g.add_argument("--stdin", action="store_true", help="read the text to speak from stdin")
    p.add_argument("--model", help="TTS model id (optional; server picks a default)")
    p.add_argument("--voice", dest="voice_id", help="voice_id (see GET /v1/audio/voices)")
    p.add_argument("--format", default="mp3", choices=tuple(EXT_FOR),
                   help="response_format (default mp3)")
    p.add_argument("--out", help="output audio path (default speech.<format>)")
    p.add_argument("--json", action="store_true", help="print a JSON summary on stdout")
    p.add_argument("--quiet", action="store_true", help="suppress stderr progress logs")
    args = p.parse_args(argv)

    text = sys.stdin.read() if args.stdin else args.input
    if not text or not text.strip():
        print("ERROR: empty input text", file=sys.stderr)
        return 1

    key = require_api_key()
    payload: dict = {"input": text, "response_format": args.format}
    if args.model:
        payload["model"] = args.model
    if args.voice_id:
        payload["voice_id"] = args.voice_id

    out_path = Path(args.out) if args.out else Path(f"speech.{EXT_FOR[args.format]}")
    log(f"[speech] POST /v1/audio/speech format={args.format}", args.quiet)
    raw, content_type = http_raw("/v1/audio/speech", key, payload=payload)

    # The endpoint returns either {"audio_data": "<base64>"} JSON or raw audio bytes.
    audio: bytes
    if "application/json" in content_type or raw[:1] in (b"{", b"["):
        try:
            obj = json.loads(raw.decode("utf-8"))
            b64 = obj.get("audio_data") or obj.get("audio") or ""
            audio = base64.b64decode(b64) if b64 else b""
        except (json.JSONDecodeError, ValueError):
            audio = raw
    else:
        audio = raw
    if not audio:
        print(f"ERROR: no audio in response (content-type {content_type!r})", file=sys.stderr)
        return 1

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_bytes(audio)
    summary = {"output_path": str(out_path.resolve()), "bytes": len(audio),
               "format": args.format, "voice_id": args.voice_id, "model": args.model}
    if args.json:
        print(json.dumps(summary))
    else:
        print(f"Wrote {len(audio)} bytes -> {out_path}")
        log("[speech] done", args.quiet)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
