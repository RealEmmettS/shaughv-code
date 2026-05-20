# 07 — Transport: WebSocket

**Use WebSocket when your server already has raw audio.** Examples: Twilio Media Streams, SIP media bridged into your media worker, broadcast ingest, batch processing pipelines, server-to-server tool agents. WebSocket is the lowest-level interface — your code is responsible for encoding audio, sending base64 PCM chunks, and (on voice agents) handling interruption + truncation manually.

**Don't use raw WebSocket from a browser.** Use WebRTC. The exception is server-like browser runtimes (Deno, Cloudflare Workers) paired with ephemeral tokens.

## URL + headers

```
wss://api.openai.com/v1/realtime?model=gpt-realtime-2
```

For transcription-only sessions, you may pass `?intent=transcription` (depending on SDK convention) and configure `session.type:"transcription"` after connecting; alternatively, omit `model` and configure it inside `session.update`.

For translation, connect to the dedicated endpoint instead — see `references/04-translation.md`.

| Header | Value | Notes |
|---|---|---|
| `Authorization` | `Bearer $OPENAI_API_KEY` | Standard API key on server-side connections. |
| `OpenAI-Safety-Identifier` | stable hashed user ID | Recommended when you have end users. Bind it here rather than later — it's bound for the life of the connection. |

**Do not send `OpenAI-Beta: realtime=v1`.** That header is legacy. Drop it on GA.

## Connect

### Node (ws)

```javascript
import WebSocket from "ws";

const ws = new WebSocket(
  "wss://api.openai.com/v1/realtime?model=gpt-realtime-2",
  {
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "OpenAI-Safety-Identifier": "hashed-user-id",
    },
  }
);

ws.on("open", () => {
  ws.send(JSON.stringify({
    type: "session.update",
    session: {
      type: "realtime",
      model: "gpt-realtime-2",
      output_modalities: ["audio"],
      audio: {
        input: {
          format: { type: "audio/pcm", rate: 24000 },
          turn_detection: { type: "semantic_vad" },
        },
        output: {
          format: { type: "audio/pcm" },
          voice: "marin",
        },
      },
      instructions: "You are a concise voice assistant.",
    },
  }));
});

ws.on("message", (raw) => {
  const event = JSON.parse(raw.toString());
  // dispatch
});
```

### Python (websocket-client)

```python
import json, os, websocket

ws = websocket.WebSocketApp(
    "wss://api.openai.com/v1/realtime?model=gpt-realtime-2",
    header=[
        f"Authorization: Bearer {os.environ['OPENAI_API_KEY']}",
        "OpenAI-Safety-Identifier: hashed-user-id",
    ],
    on_open=lambda ws: ws.send(json.dumps({
        "type": "session.update",
        "session": {
            "type": "realtime",
            "model": "gpt-realtime-2",
            "output_modalities": ["audio"],
            "audio": {
                "input": {
                    "format": {"type": "audio/pcm", "rate": 24000},
                    "turn_detection": {"type": "semantic_vad"},
                },
                "output": {
                    "format": {"type": "audio/pcm"},
                    "voice": "marin",
                },
            },
            "instructions": "You are a concise voice assistant.",
        },
    })),
    on_message=lambda ws, msg: print(json.loads(msg)),
)
ws.run_forever()
```

## Audio input (server → OpenAI)

### Chunked streaming

```javascript
ws.send(JSON.stringify({
  type: "input_audio_buffer.append",
  audio: base64Pcm16,        // ≤ 15 MB per chunk
}));
```

Send chunks roughly every 20–100 ms for natural responsiveness. Each chunk must be **base64-encoded** audio bytes in the format you declared in `audio.input.format`. The default is 24 kHz mono 16-bit PCM, little-endian.

### Float32 → PCM16 helper (Node)

```javascript
function float32ToPcm16(float32) {
  const out = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]));
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return out;
}

function pcm16ToBase64(int16) {
  return Buffer.from(int16.buffer).toString("base64");
}
```

### Float32 → PCM16 helper (Python)

```python
import base64, struct

def float32_to_pcm16_b64(samples):
    pcm = b"".join(
        struct.pack("<h", int(max(-1.0, min(1.0, s)) * 32767))
        for s in samples
    )
    return base64.b64encode(pcm).decode("ascii")
```

### Commit and trigger

With VAD enabled, the server commits the buffer automatically when it detects end-of-turn. With VAD disabled (push-to-talk):

```javascript
ws.send(JSON.stringify({ type: "input_audio_buffer.commit" }));
ws.send(JSON.stringify({ type: "response.create" }));
```

## Audio output (OpenAI → server)

Listen for `response.output_audio.delta` events. The `delta` field contains base64-encoded audio in the declared output format.

```javascript
ws.on("message", (raw) => {
  const event = JSON.parse(raw.toString());

  if (event.type === "response.output_audio.delta") {
    const chunk = Buffer.from(event.delta, "base64");
    // write to a file, stream to a phone leg, push to a player
  }

  if (event.type === "response.output_audio_transcript.delta") {
    process.stdout.write(event.delta);
  }

  if (event.type === "response.done") {
    // turn finished — usage stats live on event.response.usage
  }
});
```

**`response.output_audio.done` and `response.done` do not contain audio bytes**, only metadata. The audio is always in the `delta` events.

## Manual interruption + truncation

WebRTC handles this for you. WebSocket does not. Recipe:

1. Listen for `input_audio_buffer.speech_started`. When you see it, stop client-side playback immediately.
2. Count how many milliseconds of the model's previous response you actually played back.
3. Send `conversation.item.truncate` with that offset:

```json
{
  "type": "conversation.item.truncate",
  "item_id": "item_1234",
  "content_index": 0,
  "audio_end_ms": 1500
}
```

The unplayed portion of the response is dropped from the conversation, and the transcript for that portion is also dropped. The model now understands what the user actually heard.

## Push-to-talk

```javascript
// Setup
await sessionUpdate({ audio: { input: { turn_detection: null } } });

function onPushDown() {
  // Stop playback + truncate if a response is in progress.
  ws.send(JSON.stringify({ type: "response.cancel" }));
  ws.send(JSON.stringify({
    type: "conversation.item.truncate",
    item_id: lastResponseItemId,
    content_index: 0,
    audio_end_ms: playedMs,
  }));
  startMicCapture();
}

function onPushUp() {
  stopMicCapture();
  ws.send(JSON.stringify({ type: "input_audio_buffer.commit" }));
  ws.send(JSON.stringify({ type: "response.create" }));
}
```

## Error handling

The server emits `error` events when something goes wrong. Common patterns:

```json
{
  "type": "error",
  "code": "invalid_value",
  "message": "Invalid value: 'scooby.dooby.doo' …",
  "param": "type",
  "event_id": "my_awesome_event"
}
```

Set a unique `event_id` on every client-sent event so you can correlate errors back to the source:

```javascript
ws.send(JSON.stringify({
  event_id: crypto.randomUUID(),
  type: "session.update",
  session: { /* … */ },
}));
```

## Reconnects + 60-minute limit

Sessions cap at **60 minutes**. To run longer:

1. Listen for `session.expires_at` (if available) or track session age.
2. Before expiry, persist conversation context (or use a server-side summary).
3. Open a fresh socket, re-`session.update`, re-seed context via `conversation.item.create` items.

Plan reconnect logic for network blips too — wrap your `ws.on("close")` handler with exponential backoff and re-initialize from your stored state.

## Common mistakes

- **Sending 48 kHz audio** when `format.rate` is 24 kHz. The server expects exactly the rate you declared.
- **Sending raw bytes** instead of base64. The `audio` field is always a base64 string.
- **Forgetting `response.create`** with VAD disabled. The model never speaks.
- **Treating `response.output_audio.done` as containing audio.** It doesn't — only metadata.
- **Skipping `conversation.item.truncate`** on interruption. The model believes the user heard things they didn't.
- **Sending `OpenAI-Beta: realtime=v1`** — drop it on GA.
- **Using the browser `WebSocket` API to connect from a normal browser tab.** Use WebRTC instead.

## See also

- `examples/websocket-voice-agent.py` / `.js` / `.ts` — server-side WebSocket voice agent.
- `examples/transcription-session.py` / `.ts` — transcription session via WebSocket.
- `references/02-voice-agents.md` — full session shape.
- `references/09-conversation-lifecycle.md` — exhaustive event reference.
