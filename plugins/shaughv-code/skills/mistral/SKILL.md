---
name: mistral
description: >
  Comprehensive guide to the Mistral AI API end to end, with OCR, audio
  transcription (Voxtral), and text-to-speech as the primary use cases. Use
  whenever the user mentions Mistral, mistral.ai, api.mistral.ai, La Plateforme,
  MISTRAL_API_KEY, or any Mistral capability — OCR / document understanding /
  PDF-to-Markdown, audio transcription, text-to-speech / voices, chat completions,
  tool calling, structured JSON, vision, embeddings, FIM / code completion,
  moderation & classification, files, batch, fine-tuning, or the Agents &
  Conversations API. Also use when wiring a Mistral key into a project, when a
  request hits api.mistral.ai, or when you see model ids like mistral-large-latest,
  mistral-small-latest, voxtral-*, or mistral-ocr-*. See the body's "When this
  skill fires" for the full trigger surface.
last_verified_against_mistral_docs: 2026-06-19
---

# Mistral AI — full API skill

Drive every Mistral AI service from the command line, from Python, from
TypeScript, or by hand with cURL. The **primary jobs** this skill is built for are
**OCR**, **audio transcription**, and **audio speech (TTS)** — they have bundled,
ready-to-run scripts — but the reference set covers the *entire* API surface
(chat, agents, embeddings, FIM, classifiers, files, models, batch, fine-tuning,
libraries/RAG, connectors, observability, workflows).

- **Base URL:** `https://api.mistral.ai`
- **Auth:** `Authorization: Bearer $MISTRAL_API_KEY` (every endpoint)
- **Console / keys:** https://console.mistral.ai
- **SDKs:** Python `mistralai` (`from mistralai import Mistral`), TypeScript
  `@mistralai/mistralai`, plus raw cURL.

## When this skill fires

Trigger on any mention of **Mistral / mistral.ai / api.mistral.ai / La Plateforme /
console.mistral.ai / `MISTRAL_API_KEY`**, or any Mistral capability: OCR / document
understanding / PDF-to-Markdown (`mistral-ocr-latest`), audio transcription with
Voxtral (`voxtral-mini-latest`), text-to-speech / speech synthesis / voices, chat
completions, function/tool calling, structured JSON outputs, vision, embeddings
(`mistral-embed`), FIM / code completion, moderation & classification, files, batch
jobs, fine-tuning, the Agents & Conversations API, libraries/RAG, connectors,
observability, or workflows. Also when wiring a Mistral key into a project, when a
request hits `api.mistral.ai`, or when you see model ids like `mistral-large-latest`,
`mistral-small-latest`, `voxtral-*`, or `mistral-ocr-*`. This skill covers key
discovery → prompt → save, exact request/response schemas, cURL + Python + TypeScript
examples, and bundles the full OpenAPI spec for offline reference and freshness diffing.

## 1. API key — discover → prompt → save (do this first)

On every invocation, resolve the key in this order; **read
[references/authentication.md](references/authentication.md) for the full flow**:

1. **Environment** — `MISTRAL_API_KEY` (`$env:MISTRAL_API_KEY` / `os.environ`).
2. **Repo** — a git-ignored `.env` (or `.mistral.env`) walking up from the cwd.
3. **Not found → ask the user** for their key (don't invent one). Then save it the
   way they want:
   - **System (per-user, persists across shells):**
     `python scripts/mistral_key.py --set-system <key>`
     (Windows → `[Environment]::SetEnvironmentVariable('MISTRAL_API_KEY',…,'User')`).
   - **Repo (git-ignored `.env`):** `python scripts/mistral_key.py --set-repo <key>`
     (auto-adds `.env` to `.gitignore` — never commit a key).
   - **Session only:** `$env:MISTRAL_API_KEY = '<key>'`.
   - If the user only says "save it," **ask** whether they want system and/or repo.

Quick check (exit 0 = found, 2 = missing):
`python scripts/mistral_key.py --check`

**Never** echo the full key back, log it, or commit it.

## 2. Standing rule — delete files you upload

Some endpoints (OCR on a local doc, transcription via file id, batch, fine-tuning)
take a file you first upload to `/v1/files`. **As soon as you have the result back,
delete any file you uploaded** (`DELETE /v1/files/{id}`) so it doesn't sit in
storage accruing cost. The bundled `scripts/mistral_ocr.py` does this automatically
for `--file` uploads (override with `--keep-upload`). When you upload manually,
clean up the same way — but never delete a file id the *user* supplied. See
[references/files.md](references/files.md).

## 3. Freshness contract — bundled spec + live source

The complete OpenAPI spec is bundled at **[references/openapi.yaml](references/openapi.yaml)**
(~26k lines) so it works offline and is the source of truth for exact field
names/enums. It can drift from production. When something doesn't match, or you
need a capability not documented here, **fetch the live spec and diff it**:

- Live spec: **https://docs.mistral.ai/openapi.yaml**
- Per-endpoint human docs follow a stable pattern —
  **`https://docs.mistral.ai/api/endpoint/<group>[/<operation>]`**, e.g.
  `…/ocr`, `…/audio/transcriptions`, `…/audio/speech`, `…/chat`, `…/embeddings`,
  `…/files`, `…/workflows/executions`.

## 4. Quickstart — OCR a PDF three ways

```bash
# cURL
curl https://api.mistral.ai/v1/ocr \
  -H "Authorization: Bearer $MISTRAL_API_KEY" -H 'Content-Type: application/json' \
  -d '{"model":"mistral-ocr-latest","document":{"type":"document_url","document_url":"https://arxiv.org/pdf/2201.04234"}}'
```
```python
# Python (SDK)
import os
from mistralai import Mistral
client = Mistral(api_key=os.environ["MISTRAL_API_KEY"])
res = client.ocr.process(model="mistral-ocr-latest",
    document={"type": "document_url", "document_url": "https://arxiv.org/pdf/2201.04234"})
print(res.pages[0].markdown)
```
```typescript
// TypeScript (SDK)
import { Mistral } from "@mistralai/mistralai";
const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
const res = await client.ocr.process({ model: "mistral-ocr-latest",
  document: { type: "document_url", documentUrl: "https://arxiv.org/pdf/2201.04234" } });
console.log(res.pages[0].markdown);
```
```bash
# Bundled runner (no SDK needed; auto-deletes any file it uploads)
python scripts/mistral_ocr.py --document-url https://arxiv.org/pdf/2201.04234
```

## 5. Routing — task → reference → script

| Task | Reference | Bundled script |
|------|-----------|----------------|
| **OCR / docs → Markdown** | [ocr.md](references/ocr.md) | `scripts/mistral_ocr.py` |
| **Transcribe audio** | [audio-transcriptions.md](references/audio-transcriptions.md) | `scripts/mistral_transcribe.py` |
| **Text-to-speech / voices** | [audio-speech.md](references/audio-speech.md) | `scripts/mistral_speech.py` |
| API key discover/save | [authentication.md](references/authentication.md) | `scripts/mistral_key.py` |
| Chat, tools, structured output, vision | [chat.md](references/chat.md) | — |
| Embeddings + FIM/code completion | [text-and-embeddings.md](references/text-and-embeddings.md) | — |
| Moderation & classification | [classifiers.md](references/classifiers.md) | — |
| Files (upload/list/delete/signed-url) | [files.md](references/files.md) | (in `_client.py`) |
| Models (list/retrieve/delete) + catalog | [models.md](references/models.md) | — |
| Batch jobs | [batch.md](references/batch.md) | — |
| Fine-tuning | [fine-tuning.md](references/fine-tuning.md) | — |
| Agents & Conversations | [agents.md](references/agents.md) | — |
| Libraries/RAG, connectors, observability, workflows, events, deprecated | [more-endpoints.md](references/more-endpoints.md) | — |

The scripts are **dependency-optional** (pure stdlib; the `mistralai` SDK is only
needed for the SDK code samples). All print JSON on `--json`, log to stderr, and
use exit codes `0` ok / `2` missing key / `1` other error.

## 6. Model catalog (summary — full table in [models.md](references/models.md))

| Family | Ids (examples) | Use |
|--------|----------------|-----|
| Chat | `mistral-large-latest`, `mistral-medium-latest`, `mistral-small-latest` | chat/agents/vision |
| OCR | `mistral-ocr-latest` | document understanding |
| Audio (Voxtral) | `voxtral-mini-latest`, `voxtral-mini-2507` | transcription |
| Embeddings | `mistral-embed` | vectors |
| Moderation | `mistral-moderation-latest` | safety classification |

`*-latest` tracks the newest version; pin a dated id (e.g. `voxtral-mini-2507`) for
reproducibility. Always confirm availability with `GET /v1/models` — don't assume.

## 7. Priority workflows

- **OCR:** `python scripts/mistral_ocr.py --file ./contract.pdf --pages 0-3 --out contract.md`
  — local files are uploaded, OCR'd, then **deleted**. Supports `--document-url`,
  `--image-url`, `--file-id`, `--include-images`, `--table-format`, `--confidence`.
- **Transcription:** `python scripts/mistral_transcribe.py --file ./call.mp3 --language en --diarize --timestamps segment`
  — `--file-url` / `--file-id` / `--stream` also supported.
- **Speech:** `python scripts/mistral_speech.py --input "Hello." --voice <voice_id> --format mp3 --out hello.mp3`
  — list voices with `GET /v1/audio/voices`.

## 8. How to use this skill

1. Resolve the key (§1). If missing, ask the user and save per their choice.
2. Pick the task in the routing table (§5) and open its reference file for exact
   request/response schemas, enums, and triple (cURL/Python/TS) examples.
3. For OCR / transcription / speech, prefer the bundled script; for everything
   else, copy the cURL/SDK snippet from the reference.
4. If a field/endpoint is missing or behaves unexpectedly, consult
   `references/openapi.yaml`, then **diff against the live spec** (§3).
5. Delete any file you uploaded once you have the result (§2).
