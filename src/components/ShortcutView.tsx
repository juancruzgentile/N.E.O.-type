import { useEffect, useMemo, useRef, useState } from "react";
import type { AppState } from "../types";
import type { EditorState } from "../shortcuts/buffer";
import {
  type ShortcutSet, applyKey, levelDone, levelOpen, par, sameText, solved, startState, stars,
} from "../shortcuts/exercises";
import { type ActionId, ACTIONS, prettyCombo, readCombo } from "../shortcuts/vscode";
import { formatTime } from "../projects/projects";
import { sound } from "../sound";
import { IconRefresh } from "./icons";

interface Props {
  set: ShortcutSet;
  level: number;
  state: AppState;
  update: (fn: (s: AppState) => AppState) => void;
  onExit: () => void;
  onOpen: (level: number) => void;
}

interface Result {
  keys: number;
  ms: number;
  stars: 1 | 2 | 3;
  /** mejoró una marca que ya tenía */
  improved: boolean;
}

const VIM_KEYS = new Set(["Escape", "Enter", "Backspace"]);

/** Un nivel de atajos: editor simulado, objetivo y teclas contadas contra el par. */
export function ShortcutView({ set, level, state, update, onExit, onOpen }: Props) {
  const lv = set.levels[level];
  const platform = state.settings.vscodeKeys;
  const recs = state.shortcuts;
  const [index, setIndex] = useState(() => Math.max(0, lv.exercises.findIndex((e) => !recs[e.id])));
  const ex = lv.exercises[index];
  const [ed, setEd] = useState<EditorState>(() => startState(ex));
  const [keys, setKeys] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const [result, setResult] = useState<Result | null>(null);
  const [focused, setFocused] = useState(false);
  const startTs = useRef<number | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (result) nextRef.current?.focus();
    else boxRef.current?.focus();
  }, [result, index]);

  const reset = (i = index) => {
    setIndex(i);
    setEd(startState(lv.exercises[i]));
    setKeys(0);
    setLog([]);
    setResult(null);
    startTs.current = null;
  };

  const press = (key: string, shown: string) => {
    if (result) return;
    const now = performance.now();
    if (startTs.current === null) startTs.current = now;
    const next = applyKey(set.id, ed, key, platform);
    const n = keys + 1;
    setEd(next);
    setKeys(n);
    setLog((l) => [...l.slice(-9), shown]);
    if (!solved(ex, next)) return;
    const ms = Math.max(1, Math.round(now - startTs.current));
    const st = stars(n, par(ex));
    const prev = recs[ex.id];
    const improved = !!prev && (st > prev.stars || n < prev.keys || ms < prev.ms);
    update((s) => {
      const p = s.shortcuts[ex.id];
      const best = { stars: Math.max(p?.stars ?? 0, st), keys: Math.min(p?.keys ?? Infinity, n), ms: Math.min(p?.ms ?? Infinity, ms) };
      return { ...s, shortcuts: { ...s.shortcuts, [ex.id]: best } };
    });
    if (state.settings.sound) sound.done();
    setResult({ keys: n, ms, stars: st, improved });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.nativeEvent.isComposing || result) return;
    if (set.id === "vim") {
      if (e.ctrlKey || e.metaKey || e.key === "Tab") return;
      if (e.key.length !== 1 && !VIM_KEYS.has(e.key)) return;
      e.preventDefault();
      e.stopPropagation();
      press(e.key, e.key === "Escape" ? "Esc" : e.key === " " ? "␣" : e.key);
      return;
    }
    const combo = readCombo(e.nativeEvent);
    if (!combo) return;
    const known = combo.length === 1 || Object.values(ACTIONS).some((a) => a[platform].includes(combo));
    // lo que no es un atajo del editor queda para el navegador y no cuenta
    if (!known) return;
    e.preventDefault();
    e.stopPropagation();
    press(combo, combo === " " ? "␣" : prettyCombo(combo));
  };

  // atajos que se muestran para este ejercicio
  const use = useMemo<[string, string][]>(() => {
    if (set.id === "vim") return ex.use ?? [];
    const ids = [...new Set(ex.solution.filter((k) => k.startsWith("@")).map((k) => k.slice(1) as ActionId))];
    const out: [string, string][] = ids.map((id) => [ACTIONS[id][platform].map(prettyCombo).join(" o "), ACTIONS[id].label]);
    if (ex.solution.some((k) => !k.startsWith("@"))) out.push(["letras", "escribir el texto"]);
    return out;
  }, [ex, set.id, platform]);

  const sel = ed.anchor && (ed.anchor.line !== ed.line || ed.anchor.col !== ed.col)
    ? [ed.anchor, { line: ed.line, col: ed.col }].sort((a, b) => a.line - b.line || a.col - b.col)
    : null;
  const inSel = (l: number, c: number) =>
    !!sel && (l > sel[0].line || (l === sel[0].line && c >= sel[0].col)) && (l < sel[1].line || (l === sel[1].line && c < sel[1].col));
  const bar = set.id === "vscode" || ed.mode === "insert";
  const parKeys = par(ex);
  const hasNextEx = index + 1 < lv.exercises.length;
  const nextLevelOpen = level + 1 < set.levels.length && levelOpen(state.shortcuts, set, level + 1);

  return (
    <div className="frame view shortcut">
      <div className="kicker">ATAJOS · {set.name.toUpperCase()} · {lv.name.toUpperCase()}{set.id === "vscode" ? ` · ${platform === "mac" ? "MAC" : "LINUX / WINDOWS"}` : ""}</div>
      <div className="recall-steps" aria-label={`Ejercicio ${index + 1} de ${lv.exercises.length}`}>
        {lv.exercises.map((e, i) => <span key={e.id} className={(i === index ? "now " : "") + (recs[e.id] ? "done" : "")} />)}
        <span className="recall-count">{index + 1}/{lv.exercises.length}</span>
      </div>
      <h2 className="sc-title">{ex.title}</h2>
      <p className="sc-task" id="sc-task">{ex.task}</p>

      <div className="sc-use">
        {use.map(([k, what]) => <span key={k + what}><kbd>{k}</kbd> {what}</span>)}
      </div>

      <div className="sc-panes">
        <div className="sc-pane">
          <div className="sc-label">TU EDITOR {set.id === "vim" && <b className={"sc-mode " + ed.mode}>{ed.mode === "insert" ? "-- INSERTAR --" : "NORMAL"}</b>}</div>
          <div
            ref={boxRef}
            className={"sc-editor" + (focused ? " focused" : "")}
            tabIndex={0}
            role="textbox"
            aria-multiline="true"
            aria-readonly="true"
            aria-label={`Editor de ${set.name}`}
            aria-describedby="sc-task"
            onKeyDown={onKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          >
            {ed.lines.map((text, l) => (
              <div key={l} className={"sc-line" + (text !== ex.goal[l] ? " off" : "")}>
                <span className="sc-num">{l + 1}</span>
                <span className="sc-text">
                  {[...text, " "].map((ch, c) => {
                    const here = l === ed.line && c === ed.col;
                    const cls = (inSel(l, c) ? "sel " : "") + (here ? (bar ? "cur bar" : "cur") : "");
                    return <span key={c} className={cls || undefined}>{ch === " " ? " " : ch}</span>;
                  })}
                </span>
              </div>
            ))}
            {!focused && !result && <div className="sc-hint">Hacé clic acá o enfocá con Tab para empezar</div>}
          </div>
        </div>
        <div className="sc-pane">
          <div className="sc-label">OBJETIVO</div>
          <div className="sc-editor goal" aria-label="Texto objetivo">
            {ex.goal.map((text, l) => (
              <div key={l} className={"sc-line" + (text !== ed.lines[l] ? " want" : "")}>
                <span className="sc-num">{l + 1}</span>
                <span className="sc-text">{text || " "}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="sc-status" aria-live="polite">
        <span>Teclas: <b>{keys}</b> · par {parKeys}</span>
        {!result && ed.mode === "insert" && sameText(ex, ed) && <span className="sc-ready">Texto listo: apretá Esc para terminar</span>}
        <span className="sc-log" aria-hidden="true">{log.map((k, i) => <kbd key={i}>{k}</kbd>)}</span>
      </div>

      {result && (
        <div className="sc-result" role="status">
          <div className="sc-stars" aria-label={`${result.stars} de 3 estrellas`}>
            {[1, 2, 3].map((n) => <span key={n} className={n <= result.stars ? "on" : ""}>★</span>)}
          </div>
          <p>
            {result.keys} teclas (par {parKeys}) en {formatTime(result.ms)}.
            {result.stars < 3 ? ` Con ${parKeys} teclas o menos son tres estrellas.` : " ¡Lo hiciste con el par!"}
            {result.improved ? " Mejoraste tu marca." : ""}
          </p>
          <div className="actions">
            {hasNextEx ? (
              <button ref={nextRef} className="btn primary" onClick={() => reset(index + 1)}>Siguiente ejercicio</button>
            ) : levelDone(state.shortcuts, lv) && nextLevelOpen ? (
              <button ref={nextRef} className="btn primary" onClick={() => onOpen(level + 1)}>Nivel {set.levels[level + 1].name}</button>
            ) : (
              <button ref={nextRef} className="btn primary" onClick={onExit}>Volver a desafíos</button>
            )}
            <button className="btn" onClick={() => reset()}>Repetir</button>
          </div>
        </div>
      )}

      <div className="panel-foot">
        <span>Tab sale del editor · las teclas que no son atajos no cuentan</span>
        <span className="grow" />
        <button className="btn small" onClick={() => reset()}><IconRefresh size={16} /> Reiniciar</button>
        <button className="btn small" onClick={onExit}>Volver a desafíos</button>
      </div>
    </div>
  );
}
