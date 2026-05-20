// Server-side voice agent using gpt-realtime-2 — Node.js.
//
// REQUIREMENTS
// ------------
// Env vars:
//   OPENAI_API_KEY     Your OpenAI API key with Realtime access.
// Node: >= 18.
// npm packages: ws, wavefile
// Input file: WAV (auto-resampled to 24 kHz). Test fixture at
//   examples/audio_samples/sample-en.wav contains an order-related question
//   that should trigger the lookup_order tool.
//
// INSTALL
// -------
//   npm install ws wavefile
//
// RUN
// ---
//   node websocket-voice-agent.js audio_samples/sample-en.wav
//
// EXPECTED OUTPUT
// ---------------
//   - Live transcript of the model's spoken reply.
//   - response.pcm on disk (24 kHz mono PCM16, headerless).
//   - A "--- usage ---" block at the end with token counts.
//
// Pairs with: references/02-voice-agents.md, references/07-transport-websocket.md
// Live-tested: yes (see examples/README.md).

import fs from "node:fs";
import process from "node:process";
import { Buffer } from "node:buffer";
import WebSocket from "ws";
import { WaveFile } from "wavefile";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("Missing OPENAI_API_KEY environment variable.");
  process.exit(1);
}

const filePath = process.argv[2] ?? "audio_samples/sample-en.wav";
const outPath = "response.pcm";

const wav = new WaveFile(fs.readFileSync(filePath));
wav.toBitDepth("16");
wav.toSampleRate(24000);
const samples = wav.getSamples(false, Int16Array);

const TOOLS = [
  {
    type: "function",
    name: "lookup_order",
    description: "Look up an order by its order number.",
    parameters: {
      type: "object",
      properties: {
        order_number: {
          type: "string",
          description: "The customer-facing order number.",
        },
      },
      required: ["order_number"],
    },
  },
];

function runTool(name, args) {
  if (name === "lookup_order") {
    return JSON.stringify({
      order_number: args.order_number,
      status: "shipped",
      delivery_date: "2026-05-21",
    });
  }
  return JSON.stringify({ error: `unknown tool ${name}` });
}

const ws = new WebSocket(
  "wss://api.openai.com/v1/realtime?model=gpt-realtime-2",
  {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "OpenAI-Safety-Identifier": "openai-audio-skill-tests",
    },
  }
);

const responseAudio = fs.createWriteStream(outPath);
let transcript = "";

ws.on("open", async () => {
  ws.send(
    JSON.stringify({
      type: "session.update",
      session: {
        type: "realtime",
        model: "gpt-realtime-2",
        output_modalities: ["audio"],
        audio: {
          input: {
            format: { type: "audio/pcm", rate: 24000 },
            // Disable VAD for deterministic test behavior: we stream the
            // entire file, then manually commit + create the response. For
            // production with a live mic, use { type: "server_vad" }.
            turn_detection: null,
          },
          output: {
            // The API currently requires a sample rate on the output format
            // even though the doc examples often show only `type`.
            format: { type: "audio/pcm", rate: 24000 },
            voice: "marin",
          },
        },
        instructions:
          "You are a concise customer service voice agent. " +
          "If the user asks about an order, call lookup_order. " +
          "Confirm the order number digit by digit before calling tools.",
        tools: TOOLS,
        tool_choice: "auto",
      },
    })
  );

  const chunkMs = 100;
  const samplesPerChunk = Math.max(1, Math.round((24000 * chunkMs) / 1000));

  for (let i = 0; i < samples.length; i += samplesPerChunk) {
    const chunk = samples.subarray(i, i + samplesPerChunk);
    ws.send(
      JSON.stringify({
        type: "input_audio_buffer.append",
        audio: Buffer.from(
          chunk.buffer,
          chunk.byteOffset,
          chunk.byteLength
        ).toString("base64"),
      })
    );
    await new Promise((r) => setTimeout(r, chunkMs));
  }

  ws.send(JSON.stringify({ type: "input_audio_buffer.commit" }));
  ws.send(JSON.stringify({ type: "response.create" }));
});

ws.on("message", (raw) => {
  const event = JSON.parse(raw.toString());
  switch (event.type) {
    case "response.output_audio.delta":
      responseAudio.write(Buffer.from(event.delta, "base64"));
      break;
    case "response.output_audio_transcript.delta":
      process.stdout.write(event.delta);
      break;
    case "response.output_audio_transcript.done":
      transcript = event.transcript ?? transcript;
      break;
    case "response.output_item.done":
      if (event.item?.type === "function_call") {
        const result = runTool(event.item.name, JSON.parse(event.item.arguments));
        ws.send(
          JSON.stringify({
            type: "conversation.item.create",
            item: {
              type: "function_call_output",
              call_id: event.item.call_id,
              output: result,
            },
          })
        );
        ws.send(JSON.stringify({ type: "response.create" }));
      }
      break;
    case "response.done":
      console.log("\n--- usage ---");
      console.log(JSON.stringify(event.response?.usage ?? {}, null, 2));
      ws.close();
      break;
    case "error":
      console.error("\n[error]", event);
      process.exit(1);
  }
});

ws.on("close", () => {
  responseAudio.end();
  console.log(`\nWrote response audio: ${outPath}`);
  if (transcript) console.log(`Transcript: ${transcript}`);
});
