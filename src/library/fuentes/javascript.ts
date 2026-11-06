import type { FuentesTema } from "./tipos";

const M = "https://developer.mozilla.org/en-US/docs/Web/JavaScript/";
const W = "https://developer.mozilla.org/en-US/docs/Web/API/";
export const javascript: FuentesTema = {
  version: "JavaScript (ECMAScript 2025)",
  entradas: {
    "let y const": [M + "Reference/Statements/let", "ES2015"],
    "Tipos primitivos": [M + "Guide/Data_structures"],
    "console.log()": [W + "console/log_static"],
    "if / else y ternario": [M + "Reference/Statements/if...else"],
    "for…of y for clásico": [M + "Reference/Statements/for...of", "ES2015"],
    "function y funciones flecha": [M + "Reference/Functions/Arrow_functions", "ES2015"],
    "Arrays": [M + "Reference/Global_Objects/Array"],
    "Objetos": [M + "Guide/Working_with_objects"],
    "Template literals": [M + "Reference/Template_literals", "ES2015"],
    "=== y ==": [M + "Guide/Equality_comparisons_and_sameness"],
    "map, filter, reduce": [M + "Reference/Global_Objects/Array/map"],
    "find, some, every, sort": [M + "Reference/Global_Objects/Array/find"],
    "Desestructuración": [M + "Reference/Operators/Destructuring", "ES2015"],
    "Spread y rest (...)": [M + "Reference/Operators/Spread_syntax", "ES2015"],
    "?. y ??": [M + "Reference/Operators/Optional_chaining", "ES2020"],
    "import / export": [M + "Guide/Modules", "ES2015"],
    "Promesas y async/await": [M + "Guide/Using_promises", "ES2017"],
    "fetch()": [W + "Fetch_API/Using_Fetch"],
    "DOM: querySelector y eventos": [W + "Document/querySelector"],
    "class": [M + "Reference/Classes", "ES2015"],
    "Promise.all y allSettled": [M + "Reference/Global_Objects/Promise/allSettled", "ES2020"],
    "Closures": [M + "Guide/Closures"],
    "debounce": [W + "Window/setTimeout"],
    "Map y Set": [M + "Reference/Global_Objects/Map", "ES2015"],
    "Generadores e iteradores": [M + "Reference/Statements/function*", "ES2015"],
    "Node: archivos y procesos": ["https://nodejs.org/api/fs.html"],
    "node --test": ["https://nodejs.org/api/test.html", "Node 18"],
  },
};
