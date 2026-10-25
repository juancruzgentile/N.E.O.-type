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
};

/** Lenguajes de programación (ruta por símbolos). */
export const LANG_ORDER: CodeLangId[] = ["python", "javascript", "typescript", "java", "csharp", "go", "rust"];
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

export function allChars(lang: LangId): string[] {
  return isTrack(lang) ? TRACKS[lang].symbols : LANGS[lang].stages.flat();
}

/** En las rutas Trainee todos los símbolos están disponibles desde el principio. */
export function unlockedChars(lang: LangId, stage: number): string[] {
  return isTrack(lang) ? TRACKS[lang].symbols : LANGS[lang].stages.slice(0, stage + 1).flat();
}
