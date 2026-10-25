export type LangId = "python" | "javascript" | "typescript" | "java" | "csharp" | "go" | "rust";
export type LayoutId = "it" | "us" | "es" | "latam";
export type ErrorMode = "block" | "advance" | "strict";
export type Mode = "guided" | "free";
export type View = "languages" | "practice" | "routes" | "stats" | "challenges" | "achievements" | "settings";
export type ThemeId = "neon" | "synthwave" | "matrix" | "tokyo" | "light";

export interface Settings {
  layout: LayoutId;
  targetWpm: number;
  minSamples: number;
  minAccuracy: number;
  errorMode: ErrorMode;
  sound: boolean;
  showKeyboard: boolean;
  excludeMissing: boolean;
  dailyGoalMin: number;
  userName: string;
  theme: ThemeId;
  animations: boolean;
  musicVolume: number;
  musicStation: number;
  /** "" iniciales · "preset:<id>" · "img:<dataURL>" */
  avatar: string;
  showSplash: boolean;
}

/** Estadística de una tecla (un carácter). */
export interface KeyStat {
  /** muestras de tiempo válidas */
  n: number;
  /** media exponencial del tiempo en ms */
  ema: number;
  hits: number;
  misses: number;
  /** últimos intentos: "1" acierto a la primera, "0" error */
  recent: string;
}

export interface LessonResult {
  ts: number;
  wpm: number;
  acc: number;
  chars: number;
  ms: number;
  score: number;
  kind: "drill" | "code" | "sprint" | "perfect";
}

export interface Profile {
  stage: number;
  keys: Record<string, KeyStat>;
  lessons: LessonResult[];
  score: number;
}

export interface ChallengeRecord {
  wpm: number;
  acc: number;
  ts: number;
}

export interface AppState {
  version: 1;
  settings: Settings;
  lang: LangId | null;
  mode: Mode;
  profiles: Record<string, Profile>;
  /** segundos practicados por día (YYYY-MM-DD) */
  days: Record<string, number>;
  challenges: Record<string, ChallengeRecord>;
  /** logros desbloqueados: id → fecha */
  achievements: Record<string, number>;
}

export interface Lesson {
  kind: "drill" | "code";
  title: string;
  tags: string[];
  text: string;
  focus: string | null;
}

/** Una muestra registrada al teclear un carácter. */
export interface Sample {
  char: string;
  ms: number | null;
  error: boolean;
}
