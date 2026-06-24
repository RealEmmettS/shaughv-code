---
name: shaughv-cdn
description: >
  How to consume the SHAUGHV private CDN at cdn.shaughv.com — brand assets (logos,
  favicons, figurines), the licensed Makira and opt-in Unbounded display fonts, IBM
  Plex Mono, and shared vanilla-JS drop-ins (animated brand mark, loader) — by
  reading its self-describing JSON manifest at /tree.json instead of hardcoding
  paths. Use whenever the user mentions cdn.shaughv.com, the SHAUGHV logo / wordmark
  / favicon, SHAUGHV figurines, the animated SHAUGHV brand mark or loader, or the
  Makira / Unbounded / IBM Plex Mono fonts in a SHAUGHV context; when building any
  SHAUGHV-branded page that embeds these assets or loads these fonts (including
  @font-face or preload); or any time a cdn.shaughv.com URL appears in code or
  conversation. Prefer this over inlining your own SHAUGHV fonts, favicons, or brand
  assets. See the body's "When this skill fires" for the full asset list and rule.
---

# SHAUGHV CDN

`cdn.shaughv.com` is Emmett Shaughnessy's private CDN for SHAUGHV brand assets, licensed fonts
(Makira display + IBM Plex Mono, plus the opt-in Unbounded brutalist display face), and a small
set of shared zero-dependency vanilla-JS drop-ins (animated brand mark, loader). It's a Cloudflare
R2 bucket behind a custom domain — no Worker, no auth, open CORS on `GET`/`HEAD`.

Anything SHAUGHV-branded in the browser should pull from here rather than ship its own copy. The
CDN is the canonical source of truth.

- **Base URL:** `https://cdn.shaughv.com`
- **Backend:** Cloudflare R2 (custom domain → bucket), read-only
- **CORS:** open (`*`) on `GET`/`HEAD` — `<link>`, `<script>`, `<img>`, `fetch()` all work cross-origin without preflight friction
- **Source repo (private):** `https://github.com/RealEmmettS/shaughv-cdn`

## When this skill fires

Trigger on any mention of **cdn.shaughv.com**, the SHAUGHV logo or wordmark, the SHAUGHV
favicon, SHAUGHV figurines (`figurine-header`, `figurine-404`, `figurine-footer`,
`figurine-mail`, `figurine-look-at-this`), the animated SHAUGHV brand mark
(`<shaughv-mark>`), the SHAUGHV loader (`<shaughv-loader>`), or the Makira, Unbounded, or
IBM Plex Mono fonts in a SHAUGHV context. Also when building any SHAUGHV-branded webpage or
app that embeds assets or loads these fonts, when adding `@font-face` or preloading SHAUGHV
fonts for performance, or any time a cdn.shaughv.com URL appears. Always fetch the live
manifest and use the `url` / `embed` / `css_url` fields it returns — individual paths can
change, the manifest can't drift. This skill covers the manifest shape, canonical
embed/preload patterns, the cache contract, CORS, and license / redistribution limits.

## The one rule: read the manifest, never hardcode paths

The CDN publishes a single **self-describing JSON manifest** that lists every file, with
ready-to-paste snippets. It's regenerated from the bucket's actual contents on every deploy, so it
can't drift from what's live — new assets appear, renamed/moved assets self-correct.

- **Fetch the manifest and use the `url` / `embed` / `css_url` it hands you.** If an asset moved or
  a font was added (Unbounded was), the manifest already reflects it — your integration self-heals.
- **Never hardcode a specific asset URL from memory or from a stale copy of this guide.** Every
  concrete path in the snippets below is **illustrative of the pattern**, not canonical — confirm
  the real URL against the manifest.

The only thing to remember is the manifest endpoint itself:

```
GET https://cdn.shaughv.com/tree.json      # /tree is an identical alias
```

It's small, public (`CORS *`), and `stale-while-revalidate`-cached, so fetch it freely and often.
(This very skill text is served from the same host at `/agents`.)

## The manifest shape

One JSON object. Illustrative skeleton (values differ; `count` was 99 at last check):

```jsonc
{
  "base_url": "https://cdn.shaughv.com",      // host every leaf url hangs off
  "count": 99,                                // files indexed
  "usage": { "cors": "*", "note": "…how to consume…" },

  "fonts": {                                  // ← load fonts from here
    "<family-key>": {
      "family":  ["Makira", "Makira VF"],     // the CSS font-family name(s) to use
      "weights": [400, 500, 600, 700, 800, 900],
      "styles":  ["normal"],
      "css_url": "https://cdn.shaughv.com/…/<family>.css",
      "html":    "<link rel=\"stylesheet\" href=\"…\">",   // paste into HTML
      "css":     "@import url(\"…\");"                       // paste into CSS
    },
    "all": { "css_url": "…", "html": "…", "css": "…" }       // the standard families in one request
  },

  "tree": {                                   // ← nested directory → file tree
    "<dir>": { "<subdir>": {
      "<filename>": {
        "url":   "https://cdn.shaughv.com/…/<filename>",  // direct, absolute URL
        "bytes": 4975,
        "type":  "image/svg+xml",             // served Content-Type
        "kind":  "image",                     // font | image | css | js | other
        "embed": "<img src=\"…\" alt=\"\">"   // paste-ready tag, or null
      }
    } }
  }
}
```

- **`fonts`** — keyed by family. Each entry gives you the `css_url` to link plus copy-paste `html`
  (`<link>`) and `css` (`@import`) snippets, the actual `family` name(s) for `font-family:`, and the
  available `weights`/`styles`. `fonts.all` loads the standard families in one request. (Unbounded is
  opt-in — see below — so prefer linking its own family entry when you want it.)
- **`tree`** — walk down to a **leaf**: any object with a `url`. A leaf gives its direct `url`, served
  `type`, `kind`, and a paste-ready `embed` (for images/scripts/styles; `null` for fonts/source files).

## Discovering & embedding assets

```
manifest = GET https://cdn.shaughv.com/tree.json
images   = [ leaf.url for leaf in walk(manifest.tree) if leaf.kind == "image" ]
```

…where `walk(node)` recurses into any object **without** a `url` and yields any object **with** one.

- **Fonts:** all standard families in one link → `fonts.all.html`; one family → `fonts["<key>"].html`,
  then `font-family: "<a name from that family's .family array>"`.
- **An image (logo / favicon / figurine):** collect leaves with `"kind": "image"` and pick by filename.
- **A JS drop-in:** collect leaves with `"kind": "js"` and use its `embed` (`<script src…>`).
- **Pick by name, not by remembered path.** Know the filename (e.g. `SHAUGHV-Official.svg`) but not
  the folder? Search the walked leaves for it and use whatever `url` you find — a reorg never breaks you.

## Canonical patterns the manifest doesn't encode

The manifest hands you current URLs; it can't tell you the *integration know-how* below. Treat the
specific paths here as illustrative — pull the live ones from the manifest.

### Animated brand mark (vanilla, recommended) — 64px hard minimum

```html
<style>.brand-mark { display:inline-block; height:64px; width:64px; color:#fff; }</style>
<shaughv-mark class="brand-mark" aria-label="SHAUGHV"></shaughv-mark>
<script src="https://cdn.shaughv.com/js/animated-brand-mark.js"></script>
```

Inherits color from CSS `currentColor`. **Hard minimum 64 × 64 px** — below that the path-drawing
animation looks broken, so fall back to the static wordmark (`SHAUGHV-Official.svg`; PNG fallbacks
`SHAUGHV-Green.png` / `SHAUGHV-Orange.png` exist for clients that can't render SVG, e.g. Outlook).

### React port of the brand mark

Raw JSX (`react/AnimatedBrandMark.jsx`), no upstream compilation — needs a JSX-aware bundler (Vite,
Next) and Framer Motion. For static HTML, prefer the vanilla `<shaughv-mark>` drop-in (no build step).

### Favicon (light + dark with `prefers-color-scheme`)

```html
<link rel="icon" href="…/favicons/SHAUGHV-Favicon-Dark.svg"  media="(prefers-color-scheme: light)" />
<link rel="icon" href="…/favicons/SHAUGHV-Favicon-Light.svg" media="(prefers-color-scheme: dark)" />
```

The `-Alt` variants are secondary marks — use only when the primary conflicts with adjacent UI.

### Fonts — one stylesheet per family loads every weight

Link `fonts["<key>"].css_url`; the stylesheet declares `@font-face` for every weight, and browsers
only download the weights they paint. Set your `font-family` from the entry's `family` array, e.g.:

```css
:root {
  --font-display: "Makira", system-ui, sans-serif;
  --font-mono:    "IBM Plex Mono", ui-monospace, monospace;
}
```

**Makira variable font** (animate weight / cut requests): `@font-face { font-family:"Makira VF";
src:url("…/makira/variable/Makira-VF.ttf") format("truetype-variations"); font-weight:400 900; }`.
IBM Plex Mono does **not** ship a variable build.

**Font preload needs `crossorigin`** even though CORS is open — browsers won't reuse a cross-origin
preload without it:

```html
<link rel="preload" as="font" type="font/woff2" crossorigin href="…/ibm-plex-mono/woff2/IBMPlexMono-Regular.woff2" />
<link rel="preload" as="font" type="font/woff2" crossorigin href="…/makira/woff2/Makira-Bold.woff2" />
```

### Unbounded (opt-in brutalist display face)

`Unbounded` is the chunky display face for headlines on the **dark / brutalist** SHAUGHV surfaces.
It's **opt-in** — deliberately *not* part of the combined font bundle, so the Makira + IBM Plex Mono
two-font system stays the default. Link its own stylesheet:

```html
<link rel="stylesheet" href="https://cdn.shaughv.com/fonts/unbounded/unbounded.css" />
```
```css
:root { --font-headline: "Unbounded", system-ui, sans-serif; }  /* weights 300 · 400 · 500 · 700 · 900 */
```

The stylistic **`Blond`** cut ships under its own family name — `font-family: "Unbounded Blond"` (a
regular-weight stylistic alternate, so it can't share `"Unbounded"` 400). Unbounded is **woff2-only**,
and is for SHAUGHV's own brutalist surfaces — not third-party work.

### Figurines (mascot illustrations)

```html
<img src="…/figurines/figurine-header.webp" alt="" width="240" height="240" loading="lazy" />
```

Use the `transparent/` variants when overlaying on photos, colored surfaces, or anything non-cream.
Available (each in opaque + `transparent/`): `figurine-header` (+ `.svg`, primary hero), `figurine-footer`,
`figurine-mail`, `figurine-look-at-this`, `figurine-404` (+ `.svg`, error states).

### Loader (canonical loading indicator)

```html
<shaughv-loader style="color: var(--accent); height: 120px;"></shaughv-loader>
<script src="https://cdn.shaughv.com/js/shaughv-loader.js"></script>
```

Inherits color from `currentColor`; size by `height` (width auto-derives).

## Cache contract

| File class | `Cache-Control` | Meaning |
|---|---|---|
| Fonts (`*.woff2/woff/ttf/otf`), images (`*.svg/png/webp`) | `public, max-age=31536000, immutable` | Content-addressed — URL ↔ bytes for 1 year. A changed binary ships under a **new filename**, so any `url` you read from the manifest stays valid as long as it appears there. |
| `*.css`, `*.js`, `*.jsx`, `*.json` | `public, max-age=86400, stale-while-revalidate=604800` | Mutable drop-ins — patches propagate within ~1 day; stale copies serve while a fresh fetch runs. |

- **No cachebusting on binary URLs.** Don't append `?v=1` to font/image URLs — they're already
  content-addressed; a query string just defeats the cache.
- **Don't ask for "the new logo at the same URL."** Updated binaries ship under a new filename; old
  consumers keep working, new consumers point at the new URL (which the manifest will be showing).
- **CSS/JS updates land within a day.** If a change to `makira.css` or `animated-brand-mark.js` isn't
  showing, wait ~24h or purge the URL in Cloudflare (zone `shaughv.com` → Caching → Custom Purge).

## CORS

Open `*` on `GET`/`HEAD`. Exposed headers: `ETag`, `Content-Length`, `Content-Type`, `Cache-Control`.
The CDN is read-only — no `POST`/`PUT`, no auth. Any origin can `<link>`/`<script>`/`<img>`/`fetch()`
without preflight.

## License — important, don't miss this

| Asset class | License | Redistribute? |
|---|---|---|
| SHAUGHV brand assets (logos, favicons, figurines) | © Emmett Shaughnessy, all rights reserved | **No.** Link to the CDN; don't host copies elsewhere or ship them in third-party packages. |
| Makira (display font) | Commercial license held by Emmett Shaughnessy | **No.** Self-hosting on this CDN is permitted; redistributing the binaries (mirroring, bundling) is not. |
| Unbounded (brutalist display) | SIL Open Font License 1.1 | OFL terms allow it, **but** it's reserved for SHAUGHV's own brutalist surfaces — don't pull it into third-party work. |
| IBM Plex Mono (monospace) | SIL Open Font License 1.1 | **Yes**, under OFL — but in SHAUGHV projects prefer the CDN URL for a single source of truth. |

Building for a third party not under Emmett's brand umbrella? Don't link them to SHAUGHV brand assets,
Makira, or Unbounded — they get IBM Plex Mono (or a Google Fonts equivalent) and a generic icon set.

## "Which asset do I need?"

Map a fuzzy ask to the right manifest entry (then read its live `url` / `css_url` / `embed`):

| User says / wants | Reach for |
|---|---|
| "SHAUGHV logo" / "the wordmark" | wordmark image leaf (`SHAUGHV-Official.svg`) |
| "Animated logo" / "the mark that draws itself" | `<shaughv-mark>` via `js/animated-brand-mark.js` |
| "Favicon" | favicon image leaves (`SHAUGHV-Favicon-{Dark,Light}.svg`) |
| "Mascot" / "figurine" / "illustration" | `figurine-*` image leaves (use `transparent/` over color) |
| "SHAUGHV fonts" / "display font" / "Makira" | `fonts.makira` |
| "Monospace" / "code font" / "IBM Plex Mono" | `fonts["ibm-plex-mono"]` |
| "Brutalist / display headline font" / "Unbounded" (dark site only) | `fonts.unbounded` (opt-in) |
| "Loading spinner" / "loader" | `<shaughv-loader>` via `js/shaughv-loader.js` |
| "React version of the brand mark" | `js/react/AnimatedBrandMark.jsx` |

## What this skill is *not* for

- **Maintaining the CDN itself** (adding assets, deploying, regenerating the manifest, editing CORS) —
  that lives in the source repo's `CLAUDE.md` / README (the wrangler + deploy flow). This skill is for
  **consumers** of the CDN, not maintainers.
- **General SHAUGHV brand design** (color tokens, type scale, component patterns, full UI kits) — that's
  the `shaughv-design` skill in this same plugin. Reach for that to build UI; reach for this for URLs.
