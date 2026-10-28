import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AppState, LangId, Lesson, LessonResult, Profile, Sample } from "../types";
import { LANGS, SYMBOL_INFO, isTrack, stageCount } from "../data/curriculum";
import { TRACKS } from "../tracks/index";
import type { Step } from "../tracks/types";
import { LAYOUTS, comboMap, comboText } from "../data/layouts";
import { dropSymbol, keyHit, spark, wave } from "../fx/fx";
import { makeRng } from "../gen/base";
import { TypingSession } from "../engine/session";
import {
  applySamples, applyStep, buildLesson, canUnlock, lessonScore, nextStage, pickFocus, playableChars, stageInfos,
} from "../engine/stats";
import { getProfile, profileKey, streakDays, today } from "../store";
import { sound } from "../sound";
import { CodeView } from "./CodeView";
import { FINGER_COLORS, Keyboard } from "./Keyboard";
import { KeySet } from "./KeySet";
import { MetricCards } from "./MetricCards";
import { IconCode, IconRefresh, IconSkip } from "./icons";

export type Challenge = { kind: "sprint"; seconds: number } | { kind: "perfect" };

interface Props {
  state: AppState;
  update: (fn: (s: AppState) => AppState) => void;
  lang: LangId;
  challenge: Challenge | null;
  onExitChallenge: () => void;
}

interface Finished {
  title: string;
  wpm: number;
  acc: number;
  record: boolean;
  best?: { wpm: number; acc: number };
}

const challengeKey = (lang: LangId, c: Challenge) => `${lang}:${c.kind === "sprint" ? `sprint${c.seconds}` : "perfect"}`;

export function PracticeView({ state, update, lang, challenge, onExitChallenge }: Props) {
  const settings = state.settings;
  const layout = LAYOUTS[settings.layout];
  const profile = getProfile(state, lang);
  const mode = challenge ? "free" : state.mode;

  const rng = useRef(makeRng());
  const lastLesson = useRef<Lesson | undefined>(undefined);
  const make = useCallback(
    (p: Profile): Lesson => {
      const l = buildLesson(lang, p, settings, mode, rng.current, lastLesson.current);
      lastLesson.current = l;
      return l;
    },
    [lang, settings.layout, settings.excludeMissing, settings.minSamples, settings.targetWpm, settings.minAccuracy, settings.distro, settings.dbEngine, mode],
  );

  const [lesson, setLesson] = useState<Lesson>(() => make(profile));
  const session = useRef(new TypingSession(lesson.text));
  const [version, setVersion] = useState(0);
  const [focused, setFocused] = useState(false);
  const [shake, setShake] = useState(false);
  const [lastRes, setLastRes] = useState<LessonResult | null>(null);
  const [unlock, setUnlock] = useState<string[] | null>(null);
  const [unlockStep, setUnlockStep] = useState<Step | null>(null);
  const [finished, setFinished] = useState<Finished | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [perfectFails, setPerfectFails] = useState(0);
  const [sprintRunning, setSprintRunning] = useState(false);
  const composed = useRef({ data: "", t: 0 });
  const panelRef = useRef<HTMLDivElement>(null);
  const streakRef = useRef(0);
  const dropping = useRef(false);
  const [isDropping, setIsDropping] = useState(false);
  const combos = useMemo(() => comboMap(layout), [layout]);

  /** Racha de aciertos: intensifica el brillo del panel (variable CSS, sin re-render). */
  const setStreak = (n: number) => {
    streakRef.current = n;
    panelRef.current?.style.setProperty("--streak", String(Math.min(1, n / 80)));
  };
  const taRef = useRef<HTMLTextAreaElement>(null);
  const profileRef = useRef(profile);
  profileRef.current = profile;

  // acumulado del sprint
  const sprint = useRef({ chars: 0, errors: 0, correct: 0, running: false, samples: [] as Sample[] });

  const loadLesson = useCallback((l: Lesson) => {
    session.current = new TypingSession(l.text);
    setLesson(l);
    setVersion((v) => v + 1);
  }, []);

  // reconstruye al cambiar lenguaje, layout, modo o desafío
  useEffect(() => {
    sprint.current = { chars: 0, errors: 0, correct: 0, running: false, samples: [] };
    setSprintRunning(false);
    setTimeLeft(challenge?.kind === "sprint" ? challenge.seconds : null);
    setFinished(null);
    setPerfectFails(0);
    loadLesson(make(profileRef.current));
  }, [make, challenge, loadLesson]);

  const focusInput = useCallback(() => taRef.current?.focus(), []);

  /** Guarda muestras y resultado en el perfil; devuelve el perfil nuevo. */
  const commit = useCallback(
    (
      samples: Sample[], result: LessonResult | null, allowUnlock: boolean, step?: string,
    ): { profile: Profile; unlocked: string[] | null; newStep: Step | null } => {
      const p = profileRef.current;
      let np: Profile = { ...p, keys: applySamples(p.keys, samples) };
      if (result) np = { ...np, lessons: [...p.lessons, result].slice(-500), score: p.score + result.score };
      if (result && step) np = { ...np, steps: applyStep(np.steps, step, result.wpm, result.acc) };
      let unlocked: string[] | null = null;
      let newStep: Step | null = null;
      if (allowUnlock && canUnlock(lang, np, settings)) {
        const st = nextStage(lang, np.stage, settings);
        if (isTrack(lang)) newStep = TRACKS[lang].steps[st];
        else unlocked = playableChars(LANGS[lang].stages.slice(np.stage + 1, st + 1).flat(), settings);
        np = { ...np, stage: st };
      }
      const key = profileKey(lang, settings.layout);
      const secs = result ? result.ms / 1000 : 0;
      update((s) => ({
        ...s,
        profiles: { ...s.profiles, [key]: np },
        days: secs ? { ...s.days, [today()]: (s.days[today()] ?? 0) + secs } : s.days,
      }));
      profileRef.current = np;
      return { profile: np, unlocked, newStep };
    },
    [lang, settings, update],
  );

  const finishSprint = useCallback(() => {
    if (!challenge || challenge.kind !== "sprint") return;
    const sp = sprint.current;
    sp.running = false;
    setSprintRunning(false);
    const cur = session.current;
    const partial = cur.samples();
    const r = cur.result();
    const chars = sp.chars + r.chars;
    // la precisión incluye el fallo en la posición donde se cortó el sprint
    const attempted = sp.chars + r.attempted;
    const errors = sp.errors + r.errors;
    const correct = sp.correct + (r.chars - cur.wrong.size);
    const wpm = correct / 5 / (challenge.seconds / 60);
    const acc = attempted ? (attempted - errors) / attempted : 1;
    const res: LessonResult = {
      ts: Date.now(), wpm, acc, chars, ms: challenge.seconds * 1000, score: lessonScore(chars, wpm, acc), kind: "sprint",
    };
    commit(partial, res, false);
    const key = challengeKey(lang, challenge);
    const prev = state.challenges[key];
    const record = !prev || wpm > prev.wpm;
    if (record) update((s) => ({ ...s, challenges: { ...s.challenges, [key]: { wpm, acc, ts: Date.now() } } }));
    if (settings.sound) sound.done();
    setLastRes(res);
    setFinished({ title: `Sprint de ${challenge.seconds} s`, wpm, acc, record, best: prev });
    taRef.current?.blur();
  }, [challenge, commit, lang, settings.sound, state.challenges, update]);

  // temporizador del sprint (se basa en la hora de inicio, no en renders)
  const finishRef = useRef(finishSprint);
  finishRef.current = finishSprint;
  useEffect(() => {
    if (!sprintRunning || challenge?.kind !== "sprint") return;
    const start = performance.now();
    const total = challenge.seconds;
    const id = setInterval(() => {
      const left = Math.max(0, total - Math.floor((performance.now() - start) / 1000));
      setTimeLeft(left);
      if (left <= 0) {
        clearInterval(id);
        finishRef.current();
      }
    }, 200);
    return () => clearInterval(id);
  }, [sprintRunning, challenge]);

  const onLessonDone = useCallback(() => {
    const s = session.current;
    const r = s.result();
    const samples = s.samples();
    const kind = challenge ? (challenge.kind === "sprint" ? "sprint" : "perfect") : lesson.kind;
    const res: LessonResult = {
      ts: Date.now(), wpm: r.wpm, acc: r.acc, chars: r.chars, ms: r.ms, score: lessonScore(r.chars, r.wpm, r.acc), kind,
    };

    if (challenge?.kind === "sprint") {
      const sp = sprint.current;
      sp.chars += r.chars;
      sp.errors += r.errors;
      sp.correct += r.chars - s.wrong.size;
      commit(samples, null, false);
      loadLesson(make(profileRef.current));
      // el siguiente fragmento arranca de inmediato
      session.current.startTs = performance.now();
      session.current.lastTs = performance.now();
      return;
    }

    const { profile: np, unlocked, newStep } = commit(samples, res, !challenge, challenge ? undefined : lesson.step);
    setLastRes(res);

    if (challenge?.kind === "perfect") {
      const key = challengeKey(lang, challenge);
      const prev = state.challenges[key];
      // el récord solo vale con cero errores
      const record = r.errors === 0 && (!prev || r.wpm > prev.wpm);
      if (record) update((st) => ({ ...st, challenges: { ...st.challenges, [key]: { wpm: r.wpm, acc: 1, ts: Date.now() } } }));
      if (settings.sound) sound.done();
      setFinished({ title: "Precisión perfecta", wpm: r.wpm, acc: r.acc, record, best: prev });
      taRef.current?.blur();
      return;
    }

    if (newStep) {
      if (settings.sound) sound.unlock();
      wave();
      taRef.current?.blur();
      setUnlockStep(newStep);
    } else if (unlocked && unlocked.length) {
      if (settings.sound) sound.unlock();
      dropping.current = true;
      setIsDropping(true);
      taRef.current?.blur();
      void dropSymbol(unlocked, unlocked.map((c) => combos.get(c)?.code)).then(() => {
        dropping.current = false;
        setIsDropping(false);
        setUnlock(unlocked);
      });
    } else {
      if (settings.sound) sound.done();
      wave();
    }
    loadLesson(make(np));
  }, [challenge, combos, commit, lang, lesson.kind, lesson.step, loadLesson, make, settings.sound, state.challenges, update]);

  const handleChar = useCallback(
    (ch: string) => {
      if (unlock || unlockStep || finished || dropping.current) return;
      const s = session.current;
      const expected = s.text[s.pos];
      if (challenge?.kind === "sprint" && !sprint.current.running) {
        sprint.current.running = true;
        setSprintRunning(true);
      }
      const res = s.input(ch, performance.now(), settings.errorMode);
      if (res === "ok" || res === "done") {
        const c = combos.get(expected);
        keyHit(c?.code, true);
        spark(c?.code, c ? FINGER_COLORS[c.finger] : "var(--cyan)");
        setStreak(streakRef.current + 1);
      } else if (res === "error") {
        keyHit(combos.get(ch)?.code ?? combos.get(expected)?.code, false);
        setStreak(0);
      }
      if (res === "error") {
        if (settings.sound) sound.error();
        setShake(true);
        setTimeout(() => setShake(false), 160);
        if (challenge?.kind === "perfect") {
          setPerfectFails((n) => n + 1);
          session.current = new TypingSession(s.text);
        }
      } else if (res !== "ignored" && settings.sound) sound.key();
      setVersion((v) => v + 1);
      // un error en el último carácter también cierra el texto (salvo en "perfecta", que ya reinició)
      if (res !== "ignored" && session.current.done) onLessonDone();
    },
    [challenge, combos, finished, onLessonDone, settings.errorMode, settings.sound, unlock, unlockStep],
  );

  const restart = useCallback(() => {
    session.current = new TypingSession(lesson.text);
    setVersion((v) => v + 1);
    focusInput();
  }, [focusInput, lesson.text]);

  const skip = useCallback(() => {
    loadLesson(make(profileRef.current));
    focusInput();
  }, [focusInput, loadLesson, make]);

  const repeatChallenge = useCallback(() => {
    sprint.current = { chars: 0, errors: 0, correct: 0, running: false, samples: [] };
    setSprintRunning(false);
    setFinished(null);
    setPerfectFails(0);
    setTimeLeft(challenge?.kind === "sprint" ? challenge.seconds : null);
    loadLesson(make(profileRef.current));
    setTimeout(focusInput, 0);
  }, [challenge, focusInput, loadLesson, make]);

  // Enter fuera del área de escritura enfoca; Enter en el modal lo cierra
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((unlock || unlockStep) && (e.key === "Enter" || e.key === "Escape")) {
        e.preventDefault();
        setUnlock(null);
        setUnlockStep(null);
        setTimeout(focusInput, 0);
        return;
      }
      if (finished) return;
      const target = e.target as HTMLElement;
      if (target === taRef.current) return;
      if (["INPUT", "SELECT", "TEXTAREA", "BUTTON"].includes(target.tagName)) return;
      if (e.key === "Enter") {
        e.preventDefault();
        focusInput();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [finished, focusInput, unlock, unlockStep]);

  useEffect(() => {
    const t = setTimeout(focusInput, 50);
    return () => clearTimeout(t);
  }, [focusInput, lang]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === "Enter") {
      e.preventDefault();
      handleChar("\n");
    } else if (e.key === "Backspace") {
      e.preventDefault();
      if (session.current.backspace(settings.errorMode)) setVersion((v) => v + 1);
    } else if (e.key === "Escape") {
      e.preventDefault();
      restart();
    }
  };

  const onInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const ne = e.nativeEvent as InputEvent;
    const ta = e.currentTarget;
    if (ne.isComposing) return;
    // pegar o arrastrar texto no es teclear: se descarta
    if (ne.inputType?.startsWith("insertFrom")) {
      ta.value = "";
      return;
    }
    const data = ne.data ?? ta.value;
    ta.value = "";
    // algunos navegadores repiten como input el texto de una composición (teclas muertas)
    if (data === composed.current.data && performance.now() - composed.current.t < 60) return;
    for (const ch of data) if (ch !== "\n" && ch !== "\r") handleChar(ch);
  };

  const onCompositionEnd = (e: React.CompositionEvent<HTMLTextAreaElement>) => {
    const data = e.data;
    e.currentTarget.value = "";
    composed.current = { data, t: performance.now() };
    for (const ch of data) handleChar(ch);
  };

  const s = session.current;
  const next = s.done ? null : s.text[s.pos];
  const infos = useMemo(
    () => stageInfos(lang, mode === "free" ? { ...profile, stage: stageCount(lang) - 1 } : profile, settings),
    [lang, mode, profile, settings],
  );
  const focus = lesson.focus ?? pickFocus(lang, profile, settings);
  const streak = streakDays(state.days);
  const langInfo = LANGS[lang];
  const track = isTrack(lang) ? TRACKS[lang] : null;
  const freeSetting = track?.freeSetting && mode === "free" && !challenge ? track.freeSetting : null;

  return (
    <>
      <MetricCards profile={profile} streak={streak} />

      <div className="frame glow code-panel" ref={panelRef} data-tour="code">
        <div className="code-head">
          <span style={{ color: "var(--cyan)" }}><IconCode size={30} /></span>
          <span className="ttl">ESCRIBE EL CÓDIGO</span>
          {freeSetting && track && (
            <select
              className="variant-select"
              aria-label="Variante para la práctica libre"
              value={settings[freeSetting]}
              onChange={(e) => {
                const v = e.target.value;
                update((st) => ({ ...st, settings: { ...st.settings, [freeSetting]: v } }));
              }}
            >
              {track.variants.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          )}
          {timeLeft !== null && <span className="timer">{timeLeft}s</span>}
          {challenge?.kind === "perfect" && <span className="timer">Fallos: {perfectFails}</span>}
          <div className="tags">
            {lesson.tags.map((t) => <span key={t}>{t}</span>)}
          </div>
        </div>
        <div className="snippet-title">
          <span className="kind">{lesson.label ?? (lesson.kind === "drill" ? "EJERCICIO" : "FUNCIÓN")}</span>
          {lesson.title}
        </div>
        <div data-text={lesson.text} className={"code-box" + (focused ? " typing" : "")} onMouseDown={(e) => { e.preventDefault(); focusInput(); }}>
          <textarea
            ref={taRef}
            className="ta-hidden"
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            aria-label="Área de escritura"
            onKeyDown={onKeyDown}
            onInput={onInput}
            onCompositionEnd={onCompositionEnd}
            onPaste={(e) => e.preventDefault()}
            onDrop={(e) => e.preventDefault()}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
          <CodeView session={s} lang={lesson.kind === "drill" ? null : lang} focus={focus} version={version} shake={shake} />
          {!focused && !unlock && !unlockStep && !finished && !isDropping && (
            <div className="overlay">
              <div className="start-hint">
                Pulsa <b>ENTER</b> o hacé clic para {s.startTs === null ? "comenzar" : "continuar"}
              </div>
            </div>
          )}
        </div>
        <div className="panel-foot">
          {lastRes ? (
            <span className="last">
              Última: <b>{Math.round(lastRes.wpm)} WPM</b> · <b>{(lastRes.acc * 100).toFixed(1)}%</b> · +{lastRes.score} pts
            </span>
          ) : (
            <span>Las sangrías se saltan solas · Enter para saltar de línea · Esc reinicia · Tab sale</span>
          )}
          <span className="grow" />
          <span>
            {langInfo.name} · teclado {layout.short}
          </span>
          <button className="btn small" onClick={restart} title="Reiniciar (Esc)"><IconRefresh size={16} /> Reiniciar</button>
          {!challenge && <button className="btn small" onClick={skip} title="Otra lección"><IconSkip size={16} /> Otra</button>}
          {challenge && <button className="btn small" onClick={onExitChallenge}>Salir del desafío</button>}
        </div>
      </div>

      <KeySet infos={infos} focus={mode === "guided" ? focus : null} next={next} layout={layout} showChips={!challenge} />

      {settings.showKeyboard && <Keyboard layout={layout} next={next} float />}

      {unlock && (
        <div className="modal-back" onClick={() => { setUnlock(null); focusInput(); }}>
          <div className="frame glow modal" onClick={(e) => e.stopPropagation()}>
            <div className="kicker">NUEVO SÍMBOLO DESBLOQUEADO</div>
            <div className="big">{unlock.length > 4 ? "0-9" : unlock.join(" ")}</div>
            <p>{SYMBOL_INFO[unlock[0]] ?? ""}</p>
            {unlock.slice(0, 4).map((ch) => (
              <div key={ch} className="combo">{ch} → {comboText(layout, ch)}</div>
            ))}
            <p style={{ fontSize: 15, marginTop: 14 }}>Las próximas lecciones te van a entrenar este símbolo hasta que lo domines.</p>
            <div className="actions">
              <button className="btn primary" onClick={() => { setUnlock(null); focusInput(); }}>Continuar (Enter)</button>
            </div>
          </div>
        </div>
      )}

      {unlockStep && (
        <div className="modal-back" onClick={() => { setUnlockStep(null); focusInput(); }}>
          <div className="frame glow modal" onClick={(e) => e.stopPropagation()}>
            <div className="kicker">NUEVO ESCALÓN DESBLOQUEADO</div>
            <div className="big" style={{ fontSize: 44, letterSpacing: 2 }}>{unlockStep.name}</div>
            <p>{unlockStep.desc}</p>
            <p style={{ fontSize: 15, marginTop: 14 }}>
              Las próximas lecciones se enfocan en este escalón y lo mezclan con lo que ya dominás.
            </p>
            <div className="actions">
              <button className="btn primary" onClick={() => { setUnlockStep(null); focusInput(); }}>Continuar (Enter)</button>
            </div>
          </div>
        </div>
      )}

      {finished && (
        <div className="modal-back">
          <div className="frame glow modal">
            <div className="kicker">{finished.record ? "¡NUEVO RÉCORD!" : "DESAFÍO TERMINADO"}</div>
            <div className="big" style={{ letterSpacing: 2 }}>{Math.round(finished.wpm)} WPM</div>
            <p>{finished.title} · precisión {(finished.acc * 100).toFixed(1)}%</p>
            {finished.best && !finished.record && <p>Tu récord: {Math.round(finished.best.wpm)} WPM</p>}
            <div className="actions">
              <button className="btn primary" onClick={repeatChallenge}>Repetir</button>
              <button className="btn" onClick={onExitChallenge}>Volver a desafíos</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
