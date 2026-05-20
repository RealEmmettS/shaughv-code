"""File transcription with gpt-4o-transcribe (and optional diarization).

Use this when you have a recorded audio file and want a one-shot transcript
(not streaming deltas). For live streaming, use ``transcription-session.py``
instead.

REQUIREMENTS
------------
Env vars:
    OPENAI_API_KEY     Your OpenAI API key with audio access.
Python: >= 3.9
Packages: openai
Input file: any of mp3, mp4, mpeg, mpga, m4a, wav, webm (<= 25 MB).
    A test fixture ships at ``examples/audio_samples/sample-en.wav``.

INSTALL
-------
    pip install openai

RUN
---
    # Basic transcription
    python transcription-file-fallback.py audio_samples/sample-en.wav

    # Diarized (speaker labels) — requires audio > 30 s typically
    python transcription-file-fallback.py audio_samples/longer.wav --diarize

    # Cheaper transcription
    python transcription-file-fallback.py audio_samples/sample-en.wav \\
        --model gpt-4o-mini-transcribe

    # With a vocabulary prompt (not for the diarize model)
    python transcription-file-fallback.py audio_samples/sample-en.wav \\
        --prompt "Common terms: NorthLoop, kubectl, A1C."

EXPECTED OUTPUT
---------------
    Prints the transcript text (or a speaker-labeled list with --diarize).

Pairs with: references/03-transcription.md
Live-tested: yes (see examples/README.md).
"""

import argparse
from pathlib import Path

from openai import OpenAI

parser = argparse.ArgumentParser()
parser.add_argument("file", type=Path, help="Audio file to transcribe.")
parser.add_argument(
    "--model",
    default="gpt-4o-transcribe",
    help="Transcription model id.",
)
parser.add_argument(
    "--diarize",
    action="store_true",
    help="Use gpt-4o-transcribe-diarize for speaker labels.",
)
parser.add_argument(
    "--language",
    default=None,
    help="ISO 639-1 language hint, e.g. 'en'. Optional.",
)
parser.add_argument(
    "--prompt",
    default=None,
    help=(
        "Optional vocabulary prompt (≤224 tokens) for `gpt-4o-transcribe` "
        "and `gpt-4o-mini-transcribe`. Not supported on the diarize model."
    ),
)
args = parser.parse_args()

client = OpenAI()

if args.diarize:
    # Speaker labels. `chunking_strategy='auto'` is required for audio > 30s.
    request = dict(
        model="gpt-4o-transcribe-diarize",
        file=args.file.open("rb"),
        response_format="diarized_json",
        chunking_strategy="auto",
    )
    if args.language:
        request["language"] = args.language

    transcript = client.audio.transcriptions.create(**request)

    print(f"# Diarized transcript of {args.file.name}\n")
    for seg in transcript.segments:
        print(f"[{seg.start:6.2f}–{seg.end:6.2f}] {seg.speaker}: {seg.text}")
else:
    request = dict(
        model=args.model,
        file=args.file.open("rb"),
        response_format="text",
    )
    if args.language:
        request["language"] = args.language
    if args.prompt:
        request["prompt"] = args.prompt

    transcript = client.audio.transcriptions.create(**request)
    print(transcript)
