# MAI-Image-2.5 (Microsoft, via fal.ai)

Microsoft's photorealistic generation + editing model. Tagged **realism, typography,
stylized** — a good pick for photoreal scenes and posters with legible text. Cheapest and
fastest of the three. Auth: `FAL_KEY`.

| Capability | Endpoint (POST) |
|---|---|
| Text-to-image | `https://fal.run/microsoft/mai-image-2.5` |
| Edit (image-to-image) | `https://fal.run/microsoft/mai-image-2.5/edit` |

Header: `Authorization: Key $FAL_KEY`. Response: `{ "images": [{ "url": ... }], "description": "" }`.

## Smaller parameter surface — important

MAI exposes **far fewer** knobs than Nano Banana. It has **no** `resolution`, `seed`,
`safety_tolerance`, `system_prompt`, `enable_web_search`, or `thinking_level`. Passing those
(e.g. in `params`) risks a `422` from the API — leave them out for MAI.

```jsonc
{
  "provider": "mai",
  "mode": "generate",            // or "edit"
  "prompt": "photorealistic poster of a campus at sunset, banner reading \"LOUISVILLE\" in bold serif",
  "aspect_ratio": "16:9",
  "num_images": 1,
  "output_format": "png",
  "images": ["C:/Users/you/Downloads/in.png"]   // edit only -> becomes image_urls
}
```

## Full parameter reference

| Field | Where | Type / values | Default | Notes |
|---|---|---|---|---|
| `prompt` | top-level | string | — | **Required.** |
| `num_images` | top-level | int 1–4 | 1 | |
| `aspect_ratio` | top-level | `auto`,`1:1`,`4:3`,`3:4`,`16:9`,`9:16`,`3:2`,`2:3` | `auto` | **No extreme ratios** (unlike Nano Banana). |
| `output_format` | top-level | `png`,`jpeg`,`webp` | `png` | |
| `image_urls` | from `images` | list<string> | — | **Edit only, required.** Local paths auto-encoded to `data:` URIs; URLs pass through. |
| `sync_mode` | `params` | bool | false | Returns a data URI inline. |

Do **not** set `resolution`/`seed`/`params` extras for MAI.

## Pricing (subject to change)

~$0.05 per generated image (billed as ~1024 output tokens). Text input $5.00 / 1M tokens;
image input (edit) $8.00 / 1M tokens. Each requested image billed separately.
