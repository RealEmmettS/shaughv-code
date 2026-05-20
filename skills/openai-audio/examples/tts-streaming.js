// Streaming text-to-speech with gpt-4o-mini-tts — Node.js.
//
// REQUIREMENTS
// ------------
// Env vars:
//   OPENAI_API_KEY      Your OpenAI API key (must have audio access).
// Node:
//   Node.js >= 18 (for global fetch).
// npm packages:
//   openai
//
// INSTALL
// -------
//   npm install openai
//
// RUN
// ---
//   # Default text + output path:
//   node tts-streaming.js
//   # Custom text and path:
//   node tts-streaming.js "Hello from the audio skill." out.wav
//
// EXPECTED OUTPUT
// ---------------
//   - Writes out.wav (~100-300 KB for a short sentence at 24 kHz).
//   - Prints "Wrote out.wav (NNN bytes)".
//
// Pairs with: references/05-text-to-speech.md
// Live-tested: yes (see examples/README.md).

import fs from "node:fs";
import { Buffer } from "node:buffer";
import OpenAI from "openai";

const text = process.argv[2] ?? "Hello from the OpenAI audio skill.";
const outPath = process.argv[3] ?? "out.wav";

const client = new OpenAI();

const response = await client.audio.speech.create({
  model: "gpt-4o-mini-tts",
  voice: "marin",
  input: text,
  instructions: "Read the text in a friendly, clear voice. Slight smile.",
  response_format: "wav",
});

// `response.arrayBuffer()` returns the full audio bytes. For long inputs you
// can pipe `response.body` to a writable stream to start writing earlier.
const buf = Buffer.from(await response.arrayBuffer());
fs.writeFileSync(outPath, buf);

console.log(`Wrote ${outPath} (${buf.byteLength} bytes)`);
