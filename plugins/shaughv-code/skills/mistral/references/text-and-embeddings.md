# Text & embeddings — FIM (code) completion + embeddings

Two non-chat text endpoints: **FIM** fills code between a `prompt` and a `suffix`
(Codestral fill-in-the-middle), and **embeddings** turn text into vectors with
`mistral-embed`.

- **Endpoints:** `POST /v1/fim/completions` · `POST /v1/embeddings`
- **Docs:** https://docs.mistral.ai/api/endpoint/fim · https://docs.mistral.ai/api/endpoint/embeddings
- **Spec:** [openapi.yaml](openapi.yaml) (`FIMCompletionRequest` / `FIMCompletionResponse`, `EmbeddingRequest` / `EmbeddingResponse` / `EmbeddingResponseData`)

## FIM (code) completion — `POST /v1/fim/completions`

Fill-in-the-middle for code. Give a `prompt` (the code before the cursor) and an
optional `suffix` (the code after it); the model generates what goes between. Use
a **code model with FIM support** — `codestral-2404` (default), `codestral-latest`,
or `codestral-2508`. FIM is not for chat — use `/v1/chat/completions` for that.

### Request body (`application/json`)

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `prompt` | string | **yes** | — | The text/code to complete (the code *before* the cursor). |
| `model` | string | **yes** | `codestral-2404` | ID of a FIM-capable code model, e.g. `codestral-latest` / `codestral-2508`. |
| `suffix` | string \| null | no | `""` | Code *after* the cursor. With `prompt` + `suffix` the model fills what's between; without it, it just continues from `prompt`. |
| `temperature` | number \| null (0–1.5) | no | null (model-specific) | Sampling temperature; recommend 0.0–0.7. Alter this or `top_p`, not both. |
| `top_p` | number \| null (0–1] | no | null | Nucleus sampling mass. Alter this or `temperature`, not both. |
| `max_tokens` | integer \| null (≥0) | no | null | Max tokens to generate. Prompt + `max_tokens` must fit the context length. |
| `min_tokens` | integer \| null (≥0) | no | null | Minimum tokens to generate. |
| `stop` | string \| string[] \| null | no | null | Stop generation when one of these tokens is detected. |
| `stream` | boolean | no | `false` | Stream partial progress as SSE (`data:` chunks, terminated by `data: [DONE]`). |
| `random_seed` | integer \| null (≥0) | no | null | Seed for deterministic sampling. |
| `prompt_cache_key` | string \| null | no | null | Opaque key for prompt caching. |
| `metadata` | object \| null | no | null | Arbitrary key/value metadata. |

### Response (`FIMCompletionResponse`)

Same shape as a chat completion (it extends `ChatCompletionResponse`): `id`,
`object` (`chat.completion`), `model`, `created`, `usage`
(`prompt_tokens` / `completion_tokens` / `total_tokens`), and `choices[]`. Each
choice has `index`, `finish_reason`, and `message` (`role`, `content` = the
filled-in code, `tool_calls`, `prefix`). With `stream: true` you instead get a
`text/event-stream` of `CompletionEvent` chunks.

### Examples

```bash
# cURL — fill between prompt and suffix
curl https://api.mistral.ai/v1/fim/completions \
  -H "Authorization: Bearer $MISTRAL_API_KEY" -H 'Content-Type: application/json' \
  -d '{"model":"codestral-latest",
       "prompt":"def add_numbers(a, b):\n    \"\"\"Return the sum of a and b.\"\"\"\n",
       "suffix":"\n\nresult = add_numbers(2, 3)",
       "max_tokens":64}'
```
```python
# Python (SDK)
import os
from mistralai import Mistral
client = Mistral(api_key=os.environ["MISTRAL_API_KEY"])
res = client.fim.complete(
    model="codestral-latest",
    prompt="def add_numbers(a, b):\n    \"\"\"Return the sum of a and b.\"\"\"\n",
    suffix="\n\nresult = add_numbers(2, 3)",
    max_tokens=64,
)
print(res.choices[0].message.content)
```
```typescript
// TypeScript (SDK)
import { Mistral } from "@mistralai/mistralai";
const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
const res = await client.fim.complete({
  model: "codestral-latest",
  prompt: "def add_numbers(a, b):\n    \"\"\"Return the sum of a and b.\"\"\"\n",
  suffix: "\n\nresult = add_numbers(2, 3)",
  maxTokens: 64,
});
console.log(res.choices[0].message.content);
```

## Embeddings — `POST /v1/embeddings`

Turn one string or a list of strings into embedding vectors. Default model is
`mistral-embed`.

### Request body (`application/json`)

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `input` | string \| string[] | **yes** | — | Text (or list of texts) to embed. |
| `model` | string | **yes** | — | ID of the embedding model, e.g. `mistral-embed`. |
| `output_dimension` | integer \| null (>0) | no | null | Output embedding dimension (where supported); a model default is used if omitted. |
| `output_dtype` | enum `float` \| `int8` \| `uint8` \| `binary` \| `ubinary` (`EmbeddingDtype`) | no | `float` | Data type of the output embeddings (where supported). |
| `encoding_format` | enum `float` \| `base64` (`EncodingFormat`) | no | `float` | Format of the embeddings in the response. |
| `metadata` | object \| null | no | null | Arbitrary key/value metadata. |

### Response (`EmbeddingResponse`)

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Response id. |
| `object` | string | `list`. |
| `model` | string | Model used, e.g. `mistral-embed`. |
| `data` | `EmbeddingResponseData[]` | One entry per input. |
| `usage` | object | `prompt_tokens` / `completion_tokens` / `total_tokens`. |

Each `EmbeddingResponseData`: `object` (`embedding`), `embedding` (number[]),
`index` (position in the input list).

### Examples

```bash
# cURL — embed two sentences
curl https://api.mistral.ai/v1/embeddings \
  -H "Authorization: Bearer $MISTRAL_API_KEY" -H 'Content-Type: application/json' \
  -d '{"model":"mistral-embed",
       "input":["Embed this sentence.","As well as this one."]}'
```
```python
# Python (SDK)
import os
from mistralai import Mistral
client = Mistral(api_key=os.environ["MISTRAL_API_KEY"])
res = client.embeddings.create(
    model="mistral-embed",
    inputs=["Embed this sentence.", "As well as this one."],
)
print(len(res.data), len(res.data[0].embedding))
```
```typescript
// TypeScript (SDK)
import { Mistral } from "@mistralai/mistralai";
const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
const res = await client.embeddings.create({
  model: "mistral-embed",
  inputs: ["Embed this sentence.", "As well as this one."],
});
console.log(res.data.length, res.data[0].embedding.length);
```

## Notes
- FIM needs a **code model with FIM support** (the `codestral-*` family); other
  models will reject the request.
- `suffix` is what makes it fill-in-the-middle — omit it and FIM degrades to a
  plain forward completion from `prompt`.
- `temperature` and `top_p`: tune one, not both.
- Embeddings accept a single string or a batch; results come back in `data[]`
  ordered by `index` matching the input order.
- `output_dimension` / `output_dtype` only apply where the model supports them;
  leave them off for default float vectors.
- SDK method names follow the conventional shape (`client.fim.complete`,
  `client.embeddings.create`); verify the exact name/args against the installed
  SDK if a call fails. The cURL calls above are authoritative.
