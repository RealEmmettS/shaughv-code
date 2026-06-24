// Sideband server control — Node.js / TypeScript.
//
// Same as sideband-server-control.js with types.
//
// REQUIREMENTS
// ------------
// Env vars:
//   OPENAI_API_KEY     Your OpenAI API key with Realtime access.
// Node: >= 18.
// npm packages: ws, typescript, ts-node, @types/ws, @types/node
//
// INSTALL
// -------
//   npm install ws
//   npm install -D typescript ts-node @types/ws @types/node
//
// RUN
// ---
//   npx ts-node sideband-server-control.ts rtc_u1_xxxxxxxxxxxxx
//
// Pairs with: references/13-server-side-controls.md
// Live-tested: structural (see examples/README.md).

import process from "node:process";
import WebSocket from "ws";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("Missing OPENAI_API_KEY.");
  process.exit(1);
}

const callId = process.argv[2];
if (!callId) {
  console.error("Usage: ts-node sideband-server-control.ts <call_id>");
  process.exit(1);
}

interface FunctionTool {
  type: "function";
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

const TOOLS: FunctionTool[] = [
  {
    type: "function",
    name: "lookup_order",
    description: "Look up an order by its order number.",
    parameters: {
      type: "object",
      properties: { order_number: { type: "string" } },
      required: ["order_number"],
    },
  },
];

function runTool(name: string, args: Record<string, unknown>): string {
  if (name === "lookup_order") {
    return JSON.stringify({
      order_number: args.order_number,
      status: "shipped",
      delivery_date: "2026-05-21",
    });
  }
  return JSON.stringify({ error: `unknown tool ${name}` });
}

const url = `wss://api.openai.com/v1/realtime?call_id=${callId}`;
const ws = new WebSocket(url, {
  headers: { Authorization: `Bearer ${apiKey}` },
});

ws.on("open", () => {
  ws.send(
    JSON.stringify({
      type: "session.update",
      session: { tools: TOOLS, tool_choice: "auto" },
    })
  );
  console.log("[sideband] connected, tool registered");
});

ws.on("message", (raw) => {
  const event: any = JSON.parse(raw.toString());

  if (event.type === "response.output_item.done" && event.item?.type === "function_call") {
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
    return;
  }

  if (event.type === "response.output_audio_transcript.done") {
    console.log("[assistant]", event.transcript);
  }
  if (event.type === "response.done") {
    console.log("[usage]", event.response?.usage ?? {});
  }
  if (event.type === "error") {
    console.error("[error]", event);
  }
});

ws.on("close", () => console.log("[sideband] closed"));
