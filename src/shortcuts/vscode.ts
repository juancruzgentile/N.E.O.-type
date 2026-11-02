// Un subconjunto de los atajos de VS Code (keybindings por defecto), con selección,
// para Linux/Windows y Mac. Las teclas llegan como combinación normalizada
// ("Ctrl+Shift+K", "Alt+ArrowUp") o como un carácter suelto para escribir.
import {
  type EditorState, type Pos, charClass, clampLine, cmpPos, deleteRange, indentOf, insertText, pushUndo, redo, textBetween, undo,
} from "./buffer";

export type Platform = "pc" | "mac";

export interface ActionDef {
  /** qué hace, en pocas palabras */
  label: string;
  pc: string[];
  mac: string[];
}

/** Atajos que se practican. La primera combinación es la que se muestra. */
export const ACTIONS = {
  cursorLeft: { label: "un carácter a la izquierda", pc: ["ArrowLeft"], mac: ["ArrowLeft"] },
  cursorRight: { label: "un carácter a la derecha", pc: ["ArrowRight"], mac: ["ArrowRight"] },
  cursorUp: { label: "línea de arriba", pc: ["ArrowUp"], mac: ["ArrowUp"] },
  cursorDown: { label: "línea de abajo", pc: ["ArrowDown"], mac: ["ArrowDown"] },
  cursorHome: { label: "principio de la línea", pc: ["Home"], mac: ["Cmd+ArrowLeft", "Home"] },
  cursorEnd: { label: "final de la línea", pc: ["End"], mac: ["Cmd+ArrowRight", "End"] },
  cursorWordLeft: { label: "palabra anterior", pc: ["Ctrl+ArrowLeft"], mac: ["Alt+ArrowLeft"] },
  cursorWordRight: { label: "final de la palabra siguiente", pc: ["Ctrl+ArrowRight"], mac: ["Alt+ArrowRight"] },
  cursorTop: { label: "principio del archivo", pc: ["Ctrl+Home"], mac: ["Cmd+ArrowUp"] },
  cursorBottom: { label: "final del archivo", pc: ["Ctrl+End"], mac: ["Cmd+ArrowDown"] },
  selectLeft: { label: "seleccionar a la izquierda", pc: ["Shift+ArrowLeft"], mac: ["Shift+ArrowLeft"] },
  selectRight: { label: "seleccionar a la derecha", pc: ["Shift+ArrowRight"], mac: ["Shift+ArrowRight"] },
  selectUp: { label: "seleccionar hacia arriba", pc: ["Shift+ArrowUp"], mac: ["Shift+ArrowUp"] },
  selectDown: { label: "seleccionar hacia abajo", pc: ["Shift+ArrowDown"], mac: ["Shift+ArrowDown"] },
  selectHome: { label: "seleccionar hasta el principio de la línea", pc: ["Shift+Home"], mac: ["Cmd+Shift+ArrowLeft", "Shift+Home"] },
  selectEnd: { label: "seleccionar hasta el final de la línea", pc: ["Shift+End"], mac: ["Cmd+Shift+ArrowRight", "Shift+End"] },
  selectWordLeft: { label: "seleccionar la palabra anterior", pc: ["Ctrl+Shift+ArrowLeft"], mac: ["Alt+Shift+ArrowLeft"] },
  selectWordRight: { label: "seleccionar hasta el final de la palabra", pc: ["Ctrl+Shift+ArrowRight"], mac: ["Alt+Shift+ArrowRight"] },
  selectLine: { label: "seleccionar la línea", pc: ["Ctrl+L"], mac: ["Cmd+L"] },
  selectAll: { label: "seleccionar todo", pc: ["Ctrl+A"], mac: ["Cmd+A"] },
  enter: { label: "salto de línea con sangría", pc: ["Enter"], mac: ["Enter"] },
  deleteLeft: { label: "borrar a la izquierda", pc: ["Backspace"], mac: ["Backspace"] },
  deleteRight: { label: "borrar a la derecha", pc: ["Delete"], mac: ["Delete"] },
  deleteWordLeft: { label: "borrar la palabra anterior", pc: ["Ctrl+Backspace"], mac: ["Alt+Backspace"] },
  deleteWordRight: { label: "borrar la palabra siguiente", pc: ["Ctrl+Delete"], mac: ["Alt+Delete"] },
  deleteLines: { label: "borrar la línea", pc: ["Ctrl+Shift+K"], mac: ["Cmd+Shift+K"] },
  moveLinesUp: { label: "mover la línea arriba", pc: ["Alt+ArrowUp"], mac: ["Alt+ArrowUp"] },
  moveLinesDown: { label: "mover la línea abajo", pc: ["Alt+ArrowDown"], mac: ["Alt+ArrowDown"] },
  // en Linux VS Code usa Ctrl+Shift+Alt porque Shift+Alt+flecha suele estar tomado por el escritorio
  copyLinesDown: { label: "duplicar la línea abajo", pc: ["Alt+Shift+ArrowDown", "Ctrl+Alt+Shift+ArrowDown"], mac: ["Alt+Shift+ArrowDown"] },
  copyLinesUp: { label: "duplicar la línea arriba", pc: ["Alt+Shift+ArrowUp", "Ctrl+Alt+Shift+ArrowUp"], mac: ["Alt+Shift+ArrowUp"] },
  commentLine: { label: "comentar o descomentar", pc: ["Ctrl+/"], mac: ["Cmd+/"] },
  indentLines: { label: "aumentar la sangría", pc: ["Ctrl+]"], mac: ["Cmd+]"] },
  outdentLines: { label: "reducir la sangría", pc: ["Ctrl+["], mac: ["Cmd+["] },
  insertLineAfter: { label: "línea nueva abajo, sin cortar", pc: ["Ctrl+Enter"], mac: ["Cmd+Enter"] },
  insertLineBefore: { label: "línea nueva arriba", pc: ["Ctrl+Shift+Enter"], mac: ["Cmd+Shift+Enter"] },
  cut: { label: "cortar (sin selección, la línea entera)", pc: ["Ctrl+X"], mac: ["Cmd+X"] },
  copy: { label: "copiar (sin selección, la línea entera)", pc: ["Ctrl+C"], mac: ["Cmd+C"] },
  paste: { label: "pegar", pc: ["Ctrl+V"], mac: ["Cmd+V"] },
  undo: { label: "deshacer", pc: ["Ctrl+Z"], mac: ["Cmd+Z"] },
  redo: { label: "rehacer", pc: ["Ctrl+Y", "Ctrl+Shift+Z"], mac: ["Cmd+Shift+Z"] },
} satisfies Record<string, ActionDef>;

export type ActionId = keyof typeof ACTIONS;

/** Atajos que se enseñan pero no se practican: el navegador no los deja usar o necesitan varias pestañas. */
export const TAUGHT_ONLY: { pc: string; mac: string; what: string; why: string }[] = [
  { pc: "Ctrl+W", mac: "Cmd+W", what: "cerrar el archivo actual", why: "el navegador cierra la pestaña" },
  { pc: "Ctrl+N", mac: "Cmd+N", what: "archivo nuevo", why: "el navegador abre una ventana" },
  { pc: "Ctrl+T", mac: "Cmd+T", what: "ir a un símbolo de todo el proyecto", why: "el navegador abre una pestaña" },
  { pc: "Ctrl+Tab", mac: "Ctrl+Tab", what: "cambiar entre archivos abiertos", why: "el navegador cambia de pestaña" },
  { pc: "Ctrl+Shift+T", mac: "Cmd+Shift+T", what: "reabrir el archivo cerrado", why: "el navegador reabre una pestaña" },
  { pc: "Ctrl+Shift+N", mac: "Cmd+Shift+N", what: "ventana nueva de VS Code", why: "el navegador abre una ventana privada" },
  { pc: "Ctrl+P", mac: "Cmd+P", what: "abrir un archivo por nombre", why: "necesita un proyecto con varios archivos" },
  { pc: "Ctrl+Shift+P", mac: "Cmd+Shift+P", what: "paleta de comandos", why: "necesita la lista de comandos de VS Code" },
  { pc: "Ctrl+D", mac: "Cmd+D", what: "seleccionar la siguiente aparición (varios cursores)", why: "este editor tiene un solo cursor" },
  { pc: "Ctrl+`", mac: "Ctrl+`", what: "abrir o cerrar la terminal", why: "acá no hay terminal" },
];

/** Qué acción corresponde a una combinación en una plataforma. */
export function actionFor(combo: string, platform: Platform): ActionId | null {
  for (const [id, def] of Object.entries(ACTIONS) as [ActionId, ActionDef][]) if (def[platform].includes(combo)) return id;
  return null;
}

/** Combinación para mostrar: "Ctrl+Shift+K", con flechas como símbolos. */
export const prettyCombo = (combo: string) =>
  combo.replace("ArrowUp", "↑").replace("ArrowDown", "↓").replace("ArrowLeft", "←").replace("ArrowRight", "→");

// ── normalizar eventos de teclado ──────────────────────────────────────────

const MODIFIERS = new Set(["Control", "Shift", "Alt", "Meta", "AltGraph", "CapsLock", "OS", "Dead", "Unidentified", "Process"]);

/**
 * Convierte un evento en lo que entiende el editor: un carácter para escribir o una
 * combinación ("Ctrl+Shift+K"). null para teclas que no hacen nada (modificadores solos, Tab).
 */
export function readCombo(e: Pick<KeyboardEvent, "key" | "ctrlKey" | "metaKey" | "altKey" | "shiftKey"> & { getModifierState?: (k: string) => boolean }): string | null {
  if (MODIFIERS.has(e.key) || e.key === "Tab") return null;
  const altGr = e.getModifierState?.("AltGraph") ?? false;
  // AltGr en Windows llega como Ctrl+Alt: si produce un carácter, es para escribir
  const ctrl = e.ctrlKey && !(altGr && !e.metaKey && e.key.length === 1 && e.altKey);
  const alt = e.altKey && !altGr;
  const printable = e.key.length === 1;
  if (printable && !ctrl && !e.metaKey && !alt) return e.key;
  let key = printable ? e.key.toUpperCase() : e.key;
  if (key === " ") key = "Space";
  // un signo ya trae el Shift incluido (en el teclado italiano / es Shift+7)
  const shift = e.shiftKey && !(printable && !/[A-Z]/.test(key));
  return [ctrl && "Ctrl", e.metaKey && "Cmd", alt && "Alt", shift && "Shift", key].filter(Boolean).join("+");
}

// ── edición ────────────────────────────────────────────────────────────────

export interface VsOptions {
  /** espacios por nivel de sangría */
  tab: number;
  /** prefijo de comentario de línea ("// " o "# ") */
  comment: string;
}

const here = (s: EditorState): Pos => ({ line: s.line, col: s.col });

function selection(s: EditorState): [Pos, Pos] | null {
  if (!s.anchor || cmpPos(s.anchor, here(s)) === 0) return null;
  return cmpPos(s.anchor, here(s)) < 0 ? [s.anchor, here(s)] : [here(s), s.anchor];
}

/** Líneas que toca la selección (o la del cursor). */
function selLines(s: EditorState): [number, number] {
  const sel = selection(s);
  if (!sel) return [s.line, s.line];
  const [a, b] = sel;
  return [a.line, b.col === 0 && b.line > a.line ? b.line - 1 : b.line];
}

const moveTo = (s: EditorState, p: Pos, select: boolean): EditorState => ({
  ...s, line: p.line, col: p.col, anchor: select ? (s.anchor ?? here(s)) : null, pending: "",
});

function wordRight(s: EditorState): Pos {
  const t = s.lines[s.line];
  let i = s.col;
  if (i >= t.length) return s.line + 1 < s.lines.length ? { line: s.line + 1, col: 0 } : here(s);
  while (i < t.length && charClass(t[i]) === 0) i++;
  const cls = charClass(t[i]);
  while (i < t.length && charClass(t[i]) === cls) i++;
  return { line: s.line, col: i };
}

function wordLeft(s: EditorState): Pos {
  const t = s.lines[s.line];
  let i = s.col;
  if (i === 0) return s.line > 0 ? { line: s.line - 1, col: s.lines[s.line - 1].length } : here(s);
  while (i > 0 && charClass(t[i - 1]) === 0) i--;
  const cls = charClass(t[i - 1]);
  while (i > 0 && charClass(t[i - 1]) === cls) i--;
  return { line: s.line, col: i };
}

const vertical = (s: EditorState, d: number): Pos => {
  const line = clampLine(s, s.line + d);
  return { line, col: Math.min(s.col, s.lines[line].length) };
};

/** Borra la selección si hay; devuelve el estado sin cambios si no. */
const dropSelection = (s: EditorState): EditorState => {
  const sel = selection(s);
  return sel ? deleteRange(s, sel[0], sel[1]) : { ...s, anchor: null };
};

/** Guarda para deshacer; varias letras seguidas se deshacen juntas, como en VS Code. */
const edit = (s: EditorState, typing = false): EditorState => {
  const next = typing && s.pending === "type" ? s : pushUndo(s);
  return { ...next, pending: typing ? "type" : "" };
};

function act(s: EditorState, id: ActionId, o: VsOptions): EditorState {
  const sel = selection(s);
  const tab = " ".repeat(o.tab);
  switch (id) {
    case "cursorLeft": return sel ? moveTo(s, sel[0], false) : moveTo(s, s.col > 0 ? { line: s.line, col: s.col - 1 } : s.line > 0 ? { line: s.line - 1, col: s.lines[s.line - 1].length } : here(s), false);
    case "cursorRight": return sel ? moveTo(s, sel[1], false) : moveTo(s, s.col < s.lines[s.line].length ? { line: s.line, col: s.col + 1 } : s.line + 1 < s.lines.length ? { line: s.line + 1, col: 0 } : here(s), false);
    case "cursorUp": return moveTo(s, vertical(s, -1), false);
    case "cursorDown": return moveTo(s, vertical(s, 1), false);
    case "selectLeft": return moveTo(s, s.col > 0 ? { line: s.line, col: s.col - 1 } : s.line > 0 ? { line: s.line - 1, col: s.lines[s.line - 1].length } : here(s), true);
    case "selectRight": return moveTo(s, s.col < s.lines[s.line].length ? { line: s.line, col: s.col + 1 } : s.line + 1 < s.lines.length ? { line: s.line + 1, col: 0 } : here(s), true);
    case "selectUp": return moveTo(s, vertical(s, -1), true);
    case "selectDown": return moveTo(s, vertical(s, 1), true);
    case "cursorHome": case "selectHome": {
      // Home va al primer carácter que no es espacio; si ya está ahí, a la columna 0
      const first = indentOf(s.lines[s.line]).length;
      return moveTo(s, { line: s.line, col: s.col === first ? 0 : first }, id === "selectHome");
    }
    case "cursorEnd": case "selectEnd": return moveTo(s, { line: s.line, col: s.lines[s.line].length }, id === "selectEnd");
    case "cursorWordLeft": case "selectWordLeft": return moveTo(s, wordLeft(s), id === "selectWordLeft");
    case "cursorWordRight": case "selectWordRight": return moveTo(s, wordRight(s), id === "selectWordRight");
    case "cursorTop": return moveTo(s, { line: 0, col: 0 }, false);
    case "cursorBottom": return moveTo(s, { line: s.lines.length - 1, col: s.lines[s.lines.length - 1].length }, false);
    case "selectLine": {
      const [a, b] = selLines(s);
      const end = b + 1 < s.lines.length ? { line: b + 1, col: 0 } : { line: b, col: s.lines[b].length };
      return { ...s, anchor: { line: a, col: 0 }, line: end.line, col: end.col, pending: "" };
    }
    case "selectAll": {
      const last = s.lines.length - 1;
      return { ...s, anchor: { line: 0, col: 0 }, line: last, col: s.lines[last].length, pending: "" };
    }
    case "enter": {
      const next = dropSelection(edit(s));
      const before = next.lines[next.line].slice(0, next.col);
      const extra = before.trimEnd().endsWith("{") ? tab : "";
      return insertText(next, "\n" + indentOf(before) + extra);
    }
    case "deleteLeft": case "deleteRight": case "deleteWordLeft": case "deleteWordRight": {
      if (sel) return dropSelection(edit(s));
      const to = id === "deleteLeft"
        ? (s.col > 0 ? { line: s.line, col: s.col - 1 } : s.line > 0 ? { line: s.line - 1, col: s.lines[s.line - 1].length } : null)
        : id === "deleteRight"
          ? (s.col < s.lines[s.line].length ? { line: s.line, col: s.col + 1 } : s.line + 1 < s.lines.length ? { line: s.line + 1, col: 0 } : null)
          : id === "deleteWordLeft" ? wordLeft(s) : wordRight(s);
      if (!to || cmpPos(to, here(s)) === 0) return s;
      return deleteRange(edit(s), here(s), to);
    }
    case "deleteLines": {
      const [a, b] = selLines(s);
      const next = edit(s);
      const lines = [...next.lines];
      lines.splice(a, b - a + 1);
      if (!lines.length) lines.push("");
      const line = Math.min(a, lines.length - 1);
      return { ...next, lines, line, col: Math.min(s.col, lines[line].length), anchor: null };
    }
    case "moveLinesUp": case "moveLinesDown": {
      const [a, b] = selLines(s);
      const d = id === "moveLinesUp" ? -1 : 1;
      if ((d < 0 && a === 0) || (d > 0 && b === s.lines.length - 1)) return s;
      const next = edit(s);
      const lines = [...next.lines];
      const block = lines.splice(a, b - a + 1);
      lines.splice(a + d, 0, ...block);
      return { ...next, lines, line: s.line + d, anchor: s.anchor ? { line: s.anchor.line + d, col: s.anchor.col } : null };
    }
    case "copyLinesDown": case "copyLinesUp": {
      const [a, b] = selLines(s);
      const next = edit(s);
      const lines = [...next.lines];
      const block = lines.slice(a, b + 1);
      lines.splice(b + 1, 0, ...block);
      const d = id === "copyLinesDown" ? block.length : 0;
      return { ...next, lines, line: s.line + d, anchor: s.anchor ? { line: s.anchor.line + d, col: s.anchor.col } : null };
    }
    case "commentLine": {
      const [a, b] = selLines(s);
      const next = edit(s);
      const lines = [...next.lines];
      const idx = Array.from({ length: b - a + 1 }, (_, i) => a + i).filter((l) => lines[l].trim());
      if (!idx.length) return s;
      const mark = o.comment.trim();
      const min = Math.min(...idx.map((l) => indentOf(lines[l]).length));
      const commented = idx.every((l) => lines[l].trimStart().startsWith(mark));
      let shift = 0;
      for (const l of idx) {
        const ind = indentOf(lines[l]).length;
        if (commented) {
          const body = lines[l].slice(ind);
          const cut = body.startsWith(o.comment) ? o.comment.length : mark.length;
          lines[l] = lines[l].slice(0, ind) + body.slice(cut);
          if (l === s.line) shift = -cut;
        } else {
          lines[l] = lines[l].slice(0, min) + o.comment + lines[l].slice(min);
          if (l === s.line) shift = o.comment.length;
        }
      }
      return { ...next, lines, col: Math.max(0, s.col + shift) };
    }
    case "indentLines": case "outdentLines": {
      const [a, b] = selLines(s);
      const next = edit(s);
      const lines = [...next.lines];
      let shift = 0;
      for (let l = a; l <= b; l++) {
        if (id === "indentLines") {
          if (!lines[l]) continue;
          lines[l] = tab + lines[l];
          if (l === s.line) shift = o.tab;
        } else {
          const n = Math.min(o.tab, indentOf(lines[l]).length);
          lines[l] = lines[l].slice(n);
          if (l === s.line) shift = -n;
        }
      }
      const anchor = s.anchor ? { line: s.anchor.line, col: Math.max(0, s.anchor.col + (s.anchor.col === 0 ? 0 : shift)) } : null;
      return { ...next, lines, col: Math.max(0, s.col + shift), anchor };
    }
    case "insertLineAfter": case "insertLineBefore": {
      const next = edit(s);
      const lines = [...next.lines];
      const cur = lines[s.line];
      const after = id === "insertLineAfter";
      const ind = indentOf(cur) + (after && cur.trimEnd().endsWith("{") ? tab : "");
      const at = after ? s.line + 1 : s.line;
      lines.splice(at, 0, ind);
      return { ...next, lines, line: at, col: ind.length, anchor: null };
    }
    case "cut": case "copy": {
      if (sel) {
        const clip = { text: textBetween(s.lines, sel[0], sel[1]), linewise: false };
        return id === "copy" ? { ...s, clip } : { ...dropSelection(edit(s)), clip };
      }
      const clip = { text: s.lines[s.line], linewise: true };
      if (id === "copy") return { ...s, clip };
      const next = edit(s);
      const lines = [...next.lines];
      lines.splice(s.line, 1);
      if (!lines.length) lines.push("");
      const line = Math.min(s.line, lines.length - 1);
      return { ...next, lines, line, col: Math.min(s.col, lines[line].length), clip };
    }
    case "paste": {
      if (!s.clip) return s;
      if (s.clip.linewise && !sel) {
        // una línea copiada entera se pega arriba de la línea del cursor
        const next = edit(s);
        const lines = [...next.lines];
        const add = s.clip.text.split("\n");
        lines.splice(s.line, 0, ...add);
        return { ...next, lines, line: s.line + add.length };
      }
      return insertText(dropSelection(edit(s)), s.clip.text);
    }
    case "undo": return { ...undo(s), pending: "" };
    case "redo": return { ...redo(s), pending: "" };
  }
  return s;
}

/** Procesa una entrada: un carácter para escribir o una combinación. */
export function vscodeKey(s: EditorState, input: string, platform: Platform, o: VsOptions): EditorState {
  if (input.length === 1) return insertText(dropSelection(edit(s, true)), input);
  const id = actionFor(input, platform);
  return id ? act(s, id, o) : s;
}
