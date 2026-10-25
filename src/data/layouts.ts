import type { LayoutId } from "../types";

export type Finger = "lp" | "lr" | "lm" | "li" | "ri" | "rm" | "rr" | "rp" | "th";

export const FINGER_NAMES: Record<Finger, string> = {
  lp: "meñique izquierdo",
  lr: "anular izquierdo",
  lm: "medio izquierdo",
  li: "índice izquierdo",
  ri: "índice derecho",
  rm: "medio derecho",
  rr: "anular derecho",
  rp: "meñique derecho",
  th: "pulgar",
};

/** Leyenda de una tecla: [normal, shift, altgr, shift+altgr]. "" = nada. */
type Legend = [string, string, string?, string?];

export interface KeyDef {
  code: string;
  label?: string; // teclas especiales (Tab, Shift…)
  w: number; // ancho en unidades
  finger: Finger;
}

export interface LayoutDef {
  id: LayoutId;
  name: string;
  short: string;
  iso: boolean;
  legends: Record<string, Legend>;
  /** caracteres que en este layout son teclas muertas (se confirman con Espacio) */
  dead: string[];
  /** caracteres sin tecla directa y cómo escribirlos */
  missing: Record<string, string>;
  notes?: string;
}

const F: Record<string, Finger> = {
  Backquote: "lp", Digit1: "lp", Digit2: "lr", Digit3: "lm", Digit4: "li", Digit5: "li",
  Digit6: "ri", Digit7: "ri", Digit8: "rm", Digit9: "rr", Digit0: "rp", Minus: "rp", Equal: "rp",
  KeyQ: "lp", KeyW: "lr", KeyE: "lm", KeyR: "li", KeyT: "li", KeyY: "ri", KeyU: "ri", KeyI: "rm",
  KeyO: "rr", KeyP: "rp", BracketLeft: "rp", BracketRight: "rp", Backslash: "rp",
  KeyA: "lp", KeyS: "lr", KeyD: "lm", KeyF: "li", KeyG: "li", KeyH: "ri", KeyJ: "ri", KeyK: "rm",
  KeyL: "rr", Semicolon: "rp", Quote: "rp",
  IntlBackslash: "lp", KeyZ: "lp", KeyX: "lr", KeyC: "lm", KeyV: "li", KeyB: "li", KeyN: "ri",
  KeyM: "ri", Comma: "rm", Period: "rr", Slash: "rp",
};

const k = (code: string, w = 1): KeyDef => ({ code, w, finger: F[code] ?? "rp" });
const sp = (code: string, label: string, w: number, finger: Finger): KeyDef => ({ code, label, w, finger });

const NUM_ROW = [
  k("Backquote"), k("Digit1"), k("Digit2"), k("Digit3"), k("Digit4"), k("Digit5"), k("Digit6"),
  k("Digit7"), k("Digit8"), k("Digit9"), k("Digit0"), k("Minus"), k("Equal"),
  sp("Backspace", "Backspace", 2, "rp"),
];
const Q_ROW = ["KeyQ", "KeyW", "KeyE", "KeyR", "KeyT", "KeyY", "KeyU", "KeyI", "KeyO", "KeyP", "BracketLeft", "BracketRight"].map((c) => k(c));
const A_ROW = ["KeyA", "KeyS", "KeyD", "KeyF", "KeyG", "KeyH", "KeyJ", "KeyK", "KeyL", "Semicolon", "Quote"].map((c) => k(c));
const Z_ROW = ["KeyZ", "KeyX", "KeyC", "KeyV", "KeyB", "KeyN", "KeyM", "Comma", "Period", "Slash"].map((c) => k(c));
const BOTTOM = [
  sp("ControlLeft", "Ctrl", 1.5, "lp"), sp("MetaLeft", "Win", 1.25, "lp"), sp("AltLeft", "Alt", 1.25, "th"),
  sp("Space", "", 6.25, "th"),
  sp("AltRight", "AltGr", 1.25, "th"), sp("MetaRight", "Win", 1.25, "rp"), sp("ControlRight", "Ctrl", 1.5, "rp"),
];

export const ANSI_ROWS: KeyDef[][] = [
  NUM_ROW,
  [sp("Tab", "Tab", 1.5, "lp"), ...Q_ROW, sp("Backslash", "", 1.5, "rp")],
  [sp("CapsLock", "Bloq Mayús", 1.75, "lp"), ...A_ROW, sp("Enter", "Enter", 2.25, "rp")],
  [sp("ShiftLeft", "Shift", 2.25, "lp"), ...Z_ROW, sp("ShiftRight", "Shift", 2.75, "rp")],
  BOTTOM.map((b) => (b.code === "AltRight" ? { ...b, label: "Alt" } : b)),
];

export const ISO_ROWS: KeyDef[][] = [
  NUM_ROW,
  [sp("Tab", "Tab", 1.5, "lp"), ...Q_ROW, sp("Enter", "Enter", 1.5, "rp")],
  [sp("CapsLock", "Bloq Mayús", 1.75, "lp"), ...A_ROW, k("Backslash"), sp("Enter", "", 1.25, "rp")],
  [sp("ShiftLeft", "Shift", 1.25, "lp"), k("IntlBackslash"), ...Z_ROW, sp("ShiftRight", "Shift", 2.75, "rp")],
  BOTTOM,
];

const letters = (): Record<string, Legend> => {
  const out: Record<string, Legend> = {};
  for (const ch of "abcdefghijklmnopqrstuvwxyz") out["Key" + ch.toUpperCase()] = [ch, ch.toUpperCase()];
  return out;
};

const US: LayoutDef = {
  id: "us",
  name: "Inglés (EE. UU.)",
  short: "US",
  iso: false,
  dead: [],
  missing: {},
  legends: {
    ...letters(),
    Backquote: ["`", "~"], Digit1: ["1", "!"], Digit2: ["2", "@"], Digit3: ["3", "#"], Digit4: ["4", "$"],
    Digit5: ["5", "%"], Digit6: ["6", "^"], Digit7: ["7", "&"], Digit8: ["8", "*"], Digit9: ["9", "("],
    Digit0: ["0", ")"], Minus: ["-", "_"], Equal: ["=", "+"], BracketLeft: ["[", "{"], BracketRight: ["]", "}"],
    Backslash: ["\\", "|"], Semicolon: [";", ":"], Quote: ["'", '"'], Comma: [",", "<"], Period: [".", ">"],
    Slash: ["/", "?"],
  },
};

const IT: LayoutDef = {
  id: "it",
  name: "Italiano",
  short: "IT",
  iso: true,
  dead: [],
  missing: {
    "`": "Windows: Alt + 96 (teclado numérico) · Linux: AltGr + '",
    "~": "Windows: Alt + 126 (teclado numérico) · Linux: AltGr + ì",
  },
  notes: "En el teclado italiano [ ] se escriben con AltGr y { } con Shift + AltGr. La comilla invertida y la tilde (~) no tienen tecla propia.",
  legends: {
    ...letters(),
    KeyE: ["e", "E", "€"],
    Backquote: ["\\", "|"], Digit1: ["1", "!"], Digit2: ["2", '"'], Digit3: ["3", "£"], Digit4: ["4", "$"],
    Digit5: ["5", "%"], Digit6: ["6", "&"], Digit7: ["7", "/"], Digit8: ["8", "("], Digit9: ["9", ")"],
    Digit0: ["0", "="], Minus: ["'", "?"], Equal: ["ì", "^"],
    BracketLeft: ["è", "é", "[", "{"], BracketRight: ["+", "*", "]", "}"],
    Semicolon: ["ò", "ç", "@"], Quote: ["à", "°", "#"], Backslash: ["ù", "§"],
    IntlBackslash: ["<", ">"], Comma: [",", ";"], Period: [".", ":"], Slash: ["-", "_"],
  },
};

const ES: LayoutDef = {
  id: "es",
  name: "Español (España)",
  short: "ES",
  iso: true,
  dead: ["`", "^", "´", "¨", "~"],
  missing: {},
  notes: "` ^ y ~ son teclas muertas: después de pulsarlas apretá Espacio para que aparezca el símbolo.",
  legends: {
    ...letters(),
    KeyE: ["e", "E", "€"],
    Backquote: ["º", "ª", "\\"], Digit1: ["1", "!", "|"], Digit2: ["2", '"', "@"], Digit3: ["3", "·", "#"],
    Digit4: ["4", "$", "~"], Digit5: ["5", "%", "€"], Digit6: ["6", "&", "¬"], Digit7: ["7", "/"],
    Digit8: ["8", "("], Digit9: ["9", ")"], Digit0: ["0", "="], Minus: ["'", "?"], Equal: ["¡", "¿"],
    BracketLeft: ["`", "^", "["], BracketRight: ["+", "*", "]"],
    Semicolon: ["ñ", "Ñ"], Quote: ["´", "¨", "{"], Backslash: ["ç", "Ç", "}"],
    IntlBackslash: ["<", ">"], Comma: [",", ";"], Period: [".", ":"], Slash: ["-", "_"],
  },
};

const LATAM: LayoutDef = {
  id: "latam",
  name: "Español (Latinoamérica)",
  short: "LA",
  iso: true,
  dead: ["´", "¨", "^", "`"],
  missing: {},
  notes: "^ y ` pueden comportarse como teclas muertas: si no aparecen, apretá Espacio después.",
  legends: {
    ...letters(),
    KeyQ: ["q", "Q", "@"],
    Backquote: ["|", "°", "¬"], Digit1: ["1", "!"], Digit2: ["2", '"'], Digit3: ["3", "#"], Digit4: ["4", "$"],
    Digit5: ["5", "%"], Digit6: ["6", "&"], Digit7: ["7", "/"], Digit8: ["8", "("], Digit9: ["9", ")"],
    Digit0: ["0", "="], Minus: ["'", "?", "\\"], Equal: ["¿", "¡"],
    BracketLeft: ["´", "¨"], BracketRight: ["+", "*", "~"],
    Semicolon: ["ñ", "Ñ"], Quote: ["{", "[", "^"], Backslash: ["}", "]", "`"],
    IntlBackslash: ["<", ">"], Comma: [",", ";"], Period: [".", ":"], Slash: ["-", "_"],
  },
};

export const LAYOUTS: Record<LayoutId, LayoutDef> = { it: IT, us: US, es: ES, latam: LATAM };

export function rowsFor(layout: LayoutDef): KeyDef[][] {
  return layout.iso ? ISO_ROWS : ANSI_ROWS;
}

export interface Combo {
  code: string;
  shift: boolean;
  altgr: boolean;
  dead: boolean;
  finger: Finger;
}

const comboCache = new Map<LayoutId, Map<string, Combo>>();

/** Cómo se escribe cada carácter en un layout. */
export function comboMap(layout: LayoutDef): Map<string, Combo> {
  const cached = comboCache.get(layout.id);
  if (cached) return cached;
  const map = new Map<string, Combo>();
  const allKeys = rowsFor(layout).flat();
  for (const key of allKeys) {
    const lg = layout.legends[key.code];
    if (!lg) continue;
    const variants: [string | undefined, boolean, boolean][] = [
      [lg[0], false, false],
      [lg[1], true, false],
      [lg[2], false, true],
      [lg[3], true, true],
    ];
    for (const [ch, shift, altgr] of variants) {
      if (!ch || map.has(ch)) continue;
      map.set(ch, { code: key.code, shift, altgr, dead: layout.dead.includes(ch), finger: key.finger });
    }
  }
  map.set(" ", { code: "Space", shift: false, altgr: false, dead: false, finger: "th" });
  map.set("\n", { code: "Enter", shift: false, altgr: false, dead: false, finger: "rp" });
  comboCache.set(layout.id, map);
  return map;
}

export function keyLabel(layout: LayoutDef, code: string): string {
  const lg = layout.legends[code];
  if (!lg) return code;
  return lg[0].length === 1 && /[a-z]/.test(lg[0]) ? lg[0].toUpperCase() : lg[0];
}

/** Texto legible de la combinación, p. ej. "Shift + AltGr + è". */
export function comboText(layout: LayoutDef, ch: string): string {
  if (ch === "\n") return "Enter";
  if (ch === " ") return "Espacio";
  const c = comboMap(layout).get(ch);
  if (!c) return layout.missing[ch] ?? "sin tecla en este teclado";
  const parts: string[] = [];
  if (c.shift) parts.push("Shift");
  if (c.altgr) parts.push("AltGr");
  parts.push(keyLabel(layout, c.code));
  let txt = parts.join(" + ");
  if (c.dead) txt += " → Espacio";
  return txt;
}

export function isTypeable(layout: LayoutDef, ch: string): boolean {
  return comboMap(layout).has(ch);
}
