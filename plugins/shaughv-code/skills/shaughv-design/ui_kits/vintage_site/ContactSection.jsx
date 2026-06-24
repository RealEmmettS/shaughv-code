/* global React */
const { useState } = React;

const MONO = {
  fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
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

function ContactSection() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  return (
    <section id="contact" style={{
      position: "relative", padding: "clamp(80px, 11vw, 140px) clamp(24px, 5vw, 48px)",
      maxWidth: 1440, margin: "0 auto", overflow: "hidden",
    }}>
      <window.BauhausLine length="38%" thickness={1} color="var(--accent)" opacity={0.32}
        style={{ position: "absolute", top: 120, right: 0 }} />
      <window.BauhausCircle size={180} color="var(--accent)" opacity={0.16}
        style={{ position: "absolute", bottom: 64, left: 64 }} />

      {/* Section index */}
      <div style={{
        ...MONO, fontSize: "0.66rem",
        color: "rgba(92, 84, 70, 0.58)",
        display: "flex", alignItems: "center", gap: 12, marginBottom: 36,
        position: "relative",
      }}>
        <span>§ 04</span>
        <span style={{ flex: 1, height: 1, background: "rgba(92, 84, 70, 0.22)" }} />
      </div>

      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: 64, alignItems: "flex-start",
        position: "relative",
      }} className="shv-grid">

        {/* Heading + email column */}
        <div>
          <p style={{ ...MONO, fontSize: "0.74rem", color: "var(--accent)", margin: "0 0 12px" }}>Get in Touch</p>
          <h2 style={{
            ...MAKIRA_HEAD,
            fontSize: "clamp(40px, 5.5vw, 88px)", lineHeight: 0.96,
            margin: "0 0 24px",
          }}>Got something<br />in mind?</h2>
          <p style={{
            fontFamily: '"Makira", sans-serif', fontSize: 17, lineHeight: 1.6,
            color: "var(--fg-muted)", maxWidth: 480, margin: "0 0 36px", fontWeight: 400,
          }}>
            Open to freelance gigs and full-time roles. Hit me up and let&rsquo;s talk about what you&rsquo;re working on.
          </p>

          {/* Direct contact card */}
          <div style={{
            border: "1px solid var(--fg)",
            background: "rgba(250, 250, 248, 0.78)",
            padding: 20,
            maxWidth: 420,
          }}>
            <div style={{
              ...MONO, fontSize: "0.6rem",
              color: "rgba(92, 84, 70, 0.58)", marginBottom: 6,
            }}>Direct line</div>
            <a href="mailto:hey@emmetts.dev" style={{
              ...MAKIRA_HEAD,
              fontSize: 22, color: "var(--accent)",
              textDecoration: "none",
              borderBottom: "1px solid currentColor", paddingBottom: 2,
            }}>hey@emmetts.dev</a>
            <div style={{
              marginTop: 18, paddingTop: 14,
              borderTop: "1px solid rgba(92, 84, 70, 0.18)",
              display: "flex", justifyContent: "space-between",
              ...MONO, fontSize: "0.6rem", color: "rgba(92, 84, 70, 0.58)",
            }}>
              <span>Reply time</span>
              <span style={{ color: "var(--fg)" }}>&lt; 24h</span>
            </div>
          </div>
        </div>

        {/* Form panel */}
        <div style={{
          border: "1px solid var(--fg)",
          background: "rgba(250, 250, 248, 0.82)",
          boxShadow: "0 6px 24px rgba(92, 84, 70, 0.08)",
        }}>
          <div style={{
            ...MONO, fontSize: "0.62rem",
            color: "rgba(92, 84, 70, 0.62)",
            padding: "12px 20px",
            borderBottom: "1px solid rgba(92, 84, 70, 0.18)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span>Form 001 / New Message</span>
            <span style={{ color: "var(--accent)" }}>Encrypted</span>
          </div>

          <div style={{ padding: "24px 28px 28px" }}>
            {sent ? (
              <div style={{
                textAlign: "center", padding: "60px 0",
                ...MAKIRA_HEAD, fontSize: 22, color: "var(--accent)",
              }}>Sent. Talk soon.</div>
            ) : (
              <div style={{ display: "grid", gap: 16 }}>
                <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Your name" />
                <Field label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="hey@you.com" />
                <Field label="Message" value={form.message} onChange={(v) => setForm({ ...form, message: v })} placeholder="What are you building?" textarea />
                <button onClick={() => setSent(true)}
                  style={{
                    ...MONO, fontSize: "0.72rem",
                    background: "var(--accent)", color: "var(--sv-cream-100)",
                    border: "1px solid var(--sv-sage-dark)",
                    padding: "14px 22px", minHeight: 44,
                    cursor: "pointer", justifySelf: "flex-start",
                    display: "inline-flex", alignItems: "center", gap: 10,
                    transition: "background 180ms ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--sv-sage-dark)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent)")}
                >
                  Send Message
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M5 12h14" /><path d="M13 5l7 7-7 7" /></svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, value, onChange, placeholder, textarea }) {
  const baseInput = {
    width: "100%", boxSizing: "border-box",
    background: "var(--sv-cream-50)", color: "var(--fg)",
    border: "1px solid rgba(92, 84, 70, 0.22)",
    padding: "12px 14px",
    fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
    fontSize: 13, letterSpacing: "0.02em",
    outline: "none",
    transition: "border-color 180ms ease",
  };
  return (
    <label style={{ display: "block" }}>
      <span style={{
        ...MONO, fontSize: "0.6rem",
        color: "rgba(92, 84, 70, 0.62)",
        marginBottom: 8, display: "block",
      }}>{label}</span>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={4}
          style={{ ...baseInput, resize: "vertical" }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(92, 84, 70, 0.22)")} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          style={baseInput}
          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(92, 84, 70, 0.22)")} />
      )}
    </label>
  );
}

window.ContactSection = ContactSection;
