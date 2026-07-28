# Vintage Site UI Kit

Hi-fi recreation of the **shaughv_vintage** edition — the warm cream-and-sage alter ego of the SHAUGHV brand.

## What it is

The vintage edition reskins SHAUGHV in a Bauhaus-inspired, figurine-illustrated palette. It uses
the same logo, the same typography hierarchy, the same brand voice — but trades the brutalist
near-black canvas for cream surfaces, swaps the orange action color for sage, and decorates with
geometric circles, lines, and vintage-character figurine illustrations.

This is the **default palette** of this design system. If you're building something in the
SHAUGHV brand and aren't sure which direction to take it, start here.

## Source

`RealEmmettS/shaughv_vintage` — see that repo's `src/components/` and `tailwind.config.ts` for
the production implementation. This kit is a cosmetic recreation.

## What's here

- `index.html` — click-thru prototype: Hero → About → Projects → Skills → Contact → Footer.
- `Navigation.jsx` — top nav with the SHAUGHV green wordmark.
- `HeroSection.jsx` — split-grid hero with the **header** figurine plate (drops in `assets/figurines/transparent/figurine-header.webp`).
- `AboutSection.jsx` — soft-card about + philosophy.
- `ProjectsSection.jsx` — vertical project list cards.
- `SkillsSection.jsx` — Bauhaus-stripe skill columns.
- `ContactSection.jsx` — calm contact panel.
- `FooterSection.jsx` — closing brand watermark.
- `BauhausPrimitives.jsx` — `<BauhausCircle>` and `<BauhausLine>` decoration helpers.

## Imagery

The **figurine library** is part of this design system — see `../../assets/figurines/`. Five poses
(`header`, `look-at-this`, `footer`, `404`, `mail`), each in both white-background and transparent
variants. The `HeroSection` kit plate uses `figurine-header.webp` as the canonical example.

**Figurines are optional.** This UI kit shows one plate because the vintage hero is the canonical
place they shine — it does NOT mean every section needs a figurine. Use them where the layout has
a natural slot for a hero illustration; skip them everywhere else. The full placement rules live in
the main `README.md` under "FIGURINES".

---

## Production implementation notes

The JSX files in this kit are **design references** — single-file recreations meant to render the
intended visuals at a ~1440 px desktop canvas via the Babel-standalone harness in `index.html`.
A real responsive implementation in a production codebase has to adapt a handful of things. These
are the ones that have come up in practice, learned in `RealEmmettS/shaughv_vintage` and worth
propagating to any new SHAUGHV-branded surface.

### Hero figurine — responsive sizing

`HeroSection.jsx` renders the figurine `<img>` with `transform: scale(2)` and `transformOrigin: bottom right`. That's the **visual intent** for the splash at a large desktop canvas — the figurine pops out of its grid cell from the bottom-right anchor. Don't translate the `scale(2)` literally to a responsive site:

- At a 375 px portrait-mobile viewport the figurine column collapses to ~327 px wide. Scaling that 2× produces a 654 px image that overflows the entire viewport.
- The kit's `max-width: 520` only constrains the *layout-flow* width; `scale(2)` is a *visual* transform that doesn't respect max-width.

**Production pattern:** drop the `transform: scale(2)` entirely and use responsive `max-width` caps instead, plus stack/hide rules for narrower viewports. A working recipe (Tailwind syntax):

```tsx
<motion.div className="hidden md:flex relative items-end justify-center lg:order-2 lg:min-h-[520px]">
  <Image
    src="/path/to/figurine.png"
    width={1024}
    height={1024}
    priority
    className="w-full max-w-[400px] lg:max-w-[540px] h-auto object-contain pointer-events-none"
  />
</motion.div>
```

### Hero mobile ordering — text first, figurine after (or hidden)

The kit's `index.html` collapses the hero grid to a single column below 900 px. With the kit's source order (text column first, figurine column second), single-column mobile naturally shows the text above the figurine. Don't accidentally reverse this with `order-1 lg:order-2` on the figurine — that pushes it ABOVE the text on mobile, which reads worse and hides the headline below the fold.

**Production pattern:**

- **Portrait mobile** (< `md`, < 768 px): hide the figurine via `hidden md:flex`. The column has no room to place it without dwarfing the type.
- **Tablet** (`md` to `lg`, 768–1023 px): figurine renders **below** the text block via natural source order.
- **Desktop** (`lg+`, ≥ 1024 px): side-by-side via `lg:grid-cols-[1.15fr_0.85fr]` and `lg:order-2` on the figurine.

### Hero height — don't force 100dvh below `lg`

The kit's `minHeight: 100vh` keeps the splash filling the viewport on desktop. On a tablet or single-column mobile that same rule forces a tall section with too much whitespace because the stacked content is much shorter than the viewport.

**Production pattern:** confine the viewport-fill to `lg+`:

```tsx
<section className="relative overflow-hidden lg:min-h-[100dvh]">
  <div className="container mx-auto px-6 lg:h-[100dvh] lg:flex lg:items-center">
    <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-6 lg:gap-14 items-stretch w-full pt-28 pb-16 lg:py-0">
```

### Navbar — items-start with top padding, not items-center

The kit's `Navigation.jsx` uses `alignItems: center` on a short navbar strip. In production it reads more deliberate to give the navbar a slightly taller container (`h-24 / h-20` scrolled) and anchor the mark + nav links to the **top** of that container via `items-start` + `pt-5 / pt-3.5`. The padding feels intentional; vertical-center on a 64–80 px strip can read cramped at lockup sizes ≥ 56 px.

### Brand-mark in the navbar — static vs animated is a brand-motion-budget call

The kit's navbar uses the animated `<shaughv-mark>` loop. If the surface already carries the brand-motion moment somewhere else (e.g. a hero typewriter→SVG-draw), use `<shaughv-mark data-static>` in the navbar so the page doesn't double up on brand motion. The hero animation reads as the singular brand reveal; a second loop in the navbar competes with it.

### `transform: scale(2)` belongs in design-reference contexts, not responsive ones

This is the meta-rule. Any visual transform that doesn't respect layout flow (`scale`, `translate` with px values, `rotate` with non-square content) needs media-query gates when ported to a responsive codebase. Treat the kit's transforms as **what it should look like at desktop** rather than **how to render at every viewport**.

### Footer bottom rule — stack deliberately, don't `flex-wrap`

`FooterSection.jsx` uses `flex-wrap: wrap` on its bottom-rule three-cell strip (copyright / brand mark / "Set in Makira"). On narrow widths the items wrap to multiple rows but `justify-between` produces awkward gaps. Use explicit stacking instead:

```tsx
<div className="mt-16 pt-6 border-t border-cream-100/20
                flex flex-col sm:flex-row
                items-center sm:justify-between gap-6 sm:gap-4
                font-mono text-label uppercase font-semibold text-cream-100/45
                text-center sm:text-left">
  <span>© 2026 Emmett Shaughnessy</span>
  <shaughv-mark data-static aria-label="SHAUGHV"
                className="block h-16 w-auto text-cream-100/70" />
  <span>Set in Makira &amp; Gail Rock</span>
</div>
```

### `<shaughv-mark>` host sizing — square clips the wordmark in Tailwind

The brand-mark drop-in renders an SVG inside the `<shaughv-mark>` host and assigns its dimensions from the host's **inline** styles:

```js
svg.style.width  = host.style.width  || "auto";
svg.style.height = host.style.height || "100%";
```

When sizing via Tailwind classes (`h-24 w-24`), `host.style.width` is empty, so the drop-in falls back to `auto`. The SVG then renders at its natural ~1.485:1 aspect (viewBox `2.5 52.7 245 165`), producing a ~142×96 SVG that overflows a 96×96 host horizontally. The `V` at the right end of the wordmark gets clipped.

**Two fixes that work:**

1. **Preferred — let the host shrink to fit the wordmark's natural aspect:**
   ```tsx
   <shaughv-mark data-static className="block h-16 w-auto" />
   ```
   At `h-16` the wordmark is 64 px tall and ≈ 95 px wide. No clipping, natural reading.

2. **Square host — set the SVG width/height via inline style so the drop-in scales the wordmark to fit:**
   ```tsx
   <shaughv-mark data-static style={{ display: 'block', width: 96, height: 96 }} />
   ```
   Now `host.style.width = "96px"` is non-empty, the drop-in copies it to the SVG, `preserveAspectRatio="xMidYMid meet"` (the default) fits the wordmark inside the 96×96 box. The wordmark renders ~96 × 65 with vertical centering inside the square.

The kit demo (`FooterSection.jsx`) uses option 2 — inline styles — so the bottom-rule mark renders correctly in the kit's `index.html` preview. The clipping bug surfaces only when a production codebase translates the kit literally but switches from inline styles to Tailwind classes for the size. If you're using Tailwind, prefer option 1.
