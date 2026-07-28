/* global React */

const MONO = {
  fontFamily: '"Gail Rock", ui-monospace, monospace',
  fontWeight: 600,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
};

const MAKIRA_DISPLAY = {
  fontFamily: '"Makira", sans-serif',
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: 0,
  color: "var(--fg)",
};

function HeroSection() {
  return (
    <section id="top" style={{
      position: "relative", minHeight: "100vh",
      padding: "140px clamp(24px, 5vw, 48px) 88px",
      overflow: "hidden",
      display: "flex", alignItems: "center",
    }}>
      {/* Restrained Bauhaus geometry -- one big sage ring, one bamboo line. */}
      <window.BauhausCircle size={460} color="var(--accent)" opacity={0.18}
        style={{ position: "absolute", top: -160, right: -160 }} />
      <window.BauhausLine length="38%" thickness={1} color="var(--fg)" opacity={0.22}
        style={{ position: "absolute", top: "44%", left: 0 }} />

      <div style={{
        position: "relative", maxWidth: 1440, margin: "0 auto", width: "100%",
        display: "grid", gridTemplateColumns: "1.15fr 0.85fr",
        gap: 56, alignItems: "stretch",
      }} className="shv-grid">

        {/* LEFT: type column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 28, justifyContent: "center" }}>
          {/* Mono eyebrow with sage status dot */}
          <p style={{
            ...MONO, fontSize: "0.74rem",
            color: "var(--accent)", margin: 0,
            display: "inline-flex", alignItems: "center", gap: 10,
          }}>
            <span aria-hidden="true" style={{
              width: 8, height: 8, borderRadius: "50%",
              background: "var(--accent)",
              boxShadow: "0 0 0 3px rgba(91, 138, 91, 0.18)",
            }} />
            Digital Craftsman / Available May 2026
          </p>

          {/* Display name -- Makira, not Unbounded. Uppercase, tight leading,
              letter-spacing 0 to match codebase h1. */}
          <h1 style={{
            ...MAKIRA_DISPLAY,
            fontSize: "clamp(56px, 9vw, 144px)", lineHeight: 0.92,
            margin: 0,
          }}>
            Emmett<br />
            Shaughnessy
          </h1>

          <p style={{
            fontFamily: '"Makira", sans-serif', fontSize: 18, lineHeight: 1.6,
            color: "var(--fg-muted)", maxWidth: 520, margin: 0, fontWeight: 400,
          }}>
            I make websites that look good and actually work. Currently hunting for my next project.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 12, alignItems: "center" }}>
            <a href="#projects"
              onClick={(e) => { e.preventDefault(); document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" }); }}
              style={{
                ...MONO, fontSize: "0.72rem",
                background: "var(--accent)", color: "var(--sv-cream-100)",
                border: "1px solid var(--sv-sage-dark)",
                padding: "14px 22px", minHeight: 44,
                display: "inline-flex", alignItems: "center", gap: 10,
                textDecoration: "none",
                transition: "background 180ms ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--sv-sage-dark)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent)")}
            >
              View Work
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M5 12h14" /><path d="M13 5l7 7-7 7" /></svg>
            </a>
            <a href="#contact"
              onClick={(e) => { e.preventDefault(); document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }); }}
              style={{
                ...MONO, fontSize: "0.72rem",
                background: "transparent", color: "var(--fg)",
                border: "1px solid var(--fg)",
                padding: "14px 22px", minHeight: 44,
                display: "inline-flex", alignItems: "center",
                textDecoration: "none",
                transition: "color 180ms ease, border-color 180ms ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--fg)"; e.currentTarget.style.color = "var(--fg)"; }}
            >Get in Touch</a>
          </div>

          {/* Mono index stamp -- ties back to codebase's signal-stats grid. */}
          <div style={{
            marginTop: 36, display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            border: "1px solid var(--fg)",
            background: "rgba(250, 250, 248, 0.82)",
            maxWidth: 520,
          }}>
            {[
              { label: "Index", value: "001 / 027" },
              { label: "Locale", value: "Atlanta, GA" },
              { label: "Status", value: "Open" },
            ].map((s, i) => (
              <div key={s.label} style={{
                padding: "14px 16px",
                borderLeft: i === 0 ? "none" : "1px solid rgba(92, 84, 70, 0.18)",
              }}>
                <div style={{ ...MONO, fontSize: "0.6rem", color: "rgba(92, 84, 70, 0.58)", marginBottom: 6 }}>{s.label}</div>
                <div style={{ ...MAKIRA_DISPLAY, fontSize: 14, lineHeight: 1.1 }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: figurine sits directly on the page. Transparent PNG,
            no plate, no frame, no wash -- it belongs to the page background,
            not its own container. Figurines are OPTIONAL across the brand;
            skip them on surfaces that don't call for figure illustration.

            ┌─ PRODUCTION-RESPONSIVE NOTE ────────────────────────────────────┐
            │ The `transform: scale(2)` below is the visual intent for the    │
            │ desktop splash at ~1440 px. DO NOT translate it literally to a  │
            │ responsive codebase -- at a 375 px portrait viewport, scaling   │
            │ a full-width image 2x overflows the entire screen.              │
            │                                                                 │
            │ For real responsive code, drop the scale and use `max-width`    │
            │ caps with stack/hide rules:                                     │
            │   - portrait mobile  : hide entirely (no room)                  │
            │   - tablet (md--lg)  : figurine BELOW text via source order     │
            │   - desktop (lg+)    : figurine RIGHT of text via grid          │
            │ See README "Production implementation notes" for the recipe.    │
            └─────────────────────────────────────────────────────────────────┘ */}
        <div style={{
          position: "relative",
          display: "flex", alignItems: "flex-end", justifyContent: "center",
          minHeight: 520,
        }}>
          <img
            src="../../assets/figurines/transparent/figurine-header.webp"
            alt="Figurine of Shaughv typing at a vintage Mac on a bamboo desk."
            style={{
              width: "100%", maxWidth: 520,
              height: "auto",
              objectFit: "contain",
              transform: "scale(2)",
              transformOrigin: "bottom right",
              pointerEvents: "none",
            }}
          />
        </div>
      </div>
    </section>
  );
}

window.HeroSection = HeroSection;
