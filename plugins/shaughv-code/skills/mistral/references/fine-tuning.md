# Fine-tuning — `/v1/fine_tuning/jobs` + `/v1/fine_tuning/models`

Train a custom model on your own `.jsonl` data, then manage the resulting
fine-tuned model. Two flavours: **completion** fine-tuning (the usual
instruction/chat tuning, `job_type: "completion"`) and **classifier**
fine-tuning (`job_type: "classifier"`, with `classifier_targets`). A job is
created → validated → started → runs → `SUCCESS`, after which it exposes a
`fine_tuned_model` id that looks like
`ft:open-mistral-7b:587a6b29:20240514:7e773925` and is usable anywhere a model
name is (`/v1/chat/completions`, `/v1/agents/completions`, etc.).

- **Endpoints:** `GET`/`POST /v1/fine_tuning/jobs` · `GET /v1/fine_tuning/jobs/{job_id}` ·
  `POST /v1/fine_tuning/jobs/{job_id}/cancel` · `POST /v1/fine_tuning/jobs/{job_id}/start` ·
  `PATCH /v1/fine_tuning/models/{model_id}` ·
  `POST`/`DELETE /v1/fine_tuning/models/{model_id}/archive`
- **Docs:** https://docs.mistral.ai/api/endpoint/fine-tuning
- **Training data:** upload `.jsonl` files via `POST /v1/files` with
  `purpose: "fine-tune"` first — the Fine-tuning API only supports `.jsonl`
  (max 512 MB/file). See [files.md](files.md).
- **Spec:** [openapi.yaml](openapi.yaml) (`CreateFineTuningJobRequest`,
  `CompletionTrainingParameters`/`CompletionTrainingParametersIn`,
  `CompletionFineTuningJob` / `ClassifierFineTuningJob`, `TrainingFile`,
  `UpdateModelRequest`)

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/v1/fine_tuning/jobs` | List fine-tuning jobs (filter by model, status, dates, suffix, …) |
| POST | `/v1/fine_tuning/jobs` | Create a fine-tuning job (queued for processing) |
| GET | `/v1/fine_tuning/jobs/{job_id}` | Get one job's details (status, events, checkpoints) |
| POST | `/v1/fine_tuning/jobs/{job_id}/cancel` | Request cancellation of a job |
| POST | `/v1/fine_tuning/jobs/{job_id}/start` | Start a *validated* job (when `auto_start` was false) |
| PATCH | `/v1/fine_tuning/models/{model_id}` | Rename / re-describe a fine-tuned model |
| POST | `/v1/fine_tuning/models/{model_id}/archive` | Archive a fine-tuned model |
| DELETE | `/v1/fine_tuning/models/{model_id}/archive` | Un-archive a fine-tuned model |

### `POST /v1/fine_tuning/jobs` — create job (`CreateFineTuningJobRequest`)

Query param `dry_run` (bool, optional): if `true`, the job is **not** spawned —
the response is sanity-check metadata (`LegacyJobMetadata`) instead of a job.

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `model` | string | **yes** | — | Base model to fine-tune (e.g. `open-mistral-7b`, `mistral-small-latest`) |
| `hyperparameters` | `CompletionTrainingParametersIn` \| `ClassifierTrainingParametersIn` | **yes** | — | Training hyperparameters (see below) |
| `training_files` | `TrainingFile[]` | no | `[]` | Uploaded training files — each `{ file_id (uuid), weight }` |
| `validation_files` | string[] (uuid) \| null | no | null | Uploaded validation files; metrics appear in `checkpoints`. Don't overlap with training data. |
| `suffix` | string \| null | no | null | Added to the model name (1–18 chars, `^[a-zA-Z0-9_-]+$`), e.g. `my-great-model` → `ft:open-mistral-7b:my-great-model:xxx…` |
| `integrations` | `WandbIntegration[]` \| null | no | null | Integrations to enable (Weights & Biases: `type: "wandb"`) |
| `auto_start` | boolean | no | — | Start training immediately after validation. *Will be required in a future release.* |
| `invalid_sample_skip_percentage` | number | no | `0` | Max fraction of invalid samples to skip (0–0.5) |
| `job_type` | `FineTuneableModelType` \| null | no | null | `completion` or `classifier` |
| `repositories` | `CreateGithubRepositoryRequest[]` \| null | no | null | Source repositories (`type: "github"`) |
| `classifier_targets` | `ClassifierTarget[]` \| null | no | null | Label targets — **classifier jobs only** |

**`TrainingFile`:** `{ file_id` (uuid, **required**)`, weight` (number > 0, default `1.0`) `}`.

**`FineTuneableModelType`** enum: `completion` · `classifier`.

#### Hyperparameters (`CompletionTrainingParametersIn`)

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `training_steps` | int (≥1) \| null | no | null | Number of training steps (one weight update per batch) |
| `learning_rate` | number | no | `0.0001` | How much to adjust weights per update (1e-08 – 1) |
| `weight_decay` | number \| null | no | `0.1` | (Advanced) L2 penalty on weights (0–1) |
| `warmup_fraction` | number \| null | no | `0.05` | (Advanced) Fraction of steps for LR warm-up (0–1) |
| `epochs` | number (>0) \| null | no | null | Number of passes over the training data |
| `seq_len` | int (≥100) \| null | no | null | Training sequence length |
| `fim_ratio` | number \| null | no | `0.9` | Fill-in-the-middle ratio (0–1) — completion jobs |

`ClassifierTrainingParametersIn` is identical **minus `fim_ratio`**, plus the
job's `classifier_targets` define the labels (`loss_function`:
`single_class` / `multi_class`).

### `GET /v1/fine_tuning/jobs` — list jobs (query params)

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `page` | integer | no | `0` | Page number |
| `page_size` | integer | no | `100` | Items per page |
| `model` | string \| null | no | — | Filter by fine-tuning model name (exclusive when set) |
| `created_after` | date-time \| null | no | — | Only jobs created after this time |
| `created_before` | date-time \| null | no | — | Only jobs created before this time |
| `created_by_me` | boolean | no | `false` | Only jobs created by the API caller |
| `status` | enum \| null | no | — | One of `QUEUED`, `STARTED`, `VALIDATING`, `VALIDATED`, `RUNNING`, `FAILED_VALIDATION`, `FAILED`, `SUCCESS`, `CANCELLED`, `CANCELLATION_REQUESTED` |
| `wandb_project` | string \| null | no | — | Filter by W&B project |
| `wandb_name` | string \| null | no | — | Filter by W&B run name |
| `suffix` | string \| null | no | — | Filter by model suffix (1–18 chars, `^[a-zA-Z0-9_-]+$`) |

### Job lifecycle endpoints (path param `job_id`, uuid)

| Endpoint | Field | Type | Required | Description |
|----------|-------|------|----------|-------------|
| `GET …/jobs/{job_id}` | `job_id` | string (uuid) | **yes** | Job to fetch — returns `CompletionFineTuningJobDetails` / `ClassifierFineTuningJobDetails` (status, `events`, `checkpoints`, `trained_tokens`, `fine_tuned_model`) |
| `POST …/jobs/{job_id}/cancel` | `job_id` | string (uuid) | **yes** | Request cancellation |
| `POST …/jobs/{job_id}/start` | `job_id` | string (uuid) | **yes** | Start a validated job |

Job state machine (`status`): `QUEUED → VALIDATING → VALIDATED → RUNNING → SUCCESS`,
with `FAILED_VALIDATION` / `FAILED` / `CANCELLATION_REQUESTED` / `CANCELLED` as
terminal/branch states. `fine_tuned_model` is `null` until the job succeeds.

### Manage fine-tuned models (path param `model_id`)

`model_id` is the `ft:…` id, e.g. `ft:open-mistral-7b:587a6b29:20240514:7e773925`.

**`PATCH /v1/fine_tuning/models/{model_id}`** body (`UpdateModelRequest`):

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `name` | string \| null | no | null | New display name |
| `description` | string \| null | no | null | New description |

**`POST …/{model_id}/archive`** → `ArchiveModelResponse` (`{ id, object: "model", archived: true }`).
**`DELETE …/{model_id}/archive`** → `UnarchiveModelResponse` (un-archives the model).

## Examples

```bash
# cURL — upload training data, then create + start a completion fine-tune
# 1) upload the .jsonl (purpose=fine-tune) — returns { "id": "<file_id>", ... }
curl https://api.mistral.ai/v1/files \
  -H "Authorization: Bearer $MISTRAL_API_KEY" \
  -F purpose=fine-tune \
  -F file=@training.jsonl

# 2) create the job (auto_start=true runs it once validation passes)
curl https://api.mistral.ai/v1/fine_tuning/jobs \
  -H "Authorization: Bearer $MISTRAL_API_KEY" -H 'Content-Type: application/json' \
  -d '{"model":"open-mistral-7b",
       "job_type":"completion",
       "training_files":[{"file_id":"<file_id>","weight":1.0}],
       "hyperparameters":{"training_steps":100,"learning_rate":0.0001},
       "suffix":"my-great-model",
       "auto_start":true}'

# 3) poll the job, then (if auto_start was false) start it
curl https://api.mistral.ai/v1/fine_tuning/jobs/<job_id> \
  -H "Authorization: Bearer $MISTRAL_API_KEY"
curl -X POST https://api.mistral.ai/v1/fine_tuning/jobs/<job_id>/start \
  -H "Authorization: Bearer $MISTRAL_API_KEY"
```

```python
# Python (SDK) — names like client.fine_tuning.jobs.* are conventional;
# verify against the installed mistralai SDK.
import os
from mistralai import Mistral
client = Mistral(api_key=os.environ["MISTRAL_API_KEY"])

# upload training data (purpose="fine-tune")
with open("training.jsonl", "rb") as f:
    tf = client.files.upload(file={"file_name": "training.jsonl", "content": f}, purpose="fine-tune")

job = client.fine_tuning.jobs.create(
    model="open-mistral-7b",
    job_type="completion",
    training_files=[{"file_id": tf.id, "weight": 1.0}],
    hyperparameters={"training_steps": 100, "learning_rate": 0.0001},
    suffix="my-great-model",
    auto_start=False,
)
client.fine_tuning.jobs.start(job_id=job.id)          # start a validated job
status = client.fine_tuning.jobs.get(job_id=job.id)   # poll
print(status.status, status.fine_tuned_model)         # -> ft:open-mistral-7b:...
```

```typescript
// TypeScript (SDK) — method names are conventional; verify against @mistralai/mistralai.
import { Mistral } from "@mistralai/mistralai";
import * as fs from "node:fs";
const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

const tf = await client.files.upload({
  file: { fileName: "training.jsonl", content: fs.readFileSync("training.jsonl") },
  purpose: "fine-tune",
});

const job = await client.fineTuning.jobs.create({
  model: "open-mistral-7b",
  jobType: "completion",
  trainingFiles: [{ fileId: tf.id, weight: 1.0 }],
  hyperparameters: { trainingSteps: 100, learningRate: 0.0001 },
  suffix: "my-great-model",
  autoStart: true,
});
const status = await client.fineTuning.jobs.get({ jobId: job.id });
console.log(status.status, status.fineTunedModel);
```

## Notes
- **Training files must be `.jsonl`** uploaded with `purpose: "fine-tune"`; pass
  them as `TrainingFile` objects (`{file_id, weight}`), not bare strings.
- **`auto_start`** controls whether the job runs right after validation. If
  `false`, the job sits at `VALIDATED` until you `POST …/start`. The field is
  slated to become required, so set it explicitly.
- Use **`dry_run=true`** on create to validate inputs without spending compute —
  it returns `LegacyJobMetadata` (expected token count, training steps, etc.).
- **Completion vs classifier:** set `job_type` accordingly. Classifier jobs add
  `classifier_targets` and drop `fim_ratio`; everything else is shared.
- The resulting model id (`ft:<base>:<org>:<date>:<hash>`, plus your `suffix`)
  is the value you pass as `model` to inference endpoints.
- Archiving doesn't delete a model — it hides it from active use; `DELETE …/archive`
  reverses it.
- For Weights & Biases dashboards, add a `wandb` entry to `integrations`.
- cURL above is authoritative. SDK method/argument names (`client.fine_tuning.jobs.*`,
  `client.fineTuning.jobs.*`) follow conventional naming — confirm against the
  spec/SDK you have installed.
