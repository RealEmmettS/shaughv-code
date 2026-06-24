# Chat completions — `POST /v1/chat/completions`

Generate a model response from a list of role-tagged messages. Supports
multimodal content (text + images + documents), tool / function calling,
structured (JSON) outputs, and token-by-token streaming over SSE.

- **Endpoint:** `POST /v1/chat/completions` · **Example models:** `mistral-large-latest`, `mistral-small-latest`
- **Docs:** https://docs.mistral.ai/api/endpoint/chat
- **Spec:** [openapi.yaml](openapi.yaml) (`ChatCompletionRequest` / `ChatCompletionResponse`)

## Request body (`application/json`)

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `model` | string | **yes** | — | Model id, e.g. `mistral-large-latest` / `mistral-small-latest` |
| `messages` | (`SystemMessage` \| `UserMessage` \| `AssistantMessage` \| `ToolMessage`)[] | **yes** | — | Conversation so far, discriminated by `role` (see below) |
| `temperature` | number \| null | no | model-dependent | Sampling temperature, `0`–`1.5`. Recommended `0.0`–`0.7`. Alter this **or** `top_p`, not both. |
| `top_p` | number \| null | no | 1 | Nucleus sampling, `0` (exclusive) – `1`. Alter this **or** `temperature`, not both. |
| `max_tokens` | int \| null | no | null | Max tokens to generate (prompt + `max_tokens` ≤ context length) |
| `stream` | bool | no | false | Stream partial progress as SSE; terminated by `data: [DONE]` |
| `stop` | string \| string[] \| null | no | null | Stop generation on this token, or any token in the array |
| `random_seed` | int (≥0) \| null | no | null | Seed for deterministic sampling |
| `n` | int (≥1) \| null | no | null | Number of completions to return per request (input billed once) |
| `presence_penalty` | number \| null | no | 0 | `-2`–`2`. Higher penalizes any repetition, widening vocabulary. |
| `frequency_penalty` | number \| null | no | 0 | `-2`–`2`. Higher penalizes words by how often they already appeared. |
| `response_format` | `ResponseFormat` | no | `{"type":"text"}` | `text` / `json_object` / `json_schema` (see Structured outputs) |
| `tools` | `Tool`[] \| null | no | null | Functions the model may call (plus built-in tool types) |
| `tool_choice` | `ToolChoice` \| `ToolChoiceEnum` | no | `auto` | `auto` / `none` / `any` / `required`, or force one function |
| `parallel_tool_calls` | bool | no | true | Allow the model to emit multiple tool calls at once |
| `prediction` | `Prediction` | no | `{"type":"content","content":""}` | Expected output to speed up edits (predicted-outputs) |
| `safe_prompt` | bool | no | false | Inject a safety system prompt before the conversation |
| `prompt_mode` | `"reasoning"` \| null | no | null | Toggle reasoning-model system prompt vs. none |
| `reasoning_effort` | `ReasoningEffort` \| null | no | null | Reasoning budget for reasoning models |
| `prompt_cache_key` | string \| null | no | null | Cache key for prompt caching |
| `metadata` | object \| null | no | null | Free-form metadata |

`additionalProperties: false` — only `model` and `messages` are required.

## Messages & content

Each entry in `messages` is discriminated by its `role`:

- **`SystemMessage`** (`role: "system"`) — `content` is a string or a list of
  `TextChunk` / `ThinkChunk`. Sets behavior / instructions.
- **`UserMessage`** (`role: "user"`) — `content` is a string, `null`, or a list
  of content chunks (multimodal — see below).
- **`AssistantMessage`** (`role: "assistant"`) — `content` (string / chunks /
  `null`) plus optional `tool_calls[]` (`ToolCall`) and `prefix` (bool — set
  `true` to force the model to continue from this message's text).
- **`ToolMessage`** (`role: "tool"`) — the result of a tool call: `content`
  (string / chunks / `null`), `tool_call_id` (matches the `ToolCall.id`), and
  optional `name`.

**Content chunks** (`ContentChunk`, discriminated by `type`) usable in user /
assistant / tool content arrays:

- **`text`** — `{ "type": "text", "text": "..." }`
- **`image_url`** — `{ "type": "image_url", "image_url": "https://…/x.png" }`.
  `image_url` may be a bare string (an `https://…` URL or a
  `data:image/png;base64,…` URI) or an object
  `{ "url": "...", "detail": "low"|"auto"|"high" }`.
- **`document_url`** — `{ "type": "document_url", "document_url": "https://…/x.pdf", "document_name": "x.pdf" }`
- **`file`** — `{ "type": "file", "file_id": "<uuid>" }` (upload to `/v1/files`
  first; see [files.md](files.md))
- **`reference`** (`ReferenceChunk`), **`thinking`** (`ThinkChunk`),
  **`input_audio`** (`AudioChunk`) — also defined for advanced use.

## Tools / function calling

Declare callable functions in `tools`. Each `Tool` is
`{ "type": "function", "function": <Function> }` where `Function` is
`{ name, description?, parameters (JSON Schema object), strict? }` (`name` and
`parameters` required). `tool_choice` is one of the `ToolChoiceEnum` strings —
`auto` (default), `none`, `any`, `required` — or a `ToolChoice` object
`{ "type": "function", "function": { "name": "..." } }` to force one function.
With `parallel_tool_calls: true` (default) the model can return several calls in
one turn.

Round trip: send `tools` → the assistant replies with `finish_reason:
"tool_calls"` and `message.tool_calls[]` (each a `ToolCall` =
`{ id, type: "function", function: { name, arguments } }`, where `arguments` is a
JSON string) → you run each tool → append the assistant message **and** one
`ToolMessage` per call (matching `tool_call_id`) → call again for the final
answer.

```jsonc
// 1) Request
{ "model": "mistral-large-latest",
  "messages": [{ "role": "user", "content": "Weather in Paris?" }],
  "tools": [{ "type": "function", "function": {
    "name": "get_weather",
    "description": "Get current weather for a city",
    "parameters": { "type": "object",
      "properties": { "city": { "type": "string" } },
      "required": ["city"] } }] }

// 2) Assistant response (finish_reason: "tool_calls")
{ "role": "assistant", "content": "",
  "tool_calls": [{ "id": "abc123", "type": "function",
    "function": { "name": "get_weather", "arguments": "{\"city\": \"Paris\"}" } }] }

// 3) Follow-up request: replay the assistant turn + the tool result
{ "model": "mistral-large-latest", "messages": [
  { "role": "user", "content": "Weather in Paris?" },
  { "role": "assistant", "content": "", "tool_calls": [/* the call from step 2 */] },
  { "role": "tool", "tool_call_id": "abc123", "name": "get_weather",
    "content": "{\"tempC\": 18, \"sky\": \"cloudy\"}" } ] }
// → assistant returns the natural-language answer
```

## Structured outputs

`response_format` (`ResponseFormat`, default `{ "type": "text" }`):

- **`{ "type": "json_object" }`** — JSON mode: output is guaranteed valid JSON.
  You **must** also instruct the model to produce JSON in a system/user message.
- **`{ "type": "json_schema", "json_schema": <JsonSchema> }`** — output is valid
  JSON **and** conforms to your schema. `JsonSchema` =
  `{ name, schema, description?, strict? }` (`name` + `schema` required; `schema`
  is a JSON Schema object — note the SDK names this field `schema_definition`).

```json
{ "type": "json_schema",
  "json_schema": { "name": "book", "strict": true,
    "schema": { "type": "object",
      "properties": { "name": {"type":"string"},
                      "authors": {"type":"array","items":{"type":"string"}} },
      "required": ["name","authors"], "additionalProperties": false } } }
```

## Streaming

Set `stream: true` to receive SSE. The body is `text/event-stream`: each event's
`data:` is a `CompletionEvent` → `CompletionChunk`
(`{ id, object, created, model, usage?, choices[] }`). Each
`CompletionResponseStreamChoice` carries `index`, `finish_reason`
(`stop` / `length` / `error` / `tool_calls` / `null`), and a `delta`
(`DeltaMessage` — incremental `role` / `content` / `tool_calls`). Concatenate
the `delta.content` pieces. The stream ends with a literal `data: [DONE]` line.

## Response (`ChatCompletionResponse`)

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Completion id, e.g. `cmpl-…` |
| `object` | string | `chat.completion` |
| `model` | string | Model used |
| `created` | int | Unix timestamp |
| `choices` | `ChatCompletionChoice`[] | One per `n` |
| `usage` | `UsageInfo` | Token accounting |

**`ChatCompletionChoice`:** `index`, `message` (`AssistantMessage` —
`content` + optional `tool_calls[]`), and `finish_reason`
(`stop` / `length` / `model_length` / `error` / `tool_calls`).
**`UsageInfo`:** `prompt_tokens`, `completion_tokens`, `total_tokens`
(+ optional `prompt_audio_seconds`).

## Examples

```bash
# cURL
curl https://api.mistral.ai/v1/chat/completions \
  -H "Authorization: Bearer $MISTRAL_API_KEY" -H 'Content-Type: application/json' \
  -d '{"model":"mistral-large-latest",
       "messages":[{"role":"user","content":"Who is the best French painter? Answer in one short sentence."}]}'
```
```python
# Python (SDK)
import os
from mistralai import Mistral
client = Mistral(api_key=os.environ["MISTRAL_API_KEY"])

res = client.chat.complete(
    model="mistral-large-latest",
    messages=[{"role": "user", "content": "Who is the best French painter?"}],
)
print(res.choices[0].message.content)

# Streaming
for event in client.chat.stream(
    model="mistral-large-latest",
    messages=[{"role": "user", "content": "Count to five."}],
):
    print(event.data.choices[0].delta.content or "", end="")
```
```typescript
// TypeScript (SDK)
import { Mistral } from "@mistralai/mistralai";
const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

const res = await client.chat.complete({
  model: "mistral-large-latest",
  messages: [{ role: "user", content: "Who is the best French painter?" }],
});
console.log(res.choices[0].message.content);

// Streaming
const stream = await client.chat.stream({
  model: "mistral-large-latest",
  messages: [{ role: "user", content: "Count to five." }],
});
for await (const event of stream) {
  process.stdout.write(event.data.choices[0].delta.content ?? "");
}
```

## Notes
- Set `temperature` **or** `top_p`, not both (Mistral's own guidance).
- JSON mode (`json_object`) needs an explicit "respond in JSON" instruction in
  the prompt; `json_schema` enforces a schema without one.
- `tool_calls[].function.arguments` is a **JSON string** — parse it before use.
- Echo each `ToolCall.id` back as the matching `ToolMessage.tool_call_id`.
- SDK method names (`client.chat.complete` / `client.chat.stream`) follow the
  conventional Mistral SDK surface — verify against the installed SDK version if
  a call fails; the cURL above is authoritative.
- `tools` also accepts built-in tool types (`web_search`, `code_interpreter`,
  `image_generation`, `document_library`, connectors) beyond `function`.
