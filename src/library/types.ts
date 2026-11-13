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
  group: "Lenguajes" | "Web y datos" | "Bases de datos" | "Herramientas" | "IA" | "Frameworks";
  /** emblema de la app si existe; si no, una sigla */
  emblem: LangId | null;
  badge: string;
  color: string;
  /** resaltado de los ejemplos */
  hl: LangId;
  /** qué es y para qué se usa */
  summary: string;
  /** aviso destacado en rojo arriba de todo (seguridad, uso responsable) */
  alert?: { title: string; items: string[]; closing?: string };
  /** datos rápidos: archivos, cómo se ejecuta, herramientas */
  facts: { label: string; value: string }[];
  /** métodos de trabajo: cómo se organiza un proyecto y buenas prácticas */
  workflow: { title: string; text: string }[];
  entries: Entry[];
  /** clase completa aparte (teoría + práctica), si el tema tiene una */
  clase?: Clase;
}

/** Temas que se van a sumar. */
export interface Soon {
  id: string;
  name: string;
  desc: string;
}

/** Qué diagrama dibujar en una sección de la clase (ver ClaseDiagramas.tsx). */
export type DiagramaId = "neurona" | "entrenamiento" | "prompt" | "bucle";

export interface ClaseSeccion {
  heading: string;
  /** cada string es un párrafo */
  parrafos: string[];
  /** viñetas, debajo de los párrafos */
  lista?: string[];
  /** ejemplos de código, resaltados con el lenguaje del tema (o con el que se indique) */
  codigo?: (string | { lang: LangId; text: string })[];
  /** tabla corta, por ejemplo "dónde conviene y dónde no" */
  tabla?: { cabeza: string[]; filas: string[][] };
  diagrama?: DiagramaId;
}

/** Una clase completa y escrita sobre el tema, aparte de la referencia rápida de siempre. */
export interface Clase {
  /** nombre de la pestaña; si no está, "Clase" */
  tab?: string;
  titulo: string;
  bajada: string;
  secciones: ClaseSeccion[];
  /** documentación oficial en la que se apoya la clase */
  fuentes?: { texto: string; url: string }[];
  /** día en que se comprobó contra las fuentes (AAAA-MM-DD) */
  revisada?: string;
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
