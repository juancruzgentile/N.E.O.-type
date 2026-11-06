import type { Kind } from "../recall/check";

export type Nivel = "junior" | "semi" | "senior";
/**
 * opcion: pregunta conceptual de opción múltiple.
 * salida: "¿qué imprime este código?". error: "¿qué problema tiene?".
 * codigo: se escribe una respuesta corta, corregida con el corrector de los ejercicios de memoria.
 * situacion: pregunta de conducta o de trabajo en equipo, con una mejor respuesta.
 */
export type Formato = "opcion" | "salida" | "error" | "codigo" | "situacion";

export interface Pregunta {
  /** area-número, por ejemplo python-07. Solo se agregan al final: guardan el repaso de cada persona */
  id: string;
  /** id del área (ver AREAS) */
  area: string;
  nivel: Nivel;
  formato: Formato;
  texto: string;
  /** código de la pregunta (salida y error) o contexto */
  codigo?: string;
  /** lenguaje del código, para el resaltado y para correrlo en los tests; por defecto el del área */
  lang?: string;
  /** opcion, salida, error, situacion: la primera es la correcta; se mezclan al mostrarlas */
  opciones?: string[];
  /** codigo: respuestas que valen */
  respuestas?: string[];
  kind?: Kind;
  /** por qué es esa la respuesta */
  explica: string;
  /** link a la documentación o referencia que lo confirma */
  fuente: string;
}

export interface Area {
  id: string;
  nombre: string;
  grupo: "Lenguajes" | "Web y datos" | "Herramientas" | "General";
}

export interface Puesto {
  id: string;
  nombre: string;
  desc: string;
  /** áreas que se suman al lenguaje elegido */
  areas: string[];
}

export interface Opciones {
  puesto: string;
  /** id del área de lenguaje */
  lang: string;
  nivel: Nivel;
  minutos: 15 | 30 | 45;
}

/** Lo que respondió la persona en una pregunta de la entrevista. */
export interface Respuesta {
  id: string;
  ok: boolean;
  /** milisegundos que tardó */
  ms: number;
  /** sin responder (se acabó el tiempo) */
  vacia?: boolean;
}

export interface Resultado {
  ok: number;
  total: number;
  pct: number;
  nota: number;
  veredicto: "aprobado" | "casi" | "reforzar";
  porArea: { area: string; ok: number; total: number }[];
}
