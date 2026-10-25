import type { LangId } from "./types";

export type Tok = "kw" | "ty" | "str" | "num" | "com" | "fn" | "op" | "pun" | "id" | "dec" | "sp";

const KW: Record<LangId, string[]> = {
  python: ["def", "return", "if", "elif", "else", "for", "while", "in", "not", "and", "or", "is", "None", "True", "False", "class", "import", "from", "as", "with", "try", "except", "raise", "lambda", "async", "await", "pass", "yield", "self"],
  javascript: ["function", "return", "if", "else", "for", "while", "of", "in", "const", "let", "var", "new", "class", "this", "throw", "try", "catch", "async", "await", "import", "from", "export", "true", "false", "null", "undefined", "typeof"],
  typescript: ["function", "return", "if", "else", "for", "while", "of", "in", "const", "let", "new", "class", "this", "throw", "try", "catch", "async", "await", "import", "from", "export", "true", "false", "null", "undefined", "interface", "type", "enum", "implements", "readonly", "public", "private", "constructor"],
  java: ["public", "private", "protected", "static", "final", "return", "if", "else", "for", "while", "new", "class", "record", "interface", "enum", "implements", "extends", "throw", "throws", "try", "catch", "this", "true", "false", "null", "void", "int", "long", "double", "boolean", "char"],
  csharp: ["public", "private", "static", "return", "if", "else", "for", "foreach", "while", "in", "new", "class", "record", "interface", "enum", "throw", "try", "catch", "this", "true", "false", "null", "void", "int", "long", "double", "decimal", "bool", "string", "var", "async", "await", "override", "get", "set", "with", "is", "or", "switch", "nameof"],
  go: ["func", "return", "if", "else", "for", "range", "var", "const", "type", "struct", "interface", "map", "make", "append", "len", "nil", "true", "false", "defer", "switch", "case", "default", "iota", "int", "float64", "string", "bool", "error", "rune", "min", "max"],
  sql: [
    "SELECT", "FROM", "WHERE", "AND", "OR", "NOT", "INSERT", "INTO", "VALUES", "UPDATE", "SET", "DELETE", "CREATE", "TABLE",
    "INDEX", "UNIQUE", "ON", "AS", "JOIN", "LEFT", "GROUP", "BY", "HAVING", "ORDER", "ASC", "DESC", "LIMIT", "PRIMARY", "KEY",
    "DEFAULT", "NULL", "TRUE", "FALSE", "WITH", "OVER", "PARTITION", "RETURNING", "BEGIN", "COMMIT", "START", "TRANSACTION",
    "ALTER", "ADD", "COLUMN", "CONFLICT", "DO", "DUPLICATE", "LIKE", "ILIKE", "AUTOINCREMENT", "AUTO_INCREMENT", "GENERATED",
    "ALWAYS", "IDENTITY", "INTEGER", "INT", "TEXT", "REAL", "VARCHAR", "DECIMAL", "NUMERIC", "BOOLEAN", "DATETIME",
    "TIMESTAMPTZ", "SERIAL", "ENGINE", "db", "true", "false", "const",
  ],
  rust: ["fn", "let", "mut", "return", "if", "else", "for", "in", "while", "match", "impl", "struct", "enum", "trait", "pub", "use", "self", "Self", "true", "false", "as", "async", "await", "move", "ref", "where", "i32", "u32", "u64", "f64", "usize", "bool", "str"],
};

const COMMENT: Record<LangId, string> = {
  python: "#", sql: "--", javascript: "//", typescript: "//", java: "//", csharp: "//", go: "//", rust: "//",
};

/** Clase de token para cada carácter del texto. */
export function highlight(text: string, lang: LangId | null): Tok[] {
  const out: Tok[] = new Array(text.length).fill("id");
  const kws = new Set(lang ? KW[lang] : []);
  const com = lang ? COMMENT[lang] : "//";
  let i = 0;
  const set = (from: number, to: number, t: Tok) => {
    for (let k = from; k < to; k++) out[k] = t;
  };
  while (i < text.length) {
    const ch = text[i];
    if (ch === " " || ch === "\n") {
      out[i] = "sp";
      i++;
      continue;
    }
    if (text.startsWith(com, i) && lang) {
      const end = text.indexOf("\n", i);
      const stop = end === -1 ? text.length : end;
      set(i, stop, "com");
      i = stop;
      continue;
    }
    if (ch === '"' || ch === "`" || (ch === "'" && lang !== "rust")) {
      let j = i + 1;
      while (j < text.length && text[j] !== ch && text[j] !== "\n") {
        if (text[j] === "\\") j++;
        j++;
      }
      set(i, Math.min(j + 1, text.length), "str");
      i = j + 1;
      continue;
    }
    if (/[0-9]/.test(ch)) {
      let j = i;
      while (j < text.length && /[0-9._]/.test(text[j])) j++;
      set(i, j, "num");
      i = j;
      continue;
    }
    if (ch === "@" || (ch === "#" && lang === "rust")) {
      let j = i + 1;
      while (j < text.length && /[\w[\](), ]/.test(text[j]) && text[j] !== "\n") {
        if (ch === "@" && !/\w/.test(text[j])) break;
        j++;
      }
      set(i, j, "dec");
      i = j;
      continue;
    }
    if (/[A-Za-z_$]/.test(ch)) {
      let j = i;
      while (j < text.length && /[\w$]/.test(text[j])) j++;
      const word = text.slice(i, j);
      let t: Tok = "id";
      if (kws.has(word)) t = "kw";
      else if (text[j] === "(" || (text[j] === "!" && lang === "rust" && text[j + 1] === "(")) t = "fn";
      else if (/^[A-Z]/.test(word)) t = "ty";
      set(i, j, t);
      i = j;
      continue;
    }
    out[i] = /[()[\]{},;.:]/.test(ch) ? "pun" : "op";
    i++;
  }
  return out;
}
