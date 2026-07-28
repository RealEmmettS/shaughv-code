/* global React */

const MONO = {
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

const SKILL_GROUPS = [
  { category: "Languages", items: ["TypeScript", "JavaScript", "Python", "HTML/CSS", "SQL"] },
  { category: "Frameworks", items: ["React", "Next.js", "Astro", "Tailwind CSS", "Framer Motion"] },
  { category: "Tools", items: ["Git", "Figma", "VS Code", "PostgreSQL", "Vercel"] },
  { category: "Design", items: ["UI/UX", "Wireframing", "Prototyping", "Responsive", "Accessibility"] },
];

const STRIPES = ["var(--accent)", "var(--sv-bamboo-dark)", "var(--sv-bauhaus-red)", "var(--sv-bauhaus-blue)"];

function SkillsSection() {
  return (
    <section id="skills" style={{
      padding: "clamp(80px, 11vw, 140px) clamp(24px, 5vw, 48px)",
      background: "var(--sv-cream-300)",
      borderTop: "1px solid rgba(92, 84, 70, 0.18)",
      borderBottom: "1px solid rgba(92, 84, 70, 0.18)",
    }}>
      <div style={{ maxWidth: 1440, margin: "0 auto" }}>

        {/* Section index */}
        <div style={{
          ...MONO, fontSize: "0.66rem",
          color: "rgba(92, 84, 70, 0.58)",
          display: "flex", alignItems: "center", gap: 12, marginBottom: 18,
        }}>
          <span>§ 03</span>
          <span style={{ flex: 1, height: 1, background: "rgba(92, 84, 70, 0.28)" }} />
          <span>{SKILL_GROUPS.length} Groups</span>
        </div>

        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "flex-end",
          marginBottom: 56, gap: 24, flexWrap: "wrap",
        }}>
          <div>
            <p style={{ ...MONO, fontSize: "0.74rem", color: "var(--accent)", margin: "0 0 12px" }}>Capability</p>
            <h2 style={{
              ...MAKIRA_HEAD,
              fontSize: "clamp(40px, 5.5vw, 80px)", lineHeight: 0.96,
              margin: 0,
            }}>Skills &amp;<br />Tooling.</h2>
          </div>
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0,
          borderTop: "1px solid rgba(92, 84, 70, 0.22)",
          borderLeft: "1px solid rgba(92, 84, 70, 0.22)",
        }} className="shv-skills-grid">
          {SKILL_GROUPS.map((g, i) => (
            <div key={g.category} style={{
              borderRight: "1px solid rgba(92, 84, 70, 0.22)",
              borderBottom: "1px solid rgba(92, 84, 70, 0.22)",
              padding: "28px 24px 32px",
              background: "rgba(250, 250, 248, 0.5)",
              position: "relative",
            }}>
              {/* Color stripe header */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0,
                height: 4, background: STRIPES[i % STRIPES.length],
              }} />

              <div style={{
                ...MONO, fontSize: "0.6rem",
                color: "rgba(92, 84, 70, 0.58)",
                marginBottom: 10,
              }}>{String(i + 1).padStart(2, "0")} / Group</div>

              <h3 style={{
                ...MAKIRA_HEAD, fontWeight: 700,
                fontSize: 17, lineHeight: 1.2,
                margin: "0 0 22px", letterSpacing: 0,
              }}>{g.category}</h3>

              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 0 }}>
                {g.items.map((it, j) => (
                  <li key={it} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "9px 0",
                    borderTop: j === 0 ? "1px solid rgba(92, 84, 70, 0.14)" : "none",
                    borderBottom: "1px solid rgba(92, 84, 70, 0.14)",
                  }}>
                    <span style={{
                      ...MONO, fontWeight: 500, fontSize: "0.6rem",
                      color: "rgba(92, 84, 70, 0.45)", letterSpacing: "0.12em",
                      minWidth: 22,
                    }}>{String(j + 1).padStart(2, "0")}</span>
                    <span style={{
                      fontFamily: '"Gail Rock", ui-monospace, monospace',
                      fontSize: 12.5, fontWeight: 500, letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      color: "var(--fg)",
                    }}>{it}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

window.SkillsSection = SkillsSection;
