// Streaming text-to-speech with gpt-4o-mini-tts — TypeScript.
//
// REQUIREMENTS
// ------------
// Env vars:
//   OPENAI_API_KEY      Your OpenAI API key (must have audio access).
// Node:
//   Node.js >= 18 (global fetch); tsconfig with "module": "esnext".
// npm packages:
//   openai, typescript, ts-node, @types/node
//
// INSTALL
// -------
//   npm install openai
//   npm install -D typescript ts-node @types/node
//
// RUN
// ---
//   npx ts-node tts-streaming.ts "Hello from the audio skill." out.wav
//
// EXPECTED OUTPUT
// ---------------
//   - Writes out.wav (~100-300 KB).
//   - Prints "Wrote out.wav (NNN bytes)".
//
// Pairs with: references/05-text-to-speech.md
// Live-tested: yes (see examples/README.md).

import fs from "node:fs";
import { Buffer } from "node:buffer";
import OpenAI from "openai";

const text: string = process.argv[2] ?? "Hello from the OpenAI audio skill.";
const outPath: string = process.argv[3] ?? "out.wav";

const client = new OpenAI();

interface SpeechRequest {
  model: string;
  voice: string;
  input: string;
  instructions?: string;
  response_format: "mp3" | "opus" | "aac" | "flac" | "wav" | "pcm";
}

const req: SpeechRequest = {
  model: "gpt-4o-mini-tts",
  voice: "marin",
  input: text,
  instructions: "Read the text in a friendly, clear voice. Slight smile.",
  response_format: "wav",
};

const response = await client.audio.speech.create(req);

const buf = Buffer.from(await response.arrayBuffer());
fs.writeFileSync(outPath, buf);

console.log(`Wrote ${outPath} (${buf.byteLength} bytes)`);
