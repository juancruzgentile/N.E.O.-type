import type { ConceptId } from "./gen/concepts";
/** Lenguajes de programación (ruta por símbolos). */
export type CodeLangId = "python" | "javascript" | "typescript" | "java" | "csharp" | "go" | "rust";
/** Rutas Trainee (progreso por escalones de temas). */
export type TrackId = "sql" | "linux" | "html" | "css" | "formats";
export type LangId = CodeLangId | TrackId;
export type DistroId = "ubuntu" | "debian" | "mint" | "cachyos" | "arch" | "fedora";
export type DbEngineId = "sqlite" | "mysql" | "postgresql" | "mongodb";
export type LayoutId = "it" | "us" | "es" | "latam";
export type ErrorMode = "block" | "advance" | "strict";
export type Mode = "guided" | "free";
export type View = "languages" | "practice" | "routes" | "stats" | "challenges" | "achievements" | "settings";
export type ThemeId = "cyber" | "neon" | "synthwave" | "matrix" | "tokyo" | "light";

/** Cómo escribe el usuario un símbolo en su teclado real (aprendido o calibrado). */
export interface LearnedKey {
  /** tecla física (KeyboardEvent.code) */
  code: string;
  shift: boolean;
  altgr: boolean;
  /** tecla muerta: el símbolo aparece después de apretar Espacio */
  dead?: boolean;
}

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
  /** ya vio la bienvenida y el recorrido inicial */
  tutorialDone: boolean;
  /** símbolos aprendidos de tu teclado real, por distribución */
  keymap: Partial<Record<LayoutId, Record<string, LearnedKey>>>;
  /** distribución para la práctica libre de la terminal */
  distro: DistroId;
  /** motor para la práctica libre de bases de datos */
  dbEngine: DbEngineId;
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

/** Rendimiento de un escalón de una ruta Trainee (últimas lecciones). */
export interface StepStat {
  /** lecciones completadas en el escalón */
  n: number;
  /** WPM de las últimas lecciones (máx. 5) */
  w: number[];
  /** precisión 0..1 de las últimas lecciones (máx. 5) */
  a: number[];
}

export interface Profile {
  stage: number;
  /** solo rutas Trainee: id de escalón → rendimiento */
  steps: Record<string, StepStat>;
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
  /** rutas Trainee: escalón al que suma la lección */
  step?: string;
  /** rótulo del tipo de fragmento (FUNCIÓN, CONSULTA, COMANDO…) */
  label?: string;
  /** lenguajes: concepto del fragmento, para no repetirlo en la lección siguiente */
  concept?: ConceptId;
}

/** Una muestra registrada al teclear un carácter. */
export interface Sample {
  char: string;
  ms: number | null;
  error: boolean;
}
