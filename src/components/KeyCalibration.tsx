import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { AppState, LearnedKey } from "../types";
import { LANG_ORDER, TRACK_ORDER, allChars } from "../data/curriculum";
import { LAYOUTS, comboMap, comboText, isLearnable, layoutFor, readKey } from "../data/layouts";

type Update = (fn: (s: AppState) => AppState) => void;

/** Todos los símbolos que la app puede pedir, en el orden en que suelen aparecer. */
function symbolsToCalibrate(): string[] {
  const seen = new Set<string>();
  for (const id of [...LANG_ORDER, ...TRACK_ORDER]) for (const ch of allChars(id)) if (isLearnable(ch)) seen.add(ch);
  for (const ch of "`~") seen.add(ch);
  // los números van al final: casi nunca cambian de lugar
  return [...seen].sort((a, b) => Number(/\d/.test(a)) - Number(/\d/.test(b)));
}

const same = (a: LearnedKey, b: { code: string; shift: boolean; altgr: boolean; dead: boolean }) =>
  a.code === b.code && a.shift === b.shift && a.altgr === b.altgr && !!a.dead === b.dead;

/**
 * Calibración: pide cada símbolo y graba con qué tecla y modificadores lo escribís.
 * Solo se guardan los que difieren de la distribución elegida.
 */
export function KeyCalibration({ state, update, onClose }: { state: AppState; update: Update; onClose: () => void }) {
  const id = state.settings.layout;
  const symbols = useMemo(symbolsToCalibrate, []);
  const [i, setI] = useState(0);
  const [msg, setMsg] = useState<string | null>(null);
  const [changed, setChanged] = useState(0);
  const deadRef = useRef<LearnedKey | null>(null);
  const layout = layoutFor(state.settings);
  const target = symbols[i];
  const done = i >= symbols.length;

  const save = (ch: string, k: LearnedKey) => {
    const base = comboMap(LAYOUTS[id]).get(ch);
    update((s) => {
      const cur = { ...(s.settings.keymap[id] ?? {}) };
      // igual que la distribución: no hace falta guardarlo (y se borra si había otro valor)
      if (base && same(k, base)) delete cur[ch];
      else cur[ch] = k;
      return { ...s, settings: { ...s.settings, keymap: { ...s.settings.keymap, [id]: cur } } };
    });
    const before = comboMap(layout).get(ch);
    if (!before || !same(k, before)) setChanged((n) => n + 1);
    setMsg(null);
    setI((n) => n + 1);
  };

  useEffect(() => {
    if (done) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (["Shift", "Control", "Alt", "AltGraph", "Meta", "CapsLock", "Tab"].includes(e.key)) return;
      e.preventDefault();
      if (e.key === "Dead") {
        deadRef.current = { code: e.code, shift: e.shiftKey, altgr: e.getModifierState("AltGraph") || e.altKey, dead: true };
        setMsg("Es una tecla muerta: ahora apretá Espacio.");
        return;
      }
      if (deadRef.current && e.code === "Space") {
        const k = deadRef.current;
        deadRef.current = null;
        save(target, k);
        return;
      }
      deadRef.current = null;
      const obs = readKey(e);
      if (!obs) return;
      if (obs.key === target) save(target, { code: obs.code, shift: obs.shift, altgr: obs.altgr });
      else setMsg(`Eso escribió "${obs.key}". Probá de nuevo o tocá "No lo tengo".`);
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  });

  return createPortal(
    <div className="modal-back" onClick={onClose}>
      <div className="frame glow modal calib" role="dialog" aria-label="Calibrar teclado" onClick={(e) => e.stopPropagation()}>
        <div className="kicker">CALIBRAR TECLADO · {LAYOUTS[id].name.toUpperCase()}</div>
        {done ? (
          <>
            <div className="big" style={{ fontSize: 40, letterSpacing: 2 }}>LISTO</div>
            <p>
              {changed
                ? `Ajusté ${changed} ${changed === 1 ? "símbolo" : "símbolos"} a tu teclado.`
                : "Tu teclado coincide con la distribución elegida."}
            </p>
            <p style={{ fontSize: 15 }}>Si algo cambia, la app también aprende sola mientras practicás.</p>
            <div className="actions">
              <button className="btn primary" onClick={onClose}>Cerrar</button>
            </div>
          </>
        ) : (
          <>
            <p>Escribí este símbolo como lo hacés siempre ({i + 1} de {symbols.length})</p>
            <div className="big">{target}</div>
            <div className="combo">La app cree: {comboText(layout, target)}</div>
            <p className="calib-msg" aria-live="polite">{msg ?? " "}</p>
            <div className="progress"><span style={{ width: `${(i / symbols.length) * 100}%` }} /></div>
            <div className="actions">
              {i > 0 && <button className="btn" onClick={() => { setMsg(null); setI((n) => n - 1); }}>Atrás</button>}
              <button className="btn" onClick={() => { setMsg(null); setI((n) => n + 1); }}>No lo tengo</button>
              <button className="btn" onClick={onClose}>Terminar</button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
