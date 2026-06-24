---
name: image-gen
description: Use whenever the user wants to generate, create, make, draw, edit, modify, retouch, transform, restyle, remix, blend, upscale, or remove-the-background-from an image — text-to-image or image-to-image — even if they don't name a model. Routes to Nano Banana 2 / Gemini (Google) — via fal.ai or the native Gemini API — MAI-Image-2.5 (Microsoft) via fal.ai, or Reve (api.reve.com), always asking which provider to use first and noting each one's cost/quality. Saves results to the user's Downloads folder. Trigger on "generate an image", "make me a picture/logo/poster/icon", "edit this photo", "change the background", "upscale this", "blend these photos", "remix these", and similar — do not try to satisfy these with anything other than this skill.
---

# image-gen — multi-provider image generation & editing

Generate and edit images through three providers, each with different strengths, cost, and
parameters. This skill **produces and saves** images; it does not post or send them anywhere.

**Hard rule on credentials:** do **not** look for, mention, or prompt for any API key until
*after* the user has chosen a provider (Step 2). Then resolve **only** that provider's key(s) —
never ask for a key the chosen provider doesn't use.

## Prerequisites

- Python ≥ 3.9 with `requests` (`pip install requests` — the script prints this hint if missing).
- An API key for whichever provider gets chosen: a **fal.ai** key for Nano Banana 2 / MAI, or a
  **Reve** key for Reve. Nano Banana 2 can **alternatively** run on Google's native Gemini API
  with a **Gemini** key (`GEMINI_API_KEY`) — useful for finer control and for keys vended from a
  Gemini subscription. Keys are resolved in Step 2 — don't front-load them.

## Workflow

### Step 1 — Pick the provider (ALWAYS ask first)

Unless the user already named a provider, ask which to use with `AskUserQuestion`, presenting
all three with these notes verbatim so they can weigh cost vs. quality:

- **MAI-Image-2.5 (Microsoft)** — *cheapest and fastest.* Strong photorealism + typography.
- **Nano Banana 2 / Gemini (Google)** — *high quality at a medium price.* Web search + thinking,
  extreme aspect ratios, multi-image edits. Runs via **fal.ai** or, with a Gemini key, **Google's
  native Gemini API** (finer control; works with Gemini-subscription keys). Which backend is used
  is decided automatically in Step 2 by which key is present.
- **Reve** — *high quality, 4K-capable, with the most extensive editing/postprocessing*
  (upscale, remove-bg, fit, effects, test-time scaling). Editing is only slightly better than —
  or about the same as — Nano Banana's.

### Step 2 — Resolve the chosen provider's API key (lazy, provider-scoped)

**MAI** → needs `FAL_KEY`.  **Reve** → needs `REVE_API_KEY`. For these two: check the environment
(`echo $env:FAL_KEY` / `echo $env:REVE_API_KEY` in PowerShell); if set, continue; if **missing**,
ask the user to either **paste the key** or **give a path to a `.env` file** containing it. Don't
ask for any other provider's key.

**Nano Banana 2 / Gemini** has **two backends** — fal.ai (`backend:"fal"`, the default) and the
native Gemini API (`backend:"gemini"`). Choose by scanning for **both** keys, then applying this
logic:

1. Check the environment for **both**: `echo $env:FAL_KEY` and `echo $env:GEMINI_API_KEY`.
2. Decide the backend:
   - **Neither key found** → default to the **native Gemini** backend; ask the user to **paste a
     `GEMINI_API_KEY`** or give a `.env` path with `GEMINI_API_KEY=...`. (Do **not** ask for a fal key.)
   - **`FAL_KEY` found** → default to the **fal** backend (`backend:"fal"`) — the established path.
   - **`GEMINI_API_KEY` found** (and no fal key) → use the **native Gemini** backend (`backend:"gemini"`).
   - **Both keys found** → default to **fal**, but use **native Gemini** if the user wants finer
     control or is using a key vended from a Gemini subscription. If it's unclear, ask which they prefer.
   - **A Gemini key was just supplied** by the user (because none was on the system) → use the
     **native Gemini** backend.
3. If they pasted a key, **offer to save it to their machine's global (User-scope) environment
   variables** so future sessions don't re-prompt:
   ```powershell
   [Environment]::SetEnvironmentVariable('GEMINI_API_KEY', '<key>', 'User')   # or FAL_KEY / REVE_API_KEY
   ```
   This needs no admin rights but only affects **new** shells. For the **current** run, write the
   key into a temp `.env` file and pass `--env-file` (Step 5) — that's why the script supports it.

The native Gemini backend automatically tries Google's newest **Interactions API** first and, if
that errors, falls back to the stable **generateContent** API — you don't choose between them.

### Step 3 — Surface the model's options (ask before generating)

Once the provider — and, for Nano Banana, the backend — is set, present the chosen model's real
capabilities with `AskUserQuestion` **before** building the spec, the same way Reve's
postprocessing is offered. Don't make the user guess what's possible; surface it. Rules:

- **Skip anything the user already pinned** in their request (don't re-ask aspect ratio if they
  said "16:9", or the model if they named it).
- Put the recommended/default value **first** and label it "(Recommended)"; always let the user
  accept defaults and move on. If they say "you decide / just go", skip the rest and use defaults.
- **Don't let the tool's shape cap what you offer.** `AskUserQuestion` allows ≤4 options per
  question and ≤4 questions per call — but you may ask **as many questions and as many sequential
  rounds as you need**. For a knob with many values, **drill down** across rounds (e.g. aspect
  ratio: orientation → exact ratio) so every supported value is a real, tappable option. Reserve
  the auto **"Other"** field for genuinely rare values, not for common ones.
- Use `multiSelect: true` for on/off "extras". Surface the **high-value** knobs as questions and
  list deep/rare ones ("seed", saved effects) as "advanced — ask me", so nothing is hidden but the
  prompt stays short.

**Aspect-ratio drill-down** (use the set the chosen model actually accepts):

- *Round 1 — orientation:* Landscape · Portrait · Square (1:1) · Panoramic / extreme. Lead with the
  most likely choice; if they pick Square you're done.
- *Round 2 — exact ratio, scoped to that orientation:*
  - **Landscape:** 16:9 (Rec) · 3:2 · 4:3 · 5:4
  - **Portrait:** 9:16 (Rec) · 2:3 · 3:4 · 4:5
  - **Panoramic / extreme:** 21:9 (Rec) · 4:1 · 8:1 · 1:8  *(Gemini 3.1 Flash & fal Nano Banana only;
    1:4 via "Other")*
- MAI & Reve have **no extreme ratios** — drop that bucket (Landscape 16:9/3:2/4:3 · Portrait
  9:16/2:3/3:4 · Square 1:1). MAI also offers `auto`.

**Nano Banana 2 — native Gemini backend** (ask the **model first** — it gates the rest):

1. *Model:* **gemini-3.1-flash-image — Nano Banana 2 (Recommended: fast, 0.5K–4K, extreme ratios,
   web + image search)** · gemini-3-pro-image — Nano Banana Pro (pro asset production, deeper
   "thinking", up to 4K, up to 14 reference images) · gemini-2.5-flash-image — Nano Banana (older,
   fixed 1024px).

Then, scoped to the chosen model (one or more rounds):

2. *Resolution:* 1K (Recommended) · 2K · 4K · 0.5K. *(0.5K is 3.1-Flash-only; 2.5 Flash is fixed at
   1024px — skip this question for it; 3 Pro does 1K/2K/4K.)*
3. *Aspect ratio:* use the drill-down above — 3.1 Flash exposes all 14 ratios incl. extreme; 3 Pro &
   2.5 Flash expose the 10 non-extreme ratios.
4. *Grounding (multiSelect):* Web-search grounding (real-time facts) · **Image-search grounding
   (3.1 Flash — uses real web images as visual context)**. → `enable_web_search` / `enable_image_search`.
5. *Thinking (3.x):* Default / minimal (Recommended, fastest) · High (better composition). → `thinking_level`.
6. *Output format:* png (Recommended) · jpeg · webp.
7. For **edit**, you can pass **up to 14 reference images** (3.1 Flash ≈ 10 objects + 4 characters;
   3 Pro ≈ 6 objects + 5 characters) — just list them all in `images`.

**Nano Banana 2 — fal backend:**

1. *Resolution:* 1K (Recommended) · 2K (×1.5) · 4K (×2) · 0.5K (×0.75).
2. *Aspect ratio:* drill-down above (all 14 ratios incl. extreme).
3. *Number of images:* 1 (Recommended) · 2 · 3 · 4.
4. *Extras (multiSelect):* Web search (+$0.015) · High thinking (+$0.002) · Output format
   png/jpeg/webp. *Advanced on request: `seed` (reproducible), `safety_tolerance`, `system_prompt`.*

**MAI-Image-2.5** (strict — only a few knobs; do **not** offer resolution/seed/thinking/web-search,
they 422):

1. *Aspect ratio:* Auto (Recommended) · Landscape (16:9/4:3/3:2) · Portrait (9:16/3:4/2:3) ·
   Square 1:1 — **no extreme ratios**.
2. *Number of images:* 1 (Recommended) · 2 · 3 · 4.
3. *Output format:* png (Recommended) · jpeg · webp.

**Reve:**

1. *Aspect ratio:* drill-down over the 7 ratios (Landscape 16:9/3:2/4:3 · Portrait 9:16/2:3/3:4 ·
   Square 1:1; default 3:2; edit/remix can inherit the reference image's ratio).
2. *Postprocessing (multiSelect):* None (Recommended) · Upscale → 4K (factor 2/3/4) · Remove
   background (transparent) · Fit/resize.
3. *Quality:* Standard (Recommended) · Test-time scaling (1–15; >1 costs more credits, >5 rarely
   helps). *Advanced on request: model `version`, saved `effect`s.*

### Step 4 — Build the request spec

Write a small JSON spec to a temp file (e.g. `image-spec.json`), **filling it from the user's
Step 3 answers**. Read the matching `references/<provider>.md` for the chosen provider's full,
correct parameter set before filling `params` — the providers differ a lot (MAI rejects extras;
Reve uses `edit_instruction` and raw base64; the Gemini-native backend ignores `num_images`/`seed`;
etc.). Core shape:

```jsonc
{
  "provider": "nano-banana" | "mai" | "reve",
  "backend": "fal" | "gemini",             // nano-banana only; default "fal". "gemini" = native API.
  "model": "gemini-3.1-flash-image",       // gemini backend only; from Step 3 (default Nano Banana 2)
  "mode": "generate" | "edit" | "remix",   // remix is Reve-only; edit needs "images"
  "prompt": "what to make (on Reve edit this is the edit instruction)",
  "images": ["C:/Users/you/Downloads/in.png", "https://..."],  // edit/remix only
  "aspect_ratio": "16:9",
  "num_images": 1,                          // fal only; Reve + Gemini-native always return 1
  "output_format": "png",                   // fal + Gemini-native
  "resolution": "1K",                       // Nano Banana (fal + Gemini-native; 0.5K maps to "512")
  "seed": null,                             // Nano Banana fal backend only
  "params": { /* provider-specific — see references/<provider>.md */ }
}
```

For Nano Banana 2 on the **native Gemini** backend, set `"backend": "gemini"` and the chosen
`"model"`; `params` may carry `enable_web_search` and `thinking_level`. See `references/nano-banana.md`.

Reference files (read only the one you need):
`references/nano-banana.md` (covers both fal + native backends), `references/mai-image.md`, `references/reve.md`.

### Step 5 — Run the script

Resolve the user's **Downloads** folder from the system context (don't hardcode another user's
name) and pass it as `--out-dir`:

```powershell
python "<skill-dir>\scripts\generate.py" --spec image-spec.json --out-dir "C:\Users\<you>\Downloads"
```

- Add `--env-file <path>` if the key was supplied this session via a file or freshly pasted. The
  file may hold `FAL_KEY=...`, `GEMINI_API_KEY=...`, or `REVE_API_KEY=...`.
- Use `--print-only` first to sanity-check the resolved endpoint + body (and, for the native
  backend, the fallback URL) without spending credits.
- The script prints the absolute path of each saved image to stdout. Non-zero exit = it failed;
  read stderr (it names the missing env var, the provider error, `X-Reve-Error-Code`, or — for the
  native backend — the HTTP status from **both** the interactions and generateContent attempts).

### Step 6 — Report

Reply in **one line** with a `computer://` link per saved file. Example:

> Done. [Open image](computer://C:\Users\you\Downloads\2026-06-04_neon-koi-in-clouds.png)

## Provider / capability matrix

| Provider | Generate | Edit | Remix | Postprocess | Resolution ceiling | Price tier |
|---|:--:|:--:|:--:|:--:|---|---|
| **MAI-Image-2.5** | ✅ | ✅ | — | — | model default | cheapest / fastest |
| **Nano Banana 2** | ✅ | ✅ (multi-image) | — | — | up to 4K | medium |
| **Reve** | ✅ | ✅ | ✅ (1–6 refs) | ✅ upscale/bg/fit/effect | 4K via upscale | highest quality |

Nano Banana 2 runs on either the **fal.ai** backend (`FAL_KEY`) or the **native Gemini** backend
(`GEMINI_API_KEY`); capabilities above apply to both, but the native backend returns one image per
call and has no `seed`.

## Common pitfalls

- **Local images must be real file paths** in `images` — the script encodes them per provider
  (fal: `data:` URI; Reve: raw base64; Gemini-native: raw base64 + mime). `http(s)://` URLs work
  for fal directly; for Reve and Gemini-native the script downloads then base64-encodes them.
- **MAI is strict** — only `prompt`, `num_images`, `aspect_ratio`, `output_format`. Don't send
  `resolution`/`seed`/`params` extras or you risk a 422. (Reflected in its Step 3 options.)
- **Reve = one image per call** (no `num_images`), only the 7 standard aspect ratios, and PNG
  output; size is controlled via `aspect_ratio` + an `upscale` postprocessor.
- **Gemini-native = one image per call** too — `num_images` is ignored, there's no `seed`, and an
  `auto` aspect ratio is dropped (pick a real ratio). The script auto-falls-back from the
  Interactions API to generateContent, so a single transient API change won't break it.
- **`num_images` is 1–4** on fal providers.
- **PowerShell quoting** is why we pass a spec **file**, not inline JSON.
- **A persisted User-scope env var won't appear in the current shell** — use `--env-file` for the
  run that just set `FAL_KEY` / `GEMINI_API_KEY` / `REVE_API_KEY`.
