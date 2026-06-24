# Audio speech (TTS) — `POST /v1/audio/speech` + voices

Synthesize spoken audio from text. Choose a voice and an output format; optionally
clone/reference a voice with `ref_audio`, or stream audio over SSE.

- **Endpoint:** `POST /v1/audio/speech`
- **Docs:** https://docs.mistral.ai/api/endpoint/audio/speech
- **Bundled runner:** `scripts/mistral_speech.py`
- **Spec:** [openapi.yaml](openapi.yaml) (`SpeechRequest`, `SpeechResponse`, `SpeechStreamEvents`)

## Request body (`application/json`)

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `input` | string | **yes** | — | Text to speak |
| `model` | string \| null | no | — | TTS model id (server picks a default if omitted) |
| `voice_id` | string \| null | no | — | Preset or custom voice (see voices endpoints) |
| `ref_audio` | string (base64) \| binary \| null | no | — | Reference audio for voice cloning/style |
| `response_format` | `SpeechOutputFormat` | no | `mp3` | `mp3` \| `wav` \| `pcm` \| `aac` \| `flac` \| `opus` |
| `metadata` | object \| null | no | null | Free-form metadata |
| `stream` | bool | no | false | Stream audio over SSE |

## Response

- **Non-streaming:** `SpeechResponse` → `{ "audio_data": "<base64>" }`. Some
  deployments return the raw audio bytes directly; the bundled runner handles both
  (decodes base64 JSON, or writes raw bytes by content-type).
- **Streaming (`stream=true`):** `text/event-stream` of discriminated events —
  `speech.audio.delta` (`{ type, audio_data }`, base64 chunks) then
  `speech.audio.done` (`{ type, usage }`).

## Voices

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/v1/audio/voices` | GET | List available voices |
| `/v1/audio/voices/{voice_id}` | GET | Voice details |
| `/v1/audio/voices/{voice_id}/sample` | GET | Sample audio for a voice |

Docs: https://docs.mistral.ai/api/endpoint/audio/voices

## Examples

```bash
# cURL — write the returned base64 to an mp3
curl https://api.mistral.ai/v1/audio/speech \
  -H "Authorization: Bearer $MISTRAL_API_KEY" -H 'Content-Type: application/json' \
  -d '{"input":"Hello from Mistral.","response_format":"mp3"}' \
  | python -c "import sys,json,base64;open('hello.mp3','wb').write(base64.b64decode(json.load(sys.stdin)['audio_data']))"

# List voices
curl https://api.mistral.ai/v1/audio/voices -H "Authorization: Bearer $MISTRAL_API_KEY"
```
```python
# Python (SDK)
import os, base64
from mistralai import Mistral
client = Mistral(api_key=os.environ["MISTRAL_API_KEY"])
res = client.audio.speech.create(input="Hello from Mistral.", response_format="mp3")
# res carries base64 audio_data (or stream with the streaming variant)
```
```typescript
// TypeScript (SDK)
import { Mistral } from "@mistralai/mistralai";
const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
const res = await client.audio.speech.create({ input: "Hello from Mistral.", responseFormat: "mp3" });
```
```bash
# Bundled runner (handles base64 vs raw transparently)
python scripts/mistral_speech.py --input "Hello from Mistral." --out hello.mp3
python scripts/mistral_speech.py --input "Bonjour" --voice <voice_id> --format wav --out bonjour.wav
echo "long narration..." | python scripts/mistral_speech.py --stdin --out narration.mp3
```

## Notes
- Default `response_format` is `mp3`; `pcm` is raw PCM (no container).
- Pick a `voice_id` from `GET /v1/audio/voices`; omit it to use the model default.
- The exact SDK method names can change — when in doubt, verify against
  `references/openapi.yaml` or the live spec (https://docs.mistral.ai/openapi.yaml),
  or just use the bundled runner, which calls the REST endpoint directly.
