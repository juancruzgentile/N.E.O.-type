import type { LessonResult, Totals } from "../types";

export const emptyTotals = (): Totals => ({ n: 0, ms: 0, chars: 0, best: 0 });

/** Suma una lección a los acumulados. */
export const addTotals = (t: Totals, l: LessonResult): Totals => ({
  n: t.n + 1, ms: t.ms + l.ms, chars: t.chars + l.chars, best: Math.max(t.best, l.wpm),
});

/** Acumulados calculados a partir de una lista de lecciones. */
export const totalsOf = (ls: LessonResult[]): Totals => ls.reduce(addTotals, emptyTotals());
