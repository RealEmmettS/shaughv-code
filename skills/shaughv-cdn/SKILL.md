---
name: shaughv-cdn
description: Discover and consume assets from the SHAUGHV CDN at cdn.shaughv.com through its live /agents guide and /tree.json manifest. Use whenever a task mentions the SHAUGHV CDN, a cdn.shaughv.com or cdn.emmetts.dev URL, SHAUGHV-hosted fonts, brand assets, images, favicons, figurines, scripts, loaders, drop-in custom cursors, frosted dropdowns, shared site defaults, magnetic button outlines, embeds, or preloads. Fetch the live catalog instead of relying on remembered family names, file paths, formats, counts, snippets, or licensing notes.
---

# SHAUGHV CDN discovery

Treat the CDN as a live, self-describing catalog. This installed skill is only
the stable router into that catalog; it is not an asset inventory.

## Required workflow

1. Fetch `https://cdn.shaughv.com/agents` at the start of the task. Treat the
   returned Markdown as the current operating guide.
2. Fetch `https://cdn.shaughv.com/tree.json` for the canonical machine-readable
   catalog. `https://cdn.shaughv.com/tree` is an identical alias.
3. Follow the live guide and resolve the requested item from the manifest.
4. Use manifest-provided asset URLs and font-loading snippets as supplied.
   Customize surrounding presentation within the live example's stated scope.
5. If the requested item is absent, report that it is not in the current
   manifest. Do not guess, probe a remembered path, or substitute stale skill
   text.

## Rules

- Keep only the three discovery endpoints above fixed in code or prompts.
- Always use `https://cdn.shaughv.com` in new CDN links, imports, embeds,
  preloads, examples and documentation, even when the user supplied an alias.
  Read `usage.url_policy`; aliases are discovery/compatibility entry points only.
  Keep the canonical URLs from the manifest, including paths and required query
  strings or fragments. Never substitute the fetch hostname into returned URLs. Use `usage.documentation` to discover illustrated examples
  and structured asset metadata, including variant relationships and source
  context. Blume is the complete CDN website; discover its interactive showcases
  and font examples through those live documentation links. Do not recreate a
  separate inventory from old HTML pages. Do not infer that similarly named originals and adapted assets are identical.
- Read names, paths, family variants, weights, styles, formats, MIME types,
  snippets, cache behavior, CORS guidance, and redistribution limits from the
  freshly fetched guide and manifest.
- Respect the scope stated by each live example. Distinguish required identity
  details from illustrative layout values: examples may be used as is or
  customized to the consuming site's current theme when the live guide allows it.
  Preserve required assets, their relative sizing, and individual aspect ratios;
  scale related marks together when permitted. Do not turn reference dimensions,
  spacing, or demonstration colors into extra requirements.
- Use the requested named font entry for an opt-in family. Use `fonts.all` only
  when the live guide says the standard combined bundle is intended.
- Read `fonts.all.defaults` for the preferred sans and monospace families.
  Bundle membership may include compatibility families and does not imply a default.
- Use manifest-provided font stylesheets rather than recreating `@font-face`
  declarations.
- Preserve `crossorigin` on cross-origin font preloads.
- Link to CDN-hosted assets. Do not mirror licensed or brand-owned files unless
  the user explicitly authorizes redistribution.

Never add a current asset list, count snapshot, concrete asset URL, or family-
specific integration recipe to this skill. Those belong in the live CDN guide
and manifest so an installed plugin cannot drift from production.

## Required CDN site baseline

Every website using the CDN includes the shared cursor, frosted dropdowns, and
a footer with both the SHAUGHV main logo and Shaughnessy crest plus copyright.
Read `usage.site_defaults` and `usage.components.dropdown` from the live catalog
and follow their documentation links. Humans and agents use the same contract.
Keep the current font defaults; customize color, spacing, type, and layout to
the site while preserving the components' behavior and logo proportions.

For a full-screen design, keep main one full viewport using `min-height: 100svh`
with a `100vh` fallback and `width: 100%`. Put the footer after main in normal
document flow, below the first viewport. Do not subtract the footer's height or
overlay controls. A full viewport is 100vh, not 1vh; allow content to grow.

Use the hosted frosted dropdown to enhance labelled native single selects.
Page-rendered options keep the custom cursor through open menus. Retain form
semantics, keyboard navigation, touch targets, reduced motion, and the live
guide's native exceptions. Refresh after direct value or inherited theme
changes, and destroy framework-owned instances on teardown. Do not replace the
native select's form state or invent a separate dropdown design.

## Shared cursor

For every CDN-based website, discover the custom cursor through the live CDN guide
and catalog's documentation links. Read the cursor example and metadata for its
current API and color presets. Choose orange, vintage sage, black, white, or a
custom CSS color to suit the website, while retaining the shared circular view,
MCP spring, automatic button/link/dropdown outlines, checkbox/radio snapping,
surface-calibrated difference blending by default, and 90% opacity. Use `usage.components.cursor`
from the live catalog for ready-to-copy HTML and JavaScript lifecycle recipes.
Set the base color to suit the site; standard semantic controls need no extra
markup. Icon-only controls keep a slightly enlarged circle instead of a box;
custom icons can use `data-cursor="icon"`. The required frosted dropdown keeps the cursor
through its page-rendered menu. Documented native popup exceptions use the system pointer. The selected hue is calibrated against surrounding CSS backgrounds
in light and dark themes; text and graphics still blend, while photos and gradients
can shift the result. Control outlines use a centered 2 px stroke with a 3 px clear gap. Text links
have more breathing room: 7 px horizontally and 5 px vertically, without moving
layout or click targets. Text fields get a gentle 2 px physical border ripple that follows their
actual dimensions and individual corners, including resizing editors. The wave
eases flat on focus, leaving a steady outline while hovered. The circle morphs
into a slim custom I-beam over 140 ms. It uses the selected color, then tracks
the mouse exactly; pressing cancels any entry offset for precise selection. It
travels to the insertion point with a 220 ms squash-and-stretch when typing
starts, then becomes the 2 px typing caret and follows the text. Hide the native
caret only while this measured custom bar is active; mouse movement restores
the pointer. Preserve native editing and fallback carets for unsupported fields,
IME, selected text, forced colors, blur, and cleanup. Preserve selection, scrolling,
resize handles and input accessories; reduced motion removes travel, squash, blinking, and the wave,
and touch gets no custom effect. No extra field markup is needed.
Use the hosted component
rather than inventing a new cursor animation. Keep native-control fallbacks,
touch behavior, reduced motion, and lifecycle cleanup. The CDN documentation
uses it across every page with the default orange base color; its cursor guide
allows temporary color customization.
