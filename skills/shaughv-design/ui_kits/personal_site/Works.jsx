/* global React */
const { useState, useEffect, useMemo, useRef } = React;

function CountUp({ to, pad = 0, dur = 1400 }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const tick = (t) => {
      const p = Math.min((t - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      setN(Math.round(eased * to));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [to, dur]);
  return <span>{String(n).padStart(pad, "0")}</span>;
}

function Works({ setRoute }) {
  const works = window.WORKS || [];
  const FILTERS = window.FILTER_CATEGORIES || [];
  const [active, setActive] = useState("all");
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const c = { all: works.length };
    works.forEach((w) => { c[w.category] = (c[w.category] || 0) + 1; });
    return c;
  }, [works]);

  const filtered = useMemo(() => {
    return works.filter((w) => {
      if (active !== "all" && w.category !== active) return false;
      if (!query) return true;
      const haystack = [w.name, w.domain, w.url, w.description, w.tech, w.year, w.category].join(" ").toLowerCase();
      return query.toLowerCase().split(/\s+/).every((tok) => haystack.includes(tok));
    });
  }, [works, active, query]);

  return (
    <div>
      {/* WorksHero */}
      <section style={{
        position: "relative", padding: "144px clamp(24px, 5vw, 48px) 64px",
        maxWidth: 1920, margin: "0 auto",
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{
            display: "flex", justifyContent: "space-between",
            fontFamily: "Gail Rock", fontSize: 12,
            letterSpacing: "0.18em", textTransform: "uppercase",
          }}>
            <a href="#projects" onClick={(e) => { e.preventDefault(); setRoute("home"); requestAnimationFrame(() => document.getElementById("projects")?.scrollIntoView()); }} data-magnetic
              style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "rgba(230,230,230,0.7)", textDecoration: "none", transition: "color 200ms" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#FF5E1A")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(230,230,230,0.7)")}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>
              Back to Selected
            </a>
            <span style={{ color: "#FF5E1A" }}>Index 001 &mdash; {String(works.length).padStart(3, "0")}</span>
          </div>

          <div style={{
            display: "grid", gridTemplateColumns: "9fr 3fr", gap: 32,
            paddingTop: 24, borderTop: "1px solid #E6E6E6",
            alignItems: "flex-end",
          }} className="shv-works-hero-grid">
            <h1 style={{
              fontFamily: "Makira", fontWeight: 800,
              fontSize: "clamp(48px, 10vw, 176px)", lineHeight: 0.88,
              textTransform: "uppercase", color: "#E6E6E6", margin: 0,
              letterSpacing: "-0.02em",
            }}>
              Every<br />
              <span style={{ color: "#FF5E1A" }}>/</span>thing<br />
              Shipped<span style={{ color: "#FF5E1A" }}>.</span>
            </h1>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
              <span style={{
                fontFamily: "Makira", fontWeight: 700,
                fontSize: "clamp(48px, 5vw, 96px)", color: "#E6E6E6",
                fontVariantNumeric: "tabular-nums",
              }}><CountUp to={works.length} pad={3} /></span>
              <span style={{
                fontFamily: "Gail Rock", fontSize: 11,
                letterSpacing: "0.18em", textTransform: "uppercase",
                color: "rgba(230,230,230,0.6)",
              }}>Properties in orbit</span>
            </div>
          </div>

          <p style={{
            fontFamily: "Makira", fontSize: 17, lineHeight: 1.6,
            color: "rgba(230,230,230,0.8)", maxWidth: 640,
            marginTop: 16,
          }}>
            A full archive of domains, subdomains, and shipped apps. The short list lives on the home page; this is the long list.
          </p>
        </div>

        <div style={{
          marginTop: 64,
          borderTop: "1px solid #E6E6E6",
          borderBottom: "1px solid #E6E6E6",
          padding: "16px 0", overflow: "hidden",
        }}>
          <div style={{
            display: "flex", whiteSpace: "nowrap", gap: 56,
            animation: "shv-works-ticker 50s linear infinite",
            fontFamily: "Makira", fontWeight: 600, fontSize: 28,
            textTransform: "uppercase", color: "#E6E6E6",
          }}>
            {[...works, ...works].map((w, i) => (
              <span key={`${w.id}-${i}`} style={{ display: "inline-flex", alignItems: "center", gap: 56 }}>
                <span>{w.domain}</span>
                <span style={{ color: "#FF5E1A" }}>◆</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Filter bar */}
      <div style={{
        position: "sticky", top: 80, zIndex: 30,
        background: "rgba(9,9,9,0.85)", backdropFilter: "blur(8px)",
        borderTop: "1px solid #E6E6E6", borderBottom: "1px solid #E6E6E6",
      }}>
        <div style={{
          maxWidth: 1920, margin: "0 auto",
          padding: "16px clamp(24px, 5vw, 48px)",
          display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap",
        }}>
          <span style={{
            fontFamily: "Gail Rock", fontSize: 11,
            color: "rgba(230,230,230,0.6)",
            letterSpacing: "0.18em", textTransform: "uppercase",
          }}>Filter:</span>
          {FILTERS.map((cat) => {
            const isActive = active === cat.id;
            return (
              <button key={cat.id} onClick={() => setActive(cat.id)} data-magnetic
                style={{
                  position: "relative",
                  background: isActive ? "#FF5E1A" : "transparent",
                  color: isActive ? "#E6E6E6" : "#E6E6E6",
                  border: isActive ? "1px solid #FF5E1A" : "1px solid #E6E6E6",
                  padding: "8px 16px",
                  fontFamily: "Makira", fontSize: 12,
                  letterSpacing: "0.18em", textTransform: "uppercase",
                  cursor: "pointer", transition: "all 300ms ease",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) { e.currentTarget.style.background = "#E6E6E6"; e.currentTarget.style.color = "#090909"; }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#E6E6E6"; }
                }}
              >
                {cat.label} <span style={{ opacity: 0.6 }}>({counts[cat.id] || 0})</span>
              </button>
            );
          })}
          <div style={{ position: "relative", marginLeft: "auto", minWidth: 240 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
              style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "rgba(230,230,230,0.5)" }}>
              <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" /></svg>
            <input value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search works…"
              style={{
                width: "100%", boxSizing: "border-box",
                background: "transparent", border: "1px solid #E6E6E6",
                padding: "8px 36px", color: "#E6E6E6",
                fontFamily: "Makira", fontSize: 13, outline: "none",
                transition: "border-color 300ms ease",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#FF5E1A")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#E6E6E6")}
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      <section style={{
        maxWidth: 1920, margin: "0 auto",
        padding: "64px clamp(24px, 5vw, 48px)",
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 24 }}>
          {filtered.map((w, i) => <window.WorkTile key={w.id} work={w} index={i} />)}
          {filtered.length === 0 && (
            <div style={{
              gridColumn: "1 / -1", padding: 80, textAlign: "center",
              fontFamily: "Gail Rock", fontSize: 14, color: "rgba(230,230,230,0.6)",
              letterSpacing: "0.15em", textTransform: "uppercase",
            }}>
              No works match &ldquo;{query}&rdquo;.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

window.Works = Works;
