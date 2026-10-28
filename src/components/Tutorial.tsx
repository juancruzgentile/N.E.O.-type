import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { LangId, Mode } from "../types";
import { isTrack } from "../data/curriculum";

interface Step {
  /** valores de data-tour posibles, en orden de preferencia: se usa el primero visible */
  target: string[];
  kicker: string;
  text: string;
}

/** Pasos del recorrido según lo que se está practicando. */
export function tutorialSteps(lang: LangId, mode: Mode): Step[] {
  const track = isTrack(lang);
  const progress: Step =
    mode === "free"
      ? {
          target: ["mode"],
          kicker: "MODO LIBRE",
          text: track
            ? "Practicás con todos los escalones de la ruta mezclados, sin desbloqueos. Para avanzar escalón por escalón, cambiá a Modo guiado con este botón."
            : "Practicás con todos los símbolos del lenguaje, sin desbloqueos. Para avanzar símbolo por símbolo, cambiá a Modo guiado con este botón.",
        }
      : track
        ? {
            target: ["level", "mode"],
            kicker: "ESCALONES",
            text: "Esta ruta avanza por escalones de dificultad. Se abre el siguiente cuando tus últimas lecciones de cada escalón alcanzan la velocidad y la precisión objetivo. El detalle está en Rutas.",
          }
        : {
            target: ["keyset", "level"],
            kicker: "MODO GUIADO",
            text: "Empezás con pocos símbolos. Cuando dominás los que tenés (velocidad y precisión), se desbloquea el siguiente. El que más te cuesta aparece resaltado como foco y se repite en las lecciones.",
          };
  return [
    {
      target: ["code"],
      kicker: "ESCRIBÍ EL CÓDIGO",
      text: "Tipeá el fragmento tal cual aparece. Los errores se marcan en rojo. Nada de lo que escribís se ejecuta: sirve solo para entrenar los dedos.",
    },
    {
      target: ["keyboard", "keyset"],
      kicker: "TU GUÍA",
      text: "Acá ves la próxima tecla, con qué dedo pulsarla y si lleva Shift o AltGr. Revisá en Ajustes que el teclado elegido coincida con el tuyo.",
    },
    progress,
    {
      target: ["metrics"],
      kicker: "TUS RESULTADOS",
      text: "Velocidad y precisión de tu última lección terminada, comparadas con las anteriores, más tu puntuación total y tu racha de días seguidos. En Estadísticas ves la evolución completa.",
    },
    {
      target: ["nav"],
      kicker: "EXPLORÁ",
      text: "Rutas, Estadísticas, Desafíos, Logros y Ajustes (música, temas y animaciones). Podés repetir este recorrido desde Ajustes cuando quieras.",
    },
  ];
}

/** Primer elemento visible con alguno de los data-tour indicados. */
function findTarget(target: string[]): HTMLElement | null {
  for (const t of target) {
    for (const el of document.querySelectorAll<HTMLElement>(`[data-tour="${t}"]`)) {
      const r = el.getBoundingClientRect();
      if (r.width < 24 || r.height < 24) continue;
      if (getComputedStyle(el).visibility === "hidden") continue;
      return el;
    }
  }
  return null;
}

const PAD = 8;
const GAP = 16;
const MARGIN = 16;

interface Props {
  name: string;
  lang: LangId;
  mode: Mode;
  animations: boolean;
  onClose: () => void;
}

/** Bienvenida y recorrido con foco sobre la pantalla de práctica. */
export function Tutorial({ name, lang, mode, animations, onClose }: Props) {
  const all = useMemo(() => tutorialSteps(lang, mode), [lang, mode]);
  // solo los pasos cuyo elemento se ve en este tamaño de ventana
  const [steps, setSteps] = useState<Step[]>([]);
  // -1 = bienvenida; 0..n-1 = pasos del recorrido
  const [step, setStep] = useState(-1);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [cardPos, setCardPos] = useState<{ top: number; left: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const primaryRef = useRef<HTMLButtonElement>(null);
  const last = steps.length - 1;
  const current = step >= 0 ? steps[Math.min(step, last)] : undefined;

  useLayoutEffect(() => {
    const resolve = () => setSteps(all.filter((s) => findTarget(s.target)));
    resolve();
    window.addEventListener("resize", resolve);
    return () => window.removeEventListener("resize", resolve);
  }, [all]);

  const next = useCallback(() => (step >= last ? onClose() : setStep((s) => s + 1)), [last, onClose, step]);
  const prev = useCallback(() => setStep((s) => Math.max(-1, s - 1)), []);

  // el resto de la app queda inerte mientras el diálogo está abierto; al cerrar, el foco vuelve a un lugar útil
  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    const app = document.querySelector<HTMLElement>(".app");
    app?.setAttribute("inert", "");
    return () => {
      app?.removeAttribute("inert");
      // si el control que lo abrió ya no existe (p. ej. el botón de Ajustes), el foco va al área de escritura
      const target = before && before !== document.body && before.isConnected
        ? before
        : document.querySelector<HTMLElement>(".ta-hidden");
      target?.focus();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const root = rootRef.current;
      if (!root) return;
      // ningún atajo de la app debe reaccionar mientras dura el recorrido
      e.stopPropagation();
      const onButton = e.target instanceof HTMLButtonElement && root.contains(e.target);
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "Tab") {
        // el foco da vueltas dentro del diálogo
        e.preventDefault();
        const items = [...root.querySelectorAll<HTMLButtonElement>("button:not([disabled])")];
        if (!items.length) return;
        const i = items.indexOf(document.activeElement as HTMLButtonElement);
        const to = i < 0 ? 0 : (i + (e.shiftKey ? -1 : 1) + items.length) % items.length;
        items[to].focus();
      } else if (e.key === "Enter" || e.key === " ") {
        // sobre un botón manda el botón (Atrás, Saltar…); fuera de ellos, Enter avanza
        if (onButton) return;
        e.preventDefault();
        if (e.key === "Enter") next();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [next, onClose, prev]);

  useEffect(() => {
    primaryRef.current?.focus();
  }, [step, steps.length]);

  // ubica el elemento resaltado y lo sigue al redimensionar o desplazar
  useEffect(() => {
    if (!current) {
      setRect(null);
      return;
    }
    const el = findTarget(current.target);
    el?.scrollIntoView({ block: "nearest", behavior: animations ? "smooth" : "auto" });
    const measure = () => setRect(findTarget(current.target)?.getBoundingClientRect() ?? null);
    measure();
    // el desplazamiento suave tarda un poco: se vuelve a medir mientras dura
    const timers = [120, 300, 500].map((ms) => setTimeout(measure, ms));
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [animations, current]);

  // la tarjeta va debajo, arriba o al costado del foco, siempre dentro de la ventana
  useLayoutEffect(() => {
    const card = cardRef.current;
    if (!card || !rect) {
      setCardPos(null);
      return;
    }
    const w = card.offsetWidth;
    const h = card.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const top0 = rect.top - PAD;
    const bottom0 = rect.bottom + PAD;
    let top: number;
    let left = rect.left + rect.width / 2 - w / 2;
    if (vh - bottom0 >= h + GAP + MARGIN) top = bottom0 + GAP;
    else if (top0 >= h + GAP + MARGIN) top = top0 - GAP - h;
    else {
      top = rect.top + rect.height / 2 - h / 2;
      left = rect.left - PAD - GAP - w >= MARGIN ? rect.left - PAD - GAP - w : rect.right + PAD + GAP;
    }
    const clamp = (v: number, max: number) => Math.max(MARGIN, Math.min(v, max - MARGIN));
    setCardPos({ top: clamp(top, vh - h), left: clamp(left, vw - w) });
  }, [rect, step]);

  const anim = animations ? " animated" : "";

  if (!current) {
    return (
      <div ref={rootRef} className="modal-back tour-back" role="dialog" aria-modal="true" aria-labelledby="tour-welcome-title">
        <div className={"frame glow modal tour-welcome" + anim}>
          <div className="kicker">BIENVENIDA</div>
          <h2 id="tour-welcome-title" className="tour-title">
            {name ? <>Hola, {name}. </> : null}Te damos la bienvenida a <span className="tour-brand">N.E.O.-type</span>
          </h2>
          <p>
            Una aplicación pensada para mejorar tu escritura de código. Podés empezar sin experiencia previa y llegar a
            tipear con la soltura de un profesional.
          </p>
          <div className="tour-note">
            <b>Importante:</b> N.E.O.-type no reemplaza el estudio ni la dedicación a programar. Estos ejercicios entrenan
            tus dedos y tu memoria muscular para que escribas sin mirar el teclado y puedas poner toda tu atención en lo que
            estás construyendo.
          </div>
          <p>
            Con práctica constante vas a desarrollar una memoria muscular excelente para escribir el mejor código del que
            seas capaz.
          </p>
          <p className="tour-thanks">
            Te deseamos un aprendizaje cómodo y divertido. <b>¡Gracias por usar N.E.O.-type!</b>
          </p>
          <div className="actions">
            <button className="btn" onClick={onClose}>Saltar (Esc)</button>
            <button ref={primaryRef} className="btn primary" onClick={next}>
              {steps.length ? "Ver el recorrido (Enter)" : "Empezar (Enter)"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const idx = Math.min(step, last);
  return (
    <div
      ref={rootRef}
      className={"tour" + anim}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-kicker"
      aria-describedby="tour-text"
    >
      {/* capa que bloquea clics sobre la app mientras dura el recorrido */}
      <div className="tour-block" />
      {rect ? (
        <div
          className="tour-spot"
          style={{ top: rect.top - PAD, left: rect.left - PAD, width: rect.width + PAD * 2, height: rect.height + PAD * 2 }}
        />
      ) : (
        <div className="tour-dim" />
      )}
      <div
        ref={cardRef}
        className="frame glow tour-card"
        style={cardPos ? { top: cardPos.top, left: cardPos.left } : { top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
      >
        <div className="tour-head">
          <span className="tour-count">{idx + 1}/{steps.length}</span>
          <span id="tour-kicker" className="kicker">{current.kicker}</span>
        </div>
        <p id="tour-text">{current.text}</p>
        <div className="tour-foot">
          <div className="tour-dots" aria-hidden="true">
            {steps.map((_, i) => <span key={i} className={i === idx ? "on" : i < idx ? "done" : ""} />)}
          </div>
          <span className="grow" />
          <button className="btn small" onClick={onClose}>Saltar</button>
          <button className="btn small" onClick={prev}>Atrás</button>
          <button ref={primaryRef} className="btn small primary" onClick={next}>
            {idx === last ? "Empezar (Enter)" : "Siguiente (Enter)"}
          </button>
        </div>
      </div>
    </div>
  );
}
