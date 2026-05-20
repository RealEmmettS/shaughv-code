# 05 — Text-to-speech

**Model:** `gpt-4o-mini-tts` — switch to `tts-1` for lowest latency on legacy stacks, or `tts-1-hd` when slightly higher voice quality matters and you don't need prompt-controlled steering.

**Endpoint:** `/v1/audio/speech`.

`gpt-4o-mini-tts` is OpenAI's current TTS recommendation. It's prompt-steerable — you can control accent, emotional range, intonation, impressions, speed, tone, and whispering through the `instructions` field.

## Basic synthesis

```python
from pathlib import Path
from openai import OpenAI

client = OpenAI()
out_path = Path("speech.mp3")

with client.audio.speech.with_streaming_response.create(
    model="gpt-4o-mini-tts",
    voice="marin",
    input="Today is a wonderful day to build something people love!",
    instructions="Speak in a cheerful and positive tone.",
) as response:
    response.stream_to_file(out_path)
```

```javascript
import fs from "node:fs";
import OpenAI from "openai";

const client = new OpenAI();

const mp3 = await client.audio.speech.create({
  model: "gpt-4o-mini-tts",
  voice: "marin",
  input: "Today is a wonderful day to build something people love!",
  instructions: "Speak in a cheerful and positive tone.",
});

fs.writeFileSync("speech.mp3", Buffer.from(await mp3.arrayBuffer()));
```

| Field | Notes |
|---|---|
| `model` | `gpt-4o-mini-tts`, `tts-1`, or `tts-1-hd`. |
| `voice` | See voice catalog below. |
| `input` | Plain text to synthesize. UTF-8. |
| `instructions` | Steering prompt (`gpt-4o-mini-tts` only). Used to control accent, tone, emotion, pacing. Ignored by `tts-1`/`tts-1-hd`. |
| `response_format` | `mp3` (default), `opus`, `aac`, `flac`, `wav`, `pcm`. |
| `language` | Optional language hint (ISO 639-1). |
| `speed` | Playback rate multiplier. Doesn't change composition — prompt the model in `instructions` if you want it to actually speak faster. |

## Voice catalog

Built-in voices for `gpt-4o-mini-tts`:

| Voice | Notes |
|---|---|
| `alloy` | Neutral, general-purpose. |
| `ash` | Neutral, slightly deeper. |
| `ballad` | Calm, narrative. |
| `coral` | Warm, friendly. |
| `echo` | Neutral, broadcast-style. |
| `fable` | Storyteller, expressive. |
| `nova` | Bright, energetic. |
| `onyx` | Deep, authoritative. |
| `sage` | Steady, reassuring. |
| `shimmer` | Soft, sympathetic. |
| `verse` | Warm, lyrical. |
| `marin` | **Recommended best quality.** |
| `cedar` | **Recommended best quality.** |

`tts-1` and `tts-1-hd` support a smaller subset: `alloy`, `ash`, `coral`, `echo`, `fable`, `onyx`, `nova`, `sage`, `shimmer`.

Voices are optimized for English but render any [Whisper-supported language](https://github.com/openai/whisper#available-models-and-languages) when given input text in that language.

The Realtime API uses the same voice set with one difference: `nova`, `fable`, and `onyx` are not in the realtime voice list at the time of writing. Use `marin`/`cedar` for highest quality on Realtime too.

**OpenAI's usage policies require a clear disclosure to end users that TTS voices are AI-generated, not human.**

## Output formats

| Format | When to pick it |
|---|---|
| `mp3` | Default. Good general-purpose, browser-friendly. |
| `opus` | Internet streaming, low latency, smaller files. |
| `aac` | YouTube, Android, iOS. |
| `flac` | Lossless archive. |
| `wav` | Lowest decode latency. Recommended for live streaming when the consumer plays raw PCM with no container overhead. |
| `pcm` | Like `wav` without the header. 24 kHz, 16-bit signed, little-endian. Use for direct PCM playback. |

## Streaming

The `/v1/audio/speech` endpoint supports chunk-transfer streaming. The audio begins playing before the full file is generated.

```python
import asyncio
from openai import AsyncOpenAI
from openai.helpers import LocalAudioPlayer

client = AsyncOpenAI()

async def main():
    async with client.audio.speech.with_streaming_response.create(
        model="gpt-4o-mini-tts",
        voice="marin",
        input="Streaming audio in real time.",
        instructions="Read this clearly and slowly.",
        response_format="pcm",
    ) as response:
        await LocalAudioPlayer().play(response)

asyncio.run(main())
```

For the lowest end-to-end latency, use `wav` or `pcm` so the consumer doesn't pay decoding overhead.

## Instructions cheat-sheet

`instructions` accepts free-text prompts. Examples that work well:

- `"Speak in a calm, instructional tone with deliberate pacing."`
- `"Read with mild surprise as if discovering the result for the first time."`
- `"Speak quickly but enunciate clearly — like a sportscaster mid-action."`
- `"Whisper the sentence as if telling a secret."`
- `"Use a confident, friendly customer-service tone. Slight smile."`

Be specific. Vague instructions ("sound nice") get vague results. Combine an emotional cue ("warm but precise") with a delivery cue ("slow down on the numbers").

## Custom voices

If your account is approved for custom voices, mint a voice from a consent recording + a sample recording via `/v1/audio/voice_consents` and `/v1/audio/voices`. Use the returned `voice_id` in either `/v1/audio/speech` or a Realtime session:

```bash
curl https://api.openai.com/v1/audio/speech \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini-tts",
    "voice": { "id": "voice_123abc" },
    "input": "Maple est le meilleur golden retriever du monde entier.",
    "language": "fr",
    "format": "wav"
  }' \
  --output sample.wav
```

In Realtime, set `audio.output.voice: { "id": "voice_123abc" }`. Full workflow in `references/16-custom-voices.md`.

## Common mistakes

- Using `instructions` with `tts-1` or `tts-1-hd` — they ignore it. Switch to `gpt-4o-mini-tts`.
- Streaming MP3 and hearing decode jitter — switch to `wav` or `pcm`.
- Forgetting to set `language` on a non-English input — voices are optimized for English; language hints help.
- Hardcoding a voice name like `"nova"` for Realtime where it isn't currently exposed. Stick to `marin`/`cedar` or the names listed in `references/02-voice-agents.md`.
- Skipping the AI-disclosure copy on user-facing UI. Required by OpenAI's usage policies.

## See also

- `examples/tts-streaming.py` / `.ts` — Python + TypeScript streaming examples.
- `references/16-custom-voices.md` — custom voice creation flow.
- `references/15-chat-completions-audio.md` — audio output in Chat Completions, an alternative path.
