// Browser voice agent — Node.js server.
//
// Implements the recommended "unified" WebRTC pattern from
// references/06-transport-webrtc.md: the browser POSTs its SDP offer here,
// this server forwards it to /v1/realtime/calls with the session config and
// the standard API key, and replies to the browser with OpenAI's SDP answer.
//
// REQUIREMENTS
// ------------
// Env vars:
//   OPENAI_API_KEY     Your OpenAI API key with Realtime access.
//   PORT (optional)    HTTP port. Defaults to 3000.
// Node: >= 18 (global fetch + FormData).
// npm packages: express
// Browser: any modern Chromium/Firefox/Safari with a working microphone.
// HTTPS: not required on localhost, but required when serving the page from a
//   remote host so the browser will grant getUserMedia.
//
// INSTALL
// -------
//   npm install express
//
// RUN
// ---
//   node server.js
//   # Then open http://localhost:3000 in a browser and click "Start session".
//
// VERIFY (without a browser)
// --------------------------
//   This server's POST /session endpoint can be exercised with a hand-crafted
//   SDP offer via curl, but the round trip is most useful from the browser.
//
// Pairs with: references/06-transport-webrtc.md
// Live-tested: server-side endpoint smoke-tested via curl. Browser end-to-end
//              requires manual test (see examples/README.md).

import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("Missing OPENAI_API_KEY environment variable.");
  process.exit(1);
}

const app = express();
app.use(express.text({ type: ["application/sdp", "text/plain"] }));
app.use(express.static(__dirname));

// Session configuration is locked in by the server. The browser cannot
// override these settings — that's a feature.
const sessionConfig = JSON.stringify({
  type: "realtime",
  model: "gpt-realtime-2",
  output_modalities: ["audio"],
  audio: {
    output: { voice: "marin" },
  },
  instructions:
    "You are a helpful voice assistant. Greet the user briefly when the call starts, " +
    "then answer their question concisely.",
});

app.post("/session", async (req, res) => {
  try {
    const fd = new FormData();
    fd.set("sdp", req.body);
    fd.set("session", sessionConfig);

    const r = await fetch("https://api.openai.com/v1/realtime/calls", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "OpenAI-Safety-Identifier": "openai-audio-skill-tests",
      },
      body: fd,
    });

    if (!r.ok) {
      const errText = await r.text();
      console.error("realtime/calls failed:", r.status, errText);
      return res.status(r.status).send(errText);
    }

    // The Location header carries the call_id you can use for sideband control.
    const location = r.headers.get("Location") ?? "";
    const callId = location.split("/").pop() ?? "";
    if (callId) res.setHeader("X-Call-Id", callId);

    res.setHeader("Content-Type", "application/sdp");
    res.send(await r.text());
  } catch (err) {
    console.error("Session error:", err);
    res.status(500).send("session-failed");
  }
});

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
  console.log(`WebRTC voice-agent server: http://localhost:${port}`);
});
