// Validación estricta de todo dato que entra a la app (localStorage o archivo importado).
// Se reconstruye el estado desde cero copiando solo claves conocidas y valores del tipo
// esperado: un archivo manipulado no puede inyectar propiedades, contaminar prototipos
// (__proto__, constructor), meter URLs externas ni valores que rompan la interfaz.

import type {
  AppState, ChallengeRecord, DbEngineId, DistroId, ErrorMode, KeyStat, LangId, LayoutId, LessonResult, Mode, Profile, Settings,
  StepStat, ThemeId,
} from "./types";

export const MAX_IMPORT_BYTES = 5 * 1024 * 1024;
export const MAX_AVATAR_CHARS = 400_000;

const LANG_IDS: LangId[] = ["python", "javascript", "typescript", "java", "csharp", "go", "rust", "sql", "linux", "html", "css", "formats"];
const DISTRO_IDS: DistroId[] = ["ubuntu", "debian", "mint", "cachyos", "arch", "fedora"];
const DB_IDS: DbEngineId[] = ["sqlite", "mysql", "postgresql", "mongodb"];
const LAYOUT_IDS: LayoutId[] = ["it", "us", "es", "latam"];
const THEME_IDS: ThemeId[] = ["cyber", "neon", "synthwave", "matrix", "tokyo", "light"];
const ERROR_MODES: ErrorMode[] = ["block", "advance", "strict"];
const MODES: Mode[] = ["guided", "free"];
const KINDS: LessonResult["kind"][] = ["drill", "code", "sprint", "perfect"];

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const has = (o: Record<string, unknown>, k: string) => Object.prototype.hasOwnProperty.call(o, k);
const num = (v: unknown, min: number, max: number, def: number) =>
  typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : def;
const int = (v: unknown, min: number, max: number, def: number) => Math.round(num(v, min, max, def));
const bool = (v: unknown, def: boolean) => (typeof v === "boolean" ? v : def);
const oneOf = <T extends string>(v: unknown, list: readonly T[], def: T): T => (list.includes(v as T) ? (v as T) : def);

/** Texto visible: sin caracteres de control ni direccionales (evita suplantaciones visuales). */
function text(v: unknown, max: number, def: string): string {
  if (typeof v !== "string") return def;
  return v.replace(/[\u0000-\u001f\u007f-\u009f​-‏‪-‮⁦-⁩﻿]/g, "").slice(0, max);
}

/** Avatar: iniciales, un prediseñado o una imagen embebida (nunca una URL externa). */
export function safeAvatar(v: unknown): string {
  if (typeof v !== "string" || v === "") return "";
  if (/^preset:[a-z]{1,20}$/.test(v)) return v;
  if (
    v.length <= MAX_AVATAR_CHARS &&
    /^img:data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(v)
  ) {
    return v;
  }
  return "";
}

/** Recorre solo claves propias que cumplan el patrón; ignora __proto__ y similares. */
function entries(v: unknown, keyRe: RegExp, limit: number): [string, unknown][] {
  if (!isObj(v)) return [];
  const out: [string, unknown][] = [];
  for (const k of Object.keys(v)) {
    if (out.length >= limit) break;
    if (k === "__proto__" || k === "constructor" || k === "prototype") continue;
    if (keyRe.test(k)) out.push([k, v[k]]);
  }
  return out;
}

function sanitizeSettings(v: unknown, defaults: Settings): Settings {
  const s = isObj(v) ? v : {};
  return {
    layout: oneOf(s.layout, LAYOUT_IDS, defaults.layout),
    targetWpm: int(s.targetWpm, 15, 90, defaults.targetWpm),
    minSamples: int(s.minSamples, 5, 60, defaults.minSamples),
    minAccuracy: int(s.minAccuracy, 80, 100, defaults.minAccuracy),
    errorMode: oneOf(s.errorMode, ERROR_MODES, defaults.errorMode),
    sound: bool(s.sound, defaults.sound),
    showKeyboard: bool(s.showKeyboard, defaults.showKeyboard),
    excludeMissing: bool(s.excludeMissing, defaults.excludeMissing),
    dailyGoalMin: int(s.dailyGoalMin, 5, 120, defaults.dailyGoalMin),
    userName: text(s.userName, 24, defaults.userName),
    theme: oneOf(s.theme, THEME_IDS, defaults.theme),
    animations: bool(s.animations, defaults.animations),
    musicVolume: num(s.musicVolume, 0, 1, defaults.musicVolume),
    musicStation: int(s.musicStation, 0, 6, defaults.musicStation),
    avatar: has(s, "avatar") ? safeAvatar(s.avatar) : defaults.avatar,
    showSplash: bool(s.showSplash, defaults.showSplash),
    distro: oneOf(s.distro, DISTRO_IDS, defaults.distro),
    dbEngine: oneOf(s.dbEngine, DB_IDS, defaults.dbEngine),
  };
}

function sanitizeKeyStat(v: unknown): KeyStat | null {
  if (!isObj(v)) return null;
  if (typeof v.n !== "number" || typeof v.ema !== "number") return null;
  const recent = typeof v.recent === "string" && /^[01]{0,50}$/.test(v.recent) ? v.recent : "";
  return {
    n: int(v.n, 0, 1e9, 0),
    ema: num(v.ema, 0, 60_000, 0),
    hits: int(v.hits, 0, 1e9, 0),
    misses: int(v.misses, 0, 1e9, 0),
    recent,
  };
}

/** Lista corta de números finitos dentro de un rango (descarta el resto). */
const nums = (v: unknown, min: number, max: number, keep: number) =>
  Array.isArray(v)
    ? v.filter((x): x is number => typeof x === "number" && Number.isFinite(x)).slice(-keep).map((x) => Math.min(max, Math.max(min, x)))
    : [];

function sanitizeStepStat(v: unknown): StepStat | null {
  if (!isObj(v) || typeof v.n !== "number") return null;
  const w = nums(v.w, 0, 1000, 5);
  const a = nums(v.a, 0, 1, 5);
  const len = Math.min(w.length, a.length);
  return { n: int(v.n, 0, 1e9, 0), w: w.slice(w.length - len), a: a.slice(a.length - len) };
}

function sanitizeLesson(v: unknown): LessonResult | null {
  if (!isObj(v)) return null;
  // una lección sin fecha o velocidad válidas se descarta entera (no se "rellena")
  if (typeof v.ts !== "number" || !Number.isFinite(v.ts) || v.ts <= 0) return null;
  if (typeof v.wpm !== "number" || !Number.isFinite(v.wpm)) return null;
  return {
    ts: num(v.ts, 0, 8.64e15, 0),
    wpm: num(v.wpm, 0, 1000, 0),
    acc: num(v.acc, 0, 1, 0),
    chars: int(v.chars, 0, 1e6, 0),
    ms: num(v.ms, 0, 8.64e7, 0),
    score: int(v.score, 0, 1e9, 0),
    kind: oneOf(v.kind, KINDS, "code"),
  };
}

function sanitizeProfile(v: unknown, maxStage: number): Profile {
  const p = isObj(v) ? v : {};
  const keys: Record<string, KeyStat> = {};
  // claves de estadística: un único carácter imprimible (o salto de línea)
  for (const [k, raw] of entries(p.keys, /^(?:[\x20-\x7e]|\n)$/, 200)) {
    const ks = sanitizeKeyStat(raw);
    if (ks) keys[k] = ks;
  }
  const lessons = Array.isArray(p.lessons)
    ? p.lessons.slice(-500).map(sanitizeLesson).filter((l): l is LessonResult => l !== null)
    : [];
  const steps: Record<string, StepStat> = {};
  for (const [k, raw] of entries(p.steps, /^[a-z0-9-]{1,24}$/, 50)) {
    const st = sanitizeStepStat(raw);
    if (st) steps[k] = st;
  }
  return {
    stage: int(p.stage, 0, maxStage, 0),
    steps,
    keys,
    lessons,
    score: int(p.score, 0, 1e12, 0),
  };
}

/**
 * Reconstruye un AppState válido a partir de cualquier valor.
 * `stagesOf` da la cantidad de etapas de cada lenguaje (para acotar el nivel).
 */
export function sanitizeState(raw: unknown, defaults: AppState, stagesOf: (l: LangId) => number): AppState {
  const r = isObj(raw) ? raw : {};
  const profiles: Record<string, Profile> = {};
  const profileRe = new RegExp(`^(${LANG_IDS.join("|")}):(${LAYOUT_IDS.join("|")})$`);
  for (const [k, v] of entries(r.profiles, profileRe, LANG_IDS.length * LAYOUT_IDS.length)) {
    const lang = k.split(":")[0] as LangId;
    profiles[k] = sanitizeProfile(v, stagesOf(lang) - 1);
  }
  const days: Record<string, number> = {};
  for (const [k, v] of entries(r.days, /^\d{4}-\d{2}-\d{2}$/, 4000)) days[k] = num(v, 0, 86_400, 0);

  const challenges: Record<string, ChallengeRecord> = {};
  const chRe = new RegExp(`^(${LANG_IDS.join("|")}):(sprint30|sprint60|sprint120|perfect)$`);
  for (const [k, v] of entries(r.challenges, chRe, 50)) {
    if (!isObj(v)) continue;
    challenges[k] = { wpm: num(v.wpm, 0, 1000, 0), acc: num(v.acc, 0, 1, 0), ts: num(v.ts, 0, 8.64e15, 0) };
  }
  const achievements: Record<string, number> = {};
  for (const [k, v] of entries(r.achievements, /^[a-z0-9]{1,24}$/, 100)) achievements[k] = num(v, 0, 8.64e15, 0);

  return {
    version: 1,
    settings: sanitizeSettings(r.settings, defaults.settings),
    lang: LANG_IDS.includes(r.lang as LangId) ? (r.lang as LangId) : null,
    mode: oneOf(r.mode, MODES, defaults.mode),
    profiles,
    days,
    challenges,
    achievements,
  };
}
