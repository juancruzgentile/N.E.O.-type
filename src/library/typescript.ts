import { type Topic, a, b, code, m } from "./types";
import { claseTypescript } from "./clases/typescript";

export const typescript: Topic = {
  id: "typescript",
  name: "TypeScript",
  group: "Lenguajes",
  emblem: "typescript",
  badge: "TS",
  color: "#3b82f6",
  hl: "typescript",
  summary:
    "JavaScript con tipos estáticos. El compilador revisa el código antes de ejecutarlo y después genera JavaScript normal. " +
    "Es el estándar en front-end moderno (React, Angular, Vue) y muy común en back-end con Node.",
  facts: [
    { label: "Archivos", value: ".ts · .tsx" },
    { label: "Compilar", value: "npx tsc" },
    { label: "Ejecutar", value: "tsx app.ts · tsc y node · node app.ts (con límites)" },
    { label: "Versión de referencia", value: "TypeScript 7 (compilador nativo)" },
    { label: "Configuración", value: "tsconfig.json" },
  ],
  workflow: [
    { title: "strict desde el día uno", text: "Activá \"strict\": true en tsconfig.json. Agregarlo después en un proyecto grande cuesta mucho más." },
    { title: "Tipar los bordes", text: "Tipá parámetros y retornos de funciones públicas y los datos que entran (API, formularios). Dentro de la función, la inferencia suele alcanzar." },
    { title: "unknown en vez de any", text: "any apaga el compilador. unknown obliga a verificar el tipo antes de usar el valor." },
    { title: "Chequeo en CI", text: "tsc --noEmit revisa tipos sin generar archivos: ideal para correr en cada pull request." },
    { title: "Node ejecuta .ts, con límites", text: "Desde Node 22.18 podés correr node app.ts: Node solo borra los tipos, no revisa nada ni transforma código. enum, namespace y las propiedades en el constructor fallan con ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX. Para esos casos compilá con tsc o usá tsx." },
    { title: "Validar en tiempo de ejecución", text: "Los tipos desaparecen al ejecutar. Para datos externos usá validación real (por ejemplo con Zod) además del tipo." },
  ],
  entries: [
    b("Tipos", "Anotaciones de tipo", "Se escriben después de dos puntos. Si el valor inicial alcanza, TypeScript infiere el tipo solo.", code`
let nombre: string = "Ana";
let edad = 30;              // inferido: number
const activo: boolean = true;
let ids: number[] = [1, 2, 3];`, "tipar variable inferencia"),
    b("Tipos", "Funciones tipadas", "Tipos en parámetros y en el valor de retorno. ? marca un parámetro opcional.", code`
function precioFinal(precio: number, descuento?: number): number {
  return precio * (1 - (descuento ?? 0));
}
const doble = (n: number): number => n * 2;`, "parametros retorno opcional"),
    b("Tipos", "interface", "Describe la forma de un objeto. readonly impide reasignar y ? marca propiedades opcionales.", code`
interface Usuario {
  readonly id: number;
  nombre: string;
  email?: string;
}
const u: Usuario = { id: 1, nombre: "Ana" };`, "interfaz objeto forma"),
    b("Tipos", "type y uniones", "type crea un alias. Las uniones (|) permiten varios tipos o valores concretos.", code`
type Estado = "pendiente" | "en_curso" | "hecha";
type Id = number | string;
let estado: Estado = "pendiente";`, "alias union literal"),
    b("Tipos", "Arrays y tuplas", "T[] para listas; las tuplas fijan cantidad y tipo de cada posición.", code`
const nombres: string[] = ["Ana", "Luis"];
const punto: [number, number] = [10, 20];
const par: [string, number] = ["edad", 30];`, "lista tupla array"),
    b("Herramientas", "tsc y tsconfig.json", "tsc compila y revisa tipos según tsconfig.json.", code`
npx tsc --init          # crea tsconfig.json
npx tsc                 # compila el proyecto
npx tsc --noEmit        # solo revisa tipos`, "compilar compilador configuracion"),

    m("Tipos", "Narrowing", "TypeScript estrecha el tipo dentro de un if según lo que se comprobó (typeof, in, instanceof, igualdad).", code`
function formatear(v: string | number) {
  if (typeof v === "number") {
    return v.toFixed(2);   // acá v es number
  }
  return v.toUpperCase();  // acá v es string
}`, "estrechar typeof guardia"),
    m("Tipos", "Uniones discriminadas", "Una propiedad común (kind, tipo) dice qué variante es. Con switch el compilador revisa que cubras todos los casos.", code`
type Forma =
  | { kind: "circulo"; r: number }
  | { kind: "rect"; w: number; h: number };

function area(f: Forma): number {
  switch (f.kind) {
    case "circulo": return Math.PI * f.r ** 2;
    case "rect": return f.w * f.h;
  }
}`, "discriminated union tagged"),
    m("Genéricos", "Genéricos <T>", "Funciones y tipos que trabajan con cualquier tipo sin perder la información de cuál es.", code`
function primero<T>(lista: T[]): T | undefined {
  return lista[0];
}
const n = primero([1, 2, 3]);       // number | undefined
interface Respuesta<T> { datos: T; ok: boolean }`, "generics plantilla"),
    m("Utilidades", "Partial, Pick, Omit, Record", "Tipos utilitarios que derivan tipos nuevos de otros existentes.", code`
type Borrador = Partial<Usuario>;          // todo opcional
type Publico = Pick<Usuario, "id" | "nombre">;
type Nuevo = Omit<Usuario, "id">;
type PorId = Record<number, Usuario>;`, "utility types"),
    m("Clases", "Clases con modificadores", "public, private, protected y readonly. Los parámetros del constructor pueden declarar propiedades directamente; ese atajo necesita compilar con tsc o tsx, porque node app.ts no lo acepta.", code`
class Cuenta {
  private saldo = 0;
  constructor(public readonly titular: string) {}  // crea this.titular
  depositar(monto: number): void {
    this.saldo += monto;
  }
}`, "clase private public readonly"),
    m("Tipos", "unknown vs any", "any desactiva el chequeo; unknown obliga a verificar antes de usar. Ideal para datos externos.", code`
function leer(json: string): unknown {
  return JSON.parse(json);
}
const v = leer(texto);
if (typeof v === "object" && v !== null && "nombre" in v) {
  console.log(v.nombre);
}`, "any unknown seguro"),
    m("Módulos", "import type", "Importa solo tipos: no genera código en el JavaScript final.", code`
import type { Usuario } from "./tipos";
import { crearUsuario, type Rol } from "./usuarios";`, "importar tipos"),

    a("Tipos", "keyof y typeof", "keyof da la unión de claves de un tipo; typeof (en posición de tipo) toma el tipo de un valor.", code`
const conf = { tema: "oscuro", idioma: "es" };
type Conf = typeof conf;
type Clave = keyof Conf;            // "tema" | "idioma"
function get<K extends Clave>(k: K): Conf[K] {
  return conf[k];
}`, "claves indexado"),
    a("Tipos", "Tipos mapeados", "Recorren las claves de un tipo para construir otro.", code`
type SoloLectura<T> = { readonly [K in keyof T]: T[K] };
type Banderas<T> = { [K in keyof T]: boolean };
type Errores = Banderas<{ email: string; clave: string }>;`, "mapped types"),
    a("Tipos", "Tipos condicionales e infer", "Eligen un tipo según una condición; infer extrae una parte de otro tipo.", code`
type EsArray<T> = T extends unknown[] ? true : false;
type Elemento<T> = T extends (infer E)[] ? E : never;
type R = Awaited<ReturnType<typeof cargarUsuarios>>;`, "conditional types infer"),
    a("Tipos", "satisfies", "Verifica que un valor cumpla un tipo sin perder su tipo más preciso.", code`
const rutas = {
  inicio: "/",
  perfil: "/perfil",
} satisfies Record<string, \`/\${string}\`>;
rutas.perfil; // sigue siendo "/perfil"`, "satisface verificar"),
    a("Tipos", "never y chequeo exhaustivo", "never es el tipo imposible. Asignar a never en el default avisa si falta un caso.", code`
function nombre(e: Estado): string {
  switch (e) {
    case "pendiente": return "Pendiente";
    case "en_curso": return "En curso";
    case "hecha": return "Hecha";
    default: {
      const nunca: never = e;
      return nunca;
    }
  }
}`, "exhaustivo nunca"),
    a("Tipos", "Template literal types", "Tipos de texto armados con plantillas.", code`
type Evento = "click" | "focus";
type Handler = \`on\${Capitalize<Evento>}\`;   // "onClick" | "onFocus"`, "plantilla string literal"),
  ],
  clase: claseTypescript,
};
