// Ephemeral token server — Node.js / Express.
//
// Mints short-lived client secrets (`ek_…`) for browser/mobile clients to use
// when connecting to the OpenAI Realtime API. The browser never sees the
// standard OPENAI_API_KEY — only the ephemeral token, which is bound to the
// session config you specify here.
//
// REQUIREMENTS
// ------------
// Env vars:
//   OPENAI_API_KEY     Your OpenAI API key with Realtime access.
//   PORT (optional)    HTTP port. Defaults to 3000.
// Node: >= 18 (global fetch + FormData).
// npm packages: express
//
// INSTALL
// -------
//   npm install express
//
// RUN
// ---
//   node server.js
//
// VERIFY
// ------
//   curl http://localhost:3000/token
//   # Look for "client_secret": { "value": "ek_..." } in the JSON response.
//
// Pairs with: references/06-transport-webrtc.md
// Live-tested: yes (see examples/README.md).

import express from "express";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("Missing OPENAI_API_KEY environment variable.");
  process.exit(1);
}

const app = express();

// The session config bound to every token this server mints. Adjust to your
// product: model, voice, instructions, tools, etc.
const sessionConfig = JSON.stringify({
  session: {
    type: "realtime",
    model: "gpt-realtime-2",
    audio: {
      output: { voice: "marin" },
    },
    instructions: "You are a helpful voice assistant. Speak briefly and clearly.",
  },
});

app.get("/token", async (_req, res) => {
  try {
    const response = await fetch(
      "https://api.openai.com/v1/realtime/client_secrets",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          // If you map end users to stable hashed IDs, set the safety
          // identifier here. The token will be bound to it for the life of the
          // session, so the browser doesn't need to send it again.
          "OpenAI-Safety-Identifier": "hashed-user-id",
        },
        body: sessionConfig,
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("client_secrets failed:", response.status, errText);
      return res.status(response.status).send(errText);
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Token generation error:", err);
    res.status(500).json({ error: "Failed to generate token" });
  }
});

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
  console.log(`Token server listening on http://localhost:${port}`);
  console.log(`Try: curl http://localhost:${port}/token`);
});
