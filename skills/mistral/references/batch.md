# Batch — `/v1/batch/jobs` (async, high-volume inference)

Run a large set of requests asynchronously at lower cost. You upload a `.jsonl`
file of requests (each line a `{custom_id, body}` object) to `/v1/files` with
`purpose: "batch"`, create a batch job pointing at that file and a target
endpoint, then poll the job until it reaches a terminal status and download the
output/error files.

- **Endpoints:** `GET /v1/batch/jobs`, `POST /v1/batch/jobs`, `GET /v1/batch/jobs/{job_id}`, `POST /v1/batch/jobs/{job_id}/cancel`, `DELETE /v1/batch/jobs/{job_id}`
- **Docs:** https://docs.mistral.ai/api/endpoint/batch
- **Spec:** [openapi.yaml](openapi.yaml) (`CreateBatchJobRequest` / `BatchJob` / `BatchJobStatus`)

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/v1/batch/jobs` | List batch jobs |
| `POST` | `/v1/batch/jobs` | Create a batch job (queued for processing) |
| `GET` | `/v1/batch/jobs/{job_id}` | Get one job's details/status |
| `POST` | `/v1/batch/jobs/{job_id}/cancel` | Request cancellation |
| `DELETE` | `/v1/batch/jobs/{job_id}` | Request deletion |

### `GET /v1/batch/jobs` — Get Batch Jobs

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `page` | int | no | 0 | Page index |
| `page_size` | int | no | 100 | Items per page |
| `model` | string \| null | no | null | Filter by model |
| `agent_id` | string \| null | no | null | Filter by agent id |
| `metadata` | object \| null | no | null | Filter by metadata key/values |
| `created_after` | date-time \| null | no | null | Only jobs created after this time |
| `created_by_me` | bool | no | false | Only jobs you created |
| `status` | array of `BatchJobStatus` \| null | no | null | Filter by status (see below) |
| `order_by` | enum `created` \| `-created` | no | `-created` | Sort order |

Returns `ListBatchJobsResponse`: `data` (`BatchJob[]`), `object` (`"list"`),
`total`.

### `POST /v1/batch/jobs` — Create Batch Job (`application/json`)

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `input_files` | array of string (uuid) \| null | no* | null | `.jsonl` file ids (from `/v1/files`, `purpose=batch`). Each line: `{"custom_id":"0","body":{…request payload…}}`. |
| `requests` | array of `BatchRequest` (max 10000) \| null | no* | null | Inline requests instead of files; each is `{custom_id?, body}`. |
| `endpoint` | `ApiEndpoint` | **yes** | — | Target endpoint for every request (see allowed values below). |
| `model` | string \| null | no | null | Model for the batch, e.g. `mistral-small-latest`, `mistral-medium-latest`. |
| `agent_id` | string \| null | no | null | Use a specific agent (from the **deprecated** agents API) instead of `model`. |
| `metadata` | object (string→string) \| null | no | null | Arbitrary tags. Keys 1–32 chars, values 1–512 chars. |
| `timeout_hours` | int | no | 24 | Hours before the job times out. |

\* Provide `input_files` **or** `requests`. `endpoint` is the only strictly
required field in the schema.

**`endpoint` (`ApiEndpoint`) allowed values:** `/v1/chat/completions`,
`/v1/embeddings`, `/v1/fim/completions`, `/v1/moderations`,
`/v1/chat/moderations`, `/v1/ocr`, `/v1/classifications`,
`/v1/chat/classifications`, `/v1/conversations`, `/v1/audio/transcriptions`.

Returns a `BatchJob`.

### `GET /v1/batch/jobs/{job_id}` — Get Batch Job

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `job_id` | string (uuid) | **yes** | — | The job to fetch |
| `inline` | bool \| null | no | null | If true, return results inline in the response |

Returns a `BatchJob`.

### `POST /v1/batch/jobs/{job_id}/cancel` — Cancel Batch Job

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `job_id` | string (uuid) | **yes** | — | The job to cancel |

Returns the updated `BatchJob` (status moves to `CANCELLATION_REQUESTED`, then
`CANCELLED`).

### `DELETE /v1/batch/jobs/{job_id}` — Delete Batch Job

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `job_id` | string (uuid) | **yes** | — | The job to delete |

Returns `DeleteBatchJobResponse`: `id`, `object` (`"batch"`), `deleted` (bool).

## `BatchJob` (response shape)

`id`, `object` (`"batch"`), `input_files[]` (uuid), nullable `metadata`,
`endpoint`, nullable `model` / `agent_id`, nullable `output_file` /
`error_file` (uuid), `errors[]` (`{message, count}`), nullable `outputs[]`,
`status`, `created_at`, `total_requests`, `completed_requests`,
`succeeded_requests`, `failed_requests`, nullable `started_at` / `completed_at`.

**`BatchJobStatus` values:** `QUEUED`, `RUNNING`, `SUCCESS`, `FAILED`,
`TIMEOUT_EXCEEDED`, `CANCELLATION_REQUESTED`, `CANCELLED`. The four terminal
states are `SUCCESS`, `FAILED`, `TIMEOUT_EXCEEDED`, `CANCELLED`.

## Examples

```bash
# cURL — upload input, create, poll, download, then clean up
# 1. Upload the .jsonl request file (purpose=batch) -> capture id as $FILE_ID
curl https://api.mistral.ai/v1/files \
  -H "Authorization: Bearer $MISTRAL_API_KEY" \
  -F purpose=batch -F file=@./requests.jsonl
# 2. Create the job
curl https://api.mistral.ai/v1/batch/jobs \
  -H "Authorization: Bearer $MISTRAL_API_KEY" -H 'Content-Type: application/json' \
  -d '{"input_files":["'"$FILE_ID"'"],
       "endpoint":"/v1/chat/completions",
       "model":"mistral-small-latest",
       "metadata":{"job":"nightly-summaries"},
       "timeout_hours":24}'
# 3. Poll status (repeat until SUCCESS/FAILED/TIMEOUT_EXCEEDED/CANCELLED)
curl https://api.mistral.ai/v1/batch/jobs/$JOB_ID \
  -H "Authorization: Bearer $MISTRAL_API_KEY"
# 4. Download output_file via /v1/files/{id}/content (see files.md), then
#    DELETE the input file you uploaded. Cancel/delete the job if needed:
curl -X POST https://api.mistral.ai/v1/batch/jobs/$JOB_ID/cancel \
  -H "Authorization: Bearer $MISTRAL_API_KEY"
```
```python
# Python (SDK)
import os, time
from mistralai import Mistral
client = Mistral(api_key=os.environ["MISTRAL_API_KEY"])

with open("requests.jsonl", "rb") as f:
    inp = client.files.upload(
        file={"file_name": "requests.jsonl", "content": f}, purpose="batch")

job = client.batch.jobs.create(
    input_files=[inp.id],
    endpoint="/v1/chat/completions",
    model="mistral-small-latest",
    metadata={"job": "nightly-summaries"},
    timeout_hours=24,
)

terminal = {"SUCCESS", "FAILED", "TIMEOUT_EXCEEDED", "CANCELLED"}
while job.status not in terminal:
    time.sleep(10)
    job = client.batch.jobs.get(job_id=job.id)

client.batch.jobs.list(status=["RUNNING", "QUEUED"])   # list
# client.batch.jobs.cancel(job_id=job.id)              # cancel if needed
# Download job.output_file via client.files.download, then delete inp.id.
```
```typescript
// TypeScript (SDK)
import { Mistral } from "@mistralai/mistralai";
import * as fs from "fs";
const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

const inp = await client.files.upload({
  file: { fileName: "requests.jsonl", content: fs.readFileSync("requests.jsonl") },
  purpose: "batch",
});

let job = await client.batch.jobs.create({
  inputFiles: [inp.id],
  endpoint: "/v1/chat/completions",
  model: "mistral-small-latest",
  metadata: { job: "nightly-summaries" },
  timeoutHours: 24,
});

const terminal = ["SUCCESS", "FAILED", "TIMEOUT_EXCEEDED", "CANCELLED"];
while (!terminal.includes(job.status)) {
  await new Promise((r) => setTimeout(r, 10_000));
  job = await client.batch.jobs.get({ jobId: job.id });
}
// await client.batch.jobs.cancel({ jobId: job.id });
```

## Notes
- The cURL calls are authoritative. SDK methods follow the conventional
  `client.batch.jobs.<create|list|get|cancel>` shape (Python also exposes
  `delete`) — **verify against your installed `mistralai` version**; field casing
  is snake_case in Python, camelCase in TypeScript.
- Provide **`input_files` or `requests`** — files for large jobs, inline
  `requests` (max 10000) for small ones. `endpoint` is always required.
- Each input line is `{"custom_id":"…","body":{…endpoint request payload…}}`;
  `custom_id` lets you map outputs back to inputs.
- Upload input files with `purpose: "batch"` and **delete them once you've
  downloaded the results** — see [files.md](files.md) and its delete-after-use
  callout. Read results from `output_file` (and `error_file`) via
  `GET /v1/files/{id}/content`.
- Poll `GET /v1/batch/jobs/{job_id}` until `status` is terminal; track progress
  with `completed_requests` / `succeeded_requests` / `failed_requests`.
- `metadata` keys are 1–32 chars and values 1–512 chars.
