import type { FuentesTema } from "./tipos";

const T = "https://www.typescriptlang.org/docs/handbook/";
export const typescript: FuentesTema = {
  version: "TypeScript 7 (compilador nativo)",
  entradas: {
    "Anotaciones de tipo": [T + "2/everyday-types.html"],
    "Funciones tipadas": [T + "2/functions.html"],
    "interface": [T + "2/everyday-types.html#interfaces"],
    "type y uniones": [T + "2/everyday-types.html#union-types"],
    "Arrays y tuplas": [T + "2/objects.html#tuple-types"],
    "tsc y tsconfig.json": [T + "tsconfig-json.html"],
    "Narrowing": [T + "2/narrowing.html"],
    "Uniones discriminadas": [T + "2/narrowing.html#discriminated-unions"],
    "Genéricos <T>": [T + "2/generics.html"],
    "Partial, Pick, Omit, Record": [T + "utility-types.html"],
    "Clases con modificadores": [T + "2/classes.html"],
    "unknown vs any": [T + "2/functions.html#unknown", "TypeScript 3.0"],
    "import type": [T + "release-notes/typescript-3-8.html#type-only-imports-and-export", "TypeScript 3.8"],
    "keyof y typeof": [T + "2/keyof-types.html"],
    "Tipos mapeados": [T + "2/mapped-types.html"],
    "Tipos condicionales e infer": [T + "2/conditional-types.html"],
    "satisfies": [T + "release-notes/typescript-4-9.html#the-satisfies-operator", "TypeScript 4.9"],
    "never y chequeo exhaustivo": [T + "2/narrowing.html#exhaustiveness-checking"],
    "Template literal types": [T + "2/template-literal-types.html", "TypeScript 4.1"],
  },
};
