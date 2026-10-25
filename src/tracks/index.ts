import type { LangId, TrackId } from "../types";
import { type Rng, pick } from "../gen/base";
import type { Track } from "./types";
import { SQL } from "./sql";

export const TRACKS: Record<TrackId, Track> = { sql: SQL };
export const TRACK_ORDER: TrackId[] = ["sql"];

export const isTrack = (l: LangId): l is TrackId => Object.prototype.hasOwnProperty.call(TRACKS, l);

export interface TrackExercise {
  title: string;
  text: string;
  step: string;
  variant: string;
}

/** Símbolos (no letras ni espacios) del texto que no están permitidos. */
function fits(text: string, allowed: Set<string>): boolean {
  for (const ch of text) if (!/[A-Za-z\s]/.test(ch) && !allowed.has(ch)) return false;
  return true;
}

/**
 * Ejercicio del escalón `stepIdx` (modo guiado). La mitad de las veces sale de los temas
 * nuevos del escalón; el resto, de todo lo acumulado hasta él (si la ruta es acumulativa).
 */
export function stepExercise(t: Track, stepIdx: number, rng: Rng, allowed: Set<string>, attempts = 120): TrackExercise | null {
  const step = t.steps[stepIdx];
  const all = t.cumulative ? t.steps.slice(0, stepIdx + 1).flatMap((s) => s.topics) : step.topics;
  for (let i = 0; i < attempts; i++) {
    const topic = pick(rng, rng() < 0.5 ? step.topics : all);
    const variant = pick(rng, step.variants);
    const e = topic.gen(rng, variant);
    if (e && fits(e.text, allowed)) return { ...e, step: step.id, variant };
  }
  return null;
}

/** Práctica libre: cualquier tema de la ruta, en la variante elegida si la ruta tiene selector. */
export function freeExercise(t: Track, variant: string | null, rng: Rng, allowed: Set<string>, attempts = 160): TrackExercise | null {
  for (let i = 0; i < attempts; i++) {
    const step = pick(rng, t.steps);
    const topics = t.cumulative ? t.steps.flatMap((s) => s.topics) : step.topics;
    const v = variant ?? pick(rng, step.variants);
    const e = pick(rng, topics).gen(rng, v);
    if (e && fits(e.text, allowed)) return { ...e, step: step.id, variant: v };
  }
  return null;
}
