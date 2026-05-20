# Quiver AI API Reference

Complete API documentation for the Quiver AI platform. Read this file when you need exact parameter details, response schemas, or error handling guidance.

## Base URL

```
https://api.quiver.ai/v1
```

## Authentication

All requests require a bearer token:
```
Authorization: Bearer <QUIVERAI_API_KEY>
Content-Type: application/json
```

API keys are created at [app.quiver.ai/settings/api-keys](https://app.quiver.ai/settings/api-keys). Keys are shown only once at creation and cannot be retrieved later. Store them in environment variables or a secret manager — never commit to source control.

---

## Endpoints

### POST /v1/svgs/generations — Text to SVG

Generate one or more SVGs from a text prompt and optional reference images.

#### Request Body

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `model` | string | Yes | — | Model identifier. Use `arrow-1.1` (default) or `arrow-1.1-max` (quality tier). `arrow-1.0` is deprecated — do not use in new code. |
| `prompt` | string | Yes | — | Text description of the desired SVG |
| `instructions` | string | No | — | Separate style/formatting guidance (keeps prompt cleaner) |
| `references` | array | No | — | Up to 4 reference images as `{ url: "..." }` or `{ base64: "..." }` |
| `n` | integer | No | `1` | Number of outputs to generate (1–16). Each consumes one credit |
| `stream` | boolean | No | `false` | Enable Server-Sent Events streaming with progressive rendering |
| `temperature` | number | No | `1` | Randomness control (0–2). Lower = more deterministic, higher = more variety |
| `top_p` | number | No | `1` | Nucleus sampling (0–1). Lower = more focused token selection |
| `presence_penalty` | number | No | `0` | Pattern diversity (-2 to 2). Positive values encourage new patterns |
| `max_output_tokens` | integer | No | — | Upper bound for output tokens (1–131,072) |

#### Response (non-streaming)

```json
{
  "id": "gen_abc123",
  "created": 1700000000,
  "data": [
    {
      "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" ...>...</svg>",
      "mime_type": "image/svg+xml"
    }
  ],
  "usage": {
    "total_tokens": 5000,
    "input_tokens": 200,
    "output_tokens": 4800
  }
}
```

#### Streaming Response

When `stream: true`, the response is `text/event-stream` with three event types:

1. **`reasoning`** — Model's thinking process (optional text)
2. **`draft`** — Partial SVG markup as it's being generated
3. **`content`** — Complete SVG markup with usage data

Stream terminates with `data: [DONE]`.

#### Node.js SDK Example

```typescript
import { QuiverAI } from "@quiverai/sdk";

const client = new QuiverAI({
  bearerAuth: process.env["QUIVERAI_API_KEY"],
});

// Basic generation
const result = await client.createSVGs.generateSVG({
  model: "arrow-1.1",
  prompt: "Rounded blob bear silhouette right-facing, pale mint flat fill, dark olive background, clean vector logo, no gradients",
});

// With instructions separated out
const result2 = await client.createSVGs.generateSVG({
  model: "arrow-1.1",
  prompt: "Japanese crane in traditional woodblock illustration style",
  instructions: "Use a warm muted palette with detailed feather work. Earth tones only.",
});

// With reference images
const result3 = await client.createSVGs.generateSVG({
  model: "arrow-1.1",
  prompt: "A logo inspired by this style but for a tech company",
  references: [
    { url: "https://example.com/reference-logo.png" }
  ],
});

// Multiple variants
const result4 = await client.createSVGs.generateSVG({
  model: "arrow-1.1",
  prompt: "Minimalist mountain landscape icon",
  n: 4,
  temperature: 1.2, // Higher variety between variants
});
```

#### cURL Example

```bash
curl --request POST \
  --url https://api.quiver.ai/v1/svgs/generations \
  --header "Authorization: Bearer $QUIVERAI_API_KEY" \
  --header 'Content-Type: application/json' \
  --data '{
    "model": "arrow-1.1",
    "prompt": "Rounded blob bear silhouette right-facing, pale mint flat fill, dark olive background, clean vector logo, no gradients",
    "n": 1,
    "stream": false
  }'
```

---

### POST /v1/svgs/vectorizations — Image to SVG

Convert a raster image (PNG, JPEG, WebP) into one or more SVG outputs.

#### Request Body

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `model` | string | Yes | — | Model identifier. Use `arrow-1.1` (default) or `arrow-1.1-max` (quality tier). `arrow-1.0` is deprecated — do not use in new code. |
| `image` | object | Yes | — | Input image as `{ url: "..." }` or `{ base64: "..." }` |
| `auto_crop` | boolean | No | `false` | Auto-crop to dominant subject before vectorization |
| `target_size` | integer | No | — | Square resize in pixels (128–4,096) before inference |
| `n` | integer | No | `1` | Number of outputs (1–16) |
| `stream` | boolean | No | `false` | Enable SSE streaming |
| `temperature` | number | No | `1` | Randomness (0–2) |
| `top_p` | number | No | `1` | Nucleus sampling (0–1) |
| `presence_penalty` | number | No | `0` | Pattern diversity (-2 to 2) |
| `max_output_tokens` | integer | No | — | Token limit (1–131,072) |

#### Image Input Formats

**By URL:**
```json
{ "url": "https://example.com/logo.png" }
```

**By Base64:**
```json
{ "base64": "iVBORw0KGgoAAAANSUh..." }
```

#### Response

Same structure as text-to-SVG:

```json
{
  "id": "vec_xyz789",
  "created": 1700000000,
  "data": [
    {
      "svg": "<svg ...>...</svg>",
      "mime_type": "image/svg+xml"
    }
  ],
  "usage": {
    "total_tokens": 3000,
    "input_tokens": 1000,
    "output_tokens": 2000
  }
}
```

#### Node.js SDK Example

```typescript
// By URL
const result = await client.vectorizeSVG.vectorizeSVG({
  model: "arrow-1.1",
  image: { url: "https://example.com/logo.png" },
  autoCrop: true,
});

// By base64
const fs = require("fs");
const imageData = fs.readFileSync("./logo.png").toString("base64");
const result2 = await client.vectorizeSVG.vectorizeSVG({
  model: "arrow-1.1",
  image: { base64: imageData },
  targetSize: 512,
});
```

#### cURL Example

```bash
curl --request POST \
  --url https://api.quiver.ai/v1/svgs/vectorizations \
  --header "Authorization: Bearer $QUIVERAI_API_KEY" \
  --header 'Content-Type: application/json' \
  --data '{
    "model": "arrow-1.1",
    "auto_crop": true,
    "image": {
      "url": "https://example.com/logo.png"
    }
  }'
```

---

### GET /v1/models — List Models

Returns all available models for your organization.

### GET /v1/models/{model} — Get Model

Retrieves metadata for a specific model.

---

## Error Handling

All errors return a consistent JSON envelope:

```json
{
  "status": 429,
  "code": "rate_limit_exceeded",
  "message": "Rate limit exceeded",
  "request_id": "req_01J..."
}
```

| Status | Code | Meaning | Action |
|--------|------|---------|--------|
| 400 | `bad_request` | Malformed request or invalid parameters | Check request body |
| 401 | `unauthorized` | Missing, malformed, or revoked API key | Verify API key |
| 402 | `insufficient_credits` | Not enough credits | Purchase more at app.quiver.ai/settings/billing |
| 403 | `forbidden` | Account frozen or blocked | Contact support |
| 404 | `not_found` | Model not found | Verify model ID (`arrow-1.1`) |
| 429 | `rate_limit_exceeded` | Too many requests | Respect `Retry-After` header, use exponential backoff |
| 500 | `internal_error` | Server error | Retry after a moment |
| 502 | `bad_gateway` | Upstream failure | Retry |
| 503 | `service_unavailable` | Backend unavailable | Retry with backoff |

Always include `request_id` from error responses when contacting support.

---

## Pricing

### API Credits

The API is prepaid at **$0.01 per credit**. Each request debits a variable number of credits based on the model and operation (check the model's `pricing_credits` field in the `GET /v1/models` response for exact amounts). Credits are purchased in batches of **200–60,000 at a time** ($2.00–$600.00 per purchase) and expire 1 year after purchase.

Buy at [app.quiver.ai/settings/billing](https://app.quiver.ai/settings/billing). **Auto Top-Up** is available in the same settings page — it automatically purchases credits when the balance drops below a configurable threshold (requires a saved payment method). Recommend this for production workloads to avoid hitting a 402 mid-flow.

### Credit Cost per Operation

| Model | Generate (text → SVG) | Vectorize (image → SVG) |
|-------|-----------------------|--------------------------|
| `arrow-1.1` | 20 credits ($0.20) | 15 credits ($0.15) |
| `arrow-1.1-max` | 25 credits ($0.25) | 20 credits ($0.20) |

`arrow-1.0` is deprecated and should not be used in new code.

### App Plans (monthly subscription with included SVGs — separate from the API)
| Plan | Price | SVGs/Week |
|------|-------|-----------|
| Free | $0/mo | 20 |
| Basic | $20/mo | 100 |
| Pro | $40/mo | 250 |

### Cost Awareness
When using `n` > 1 to generate multiple variants, each variant bills as a separate operation. Four variants on `arrow-1.1` cost 4 × 20 = 80 credits ($0.80). Four variants on `arrow-1.1-max` cost 4 × 25 = 100 credits ($1.00). When the user is exploring, suggest starting with `n: 1` on `arrow-1.1` and iterating on the prompt before generating multiple variants or escalating to `arrow-1.1-max`.

---

## SDK Installation

```bash
# npm
npm install @quiverai/sdk

# pnpm
pnpm add @quiverai/sdk

# bun
bun add @quiverai/sdk
```

## Environment Setup

```bash
# macOS/Linux
export QUIVERAI_API_KEY="your-key-here"

# Windows PowerShell
setx QUIVERAI_API_KEY "your-key-here"
```
