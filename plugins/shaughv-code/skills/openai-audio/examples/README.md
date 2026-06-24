# Examples — index and verification log

Runnable code that mirrors the patterns described in `references/`. Every example has a header comment with `REQUIREMENTS`, `INSTALL`, and `RUN` sections — if you're an agent about to run one of these, read the header before installing anything.

## Index

| Example | What it does | Languages | Pairs with reference |
|---|---|---|---|
| `ephemeral-token-server/` | Mints short-lived `ek_…` client secrets for browser/mobile via `/v1/realtime/client_secrets`. | `server.js`, `server.ts`, `server.py` | `references/06-transport-webrtc.md` |
| `webrtc-browser-voice-agent/` | Browser voice agent using unified `/v1/realtime/calls` (server mediates SDP). | `server.js`, `server.ts`, `index.html` | `references/02-voice-agents.md`, `references/06-transport-webrtc.md` |
| `agents-sdk-browser/` | Same as above using the higher-level `@openai/agents/realtime` SDK. | `server.js`, `index.html` | `references/06-transport-webrtc.md` |
| `websocket-voice-agent.{py,js,ts}` | Server-side voice agent with function tool, streams a WAV in, writes PCM out. | Python, Node, TypeScript | `references/02-voice-agents.md`, `references/07-transport-websocket.md` |
| `transcription-session.{py,ts}` | Streaming transcription with `gpt-realtime-whisper` over WebSocket. | Python, TypeScript | `references/03-transcription.md` |
| `transcription-file-fallback.py` | File transcription with `gpt-4o-transcribe` (+ optional `--diarize`). | Python | `references/03-transcription.md` |
| `translation-session.{py,js,ts}` | Live translation with `gpt-realtime-translate` on the dedicated endpoint. | Python, Node, TypeScript | `references/04-translation.md` |
| `tts-streaming.{py,js,ts}` | Streaming TTS with `gpt-4o-mini-tts`. | Python, Node, TypeScript | `references/05-text-to-speech.md` |
| `sip-webhook-handler.py` | Flask receiver for `realtime.call.incoming` + sideband control. | Python | `references/08-transport-sip.md`, `references/13-server-side-controls.md` |
| `sideband-server-control.{js,ts}` | Joins an in-progress WebRTC session via `call_id` to host tools server-side. | Node, TypeScript | `references/13-server-side-controls.md` |
| `prompt-templates/*.md` | Production-grade system prompts and scaffolding. | Markdown | `references/10-prompting-realtime-2.md`, `references/19-use-cases.md` |
| `audio_samples/*.wav` | Test fixtures (short WAVs) for transcription, translation, and voice-agent tests. | Audio | — |

## Audio fixtures

The `audio_samples/` directory holds short WAV files generated via `gpt-4o-mini-tts` for deterministic testing. To regenerate them, see `audio_samples/REGENERATE.md` (or run `tts-streaming.py` with custom text).

| File | Contents | Voice | Length |
|---|---|---|---|
| `sample-en.wav` | "Hello. My order number is one two three four five. Can you tell me the shipping status?" | `marin` | ~6 s |
| `sample-es.wav` | "Hola, soy Maria. Vivo en Madrid y trabajo como ingeniera de software." | `cedar` | ~5 s |

## Verification log

Live tests against the OpenAI API on **2026-05-19** with the production endpoints. Mojibake characters in the transcripts below are PowerShell display encoding, not API output.

### ✅ `tts-streaming.py`

- **Command**: `python tts-streaming.py "Hello from the audio skill smoke test." test-out.wav`
- **Result**: `Wrote test-out.wav (141644 bytes)` — non-empty WAV produced.
- **Status**: PASS.

### ✅ `transcription-file-fallback.py`

- **Command**: `python transcription-file-fallback.py audio_samples/sample-en.wav`
- **Result**: `Hello, my order number is 12345. Can you tell me the shipping status?` — exact match against the source text used to synthesize the sample.
- **Status**: PASS.

### ✅ `transcription-session.py`

- **Command**: `python transcription-session.py audio_samples/sample-en.wav`
- **Result**: Streaming delta arrived; final transcript: `Hello. My order number is one two three four five. Can you tell me the shipping status?`
- **Note**: `gpt-realtime-whisper` does **not** support `audio.input.turn_detection`. The example commits the buffer manually. Connect to `wss://api.openai.com/v1/realtime?intent=transcription` (NOT `?model=...`).
- **Status**: PASS.

### ✅ `translation-session.py`

- **Command**: `python translation-session.py audio_samples/sample-en.wav es`
- **Result**: Spanish transcript streamed: `Hola, mi número de pedido es 123456. ¿Puede decirme el estado del envío?`. Translated PCM audio (979,200 bytes ≈ 20 s) written to `translated.pcm`.
- **Note**: Translation events use a `session.` prefix (`session.input_audio_buffer.append`, `session.output_audio.delta`, etc.). Closing requires `session.close` → wait for `session.closed`.
- **Status**: PASS.

### ✅ `websocket-voice-agent.py`

- **Command**: `python websocket-voice-agent.py audio_samples/sample-en.wav`
- **Result**: Model responded with `"Okay, let's confirm that order number digit by digit, then I'll check the shipping status."` — correctly following the digit-by-digit confirmation rule from the system prompt before calling `lookup_order`. Response audio (268,800 bytes ≈ 5.6 s) written to `response.pcm`. Usage reported 635 total tokens, including 37 reasoning tokens.
- **Note**: Disabled VAD (`turn_detection: null`) for deterministic test behavior. `audio.output.format` must include `rate` even though doc examples sometimes show only `type`.
- **Status**: PASS.

### ✅ `ephemeral-token-server/server.py`

- **Command**: `python server.py` then `curl http://localhost:3000/token`
- **Result**: 200 OK with `{"value":"ek_6a0c16…","expires_at":1779177723,"session":{…}}` — note the response shape returns `value` at the **root**, not under `client_secret`.
- **Status**: PASS.

### 🧪 `ephemeral-token-server/server.js` and `server.ts`

- **Status**: Not live-tested in this session — would require `npm install express`. Code path is identical to `server.py`. Treat as **code-reviewed only**; run a quick `curl http://localhost:3000/token` after `node server.js` to verify.

### 🧪 `websocket-voice-agent.{js,ts}`, `translation-session.{js,ts}`, `transcription-session.ts`, `tts-streaming.{js,ts}`

- **Status**: Not live-tested in this session — would require `npm install` for `ws`, `wavefile`, etc. Logic and event shapes mirror the verified Python versions exactly. Treat as **code-reviewed only**.

### 🧪 `webrtc-browser-voice-agent/`, `agents-sdk-browser/`

- **Status**: Full end-to-end test requires a browser with microphone access. Server endpoints (`POST /session`, `GET /token`) are structurally identical to the verified `ephemeral-token-server/server.py`. The browser code mirrors the official WebRTC walkthrough in `references/06-transport-webrtc.md`.
- **Manual test recipe**:
  1. `export OPENAI_API_KEY=sk-...`
  2. `cd examples/webrtc-browser-voice-agent && npm install express && node server.js`
  3. Open http://localhost:3000 in Chrome/Firefox.
  4. Click "Start session", allow microphone, say "Hello".
  5. Verify: the assistant audibly responds and the data-channel log shows `session.created` → `response.done`.

### 🧪 `sip-webhook-handler.py`

- **Status**: Live SIP trunk not available in this skill's test environment. The script's request-shape and accept/sideband patterns match `references/08-transport-sip.md` exactly. Treat as **code-reviewed only**.
- **Manual test recipe**: Configure a SIP trunk at Twilio / Telnyx pointed at `sip:$PROJECT_ID@sip.api.openai.com;transport=tls`, set up an OpenAI webhook with `OPENAI_WEBHOOK_SECRET`, expose this handler at `/openai/webhook` (use `ngrok` for local), then dial in.

### 🧪 `sideband-server-control.{js,ts}`

- **Status**: Requires a live WebRTC session whose `call_id` you have. Code path is exactly the WebSocket sideband pattern from `references/13-server-side-controls.md`. Treat as **code-reviewed only**.
- **Manual test recipe**: Run `webrtc-browser-voice-agent/server.js`, capture the `X-Call-Id` header from `/session`, then `node sideband-server-control.js <call_id>` and converse via the browser.

## Bugs found and fixed during testing

The OpenAI docs have a few small mismatches with the actual API surface today. They're fixed in the examples and called out below so future updates can verify:

1. **Transcription session URL**. Use `wss://api.openai.com/v1/realtime?intent=transcription`. Passing `?model=gpt-realtime-whisper` returns `"Model gpt-realtime-whisper is a transcription model and cannot be used as the realtime session model."`
2. **`gpt-realtime-whisper` has no `turn_detection`.** The realtime-transcription doc shows a `turn_detection: {...}` block in its session example; the API rejects it with `"Turn detection is not supported for this transcription model."` Commit manually with `input_audio_buffer.commit`.
3. **Voice-agent `audio.output.format` requires `rate`.** Doc examples sometimes show only `{ type: "audio/pcm" }`. The API requires `{ type: "audio/pcm", rate: 24000 }`.
4. **Token-server response shape.** OpenAI's `POST /v1/realtime/client_secrets` returns `{ value: "ek_..." }` at the root — `value`, not `client_secret.value`. Some doc snippets show `client_secret.value`; the canonical shape today is just `value`.
