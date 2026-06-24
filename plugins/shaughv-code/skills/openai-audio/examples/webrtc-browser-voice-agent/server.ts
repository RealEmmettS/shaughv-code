// Browser voice agent — Node.js / TypeScript server.
//
// Same as server.js with type annotations.
//
// REQUIREMENTS
// ------------
// Env vars:
//   OPENAI_API_KEY     Your OpenAI API key with Realtime access.
//   PORT (optional)    HTTP port. Defaults to 3000.
// Node: >= 18.
// npm packages: express, typescript, ts-node, @types/express, @types/node
//
// INSTALL
// -------
//   npm install express
//   npm install -D typescript ts-node @types/express @types/node
//
// RUN
// ---
//   npx ts-node server.ts
//
// Pairs with: references/06-transport-webrtc.md

import express, { Request, Response } from "express";
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

interface RealtimeSessionConfig {
  type: "realtime";
  model: string;
  output_modalities?: string[];
  audio?: {
    output?: { voice: string };
  };
  instructions?: string;
}

const sessionConfig: RealtimeSessionConfig = {
  type: "realtime",
  model: "gpt-realtime-2",
  output_modalities: ["audio"],
  audio: { output: { voice: "marin" } },
  instructions:
    "You are a helpful voice assistant. Greet the user briefly when the call starts, " +
    "then answer their question concisely.",
};

app.post("/session", async (req: Request, res: Response) => {
  try {
    const fd = new FormData();
    fd.set("sdp", req.body as unknown as string);
    fd.set("session", JSON.stringify(sessionConfig));

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
      res.status(r.status).send(errText);
      return;
    }

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
