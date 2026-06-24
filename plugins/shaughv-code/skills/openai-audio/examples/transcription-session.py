"""Streaming transcription with gpt-realtime-whisper.

Opens a transcription session over WebSocket, streams a WAV file into it,
and prints transcript deltas and the final transcript as they arrive.

REQUIREMENTS
------------
Env vars:
    OPENAI_API_KEY     Your OpenAI API key with Realtime access.
Python: >= 3.9
Packages: websocket-client, soundfile, numpy
Input file: any soundfile-readable audio (WAV preferred). Test fixture at
    ``examples/audio_samples/sample-en.wav``.
System: ``soundfile`` requires libsndfile installed at the OS level. On
    Windows the wheel bundles it; on macOS use ``brew install libsndfile``;
    on Debian/Ubuntu use ``apt-get install libsndfile1``.

INSTALL
-------
    pip install websocket-client soundfile numpy

RUN
---
    python transcription-session.py audio_samples/sample-en.wav

    # Override language hint (default: en):
    python transcription-session.py audio_samples/sample-es.wav --language es

EXPECTED OUTPUT
---------------
    - Streaming transcript deltas printed as they arrive.
    - A final transcript echoed after ``--- Final ---``.
    - Exits 0 once a completed transcript is received.

Pairs with: references/03-transcription.md
Live-tested: yes (see examples/README.md).
"""

from __future__ import annotations

import argparse
import base64
import json
import os
import sys
import time
from pathlib import Path

import numpy as np
import soundfile as sf
import websocket

API_KEY = os.environ["OPENAI_API_KEY"]
# For transcription sessions, use `?intent=transcription` (NOT `?model=...`).
# The transcription model is configured under
# `session.audio.input.transcription.model` instead.
URL = "wss://api.openai.com/v1/realtime?intent=transcription"

parser = argparse.ArgumentParser()
parser.add_argument("file", type=Path)
parser.add_argument("--language", default="en")
parser.add_argument("--chunk-ms", type=int, default=100)
args = parser.parse_args()


def to_pcm16_base64(samples: np.ndarray) -> str:
    """Convert float32 samples in [-1.0, 1.0] to base64-encoded PCM16."""
    clipped = np.clip(samples, -1.0, 1.0)
    pcm = (clipped * 32767).astype("<i2").tobytes()
    return base64.b64encode(pcm).decode("ascii")


def resample_to_24k(samples: np.ndarray, src_rate: int) -> np.ndarray:
    if src_rate == 24000:
        return samples
    # Simple linear resample. For production use a proper resampler (scipy,
    # librosa). This is enough for testing on small clips.
    n = int(round(len(samples) * 24000 / src_rate))
    x_old = np.linspace(0.0, 1.0, num=len(samples), endpoint=False)
    x_new = np.linspace(0.0, 1.0, num=n, endpoint=False)
    return np.interp(x_new, x_old, samples).astype(np.float32)


def main() -> int:
    data, rate = sf.read(args.file, dtype="float32")
    if data.ndim > 1:
        data = data.mean(axis=1).astype(np.float32)  # mono
    data = resample_to_24k(data, rate)

    chunk_size = max(1, int(24000 * args.chunk_ms / 1000))

    ws = websocket.create_connection(
        URL,
        header=[
            f"Authorization: Bearer {API_KEY}",
            "OpenAI-Safety-Identifier: openai-audio-skill-tests",
        ],
    )

    # Note: gpt-realtime-whisper does NOT support `turn_detection`. We commit
    # manually after streaming the whole file. For models that do support VAD
    # (e.g., gpt-4o-transcribe), add an `audio.input.turn_detection` block.
    ws.send(
        json.dumps(
            {
                "type": "session.update",
                "session": {
                    "type": "transcription",
                    "audio": {
                        "input": {
                            "format": {"type": "audio/pcm", "rate": 24000},
                            "transcription": {
                                "model": "gpt-realtime-whisper",
                                "language": args.language,
                            },
                        }
                    },
                },
            }
        )
    )

    # Send audio in real-ish time so server VAD has a chance to segment.
    for start in range(0, len(data), chunk_size):
        chunk = data[start : start + chunk_size]
        ws.send(
            json.dumps(
                {
                    "type": "input_audio_buffer.append",
                    "audio": to_pcm16_base64(chunk),
                }
            )
        )
        time.sleep(args.chunk_ms / 1000)

    # Tell the server we're done. With server VAD enabled it usually commits on
    # its own, but this is harmless and ensures the last partial segment is
    # finalized.
    ws.send(json.dumps({"type": "input_audio_buffer.commit"}))

    final_transcripts: list[str] = []
    deadline = time.time() + 30  # generous bound for short clips
    try:
        while time.time() < deadline:
            ws.settimeout(5.0)
            try:
                raw = ws.recv()
            except websocket.WebSocketTimeoutException:
                continue
            if not raw:
                continue
            event = json.loads(raw)
            etype = event.get("type", "")
            if etype == "conversation.item.input_audio_transcription.delta":
                sys.stdout.write(event["delta"])
                sys.stdout.flush()
            elif etype == "conversation.item.input_audio_transcription.completed":
                final_transcripts.append(event["transcript"])
                sys.stdout.write("\n")
                sys.stdout.flush()
                # If VAD has produced at least one final segment and the buffer
                # is empty, we can exit. For longer files, remove this.
                break
            elif etype == "error":
                print("\n[error]", event, file=sys.stderr)
                return 1
    finally:
        ws.close()

    if final_transcripts:
        print("\n--- Final ---")
        print(" ".join(final_transcripts))
        return 0
    print("\nNo final transcript received.", file=sys.stderr)
    return 1


if __name__ == "__main__":
    sys.exit(main())
