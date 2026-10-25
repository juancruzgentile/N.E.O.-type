import type { LangId, TrackId } from "../types";
import { type Rng, pick } from "../gen/base";
import type { Track } from "./types";
import { SQL } from "./sql";
import { LINUX } from "./linux";

export const TRACKS: Record<TrackId, Track> = { sql: SQL, linux: LINUX };
export const TRACK_ORDER: TrackId[] = ["sql", "linux"];

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
function stepOne(t: Track, stepIdx: number, rng: Rng, allowed: Set<string>, attempts = 120, fixed?: string): TrackExercise | null {
  const step = t.steps[stepIdx];
  const all = t.cumulative ? t.steps.slice(0, stepIdx + 1).flatMap((s) => s.topics) : step.topics;
  for (let i = 0; i < attempts; i++) {
    const topic = pick(rng, rng() < 0.5 ? step.topics : all);
    const variant = fixed ?? pick(rng, step.variants);
    const e = topic.gen(rng, variant);
    if (e && fits(e.text, allowed)) return { ...e, step: step.id, variant };
  }
  return null;
}

/** Práctica libre: cualquier tema de la ruta, en la variante elegida si la ruta tiene selector. */
function freeOne(t: Track, variant: string | null, rng: Rng, allowed: Set<string>, attempts = 160): TrackExercise | null {
  for (let i = 0; i < attempts; i++) {
    const step = pick(rng, t.steps);
    const topics = t.cumulative ? t.steps.flatMap((s) => s.topics) : step.topics;
    const v = variant ?? pick(rng, step.variants);
    const e = pick(rng, topics).gen(rng, v);
    if (e && fits(e.text, allowed)) return { ...e, step: step.id, variant: v };
  }
  return null;
}

/** Junta `n` ejercicios distintos de la misma variante en una sola lección. */
function batched(n: number, first: TrackExercise | null, more: (variant: string) => TrackExercise | null): TrackExercise | null {
  if (!first || n <= 1) return first;
  const parts = [first];
  for (let i = 0; i < n * 6 && parts.length < n; i++) {
    const e = more(first.variant);
    if (e && !parts.some((p) => p.text === e.text)) parts.push(e);
  }
  return {
    ...first,
    title: parts.map((p) => p.title).join(" · "),
    text: parts.map((p) => p.text).join("\n"),
  };
}

/** Ejercicio del escalón `stepIdx` (modo guiado). */
export function stepExercise(t: Track, stepIdx: number, rng: Rng, allowed: Set<string>, attempts = 120): TrackExercise | null {
  return batched(t.batch ?? 1, stepOne(t, stepIdx, rng, allowed, attempts), (v) => stepOne(t, stepIdx, rng, allowed, attempts, v));
}

/** Práctica libre: cualquier tema de la ruta, en la variante elegida si la ruta tiene selector. */
export function freeExercise(t: Track, variant: string | null, rng: Rng, allowed: Set<string>, attempts = 160): TrackExercise | null {
  // las piezas siguientes usan la misma variante que la primera
  return batched(t.batch ?? 1, freeOne(t, variant, rng, allowed, attempts), (v) => freeOne(t, variant ?? v, rng, allowed, attempts));
}
