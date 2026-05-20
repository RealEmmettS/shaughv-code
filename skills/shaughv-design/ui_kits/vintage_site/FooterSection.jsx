/* global React */

const MONO = {
  fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
  fontWeight: 600,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
};

const MAKIRA_HEAD = {
  fontFamily: '"Makira", sans-serif',
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: 0,
};

function FooterSection() {
  return (
    <footer style={{
      background: "var(--sv-sage)",
      color: "var(--sv-cream-100)",
      padding: "clamp(64px, 9vw, 100px) clamp(24px, 5vw, 48px) 32px",
      position: "relative", overflow: "hidden",
    }}>
      {/* Organic animated blobs.
          Monochromatic sage tones only (no brown / no bamboo bleed) so the
          field stays clean. Each blob morphs its path via SMIL between
          three hand-tuned blob shapes, and CSS transforms drift / rotate the
          parent container so morph + drift run on different clocks. */}
      <div aria-hidden="true" className="shv-footer-blobs">
        <svg className="shv-blob shv-blob--a" viewBox="0 0 400 400" preserveAspectRatio="none">
          <path fill="var(--sv-sage-dark)" fillOpacity="0.75">
            <animate
              attributeName="d"
              dur="22s"
              repeatCount="indefinite"
              calcMode="spline"
              keySplines="0.42 0 0.58 1; 0.42 0 0.58 1; 0.42 0 0.58 1"
              keyTimes="0; 0.33; 0.66; 1"
              values="
                M200,80 C280,60 340,130 350,200 C360,270 290,340 220,340 C150,340 60,290 70,200 C80,110 120,100 200,80 Z;
                M210,70 C300,90 360,160 340,240 C320,320 240,350 170,330 C100,310 50,230 80,150 C110,70 120,50 210,70 Z;
                M190,90 C290,70 360,150 340,230 C320,310 260,330 180,320 C100,310 60,240 80,170 C100,100 90,110 190,90 Z;
                M200,80 C280,60 340,130 350,200 C360,270 290,340 220,340 C150,340 60,290 70,200 C80,110 120,100 200,80 Z
              "
            />
          </path>
        </svg>

        <svg className="shv-blob shv-blob--b" viewBox="0 0 400 400" preserveAspectRatio="none">
          <path fill="var(--sv-sage-light)" fillOpacity="0.55">
            <animate
              attributeName="d"
              dur="28s"
              repeatCount="indefinite"
              calcMode="spline"
              keySplines="0.42 0 0.58 1; 0.42 0 0.58 1; 0.42 0 0.58 1"
              keyTimes="0; 0.33; 0.66; 1"
              values="
                M220,80 C290,100 350,160 340,230 C330,300 250,330 180,320 C110,310 60,250 80,180 C100,110 150,60 220,80 Z;
                M200,100 C290,80 360,140 340,220 C320,300 250,320 180,330 C110,340 80,270 70,200 C60,130 110,80 200,100 Z;
                M230,90 C310,110 350,170 330,240 C310,310 240,340 170,320 C100,300 70,230 90,160 C110,90 160,70 230,90 Z;
                M220,80 C290,100 350,160 340,230 C330,300 250,330 180,320 C110,310 60,250 80,180 C100,110 150,60 220,80 Z
              "
            />
          </path>
        </svg>

        <svg className="shv-blob shv-blob--c" viewBox="0 0 400 400" preserveAspectRatio="none">
          <path fill="var(--sv-sage-dark)" fillOpacity="0.4">
            <animate
              attributeName="d"
              dur="34s"
              repeatCount="indefinite"
              calcMode="spline"
              keySplines="0.42 0 0.58 1; 0.42 0 0.58 1; 0.42 0 0.58 1"
              keyTimes="0; 0.33; 0.66; 1"
              values="
                M200,90 C280,80 340,140 340,210 C340,280 270,330 200,320 C130,310 70,260 80,190 C90,120 130,100 200,90 Z;
                M210,100 C290,90 350,150 330,230 C310,310 230,340 160,320 C90,300 60,240 90,170 C120,100 130,110 210,100 Z;
                M190,80 C270,70 350,130 350,210 C350,290 280,340 200,330 C120,320 60,260 70,190 C80,120 110,90 190,80 Z;
                M200,90 C280,80 340,140 340,210 C340,280 270,330 200,320 C130,310 70,260 80,190 C90,120 130,100 200,90 Z
              "
            />
          </path>
        </svg>
      </div>

      <style>{`
        .shv-footer-blobs {
          position: absolute; inset: 0;
          pointer-events: none;
          overflow: hidden;
          z-index: 0;
        }
        .shv-blob {
          position: absolute;
          display: block;
          will-change: transform;
          filter: blur(6px);
        }
        /* Large dark blob, top-right -- slow counter-clockwise drift. */
        .shv-blob--a {
          top: -160px; right: -180px;
          width: 640px; height: 640px;
          animation: shvBlobDriftA 30s ease-in-out infinite;
        }
        /* Mid light blob, bottom-left -- opposite drift. */
        .shv-blob--b {
          bottom: -200px; left: -160px;
          width: 560px; height: 560px;
          animation: shvBlobDriftB 38s ease-in-out infinite -6s;
        }
        /* Smaller mid-canvas blob -- adds a third, slower rhythm. */
        .shv-blob--c {
          top: 28%; right: 30%;
          width: 360px; height: 360px;
          animation: shvBlobDriftC 44s ease-in-out infinite -12s;
        }
        @keyframes shvBlobDriftA {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg) scale(1); }
          50%      { transform: translate3d(-32px, 26px, 0) rotate(14deg) scale(1.06); }
        }
        @keyframes shvBlobDriftB {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg) scale(1); }
          50%      { transform: translate3d(40px, -28px, 0) rotate(-12deg) scale(1.08); }
        }
        @keyframes shvBlobDriftC {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg) scale(1); }
          50%      { transform: translate3d(-22px, 32px, 0) rotate(20deg) scale(1.04); }
        }
        @media (prefers-reduced-motion: reduce) {
          .shv-blob { animation: none !important; }
          .shv-blob animate { display: none; }
        }
      `}</style>

      <div style={{ maxWidth: 1440, margin: "0 auto", position: "relative", zIndex: 1 }}>

        {/* Top mono index strip -- mirrors the rest of the doc */}
        <div style={{
          ...MONO, fontSize: "0.62rem",
          color: "rgba(250, 250, 248, 0.5)",
          display: "flex", alignItems: "center", gap: 12,
          paddingBottom: 28, marginBottom: 48,
          borderBottom: "1px solid rgba(250, 250, 248, 0.18)",
        }}>
          <span>§ 05 / Outro</span>
          <span style={{ flex: 1, height: 1, background: "rgba(250, 250, 248, 0.18)" }} />
          <span>End of document</span>
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 56,
        }} className="shv-footer-grid">

          {/* Lockup + CTA */}
          <div>
            <img
              src="../../assets/SHAUGHV-Favicon-Light.svg"
              alt="SHAUGHV"
              style={{ height: 44, width: "auto", marginBottom: 24, opacity: 0.94 }}
            />
            <p style={{
              fontFamily: '"Makira", sans-serif', fontSize: 16, lineHeight: 1.6,
              color: "rgba(250, 250, 248, 0.7)", maxWidth: 360, margin: "0 0 28px", fontWeight: 400,
            }}>
              Always down to hear about new projects. Shoot me a message.
            </p>
            <a href="mailto:hey@emmetts.dev"
              style={{
                ...MONO, fontSize: "0.72rem",
                background: "transparent", color: "var(--sv-cream-100)",
                border: "1px solid rgba(250, 250, 248, 0.4)",
                padding: "14px 22px", minHeight: 44,
                display: "inline-flex", alignItems: "center", gap: 10,
                textDecoration: "none",
                transition: "border-color 220ms ease, color 220ms ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--sv-bamboo-light)"; e.currentTarget.style.color = "var(--sv-bamboo-light)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(250, 250, 248, 0.4)"; e.currentTarget.style.color = "var(--sv-cream-100)"; }}
            >
              Email Me
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M5 12h14" /><path d="M13 5l7 7-7 7" /></svg>
            </a>
          </div>

          {/* Connect column */}
          <FooterColumn
            title="Connect"
            items={[
              { name: "GitHub", href: "https://github.com/RealEmmettS" },
              { name: "LinkedIn", href: "https://linkedin.com/in/emmettshaughnessy" },
              { name: "Resume", href: "https://resume.emmetts.dev" },
            ]}
            external
          />

          {/* Navigate column */}
          <FooterColumn
            title="Navigate"
            items={["About", "Projects", "Skills", "Contact"].map((l) => ({
              name: l, href: `#${l.toLowerCase()}`,
            }))}
            scrollTo
          />
        </div>

        {/* Bottom rule + meta.

            ┌─ PRODUCTION-RESPONSIVE NOTE ──────────────────────────────────────┐
            │ This kit uses `flex-wrap: wrap` to handle narrow widths -- items │
            │ wrap to multiple rows but `justify-between` leaves awkward gaps. │
            │ For real responsive code prefer explicit stacking:               │
            │   `flex flex-col sm:flex-row items-center sm:justify-between`    │
            │   `text-center sm:text-left`                                     │
            │ See README "Production implementation notes" for the recipe.     │
            │                                                                  │
            │ ALSO: the `<shaughv-mark>` has `width: 96, height: 96` as INLINE │
            │ styles. The drop-in copies inline styles to the SVG, so the     │
            │ wordmark fits inside a 96x96 square via `preserveAspectRatio`.   │
            │ This WORKS for the kit demo. In production code that uses        │
            │ Tailwind classes (e.g. `h-24 w-24`) instead of inline styles,    │
            │ the drop-in falls back to `auto` width + `100%` height, which    │
            │ produces a ~142x96 SVG that overflows a 96px host horizontally   │
            │ and CLIPS the "V" on the right.                                  │
            │                                                                  │
            │ Production recipe: use `h-16 w-auto` (or similar) so the host    │
            │ shrinks to the wordmark's natural ~1.5:1 aspect ratio.           │
            └──────────────────────────────────────────────────────────────────┘ */}
        <div style={{
          marginTop: 64, paddingTop: 24,
          borderTop: "1px solid rgba(250, 250, 248, 0.18)",
          display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16,
          alignItems: "center",
          ...MONO, fontSize: "0.62rem",
          color: "rgba(250, 250, 248, 0.45)",
        }}>
          <span>&copy; {new Date().getFullYear()} Emmett Shaughnessy</span>
          <shaughv-mark
            data-static
            aria-label="SHAUGHV"
            style={{
              display: "inline-block",
              height: 96,
              width: 96,
              color: "rgba(250, 250, 248, 0.7)",
            }}
          ></shaughv-mark>
          <span>Set in Makira &amp; IBM Plex Mono</span>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, items, external, scrollTo }) {
  return (
    <div>
      <h4 style={{
        ...MAKIRA_HEAD,
        fontWeight: 700, fontSize: 13, lineHeight: 1.2,
        color: "rgba(250, 250, 248, 0.5)", margin: "0 0 22px",
        letterSpacing: "0.05em",
      }}>{title}</h4>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 0 }}>
        {items.map((it, i) => (
          <li key={it.name} style={{
            borderTop: i === 0 ? "1px solid rgba(250, 250, 248, 0.14)" : "none",
            borderBottom: "1px solid rgba(250, 250, 248, 0.14)",
          }}>
            <a
              href={it.href}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              onClick={scrollTo ? (e) => {
                e.preventDefault();
                document.getElementById(it.name.toLowerCase())?.scrollIntoView({ behavior: "smooth" });
              } : undefined}
              style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "11px 0",
                fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
                fontWeight: 500, fontSize: 13, letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "rgba(250, 250, 248, 0.85)",
                textDecoration: "none",
                transition: "color 200ms ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--sv-bamboo-light)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(250, 250, 248, 0.85)")}
            >
              <span>{it.name}</span>
              <span style={{ opacity: 0.5 }}>{external ? "↗" : "→"}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

window.FooterSection = FooterSection;
