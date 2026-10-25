import type { LangId } from "../types";
import {
  type Ctx, type Rng, adj, algun, art, bare, cuantos, makeCtx, negativo, pick, todos, un, verbP,
} from "./base";

export interface EnumSet {
  name: string[];
  values: string[][];
  title: string;
}

export const ENUM_SETS: EnumSet[] = [
  { name: ["order", "status"], values: [["pending"], ["paid"], ["shipped"], ["delivered"], ["cancelled"]], title: "Define los estados posibles de un pedido" },
  { name: ["log", "level"], values: [["debug"], ["info"], ["warning"], ["error"]], title: "Define los niveles de log de la aplicación" },
  { name: ["direction"], values: [["north"], ["south"], ["east"], ["west"]], title: "Define las cuatro direcciones cardinales" },
  { name: ["traffic", "light"], values: [["red"], ["yellow"], ["green"]], title: "Define los colores de un semáforo" },
  { name: ["payment", "method"], values: [["cash"], ["card"], ["bank", "transfer"]], title: "Define los métodos de pago aceptados" },
  { name: ["user", "role"], values: [["admin"], ["editor"], ["viewer"]], title: "Define los roles de usuario de la aplicación" },
  { name: ["room", "type"], values: [["single"], ["double"], ["suite"]], title: "Define los tipos de habitación de un hotel" },
  { name: ["http", "method"], values: [["get"], ["post"], ["put"], ["delete"]], title: "Define los métodos HTTP soportados" },
];

export interface ShapeDef {
  name: string;
  es: string;
  /** campos */
  params: string[];
  /** fórmula con los campos como {0}, {1}; PI se escribe como "PI" */
  kind: "circle" | "rect" | "square" | "triangle";
}

export const SHAPES: ShapeDef[] = [
  { name: "circle", es: "un círculo", params: ["radius"], kind: "circle" },
  { name: "rectangle", es: "un rectángulo", params: ["width", "height"], kind: "rect" },
  { name: "square", es: "un cuadrado", params: ["side"], kind: "square" },
  { name: "triangle", es: "un triángulo", params: ["base", "height"], kind: "triangle" },
];

export interface FullCtx extends Ctx {
  enumSet: EnumSet;
  shape: ShapeDef;
}

export function makeFullCtx(rng: Rng): FullCtx {
  return { ...makeCtx(rng), enumSet: pick(rng, ENUM_SETS), shape: pick(rng, SHAPES) };
}

export type ConceptId =
  | "sum" | "avg" | "maxBy" | "minBy" | "filter" | "count" | "find" | "map" | "sort" | "any"
  | "classDef" | "validate" | "toggle" | "describe" | "index" | "topN" | "sumIf" | "page"
  | "fetch" | "partition" | "increase"
  | "fibonacci" | "factorial" | "isPrime" | "gcd" | "reverse" | "palindrome" | "vowels" | "fizzbuzz"
  | "binarySearch" | "clamp" | "celsius" | "discount" | "maxValue" | "wordCount" | "readFile"
  | "enum" | "shape" | "sumEven" | "average" | "capitalize";

export interface Concept {
  id: ConceptId;
  cat: string;
  title: (c: FullCtx, lang: LangId) => string;
}

const T = (id: ConceptId, cat: string, title: Concept["title"]): Concept => ({ id, cat, title });

const typeWord = (lang: LangId) =>
  lang === "go" || lang === "rust" ? "el struct" : lang === "typescript" ? "la interfaz" : lang === "python" ? "la dataclass" : "el tipo";

export const CONCEPTS: Concept[] = [
  T("sum", "Colecciones", (c) => `Suma ${c.num.es} de ${todos(c.ent.g)} ${art(c.ent.g, true)} ${c.ent.esP}`),
  T("avg", "Colecciones", (c) => `Calcula ${c.num.es} promedio de ${art(c.ent.g, true)} ${c.ent.esP}`),
  T("maxBy", "Colecciones", (c) => `Devuelve ${art(c.ent.g)} ${c.ent.es} con mayor ${bare(c.num)}`),
  T("minBy", "Colecciones", (c) => `Devuelve ${art(c.ent.g)} ${c.ent.es} con menor ${bare(c.num)}`),
  T("filter", "Colecciones", (c) => `Filtra ${art(c.ent.g, true)} ${c.ent.esP} ${adj(c.flag, c.ent.g, true)}`),
  T("count", "Colecciones", (c) => `Cuenta ${cuantos(c.ent.g)} ${c.ent.esP} ${verbP(c.flag)} ${adj(c.flag, c.ent.g, true)}`),
  T("find", "Búsqueda", (c) => `Busca ${un(c.ent.g)} ${c.ent.es} por ${bare(c.str)}`),
  T("map", "Colecciones", (c) => `Extrae ${c.str.es} de cada ${c.ent.es}`),
  T("sort", "Ordenación", (c) => `Ordena ${art(c.ent.g, true)} ${c.ent.esP} por ${bare(c.num)} de mayor a menor`),
  T("any", "Colecciones", (c) => `Comprueba si ${algun(c.ent.g)} ${c.ent.es} supera un límite de ${bare(c.num)}`),
  T("classDef", "Tipos", (c, l) => `Define ${typeWord(l)} ${c.ent.s.w.map((w) => w[0].toUpperCase() + w.slice(1)).join("")} con sus campos`),
  T("validate", "Validación", (c) => `Valida que ${c.num.es} de ${un(c.ent.g)} ${c.ent.es} no ${/^(los|las) /.test(c.num.es) ? "sean" : "sea"} ${negativo(c.num)}`),
  T("toggle", "Métodos", (c) => `Alterna si ${un(c.ent.g)} ${c.ent.es} ${c.flag.verb} ${adj(c.flag, c.ent.g, false)}`),
  T("describe", "Cadenas", (c) => `Genera una descripción en texto de ${un(c.ent.g)} ${c.ent.es}`),
  T("index", "Diccionarios", (c) => `Indexa ${art(c.ent.g, true)} ${c.ent.esP} por ${bare(c.str)}`),
  T("topN", "Ordenación", (c) => `Devuelve ${art(c.ent.g, true)} N ${c.ent.esP} con mayor ${bare(c.num)}`),
  T("sumIf", "Colecciones", (c) => `Suma ${c.num.es} solo de ${art(c.ent.g, true)} ${c.ent.esP} ${adj(c.flag, c.ent.g, true)}`),
  T("page", "Colecciones", (c) => `Devuelve una página de ${c.ent.esP}`),
  T("fetch", "Asincronía", (c) => `Descarga ${art(c.ent.g, true)} ${c.ent.esP} desde una API`),
  T("partition", "Colecciones", (c) => `Separa ${art(c.ent.g, true)} ${c.ent.esP} ${adj(c.flag, c.ent.g, true)} del resto`),
  T("increase", "Métodos", (c) => `Incrementa ${c.num.es} de ${un(c.ent.g)} ${c.ent.es} en una cantidad`),
  T("fibonacci", "Algoritmos", () => "Devuelve los primeros n números de Fibonacci"),
  T("factorial", "Algoritmos", () => "Calcula el factorial de un número"),
  T("isPrime", "Algoritmos", () => "Indica si un número es primo"),
  T("gcd", "Algoritmos", () => "Calcula el máximo común divisor de dos números"),
  T("reverse", "Cadenas", () => "Invierte una cadena de texto"),
  T("palindrome", "Cadenas", () => "Comprueba si una palabra es un palíndromo"),
  T("vowels", "Cadenas", () => "Cuenta las vocales de un texto"),
  T("fizzbuzz", "Control de flujo", () => "Imprime FizzBuzz del 1 al n"),
  T("binarySearch", "Algoritmos", () => "Busca un valor en una lista ordenada con búsqueda binaria"),
  T("clamp", "Matemáticas", () => "Limita un valor entre un mínimo y un máximo"),
  T("celsius", "Matemáticas", () => "Convierte grados Celsius a Fahrenheit"),
  T("discount", "Matemáticas", () => "Aplica un porcentaje de descuento a un precio"),
  T("maxValue", "Algoritmos", () => "Encuentra el valor máximo de una lista recorriéndola"),
  T("wordCount", "Diccionarios", () => "Cuenta cuántas veces aparece cada palabra en un texto"),
  T("readFile", "Errores", () => "Lee un archivo de texto y maneja el error si falla"),
  T("enum", "Enumeraciones", (c) => c.enumSet.title),
  T("shape", "Interfaces", (c) => `Implementa ${c.shape.es} que calcula su área`),
  T("sumEven", "Colecciones", () => "Suma los números pares de una lista"),
  T("average", "Matemáticas", () => "Calcula el promedio de una lista de números"),
  T("capitalize", "Cadenas", () => "Pone en mayúscula la primera letra de cada palabra"),
];

/** Implementación de un concepto en un lenguaje: devuelve una o varias variantes. */
export type Impl = (c: FullCtx) => string | string[];
export type LangImpls = Partial<Record<ConceptId, Impl>>;
