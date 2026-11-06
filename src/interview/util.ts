import type { LangId } from "../types";
import { ALL_TOPICS } from "../library/unlock";
import type { Formato, Pregunta } from "./types";

/** Lenguaje para resaltar el código de una pregunta (el de la pregunta, o el de su área). */
export function hlDe(q: Pregunta): LangId {
  const id = q.lang === "bash" || q.lang === "shell" ? "linux" : (q.lang ?? q.area);
  return ALL_TOPICS.find((t) => t.id === id)?.hl ?? "python";
}

export const FORMATOS: { id: Formato; nombre: string }[] = [
  { id: "opcion", nombre: "Concepto" },
  { id: "salida", nombre: "¿Qué imprime?" },
  { id: "error", nombre: "Encontrá el error" },
  { id: "codigo", nombre: "Escribí el código" },
  { id: "situacion", nombre: "Situación" },
];
export const formatoName = (f: Formato) => FORMATOS.find((x) => x.id === f)?.nombre ?? f;

/** Milisegundos como m:ss. */
export const mmss = (ms: number) => {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

export const fechaCorta = (ts: number) =>
  new Date(ts).toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric" });
