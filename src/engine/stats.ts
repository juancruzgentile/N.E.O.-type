import type { KeyStat, LangId, Lesson, Mode, Profile, Sample, Settings } from "../types";
import { LANGS, allChars, unlockedChars } from "../data/curriculum";
import { LAYOUTS, isTypeable } from "../data/layouts";
import { type Rng } from "../gen/base";
import { findSnippet, randomSnippet, snippetLesson } from "../gen/index";
import { drillLesson } from "../gen/drills";

const RECENT = 50;
const ALPHA = 0.1;
/** pausas más largas no cuentan como tiempo de tecla */
export const MAX_SAMPLE_MS = 2500;

export const emptyProfile = (): Profile => ({ stage: 0, keys: {}, lessons: [], score: 0 });

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
  if (p.stage >= LANGS[lang].stages.length - 1) return false;
  const infos = stageInfos(lang, p, s).filter((k) => k.state !== "locked");
  return infos.length > 0 && infos.every((k) => k.state === "mastered");
}

/** Siguiente etapa con al menos un carácter escribible en el layout. */
export function nextStage(lang: LangId, stage: number, s: Settings): number {
  const stages = LANGS[lang].stages;
  let st = stage + 1;
  while (st < stages.length - 1 && playableChars(stages[st], s).length === 0) st++;
  return Math.min(st, stages.length - 1);
}

export function progressToNext(lang: LangId, p: Profile, s: Settings): { mastered: number; total: number } {
  const infos = stageInfos(lang, p, s).filter((k) => k.state !== "locked");
  return { mastered: infos.filter((k) => k.state === "mastered").length, total: infos.length };
}

export function buildLesson(lang: LangId, p: Profile, s: Settings, mode: Mode, rng: Rng, lastConcept?: string): Lesson {
  if (mode === "free") {
    const allowed = fullSet(lang, s);
    const focus = pickFocus(lang, { ...p, stage: LANGS[lang].stages.length - 1 }, s);
    const sn = findSnippet(lang, allowed, null, rng, lastConcept ? [lastConcept as never] : [], 40) ?? randomSnippet(lang, rng);
    return snippetLesson(sn, focus);
  }
  const allowed = unlockedSet(lang, p.stage, s);
  const focus = pickFocus(lang, p, s);
  if (!focus) return drillLesson(allowed, "(", rng);
  const info = keyInfo(focus, p.keys[focus], s, true);
  // símbolo recién desbloqueado o con pocas muestras → ejercicio dirigido
  if (info.state === "new" && info.samples < s.minSamples) return drillLesson(allowed, focus, rng);
  // calibrado → código real que lo use; si no hay todavía, ejercicio
  const sn = findSnippet(lang, allowed, focus, rng, lastConcept ? [lastConcept as never] : []);
  if (sn && rng() < 0.75) return snippetLesson(sn, focus);
  return drillLesson(allowed, focus, rng);
}

export function lessonScore(chars: number, wpm: number, acc: number): number {
  return Math.round(chars * (wpm / 10) * acc * acc);
}
