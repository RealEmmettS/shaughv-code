# OCR — `POST /v1/ocr` (document understanding)

Turn a PDF, document, or image into per-page **Markdown**, with optional extracted
images, tables, hyperlinks, headers/footers, confidence scores, and structured
(JSON-schema) annotations.

- **Endpoint:** `POST /v1/ocr` · **Default model:** `mistral-ocr-latest`
- **Docs:** https://docs.mistral.ai/api/endpoint/ocr
- **Bundled runner:** `scripts/mistral_ocr.py` (auto-deletes any file it uploads)
- **Spec:** [openapi.yaml](openapi.yaml) (`OCRRequest` / `OCRResponse`)

## Request body (`application/json`)

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `model` | string | **yes** | — | OCR model, e.g. `mistral-ocr-latest` |
| `document` | `FileChunk` \| `DocumentURLChunk` \| `ImageURLChunk` | **yes** | — | What to OCR (see below) |
| `pages` | string \| int[] \| null | no | null | Pages to process. List `[0,2,5]` or string `"0,2-4"`/`"0-5"`. **0-indexed.** |
| `include_image_base64` | bool \| null | no | null | Return extracted images as base64 |
| `image_limit` | int \| null | no | null | Max images to extract |
| `image_min_size` | int \| null | no | null | Min height/width (px) of images to extract |
| `bbox_annotation_format` | `ResponseFormat` \| null | no | null | Per-image/bbox structured extraction — **`json_schema` only** |
| `document_annotation_format` | `ResponseFormat` \| null | no | null | Whole-document structured extraction — **`json_schema` only** |
| `document_annotation_prompt` | string \| null | no | null | Prompt guiding document annotation (requires `document_annotation_format`) |
| `table_format` | `"markdown"` \| `"html"` | no | markdown | Table output format |
| `extract_header` | bool | no | false | Extract page headers |
| `extract_footer` | bool | no | false | Extract page footers |
| `confidence_scores_granularity` | `"word"` \| `"page"` \| null | no | null | Confidence detail (`word` = per-word, `page` = aggregate). Omit to keep payloads small. |

### `document` input chunks
- **FileChunk** — `{ "type": "file", "file_id": "<uuid>" }` (upload to `/v1/files`
  with `purpose: "ocr"` first; delete it after).
- **DocumentURLChunk** — `{ "type": "document_url", "document_url": "https://…/x.pdf", "document_name": "x.pdf" }`
- **ImageURLChunk** — `{ "type": "image_url", "image_url": "https://…/x.png" }`
  (or a `data:image/png;base64,…` URI; `image_url` may be a string or
  `{ "url": "...", "detail": "low"|"auto"|"high" }`).

### `ResponseFormat` (for annotations)
```json
{ "type": "json_schema",
  "json_schema": { "name": "Invoice", "strict": true,
    "schema_definition": { "type": "object", "properties": { "total": {"type":"number"} } } } }
```

## Response (`OCRResponse`)

| Field | Type | Description |
|-------|------|-------------|
| `pages` | `OCRPageObject[]` | One entry per processed page |
| `model` | string | Model used |
| `document_annotation` | string \| null | Whole-document structured output (JSON string) if requested |
| `usage_info` | `OCRUsageInfo` | `{ pages_processed, doc_size_bytes }` |

**`OCRPageObject`:** `index` (0-based), `markdown`, `images[]`, `tables[]`,
`hyperlinks[]`, `header`, `footer`, `dimensions` (`{dpi,height,width}`),
`confidence_scores`.
**`OCRImageObject`:** `id`, `top_left_x/y`, `bottom_right_x/y`, `image_base64`
(when requested), `image_annotation`.
**`OCRTableObject`:** `id`, `content`, `format` (`markdown`/`html`),
`word_confidence_scores`.
**Confidence:** `OCRPageConfidenceScores` → `average_page_confidence_score`,
`minimum_page_confidence_score`, `word_confidence_scores[]`
(`OCRConfidenceScore` = `{confidence 0-1, start_index, text}`).

## Examples

```bash
# cURL — document URL
curl https://api.mistral.ai/v1/ocr \
  -H "Authorization: Bearer $MISTRAL_API_KEY" -H 'Content-Type: application/json' \
  -d '{"model":"mistral-ocr-latest",
       "document":{"type":"document_url","document_url":"https://arxiv.org/pdf/2201.04234"},
       "pages":[0,1],"include_image_base64":false}'
```
```python
# Python (SDK)
import os
from mistralai import Mistral
client = Mistral(api_key=os.environ["MISTRAL_API_KEY"])
res = client.ocr.process(
    model="mistral-ocr-latest",
    document={"type": "document_url", "document_url": "https://arxiv.org/pdf/2201.04234"},
)
print(res.pages[0].markdown)
```
```typescript
// TypeScript (SDK)
import { Mistral } from "@mistralai/mistralai";
const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
const res = await client.ocr.process({
  model: "mistral-ocr-latest",
  document: { type: "document_url", documentUrl: "https://arxiv.org/pdf/2201.04234" },
});
console.log(res.pages[0].markdown);
```

### Local file → upload → OCR → delete (the right pattern)
The bundled runner does all of this for you and **deletes the upload** afterward:
```bash
python scripts/mistral_ocr.py --file ./contract.pdf --pages 0-3 --out contract.md
python scripts/mistral_ocr.py --image-url https://example.com/receipt.png --include-images --json
```
Doing it by hand: `POST /v1/files` (`purpose=ocr`) → use the returned `file_id` as
`{type:"file",file_id}` → `POST /v1/ocr` → **`DELETE /v1/files/{file_id}`**. See
[files.md](files.md).

## Notes
- Page numbers are **0-indexed** everywhere.
- Structured annotations (`*_annotation_format`) accept **only** `json_schema`.
- Request `confidence_scores_granularity` only when you need it — it enlarges the
  response.
- To extract images, set `include_image_base64: true` (optionally bound with
  `image_limit` / `image_min_size`).
