"""Server-side voice agent using gpt-realtime-2 over WebSocket.

Streams a WAV file as user audio input, runs a function tool when the model
asks for it, and writes the model's audio response to ``response.pcm`` (24 kHz
PCM16). Useful for CI / smoke-testing voice flows without a browser.

REQUIREMENTS
------------
Env vars:
    OPENAI_API_KEY     Your OpenAI API key with Realtime access.
Python: >= 3.9
Packages: websocket-client, soundfile, numpy
Input file: WAV (auto-resampled to 24 kHz). Test fixture at
    ``examples/audio_samples/sample-en.wav`` contains "Hello. My order number
    is one two three four five. Can you tell me the shipping status?" — this
    should trigger the ``lookup_order`` function tool.

INSTALL
-------
    pip install websocket-client soundfile numpy

RUN
---
    python websocket-voice-agent.py audio_samples/sample-en.wav

EXPECTED OUTPUT
---------------
    - Live transcript of the model's spoken reply.
    - ``response.pcm`` on disk (24 kHz mono PCM16, headerless).
    - A printed ``--- usage ---`` block with ``response.done.usage`` after
      the response completes.
    - If the audio asks about an order, the model should call
      ``lookup_order``; the script returns a mock result and asks for a
      follow-up response.

Pairs with: references/02-voice-agents.md, references/07-transport-websocket.md
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
URL = "wss://api.openai.com/v1/realtime?model=gpt-realtime-2"

src_file = Path(sys.argv[1] if len(sys.argv) > 1 else "audio_samples/sample-en.wav")
out_pcm = Path("response.pcm")


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


TOOLS = [
    {
        "type": "function",
        "name": "lookup_order",
        "description": "Look up an order by its order number.",
        "parameters": {
            "type": "object",
            "properties": {
                "order_number": {
                    "type": "string",
                    "description": "The customer-facing order number.",
                }
            },
            "required": ["order_number"],
        },
    }
]


def run_tool(name: str, args: dict) -> str:
    """Mock tool implementation."""
    if name == "lookup_order":
        return json.dumps(
            {
                "order_number": args.get("order_number"),
                "status": "shipped",
                "delivery_date": "2026-05-21",
            }
        )
    return json.dumps({"error": f"unknown tool {name}"})


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

    # Configure the session.
    ws.send(
        json.dumps(
            {
                "type": "session.update",
                "session": {
                    "type": "realtime",
                    "model": "gpt-realtime-2",
                    "output_modalities": ["audio"],
                    "audio": {
                        "input": {
                            "format": {"type": "audio/pcm", "rate": 24000},
                            # Disable VAD for deterministic test behavior: we
                            # stream the entire file, then manually commit +
                            # create the response. For production with a live
                            # mic, use {"type": "server_vad"} instead.
                            "turn_detection": None,
                        },
                        "output": {
                            # The API currently requires a sample rate on the
                            # output format even though the doc examples often
                            # show only `type`.
                            "format": {"type": "audio/pcm", "rate": 24000},
                            "voice": "marin",
                        },
                    },
                    "instructions": (
                        "You are a concise customer service voice agent. "
                        "If the user asks about an order, call lookup_order. "
                        "Confirm the order number digit by digit before calling tools."
                    ),
                    "tools": TOOLS,
                    "tool_choice": "auto",
                },
            }
        )
    )

    # Stream the WAV file as user audio.
    chunk_ms = 100
    chunk_size = max(1, int(24000 * chunk_ms / 1000))
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
        time.sleep(chunk_ms / 1000)

    # Tell the server we're done speaking. With server VAD enabled this is
    # usually unnecessary but it's a clean way to force end-of-turn for
    # automated tests.
    ws.send(json.dumps({"type": "input_audio_buffer.commit"}))
    ws.send(json.dumps({"type": "response.create"}))

    response_audio = bytearray()
    transcript = ""
    deadline = time.time() + 60

    try:
        while time.time() < deadline:
            ws.settimeout(10.0)
            try:
                raw = ws.recv()
            except websocket.WebSocketTimeoutException:
                continue
            if not raw:
                continue
            event = json.loads(raw)
            etype = event.get("type", "")

            if etype == "response.output_audio.delta":
                response_audio.extend(base64.b64decode(event["delta"]))
            elif etype == "response.output_audio_transcript.delta":
                sys.stdout.write(event["delta"])
                sys.stdout.flush()
            elif etype == "response.output_audio_transcript.done":
                transcript = event.get("transcript", transcript)
            elif (
                etype == "response.output_item.done"
                and event.get("item", {}).get("type") == "function_call"
            ):
                item = event["item"]
                tool_result = run_tool(item["name"], json.loads(item["arguments"]))
                ws.send(
                    json.dumps(
                        {
                            "type": "conversation.item.create",
                            "item": {
                                "type": "function_call_output",
                                "call_id": item["call_id"],
                                "output": tool_result,
                            },
                        }
                    )
                )
                ws.send(json.dumps({"type": "response.create"}))
            elif etype == "response.done":
                # response.done indicates the response is complete. Print
                # usage and break.
                usage = event.get("response", {}).get("usage", {})
                print("\n--- usage ---")
                print(json.dumps(usage, indent=2))
                break
            elif etype == "error":
                print("\n[error]", event, file=sys.stderr)
                return 1
    finally:
        ws.close()

    out_pcm.write_bytes(bytes(response_audio))
    print(f"\nWrote response audio: {out_pcm} ({len(response_audio)} bytes)")
    if transcript:
        print(f"Transcript: {transcript}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
