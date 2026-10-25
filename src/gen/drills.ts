import type { Lesson } from "../types";
import { SYMBOL_INFO } from "../data/curriculum";
import { type Rng, int, pick } from "./base";

const WORDS = [
  "data", "item", "user", "total", "count", "value", "name", "list", "index", "result", "node", "key",
  "price", "order", "size", "label", "query", "token", "cache", "event", "state", "config", "buffer",
  "items", "users", "score", "level", "limit", "offset", "path", "file", "line", "text", "input",
  "output", "error", "status", "client", "server", "request", "response", "page", "row", "col", "id",
];
const FUNCS = ["get", "set", "load", "save", "parse", "print", "len", "sum", "map", "find", "sort", "push", "send", "read", "write", "build", "check", "update"];
const TYPES = ["String", "List", "Map", "Option", "Result", "User", "Item", "Node", "Vec", "Task"];

const w = (r: Rng) => pick(r, WORDS);
const fn = (r: Rng) => pick(r, FUNCS);

/** número formado solo con dígitos permitidos */
function num(r: Rng, allowed: Set<string>): string {
  const digits = "0123456789".split("").filter((d) => allowed.has(d));
  if (digits.length === 0) return "";
  const len = int(r, 1, 3);
  let out = "";
  for (let i = 0; i < len; i++) out += pick(r, digits);
  return out.length > 1 && out[0] === "0" ? out.slice(1) : out;
}

interface Pattern {
  /** símbolos que usa el patrón (además de letras) */
  uses: string;
  make: (r: Rng, allowed: Set<string>) => string;
}

const P = (uses: string, make: Pattern["make"]): Pattern => ({ uses, make });

const PATTERNS: Pattern[] = [
  P("()", (r) => `${fn(r)}(${w(r)})`),
  P("()", (r) => `${fn(r)}()`),
  P("[]", (r) => `${w(r)}[i]`),
  P("[]", (r) => `[${w(r)}]`),
  P("{}", (r) => `{ ${w(r)} }`),
  P("=", (r) => `${w(r)} = ${w(r)}`),
  P("+", (r) => `${w(r)} + ${w(r)}`),
  P("-", (r) => `${w(r)} - ${w(r)}`),
  P("*", (r) => `${w(r)} * ${w(r)}`),
  P("/", (r) => `${w(r)} / ${w(r)}`),
  P("%", (r) => `${w(r)} % ${w(r)}`),
  P("<", (r) => `${w(r)} < ${w(r)}`),
  P(">", (r) => `${w(r)} > ${w(r)}`),
  P(".", (r) => `${w(r)}.${w(r)}`),
  P(".", (r) => `self.${w(r)}`),
  P(",", (r) => `${w(r)}, ${w(r)}`),
  P(":", (r) => `${w(r)}: ${w(r)}`),
  P(";", (r) => `${fn(r)} ${w(r)};`),
  P('"', (r) => `"${w(r)}"`),
  P("'", (r) => `'${w(r)}'`),
  P("_", (r) => `${w(r)}_${w(r)}`),
  P("#", (r) => `# ${w(r)} ${w(r)}`),
  P("!", (r) => `!${w(r)}`),
  P("?", (r) => `${w(r)}?`),
  P("&", (r) => `&${w(r)}`),
  P("|", (r) => `${w(r)} | ${w(r)}`),
  P("@", (r) => `@${fn(r)}`),
  P("$", (r) => `$${w(r)}`),
  P("^", (r) => `${w(r)} ^ ${w(r)}`),
  P("~", (r) => `~${w(r)}`),
  P("`", (r) => `\`${w(r)}\``),
  P("\\", (r) => `${w(r)}\\n`),
  P("0", (r, a) => `${w(r)} ${num(r, a)}`),
  // combinaciones típicas de código
  P("(),", (r) => `${fn(r)}(${w(r)}, ${w(r)})`),
  P("().", (r) => `${w(r)}.${fn(r)}(${w(r)})`),
  P("()=", (r) => `${w(r)} = ${fn(r)}(${w(r)})`),
  P("()\"", (r) => `${fn(r)}("${w(r)}")`),
  P("()'", (r) => `${fn(r)}('${w(r)}')`),
  P("[]=", (r) => `${w(r)}[${w(r)}] = ${w(r)}`),
  P("[],", (r) => `[${w(r)}, ${w(r)}]`),
  P("[]0", (r, a) => `${w(r)}[${num(r, a)}]`),
  P("{}:", (r) => `{ ${w(r)}: ${w(r)} }`),
  P("{}=", (r) => `{ ${w(r)} = ${w(r)} }`),
  P("{};", (r) => `{ ${fn(r)} ${w(r)}; }`),
  P("=0", (r, a) => `${w(r)} = ${num(r, a)}`),
  P("=+", (r) => `${w(r)} += ${w(r)}`),
  P("=-", (r) => `${w(r)} -= ${w(r)}`),
  P("=*", (r) => `${w(r)} *= ${w(r)}`),
  P("=!", (r) => `${w(r)} != ${w(r)}`),
  P("=", (r) => `${w(r)} == ${w(r)}`),
  P("=<", (r) => `${w(r)} <= ${w(r)}`),
  P("=>", (r) => `${w(r)} >= ${w(r)}`),
  P("=>()", (r) => `(${w(r)}) => ${w(r)}`),
  P("->", (r) => `${w(r)} -> ${pick(r, TYPES)}`),
  P("<>", (r) => `${pick(r, TYPES)}<${pick(r, TYPES)}>`),
  P(":=", (r) => `${w(r)} := ${w(r)}`),
  P(":", (r) => `${pick(r, TYPES)}::${fn(r)}`),
  P("&", (r) => `${w(r)} && ${w(r)}`),
  P("|", (r) => `${w(r)} || ${w(r)}`),
  P("|", (r) => `|${w(r)}| ${w(r)}`),
  P("?.", (r) => `${w(r)}?.${w(r)}`),
  P("?", (r) => `${w(r)} ?? ${w(r)}`),
  P("?:", (r) => `${w(r)} ? ${w(r)} : ${w(r)}`),
  P("!()", (r) => `${fn(r)}!(${w(r)})`),
  P("#[]()", (r) => `#[derive(${pick(r, TYPES)})]`),
  P("@()", (r) => `@${fn(r)}(${w(r)})`),
  P("$\"{}", (r) => `$"{${w(r)}}"`),
  P("`${}", (r) => `\`\${${w(r)}}\``),
  P("\"\\", (r) => `"${w(r)}\\n"`),
  P("*&", (r) => `*&${w(r)}`),
  P("'<>&", (r) => `&'a ${pick(r, TYPES)}`),
  P("%\"", (r) => `"%${pick(r, ["s", "d", "v"])}"`),
  P("/", (r) => `// ${w(r)} ${w(r)}`),
  P("+0", (r, a) => `${w(r)} + ${num(r, a)}`),
  P("-0", (r, a) => `${w(r)} - ${num(r, a)}`),
  P("*0", (r, a) => `${w(r)} * ${num(r, a)}`),
  P("%0=", (r, a) => `${w(r)} % ${num(r, a)} == ${num(r, a)}`),
  P("<0", (r, a) => `${w(r)} < ${num(r, a)}`),
  P("[]:", (r) => `${w(r)}[${w(r)}:]`),
];

const DIGITS = "0123456789";

function usable(p: Pattern, allowed: Set<string>): boolean {
  for (const ch of p.uses) {
    if (ch === "0") {
      if (![...DIGITS].some((d) => allowed.has(d))) return false;
    } else if (!allowed.has(ch)) return false;
  }
  return true;
}

function hits(p: Pattern, focus: string): boolean {
  if (DIGITS.includes(focus)) return p.uses.includes("0");
  return p.uses.includes(focus);
}

/** Ejercicio de símbolos: varias líneas con el símbolo foco en todas. */
export function drillLesson(allowed: Set<string>, focus: string, rng: Rng, lines = 5): Lesson {
  const ok = PATTERNS.filter((p) => usable(p, allowed));
  const withFocus = ok.filter((p) => hits(p, focus));
  const out: string[] = [];
  for (let i = 0; i < lines; i++) {
    const parts: string[] = [];
    const n = int(rng, 2, 3);
    for (let j = 0; j < n; j++) {
      const pool = withFocus.length && (j === 0 || rng() < 0.6) ? withFocus : ok.length ? ok : withFocus;
      let part = pick(rng, pool).make(rng, allowed);
      // con un dígito como foco, asegura que aparezca reemplazando el último dígito
      if (DIGITS.includes(focus) && pool === withFocus && !part.includes(focus)) {
        part = part.replace(/\d(?=\D*$)/, focus);
      }
      parts.push(part);
    }
    out.push(parts.join(" "));
  }
  const label = DIGITS.includes(focus) ? "números" : focus;
  return {
    kind: "drill",
    title: `Ejercicio de símbolo ${label} — ${SYMBOL_INFO[focus] ?? ""}`,
    tags: ["Ejercicio guiado", "Símbolos"],
    text: out.join("\n"),
    focus,
  };
}
