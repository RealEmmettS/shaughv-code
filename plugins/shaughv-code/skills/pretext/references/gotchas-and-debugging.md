# Gotchas and Debugging

All known caveats, pitfalls, and proven fixes for `@chenglou/pretext`. These are confirmed across 7+ production projects (QubeTX Landing, emmetts_personal_website, resume-2026, speedtest, shaughv-vintage, raw-materials-processor, MAGZ-26).

For the latest caveats, see https://github.com/chenglou/pretext#caveats

## Table of Contents

- [ResizeObserver Infinite Loop](#resizeobserver-infinite-loop)
- [Shrinkwrap + Centered Text Conflict](#shrinkwrap--centered-text-conflict)
- [system-ui Font Mismatch](#system-ui-font-mismatch)
- [Font Shorthand Matching](#font-shorthand-matching)
- [Letter-spacing Not Supported](#letter-spacing-not-supported)
- [clamp() / Responsive Font Sizes](#clamp--responsive-font-sizes)
- [Raw TypeScript Package](#raw-typescript-package)
- [Font Readiness](#font-readiness)
- [Overflow-wrap Behavior](#overflow-wrap-behavior)
- [Cache Management](#cache-management)
- [Browser-Specific Quirks](#browser-specific-quirks)
- [Accuracy and Debugging](#accuracy-and-debugging)

## ResizeObserver Infinite Loop

**Severity:** Critical. Causes visible, continuous text vibration/oscillation.

**Problem:** ResizeObserver + shrinkwrap `max-width` creates an infinite feedback loop:

1. Observer fires (element resized)
2. Compute shrinkwrap width via `layout()`
3. Set `max-width` on element
4. Element resizes (narrower due to max-width)
5. Observer fires again -> back to step 2

**Common misconception:** "Observe the parent element instead." This does NOT fix the problem in flex/grid layouts because the parent's width is content-dependent and also oscillates.

**Root cause confirmed:** Two failed attempts (observing self, observing parent) across the raw-materials-processor project before discovering the correct pattern.

**Correct pattern (from Pretext's own demos):**

```ts
// 1. Measure width synchronously via ref callback on mount
function refCallback(el: HTMLElement | null) {
  if (el) {
    width = el.clientWidth
    scheduleRender()
  }
}

// 2. Listen to window.resize, coalesced through single RAF gate
let scheduledRaf: number | null = null
function scheduleRender() {
  if (scheduledRaf !== null) return
  scheduledRaf = requestAnimationFrame(() => {
    scheduledRaf = null
    render()
  })
}
window.addEventListener('resize', scheduleRender)

// 3. When reading width on elements with max-width (shrinkwrap):
//    temporarily clear max-width, read clientWidth, then restore
function readUnconstrained(el: HTMLElement): number {
  const saved = el.style.maxWidth
  el.style.maxWidth = 'none'  // clear constraint
  const w = el.clientWidth     // read unconstrained width
  el.style.maxWidth = saved    // restore — no visual flash (browser doesn't paint mid-JS)
  return w
}
```

**Key principle:** No ResizeObserver anywhere in the width measurement chain. DOM reads happen synchronously in a single pass, computation is deterministic, and DOM writes don't trigger re-reads within the same frame.

## Shrinkwrap + Centered Text Conflict

**Problem:** Shrinkwrap narrows `max-width` to the tightest width that keeps the same line count. This conflicts with `text-align: center` + `margin: 0 auto` because the narrower `max-width` pulls the centered block off-center or creates uneven centering.

**Fix:** For centered elements, use PretextBlock for **height reservation only** (`min-height`), not shrinkwrap (`max-width`). Shrinkwrap is designed for left-aligned or right-aligned text.

```tsx
{/* WRONG — centered + shrinkwrap causes off-center text */}
<PretextBlock text={subtitle} lineHeight={1.6} shrinkwrap className="text-center mx-auto">
  {subtitle}
</PretextBlock>

{/* CORRECT — centered with height reservation only */}
<PretextBlock text={subtitle} lineHeight={1.6} className="text-center mx-auto">
  {subtitle}
</PretextBlock>
```

## system-ui Font Mismatch

**Problem:** On macOS, canvas `measureText()` and DOM rendering can resolve `system-ui` to different optical variants of the system font (San Francisco). This causes measurement inaccuracy.

**Fix:** Always use named fonts in the font string:
- `'16px Inter'` instead of `'16px system-ui'`
- `'16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'` is also unreliable — use the actual loaded font name

**Detection:** If measurements are consistently 1-3px off, check if `system-ui` is in the font stack.

## Font Shorthand Matching

**Problem:** The `font` string passed to `prepare()` must match the computed CSS font exactly. Mismatches cause measurement inaccuracy because canvas uses one font while DOM renders another.

**Pattern for extracting the exact font:**

```ts
function getFontFromStyles(styles: CSSStyleDeclaration): string {
  // Prefer the shorthand if the browser provides it
  return styles.font.length > 0
    ? styles.font
    : `${styles.fontStyle} ${styles.fontVariant} ${styles.fontWeight} ${styles.fontSize} / ${styles.lineHeight} ${styles.fontFamily}`
}

// Usage:
const styles = getComputedStyle(textElement)
const font = getFontFromStyles(styles)
const prepared = prepare(text, font)
```

**Next.js note:** When using `next/font`, the browser rewrites font family names (e.g., `"__Unbounded_a1b2c3"`). Read the computed font from the DOM element, not from your source code constants.

## Letter-spacing Not Supported

**Problem:** Pretext's Canvas `measureText()` does not account for CSS `letter-spacing` (tracking). Elements with custom tracking (e.g., Tailwind `tracking-widest` or CSS `letter-spacing: 0.3em`) will have inaccurate measurements.

**Workaround:**
- Skip Pretext measurement for elements with letter-spacing
- In practice, elements with custom tracking are usually short labels, headings, or tags that don't need multi-line measurement

## clamp() / Responsive Font Sizes

**Problem:** When CSS `clamp()` or `@media` queries change the resolved font size, the prepared text becomes stale — it was measured at the old font size.

**Fix:** Detect when the resolved pixel value changes and re-call `prepare()`:

```ts
let lastFontSize = 0

function checkFontSizeChange(el: HTMLElement): boolean {
  const current = parseFloat(getComputedStyle(el).fontSize)
  if (Math.abs(current - lastFontSize) > 0.5) {
    lastFontSize = current
    return true // re-prepare needed
  }
  return false
}
```

**Threshold:** Use > 0.5px to avoid sub-pixel churn while catching meaningful changes.

## Raw TypeScript Package

**Problem:** `@chenglou/pretext` exports raw `.ts` source files with `.ts` extension imports. Most bundlers don't process `.ts` files from `node_modules` by default.

**Symptoms:**
- Next.js: "Unknown module type" error from Turbopack
- TypeScript: "An import path can only end with a '.ts' extension when 'allowImportingTsExtensions' is enabled"
- Note: `skipLibCheck: true` does NOT help (pretext ships `.ts` files, not `.d.ts` declarations)

**Fix:**

| Framework | Config |
|-----------|--------|
| Next.js | `transpilePackages: ['@chenglou/pretext']` in next.config |
| Vite | `optimizeDeps: { include: ['@chenglou/pretext'] }` in vite.config |
| Both | `allowImportingTsExtensions: true` in tsconfig.json |
| Bun | No config needed (native .ts support) |

## Font Readiness

**Problem:** If `prepare()` is called before fonts have loaded, canvas measures with fallback font widths, producing incorrect layout results that persist for the lifetime of that prepared handle.

**Fix:** Always gate on `document.fonts.ready`:

```ts
// In vanilla JS:
await document.fonts.ready
const isLoaded = document.fonts.check('16px "My Custom Font"')
if (isLoaded) {
  const prepared = prepare(text, '16px "My Custom Font"')
}

// In React (useEffect):
useEffect(() => {
  document.fonts.ready.then(() => {
    setFontsReady(true)
  })
}, [])

// In demos (imperative):
document.fonts.ready.then(() => {
  scheduleRender()
})
```

**Note:** `document.fonts.ready` resolves when all fonts in the current document have finished loading. The `document.fonts.check()` method verifies a specific font is available.

## Overflow-wrap Behavior

**Problem (not a bug):** At very narrow widths, text breaks inside words at grapheme boundaries. This matches CSS `overflow-wrap: break-word` behavior, which is Pretext's target.

**If you want different behavior:** Layer stricter whole-word handling on top in userland rather than expecting the library to change its default. Pretext intentionally matches the common CSS configuration.

## Cache Management

Pretext caches segment measurements by font in a shared `Map<font, Map<segment, metrics>>`.

**When to call `clearCache()`:**
- When cycling through many different fonts (e.g., a font picker UI)
- After dynamically loading/unloading fonts
- In long-running applications where memory growth is a concern

**`setLocale()` also clears caches** — setting a new locale resets the `Intl.Segmenter` and clears all cached measurements.

**Note:** Clearing the cache does NOT invalidate existing prepared handles. They retain their measurements.

## Browser-Specific Quirks

Pretext auto-detects the browser engine and applies profile-specific adjustments:

| Browser | Quirk | Handling |
|---------|-------|----------|
| **Chrome/Chromium** | Emoji measured 1-3px wider on macOS (Apple Color Emoji) | Auto-corrected via DOM calibration read (one cached read per font) |
| **Firefox** | Similar emoji inflation to Chrome | Same auto-correction |
| **Safari** | Higher line-fit tolerance needed (1/64 vs 0.005) | Engine profile applies wider epsilon |
| **Safari** | Prefers prefix widths for breakable runs | Profile-specific measurement path |
| **Safari** | Canvas and DOM emoji widths agree (both wider than fontSize) | Emoji correction = 0 (no adjustment needed) |

These are handled automatically — no user action required.

## Accuracy and Debugging

**Current accuracy:** 7680/7680 across Chrome, Safari, Firefox (4 fonts x 8 sizes x 8 widths x 30 texts)

**Latest status:** https://github.com/chenglou/pretext/blob/main/STATUS.md

**If measurements seem wrong, check in this order:**

1. **Font readiness** — Is `document.fonts.ready` resolved? Is the specific font loaded?
2. **Font string match** — Does the font string passed to `prepare()` match `getComputedStyle(el).font`?
3. **system-ui** — Is `system-ui` in the font stack? Replace with named font.
4. **Letter-spacing** — Does the element have CSS `letter-spacing`? Pretext doesn't account for it.
5. **Font size change** — Has `clamp()` or a media query changed the resolved font size since `prepare()` was called?
6. **Stale cache** — Has a font been dynamically loaded/changed since `prepare()`? Re-prepare with the new font.
7. **CSS assumptions** — Does the element use `white-space: normal`, `word-break: normal`, `overflow-wrap: break-word`? These are Pretext's target configuration.
