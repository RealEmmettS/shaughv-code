---
name: shaughv-cdn
description: Discover and consume assets from the SHAUGHV CDN at cdn.shaughv.com through its live /agents guide and /tree.json manifest. Use whenever a task mentions the SHAUGHV CDN, a cdn.shaughv.com URL, SHAUGHV-hosted fonts, brand assets, images, favicons, figurines, scripts, loaders, embeds, or preloads. Fetch the live catalog instead of relying on remembered family names, file paths, formats, counts, snippets, or licensing notes.
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
4. Use manifest-provided `url`, `embed`, `css_url`, `html`, and `css` values
   verbatim.
5. If the requested item is absent, report that it is not in the current
   manifest. Do not guess, probe a remembered path, or substitute stale skill
   text.

## Rules

- Keep only the three discovery endpoints above fixed in code or prompts.
- Read names, paths, family variants, weights, styles, formats, MIME types,
  snippets, cache behavior, CORS guidance, and redistribution limits from the
  freshly fetched guide and manifest.
- Use the requested named font entry for an opt-in family. Use `fonts.all` only
  when the live guide says the standard combined bundle is intended.
- Use manifest-provided font stylesheets rather than recreating `@font-face`
  declarations.
- Preserve `crossorigin` on cross-origin font preloads.
- Link to CDN-hosted assets. Do not mirror licensed or brand-owned files unless
  the user explicitly authorizes redistribution.

Never add a current asset list, count snapshot, concrete asset URL, or family-
specific integration recipe to this skill. Those belong in the live CDN guide
and manifest so an installed plugin cannot drift from production.
