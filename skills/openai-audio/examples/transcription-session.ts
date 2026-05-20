// Streaming transcription with gpt-realtime-whisper — Node.js / TypeScript.
//
// REQUIREMENTS
// ------------
// Env vars:
//   OPENAI_API_KEY     Your OpenAI API key with Realtime access.
// Node: >= 18.
// npm packages: ws, wavefile, typescript, ts-node, @types/ws, @types/node
// Input file: WAV (any sample rate; auto-resampled to 24 kHz).
//   Test fixture: examples/audio_samples/sample-en.wav
//
// INSTALL
// -------
//   npm install ws wavefile
//   npm install -D typescript ts-node @types/ws @types/node
//
// RUN
// ---
//   npx ts-node transcription-session.ts audio_samples/sample-en.wav
//
// EXPECTED OUTPUT
// ---------------
//   - Streaming transcript deltas printed as they arrive.
//   - A final transcript echoed after "--- Final ---".
//
// Pairs with: references/03-transcription.md
// Live-tested: yes (see examples/README.md).

import fs from "node:fs";
import process from "node:process";
import WebSocket from "ws";
// @ts-ignore - wavefile ships without types
import { WaveFile } from "wavefile";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("Missing OPENAI_API_KEY environment variable.");
  process.exit(1);
}

const filePath = process.argv[2];
if (!filePath) {
  console.error("Usage: ts-node transcription-session.ts <wav-file>");
  process.exit(1);
}

const wav = new WaveFile(fs.readFileSync(filePath));
wav.toBitDepth("16");
wav.toSampleRate(24000);

const samples = wav.getSamples(false, Int16Array) as Int16Array;
const chunkMs = 100;
const samplesPerChunk = Math.max(1, Math.round((24000 * chunkMs) / 1000));

function chunkToBase64(view: Int16Array): string {
  // Int16 little-endian → base64
  return Buffer.from(view.buffer, view.byteOffset, view.byteLength).toString("base64");
}

// For transcription sessions, use `?intent=transcription` (NOT `?model=...`).
// The transcription model goes into `session.audio.input.transcription.model`.
const ws = new WebSocket(
  "wss://api.openai.com/v1/realtime?intent=transcription",
  {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "OpenAI-Safety-Identifier": "openai-audio-skill-tests",
    },
  }
);

let finalTranscript = "";

ws.on("open", async () => {
  // Note: gpt-realtime-whisper does NOT support turn_detection. We commit
  // manually after streaming the whole file. For models that support VAD
  // (e.g., gpt-4o-transcribe), add an audio.input.turn_detection block.
  ws.send(
    JSON.stringify({
      type: "session.update",
      session: {
        type: "transcription",
        audio: {
          input: {
            format: { type: "audio/pcm", rate: 24000 },
            transcription: {
              model: "gpt-realtime-whisper",
              language: "en",
            },
          },
        },
      },
    })
  );

  for (let i = 0; i < samples.length; i += samplesPerChunk) {
    const chunk = samples.subarray(i, i + samplesPerChunk);
    ws.send(
      JSON.stringify({
        type: "input_audio_buffer.append",
        audio: chunkToBase64(chunk),
      })
    );
    await new Promise((r) => setTimeout(r, chunkMs));
  }

  ws.send(JSON.stringify({ type: "input_audio_buffer.commit" }));
});

ws.on("message", (raw) => {
  const event = JSON.parse(raw.toString());
  switch (event.type) {
    case "conversation.item.input_audio_transcription.delta":
      process.stdout.write(event.delta);
      break;
    case "conversation.item.input_audio_transcription.completed":
      finalTranscript += event.transcript + " ";
      process.stdout.write("\n");
      ws.close();
      break;
    case "error":
      console.error("\n[error]", event);
      process.exit(1);
  }
});

ws.on("close", () => {
  console.log("--- Final ---");
  console.log(finalTranscript.trim());
});
