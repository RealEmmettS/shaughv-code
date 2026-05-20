"""Live translation with gpt-realtime-translate.

Opens a translation session on the dedicated `/v1/realtime/translations`
endpoint, streams audio from a file, and prints the source-language and
target-language transcripts as they arrive. The translated audio bytes are
also written to ``translated.pcm`` (24 kHz mono PCM16, headerless).

REQUIREMENTS
------------
Env vars:
    OPENAI_API_KEY     Your OpenAI API key with Realtime access.
Python: >= 3.9
Packages: websocket-client, soundfile, numpy
Input file: WAV (auto-resampled to 24 kHz). Test fixtures:
    - examples/audio_samples/sample-en.wav  (English source)
    - examples/audio_samples/sample-es.wav  (Spanish source)

INSTALL
-------
    pip install websocket-client soundfile numpy

RUN
---
    # Translate English source → Spanish output
    python translation-session.py audio_samples/sample-en.wav es

    # Translate Spanish source → English output
    python translation-session.py audio_samples/sample-es.wav en

EXPECTED OUTPUT
---------------
    - Source-language transcript dimmed on stderr.
    - Target-language transcript streamed to stdout.
    - Translated audio bytes (24 kHz mono PCM16, headerless) written to
      ``translated.pcm``. Play with:
          ffplay -f s16le -ar 24000 -ac 1 translated.pcm
      Or open in Audacity with "File > Import > Raw Data".

Pairs with: references/04-translation.md
Live-tested: yes (see examples/README.md).
"""

from __future__ import annotations

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
URL = "wss://api.openai.com/v1/realtime/translations?model=gpt-realtime-translate"

if len(sys.argv) < 3:
    print("Usage: python translation-session.py <wav-file> <target-lang>", file=sys.stderr)
    sys.exit(2)

src_file = Path(sys.argv[1])
target_language = sys.argv[2]
out_pcm = Path("translated.pcm")


def to_pcm16_base64(samples: np.ndarray) -> str:
    clipped = np.clip(samples, -1.0, 1.0)
    pcm = (clipped * 32767).astype("<i2").tobytes()
    return base64.b64encode(pcm).decode("ascii")


def resample_to_24k(samples: np.ndarray, src_rate: int) -> np.ndarray:
    if src_rate == 24000:
        return samples
    n = int(round(len(samples) * 24000 / src_rate))
    x_old = np.linspace(0.0, 1.0, num=len(samples), endpoint=False)
    x_new = np.linspace(0.0, 1.0, num=n, endpoint=False)
    return np.interp(x_new, x_old, samples).astype(np.float32)


def main() -> int:
    data, rate = sf.read(src_file, dtype="float32")
    if data.ndim > 1:
        data = data.mean(axis=1).astype(np.float32)
    data = resample_to_24k(data, rate)

    ws = websocket.create_connection(
        URL,
        header=[
            f"Authorization: Bearer {API_KEY}",
            "OpenAI-Safety-Identifier: openai-audio-skill-tests",
        ],
    )

    ws.send(
        json.dumps(
            {
                "type": "session.update",
                "session": {
                    "audio": {"output": {"language": target_language}},
                },
            }
        )
    )

    chunk_ms = 100
    chunk_size = max(1, int(24000 * chunk_ms / 1000))
    for start in range(0, len(data), chunk_size):
        chunk = data[start : start + chunk_size]
        ws.send(
            json.dumps(
                {
                    "type": "session.input_audio_buffer.append",
                    "audio": to_pcm16_base64(chunk),
                }
            )
        )
        time.sleep(chunk_ms / 1000)

    # Graceful shutdown: tell the server we're done, then drain events until
    # we see session.closed.
    ws.send(json.dumps({"type": "session.close"}))

    with out_pcm.open("wb") as audio_out:
        deadline = time.time() + 60
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
                if etype == "session.input_transcript.delta":
                    sys.stderr.write(f"\033[2m{event['delta']}\033[0m")  # dim
                    sys.stderr.flush()
                elif etype == "session.output_transcript.delta":
                    sys.stdout.write(event["delta"])
                    sys.stdout.flush()
                elif etype == "session.output_audio.delta":
                    audio_out.write(base64.b64decode(event["delta"]))
                elif etype == "session.closed":
                    break
                elif etype == "error":
                    print("\n[error]", event, file=sys.stderr)
                    return 1
        finally:
            ws.close()

    print(f"\n\nWrote translated audio to {out_pcm} ({out_pcm.stat().st_size} bytes)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
