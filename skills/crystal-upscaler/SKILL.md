---
name: crystal-upscaler
description: Upscale, enlarge, super-resolve, and enhance images and photos using fal.ai's Clarity Crystal Upscaler (clarityai/crystal-upscaler), purpose-built for faces, portraits, headshots, and profile pictures. Use this whenever the user wants to increase an image's resolution, make a picture bigger or sharper, fix a low-res or blurry photo, restore detail, clean up a compressed download, or prep an image for print or a high-DPI display, even if they don't say the word "upscale". Accepts JPEG, PNG, WebP, GIF, or AVIF as a local file (auto-uploaded), an http(s) URL, or a data URI; supports 1x-200x scale, creativity 0-10, and PNG or JPG output, and auto-shrinks oversized inputs under the 100 MiB API limit. Requires a FAL_KEY env var; bills per output megapixel.
compatibility: Requires Python 3.8+ and a FAL_KEY environment variable. Best with "pip install fal-client" (clean upload + queue polling) and Pillow (auto-fit oversized inputs); scripts/upscale.py also has a dependency-free stdlib fallback. numpy optional. Cross-platform.
metadata:
  model: clarityai/crystal-upscaler
  endpoint: https://fal.run/clarityai/crystal-upscaler
  pricing: $0.016 per output megapixel
---

# Crystal Upscaler

Upscale and enhance images with fal.ai's **Clarity Crystal Upscaler** (`clarityai/crystal-upscaler`),
an image-to-image model tuned for **facial detail and portrait photography** (skin texture, eye
clarity, feature sharpness). It handles everything from a gentle 2x profile-picture bump to 200x
restoration of severely degraded scans.

**Use it when** someone wants to: increase resolution, make an image bigger/sharper, fix a blurry
or low-res photo, restore/deblur a compressed download, or prep an image for print or a retina
display. The bundled `scripts/upscale.py` is the recommended path - it handles upload, queue
polling, output download, cost reporting, and auto-fitting oversized inputs.

## Prerequisites

1. **`FAL_KEY`** in the environment (value format `id:secret`). Get one at https://fal.ai/dashboard/keys.
   - PowerShell (persisted, this machine): `$env:FAL_KEY = [Environment]::GetEnvironmentVariable('FAL_KEY','User')`
   - bash: `export FAL_KEY="..."`
2. Recommended deps: `pip install -r scripts/requirements.txt` (fal-client + Pillow). Not strictly
   required - `upscale.py` falls back to a pure-stdlib queue client if `fal-client` is absent.

## For AI agents / automation

Run one command per image and parse the JSON:

```bash
python scripts/upscale.py INPUT --scale 2 --format png --json
```

- **stdout** is the contract. With `--json` it is a single JSON object; without it, one human line.
- **stderr** carries all progress/logs - never parse it.
- **Exit codes:** `0` success, `2` missing `FAL_KEY`, `1` any other error. Always check it.
- **JSON keys:** `input, image_url, scale_factor, creativity, output_format, output_path,
  output_url, width, height, output_megapixels, cost_usd, file_bytes, request_id, fit`.
  (`fit` is `null` unless an oversized input was shrunk first.)
- The output file is written to `output_path` (auto-named `STEM_2x.png` next to a local input
  unless you pass `-o`).

## Quick start

```bash
# Local file, 2x, PNG (auto-named portrait_2x.png next to it)
python scripts/upscale.py portrait.png --scale 2

# Remote URL, 4x, choose the output path
python scripts/upscale.py https://example.com/headshot.jpg --scale 4 -o headshot_4x.png

# Preserve likeness explicitly (creativity 0) and emit JSON
python scripts/upscale.py pfp.webp --scale 2 --creativity 0 --json
```

## Parameters

| Flag (API field) | Default | Range | Guidance |
|---|---|---|---|
| `INPUT` (`image_url`) | - | required | Local path, http(s) URL, or data URI. Formats: JPEG, PNG, WebP, GIF, AVIF. Max 100 MiB (auto-fit handles bigger). |
| `--scale` (`scale_factor`) | 2 | 1-200 | 2x typical; 3-4x for print; 200x only for severely degraded inputs. **Cost grows with the square of scale.** |
| `--creativity` (`creativity`) | 0 | 0-10 | Hallucination-vs-preservation dial. **Keep 0-2 for real faces/likeness.** Raise only to reconstruct damaged/very-low-res inputs. |
| `--format` (`output_format`) | png | png, jpg | PNG for fidelity (model's native output), JPG for smaller files. |
| `-o/--output` | auto | - | Output path; default `STEM_<scale>x.<format>`. |

There is **no `seed`** parameter, so runs are not seed-reproducible (though `creativity: 0` is
effectively deterministic).

## Decision guide

| Goal | Scale | Creativity | Format |
|---|---|---|---|
| Profile picture / headshot polish | 2x | 0 | png |
| Print / large display | 3-4x | 0-1 | png |
| Restore a low-res scan or compressed social download | 4-8x+ | 1-3 | png |
| Quick web thumbnail enlarge | 2x | 0 | jpg |

## Pricing

`cost = $0.016 x output_megapixels`, where `output_MP = input_MP x scale^2` - you pay for the
**output** resolution. fal's own examples: 2x on 512px = $0.004; 4 MP = $0.064; 16 MP = $0.256.
`upscale.py` prints the exact cost from the returned dimensions. Full table in
[`references/api-reference.md`](references/api-reference.md).

## Inputs and oversized-image fitting

- **Local file** - uploaded to fal storage (via `fal_client.upload_file`) or inlined as a data
  URI on the stdlib path. **Remote URL / data URI** - passed through as-is.
- The API rejects inputs over **100 MiB (104,857,600 bytes)**. `upscale.py` automatically runs
  `scripts/fit.py` first to shrink an over-limit file under the cap, **working on a copy** (your
  original is never modified). The ladder is least -> most destructive and stops as soon as it
  fits: lossless re-encode -> near-lossless WebP -> quality descent -> aspect-preserving downscale.
- A **Stage-5 integrity gate** then proves the fitted copy is the same picture as the original
  (aspect ratio + structural correlation + perceptual hash) - it never crops. If the check fails
  it redoes via a pure uniform resize, and aborts rather than upscale a corrupted input.
- Use `fit.py` standalone too: `python scripts/fit.py big.png --max-bytes 104857600 -o fitted.webp --json`.
- Disable with `--no-fit`; tune with `--max-bytes`, `--fit-min-correlation`, `--fit-min-dimension`,
  `--fit-quality-floor`. On the data-URI path, base64 inflates the body ~33%, so use a lower
  `--max-bytes` (e.g. ~70 MiB) for very large inputs.

## Output

The result is `result["images"][0]["url"]` (a list of objects - the bare-string example in some
docs is simplified). `upscale.py` downloads it to `output_path` and reports `width`, `height`,
`output_megapixels`, and `cost_usd`.

## Batch recipes

PowerShell - upscale every PNG/JPG in a folder 2x:
```powershell
Get-ChildItem *.png,*.jpg | ForEach-Object {
  python scripts/upscale.py $_.FullName --scale 2 --format png --json | ConvertFrom-Json
}
```

bash:
```bash
for f in *.png *.jpg; do
  [ -e "$f" ] && python scripts/upscale.py "$f" --scale 2 --format png --json
done
```

## Examples (raw API)

cURL (sync), Python `fal_client`, and JS `@fal-ai/client` calls, plus the full queue REST flow,
are in [`references/api-reference.md`](references/api-reference.md). Minimal Python:

```python
import fal_client
url = fal_client.upload_file("portrait.png")
out = fal_client.subscribe("clarityai/crystal-upscaler",
    arguments={"image_url": url, "scale_factor": 2, "creativity": 0, "output_format": "png"},
    with_logs=True)
print(out["images"][0]["url"])
```

## Troubleshooting

| Symptom | Fix |
|---|---|
| Exit `2` / `401` / `403` | `FAL_KEY` missing or invalid. |
| `422` | Param out of range (scale 1-200, creativity 0-10, format png/jpg). |
| Input over 100 MiB / `413` | Auto-fit handles it; or run `fit.py`. Lower `--max-bytes` on the data-URI path. |
| Fitted image looks cropped/missing | Stage-5 gate catches this and redoes via uniform resize; only lower `--fit-min-correlation` if intentional. |
| Sync call times out | Use the queue path (this skill's default via `subscribe`). |
| Face looks "invented" | Lower `--creativity` toward 0. |

See [`references/api-reference.md`](references/api-reference.md) for the verbatim input/output
schema, queue + webhook endpoints, every pricing example, and the full client snippets.
