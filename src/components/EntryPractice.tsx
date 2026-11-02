import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { AppState, ReviewItem } from "../types";
import type { Entry, Topic } from "../library/types";
import { entryId } from "../library/search";
import { PASS_ACC, grade, practiceText, whenText } from "../review/review";
import { comboMap, layoutFor } from "../data/layouts";
import { TypingSession } from "../engine/session";
import { keyHit } from "../fx/fx";
import { today } from "../store";
import { sound } from "../sound";
import { CodeView } from "./CodeView";
import { IconRefresh } from "./icons";

interface Props {
  topic: Topic;
  entry: Entry;
  state: AppState;
  update: (fn: (s: AppState) => AppState) => void;
  onClose: () => void;
}

interface Done {
  wpm: number;
  acc: number;
  item: ReviewItem;
  counted: boolean;
  isNew: boolean;
}

/** Lección corta con el ejemplo de una entrada; al terminarla, la entrada entra al repaso. */
export function EntryPractice({ topic, entry, state, update, onClose }: Props) {
  const settings = state.settings;
  const combos = useMemo(() => comboMap(layoutFor(settings)), [settings]);
  const text = useMemo(() => practiceText(entry.code), [entry.code]);
  const id = entryId(topic, entry);
  const session = useRef(new TypingSession(text));
  const [version, setVersion] = useState(0);
  const [focused, setFocused] = useState(false);
  const [shake, setShake] = useState(false);
  const [done, setDone] = useState<Done | null>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const composed = useRef({ data: "", t: 0 });
  const bump = () => setVersion((v) => v + 1);

  const focusInput = useCallback(() => taRef.current?.focus(), []);
  useEffect(() => {
    const t = setTimeout(focusInput, 50);
    return () => clearTimeout(t);
  }, [focusInput]);

  const finish = () => {
    const r = session.current.result();
    const day = today();
    const prev = state.review[id];
    const { item, counted } = grade(prev, r.acc, day);
    update((s) => ({
      ...s,
      review: { ...s.review, [id]: item },
      days: { ...s.days, [day]: (s.days[day] ?? 0) + r.ms / 1000 },
    }));
    if (settings.sound) sound.done();
    setDone({ wpm: r.wpm, acc: r.acc, item, counted, isNew: !prev });
    taRef.current?.blur();
  };

  const press = (ch: string) => {
    if (done) return;
    const s = session.current;
    const expected = s.text[s.pos];
    const res = s.input(ch, performance.now(), settings.errorMode);
    if (res === "error") {
      keyHit(combos.get(ch)?.code ?? combos.get(expected)?.code, false);
      if (settings.sound) sound.error();
      setShake(true);
      setTimeout(() => setShake(false), 160);
    } else if (res !== "ignored") {
      keyHit(combos.get(expected)?.code, true);
      if (settings.sound) sound.key();
    }
    bump();
    if (res !== "ignored" && s.done) finish();
  };

  const restart = () => {
    session.current = new TypingSession(text);
    setDone(null);
    bump();
    setTimeout(focusInput, 0);
  };

  // Esc cierra (también con el foco fuera del área de escritura); Enter en el resultado repite
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      } else if (e.key === "Enter" && !focused && !done && (e.target as HTMLElement).tagName !== "BUTTON") {
        e.preventDefault();
        focusInput();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [done, focusInput, focused, onClose]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === "Enter") {
      e.preventDefault();
      press("\n");
    } else if (e.key === "Backspace") {
      e.preventDefault();
      if (session.current.backspace(settings.errorMode)) bump();
    } else if (e.key === "Tab") {
      e.preventDefault();
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

  const s = session.current;
  // el ejemplo original tiene tildes o símbolos que se cambiaron para poder escribirlo
  const changed = /[^\x00-\x7e]/.test(entry.code);

  // en un portal: dentro de la vista animada el fondo fijo quedaría corrido
  return createPortal(
    <div className="modal-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="frame glow modal entry-practice" role="dialog" aria-modal="true" aria-labelledby="ep-title">
        <div className="kicker">PRACTICAR EJEMPLO · {topic.name.toUpperCase()}</div>
        <h3 id="ep-title" className="ep-title">{entry.name}</h3>

        {done ? (
          <div className="ep-result">
            <div className="big" style={{ letterSpacing: 2 }}>{Math.round(done.wpm)} WPM</div>
            <p>Precisión {(done.acc * 100).toFixed(1)}%</p>
            <p className="ep-review">
              {!done.counted
                ? `Ya estaba en tu repaso y ${whenText(done.item, today())}. Practicarlo otra vez hoy no cambia la fecha.`
                : done.acc >= PASS_ACC
                  ? `${done.isNew ? "Quedó en tu repaso" : "Bien repasado"}: ${whenText(done.item, today())}, mezclado en tus lecciones.`
                  : `Quedó en tu repaso con ${(done.acc * 100).toFixed(0)}% de precisión: te lo vuelvo a pedir mañana en tus lecciones.`}
            </p>
            <div className="actions">
              <button className="btn primary" autoFocus onClick={restart}>Repetir</button>
              <button className="btn" onClick={onClose}>Volver a la Biblioteca</button>
            </div>
          </div>
        ) : (
          <>
            <div
              className={"code-box ep-box" + (focused ? " typing" : "")}
              data-text={text}
              onMouseDown={(e) => {
                e.preventDefault();
                focusInput();
              }}
            >
              <textarea
                ref={taRef}
                className="ta-hidden"
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                aria-label={`Área de escritura: ${entry.name}`}
                onKeyDown={onKeyDown}
                onInput={onInput}
                onCompositionEnd={onCompositionEnd}
                onPaste={(e) => e.preventDefault()}
                onDrop={(e) => e.preventDefault()}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
              />
              <CodeView session={s} lang={topic.hl} focus={null} version={version} shake={shake} />
              {!focused && (
                <div className="overlay">
                  <div className="start-hint">Pulsa <b>ENTER</b> o hacé clic para {s.startTs === null ? "empezar" : "seguir"}</div>
                </div>
              )}
            </div>
            <div className="panel-foot">
              <span>{changed ? "Sin tildes para practicar · " : ""}Esc cierra</span>
              <span className="grow" />
              <button className="btn small" onClick={restart}><IconRefresh size={16} /> Reiniciar</button>
              <button className="btn small" onClick={onClose}>Cerrar</button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
