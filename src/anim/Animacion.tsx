/**
 * Animación paso a paso para las clases: el dibujo lo pone quien la usa (un SVG que depende del paso) y acá
 * viven los controles. Arranca sola solo si la app tiene las animaciones prendidas; si no, queda quieta en el
 * paso actual y se avanza a mano.
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

/** Preferencia efectiva de movimiento (ajuste de la app y del sistema). La pone App; sin ella no arranca sola. */
export const Movimiento = createContext(false);

const MS = 2600;

/** `fases` (opcional): una etiqueta corta por paso para el chip de arriba del escenario. */
export function Animacion({ pasos, label, fases, children }: { pasos: string[]; label: string; fases?: string[]; children: (paso: number) => ReactNode }) {
  const [paso, setPaso] = useState(0);
  // se lee del contexto y no de fxOn(): al abrir una clase directo por URL, el efecto de App todavía no corrió
  const movimiento = useContext(Movimiento);
  const [play, setPlay] = useState(movimiento);
  const n = pasos.length;

  // si se apagan las animaciones mientras corre, se frena
  useEffect(() => {
    if (!movimiento) setPlay(false);
  }, [movimiento]);

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
    <div className={`anim${movimiento ? "" : " quieto"}`}>
      <div className="anim-escenario">
        {fases && <span className="anim-chip" aria-hidden="true">{fases[paso]}</span>}
        <div role="img" aria-label={`${label}. Paso ${paso + 1} de ${n}: ${pasos[paso]}`}>{children(paso)}</div>
      </div>
      <div className="anim-controles">
        <div className="anim-botones">
          <button type="button" className="anim-btn" onClick={() => ir(-1)} aria-label="Paso anterior">
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" /></svg>
          </button>
          <button type="button" className="anim-btn anim-play" onClick={() => setPlay(!play)} aria-label={play ? "Pausar" : "Reproducir"}>
            <svg viewBox="0 0 16 16" aria-hidden="true">{play ? <path className="rel" d="M5 3v10M11 3v10" /> : <path className="rel" d="M5 3l8 5-8 5z" />}</svg>
          </button>
          <button type="button" className="anim-btn" onClick={() => ir(1)} aria-label="Paso siguiente">
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3 5 5-5 5" /></svg>
          </button>
        </div>
        <span className="anim-num">{paso + 1}/{n}</span>
        <div className="anim-pasos" aria-hidden="true">
          {pasos.map((_, k) => <i key={k} className={k === paso ? "ahora" : k < paso ? "hecho" : ""} />)}
        </div>
      </div>
      {/* con la animación andando no se anuncia cada paso: sería ruido para el lector de pantalla */}
      <p className="anim-texto" aria-live={play ? "off" : "polite"}>{pasos[paso]}</p>
    </div>
  );
}
