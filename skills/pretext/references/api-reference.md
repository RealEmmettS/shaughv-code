# API Reference

Complete API documentation for `@chenglou/pretext`. For the latest authoritative API, see https://github.com/chenglou/pretext#api

## Table of Contents

- [Use Case 1: Height Measurement](#use-case-1-height-measurement)
- [Use Case 2: Manual Line Layout](#use-case-2-manual-line-layout)
- [Helper Functions](#helper-functions)
- [Complete Type Definitions](#complete-type-definitions)
- [CSS Target Configuration](#css-target-configuration)
- [Font String Format](#font-string-format)
- [Internal Architecture](#internal-architecture)

## Use Case 1: Height Measurement

### `prepare(text, font, options?)`

One-time text analysis and measurement. Call once when text first appears.

```ts
prepare(text: string, font: string, options?: PrepareOptions): PreparedText
```

**Parameters:**
- `text` — the text content to measure. Whitespace is normalized (multiple spaces collapsed, tabs and line breaks treated as spaces) unless `whiteSpace: 'pre-wrap'` is specified.
- `font` — CSS font shorthand string matching the computed CSS font exactly. E.g., `'16px Inter'`, `'bold 18px "Helvetica Neue"'`, `'15px "Helvetica Neue", Helvetica, Arial, sans-serif'`. Must be the same format as `myCanvasContext.font = ...`.
- `options` — optional configuration:
  - `whiteSpace: 'normal'` (default) — collapse whitespace per CSS `white-space: normal`
  - `whiteSpace: 'pre-wrap'` — preserve ordinary spaces, `\t` tabs (8-space stops), and `\n` hard breaks

**Returns:** `PreparedText` — an opaque handle to pass to `layout()`. Contains cached segment widths, break kinds, and measurement metadata.

**What it does internally:**
1. Normalizes whitespace (or preserves it in pre-wrap mode)
2. Segments text using `Intl.Segmenter` (word granularity)
3. Applies glue rules (punctuation merging, kinsoku shori for CJK, Arabic no-space punctuation clusters)
4. Measures each segment width via Canvas `measureText()`, caching results by font
5. Detects and corrects browser-specific emoji width discrepancies (Chrome/Firefox on macOS)
6. Returns the opaque `PreparedText` handle

**Performance:** ~0.04ms per text (amortized in batches of 500)

### `layout(prepared, maxWidth, lineHeight)`

Pure arithmetic layout calculation. The resize hot path — call on every container resize.

```ts
layout(prepared: PreparedText, maxWidth: number, lineHeight: number): LayoutResult
```

**Parameters:**
- `prepared` — the handle from `prepare()`
- `maxWidth` — maximum container width in pixels
- `lineHeight` — line height in pixels (must match CSS `line-height` in px)

**Returns:** `LayoutResult` — `{ lineCount: number, height: number }`
- `lineCount` — number of wrapped lines
- `height` — total block height (`lineCount * lineHeight`)

**Performance:** ~0.0002ms per text. Zero DOM reads, zero canvas calls, zero string work, zero allocations.

## Use Case 2: Manual Line Layout

### `prepareWithSegments(text, font, options?)`

Same as `prepare()` but returns a richer structure for manual line layout.

```ts
prepareWithSegments(text: string, font: string, options?: PrepareOptions): PreparedTextWithSegments
```

**Parameters:** Same as `prepare()`.

**Returns:** `PreparedTextWithSegments` — extends `PreparedText` with `segments: string[]` (segment text aligned with internal parallel arrays, e.g., `['hello', ' ', 'world']`).

### `layoutWithLines(prepared, maxWidth, lineHeight)`

High-level manual layout API. Returns all lines at a fixed width.

```ts
layoutWithLines(prepared: PreparedTextWithSegments, maxWidth: number, lineHeight: number): LayoutLinesResult
```

**Parameters:**
- `prepared` — the handle from `prepareWithSegments()`
- `maxWidth` — maximum width in pixels (same for all lines)
- `lineHeight` — line height in pixels

**Returns:** `LayoutLinesResult` — `{ lineCount, height, lines: LayoutLine[] }`

Each `LayoutLine`:
- `text` — full text content of this line (e.g., `'hello world'`)
- `width` — measured width of this line (e.g., `87.5`)
- `start` — inclusive start `LayoutCursor`
- `end` — exclusive end `LayoutCursor`

**Performance:** ~0.05ms for the shared 500-text corpus

### `walkLineRanges(prepared, maxWidth, onLine)`

Low-level batch geometry API. Calls `onLine` once per line with width and cursors — **no string materialization** (no `text` field). Ideal for binary search and speculative width testing.

```ts
walkLineRanges(prepared: PreparedTextWithSegments, maxWidth: number, onLine: (line: LayoutLineRange) => void): number
```

**Parameters:**
- `prepared` — the handle from `prepareWithSegments()`
- `maxWidth` — maximum width in pixels (same for all lines)
- `onLine` — callback invoked once per line with a `LayoutLineRange` (`{ width, start, end }`)

**Returns:** `number` — total line count

**Use cases:**
- Binary search for shrinkwrap width (test many widths cheaply)
- Find the widest line (`maxLineWidth`) for tight container sizing
- Count lines at a given width without building strings

**Performance:** ~0.03ms for the shared 500-text corpus

### `layoutNextLine(prepared, start, maxWidth)`

Iterator-like API for laying out each line with a **different width**. Use for obstacle-aware routing, multi-column flow, and variable-width layouts.

```ts
layoutNextLine(prepared: PreparedTextWithSegments, start: LayoutCursor, maxWidth: number): LayoutLine | null
```

**Parameters:**
- `prepared` — the handle from `prepareWithSegments()`
- `start` — starting cursor (use `{ segmentIndex: 0, graphemeIndex: 0 }` for the first line, then pass the previous line's `end`)
- `maxWidth` — maximum width for this specific line (can vary per line)

**Returns:** `LayoutLine | null` — the next line, or `null` when the paragraph is exhausted

**Pattern:**
```ts
let cursor: LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 }
while (true) {
  const line = layoutNextLine(prepared, cursor, currentWidth)
  if (line === null) break
  // render line.text at current position
  cursor = line.end
}
```

**Performance:** ~0.07ms for the shared 500-text corpus

## Helper Functions

### `clearCache()`

Releases Pretext's shared internal caches used by `prepare()` and `prepareWithSegments()`.

```ts
clearCache(): void
```

**When to call:**
- When your app cycles through many different fonts and you want to release accumulated segment-width caches
- After dynamically loading/unloading fonts
- In memory-sensitive contexts

### `setLocale(locale?)`

Sets locale for future `prepare()` and `prepareWithSegments()` calls. Internally also calls `clearCache()`.

```ts
setLocale(locale?: string): void
```

**Parameters:**
- `locale` — optional BCP 47 locale string (e.g., `'ja'`, `'zh-Hans'`, `'ar'`). Omit to use the runtime default.

**Notes:**
- Affects `Intl.Segmenter` word segmentation for future `prepare()` calls
- Does NOT mutate existing prepared handles
- Also clears the segment cache (equivalent to calling `clearCache()`)

### `profilePrepare(text, font, options?)`

Diagnostic function that returns a timing breakdown of the `prepare()` phase. Useful for performance profiling.

```ts
profilePrepare(text: string, font: string, options?: PrepareOptions): PrepareProfile
```

**Parameters:** Same as `prepare()`.

**Returns:** `PrepareProfile`:
- `analysisMs` — time spent in text analysis (normalization, segmentation, glue rules)
- `measureMs` — time spent in canvas measurement
- `totalMs` — total time (`analysisMs + measureMs`)
- `analysisSegments` — number of segments after analysis
- `preparedSegments` — number of segments in final prepared result
- `breakableSegments` — number of segments with grapheme-level break data

**Use cases:**
- Diagnosing whether a script is expensive because of segmentation/glue work or canvas measurement volume
- Comparing performance across different text corpora and languages
- The long-form corpus stress benchmarks in STATUS.md use this to split `prepare()` into its two phases

## Complete Type Definitions

```ts
// Opaque fast-path handle (no segment access)
type PreparedText = { readonly [preparedTextBrand]: true }

// Rich handle with segment data for manual layout
type PreparedTextWithSegments = PreparedText & {
  segments: string[]  // e.g., ['hello', ' ', 'world']
}

// Layout result (height measurement only)
type LayoutResult = {
  lineCount: number   // e.g., 3
  height: number      // e.g., 60 (lineCount * lineHeight)
}

// Layout result with line details
type LayoutLinesResult = LayoutResult & {
  lines: LayoutLine[]
}

// Individual line with text content
type LayoutLine = {
  text: string           // e.g., 'hello world'
  width: number          // e.g., 87.5
  start: LayoutCursor    // inclusive start position
  end: LayoutCursor      // exclusive end position
}

// Line geometry without text (for walkLineRanges)
type LayoutLineRange = {
  width: number          // e.g., 87.5
  start: LayoutCursor    // inclusive start position
  end: LayoutCursor      // exclusive end position
}

// Position within prepared segments
type LayoutCursor = {
  segmentIndex: number   // index into segments array
  graphemeIndex: number  // grapheme offset within segment (0 at boundaries)
}

// Options for prepare/prepareWithSegments
type PrepareOptions = {
  whiteSpace?: 'normal' | 'pre-wrap'
}

// Profiling data (from profilePrepare)
type PrepareProfile = {
  analysisMs: number
  measureMs: number
  totalMs: number
  analysisSegments: number
  preparedSegments: number
  breakableSegments: number
}
```

## CSS Target Configuration

Pretext assumes this CSS configuration on measured elements:

| Property | Value | Notes |
|----------|-------|-------|
| `white-space` | `normal` | Default. Collapses spaces, tabs, line breaks |
| `word-break` | `normal` | Standard word breaking |
| `overflow-wrap` | `break-word` | Breaks inside words at narrow widths (grapheme boundaries) |
| `line-break` | `auto` | Browser-default line break rules |

**Pre-wrap mode** (`{ whiteSpace: 'pre-wrap' }`):
- Preserves ordinary spaces, `\t` tabs (8-space tab stops), and `\n` hard breaks
- Other wrapping defaults remain: `word-break: normal`, `overflow-wrap: break-word`, `line-break: auto`
- Use for textarea-like content

**Not yet supported:** `break-all`, `keep-all`, `strict`, `loose`, `anywhere`

## Font String Format

The `font` parameter must be a CSS font shorthand string matching the computed CSS font exactly. This is the same format used for `canvasContext.font`.

**Valid examples:**
```
'16px Inter'
'bold 18px "Helvetica Neue"'
'15px "Helvetica Neue", Helvetica, Arial, sans-serif'
'italic 500 20px Georgia'
'700 24px "Iowan Old Style", "Palatino Linotype", "Book Antiqua", Palatino, serif'
```

**Getting the font from DOM:**
```ts
const styles = getComputedStyle(element)
const font = styles.font.length > 0
  ? styles.font
  : `${styles.fontStyle} ${styles.fontVariant} ${styles.fontWeight} ${styles.fontSize} / ${styles.lineHeight} ${styles.fontFamily}`
```

**For clamp()/vw font sizes:** Read the computed pixel value from DOM, then rebuild the shorthand. Re-prepare when the resolved px value changes (threshold: > 0.5px).

```ts
const resolvedSize = parseFloat(getComputedStyle(el).fontSize)
const font = `${resolvedSize}px ${fontFamily}`
```

**Unsafe:** `system-ui` — canvas and DOM resolve different font variants on macOS. Always use named fonts.

## Internal Architecture

Pretext's measurement pipeline has 5 core source modules:

| Module | Purpose |
|--------|---------|
| `src/layout.ts` | Public API, type definitions, `prepare()` / `layout()` coordination |
| `src/analysis.ts` | Text normalization, segmentation, glue rules, whitespace handling |
| `src/measurement.ts` | Canvas measurement, segment metrics cache, emoji correction, engine profiles |
| `src/line-break.ts` | Line-walking core shared by all layout APIs |
| `src/bidi.ts` | Simplified bidi metadata for mixed LTR/RTL content |

**Source:** https://github.com/chenglou/pretext/tree/main/src

The segment model distinguishes 8+ break kinds: normal text, collapsible spaces, preserved spaces, tabs, non-breaking glue (NBSP/NNBSP/WJ), zero-width break opportunities, soft hyphens, and hard breaks.

Engine profiles auto-detect Chrome, Safari, and Firefox and apply browser-specific quirks (e.g., Safari uses higher line-fit epsilon of 1/64 vs 0.005 for Chromium/Gecko).
