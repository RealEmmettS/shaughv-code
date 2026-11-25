/* global React */
const { useEffect, useRef } = React;

// Magnetic dot-matrix background canvas.
// Simplified port of src/components/DotMatrix.tsx — fixed-position, 30px grid,
// 1.5px dots, 150px magnetic radius. Pointer-events disabled.
function DotMatrix() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let dots = [];
    const grid = 30;
    const radius = 1.5;
    const influence = 150;
    const pull = 1.5;
    const returnFactor = 0.1;
    const pointer = { x: -9999, y: -9999 };
    let raf;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.scale(dpr, dpr);
      const cols = Math.ceil(window.innerWidth / grid);
      const rows = Math.ceil(window.innerHeight / grid);
      dots = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          dots.push({ x0: c * grid, y0: r * grid, x: c * grid, y: r * grid });
        }
      }
    };

    const onMove = (e) => { pointer.x = e.clientX; pointer.y = e.clientY; };
    const onLeave = () => { pointer.x = -9999; pointer.y = -9999; };

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#3a3a3a";
      ctx.beginPath();
      for (const d of dots) {
        const dx = pointer.x - d.x;
        const dy = pointer.y - d.y;
        const dist = Math.hypot(dx, dy);
        if (dist < influence) {
          const force = ((influence - dist) / influence) * pull * 6;
          d.x += (dx / (dist || 1)) * force * 0.1;
          d.y += (dy / (dist || 1)) * force * 0.1;
        }
        d.x += (d.x0 - d.x) * returnFactor;
        d.y += (d.y0 - d.y) * returnFactor;
        ctx.moveTo(d.x + radius, d.y);
        ctx.arc(d.x, d.y, radius, 0, Math.PI * 2);
      }
      ctx.fill();
      raf = requestAnimationFrame(loop);
    };

    resize();
    loop();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} style={{
    position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none", opacity: 0.4,
  }} />;
}

window.DotMatrix = DotMatrix;
