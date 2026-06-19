# Agents — completions, the beta Agents API, and the beta Conversations API

Three related ways to use Mistral "agents", from simplest to most capable:

1. **Agents completions (simple)** — `POST /v1/agents/completions`. Stateless,
   works exactly like chat completions but you pass an `agent_id` instead of a
   `model`. Reach for this when you already have an agent and just want a
   one-shot reply.
2. **Agents API (beta)** — `POST/GET /v1/agents` (+ versions & aliases). Create
   and manage reusable agents (instructions, tools, model, handoffs). An agent
   is versioned; aliases (e.g. `prod`) point at a version.
3. **Conversations API (beta)** — `POST/GET /v1/conversations` (+ history,
   messages, restart, streaming). Stateful multi-turn: the server stores the
   conversation, runs completions and tool executions, and you continue it by
   `conversation_id`. Use this for anything multi-turn or tool-using.

> A separate **Deprecated Agents** group also exists in the spec — see
> [more-endpoints.md](more-endpoints.md). Prefer the endpoints documented here.

- **Docs:** https://docs.mistral.ai/api/endpoint/agents ·
  https://docs.mistral.ai/api/endpoint/conversations
- **Spec:** [openapi.yaml](openapi.yaml) (`AgentsCompletionRequest`,
  `CreateAgentRequest`/`UpdateAgentRequest`/`Agent`, `ConversationRequest`,
  `ConversationAppendRequest`, `ConversationRestartRequest`)

---

## Agents completions (simple)

`POST /v1/agents/completions` — same shape as `/v1/chat/completions`, but keyed
by `agent_id` rather than `model`. Returns a `ChatCompletionResponse`.

**Body (`AgentsCompletionRequest`):**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `agent_id` | string | **yes** | — | The agent to run this completion against (replaces `model`) |
| `messages` | (`SystemMessage`\|`UserMessage`\|`AssistantMessage`\|`ToolMessage`)[] | **yes** | — | Prompt as a list of role/content dicts |
| `max_tokens` | int (≥0) \| null | no | null | Max tokens to generate (prompt + this ≤ context length) |
| `stream` | boolean | no | `false` | Stream tokens as SSE, terminated by `data: [DONE]` |
| `stop` | string \| string[] \| null | no | — | Stop generation on these token(s) |
| `random_seed` | int (≥0) \| null | no | — | Seed for deterministic sampling |
| `response_format` | `ResponseFormat` | no | — | e.g. `json_object` / `json_schema` |
| `tools` | (`Tool`\|`WebSearchTool`\|`WebSearchPremiumTool`\|`CodeInterpreterTool`\|`ImageGenerationTool`\|`DocumentLibraryTool`\|`CustomConnector`)[] \| null | no | null | Tools available for this call |
| `tool_choice` | `ToolChoice` \| `ToolChoiceEnum` | no | `auto` | How/whether to call tools |
| `presence_penalty` | number \| null | no | — | Penalize repeated words/phrases (−2 – 2) |
| `frequency_penalty` | number \| null | no | — | Penalize words by frequency (−2 – 2) |
| `n` | int (≥1) \| null | no | — | Number of completions per request |
| `prediction` | `Prediction` | no | `{type:"content",content:""}` | Predicted output to speed up edits |
| `parallel_tool_calls` | boolean | no | `true` | Allow parallel tool calls |
| `reasoning_effort` | `ReasoningEffort` \| null | no | — | Reasoning effort level |
| `prompt_mode` | `MistralPromptMode` \| null | no | — | `reasoning` to use the reasoning system prompt |
| `guardrails` | `GuardrailConfig[]` \| null | no | — | Guardrail configuration |
| `prompt_cache_key` | string \| null | no | — | Key for prompt caching |
| `stop`, `metadata` | — | no | — | `metadata` is an arbitrary object |

```bash
# cURL
curl https://api.mistral.ai/v1/agents/completions \
  -H "Authorization: Bearer $MISTRAL_API_KEY" -H 'Content-Type: application/json' \
  -d '{"agent_id":"ag_xxx",
       "messages":[{"role":"user","content":"Who is the best French painter? Answer in one short sentence."}]}'
```
```python
# Python (SDK) — client.agents.complete is the conventional name; verify against the SDK.
import os
from mistralai import Mistral
client = Mistral(api_key=os.environ["MISTRAL_API_KEY"])
res = client.agents.complete(
    agent_id="ag_xxx",
    messages=[{"role": "user", "content": "Who is the best French painter? Answer in one short sentence."}],
)
print(res.choices[0].message.content)
```
```typescript
// TypeScript (SDK) — method name conventional; verify against @mistralai/mistralai.
import { Mistral } from "@mistralai/mistralai";
const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
const res = await client.agents.complete({
  agentId: "ag_xxx",
  messages: [{ role: "user", content: "Who is the best French painter? Answer in one short sentence." }],
});
console.log(res.choices[0].message.content);
```

---

## Agents API (beta) — create/manage agents

Create reusable agents (instructions + tools + model). Every `PATCH` creates a
new **version**; **aliases** are stable names that point at a version. All
endpoints are tagged `beta.agents`.

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/v1/agents` | Create an agent |
| GET | `/v1/agents` | List agents (paginated, filterable) |
| GET | `/v1/agents/{agent_id}` | Get an agent (optionally a specific `agent_version`) |
| PATCH | `/v1/agents/{agent_id}` | Update an agent → creates a new version |
| DELETE | `/v1/agents/{agent_id}` | Delete an agent |
| PATCH | `/v1/agents/{agent_id}/version` | Switch the active version (`version` query, required) |
| GET | `/v1/agents/{agent_id}/versions` | List all versions of an agent |
| GET | `/v1/agents/{agent_id}/versions/{version}` | Get one specific version |
| PUT | `/v1/agents/{agent_id}/aliases` | Create/update an alias → version (`alias`, `version` queries) |
| GET | `/v1/agents/{agent_id}/aliases` | List aliases for an agent |
| DELETE | `/v1/agents/{agent_id}/aliases` | Delete an alias (`alias` query, required) |

All return an `Agent` (or `AgentAliasResponse` for alias ops).

### `POST /v1/agents` — create (`CreateAgentRequest`)

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `model` | string | **yes** | — | Base model powering the agent |
| `name` | string | **yes** | — | Agent name |
| `instructions` | string \| null | no | null | System/instruction prompt the model follows |
| `tools` | (`FunctionTool`\|`WebSearchTool`\|`WebSearchPremiumTool`\|`CodeInterpreterTool`\|`ImageGenerationTool`\|`DocumentLibraryTool`\|`CustomConnector`)[] | no | — | Tools available during the conversation |
| `completion_args` | `CompletionArgs` | no | — | Default completion args (overridable per message) |
| `guardrails` | `GuardrailConfig[]` \| null | no | — | Guardrail configuration |
| `description` | string \| null | no | null | Human-readable description |
| `handoffs` | string[] \| null | no | null | Agent ids this agent may hand off to (≥1 if set) |
| `metadata` | `MetadataDict` \| null | no | — | Arbitrary metadata |
| `version_message` | string \| null | no | null | Note attached to this version (≤500 chars) |

**`UpdateAgentRequest` (`PATCH /v1/agents/{agent_id}`)** has the same fields, all
optional, plus `deployment_chat` (boolean \| null). `model` and `name` become
optional on update.

### `GET /v1/agents` — list (query params)

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `page` | integer (≥0) | no | `0` | Page number (0-indexed) |
| `page_size` | integer (1–1000) | no | `20` | Agents per page |
| `deployment_chat` | boolean \| null | no | — | Filter by chat-deployment flag |
| `sources` | `RequestSource[]` \| null | no | — | Filter by source |
| `name` | string \| null | no | — | Filter by agent name |
| `search` | string \| null | no | — | Search by name or id |
| `id` | string \| null | no | — | Filter by id |
| `metadata` | object \| null | no | — | Filter by metadata (JSON) |

### Path / query params for the version & alias endpoints

| Endpoint | Param | In | Type | Required | Description |
|----------|-------|----|------|----------|-------------|
| `GET /v1/agents/{agent_id}` | `agent_id` | path | string | **yes** | Agent id |
| | `agent_version` | query | int \| string \| null | no | Version number or alias string |
| `PATCH …/{agent_id}/version` | `version` | query | integer | **yes** | Version to make active |
| `GET …/{agent_id}/versions` | `page` / `page_size` | query | integer | no | `0` / `20` (page_size 1–100) |
| `GET …/{agent_id}/versions/{version}` | `version` | path | string | **yes** | Version to fetch |
| `PUT …/{agent_id}/aliases` | `alias` | query | string | **yes** | Alias name (1–64, `^[a-z]([a-z0-9_-]*[a-z0-9])?$`) |
| | `version` | query | integer | **yes** | Version the alias points to |
| `DELETE …/{agent_id}/aliases` | `alias` | query | string | **yes** | Alias to delete |

```bash
# cURL — create an agent, then alias version 1 as "prod"
curl https://api.mistral.ai/v1/agents \
  -H "Authorization: Bearer $MISTRAL_API_KEY" -H 'Content-Type: application/json' \
  -d '{"model":"mistral-medium-latest",
       "name":"support-bot",
       "instructions":"You are a concise customer-support assistant.",
       "tools":[{"type":"web_search"}],
       "description":"Answers product questions."}'

curl -X PUT "https://api.mistral.ai/v1/agents/ag_xxx/aliases?alias=prod&version=1" \
  -H "Authorization: Bearer $MISTRAL_API_KEY"
```
```python
# Python (SDK) — client.beta.agents.* is conventional; verify against the SDK.
import os
from mistralai import Mistral
client = Mistral(api_key=os.environ["MISTRAL_API_KEY"])
agent = client.beta.agents.create(
    model="mistral-medium-latest",
    name="support-bot",
    instructions="You are a concise customer-support assistant.",
    tools=[{"type": "web_search"}],
    description="Answers product questions.",
)
print(agent.id, agent.version)
```
```typescript
// TypeScript (SDK) — names conventional; verify against @mistralai/mistralai.
import { Mistral } from "@mistralai/mistralai";
const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
const agent = await client.beta.agents.create({
  model: "mistral-medium-latest",
  name: "support-bot",
  instructions: "You are a concise customer-support assistant.",
  tools: [{ type: "web_search" }],
  description: "Answers product questions.",
});
console.log(agent.id, agent.version);
```

---

## Conversations API (beta)

Stateful, server-managed multi-turn. Start a conversation (with an `agent_id`,
or a bare `model` + `instructions`), then continue it by `conversation_id`. The
server runs completions and tool executions and appends the results. All
endpoints are tagged `beta.conversations`. Every write endpoint has a streaming
twin at the same path with a `#stream` suffix that returns
`text/event-stream` (`ConversationEvents`).

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/v1/conversations` | Start a conversation and append entries |
| POST | `/v1/conversations#stream` | Same, streamed (SSE) |
| GET | `/v1/conversations` | List conversations (paginated) |
| GET | `/v1/conversations/{conversation_id}` | Get conversation metadata |
| POST | `/v1/conversations/{conversation_id}` | Append new entries (continue) |
| POST | `/v1/conversations/{conversation_id}#stream` | Append, streamed (SSE) |
| DELETE | `/v1/conversations/{conversation_id}` | Delete a conversation |
| GET | `/v1/conversations/{conversation_id}/history` | All entries (messages, tool calls, handoffs…) |
| GET | `/v1/conversations/{conversation_id}/messages` | Messages only (filtered history) |
| POST | `/v1/conversations/{conversation_id}/restart` | Restart from an entry → new conversation |
| POST | `/v1/conversations/{conversation_id}/restart#stream` | Restart, streamed (SSE) |

### `POST /v1/conversations` — start (`ConversationRequest`)

`inputs` is required; supply **either** `agent_id` (+ optional `agent_version`)
**or** `model` (+ `instructions`/`tools`).

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `inputs` | string \| `InputEntries` | **yes** | — | The user input — a plain string or a list of entries |
| `agent_id` | string \| null | no | null | Agent to drive the conversation |
| `agent_version` | string \| int \| null | no | null | Specific agent version/alias |
| `model` | string \| null | no | null | Base model (use instead of `agent_id`) |
| `instructions` | string \| null | no | null | Instruction prompt (with `model`) |
| `tools` | tool[] \| null | no | null | Tools available (same union as agents) |
| `completion_args` | `CompletionArgs` \| null | no | null | Completion args for assistant responses |
| `guardrails` | `GuardrailConfig[]` \| null | no | null | Guardrail configuration |
| `stream` | boolean \| null | no | null | Stream the response (the `#stream` variant forces `true`) |
| `store` | boolean \| null | no | null | Whether to persist results server-side |
| `handoff_execution` | `client` \| `server` \| null | no | null | Where handoffs run |
| `name` | string \| null | no | null | Conversation name |
| `description` | string \| null | no | null | Conversation description |
| `metadata` | `MetadataDict` \| null | no | null | Arbitrary metadata |

Returns a `ConversationResponse` carrying the `conversation_id` to continue with.

### `POST /v1/conversations/{conversation_id}` — append (`ConversationAppendRequest`)

Path param `conversation_id` (string, **required**).

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `inputs` | string \| `InputEntries` | **yes** | — | New user entries to append |
| `stream` | boolean | no | `false` | Stream partial progress (`#stream` variant forces `true`) |
| `store` | boolean | no | `true` | Persist results server-side |
| `handoff_execution` | `client` \| `server` | no | `server` | Where handoffs run |
| `completion_args` | `CompletionArgs` | no | — | Override completion args for this turn |
| `tool_confirmations` | `ToolCallConfirmation[]` \| null | no | — | Confirm/deny pending tool calls |

### `POST /v1/conversations/{conversation_id}/restart` — restart (`ConversationRestartRequest`)

Path param `conversation_id` (string, **required**). Recreates the conversation
from a chosen entry and runs completion; returns a **new** conversation.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `from_entry_id` | string | **yes** | — | Entry id to restart from |
| `inputs` | string \| `InputEntries` | no | — | New entries to append after the restart point |
| `stream` | boolean | no | `false` | Stream partial progress (`#stream` variant forces `true`) |
| `store` | boolean | no | `true` | Persist results server-side |
| `handoff_execution` | `client` \| `server` | no | `server` | Where handoffs run |
| `completion_args` | `CompletionArgs` | no | — | Override completion args |
| `guardrails` | `GuardrailConfig[]` \| null | no | — | Guardrail configuration |
| `metadata` | `MetadataDict` \| null | no | — | Custom metadata for the new conversation |
| `agent_version` | string \| int \| null | no | — | Agent version to use on restart (default: current) |

### `GET /v1/conversations` — list (query params)

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `page` | integer | no | `0` | Page number |
| `page_size` | integer | no | `100` | Items per page |
| `metadata` | object \| null | no | — | Filter by metadata (JSON) |

```bash
# cURL — start with an agent, then continue and stream the next turn
curl https://api.mistral.ai/v1/conversations \
  -H "Authorization: Bearer $MISTRAL_API_KEY" -H 'Content-Type: application/json' \
  -d '{"agent_id":"ag_xxx","inputs":"Summarize today's AI news."}'
# -> { "conversation_id": "conv_xxx", ... }

curl https://api.mistral.ai/v1/conversations/conv_xxx#stream \
  -H "Authorization: Bearer $MISTRAL_API_KEY" -H 'Content-Type: application/json' \
  -d '{"inputs":"Now give me the top 3 as bullet points.","stream":true}'

# starting from a base model instead of an agent:
curl https://api.mistral.ai/v1/conversations \
  -H "Authorization: Bearer $MISTRAL_API_KEY" -H 'Content-Type: application/json' \
  -d '{"model":"mistral-medium-latest",
       "instructions":"You are concise.",
       "inputs":"Who painted the Mona Lisa?"}'
```
```python
# Python (SDK) — client.beta.conversations.* is conventional; verify against the SDK.
import os
from mistralai import Mistral
client = Mistral(api_key=os.environ["MISTRAL_API_KEY"])

conv = client.beta.conversations.start(agent_id="ag_xxx", inputs="Summarize today's AI news.")
more = client.beta.conversations.append(
    conversation_id=conv.conversation_id,
    inputs="Now give me the top 3 as bullet points.",
)
history = client.beta.conversations.get_history(conversation_id=conv.conversation_id)
print(history)
```
```typescript
// TypeScript (SDK) — names conventional; verify against @mistralai/mistralai.
import { Mistral } from "@mistralai/mistralai";
const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
const conv = await client.beta.conversations.start({
  agentId: "ag_xxx",
  inputs: "Summarize today's AI news.",
});
const more = await client.beta.conversations.append({
  conversationId: conv.conversationId,
  inputs: "Now give me the top 3 as bullet points.",
});
console.log(more);
```

## Notes
- **Which to use:** one-shot reply against an existing agent → *agents
  completions*; build/version a reusable agent → *Agents API*; multi-turn,
  tool-using, server-stored chat → *Conversations API*.
- **Agents completions** takes `agent_id` where chat completions takes `model`;
  the response is a normal `ChatCompletionResponse`.
- **Versions & aliases:** each `PATCH /v1/agents/{id}` mints a new version;
  point an alias (e.g. `prod`) at a version with `PUT …/aliases`, and pass the
  alias as `agent_version` where a version is accepted.
- **Conversations are stateful:** start once, then `POST /v1/conversations/{id}`
  to continue. `inputs` accepts a plain string or structured `InputEntries`.
  `store: true` (default) keeps the conversation server-side.
- **Streaming:** append `#stream` to the conversation write paths (start /
  append / restart) for `text/event-stream` (`ConversationEvents`); the streamed
  variants force `stream: true`.
- **`/history` vs `/messages`:** history returns every entry (messages, function
  calls, tool executions, handoffs); messages is the same list filtered to
  messages only.
- **Restart** forks a *new* conversation from `from_entry_id` — the original is
  left intact.
- These are **beta** (`beta.agents` / `beta.conversations`) APIs and may change.
  The older **Deprecated Agents** group is documented in
  [more-endpoints.md](more-endpoints.md).
- cURL above is authoritative. SDK calls (`client.agents.complete`,
  `client.beta.agents.*`, `client.beta.conversations.*`) use conventional names —
  confirm against the spec/SDK you have installed.
