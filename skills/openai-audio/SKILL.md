---
name: openai-audio
description: Use when building anything that involves OpenAI's audio stack — Realtime API (gpt-realtime-2, gpt-realtime, gpt-realtime-1.5) for low-latency speech-to-speech voice agents; gpt-realtime-whisper for live transcription; gpt-realtime-translate for live translation; gpt-4o-mini-tts / tts-1 for text-to-speech; gpt-4o-transcribe / gpt-4o-transcribe-diarize / whisper-1 for file-based speech-to-text; or gpt-audio for audio inside Chat Completions. Triggers on phrases like "voice agent", "real-time voice", "speech-to-speech", "live captions", "live transcription", "real-time translation", "narrate text", "generate spoken audio", "TTS", "phone call AI", "telephony", "SIP", "WebRTC OpenAI", "WebSocket OpenAI Realtime", "stream audio from microphone", "voice assistant with tools", "speech recognition", and any mention of the model IDs above. Covers WebRTC, WebSocket, and SIP transports plus session lifecycle, tool calling, MCP, prompting, cost management, and beta-to-GA migration.
last_verified_against_openai_docs: 2026-05-19
---

# OpenAI Audio + Realtime — expert guide

This skill makes you fluent in OpenAI's audio APIs end to end. The default for any speech-to-speech work is `gpt-realtime-2`. Other jobs use specialized models — pick from the table below.

## Pick the right model

| Job | Use this model | Endpoint | Detail in |
|---|---|---|---|
| Voice agent / speech-to-speech with tools and reasoning | **`gpt-realtime-2`** | `/v1/realtime` (WebRTC, WebSocket, or SIP) | `references/02-voice-agents.md` |
| Speech-to-speech, lower cost, no reasoning | `gpt-realtime-1.5` or `gpt-realtime` (alias) | `/v1/realtime` | `references/02-voice-agents.md` + `references/11-prompting-realtime-1.5.md` |
| Live transcript deltas, no spoken reply | **`gpt-realtime-whisper`** | `/v1/realtime` with `session.type: "transcription"` | `references/03-transcription.md` |
| Continuous live interpreter (one language → another) | **`gpt-realtime-translate`** | `/v1/realtime/translations` (dedicated endpoint, no `response.create`) | `references/04-translation.md` |
| Generate spoken audio from text | **`gpt-4o-mini-tts`** | `/v1/audio/speech` | `references/05-text-to-speech.md` |
| Transcribe a file (high accuracy, not streaming) | `gpt-4o-transcribe` / `gpt-4o-mini-transcribe` | `/v1/audio/transcriptions` | `references/03-transcription.md` |
| Transcribe with speaker labels | `gpt-4o-transcribe-diarize` | `/v1/audio/transcriptions` | `references/03-transcription.md` |
| Add audio in/out to an existing Chat Completions app | `gpt-audio` | `/v1/chat/completions` with `modalities:["text","audio"]` | `references/15-chat-completions-audio.md` |
| Lower-quality, lower-latency TTS for legacy stacks | `tts-1` / `tts-1-hd` | `/v1/audio/speech` | `references/05-text-to-speech.md` |
| Translate audio file to English | `whisper-1` | `/v1/audio/translations` | `references/03-transcription.md` |

## Pick the right transport

| Where does the audio live? | Transport | Detail in |
|---|---|---|
| Browser or mobile app capturing/playing audio | **WebRTC** | `references/06-transport-webrtc.md` |
| Server already has raw audio (Twilio Media Streams, broadcast ingest, batch worker) | **WebSocket** | `references/07-transport-websocket.md` |
| Inbound or outbound phone call | **SIP** | `references/08-transport-sip.md` |

For server-side control while a client owns the media (analytics, tool execution, dynamic session updates), see `references/13-server-side-controls.md`.

## Quick rules of thumb

These come straight from the docs and are easy to forget:

1. **Default `reasoning.effort: "low"`** for production voice agents. Move up only when evals justify the latency cost.
2. **Always set `OpenAI-Safety-Identifier`** if you have end users. For ephemeral tokens, set it on the server-side `client_secrets` request — the identifier binds to the token, and the browser should not send it again.
3. **Translation events use a `session.` prefix.** Translation emits `session.input_audio_buffer.append`, `session.output_audio.delta`, `session.output_transcript.delta`, `session.input_transcript.delta`, `session.close`, `session.closed`. **Never** call `response.create` in a translation session — the model is an interpreter, not an assistant.
4. **`session.type` differs by job.** Voice agents use `"realtime"`; transcription uses `"transcription"`. They are not interchangeable.
5. **Drop `OpenAI-Beta: realtime=v1`.** That header is legacy and should not appear on GA endpoints. See `references/17-beta-to-ga-migration.md`.
6. **Voice is immutable once audio has been emitted** in a session. Set it correctly at session creation.
7. **`gpt-realtime-2` expands the context window to 128k tokens.** Long sessions are practical, but cache rate is structural — keep instructions and tool definitions stable across turns. See `references/14-costs-and-rate-limits.md`.
8. **Don't use raw WebSockets from a browser.** Use WebRTC. The only exceptions are runtimes like Deno or Cloudflare Workers when paired with ephemeral tokens.
9. **WebSocket interruption requires manual truncation.** Listen for `input_audio_buffer.speech_started`, stop client playback, then send `conversation.item.truncate` with the played-audio offset. WebRTC handles this automatically.
10. **Use `marin` or `cedar` voices** for best quality. Other built-in voices: `alloy`, `ash`, `ballad`, `coral`, `echo`, `fable`, `nova`, `onyx`, `sage`, `shimmer`, `verse`.

## Common mistakes

- Mixing translation event names (`session.output_audio.delta`) with voice-agent event names (`response.output_audio.delta`). They are different surfaces.
- Calling `response.create` in a translation session. The session streams continuously; there is no turn lifecycle.
- Forgetting that `gpt-realtime-2` follows instructions **literally**. "Always ask for confirmation before doing anything" will block harmless read-only lookups. Use precise scope. See `references/10-prompting-realtime-2.md`.
- Telling the model to "match the user's accent" — it may switch language. Accent and language are controlled separately.
- Hardcoding voices the user requested even though `voice` cannot change mid-session.
- Configuring `gpt-realtime-whisper` for transcription but then calling `response.create` expecting a spoken reply. Transcription sessions do not generate spoken responses.
- Using literal API keys in browser code. Mint ephemeral tokens with `/v1/realtime/client_secrets` server-side.
- Hitting the `/v1/realtime/translations` endpoint with `gpt-realtime-2` (wrong model) or hitting `/v1/realtime` with `gpt-realtime-translate` (wrong endpoint).
- Forgetting `session.close` → wait for `session.closed` before closing the translation WebSocket. Closing the socket immediately drops translated audio still draining.

## How to use this skill

For any audio task, follow this routing:

1. Read `references/01-choosing-a-path.md` first if the right model or transport is unclear.
2. Open the model-specific reference for the chosen job (02 voice / 03 transcription / 04 translation / 05 TTS).
3. Open the transport reference (06 WebRTC / 07 WebSocket / 08 SIP) based on where the audio lives.
4. For voice agents, prompt structure matters — see `references/10-prompting-realtime-2.md` (or 11 for legacy 1.5 work).
5. For tools or MCP, see `references/12-tools-and-mcp.md`.
6. Copy a starting point from `examples/` and adapt — every example file has a top-of-file comment with run instructions and known testing status.

For complete worked recipes (customer support agent, language tutor, livestream translator, etc.), see `references/19-use-cases.md`.

## Reference index

- `01-choosing-a-path.md` — decision tree for model + transport.
- `02-voice-agents.md` — `gpt-realtime-2` conversational sessions, session shape, voices, reasoning, preambles, push-to-talk.
- `03-transcription.md` — `gpt-realtime-whisper` streaming + `gpt-4o-transcribe(-diarize)` and `whisper-1` for files.
- `04-translation.md` — `gpt-realtime-translate` dedicated endpoint, event prefix, listen-along vs conversational topologies.
- `05-text-to-speech.md` — `gpt-4o-mini-tts` and legacy `tts-1`, voices, formats, streaming.
- `06-transport-webrtc.md` — browser/mobile via `/v1/realtime/calls` (unified) or ephemeral key.
- `07-transport-websocket.md` — server-side raw audio streaming.
- `08-transport-sip.md` — telephony, webhook flow, accept/reject/refer/hangup.
- `09-conversation-lifecycle.md` — full event list, out-of-band responses, image inputs, VAD modes.
- `10-prompting-realtime-2.md` — production prompting playbook for `gpt-realtime-2`.
- `11-prompting-realtime-1.5.md` — legacy guide kept for migration work.
- `12-tools-and-mcp.md` — function tools, MCP servers, connectors, approval flow.
- `13-server-side-controls.md` — sideband WebSocket, webhooks.
- `14-costs-and-rate-limits.md` — token math, caching, truncation, tiers.
- `15-chat-completions-audio.md` — `gpt-audio` in Chat Completions.
- `16-custom-voices.md` — `/v1/audio/voice_consents` + `/v1/audio/voices`.
- `17-beta-to-ga-migration.md` — what changed from the beta `realtime=v1` interface.
- `18-evals-and-testing.md` — how to test realtime apps.
- `19-use-cases.md` — worked recipes.
- `20-official-openai-skills.md` — pointer to https://github.com/openai/skills.

## Example index

- `examples/ephemeral-token-server/` — Node, TS, and Python token minters (`POST /v1/realtime/client_secrets`).
- `examples/webrtc-browser-voice-agent/` — browser voice agent via the unified `/v1/realtime/calls` path.
- `examples/agents-sdk-browser/` — same goal via the higher-level `@openai/agents/realtime` SDK.
- `examples/websocket-voice-agent.{py,js,ts}` — server-side WebSocket voice agent with tools.
- `examples/transcription-session.{py,ts}` — `gpt-realtime-whisper` streaming.
- `examples/transcription-file-fallback.py` — `gpt-4o-transcribe` / diarize for offline files.
- `examples/translation-session.{py,js,ts}` — `gpt-realtime-translate` WebSocket sessions.
- `examples/tts-streaming.{py,js,ts}` — `gpt-4o-mini-tts` streaming.
- `examples/sip-webhook-handler.py` — Flask handler for `realtime.call.incoming`.
- `examples/sideband-server-control.{js,ts}` — joining an in-progress WebRTC session via `call_id`.
- `examples/prompt-templates/` — production-grade system prompts for support, tutoring, listen-along translation, and domain-keyword transcription.

The `examples/README.md` has the verification log (which examples have been live-tested, what was checked, and how to run each one).
