# Models — `/v1/models` (list, retrieve, delete)

List every model your API key can reach, fetch the capability card for one
model, or delete a fine-tuned model you own. Base models can be listed and
retrieved but **not** deleted — `DELETE` only works on your own fine-tunes.

- **Endpoints:** `GET /v1/models`, `GET /v1/models/{model_id}`, `DELETE /v1/models/{model_id}`
- **Docs:** https://docs.mistral.ai/api/endpoint/models
- **Spec:** [openapi.yaml](openapi.yaml) (`BaseModelCard` / `FTModelCard` / `ModelCapabilities`)

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/v1/models` | List all models available to you |
| `GET` | `/v1/models/{model_id}` | Retrieve one model's capability card |
| `DELETE` | `/v1/models/{model_id}` | Delete a fine-tuned model |

### `GET /v1/models` — List Models

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `provider` | string \| null | no | null | Filter by provider |
| `model` | string \| null | no | null | Filter by model id |

Returns `ModelList`: `object` (`"list"`) and `data[]`, where each entry is a
`BaseModelCard` or an `FTModelCard` (discriminated by `type`: `base` vs
`fine-tuned`).

### `GET /v1/models/{model_id}` — Retrieve Model

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `model_id` | string | **yes** | — | The id of the model (e.g. `ft:open-mistral-7b:587a6b29:20240514:7e773925`) |

Returns one of `BaseModelCard` / `FTModelCard`.

### `DELETE /v1/models/{model_id}` — Delete Model

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `model_id` | string | **yes** | — | The id of the **fine-tuned** model to delete |

Returns `DeleteModelResponse`: `id`, `object` (`"model"`), `deleted` (bool).

## Model cards

**`BaseModelCard`** (`type: base`): `id`, `object` (`"model"`), `created`,
`owned_by` (default `mistralai`), `capabilities`, nullable `name` /
`description`, `max_context_length` (default 32768), `aliases[]`, nullable
`deprecation` / `deprecation_replacement_model`, `default_model_temperature`.

**`FTModelCard`** (`type: fine-tuned`): all of the above plus `job` (the
fine-tuning job id), `root` (the base model it was tuned from), and `archived`
(bool).

**`ModelCapabilities`** (all booleans, default `false`): `completion_chat`,
`function_calling`, `reasoning`, `completion_fim`, `fine_tuning`, `vision`,
`ocr`, `classification`, `moderation`, `audio`, `audio_transcription`,
`audio_transcription_realtime`, `audio_speech`.

## Model catalog

Known model ids by family. **`*-latest` aliases** always point at the current
recommended snapshot; **dated pins** (e.g. `…-2507`, `…-2411`) lock a specific
snapshot for reproducibility. This list is a convenience snapshot — **confirm
the live set with `GET /v1/models`**, which returns exactly what your key can
reach.

| Family | Model ids |
|--------|-----------|
| Chat | `mistral-large-latest`, `mistral-medium-latest`, `mistral-small-latest` |
| OCR | `mistral-ocr-latest` |
| Audio / Voxtral | `voxtral-mini-latest`, `voxtral-mini-2507` |
| Embeddings | `mistral-embed` |
| Moderation | `mistral-moderation-latest`, `mistral-moderation-2411` |

## Examples

```bash
# cURL — list, retrieve, delete
curl https://api.mistral.ai/v1/models \
  -H "Authorization: Bearer $MISTRAL_API_KEY"
curl https://api.mistral.ai/v1/models/mistral-large-latest \
  -H "Authorization: Bearer $MISTRAL_API_KEY"
# Delete a fine-tuned model:
curl -X DELETE https://api.mistral.ai/v1/models/ft:open-mistral-7b:587a6b29:20240514:7e773925 \
  -H "Authorization: Bearer $MISTRAL_API_KEY"
```
```python
# Python (SDK)
import os
from mistralai import Mistral
client = Mistral(api_key=os.environ["MISTRAL_API_KEY"])

models = client.models.list()
for m in models.data:
    print(m.id, m.capabilities)

card = client.models.retrieve(model_id="mistral-large-latest")
print(card.max_context_length)

client.models.delete(model_id="ft:open-mistral-7b:587a6b29:20240514:7e773925")
```
```typescript
// TypeScript (SDK)
import { Mistral } from "@mistralai/mistralai";
const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

const models = await client.models.list();
for (const m of models.data ?? []) console.log(m.id, m.capabilities);

const card = await client.models.retrieve({ modelId: "mistral-large-latest" });
console.log(card.maxContextLength);

await client.models.delete({ modelId: "ft:open-mistral-7b:587a6b29:20240514:7e773925" });
```

## Notes
- The cURL calls are authoritative. SDK methods follow the conventional
  `client.models.<list|retrieve|delete>` shape — **verify against your installed
  `mistralai` version** (field casing differs: snake_case in Python,
  camelCase in TypeScript).
- `DELETE` is only valid for **fine-tuned** models (`type: fine-tuned`).
  Attempting to delete a base model is rejected.
- A model can answer to several ids at once via its `aliases[]` — `*-latest` is
  itself an alias that rolls forward to new snapshots.
- Watch the `deprecation` / `deprecation_replacement_model` fields on a card to
  migrate off retiring snapshots before they're removed.
