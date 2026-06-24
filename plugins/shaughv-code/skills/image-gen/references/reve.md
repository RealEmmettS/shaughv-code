# Reve (api.reve.com — native API, NOT fal.ai)

Reve's own REST API. Highest quality of the three, 4K-capable via upscaling, with the most
postprocessing options (upscale / remove-background / fit / saved effects) and **test-time
scaling** for extra quality. Editing is on par with — or slightly better than — Nano Banana.
Auth: `Authorization: Bearer $REVE_API_KEY`.

| Capability | Mode | Endpoint (POST) |
|---|---|---|
| Text-to-image | `generate` | `https://api.reve.com/v1/image/create` |
| Edit one image | `edit` | `https://api.reve.com/v1/image/edit` |
| Remix 1–6 images | `remix` | `https://api.reve.com/v1/image/remix` |

## Native quirks the script handles for you

- **Raw base64, NO `data:` prefix** for input images (the opposite of fal).
- **One image per call** — Reve has no `num_images`. (The script warns and ignores it.)
- **No `seed`, no `resolution`, no `output_format` body field.** Size is set by `aspect_ratio`
  (+ `upscale` postprocessing). The default JSON response returns a **PNG** (base64 in the
  `image` field), which the script decodes and saves as `.png`.
- Aspect ratios are limited to `16:9 9:16 3:2 2:3 4:3 3:4 1:1` — `auto`/extreme ratios are
  silently dropped, letting Reve choose.
- **Edit uses `edit_instruction` + a single `reference_image`; remix uses `prompt` + a
  `reference_images` array.** The script maps the spec's `prompt`/`images` to these.

## Per-endpoint request body

### create (`mode: "generate"`)
| Field | Type | Default | Notes |
|---|---|---|---|
| `prompt` | string | — | **Required**, ≤2560 chars, auto-enhanced by the model. |
| `aspect_ratio` | enum | `3:2` | one of the 7 ratios above. |
| `version` | string | `latest` | `latest` or `reve-create@20250915`. |
| `test_time_scaling` | number 1–15 | 1 | >1 costs more credits; >5 rarely helps. |
| `postprocessing` | array | none | see recipes below. |

### edit (`mode: "edit"`)
| Field | Type | Default | Notes |
|---|---|---|---|
| `edit_instruction` | string | — | **Required.** (Comes from the spec's `prompt`.) |
| `reference_image` | base64 string | — | **Required, exactly one** image (raw base64). From `images[0]`. |
| `aspect_ratio` | enum | ref image's ratio | the 7 ratios above. |
| `version` | string | `latest` | `latest-fast`, `latest`, `reve-edit-fast@20251030`, `reve-edit@20250915`. |
| `test_time_scaling` | number 1–15 | 1 | |
| `postprocessing` | array | none | |

### remix (`mode: "remix"`)
| Field | Type | Default | Notes |
|---|---|---|---|
| `prompt` | string | — | **Required**, ≤2560 chars. May reference images by index with `<img>0</img>` tags. |
| `reference_images` | base64 string[] | — | **Required, 1–6** images (raw base64). Each <10MB; total ≤32M pixels. From `images`. |
| `aspect_ratio` | enum | smart | the 7 ratios above. |
| `version` | string | `latest` | `latest-fast`, `latest`, `reve-remix-fast@20251030`, `reve-remix@20250915`. |
| `test_time_scaling` | number 1–15 | 1 | |
| `postprocessing` | array | none | |

In the spec, put `version` / `test_time_scaling` / `postprocessing` inside **`params`**:

```jsonc
{
  "provider": "reve",
  "mode": "remix",
  "prompt": "Style the pancakes in <img>0</img> on the table in <img>1</img>.",
  "images": ["C:/Users/you/Downloads/pancakes.png", "C:/Users/you/Downloads/table.png"],
  "aspect_ratio": "1:1",
  "params": {
    "version": "latest",
    "test_time_scaling": 3,
    "postprocessing": [{ "process": "upscale", "upscale_factor": 2 }]
  }
}
```

## Postprocessing recipes (`params.postprocessing`)

- Upscale: `[{ "process": "upscale", "upscale_factor": 2 }]` — factor 2, 3, or 4 (4× is large).
- Remove background: `[{ "process": "remove_background" }]` — keeps the central subject, transparent bg.
- Fit image: `[{ "process": "fit_image", "max_dim": 512 }]` — or `max_width`/`max_height` (≤4096); free.
- Effect: `[{ "process": "effect", "effect_name": "cmyk_halftone" }]` — must be a saved project
  effect; optional `effect_parameters` overrides (`{ filterId: { uniformId: value } }`).

Recipes can be combined in the array. Cost scales with image size (fit_image is free). To learn
exact cost, inspect `credits_used` in a response.

## Input image limits

≤4096×4096 px and ≤16MB per image; ≤8192×4096 total pixels per call; ≤32MB total after base64
decode (remix: each image <10MB, sum of pixels ≤32M). Formats: WEBP, JPEG, PNG, GIF, TIFF, AVIF.

## Response & errors

Default JSON: `{ "image": "<base64 png>", "version", "content_violation", "request_id",
"credits_used", "credits_remaining" }`. The script saves `image` and aborts if
`content_violation` is true. Non-200 responses carry an `X-Reve-Error-Code` header
(e.g. `PROMPT_TOO_LONG`, `CONTENT_POLICY_VIOLATION`, `MISSING_REQUIRED_PARAMETER`,
`INSUFFICIENT_CREDITS`). Status codes: 400 bad request, 401 unauthorized, 402 out of credits,
422 unprocessable, 429 rate limited, 500 server error.
