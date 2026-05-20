# SHAUGHV Brand Mark — Specification & Animation Recipe

> Canonical reference for **how to render and animate the SHAUGHV brand mark** in any output produced from this design system. Designed so any agent — working in HTML, React, Vue, Svelte, vanilla JS, or a static export — can drop in the mark correctly without re-discovering the rules.

The SHAUGHV brand mark is **always one of three things**:

1. **Animated brand mark** — the canonical surface treatment. Wordmark fades out, the hidden mustache-and-glasses icon draws itself in, holds, then the wordmark redraws. Loops forever. Used on every primary SHAUGHV surface (personal site navbar, control rooms, splash screens).
2. **Static wordmark** — fallback for frameworks/contexts that can't animate SVG. Renders `assets/SHAUGHV-Official.svg` once, in `currentColor`.
3. **Static icon mark** — the mustache-and-glasses-only variant. Used at favicon scale or when the wordmark would be illegibly small.

**All three inherit color via `currentColor`.** The host element's CSS `color` property is the only color knob. Never bake fills into the SVG.

---

## Decision tree — which mark do I use?

```
Is the output an HTML artifact (any flavour: vanilla, React, deck, prototype)?
├── YES → can it host the mark at ≥ 64 × 64 px AND run a 4 kB JS file?
│   ├── YES → ANIMATED MARK   (assets/animated-brand-mark.js)
│   └── NO  → STATIC WORDMARK (assets/SHAUGHV-Official.svg, or <shaughv-mark data-static>)
└── NO  → is it a fixed-frame export (PPTX, PDF, screenshot, video frame)?
    ├── YES → STATIC WORDMARK (assets/SHAUGHV-Official.svg)
    └── NO  → tiny surface (≤ 48 px), avatar, or favicon?
        ├── YES → STATIC ICON MARK (assets/SHAUGHV-Favicon-*.svg)
        └── NO  → STATIC WORDMARK
```

**Default for every SHAUGHV-branded site or app**: animated mark, **≥ 64 × 64 px**, on the primary feature surface (hero, splash, control-room masthead, navbar lockup), color `var(--fg)` (vintage palette) or `#FFFFFF` (brutalist dark palette). On hover/focus of the surrounding lockup, no color change — the animation IS the affordance. Anything smaller than 64 × 64 px falls back to the **static wordmark**.

---

## Files in this kit

| Path | What it is | When to use |
|---|---|---|
| `assets/SHAUGHV-Official.svg` | Source-of-truth static wordmark — monochrome, `currentColor` | Static contexts; default fallback for everything |
| `assets/animated-brand-mark.js` | **Vanilla JS drop-in** that renders & animates the mark — no framework, no deps | Any HTML artifact, deck slide, prototype, plain-JS site |
| `assets/AnimatedBrandMark.jsx` | **React + Framer Motion** port of the same animation | React/Next.js codebases (already using `framer-motion`) |
| `assets/SHAUGHV-Favicon-Light.svg` / `-Dark.svg` / `-*-Alt.svg` | Icon-mark-only variants (mustache + glasses, no letters) | Favicons, ≤ 48 px surfaces, avatar contexts |
| `assets/SHAUGHV-Green.png` / `SHAUGHV-Orange.png` | Pre-baked colour PNGs of the wordmark | Only when consumer can't render SVG — PPTX exports, social cards |

---

## Quick start

### A) HTML artifact / vanilla JS — the universal path

This is what an agent should reach for **first** in throwaway prototypes, decks, design canvases, marketing pages, etc.

```html
<head>
  <!-- color comes from the host element via currentColor -->
  <style>
    .brand-mark {
      display: inline-block;
      height: 56px;
      width: auto;
      color: var(--fg, #5C5446); /* olive on cream by default */
    }
  </style>
</head>
<body>
  <!-- Option 1 — custom element (cleaner) -->
  <shaughv-mark class="brand-mark" aria-label="SHAUGHV"></shaughv-mark>

  <!-- Option 2 — data attribute on any element -->
  <span class="brand-mark" data-shaughv-mark></span>

  <script src="assets/animated-brand-mark.js"></script>
</body>
```

That's the whole integration. The script:

- auto-mounts on every `[data-shaughv-mark]` and every `<shaughv-mark>` element on `DOMContentLoaded`.
- runs the canonical loop (described below) using requestAnimationFrame + SVG `pathLength` + `stroke-dashoffset` — no Framer Motion, no Anime.js, no GSAP.
- respects `prefers-reduced-motion: reduce` by rendering the static wordmark.
- inherits color through `currentColor` — the host element's `color` property is the only color knob.

**Per-instance opt-outs (data-attrs or `ShaughvMark.mount(el, opts)`):**

| Attr | Option key | Effect |
|---|---|---|
| `data-static` | `static: true` | Skip the loop. Render the wordmark filled and held forever. |
| `data-icon-only` | `iconOnly: true` | Render the mustache-and-glasses icon variant, no wordmark, no loop. |
| `data-aria-label` | `ariaLabel: string` | Accessible name (default `"SHAUGHV"`). |

**Manual mounting / cleanup:**

```js
const handle = ShaughvMark.mount(document.querySelector('#mark'), { static: false });
// later, in an SPA route teardown:
handle.destroy();
```

### B) React + Framer Motion codebase

If the consumer already uses `framer-motion`, copy `assets/AnimatedBrandMark.jsx` into the project, rename the import to `.tsx` if needed, and use it directly:

```tsx
import AnimatedBrandMark from "./components/AnimatedBrandMark";

<div className="brand-lockup" style={{ color: "var(--fg)" }}>
  <AnimatedBrandMark className="brand-lockup-mark" />
  <span>SHAUGHV / OpenAI voice demo</span>
</div>
```

It is **the exact source the production navbar uses** — no re-discovery needed. Sizing comes from CSS on `.brand-lockup-mark` (set `height: 56px; width: auto;`).

### C) Anywhere else (Vue / Svelte / static-site generator / unknown framework)

Two options, in order of preference:

1. **Drop the vanilla JS file in.** It is framework-agnostic — it speaks DOM + SVG. If your framework gives you a real mounted DOM node, you can call `ShaughvMark.mount(node)` from a lifecycle hook and `destroy()` from teardown.
2. **Fall back to the static wordmark.** Use `<img src="assets/SHAUGHV-Official.svg">` or inline the SVG. Done. The brand still reads correctly; you just lose the motion.

### D) Fixed-frame export (PPTX, PDF, video, screenshot)

Use the static wordmark — `assets/SHAUGHV-Official.svg`. Embed it once per surface. **Never** try to render a single keyframe of the animation as the "logo" — that's broken.

---

## The animation, fully specified

This is what the vanilla JS file and the React component both implement. Reproduce it exactly if you ever need to port to another framework (CSS animations, Lottie, GSAP, etc.).

### Two visual states

- **State A — Wordmark:** all 7 letters of "SHAUGHV" filled, plus mustache + glasses overlaid on the letterforms (the "deco" layer). Held for 10 s at rest.
- **State B — Icon mark:** mustache + glasses scaled up to fill the full glyph area, no letters. Held for 10 s at rest.

### The loop

```
[State A held 10 s]
  ↓ undraw deco (stroke fades in over fill, then path retreats)
  ↓ undraw letters
  ↓ 3 s pause
  ↓ draw icon (path advances, then fill fades in)
[State B held 10 s]
  ↓ undraw icon
  ↓ 3 s pause
  ↓ draw letters
  ↓ draw deco
[State A held 10 s] → loop forever
```

### Per-shape draw / undraw mechanics

Each path supports three animated quantities. The animation tweens them per shape; each is normalized 0→1.

| Quantity | SVG mechanism | Meaning |
|---|---|---|
| `pathLength` (path progress) | `pathLength="1"` + `stroke-dasharray="1 1"` + `stroke-dashoffset: 1→0` | 0 = invisible stroke, 1 = full stroke |
| `strokeOpacity` | `style.strokeOpacity` | self-explanatory |
| `fillOpacity` | `style.fillOpacity` | self-explanatory |

**Draw sequence** (per layer):

1. Each shape, staggered by `stagger`, animates `pathLength: 0 → 1` over `strokeDur` ms with `strokeOpacity = 1, fillOpacity = 0`.
2. After all shapes finish stroking (`(count-1)*stagger + strokeDur`), wait `DRAW_FILL_DELAY` (400 ms).
3. All shapes simultaneously crossfade `fillOpacity: 0 → 1` and `strokeOpacity: 1 → 0` over `fillDur` ms.

**Undraw sequence** (per layer) — the reverse:

1. All shapes simultaneously crossfade `fillOpacity: 1 → 0` and `strokeOpacity: 0 → 1` over `fillDur` ms.
2. Wait `fillDur + UNDRAW_STROKE_DELAY` (200 ms).
3. Each shape, **reverse-staggered** (last drawn = first to retreat), animates `pathLength: 1 → 0` over `strokeDur` ms.

### Constants (DO NOT change)

```
HOLD                = 10 000 ms   // how long each filled state holds
PAUSE               =  3 000 ms   // pause between morphs
DRAW_FILL_DELAY     =    400 ms   // gap between stroke-done and fill-in
UNDRAW_STROKE_DELAY =    200 ms   // gap between fill-out and stroke-retreat

// Wordmark letters (7 paths)
W_LETTER_COUNT =      7
W_STAGGER      =    650 ms
W_STROKE       =    700 ms
W_FILL         =    400 ms

// Wordmark deco overlay (2 paths) — slower, reads as a "final flourish"
W_DECO_COUNT   =      2
(uses I_STAGGER / I_STROKE / I_FILL below for its draw/undraw)

// Icon variant (2 paths) — slow, deliberate
I_COUNT        =      2
I_STAGGER      =  1 800 ms
I_STROKE       =  1 600 ms
I_FILL         =    600 ms
```

### Easing

`cubic-bezier(0.16, 1, 0.3, 1)` (expo-out, dramatic ease-out) — used on every quantity (stroke offset, fill opacity, stroke opacity). The vanilla JS file solves the bezier inline; the React component passes the same array as Framer Motion's `ease`.

### Color rules

- The SVG only ever uses `fill="currentColor"` and `stroke="currentColor"`. The host element's CSS `color` property paints both.
- Never hardcode `#5C5446` (olive), `#5B8A5B` (sage), `#FF5E1A` (brand orange), or any other hex inside the SVG markup.
- Strokes are visible only mid-animation (during the path-draw transition). At rest the mark is fill-only — the stroke widths in the data (1.2 / 1.64 etc.) are tuned for the animation, not for static rendering.

### Reduced-motion behaviour

If `window.matchMedia('(prefers-reduced-motion: reduce)').matches`:

- React component: returns early from the effect → mark stays in initial state (wordmark filled, no animation).
- Vanilla JS file: skips the loop and treats the mount as `data-static`.

This is non-negotiable. The animation is decorative; it must never block reading the mark.

---

## Sizing rules

> **Hard floor — animated mark: 64 px wide × 64 px tall.** The animated brand mark **must never be rendered smaller than 64×64**. Below that size the wordmark stroke math, the deco/icon morph, and the timing all read as illegible noise — the mark is doing motion design work, and that work needs room. **If your surface cannot host the mark at ≥ 64 px on both axes, fall back to the static wordmark (`assets/SHAUGHV-Official.svg`) or the static icon variant.** Set `data-static` on the `<shaughv-mark>` element if you want the same web-component API but no animation. This rule applies everywhere — navbars, decks, prototype chrome, eyebrow lockups — no exceptions.

| Context | Width / height | Variant | Notes |
|---|---|---|---|
| Hero / splash / feature surface | 120–320 px | Animated | The canonical use. Centered or anchored, no chrome around it. |
| Primary navbar — desktop | **≥ 64 px** square | Animated (or static) | Production size on emmettshaughnessy.com and SHAUGHV control rooms. |
| Primary navbar — mobile | **≥ 64 px** square | Animated (or static) | Maintains 44 px minimum tap target with room to spare. |
| Inline lockup (eyebrow-scale) | < 64 px | **Static wordmark** | Below the animated floor — use `data-static` or `assets/SHAUGHV-Official.svg`. |
| Favicon / avatar (≤ 48 px) | use icon-mark variant (`assets/SHAUGHV-Favicon-*.svg`) | **Static icon** | The wordmark is illegible below ~40 px height. |
| PPTX / PDF / image export | ~ 64–128 px equivalent | **Static wordmark** | Static `SHAUGHV-Official.svg`. |

Set sizing on the **host element**, never on the SVG itself. The SVG fills its host with `display: block; width: 100%; height: 100%`.

---

## Brand-lockup pattern

The animated mark is almost always paired with a small monospace label, forming a "lockup":

```html
<style>
  .brand-lockup {
    display: flex;
    align-items: center;
    gap: 18px;
    color: var(--fg);
  }
  .brand-lockup-mark {
    display: inline-block;
    height: 56px;
    width: auto;
  }
  .brand-lockup-label {
    font-family: "IBM Plex Mono", ui-monospace, monospace;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    font-size: 0.72rem;
    color: rgba(92, 84, 70, 0.62);
  }
</style>

<div class="brand-lockup">
  <shaughv-mark class="brand-lockup-mark" aria-label="SHAUGHV"></shaughv-mark>
  <span class="brand-lockup-label">Realtime / Control Room</span>
</div>
<script src="assets/animated-brand-mark.js"></script>
```

The label is **optional context** (which surface? which app?). Without it, the mark stands alone.

---

## Common mistakes — do not do these

1. **Don't hand-draw the SVG.** Reference `assets/SHAUGHV-Official.svg` or load the JS file. The path data is precise — small drift = wrong mark.
2. **Don't bake color into the SVG.** Use `currentColor` and set `color` on the host. This is how the same file works on cream, olive, near-black, and brand-orange backgrounds.
3. **Don't reduce or "improve" the animation.** The HOLD/PAUSE/STROKE/FILL constants and the 0.16/1/0.3/1 easing are the brand. A 1 s lazy-load fade is not a substitute.
4. **Don't use the icon variant as the wordmark.** They serve different scales. ≤ 48 px → icon. > 48 px → wordmark.
5. **Don't replace the mark with text styled like "SHAUGHV" in Unbounded.** The mark is the mark; the geometric letterforms in the SVG do not match Unbounded weight or proportion exactly.
6. **Don't animate the static SVG file (`SHAUGHV-Official.svg`) yourself.** Use the JS file. Re-deriving stroke length, stagger timings, and the dual-state morph by hand always produces an off-brand version.
7. **Don't put the mark inside a coloured shape (badge, pill, circle).** It floats on the surface; the surface provides the contrast.
8. **Don't render the animated mark below 64 × 64 px.** Hard floor — see [Sizing rules](#sizing-rules). Below that, the morph, stroke math, and timing read as noise. Fall back to the static wordmark (`assets/SHAUGHV-Official.svg`) or `<shaughv-mark data-static>`.

---

## Porting to another framework

If you must port this animation (e.g. to Lottie, GSAP, CSS-only, Svelte motion, native iOS Core Animation), use this checklist:

- [ ] Use the exact `d` attributes from `assets/SHAUGHV-Official.svg`. The vanilla JS file lists them as `WORDMARK[*].d` and `ICON[*].d`.
- [ ] Match the transforms (`matrix(...)` strings) verbatim — they position the mustache + glasses overlay correctly relative to the letters and scale up correctly in the icon variant.
- [ ] Apply `pathLength="1"` on every path so dash math is normalized (no `getTotalLength()` calls; no per-path tuning).
- [ ] Match HOLD / PAUSE / STAGGER / STROKE / FILL constants exactly.
- [ ] Match the easing `cubic-bezier(0.16, 1, 0.3, 1)` — not `ease-out`, not `easeOutQuad`. The exact curve is part of the brand feel.
- [ ] Crossfade fill ↔ stroke during the morph; never just toggle.
- [ ] Reverse-stagger on undraw (last drawn shape retreats first).
- [ ] Respect `prefers-reduced-motion`.
- [ ] Use `currentColor` for both fill and stroke.

If any of those are infeasible in the target framework, **stop and fall back to the static `SHAUGHV-Official.svg`**. A correct static mark always beats a broken animated one.

---

## Why the animation exists

The SHAUGHV identity has a quiet trick built into it: the mustache and glasses are baked into the SHAUGHV wordmark, *inside* the letterforms, not on top of them. The animation makes that legibility move explicit — the eye sees letters, the letters fade, the glasses-and-mustache remain, and then the letters rebuild around them. It's a 23-second loop that teaches the viewer to see the hidden portrait, then re-see the wordmark with that knowledge.

This is why the animation has to be *exactly this* — same hold time, same easing, same stagger. It's a single visual idea, expressed once. Reuse it; don't redesign it.
