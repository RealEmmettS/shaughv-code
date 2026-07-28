/* global React */
const { useState } = React;

function ProjectRow({ project, index, hovered, setHover }) {
  const isHover = hovered === index;
  return (
    <div
      onMouseEnter={() => setHover(index)}
      onMouseLeave={() => setHover(null)}
      style={{
        borderBottom: "1px solid #E6E6E6",
        padding: "clamp(40px, 4vw, 64px) clamp(16px, 2vw, 24px)",
        display: "grid",
        gridTemplateColumns: "32px 1fr 1.4fr 56px",
        gap: 32,
        alignItems: "center",
        background: isHover ? "#E6E6E6" : "transparent",
        color: isHover ? "#090909" : "#E6E6E6",
        transition: "background 500ms ease, color 500ms ease",
        position: "relative", overflow: "hidden",
      }}
    >
      <div style={{ fontFamily: "Gail Rock", fontSize: 12, opacity: isHover ? 0.85 : 0.5 }}>
        00{index + 1}
      </div>
      <div>
        <h3 data-magnetic style={{
          fontFamily: "Makira", fontWeight: 700,
          fontSize: "clamp(24px, 3vw, 40px)", textTransform: "uppercase",
          margin: "0 0 8px", lineHeight: 1.05,
        }}>{project.title}</h3>
        <p style={{
          fontFamily: "Gail Rock", fontSize: 12,
          letterSpacing: "0.15em", textTransform: "uppercase",
          opacity: 0.6, margin: "0 0 16px",
        }}>{project.category} &mdash; {project.year}</p>
        <p style={{
          fontFamily: "Makira", fontSize: 15, lineHeight: 1.6,
          opacity: 0.85, margin: "0 0 20px", maxWidth: 420,
        }}>{project.description}</p>
        <span style={{
          fontFamily: "Gail Rock", fontSize: 11,
          border: "1px solid currentColor", padding: "5px 12px",
          borderRadius: 9999, display: "inline-block", opacity: 0.7,
        }}>{project.tech}</span>
      </div>
      <div style={{
        height: 220, width: "100%",
        border: isHover ? "1px solid transparent" : "1px solid rgba(230,230,230,0.2)",
        background:
          "repeating-linear-gradient(135deg, " +
          (isHover ? "rgba(9,9,9,0.06) 0 12px, rgba(9,9,9,0.02) 12px 24px" : "rgba(230,230,230,0.04) 0 12px, rgba(230,230,230,0.02) 12px 24px") +
          ")",
        position: "relative", overflow: "hidden",
        transition: "transform 700ms ease",
        transform: isHover ? "scale(1.05)" : "scale(1)",
        filter: isHover ? "none" : "grayscale(1)",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "Gail Rock", fontSize: 12, opacity: 0.6,
          letterSpacing: "0.2em", textTransform: "uppercase",
        }}>{project.title}</div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        {project.link && (
          <a href={project.link} target="_blank" rel="noopener noreferrer" data-magnetic
            style={{
              width: 56, height: 56,
              border: "1px solid currentColor", borderRadius: 9999,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              color: "inherit", textDecoration: "none",
              transition: "background 300ms ease, color 300ms ease, border-color 300ms ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#FF5E1A";
              e.currentTarget.style.borderColor = "#FF5E1A";
              e.currentTarget.style.color = "#E6E6E6";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "currentColor";
              e.currentTarget.style.color = "inherit";
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M7 17L17 7" /><path d="M8 7h9v9" /></svg>
          </a>
        )}
      </div>
    </div>
  );
}

function Projects({ setRoute }) {
  const [hovered, setHover] = useState(null);
  const projects = window.PROJECTS || [];
  const total = String(projects.length).padStart(3, "0");

  return (
    <section id="projects" style={{
      padding: "clamp(80px, 11vw, 160px) clamp(24px, 5vw, 48px)",
      maxWidth: 1920, margin: "0 auto",
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "flex-end",
        marginBottom: 80, paddingBottom: 24, borderBottom: "1px solid #E6E6E6",
      }}>
        <h2 style={{
          fontFamily: "Makira", fontWeight: 700,
          fontSize: "clamp(48px, 7vw, 112px)", textTransform: "uppercase",
          color: "#E6E6E6", lineHeight: 1, margin: 0,
        }}>Selected<br />Works</h2>
        <div style={{
          fontFamily: "Gail Rock", fontSize: 12,
          color: "rgba(230,230,230,0.6)",
          letterSpacing: "0.2em", textTransform: "uppercase",
        }}>Index 001 &mdash; {total}</div>
      </div>

      <div style={{ borderTop: "1px solid #E6E6E6" }}>
        {projects.map((p, i) => <ProjectRow key={i} project={p} index={i} hovered={hovered} setHover={setHover} />)}
      </div>

      <div style={{ marginTop: 48, display: "flex", justifyContent: "flex-end" }}>
        <a
          href="#works"
          onClick={(e) => { e.preventDefault(); setRoute("works"); window.scrollTo({ top: 0 }); }}
          data-magnetic
          style={{
            display: "inline-flex", alignItems: "center", gap: 12,
            color: "#FF5E1A", fontFamily: "Makira", fontSize: 12,
            letterSpacing: "0.2em", textTransform: "uppercase",
            textDecoration: "none", transition: "color 300ms ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#C2A83E")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#FF5E1A")}
        >
          See more works
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M5 12h14" /><path d="M12 5l7 7-7 7" /></svg>
        </a>
      </div>
    </section>
  );
}

window.Projects = Projects;
