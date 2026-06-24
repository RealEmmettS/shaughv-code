# 13 — Server-side controls (webhooks and sideband)

For production voice agents you usually want tool logic, business rules, and observability **on your server**, not in the client. The Realtime API supports two patterns:

| Pattern | Use when |
|---|---|
| **Sideband WebSocket** | A user-facing client (browser via WebRTC, or phone via SIP) owns the media. Your server attaches a second WebSocket to the same session to monitor and control it. |
| **Webhooks** | Server reacts to events that happen outside an active client connection (e.g., `realtime.call.incoming` for SIP). |

Both rely on a stable `call_id`. Once you have it, the URL `wss://api.openai.com/v1/realtime?call_id=<call_id>` opens a server WebSocket onto the live session.

## Sideband with WebRTC

When you mediate the SDP exchange (recommended unified path in `references/06-transport-webrtc.md`), the `POST /v1/realtime/calls` response carries a `Location` header pointing at the new call:

```
Location: /v1/realtime/calls/rtc_u1_9c6574da8b8a41a18da9308f4ad974ce
```

Extract the `call_id` and either:

- Open the sideband WebSocket synchronously in the same request handler (if your tool flow is fast), or
- Hand the `call_id` to a worker that owns the session lifecycle.

```javascript
import express from "express";
import fetch from "node-fetch";
import WebSocket from "ws";

const app = express();
app.use(express.text({ type: ["application/sdp", "text/plain"] }));

app.post("/session", async (req, res) => {
  const fd = new FormData();
  fd.set("sdp", req.body);
  fd.set("session", JSON.stringify({
    type: "realtime",
    model: "gpt-realtime-2",
    audio: { output: { voice: "marin" } },
  }));

  const r = await fetch("https://api.openai.com/v1/realtime/calls", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "OpenAI-Safety-Identifier": "hashed-user-id",
    },
    body: fd,
  });

  const callId = r.headers.get("Location")?.split("/").pop();
  res.send(await r.text());

  if (callId) attachSideband(callId);
});

function attachSideband(callId) {
  const ws = new WebSocket(`wss://api.openai.com/v1/realtime?call_id=${callId}`, {
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
  });

  ws.on("open", () => {
    ws.send(JSON.stringify({
      type: "session.update",
      session: {
        tools: [{
          type: "function",
          name: "lookup_order",
          description: "Look up an order by order number.",
          parameters: {
            type: "object",
            properties: { order_number: { type: "string" } },
            required: ["order_number"],
          },
        }],
      },
    }));
  });

  ws.on("message", (raw) => {
    const event = JSON.parse(raw.toString());

    if (event.type === "response.output_item.done" && event.item.type === "function_call") {
      runTool(event.item, ws);
    }

    if (event.type === "response.done") {
      logUsage(event.response.usage);
    }
  });
}
```

The browser never sees the tools, the tool implementations, or the system prompts. It only sees the WebRTC media + the public-facing events your server chooses to forward.

## Sideband with SIP

SIP sessions never reach the browser. Your webhook gets the `call_id` directly from the `realtime.call.incoming` payload (see `references/08-transport-sip.md`). Open the sideband WebSocket inside the same handler:

```python
async def control(call_id: str):
    async with websockets.connect(
        f"wss://api.openai.com/v1/realtime?call_id={call_id}",
        additional_headers={"Authorization": f"Bearer {os.environ['OPENAI_API_KEY']}"},
    ) as ws:
        await ws.send(json.dumps({
            "type": "session.update",
            "session": { "tools": [/* … */] },
        }))
        async for raw in ws:
            await handle_event(json.loads(raw))
```

When the SIP call hangs up, the server WebSocket closes too.

## Webhook events

The webhook surface starts with `realtime.call.incoming` for SIP. Future events may extend the surface; configure the webhook in your project settings on `platform.openai.com`.

Every webhook delivery includes:

- `webhook-id` — unique delivery ID for idempotency.
- `webhook-timestamp` — Unix timestamp.
- `webhook-signature` — HMAC signature in `v1,<base64>` format.

**Verify the signature before acting.** The OpenAI SDKs ship a helper:

```python
from openai import OpenAI, InvalidWebhookSignatureError

client = OpenAI(webhook_secret=os.environ["OPENAI_WEBHOOK_SECRET"])

try:
    event = client.webhooks.unwrap(request.data, request.headers)
except InvalidWebhookSignatureError:
    return Response("invalid signature", status=400)
```

```javascript
import OpenAI from "openai";

const client = new OpenAI({ webhookSecret: process.env.OPENAI_WEBHOOK_SECRET });

try {
  const event = client.webhooks.unwrap(rawBody, req.headers);
  // …
} catch (err) {
  res.status(400).send("invalid signature");
  return;
}
```

Treat the webhook handler as a thin dispatcher. Don't block on long work — kick the work to a background task and respond `200 OK` immediately.

## Patterns

### Hide all tool logic from the client

The unified WebRTC path + sideband gives you full server control. The browser only knows there's a voice agent; the tools, prompts, and policies stay private.

### Mid-call session changes

Send `session.update` from the sideband WebSocket to swap instructions, tools, or settings without re-establishing the media connection. Useful for state-machine driven flows ("verifying" → "diagnosing" → "resolving").

### Mid-call moderation

Open an out-of-band response from the sideband WebSocket to classify user input or moderate model output, then act (`response.cancel`, `conversation.item.truncate`, `response.create` with a corrective instruction).

### Tool execution

The model's `function_call` items arrive on the sideband WebSocket. Run the tool server-side and reply with `function_call_output`. The user never sees the implementation.

### Cost tracking

Read `response.done.usage` for input/output/cached token counts. Log per session, per user, per tool.

## Important constraints

- The sideband WebSocket and the media connection share the same Realtime session. They are not independent — events from one are visible to the other.
- One sideband WebSocket per session is the typical pattern. Don't open many parallel sidebands; the session state stays consistent only if a single coordinator owns control events.
- Sessions still cap at **60 minutes**. The sideband doesn't extend that.
- If the media connection drops, the session ends and the sideband closes too.

## Common mistakes

- Trying to override `voice` on the sideband after audio has already played — voice is locked. Set it on the initial `/accept` or `client_secrets` request.
- Forwarding raw tool-call arguments to the browser. Keep them server-side.
- Forgetting to verify webhook signatures. Replay attacks and forged events can run up bills and route calls to attacker-controlled URIs.
- Blocking the webhook handler with long work. Always respond `200` immediately.

## See also

- `references/06-transport-webrtc.md` — getting the `call_id` from `/v1/realtime/calls`.
- `references/08-transport-sip.md` — webhook flow + accept/reject/refer/hangup.
- `references/12-tools-and-mcp.md` — what to wire up on the sideband.
- `examples/sideband-server-control.js` — runnable example.
