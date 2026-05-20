# 01 — Choosing a path

The right model and transport depend on three questions:

1. **Does the app speak back to the user?** Yes → voice agent or TTS. No → transcription or translation.
2. **Is the audio live, or a file?** Live → Realtime API. File → Audio API.
3. **Where is the audio captured/played?** Browser/mobile → WebRTC. Server pipeline → WebSocket. Phone → SIP.

## Decision tree

```
Is the user speaking to you in real time?
├── Yes
│   ├── Should the model speak back, answer questions, call tools?
│   │   ├── Yes → gpt-realtime-2 (voice-agent session)         → references/02-voice-agents.md
│   │   └── No, only transcribe what's said
│   │       └── gpt-realtime-whisper (transcription session)   → references/03-transcription.md
│   ├── Should the model translate continuously to another language?
│   │   └── gpt-realtime-translate (dedicated translation endpoint)
│   │                                                          → references/04-translation.md
│   └── Is this a phone call?
│       └── SIP webhook → accept → /v1/realtime/calls          → references/08-transport-sip.md
└── No (audio is a file or text input)
    ├── Generate spoken audio from text → gpt-4o-mini-tts      → references/05-text-to-speech.md
    ├── Transcribe a recorded file
    │   ├── Need speaker labels? → gpt-4o-transcribe-diarize
    │   ├── Need highest accuracy? → gpt-4o-transcribe
    │   ├── Need lowest cost? → gpt-4o-mini-transcribe
    │   └── Legacy Whisper integration? → whisper-1            → references/03-transcription.md
    └── Audio inside an existing Chat Completions app
        └── gpt-audio with modalities:["text","audio"]         → references/15-chat-completions-audio.md
```

## Model reference card

| Model | Endpoint | Strengths | Avoid for |
|---|---|---|---|
| `gpt-realtime-2` | `/v1/realtime` | Reasoning, tools, 128k context, preambles, `phase` channel | Streaming-only transcription, translation |
| `gpt-realtime-1.5` | `/v1/realtime` | Cheaper, faster, simpler S2S | Complex multi-step tasks needing reasoning |
| `gpt-realtime` | `/v1/realtime` | Stable alias used in some doc samples | Treat as `gpt-realtime-1.5` semantics |
| `gpt-realtime-whisper` | `/v1/realtime` (`type:"transcription"`) | Streaming transcript deltas, tunable latency | Speaking responses (none produced) |
| `gpt-realtime-translate` | `/v1/realtime/translations` | Continuous interpreter, separate event surface | Conversation; never call `response.create` |
| `gpt-4o-mini-tts` | `/v1/audio/speech` | Steerable voice, instructions, MP3/Opus/AAC/FLAC/WAV/PCM | Sub-100ms latency from cold start |
| `tts-1`, `tts-1-hd` | `/v1/audio/speech` | Lower-latency legacy TTS, smaller voice set | New product builds — prefer `gpt-4o-mini-tts` |
| `gpt-4o-transcribe` | `/v1/audio/transcriptions` | High-accuracy file transcription, prompt-steerable | Live streaming with sub-second deltas |
| `gpt-4o-mini-transcribe` | `/v1/audio/transcriptions` | Cheaper file transcription | Top accuracy |
| `gpt-4o-transcribe-diarize` | `/v1/audio/transcriptions` | Speaker labels (`diarized_json`), known-speaker references | Prompts (not supported), `timestamp_granularities[]` |
| `whisper-1` | `/v1/audio/transcriptions` and `/v1/audio/translations` | Verbose JSON + word timestamps; translates any language → English | Streaming deltas (not the same as `gpt-realtime-whisper`) |
| `gpt-audio` | `/v1/chat/completions` | Audio in/out inside an existing Chat Completions app | New voice agents — use `gpt-realtime-2` instead |

## Transport reference card

| Transport | Use when | Reference |
|---|---|---|
| **WebRTC** | Browser/mobile clients capture or play audio directly. Handles input buffer, interruption, and truncation automatically. | `references/06-transport-webrtc.md` |
| **WebSocket** | Server already has raw audio (Twilio Media Streams, broadcast ingest, batch worker). Granular control + manual interruption handling. | `references/07-transport-websocket.md` |
| **SIP** | Inbound/outbound phone calls. Confirm model support before using SIP for translation or transcription. | `references/08-transport-sip.md` |

Server-side control while a client owns the media → `references/13-server-side-controls.md`.

## Pre-flight checks

Before you start writing code:

- [ ] **Model + endpoint match.** `gpt-realtime-2` only goes to `/v1/realtime`. `gpt-realtime-translate` only goes to `/v1/realtime/translations`. Mixing them throws cryptic errors.
- [ ] **Session type matches the model.** Voice agents → `session.type: "realtime"`. Transcription → `session.type: "transcription"`.
- [ ] **Voice is set if you want audio output.** Default to `marin` or `cedar`. It cannot change mid-session.
- [ ] **`output_modalities` is correct.** `["audio"]`, `["text"]`, or `["audio","text"]` depending on what the model should produce.
- [ ] **Safety identifier in place** if you have end users. Set on the server-side ephemeral-token request.
- [ ] **No legacy `OpenAI-Beta: realtime=v1`** header on GA endpoints.
- [ ] **Audio format is 24 kHz mono PCM16** for any input you stream over WebSocket (unless your transport is WebRTC, which handles encoding for you).
