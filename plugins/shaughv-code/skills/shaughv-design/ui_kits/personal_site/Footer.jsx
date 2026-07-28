/* global React */

const socialLinks = [
  { name: "GitHub", href: "https://github.com/RealEmmettS" },
  { name: "LinkedIn", href: "https://www.linkedin.com/in/emmettshaughnessy/" },
  { name: "Resume", href: "https://resume.emmetts.dev" },
  { name: "Email", href: "mailto:hey@emmetts.dev" },
];

function Footer() {
  return (
    <footer style={{
      background: "#204F20", color: "#F5E0C5",
      padding: "clamp(64px, 9vw, 120px) clamp(24px, 5vw, 48px)",
      borderTop: "1px solid rgba(245,224,197,0.1)",
    }}>
      <div style={{ maxWidth: 1920, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }} className="shv-footer-grid">
        <div>
          <h2 style={{
            fontFamily: "Makira", fontWeight: 700,
            fontSize: "clamp(40px, 6vw, 88px)", textTransform: "uppercase",
            margin: "0 0 24px", lineHeight: 1,
          }}>Let&rsquo;s Work<br />Together</h2>
          <p style={{
            fontFamily: "Makira", fontSize: 16,
            color: "rgba(245,224,197,0.6)",
            maxWidth: 420, margin: "0 0 32px", lineHeight: 1.6,
          }}>
            Open for freelance opportunities and full-time roles. Creating digital experiences with purpose and precision.
          </p>
          <a href="mailto:hey@emmetts.dev" data-magnetic
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              color: "#FF5E1A", fontFamily: "Makira", fontSize: 13,
              letterSpacing: "0.2em", textTransform: "uppercase",
              textDecoration: "none", fontWeight: 500,
              transition: "color 300ms ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#C2A83E")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#FF5E1A")}
          >
            Get in touch <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M7 17L17 7" /><path d="M8 7h9v9" /></svg>
          </a>
          <p style={{
            marginTop: 64, fontFamily: "Gail Rock", fontSize: 11,
            color: "rgba(245,224,197,0.25)",
            letterSpacing: "0.15em", textTransform: "uppercase",
          }}>&copy; {new Date().getFullYear()} Emmett Shaughnessy.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 14 }}>
            {socialLinks.map((l) => (
              <a key={l.name} href={l.href} target="_blank" rel="noopener noreferrer" data-magnetic
                style={{
                  fontFamily: "Makira", fontSize: 22, color: "#F5E0C5",
                  textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8,
                  transition: "color 300ms ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#FF5E1A")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#F5E0C5")}
              >
                {l.name}
              </a>
            ))}
          </div>
          <img src="../../assets/SHAUGHV-Orange.png" alt="" aria-hidden="true"
            style={{ height: 64, width: "auto", opacity: 0.4, marginTop: 24 }} />
        </div>
      </div>
    </footer>
  );
}

window.Footer = Footer;
