# 19 — Worked use cases

Six recipes that combine multiple parts of this skill. Each one points to the references and example files you'll touch.

## 1. Customer support voice agent (browser, with tools)

**Goal:** A web app where a logged-in customer talks to an AI agent that can look up their orders, schedule technician visits, and escalate to a human.

**Architecture:**

- Browser captures mic + plays audio via WebRTC.
- Your server mediates the SDP exchange (unified `/v1/realtime/calls` path).
- A sideband WebSocket on your server hosts the tools (`lookup_order`, `schedule_technician`, `escalate_to_human`).
- Conversation is fully server-controlled.

**What to read in order:**

1. `references/01-choosing-a-path.md` — confirm voice agent / WebRTC / `gpt-realtime-2`.
2. `references/02-voice-agents.md` — session shape, voices, reasoning.
3. `references/06-transport-webrtc.md` — unified SDP path.
4. `references/10-prompting-realtime-2.md` — production prompt structure.
5. `references/12-tools-and-mcp.md` — function tool patterns and recovery.
6. `references/13-server-side-controls.md` — sideband attach to a `call_id`.

**Examples to copy:**

- `examples/webrtc-browser-voice-agent/` (browser + token server).
- `examples/sideband-server-control.js` (joins the in-progress call to host tools).
- `examples/prompt-templates/voice-agent-support.md` (system prompt).

## 2. Real-time language tutor

**Goal:** A tutoring app where the user practices French. The agent explains concepts in English and runs conversation drills in French. Switches based on context.

**Architecture:**

- Same WebRTC browser pattern as use case 1.
- Prompt steers language explicitly per phase (explanation vs. drill).
- No tools — pure conversation.

**What to read:**

1. `references/02-voice-agents.md` — session shape.
2. `references/06-transport-webrtc.md` — browser transport.
3. `references/10-prompting-realtime-2.md` → "Language and accent" section. The multilingual policy in `references/11-prompting-realtime-1.5.md` is also useful as a structural reference.

**Prompt sketch:**

```text
# Role and Objective
You are a friendly, knowledgeable voice tutor for French learners.

# Language
- Use English when explaining grammar, vocabulary, or cultural context.
- Speak in French when conducting practice, giving examples, or engaging in dialogue.
- If the learner asks "in English" or "en français", honor the request immediately.

# Personality and Tone
- Warm, encouraging, patient.
- 2–3 sentences per turn.

# Pacing
- Speak naturally; do not exaggerate the French accent for English content.
- For French content, use a clear standard French accent.
```

**Examples to start from:** `examples/webrtc-browser-voice-agent/` + a custom system prompt in `examples/prompt-templates/voice-agent-tutor.md`.

## 3. Doctor's note transcription (file-based, diarized)

**Goal:** Upload an outpatient consult recording, get a structured transcript with speaker labels and a clean summary.

**Architecture:**

- File transcription via `gpt-4o-transcribe-diarize`.
- Optional post-processing with `gpt-4.1` to correct medication / procedure names.

**What to read:**

1. `references/03-transcription.md` — file-based section + diarization options.
2. `references/18-evals-and-testing.md` — eval for medical terms.

**Example:** `examples/transcription-file-fallback.py`.

**Key choices:**

- `response_format="diarized_json"` with `chunking_strategy="auto"` (audio > 30 s).
- Provide `known_speaker_references` for clinician and patient when you have voice samples.
- Pass a `prompt` listing common medications and procedure names (within 224-token budget).

## 4. Livestream translator (listen-along)

**Goal:** A speaker presents in English. Audience members listen in Spanish, French, or Japanese — they pick a language and hear the translated audio in near-real-time.

**Architecture:**

- Source audio: captured server-side (broadcast ingest or browser tab via `getDisplayMedia`).
- One translation session per target language (Spanish, French, Japanese).
- Translated audio + captions republished to listener clients.

**What to read:**

1. `references/04-translation.md` (start here, the event prefix is different).
2. `references/07-transport-websocket.md` if your source is server-side.
3. `references/06-transport-webrtc.md` if the source is browser-captured.

**Example:** `examples/translation-session.py` (one session at a time; replicate for additional languages).

**Architecture note:**

```
source audio → translation session (en→es) → es subscribers
            → translation session (en→fr) → fr subscribers
            → translation session (en→ja) → ja subscribers
```

Keep speaker tracks separate. Use `session.close` → wait for `session.closed` when the stream ends.

## 5. Inbound phone receptionist

**Goal:** A small business gets routine calls (hours, location, appointment booking). The agent answers, handles routine queries, books appointments via an internal tool, and refers calls outside its scope to a human.

**Architecture:**

- SIP trunk at Twilio / Telnyx pointed at `sip:$PROJECT_ID@sip.api.openai.com;transport=tls`.
- Webhook handler accepts `realtime.call.incoming`, calls `/accept` with a system prompt + tool list.
- Sideband WebSocket hosts `book_appointment`, `check_hours`, `escalate_to_human`.
- Use `/refer` to transfer escalations to a human-staffed line.

**What to read:**

1. `references/08-transport-sip.md` — webhook + accept/reject/refer/hangup.
2. `references/13-server-side-controls.md` — sideband control.
3. `references/10-prompting-realtime-2.md` — prompt structure, especially Tools + Escalation sections.

**Example:** `examples/sip-webhook-handler.py`.

**Production guardrails:**

- Verify webhook signatures.
- Pre-warm tool dependencies (DB connections) at process start.
- Set `voice: "marin"` or a custom branded voice via `references/16-custom-voices.md`.
- Set `OpenAI-Safety-Identifier` when you can identify the caller (e.g., known phone number → customer ID hash).

## 6. Server-side TTS for a podcast / audiobook app

**Goal:** A podcast app generates spoken episodes from article text using `gpt-4o-mini-tts`. The voice is on-brand (custom voice). Episodes are pre-generated nightly.

**Architecture:**

- Batch job pulls articles, chunks at paragraph boundaries.
- `/v1/audio/speech` with `gpt-4o-mini-tts` and `voice: { id: "voice_…" }`.
- Streamed `wav` or `pcm` output, concatenated into the final episode file.
- Optional intro/outro music mixed in client-side.

**What to read:**

1. `references/05-text-to-speech.md` — streaming, formats, instructions.
2. `references/16-custom-voices.md` — to create the branded voice.

**Example:** `examples/tts-streaming.py`.

**Tips:**

- Pass `instructions` to control narration style ("Read calmly with a thoughtful tone, slightly slower for technical sentences.").
- Use `language="en"` (or your target ISO 639-1) for non-English content.
- Display the OpenAI-required AI-voice disclosure in your podcast app metadata.
- Cache generated audio per (article hash, voice id, instructions hash) to avoid re-billing on retries.

## See also

- `references/01-choosing-a-path.md` — for problems not on this list.
- `examples/README.md` — verification log for each example file.
