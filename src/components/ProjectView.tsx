import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { AppState, ProjectRecord } from "../types";
import { type Project, PROJECTS, formatTime, projectUnlocked } from "../projects/projects";
import { comboMap, layoutFor } from "../data/layouts";
import { TypingSession } from "../engine/session";
import { keyHit } from "../fx/fx";
import { today } from "../store";
import { sound } from "../sound";
import { CodeView } from "./CodeView";
import { Modal } from "./Modal";
import { ConfirmDialog } from "./ConfirmDialog";
import { Keyboard } from "./Keyboard";
import { IconCode, IconRefresh } from "./icons";

interface Props {
  project: Project;
  state: AppState;
  update: (fn: (s: AppState) => AppState) => void;
  onExit: () => void;
  onOpen: (id: string) => void;
  /** avisa si hay un intento en curso (para preguntar antes de salir) */
  onBusy: (busy: boolean) => void;
}

interface Finished {
  ms: number;
  wpm: number;
  acc: number;
  record: boolean;
  prev?: ProjectRecord;
  unlockedNext: Project | null;
}

const newSessions = (p: Project) =>
  p.files.map((f) => new TypingSession(f.text, { manualIndent: true, tabWidth: f.tabWidth || 4 }));

/**
 * Proyecto completo: se escriben todos los archivos en orden, sangrías incluidas.
 * El cronómetro cuenta solo el tiempo activo: arranca con la primera tecla y se
 * pausa al salir del área de escritura (Esc o clic afuera).
 */
export function ProjectView({ project, state, update, onExit, onOpen, onBusy }: Props) {
  const settings = state.settings;
  const layout = layoutFor(settings);
  const combos = useMemo(() => comboMap(layout), [layout]);
  const sessions = useRef<TypingSession[]>(newSessions(project));
  const [fileIdx, setFileIdx] = useState(0);
  const [version, setVersion] = useState(0);
  const [focused, setFocused] = useState(false);
  const [shake, setShake] = useState(false);
  const [finished, setFinished] = useState<Finished | null>(null);
  const [ask, setAsk] = useState<null | "restart" | "exit">(null);
  const [shownMs, setShownMs] = useState(0);
  const active = useRef({ ms: 0, since: null as number | null });
  const taRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const composed = useRef({ data: "", t: 0 });

  const session = sessions.current[fileIdx];
  const file = project.files[fileIdx];
  const started = fileIdx > 0 || session.startTs !== null;

  useEffect(() => onBusy(started && !finished), [started, finished, onBusy]);
  useEffect(() => () => onBusy(false), [onBusy]);

  const elapsed = () => active.current.ms + (active.current.since === null ? 0 : performance.now() - active.current.since);
  const pause = () => {
    const a = active.current;
    if (a.since !== null) {
      a.ms += performance.now() - a.since;
      a.since = null;
    }
    setShownMs(a.ms);
  };

  // reloj en pantalla mientras corre
  const running = focused && started && !finished;
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setShownMs(elapsed()), 250);
    return () => clearInterval(id);
  }, [running]);

  const focusInput = useCallback(() => taRef.current?.focus(), []);
  useEffect(() => {
    const t = setTimeout(focusInput, 50);
    return () => clearTimeout(t);
  }, [focusInput]);

  // la línea actual siempre a la vista, sin mover la página
  useLayoutEffect(() => {
    const box = scrollRef.current;
    const line = box?.querySelector<HTMLElement>(".code-line.current");
    if (!box || !line) return;
    const top = line.offsetTop;
    const margin = Math.min(120, box.clientHeight / 4);
    if (top < box.scrollTop + margin || top + line.offsetHeight > box.scrollTop + box.clientHeight - margin) {
      box.scrollTop = Math.max(0, top - box.clientHeight / 3);
    }
  }, [version, fileIdx]);

  const finish = useCallback(() => {
    pause();
    const ms = Math.max(1000, active.current.ms);
    let chars = 0;
    let errors = 0;
    for (const s of sessions.current) {
      chars += s.typeable;
      errors += s.errors.size;
    }
    const wpm = chars / 5 / (ms / 60000);
    const acc = chars ? Math.max(0, (chars - errors) / chars) : 1;
    const prev = state.projects[project.id];
    const record = !prev || ms < prev.ms;
    // la primera vez que se termina, se desbloquea el siguiente
    const nextIndex = PROJECTS.findIndex((p) => p.id === project.id) + 1;
    const next = PROJECTS[nextIndex];
    // solo se avisa si el siguiente estaba cerrado: algunos ya se abren con otro proyecto
    const unlockedNext = !prev && next && !projectUnlocked(state.projects, nextIndex) ? next : null;
    update((s) => ({
      ...s,
      projects: record ? { ...s.projects, [project.id]: { ms, wpm, acc, ts: Date.now() } } : s.projects,
      days: { ...s.days, [today()]: (s.days[today()] ?? 0) + ms / 1000 },
    }));
    if (settings.sound) sound.unlock();
    setFinished({ ms, wpm, acc, record, prev, unlockedNext });
    taRef.current?.blur();
  }, [project.id, settings.sound, state.projects, update]);

  /** Aplica una tecla (carácter o Tab) a la sesión del archivo actual. */
  const press = useCallback(
    (key: string) => {
      if (finished || ask) return;
      const s = sessions.current[fileIdx];
      if (active.current.since === null) active.current.since = performance.now();
      const expected = s.text[s.pos];
      const res = key === "\t" ? s.tab(performance.now(), "block") : s.input(key, performance.now(), "block");
      if (res === "error") {
        keyHit(combos.get(key)?.code ?? combos.get(expected)?.code, false);
        if (settings.sound) sound.error();
        setShake(true);
        setTimeout(() => setShake(false), 160);
      } else if (res !== "ignored") {
        keyHit(combos.get(key === "\t" ? "\t" : expected)?.code, true);
        if (settings.sound) sound.key();
      }
      if (s.done) {
        if (fileIdx + 1 < project.files.length) {
          if (settings.sound) sound.done();
          setFileIdx(fileIdx + 1);
        } else {
          finish();
        }
      }
      setVersion((v) => v + 1);
    },
    [ask, combos, fileIdx, finish, finished, project.files.length, settings.sound],
  );

  const restart = () => {
    sessions.current = newSessions(project);
    active.current = { ms: 0, since: null };
    setShownMs(0);
    setFileIdx(0);
    setFinished(null);
    setVersion((v) => v + 1);
    setTimeout(focusInput, 0);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === "Enter") {
      e.preventDefault();
      press("\n");
    } else if (e.key === "Tab") {
      // en los proyectos Tab escribe la sangría; Esc libera el foco
      e.preventDefault();
      if (!e.shiftKey) press("\t");
    } else if (e.key === "Backspace") {
      e.preventDefault();
    } else if (e.key === "Escape") {
      e.preventDefault();
      taRef.current?.blur();
    }
  };

  const onInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const ne = e.nativeEvent as InputEvent;
    const ta = e.currentTarget;
    if (ne.isComposing) return;
    if (ne.inputType?.startsWith("insertFrom")) {
      ta.value = "";
      return;
    }
    const data = ne.data ?? ta.value;
    ta.value = "";
    if (data === composed.current.data && performance.now() - composed.current.t < 60) return;
    for (const ch of data) if (ch !== "\n" && ch !== "\r") press(ch);
  };

  const onCompositionEnd = (e: React.CompositionEvent<HTMLTextAreaElement>) => {
    const data = e.data;
    e.currentTarget.value = "";
    composed.current = { data, t: performance.now() };
    for (const ch of data) press(ch);
  };

  const totalChars = useMemo(() => sessions.current.reduce((n, s) => n + s.typeable, 0), [project]);
  const doneChars = sessions.current.slice(0, fileIdx).reduce((n, s) => n + s.typeable, 0) + session.typedPositions().length;
  const pct = totalChars ? Math.floor((doneChars / totalChars) * 100) : 0;
  const best = state.projects[project.id];
  const next = session.done ? null : session.inIndent() && session.text[session.pos] === " " ? "\t" : session.text[session.pos];
  const nextProject = PROJECTS[PROJECTS.findIndex((p) => p.id === project.id) + 1];

  return (
    <>
      <div className="frame glow code-panel project-panel">
        <div className="code-head">
          <span style={{ color: "var(--cyan)" }}><IconCode size={30} /></span>
          <span className="ttl">Proyecto {String(project.num).padStart(2, "0")} · {project.title}</span>
          <span className="timer" aria-label="Tiempo activo">{formatTime(shownMs)}</span>
          <div className="tags">
            <span>{project.level}</span>
            <span>{pct}%</span>
            {best && <span>récord {formatTime(best.ms)}</span>}
          </div>
        </div>
        <div className="project-files" role="list" aria-label="Archivos del proyecto">
          {project.files.map((f, i) => (
            <span key={f.name} role="listitem" className={`pf ${i < fileIdx ? "done" : i === fileIdx ? "current" : ""}`}>
              {i < fileIdx ? "✓ " : ""}{f.name}
            </span>
          ))}
        </div>
        <div className="progress project-progress"><span style={{ width: `${pct}%` }} /></div>
        <div className={"code-box project-box" + (focused ? " typing" : "")} data-text={file.text} onMouseDown={(e) => { e.preventDefault(); focusInput(); }}>
          <textarea
            ref={taRef}
            className="ta-hidden"
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            aria-label={`Área de escritura: ${file.name}`}
            onKeyDown={onKeyDown}
            onInput={onInput}
            onCompositionEnd={onCompositionEnd}
            onPaste={(e) => e.preventDefault()}
            onDrop={(e) => e.preventDefault()}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              setFocused(false);
              pause();
            }}
          />
          <div className="project-scroll" ref={scrollRef}>
            <CodeView session={session} lang={file.lang} focus={null} version={version} shake={shake} />
          </div>
          {!focused && !finished && !ask && (
            <div className="overlay">
              <div className="start-hint">
                {started ? <>EN PAUSA · Pulsa <b>ENTER</b> o hacé clic para seguir</> : <>Pulsa <b>ENTER</b> o hacé clic para empezar · el reloj arranca con la primera tecla</>}
              </div>
            </div>
          )}
        </div>
        <div className="panel-foot">
          <span title="Enter: nueva línea · los errores no avanzan">Tab: sangría · Esc: pausa</span>
          <span className="grow" />
          <span>Archivo {fileIdx + 1} de {project.files.length}</span>
          <button className="btn small" onClick={() => (started ? setAsk("restart") : restart())} title="Empezar de nuevo"><IconRefresh size={16} /> Reiniciar</button>
          <button className="btn small" onClick={() => (started && !finished ? setAsk("exit") : onExit())}>Salir del proyecto</button>
        </div>
      </div>

      {settings.showKeyboard && <Keyboard layout={layout} next={next} float />}

      <ProjectKeys focused={focused} finished={!!finished} ask={!!ask} onFocus={focusInput} />

      {ask && (
        <ConfirmDialog
          kicker={ask === "restart" ? "REINICIAR" : "SALIR"}
          title={ask === "restart" ? "¿Empezar el proyecto de nuevo?" : "¿Salir del proyecto?"}
          message="Vas a perder el avance de este intento. Tus récords anteriores quedan guardados."
          confirmLabel={ask === "restart" ? "Sí, reiniciar" : "Sí, salir"}
          cancelLabel="Seguir escribiendo"
          onConfirm={() => {
            const what = ask;
            setAsk(null);
            if (what === "restart") restart();
            else {
              onBusy(false);
              onExit();
            }
          }}
          onCancel={() => {
            setAsk(null);
            setTimeout(focusInput, 0);
          }}
        />
      )}

      {finished && (
        <Modal labelledBy="pf-title">
          <div className="kicker">{finished.record ? (finished.prev ? "¡Nuevo récord!" : "¡Proyecto terminado!") : "Proyecto terminado"}</div>
          <div id="pf-title" className="big" style={{ letterSpacing: 2 }}>{formatTime(finished.ms)}</div>
          <p>{project.title} · {Math.round(finished.wpm)} WPM · precisión {(finished.acc * 100).toFixed(1)}%</p>
          {finished.prev && !finished.record && <p>Tu récord: {formatTime(finished.prev.ms)}</p>}
          {finished.record && finished.prev && <p>Mejoraste {formatTime(finished.prev.ms - finished.ms)} respecto de tu marca anterior.</p>}
          {finished.unlockedNext && <p className="unlocked">Desbloqueaste el proyecto {finished.unlockedNext.num}: {finished.unlockedNext.title}</p>}
          {!nextProject && <p className="unlocked">Terminaste el último proyecto. ¡Sos un maestro del teclado!</p>}
          <div className="actions">
            {nextProject && <button className="btn primary" autoFocus onClick={() => onOpen(nextProject.id)}>Siguiente proyecto</button>}
            <button className={"btn" + (nextProject ? "" : " primary")} autoFocus={!nextProject} onClick={restart}>Repetir</button>
            <button className="btn" onClick={onExit}>Volver a desafíos</button>
          </div>
        </Modal>
      )}
    </>
  );
}

/** Enter fuera del área de escritura la enfoca (igual que en la práctica). */
function ProjectKeys({ focused, finished, ask, onFocus }: { focused: boolean; finished: boolean; ask: boolean; onFocus: () => void }) {
  useEffect(() => {
    if (focused || finished || ask) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (["INPUT", "SELECT", "TEXTAREA", "BUTTON", "A"].includes(t.tagName)) return;
      if (e.key === "Enter") {
        e.preventDefault();
        onFocus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ask, finished, focused, onFocus]);
  return null;
}
