---
name: pretext
description: >
  DOM-free text measurement and line layout using @chenglou/pretext. Use when
  building with or integrating the Pretext library for text height calculation,
  line layout, shrinkwrap/orphan prevention, multi-column text flow, obstacle-aware
  text routing, masonry layouts, or any scenario needing DOM-reflow-free text
  measurement. Triggers on imports from @chenglou/pretext, mentions of Pretext
  library, DOM-free text measurement, canvas measureText layout, or references to
  prepare/layout/layoutWithLines/walkLineRanges/layoutNextLine functions. Also use
  when setting up Pretext in Next.js, Vite, or vanilla projects, or building React
  integration hooks/components for Pretext.
---

# Pretext

A TypeScript library for multiline text measurement and layout without DOM reflow. Uses Canvas `measureText()` as ground truth, then performs all layout as pure arithmetic on cached widths.

**Two-phase architecture:**

1. **`prepare(text, font)`** — one-time: normalize whitespace, segment text via `Intl.Segmenter`, measure segment widths via canvas, cache results. ~0.04ms per text.
2. **`layout(prepared, maxWidth, lineHeight)`** — hot path: pure arithmetic over cached widths. ~0.0002ms per text. Zero DOM reads, zero canvas calls, zero allocations.

**Package:** `@chenglou/pretext` (v0.0.3 on npm, MIT, ~15KB raw / ~3-5KB gzipped, zero dependencies)
**Author:** Cheng Lou (creator of React Motion, former Facebook ReasonML lead)
**Ships raw `.ts` source** — requires bundler configuration (see [Setup Guide](references/setup-guide.md))

## Live Resources

Always check these for the latest API and updates:

- **GitHub:** https://github.com/chenglou/pretext
- **npm:** https://www.npmjs.com/package/@chenglou/pretext
- **Live demos:** https://chenglou.me/pretext/
- **Community demos:** https://somnai-dreams.github.io/pretext-demos/
- **API reference (README):** https://github.com/chenglou/pretext#api
- **Caveats (README):** https://github.com/chenglou/pretext#caveats
- **Accuracy/benchmarks:** https://github.com/chenglou/pretext/blob/main/STATUS.md

## Quick Start

```bash
npm install @chenglou/pretext
```

Setup required for Next.js and Vite — see [Setup Guide](references/setup-guide.md).

**Height measurement (Use Case 1):**

```ts
import { prepare, layout } from '@chenglou/pretext'

await document.fonts.ready // always wait for fonts first
const prepared = prepare('Your text here', '16px Inter')
const { height, lineCount } = layout(prepared, containerWidth, 24) // pure math
element.style.minHeight = `${height}px`
```

**Manual line layout (Use Case 2):**

```ts
import { prepareWithSegments, layoutWithLines } from '@chenglou/pretext'

const prepared = prepareWithSegments('Your text', '18px "Helvetica Neue"')
const { lines } = layoutWithLines(prepared, 320, 26)
for (let i = 0; i < lines.length; i++) {
  ctx.fillText(lines[i].text, 0, i * 26)
}
```

## API Quick Reference

For complete type definitions and parameter docs, see [API Reference](references/api-reference.md).

### Use Case 1: Height Measurement

```ts
prepare(text: string, font: string, options?: PrepareOptions): PreparedText
layout(prepared: PreparedText, maxWidth: number, lineHeight: number): LayoutResult
```

- `PrepareOptions`: `{ whiteSpace?: 'normal' | 'pre-wrap' }`
- `LayoutResult`: `{ lineCount: number, height: number }`

### Use Case 2: Manual Line Layout

```ts
// All lines at fixed width (high-level)
prepareWithSegments(text: string, font: string, options?: PrepareOptions): PreparedTextWithSegments
layoutWithLines(prepared: PreparedTextWithSegments, maxWidth: number, lineHeight: number): LayoutLinesResult

// Line widths without building strings (no allocation — ideal for binary search)
walkLineRanges(prepared: PreparedTextWithSegments, maxWidth: number, onLine: (line: LayoutLineRange) => void): number

// One line at a time with variable width (obstacle routing, multi-column)
layoutNextLine(prepared: PreparedTextWithSegments, start: LayoutCursor, maxWidth: number): LayoutLine | null
```

### Key Types

| Type | Fields |
|------|--------|
| `PreparedText` | Opaque handle from `prepare()` |
| `PreparedTextWithSegments` | Extends PreparedText with `segments: string[]` |
| `LayoutResult` | `{ lineCount, height }` |
| `LayoutLinesResult` | `{ lineCount, height, lines: LayoutLine[] }` |
| `LayoutLine` | `{ text, width, start: LayoutCursor, end: LayoutCursor }` |
| `LayoutLineRange` | `{ width, start: LayoutCursor, end: LayoutCursor }` (no text) |
| `LayoutCursor` | `{ segmentIndex, graphemeIndex }` |

### Helpers

```ts
clearCache(): void       // release accumulated font/segment caches
setLocale(locale?: string): void  // retarget Intl.Segmenter locale; also clears cache
profilePrepare(text: string, font: string, options?: PrepareOptions): PrepareProfile  // diagnostic: returns timing breakdown (analysisMs, measureMs, totalMs, segment counts)
```

## Critical Rules

These cause real bugs. Confirmed across 7+ production projects.

### 1. NEVER use ResizeObserver with Pretext shrinkwrap

ResizeObserver + shrinkwrap `max-width` creates an infinite vibration loop:
observer fires -> compute shrinkwrap -> set `max-width` -> element resizes -> observer fires again.
Observing the **parent** element does NOT fix this in flex layouts (parent width is content-dependent and also oscillates).

**Correct pattern:** sync `clientWidth` reads + `window.resize` coalesced through a single `requestAnimationFrame` gate. When element has `max-width` applied, temporarily clear it to `'none'`, read `clientWidth`, then restore (no visual flash — browser doesn't paint mid-JS).

See [Gotchas](references/gotchas-and-debugging.md) for full explanation and code. **Note:** Some older project integrations may still use ResizeObserver (e.g., `emmetts_personal_website`) — these are known bugs pending migration to the correct pattern, confirmed working in QubeTX_Landing and raw-materials-processor.

### 2. NEVER use shrinkwrap on centered text

Shrinkwrap narrows `max-width`, which conflicts with `text-align: center` + `margin: 0 auto`, pulling text off-center. Centered elements should use height reservation (`min-height`) only, not shrinkwrap.

### 3. system-ui font is unsafe

Canvas and DOM resolve different font variants on macOS with `system-ui`. Always use named fonts (`Inter`, `Helvetica`, `Georgia`, etc.).

### 4. Font shorthand must be exact

The font string passed to `prepare()` must match the computed CSS font exactly. Use `getComputedStyle(el).font` or construct from individual properties:

```ts
function getFontFromStyles(styles: CSSStyleDeclaration): string {
  return styles.font.length > 0
    ? styles.font
    : `${styles.fontStyle} ${styles.fontVariant} ${styles.fontWeight} ${styles.fontSize} / ${styles.lineHeight} ${styles.fontFamily}`
}
```

### 5. Letter-spacing not supported

Pretext's canvas measurement does not account for CSS `letter-spacing`. Elements with custom tracking should either skip Pretext measurement or accept slight inaccuracy.

### 6. clamp() font sizes require re-prepare

When CSS `clamp()` or media queries change the resolved font size, detect the change and re-call `prepare()` with the new font string. Compare with a threshold (e.g., > 0.5px change) to avoid sub-pixel churn.

### 7. Always gate on font readiness

Always await `document.fonts.ready` before calling `prepare()`. Otherwise canvas measures with fallback font widths, producing incorrect results.

```ts
await document.fonts.ready
const isLoaded = document.fonts.check('16px "My Font"')
```

### 8. Package ships raw TypeScript

Pretext exports `.ts` source files, not compiled JS. Bundlers must be configured:
- **Next.js:** `transpilePackages: ['@chenglou/pretext']` in next.config
- **Vite:** `optimizeDeps: { include: ['@chenglou/pretext'] }` in vite.config
- Both: `allowImportingTsExtensions: true` in tsconfig.json

See [Setup Guide](references/setup-guide.md) for full configuration.

## Core Patterns

### Height Reservation (Layout-Shift Prevention)

Use `layout()` to calculate text height and set `min-height`:

```ts
const { height } = layout(prepared, containerWidth, lineHeight)
element.style.minHeight = `${height}px`
```

Never set `height` or `max-height` — only additive properties. Gracefully degrade: if Pretext isn't ready, apply zero style modifications.

### Shrinkwrap / Orphan-Widow Prevention

Binary search with `layout()` to find the minimum width that keeps the same line count, then apply as `max-width`:

```ts
function findTightWidth(prepared: PreparedText, maxWidth: number, lineHeight: number): number {
  const initial = layout(prepared, maxWidth, lineHeight)
  let lo = 1, hi = Math.max(1, Math.ceil(maxWidth))
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    if (layout(prepared, mid, lineHeight).lineCount <= initial.lineCount) hi = mid
    else lo = mid + 1
  }
  return lo
}
```

Since `layout()` is ~0.0002ms, 50+ binary search iterations cost < 0.01ms.

For a richer version using `walkLineRanges` that also returns the actual max line width:

```ts
function collectWrapMetrics(prepared: PreparedTextWithSegments, maxWidth: number): { lineCount: number, maxLineWidth: number } {
  let maxLineWidth = 0
  const lineCount = walkLineRanges(prepared, maxWidth, line => {
    if (line.width > maxLineWidth) maxLineWidth = line.width
  })
  return { lineCount, maxLineWidth }
}
```

### Resize Render Loop (RAF Gate)

All Pretext demos follow this strict read/compute/write cycle. No ResizeObserver:

```ts
let scheduledRaf: number | null = null

function scheduleRender(): void {
  if (scheduledRaf !== null) return
  scheduledRaf = requestAnimationFrame(() => {
    scheduledRaf = null
    render()
  })
}

window.addEventListener('resize', scheduleRender)
document.fonts.ready.then(scheduleRender)

function render(): void {
  // 1. READ DOM (single pass)
  const width = element.clientWidth
  // 2. COMPUTE (pure math)
  const { height } = layout(prepared, width, lineHeight)
  // 3. WRITE DOM (single pass)
  element.style.minHeight = `${height}px`
}
```

### Obstacle-Aware Text Routing

Use `layoutNextLine()` with varying widths per line to flow text around obstacles:

```ts
let cursor: LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 }
let y = 0
while (true) {
  const width = y < image.bottom ? columnWidth - image.width : columnWidth
  const line = layoutNextLine(prepared, cursor, width)
  if (line === null) break
  ctx.fillText(line.text, 0, y)
  cursor = line.end
  y += lineHeight
}
```

See the Dynamic Layout and Editorial Engine demos in [Demos Guide](references/demos-guide.md) for complete implementations.

### Multi-Column Flow

Use `layoutNextLine()` with a shared cursor across columns:

```ts
// Column 1 consumes text
const col1Result = layoutColumn(prepared, { segmentIndex: 0, graphemeIndex: 0 }, col1Region, lineHeight)
// Column 2 resumes from where column 1 stopped
const col2Result = layoutColumn(prepared, col1Result.cursor, col2Region, lineHeight)
```

## React Integration

Proven React patterns across 7+ projects. For complete implementations, see [React Patterns](references/react-patterns.md).

| Component/Hook | Purpose |
|---------------|---------|
| `useContainerWidth` | Sync clientWidth via ref callback + window.resize + RAF gate. NO ResizeObserver. |
| `usePretext` | Waits for `document.fonts.ready`, exposes prepare/layout wrappers, memoized cache |
| `PretextBlock` | Drop-in wrapper: sets `min-height` for layout-shift prevention, optional `max-width` shrinkwrap |
| `PretextProvider` | Font readiness context wrapping the component tree |

**PretextBlock usage:**

```tsx
{/* Left-aligned — use shrinkwrap for orphan prevention */}
<PretextBlock text={description} lineHeight={1.65} shrinkwrap as="p" className="desc">
  {description}
</PretextBlock>

{/* Centered — NO shrinkwrap (conflicts with centering) */}
<PretextBlock text={subtitle} lineHeight={1.6} as="p" className="subtitle">
  {subtitle}
</PretextBlock>
```

## Framework Setup

| Framework | Config needed |
|-----------|--------------|
| **Next.js** | `transpilePackages` + `allowImportingTsExtensions` |
| **Vite** | `optimizeDeps.include` + `allowImportingTsExtensions` |
| **Bun** | Works out of the box |

Full instructions with code blocks: [Setup Guide](references/setup-guide.md)

## Demos

All demos are at https://chenglou.me/pretext/ with source at https://github.com/chenglou/pretext/tree/main/pages/demos

| Demo | APIs Used | Pattern |
|------|-----------|---------|
| **Accordion** | `prepare`, `layout` | Height reservation for expand/collapse transitions |
| **Bubbles** | `prepareWithSegments`, `walkLineRanges`, `layout` | Shrinkwrap binary search for chat message bubbles |
| **Dynamic Layout** | `prepareWithSegments`, `layoutNextLine`, `walkLineRanges` | Obstacle-aware editorial spread with SVG logo routing |
| **Editorial Engine** | `prepareWithSegments`, `layoutNextLine`, `layoutWithLines`, `walkLineRanges` | Multi-column flow with animated orbs and pull quotes |
| **Rich Note** | `prepareWithSegments`, `layoutNextLine`, `walkLineRanges` | Rich inline text with code spans, links, and chips |
| **Variable ASCII** | `prepareWithSegments` | Proportional character width measurement for ASCII art |
| **Masonry** | `prepare`, `layout` | Height prediction for card layout without DOM measurement |

Full architectural breakdowns with source code excerpts: [Demos Guide](references/demos-guide.md)

## Performance & Compatibility

**Accuracy:** 7680/7680 across Chrome, Safari, Firefox (4 fonts x 8 sizes x 8 widths x 30 texts)

**Benchmarks (Chrome):**
- `prepare()`: ~18.85ms for 500-text batch
- `layout()`: ~0.09ms for 500-text batch (entire batch, not per-text)
- `layoutWithLines()`: ~0.05ms, `walkLineRanges()`: ~0.03ms, `layoutNextLine()`: ~0.07ms

**Language support:** 40+ languages including CJK (per-character breaking with kinsoku rules), bidirectional text (Arabic, Hebrew mixed with LTR), emoji (with browser-specific correction), Thai, Myanmar, Urdu, Khmer, Hindi, Korean, and more.

**Browser requirements:**
- `Intl.Segmenter` (all modern browsers)
- Canvas or OffscreenCanvas
- `document.fonts` API (for font loading detection)

**CSS target (what Pretext matches):**
- `white-space: normal` (default) or `pre-wrap` (opt-in)
- `word-break: normal`
- `overflow-wrap: break-word`
- `line-break: auto`

## What NOT to Measure with Pretext

- Short labels, badges, and text that never wraps
- Elements with CSS `letter-spacing` (not supported by canvas measurement)
- Text using `system-ui` font on macOS (use named fonts instead)
- Server-side contexts where Canvas API is unavailable (server support planned)
