import type { CodeLangId, LangId } from "../types";
import { TRACKS, TRACK_ORDER, isTrack } from "../tracks/index";

export interface LangInfo {
  id: LangId;
  name: string;
  badge: string;
  color: string;
  /** "code": ruta por símbolos · "track": ruta Trainee por escalones */
  kind: "code" | "track";
  /** Orden en que se desbloquean los símbolos. Cada etapa añade uno o más caracteres (vacío en las rutas Trainee). */
  stages: string[][];
}

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

export const LANGS: Record<LangId, LangInfo> = {
  sql: { id: "sql", name: "Bases de datos", badge: "DB", color: "#ffb547", kind: "track", stages: [] },
  html: { id: "html", name: "HTML", badge: "<>", color: "#ff5c7a", kind: "track", stages: [] },
  css: { id: "css", name: "CSS", badge: "{}", color: "#2ee6d6", kind: "track", stages: [] },
  formats: { id: "formats", name: "Formatos", badge: "FM", color: "#c3c9d4", kind: "track", stages: [] },
  linux: { id: "linux", name: "Terminal Linux", badge: ">_", color: "#7dff6b", kind: "track", stages: [] },
  python: {
    id: "python", name: "Python", badge: "Py", color: "#4f9cff", kind: "code",
    stages: [["(", ")"], ["="], [":"], ["."], [","], ['"'], ["_"], ["[", "]"], DIGITS, ["-", ">"], ["+"], ["*"], ["<"], ["{", "}"], ["/"], ["%"], ["#"], ["'"], ["!"], ["@"], ["|"], ["&"], ["\\"], ["^"], ["~"], ["`"]],
  },
  javascript: {
    id: "javascript", name: "JavaScript", badge: "JS", color: "#f7df1e", kind: "code",
    stages: [["(", ")"], ["."], ["="], [";"], ["{", "}"], [","], ['"'], [">"], ["[", "]"], DIGITS, ["+"], ["!"], ["-"], ["<"], [":"], ["?"], ["`"], ["$"], ["*"], ["&"], ["|"], ["/"], ["%"], ["_"], ["'"], ["\\"], ["#"], ["@"], ["^"], ["~"]],
  },
  typescript: {
    id: "typescript", name: "TypeScript", badge: "TS", color: "#3b82f6", kind: "code",
    stages: [["(", ")"], [":"], ["."], ["="], [";"], ["{", "}"], [","], ['"'], ["[", "]"], [">"], ["<"], DIGITS, ["|"], ["!"], ["?"], ["+"], ["-"], ["`"], ["$"], ["*"], ["&"], ["/"], ["%"], ["_"], ["'"], ["\\"], ["#"], ["@"], ["^"], ["~"]],
  },
  java: {
    id: "java", name: "Java", badge: "Jv", color: "#f89820", kind: "code",
    stages: [["(", ")"], ["."], [";"], ["{", "}"], ["="], ['"'], [","], ["<", ">"], ["[", "]"], DIGITS, ["+"], ["-"], [":"], ["!"], ["&"], ["|"], ["?"], ["*"], ["/"], ["%"], ["_"], ["'"], ["@"], ["\\"], ["#"], ["^"], ["~"]],
  },
  csharp: {
    id: "csharp", name: "C#", badge: "C#", color: "#a179dc", kind: "code",
    stages: [["(", ")"], ["."], [";"], ["{", "}"], ["="], ['"'], [","], [">"], ["<"], ["[", "]"], DIGITS, ["?"], ["!"], ["+"], ["-"], ["&"], ["|"], ["$"], [":"], ["*"], ["/"], ["%"], ["_"], ["'"], ["@"], ["\\"], ["#"], ["^"], ["~"]],
  },
  go: {
    id: "go", name: "Go", badge: "Go", color: "#00add8", kind: "code",
    stages: [["(", ")"], ["{", "}"], ["."], ["="], [":"], [","], ['"'], ["[", "]"], DIGITS, ["*"], ["&"], ["!"], ["<"], [">"], ["+"], ["-"], ["%"], ["_"], ["|"], ["/"], ["`"], ["'"], [";"], ["\\"], ["^"], ["#"], ["~"]],
  },
  rust: {
    id: "rust", name: "Rust", badge: "Rs", color: "#f46623", kind: "code",
    stages: [["(", ")"], ["_"], [":"], ["{", "}"], ["."], ["&"], ["[", "]"], ["-", ">"], ["|"], [";"], [","], ["="], ["<"], ['"'], ["!"], DIGITS, ["?"], ["'"], ["#"], ["+"], ["*"], ["/"], ["%"], ["@"], ["$"], ["\\"], ["^"], ["`"], ["~"]],
  },
  c: {
    id: "c", name: "C", badge: "C", color: "#9fb3c8", kind: "code",
    stages: [["(", ")"], [";"], ["{", "}"], ["="], ["*"], [","], ["[", "]"], DIGITS, ["<"], [">"], ["+"], ["-"], ["."], ['"'], ["&"], ["!"], ["%"], ["/"], ["\\"], ["'"], ["_"], ["?"], [":"], ["|"], ["#"], ["^"], ["~"]],
  },
  cpp: {
    id: "cpp", name: "C++", badge: "C++", color: "#f34b7d", kind: "code",
    stages: [["(", ")"], [";"], ["{", "}"], [":"], ["<", ">"], ["&"], ["."], [","], ["="], ["_"], ['"'], ["[", "]"], DIGITS, ["+"], ["-"], ["!"], ["*"], ["|"], ["%"], ["/"], ["\\"], ["'"], ["?"], ["#"], ["^"], ["~"]],
  },
  swift: {
    id: "swift", name: "Swift", badge: "Sw", color: "#ff8a3d", kind: "code",
    stages: [["(", ")"], ["{", "}"], [":"], ["."], ["="], [","], ['"'], ["[", "]"], ["-", ">"], DIGITS, ["$"], ["?"], ["!"], ["<"], ["+"], ["*"], ["\\"], ["_"], ["/"], ["%"], ["&"], ["|"], ["@"], ["#"], ["'"], ["^"], ["~"], ["`"]],
  },
  kotlin: {
    id: "kotlin", name: "Kotlin", badge: "Kt", color: "#a97bff", kind: "code",
    stages: [["(", ")"], ["{", "}"], [":"], ["."], ["="], [","], ['"'], ["<", ">"], ["-"], ["?"], DIGITS, ["[", "]"], ["!"], ["+"], ["$"], ["*"], ["/"], ["%"], ["&"], ["|"], ["_"], ["'"], ["@"], ["\\"], ["#"], ["^"], ["~"], ["`"]],
  },
  php: {
    id: "php", name: "PHP", badge: "PHP", color: "#8892ff", kind: "code",
    stages: [["(", ")"], ["$"], [";"], ["{", "}"], [":"], ["="], ["-", ">"], [","], ["'"], ["[", "]"], DIGITS, ["!"], ["<"], ["+"], ["?"], ["."], ['"'], ["*"], ["/"], ["%"], ["&"], ["|"], ["_"], ["\\"], ["@"], ["#"], ["^"], ["~"], ["`"]],
  },
};

/** Lenguajes de programación (ruta por símbolos). */
export const LANG_ORDER: CodeLangId[] = ["python", "javascript", "typescript", "java", "csharp", "go", "rust", "c", "cpp", "swift", "kotlin", "php"];
export { TRACK_ORDER, isTrack };

/** Cantidad de niveles: etapas de símbolos o escalones de la ruta Trainee. */
export function stageCount(lang: LangId): number {
  return isTrack(lang) ? TRACKS[lang].steps.length : LANGS[lang].stages.length;
}

/** Para qué sirve cada símbolo en código (se muestra al desbloquearlo). */
export const SYMBOL_INFO: Record<string, string> = {
  "(": "Llamadas a funciones, parámetros y agrupación de expresiones",
  ")": "Cierra llamadas a funciones y agrupaciones",
  "[": "Listas, arrays e índices",
  "]": "Cierra listas, arrays e índices",
  "{": "Bloques de código, objetos, diccionarios e interpolación",
  "}": "Cierra bloques, objetos y diccionarios",
  "=": "Asignación y comparación (==, ===, !=)",
  ":": "Tipos, diccionarios, bloques en Python y el operador :=",
  ";": "Fin de sentencia",
  ".": "Acceso a métodos y propiedades",
  ",": "Separa argumentos, elementos y parámetros",
  '"': "Cadenas de texto",
  "'": "Caracteres, cadenas y lifetimes en Rust",
  "_": "Nombres en snake_case y variables descartadas",
  "-": "Resta, negativos y flechas ->",
  "+": "Suma, concatenación e incrementos",
  "*": "Multiplicación, punteros y desempaquetado",
  "/": "División y comentarios //",
  "%": "Módulo (resto de la división) y formato",
  "<": "Menor que y genéricos <T>",
  ">": "Mayor que, genéricos y flechas => ->",
  "!": "Negación, distinto de (!=) y macros de Rust",
  "?": "Opcionales, operador ternario y propagación de errores",
  "&": "Referencias, punteros y el operador lógico &&",
  "|": "Uniones de tipos, closures y el operador lógico ||",
  "#": "Comentarios en Python y atributos en Rust",
  "@": "Decoradores y anotaciones",
  "$": "Interpolación de cadenas (${} en JS y $\"\" en C#)",
  "`": "Template literals y cadenas crudas en Go",
  "\\": "Secuencias de escape (\\n, \\t)",
  "^": "XOR a nivel de bits",
  "~": "Complemento a nivel de bits",
  "0": "Números", "1": "Números", "2": "Números", "3": "Números", "4": "Números",
  "5": "Números", "6": "Números", "7": "Números", "8": "Números", "9": "Números",
};

/** Descripciones que cambian en algunos lenguajes (en C, # es el preprocesador y no un comentario). */
const SYMBOL_INFO_BY_LANG: Partial<Record<LangId, Record<string, string>>> = {
  c: {
    "#": "Directivas del preprocesador: #include y #define",
    "*": "Multiplicación, punteros y desreferencia",
    "&": "Dirección de una variable (&x) y el operador lógico &&",
    "-": "Resta, negativos y acceso por puntero ->",
    ">": "Mayor que y acceso por puntero ->",
    "<": "Menor que e #include <...>",
    "'": "Caracteres ('a', '\\0')",
    "!": "Negación y distinto de (!=)",
    ":": "Etiquetas de case y el operador ternario",
    "?": "Operador ternario",
    "|": "El operador lógico || y OR de bits",
    "{": "Bloques de código e inicializadores",
    "_": "Nombres en snake_case",
  },
  swift: {
    "$": "Parámetros abreviados de las closures ($0, $1)",
    "\\": "Interpolación \\( ) y key paths (\\.nombre)",
    "?": "Opcionales (Int?), ?. y ??",
    "!": "Negación y desenvolver un opcional a la fuerza",
    "-": "Resta, negativos y la flecha -> del tipo de retorno",
    ">": "Mayor que y la flecha ->",
    "<": "Menor que, genéricos <T> y rangos ..<",
    ".": "Acceso a miembros, rangos ... y casos de enum (.algo)",
    "@": "Atributos como @State y @MainActor",
    "#": "Directivas (#if) y macros como #expect",
    "_": "Omitir la etiqueta de un parámetro (_ nombre)",
    "`": "Usar una palabra reservada como nombre",
  },
  kotlin: {
    "$": "Plantillas de texto ($nombre y ${expresión})",
    "?": "Tipos que aceptan null (String?), ?. y el operador elvis ?:",
    "!": "Negación y !! para forzar que no sea null",
    ":": "Tipos, herencia y :: para referencias a funciones",
    "-": "Resta, negativos y la flecha -> de lambdas y when",
    ">": "Mayor que, genéricos y la flecha ->",
    ".": "Acceso a miembros y rangos (1..10)",
    "@": "Anotaciones y etiquetas (return@forEach)",
    "_": "Parámetros que no se usan y separador de miles (1_000)",
  },
  php: {
    "$": "Todas las variables empiezan con $",
    "-": "Resta, negativos y la flecha -> para entrar a un objeto",
    ">": "Mayor que, -> y => (arrays y funciones flecha)",
    "=": "Asignación, => en arrays y la comparación estricta ===",
    ".": "Concatenación de cadenas",
    ":": "Tipo de retorno, :: para lo estático y match",
    "?": "Tipos nullable (?string), ?? y ?->",
    "\\": "Separador de namespaces (App\\Modelos)",
    "@": "Silenciar errores de una llamada (con cuidado)",
    "#": "Atributos #[...] y comentarios",
    "'": "Cadenas que no interpolan variables",
    '"': "Cadenas que interpolan variables",
    "<": "Menor que, <?php y la nave espacial <=>",
  },
  cpp: {
    "#": "#include y directivas del preprocesador",
    ":": "El operador de ámbito :: (std::), herencia y case",
    "<": "Menor que, plantillas <T> y std::cout <<",
    ">": "Mayor que, plantillas y el operador >>",
    "&": "Referencias (int&), dirección y el operador lógico &&",
    "*": "Multiplicación, punteros y desreferencia",
    "'": "Caracteres ('a', '\\n')",
    "!": "Negación y distinto de (!=)",
    "?": "Operador ternario",
    "|": "El operador lógico || y las vistas de ranges con |",
    "{": "Bloques de código e inicialización con llaves",
    "_": "Nombres en snake_case",
  },
};

/** Para qué sirve un símbolo, en general o en ese lenguaje. */
export const symbolInfo = (ch: string, lang?: LangId) => SYMBOL_INFO_BY_LANG[lang!]?.[ch] ?? SYMBOL_INFO[ch] ?? "";

export function allChars(lang: LangId): string[] {
  return isTrack(lang) ? TRACKS[lang].symbols : LANGS[lang].stages.flat();
}

/** En las rutas Trainee todos los símbolos están disponibles desde el principio. */
export function unlockedChars(lang: LangId, stage: number): string[] {
  return isTrack(lang) ? TRACKS[lang].symbols : LANGS[lang].stages.slice(0, stage + 1).flat();
}
