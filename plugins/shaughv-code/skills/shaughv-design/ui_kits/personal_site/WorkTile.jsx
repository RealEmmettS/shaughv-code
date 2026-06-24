/* global React */
const { useState } = React;

const SIZE_TO_SPAN = { sm: 3, md: 6, lg: 8, xl: 12 };
const SIZE_TO_TITLE = {
  sm: "clamp(20px, 2vw, 28px)",
  md: "clamp(26px, 2.6vw, 38px)",
  lg: "clamp(28px, 3vw, 48px)",
  xl: "clamp(32px, 3.6vw, 60px)",
};
const CATEGORY_LABEL = { site: "Site", subdomain: "Subdomain", tool: "Tool", app: "iOS App", report: "Report" };

function WorkTile({ work, index }) {
  const [hover, setHover] = useState(false);
  const size = work.size || "md";
  const displayNumber = String(index + 1).padStart(3, "0");

  return (
    <article
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        gridColumn: `span ${SIZE_TO_SPAN[size]}`,
        border: "1px solid #E6E6E6",
        padding: "32px 32px",
        minHeight: 320,
        position: "relative", overflow: "hidden",
        background: hover ? "#E6E6E6" : "transparent",
        color: hover ? "#090909" : "#E6E6E6",
        transition: "background 500ms ease, color 500ms ease",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        gap: 24,
      }}
    >
      <div style={{ position: "relative", zIndex: 10 }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
          fontFamily: "IBM Plex Mono", fontSize: 11,
          letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.65,
        }}>
          <span>{displayNumber}</span>
          <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {work.appStore && <span style={{ border: "1px solid currentColor", padding: "2px 8px", borderRadius: 9999 }}>iOS</span>}
            {work.inSelected && <span style={{ border: "1px solid currentColor", padding: "2px 8px", borderRadius: 9999 }}>Featured</span>}
            <span>{CATEGORY_LABEL[work.category]}</span>
            <span style={{ opacity: 0.7 }}>·</span>
            <span>{work.year}</span>
          </span>
        </div>
        <h3 data-magnetic style={{
          marginTop: 28,
          fontFamily: "Unbounded", fontWeight: 700,
          fontSize: SIZE_TO_TITLE[size], lineHeight: 0.95,
          textTransform: "uppercase", margin: "28px 0 0",
        }}>{work.domain}</h3>
        {work.name !== work.domain && (
          <p style={{
            marginTop: 10, fontFamily: "IBM Plex Mono", fontSize: 12,
            letterSpacing: "0.18em", textTransform: "uppercase",
            opacity: 0.6, margin: "10px 0 0",
          }}>{work.name}</p>
        )}
        {work.description && (
          <p style={{
            marginTop: 20, fontFamily: "Makira", fontSize: 14,
            lineHeight: 1.55, opacity: 0.85, margin: "20px 0 0",
            maxWidth: "60ch",
          }}>{work.description}</p>
        )}
        {work.children && work.children.length > 0 && (
          <ul style={{ listStyle: "none", padding: 0, margin: "20px 0 0", display: "flex", flexWrap: "wrap", gap: 8 }}>
            {work.children.map((c) => (
              <li key={c.url}>
                <a href={c.url} target="_blank" rel="noopener noreferrer" data-magnetic
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    fontFamily: "IBM Plex Mono", fontSize: 11,
                    border: "1px solid currentColor", padding: "4px 10px",
                    borderRadius: 9999, color: "inherit", textDecoration: "none",
                    opacity: 0.8, transition: "all 300ms ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#FF5E1A";
                    e.currentTarget.style.borderColor = "#FF5E1A";
                    e.currentTarget.style.color = "#E6E6E6";
                    e.currentTarget.style.opacity = 1;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.borderColor = "currentColor";
                    e.currentTarget.style.color = "inherit";
                    e.currentTarget.style.opacity = 0.8;
                  }}
                >/{c.domain}</a>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16 }}>
        {work.tech ? (
          <span style={{
            fontFamily: "IBM Plex Mono", fontSize: 11,
            border: "1px solid currentColor", padding: "5px 12px",
            borderRadius: 9999, opacity: 0.75,
          }}>{work.tech}</span>
        ) : <span />}
        {work.url ? (
          <a href={work.url} target="_blank" rel="noopener noreferrer" data-magnetic
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 44, height: 44,
              border: "1px solid currentColor", borderRadius: 9999,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              color: "inherit", flexShrink: 0,
              transition: "all 300ms ease",
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
          ><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M7 17L17 7" /><path d="M8 7h9v9" /></svg></a>
        ) : (
          <span style={{
            fontFamily: "IBM Plex Mono", fontSize: 11,
            letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.6,
          }}>Offline</span>
        )}
      </div>
    </article>
  );
}

window.WorkTile = WorkTile;
