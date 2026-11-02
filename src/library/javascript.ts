import { type Topic, a, b, code, m } from "./types";

export const javascript: Topic = {
  id: "javascript",
  name: "JavaScript",
  group: "Lenguajes",
  emblem: "javascript",
  badge: "JS",
  color: "#f7df1e",
  hl: "javascript",
  summary:
    "El lenguaje de la web: corre en todos los navegadores y, con Node.js, también en servidores y herramientas de línea de comandos. " +
    "Es dinámico, orientado a eventos y con funciones de primera clase.",
  facts: [
    { label: "Archivos", value: ".js · .mjs" },
    { label: "Ejecutar", value: "node app.js · en el navegador" },
    { label: "Paquetes", value: "npm · pnpm" },
    { label: "Runtime de referencia", value: "Node.js 24 LTS" },
    { label: "Estilo", value: "2 espacios · camelCase" },
  ],
  workflow: [
    { title: "package.json como centro", text: "npm init crea package.json: ahí van las dependencias y los scripts (npm run dev, npm test). Instalá con npm ci en CI para respetar el lockfile." },
    { title: "const por defecto", text: "Usá const siempre que no reasignes, let cuando sí, y nunca var. Compará con === (sin conversión de tipos)." },
    { title: "Módulos ES", text: "Escribí import/export (ES modules). En Node, \"type\": \"module\" en package.json o archivos .mjs." },
    { title: "Formato y lint", text: "Prettier (o Biome) formatea; ESLint detecta errores y malas prácticas. Integralos al editor y a un hook de commit." },
    { title: "Tests", text: "node --test ya trae un runner; Vitest o Jest son las opciones más comunes en proyectos grandes." },
    { title: "Pasar a TypeScript", text: "En proyectos medianos o grandes, TypeScript evita una gran cantidad de errores de tipos sin cambiar cómo se ejecuta el código." },
  ],
  entries: [
    b("Datos", "let y const", "Declaran variables con alcance de bloque. const no se puede reasignar (aunque un objeto const sí se puede modificar por dentro).", code`
const nombre = "Ana";
let contador = 0;
contador++;
const lista = [1, 2];
lista.push(3); // válido: no se reasigna`, "variable var declarar"),
    b("Datos", "Tipos primitivos", "string, number, boolean, null, undefined, bigint y symbol. typeof dice el tipo.", code`
typeof "hola"     // "string"
typeof 42         // "number"
typeof undefined  // "undefined"
typeof null       // "object" (rareza histórica)`, "typeof tipo"),
    b("Entrada y salida", "console.log()", "Muestra valores en la consola del navegador o de Node. console.table y console.error también ayudan al depurar.", code`
console.log("Total:", total);
console.table([{ id: 1, nombre: "Ana" }]);
console.error("Algo falló");`, "imprimir depurar debug"),
    b("Control de flujo", "if / else y ternario", "Condicionales. El ternario cond ? a : b es una expresión: devuelve un valor.", code`
if (edad >= 18) {
  acceso = "total";
} else {
  acceso = "limitado";
}
const etiqueta = stock > 0 ? "Disponible" : "Agotado";`, "condicional"),
    b("Control de flujo", "for…of y for clásico", "for…of recorre los valores de un iterable; el for clásico sirve cuando necesitás el índice.", code`
for (const fruta of frutas) {
  console.log(fruta);
}
for (let i = 0; i < 3; i++) {
  console.log(i);
}`, "bucle loop iterar"),
    b("Funciones", "function y funciones flecha", "Dos formas de declarar funciones. Las flecha son más cortas y no tienen su propio this.", code`
function sumar(a, b) {
  return a + b;
}
const doble = (n) => n * 2;
const saludar = (nombre = "mundo") => "Hola, " + nombre;`, "arrow function flecha"),
    b("Colecciones", "Arrays", "Listas ordenadas. push/pop agregan y sacan al final; length da el tamaño; includes busca un valor.", code`
const nums = [3, 1, 2];
nums.push(4);
nums.includes(2);  // true
nums.length;       // 4
nums.at(-1);       // 4`, "array lista arreglo"),
    b("Colecciones", "Objetos", "Pares clave-valor. Se accede con punto o con corchetes si la clave es dinámica.", code`
const user = { nombre: "Ana", edad: 30 };
user.email = "ana@mail.com";
const campo = "edad";
user[campo];          // 30
Object.keys(user);    // ["nombre", "edad", "email"]`, "objeto diccionario json"),
    b("Texto", "Template literals", "Cadenas entre backticks: interpolan expresiones con \${} y pueden ocupar varias líneas.", code`
const msg = \`Hola, \${nombre}. Tenés \${mensajes.length} mensajes.\`;
const html = \`
  <li>\${item}</li>
\`;`, "plantilla interpolacion backtick cadena"),
    b("Comparación", "=== y ==", "=== compara valor y tipo; == convierte tipos antes de comparar y da sorpresas. Usá siempre ===.", code`
0 == "0"     // true  (convierte)
0 === "0"    // false
null ?? "por defecto"   // "por defecto"`, "igualdad estricta"),

    m("Colecciones", "map, filter, reduce", "Transforman arrays sin modificarlos: map convierte cada elemento, filter se queda con algunos y reduce los acumula en un valor.", code`
const precios = productos.map((p) => p.precio);
const caros = productos.filter((p) => p.precio > 100);
const total = precios.reduce((acc, n) => acc + n, 0);`, "array metodos funcional"),
    m("Colecciones", "find, some, every, sort", "find devuelve el primer elemento que cumple; some/every responden sí o no; sort ordena en el lugar (con comparador).", code`
const ana = users.find((u) => u.nombre === "Ana");
const hayAdmins = users.some((u) => u.admin);
users.sort((a, b) => a.edad - b.edad);
const copia = users.toSorted((a, b) => a.edad - b.edad);`, "buscar ordenar"),
    m("Sintaxis", "Desestructuración", "Saca valores de objetos y arrays en variables, con renombre y valores por defecto.", code`
const { nombre, edad = 0 } = user;
const [primero, ...resto] = nums;
function crear({ titulo, prioridad = "media" }) { /* ... */ }`, "destructuring"),
    m("Sintaxis", "Spread y rest (...)", "... expande un array u objeto (copias, mezclas) o junta argumentos sobrantes.", code`
const copia = [...lista, 4];
const conf = { ...porDefecto, ...delUsuario };
const max = Math.max(...nums);
function log(...partes) { console.log(partes.join(" ")); }`, "spread rest copiar"),
    m("Sintaxis", "?. y ??", "Encadenamiento opcional: corta si algo es null o undefined. ?? da un valor por defecto solo para null/undefined (no para 0 o \"\").", code`
const ciudad = user?.direccion?.ciudad;
const limite = conf.limite ?? 10;
user.onSave?.();`, "optional chaining nullish"),
    m("Módulos", "import / export", "Comparten código entre archivos. export default para lo principal; exports con nombre para lo demás.", code`
// matematica.js
export const PI = 3.14159;
export default function area(r) { return PI * r * r; }

// app.js
import area, { PI } from "./matematica.js";`, "modulo es modules"),
    m("Asincronía", "Promesas y async/await", "async/await hace que el código asíncrono se lea como secuencial. try/catch atrapa los rechazos.", code`
async function cargar() {
  try {
    const res = await fetch("/api/tareas");
    if (!res.ok) throw new Error("HTTP " + res.status);
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}`, "promise asincrono await fetch"),
    m("Navegador", "fetch()", "Hace pedidos HTTP. Devuelve una promesa con la respuesta; .json() la convierte.", code`
const res = await fetch("/api/tareas", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ titulo: "Nueva" }),
});`, "http api ajax request"),
    m("Navegador", "DOM: querySelector y eventos", "Busca elementos de la página y reacciona a eventos. Usá textContent (no innerHTML) para insertar texto del usuario.", code`
const boton = document.querySelector("#guardar");
boton.addEventListener("click", () => {
  const li = document.createElement("li");
  li.textContent = input.value;
  lista.append(li);
});`, "dom evento click elemento"),
    m("Clases", "class", "Azúcar sobre prototipos: constructor, métodos, herencia con extends y campos privados con #.", code`
class Cuenta {
  #saldo = 0;
  constructor(titular) {
    this.titular = titular;
  }
  depositar(monto) {
    this.#saldo += monto;
  }
  get saldo() {
    return this.#saldo;
  }
}`, "clase objeto poo privado"),

    a("Asincronía", "Promise.all y allSettled", "Corre varias promesas en paralelo. all falla si una falla; allSettled espera todas y te dice cuál salió bien.", code`
const [user, tareas] = await Promise.all([
  fetch("/api/user").then((r) => r.json()),
  fetch("/api/tareas").then((r) => r.json()),
]);
const res = await Promise.allSettled(pedidos);`, "paralelo concurrencia"),
    a("Funciones", "Closures", "Una función recuerda las variables del lugar donde se creó, aunque ese lugar ya haya terminado. Base de contadores, memoización y módulos.", code`
function contador() {
  let n = 0;
  return () => ++n;
}
const siguiente = contador();
siguiente(); // 1
siguiente(); // 2`, "clausura alcance scope"),
    a("Rendimiento", "debounce", "Espera a que dejen de llamar a una función por un tiempo antes de ejecutarla. Útil en búsquedas mientras se escribe.", code`
function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}
input.addEventListener("input", debounce(buscar, 300));`, "throttle demora"),
    a("Colecciones", "Map y Set", "Map: claves de cualquier tipo y orden de inserción. Set: valores únicos.", code`
const visitas = new Map();
visitas.set(user, (visitas.get(user) ?? 0) + 1);
const unicos = [...new Set(tags)];`, "mapa conjunto unicos"),
    a("Iteración", "Generadores e iteradores", "function* produce valores bajo demanda con yield. Cualquier objeto con [Symbol.iterator] se puede recorrer con for…of.", code`
function* ids() {
  let id = 1;
  while (true) yield id++;
}
const gen = ids();
gen.next().value; // 1`, "yield generator iterable"),
    a("Node.js", "Node: archivos y procesos", "Módulos nativos con promesas: node:fs/promises, node:path y process para argumentos y variables de entorno.", code`
import { readFile, writeFile } from "node:fs/promises";

const datos = JSON.parse(await readFile("datos.json", "utf8"));
await writeFile("salida.txt", "ok\n");
console.log(process.argv.slice(2), process.env.HOME);`, "node fs archivos servidor"),
    a("Calidad", "node --test", "El runner de tests incluido en Node: test() y assert, sin dependencias.", code`
import { test } from "node:test";
import assert from "node:assert/strict";
import { sumar } from "./sumar.js";

test("suma dos números", () => {
  assert.equal(sumar(2, 3), 5);
});`, "test prueba testing vitest jest"),
  ],
};
