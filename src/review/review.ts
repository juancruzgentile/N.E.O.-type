// Repaso espaciado de la Biblioteca con un sistema de cajas (Leitner).
// Cada entrada practicada entra en una caja. Si se hace bien sube de caja y
// tarda más en volver; si se hace mal vuelve a la primera y reaparece mañana.
import type { LangId, Lesson, ReviewItem } from "../types";
import { type LayoutDef, isTypeable } from "../data/layouts";
import { ALL_TOPICS } from "../library/unlock";
import { entryId } from "../library/search";
import type { Entry, Topic } from "../library/types";

/** Días hasta el próximo repaso según la caja. */
export const INTERVALS = [1, 3, 7, 15, 30];
export const MAX_BOX = INTERVALS.length - 1;
/** Precisión mínima para que el intento cuente como bien hecho. */
export const PASS_ACC = 0.95;

const pad = (n: number) => String(n).padStart(2, "0");
export const dayKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Suma días a una fecha YYYY-MM-DD (hora local, sin problemas de cambio de horario). */
export function addDays(day: string, n: number): string {
  const [y, m, d] = day.split("-").map(Number);
  return dayKey(new Date(y, m - 1, d + n, 12));
}

/** Días de `from` a `to` (negativo si `to` ya pasó). */
export function daysBetween(from: string, to: string): number {
  const ms = (s: string) => {
    const [y, m, d] = s.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((ms(to) - ms(from)) / 86_400_000);
}

export const isDue = (item: ReviewItem, day: string) => item.due <= day;

/**
 * Califica un intento. Solo cambia la caja si la entrada es nueva o ya tocaba
 * repasarla: practicarla de nuevo el mismo día no la adelanta.
 */
export function grade(item: ReviewItem | undefined, acc: number, day: string, now = Date.now()): { item: ReviewItem; counted: boolean } {
  if (item && !isDue(item, day)) return { item: { ...item, n: item.n + 1, ts: now }, counted: false };
  const pass = acc >= PASS_ACC;
  const box = pass ? (item ? Math.min(MAX_BOX, item.box + 1) : 0) : 0;
  return {
    item: {
      box,
      due: addDays(day, INTERVALS[box]),
      n: (item?.n ?? 0) + 1,
      lapses: (item?.lapses ?? 0) + (item && !pass ? 1 : 0),
      ts: now,
    },
    counted: true,
  };
}

/** Texto corto de cuándo vuelve una entrada. */
export function whenText(item: ReviewItem, day: string): string {
  const d = daysBetween(day, item.due);
  if (d <= 0) return "toca hoy";
  if (d === 1) return "vuelve mañana";
  return `vuelve en ${d} días`;
}

// ── entradas ────────────────────────────────────────────────────────────────

let byId: Map<string, { topic: Topic; entry: Entry }> | null = null;
/** Busca una entrada por su id (null si ya no existe en la Biblioteca). */
export function findEntry(id: string) {
  if (!byId) {
    byId = new Map();
    for (const topic of ALL_TOPICS) for (const entry of topic.entries) byId.set(entryId(topic, entry), { topic, entry });
  }
  return byId.get(id) ?? null;
}

const FOLD: Record<string, string> = {
  "…": "...", "—": "-", "–": "-", "“": '"', "”": '"', "‘": "'", "’": "'", "«": '"', "»": '"', "★": "*", "→": "->", "·": ".",
};

/**
 * Texto para practicar un ejemplo: sin tildes ni símbolos que no están en todos
 * los teclados (en el italiano no hay á ni ñ), las tabulaciones como espacios
 * para que la sangría se salte sola como en el resto de las lecciones, y sin
 * tiras de espacios en el medio de una línea.
 */
export function practiceText(code: string): string {
  return code
    .replace(/\t/g, "    ")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\x20-\x7e\n]/g, (c) => FOLD[c] ?? "")
    .replace(/[ ]+$/gm, "")
    // espacios para alinear comentarios: con uno alcanza (la sangría del principio queda igual)
    .replace(/(\S) {2,}(?=\S)/g, "$1 ");
}

export interface Practice {
  text: string;
  /** símbolos sin tecla en el teclado elegido */
  missing: string[];
  /** líneas que se saltaron por tener esos símbolos */
  dropped: number;
}

/**
 * Texto para practicar respetando el teclado. Con `layout` (opción «Saltar
 * símbolos sin tecla» activada) se saltan las líneas que usan un símbolo que
 * ese teclado no tiene; sin `layout` queda todo para escribirlo como se pueda.
 */
export function practiceFor(code: string, layout: LayoutDef | null): Practice {
  const text = practiceText(code);
  if (!layout) return { text, missing: [], dropped: 0 };
  const missing = new Set<string>();
  let dropped = 0;
  const kept = text.split("\n").filter((line) => {
    const bad = [...line].filter((c) => !isTypeable(layout, c));
    bad.forEach((c) => missing.add(c));
    if (bad.length) dropped++;
    return !bad.length;
  });
  const out = kept.join("\n").replace(/\n{3,}/g, "\n\n").replace(/^\n+|\n+$/g, "");
  return { text: out.trim() ? out : "", missing: [...missing], dropped };
}

/** Lección de repaso para una entrada (null si no existe o no queda nada para escribir). */
export function reviewLesson(id: string, layout: LayoutDef | null = null): Lesson | null {
  const found = findEntry(id);
  if (!found) return null;
  const { topic, entry } = found;
  const { text } = practiceFor(entry.code, layout);
  if (!text) return null;
  return {
    kind: "code",
    title: entry.name,
    tags: [topic.name, entry.cat],
    text,
    focus: null,
    label: "REPASO",
    review: id,
    hl: topic.hl,
  };
}

/**
 * Elige qué repasar: entre las que tocan hoy, primero las del tema que se está
 * practicando y después las más atrasadas. Si ninguna toca, null.
 */
export function pickDue(review: Record<string, ReviewItem>, lang: LangId | null, day: string, skip: string[] = []): string | null {
  let best: { id: string; key: [number, string, number] } | null = null;
  for (const [id, item] of Object.entries(review)) {
    if (!isDue(item, day) || skip.includes(id)) continue;
    const found = findEntry(id);
    if (!found) continue;
    const key: [number, string, number] = [found.topic.id === lang ? 0 : 1, item.due, item.box];
    if (!best || key[0] < best.key[0] || (key[0] === best.key[0] && (key[1] < best.key[1] || (key[1] === best.key[1] && key[2] < best.key[2])))) {
      best = { id, key };
    }
  }
  return best?.id ?? null;
}

export const dueCount = (review: Record<string, ReviewItem>, day: string) =>
  Object.entries(review).filter(([id, it]) => isDue(it, day) && findEntry(id)).length;
