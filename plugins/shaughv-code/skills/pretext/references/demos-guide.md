# Demos Guide

Architectural breakdowns of all 7 official Pretext demos with direct source code excerpts. These demos are the authoritative reference for how to use Pretext in real applications.

## Live Links

- **Live demo hub:** https://chenglou.me/pretext/
- **Community demos:** https://somnai-dreams.github.io/pretext-demos/
- **Source code:** https://github.com/chenglou/pretext/tree/main/pages/demos

## Table of Contents

- [Accordion — Height Reservation](#accordion--height-reservation)
- [Bubbles — Shrinkwrap Binary Search](#bubbles--shrinkwrap-binary-search)
- [Dynamic Layout — Obstacle-Aware Editorial Spread](#dynamic-layout--obstacle-aware-editorial-spread)
- [Editorial Engine — Multi-Column Flow](#editorial-engine--multi-column-flow)
- [Rich Note — Mixed Inline Styles](#rich-note--mixed-inline-styles)
- [Variable Typographic ASCII — Character Measurement](#variable-typographic-ascii--character-measurement)
- [Masonry — Height Prediction](#masonry--height-prediction)

---

## Accordion — Height Reservation

**Source:** [pages/demos/accordion.ts](https://github.com/chenglou/pretext/blob/main/pages/demos/accordion.ts)
**Live:** https://chenglou.me/pretext/demos/accordion
**APIs used:** `prepare`, `layout`
**Pattern:** Calculate panel height via Pretext to drive CSS expand/collapse transitions without DOM measurement

### Architecture

The accordion stores text items with titles and body text. On each render:
1. Read the computed font from the DOM (handles dynamic fonts like next/font)
2. Re-prepare texts if the font has changed
3. Calculate each panel's height via `layout()`
4. Apply the calculated height for CSS transitions

### Key Code: Font Detection

```ts
function getFontFromStyles(styles: CSSStyleDeclaration): string {
  return styles.font.length > 0
    ? styles.font
    : `${styles.fontStyle} ${styles.fontVariant} ${styles.fontWeight} ${styles.fontSize} / ${styles.lineHeight} ${styles.fontFamily}`
}
```

### Key Code: Prepare Caching

```ts
const preparedCache = {
  font: '',
  items: [] as PreparedText[],
}

function refreshPrepared(font: string): void {
  if (preparedCache.font === font) return
  preparedCache.font = font
  preparedCache.items = items.map(item => prepare(item.text, font))
}
```

### Key Code: Render Function

```ts
function render(_now: number): boolean {
  const copyStyles = getComputedStyle(firstCopy)
  const innerStyles = getComputedStyle(firstInner)
  const font = getFontFromStyles(copyStyles)
  const lineHeight = parsePx(copyStyles.lineHeight)
  const contentWidth = firstCopy.getBoundingClientRect().width
  const paddingY = parsePx(innerStyles.paddingTop) + parsePx(innerStyles.paddingBottom)

  refreshPrepared(font)

  const panelHeights: number[] = []
  for (let index = 0; index < items.length; index++) {
    const metrics = layout(preparedCache.items[index]!, contentWidth, lineHeight)
    panelHeights.push(Math.ceil(metrics.height + paddingY))
  }

  for (let index = 0; index < items.length; index++) {
    const expanded = openItemId === items[index]!.id
    itemDom.body.style.height = expanded ? `${panelHeights[index]}px` : '0px'
  }

  return false
}
```

### Key Code: RAF Gate

```ts
let scheduledRaf: number | null = null

function scheduleRender(): void {
  if (scheduledRaf !== null) return
  scheduledRaf = requestAnimationFrame(function renderAccordionFrame(now) {
    scheduledRaf = null
    if (render(now)) scheduleRender()
  })
}

window.addEventListener('resize', scheduleRender)
document.fonts.ready.then(scheduleRender)
```

---

## Bubbles — Shrinkwrap Binary Search

**Source:** [pages/demos/bubbles.ts](https://github.com/chenglou/pretext/blob/main/pages/demos/bubbles.ts) + [bubbles-shared.ts](https://github.com/chenglou/pretext/blob/main/pages/demos/bubbles-shared.ts)
**Live:** https://chenglou.me/pretext/demos/bubbles
**APIs used:** `prepareWithSegments`, `walkLineRanges`, `layout`
**Pattern:** Binary search for the tightest container width that keeps the same line count, eliminating wasted whitespace in chat bubbles

### Architecture

Chat message bubbles naturally waste space — the browser wraps text at `max-width`, but the last line is often much shorter, leaving a large gap. Pretext solves this by finding the minimum width that keeps the same number of lines, then applying it as the bubble's width.

### Key Code: Wrap Metrics Collection

```ts
export function collectWrapMetrics(prepared: PreparedTextWithSegments, maxWidth: number): WrapMetrics {
  let maxLineWidth = 0
  const lineCount = walkLineRanges(prepared, maxWidth, line => {
    if (line.width > maxLineWidth) maxLineWidth = line.width
  })
  return {
    lineCount,
    height: lineCount * LINE_HEIGHT,
    maxLineWidth,
  }
}
```

### Key Code: Binary Search for Tight Width

```ts
export function findTightWrapMetrics(prepared: PreparedTextWithSegments, maxWidth: number): WrapMetrics {
  const initial = collectWrapMetrics(prepared, maxWidth)
  let lo = 1
  let hi = Math.max(1, Math.ceil(maxWidth))

  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    const midLineCount = layout(prepared, mid, LINE_HEIGHT).lineCount
    if (midLineCount <= initial.lineCount) {
      hi = mid
    } else {
      lo = mid + 1
    }
  }

  return collectWrapMetrics(prepared, lo)
}
```

### Key Code: Bubble Render Computation

```ts
export function computeBubbleRender(preparedBubbles: PreparedBubble[], chatWidth: number): BubbleRenderState {
  const bubbleMaxWidth = Math.floor(chatWidth * BUBBLE_MAX_RATIO)
  const contentMaxWidth = bubbleMaxWidth - PADDING_H * 2
  let totalWastedPixels = 0
  const widths: BubbleRenderWidths[] = []

  for (let index = 0; index < preparedBubbles.length; index++) {
    const bubble = preparedBubbles[index]!
    const cssMetrics = collectWrapMetrics(bubble.prepared, contentMaxWidth)
    const tightMetrics = findTightWrapMetrics(bubble.prepared, contentMaxWidth)

    const cssWidth = Math.ceil(cssMetrics.maxLineWidth) + PADDING_H * 2
    const tightWidth = Math.ceil(tightMetrics.maxLineWidth) + PADDING_H * 2
    const cssHeight = cssMetrics.height + PADDING_V * 2
    totalWastedPixels += Math.max(0, cssWidth - tightWidth) * cssHeight
    widths.push({ cssWidth, tightWidth })
  }

  return { chatWidth, bubbleMaxWidth, totalWastedPixels, widths }
}
```

### Constants

```ts
const FONT = '15px "Helvetica Neue", Helvetica, Arial, sans-serif'
const LINE_HEIGHT = 20
const PADDING_H = 12
const PADDING_V = 8
const BUBBLE_MAX_RATIO = 0.8
```

---

## Dynamic Layout — Obstacle-Aware Editorial Spread

**Source:** [pages/demos/dynamic-layout.ts](https://github.com/chenglou/pretext/blob/main/pages/demos/dynamic-layout.ts)
**Also uses:** [pages/demos/wrap-geometry.ts](https://github.com/chenglou/pretext/blob/main/pages/demos/wrap-geometry.ts) (obstacle hull extraction, polygon/rect interval computation, slot carving), [pages/demos/dynamic-layout-text.ts](https://github.com/chenglou/pretext/blob/main/pages/demos/dynamic-layout-text.ts) (body copy — excerpt from Leopold Aschenbrenner's "Situational Awareness")
**Live:** https://chenglou.me/pretext/demos/dynamic-layout
**APIs used:** `prepareWithSegments`, `layoutNextLine`, `walkLineRanges`
**Pattern:** Text flowing around SVG logo obstacles with variable-width lines, two-column editorial spread, font size fitting

### Architecture

`wrap-geometry.ts` provides the geometric primitives: `getWrapHull` (extracts contour from rasterized SVG alpha), `transformWrapPoints` (rotate/scale hull), `isPointInPolygon` (hit testing), `getPolygonIntervalForBand` / `getRectIntervalsForBand` (obstacle intervals per line band), and `carveTextLineSlots` (subtract blocked intervals from a line region to find available text slots). These are imported by the dynamic layout and reused conceptually in the editorial engine.

This is the most complex demo. It shows:
- Title text routes around the OpenAI logo using `layoutNextLine` with varying widths
- Body text flows in two columns, with the left column consuming first and the right column resuming from the shared cursor
- Right column routes around both the title geometry and the Claude logo
- SVG logo hulls are extracted from rasterized alpha channels and transformed per render
- Clicking a logo rotates it, and text reflows live around the rotated geometry

### Key Code: Column Layout with Obstacles

This is the core obstacle routing pattern — reusable for any variable-width text flow:

```ts
function layoutColumn(
  prepared: PreparedTextWithSegments,
  startCursor: LayoutCursor,
  region: Rect,
  lineHeight: number,
  obstacles: BandObstacle[],
  side: 'left' | 'right',
): { lines: PositionedLine[], cursor: LayoutCursor } {
  let cursor: LayoutCursor = startCursor
  let lineTop = region.y
  const lines: PositionedLine[] = []

  while (true) {
    if (lineTop + lineHeight > region.y + region.height) break

    const bandTop = lineTop
    const bandBottom = lineTop + lineHeight
    const blocked: Interval[] = []
    for (const obstacle of obstacles) {
      const intervals = getObstacleIntervals(obstacle, bandTop, bandBottom)
      for (const interval of intervals) blocked.push(interval)
    }

    const slots = carveTextLineSlots(
      { left: region.x, right: region.x + region.width },
      blocked,
    )
    if (slots.length === 0) { lineTop += lineHeight; continue }

    // Pick the widest slot (or leftmost/rightmost on tie)
    let slot = slots[0]!
    for (let i = 1; i < slots.length; i++) {
      const candidate = slots[i]!
      if ((candidate.right - candidate.left) > (slot.right - slot.left)) slot = candidate
    }

    const width = slot.right - slot.left
    const line = layoutNextLine(prepared, cursor, width)
    if (line === null) break

    lines.push({ x: Math.round(slot.left), y: Math.round(lineTop), width: line.width, text: line.text })
    cursor = line.end
    lineTop += lineHeight
  }

  return { lines, cursor }
}
```

### Key Code: Headline Font Fitting

Binary search for the largest font size where the headline doesn't break inside a word:

```ts
function fitHeadlineFontSize(headlineWidth: number, pageWidth: number): number {
  let low = Math.ceil(Math.max(22, pageWidth * 0.026))
  let high = Math.floor(Math.min(94.4, Math.max(55.2, pageWidth * 0.055)))
  let best = low

  while (low <= high) {
    const size = Math.floor((low + high) / 2)
    const font = `700 ${size}px ${HEADLINE_FONT_FAMILY}`
    const headlinePrepared = getPrepared(HEADLINE_TEXT, font)
    if (!headlineBreaksInsideWord(headlinePrepared, headlineWidth)) {
      best = size
      low = size + 1
    } else {
      high = size - 1
    }
  }

  return best
}

function headlineBreaksInsideWord(prepared: PreparedTextWithSegments, maxWidth: number): boolean {
  let breaksInsideWord = false
  walkLineRanges(prepared, maxWidth, line => {
    if (line.end.graphemeIndex !== 0) breaksInsideWord = true
  })
  return breaksInsideWord
}
```

### Key Code: Multi-Column Flow

```ts
// Left column consumes text first
const leftResult = layoutColumn(preparedBody, { segmentIndex: 0, graphemeIndex: 0 },
  leftRegion, lineHeight, [openaiObstacle], 'left')

// Right column resumes from where left stopped
const rightResult = layoutColumn(preparedBody, leftResult.cursor,
  rightRegion, lineHeight, [titleObstacle, claudeObstacle, openaiObstacle], 'right')
```

---

## Editorial Engine — Multi-Column Flow

**Source:** [pages/demos/editorial-engine.ts](https://github.com/chenglou/pretext/blob/main/pages/demos/editorial-engine.ts)
**Live:** https://chenglou.me/pretext/demos/editorial-engine
**APIs used:** `prepareWithSegments`, `layoutNextLine`, `layoutWithLines`, `walkLineRanges`
**Pattern:** Magazine-style multi-column layout with animated obstacles, pull quotes, and drop caps

### Architecture

This demo extends the Dynamic Layout pattern with:
- **Animated orbs** — circular obstacles that bounce around the page, text reflows in real-time
- **Pull quotes** — styled excerpts placed as obstacles within columns
- **Drop caps** — oversized first letter spanning multiple lines
- **Responsive** — switches from 2-column to 1-column at narrow viewport
- **60fps** — entire layout recalculated per frame including text reflow around moving obstacles

### Key Types

```ts
type CircleObstacle = {
  cx: number; cy: number; r: number
  hPad: number; vPad: number
}

type RectObstacle = {
  x: number; y: number; w: number; h: number
}

type PullquotePlacement = {
  colIdx: number; yFrac: number; wFrac: number; side: 'left' | 'right'
}

type OrbDefinition = {
  fx: number; fy: number; r: number
  vx: number; vy: number; color: [number, number, number]
}
```

### Pattern: Continuous Animation + Layout

The editorial engine runs a continuous `requestAnimationFrame` loop:
1. Update orb positions (physics simulation)
2. Convert orbs to obstacle geometry
3. Lay out headline with `walkLineRanges`
4. Flow body text through columns with `layoutNextLine` around all obstacles
5. Project all lines to DOM elements

This demonstrates that Pretext's `layout()` phase is fast enough for 60fps re-layout even with dozens of obstacles.

**Notable:** This is the only demo that uses `layoutWithLines` — it lays out pull quotes at a fixed width to get their line geometry before placing them as rect obstacles. The editorial engine also has its own local `layoutColumn` variant with a different signature from `dynamic-layout.ts` — it takes separate `circleObstacles` and `rectObstacles` arrays and a `singleSlotOnly` parameter, and reimplements `carveTextLineSlots` locally with a wider `MIN_SLOT_WIDTH` of 50px.

---

## Rich Note — Mixed Inline Styles

**Source:** [pages/demos/rich-note.ts](https://github.com/chenglou/pretext/blob/main/pages/demos/rich-note.ts)
**Live:** https://chenglou.me/pretext/demos/rich-note
**APIs used:** `prepareWithSegments`, `layoutNextLine`, `walkLineRanges`
**Pattern:** Rich inline text with multiple fonts (body, code, links) and non-text inline elements (chips/pills)

### Architecture

This demo handles inline items that span multiple prepared texts with different fonts:
- **Body text** — regular weight
- **Links** — bold weight
- **Code spans** — monospace font with padding chrome
- **Chips** — non-text inline elements (mentions, statuses, priorities) measured separately

### Key Types

```ts
type TextStyleModel = {
  className: string
  chromeWidth: number  // extra width from padding/borders
  font: string
}

type TextInlineItem = {
  kind: 'text'
  className: string
  chromeWidth: number
  endCursor: LayoutCursor
  fullText: string
  fullWidth: number
  leadingGap: number
  prepared: PreparedTextWithSegments
}

type ChipInlineItem = {
  kind: 'chip'
  className: string
  leadingGap: number
  text: string
  width: number
}

type InlineItem = TextInlineItem | ChipInlineItem
```

### Style Definitions

```ts
const TEXT_STYLES = {
  body: { className: 'frag frag--body', chromeWidth: 0, font: BODY_FONT },
  code: { className: 'frag frag--code', chromeWidth: 14, font: CODE_FONT },
  link: { className: 'frag frag--link', chromeWidth: 0, font: LINK_FONT },
}
```

### Pattern: Multi-Font Inline Layout

The demo prepares each text run separately with its own font, then coordinates cursors across the inline item sequence. `layoutNextLine` is used to determine how much of each text item fits on the current line, accounting for the accumulated width of preceding items.

---

## Variable Typographic ASCII — Character Measurement

**Source:** [pages/demos/variable-typographic-ascii.ts](https://github.com/chenglou/pretext/blob/main/pages/demos/variable-typographic-ascii.ts)
**Live:** https://chenglou.me/pretext/demos/variable-typographic-ascii
**APIs used:** `prepareWithSegments`
**Pattern:** Measuring individual character widths for proportional-width ASCII art rendering

### Architecture

This demo creates particle-driven ASCII art that compares monospace vs proportional rendering:
- Measures the width of each character in a charset using `prepareWithSegments`
- Maps brightness values to characters
- Simulates particles with velocity and forces
- Renders each frame as a grid of individually-positioned proportional characters

### Key Configuration

```ts
const COLS = 50
const ROWS = 28
const FONT_SIZE = 14
const PROP_FAMILY = 'Georgia, Palatino, "Times New Roman", serif'
const CHARSET = ' .,:;!+-=*#@%&abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const WEIGHTS = [300, 500, 800] as const
const STYLES = ['normal', 'italic'] as const
```

This demo shows that Pretext's character-level measurement can be used for purposes beyond traditional text layout — anywhere you need precise per-character metrics.

---

## Masonry — Height Prediction

**Source:** [pages/demos/masonry/](https://github.com/chenglou/pretext/tree/main/pages/demos/masonry)
**Live:** https://chenglou.me/pretext/demos/masonry
**APIs used:** `prepare`, `layout`
**Pattern:** Predict card heights for masonry layout without DOM measurement, enabling viewport-based occlusion

### Architecture

1. **Prepare all texts upfront** — one `prepare()` call per card on initialization
2. **Compute layout** — on each resize, calculate column layout:
   - Determine column count and width from viewport
   - For each card, compute height via `layout()` + padding
   - Assign cards to the shortest column (standard masonry algorithm)
3. **Viewport occlusion** — only render DOM elements for cards visible in the viewport
4. **Pool DOM elements** — reuse card elements as cards scroll in/out of view

### Key Code: Layout Computation

```ts
const st: State = {
  cards: rawThoughts.map(text => ({
    text,
    prepared: prepare(text, font),  // prepare all upfront
  })),
}

function computeLayout(windowWidth: number): LayoutState {
  const colHeights = new Float64Array(colCount)
  const positionedCards: PositionedCard[] = []

  for (let i = 0; i < st.cards.length; i++) {
    // Find shortest column
    let shortest = 0
    for (let c = 1; c < colCount; c++) {
      if (colHeights[c]! < colHeights[shortest]!) shortest = c
    }

    // Predict height via Pretext (no DOM measurement!)
    const { height } = layout(st.cards[i]!.prepared, textWidth, lineHeight)
    const cardHeight = height + cardPadding * 2

    positionedCards.push({
      cardIndex: i,
      x: offsetLeft + shortest * (colWidth + gap),
      y: colHeights[shortest]!,
      h: cardHeight,
    })
    colHeights[shortest]! += cardHeight + gap
  }

  return { colWidth, contentHeight, positionedCards }
}
```

### Key Advantage

Traditional masonry layouts require rendering all cards to the DOM first to measure their heights, then repositioning them. This causes layout thrashing. Pretext eliminates this by predicting heights via pure arithmetic — cards can be positioned correctly on the first render.
