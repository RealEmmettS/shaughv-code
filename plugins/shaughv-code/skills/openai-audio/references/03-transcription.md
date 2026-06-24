# 03 — Transcription (speech-to-text)

There are two paths. Pick based on whether you need **streaming transcript deltas** or **request/response** transcription of a complete file.

| Path | Model | Endpoint | Use when |
|---|---|---|---|
| **Streaming** | `gpt-realtime-whisper` | `/v1/realtime` with `session.type:"transcription"` | Live captions, real-time UI feedback, telephony ASR, anything where the user should see text before the utterance is done. |
| **File / bounded** | `gpt-4o-transcribe`, `gpt-4o-mini-transcribe`, `gpt-4o-transcribe-diarize`, or `whisper-1` | `/v1/audio/transcriptions` | Recorded files, podcasts, meetings, voicemail, batch jobs. |

If you also need a spoken reply from the model, do **not** use a transcription session — use a voice-agent session with `gpt-realtime-2` and rely on `response.output_audio_transcript.delta` events for the transcript of the model's own audio output.

## Streaming transcription with `gpt-realtime-whisper`

A transcription session is **not** a conversation. The model emits transcript deltas for the audio it hears and does not generate spoken responses. There is no `response.create`.

### Session config

Connect to `wss://api.openai.com/v1/realtime?intent=transcription` (the `intent` query param, not `model` — the transcription model is configured inside the session payload, not in the URL). Then send a `session.update`:

```json
{
  "type": "session.update",
  "session": {
    "type": "transcription",
    "audio": {
      "input": {
        "format": { "type": "audio/pcm", "rate": 24000 },
        "transcription": {
          "model": "gpt-realtime-whisper",
          "language": "en"
        }
      }
    },
    "include": ["item.input_audio_transcription.logprobs"]
  }
}
```

> **Caveat:** `gpt-realtime-whisper` does not support `audio.input.turn_detection`. Commit the buffer manually (`input_audio_buffer.commit`) after streaming. Other transcription models (`gpt-4o-transcribe`, `gpt-4o-mini-transcribe`) may accept a `turn_detection` block — test before relying on it.

| Field | Notes |
|---|---|
| `type: "transcription"` | Required. Distinguishes this from a voice-agent session. |
| `audio.input.format` | 24 kHz mono PCM16 is the safe default. μ-law (`audio/pcmu`) for telephony. |
| `audio.input.transcription.model` | `gpt-realtime-whisper` for streaming. Other transcription models also work here but are not natively streaming. |
| `audio.input.transcription.language` | Optional ISO 639-1 hint (`en`, `es`, etc.). Improves accuracy when audio language is known. |
| `audio.input.turn_detection` | `null` to commit manually; `server_vad` for automatic segmentation. |
| `include` | Add `"item.input_audio_transcription.logprobs"` to receive per-token confidence. |

### Audio streaming

```javascript
ws.send(JSON.stringify({
  type: "input_audio_buffer.append",
  audio: base64Pcm16  // ≤15MB per chunk
}));
```

If VAD is disabled, manually commit:

```javascript
ws.send(JSON.stringify({ type: "input_audio_buffer.commit" }));
```

With server VAD enabled, the session commits audio automatically at turn boundaries.

### Events to listen for

| Event | Meaning |
|---|---|
| `conversation.item.input_audio_transcription.delta` | New partial text. Stream into the UI. |
| `conversation.item.input_audio_transcription.completed` | Final transcript for a committed item. Use `item_id` to reconcile with the partial deltas. |
| `input_audio_buffer.committed` | The audio buffer has been committed (manually or by VAD). |
| `error` | Something went wrong. Inspect `code`, `message`, `event_id`. |

Ordering between completion events across speech turns isn't guaranteed. **Use `item_id` to match deltas to their finished transcript.**

### Tuning latency vs accuracy

Lower delay → earlier partial text but more drift. Higher delay → fewer revisions but slower display. Recommended starting points to evaluate against your real audio:

- **0.4 s** for the most latency-sensitive interactions (gameplay, accessibility live caption).
- **0.8–1.2 s** for balanced live captions.
- **1.5–2.0 s** when accuracy matters more than immediate display.
- **3.0 s** for archive-quality, recording-style transcription.

Don't tune from synthetic audio — test with real microphones, telephony codecs, accents, code-switching, and domain vocabulary.

### Vocabulary hints

If supported by the model and endpoint, short keyword lists steer the recognizer better than long instructions:

```text
Keywords: metoprolol, atorvastatin, A1C, systolic, diastolic
```

For production, treat keyword steering as an aid — keep a manual eval set for high-value entities (names, IDs, drug names, brand names).

## File-based transcription with `/v1/audio/transcriptions`

Same endpoint, multiple models, slightly different feature surface for each.

### Model selection

| Model | Response formats | Streaming | Notes |
|---|---|---|---|
| `gpt-4o-transcribe` | `json`, `text` | Yes (`stream=true`) | Highest accuracy in the Audio API. Supports `prompt` and `include[logprobs]`. |
| `gpt-4o-mini-transcribe` | `json`, `text` | Yes | Cheaper, for cost-sensitive batches. |
| `gpt-4o-transcribe-diarize` | `json`, `text`, `diarized_json` | Yes (segment events only) | Speaker labels. Requires `chunking_strategy` for audio > 30 s. **No** `prompt`, `logprobs`, or `timestamp_granularities[]`. |
| `whisper-1` | `json`, `text`, `srt`, `verbose_json`, `vtt` | No (not natively streaming) | Word/segment `timestamp_granularities[]` supported. |

### Basic transcription

```python
from openai import OpenAI

client = OpenAI()

with open("audio.mp3", "rb") as f:
    transcript = client.audio.transcriptions.create(
        model="gpt-4o-transcribe",
        file=f,
    )
print(transcript.text)
```

### Diarized transcription

For multi-speaker recordings, use `gpt-4o-transcribe-diarize` with `response_format="diarized_json"`:

```python
transcript = client.audio.transcriptions.create(
    model="gpt-4o-transcribe-diarize",
    file=open("meeting.wav", "rb"),
    response_format="diarized_json",
    chunking_strategy="auto",
)

for segment in transcript.segments:
    print(f"{segment.speaker}: {segment.text}  ({segment.start:.2f}-{segment.end:.2f}s)")
```

Provide up to four short reference clips (2–10 s each) to map output to known speakers:

```python
transcript = client.audio.transcriptions.create(
    model="gpt-4o-transcribe-diarize",
    file=open("meeting.wav", "rb"),
    response_format="diarized_json",
    chunking_strategy="auto",
    extra_body={
        "known_speaker_names": ["agent", "customer"],
        "known_speaker_references": [
            "data:audio/wav;base64,<base64 of agent.wav>",
            "data:audio/wav;base64,<base64 of customer.wav>",
        ],
    },
)
```

### Streaming the transcription of a completed file

For `gpt-4o-transcribe` and `gpt-4o-mini-transcribe`, pass `stream=True` and iterate events:

```python
stream = client.audio.transcriptions.create(
    model="gpt-4o-mini-transcribe",
    file=open("speech.mp3", "rb"),
    response_format="text",
    stream=True,
)
for event in stream:
    print(event)
```

Event types include `transcript.text.delta` (partial text) and `transcript.text.done` (final). Diarized streams emit `transcript.text.segment` when each segment is finalized.

### Word-level timestamps (`whisper-1` only)

```python
transcript = client.audio.transcriptions.create(
    model="whisper-1",
    file=open("audio.mp3", "rb"),
    response_format="verbose_json",
    timestamp_granularities=["word"],
)
print(transcript.words)
```

### Improving accuracy

Three techniques (in order of effort):

1. **`prompt` parameter** (max 224 tokens of context, including spellings of unusual SKUs):

   ```python
   client.audio.transcriptions.create(
       model="gpt-4o-transcribe",
       file=f,
       prompt="The transcript is about OpenAI which makes technology like DALL·E, GPT-3, ChatGPT.",
   )
   ```

2. **Continuation context.** When breaking a long file into chunks, prepend the previous chunk's transcript as the next chunk's `prompt`.
3. **Post-processing with GPT-4**. Pass the transcript through `gpt-4.1` with a system prompt listing brand/product names and disambiguation rules. The wider context window lets you correct what `prompt` couldn't fit.

## File size limit

Single uploads are limited to **25 MB**. For longer audio:

- Compress to MP3/Opus before upload.
- Split with `pydub` or `ffmpeg` at sentence boundaries (avoid mid-word splits).
- Or use the streaming transcription session via `gpt-realtime-whisper` over WebSocket — no file-size limit per request, just per chunk (15 MB).

## Translation (audio → English text)

`whisper-1` also supports `/v1/audio/translations`, which transcribes any-language audio into **English** text only. This is different from `gpt-realtime-translate`, which streams translated audio + transcript in real time to a target language of your choice. For live conversational translation, use the realtime translation path in `references/04-translation.md`.

```python
translation = client.audio.translations.create(
    model="whisper-1",
    file=open("german.mp3", "rb"),
)
print(translation.text)
```

## See also

- `examples/transcription-session.py` — `gpt-realtime-whisper` streaming.
- `examples/transcription-file-fallback.py` — `gpt-4o-transcribe` + diarize.
- `references/04-translation.md` — for live translation (not transcription).
- `references/07-transport-websocket.md` — WebSocket setup for streaming.
- `references/18-evals-and-testing.md` — eval strategy for transcription quality.
