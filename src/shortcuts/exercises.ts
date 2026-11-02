// Ejercicios de atajos: un texto inicial, un objetivo y una solución de referencia.
// El "par" es la cantidad de teclas de esa solución; las pruebas la ejecutan en el
// motor para garantizar que llega al objetivo.
import type { ShortcutRecord } from "../types";
import { type EditorState, createState } from "./buffer";
import { vimKey } from "./vim";
import { type ActionId, ACTIONS, type Platform, type VsOptions, vscodeKey } from "./vscode";

export type SetId = "vim" | "vscode";

export interface ShortcutExercise {
  id: string;
  title: string;
  task: string;
  start: string[];
  cursor: [number, number];
  goal: string[];
  /** Vim: teclas. VS Code: "@acción" o un carácter para escribir. */
  solution: string[];
  /** Vim: atajos a mostrar ("dd", "borrar la línea") */
  use?: [string, string][];
}

export interface ShortcutLevel {
  name: string;
  exercises: ShortcutExercise[];
}

export interface ShortcutSet {
  id: SetId;
  name: string;
  desc: string;
  levels: ShortcutLevel[];
}

export const VS_OPTIONS: VsOptions = { tab: 2, comment: "// " };

const chars = (s: string) => [...s];
const LEVEL_NAMES = ["Básico", "Intermedio", "Avanzado"];

type Raw = Omit<ShortcutExercise, "id">;
const set = (id: SetId, name: string, desc: string, levels: Raw[][]): ShortcutSet => ({
  id, name, desc,
  levels: levels.map((ex, li) => ({
    name: LEVEL_NAMES[li],
    exercises: ex.map((e, i) => ({ ...e, id: `${id}-${li + 1}-${i + 1}` })),
  })),
});

const vim = set("vim", "Vim", "Modo normal e inserción: moverte, borrar y cambiar texto sin el mouse.", [
  [
    {
      title: "Corregí el error de tipeo", task: "Sobra una l en consolle. Saltá hasta ella y borrala.",
      start: ["consolle.log(total);"], cursor: [0, 0], goal: ["console.log(total);"],
      solution: ["f", "l", "x"], use: [["f + letra", "saltar a esa letra en la línea"], ["x", "borrar el carácter del cursor"]],
    },
    {
      title: "Borrá la línea de depuración", task: "Eliminá la línea del console.log.",
      start: ["let total = 0;", "console.log('debug');", "total += precio;"], cursor: [0, 0], goal: ["let total = 0;", "total += precio;"],
      solution: ["j", "d", "d"], use: [["j", "bajar una línea"], ["dd", "borrar la línea entera"]],
    },
    {
      title: "Agregá el punto y coma", task: "Escribí ; al final de la línea y volvé al modo normal.",
      start: ["let total = 0"], cursor: [0, 0], goal: ["let total = 0;"],
      solution: ["A", ";", "Escape"], use: [["A", "escribir al final de la línea"], ["Esc", "volver al modo normal"]],
    },
    {
      title: "Abrí una línea abajo", task: "Agregá «  guardar();» (con dos espacios) dentro del if.",
      start: ["if (listo) {", "}"], cursor: [0, 0], goal: ["if (listo) {", "  guardar();", "}"],
      solution: ["o", ...chars("  guardar();"), "Escape"], use: [["o", "abrir una línea abajo y escribir"], ["Esc", "volver al modo normal"]],
    },
  ],
  [
    {
      title: "Borrá la palabra repetida", task: "Sobra un const.",
      start: ["const const valor = 1;"], cursor: [0, 0], goal: ["const valor = 1;"],
      solution: ["d", "w"], use: [["dw", "borrar hasta la palabra siguiente"]],
    },
    {
      title: "Cambiá el nombre de la variable", task: "Cambiá nombre por usuario.",
      start: ["let nombre = 'Ana';"], cursor: [0, 0], goal: ["let usuario = 'Ana';"],
      solution: ["w", "c", "w", ...chars("usuario"), "Escape"], use: [["w", "ir a la palabra siguiente"], ["cw", "cambiar la palabra"]],
    },
    {
      title: "Borrá los tres console.log", task: "Eliminá las tres líneas de console.log de una vez.",
      start: ["function sumar(a, b) {", "  console.log(a);", "  console.log(b);", "  console.log(a + b);", "  return a + b;", "}"],
      cursor: [0, 0], goal: ["function sumar(a, b) {", "  return a + b;", "}"],
      solution: ["j", "3", "d", "d"], use: [["j", "bajar una línea"], ["3dd", "borrar tres líneas"]],
    },
    {
      title: "Duplicá la línea", task: "Copiá la línea y pegala abajo.",
      start: ["const precio = 100;"], cursor: [0, 0], goal: ["const precio = 100;", "const precio = 100;"],
      solution: ["y", "y", "p"], use: [["yy", "copiar la línea"], ["p", "pegar abajo"]],
    },
  ],
  [
    {
      title: "Borrá el comentario del final", task: "Dejá solo return total;",
      start: ["return total; // TODO: revisar"], cursor: [0, 0], goal: ["return total;"],
      solution: ["f", ";", "l", "D"], use: [["f;", "saltar al punto y coma"], ["l", "un carácter a la derecha"], ["D", "borrar hasta el final de la línea"]],
    },
    {
      title: "Cambiá el texto entre comillas", task: "Cambiá hola por chau.",
      start: ['print("hola")'], cursor: [0, 0], goal: ['print("chau")'],
      solution: ["c", "i", '"', ...chars("chau"), "Escape"], use: [['ci"', "cambiar lo que está entre comillas"]],
    },
    {
      title: "Uní las dos líneas", task: "Juntá la expresión en una sola línea.",
      start: ["const total =", "  precio * cantidad;"], cursor: [0, 0], goal: ["const total = precio * cantidad;"],
      solution: ["J"], use: [["J", "unir con la línea de abajo"]],
    },
    {
      title: "Repetí el cambio con el punto", task: "Cambiá var por let en las dos líneas. Hacé el primero y repetilo.",
      start: ["var a = 1;", "var b = 2;"], cursor: [0, 0], goal: ["let a = 1;", "let b = 2;"],
      solution: ["c", "w", ...chars("let"), "Escape", "j", "0", "."], use: [["cw", "cambiar la palabra"], ["j0", "bajar e ir al principio"], [".", "repetir el último cambio"]],
    },
  ],
]);

const vscode = set("vscode", "VS Code", "Los atajos por defecto de VS Code para mover, duplicar, comentar y editar líneas.", [
  [
    {
      title: "Borrá la línea de depuración", task: "Eliminá la línea del console.log sin seleccionarla.",
      start: ["let total = 0;", "console.log('debug');", "total += precio;"], cursor: [0, 0], goal: ["let total = 0;", "total += precio;"],
      solution: ["@cursorDown", "@deleteLines"],
    },
    {
      title: "Ordená los imports", task: "Subí la segunda línea para que a quede primero.",
      start: ["import b from './b';", "import a from './a';"], cursor: [1, 0], goal: ["import a from './a';", "import b from './b';"],
      solution: ["@moveLinesUp"],
    },
    {
      title: "Duplicá la línea", task: "Copiá la línea abajo en un solo atajo.",
      start: ["const precio = 100;"], cursor: [0, 0], goal: ["const precio = 100;", "const precio = 100;"],
      solution: ["@copyLinesDown"],
    },
    {
      title: "Agregá el punto y coma", task: "Andá al final de la línea y escribí ;",
      start: ["let total = 0"], cursor: [0, 0], goal: ["let total = 0;"],
      solution: ["@cursorEnd", ";"],
    },
  ],
  [
    {
      title: "Comentá el console.log", task: "Convertí la línea del medio en comentario.",
      start: ["const x = calcular();", "console.log(x);", "return x;"], cursor: [0, 0], goal: ["const x = calcular();", "// console.log(x);", "return x;"],
      solution: ["@cursorDown", "@commentLine"],
    },
    {
      title: "Borrá la palabra que sobra", task: "Sobra «viejo» al final. El cursor ya está al final de la línea.",
      start: ["const total = 0; viejo"], cursor: [0, 22], goal: ["const total = 0;"],
      solution: ["@deleteWordLeft", "@deleteLeft"],
    },
    {
      title: "Aumentá la sangría", task: "Las dos líneas de adentro del if van con sangría.",
      start: ["if (ok) {", "guardar();", "avisar();", "}"], cursor: [1, 0], goal: ["if (ok) {", "  guardar();", "  avisar();", "}"],
      solution: ["@selectDown", "@selectDown", "@indentLines"],
    },
    {
      title: "Escribí dentro de la función", task: "Agregá return 0; en una línea nueva, sin cortar la primera.",
      start: ["function total() {", "}"], cursor: [0, 5], goal: ["function total() {", "  return 0;", "}"],
      solution: ["@insertLineAfter", ...chars("return 0;")],
    },
  ],
  [
    {
      title: "Reemplazá la llamada", task: "Dejá return 0; en lugar de la llamada a calcular.",
      start: ["return calcular(a, b);"], cursor: [0, 0], goal: ["return 0;"],
      solution: ["@cursorWordRight", "@cursorRight", "@selectEnd", "0", ";"],
    },
    {
      title: "Reducí la sangría", task: "Las dos líneas tienen 4 espacios: dejalas con 2.",
      start: ["    a();", "    b();"], cursor: [0, 0], goal: ["  a();", "  b();"],
      solution: ["@selectAll", "@outdentLines"],
    },
    {
      title: "Mové la línea al final", task: "La constante c va última.",
      start: ["const c = 3;", "const a = 1;", "const b = 2;"], cursor: [0, 0], goal: ["const a = 1;", "const b = 2;", "const c = 3;"],
      solution: ["@moveLinesDown", "@moveLinesDown"],
    },
    {
      title: "Exportá al final del archivo", task: "Agregá export default app; en una línea nueva al final.",
      start: ["function app() {", "  return 1;", "}"], cursor: [0, 0], goal: ["function app() {", "  return 1;", "}", "export default app;"],
      solution: ["@cursorBottom", "@enter", ...chars("export default app;")],
    },
  ],
]);

export const SHORTCUT_SETS: ShortcutSet[] = [vim, vscode];

export const findSet = (id: string) => SHORTCUT_SETS.find((s) => s.id === id) ?? null;

export const allShortcutExercises = () => SHORTCUT_SETS.flatMap((s) => s.levels.flatMap((l) => l.exercises));

/** Teclas de la solución: un elemento por pulsación. */
export const par = (e: ShortcutExercise) => e.solution.length;

/** Combinación que corresponde a un paso de la solución de VS Code. */
export function stepCombo(step: string, platform: Platform): string {
  return step.startsWith("@") ? ACTIONS[step.slice(1) as ActionId][platform][0] : step;
}

export const startState = (e: ShortcutExercise): EditorState => createState(e.start, e.cursor[0], e.cursor[1]);

/** Aplica una tecla del ejercicio según el juego de atajos. */
export function applyKey(setId: SetId, s: EditorState, key: string, platform: Platform): EditorState {
  return setId === "vim" ? vimKey(s, key) : vscodeKey(s, key, platform, VS_OPTIONS);
}

export const sameText = (e: ShortcutExercise, s: EditorState) =>
  s.lines.length === e.goal.length && s.lines.every((l, i) => l === e.goal[i]);

/** Resuelto: el texto es el pedido y, en Vim, se volvió al modo normal. */
export const solved = (e: ShortcutExercise, s: EditorState) => sameText(e, s) && s.mode === "normal";

/** Estrellas según las teclas usadas frente al par. */
export function stars(keys: number, parKeys: number): 1 | 2 | 3 {
  if (keys <= parKeys) return 3;
  if (keys <= Math.ceil(parKeys * 1.5) + 1) return 2;
  return 1;
}

export const levelDone = (rec: Record<string, ShortcutRecord>, l: ShortcutLevel) => l.exercises.every((e) => rec[e.id]);
export const levelOpen = (rec: Record<string, ShortcutRecord>, s: ShortcutSet, i: number) => i === 0 || levelDone(rec, s.levels[i - 1]);
