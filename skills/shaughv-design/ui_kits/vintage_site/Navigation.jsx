/* global React */
const { useState } = React;

const LINKS = [
  { name: "About", href: "#about" },
  { name: "Projects", href: "#projects" },
  { name: "Skills", href: "#skills" },
  { name: "Contact", href: "#contact" },
];

const MONO = {
  fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
  fontWeight: 600,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
};

function Navigation() {
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (href) => (e) => {
    e.preventDefault();
    const id = href.replace("#", "");
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
      padding: scrolled ? "14px clamp(24px, 5vw, 48px)" : "22px clamp(24px, 5vw, 48px)",
      background: scrolled ? "rgba(250,250,248,0.82)" : "transparent",
      backdropFilter: scrolled ? "blur(14px)" : "none",
      borderBottom: scrolled ? "1px solid rgba(92, 84, 70, 0.18)" : "1px solid transparent",
      transition: "padding 320ms ease, background 320ms ease, border-color 320ms ease",
    }}>
      {/* ┌─ PRODUCTION-RESPONSIVE NOTE ──────────────────────────────────────┐
          │ This row uses `alignItems: center` on a short navbar. In a real  │
          │ responsive codebase a slightly taller navbar with `items-start`  │
          │ + `pt-5 / pt-3.5` anchoring reads more deliberate than vertical- │
          │ centering on a 64-80 px strip with a 56+ px brand mark.          │
          │                                                                  │
          │ ALSO: this kit renders the ANIMATED `<shaughv-mark>` (wordmark ↔ │
          │ icon loop). If the surface already has a brand-motion moment     │
          │ elsewhere (e.g. a hero typewriter→SVG-draw), use                 │
          │ `<shaughv-mark data-static>` here so the page doesn't double up. │
          │ See README "Production implementation notes" for details.        │
          └──────────────────────────────────────────────────────────────────┘ */}
      <div style={{
        maxWidth: 1440, margin: "0 auto",
        display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24,
      }}>
        {/* Brand lockup -- canonical animated mark on transparent ground */}
        <a href="#top" onClick={go("#top")} style={{
          display: "flex", alignItems: "center", textDecoration: "none", minWidth: 0,
          color: "var(--accent)",
        }}>
          <shaughv-mark
            aria-label="SHAUGHV"
            style={{
              display: "block",
              height: scrolled ? 64 : 72,
              width: scrolled ? 64 : 72,
              transition: "height 320ms ease, width 320ms ease",
              color: "var(--accent)",
            }}
          ></shaughv-mark>
        </a>

        {/* Nav links */}
        <nav style={{ display: "flex", gap: 6, alignItems: "center" }} className="shv-nav-desktop">
          {LINKS.map((l) => (
            <a key={l.name} href={l.href} onClick={go(l.href)}
              style={{
                ...MONO,
                fontSize: "0.7rem",
                color: "var(--fg)", textDecoration: "none",
                padding: "10px 14px",
                transition: "color 200ms ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--fg)")}
            >{l.name}</a>
          ))}

          {/* Primary CTA -- mono, full olive 1px border, sage fill */}
          <a href="#contact" onClick={go("#contact")}
            style={{
              ...MONO,
              fontSize: "0.7rem",
              background: "var(--accent)",
              color: "var(--sv-cream-100)",
              border: "1px solid var(--sv-sage-dark)",
              padding: "11px 18px",
              marginLeft: 10,
              textDecoration: "none",
              transition: "background 200ms ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--sv-sage-dark)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent)")}
          >Let&rsquo;s Talk</a>
        </nav>
      </div>
    </header>
  );
}

window.Navigation = Navigation;
