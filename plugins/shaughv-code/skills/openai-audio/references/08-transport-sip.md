# 08 — Transport: SIP (telephony)

**Use SIP when the user is on a phone call.** OpenAI provides a SIP endpoint that bridges Realtime sessions to inbound/outbound calls through a SIP trunking provider (Twilio Elastic SIP Trunking, Telnyx, etc.). Confirm model support before using SIP for translation or transcription — voice-agent (`gpt-realtime-2`) is the primary supported workflow.

## High-level flow

1. **Provision SIP trunk** at your provider; point it at OpenAI's SIP endpoint.
2. **Configure a webhook** in your project settings on `platform.openai.com` → Settings → Webhooks. It must accept `realtime.call.incoming` events.
3. **Caller dials your phone number.** SIP traffic hits OpenAI; OpenAI POSTs your webhook.
4. **Webhook decides:** accept, reject, refer, or hang up. For accept, your handler POSTs to `/v1/realtime/calls/{call_id}/accept` with the session config.
5. **Open a sideband WebSocket** to `wss://api.openai.com/v1/realtime?call_id={call_id}` to control the session — register tool handlers, listen for events, update instructions mid-call.
6. **Conversation flows.** Caller's audio → Realtime → model speech → caller's earpiece.
7. **End of call.** Either side hangs up, or your server calls `/hangup`.

## Configure the SIP URI

Point your SIP trunk at:

```
sip:$PROJECT_ID@sip.api.openai.com;transport=tls
```

Find `$PROJECT_ID` (prefixed `proj_`) in **Settings → Project → General** on `platform.openai.com`.

## Incoming webhook payload

When a call arrives, OpenAI POSTs your webhook:

```http
POST https://your-app.example.com/openai/webhook
user-agent: OpenAI/1.0 (+https://platform.openai.com/docs/webhooks)
content-type: application/json
webhook-id: wh_685342e6c53c8190a1be43f081506c52
webhook-timestamp: 1750287078
webhook-signature: v1,K5oZfzN95Z9UVu1EsfQmfVNQhnkZ2pj9o9NDN/H/pI4=

{
  "object": "event",
  "id": "evt_685343a1381c819085d44c354e1b330e",
  "type": "realtime.call.incoming",
  "created_at": 1750287018,
  "data": {
    "call_id": "rtc_u1_9c6574da8b8a41a18da9308f4ad974ce",
    "sip_headers": [
      { "name": "From", "value": "sip:+14155551212@sip.example.com" },
      { "name": "To",   "value": "sip:+18005551212@sip.example.com" },
      { "name": "Call-ID", "value": "03782086-4ce9-44bf-8b0d-4e303d2cc590" }
    ]
  }
}
```

**Verify the webhook signature.** The OpenAI SDK provides `client.webhooks.unwrap(body, headers)` which raises `InvalidWebhookSignatureError` if signatures don't match. Configure `webhook_secret` on the client (or `OPENAI_WEBHOOK_SECRET` env var).

## Accept a call

```bash
curl -X POST "https://api.openai.com/v1/realtime/calls/$CALL_ID/accept" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
        "type": "realtime",
        "model": "gpt-realtime-2",
        "instructions": "You are Alex, a friendly concierge for Example Corp.",
        "audio": {
          "output": { "voice": "marin" }
        }
      }'
```

The JSON body uses the same shape as `/v1/realtime/client_secrets`. Set model, voice, tools, instructions, etc., here. A `200 OK` means the SIP leg is ringing and the realtime session is being established.

## Reject a call

```bash
curl -X POST "https://api.openai.com/v1/realtime/calls/$CALL_ID/reject" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"status_code": 486}'
```

`status_code` is the SIP response code sent back to the carrier. Common choices:

| Code | Meaning |
|---|---|
| `486` | Busy here |
| `603` | Decline (default if omitted) |
| `404` | Not found |
| `488` | Not acceptable here |

## Refer (cold transfer)

Transfer the live call to another SIP URI:

```bash
curl -X POST "https://api.openai.com/v1/realtime/calls/$CALL_ID/refer" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"target_uri": "tel:+14155550123"}'
```

`target_uri` accepts `tel:…` or `sip:…@host`. OpenAI relays a SIP REFER to the carrier; the downstream system handles the actual transfer.

## Hang up

Either side ending the call works, but you can force termination from your server:

```bash
curl -X POST "https://api.openai.com/v1/realtime/calls/$CALL_ID/hangup" \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

This endpoint works for both SIP and WebRTC realtime sessions.

## Sideband WebSocket

Once a call is accepted, open a WebSocket to control the session:

```
wss://api.openai.com/v1/realtime?call_id=rtc_…
```

The `model` query parameter is **not needed** — the model was set during `/accept`. Authenticate with your standard API key.

```python
import asyncio, json, os, websockets

async def control_call(call_id: str):
    async with websockets.connect(
        f"wss://api.openai.com/v1/realtime?call_id={call_id}",
        additional_headers={"Authorization": f"Bearer {os.environ['OPENAI_API_KEY']}"},
    ) as ws:
        await ws.send(json.dumps({
            "type": "response.create",
            "response": {
                "instructions": "Greet the caller: 'Thanks for calling Example Corp. How can I help?'",
            },
        }))

        async for raw in ws:
            event = json.loads(raw)
            # Dispatch tool calls, log transcripts, etc.
```

Use the same client/server event surface from `references/09-conversation-lifecycle.md`. You can run tools, update instructions, listen to transcripts, generate out-of-band classification responses, etc.

## Allowlist (optional)

If you need to allowlist OpenAI SIP traffic at your firewall, `sip.api.openai.com` uses GeoIP routing. Current IP ranges:

| Region | Range |
|---|---|
| northeurope | `13.79.45.80/28` |
| southcentralus | `23.98.140.64/28` |
| eastus2 | `40.67.149.176/28` |
| westus | `40.83.204.240/28` |

## Webhook handler (Python Flask example)

```python
from flask import Flask, request, Response
from openai import OpenAI, InvalidWebhookSignatureError
import asyncio, json, os, requests, threading
import websockets

app = Flask(__name__)
client = OpenAI(webhook_secret=os.environ["OPENAI_WEBHOOK_SECRET"])
AUTH = {"Authorization": f"Bearer {os.environ['OPENAI_API_KEY']}"}

ACCEPT_BODY = {
    "type": "realtime",
    "model": "gpt-realtime-2",
    "instructions": "You are a friendly support agent.",
    "audio": {"output": {"voice": "marin"}},
}


async def control(call_id: str):
    async with websockets.connect(
        f"wss://api.openai.com/v1/realtime?call_id={call_id}",
        additional_headers=AUTH,
    ) as ws:
        await ws.send(json.dumps({
            "type": "response.create",
            "response": {"instructions": "Greet the caller briefly."},
        }))
        async for raw in ws:
            event = json.loads(raw)
            # log/handle events
            print(event.get("type"))


@app.post("/openai/webhook")
def webhook():
    try:
        event = client.webhooks.unwrap(request.data, request.headers)
    except InvalidWebhookSignatureError:
        return Response("Invalid signature", status=400)

    if event.type == "realtime.call.incoming":
        requests.post(
            f"https://api.openai.com/v1/realtime/calls/{event.data.call_id}/accept",
            headers={**AUTH, "Content-Type": "application/json"},
            json=ACCEPT_BODY,
        )
        threading.Thread(
            target=lambda: asyncio.run(control(event.data.call_id)),
            daemon=True,
        ).start()

    return Response(status=200)
```

A runnable, more thorough version lives in `examples/sip-webhook-handler.py`.

## Production checklist

- [ ] Webhook signature verification is **mandatory** before acting on a call.
- [ ] Set a low timeout on the `/accept` request (5–10 s). If it fails, fall back to reject with `503`.
- [ ] Pre-warm tool dependencies (DB connections, MCP clients) at process start so they don't add latency to the first turn.
- [ ] Set `OpenAI-Safety-Identifier` on the `/accept` and sideband WebSocket if you can map a caller to a user.
- [ ] Provide a clear AI-disclosure prompt in `instructions` for jurisdictions that require it.
- [ ] Handle DTMF / number entry as plain audio — the model can transcribe digits dictated naturally. For high-precision input, fall back to your IVR layer and pause the agent via `response.cancel`.

## Common mistakes

- **Forgetting signature verification.** Replay attacks can run up bills and route calls to attacker-controlled URIs.
- **Sending `model` to the sideband WebSocket.** The model was set on accept — passing it again is ignored at best.
- **Replaying old `call_id`s.** Each is single-use. Get a fresh one from the next webhook.
- **Long blocking work in the webhook handler.** Spawn a background task (thread / async task) and respond `200` immediately.
- **Using `gpt-realtime-translate` on a SIP call.** SIP is supported on the conversational endpoint; translation may not be supported there. Confirm before relying on it.

## See also

- `examples/sip-webhook-handler.py` — full Flask example.
- `references/09-conversation-lifecycle.md` — sideband event reference.
- `references/13-server-side-controls.md` — broader patterns for backend-controlled sessions.
- [Twilio integration walkthrough](https://www.twilio.com/en-us/blog/developers/tutorials/product/openai-realtime-api-elastic-sip-trunking) — Twilio Elastic SIP Trunking setup.
