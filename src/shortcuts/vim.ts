// Un subconjunto de Vim, suficiente para los ejercicios: movimientos, operadores
// (d, c, y) con movimientos y objetos de texto, conteos, pegar, deshacer y repetir con «.».
import {
  type EditorState, type Pos, charClass, clampLine, deleteRange, indentOf, insertText, pushUndo, textBetween, undo,
} from "./buffer";

type MotionKind = "exclusive" | "inclusive" | "linewise";
interface Motion {
  to: Pos;
  kind: MotionKind;
}

const len = (s: EditorState, line = s.line) => s.lines[line].length;
const firstNonBlank = (text: string) => indentOf(text).length;

/** En modo normal el cursor nunca queda después del último carácter. */
const clampNormal = (s: EditorState): EditorState => {
  const line = clampLine(s, s.line);
  return { ...s, line, col: Math.max(0, Math.min(s.col, s.lines[line].length - 1)) };
};

// ── palabras ───────────────────────────────────────────────────────────────

function nextWordStart(lines: string[], p: Pos): Pos {
  const t = lines[p.line];
  let i = p.col;
  const cls = charClass(t[i]);
  if (cls) while (i < t.length && charClass(t[i]) === cls) i++;
  while (i < t.length && charClass(t[i]) === 0) i++;
  if (i < t.length) return { line: p.line, col: i };
  // sin línea siguiente: el final de la línea (al moverse se ajusta al último carácter)
  if (p.line + 1 >= lines.length) return { line: p.line, col: t.length };
  return { line: p.line + 1, col: firstNonBlank(lines[p.line + 1]) };
}

function prevWordStart(lines: string[], p: Pos): Pos {
  let { line } = p;
  let i = p.col - 1;
  while (true) {
    const t = lines[line];
    while (i >= 0 && charClass(t[i]) === 0) i--;
    if (i >= 0) {
      const cls = charClass(t[i]);
      while (i > 0 && charClass(t[i - 1]) === cls) i--;
      return { line, col: i };
    }
    if (line === 0) return { line: 0, col: 0 };
    line--;
    i = lines[line].length - 1;
  }
}

function wordEnd(lines: string[], p: Pos): Pos {
  const t = lines[p.line];
  let i = p.col + 1;
  while (i < t.length && charClass(t[i]) === 0) i++;
  if (i >= t.length) {
    if (p.line + 1 >= lines.length) return { line: p.line, col: Math.max(0, t.length - 1) };
    return wordEnd(lines, { line: p.line + 1, col: -1 });
  }
  const cls = charClass(t[i]);
  while (i + 1 < t.length && charClass(t[i + 1]) === cls) i++;
  return { line: p.line, col: i };
}

// ── movimientos ────────────────────────────────────────────────────────────

/** Resuelve un movimiento; "pending" si faltan teclas, null si no existe. */
function motion(s: EditorState, cmd: string, count: number, explicit: boolean): Motion | "pending" | null {
  const here: Pos = { line: s.line, col: s.col };
  const repeat = (fn: (p: Pos) => Pos) => {
    let p = here;
    for (let i = 0; i < count; i++) p = fn(p);
    return p;
  };
  switch (cmd) {
    case "h": return { to: { line: s.line, col: Math.max(0, s.col - count) }, kind: "exclusive" };
    case "l": return { to: { line: s.line, col: Math.min(len(s), s.col + count) }, kind: "exclusive" };
    case "j": return { to: { line: clampLine(s, s.line + count), col: s.col }, kind: "linewise" };
    case "k": return { to: { line: clampLine(s, s.line - count), col: s.col }, kind: "linewise" };
    case "w": return { to: repeat((p) => nextWordStart(s.lines, p)), kind: "exclusive" };
    case "b": return { to: repeat((p) => prevWordStart(s.lines, p)), kind: "exclusive" };
    case "e": return { to: repeat((p) => wordEnd(s.lines, p)), kind: "inclusive" };
    case "0": return { to: { line: s.line, col: 0 }, kind: "exclusive" };
    case "^": return { to: { line: s.line, col: firstNonBlank(s.lines[s.line]) }, kind: "exclusive" };
    case "$": return { to: { line: s.line, col: Math.max(0, len(s) - 1) }, kind: "inclusive" };
    case "G": return { to: { line: explicit ? clampLine(s, count - 1) : s.lines.length - 1, col: 0 }, kind: "linewise" };
    case "g": case "f": case "F": case "t": return "pending";
    case "gg": return { to: { line: explicit ? clampLine(s, count - 1) : 0, col: 0 }, kind: "linewise" };
  }
  if (cmd.length === 2 && "fFt".includes(cmd[0])) {
    const t = s.lines[s.line];
    let i = s.col;
    for (let n = 0; n < count; n++) {
      i = cmd[0] === "F" ? t.lastIndexOf(cmd[1], i - 1) : t.indexOf(cmd[1], i + 1);
      if (i < 0) return null;
    }
    if (cmd[0] === "t") i--;
    return { to: { line: s.line, col: i }, kind: cmd[0] === "F" ? "exclusive" : "inclusive" };
  }
  return null;
}

// ── objetos de texto (iw, i", i( ) ─────────────────────────────────────────

function textObject(s: EditorState, obj: string): { from: number; to: number } | null {
  const t = s.lines[s.line];
  if (obj === "w") {
    if (!t.length) return null;
    const cls = charClass(t[s.col]);
    let a = s.col;
    let b = s.col;
    while (a > 0 && charClass(t[a - 1]) === cls) a--;
    while (b < t.length && charClass(t[b]) === cls) b++;
    return { from: a, to: b };
  }
  if (obj === '"' || obj === "'") {
    const qs: number[] = [];
    for (let i = 0; i < t.length; i++) if (t[i] === obj && t[i - 1] !== "\\") qs.push(i);
    for (let i = 0; i + 1 < qs.length; i += 2) {
      // el cursor adentro del par, o el primer par que empieza después del cursor
      if (s.col <= qs[i + 1]) return { from: qs[i] + 1, to: qs[i + 1] };
    }
    return null;
  }
  if (obj === "(" || obj === ")" || obj === "b") {
    let depth = 0;
    let a = -1;
    for (let i = s.col; i >= 0; i--) {
      if (t[i] === ")" && i !== s.col) depth++;
      if (t[i] === "(") {
        if (depth === 0) {
          a = i;
          break;
        }
        depth--;
      }
    }
    if (a < 0) return null;
    depth = 0;
    for (let i = a + 1; i < t.length; i++) {
      if (t[i] === "(") depth++;
      if (t[i] === ")") {
        if (depth === 0) return { from: a + 1, to: i };
        depth--;
      }
    }
  }
  return null;
}

// ── operadores ─────────────────────────────────────────────────────────────

function applyOperator(s0: EditorState, op: string, m: Motion): EditorState {
  let s = s0;
  if (m.kind === "linewise") {
    const a = Math.min(s.line, m.to.line);
    const b = Math.max(s.line, m.to.line);
    const text = s.lines.slice(a, b + 1).join("\n");
    const clip = { text, linewise: true };
    if (op === "y") return { ...s, clip, line: a, col: s.col };
    s = pushUndo(s);
    const lines = [...s.lines];
    if (op === "c") {
      lines.splice(a, b - a + 1, "");
      return { ...s, lines, line: a, col: 0, clip, mode: "insert" };
    }
    lines.splice(a, b - a + 1);
    if (!lines.length) lines.push("");
    const line = Math.min(a, lines.length - 1);
    return { ...s, lines, clip, line, col: firstNonBlank(lines[line]) };
  }
  const here: Pos = { line: s.line, col: s.col };
  let from = here;
  let to = m.to;
  if (to.line < from.line || (to.line === from.line && to.col < from.col)) [from, to] = [to, from];
  if (m.kind === "inclusive") to = { line: to.line, col: Math.min(s.lines[to.line].length, to.col + 1) };
  const clip = { text: textBetween(s.lines, from, to), linewise: false };
  if (op === "y") return { ...s, clip, line: from.line, col: from.col };
  s = deleteRange(pushUndo(s), from, to);
  if (op === "c") return { ...s, clip, mode: "insert" };
  return clampNormal({ ...s, clip });
}

const enterInsert = (s: EditorState, line: number, col: number): EditorState => ({ ...pushUndo(s), line, col, mode: "insert" });

// ── teclas ─────────────────────────────────────────────────────────────────

/** Comandos que cambian el texto (se pueden repetir con «.»). */
const isChange = (rest: string) => /^([xXDCJpPioOaAIsS~]|r.|[dc].+)$/.test(rest);

function normal(s: EditorState, key: string): EditorState {
  if (key === "Escape") return { ...s, pending: "" };
  if (key.length !== 1) return s;
  const cmd = s.pending + key;
  const m = /^([1-9]\d*)?(.*)$/.exec(cmd)!;
  const explicit = m[1] !== undefined;
  const count = explicit ? Number(m[1]) : 1;
  const rest = m[2];
  if (!rest) return { ...s, pending: cmd };
  const done = (next: EditorState): EditorState => {
    const out = { ...next, pending: "" };
    if (!isChange(rest)) return out;
    // un cambio: se graba para «.»; si entra en inserción, sigue grabando hasta Esc
    return out.mode === "insert" ? { ...out, rec: [...cmd] } : { ...out, lastChange: [...cmd], rec: null };
  };
  const t = s.lines[s.line];

  // operadores: d, c, y
  if ("dcy".includes(rest[0])) {
    const op = rest[0];
    const arg = rest.slice(1);
    if (!arg) return { ...s, pending: cmd };
    if (arg === op) {
      const to = { line: clampLine(s, s.line + count - 1), col: 0 };
      return done(applyOperator(s, op, { to, kind: "linewise" }));
    }
    if (arg[0] === "i") {
      if (arg.length === 1) return { ...s, pending: cmd };
      const r = textObject(s, arg[1]);
      if (!r) return { ...s, pending: "" };
      const at = { ...s, col: r.from };
      return done(applyOperator(at, op, { to: { line: s.line, col: r.to }, kind: "exclusive" }));
    }
    const am = /^([1-9]\d*)?(.*)$/.exec(arg)!;
    if (!am[2]) return { ...s, pending: cmd };
    const n = count * (am[1] ? Number(am[1]) : 1);
    // cw cambia hasta el final de la palabra, como ce (salvo sobre espacios)
    const mk = op === "c" && am[2] === "w" && charClass(t[s.col]) !== 0 ? "e" : am[2];
    const mv = motion(s, mk, n, explicit || !!am[1]);
    if (mv === "pending") return { ...s, pending: cmd };
    if (!mv) return { ...s, pending: "" };
    // dw en la última palabra de la línea no se lleva la línea siguiente
    if (am[2] === "w" && mv.to.line > s.line) mv.to = { line: s.line, col: t.length };
    return done(applyOperator(s, op, mv));
  }

  const mv = motion(s, rest, count, explicit);
  if (mv === "pending") return { ...s, pending: cmd };
  if (mv) return { ...clampNormal({ ...s, line: mv.to.line, col: mv.kind === "linewise" && "jk".includes(rest) ? s.col : mv.to.col }), pending: "" };

  switch (rest[0]) {
    case "x": case "X": {
      if (!t.length || (rest === "X" && s.col === 0)) return { ...s, pending: "" };
      const from = rest === "x" ? s.col : Math.max(0, s.col - count);
      const to = rest === "x" ? Math.min(t.length, s.col + count) : s.col;
      const clip = { text: t.slice(from, to), linewise: false };
      return done(clampNormal({ ...deleteRange(pushUndo(s), { line: s.line, col: from }, { line: s.line, col: to }), clip }));
    }
    case "D": return done(applyOperator(s, "d", { to: { line: s.line, col: Math.max(0, t.length - 1) }, kind: "inclusive" }));
    case "C": return done(t.length ? applyOperator(s, "c", { to: { line: s.line, col: t.length - 1 }, kind: "inclusive" }) : enterInsert(s, s.line, 0));
    case "J": {
      if (s.line + 1 >= s.lines.length) return { ...s, pending: "" };
      let next = pushUndo(s);
      for (let i = 0; i < Math.max(1, count - 1) && next.line + 1 < next.lines.length; i++) {
        const lines = [...next.lines];
        const a = lines[next.line].replace(/\s+$/, "");
        const b = lines[next.line + 1].trimStart();
        const glue = a && b && !b.startsWith(")") ? " " : "";
        lines.splice(next.line, 2, a + glue + b);
        next = { ...next, lines, col: a.length };
      }
      return done(next);
    }
    case "p": case "P": {
      if (!s.clip) return { ...s, pending: "" };
      let next = pushUndo(s);
      if (s.clip.linewise) {
        const lines = [...next.lines];
        const at = rest === "p" ? s.line + 1 : s.line;
        const add = Array.from({ length: count }, () => s.clip!.text.split("\n")).flat();
        lines.splice(at, 0, ...add);
        return done({ ...next, lines, line: at, col: firstNonBlank(lines[at]) });
      }
      const at = rest === "p" && t.length ? s.col + 1 : s.col;
      next = insertText({ ...next, col: at }, s.clip.text.repeat(count));
      return done(clampNormal({ ...next, col: next.col - 1 }));
    }
    case "r": {
      if (rest.length < 2) return { ...s, pending: cmd };
      if (s.col + count > t.length) return { ...s, pending: "" };
      const lines = [...s.lines];
      lines[s.line] = t.slice(0, s.col) + rest[1].repeat(count) + t.slice(s.col + count);
      return done({ ...pushUndo(s), lines, col: s.col + count - 1 });
    }
    case "i": return done(enterInsert(s, s.line, s.col));
    case "a": return done(enterInsert(s, s.line, t.length ? s.col + 1 : 0));
    case "I": return done(enterInsert(s, s.line, firstNonBlank(t)));
    case "A": return done(enterInsert(s, s.line, t.length));
    case "o": case "O": {
      const at = rest === "o" ? s.line + 1 : s.line;
      const next = pushUndo(s);
      const lines = [...next.lines];
      lines.splice(at, 0, "");
      return done({ ...next, lines, line: at, col: 0, mode: "insert" });
    }
    case "u": {
      let next = s;
      for (let i = 0; i < count; i++) next = undo(next);
      return clampNormal({ ...next, pending: "" });
    }
    case ".": {
      let next: EditorState = { ...s, pending: "" };
      for (let i = 0; i < count; i++) for (const k of s.lastChange) next = vimKey(next, k);
      return next;
    }
  }
  return { ...s, pending: "" };
}

function insert(s: EditorState, key: string): EditorState {
  const rec = s.rec ? [...s.rec, key] : null;
  if (key === "Escape") {
    return clampNormal({ ...s, mode: "normal", col: Math.max(0, s.col - 1), rec: null, lastChange: rec ?? s.lastChange });
  }
  if (key === "Enter") return { ...insertText(s, "\n"), rec };
  if (key === "Backspace") {
    if (s.col > 0) return { ...deleteRange(s, { line: s.line, col: s.col - 1 }, { line: s.line, col: s.col }), rec };
    if (s.line > 0) return { ...deleteRange(s, { line: s.line - 1, col: s.lines[s.line - 1].length }, { line: s.line, col: 0 }), rec };
    return { ...s, rec };
  }
  if (key.length === 1) return { ...insertText(s, key), rec };
  return s;
}

/** Procesa una tecla: un carácter, o Escape, Enter o Backspace. */
export function vimKey(s: EditorState, key: string): EditorState {
  return s.mode === "insert" ? insert(s, key) : normal(s, key);
}
