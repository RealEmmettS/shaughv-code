# Personal Site UI Kit

Historical personal-site style reference for SHAUGHV. This kit is not a snapshot of the current live site.

The prototype uses the linked CDN cursor and paired footer with the project's
own colors. See the [footer guide](../../references/footer.md) and [runnable
local examples](../../examples/footer.html) for integration details.

## Source stack at the time of this reference

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19, TypeScript |
| Styling | Tailwind v4, CSS variables |
| Motion | Framer Motion 12, Anime.js v4 |
| Scroll | Lenis |
| Icons | lucide-react |
| Text | `@chenglou/pretext` (canvas measurement) |

## Stack (this kit)

Static HTML loads React, React DOM and Babel for the JSX previews.
Components are cosmetic recreations — not production-quality. The real production code lives in
`RealEmmettS/emmetts_personal_website` and should be consulted when accuracy matters.

## What's here

- `index.html` — click-thru prototype showing the home page (Hero → About → Projects → Skills → Contact → Footer) with a router-style link to the `/works` archive view.
- `Navbar.jsx` — fixed navigation with a static SHAUGHV wordmark.
- `Hero.jsx` — full-viewport hero with the per-character SHAUGHV name.
- `About.jsx` — two-card identity + philosophy panel.
- `Projects.jsx` — Selected Works grid (asymmetric 12-col rows).
- `Skills.jsx` — four-column typographic skill inventory.
- `Contact.jsx` — CTA + form panel mock.
- `Footer.jsx` — closing CTA, links, paired identity and copyright.
- `Works.jsx` — /works archive view (filter pills + ticker + tile grid).
- `WorkTile.jsx` — individual archive tile.
- `data.js` — the source-of-truth `works` array (subset of the production data).

## Palette

This kit demonstrates a **brutalist dark palette** (near-black `#090909` + brand
orange `#FF5E1A`). For the vintage cream-and-sage reference, see
`ui_kits/vintage_site/`. An existing site's current theme takes precedence when
installing the footer.
