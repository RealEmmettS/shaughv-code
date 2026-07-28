/* global React */
const { useEffect, useRef, useState } = React;

// Per-character glitch reveal — simplified port of the production GlitchLetter.
function GlitchLetter({ char, delay }) {
  const [shown, setShown] = useState(char === " ");
  const [glyph, setGlyph] = useState(char);

  useEffect(() => {
    if (char === " ") return;
    const pool = "ABCDEFGHIJKLMNOPQRSTUVWXYZ23456789/.-";
    const start = setTimeout(() => {
      let ticks = 0;
      const interval = setInterval(() => {
        ticks += 1;
        if (ticks > 6) {
          clearInterval(interval);
          setGlyph(char);
          setShown(true);
        } else {
          setGlyph(pool[Math.floor(Math.random() * pool.length)]);
        }
      }, 40);
    }, delay);
    return () => clearTimeout(start);
  }, [char, delay]);

  if (char === " ") return <span style={{ display: "inline-block", width: "0.35em" }} />;

  return (
    <span style={{
      display: "inline-block",
      color: shown ? "#E6E6E6" : "#FF5E1A",
      transition: "color 200ms ease",
      textShadow: shown ? "none" : "2px 0 #FF5E1A, -2px 0 #1E4B8E",
    }}>
      {glyph}
    </span>
  );
}

function Hero({ setRoute }) {
  const [eyebrowShown, setEyebrowShown] = useState("");
  const eyebrowTarget = "Digital Craftsman";

  useEffect(() => {
    const pool = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/.-";
    let i = 0;
    const t = setTimeout(() => {
      const id = setInterval(() => {
        i += 1;
        if (i > eyebrowTarget.length) {
          setEyebrowShown(eyebrowTarget);
          clearInterval(id);
          return;
        }
        const fixed = eyebrowTarget.slice(0, i);
        const rest = Array.from({ length: Math.max(0, eyebrowTarget.length - i) })
          .map(() => pool[Math.floor(Math.random() * pool.length)]).join("");
        setEyebrowShown(fixed + rest);
      }, 35);
    }, 450);
    return () => clearTimeout(t);
  }, []);

  const lines = ["EMMETT", "SHAUGHNESSY"];
  let charIdx = 0;

  return (
    <section
      id="top"
      style={{
        minHeight: "100vh",
        display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "80px clamp(24px, 5vw, 48px) 80px",
        maxWidth: 1920, margin: "0 auto",
        position: "relative", zIndex: 10,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <h2 style={{
          fontFamily: "Makira", fontWeight: 500, fontSize: 18, color: "#FF5E1A",
          letterSpacing: "0.25em", textTransform: "uppercase", margin: 0,
          minHeight: "1.4em",
        }}>
          {eyebrowShown}
        </h2>

        <h1 style={{
          fontFamily: "Makira", fontWeight: 800, lineHeight: 0.92,
          fontSize: "clamp(3rem, 11vw, 11rem)", textTransform: "uppercase",
          color: "#E6E6E6", margin: 0, letterSpacing: "-0.02em",
        }} aria-label="Emmett Shaughnessy" role="img">
          {lines.map((line, lineIdx) => (
            <span key={lineIdx} style={{ display: "block", whiteSpace: "nowrap" }} aria-hidden="true">
              {Array.from(line).map((c) => {
                const i = charIdx++;
                return <GlitchLetter key={i} char={c} delay={300 + i * 55} />;
              })}
            </span>
          ))}
        </h1>

        <p style={{
          fontFamily: "Makira", fontSize: 20, lineHeight: 1.6,
          color: "rgba(230,230,230,0.8)", maxWidth: 580,
          marginTop: 32, marginBottom: 0,
        }}>
          Software developer, educator, and founder. I&rsquo;ve been shipping apps and teaching technology since 2017&thinsp;&mdash;&thinsp;and I&rsquo;m just getting started.
        </p>

        <div style={{ marginTop: 32 }}>
          <a
            href="#projects"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
            }}
            data-magnetic
            style={{
              display: "inline-block", background: "#FF5E1A", color: "#E6E6E6",
              padding: "18px 38px", fontFamily: "Makira", fontWeight: 700, fontSize: 13,
              letterSpacing: "0.15em", textTransform: "uppercase", textDecoration: "none",
              transition: "background 300ms ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#E6E6E6")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#FF5E1A")}
          >
            View Selected Works
          </a>
        </div>
      </div>
    </section>
  );
}

window.Hero = Hero;
