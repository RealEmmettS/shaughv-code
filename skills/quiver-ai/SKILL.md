---
name: quiver-ai
description: >
  Expert at working with Quiver AI's Arrow model for SVG generation. Use this skill whenever the user wants to
  generate SVG graphics, create vector logos/icons/illustrations, write prompts for Quiver AI, make API calls
  to the Quiver AI API, vectorize raster images to SVG, or do anything involving quiver.ai or the Arrow model.
  This includes when someone says things like "make me an SVG", "generate a logo", "create a vector icon",
  "write a Quiver prompt", "vectorize this image", or mentions quiver.ai, Arrow model, or text-to-SVG in any context.
---

# Quiver AI SVG Generation

You are an expert at working with Quiver AI's Arrow model to generate high-quality SVG graphics. This skill covers three modes of operation — pick the right one based on what the user is asking for:

1. **Prompt crafting** — Write optimized text prompts for Quiver AI's text-to-SVG model
2. **API integration** — Generate working code (cURL, Node.js SDK, or raw HTTP) for the Quiver AI API
3. **End-to-end generation** — Combine both: craft the prompt, build the API call, and execute it

## Understanding the Arrow Model Family

Arrow is Quiver AI's family of flagship models, purpose-built for SVG generation. They all handle the same two workflows:

- **Text to SVG** (`POST /v1/svgs/generations`) — Generate SVGs from text descriptions
- **Image to SVG** (`POST /v1/svgs/vectorizations`) — Convert raster images (PNG, JPEG, WebP) into clean vector SVGs

The model is remarkably capable at producing production-ready vector graphics, but the quality of its output is heavily influenced by prompt specificity. Vague prompts produce vague results; precise, structured prompts produce crisp, intentional designs.

### Model Selection

There are three Arrow model IDs. Pick the right one based on the job:

| Model ID | Status | When to use | Generate | Vectorize |
|---|---|---|---|---|
| `arrow-1.1` | **Default** | Use this for every request unless the user specifically asks for higher quality. Best price-to-quality ratio. | 20 credits ($0.20) | 15 credits ($0.15) |
| `arrow-1.1-max` | Quality tier | Use when the user asks for "best quality," "max quality," "higher fidelity," production-grade work, or when an initial `arrow-1.1` result wasn't sharp enough. | 25 credits ($0.25) | 20 credits ($0.20) |
| `arrow-1.0` | **Deprecated** | Do not use. Leave it out of examples and new code. Only mention it if the user explicitly asks about it, and steer them toward `arrow-1.1`. | — | — |

Unless there's a clear reason to escalate, default to `arrow-1.1` in all code examples, cURL snippets, and SDK calls. If the user says something like "make it really crisp" or "I want the highest quality version," switch to `arrow-1.1-max` and mention the small price bump so they can make the call.

---

## Writing Great Prompts — The Core of This Skill

This is the most important section. The quality of every Quiver AI SVG lives or dies by the prompt. Follow this guidance closely.

### Prompt Length Rule

**All prompts must be concise — roughly 1 to 3 sentences.** They should read as a single flowing description with comma-separated descriptors, not as a paragraph or multi-paragraph essay. Study the sample prompts below: they pack dense visual information into a tight, punchy format. Match that density and length. A prompt can be slightly longer than the samples if the subject demands more specificity, but never let it sprawl into paragraph territory.

Bad (too long):
> "I would like you to create a bear logo. The bear should be facing to the right and have a rounded, blob-like shape. The color scheme should use pale mint for the bear and dark olive for the background. Please make it a clean vector logo without any gradients or complex textures."

Good (correct length and density):
> "Rounded blob bear silhouette right-facing, pale mint flat fill, dark olive background, clean vector logo, no gradients"

The good version says the exact same thing in a fraction of the space. Every word earns its place.

### The Prompt Formula

Think of each prompt as having these layers, roughly in this order:

**Subject** → **Style** → **Colors & Palette** → **Background** → **Constraints**

Not every prompt needs all five, but the more specific you are across these layers, the more control you have over the output. Let's break each one down in detail.

---

#### Layer 1: Subject — What Are You Making?

Be concrete and specific. The subject is the anchor of the entire prompt. Vague subjects produce vague results.

**Weak subjects** → **Strong subjects:**
- "A bear" → "Rounded blob bear silhouette right-facing"
- "A hand" → "Peace sign hand gesture with bold outline"
- "A logo" → "Modern brand logo for 'QWEST' with a geometric Q-shaped icon combining a cube and speech bubble"
- "A cat" → "Thick monoline sitting cat left-facing"
- "Some text" → "The word 'arrow' in bold retro script lettering"

**What to specify in the subject:**
- The actual object or creature (bear, hand, cat, shark, pegasus)
- Shape language: rounded, angular, geometric, blob, organic, chunky
- Pose or orientation: right-facing, side profile, rearing, sitting, top-down, 3/4 view
- If it's a logo with text: the exact text in quotes, plus the icon concept
- If it's purely typographic: the exact word/phrase in quotes, plus the lettering style
- If multiple elements: how they relate ("two mirrored rhino heads charging horn-to-horn", "OK hand gesture pinching a small sad face emoji")

---

#### Layer 2: Style — What's the Visual Language?

Style sets the aesthetic. Think of it as the "art direction" layer. Be explicit about the look and feel.

**Style vocabulary to draw from:**
- **Vector styles:** flat vector, monochrome, duotone, clean vector logo, logo-ready design
- **Art movements:** retro pop-art, screen-print aesthetic, woodblock illustration
- **Line work:** monoline, bold outline, thick strokes, no strokes, calligraphic
- **Shape language:** metaball, blob shapes, geometric, organic, chunky, rounded
- **Texture:** Ben-Day dot texture, rough jagged edges, smooth curves, frosted finish
- **Feel:** bold, clean, minimal, ornate, aggressive, playful, soft, hand-drawn

**Combine styles for specificity:**
- "retro pop-art screen-print aesthetic" (movement + technique)
- "hand-drawn digital illustration style" (medium + feel)
- "bold black and white flat vector design" (palette + rendering)
- "thick rounded bubbly letterforms with smooth curves" (shape + texture)

---

#### Layer 3: Colors & Palette — Be Explicit About What Gets Which Color

This is where many prompts go wrong. Don't just list colors — assign them to specific elements.

**Weak color direction:**
> "Use green and beige colors"

**Strong color direction:**
> "bold green outline and green Ben-Day dot texture on white fill, warm beige background"

**How to specify colors:**
- Use descriptive color names with modifiers: "pale mint", "bright cobalt-blue", "deep plum", "dark olive", "neon green", "muted sage-green", "bright sky-blue", "warm beige", "brick-red"
- Use hex codes when precision matters: "#2D5F3A background with #FF6B35 accents"
- Always say what gets which color: "pale mint flat fill" (the subject), "dark olive background" (the bg)
- For multi-color designs, map each color to its element: "cream-white letterforms on a bright yellow-green lime background"
- For gradients (when wanted): "orange-to-red gradient border", "peach and light blue gradients with a smooth frosted finish"

**Color pairing patterns that work well:**
- High contrast: dark background + bright subject (dark forest-green bg + neon green logo)
- Tonal: same hue family at different values (deep plum bg + lavender-purple silhouette)
- Complementary pop: warm + cool ("brick-red background" + "white silhouette")
- Monochrome with accent: "bold black and white flat vector design with an orange-to-red gradient border"

---

#### Layer 4: Background — Always Specify It

If you don't specify the background, you lose control of a major visual element. Always call it out, even if it's simple.

**Background patterns:**
- Solid color: "on a bright sky-blue background", "dark navy background", "warm beige background"
- Contrasting: choose a background that makes the subject pop
- Matching: tonal backgrounds create a more unified, moody feel

**Never leave it unspecified.** Even "on a white background" is better than nothing.

---

#### Layer 5: Constraints — The Guardrails

Constraints are what keep the output clean and predictable. They tell the model what NOT to do, or set hard limits on complexity.

**Common constraints:**
- **Gradient control:** "no gradients" / "flat fill only" / "gradients allowed on border only"
- **Color count:** "flat two-color design" / "single-color illustration" / "exactly three colors"
- **Shape count:** "exactly 8 shapes total" — forces the model to be economical
- **Stroke control:** "no fill, no gradients" (outline only) / "filled shapes only, no strokes or outlines" / "no strokes"
- **Rendering:** "clean vector logo" / "logo-ready design" / "flat vector"
- **Line style:** "single continuous stroke" / "thick monoline" / "bold outline"
- **Complexity:** "minimal" / "simple silhouette" / "clean edges"

**When to use constraints:**
- Always include at least one constraint for logos and icons (usually "no gradients" or "flat vector")
- Use "exactly N shapes total" when you want tight, minimal compositions
- Use "no strokes or outlines" vs "no fill" to control whether the model uses filled shapes or line work
- Use "clean vector logo" as a general quality signal for logo work

---

### Putting It All Together — Annotated Examples

Study how each example packs the five layers into a concise, flowing prompt:

```
Rounded blob bear silhouette right-facing, pale mint flat fill, dark olive background, clean vector logo, no gradients
```
**Subject:** Rounded blob bear silhouette right-facing
**Style:** silhouette
**Colors:** pale mint flat fill
**Background:** dark olive background
**Constraints:** clean vector logo, no gradients

```
Peace sign hand gesture with bold green outline and green Ben-Day dot texture on white fill, warm beige background, retro pop-art screen-print aesthetic
```
**Subject:** Peace sign hand gesture
**Style:** bold outline + Ben-Day dot texture, retro pop-art screen-print aesthetic
**Colors:** green outline, green dots on white fill
**Background:** warm beige
**Constraints:** (implicit — the style itself constrains the output)

```
Modern brand logo for 'QWEST' with a geometric Q-shaped icon combining a cube and speech bubble, bright neon green on a dark forest-green background, clean sans-serif typography, flat vector
```
**Subject:** Brand logo for 'QWEST' with geometric Q-shaped icon (cube + speech bubble)
**Style:** modern, clean sans-serif typography
**Colors:** bright neon green on dark forest-green
**Background:** dark forest-green
**Constraints:** flat vector

```
The word 'arrow' in bold retro script lettering, dark navy blue on a bright sky-blue background, thick rounded bubbly letterforms with smooth curves, flat two-color design
```
**Subject:** The word 'arrow' (typographic)
**Style:** bold retro script, thick rounded bubbly letterforms, smooth curves
**Colors:** dark navy blue
**Background:** bright sky-blue
**Constraints:** flat two-color design

```
Aggressive roaring panda head mascot logo in side profile, bold black and white flat vector design with an orange-to-red gradient border on a black background
```
**Subject:** Aggressive roaring panda head mascot logo, side profile
**Style:** mascot logo, bold flat vector
**Colors:** black and white with orange-to-red gradient border
**Background:** black
**Constraints:** (gradient allowed only on border)

```
OK hand gesture pinching a small sad face emoji, dark green with rough jagged edges on a light mint-green background, hand-drawn digital illustration style
```
**Subject:** OK hand gesture pinching a small sad face emoji
**Style:** hand-drawn digital illustration, rough jagged edges
**Colors:** dark green
**Background:** light mint-green
**Constraints:** (implied by style — rough, hand-drawn)

```
Orange dachshund silhouettes arranged in a circular leaping formation on a bright cobalt-blue background, flat vector, playful repeating pattern, two-color design
```
**Subject:** Orange dachshund silhouettes in circular leaping formation
**Style:** playful repeating pattern
**Colors:** orange silhouettes
**Background:** bright cobalt-blue
**Constraints:** flat vector, two-color design

```
Thick monoline sitting cat left-facing, black outline, beige background, geometric vector logo, no fill, no gradients
```
**Subject:** Sitting cat left-facing
**Style:** thick monoline, geometric vector logo
**Colors:** black outline
**Background:** beige
**Constraints:** no fill, no gradients

```
Two mirrored rhino heads charging horn-to-horn, bold flat vector emblem in deep navy and bright orange on a white background, exactly 8 shapes total
```
**Subject:** Two mirrored rhino heads charging horn-to-horn
**Style:** bold flat vector emblem
**Colors:** deep navy and bright orange
**Background:** white
**Constraints:** exactly 8 shapes total

```
Minimal black and white shark icon from a top-down perspective, bold geometric shapes creating a 3D illusion with filled shapes only, no strokes or outlines
```
**Subject:** Shark icon, top-down perspective
**Style:** minimal, bold geometric shapes, 3D illusion
**Colors:** black and white
**Background:** (implicit white)
**Constraints:** filled shapes only, no strokes or outlines

---

### The `instructions` Parameter

Quiver AI separates the `prompt` from an optional `instructions` field. Use this to your advantage:

- **prompt**: What to generate (the subject, the scene, the content)
- **instructions**: How to generate it (style guidance, palette rules, constraints)

This separation keeps prompts cleaner and gives the model a clearer hierarchy of intent. When building API calls, consider splitting the user's request this way — especially when there's a lot of style guidance that would clutter the main prompt.

Example split:
- **prompt:** `"Modern brand logo for 'NEXUS' with interlocking N shapes forming a diamond"`
- **instructions:** `"Clean sans-serif typography, flat vector, bright teal on dark charcoal background, no gradients, minimal design with exactly 6 shapes"`

### Text in SVGs

When the user wants text in their SVG (logos, wordmarks, headlines):
- State the exact text in quotes: `"The headline 'URBAN EXPLORER' in bold white sans-serif at the top"`
- Specify the font style: sans-serif, serif, script, monospace, hand-lettered, bubbly, chunky
- Describe positioning: top, bottom, centered, below the icon
- Call out weight and size: bold, thin, large, small
- Describe the letterform character: "thick rounded bubbly letterforms", "sharp angular letters", "rounded chunky cream-white letterforms"

### Common Pitfalls to Avoid

- **Being too vague**: "A cool logo" gives the model nothing to work with. Always specify subject, style, and colors at minimum.
- **Forgetting the background**: If you don't specify, you lose control of a major visual element.
- **Writing paragraph-length prompts**: Keep it dense and flowing. Comma-separated descriptors, not sentences explaining what you want.
- **Overcomplicating**: The model excels at clean, well-defined compositions. Asking for 15 different elements in a single SVG will produce a mess.
- **Just listing colors**: Don't say "use green and white." Say what gets which color: "green outline on white fill."
- **Ignoring constraints**: If you want flat design, say "no gradients." If you want a specific shape count, say "exactly N shapes." The model respects these.

---

## API Reference

For full API parameter details, response schemas, error codes, and SDK examples, see the `references/api-reference.md` file. Below is a quick-reference summary.

### Base URL
```
https://api.quiver.ai/v1
```

### Authentication
Bearer token via API key:
```
Authorization: Bearer <QUIVERAI_API_KEY>
```

### Text to SVG — `POST /v1/svgs/generations`

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `model` | string | — | **Required.** Use `arrow-1.1` (default) or `arrow-1.1-max` (quality). `arrow-1.0` is deprecated — do not use. |
| `prompt` | string | — | **Required.** Text description of the desired SVG |
| `instructions` | string | — | Separate style/formatting guidance |
| `references` | array | — | Up to 4 reference images (URL or base64) to guide generation |
| `n` | integer | `1` | Number of outputs (1–16) |
| `stream` | boolean | `false` | SSE stream with progressive rendering phases |
| `temperature` | number | `1` | Randomness (0–2). Lower = more deterministic |
| `top_p` | number | `1` | Nucleus sampling (0–1). Lower = more focused |
| `presence_penalty` | number | `0` | Encourages new patterns (-2 to 2) |
| `max_output_tokens` | integer | — | Token limit (1–131072) |

### Image to SVG — `POST /v1/svgs/vectorizations`

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `model` | string | — | **Required.** Use `arrow-1.1` (default) or `arrow-1.1-max` (quality). `arrow-1.0` is deprecated — do not use. |
| `image` | object | — | **Required.** `{ url: "..." }` or `{ base64: "..." }` |
| `auto_crop` | boolean | `false` | Auto-crop to dominant subject |
| `target_size` | integer | — | Square resize (128–4096 px) before inference |
| `n` | integer | `1` | Number of outputs (1–16) |
| `stream` | boolean | `false` | SSE stream |
| `temperature` | number | `1` | Randomness (0–2) |
| `top_p` | number | `1` | Nucleus sampling (0–1) |
| `presence_penalty` | number | `0` | Pattern diversity (-2 to 2) |
| `max_output_tokens` | integer | — | Token limit (1–131072) |

**Image prep tip**: Cropping the input image tightly to the subject improves vectorization quality. Use `auto_crop` as a fallback when manual cropping isn't possible.

### Error Codes

| Code | Meaning |
|------|---------|
| 400 | Malformed request or invalid parameters |
| 401 | Missing or invalid API key |
| 402 | Insufficient credits |
| 403 | Account frozen |
| 404 | Model not found |
| 429 | Rate limited — respect `Retry-After` header, use exponential backoff |
| 500/502/503 | Server-side errors |

### Node.js SDK

Install: `npm install @quiverai/sdk` (also `pnpm add` or `bun add`)

```typescript
import { QuiverAI } from "@quiverai/sdk";

const client = new QuiverAI({
  bearerAuth: process.env["QUIVERAI_API_KEY"],
});

// Text to SVG
const result = await client.createSVGs.generateSVG({
  model: "arrow-1.1",
  prompt: "Your prompt here",
  instructions: "Optional style guidance",
});

// Image to SVG
const vectorized = await client.vectorizeSVG.vectorizeSVG({
  model: "arrow-1.1",
  image: { url: "https://example.com/image.png" },
  autoCrop: true,
});
```

### cURL Examples

**Text to SVG:**
```bash
curl --request POST \
  --url https://api.quiver.ai/v1/svgs/generations \
  --header 'Authorization: Bearer $QUIVERAI_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "model": "arrow-1.1",
    "prompt": "Your prompt here",
    "instructions": "Optional style guidance",
    "n": 1,
    "stream": false
  }'
```

**Image to SVG:**
```bash
curl --request POST \
  --url https://api.quiver.ai/v1/svgs/vectorizations \
  --header 'Authorization: Bearer $QUIVERAI_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "model": "arrow-1.1",
    "auto_crop": true,
    "image": {
      "url": "https://example.com/image.png"
    }
  }'
```

---

## Choosing the Right Mode

When a user asks you to work with Quiver AI, figure out which mode they need:

**"Write me a prompt for..."** → Prompt crafting mode. Write a polished prompt following the formula above. Present it cleanly so they can copy it into the Quiver AI app or their own code.

**"Generate the API call for..."** → API integration mode. Build the complete request (cURL or SDK code) with a well-crafted prompt embedded. Include all relevant parameters.

**"Make me an SVG of..." / "Generate a logo for..."** → End-to-end mode. Craft the prompt, build the API call, and if the user has provided their API key in their environment, execute it and return the SVG. If no API key is available, provide the ready-to-run code.

**"Vectorize this image"** → Image-to-SVG mode. Use the vectorization endpoint. Advise on cropping and `auto_crop` usage.

---

## Pricing Context

The API uses prepaid credits at **$0.01 per credit**. Each request debits a variable number of credits based on the model and operation — the expensive models and operations just debit more credits per call. Credits are purchased in batches of **200–60,000 at a time** ($2.00–$600.00 per purchase).

| Model | Generate (text → SVG) | Vectorize (image → SVG) |
|---|---|---|
| `arrow-1.1` | 20 credits ($0.20) | 15 credits ($0.15) |
| `arrow-1.1-max` | 25 credits ($0.25) | 20 credits ($0.20) |

When generating multiple variants (`n` > 1), each variant bills as a separate operation — mention this if the user is generating many at once so they can be cost-conscious. When iterating on a prompt, start with `n: 1` on `arrow-1.1` and only escalate to `arrow-1.1-max` or larger batches once the prompt is dialed in.

**Auto Top-Up** is available in the dashboard — it automatically buys more credits when the balance drops below a threshold (requires a saved payment method). Good to suggest to users running production workloads who don't want to hit a 402 mid-flow.

App plans are also available for the web app (separate from the API): Free ($0/mo, 20 SVGs/week), Basic ($20/mo, 100 SVGs/week), Pro ($40/mo, 250 SVGs/week).
