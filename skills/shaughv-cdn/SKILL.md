---
name: shaughv-cdn
description: Discover and consume assets from the SHAUGHV CDN at cdn.shaughv.com through its live /agents guide and /tree.json manifest. Use whenever a task mentions the SHAUGHV CDN, a cdn.shaughv.com or cdn.emmetts.dev URL, SHAUGHV-hosted fonts, brand assets, images, favicons, figurines, scripts, loaders, drop-in custom cursors, magnetic button outlines, embeds, or preloads. Fetch the live catalog instead of relying on remembered family names, file paths, formats, counts, snippets, or licensing notes.
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
- Read `usage.aliases` for equivalent CDN origins and keep canonical URLs from
  the manifest. Use `usage.documentation` to discover illustrated examples
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
