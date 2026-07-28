/* global React */

const MONO_LABEL = {
  fontFamily: '"Gail Rock", ui-monospace, monospace',
  fontWeight: 600,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
};

const MAKIRA_HEAD = {
  fontFamily: '"Makira", sans-serif',
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: 0,
  color: "var(--fg)",
};

function AboutSection() {
  return (
    <section id="about" style={{
      padding: "clamp(80px, 11vw, 140px) clamp(24px, 5vw, 48px)",
      maxWidth: 1440, margin: "0 auto",
      position: "relative",
    }}>
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 64, alignItems: "flex-start",
      }} className="shv-grid">

        {/* Heading column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Mono section index */}
          <div style={{
            ...MONO_LABEL, fontSize: "0.66rem",
            color: "rgba(92, 84, 70, 0.58)",
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <span>§ 01</span>
            <span style={{ flex: 1, height: 1, background: "rgba(92, 84, 70, 0.22)" }} />
          </div>
          <p style={{ ...MONO_LABEL, fontSize: "0.74rem", color: "var(--accent)", margin: 0 }}>About</p>
          <h2 style={{
            ...MAKIRA_HEAD,
            fontSize: "clamp(40px, 5.5vw, 80px)", lineHeight: 0.96,
            margin: 0,
          }}>The work,<br />the why.</h2>
        </div>

        {/* Body column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <p style={{
            fontFamily: '"Makira", sans-serif', fontSize: 19, lineHeight: 1.55,
            color: "var(--fg)", margin: 0, fontWeight: 400,
          }}>
            Web developer and designer passionate about creating{" "}
            <em style={{ color: "var(--accent)", fontStyle: "italic", fontWeight: 600 }}>functional</em>,{" "}
            <em style={{ color: "var(--accent)", fontStyle: "italic", fontWeight: 600 }}>minimalist</em>, and{" "}
            <em style={{ color: "var(--accent)", fontStyle: "italic", fontWeight: 600 }}>interactive</em>{" "}
            digital experiences.
          </p>
          <p style={{
            fontFamily: '"Makira", sans-serif', fontSize: 17, lineHeight: 1.7,
            color: "var(--fg-muted)", margin: 0, fontWeight: 400,
          }}>
            I like keeping things simple and making sure they actually work for the people using them. Clean design, solid code, nothing too complicated. That&rsquo;s pretty much my whole thing.
          </p>

          {/* Principle list -- structural, mono-stamped */}
          <ul style={{
            listStyle: "none", padding: 0, margin: "12px 0 0",
            display: "grid", gap: 0,
            borderTop: "1px solid rgba(92, 84, 70, 0.18)",
          }}>
            {[
              { tag: "P · 01", text: "Less but better — ship intentional interfaces." },
              { tag: "P · 02", text: "Prototype, validate, and refine quickly." },
              { tag: "P · 03", text: "Accessibility and performance as defaults, not afterthoughts." },
            ].map((p) => (
              <li key={p.tag} style={{
                display: "grid", gridTemplateColumns: "72px 1fr", gap: 20,
                padding: "16px 0",
                borderBottom: "1px solid rgba(92, 84, 70, 0.18)",
                alignItems: "baseline",
              }}>
                <span style={{ ...MONO_LABEL, fontSize: "0.62rem", color: "var(--accent)" }}>{p.tag}</span>
                <span style={{
                  fontFamily: '"Makira", sans-serif', fontSize: 15.5, lineHeight: 1.55,
                  color: "var(--fg)", fontWeight: 400,
                }}>{p.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

window.AboutSection = AboutSection;
