import type { Entry } from "./types";

/**
 * Un ejemplo es un programa completo si se puede copiar a un archivo y correr tal cual. Los demás son fragmentos:
 * muestran lo importante y les falta el resto (imports, declaraciones, el main).
 * La app y el CI usan esta misma función, así que lo que dice la tarjeta es lo que el CI compila.
 */
const FULL: Record<string, RegExp> = {
  c: /\bint main\s*\(/,
  cpp: /\bint main\s*\(/,
  go: /^func main\(\)/m,
  rust: /\bfn main\s*\(/,
  java: /\bpublic static void main\s*\(/,
  csharp: /\bstatic (async )?(void|Task|int)\w* Main\s*\(/,
  php: /^<\?php/,
};

export const isFullProgram = (topicId: string, e: Entry): boolean => !!FULL[topicId]?.test(e.code);

/** Qué les falta a los fragmentos de cada tema, en una línea. */
const MISSING: Record<string, string> = {
  python: "Va dentro de tu programa: puede usar variables o imports que acá no se muestran.",
  javascript: "Va dentro de tu programa: puede usar variables o imports que acá no se muestran.",
  typescript: "Va dentro de tu programa: puede usar variables, tipos o imports que acá no se muestran.",
  react: "Va dentro de un componente: faltan los imports y el resto del componente.",
  java: "Va dentro de un método o una clase: falta el main.",
  csharp: "Va dentro de un método o de un archivo de tu proyecto.",
  go: "Va dentro de una función: faltan package, imports y main.",
  rust: "Va dentro de fn main: faltan las declaraciones que usa.",
  c: "Va dentro de main: faltan los #include y las variables que usa.",
  cpp: "Va dentro de main: faltan los #include y las variables que usa.",
  swift: "Va dentro de tu código: puede usar variables o imports que acá no se muestran.",
  kotlin: "Va dentro de una función: puede usar variables o imports que acá no se muestran.",
  php: "Va dentro de un archivo PHP, después de <?php.",
  sql: "Se corre sobre tus tablas: usa nombres de tablas y columnas de ejemplo.",
};

/** Ejemplos que son comandos de terminal dentro de un tema de lenguaje (pip, npx tsc, go mod, cargo…). */
export const SHELL_COMMAND = /^(python3? -m|pip|uv|npm|npx|node|deno|bun|go (mod|get|build|run|test|vet|install|work)|gofmt|cargo|rustc|rustup|javac|java -|mvn|gradle|\.\/gradlew|dotnet|tsc|jq|gcc|g\+\+|clang|cmake|ctest|valgrind|make|swift (package|build|test|run)|\.\/gradlew|composer|fastapi (dev|run)|django-admin|python3? manage\.py|\.\/mvnw)(?=\s|$)/;

/** null si el ejemplo no es de código que se corre (comandos de terminal, formatos, HTML…). */
export const kindNote = (topicId: string, e: Entry): { full: boolean; note: string } | null => {
  if (SHELL_COMMAND.test(e.code.trimStart())) return null;
  if (isFullProgram(topicId, e)) return { full: true, note: "Programa completo: lo copiás a un archivo y lo corrés tal cual." };
  if (e.needs) return { full: false, note: e.needs };
  const m = MISSING[topicId];
  return m ? { full: false, note: m } : null;
};
