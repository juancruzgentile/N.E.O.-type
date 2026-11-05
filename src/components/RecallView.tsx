import { useEffect, useRef, useState } from "react";
import type { AppState } from "../types";
import { type Verdict, check } from "../recall/check";
import { type RecallTopic, levelDone, levelOpen } from "../recall/exercises";
import { sound } from "../sound";

interface Props {
  topic: RecallTopic;
  level: number;
  state: AppState;
  update: (fn: (s: AppState) => AppState) => void;
  onExit: () => void;
  onOpen: (level: number) => void;
}

/** Un nivel de ejercicios de memoria: consigna, respuesta escrita y corrección. */
export function RecallView({ topic, level, state, update, onExit, onOpen }: Props) {
  const lv = topic.levels[level];
  const done = state.recall;
  // arranca en el primero sin resolver; si ya estaban todos, desde el principio
  const [index, setIndex] = useState(() => Math.max(0, lv.exercises.findIndex((e) => !done[e.id])));
  const [value, setValue] = useState("");
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [finished, setFinished] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const ex = lv.exercises[index];
  const passed = verdict?.status === "ok" || verdict?.status === "minor";

  useEffect(() => {
    if (passed) nextRef.current?.focus();
    else inputRef.current?.focus();
  }, [passed, index, finished]);

  const submit = () => {
    if (passed) return;
    const v = check(value, ex.answers, topic.kind);
    setVerdict(v);
    if (v.status === "wrong") {
      if (state.settings.sound) sound.error();
      return;
    }
    if (state.settings.sound) sound.done();
    if (!done[ex.id]) update((s) => ({ ...s, recall: { ...s.recall, [ex.id]: Date.now() } }));
  };

  const next = () => {
    setValue("");
    setVerdict(null);
    setShowHint(false);
    if (index + 1 < lv.exercises.length) setIndex(index + 1);
    else setFinished(true);
  };

  const hasNext = level + 1 < topic.levels.length;
  const nextOpen = hasNext && levelOpen(done, topic, level + 1);

  if (finished) {
    return (
      <div className="frame view recall">
        <div className="kicker">Ejercicios de memoria · {topic.name} · {lv.name}</div>
        <h2>{levelDone(done, lv) ? "¡Nivel completo!" : "Fin del nivel"}</h2>
        <p className="sub">
          {nextOpen
            ? `Se abrió el nivel ${topic.levels[level + 1].name}.`
            : hasNext
              ? "Te quedan ejercicios sin resolver en este nivel."
              : `Terminaste todos los niveles de ${topic.name}.`}
        </p>
        <div className="actions">
          {nextOpen && <button className="btn primary" onClick={() => onOpen(level + 1)}>Nivel {topic.levels[level + 1].name}</button>}
          <button className={"btn" + (nextOpen ? "" : " primary")} onClick={() => onOpen(level)}>Repetir el nivel</button>
          <button className="btn" onClick={onExit}>Volver a desafíos</button>
        </div>
      </div>
    );
  }

  return (
    <div className="frame view recall">
      <div className="kicker">Ejercicios de memoria · {topic.name} · {lv.name}</div>
      <div className="recall-steps" aria-label={`Ejercicio ${index + 1} de ${lv.exercises.length}`}>
        {lv.exercises.map((e, i) => (
          <span key={e.id} className={(i === index ? "now " : "") + (done[e.id] ? "done" : "")} />
        ))}
        <span className="recall-count">{index + 1}/{lv.exercises.length}</span>
      </div>
      <h2 className="recall-prompt" id="recall-prompt">{ex.prompt}</h2>

      <form
        className="recall-form"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <input
          ref={inputRef}
          className="recall-input"
          value={value}
          readOnly={passed}
          onChange={(e) => {
            setValue(e.target.value);
            if (verdict?.status === "wrong") setVerdict(null);
          }}
          aria-labelledby="recall-prompt"
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder={topic.kind === "shell" ? "$ escribí el comando" : topic.kind === "sql" ? "escribí la consulta" : "escribí el código"}
        />
        {!passed && <button className="btn primary" type="submit">Comprobar</button>}
      </form>

      <div className="recall-feedback" role="status" aria-live="polite">
        {verdict?.status === "ok" && (
          <div className="rf ok">
            <b>¡Bien!</b> {ex.why}
          </div>
        )}
        {verdict?.status === "minor" && (
          <div className="rf minor">
            <b>Vale, con un detalle.</b>
            <ul>{verdict.notes.map((n) => <li key={n}>{n}</li>)}</ul>
            <div>Respuesta de referencia: <code>{verdict.expected}</code></div>
            <div>{ex.why}</div>
          </div>
        )}
        {verdict?.status === "wrong" && (
          <div className="rf wrong">
            <b>Todavía no.</b> {verdict.reason}
            {showHint ? (
              <div className="rf-hint">Pista: {ex.hint}</div>
            ) : (
              <button type="button" className="btn small" onClick={() => setShowHint(true)}>Ver una pista</button>
            )}
          </div>
        )}
      </div>

      <div className="panel-foot">
        <span>Enter comprueba · se aceptan detalles de estilo, no otro comando</span>
        <span className="grow" />
        {passed && <button ref={nextRef} className="btn primary small" onClick={next}>{index + 1 < lv.exercises.length ? "Siguiente" : "Terminar"}</button>}
        <button className="btn small" onClick={onExit}>Volver a desafíos</button>
      </div>
    </div>
  );
}
