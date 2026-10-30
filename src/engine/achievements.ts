import type { AppState, LangId, TrackId } from "../types";
import { LANGS, LANG_ORDER, TRACK_ORDER, stageCount } from "../data/curriculum";
import { comboMap, layoutFor } from "../data/layouts";
import { stageInfos, stepInfos } from "./stats";
import { streakDays, today } from "../store";

export interface Achievement {
  id: string;
  name: string;
  desc: string;
  tier: "bronze" | "silver" | "gold";
  /** devuelve true si está cumplido; progress opcional (0..1) para mostrar avance */
  check: (s: AppState) => boolean;
  progress?: (s: AppState) => number;
}

const profilesOf = (s: AppState) =>
  LANG_ORDER.map((lang) => ({ lang, p: s.profiles[`${lang}:${s.settings.layout}`] })).filter((x) => x.p);

const allLessons = (s: AppState) => Object.values(s.profiles).flatMap((p) => p.lessons);

const bestWpm = (s: AppState, minChars = 60) =>
  allLessons(s).filter((l) => l.chars >= minChars).reduce((m, l) => Math.max(m, l.wpm), 0);

const masteredIn = (s: AppState, lang: LangId) => {
  const p = s.profiles[`${lang}:${s.settings.layout}`];
  if (!p) return [];
  return stageInfos(lang, p, s.settings).filter((k) => k.state === "mastered").map((k) => k.char);
};

/** escalones dominados de una ruta Trainee con el teclado actual */
const stepsMastered = (s: AppState, id: TrackId) => {
  const p = s.profiles[`${id}:${s.settings.layout}`];
  return p ? stepInfos(id, p, s.settings).filter((x) => x.state === "mastered").length : 0;
};
const trackDone = (s: AppState, id: TrackId) => {
  const p = s.profiles[`${id}:${s.settings.layout}`];
  return !!p && stepInfos(id, p, s.settings).every((x) => x.state === "mastered");
};
const tracksDone = (s: AppState) => TRACK_ORDER.filter((id) => trackDone(s, id)).length;

const trackAch = (id: string, name: string, desc: string, tracks: TrackId[]): Achievement => ({
  id, name, desc, tier: "gold",
  check: (s) => tracks.every((t) => trackDone(s, t)),
  progress: (s) => {
    const done = tracks.reduce((n, t) => n + stepsMastered(s, t), 0);
    const total = tracks.reduce((n, t) => n + stageCount(t), 0);
    return Math.min(1, done / total);
  },
});

const maxMastered = (s: AppState) => Math.max(0, ...LANG_ORDER.map((l) => masteredIn(s, l).length));

const wpmAch = (id: string, name: string, wpm: number, tier: Achievement["tier"]): Achievement => ({
  id, name, tier,
  desc: `Completá una lección a ${wpm} WPM o más`,
  check: (s) => bestWpm(s) >= wpm,
  progress: (s) => Math.min(1, bestWpm(s) / wpm),
});

const lessonsAch = (id: string, name: string, n: number, tier: Achievement["tier"]): Achievement => ({
  id, name, tier,
  desc: `Completá ${n} lecciones`,
  check: (s) => allLessons(s).length >= n,
  progress: (s) => Math.min(1, allLessons(s).length / n),
});

const streakAch = (id: string, name: string, n: number, tier: Achievement["tier"]): Achievement => ({
  id, name, tier,
  desc: `Practicá ${n} días seguidos`,
  check: (s) => streakDays(s.days) >= n,
  progress: (s) => Math.min(1, streakDays(s.days) / n),
});

export const ACHIEVEMENTS: Achievement[] = [
  { id: "hello", name: "Hola, mundo", desc: "Completá tu primera lección", tier: "bronze", check: (s) => allLessons(s).length >= 1 },
  lessonsAch("lessons10", "Constante", 10, "bronze"),
  lessonsAch("lessons50", "Dedicado", 50, "silver"),
  lessonsAch("lessons200", "Incansable", 200, "gold"),
  wpmAch("wpm30", "Calentando motores", 30, "bronze"),
  wpmAch("wpm50", "Fluido", 50, "silver"),
  wpmAch("wpm70", "Veloz", 70, "gold"),
  wpmAch("wpm90", "Relámpago", 90, "gold"),
  {
    id: "clean", name: "Código limpio", desc: "Escribí una función real sin ningún error", tier: "silver",
    check: (s) => allLessons(s).some((l) => l.kind === "code" && l.acc >= 1 && l.chars >= 60),
  },
  {
    id: "symbols10", name: "Alfabeto simbólico", desc: "Dominá 10 símbolos en un mismo lenguaje", tier: "bronze",
    check: (s) => maxMastered(s) >= 10, progress: (s) => Math.min(1, maxMastered(s) / 10),
  },
  {
    id: "brackets", name: "Domador de llaves", desc: "Dominá ( ) [ ] { } en un mismo lenguaje", tier: "silver",
    check: (s) => LANG_ORDER.some((l) => ["(", ")", "[", "]", "{", "}"].every((c) => masteredIn(s, l).includes(c))),
  },
  {
    id: "altgr", name: "Ninja del AltGr", desc: "Dominá 4 símbolos que se escriben con AltGr", tier: "gold",
    check: (s) => {
      const combos = comboMap(layoutFor(s.settings));
      return LANG_ORDER.some((l) => masteredIn(s, l).filter((c) => combos.get(c)?.altgr).length >= 4);
    },
  },
  {
    id: "route", name: "Ruta completa", desc: "Desbloqueá todos los símbolos de un lenguaje", tier: "gold",
    check: (s) => profilesOf(s).some(({ lang, p }) => p!.stage >= LANGS[lang].stages.length - 1),
    progress: (s) => Math.max(0, ...profilesOf(s).map(({ lang, p }) => p!.stage / (LANGS[lang].stages.length - 1))),
  },
  {
    id: "polyglot", name: "Políglota", desc: "Practicá 3 lenguajes distintos", tier: "bronze",
    check: (s) => profilesOf(s).filter(({ p }) => p!.lessons.length > 0).length >= 3,
    progress: (s) => Math.min(1, profilesOf(s).filter(({ p }) => p!.lessons.length > 0).length / 3),
  },
  {
    id: "allterrain", name: "Todoterreno", desc: "Practicá los 7 lenguajes", tier: "gold",
    check: (s) => profilesOf(s).filter(({ p }) => p!.lessons.length > 0).length >= 7,
    progress: (s) => Math.min(1, profilesOf(s).filter(({ p }) => p!.lessons.length > 0).length / 7),
  },
  streakAch("streak3", "Hábito", 3, "bronze"),
  streakAch("streak7", "Una semana entera", 7, "silver"),
  streakAch("streak30", "Disciplina también es código", 30, "gold"),
  {
    id: "goal", name: "Objetivo cumplido", desc: "Alcanzá tu objetivo diario de práctica", tier: "bronze",
    check: (s) => (s.days[today()] ?? 0) >= s.settings.dailyGoalMin * 60,
  },
  {
    id: "sprinter", name: "Sprinter", desc: "Hacé 40 WPM o más en el sprint de 60 s", tier: "silver",
    check: (s) => Object.entries(s.challenges).some(([k, r]) => k.endsWith(":sprint60") && r.wpm >= 40),
  },
  {
    id: "surgeon", name: "Cirujano", desc: "Superá el desafío de precisión perfecta", tier: "silver",
    check: (s) => Object.keys(s.challenges).some((k) => k.endsWith(":perfect")),
  },
  {
    id: "firststep", name: "Primer escalón", desc: "Dominá un escalón de cualquier ruta Trainee", tier: "bronze",
    check: (s) => TRACK_ORDER.some((t) => stepsMastered(s, t) >= 1),
  },
  trackAch("dba", "Guardián de datos", "Completá la ruta de bases de datos, de SQLite a MongoDB", ["sql"]),
  trackAch("sysadmin", "Acceso root", "Completá la ruta de terminal, de Ubuntu a Arch Linux", ["linux"]),
  trackAch("webdev", "Arquitecto web", "Completá las rutas de HTML y CSS", ["html", "css"]),
  {
    id: "trainee", name: "Trainee certificado", desc: "Completá las cinco rutas Trainee", tier: "gold",
    check: (s) => tracksDone(s) === TRACK_ORDER.length,
    progress: (s) => tracksDone(s) / TRACK_ORDER.length,
  },
  {
    id: "owl", name: "Búho nocturno", desc: "Completá una lección entre las 0 y las 5 h", tier: "bronze",
    check: (s) => allLessons(s).some((l) => new Date(l.ts).getHours() < 5),
  },
];

/** Ids de logros cumplidos que todavía no están registrados. */
export function newAchievements(s: AppState): string[] {
  return ACHIEVEMENTS.filter((a) => !s.achievements[a.id] && a.check(s)).map((a) => a.id);
}
