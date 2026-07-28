/* global React */
const { useState } = React;

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

const PROJECTS = [
  { index: "001", title: "QubeTX Machine Reports", category: "Developer Tools", year: "2026", description: "Cross-platform machine reporting CLI with Unicode table output, JSON mode, and self-installing shell integration.", tags: ["Rust", "Shell", "PowerShell"], url: "https://reports.qubetx.com" },
  { index: "002", title: "Leon Lee Dorsey", category: "Portfolio", year: "2023", description: "Personal website for jazz musician Leon Lee Dorsey.", tags: ["HTML", "CSS", "JS"], url: "https://leonleedorsey.com" },
  { index: "003", title: "MAGZ Marketing", category: "Marketing", year: "2025", description: "Marketing platform at the intersection of AI, athlete influence, and social distribution.", tags: ["HTML", "CSS", "Bootstrap"], url: "https://magzmarketing.com" },
];

function ProjectCard({ p, isHover, onHover, onLeave }) {
  return (
    <article
      onMouseEnter={onHover} onMouseLeave={onLeave}
      style={{
        position: "relative",
        display: "grid", gridTemplateColumns: "72px 1fr 200px",
        gap: 32, alignItems: "center",
        padding: "32px 12px",
        borderTop: "1px solid rgba(92, 84, 70, 0.18)",
        background: isHover ? "rgba(91, 138, 91, 0.04)" : "transparent",
        transition: "background 220ms ease",
      }}
    >
      {/* Mono index */}
      <div style={{
        ...MONO, fontSize: "0.66rem",
        color: isHover ? "var(--accent)" : "rgba(92, 84, 70, 0.58)",
        transition: "color 220ms ease",
      }}>
        {p.index} /
      </div>

      {/* Title + meta + description + tags */}
      <div style={{ minWidth: 0 }}>
        <h3 style={{
          ...MAKIRA_HEAD,
          fontSize: "clamp(24px, 2.8vw, 38px)", lineHeight: 1.05,
          margin: "0 0 10px",
          color: isHover ? "var(--accent)" : "var(--fg)",
          transition: "color 220ms ease",
        }}>{p.title}</h3>

        <p style={{
          ...MONO, fontSize: "0.66rem",
          color: "rgba(92, 84, 70, 0.58)",
          margin: "0 0 14px",
          display: "inline-flex", alignItems: "center", gap: 10,
        }}>
          <span>{p.category}</span>
          <span style={{ width: 24, height: 1, background: "currentColor", opacity: 0.4 }} />
          <span>{p.year}</span>
        </p>

        <p style={{
          fontFamily: '"Makira", sans-serif', fontSize: 14.5, lineHeight: 1.6,
          color: "var(--fg-muted)", margin: "0 0 14px", maxWidth: 540, fontWeight: 400,
        }}>{p.description}</p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {p.tags.map((t) => (
            <span key={t} style={{
              fontFamily: '"Gail Rock", ui-monospace, monospace',
              fontWeight: 500, fontSize: 11,
              letterSpacing: "0.06em",
              border: "1px solid rgba(92, 84, 70, 0.30)",
              padding: "3px 10px",
              color: "var(--fg-muted)",
              background: "rgba(250, 250, 248, 0.6)",
            }}>{t}</span>
          ))}
        </div>
      </div>

      {/* View live link */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <a href={p.url} target="_blank" rel="noopener noreferrer"
          style={{
            ...MONO, fontSize: "0.7rem",
            display: "inline-flex", alignItems: "center", gap: 10,
            color: isHover ? "var(--accent)" : "var(--fg)",
            textDecoration: "none",
            paddingBottom: 4,
            borderBottom: `1px solid ${isHover ? "var(--accent)" : "var(--fg)"}`,
            transition: "color 220ms ease, border-color 220ms ease",
          }}
        >
          View Live
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M7 17L17 7" /><path d="M8 7h9v9" /></svg>
        </a>
      </div>
    </article>
  );
}

function ProjectsSection() {
  const [hover, setHover] = useState(null);
  return (
    <section id="projects" style={{
      padding: "clamp(80px, 11vw, 140px) clamp(24px, 5vw, 48px)",
      maxWidth: 1440, margin: "0 auto",
      position: "relative",
    }}>
      <window.BauhausCircle size={280} color="var(--sv-bamboo)" filled opacity={0.08}
        style={{ position: "absolute", top: 80, right: 32 }} />

      {/* Section header -- mono index strip + display heading */}
      <div style={{ marginBottom: 56 }}>
        <div style={{
          ...MONO, fontSize: "0.66rem",
          color: "rgba(92, 84, 70, 0.58)",
          display: "flex", alignItems: "center", gap: 12, marginBottom: 18,
        }}>
          <span>§ 02</span>
          <span style={{ flex: 1, height: 1, background: "rgba(92, 84, 70, 0.22)" }} />
          <span>Index 001 — {String(PROJECTS.length).padStart(3, "0")}</span>
        </div>

        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 24,
          flexWrap: "wrap",
        }}>
          <div>
            <p style={{ ...MONO, fontSize: "0.74rem", color: "var(--accent)", margin: "0 0 12px" }}>Selected Work</p>
            <h2 style={{
              ...MAKIRA_HEAD,
              fontSize: "clamp(40px, 5.5vw, 80px)", lineHeight: 0.96,
              margin: 0,
            }}>Things I&rsquo;ve<br />shipped.</h2>
          </div>
        </div>
      </div>

      {/* Project rows */}
      <div style={{ borderBottom: "1px solid rgba(92, 84, 70, 0.18)" }}>
        {PROJECTS.map((p, i) => (
          <ProjectCard key={p.index} p={p}
            isHover={hover === i}
            onHover={() => setHover(i)} onLeave={() => setHover(null)}
          />
        ))}
      </div>
    </section>
  );
}

window.ProjectsSection = ProjectsSection;
