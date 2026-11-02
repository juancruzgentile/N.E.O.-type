// Modelo de un editor de texto mínimo, compartido por Vim y VS Code.
// Todo es inmutable: cada tecla devuelve un estado nuevo.

export interface Pos {
  line: number;
  col: number;
}

export interface Clip {
  text: string;
  /** se copió una línea entera (se pega como línea, no dentro de otra) */
  linewise: boolean;
}

export interface Snapshot {
  lines: string[];
  line: number;
  col: number;
}

export interface EditorState {
  lines: string[];
  line: number;
  col: number;
  /** inicio de la selección (VS Code); null si no hay */
  anchor: Pos | null;
  /** modo de Vim */
  mode: "normal" | "insert";
  clip: Clip | null;
  undo: Snapshot[];
  redo: Snapshot[];
  /** Vim: teclas del comando a medio escribir */
  pending: string;
  /** Vim: teclas del último cambio, para repetirlo con . */
  lastChange: string[];
  /** Vim: teclas del cambio que se está grabando */
  rec: string[] | null;
}

export function createState(lines: string[], line = 0, col = 0): EditorState {
  return { lines: [...lines], line, col, anchor: null, mode: "normal", clip: null, undo: [], redo: [], pending: "", lastChange: [], rec: null };
}

export const snap = (s: EditorState): Snapshot => ({ lines: s.lines, line: s.line, col: s.col });

/** Guarda el estado actual para poder deshacer. */
export const pushUndo = (s: EditorState): EditorState => ({ ...s, undo: [...s.undo, snap(s)].slice(-200), redo: [] });

export function undo(s: EditorState): EditorState {
  const prev = s.undo[s.undo.length - 1];
  if (!prev) return s;
  return { ...s, ...prev, anchor: null, undo: s.undo.slice(0, -1), redo: [...s.redo, snap(s)] };
}

export function redo(s: EditorState): EditorState {
  const next = s.redo[s.redo.length - 1];
  if (!next) return s;
  return { ...s, ...next, anchor: null, redo: s.redo.slice(0, -1), undo: [...s.undo, snap(s)] };
}

export const clampLine = (s: EditorState, line: number) => Math.max(0, Math.min(s.lines.length - 1, line));

export const indentOf = (text: string) => /^\s*/.exec(text)![0];

/** Clase de un carácter para moverse por palabras: letra o número, signo o espacio. */
export const charClass = (c: string | undefined) => (c === undefined || /\s/.test(c) ? 0 : /\w/.test(c) ? 1 : 2);

export const cmpPos = (a: Pos, b: Pos) => a.line - b.line || a.col - b.col;

/** Texto entre dos posiciones (fin excluido). */
export function textBetween(lines: string[], a: Pos, b: Pos): string {
  if (a.line === b.line) return lines[a.line].slice(a.col, b.col);
  const out = [lines[a.line].slice(a.col)];
  for (let l = a.line + 1; l < b.line; l++) out.push(lines[l]);
  out.push(lines[b.line].slice(0, b.col));
  return out.join("\n");
}

/** Borra entre dos posiciones (fin excluido) y deja el cursor al principio. */
export function deleteRange(s: EditorState, a: Pos, b: Pos): EditorState {
  const [from, to] = cmpPos(a, b) <= 0 ? [a, b] : [b, a];
  const lines = [...s.lines];
  const merged = lines[from.line].slice(0, from.col) + lines[to.line].slice(to.col);
  lines.splice(from.line, to.line - from.line + 1, merged);
  return { ...s, lines, line: from.line, col: from.col, anchor: null };
}

/** Inserta texto (puede tener saltos de línea) en el cursor y lo deja al final. */
export function insertText(s: EditorState, text: string): EditorState {
  const lines = [...s.lines];
  const cur = lines[s.line];
  const before = cur.slice(0, s.col);
  const after = cur.slice(s.col);
  const parts = text.split("\n");
  if (parts.length === 1) {
    lines[s.line] = before + text + after;
    return { ...s, lines, col: s.col + text.length };
  }
  const last = parts[parts.length - 1];
  lines.splice(s.line, 1, before + parts[0], ...parts.slice(1, -1), last + after);
  return { ...s, lines, line: s.line + parts.length - 1, col: last.length };
}
