/* global React, lucide */
const { useState, useEffect, useRef } = React;

const navLinks = [
  { name: "About", href: "#about" },
  { name: "Projects", href: "#projects" },
  { name: "All Works", href: "#works" },
  { name: "Skills", href: "#skills" },
  { name: "Contact", href: "#contact" },
];

function Icon({ name, size = 16, ...rest }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current && window.lucide) window.lucide.createIcons({ icons: window.lucide.icons });
  }, []);
  return <i ref={ref} data-lucide={name} style={{ width: size, height: size }} {...rest} />;
}

function Navbar({ route, setRoute }) {
  const [open, setOpen] = useState(false);

  const go = (href) => (e) => {
    e.preventDefault();
    setOpen(false);
    if (href === "#works") return setRoute("works");
    setRoute("home");
    requestAnimationFrame(() => {
      const id = href.replace("#", "");
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <header
      className={`shv-navbar ${open ? "is-open" : ""}`}
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        color: "#FFFFFF",
        padding: "24px clamp(24px, 5vw, 48px)",
        mixBlendMode: open ? "normal" : "difference",
      }}
    >
      <div style={{ maxWidth: 1920, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <a href="#top" onClick={go("#top")} aria-label="SHAUGHV - Home" data-magnetic style={{ display: "block" }}>
          <div style={{
            fontFamily: "Unbounded", fontWeight: 900, fontSize: 22, letterSpacing: "0.02em",
            color: "#FFFFFF", textTransform: "uppercase",
          }}>
            SHAUGHV
          </div>
        </a>
        <nav style={{ display: "flex", gap: 32, alignItems: "center" }} className="shv-nav-desktop">
          {navLinks.map((l) => (
            <a
              key={l.name}
              href={l.href}
              onClick={go(l.href)}
              data-magnetic
              style={{
                fontFamily: "Makira", fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase",
                fontWeight: 500, color: "#FFFFFF", textDecoration: "none",
                transition: "color 200ms ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#FF5E1A")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#FFFFFF")}
            >
              {l.name}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}

window.Navbar = Navbar;
window.SHVIcon = Icon;
