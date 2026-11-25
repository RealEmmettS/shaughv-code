---
name: shaughv-cdn
description: Discover and consume assets from the SHAUGHV CDN at cdn.shaughv.com through its live /agents guide and /tree.json manifest. Use whenever a task mentions the SHAUGHV CDN, a cdn.shaughv.com or cdn.emmetts.dev URL, SHAUGHV-hosted fonts, brand assets, images, favicons, figurines, scripts, loaders, drop-in custom cursors, frosted dropdowns, optional ambient backgrounds, shared site defaults, magnetic button outlines, color palettes, theme starter packs, responsive layouts, framework integrations, embeds, or preloads. Fetch the live catalog instead of relying on remembered family names, file paths, formats, counts, snippets, or licensing notes.
---

# SHAUGHV CDN discovery

The CDN publishes design assets, fonts, browser components, reusable styles,
examples, optional skill downloads and machine-readable documentation.
The same standalone skill is available from the CDN; it does not require the
rest of the plugin. Discover its download through the catalog's
`usage.documentation.installable_skill` entry.

## Required workflow

1. Fetch the [agent guide](https://cdn.shaughv.com/agents) at the start of the task. Treat the
   returned Markdown as the current operating guide.
2. Fetch the [asset tree](https://cdn.shaughv.com/tree.json) for the canonical machine-readable
   catalog. `https://cdn.shaughv.com/tree` is an identical alias.
3. Follow the live guide and resolve the requested item from the manifest.
4. Use manifest-provided asset URLs and font-loading snippets as supplied.
   Customize surrounding presentation within the live example's stated scope.
5. If the requested item is absent, report that it is not in the current
   manifest. Do not guess, probe a remembered path, or substitute stale skill
   text.

The freshly fetched guide, catalog, and linked component metadata take precedence
over behavioral details in an installed copy. If live discovery fails, report
what could not be fetched; do not present cached paths or defaults as current.
Fetching guidance does not authorize publishing or changing CDN infrastructure.

## What the CDN offers

Survey the [website](https://cdn.shaughv.com/), [showcase](https://cdn.shaughv.com/showcase)
and [complete page index](https://cdn.shaughv.com/api/docs/pages.json). For each
guide, the index supplies the current rendered URL, Markdown and structured page
JSON. Follow newly listed pages too. Look up actual imports in the asset tree.

| Area | Live resources and what to retrieve |
| --- | --- |
| Getting started | The [quickstart](https://cdn.shaughv.com/quickstart) has the baseline head and body markup. [Recipes](https://cdn.shaughv.com/recipes) combine fonts, favicons, components and footer for marketing pages and app shells. |
| Brand and artwork | [Brand assets](https://cdn.shaughv.com/brand) and the [showcase](https://cdn.shaughv.com/showcase) identify wordmarks, light/dark favicons, the signature, figurines, opaque/transparent variants and crests. Inspect the selected file and any provenance metadata under `tree.brand`. Keep original and adapted assets distinct. |
| Typography | Start with [Fonts](https://cdn.shaughv.com/fonts) and `fonts.all.defaults`. Specimens cover [Makira](https://cdn.shaughv.com/fonts/makira), [Geist Mono](https://cdn.shaughv.com/fonts/geist-mono), [Geist Serif](https://cdn.shaughv.com/fonts/geist-serif), [Geist Sans](https://cdn.shaughv.com/fonts/geist), [Paper Mono](https://cdn.shaughv.com/fonts/paper-mono), [Gail Rock](https://cdn.shaughv.com/fonts/gail-rock), [Michelangelus](https://cdn.shaughv.com/fonts/michelangelus) and [opt-in families](https://cdn.shaughv.com/fonts/opt-in). Look up the live family entry for stylesheets, faces, features, presets and licensing. |
| Color | [Palette explorer](https://cdn.shaughv.com/palettes) and [palette data](https://cdn.shaughv.com/brand/shaughv/palettes.json), when advertised. Explore starter packs, named colors, semantic roles, source attributions and scoped CSS. |
| Shared styles and identity | [Site defaults](https://cdn.shaughv.com/brand/shaughv/site-defaults.json) includes the stylesheet snippet, ivory token, component baseline and full-viewport layout. The [footer guide](https://cdn.shaughv.com/footer-lockup) and [crest metadata](https://cdn.shaughv.com/brand/crests/crest-info.json) cover both layouts, linked and fixed CSS, artwork, proportions and overrides. |
| Motion and controls | [Motion](https://cdn.shaughv.com/motion) demonstrates the animated mark and portrait loader. [Cursor](https://cdn.shaughv.com/cursor) and its [metadata](https://cdn.shaughv.com/brand/shaughv/cursor/cursor-info.json) cover pointer states and lifecycle. [Dropdowns](https://cdn.shaughv.com/dropdowns) and their [metadata](https://cdn.shaughv.com/brand/shaughv/dropdown/dropdown-info.json) cover forms, keyboard operation, theming and fallback. [Ambient background](https://cdn.shaughv.com/ambient-background) and its [metadata](https://cdn.shaughv.com/brand/shaughv/ambient/ambient-info.json) cover an optional field, cursor wake, placement, performance and notices. |
| Hosting and integration | [Links and updates](https://cdn.shaughv.com/hosting) explains canonical URLs, caching and troubleshooting. [Technical reference](https://cdn.shaughv.com/reference) covers namespaces, embeds, CORS and file delivery. |
| Skills | [Recommended skills](https://cdn.shaughv.com/recommended-skills), their [catalog](https://cdn.shaughv.com/recommended-skills/catalog.json) and [discovery index](https://cdn.shaughv.com/recommended-skills/.well-known/agent-skills/index.json) describe optional packages, configuration and installation. The [standalone CDN skill](https://cdn.shaughv.com/skills/shaughv-cdn/SKILL.md) is the separately installable version of these instructions. |
| Machine clients | Start with the [compact index](https://cdn.shaughv.com/llms.txt) or [full Markdown corpus](https://cdn.shaughv.com/llms-full.txt). Use the [page index](https://cdn.shaughv.com/api/docs/pages.json) for individual pages and the [generated documentation skill](https://cdn.shaughv.com/skill.md) for navigation. [OpenAPI](https://cdn.shaughv.com/openapi.json) and the [AI catalog](https://cdn.shaughv.com/.well-known/ai-catalog.json) describe discovery to tools. |

## Rules

- Use the guide and tree as stable entry points. The links below are navigation shortcuts. Check their current destinations against the live catalog and page index before implementing anything.
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
- Read `fonts.all.defaults` for the preferred sans, monospace, and serif families.
  Resolve each role's family key to its current `fonts` entry before choosing
  CSS family names or loading snippets.
  Use the live serif default whenever serif typography is requested. Alternates
  remain explicit choices.
  Bundle membership may include compatibility families and does not imply a default.
- Use manifest-provided font stylesheets rather than recreating `@font-face`
  declarations.
- For direct font downloads or preloads, read the selected family's current
  `details.faces` and resolve each exact `file` through the asset tree. Preserve
  digest suffixes; never construct a binary filename from its family or style.
  Check the selected face's weight, style, format, version, and variable axes
  individually. A family need not have the same version or range in every format.
  Use the current hosted stylesheet for website defaults; bundled design-kit
  font files do not establish the current CDN release.
- Preserve `crossorigin` on cross-origin font preloads.
- Link to CDN-hosted assets. Do not mirror licensed or brand-owned files unless
  the user explicitly authorizes redistribution.

Walk `tree` recursively for the complete file list. An object with `url` is a file leaf. Read its `type`, `bytes`, `kind` and optional `embed`. Use the entry for the exact variant required. Read `usage.cors` and the resource’s notices before reusing a download.

## Resolve a resource for an implementation

Use the catalog while authoring the project. A page can load the resulting
stylesheet, image or script directly. For example, this JavaScript prints
ready-to-use values for the current default sans, shared component styles and
cursor installation. Run it in a modern Node session or browser console.

```js
const response = await fetch("https://cdn.shaughv.com/tree.json");
if (!response.ok) throw new Error(`CDN catalog returned ${response.status}`);
const { fonts, usage, tree } = await response.json();
console.log(fonts[fonts.all.defaults.sans].html);
console.log(usage.site_defaults.stylesheet.html);
console.log(usage.components.cursor.integration.html);
console.log(Object.keys(tree.brand)); // choose an artwork group, then inspect its leaves
```

For an image, copy the selected leaf's embed or use its URL with meaningful
alternative text (empty for decorative artwork). Choose the favicon variant
for the viewer's color scheme. For the signature, consult the metadata beside
the artwork. For animation, the motion guide covers the framework-independent
custom element, the React source port, static and reduced-motion states, and
the loader's Anime.js dependency. Load only the scripts the page uses.
For a failed embed, compare the final browser request, MIME type, cache headers
and rendered result with the current catalog entry and live example.

## Font features and presets

Read the selected family's `details` and `details_url` when present. Availability,
weights, styles, variable family names, verified glyph behavior, and licensing
come from that entry; do not infer them from another font or a feature tag.

- Start with a task-matching `details.recommended_presets` entry. Use its CSS,
  preserve `keeps_default`, enable only `enables`, and honor `avoids`.
- Read each OpenType feature's `label`, `changes`, `recommended_for`, and `css`.
  A feature affecting a numeral need not affect a similarly shaped letter.
- Apply alternates at the narrowest useful selector. Use `default_style.css`
  where code or data must keep base glyphs despite inherited display alternates.
- Respect `exclusive_with` and `combining.note`; combine only documented
  independent features. If metadata is absent, do not invent feature support.
- Read `details.verification.variable_axes` before configuring a variable face.
  A shape axis such as `ELSH` does not imply variable weight, bold, or italic
  support; use only the supplied axis range and documented styles.
- Verify actual font loading and the requested glyphs in context; a successful
  stylesheet response or a plausible fallback does not prove the face rendered.

## Documentation, downloads, and updates

Use `usage.documentation` to find the Blume pages, Markdown index and full corpus,
page JSON index, OpenAPI, AI catalog, and visual examples. Use returned page URLs
instead of deriving routes from titles. The generated documentation skill helps
navigate those pages; it supplements the `/agents` operating guide and never
replaces the manifest as the authority for assets, font defaults, or snippets.

The standalone download and the plugin skill are the same maintained instructions.
Reinstall the skill or update the plugin to refresh installed text; each CDN task
still fetches the live guide and catalog. Follow the live cache policy: hosted
component updates reach sites as caches refresh, preserving configured colors.
For an immediate rollout, use the current catalog's script URL, including its
query string. A version query separates cache entries and still serves the current script when refetched. Do not invent cache-busting parameters or promise instant updates
to already open pages. Changed immutable binaries require a new asset filename.

## Optional recommended skills

Discover `usage.recommended_skills` in the live manifest and read its linked
catalog and documentation. Recommend only relevant entries; read their sources,
licenses, complete downloads, digests, and setup notes. Check existing project
and global installations before proposing changes.

Ask which agent and whether the user wants this project or globally on this
machine. Global means the current user's selected agent across projects, not
every OS user. Show the exact command, destination, and setup changes and obtain
approval before installation, updates, or configuration. Do not silently use
`--all` or `-y`, change scope, or overwrite an existing installation. Additional
dependencies, MCP connections, authentication, or first-run helper downloads need
approval for those setup changes. Reading the guide or downloading a bundle does
not authorize installation. After approval, use the catalog's selected install
source and verify the actual entrypoint and supporting files in the approved
scope. Use the selected entry's `installation.command_prefix` and agent/scope
flags; different entries can require different installers. Preserve the project's design system and CDN defaults; recommendations
are optional. Never maintain the recommendation inventory in this router skill.

The page's All Skills option prepares every catalog entry for one agent and
scope. Use it only when the user explicitly selects all recommendations. Confirm
the actual terminal before chaining: macOS/Linux shells, WSL, Git Bash,
PowerShell 7+, and Command Prompt use `&&` (stop after failure); Windows
PowerShell 5.1 uses `;` (continue after failure). OS detection is only a default
and cannot identify the user's terminal. Review every entry's setup notes.

## Optional website palettes

When the catalog advertises `usage.documentation.palettes`, open that visual
guide for theme previews and scoped, copyable CSS. Read
`usage.documentation.palette_catalog` for the machine-readable data. Resolve
a selected theme's `roles` to named entries in `colors` and look up provenance
in `sources`. The guide's body and button contrast figures apply to the
demonstrated pairs. Check links, muted text, hover, focus and selection in the
rendered site, especially after overriding a color or placing it over imagery.
Keep an existing theme, adopt a whole pack, or take only the roles the project
needs. Scope copied properties to the intended container. If discovery omits
the palette links, use the project's theme and report the missing resource
when the task specifically requires it.

## Shared styles

When a design calls for white, start with the ivory in `usage.site_defaults.design_white`.
Resolve its CSS custom property from the shared stylesheet for page backgrounds,
surfaces, light text, and other white details. A palette can omit white entirely.
Choose true white deliberately when it suits the design. Preserve artwork colors,
text contrast, system colors, and print choices.

When available, resolve the component stylesheet and animated mark from `usage.site_defaults`. A direct stylesheet link follows CDN updates on reload. Use the footer guide’s Copy CSS option and its isolated outer class when the site should keep a fixed footer. Both modes use the original footer crest. Follow the live examples for local color, mark size, paired-logo scaling, and cursor overrides. An animated mark needs its hosted script once per page. Preserve existing script-only integrations.

### Marks only and standalone artwork for custom footers

The [footer artwork guide](https://cdn.shaughv.com/footer-lockup#standalone-artwork)
also offers direct images when `usage.site_defaults.footer.artwork` is present.
Read `pair_url` for a single image containing both marks, or `wordmark_url`
and `crest_url` for the individual files. Use the returned dimensions to
preserve proportions. Place the pair anywhere **within the site's footer**.
Use the Marks only snippet in `artwork.html`, or link `artwork.stylesheet`
and apply `artwork.css_class` to a named image role inside the footer. The
project controls the surrounding layout. Individual marks elsewhere are optional. Keep the
copyright line as accessible text in the footer with any installation.

## Required CDN site baseline

Every CDN site includes the shared cursor, support for the frosted dropdown,
and a footer with the SHAUGHV wordmark and Shaughnessy family crest together. Read
`usage.site_defaults.footer.artwork` for the pair and
`usage.site_defaults.footer.copyright` for the year helper and notice.
Linked CSS, Copy CSS, Marks only and custom layouts all require the same
visible line **© [viewer’s current year] SHAUGHV and ES Development LLC**.

In HTML, load the [year helper](https://cdn.shaughv.com/js/shaughv-year.js)
once with the catalog’s `footer.copyright.html` snippet.

```html
<script defer src="https://cdn.shaughv.com/js/shaughv-year.js"></script>
<small>© <shaughv-year></shaughv-year> SHAUGHV and ES Development LLC</small>
```

A framework may instead set the year with `new Date().getFullYear()` on client
mount. Use the viewer’s local clock on each page load, including when HTML is
cached, prerendered or server-rendered. A fixed year, UTC calculation or
build-time-only expression can show the wrong year. If the helper is unavailable,
use the same local-date calculation in the browser. For a JavaScript-free
site with a known viewer timezone, render the year per request in that timezone
and keep caches from serving a stale year.
Read `usage.site_defaults` and `usage.components.dropdown` from the live catalog
and follow their documentation links. Humans and agents use the same contract.
Keep the current font defaults; customize color, spacing, type, and layout to
the site while preserving the components' behavior and logo proportions.

For a full-screen design, keep main one full viewport using `min-height: 100svh`
with a `100vh` fallback and `width: 100%`. Put the footer after main in normal
document flow, below the first viewport. Do not subtract the footer's height or
overlay controls. A full viewport is 100vh, not 1vh; allow content to grow.

Use the hosted frosted dropdown where the project calls for a labelled native
single select, such as choosing one value from a long list. A page can support
the component without adding a select. Keep short comparisons visible, such
as a row of labelled palette choices. Use informational disclosures sparingly
for optional reference material. Keep the details needed to choose in view.

Page-rendered options keep the custom cursor through open menus. Retain form
semantics, keyboard navigation, touch targets, reduced motion, and the live
guide's native exceptions. Ancestor class/style/theme and system color-scheme
changes synchronize automatically. Refresh after direct value assignments or
stylesheet-only theme changes, and destroy framework-owned instances on teardown. Do not replace the
native select's form state or invent a separate dropdown design.

When adapting a [palette](https://cdn.shaughv.com/palettes) or
[dropdown](https://cdn.shaughv.com/dropdowns) example, use the site's gutters
and spacing scale. Check label baselines and row gaps at desktop and mobile
widths, including where a label wraps or controls stack.

## Client lifecycle and interaction

- For static HTML, SSR and prerendered pages, render footer markup and labelled
  native selects in the document. Link the shared CSS in the page head. Both
  linked and copied footer styles render the logo pair without JavaScript.
- For a routed app, use one cursor in the persistent layout. For a component or
  island that owns an imperative mount, wait for the hosted script and DOM
  target, then call the returned handle's `destroy()` on teardown. Choose
  either the catalog's declarative setup or its JavaScript setup for the same
  owner. Use these recipes within the project's existing framework.
- Read `usage.components.cursor.integration` and the cursor metadata for
  supported colors, magnetic outlines, checkbox/radio snapping, field ripple,
  typing caret and scroll behavior. Let the component manage pointer hiding
  and native opt-outs. Preserve keyboard focus, touch, forced colors, reduced
  motion, native editing and the system pointer when scripts are unavailable.
- Check an actual form with keyboard and touch, including selection, validation,
  reset and a framework remount if applicable. Verify the footer, focus and
  text contrast in the project's themes and the narrowest supported layout.

## Optional ambient background

Discover the optional dither background and finite cursor wake through
`usage.components.ambient` in the live CDN catalog. Read the linked guide and
source notices before installing it. Use the shared color presets or the site's
custom colors while preserving the field motion, wake, masks, and timing. The shared field ink is tuned for visibility; discover its current intensity and rendering details in the live metadata.
Keep content above the transparent canvases, retain motion/touch/visibility
fallbacks, and destroy framework-owned mounts on teardown. Background decoration
is opt-in; the required cursor, dropdowns, and paired footer stay the baseline.
Do not copy current script paths or color tables into installed skills.
