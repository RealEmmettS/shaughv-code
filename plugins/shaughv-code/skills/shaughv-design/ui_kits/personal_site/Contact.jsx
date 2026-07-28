/* global React */
const { useState } = React;

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", project: "" });
  const [sent, setSent] = useState(false);

  return (
    <section id="contact" style={{
      padding: "clamp(80px, 11vw, 160px) clamp(24px, 5vw, 48px)",
      maxWidth: 1920, margin: "0 auto",
      position: "relative", zIndex: 10, overflow: "hidden",
      background: "#090909",
    }}>
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(circle at 15% 20%, rgba(255,94,26,0.12), transparent 42%), radial-gradient(circle at 85% 15%, rgba(32,79,32,0.10), transparent 40%), radial-gradient(circle at 45% 90%, rgba(255,94,26,0.08), transparent 45%)",
      }} />
      <div style={{ position: "relative", display: "grid", gridTemplateColumns: "0.95fr 1.05fr", gap: 64, alignItems: "flex-start" }} className="shv-contact-grid">
        <div>
          <h2 style={{
            fontFamily: "Makira", fontWeight: 700,
            fontSize: "clamp(56px, 8vw, 128px)", textTransform: "uppercase",
            color: "#E6E6E6", lineHeight: 1, margin: "0 0 32px",
          }}>Get In<br />Touch</h2>
          <p style={{
            fontFamily: "Makira", fontSize: 20,
            color: "rgba(230,230,230,0.75)", lineHeight: 1.5,
            maxWidth: 520, margin: "0 0 28px",
          }}>
            Have a project in mind or want to talk shop? Drop a note &mdash; I&rsquo;m quick to respond.
          </p>
          <div style={{
            display: "flex", flexWrap: "wrap", gap: 12,
            color: "rgba(230,230,230,0.75)", fontFamily: "Makira", fontSize: 16,
          }}>
            <a href="mailto:hey@emmetts.dev" style={{ color: "inherit", textDecoration: "underline", textUnderlineOffset: 4 }}>hey@emmetts.dev</a>
            <span aria-hidden>/</span>
            <a href="#" style={{ color: "inherit", textDecoration: "underline", textUnderlineOffset: 4 }}>LinkedIn</a>
            <span aria-hidden>/</span>
            <a href="#" style={{ color: "inherit", textDecoration: "underline", textUnderlineOffset: 4 }}>GitHub</a>
          </div>
        </div>

        <div style={{
          position: "relative", overflow: "hidden",
          borderRadius: 32, border: "1px solid rgba(230,230,230,0.1)",
          background: "rgba(255,255,255,0.04)", backdropFilter: "blur(40px)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.42)",
          padding: 40,
        }}>
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: "linear-gradient(135deg, rgba(255,94,26,0.10), rgba(20,20,20,0.5), rgba(32,79,32,0.10))",
          }} />
          <div style={{ position: "relative", display: "grid", gap: 20 }}>
            {sent ? (
              <div style={{
                fontFamily: "Makira", fontWeight: 600, fontSize: 22,
                color: "#FF5E1A", textTransform: "uppercase", textAlign: "center", padding: "60px 0",
              }}>
                Sent. I&rsquo;ll be in touch.
              </div>
            ) : (
              <>
                <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Your name" />
                <Field label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="hey@emmetts.dev" />
                <Field label="Project" value={form.project} onChange={(v) => setForm({ ...form, project: v })} placeholder="Tell me about it" textarea />
                <button
                  onClick={() => setSent(true)}
                  data-magnetic
                  style={{
                    background: "#FF5E1A", color: "#E6E6E6", border: "none",
                    padding: "16px 32px", fontFamily: "Makira", fontWeight: 700,
                    fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase",
                    cursor: "pointer", justifySelf: "flex-start",
                    transition: "background 300ms ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#E6E6E6")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#FF5E1A")}
                >
                  Send
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, value, onChange, placeholder, textarea }) {
  return (
    <label style={{ display: "block" }}>
      <span style={{
        fontFamily: "Gail Rock", fontSize: 10,
        color: "rgba(230,230,230,0.6)",
        letterSpacing: "0.2em", textTransform: "uppercase",
        marginBottom: 8, display: "block",
      }}>{label}</span>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={4}
          style={{
            width: "100%", boxSizing: "border-box",
            background: "transparent", color: "#E6E6E6",
            border: "1px solid rgba(230,230,230,0.25)", padding: "12px 14px",
            fontFamily: "Makira", fontSize: 14, resize: "vertical",
            outline: "none",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#FF5E1A")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(230,230,230,0.25)")}
        />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          style={{
            width: "100%", boxSizing: "border-box",
            background: "transparent", color: "#E6E6E6",
            border: "1px solid rgba(230,230,230,0.25)", padding: "12px 14px",
            fontFamily: "Makira", fontSize: 14, outline: "none",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#FF5E1A")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(230,230,230,0.25)")}
        />
      )}
    </label>
  );
}

window.Contact = Contact;
