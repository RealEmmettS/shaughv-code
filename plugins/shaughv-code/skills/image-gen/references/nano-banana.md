# Nano Banana 2 / Gemini (Google) — two backends

Google's fast, high-quality image generation + editing model. Strong at prompt
adherence, extreme aspect ratios, optional web search, and "thinking". The skill
can reach it **two ways** — pick one in SKILL.md Step 2 by which key is present:

| Backend | `spec.backend` | Auth | When to use |
|---|---|---|---|
| **fal.ai** (default) | `"fal"` (or omit) | `FAL_KEY` | A fal key is on the system. Established path. |
| **Native Gemini API** | `"gemini"` | `GEMINI_API_KEY` | Only a Gemini key is present, or the user wants finer control / is using a key vended from a Gemini subscription. |

Both backends drive the same logical model (Nano Banana 2 = `gemini-3.1-flash-image`).
The `generate.py` script handles the request/encoding/parse differences; the spec
stays the same shape apart from `backend` (and optional `model` for native).

---

## Backend A — fal.ai (default, `backend:"fal"`)

Auth: `FAL_KEY`.

| Capability | Endpoint (POST) |
|---|---|
| Text-to-image | `https://fal.run/fal-ai/nano-banana-2` |
| Edit (image-to-image) | `https://fal.run/fal-ai/nano-banana-2/edit` |

Header: `Authorization: Key $FAL_KEY`. Response: `{ "images": [{ "url": ... }], "description": "" }`
(the script downloads each `url`). With `sync_mode: true` the url is a data: URI instead.

### How spec fields map to the request body

The bundled `generate.py` builds the fal body from the spec. **Top-level spec fields**
(`prompt`, `num_images`, `aspect_ratio`, `output_format`, `resolution`, `seed`) are applied
directly; everything else goes in **`params`** and is merged verbatim.

```jsonc
{
  "provider": "nano-banana",
  "backend": "fal",              // or omit — fal is the default
  "mode": "generate",            // or "edit"
  "prompt": "a neon koi swimming through clouds, cinematic",
  "aspect_ratio": "16:9",
  "num_images": 1,
  "output_format": "png",
  "resolution": "2K",
  "seed": 1234,
  "images": ["C:/Users/you/Downloads/in.png"],   // edit only -> becomes image_urls
  "params": {
    "enable_web_search": true,
    "thinking_level": "high",
    "safety_tolerance": "4",
    "system_prompt": "",
    "limit_generations": true
  }
}
```

### Full parameter reference (fal)

| Field | Where | Type / values | Default | Notes |
|---|---|---|---|---|
| `prompt` | top-level | string | — | **Required.** |
| `num_images` | top-level | int 1–4 | 1 | |
| `aspect_ratio` | top-level | `auto`,`21:9`,`16:9`,`3:2`,`4:3`,`5:4`,`1:1`,`4:5`,`3:4`,`2:3`,`9:16`,`4:1`,`1:4`,`8:1`,`1:8` | `auto` | Supports **extreme** ratios (4:1…1:8). |
| `output_format` | top-level | `png`,`jpeg`,`webp` | `png` | |
| `resolution` | top-level | `0.5K`,`1K`,`2K`,`4K` | `1K` | Nano-Banana-only. Affects price (below). |
| `seed` | top-level | int | random | Nano-Banana-only. **fal backend only.** |
| `image_urls` | from `images` | list<string> | — | **Edit only, required.** Local paths are auto-encoded to `data:` URIs; `http(s)://` URLs pass through. Multiple images supported (compositing). |
| `enable_web_search` | `params` | bool | false | +$0.015 when used. |
| `thinking_level` | `params` | `minimal`,`high` | off | Omit to disable. `high` adds +$0.002. |
| `safety_tolerance` | `params` | `"1"`…`"6"` | `"4"` | 1 = strictest, 6 = loosest. |
| `system_prompt` | `params` | string | `""` | Steers persona/output style. |
| `limit_generations` | `params` | bool | true | Caps each prompt round to 1 image; ignore in-prompt count instructions. |
| `sync_mode` | `params` | bool | false | Returns a data URI inline (no request history). |

### Pricing (fal, subject to change)

$0.08 per image at 1K. **2K = ×1.5, 4K = ×2, 0.5K = ×0.75.** Web search +$0.015;
high thinking +$0.002. (~12 images per $1 at 1K.)

---

## Backend B — native Gemini API (`backend:"gemini"`)

Talks to Google directly — no fal.ai in the middle. Gives finer control over the
output and works with API keys vended from a **Gemini subscription**. Auth:
`GEMINI_API_KEY` (sent as the `x-goog-api-key` header).

**The script tries two methods in order and the caller does NOT choose:**

1. **Interactions API** — Google's newest, recommended path. Tried first.
2. **generateContent** — the stable API. Used automatically if Interactions errors
   or returns no image.

| Method | Endpoint (POST) | Extra header |
|---|---|---|
| Interactions (primary) | `https://generativelanguage.googleapis.com/v1beta/interactions` | `Api-Revision: 2026-05-20` |
| generateContent (fallback) | `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent` | — |

Common headers: `x-goog-api-key: $GEMINI_API_KEY`, `Content-Type: application/json`.

### Spec shape (native)

```jsonc
{
  "provider": "nano-banana",
  "backend": "gemini",
  "model": "gemini-3.1-flash-image",   // optional; default = gemini-3.1-flash-image (Nano Banana 2)
  "mode": "generate",                  // or "edit"
  "prompt": "a neon koi swimming through clouds, cinematic",
  "images": ["C:/Users/you/Downloads/in.png"],   // edit only
  "aspect_ratio": "16:9",
  "resolution": "2K",                  // 0.5K|1K|2K|4K — 0.5K maps to "512"; sent only for gemini-3.x
  "output_format": "png",              // png|jpeg|webp -> response mime_type
  "params": {
    "enable_web_search": true,         // Grounding with Google Search (web)
    "enable_image_search": true,       // Grounding with Google Image Search (3.1 Flash only)
    "thinking_level": "high"           // "high" | "minimal" (gemini-3.x)
  }
}
```

### Available models

| `model` | Name | Notes |
|---|---|---|
| `gemini-3.1-flash-image` | **Nano Banana 2** (default) | Best all-round; 0.5K–4K; up to 14 reference images; image-search grounding; video-to-image. |
| `gemini-3-pro-image` | Nano Banana Pro | Professional asset production; advanced "thinking"; up to 4K. |
| `gemini-2.5-flash-image` | Nano Banana | Older; fixed 1024px (size token is omitted automatically). |

### Request bodies the script builds

**Interactions — text-to-image:**

```json
{
  "model": "gemini-3.1-flash-image",
  "input": [ { "type": "text", "text": "<prompt>" } ],
  "response_format": { "type": "image", "aspect_ratio": "16:9", "image_size": "2K", "mime_type": "image/png" },
  "tools": [ { "type": "google_search" } ],
  "generation_config": { "thinking_level": "high" }
}
```

**Interactions — edit:** each input image is appended to `input` as
`{ "type": "image", "mime_type": "image/png", "data": "<raw-base64>" }` (no `data:` prefix).

**generateContent — text-to-image (fallback):**

```json
{
  "contents": [ { "parts": [ { "text": "<prompt>" } ] } ],
  "generationConfig": {
    "responseModalities": ["TEXT", "IMAGE"],
    "imageConfig": { "aspectRatio": "16:9", "imageSize": "2K" },
    "thinkingConfig": { "thinkingLevel": "High" }
  },
  "tools": [ { "google_search": {} } ]
}
```

**generateContent — edit:** images go in `parts` as
`{ "inline_data": { "mime_type": "image/png", "data": "<raw-base64>" } }`.

### How spec fields map (native)

| Spec field | Interactions | generateContent | Notes |
|---|---|---|---|
| `prompt` | `input[].text` | `contents[0].parts[].text` | **Required.** |
| `images` (edit) | `input[]` image blocks | `parts[]` `inline_data` | Raw base64 + mime; local paths read, URLs downloaded first. |
| `aspect_ratio` | `response_format.aspect_ratio` | `imageConfig.aspectRatio` | `auto`/unsupported are **dropped** (model decides). Supported: `1:1,1:4,1:8,2:3,3:2,3:4,4:1,4:3,4:5,5:4,8:1,9:16,16:9,21:9`. |
| `resolution` | `response_format.image_size` | `imageConfig.imageSize` | `0.5K`→`512`, else `1K`/`2K`/`4K`. **Sent only for `gemini-3.*`.** |
| `output_format` | `response_format.mime_type` | (saved by extension) | `png`/`jpeg`/`webp`. |
| `params.enable_web_search` | `tools:[{type:google_search}]` | `tools:[{google_search:{}}]` | Grounding with Google Search. |
| `params.enable_image_search` | `tools[].search_types += image_search` | `google_search.searchTypes.imageSearch` | **3.1 Flash only.** Uses web images as visual context. Combine with web search or use alone. |
| `params.thinking_level` | `generation_config.thinking_level` (`high`/`minimal`) | `thinkingConfig.thinkingLevel` (`High`/`Minimal`) | gemini-3.x only. |
| `params.interactions` | merged verbatim into the Interactions body | — | Power-user raw passthrough. |
| `params.generate_content` | — | merged verbatim into the generateContent body | Power-user raw passthrough (`generationConfig` is shallow-merged). |

### Response parsing (native)

- **Interactions:** the script reads the convenience `output_image.data` (base64) if
  present; otherwise it walks `steps[]`, skips `type:"thought"` steps (interim
  composition images are **not** the result), and pulls image blocks from
  `model_output` steps.
- **generateContent:** it reads `candidates[0].content.parts[]`, skips parts with
  `"thought": true`, and decodes the first `inline_data`/`inlineData` image part.

### Native-backend limits & differences vs. fal

- **One image per call.** `num_images > 1` is ignored (a NOTE is printed) — like Reve.
- **No `seed`** on the native path (fal-only).
- `auto` aspect ratio is unsupported — omit it or pick a real ratio.
- All generated images carry a **SynthID** watermark.
- The two-method fallback is automatic; if **both** error, the script exits non-zero
  and prints the HTTP status/body from each attempt.
