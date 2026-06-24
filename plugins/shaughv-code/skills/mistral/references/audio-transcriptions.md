# Audio transcription — `POST /v1/audio/transcriptions`

Transcribe speech to text with Mistral's Voxtral models. Input a local file
(multipart upload), a public URL, or an uploaded file id. Optional language hint,
speaker diarization, word/segment timestamps, and SSE streaming.

- **Endpoint:** `POST /v1/audio/transcriptions` (streaming: same path with `stream=true`)
- **Default model:** `voxtral-mini-latest` (also `voxtral-mini-2507`)
- **Docs:** https://docs.mistral.ai/api/endpoint/audio/transcriptions
- **Bundled runner:** `scripts/mistral_transcribe.py`
- **Spec:** [openapi.yaml](openapi.yaml) (`AudioTranscriptionRequest` / `TranscriptionResponse`)

## Request (`multipart/form-data`)

Provide **exactly one** audio source: `file`, `file_url`, or `file_id`.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `model` | string | **yes** | — | e.g. `voxtral-mini-latest` |
| `file` | binary | one-of | — | Audio bytes (mp3/wav/flac/ogg/m4a/…) as a form part |
| `file_url` | string (URI) | one-of | — | Public URL to the audio |
| `file_id` | string | one-of | — | Id of a file uploaded to `/v1/files` |
| `language` | string (2-char) | no | auto | ISO hint, e.g. `en` — boosts accuracy. Pattern `^\w{2}$` |
| `temperature` | number | no | — | Sampling temperature |
| `diarize` | bool | no | false | Label speakers |
| `timestamp_granularities[]` | `"segment"` \| `"word"` | no | — | Timestamp detail (repeatable) |
| `context_bias` | string[] | no | `[]` | Bias terms (no commas/whitespace within a term) |
| `stream` | bool | no | false | Stream partial results over SSE |

## Response (`TranscriptionResponse`)

| Field | Type | Description |
|-------|------|-------------|
| `model` | string | Model used |
| `text` | string | Full transcript |
| `language` | string \| null | Detected/given language code |
| `segments` | `TranscriptionSegmentChunk[]` | Per-segment text + timing (word- or segment-level per request) |
| `usage` | `UsageInfo` | Includes `prompt_audio_seconds` for audio |

**Streaming:** with `stream=true` the response is `text/event-stream`; consume
`data:` events (text deltas), ending at `[DONE]`.

## Examples

```bash
# cURL — local file upload
curl https://api.mistral.ai/v1/audio/transcriptions \
  -H "Authorization: Bearer $MISTRAL_API_KEY" \
  -F model="voxtral-mini-latest" \
  -F file="@meeting.mp3" \
  -F language="en"
```
```bash
# cURL — by URL (form field, no upload)
curl https://api.mistral.ai/v1/audio/transcriptions \
  -H "Authorization: Bearer $MISTRAL_API_KEY" \
  -F model="voxtral-mini-latest" \
  -F file_url="https://example.com/clip.mp3"
```
```python
# Python (SDK)
import os
from mistralai import Mistral
client = Mistral(api_key=os.environ["MISTRAL_API_KEY"])
with open("meeting.mp3", "rb") as f:
    res = client.audio.transcriptions.complete(
        model="voxtral-mini-latest",
        file={"file_name": "meeting.mp3", "content": f},
        language="en",
    )
print(res.text)
```
```typescript
// TypeScript (SDK)
import { Mistral } from "@mistralai/mistralai";
import { openAsBlob } from "node:fs";
const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
const res = await client.audio.transcriptions.complete({
  model: "voxtral-mini-latest",
  file: { fileName: "meeting.mp3", content: await openAsBlob("meeting.mp3") },
  language: "en",
});
console.log(res.text);
```
```bash
# Bundled runner (stdlib only)
python scripts/mistral_transcribe.py --file ./call.wav --language en --diarize --timestamps segment --json
python scripts/mistral_transcribe.py --file-url https://example.com/clip.mp3 --stream
```

## Notes
- `language` is a 2-letter code; omit it to auto-detect.
- Use `--file-id` (or `file_id`) to reuse an already-uploaded file; if **you**
  uploaded it solely for this transcription, delete it afterward (see
  [files.md](files.md)). The runner's direct `--file` path uploads as a multipart
  part (not a stored `/v1/files` object), so there's nothing to clean up there.
- Audio usage is billed via `prompt_audio_seconds` (see `usage`).
- For timestamps, pass `--timestamps segment` and/or `--timestamps word`
  (`timestamp_granularities[]`).
