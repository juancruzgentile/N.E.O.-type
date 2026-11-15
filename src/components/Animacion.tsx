/**
 * Animación paso a paso para las clases: el dibujo lo pone quien la usa (un SVG que depende del paso) y acá
 * viven los controles. Arranca sola solo si la app tiene las animaciones prendidas; si no, queda quieta en el
 * paso actual y se avanza a mano.
 */
import { useEffect, useState, type ReactNode } from "react";
import { fxOn } from "../fx/fx";

const MS = 2600;

export function Animacion({ pasos, label, children }: { pasos: string[]; label: string; children: (paso: number) => ReactNode }) {
  const [paso, setPaso] = useState(0);
  const [play, setPlay] = useState(fxOn);
  const n = pasos.length;

  useEffect(() => {
    if (!play) return;
    const t = setInterval(() => setPaso((p) => (p + 1) % n), MS);
    return () => clearInterval(t);
  }, [play, n]);

  const ir = (d: number) => {
    setPlay(false);
    setPaso((p) => (p + d + n) % n);
  };

  return (
    <div className="anim">
      <div role="img" aria-label={`${label}. Paso ${paso + 1} de ${n}: ${pasos[paso]}`}>{children(paso)}</div>
      <div className="anim-controles">
        <button type="button" className="btn small" onClick={() => ir(-1)} aria-label="Paso anterior">‹</button>
        <button type="button" className="btn small" onClick={() => setPlay(!play)} aria-label={play ? "Pausar" : "Reproducir"}>{play ? "❚❚" : "▶"}</button>
        <button type="button" className="btn small" onClick={() => ir(1)} aria-label="Paso siguiente">›</button>
        <span className="anim-num">{paso + 1}/{n}</span>
        {/* con la animación andando no se anuncia cada paso: sería ruido para el lector de pantalla */}
        <span className="anim-texto" aria-live={play ? "off" : "polite"}>{pasos[paso]}</span>
      </div>
    </div>
  );
}
