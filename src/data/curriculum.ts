import type { LangId } from "../types";

export interface LangInfo {
  id: LangId;
  name: string;
  badge: string;
  color: string;
  /** Orden en que se desbloquean los símbolos. Cada etapa añade uno o más caracteres. */
  stages: string[][];
}

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

export const LANGS: Record<LangId, LangInfo> = {
  python: {
    id: "python", name: "Python", badge: "Py", color: "#4f9cff",
    stages: [["(", ")"], ["="], [":"], ["."], [","], ['"'], ["_"], ["[", "]"], DIGITS, ["-", ">"], ["+"], ["*"], ["<"], ["{", "}"], ["/"], ["%"], ["#"], ["'"], ["!"], ["@"], ["|"], ["&"], ["\\"], ["^"], ["~"], ["`"]],
  },
  javascript: {
    id: "javascript", name: "JavaScript", badge: "JS", color: "#f7df1e",
    stages: [["(", ")"], ["."], ["="], [";"], ["{", "}"], [","], ['"'], [">"], ["[", "]"], DIGITS, ["+"], ["!"], ["-"], ["<"], [":"], ["?"], ["`"], ["$"], ["*"], ["&"], ["|"], ["/"], ["%"], ["_"], ["'"], ["\\"], ["#"], ["@"], ["^"], ["~"]],
  },
  typescript: {
    id: "typescript", name: "TypeScript", badge: "TS", color: "#3b82f6",
    stages: [["(", ")"], [":"], ["."], ["="], [";"], ["{", "}"], [","], ['"'], ["[", "]"], [">"], ["<"], DIGITS, ["|"], ["!"], ["?"], ["+"], ["-"], ["`"], ["$"], ["*"], ["&"], ["/"], ["%"], ["_"], ["'"], ["\\"], ["#"], ["@"], ["^"], ["~"]],
  },
  java: {
    id: "java", name: "Java", badge: "Jv", color: "#f89820",
    stages: [["(", ")"], ["."], [";"], ["{", "}"], ["="], ['"'], [","], ["<", ">"], ["[", "]"], DIGITS, ["+"], ["-"], [":"], ["!"], ["&"], ["|"], ["?"], ["*"], ["/"], ["%"], ["_"], ["'"], ["@"], ["\\"], ["#"], ["^"], ["~"]],
  },
  csharp: {
    id: "csharp", name: "C#", badge: "C#", color: "#a179dc",
    stages: [["(", ")"], ["."], [";"], ["{", "}"], ["="], ['"'], [","], [">"], ["<"], ["[", "]"], DIGITS, ["?"], ["!"], ["+"], ["-"], ["&"], ["|"], ["$"], [":"], ["*"], ["/"], ["%"], ["_"], ["'"], ["@"], ["\\"], ["#"], ["^"], ["~"]],
  },
  go: {
    id: "go", name: "Go", badge: "Go", color: "#00add8",
    stages: [["(", ")"], ["{", "}"], ["."], ["="], [":"], [","], ['"'], ["[", "]"], DIGITS, ["*"], ["&"], ["!"], ["<"], [">"], ["+"], ["-"], ["%"], ["_"], ["|"], ["/"], ["`"], ["'"], [";"], ["\\"], ["^"], ["#"], ["~"]],
  },
  rust: {
    id: "rust", name: "Rust", badge: "Rs", color: "#f46623",
    stages: [["(", ")"], ["_"], [":"], ["{", "}"], ["."], ["&"], ["[", "]"], ["-", ">"], ["|"], [";"], [","], ["="], ["<"], ['"'], ["!"], DIGITS, ["?"], ["'"], ["#"], ["+"], ["*"], ["/"], ["%"], ["@"], ["$"], ["\\"], ["^"], ["`"], ["~"]],
  },
};

export const LANG_ORDER: LangId[] = ["python", "javascript", "typescript", "java", "csharp", "go", "rust"];

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
  return LANGS[lang].stages.flat();
}

export function unlockedChars(lang: LangId, stage: number): string[] {
  return LANGS[lang].stages.slice(0, stage + 1).flat();
}
