# SHAUGHV footer identity

Use either supplied footer example as is, or customize it to the theme already
being implemented elsewhere on the site. Both approaches are valid. Exact
layout, alignment, navigation, copyright placement, typography, colors, gap,
padding, and responsive breakpoints are flexible.

The requirement is to keep **both the main SHAUGHV wordmark and Shaughnessy
crest in the footer**, as a recognizable pair, plus copyright text. Preserve their relative sizing
and each logo's natural aspect ratio. Scale the two together; do not stretch
either one or make one disproportionately larger than the other.

For a website, fetch the [agent guide](https://cdn.shaughv.com/agents) and [catalog](https://cdn.shaughv.com/tree.json).
Follow `usage.documentation.footer_example` and `crest_metadata` for the current
guide and provenance. The identity assets work offline; hosted font defaults require licensed local copies for a fully offline export.

For web installations, the [live footer guide](https://cdn.shaughv.com/footer-lockup#install) provides Link CSS and Copy CSS. The link follows shared defaults on reload and supports local overrides. To freeze a footer, copy its CSS and use the guide’s isolated footer class even on a site linking shared styles for another component. Both modes retain the original SVG crest.

## Full-screen layouts

Keep a full-screen main experience one full viewport (`min-height: 100svh` with
a `100vh` fallback, `width: 100%`). Place the footer after main in normal flow,
below the initial viewport. Do not shrink main by the footer's height or overlay
its controls. Let content grow for narrow screens and text zoom. One full
viewport means 100vh, not 1vh.

CDN-based sites also include the shared cursor and frosted dropdowns. Read the
live `usage.site_defaults` contract through the `shaughv-cdn` skill.

## Assets included in this skill

Paths in this table are relative to the skill root.

| Asset | Purpose |
| --- | --- |
| `assets/footer-wordmark-3a434d1a6202.svg` | Tight-framed static wordmark from the CDN footer stylesheet, used as a CSS mask |
| `assets/SHAUGHV-Official.svg` | Original static wordmark for non-JS use; its square canvas differs from the renderer |
| `assets/crests/Shaughnessy-Crest-Footer.svg` | Exact small-footer derivative, with translucent fills that strengthen fine detail |
| `assets/crests/Shaughnessy-Crest.svg` | Unchanged supplied color original |
| `assets/crests/Shaughnessy-Crest-Mono.svg` | Unchanged supplied mono original; not the footer derivative |
| `assets/crests/crest-info.json` | Variant relationships, checksums, source, policies, and reference dimensions |

Keep the actual artwork. Do not replace the wordmark with typed text, redraw
either logo, substitute the favicon for the wordmark, or assume the three crest
files are interchangeable. The owner's brand assets are supplied for authorized
SHAUGHV work; bundling them does not grant general redistribution rights.

## Proportions and scaling

These are **reference dimensions**, not mandatory installation sizes:

| Detail | At scale 1 |
| --- | --- |
| Wordmark | 64px high, approximately 95px wide at its natural aspect ratio |
| Crest | 80px wide × 100px high |
| Wordmark optical offset | 7px downward with the tight-framed wordmark |
| Suggested gap | 24px; adjustable to the composition |

Use one shared scale value for both logos. At 0.75×, the wordmark is 48px high
and the crest is 60 × 75px. At 1.25×, they are 80px high and 100 × 125px,
respectively. Scale the optical offset with them. Preserve readable detail;
if a narrow layout is crowded, wrap or rearrange its surrounding content before
shrinking the logos excessively.

`examples/footer.css` provides `--identity-scale` and applies it to both logos
with `calc()`, so scaling also changes their actual layout boxes. It does not
use a transform to resize the pair while leaving an oversized empty box.

```css
/* One value resizes both marks proportionally. */
.project-footer { --identity-scale: 0.85; }
```

## Fonts

The examples load the skill's local `colors_and_type.css`, including its
hosted default fonts and bundled compatibility faces. Makira and Geist Mono are the standard pair. Either can carry
headings, body text, UI, and buttons; they are not limited to a headline/body
split. The footer example uses Geist Mono for small supporting text. Use the
consuming site's type styles when adapting the footer.

For an existing public website, prefer the CDN stylesheet returned for
`fonts.all` by the catalog, and reuse the site's tokens. Do not import the
kit's global page styles just to obtain its fonts. See [fonts.md](fonts.md)
for hosted loading, local loading, variable faces, optional families, and notices.

## Ready-to-use examples

Open `examples/footer.html` through a local static server. It shows:

1. Both logos on the left, copyright beneath them, and sample navigation on
   the right. Navigation moves below the identity on narrow screens.
2. Both logos centered horizontally, with the copyright centered beneath them.

Copy the relevant markup and `examples/footer.css` into the project, update
the relative asset paths for its public directory, and set real navigation
destinations and copyright text. The defaults use 32px vertical padding and
40px horizontal padding, reduced to 28px on narrow screens. These are adjustable
starting values. The example links go to the portfolio; replace them with the
consuming site's routes.

```html
<footer class="identity-footer project-footer">
  <div class="identity-brand">
    <div class="identity-lockup">
      <span class="identity-wordmark" role="img" aria-label="SHAUGHV"></span>
      <span class="family-crest" role="img"
        aria-label="Shaughnessy family crest — Fortis et stabilis"></span>
    </div>
    <small>© 2026 Emmett Shaughnessy</small>
  </div>
  <nav class="footer-navigation" aria-label="Footer">
    <span>Navigate</span>
    <a href="/#about">About</a>
    <a href="/#projects">Projects</a>
    <a href="/tasks">Tasks</a>
  </nav>
</footer>
```

For the centered example, add `is-centered` to the footer and omit the
navigation. Keep both logos and the shared scale value. Other arrangements
that fit the site are equally valid.

## Color and contrast

The reference starts with black artwork on ivory. Its inverse shows ivory on
black. Choose either combination or adapt the colors to the site. Set
`--footer-background`, `--footer-foreground`, and `--footer-font` from the
consuming site's design tokens, or use the example unchanged.

```css
.project-footer {
  --footer-background: var(--surface);
  --footer-foreground: var(--text);
  --footer-font: var(--font-mono);
}

/* Optional inverse demonstration. */
.project-footer.is-inverted {
  --footer-background: #000;
  --footer-foreground: var(--shaughv-white, #FAF8F3);
}
```

The wordmark inherits `currentColor` through its mask. The crest uses the original footer SVG
as a CSS mask and `background: currentColor`, preserving its detailed alpha
while following the same color. An external SVG `<img>` does not inherit the
parent's text color. Use the supplied color image when its original colors are
intended, or the mask when it should follow the site's text color.

The website's invert controls are preview tools, not required footer UI.

## Frameworks and static fallback

The linked, snapshot and local examples use two CSS masks and work with
JavaScript disabled. Render the markup in HTML, a server template or a
framework component. Use `className` in JSX. Keep copyright and navigation
links in the project's own template.

For a non-CSS export, embed the tight-framed footer wordmark and footer crest
as images. If using the original square-canvas wordmark instead, compensate
for its extra whitespace and check the visible proportions.

## Check the installed result

- Both logos are present, in the footer, without stretching or cropping.
- Their relative size is preserved at the chosen shared scale.
- The footer fits the site's theme, whether the example was copied or adapted.
- The correct crest variant, wordmark, and chosen fonts load successfully.
- Desktop and narrow mobile layouts have enough space and no horizontal overflow.
- Text and marks remain readable in the site's actual light and dark surfaces.
- Links work, keyboard focus is visible, images have names, and the mark remains
  static when used in this footer.

## Provenance

The reference proportions come from `shaughv_vintage`'s
`src/components/sections/FooterSection.tsx` at commit
`59b37a73fa5047bc0b4350dc8769ad97ebeeb117`. The CDN guide and crest metadata were
refreshed at commit `3860f0b8510b04ba2df912e24436a68f622562a3`. Source values
document the example; the owner's customization policy above takes priority
over copying the source layout exactly.
