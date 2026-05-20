/* global React */

const SKILL_GROUPS = [
  { category: "Languages", items: ["TypeScript/HTML/CSS", "JavaScript", "Python", "Swift", "SQL"] },
  { category: "Frameworks", items: ["React", "Next.js", "Astro", "Tailwind CSS", "Framer Motion"] },
  { category: "Tools", items: ["Git", "Claude Code/Codex", "VS Code", "PostgreSQL", "Vercel"] },
  { category: "Design", items: ["UI/UX", "Wireframing", "Prototyping", "Responsive Design", "Accessibility"] },
];

function Skills() {
  return (
    <section id="skills" style={{
      padding: "clamp(64px, 9vw, 120px) clamp(24px, 5vw, 48px)",
      maxWidth: 1920, margin: "0 auto",
      borderBottom: "1px solid #E6E6E6",
    }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 48 }} className="shv-skills-grid">
        {SKILL_GROUPS.map((group) => (
          <div key={group.category} style={{ borderLeft: "2px solid #FF5E1A", paddingLeft: 24 }}>
            <h3 style={{
              fontFamily: "Unbounded", fontWeight: 600, fontSize: 18,
              color: "#FF5E1A", textTransform: "uppercase",
              margin: "0 0 20px",
            }}>{group.category}</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
              {group.items.map((it) => (
                <li key={it} style={{
                  fontFamily: "IBM Plex Mono", fontSize: 13,
                  color: "rgba(230,230,230,0.8)",
                  letterSpacing: "0.06em", textTransform: "uppercase",
                }}>{it}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

window.Skills = Skills;
