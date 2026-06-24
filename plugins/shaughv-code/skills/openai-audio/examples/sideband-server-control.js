// Sideband server control — Node.js.
//
// Joins an in-progress WebRTC voice-agent session via its call_id and:
//   - registers a function tool;
//   - dispatches tool calls server-side;
//   - logs transcripts + usage.
//
// Use this when the browser owns the media (via the unified WebRTC pattern in
// examples/webrtc-browser-voice-agent/) but you want tool logic, business
// rules, and observability to live on the server.
//
// REQUIREMENTS
// ------------
// Env vars:
//   OPENAI_API_KEY     Your OpenAI API key with Realtime access.
// Node: >= 18.
// npm packages: ws
// Prerequisite: a running WebRTC session whose call_id you have. Start with
//   examples/webrtc-browser-voice-agent/server.js; that server returns the
//   call_id in the X-Call-Id response header on POST /session.
//
// INSTALL
// -------
//   npm install ws
//
// RUN
// ---
//   node sideband-server-control.js rtc_u1_xxxxxxxxxxxxx
//
// Pairs with: references/13-server-side-controls.md
// Live-tested: structural — full E2E requires a live WebRTC session bound to
//              the same call_id (see examples/README.md).

import process from "node:process";
import WebSocket from "ws";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("Missing OPENAI_API_KEY.");
  process.exit(1);
}

const callId = process.argv[2];
if (!callId) {
  console.error("Usage: node sideband-server-control.js <call_id>");
  process.exit(1);
}

const url = `wss://api.openai.com/v1/realtime?call_id=${callId}`;
const ws = new WebSocket(url, {
  headers: { Authorization: `Bearer ${apiKey}` },
});

ws.on("open", () => {
  ws.send(
    JSON.stringify({
      type: "session.update",
      session: {
        tools: [
          {
            type: "function",
            name: "lookup_order",
            description: "Look up an order by its order number.",
            parameters: {
              type: "object",
              properties: {
                order_number: { type: "string" },
              },
              required: ["order_number"],
            },
          },
        ],
        tool_choice: "auto",
      },
    })
  );
  console.log("[sideband] connected, tool registered");
});

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

ws.on("message", (raw) => {
  const event = JSON.parse(raw.toString());

  if (
    event.type === "response.output_item.done" &&
    event.item?.type === "function_call"
  ) {
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

ws.on("close", () => {
  console.log("[sideband] closed");
});
