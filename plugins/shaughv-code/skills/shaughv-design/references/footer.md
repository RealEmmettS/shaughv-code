# SHAUGHV footer identity

Use either supplied footer example as is, or customize it to the theme already
being implemented elsewhere on the site. Both approaches are valid. Exact
layout, alignment, navigation, copyright placement, typography, colors, gap,
padding, and responsive breakpoints are flexible.

Every CDN site places the **SHAUGHV wordmark and Shaughnessy family crest
together inside its footer**. The site may additionally show either mark on
its own elsewhere. Position the pair to fit the footer, scale both marks by
the same factor and preserve each mark’s aspect ratio.

For a website, fetch the [agent guide](https://cdn.shaughv.com/agents) and
[live catalog](https://cdn.shaughv.com/tree.json). Use
`usage.site_defaults.footer.artwork` for the marks and
`usage.site_defaults.footer.copyright` for the notice. Follow
`usage.documentation.footer_example` and `usage.documentation.crest_metadata`
for current installation snippets and provenance. Link CSS follows shared
defaults on reload. Copy CSS uses the guide’s isolated outer class to keep a
fixed layout. The [live footer guide](https://cdn.shaughv.com/footer-lockup#install)
also offers Marks only for use inside an existing project footer.

## Copyright on every page load

Every footer variant includes **© [viewer’s current year] SHAUGHV and ES Development LLC**
as visible text. The year comes from the viewer’s local calendar each time
the page loads. Keep both names in the HTML. For the hosted integration,
load the [year helper](https://cdn.shaughv.com/js/shaughv-year.js) once in
the page head.

```html
<script defer src="https://cdn.shaughv.com/js/shaughv-year.js"></script>
```

Place this line inside the footer for Link CSS, Copy CSS, Marks only or a
custom composition.

```html
<small>© <shaughv-year></shaughv-year> SHAUGHV and ES Development LLC</small>
```

For a local static site, the runnable HTML example fills its year spans with
`new Date().getFullYear()` after parsing the markup. For a prerendered or
server-rendered framework, use the helper above or compute the year in a
client mount hook after hydration. A build timestamp or a UTC year can be
wrong for a visitor near midnight on January 1. With JavaScript disabled, the
static marks and rightsholder names remain visible. A JavaScript-free site
can supply the year on each request when the viewer’s timezone is known.
Account for that timezone and year rollover in any HTML cache.

## Standalone artwork in a custom layout

For an existing footer with its own layout, read `usage.site_defaults.footer.artwork`
from the live catalog when available. Choose `pair_url` for a single image
with the wordmark and crest already arranged. Use `wordmark_url` and `crest_url`
for separate images when the layout needs individual control. The [live
artwork guide](https://cdn.shaughv.com/footer-lockup#standalone-artwork) supplies
the current files and dimensions. Give the image a meaningful accessible name,
preserve its aspect ratio, and include the same current-year notice in the footer.
To inherit the site's color while using one element, start with
`usage.site_defaults.footer.artwork.html`. Its stylesheet and class render
the whole pair. Set `--shaughv-lockup-width` on the group to scale both marks,
their gap and optical offset together. Place the year line in the same footer.
If the catalog omits the artwork entry, use the documented full-footer recipe.

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
| `assets/SHAUGHV-Footer-Wordmark.svg` | Tight-framed static wordmark from the CDN footer stylesheet, used as a CSS mask |
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
3. A custom footer that places the marks-only group and notice in its own layout.

Copy the relevant markup and `examples/footer.css` into the project, update
the relative asset paths for its public directory, and set real navigation
destinations. Keep the current-year notice and its client-side year implementation. The defaults use 32px vertical padding and
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
    <small>© <shaughv-year></shaughv-year> SHAUGHV and ES Development LLC</small>
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

The linked, snapshot and local examples render both marks with CSS masks
even when JavaScript is disabled. The viewer-local year is filled at runtime. Render the markup in HTML, a server template or a
framework component. Use `className` in JSX. Keep copyright and navigation
links in the project's own template.

For a non-CSS export, embed the tight-framed footer wordmark and footer crest
as images. If using the original square-canvas wordmark instead, compensate
for its extra whitespace and check the visible proportions.

## Check the installed result

- The wordmark and crest appear together in the footer, including when either mark also appears elsewhere.
- On fresh loads near New Year, verify the exact notice in two timezones on opposite sides of midnight. Repeat with cached HTML. Check the two names and the viewer-local year for the chosen layout.
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
