import type { KeyStat, LangId, Lesson, Mode, Profile, Sample, Settings, StepStat, TrackId } from "../types";
import { LANGS, allChars, stageCount, unlockedChars } from "../data/curriculum";
import { LAYOUTS, isTypeable } from "../data/layouts";
import { type Rng, int } from "../gen/base";
import { TRACKS, freeExercise, isTrack, stepExercise } from "../tracks/index";
import { variantName } from "../tracks/types";
import { findSnippet, randomSnippet, snippetLesson } from "../gen/index";
import { drillLesson } from "../gen/drills";

const RECENT = 50;
const ALPHA = 0.1;
/** pausas más largas no cuentan como tiempo de tecla */
export const MAX_SAMPLE_MS = 2500;

export const emptyProfile = (): Profile => ({ stage: 0, steps: {}, keys: {}, lessons: [], score: 0 });

export const targetMs = (wpm: number) => 12000 / wpm;
export const msToWpm = (ms: number) => (ms > 0 ? 12000 / ms : 0);

export function applySamples(keys: Record<string, KeyStat>, samples: Sample[]): Record<string, KeyStat> {
  const out = { ...keys };
  for (const s of samples) {
    const prev = out[s.char] ?? { n: 0, ema: 0, hits: 0, misses: 0, recent: "" };
    const k: KeyStat = { ...prev };
    if (s.error) k.misses++;
    else k.hits++;
    k.recent = (k.recent + (s.error ? "0" : "1")).slice(-RECENT);
    if (s.ms !== null && s.ms > 0 && s.ms < MAX_SAMPLE_MS) {
      k.ema = k.n === 0 ? s.ms : k.ema * (1 - ALPHA) + s.ms * ALPHA;
      k.n++;
    }
    out[s.char] = k;
  }
  return out;
}

export const recentAccuracy = (k: KeyStat | undefined) => {
  if (!k || k.recent.length === 0) return 0;
  let ones = 0;
  for (const c of k.recent) if (c === "1") ones++;
  return ones / k.recent.length;
};

export type KeyState = "locked" | "new" | "learning" | "mastered";

export interface KeyInfo {
  char: string;
  state: KeyState;
  /** 0..1 o null si no está calibrada */
  confidence: number | null;
  samples: number;
  accuracy: number;
  wpm: number;
}

export function keyInfo(char: string, k: KeyStat | undefined, s: Settings, unlocked: boolean): KeyInfo {
  const samples = k?.n ?? 0;
  const accuracy = recentAccuracy(k);
  const wpm = k && k.n ? msToWpm(k.ema) : 0;
  if (!unlocked) return { char, state: "locked", confidence: null, samples, accuracy, wpm };
  if (!k || samples < s.minSamples) {
    return { char, state: "new", confidence: null, samples, accuracy, wpm };
  }
  const speed = Math.min(1, targetMs(s.targetWpm) / k.ema);
  const accOk = accuracy * 100 >= s.minAccuracy;
  const confidence = Math.min(speed, accOk ? 1 : Math.min(0.99, accuracy));
  const mastered = speed >= 1 && accOk;
  return { char, state: mastered ? "mastered" : "learning", confidence, samples, accuracy, wpm };
}

/** Caracteres de la etapa que se pueden escribir en el layout (los demás se saltan si así se configuró). */
export function playableChars(chars: string[], s: Settings): string[] {
  const layout = LAYOUTS[s.layout];
  return s.excludeMissing ? chars.filter((c) => isTypeable(layout, c)) : chars;
}

export function unlockedSet(lang: LangId, stage: number, s: Settings): Set<string> {
  return new Set(playableChars(unlockedChars(lang, stage), s));
}

export function fullSet(lang: LangId, s: Settings): Set<string> {
  return new Set(playableChars(allChars(lang), s));
}

export function stageInfos(lang: LangId, p: Profile, s: Settings): KeyInfo[] {
  const unlocked = unlockedSet(lang, p.stage, s);
  return playableChars(allChars(lang), s).map((ch) => keyInfo(ch, p.keys[ch], s, unlocked.has(ch)));
}

/** Símbolo foco: el desbloqueado más débil (los nuevos primero). */
export function pickFocus(lang: LangId, p: Profile, s: Settings): string | null {
  const infos = stageInfos(lang, p, s).filter((k) => k.state !== "locked");
  const weak = infos.filter((k) => k.state !== "mastered");
  const pool = weak.length ? weak : infos;
  if (!pool.length) return null;
  // nuevos: menos muestras primero; calibrados: menor confianza primero
  const score = (k: KeyInfo) => (k.confidence === null ? -1 + k.samples / Math.max(1, s.minSamples) : k.confidence);
  return [...pool].sort((a, b) => score(a) - score(b))[0].char;
}

/** ¿Están todos los símbolos desbloqueados dominados? → toca desbloquear la siguiente etapa. */
export function canUnlock(lang: LangId, p: Profile, s: Settings): boolean {
  if (p.stage >= stageCount(lang) - 1) return false;
  if (isTrack(lang)) {
    const open = stepInfos(lang, p, s).filter((x) => x.state !== "locked");
    return open.every((x) => x.state === "mastered");
  }
  const infos = stageInfos(lang, p, s).filter((k) => k.state !== "locked");
  return infos.length > 0 && infos.every((k) => k.state === "mastered");
}

/** Siguiente etapa con al menos un carácter escribible en el layout. */
export function nextStage(lang: LangId, stage: number, s: Settings): number {
  if (isTrack(lang)) return Math.min(stage + 1, stageCount(lang) - 1);
  const stages = LANGS[lang].stages;
  let st = stage + 1;
  while (st < stages.length - 1 && playableChars(stages[st], s).length === 0) st++;
  return Math.min(st, stages.length - 1);
}

export function progressToNext(lang: LangId, p: Profile, s: Settings): { mastered: number; total: number } {
  if (isTrack(lang)) {
    const open = stepInfos(lang, p, s).filter((x) => x.state !== "locked");
    return { mastered: open.filter((x) => x.state === "mastered").length, total: open.length };
  }
  const infos = stageInfos(lang, p, s).filter((k) => k.state !== "locked");
  return { mastered: infos.filter((k) => k.state === "mastered").length, total: infos.length };
}

/** `last`: lección anterior, para no repetir su concepto (lenguajes) o su título (rutas). */
export function buildLesson(lang: LangId, p: Profile, s: Settings, mode: Mode, rng: Rng, last?: Lesson): Lesson {
  if (isTrack(lang)) return trackLesson(lang, p, s, mode, rng, last?.title);
  const avoid = last?.concept ? [last.concept] : [];
  if (mode === "free") {
    const allowed = fullSet(lang, s);
    const focus = pickFocus(lang, { ...p, stage: LANGS[lang].stages.length - 1 }, s);
    const sn = findSnippet(lang, allowed, null, rng, avoid, 40) ?? randomSnippet(lang, rng);
    return snippetLesson(sn, focus);
  }
  const allowed = unlockedSet(lang, p.stage, s);
  const focus = pickFocus(lang, p, s);
  if (!focus) return drillLesson(allowed, "(", rng);
  const info = keyInfo(focus, p.keys[focus], s, true);
  // símbolo recién desbloqueado o con pocas muestras → ejercicio dirigido
  if (info.state === "new" && info.samples < s.minSamples) return drillLesson(allowed, focus, rng);
  // calibrado → código real que lo use; si no hay todavía, ejercicio
  const sn = findSnippet(lang, allowed, focus, rng, avoid);
  if (sn && rng() < 0.75) return snippetLesson(sn, focus);
  return drillLesson(allowed, focus, rng);
}

export function lessonScore(chars: number, wpm: number, acc: number): number {
  return Math.round(chars * (wpm / 10) * acc * acc);
}

// ─────────────────────────── Rutas Trainee (progreso por escalones) ───────────────────────────

/** Lecciones recientes que se promedian para decidir si un escalón está dominado. */
export const STEP_WINDOW = 3;
const STEP_KEEP = 5;

export function applyStep(steps: Record<string, StepStat>, id: string, wpm: number, acc: number): Record<string, StepStat> {
  const prev = steps[id] ?? { n: 0, w: [], a: [] };
  return {
    ...steps,
    [id]: { n: prev.n + 1, w: [...prev.w, wpm].slice(-STEP_KEEP), a: [...prev.a, acc].slice(-STEP_KEEP) },
  };
}

export interface StepInfo {
  index: number;
  id: string;
  name: string;
  desc: string;
  state: KeyState;
  lessons: number;
  /** promedio de las últimas STEP_WINDOW lecciones (null si todavía no hay suficientes) */
  wpm: number | null;
  acc: number | null;
  /** 0..1 o null si no está calibrado */
  confidence: number | null;
}

const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

export function stepInfos(track: TrackId, p: Profile, s: Settings): StepInfo[] {
  return TRACKS[track].steps.map((st, index) => {
    const stat = p.steps[st.id];
    const base = { index, id: st.id, name: st.name, desc: st.desc, lessons: stat?.n ?? 0 };
    if (index > p.stage) return { ...base, state: "locked", wpm: null, acc: null, confidence: null };
    if (!stat || stat.w.length < STEP_WINDOW) return { ...base, state: "new", wpm: null, acc: null, confidence: null };
    const wpm = avg(stat.w.slice(-STEP_WINDOW));
    const acc = avg(stat.a.slice(-STEP_WINDOW));
    const speed = Math.min(1, wpm / s.targetWpm);
    const accOk = acc * 100 >= s.minAccuracy;
    const confidence = Math.min(speed, accOk ? 1 : Math.min(0.99, acc));
    return { ...base, state: speed >= 1 && accOk ? "mastered" : "learning", wpm, acc, confidence };
  });
}

/** Escalón foco: el desbloqueado más débil (los que todavía no se calibraron primero, el más nuevo antes). */
export function pickStep(track: TrackId, p: Profile, s: Settings): number {
  const open = stepInfos(track, p, s).filter((x) => x.state !== "locked");
  const fresh = open.filter((x) => x.state === "new");
  if (fresh.length) return fresh[fresh.length - 1].index;
  const weak = open.filter((x) => x.state !== "mastered");
  if (!weak.length) return open[open.length - 1].index;
  return [...weak].sort((a, b) => (a.confidence ?? 0) - (b.confidence ?? 0))[0].index;
}

/** Símbolo más débil entre los que aparecen en el texto (para resaltarlo). */
function weakestIn(lang: LangId, text: string, p: Profile, s: Settings): string | null {
  const present = new Set(text);
  const infos = stageInfos(lang, p, s).filter((k) => present.has(k.char) && k.state !== "mastered");
  if (!infos.length) return null;
  const score = (k: KeyInfo) => (k.confidence === null ? -1 + k.samples / Math.max(1, s.minSamples) : k.confidence);
  return [...infos].sort((a, b) => score(a) - score(b))[0].char;
}

function trackLesson(id: TrackId, p: Profile, s: Settings, mode: Mode, rng: Rng, last?: string): Lesson {
  const t = TRACKS[id];
  const allowed = fullSet(id, s);
  let e = null;
  for (let tries = 0; tries < 3; tries++) {
    if (mode === "free") {
      e = freeExercise(t, t.freeSetting ? s[t.freeSetting] : null, rng, allowed);
    } else {
      const focus = pickStep(id, p, s);
      // la mayoría de las lecciones van al escalón más débil; el resto repasa lo ya desbloqueado
      const idx = p.stage === 0 || rng() < 0.65 ? focus : int(rng, 0, p.stage);
      e = stepExercise(t, idx, rng, allowed) ?? stepExercise(t, focus, rng, allowed);
    }
    if (e && e.title !== last) break;
  }
  // último recurso (no debería pasar: scripts/check-generators lo verifica para cada teclado)
  e ??= freeExercise(t, null, rng, new Set(t.symbols))!;
  const stepIdx = t.steps.findIndex((x) => x.id === e.step);
  return {
    kind: "code",
    label: t.label,
    title: e.title,
    tags: [e.variant ? variantName(t, e.variant) : LANGS[id].name, mode === "free" ? "Práctica libre" : `Escalón ${stepIdx + 1}`],
    text: e.text,
    focus: weakestIn(id, e.text, p, s),
    step: mode === "guided" ? e.step : undefined,
  };
}
