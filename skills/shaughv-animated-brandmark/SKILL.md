---
name: shaughv-animated-brandmark
description: >
  Build the SHAUGHV animated brand mark -- an SVG logo that draws itself
  path-by-path with stroke animation, transitions to solid fill, then
  alternates between a full wordmark and an icon variant in a continuous loop.
  Use this skill when asked to create, recreate, or implement the SHAUGHV
  animated logo, animated brand mark, drawn SVG logo, SVG draw/undraw
  animation, or any animated logo that alternates between two SVG states
  with path-drawing effects. Also use when someone says "animate the
  SHAUGHV logo", "draw-on SVG animation", "brand mark animation", or
  references the SHAUGHV/Shaughv brand identity animation.
---

# SHAUGHV Animated Brand Mark

## Overview

This skill produces a self-drawing SVG logo that continuously alternates
between two forms:

1. **Wordmark** -- the letters S-H-A-U-G-H-V plus mustache and glasses decorations (9 paths total, white)
2. **Icon** -- just the mustache and glasses scaled up to fill the same space (2 paths, orange `#FF5E1A`)

Each transition uses a two-phase animation per path:
- **Draw**: stroke traces the path outline, then crossfades to solid fill
- **Undraw**: fill crossfades back to stroke outline, then stroke erases in reverse order

## SVG Source Assets

| Asset | URL |
|-------|-----|
| Full wordmark | `https://shaughv.s3.us-east-1.amazonaws.com/brandmark/SHAUGHV-Official.svg` |
| Icon (favicon) | `https://shaughv.s3.us-east-1.amazonaws.com/brandmark/favicon/SHAUGHV-Favicon-Dark-Alt.svg` |

Fetch these SVGs to extract `<path d="...">` data if rebuilding from scratch. The path data is also provided in full in [references/implementation.md](references/implementation.md).

**Important:** The Dark-Alt favicon SVG contains 3 paths, not 2. The extra path is a rounded square background shape. This background path must always be excluded from the animation -- only the mustache and glasses paths should be used for the icon layer.

## Required Stack (React/TypeScript)

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | 18+ or 19 | Component framework |
| `framer-motion` | 11+ or 12 | `motion.path`, `useAnimation`, `pathLength` animation |
| TypeScript | 5+ | Type safety (optional but recommended) |

For non-React environments, see the **Framework-Agnostic Approach** section below.

## Animation Technique: `pathLength`

Use framer-motion's built-in `pathLength` property on `<motion.path>`. This is a unitless 0-1 value that framer-motion translates to `stroke-dasharray` and `stroke-dashoffset` internally. No manual `getTotalLength()` measurement is needed.

### Draw Sequence (per animation group)

```
Phase 1 -- Stroke draw:
  pathLength: 0 -> 1    (staggered per path via custom index)
  strokeOpacity: 0 -> 1 (instant, synced with stagger)
  fillOpacity: stays 0

  Wait for all paths to finish + DRAW_FILL_DELAY pause

Phase 2 -- Stroke-to-fill crossfade:
  fillOpacity: 0 -> 1
  strokeOpacity: 1 -> 0
```

### Undraw Sequence (reverse of draw)

```
Phase 1 -- Fill-to-stroke crossfade:
  fillOpacity: 1 -> 0
  strokeOpacity: 0 -> 1

  Wait fillDur + UNDRAW_STROKE_DELAY

Phase 2 -- Stroke erase (reverse stagger: last path first):
  pathLength: 1 -> 0    (delay = (count - 1 - i) * stagger)
```

### Stagger via `custom` Prop

Each `<motion.path>` receives `custom={index}`. When calling `controls.start((i) => ({ ... }))`, framer-motion passes each element's `custom` value as `i`, enabling per-path delay calculation:

```tsx
controls.start((i: number) => ({
  pathLength: 1,
  transition: {
    pathLength: {
      duration: strokeDur / 1000,
      delay: (i * stagger) / 1000,
      ease: [0.16, 1, 0.3, 1],
    },
  },
}));
```

## Architecture: Three Animation Controls

The wordmark has two sub-groups that animate at different speeds:

| Control | Shapes | Timing |
|---------|--------|--------|
| `letterControls` | 7 letter paths (S, H, A, U, G, H, V) | Fast: 650ms stagger, 700ms stroke |
| `decoControls` | 2 decoration paths (mustache, glasses within wordmark) | Slow: 1800ms stagger, 1600ms stroke |
| `iconControls` | 2 icon paths (mustache, glasses standalone) | Slow: 1800ms stagger, 1600ms stroke |

Decorations use the same slow timing as the icon so the mustache/glasses draw at a consistent pace regardless of which SVG variant they appear in.

```tsx
const letterControls = useAnimation();
const decoControls = useAnimation();
const iconControls = useAnimation();
```

## Main Animation Loop

```
Start: wordmark visible (filled), icon hidden

HOLD 10s
  |
  v
UNDRAW decorations (slow) -> UNDRAW letters (fast)
  |
PAUSE 3s
  |
DRAW icon (slow, orange)
  |
HOLD 10s
  |
UNDRAW icon (slow)
  |
PAUSE 3s
  |
DRAW letters (fast) -> DRAW decorations (slow)
  |
HOLD 10s
  |
  v
(repeat)
```

## Timing Constants

```
EASING = [0.16, 1, 0.3, 1]   // cubic-bezier
HOLD = 10000ms                 // display duration between transitions
PAUSE = 3000ms                 // gap between undraw and next draw

// Letters (fast)
W_STAGGER = 650ms              // delay between each letter starting
W_STROKE = 700ms               // stroke draw duration per letter
W_FILL = 400ms                 // fill crossfade duration

// Icon & decorations (slow)
I_STAGGER = 1800ms             // delay between mustache and glasses
I_STROKE = 1600ms              // stroke draw duration per shape
I_FILL = 600ms                 // fill crossfade duration

UNDRAW_STROKE_DELAY = 200ms    // pause after fill-out before stroke erase
DRAW_FILL_DELAY = 400ms        // pause after stroke-in before fill-in
```

## SVG Structure

```xml
<svg viewBox="2.5 52.7 245 165">
  <!-- Wordmark letters: white, starts filled -->
  <g data-layer="wordmark-letters">
    <motion.path custom={0} animate={letterControls} initial={VISIBLE} ... />  <!-- S -->
    <motion.path custom={1} ... />  <!-- H -->
    ...through V (custom={6})
  </g>

  <!-- Wordmark decorations: white, starts filled, slow timing -->
  <g data-layer="wordmark-deco">
    <g transform="matrix(0.733139,0,0,0.733139,32.840353,32.386425)">
      <motion.path custom={0} animate={decoControls} initial={VISIBLE} ... />  <!-- mustache -->
    </g>
    <g transform="matrix(1,0,0,1,0.485,-2.329931)">
      <motion.path custom={1} animate={decoControls} initial={VISIBLE} ... />  <!-- glasses -->
    </g>
  </g>

  <!-- Icon: orange, starts hidden (mustache + glasses ONLY, no background square) -->
  <g data-layer="icon">
    <g transform="matrix(1.3806,0,0,1.3806,-48.63,-83.81)">
      <motion.path custom={0} animate={iconControls} initial={HIDDEN} ... />  <!-- mustache -->
    </g>
    <g transform="matrix(1.8835,0,0,1.8835,-109.56,-154.03)">
      <motion.path custom={1} animate={iconControls} initial={HIDDEN} ... />  <!-- glasses -->
    </g>
  </g>
</svg>
```

Initial states:
- `VISIBLE = { pathLength: 1, strokeOpacity: 0, fillOpacity: 1 }`
- `HIDDEN = { pathLength: 0, strokeOpacity: 0, fillOpacity: 0 }`

## Cancellation and Cleanup

Use a `cancelled` ref, a timer-id array, and a resolver set for robust cleanup:

- `wait(ms)` returns a promise backed by `setTimeout`; resolvers are tracked so they can be flushed on unmount
- Every `draw`/`undraw` checks `cancelled.current` between phases
- Cleanup calls `controls.stop()` on all three controls, clears all timers, and flushes all pending resolvers

## Accessibility

- Check `prefers-reduced-motion` at the top of `useEffect`; skip all animation if enabled (static wordmark stays visible)
- Add `role="img"` and `aria-label` to the SVG
- Support `aria-hidden` prop for when a text alternative exists elsewhere in the DOM

## Framework-Agnostic Approach

If not using React + framer-motion, the same effect is achievable with any animation library or raw CSS/JS. The core algorithm:

1. **Measure each path**: call `getTotalLength()` on every `<path>` element after DOM mount
2. **Set initial stroke-dash**: `stroke-dasharray: <totalLength>; stroke-dashoffset: <totalLength>` (hidden)
3. **Draw**: animate `stroke-dashoffset` from `<totalLength>` to `0` -- the stroke appears to trace the path
4. **Undraw**: animate `stroke-dashoffset` from `0` back to `<totalLength>` -- the stroke disappears
5. **Stagger**: add incremental delay per path based on its index
6. **Fill crossfade**: after all strokes drawn, animate `fill-opacity: 0 -> 1` and `stroke-opacity: 1 -> 0`
7. **Reverse stagger on undraw**: last path starts erasing first (delay = `(count - 1 - index) * stagger`)
8. **Loop**: chain the sequences with hold/pause timers

Compatible animation tools: CSS `@keyframes`, GSAP, Anime.js, Web Animations API, Svelte transitions, Vue `<transition>`, or any library that can animate SVG attributes over time.

### CSS-only example (single path draw)

```css
@keyframes draw {
  from { stroke-dashoffset: var(--path-length); }
  to   { stroke-dashoffset: 0; }
}
path {
  stroke-dasharray: var(--path-length);
  stroke-dashoffset: var(--path-length);
  animation: draw 0.7s ease-in-out forwards;
  animation-delay: calc(var(--index) * 0.65s);
}
```

Set `--path-length` via JS after measuring `getTotalLength()` and `--index` per path element.

## Full Reference Implementation

See [references/implementation.md](references/implementation.md) for the complete React/TypeScript/framer-motion component with all path data, timing constants, and animation logic.
