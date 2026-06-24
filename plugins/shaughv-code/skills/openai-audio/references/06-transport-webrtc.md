# 06 — Transport: WebRTC

**Use WebRTC for browser and mobile clients that capture or play audio directly.** WebRTC handles input buffering, interruption, and unplayed-audio truncation for you. It's the right choice for the vast majority of consumer-facing voice apps.

The OpenAI Realtime API exposes WebRTC two ways:

| Pattern | Browser POSTs SDP to | API key in browser? | When to use |
|---|---|---|---|
| **Unified `/v1/realtime/calls`** | Your server, which forwards to OpenAI | No (server uses standard API key) | **Default.** Server stays in the auth path; simplest to add session validation, observability, billing controls. |
| **Ephemeral-key client_secrets** | Directly to `https://api.openai.com/v1/realtime/calls` with an ephemeral token | Yes, but as an `ek_…` ephemeral token | When you want the server out of the media path or you need to mint per-user short-lived credentials. |

Both end up at the same OpenAI endpoint. They differ in who holds the auth secret and whether the SDP exchange round-trips through your server.

## Unified path: server-mediated SDP

This is the recommended default. The browser:

1. Creates an `RTCPeerConnection`.
2. Attaches mic input + a `pc.ontrack` handler for remote audio.
3. Creates a data channel for events.
4. Posts its SDP offer to **your server**.
5. Receives the SDP answer from your server.

The server forwards the SDP to OpenAI with the session config bundled in the same multipart request. Your standard API key never leaves the server.

### Server (Node/Express)

```javascript
import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.text({ type: ["application/sdp", "text/plain"] }));

const sessionConfig = JSON.stringify({
  type: "realtime",
  model: "gpt-realtime-2",
  audio: { output: { voice: "marin" } },
  instructions: "You are a helpful voice assistant. Speak briefly.",
});

app.post("/session", async (req, res) => {
  const fd = new FormData();
  fd.set("sdp", req.body);
  fd.set("session", sessionConfig);

  const r = await fetch("https://api.openai.com/v1/realtime/calls", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "OpenAI-Safety-Identifier": "hashed-user-id",
    },
    body: fd,
  });

  // The Location header carries the call_id you can use for sideband control.
  const callId = r.headers.get("Location")?.split("/").pop();
  res.setHeader("X-Call-Id", callId ?? "");
  res.send(await r.text());
});

app.listen(3000);
```

### Browser

```javascript
const pc = new RTCPeerConnection();

// Play remote audio from the model
const audio = document.createElement("audio");
audio.autoplay = true;
pc.ontrack = (e) => { audio.srcObject = e.streams[0]; };

// Add the microphone input
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
pc.addTrack(stream.getTracks()[0]);

// Data channel for client/server events (session.update, response.create, etc.)
const dc = pc.createDataChannel("oai-events");

// Offer / answer dance, via your server
const offer = await pc.createOffer();
await pc.setLocalDescription(offer);

const r = await fetch("/session", {
  method: "POST",
  headers: { "Content-Type": "application/sdp" },
  body: offer.sdp,
});

await pc.setRemoteDescription({ type: "answer", sdp: await r.text() });
```

The browser never sees the API key. The server controls session configuration. The data channel is used for the same client/server JSON events as a WebSocket session.

## Ephemeral-key path

If you want the browser to talk directly to OpenAI (no server in the media path), mint an ephemeral token first, then POST the SDP directly:

### Server (token minter)

```javascript
import express from "express";
import fetch from "node-fetch";

const app = express();

const sessionConfig = JSON.stringify({
  session: {
    type: "realtime",
    model: "gpt-realtime-2",
    audio: { output: { voice: "marin" } },
  },
});

app.get("/token", async (_req, res) => {
  const r = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
      "OpenAI-Safety-Identifier": "hashed-user-id",
    },
    body: sessionConfig,
  });
  res.json(await r.json());
});

app.listen(3000);
```

The response contains `client_secret.value`, an `ek_…` token. **Bind the safety identifier on this server-side request** — the token carries the safety binding, so the browser doesn't (and shouldn't) send the header again.

### Browser

```javascript
const { value: EPHEMERAL_KEY } = (await (await fetch("/token")).json()).client_secret;

const pc = new RTCPeerConnection();
pc.ontrack = (e) => { document.getElementById("audio").srcObject = e.streams[0]; };

const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
pc.addTrack(stream.getTracks()[0]);
const dc = pc.createDataChannel("oai-events");

const offer = await pc.createOffer();
await pc.setLocalDescription(offer);

const r = await fetch("https://api.openai.com/v1/realtime/calls", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${EPHEMERAL_KEY}`,
    "Content-Type": "application/sdp",
  },
  body: offer.sdp,
});

await pc.setRemoteDescription({ type: "answer", sdp: await r.text() });
```

## Sending and receiving events

The data channel is full-duplex JSON over WebRTC. Send `session.update`, `response.create`, `conversation.item.*`, etc., and listen for server events the same way you would on a WebSocket connection:

```javascript
dc.addEventListener("open", () => {
  dc.send(JSON.stringify({
    type: "session.update",
    session: {
      type: "realtime",
      instructions: "Update mid-call: respond briefly.",
    },
  }));
});

dc.addEventListener("message", (e) => {
  const event = JSON.parse(e.data);
  // …
});
```

WebRTC handles raw audio for you — you do **not** need to send `input_audio_buffer.append` for mic audio. The peer connection's audio track carries it directly. You also don't need to play `response.output_audio.delta` chunks — they're delivered as a remote audio track.

## Higher-level alternative: the Agents SDK

The `@openai/agents/realtime` SDK wraps the SDP dance and exposes `RealtimeAgent` + `RealtimeSession`:

```javascript
import { RealtimeAgent, RealtimeSession } from "@openai/agents/realtime";

const agent = new RealtimeAgent({
  name: "Assistant",
  instructions: "You are a helpful voice assistant.",
});

const session = new RealtimeSession(agent, { model: "gpt-realtime-2" });

await session.connect({ apiKey: EPHEMERAL_KEY });
```

Trade-off: less control over the SDP and events, faster to ship. See `examples/agents-sdk-browser/` for a runnable example. For full control over events, sideband, or non-standard transports, prefer the raw-API path.

## Sideband control

When using the unified path, your server has the `call_id` from the `Location` header. Use it to open a WebSocket to `wss://api.openai.com/v1/realtime?call_id=<call_id>` from the backend and inject session updates, listen for events, or run tool logic privately. See `references/13-server-side-controls.md`.

## Audio + permissions tips

- Always check `navigator.mediaDevices.getUserMedia` errors and surface them to the user (denied permission, no mic, busy mic).
- Use `track.applyConstraints({ echoCancellation: true, noiseSuppression: true })` for default-on echo cancellation in browser microphones.
- For mute, call `audioTrack.enabled = false` rather than removing the track.
- Detect connection loss with `pc.connectionState === "failed"` and reconnect after a fresh `RTCPeerConnection`.

## See also

- `examples/webrtc-browser-voice-agent/` — full unified-path example with server + browser.
- `examples/agents-sdk-browser/` — same goal via `@openai/agents/realtime`.
- `references/13-server-side-controls.md` — sideband WebSocket via `call_id`.
- `references/09-conversation-lifecycle.md` — what events to expect on the data channel.
