# Files — `/v1/files` (upload, list, retrieve, delete, download, sign)

Upload files once and reuse them across endpoints — OCR, audio transcription,
batch inference, and fine-tuning all consume a `file_id` you get back from
`POST /v1/files`. Individual files can be up to **512 MB**; the fine-tuning API
only accepts `.jsonl`.

- **Endpoints:** `POST /v1/files`, `GET /v1/files`, `GET /v1/files/{file_id}`, `DELETE /v1/files/{file_id}`, `GET /v1/files/{file_id}/content`, `GET /v1/files/{file_id}/url`
- **Docs:** https://docs.mistral.ai/api/endpoint/files
- **Spec:** [openapi.yaml](openapi.yaml) (`FileSchema` / `CreateFileResponse` / `FilePurpose`)

## Delete files you upload

> **Any file you upload to `/v1/files` solely to feed another call** — OCR,
> transcription, batch, fine-tuning — **MUST be deleted with
> `DELETE /v1/files/{file_id}` as soon as you have the result.** Uploaded files
> persist and accrue storage cost until deleted. Treat the upload as a temporary
> handle: upload → use the `file_id` → download/read the result → delete.
>
> **Never delete a file id the *user* supplied** (e.g. an existing batch input,
> a fine-tuning dataset, or any id they handed you). Only delete ids *you*
> created for a one-shot call.
>
> The bundled runner `scripts/mistral_ocr.py` does this automatically for
> `--file` uploads — it deletes its own upload after OCR completes. See
> [ocr.md](ocr.md) for the full local-file → upload → OCR → delete pattern.

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/v1/files` | Upload a file (multipart) |
| `GET` | `/v1/files` | List files in your organization |
| `GET` | `/v1/files/{file_id}` | Retrieve metadata for one file |
| `DELETE` | `/v1/files/{file_id}` | Delete a file |
| `GET` | `/v1/files/{file_id}/content` | Download file bytes (binary) |
| `GET` | `/v1/files/{file_id}/url` | Get a temporary signed download URL |

### `POST /v1/files` — Upload File (`multipart/form-data`)

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `file` | binary | **yes** | — | The file object (not the file name) to upload. Use `file=@path;filename=custom.ext` to override the stored name. |
| `purpose` | enum `fine-tune` \| `batch` \| `ocr` | no | — | What the file is for. (`FilePurpose`. The API also accepts `audio` for transcription uploads.) |
| `visibility` | enum `workspace` \| `user` | no | `workspace` | Who in the org can see the file |
| `expiry` | int \| null | no | null | File expiry (hours) |

Returns `CreateFileResponse`: `id`, `object` (`"file"`), `bytes`, `created_at`,
`filename`, `purpose`, `sample_type`, `source`, plus nullable `num_lines`,
`mimetype`, `signature`, `expires_at`, `visibility`.

### `GET /v1/files` — List Files

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `page` | int | no | 0 | Page index |
| `page_size` | int | no | 100 | Items per page |
| `include_total` | bool | no | true | Include `total` count in the response |
| `sample_type` | array of `SampleType` \| null | no | null | Filter by sample type (`pretrain`, `instruct`, `batch_request`, `batch_result`, `batch_error`) |
| `source` | array of `Source` \| null | no | null | Filter by source (`upload`, `repository`, `mistral`) |
| `search` | string \| null | no | null | Filter by filename substring |
| `purpose` | `FilePurpose` \| null | no | null | Filter by purpose |
| `mimetypes` | array of string \| null | no | null | Filter by MIME type |

Returns `ListFilesResponse`: `data` (`FileSchema[]`), `object`, nullable `total`.

### `GET /v1/files/{file_id}` — Retrieve File

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `file_id` | string (uuid) | **yes** | — | The file to retrieve |

Returns `GetFileResponse` — the `FileSchema` fields plus a `deleted` boolean.

### `DELETE /v1/files/{file_id}` — Delete File

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `file_id` | string (uuid) | **yes** | — | The file to delete |

Returns `DeleteFileResponse`: `id`, `object` (`"file"`), `deleted` (bool).

### `GET /v1/files/{file_id}/content` — Download File

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `file_id` | string (uuid) | **yes** | — | The file to download |

Returns the raw bytes as `application/octet-stream`.

### `GET /v1/files/{file_id}/url` — Get Signed URL

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `file_id` | string (uuid) | **yes** | — | The file to sign |
| `expiry` | int | no | 24 | Hours before the URL expires. **Must be between 1 and 168.** |

Returns `GetSignedUrlResponse`: `{ "url": "https://…" }`.

## Examples

```bash
# cURL — upload a JSONL batch input, list, sign, download, then delete
# Upload (multipart):
curl https://api.mistral.ai/v1/files \
  -H "Authorization: Bearer $MISTRAL_API_KEY" \
  -F purpose=batch \
  -F file=@./requests.jsonl
# List:
curl "https://api.mistral.ai/v1/files?purpose=batch&page_size=20" \
  -H "Authorization: Bearer $MISTRAL_API_KEY"
# Retrieve one:
curl https://api.mistral.ai/v1/files/$FILE_ID \
  -H "Authorization: Bearer $MISTRAL_API_KEY"
# Signed URL (valid 48h):
curl "https://api.mistral.ai/v1/files/$FILE_ID/url?expiry=48" \
  -H "Authorization: Bearer $MISTRAL_API_KEY"
# Download bytes:
curl https://api.mistral.ai/v1/files/$FILE_ID/content \
  -H "Authorization: Bearer $MISTRAL_API_KEY" -o downloaded.jsonl
# Delete (do this once you have the result):
curl -X DELETE https://api.mistral.ai/v1/files/$FILE_ID \
  -H "Authorization: Bearer $MISTRAL_API_KEY"
```
```python
# Python (SDK)
import os
from mistralai import Mistral
client = Mistral(api_key=os.environ["MISTRAL_API_KEY"])

# Upload
with open("requests.jsonl", "rb") as f:
    up = client.files.upload(
        file={"file_name": "requests.jsonl", "content": f},
        purpose="batch",
    )

client.files.list(purpose="batch")          # list
client.files.retrieve(file_id=up.id)        # metadata
signed = client.files.get_signed_url(file_id=up.id, expiry=48)
content = client.files.download(file_id=up.id)   # bytes (stream)
client.files.delete(file_id=up.id)          # delete once done
```
```typescript
// TypeScript (SDK)
import { Mistral } from "@mistralai/mistralai";
import * as fs from "fs";
const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

const up = await client.files.upload({
  file: { fileName: "requests.jsonl", content: fs.readFileSync("requests.jsonl") },
  purpose: "batch",
});

await client.files.list({ purpose: "batch" });
await client.files.retrieve({ fileId: up.id });
const signed = await client.files.getSignedUrl({ fileId: up.id, expiry: 48 });
const content = await client.files.download({ fileId: up.id });
await client.files.delete({ fileId: up.id });
```

## Notes
- The cURL calls are authoritative. SDK method names follow the conventional
  `client.files.<upload|list|retrieve|delete|download|get_signed_url>` shape —
  **verify against your installed `mistralai` version** (the upload payload key
  and the download return type vary by SDK release).
- `purpose` accepts `fine-tune`, `batch`, `ocr` (and `audio` for transcription).
  Fine-tuning files must be `.jsonl`.
- Signed-URL `expiry` is clamped to **1–168 hours** (default 24).
- A `GET .../content` response is binary — write it to a file, don't print it.
- Storage is billed until deletion — see the callout above and [ocr.md](ocr.md).
