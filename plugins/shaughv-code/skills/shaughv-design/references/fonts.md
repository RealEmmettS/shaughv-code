# Fonts for SHAUGHV design

Makira and Paper Mono are the standard pair. Both are versatile enough for
titles, display text, interfaces, body copy, buttons, and labels. Paper Mono
also provides a grid for code and data. Geist Serif is the default whenever
serif typography is used; Michelangelus is the serif alternate. Geist is the
alternate sans and Geist Mono an alternate mono. Choose their roles for the design;
do not restrict Makira to headings or Paper Mono to tiny metadata.

When updating an existing site, keep its deliberate type choices unless the
task calls for a change. Installing the paired footer alone does not require
replacing the site's typography.

## Current family choices

Use `shaughv-cdn` to fetch `/agents` and `/tree.json` before online integration.
`fonts.all.defaults` is the current default contract; resolve actual stylesheet
URLs, available formats, family names, and feature metadata from the catalog.

| Family | Status | CSS family and range | Bundled in this skill |
| --- | --- | --- | --- |
| Makira | Standard sans | `Makira`, static 300–900 on CDN; `Makira VF`, variable 400–900 on CDN | Six static WOFF2 faces, 400–900; CDN also provides custom Light 300 |
| Paper Mono | Standard mono | `Paper Mono`, static 100–800; `Paper Mono Variable`, continuous 100–800 | Eight static WOFF2 faces, variable WOFF2, OFL and copyright notices |
| Gail Rock | Compatibility | `Gail Rock`, static 100–700; `Gail Rock VF` on CDN | Seven static WOFF2 faces |
| Geist Serif | Default serif | `Geist Serif`, Square, Triangle, Heart, and `Geist Serif Variable`; 400 normal, ELSH shape axis 0–100 | Hosted through the CDN; no binaries bundled |
| Geist | Alternate sans | `Geist`, `Geist Variable`; 100–900 normal and italic | Hosted through the CDN; no binaries bundled |
| Geist Mono | Alternate mono | `Geist Mono`, `Geist Mono Variable`; 100–900 normal and italic | Hosted through the CDN; no binaries bundled |
| Michelangelus | Alternate serif | `Michelangelus`, 400/700, normal and real italic | Load separately through the CDN; not bundled |
| IBM Plex Mono | Opt-in mono | Use the live entry's declared normal/italic faces and weights | Load separately through the CDN; not bundled |
| Unbounded | Opt-in display | `Unbounded`, `Unbounded Blond`, and `Unbounded Variable`; verify ranges in the live entry | Load separately through the CDN; not bundled |

The combined CDN stylesheet loads Makira, Paper Mono, and Geist Serif plus Gail
Rock for compatibility. Geist, Geist Mono, Michelangelus, IBM Plex Mono, and
Unbounded are separate opt-in families. Merely importing
a face does not make it the preferred default, and browsers fetch faces when
they are used.

## Hosted loading for websites

Read `fonts.all.html` or `fonts.all.css_url` from the live catalog and use its
returned stylesheet. For only one family, use that family's entry instead.
Keep the returned URLs; do not guess asset names or rebuild `@font-face`
declarations. A typical integration then assigns the loaded families:

```css
:root {
  --font-sans: "Makira", system-ui, sans-serif;
  --font-mono: "Paper Mono", ui-monospace, monospace;
  --font-serif: "Geist Serif", Georgia, serif;
}
.editorial-title { font-family: var(--font-mono); }
.body-copy { font-family: var(--font-sans); }
.serif { font-family: var(--font-serif); font-weight: 400; font-synthesis: none; }
.continuous-weight {
  font-family: "Paper Mono Variable", ui-monospace, monospace;
  font-weight: 450;
}
```

Either family can be swapped into either text role. Preserve `crossorigin`
on font preloads and preload only files the first view actually uses.

## Local loading

`colors_and_type.css` declares the bundled fonts using relative `fonts/` URLs.
For a standalone SHAUGHV prototype, keep that stylesheet beside the `fonts/`
directory and link it from the document. The footer examples do this.

The stylesheet also supplies the vintage palette, page-wide styles, and type
presets. For an existing site, take only the needed `@font-face` declarations
and map its own tokens, or use CDN loading. Avoid overriding its theme just
to load fonts. Copy files only where their license and the project allow it;
keep the notice files with Paper Mono.

The default token values are Makira for sans/headings, Paper Mono for mono,
and Geist Serif for serif. The serif face uses the canonical CDN asset;
standalone offline exports must embed a licensed original explicitly.
These are presets, not a restriction on either family. The variable face is
opted into with its distinct family name; it does not silently replace the
static Paper Mono faces.

## Italics, features, and readable text

- Bundled Makira, Paper Mono, and Gail Rock faces are normal style. Do not
  claim they include real italics. Use `font-synthesis: none` when synthetic
  styles would be misleading, or deliberately choose an italic-capable family.
- Geist Serif supplies weight 400 normal only. Its four static shapes and
  variable ELSH 0–100 axis change element shapes, not weight. Do not claim a
  weight axis or real italic/bold support. Use Michelangelus deliberately when
  serif bold or italics are required.
- Geist and Geist Mono provide static and variable 100–900 normal and real
  italic faces. Both remain alternates with their own stylesheets.
- Michelangelus supplies Regular, Italic, Bold, and Bold Italic as original
  TTF files. It is suitable for body text as well as headings. Start with
  normal tracking for paragraphs; remove inherited tight uppercase sans
  heading rules. Inspect its real italics and heading spacing in context.
- Paper Mono's printable ASCII has fixed advances; combining marks and some
  extended glyphs differ. Check the actual content when exact columns matter.
- Keep `font-feature-settings: normal` as the base. Use a family's current
  `details` metadata before applying `zero`, stylistic sets, or ligatures.
  Features belong to the selected font; a tag can mean something different
  in another family. Apply them to the smallest relevant selector.
- When available, start with `details.recommended_presets`: preserve
  `keeps_default`, use only the listed `enables`, and honor `avoids`. Read each
  feature's documented `changes` and CSS rather than inferring its effect from
  a visual nickname. Respect `exclusive_with` and `combining.note`, and use
  `default_style.css` to keep base glyphs in code or data under an inherited
  display alternate. Missing metadata does not establish feature support.
- Verify actual loaded fonts and weights in the browser. A plausible fallback
  or a successful CSS response is not proof that the intended face rendered.

## Rights and source integrity

Paper Mono and the Geist families use SIL OFL 1.1 with their copyright notices. Preserve
them when copying its static or variable files. Makira is licensed for
authorized SHAUGHV use; a public URL does not grant general redistribution.
Gail Rock and the optional families retain their own ownership and license
metadata. Do not invent an open license or add new font binaries to public
repositories just because the CDN serves them. Prefer hosted stylesheets.

The bundled static font bytes were checked against the canonical CDN source
on 10 October 2026. Read the live catalog for later changes. Do not rewrite,
subset, or convert original font files as part of a routine branding install.
