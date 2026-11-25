---
name: shaughv-design
description: Design and implement SHAUGHV-branded websites, app screens, footers and visual assets for a specific project. Explore the live CDN’s typography, palettes, artwork, component previews and recommendations, then apply them to the project’s framework, layout, navigation and accessible interaction states. Use for paired logos, live or fixed footer styles, the animated mark, loader, cursor, frosted dropdowns, optional ambient motion and project-specific visual or UX refinements.
---

# SHAUGHV Design Skill

You are an expert designer working in the SHAUGHV brand system — the personal brand of **Emmett Shaughnessy**.

## Start with the project and the live CDN

For web work, fetch the [operating guide](https://cdn.shaughv.com/agents) and
the [asset catalog](https://cdn.shaughv.com/tree.json) directly, including when
this is the only skill installed. Prefer `https://cdn.shaughv.com` for new links even when discovery starts at an alias. The [Blume website](https://cdn.shaughv.com/)
shows the rendered examples. Resolve font roles, assets and integration snippets
from the catalog and keep the canonical URLs, including query strings. If a
resource is unavailable, say which one. For offline work, identify bundled
assets as local references and retain their notices.

Inspect the consuming project's navigation, layout, theme tokens, fonts and
framework first. Keep its visual choices when adding branding. For a new
composition, the vintage kit offers warm print-like colors, and the personal
site kit shows asymmetric grids and large Makira headings. Choose the layout
and palette independently to suit the content.

## Explore the CDN for this project

For a full project, survey the current [page index](https://cdn.shaughv.com/api/docs/pages.json)
and [showcase](https://cdn.shaughv.com/showcase) before choosing a direction.
Follow new or changed topics from the index, including the Markdown version
of a page for instructions and its rendered preview for appearance. For a
targeted change, inspect the affected surface and the guides it depends on.

| Project decision | What to explore |
| --- | --- |
| Page structure | Compare the [quickstart](https://cdn.shaughv.com/quickstart) and [page recipes](https://cdn.shaughv.com/recipes) with the project's entry points, information hierarchy and responsive breakpoints. |
| Type, imagery and identity | Try a representative heading, paragraph and data label in the [font specimens](https://cdn.shaughv.com/fonts). Compare silhouettes, light/dark favicons, signature, transparent illustrations and crest variants in [brand assets](https://cdn.shaughv.com/brand). |
| Color and interaction states | When advertised, preview [website palettes](https://cdn.shaughv.com/palettes) and inspect their [role data](https://cdn.shaughv.com/brand/shaughv/palettes.json). Compare with the project's current surfaces, accent and focus treatment. |
| Interaction and motion | Try the [cursor and caret](https://cdn.shaughv.com/cursor), [frosted selects](https://cdn.shaughv.com/dropdowns), [animated mark and loader](https://cdn.shaughv.com/motion) and optional [ambient field](https://cdn.shaughv.com/ambient-background) on their live controls. |
| Footer and ongoing updates | Inspect both [footer layouts and installation modes](https://cdn.shaughv.com/footer-lockup#install). Check [how CDN updates reach a site](https://cdn.shaughv.com/hosting) before choosing a live link or a fixed copy. |
| Additional guidance | Explore [recommended skills](https://cdn.shaughv.com/recommended-skills) for guidance relevant to this project's platform, motion or accessibility needs. Review existing guidance first. Follow the catalog's scope and approval process for any installation. |

## Compose the actual screen

Start with the project's most important task and real content. Identify where a
visitor enters, what they need to read or operate, and what confirms success.
Inspect adjacent screens and the smallest supported viewport. Use those findings
to choose type roles, grid, reading order and breakpoints. Let a hero stack,
a row wrap or navigation change shape before shrinking text or tap targets.

For example, a portfolio might give one large project image and a Makira title
the first viewport. A small animated mark can introduce the identity, then a
quiet static footer closes the page. In a settings screen, spend that emphasis
on the active field, the available choices and clear save feedback. Use the
project's existing layout for both cases. Translate the selected references
into that project's layout component, theme tokens, control states and footer.

Give motion a specific job. A magnetic outline previews the clickable area. A
frosted select can track keyboard focus as the visitor moves through options.
The field ripple settles on focus and the typing caret follows insertion. Use
the hosted behaviors so these small interactions feel related. For a playful
moment, try the brand reveal in a hero or a bounded ambient field in an empty
part of the layout. Preview it with the real text and controls. Keep decoration
out of the reading path, retain feedback on touch, and make reduced motion
communicate the same state immediately.

### Visible choices and optional details

When people need to compare a few options, show them together. For a palette
picker, use labelled swatches with the name and selected state visible. A
native radio group works well when exactly one option is active. Let the
options wrap on small screens and keep a visible keyboard focus indicator.

Use a labelled select when someone needs to choose one value from a longer,
familiar list and seeing every value at once offers little benefit. Use
informational disclosures sparingly. Keep instructions, differences between
choices, and the next action visible. Reserve a disclosure for optional depth,
such as the source notes behind a palette, and give its summary a specific name.

### Alignment and spacing

Use the project's content gutter for section headings, option groups and the
content they control. Align adjacent labels on a common text baseline and use
the project's spacing scale for gaps within a group and between sections.
Check wide, intermediate and narrow layouts with real labels and enlarged
text. When controls wrap or columns stack, check that labels stay with their
controls, rows keep even gaps and content still lines up with its heading.

## Choose colors

- For optional website starter packs, follow `usage.documentation.palettes`
  to the visual guide and `usage.documentation.palette_catalog` to its data.
  If those fields are absent, continue with the site's tokens or the bundled
  kit. Read the current entries when choosing a pack.
- Follow a theme's role values into `colors` and its source IDs into `sources`.
  Copy the guide's scoped theme CSS onto the intended page or section, then
  map its roles to the project's tokens. Use the supplied text/background,
  action/label and selection pairs together. Check muted text, links, hover,
  keyboard focus and selection against the actual surfaces after overrides.
  A motion or cursor color is a color option, independent of enabling an effect.
- When a design calls for white, start with SHAUGHV ivory (`#FAF8F3`) from
  `usage.site_defaults.design_white` and the shared `--shaughv-white` token.
  True white can suit artwork, contrast, print or the design itself. A palette
  can omit white entirely.

## Choose an implementation

1. Read [the design reference](README.md) for voice, visual examples and
   iconography. The bundled `colors_and_type.css` provides the vintage theme
   and applies page-wide styles. Reuse the host project's tokens for an
   existing site.
2. Read [the type guide](references/fonts.md). Resolve `fonts.all.defaults`
   for sans, monospace and serif. Makira and Geist Mono can each serve display,
   UI or body text. Geist Serif is the default serif. Load the selected family
   through its current catalog stylesheet. For a direct preload or download
   use the exact face and format listed in the live family metadata.
3. Use [the brand mark guide](BRANDMARK.md) for logos. The hosted animated mark
   uses the shared stylesheet and one script per page. Allow at least 64px on
   both axes for animation and respect reduced motion. For fixed exports use
   the supplied static artwork. When a loading state is needed, use the
   SHAUGHV loader, sized and colored for its context. Resolve its script for
   online work, or use the bundled version for local work. The animated loader also needs
   Anime.js. For a disconnected export, choose static artwork.
4. Every CDN site displays the SHAUGHV wordmark and Shaughnessy family crest
   **together in its footer**. Individual marks may also appear elsewhere.
   Choose linked styles, the isolated Copy CSS snapshot, or Marks only from
   [the footer guide](https://cdn.shaughv.com/footer-lockup#install). For
   custom layouts, use `usage.site_defaults.footer.artwork` for the paired
   image or both individual files. Preserve the relative scale and aspect
   ratios wherever the pair sits within the footer.
   All four integrations include **© [viewer’s current year] SHAUGHV and ES Development LLC**
   as real text. Read `usage.site_defaults.footer.copyright`. Load the
   [year helper](https://cdn.shaughv.com/js/shaughv-year.js) once and place
   `<shaughv-year></shaughv-year>` between the copyright symbol and names, or
   calculate `new Date().getFullYear()` on client mount. This must run on
   every page load in the viewer’s timezone, including on static and cached
   sites. See the [copyable markup and local examples](references/footer.md).
5. For a visual artifact, use authorized local fonts and assets. The vintage
   figurines are optional illustrations for vintage surfaces. For a prototype,
   consult the closer UI kit. Keep production components in the project's
   framework and use its existing conventions for layout and navigation.

## Content rules you must follow

- **Pronouns:** first person singular (`I`, `my`). Never "we".
- **Casing:** UPPERCASE for headlines, nav, buttons, labels, eyebrows. Sentence case for body. Apply via CSS, not source.
- **No emoji.** Ever.
- **Iconography:** Lucide (line icons) for UI; the SHAUGHV mark from `assets/` for brand presence. Never draw your own SVG icons.
- **Punctuation:** em-dashes with hair spaces; `/` as a glyph separator (often coloured sage); `◆` as the only Unicode "icon" allowed (used as a marquee separator).
- **Tone:** confident, dry, slightly understated. Opening-title-sequence energy, not startup-dashboard.

## When the brief is open

Use the requested medium, audience and existing project to guide the design.
If the output itself is unclear, ask what the user wants to make. Choose the
appropriate existing stack for a website or a static format for an export.

## Files in this skill

| File | Purpose |
|---|---|
| `README.md` | Brand context, content fundamentals, visual foundations, iconography |
| `BRANDMARK.md` | How to render and animate the SHAUGHV mark in any framework — read before placing the mark |
| `references/footer.md` | Complete footer instructions, required logo pair, adaptable layouts, shared scaling, colors, fonts, and implementation checks |
| `references/fonts.md` | Current family roles, bundled and hosted loading, variable fonts, optional families, and notices |
| `examples/footer.html` / `examples/footer.css` | Left, centered and custom marks-only footers with proportional scaling and a viewer-local year |
| `colors_and_type.css` | Vintage kit tokens — `@font-face`, palette, semantic vars, type classes |
| `fonts/` | Retained local Makira, Paper Mono, Paper Mono Variable, notices, and Gail Rock compatibility faces. Current Makira, Geist Mono, and Geist Serif defaults load through the CDN. For offline work, verify authorized copies against current family metadata. Paper Mono is an alternate. Geist, Michelangelus, IBM Plex Mono, and Unbounded are opt-in. |
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

## Web integration and verification

- Read `usage.site_defaults` for every CDN-based website. Load the shared
  stylesheet once in the document head, then apply unlayered site overrides.
  On a full-screen page, use `width: 100%`, followed by a `min-height: 100vh`
  fallback and `min-height: 100svh`. Place the footer after main in document
  flow. Let content grow with text zoom and narrow viewports.
- Choose how updates reach this project. With Link CSS, apply its own colors,
  spacing and scale in normal site CSS. With Copy CSS, take the entire footer
  snapshot from the current guide, use its isolated outer class, and retain
  its artwork URLs. The site then owns updates to that CSS. A palette CSS copy
  is also local and scoped. A linked mark, cursor or dropdown still receives
  hosted changes on reload, even alongside a fixed footer.
- In HTML or a server-rendered layout, start with the catalog's HTML recipes.
  In React/Next, Vue/Nuxt, Svelte/SvelteKit or Astro islands, render the footer
  and labelled native controls in the initial HTML. Load browser-only scripts
  once in a shared layout. Choose declarative setup or mount after the script
  and target are ready in a client lifecycle. Destroy each owned instance on
  teardown. A shared app shell can keep a single cursor across route changes.
- Use `usage.components.cursor.integration` for the shared pointer and its
  companion dropdown. Choose the site's cursor color. Let the component own
  pointer hiding, magnetic outlines, editing carets, native fallbacks and
  reduced motion. Keep ordinary controls semantic and their focus visible.
- Enhance eligible labelled single selects with
  `usage.components.dropdown.integration`. Keep the select as form state,
  including validation and reset. Refresh after direct value assignments or
  stylesheet-only theme changes. Preserve native listboxes and documented
  native exceptions. Avoid overlapping automatic and framework mounts.
- For optional ambient motion, follow `usage.components.ambient` for layering,
  color, source notices and cleanup. Keep decorative canvases clear of input,
  content and assistive technology.
- Check the finished page in a narrow viewport and with keyboard input. Check
  the actual fonts, focus and text contrast in each theme, both footer marks
  with JavaScript disabled, and native select and cursor fallbacks when the
  scripts are unavailable. Reload around New Year in two viewer timezones
  and check the year and both rightsholder names in the footer. In a routed app, revisit the page and check for a
  duplicate mount. Verify reduced motion and touch behavior for effects used.
