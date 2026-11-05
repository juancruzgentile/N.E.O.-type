import type { LangId } from "../types";

export type Level = "basico" | "intermedio" | "avanzado";

export const LEVELS: { id: Level; name: string }[] = [
  { id: "basico", name: "Básico" },
  { id: "intermedio", name: "Intermedio" },
  { id: "avanzado", name: "Avanzado" },
];

/** Un comando, función o concepto de la biblioteca. */
export interface Entry {
  /** nombre corto, como se escribe (print(), git rebase, SELECT…) */
  name: string;
  level: Level;
  /** categoría dentro del tema: Variables, Archivos, Consultas… */
  cat: string;
  /** qué hace y cuándo conviene usarlo */
  desc: string;
  /** ejemplo de uso */
  code: string;
  /** sinónimos para la búsqueda (no se muestran) */
  tags?: string;
  /** qué le falta a este fragmento para correr; si no está, se usa el aviso general del tema */
  needs?: string;
}

export interface Topic {
  id: string;
  name: string;
  group: "Lenguajes" | "Web y datos" | "Herramientas" | "Frameworks";
  /** emblema de la app si existe; si no, una sigla */
  emblem: LangId | null;
  badge: string;
  color: string;
  /** resaltado de los ejemplos */
  hl: LangId;
  /** qué es y para qué se usa */
  summary: string;
  /** datos rápidos: archivos, cómo se ejecuta, herramientas */
  facts: { label: string; value: string }[];
  /** métodos de trabajo: cómo se organiza un proyecto y buenas prácticas */
  workflow: { title: string; text: string }[];
  entries: Entry[];
}

/** Temas que se van a sumar. */
export interface Soon {
  id: string;
  name: string;
  desc: string;
}

/**
 * Ejemplo de código como plantilla cruda: las barras invertidas quedan tal cual
 * ("\n" se ve como \n). Para escribir ` o $ dentro del ejemplo se escapan (\` \$).
 */
export const code = (s: TemplateStringsArray) =>
  s.raw.join("").replace(/\\([`$])/g, "$1").replace(/^\n/, "").replace(/\s+$/, "");

/** Atajos para declarar entradas por nivel: b(categoría, nombre, descripción, ejemplo, sinónimos). */
const mk = (level: Level) => (cat: string, name: string, desc: string, example: string, tags?: string): Entry => ({
  level, cat, name, desc, code: example, tags,
});
export const b = mk("basico");
export const m = mk("intermedio");
export const a = mk("avanzado");
