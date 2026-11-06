import type { FuentesTema } from "./tipos";

const R = "https://en.cppreference.com/w/c/";
export const c: FuentesTema = {
  version: "C17 (C23 donde se indica)",
  entradas: {
    "main y printf": [R + "io/fprintf"],
    "Tipos básicos": [R + "language/arithmetic_types"],
    "if, for y while": [R + "language/for"],
    "Funciones y prototipos": [R + "language/function_declaration"],
    "Arrays": [R + "language/array"],
    "Cadenas": [R + "string/byte"],
    "fgets y sscanf": [R + "io/fgets"],
    "Punteros": [R + "language/pointer"],
    "struct y typedef": [R + "language/struct"],
    "malloc y free": [R + "memory/malloc"],
    "fopen, fgets y fclose": [R + "io/fopen"],
    "enum y switch": [R + "language/enum"],
    "gcc y make": ["https://www.gnu.org/software/make/manual/make.html"],
    "Punteros a función y qsort": [R + "algorithm/qsort"],
    "const y punteros": [R + "language/const"],
    "Cabeceras y guardas": [R + "preprocessor/include"],
    "Errores con errno": [R + "error/errno"],
    "valgrind y sanitizers": ["https://valgrind.org/docs/manual/quick-start.html"],
  },
};
