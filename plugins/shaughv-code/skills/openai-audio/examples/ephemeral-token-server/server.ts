// Ephemeral token server — TypeScript / Express.
//
// Same as server.js but with type annotations.
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
// VERIFY
// ------
//   curl http://localhost:3000/token
//   # Look for "client_secret": { "value": "ek_..." } in the JSON response.
//
// Pairs with: references/06-transport-webrtc.md
// Live-tested: yes (see examples/README.md).

import express, { Request, Response } from "express";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("Missing OPENAI_API_KEY environment variable.");
  process.exit(1);
}

const app = express();

interface SessionConfig {
  session: {
    type: "realtime";
    model: string;
    audio?: {
      output?: { voice: string };
    };
    instructions?: string;
  };
}

const sessionConfig: SessionConfig = {
  session: {
    type: "realtime",
    model: "gpt-realtime-2",
    audio: { output: { voice: "marin" } },
    instructions: "You are a helpful voice assistant. Speak briefly and clearly.",
  },
};

app.get("/token", async (_req: Request, res: Response) => {
  try {
    const response = await fetch(
      "https://api.openai.com/v1/realtime/client_secrets",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "OpenAI-Safety-Identifier": "hashed-user-id",
        },
        body: JSON.stringify(sessionConfig),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("client_secrets failed:", response.status, errText);
      res.status(response.status).send(errText);
      return;
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
