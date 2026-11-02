// Corrige una respuesta escrita de memoria.
// Un error leve (espacios, comillas, orden de opciones, mayúsculas en SQL, el ; final)
// se acepta con un aviso. Un error grave (otro comando, otra opción, otro argumento)
// no deja avanzar: se explica qué está mal y se ofrece una pista.

export type Kind = "shell" | "sql" | "code";

export type Verdict =
  | { status: "ok" }
  | { status: "minor"; notes: string[]; expected: string }
  | { status: "wrong"; reason: string };

// ── herramientas sobre texto con comillas ──────────────────────────────────

/** Parte el texto en tramos fuera y dentro de comillas (las comillas quedan en el tramo). */
function pieces(s: string): { text: string; quoted: boolean }[] {
  const out: { text: string; quoted: boolean }[] = [];
  let i = 0;
  while (i < s.length) {
    const q = s[i];
    if (q === '"' || q === "'") {
      const end = s.indexOf(q, i + 1);
      const j = end < 0 ? s.length : end + 1;
      out.push({ text: s.slice(i, j), quoted: true });
      i = j;
    } else {
      let j = i;
      while (j < s.length && s[j] !== '"' && s[j] !== "'") j++;
      out.push({ text: s.slice(i, j), quoted: false });
      i = j;
    }
  }
  return out;
}

const outside = (s: string, fn: (t: string) => string) =>
  pieces(s).map((p) => (p.quoted ? p.text : fn(p.text))).join("");

/** Comillas simples o dobles, todas como dobles. */
const doubleQuotes = (s: string) =>
  pieces(s).map((p) => (p.quoted && p.text[0] === "'" ? `"${p.text.slice(1, p.text.endsWith("'") && p.text.length > 1 ? -1 : undefined)}"` : p.text)).join("");

/** Espacios: uno solo entre palabras y ninguno junto a signos. */
function tightSpaces(s: string): string {
  // solo fuera de las comillas: el texto de un string tiene que quedar igual
  return outside(s, (t) => t.replace(/\s+/g, " ").replace(/ (?=[^\w"' ])|(?<=[^\w"' ]) /g, "")).trim();
}

const oneSpace = (s: string) => outside(s, (t) => t.replace(/\s+/g, " ")).trim();

// ── terminal: palabras, opciones y tuberías ────────────────────────────────

/** Palabras de un comando, respetando las comillas. */
export function words(s: string): string[] {
  const out: string[] = [];
  let cur = "";
  for (const p of pieces(s.trim())) {
    if (p.quoted) {
      cur += p.text;
      continue;
    }
    const parts = p.text.split(/\s+/);
    parts.forEach((w, i) => {
      if (i > 0) {
        if (cur) out.push(cur);
        cur = "";
      }
      cur += w;
    });
  }
  if (cur) out.push(cur);
  return out;
}

const isFlag = (w: string) => /^-{1,2}[A-Za-z]/.test(w) || /^-\d+$/.test(w);
const isValue = (w: string) => /^["']/.test(w) || /^\d+$/.test(w);

/** Una palabra entre comillas que no las necesita queda sin ellas; el resto, con dobles. */
const shellQuotes = (s: string) =>
  words(s)
    .map((w) => {
      const m = /^(["'])(.*)\1$/.exec(w);
      if (!m) return w;
      return /^[\w./@:-]+$/.test(m[2]) ? m[2] : `"${m[2]}"`;
    })
    .join(" ");

interface Segment {
  args: string[];
  flags: string[];
}

/** Separa cada tramo de la tubería en argumentos (en orden) y opciones con su valor. */
function segments(s: string): Segment[] {
  const out: Segment[] = [{ args: [], flags: [] }];
  const ws = words(s);
  for (let i = 0; i < ws.length; i++) {
    const w = ws[i];
    if (w === "|" || w === "&&") {
      out.push({ args: [], flags: [] });
      continue;
    }
    const seg = out[out.length - 1];
    if (isFlag(w)) {
      const next = ws[i + 1];
      if (next !== undefined && isValue(next)) {
        seg.flags.push(`${w} ${next}`);
        i++;
      } else seg.flags.push(w);
    } else seg.args.push(w);
  }
  return out;
}

// herramientas cuyo comando real es la palabra siguiente (git switch, npm install…)
const WITH_SUB = new Set(["git", "npm", "docker", "cargo", "go", "pip", "apt", "kubectl", "systemctl"]);
const command = (g: Segment) => (WITH_SUB.has(g.args[0]) ? `${g.args[0]} ${g.args[1] ?? ""}` : g.args[0] ?? "");

const sortedFlags = (s: string) =>
  segments(s).map((g) => [...g.args, ...[...g.flags].sort()].join(" ")).join(" | ");

// ── transformaciones por tipo de respuesta ─────────────────────────────────

interface Transform {
  id: string;
  apply: (s: string) => string;
}

const T: Record<string, Transform> = {
  spaces: { id: "spaces", apply: (s) => tightSpaces(s) },
  shellSpaces: { id: "spaces", apply: (s) => oneSpace(s) },
  quotes: { id: "quotes", apply: doubleQuotes },
  shellQuotes: { id: "quotes", apply: shellQuotes },
  order: { id: "order", apply: sortedFlags },
  semi: { id: "semi", apply: (s) => s.trim().replace(/;\s*$/, "") },
  case: { id: "case", apply: (s) => outside(s, (t) => t.toLowerCase()) },
};

const TRANSFORMS: Record<Kind, Transform[]> = {
  shell: [T.shellSpaces, T.shellQuotes, T.order],
  sql: [T.semi, T.spaces, T.case],
  code: [T.semi, T.quotes, T.spaces],
};

const NOTES: Record<Kind, Record<string, string>> = {
  shell: {
    spaces: "Tenés espacios de más: la terminal los ignora.",
    quotes: "Usaste otras comillas (o ninguna) donde no cambian nada.",
    order: "Pusiste las opciones en otro orden: el comando hace lo mismo.",
  },
  sql: {
    semi: "Falta el ; que cierra la sentencia: en la consola de la base hace falta.",
    spaces: "Los espacios son distintos: SQL los ignora.",
    case: "Por convención las palabras clave van en MAYÚSCULAS, aunque el motor las acepta igual.",
  },
  code: {
    semi: "Cambia el ; final: acá funciona igual, pero conviene seguir un estilo.",
    quotes: "Usaste otras comillas: en este lenguaje valen igual.",
    spaces: "Los espacios son distintos a los del estilo habitual; funciona igual.",
  },
};

const run = (s: string, list: Transform[]) => list.reduce((acc, t) => t.apply(acc), s);

/** Compara con una respuesta válida: ok, leve (con los avisos) o distinta. */
function against(input: string, answer: string, kind: Kind): Verdict | null {
  if (input.trim() === answer.trim()) return { status: "ok" };
  const list = TRANSFORMS[kind];
  if (run(input, list) !== run(answer, list)) return null;
  // un aviso por cada transformación que hizo falta para que coincidan
  const notes = list
    .filter((t) => {
      const rest = list.filter((x) => x !== t);
      return run(input, rest) !== run(answer, rest);
    })
    .map((t) => NOTES[kind][t.id]);
  if (!notes.length) notes.push(NOTES[kind].spaces);
  return { status: "minor", notes, expected: answer };
}

/** Explica, sin dar la respuesta, por qué no es correcta. */
function reason(input: string, answers: string[], kind: Kind): string {
  if (!input.trim()) return "Escribí una respuesta.";
  if (kind === "shell") {
    const mine = segments(shellQuotes(oneSpace(input)));
    const best =
      answers.map((a) => segments(shellQuotes(oneSpace(a)))).find((g) => command(g[0]) === command(mine[0])) ??
      segments(shellQuotes(oneSpace(answers[0])));
    if (command(mine[0]) !== command(best[0])) return "Ese comando hace otra cosa.";
    if (mine.length !== best.length) return best.length > mine.length ? "Falta una parte del comando." : "Sobra una parte del comando.";
    for (let i = 0; i < best.length; i++) {
      const want = best[i].flags.map((f) => f.split(" ")[0]);
      const got = mine[i].flags.map((f) => f.split(" ")[0]);
      const extra = got.find((f) => !want.includes(f));
      if (extra) return `La opción ${extra} no va acá: cambia lo que hace el comando.`;
      if (want.some((f) => !got.includes(f))) return "Falta una opción.";
      if (best[i].args.length > mine[i].args.length) return "Falta un argumento.";
      if (best[i].args.length < mine[i].args.length) return "Sobra un argumento.";
      if (best[i].args.join(" ") !== mine[i].args.join(" ")) return "Revisá los argumentos: un nombre o un valor no es el que se pide.";
      if ([...best[i].flags].sort().join(" ") !== [...mine[i].flags].sort().join(" ")) return "Revisá el valor de una opción.";
    }
    return "Hay una diferencia que cambia lo que hace el comando.";
  }
  if (kind === "sql") {
    const singles = (s: string) => s.replace(/"/g, "'");
    const list = TRANSFORMS.sql;
    if (answers.some((a) => run(singles(input), list) === run(a, list)))
      return "En SQL los textos van entre comillas simples: las dobles son para nombres de tablas o columnas.";
    const first = (s: string) => /^\s*(\w+)/.exec(s)?.[1].toUpperCase();
    if (first(input) !== first(answers[0])) return `La sentencia no empieza con ${first(input) ?? "eso"}: esa palabra hace otra cosa.`;
    return "Hay una diferencia que cambia el resultado de la consulta.";
  }
  return "Hay una diferencia que cambia lo que hace el código.";
}

/** Corrige la respuesta contra todas las válidas y se queda con el mejor resultado. */
export function check(input: string, answers: string[], kind: Kind): Verdict {
  let minor: Verdict | null = null;
  for (const a of answers) {
    const v = against(input, a, kind);
    if (v?.status === "ok") return v;
    if (v && (!minor || (minor.status === "minor" && v.status === "minor" && v.notes.length < minor.notes.length))) minor = v;
  }
  return minor ?? { status: "wrong", reason: reason(input, answers, kind) };
}
