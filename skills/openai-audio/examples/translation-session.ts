// Live translation with gpt-realtime-translate — Node.js / TypeScript.
//
// REQUIREMENTS
// ------------
// Env vars:
//   OPENAI_API_KEY     Your OpenAI API key with Realtime access.
// Node: >= 18.
// npm packages: ws, wavefile, typescript, ts-node, @types/ws, @types/node
//
// INSTALL
// -------
//   npm install ws wavefile
//   npm install -D typescript ts-node @types/ws @types/node
//
// RUN
// ---
//   npx ts-node translation-session.ts audio_samples/sample-en.wav es
//
// EXPECTED OUTPUT
// ---------------
//   - Source transcript dimmed on stderr; target transcript on stdout.
//   - translated.pcm (24 kHz mono PCM16, headerless) on disk.
//
// Pairs with: references/04-translation.md
// Live-tested: yes (see examples/README.md).

import fs from "node:fs";
import process from "node:process";
import { Buffer } from "node:buffer";
import WebSocket from "ws";
// @ts-ignore - wavefile ships without types
import { WaveFile } from "wavefile";

interface RealtimeEvent {
  type: string;
  delta?: string;
  [k: string]: unknown;
}

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("Missing OPENAI_API_KEY environment variable.");
  process.exit(1);
}

const filePath = process.argv[2];
const targetLanguage = process.argv[3];
if (!filePath || !targetLanguage) {
  console.error("Usage: ts-node translation-session.ts <wav-file> <target-lang>");
  process.exit(1);
}

const wav = new WaveFile(fs.readFileSync(filePath));
wav.toBitDepth("16");
wav.toSampleRate(24000);
const samples = wav.getSamples(false, Int16Array) as Int16Array;

const ws = new WebSocket(
  "wss://api.openai.com/v1/realtime/translations?model=gpt-realtime-translate",
  {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "OpenAI-Safety-Identifier": "openai-audio-skill-tests",
    },
  }
);

const out = fs.createWriteStream("translated.pcm");

ws.on("open", async () => {
  ws.send(
    JSON.stringify({
      type: "session.update",
      session: { audio: { output: { language: targetLanguage } } },
    })
  );

  const chunkMs = 100;
  const samplesPerChunk = Math.max(1, Math.round((24000 * chunkMs) / 1000));

  for (let i = 0; i < samples.length; i += samplesPerChunk) {
    const chunk = samples.subarray(i, i + samplesPerChunk);
    ws.send(
      JSON.stringify({
        type: "session.input_audio_buffer.append",
        audio: Buffer.from(
          chunk.buffer,
          chunk.byteOffset,
          chunk.byteLength
        ).toString("base64"),
      })
    );
    await new Promise((r) => setTimeout(r, chunkMs));
  }

  ws.send(JSON.stringify({ type: "session.close" }));
});

ws.on("message", (raw) => {
  const event = JSON.parse(raw.toString()) as RealtimeEvent;
  switch (event.type) {
    case "session.input_transcript.delta":
      process.stderr.write(`\x1b[2m${event.delta}\x1b[0m`);
      break;
    case "session.output_transcript.delta":
      process.stdout.write(event.delta ?? "");
      break;
    case "session.output_audio.delta":
      out.write(Buffer.from(event.delta ?? "", "base64"));
      break;
    case "session.closed":
      ws.close();
      break;
    case "error":
      console.error("\n[error]", event);
      process.exit(1);
  }
});

ws.on("close", () => {
  out.end();
  console.log("\n\nWrote translated audio to translated.pcm");
});
