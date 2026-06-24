# Translation scaffolding — listen-along

Translation sessions don't use system prompts the way voice agents do. The session config carries `audio.output.language`; the model is a continuous interpreter and does not call tools or run a turn lifecycle.

What you *can* control is the **architecture and client UX** around the session. This file captures the patterns and UI states for a one-way "listen-along" translation experience — a single speaker, an audience that listens in another language.

## Session config (server-side)

```json
{
  "type": "session.update",
  "session": {
    "audio": { "output": { "language": "es" } }
  }
}
```

One session per target language. If your event needs Spanish, French, and Japanese feeds, create three sessions.

## Source audio strategy

| Source | How |
|---|---|
| Single browser presenter | Capture mic via `getUserMedia` + WebRTC to the translation endpoint. |
| Browser tab (e.g., embedded video) | `getDisplayMedia({ audio: true })` to grab the tab's audio. |
| Server-side broadcast ingest | Decode the broadcast feed to 24 kHz mono PCM16 and send over WebSocket via `session.input_audio_buffer.append`. |
| SIP / phone bridge | Bridge the audio leg to a worker that re-encodes and forwards to WebSocket. |

## Audience UI states

The audience client should expose:

- **Volume / mute** for the translated audio.
- **Caption visibility** for the translated transcript (`session.output_transcript.delta`).
- **Source transcript** (optional, dim/italic) from `session.input_transcript.delta` — useful for accessibility.
- **Connection state**: "connecting…", "live", "delayed", "reconnecting…", "ended".
- A clear disclosure that this is AI-generated translation, not a professional interpreter.

## Reconnect strategy

Translation sessions can drop on network blips. The client should:

1. Detect socket close.
2. Show "reconnecting…" while it re-opens the session with the same target language.
3. Re-subscribe to event handlers.
4. On reconnect, append fresh audio. Don't try to replay buffered audio — the interpreter doesn't have the context.

## Graceful shutdown

When the speaker finishes:

```javascript
ws.send(JSON.stringify({ type: "session.close" }));
// Continue reading events until `session.closed`, then close the socket.
```

Closing the socket immediately drops translated audio still in flight. Always wait for `session.closed`.

## Quality + latency knobs

There are no per-prompt knobs for translation latency or quality (unlike `gpt-realtime-2` with `reasoning.effort`). The lever is operational: pick `gpt-realtime-translate` as the model, send 24 kHz mono PCM16 input over WebSocket, and measure latency end-to-end on a representative golden set. See `references/04-translation.md` and `references/18-evals-and-testing.md`.

## What this prompt template is *not*

You will **not** find an assistant-style system prompt here, because translation sessions are not assistants. If you need the agent to *answer questions about the talk* in addition to translating it, run a parallel **voice-agent** session (different model, different endpoint) alongside the translation session.
