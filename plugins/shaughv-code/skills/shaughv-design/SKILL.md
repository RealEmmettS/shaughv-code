---
name: shaughv-design
description: Create or update SHAUGHV-branded sites, interfaces, footers, and visual assets for Emmett Shaughnessy. Includes the paired wordmark and crest footer, proportional logo scaling, local logo assets and fonts, Makira and Paper Mono guidance, optional CDN fonts, motion, drop-in custom cursors, magnetic controls, palettes, and reference UI kits. Use when installing SHAUGHV branding or adapting its footer to an existing site's theme.
---

# SHAUGHV Design Skill

You are an expert designer working in the SHAUGHV brand system — the personal brand of **Emmett Shaughnessy**.

## Before you do anything

Use the consuming site's established theme when adding branding to an existing
site. The reference UI kits and vintage tokens are starting points for new work,
not a requirement to restyle an existing site. Current asset identities, font
defaults, and integration policies come from the CDN: use `shaughv-cdn` to fetch
the live guide and catalog. The bundled references are also usable offline.

1. **Read `README.md`** — the brand context, content fundamentals, visual foundations, and iconography rules.
2. **Read `colors_and_type.css`** — the single source of truth for all design tokens. Never invent hex values; reference variables from this file.
3. **Read `BRANDMARK.md`** before placing the SHAUGHV mark anywhere — it contains the decision tree (animated vs static vs icon variant), the drop-in usage for HTML/React/everything-else, and the full animation spec. The mark is part of every SHAUGHV surface; getting it right is non-optional.
4. **If your output has any loading state**, use `assets/shaughv-loader.js` (`<shaughv-loader>`). It is the *only* loader allowed on SHAUGHV surfaces — no framework defaults, no custom spinners. See README's LOADER section.
5. **Skim `ui_kits/`** — there are two historical style references: `personal_site/` (brutalist) and `vintage_site/` (Bauhaus vintage). Open the closer reference if useful. Their older footer compositions are superseded by the complete paired-logo instructions and examples below.
6. **For a website footer, read `references/footer.md`.** It contains the complete paired-logo contract, assets, font loading, both layouts, scaling, color handling, framework notes, and verification guidance. Start from the runnable `examples/footer.html` and `examples/footer.css` if useful.
7. **Read `references/fonts.md` before choosing or loading type.** Makira and Paper Mono are the standard pair; either can handle headings, interfaces, body copy, and buttons. The reference distinguishes bundled files, CDN variable families, compatibility fonts, and opt-in fonts.

## How to design

**If the user wants a visual artifact** (slide deck, mock, throwaway prototype, marketing asset, social card):
- Use the supplied assets and fonts for authorized SHAUGHV work, retaining their notices. For public web projects, prefer the CDN font stylesheets; see `references/fonts.md` for local and hosted loading.
- Import `colors_and_type.css` (or inline the relevant variables).
- **Place the brand mark per `BRANDMARK.md`:** for animation, give `<shaughv-mark>` at least 64px on both axes. Use `data-static` for the paired footer identity or smaller placements. In fixed-frame exports or anywhere JS can't run, embed `assets/SHAUGHV-Official.svg` and account for its different framing.
- Use the **vintage palette** (cream + sage + olive + bamboo) as the default — it's the warmer, more print-friendly half of the brand.
- Use the **brutalist layout language** from `ui_kits/personal_site/` — large uppercase Makira headlines, Paper Mono labels, 12-col asymmetric grids, decisive use of sage as the single action color.
- **Figurines are optional.** `assets/figurines/` ships five vintage-edition character illustrations of Shaughv at a desk. Use them only on cream/vintage surfaces where the layout has a natural slot for a hero illustration — don't add them by default, and never on the brutalist dark surface. See the FIGURINES section of `README.md` for the placement rules. **When in doubt, leave them out.**
- For dark-mode or video-first content, switch to the live brand palette (near-black + brand orange `#FF5E1A`) — the brand orange wordmark lives at `assets/SHAUGHV-Orange.png`.

**If the user wants production code:**
- Choose hosted font loading or the bundled local files as described in `references/fonts.md`. `colors_and_type.css` includes page-wide theme rules; do not import it wholesale merely to add a footer to an existing site. Reuse the site's tokens and take only the needed font and footer rules.
- Treat the JSX components in `ui_kits/*/` as **reference**, not as importable code — they are simplified single-file recreations of production components. The real implementations live in the source repos linked in `README.md`.
- Keep both footer logos and their relative sizing. Use the complete local recipe in `references/footer.md` as shown or adapt its layout and styling to the site. Scale the two logos together using the recipe's shared scale value, preserving each aspect ratio. When online, compare the reference with the guide and metadata discovered through `shaughv-cdn`.

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
| `references/footer.md` | Complete footer instructions, required logo pair, adaptable layouts, shared scaling, colors, fonts, and implementation checks |
| `references/fonts.md` | Current family roles, bundled and hosted loading, variable fonts, optional families, and notices |
| `examples/footer.html` / `examples/footer.css` | Runnable left and centered footer examples, with shared proportional scaling |
| `colors_and_type.css` | All design tokens — `@font-face`, palette, semantic vars, type classes |
| `fonts/` | Static WOFF2 for Makira and Paper Mono, Paper Mono Variable, notices, and Gail Rock compatibility faces. Michelangelus, IBM Plex Mono, and Unbounded are opt-in through the CDN. |
| `assets/` | Wordmark, favicons, PNGs, animation and loader scripts, figurines, plus `crests/` with original color, original mono, footer derivative, and provenance metadata |
| `assets/figurines/` | Vintage character illustrations (Shaughv at a desk) — **optional, vintage surfaces only**. See README's FIGURINES section. |
| `preview/` | Specimen cards showing the system at a glance |
| `ui_kits/personal_site/` | Brutalist surface recreation — sections, components, click-thru index |
| `ui_kits/vintage_site/` | Vintage surface recreation — Bauhaus primitives + figurine illustrations |
| `uploads/` | **Archive — intentional. Do not prune.** The original design files: every font cut ever used (including weights and italics not in `fonts/`), original brandmark and figurine exports, and the pre-CDN asset list. Nothing references it at runtime; that's expected. It exists so the source material survives independently of whatever the system currently ships. Keep it git-tracked. |

> **On `uploads/`:** it is deliberately unreferenced, and it is deliberately kept. Do not
> "clean it up," gitignore it, or delete it to save space — losing it means losing the
> original design files. This note exists because every signal an agent normally uses to
> spot dead weight (unreferenced, duplicated, large) points the wrong way here.

## Optional shared cursor

When a website wants the custom cursor, discover it through the live CDN guide
and catalog's documentation links. Read the cursor example and metadata for its
current API and color presets. Choose orange, vintage sage, black, white, or a
custom CSS color to suit the website, while retaining the shared circular view,
MCP spring, automatic button/link/dropdown outlines, checkbox/radio snapping,
difference blending by default, and 90% opacity. Use `usage.components.cursor`
from the live catalog for ready-to-copy HTML and JavaScript lifecycle recipes.
Set the base color to suit the site; standard semantic controls need no extra
markup. Icon-only controls keep a slightly enlarged circle instead of a box;
custom icons can use `data-cursor="icon"`. Native dropdown popups keep their
system pointer. Black needs an explicit solid-color override. Use the hosted component
rather than inventing a new cursor animation. It is optional per website; keep
native text/control cursors, touch fallback, reduced motion, and lifecycle cleanup.
The CDN website itself enables it only on its dedicated cursor guide page.
