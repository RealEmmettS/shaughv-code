# Crystal Upscaler - exhaustive API reference

Faithful to the fal.ai source doc, the model page, and the live OpenAPI schema
(`x-fal-metadata.endpointId = clarityai/crystal-upscaler`), cross-checked field by field.

- **Endpoint id / model:** `clarityai/crystal-upscaler`
- **Category / kind:** image-to-image / inference
- **Sync URL:** `https://fal.run/clarityai/crystal-upscaler`
- **Queue host:** `https://queue.fal.run`
- **Auth:** header `Authorization: Key <FAL_KEY>` (OpenAPI `securitySchemes.apiKeyAuth`, in: header, name: Authorization)
- **Playground:** https://fal.ai/models/clarityai/crystal-upscaler
- **API docs:** https://fal.ai/models/clarityai/crystal-upscaler/api
- **OpenAPI:** https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=clarityai/crystal-upscaler

The model uses Clarity AI's architecture, tuned for **facial detail and portrait photography**
(skin texture, eye clarity, feature sharpness) rather than generic edge enhancement.
**Output license: commercial use permitted.**

---

## Input schema (`CrystalUpscalerInput`)

| Field | Type | Required | Default | Range / notes |
|---|---|---|---|---|
| `image_url` | string | **yes** | - | URL to the input image. **`max_file_size` = 104,857,600 bytes (100 MiB).** Accepts an https URL or a base64 `data:` URI. Input formats: **JPEG, PNG, WebP, GIF, AVIF**. |
| `scale_factor` | number | no | `2` | min `1`, max `200`. Output area grows with the **square** of this. 200x is for severely degraded inputs (low-res scans, compressed social-media downloads). |
| `creativity` | number | no | `0` | min `0`, max `10`. Hallucination-vs-preservation dial: **low = strict detail preservation** (best for real faces/likeness), high = AI-enhanced reconstruction for damaged/very-low-res inputs. |
| `output_format` | string (enum) | no | `"jpg"` | `"png"` or `"jpg"`. (The model's native upscaled output is PNG; this skill defaults to `png`.) |

`x-fal-order-properties`: `image_url, scale_factor, creativity, output_format`.
There are **no other input fields** - no `seed` (so results are not seed-reproducible, though
`creativity: 0` is effectively deterministic), no `sync_mode`, no `num_images`, no prompts.

### Example request body
```json
{
  "image_url": "https://example.com/portrait.png",
  "scale_factor": 2,
  "creativity": 0,
  "output_format": "png"
}
```

---

## Output schema (`CrystalUpscalerOutput`)

Top level: `images` (array, **required**) - a list of **Image objects** (not bare strings; the
doc/OpenAPI example showing a string array is simplified). No other top-level fields.

### `Image` object
| Field | Type | Required | Example |
|---|---|---|---|
| `url` | string | **yes** | `https://v3b.fal.media/files/.../out.png` |
| `content_type` | string \| null | no | `image/png` |
| `file_name` | string \| null | no | `z9RV14K95DvU.png` (auto-generated if absent) |
| `file_size` | integer \| null | no | `4404019` (bytes) |
| `width` | integer \| null | no | `1024` |
| `height` | integer \| null | no | `1024` |

Read the result as `result["images"][0]["url"]`; download that URL to save the file.

```json
{ "images": [ { "url": "https://.../out.png", "content_type": "image/png", "width": 2172, "height": 2896, "file_size": 12345678 } ] }
```

---

## Pricing

**`$0.016 per OUTPUT megapixel`** - cost is directly proportional to output resolution, not a
fixed per-image price. (fal: *"Pay only for output megapixels rather than per-image."*)

```
output_megapixels = (input_width  * scale_factor) * (input_height * scale_factor) / 1_000_000
                  = input_megapixels * scale_factor**2
cost_usd          = output_megapixels * 0.016
```

fal's own worked examples: **2x on 512px = $0.004**, **4 MP output = $0.064**, **16 MP = $0.256**.

| Input | Scale | Output | Output MP | Cost |
|---|---|---|---|---|
| 512x512 (0.26 MP) | 2x | 1024x1024 | 1.05 | ~$0.017 |
| 1024x1024 (1.05 MP) | 2x | 2048x2048 | 4.19 | ~$0.067 |
| 1086x1448 (1.57 MP) | 2x | 2172x2896 | 6.29 | ~$0.101 |
| 1086x1448 (1.57 MP) | 4x | 4344x5792 | 25.2 | ~$0.403 |
| 2000x2000 (4.0 MP) | 2x | 4000x4000 | 16.0 | ~$0.256 |
| 2000x2000 (4.0 MP) | 4x | 8000x8000 | 64.0 | ~$1.024 |

No documented per-request minimum or rounding rule. There is **no documented hard cap** on
output resolution for the image model (the related crystal *video* upscaler caps at 5K), but
very large outputs are slow and expensive - use the queue path for them.

---

## Endpoints

### Synchronous (small/fast jobs)
`POST https://fal.run/clarityai/crystal-upscaler` with the JSON body; blocks and returns the
result directly. Can time out on large/slow jobs - prefer the queue for those.

### Queue (recommended; what the SDK's `subscribe` uses)
Server: `https://queue.fal.run`. Every call needs `Authorization: Key <FAL_KEY>`.

| Action | Method + path | Returns |
|---|---|---|
| Submit | `POST /clarityai/crystal-upscaler` | `QueueStatus` (`request_id`, `status_url`, `response_url`, `cancel_url`, `queue_position`) |
| Status | `GET /clarityai/crystal-upscaler/requests/{request_id}/status?logs=1` | `QueueStatus` with `status` and `logs` |
| Result | `GET /clarityai/crystal-upscaler/requests/{request_id}` | `CrystalUpscalerOutput` |
| Cancel | `PUT /clarityai/crystal-upscaler/requests/{request_id}/cancel` | `{ "success": bool }` |

`status` enum: `IN_QUEUE` -> `IN_PROGRESS` -> `COMPLETED`.

> Robustness tip: use the `status_url` / `response_url` that the **submit** response returns
> rather than constructing the paths yourself; they are authoritative across API versions.

### Webhooks (optional async)
Pass `webhook_url` to `fal_client.submit(...)`; fal POSTs the finished payload to your URL as
`{ "request_id": ..., "status": "OK"|"ERROR", "payload": { "images": [...] } }`.

---

## Clients

### fal-client (Python) - `pip install fal-client`
Reads `FAL_KEY` from the environment automatically.
- `fal_client.upload_file(path: str) -> str` - upload a local file, get a hosted URL (preferred for big files).
- `fal_client.upload(data: bytes, content_type: str) -> str`, `fal_client.upload_image(pil_image) -> str`.
- `fal_client.subscribe(app, arguments=..., with_logs=True, on_queue_update=cb)` - blocks, polls the queue, returns the result dict. The callback receives `Queued` / `InProgress(.logs)` / `Completed(.metrics)`.
- `fal_client.submit(...)` (async, returns a handle / supports `webhook_url`), `fal_client.run(...)` (direct sync).

```python
import fal_client
url = fal_client.upload_file("portrait.png")
result = fal_client.subscribe("clarityai/crystal-upscaler",
    arguments={"image_url": url, "scale_factor": 2, "creativity": 0, "output_format": "png"},
    with_logs=True)
print(result["images"][0]["url"])
```

### cURL (queue)
```bash
REQ=$(curl -s -X POST https://queue.fal.run/clarityai/crystal-upscaler \
  -H "Authorization: Key $FAL_KEY" -H "Content-Type: application/json" \
  -d '{"image_url":"https://example.com/p.png","scale_factor":2,"output_format":"png"}')
RID=$(echo "$REQ" | python -c "import sys,json;print(json.load(sys.stdin)['request_id'])")
curl -s "https://queue.fal.run/clarityai/crystal-upscaler/requests/$RID/status" -H "Authorization: Key $FAL_KEY"
curl -s "https://queue.fal.run/clarityai/crystal-upscaler/requests/$RID"        -H "Authorization: Key $FAL_KEY"
```

### cURL (sync)
```bash
curl -s -X POST https://fal.run/clarityai/crystal-upscaler \
  -H "Authorization: Key $FAL_KEY" -H "Content-Type: application/json" \
  -d '{"image_url":"https://example.com/p.png"}'
```

### JavaScript - `npm i @fal-ai/client`
```javascript
import { fal } from "@fal-ai/client";
const result = await fal.subscribe("clarityai/crystal-upscaler", {
  input: { image_url: "https://example.com/p.png", scale_factor: 2, output_format: "png" },
  logs: true,
});
console.log(result.data.images[0].url);
```

---

## Fitting oversized inputs (`fit.py`)

The API rejects an `image_url` over **100 MiB**. `fit.py` shrinks any over-limit input under
that target, **least -> most destructive**, **stopping at the first stage that fits** (max
retained quality), preserving aspect ratio, then **verifies** the result still matches the
original. It only ever uniformly scales + re-encodes; it never crops, and never modifies the
original file (it works on a copy).

1. **Stage 0** - already <= target: pass through unchanged.
2. **Stage 1** - lossless: strip metadata; PNG (optimize) + lossless WebP; keep the smallest.
3. **Stage 2** - near-lossless: WebP q95 (JPEG q95 alt) at full resolution.
4. **Stage 3** - quality descent: binary-search the highest quality `>= floor` that fits, full res.
5. **Stage 4** - resolution descent: scale by `s ~= sqrt(target / bytes) * 0.95` (size ~ pixel
   count) and re-encode, repeating until it fits; guarded by `--fit-min-dimension`.
6. **Stage 5 - integrity gate:** compare the fitted copy to the untouched original -
   (a) aspect ratio within ~2%, (b) structural Pearson correlation `>= --fit-min-correlation`
   (default 0.95) on a normalized 256x256 grayscale grid, (c) perceptual dHash distance. On
   failure, redo once via a pure uniform resize; if it still fails, **abort** rather than send a
   cropped/corrupted image to the API.

```bash
python scripts/fit.py huge.png --max-bytes 104857600 -o fitted.webp --json
```

> Data-URI caveat: the stdlib path base64-encodes the input (~+33% on the request body). For
> very large inputs on that path, pass a lower `--max-bytes` (e.g. ~70 MiB).

---

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| `401` / `403` | Missing/invalid `FAL_KEY`. Header must be `Authorization: Key <key>`. |
| `422` | Out-of-range/invalid param (scale 1-200, creativity 0-10, output_format png/jpg). |
| `413` / "file too large" / input > 100 MiB | Auto-fit (default) or run `fit.py`; on the data-URI path use a lower `--max-bytes`. |
| Stage-5 check fails (looks cropped/missing) | The fitted image diverged from the original; it redoes via pure uniform resize. Only lower `--fit-min-correlation` if the difference is intentional. |
| Sync request times out | Large job - use the queue / `subscribe` (this skill's default). |
| Output face looks "invented" | Lower `creativity` toward 0. |
| Empty `images` in result | Inspect the queue `status` + `logs`; re-submit. |

## Official links
- Platform docs: https://docs.fal.ai
- Python client: https://fal.ai/docs/clients/python
- JS client: https://fal.ai/docs/clients/javascript
- Queue / webhooks / CDN: https://fal.ai/docs
