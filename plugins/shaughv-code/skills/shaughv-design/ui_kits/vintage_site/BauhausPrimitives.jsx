/* global React */
/* Structural decoration primitives for the vintage edition.
   The codebase keeps decoration restrained: a sage dot-matrix wash on the
   page, plain olive hairlines, and occasional Bauhaus geometry. Everything
   uses currentColor / CSS variables so it inherits the surface tone. */

function BauhausCircle({ size = 200, color = "var(--accent)", filled = false, opacity = 0.1, style }) {
  return (
    <div
      aria-hidden="true"
      style={{
        width: size, height: size, borderRadius: "50%",
        background: filled ? color : "transparent",
        border: filled ? "none" : `1.5px solid ${color}`,
        opacity, pointerEvents: "none",
        ...style,
      }}
    />
  );
}

function BauhausLine({ length = 240, color = "var(--accent)", thickness = 1, opacity = 0.4, vertical = false, style }) {
  return (
    <div
      aria-hidden="true"
      style={{
        width: vertical ? thickness : length,
        height: vertical ? length : thickness,
        background: color, opacity, pointerEvents: "none",
        ...style,
      }}
    />
  );
}

function BauhausBlock({ size = 120, color = "var(--sv-bauhaus-red)", opacity = 0.85, style }) {
  return <div aria-hidden="true" style={{ width: size, height: size, background: color, opacity, ...style }} />;
}

/* Sage dot grid -- the codebase's signature page wash. Sits at z:-1 behind
   the gradient body bg. Stamp once near the top of <App />. */
function DotMatrix({ opacity = 0.22, size = 30, color = "rgba(91, 138, 91, 0.7)" }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed", inset: 0, zIndex: -1,
        opacity, pointerEvents: "none",
        backgroundImage: `radial-gradient(circle, ${color} 1.4px, transparent 1.6px)`,
        backgroundSize: `${size}px ${size}px`,
      }}
    />
  );
}

/* Mono caption -- shared style object for IBM Plex Mono labels.
   Inline-spread into any element that needs the codebase's
   semibold-uppercase-0.14em treatment. */
const MONO_LABEL = {
  fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
  fontWeight: 600,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
};

window.BauhausCircle = BauhausCircle;
window.BauhausLine = BauhausLine;
window.BauhausBlock = BauhausBlock;
window.DotMatrix = DotMatrix;
window.MONO_LABEL = MONO_LABEL;
