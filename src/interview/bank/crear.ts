// Atajos para escribir el banco de preguntas. En las de opción, la PRIMERA es la correcta (se mezclan al mostrarlas).
import type { Kind } from "../../recall/check";
import type { Pregunta } from "../types";

export { code } from "../../library/types";

const NIVEL = { j: "junior", s: "semi", x: "senior" } as const;
type N = keyof typeof NIVEL;
export type Item = Omit<Pregunta, "id" | "area">;

/** Pregunta conceptual de opción múltiple. */
export const op = (n: N, texto: string, opciones: string[], explica: string, fuente: string): Item => ({
  nivel: NIVEL[n], formato: "opcion", texto, opciones, explica, fuente,
});
/** ¿Qué imprime este código? (los tests lo corren y comparan con la primera opción). */
export const sa = (n: N, codigo: string, opciones: string[], explica: string, fuente: string, lang?: string): Item => ({
  nivel: NIVEL[n], formato: "salida", texto: "¿Qué imprime este código?", codigo, lang, opciones, explica, fuente,
});
/** Encontrá el error. */
export const er = (n: N, codigo: string, opciones: string[], explica: string, fuente: string, lang?: string): Item => ({
  nivel: NIVEL[n], formato: "error", texto: "¿Qué problema tiene este código?", codigo, lang, opciones, explica, fuente,
});
/** Se escribe la respuesta (corta): valen todas las de `respuestas`. */
export const co = (n: N, texto: string, respuestas: string[], explica: string, fuente: string, kind: Kind = "code", lang?: string): Item => ({
  nivel: NIVEL[n], formato: "codigo", texto, respuestas, kind, lang, explica, fuente,
});
/** Situación de trabajo o de conducta. */
export const si = (n: N, texto: string, opciones: string[], explica: string, fuente: string): Item => ({
  nivel: NIVEL[n], formato: "situacion", texto, opciones, explica, fuente,
});

/** Les pone id area-NN en el orden en que están escritas: solo se agregan preguntas al final. */
export const area = (id: string, items: Item[]): Pregunta[] =>
  items.map((it, i) => ({ ...it, id: `${id}-${String(i + 1).padStart(2, "0")}`, area: id }));
