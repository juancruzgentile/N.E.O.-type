import { useEffect, useRef } from "react";
import { music } from "../audio/music";

interface P { x: number; y: number; px: number; py: number; life: number; c: number; s: number }

/**
 * Fondo animado: partículas que siguen un campo de flujo formado por senos de
 * frecuencias incommensurables (el patrón no se repite), auroras con duraciones
 * primas (principio de la cigarra) y un brillo que late con la música.
 * Limitado a ~30 fps y en pausa cuando la pestaña no se ve.
 */
export function Background({ enabled, theme }: { enabled: boolean; theme: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pulseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !enabled) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const css = getComputedStyle(document.documentElement);
    const colors = ["--cyan", "--magenta", "--blue", "--green"].map((v) => css.getPropertyValue(v).trim() || "#19d3ff");
    // sprites con brillo pre-renderizados (más barato que shadowBlur)
    const sprites = colors.map((col) => {
      const c = document.createElement("canvas");
      c.width = c.height = 24;
      const g = c.getContext("2d")!;
      const grad = g.createRadialGradient(12, 12, 0, 12, 12, 12);
      grad.addColorStop(0, col);
      grad.addColorStop(0.25, col + "aa");
      grad.addColorStop(1, "transparent");
      g.fillStyle = grad;
      g.fillRect(0, 0, 24, 24);
      return c;
    });

    let w = 0;
    let h = 0;
    const dpr = Math.min(2, devicePixelRatio || 1);
    const parts: P[] = [];
    const spawn = (p?: P): P => {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const np = { x, y, px: x, py: y, life: 200 + Math.random() * 600, c: Math.floor(Math.random() * sprites.length), s: 0.5 + Math.random() * 0.9 };
      return p ? Object.assign(p, np) : np;
    };
    const resize = () => {
      w = innerWidth;
      h = innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const target = Math.round(Math.min(140, (w * h) / 16000));
      while (parts.length < target) parts.push(spawn());
      parts.length = target;
    };
    resize();
    addEventListener("resize", resize);

    let raf = 0;
    let last = 0;
    let pulse = 0;
    const field = (x: number, y: number, t: number) =>
      Math.sin(x * 0.0021 + t * 0.00013) * 1.3 +
      Math.sin(y * 0.0017 - t * 0.000107) * 1.1 +
      Math.sin((x + y) * 0.00093 + t * 0.0000711) * 1.7;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (document.hidden || now - last < 33) return;
      last = now;
      const target = music.pulse();
      pulse += (target - pulse) * 0.35;
      if (pulseRef.current) pulseRef.current.style.opacity = String(0.15 + pulse * 0.6);

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      for (const p of parts) {
        const a = field(p.x, p.y, now);
        const speed = 0.35 + pulse * 0.6;
        p.px = p.x;
        p.py = p.y;
        p.x += Math.cos(a) * speed * p.s;
        p.y += Math.sin(a) * speed * p.s - 0.05;
        p.life--;
        if (p.life <= 0 || p.x < -20 || p.x > w + 20 || p.y < -20 || p.y > h + 20) {
          spawn(p);
          continue;
        }
        const fade = Math.min(1, p.life / 80);
        ctx.globalAlpha = (0.22 + pulse * 0.3) * fade;
        const size = (5 + p.s * 7) * (1 + pulse * 0.35);
        ctx.drawImage(sprites[p.c], p.x - size / 2, p.y - size / 2, size, size);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", resize);
      ctx.clearRect(0, 0, w, h);
    };
  }, [enabled, theme]);

  return (
    <div className="bg-fx" aria-hidden="true">
      <div className="aurora a1" />
      <div className="aurora a2" />
      <div className="aurora a3" />
      <div className="bg-pulse" ref={pulseRef} />
      <canvas ref={canvasRef} className="bg-canvas" />
    </div>
  );
}
