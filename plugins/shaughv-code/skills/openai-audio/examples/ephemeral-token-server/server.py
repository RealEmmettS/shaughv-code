"""Ephemeral token server — Python / Flask.

Mints short-lived client secrets (`ek_...`) for browser/mobile clients to use
when connecting to the OpenAI Realtime API.

REQUIREMENTS
------------
Env vars:
    OPENAI_API_KEY     Your OpenAI API key with Realtime access.
    PORT (optional)    HTTP port. Defaults to 3000.
Python: >= 3.9
Packages: flask, requests

INSTALL
-------
    pip install flask requests

RUN
---
    python server.py

VERIFY
------
    curl http://localhost:3000/token
    # Look for "client_secret": { "value": "ek_..." } in the JSON response.

Pairs with: references/06-transport-webrtc.md
Live-tested: yes (see examples/README.md).
"""

import json
import os
import sys

import requests
from flask import Flask, jsonify

API_KEY = os.environ.get("OPENAI_API_KEY")
if not API_KEY:
    print("Missing OPENAI_API_KEY environment variable.", file=sys.stderr)
    sys.exit(1)

app = Flask(__name__)

SESSION_CONFIG = {
    "session": {
        "type": "realtime",
        "model": "gpt-realtime-2",
        "audio": {"output": {"voice": "marin"}},
        "instructions": "You are a helpful voice assistant. Speak briefly and clearly.",
    }
}


@app.get("/token")
def token():
    try:
        r = requests.post(
            "https://api.openai.com/v1/realtime/client_secrets",
            headers={
                "Authorization": f"Bearer {API_KEY}",
                "Content-Type": "application/json",
                # If you map end users to stable hashed IDs, set the safety
                # identifier here. The token will be bound to it.
                "OpenAI-Safety-Identifier": "hashed-user-id",
            },
            data=json.dumps(SESSION_CONFIG),
            timeout=30,
        )
    except requests.RequestException as exc:
        app.logger.exception("Token request failed")
        return jsonify({"error": f"Token request failed: {exc}"}), 500

    if not r.ok:
        app.logger.error("client_secrets failed: %s %s", r.status_code, r.text)
        return r.text, r.status_code, {"Content-Type": "application/json"}

    return jsonify(r.json())


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 3000))
    print(f"Token server listening on http://localhost:{port}")
    print(f"Try: curl http://localhost:{port}/token")
    app.run(host="0.0.0.0", port=port)
