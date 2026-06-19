# Classifiers — moderations + classifications

Mistral's classifier endpoints score text against safety categories
(**moderations**) or custom classifier targets (**classifications**). Each comes
in a **raw** flavor (plain text input) and a **chat** flavor (a conversation of
role-tagged messages).

- **Endpoints:** `POST /v1/moderations` · `POST /v1/chat/moderations` · `POST /v1/classifications` · `POST /v1/chat/classifications`
- **Docs:** https://docs.mistral.ai/api/endpoint/classifiers
- **Spec:** [openapi.yaml](openapi.yaml) (`ClassificationRequest` / `ChatModerationRequest` / `ChatClassificationRequest` → `ModerationResponse` / `ClassificationResponse`)

## Moderations

Score text (or a chat) across safety categories. Models:
`mistral-moderation-latest` / `mistral-moderation-2411`. Both variants return a
`ModerationResponse`. Use `/v1/moderations` for free text and
`/v1/chat/moderations` to moderate a conversation in context.

### Raw moderation — `POST /v1/moderations` (`ClassificationRequest`)

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `input` | string \| string[] | **yes** | — | Text to classify. |
| `model` | string | **yes** | — | Model id, e.g. `mistral-moderation-latest`. |
| `metadata` | object \| null | no | null | Arbitrary key/value metadata. |

### Chat moderation — `POST /v1/chat/moderations` (`ChatModerationRequest`)

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `input` | Message[] \| Message[][] | **yes** | — | Chat to classify — an array of `system`/`user`/`assistant`/`tool` messages (discriminated by `role`), or an array of such conversations. |
| `model` | string | **yes** | — | Model id, e.g. `mistral-moderation-latest`. |

### Response (`ModerationResponse`)

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Response id. |
| `model` | string | Model used. |
| `results` | `ModerationObject[]` | One entry per input. |

Each `ModerationObject` has `categories` (object of `category → boolean`
threshold flags) and `category_scores` (object of `category → number` raw
scores). Categories include `sexual`, `hate_and_discrimination`,
`violence_and_threats`, `dangerous_and_criminal_content`, `selfharm`, `health`,
`financial`, `law`, `pii`.

### Examples

```bash
# cURL — raw text moderation
curl https://api.mistral.ai/v1/moderations \
  -H "Authorization: Bearer $MISTRAL_API_KEY" -H 'Content-Type: application/json' \
  -d '{"model":"mistral-moderation-latest",
       "input":["Is this message safe to post?"]}'
```
```python
# Python (SDK)
import os
from mistralai import Mistral
client = Mistral(api_key=os.environ["MISTRAL_API_KEY"])
res = client.classifiers.moderate(
    model="mistral-moderation-latest",
    inputs=["Is this message safe to post?"],
)
print(res.results[0].categories, res.results[0].category_scores)
# Chat moderation:
chat = client.classifiers.moderate_chat(
    model="mistral-moderation-latest",
    inputs=[{"role": "user", "content": "Is this message safe to post?"}],
)
```
```typescript
// TypeScript (SDK)
import { Mistral } from "@mistralai/mistralai";
const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
const res = await client.classifiers.moderate({
  model: "mistral-moderation-latest",
  inputs: ["Is this message safe to post?"],
});
console.log(res.results[0].categories, res.results[0].categoryScores);
// Chat moderation: client.classifiers.moderateChat({ model, inputs: [{ role, content }] })
```

## Classifications

Run a custom classifier (your own fine-tuned classifier model) over text or a
chat. Returns a `ClassificationResponse` whose `results` map each classifier
target to its label scores. Use `/v1/classifications` for free text and
`/v1/chat/classifications` to classify a conversation.

### Raw classification — `POST /v1/classifications` (`ClassificationRequest`)

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `input` | string \| string[] | **yes** | — | Text to classify. |
| `model` | string | **yes** | — | Classifier model id. |
| `metadata` | object \| null | no | null | Arbitrary key/value metadata. |

### Chat classification — `POST /v1/chat/classifications` (`ChatClassificationRequest`)

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `input` | `InstructRequest` \| `InstructRequest[]` | **yes** | — | Chat to classify. Each `InstructRequest` is `{ "messages": [ ...role-tagged messages... ] }` (`system`/`user`/`assistant`/`tool`). Pass one or an array. |
| `model` | string | **yes** | — | Classifier model id. |

### Response (`ClassificationResponse`)

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Response id. |
| `model` | string | Model used. |
| `results` | object[] | One entry per input; each is a map of `target → ClassificationTargetResult`. |

Each `ClassificationTargetResult` has `scores` — an object of `label → number`
for that classifier target.

### Examples

```bash
# cURL — raw text classification
curl https://api.mistral.ai/v1/classifications \
  -H "Authorization: Bearer $MISTRAL_API_KEY" -H 'Content-Type: application/json' \
  -d '{"model":"<your-classifier-model>",
       "input":["I love this product, it works great!"]}'
```
```python
# Python (SDK)
import os
from mistralai import Mistral
client = Mistral(api_key=os.environ["MISTRAL_API_KEY"])
res = client.classifiers.classify(
    model="<your-classifier-model>",
    inputs=["I love this product, it works great!"],
)
print(res.results[0])
# Chat classification:
chat = client.classifiers.classify_chat(
    model="<your-classifier-model>",
    inputs={"messages": [{"role": "user", "content": "I love this product!"}]},
)
```
```typescript
// TypeScript (SDK)
import { Mistral } from "@mistralai/mistralai";
const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
const res = await client.classifiers.classify({
  model: "<your-classifier-model>",
  inputs: ["I love this product, it works great!"],
});
console.log(res.results[0]);
// Chat classification: client.classifiers.classifyChat({ model, inputs: { messages: [...] } })
```

## Notes
- **Moderations** use Mistral's hosted safety models
  (`mistral-moderation-latest` / `mistral-moderation-2411`) and return fixed
  safety `categories` + `category_scores`. **Classifications** run *your own*
  classifier model and return per-target `scores`.
- The `/chat/*` variants take role-tagged messages instead of plain strings, so
  the classifier sees conversational context. Chat moderation takes a message
  array (or array of arrays); chat classification wraps messages in an
  `InstructRequest` (`{ "messages": [...] }`).
- Both raw endpoints accept a single string or a batch; `results` is returned in
  input order.
- SDK method names follow the conventional shape
  (`client.classifiers.moderate` / `moderate_chat` / `classify` /
  `classify_chat`); verify the exact names/args against the installed SDK if a
  call fails. The cURL calls above are authoritative.
