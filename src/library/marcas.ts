/**
 * Parte un texto de clase en tramos: normal, **clave** o `código`. Solo cuenta una marca completa; un ** o un `
 * suelto queda como texto tal cual.
 */
export type Tramo = { tipo: "texto" | "clave" | "cod"; t: string };

export const tramos = (text: string): Tramo[] =>
  text.split(/(\*\*[^*]+\*\*|`[^`]+`)/).flatMap((t, i): Tramo[] =>
    i % 2 === 0 ? (t ? [{ tipo: "texto", t }] : []) : [{ tipo: t.startsWith("**") ? "clave" : "cod", t: t.startsWith("**") ? t.slice(2, -2) : t.slice(1, -1) }],
  );
