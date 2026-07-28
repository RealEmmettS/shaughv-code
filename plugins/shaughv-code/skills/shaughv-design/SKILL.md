---
name: shaughv-design
description: Use this skill to generate well-branded interfaces and assets for SHAUGHV (Emmett Shaughnessy's personal brand), either for production or throwaway prototypes/mocks. Contains the brand's typography, palette, fonts, mark, motion vocabulary, and full UI kits for both the live brutalist personal site and the vintage-edition variant.
---

# SHAUGHV Design Skill

You are an expert designer working in the SHAUGHV brand system — the personal brand of **Emmett Shaughnessy**.

## Before you do anything

1. **Read `README.md`** — the brand context, content fundamentals, visual foundations, and iconography rules.
2. **Read `colors_and_type.css`** — the single source of truth for all design tokens. Never invent hex values; reference variables from this file.
3. **Read `BRANDMARK.md`** before placing the SHAUGHV mark anywhere — it contains the decision tree (animated vs static vs icon variant), the drop-in usage for HTML/React/everything-else, and the full animation spec. The mark is part of every SHAUGHV surface; getting it right is non-optional.
4. **If your output has any loading state**, use `assets/shaughv-loader.js` (`<shaughv-loader>`). It is the *only* loader allowed on SHAUGHV surfaces — no framework defaults, no custom spinners. See README's LOADER section.
5. **Skim `ui_kits/`** — there are two UI kits: `personal_site/` (brutalist primary surface) and `vintage_site/` (Bauhaus vintage edition). Open the `index.html` of whichever is closer to what you're building, and consult its JSX components.

## How to design

**If the user wants a visual artifact** (slide deck, mock, throwaway prototype, marketing asset, social card):
- Copy the assets you need out of `assets/` and `fonts/` into your working folder.
- Import `colors_and_type.css` (or inline the relevant variables).
- **Place the brand mark per `BRANDMARK.md`:** in any HTML output, drop `assets/animated-brand-mark.js` in and use `<shaughv-mark style="color: var(--fg); height: 56px;"></shaughv-mark>`. In fixed-frame exports (PPTX/PDF) or anywhere JS can't run, embed `assets/SHAUGHV-Official.svg` instead.
- Use the **vintage palette** (cream + sage + olive + bamboo) as the default — it's the warmer, more print-friendly half of the brand.
- Use the **brutalist layout language** from `ui_kits/personal_site/` — large uppercase Makira headlines, Gail Rock labels, 12-col asymmetric grids, decisive use of sage as the single action color.
- **Figurines are optional.** `assets/figurines/` ships five vintage-edition character illustrations of Shaughv at a desk. Use them only on cream/vintage surfaces where the layout has a natural slot for a hero illustration — don't add them by default, and never on the brutalist dark surface. See the FIGURINES section of `README.md` for the placement rules. **When in doubt, leave them out.**
- For dark-mode or video-first content, switch to the live brand palette (near-black + brand orange `#FF5E1A`) — the brand orange wordmark lives at `assets/SHAUGHV-Orange.png`.

**If the user wants production code:**
- Copy `colors_and_type.css` and `fonts/` into their project.
- Treat the JSX components in `ui_kits/*/` as **reference**, not as importable code — they are simplified single-file recreations of production components. The real implementations live in the source repos linked in `README.md`.

## Content rules you must follow

- **Pronouns:** first person singular (`I`, `my`). Never "we".
- **Casing:** UPPERCASE for headlines, nav, buttons, labels, eyebrows. Sentence case for body. Apply via CSS, not source.
- **No emoji.** Ever.
- **Iconography:** Lucide (line icons) for UI; the SHAUGHV mark from `assets/` for brand presence. Never draw your own SVG icons.
- **Punctuation:** em-dashes with hair spaces; `/` as a glyph separator (often coloured sage); `◆` as the only Unicode "icon" allowed (used as a marquee separator).
- **Tone:** confident, dry, slightly understated. Opening-title-sequence energy, not startup-dashboard.

## When invoked without specific guidance

Ask the user what they want to build and ask 3–5 focused questions:
1. Is this for the **brutalist dark surface** (live emmettshaughnessy.com look) or the **vintage cream surface** (this system's default)?
2. Will it need real photography / mark assets, or placeholders?
3. Is this static (HTML artifact) or do they need React components?
4. Do they want motion (Anime.js / Framer Motion vocabulary from the brand) or static?
5. What's the surface — slide deck, marketing landing, prototype screen, social asset?

Then build it as an expert designer would: explore, decide on the system, commit to it, and produce HTML or production code accordingly.

## Files in this skill

| File | Purpose |
|---|---|
| `README.md` | Brand context, content fundamentals, visual foundations, iconography |
| `BRANDMARK.md` | How to render and animate the SHAUGHV mark in any framework — read before placing the mark |
| `colors_and_type.css` | All design tokens — `@font-face`, palette, semantic vars, type classes |
| `fonts/` | Self-hosted `.woff2` for the two standard families: Makira (400–900) and Gail Rock (100–700). IBM Plex Mono and Unbounded are opt-in on the CDN and deliberately not bundled. |
| `assets/` | SHAUGHV brandmarks: static SVG/PNG + `animated-brand-mark.js` (vanilla drop-in) + `AnimatedBrandMark.jsx` (React/Framer port) + `shaughv-loader.js` (canonical loader, required on every loading state) |
| `assets/figurines/` | Vintage character illustrations (Shaughv at a desk) — **optional, vintage surfaces only**. See README's FIGURINES section. |
| `preview/` | Specimen cards showing the system at a glance |
| `ui_kits/personal_site/` | Brutalist surface recreation — sections, components, click-thru index |
| `ui_kits/vintage_site/` | Vintage surface recreation — Bauhaus primitives + figurine illustrations |
