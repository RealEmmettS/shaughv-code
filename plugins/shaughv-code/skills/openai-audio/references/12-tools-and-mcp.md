# 12 — Tools, MCP, and connectors

Tools extend Realtime sessions with side effects (look up data, call APIs, send messages). Two tool types:

| Type | Who runs it | Use when |
|---|---|---|
| `function` | Your app | Business logic, approval checks, private data access. |
| `mcp` with `server_url` | The Realtime API | Tools live on a remote MCP server you maintain. |
| `mcp` with `connector_id` | The Realtime API | OpenAI-managed connectors (e.g., `connector_googlecalendar`). |

Attach tools at the **session level** (`session.tools` in `session.update`) for the whole session, or at the **response level** (`response.tools` in `response.create`) for one turn only.

## Function tools

The default pattern. Your code receives function call arguments, executes the action, returns a `function_call_output` item, then asks the model to continue.

### Configure

```javascript
ws.send(JSON.stringify({
  type: "session.update",
  session: {
    type: "realtime",
    model: "gpt-realtime-2",
    tools: [
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
    ],
    tool_choice: "auto",
  },
}));
```

### Detect a call

```javascript
ws.on("message", (raw) => {
  const event = JSON.parse(raw.toString());

  if (event.type === "response.function_call_arguments.done") {
    console.log(event.arguments);  // streamed JSON string
  }

  if (event.type === "response.output_item.done" && event.item.type === "function_call") {
    const { name, call_id, arguments: argsJson } = event.item;
    const args = JSON.parse(argsJson);
    handleToolCall(name, args, call_id);
  }
});
```

### Send the result

```javascript
ws.send(JSON.stringify({
  type: "conversation.item.create",
  item: {
    type: "function_call_output",
    call_id: callId,
    output: JSON.stringify({
      status: "shipped",
      delivery_date: "2026-05-09",
    }),
  },
}));

ws.send(JSON.stringify({ type: "response.create" }));
```

`output` is a string — pass a JSON string for structured data, plain text for natural language.

### Strict mode and output shape

Tool outputs from your code are easier for the model to consume when they look like normal tool results (typed JSON). When the model must **repeat a value verbatim**, return a small envelope:

```json
{
  "response_text": "I just sent you an email with the verification link. Please open it and click 'Confirm'.",
  "require_repeat_verbatim": true
}
```

…with a prompt instruction:

```text
If `require_repeat_verbatim` is true, output exactly `response_text` and nothing else.
```

That keeps the model from paraphrasing, truncating, or adding fillers.

## MCP tools

The Realtime API can call MCP tools for you. You configure access; the API handles invocation. The session emits MCP lifecycle events; your client doesn't run the tool.

### MCP tool shape

```javascript
{
  type: "mcp",
  server_label: "openai_docs",          // stable handle
  server_url: "https://developers.openai.com/mcp",
  allowed_tools: ["search_openai_docs", "fetch_openai_doc"],
  require_approval: "never",            // or "always", or a per-tool object
  authorization: "<bearer if needed>",  // optional
  headers: { /* optional */ }           // optional, but not with `Authorization`
  server_description: "..."             // optional
}
```

Add via `session.tools` or `response.tools`:

```javascript
ws.send(JSON.stringify({
  type: "session.update",
  session: {
    type: "realtime",
    model: "gpt-realtime-2",
    output_modalities: ["text"],
    tools: [
      {
        type: "mcp",
        server_label: "openai_docs",
        server_url: "https://developers.openai.com/mcp",
        allowed_tools: ["search_openai_docs", "fetch_openai_doc"],
        require_approval: "never",
      },
    ],
  },
}));
```

### Built-in connectors

Connectors are OpenAI-managed MCP servers for common services. Pass `connector_id` instead of `server_url`:

```javascript
{
  type: "mcp",
  server_label: "google_calendar",
  connector_id: "connector_googlecalendar",
  authorization: "<google-oauth-access-token>",  // user's token
  allowed_tools: ["search_events", "read_event"],
  require_approval: "never",
}
```

Use connectors for **read** actions (search/read events, emails, files) where the user has authenticated separately. Do not send `headers.Authorization` for connectors — use the `authorization` field instead.

### MCP lifecycle events

```
session.update with mcp tool
   ↓
mcp_list_tools.in_progress    (server imports tools from the MCP server)
   ↓
conversation.item.done        (item.type = mcp_list_tools, with the imported tool names)
mcp_list_tools.completed       (or .failed)
   ↓
…user input, model decides to call a tool…
   ↓
response.mcp_call_arguments.delta  (streaming args)
response.mcp_call_arguments.done   (final args)
   ↓ (if approval is required)
conversation.item.done       (item.type = mcp_approval_request)
   ↓ client sends:
conversation.item.create with item.type = mcp_approval_response
   ↓
response.mcp_call.in_progress
   ↓
response.output_item.done    (item.type = mcp_call, with output)   OR
response.mcp_call.failed     (error)
   ↓
response.done
```

Listen for these events to surface progress and handle approvals:

```javascript
ws.on("message", (raw) => {
  const event = JSON.parse(raw.toString());
  switch (event.type) {
    case "mcp_list_tools.in_progress":
      console.log("Listing MCP tools…");
      break;
    case "mcp_list_tools.completed":
      console.log("MCP tools ready.");
      break;
    case "mcp_list_tools.failed":
      console.error("MCP tools failed to import.");
      break;
    case "conversation.item.done":
      if (event.item.type === "mcp_list_tools") {
        console.log("Imported tools:", event.item.tools.map(t => t.name).join(", "));
      }
      if (event.item.type === "mcp_approval_request") {
        approveMcp(event.item.id);
      }
      break;
    case "response.mcp_call.in_progress":
      console.log("Running MCP tool…");
      break;
    case "response.mcp_call.failed":
      console.error("MCP call failed.");
      break;
    case "response.output_item.done":
      if (event.item.type === "mcp_call") {
        console.log(`${event.item.server_label}.${event.item.name}:`, event.item.output);
      }
      break;
  }
});
```

### Approving an MCP call

```javascript
function approveMcp(approvalRequestId) {
  ws.send(JSON.stringify({
    type: "conversation.item.create",
    item: {
      id: `mcp_approval_${approvalRequestId}`,
      type: "mcp_approval_response",
      approval_request_id: approvalRequestId,
      approve: true,
    },
  }));
}
```

Set `approve: false` and include `reason: "…"` to reject.

### Reusing a `server_label`

After defining a server once with `server_label` + `server_url`/`connector_id`, later events in the **same session** can reference it by label only:

```javascript
ws.send(JSON.stringify({
  type: "response.create",
  response: {
    output_modalities: ["text"],
    input: [/* … */],
    tools: [{ type: "mcp", server_label: "google_calendar" }],
  },
}));
```

This is session-scoped. New sessions need the full definition again.

## Tool-choice control

| `tool_choice` | Meaning |
|---|---|
| `"auto"` | Model decides whether to call a tool. |
| `"none"` | No tools this turn. |
| `"required"` | Model **must** call a tool. Fails the turn if no eligible tool. |
| `{ "type": "function", "function": { "name": "..." } }` | Force this specific tool. |

Forcing `tool_choice: "required"` while no MCP tools have finished importing causes the turn to fail. Wait for `mcp_list_tools.completed` before relying on it.

## Common failures and how to debug

| Failure | Cause | Fix |
|---|---|---|
| `mcp_list_tools.failed` | Bad `server_url`/`connector_id`, auth, or unreachable server. | Recheck URL, token, `allowed_tools` names. |
| `response.mcp_call.failed` | Tool selected but call didn't complete. | Inspect the `mcp_call` item for the error payload. |
| `mcp_approval_request` with no response | Client never approved/denied. | Always wire up an `mcp_approval_response`. |
| Turn fails when `tool_choice: "required"` | Tools not loaded yet. | Wait for `mcp_list_tools.completed`. |
| Tool definition validation error before import | Duplicate `server_label`, both `server_url` and `connector_id`, missing both, or `headers.Authorization` on a connector. | Use only one of `server_url`/`connector_id`; for connectors use `authorization`, not `headers`. |

## Production checklist

- [ ] Define a small, namespaced tool surface. Group by user intent.
- [ ] Keep MCP server tools narrow with `allowed_tools`.
- [ ] Require approval for any write or external-effect action.
- [ ] Echo the human-readable consequence before write calls.
- [ ] Recover gracefully from failures — explain, optionally retry, then escalate.
- [ ] Never invent tool names. If you mention a tool in the prompt, it must exist in `tools`.
- [ ] Run an eval set that exercises happy path, ambiguous intent, missing fields, identifier corrections, and recoverable failures.

## See also

- `references/02-voice-agents.md` — session shape that hosts the tools.
- `references/09-conversation-lifecycle.md` — full tool-call event flow.
- `references/10-prompting-realtime-2.md` — tool eagerness + recovery prompt patterns.
- `examples/websocket-voice-agent.py` — concrete function tool implementation.
