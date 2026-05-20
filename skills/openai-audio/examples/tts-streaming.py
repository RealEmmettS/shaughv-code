"""Streaming text-to-speech with gpt-4o-mini-tts.

Generates spoken audio from a text input and writes it to a file. Uses the
streaming response so the file is written as audio arrives — useful for low
end-to-end latency on long inputs.

REQUIREMENTS
------------
Env vars:
    OPENAI_API_KEY      Your OpenAI API key (must have audio access).
Python:
    openai >= 1.0

INSTALL
-------
    pip install openai

RUN
---
    # Default text + output path:
    python tts-streaming.py

    # Custom text and path:
    python tts-streaming.py "Hello from the OpenAI audio skill." out.wav

EXPECTED OUTPUT
---------------
    - Writes the generated audio to ``out.wav`` (typically 100-300 KB for a
      short sentence at 24 kHz WAV).
    - Prints ``Wrote out.wav (NNNN bytes)``.

Pairs with: references/05-text-to-speech.md
Live-tested: yes (see examples/README.md).
"""

import sys
from pathlib import Path

from openai import OpenAI

# CLI: text is arg 1, output path is arg 2 (defaults shown).
text = sys.argv[1] if len(sys.argv) > 1 else "Hello from the OpenAI audio skill."
out_path = Path(sys.argv[2] if len(sys.argv) > 2 else "out.wav")

client = OpenAI()

# Stream the synthesis into the file. `wav` (or `pcm`) is the fastest format
# for live playback because decoding adds no overhead.
with client.audio.speech.with_streaming_response.create(
    model="gpt-4o-mini-tts",
    voice="marin",
    input=text,
    instructions="Read the text in a friendly, clear voice. Slight smile.",
    response_format="wav",
) as response:
    response.stream_to_file(out_path)

print(f"Wrote {out_path} ({out_path.stat().st_size} bytes)")
