// Ephemeral token server for the @openai/agents/realtime browser example.
//
// Pairs with: examples/agents-sdk-browser/index.html
//             references/06-transport-webrtc.md (Higher-level alternative section)
//
// REQUIREMENTS
// ------------
// Env vars:
//   OPENAI_API_KEY     Your OpenAI API key with Realtime access.
//   PORT (optional)    HTTP port. Defaults to 3001.
// Node: >= 18 (global fetch).
// npm packages: express
// Browser: any modern browser. The page loads
//   ``@openai/agents/realtime`` from https://esm.sh at runtime; for
//   production bundle it with Vite/webpack/esbuild instead.
//
// INSTALL
// -------
//   npm install express
//
// RUN
// ---
//   node server.js
//   # Then open http://localhost:3001 in a browser.
//
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
app.use(express.static(__dirname));

const sessionConfig = JSON.stringify({
  session: {
    type: "realtime",
    model: "gpt-realtime-2",
    audio: { output: { voice: "marin" } },
    instructions:
      "You are a helpful voice assistant. Speak briefly. Greet the caller once.",
  },
});

app.get("/token", async (_req, res) => {
  const r = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "OpenAI-Safety-Identifier": "openai-audio-skill-tests",
    },
    body: sessionConfig,
  });
  if (!r.ok) {
    const errText = await r.text();
    console.error("client_secrets failed:", r.status, errText);
    return res.status(r.status).send(errText);
  }
  res.json(await r.json());
});

const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => {
  console.log(`Agents-SDK server: http://localhost:${port}`);
});
