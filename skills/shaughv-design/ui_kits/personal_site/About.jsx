/* global React */

function About() {
  return (
    <section id="about" style={{
      padding: "clamp(80px, 11vw, 160px) clamp(24px, 5vw, 48px)",
      maxWidth: 1920, margin: "0 auto",
      position: "relative", overflow: "hidden", zIndex: 10,
    }}>
      <div style={{
        position: "absolute", inset: 0, opacity: 0.85, pointerEvents: "none",
        background: "radial-gradient(circle at 12% 20%, rgba(255,94,26,0.12), transparent 42%), radial-gradient(circle at 85% 12%, rgba(32,79,32,0.08), transparent 40%), radial-gradient(circle at 45% 85%, rgba(255,94,26,0.08), transparent 45%)",
      }} />
      <div style={{ position: "relative", display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: 48 }} className="shv-grid">
        <div style={{
          position: "relative", border: "1px solid rgba(230,230,230,0.18)",
          background: "#0e0e0e", padding: 48,
          display: "flex", flexDirection: "column", gap: 32,
        }}>
          <div style={{
            position: "absolute", right: -80, top: -80, height: 240, width: 240,
            borderRadius: "50%", background: "rgba(230,230,230,0.04)", filter: "blur(60px)", pointerEvents: "none",
          }} />
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{
              fontFamily: "IBM Plex Mono", fontSize: 12, color: "#FF5E1A",
              letterSpacing: "0.2em", textTransform: "uppercase",
            }}>About</span>
            <span style={{ height: 1, flex: 1, background: "rgba(230,230,230,0.2)" }} />
          </div>
          <p style={{
            fontFamily: "Unbounded", fontWeight: 500, fontSize: "clamp(28px, 3vw, 44px)",
            lineHeight: 1.15, color: "#E6E6E6", margin: 0,
          }}>
            I am a web developer and designer with a passion for creating <em style={{ fontStyle: "italic", color: "#FF5E1A" }}>functional</em>, <em style={{ fontStyle: "italic", color: "#FF5E1A" }}>minimalist</em>, and <em style={{ fontStyle: "italic", color: "#FF5E1A" }}>interactive</em> digital experiences.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {[
              "Next.js builds rooted in interaction design",
              "Bauhaus-inspired systems thinking",
              "Motion used for clarity, not clutter",
            ].map((h) => (
              <span key={h} style={{
                fontFamily: "IBM Plex Mono", fontSize: 11,
                border: "1px solid rgba(230,230,230,0.3)", padding: "8px 14px",
                borderRadius: 9999, color: "rgba(230,230,230,0.8)",
                textTransform: "uppercase", letterSpacing: "0.05em",
              }}>{h}</span>
            ))}
          </div>
        </div>

        <div style={{
          position: "relative", border: "1px solid rgba(230,230,230,0.18)",
          background: "#0e0e0e", padding: 48,
          display: "flex", flexDirection: "column", gap: 32,
        }}>
          <div style={{
            position: "absolute", left: -80, bottom: -80, height: 240, width: 240,
            borderRadius: "50%", background: "rgba(255,94,26,0.06)", filter: "blur(60px)", pointerEvents: "none",
          }} />
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ height: 1, flex: 1, background: "rgba(230,230,230,0.2)" }} />
            <span style={{
              fontFamily: "IBM Plex Mono", fontSize: 12, color: "#FF5E1A",
              letterSpacing: "0.2em", textTransform: "uppercase",
            }}>Philosophy</span>
          </div>
          <p style={{
            fontFamily: "Unbounded", fontWeight: 500, fontSize: "clamp(24px, 2.6vw, 38px)",
            lineHeight: 1.15, color: "#E6E6E6", margin: 0,
          }}>
            My work is driven by a commitment to precision, usability, and the belief that less is often better.
          </p>
          <div style={{ display: "grid", gap: 14 }}>
            {[
              "Less but better — ship intentional interfaces",
              "Prototype, validate, and refine quickly",
              "Accessibility and performance as defaults",
              "Momentum through clear, opinionated process",
            ].map((p) => (
              <div key={p} style={{ display: "flex", alignItems: "baseline", gap: 12, color: "rgba(230,230,230,0.85)" }}>
                <span style={{ height: 6, width: 6, borderRadius: "50%", background: "#FF5E1A", flex: "0 0 auto" }} />
                <span style={{ fontFamily: "Makira", fontSize: 17, lineHeight: 1.6 }}>{p}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

window.About = About;
