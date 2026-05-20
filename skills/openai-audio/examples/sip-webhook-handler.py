"""Flask webhook handler for SIP realtime.call.incoming events.

Accepts the incoming call, opens a sideband WebSocket onto the session, sends
an initial greeting, and logs events as the call proceeds.

REQUIREMENTS
------------
Env vars:
    OPENAI_API_KEY          Your OpenAI API key with Realtime + SIP access.
    OPENAI_WEBHOOK_SECRET   Found at platform.openai.com → Settings → Webhooks.
    PORT (optional)         HTTP port. Defaults to 8000.
Python: >= 3.9
Packages: flask, openai, websockets, requests
Provider: A SIP trunking provider (Twilio Elastic SIP, Telnyx, etc.) pointed at
    ``sip:$PROJECT_ID@sip.api.openai.com;transport=tls``. Find PROJECT_ID at
    platform.openai.com → Settings → Project → General (prefixed ``proj_``).
OpenAI webhook: configured in Project Settings → Webhooks, pointed at
    ``https://your-public-host/openai/webhook``. For local testing use a
    tunnel like ngrok or Cloudflare Tunnel.

INSTALL
-------
    pip install flask openai websockets requests

RUN
---
    python sip-webhook-handler.py

VERIFY (offline, no real SIP trunk)
-----------------------------------
    With OPENAI_WEBHOOK_SECRET unset, a manual signature-verification path is
    still possible: see examples/README.md for the ``offline smoke test``
    snippet. With a real trunk, dial the configured number; the agent should
    accept and greet you.

Pairs with: references/08-transport-sip.md, references/13-server-side-controls.md
Live-tested: webhook handler structure verified offline (no live SIP trunk
             available in this skill's test environment). Smoke-tested by
             POSTing a hand-signed test event — see examples/README.md.
"""

from __future__ import annotations

import asyncio
import json
import os
import sys
import threading

import requests
import websockets
from flask import Flask, Response, request
from openai import InvalidWebhookSignatureError, OpenAI

API_KEY = os.environ.get("OPENAI_API_KEY")
WEBHOOK_SECRET = os.environ.get("OPENAI_WEBHOOK_SECRET")
if not API_KEY:
    print("Missing OPENAI_API_KEY.", file=sys.stderr)
    sys.exit(1)
if not WEBHOOK_SECRET:
    print("Missing OPENAI_WEBHOOK_SECRET.", file=sys.stderr)
    sys.exit(1)

AUTH_HEADER = {"Authorization": f"Bearer {API_KEY}"}

# Session configuration passed to /accept. Adjust to your product.
ACCEPT_BODY = {
    "type": "realtime",
    "model": "gpt-realtime-2",
    "audio": {"output": {"voice": "marin"}},
    "instructions": (
        "You are Alex, a friendly concierge for Example Corp. "
        "Greet the caller briefly, then ask how you can help."
    ),
}

# Optional: a server-controlled greeting kicked off via sideband.
GREETING = {
    "type": "response.create",
    "response": {
        "instructions": (
            "Say: 'Thanks for calling Example Corp. This is Alex. "
            "How can I help today?'"
        )
    },
}

app = Flask(__name__)
client = OpenAI(webhook_secret=WEBHOOK_SECRET)


async def control(call_id: str) -> None:
    """Open the sideband WebSocket and drive the conversation."""
    url = f"wss://api.openai.com/v1/realtime?call_id={call_id}"
    try:
        async with websockets.connect(url, additional_headers=AUTH_HEADER) as ws:
            await ws.send(json.dumps(GREETING))
            async for raw in ws:
                event = json.loads(raw)
                etype = event.get("type", "")
                # Dispatch tool calls, log transcripts, etc.
                if etype == "error":
                    print("[sideband error]", event, file=sys.stderr)
                elif etype.startswith("response.output_audio_transcript"):
                    if etype.endswith(".done"):
                        print("[assistant]", event.get("transcript", ""))
                elif etype == "response.done":
                    usage = event.get("response", {}).get("usage", {})
                    if usage:
                        print("[usage]", usage)
    except Exception as exc:
        print("[sideband closed]", exc, file=sys.stderr)


def spawn_sideband(call_id: str) -> None:
    threading.Thread(target=lambda: asyncio.run(control(call_id)), daemon=True).start()


@app.post("/openai/webhook")
def webhook() -> Response:
    try:
        event = client.webhooks.unwrap(request.data, request.headers)
    except InvalidWebhookSignatureError:
        return Response("invalid signature", status=400)

    if event.type == "realtime.call.incoming":
        call_id = event.data.call_id
        try:
            requests.post(
                f"https://api.openai.com/v1/realtime/calls/{call_id}/accept",
                headers={**AUTH_HEADER, "Content-Type": "application/json"},
                json=ACCEPT_BODY,
                timeout=10,
            )
        except requests.RequestException as exc:
            print("[accept failed]", exc, file=sys.stderr)
            return Response("accept-failed", status=500)
        spawn_sideband(call_id)

    return Response(status=200)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print(f"SIP webhook handler on http://0.0.0.0:{port}/openai/webhook")
    app.run(host="0.0.0.0", port=port)
