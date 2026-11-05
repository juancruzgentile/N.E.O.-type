import { area, code, co, er, op, sa } from "./crear";

const M = "https://developer.mozilla.org/en-US/docs/Web/JavaScript/";
export const javascript = area("javascript", [
  op("j", "¿Qué diferencia hay entre `let` y `const`?",
    ["const no permite reasignar la variable; let sí (un objeto const igual puede modificarse por dentro)", "let no permite reasignar la variable; const sí, y su valor nunca puede cambiar", "const hace que el valor sea inmutable por completo, incluidos los objetos", "let solo funciona dentro de funciones y const solo fuera de ellas"],
    "const impide volver a asignar el nombre. Si guarda un objeto o un array, sus propiedades o elementos sí pueden cambiar.", M + "Reference/Statements/const"),
  sa("j", `console.log(typeof null);`, ["object", "null", "undefined", "Error"],
    "Es un error histórico del lenguaje que se mantiene por compatibilidad: typeof null da 'object'.", M + "Reference/Operators/typeof"),
  sa("j", `console.log(0.1 + 0.2 === 0.3);`, ["false", "true", "undefined", "Error"],
    "Los números son de punto flotante binario: 0.1 + 0.2 da 0.30000000000000004. Para comparar se usa una tolerancia (Number.EPSILON).", M + "Reference/Global_Objects/Number/EPSILON"),
  op("j", "¿Qué diferencia hay entre `===` y `==`?",
    ["=== compara sin convertir tipos; == convierte antes de comparar", "== compara referencias de objetos; === compara solo los valores primitivos", "=== convierte los tipos antes de comparar y == nunca lo hace", "Son equivalentes; === es solo una forma más moderna de escribir =="],
    "'5' == 5 es true porque == convierte; '5' === 5 es false. En general conviene usar ===.", M + "Guide/Equality_comparisons_and_sameness"),
  sa("j", `console.log("5" + 3, "5" - 3);`, ["53 2", "8 2", "53 53", "8 8"],
    "Con + y un texto, JavaScript concatena; con - convierte a número y resta.", M + "Reference/Operators/Addition"),
  sa("j", `console.log([1, 2, 3].map((n) => n * 2));`, ["[ 2, 4, 6 ]", "[ 1, 2, 3 ]", "6", "undefined"],
    "map devuelve un array nuevo con el resultado de la función en cada elemento y no modifica el original.", M + "Reference/Global_Objects/Array/map"),
  er("j", code`
const nombre = "Ana";
nombre = "Luis";`, ["No se puede reasignar una variable declarada con const (TypeError)", "nombre es una palabra reservada del lenguaje y no puede usarse como variable", "Las cadenas no se pueden guardar en una variable declarada con const", "Falta el punto y coma al final de la primera línea del código"],
    "const crea un enlace que no se puede reasignar. Si el valor tiene que cambiar, se usa let.", M + "Reference/Statements/const"),
  co("j", "Escribí una función flecha de un parámetro `n` que devuelva su cuadrado, guardada en la constante `cuadrado`.",
    ["const cuadrado = n => n * n;", "const cuadrado = (n) => n * n;", "const cuadrado = n => n ** 2;", "const cuadrado = (n) => n ** 2;"],
    "Una función flecha con una sola expresión devuelve su valor sin necesidad de return.", M + "Reference/Functions/Arrow_functions"),
  sa("s", code`
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}`, ["3\n3\n3", "0\n1\n2", "2\n2\n2", "0\n0\n0"],
    "var no tiene alcance de bloque: hay una sola i y, cuando los timers corren, el bucle ya terminó y vale 3.", M + "Reference/Statements/var"),
  sa("s", code`
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}`, ["0\n1\n2", "3\n3\n3", "2\n2\n2", "0\n0\n0"],
    "let crea una variable nueva en cada vuelta del bucle, y cada función guarda la suya.", M + "Reference/Statements/let"),
  op("s", "¿Qué hace `await` dentro de una función `async`?",
    ["Pausa esa función hasta que la promesa se resuelva, sin bloquear el resto del programa", "Bloquea todo el programa hasta que la promesa se resuelva por completo", "Convierte la promesa en un número que se puede usar en cualquier cuenta", "Ejecuta la función en otro hilo para que no trabaje el hilo principal"],
    "Mientras se espera, el motor sigue atendiendo otras tareas; después la función continúa con el resultado.", M + "Reference/Operators/await"),
  sa("s", code`
console.log("A");
setTimeout(() => console.log("B"), 0);
Promise.resolve().then(() => console.log("C"));
console.log("D");`, ["A\nD\nC\nB", "A\nB\nC\nD", "A\nD\nB\nC", "A\nC\nD\nB"],
    "Primero corre el código síncrono (A, D). Después las microtareas (el then de la promesa: C) y por último los timers (B).", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises"),
  op("s", "¿Qué es una closure?",
    ["Una función que recuerda las variables del ámbito donde se creó, aunque ese ámbito ya terminó", "Una función que se ejecuta sola en cuanto se escribe, sin que nadie la llame", "Un objeto cuyas propiedades no se pueden modificar una vez creado", "Una función que no recibe parámetros y que siempre devuelve el mismo valor"],
    "Las closures permiten guardar estado privado y crear funciones configuradas (contadores, debounce, fábricas).", M + "Guide/Closures"),
  sa("s", `console.log([10, 9, 1].sort());`, ["[ 1, 10, 9 ]", "[ 1, 9, 10 ]", "[ 10, 9, 1 ]", "[ 9, 10, 1 ]"],
    "sort sin función compara como texto: '1' < '10' < '9'. Para números hay que pasar (a, b) => a - b.", M + "Reference/Global_Objects/Array/sort"),
  sa("s", `console.log(typeof NaN, NaN === NaN);`, ["number false", "NaN true", "number true", "undefined false"],
    "NaN es de tipo number y no es igual a nada, ni a sí mismo. Para detectarlo se usa Number.isNaN.", M + "Reference/Global_Objects/NaN"),
  op("s", "¿Qué hace el operador `??`?",
    ["Devuelve el lado derecho solo si el izquierdo es null o undefined", "Devuelve el lado derecho si el izquierdo es falsy, como 0, '' o false", "Compara dos valores sin convertir los tipos, igual que el operador ===", "Convierte el valor de la izquierda a booleano y lo devuelve como resultado"],
    "a ?? b conserva 0, '' y false. Con || esos valores se reemplazarían por b.", M + "Reference/Operators/Nullish_coalescing"),
  sa("s", `console.log(0 || "x", 0 ?? "x");`, ["x 0", "0 x", "x x", "0 0"],
    "|| descarta cualquier valor falsy (incluido 0); ?? solo descarta null y undefined.", M + "Reference/Operators/Nullish_coalescing"),
  er("s", code`
async function cargar() {
  const r = fetch("/datos");
  const datos = await r.json();
  return datos;
}`, ["Falta await en fetch: r es una promesa y no tiene el método json", "async no se puede usar junto con fetch dentro de una misma función", "return no funciona dentro de las funciones declaradas como async", "Falta cerrar la respuesta con una llamada a r.close() antes de terminar"],
    "fetch devuelve una promesa. Hay que esperarla: const r = await fetch(...).", "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch"),
  op("s", "¿Qué diferencia hay entre `map` y `forEach`?",
    ["map devuelve un array nuevo con los resultados; forEach no devuelve nada útil", "forEach devuelve un array nuevo con los resultados y map no devuelve nada", "map modifica el array original y forEach siempre trabaja sobre una copia", "No hay diferencia: son dos nombres del mismo método del lenguaje"],
    "Se usa map para transformar y forEach para efectos (imprimir, guardar), sin usar el valor devuelto.", M + "Reference/Global_Objects/Array/forEach"),
  co("s", "Escribí la expresión que devuelva un array nuevo con los números pares de `nums`, usando `filter`.",
    ["nums.filter(n => n % 2 === 0)", "nums.filter((n) => n % 2 === 0)"],
    "filter conserva los elementos para los que la función devuelve true.", M + "Reference/Global_Objects/Array/filter"),
  op("x", "¿En qué orden se ejecutan las tareas del event loop?",
    ["Primero el código síncrono, después todas las microtareas (promesas) y luego las macrotareas (timers)", "Primero los timers, después las promesas y al final el código síncrono escrito, porque el motor deja siempre lo más urgente para el último momento", "Todo se ejecuta exactamente en el orden en que fue escrito en el archivo", "Las promesas corren en otro hilo y terminan siempre antes que cualquier timer"],
    "Cuando la pila de llamadas queda vacía, el motor vacía la cola de microtareas antes de tomar la siguiente macrotarea.", M + "Guide/Using_promises"),
  op("x", "¿Para qué sirve hacer `debounce` de una función?",
    ["Para que se ejecute solo después de que pasen N ms sin nuevas llamadas (por ejemplo, al escribir en un buscador)", "Para que se ejecute como máximo una vez por segundo, aunque se llame muchas veces seguidas, descartando todas las llamadas que lleguen en ese intervalo", "Para que se ejecute en otro hilo y no frene la interfaz mientras trabaja", "Para guardar su resultado en caché y devolverlo si se llama con los mismos datos"],
    "Reduce llamadas repetidas: cada evento reinicia un timer y solo el último dispara la función.", "https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout"),
  op("x", "¿Cuál es la diferencia entre `Promise.all` y `Promise.allSettled`?",
    ["all se rechaza en cuanto una promesa falla; allSettled espera a todas e informa el resultado de cada una", "all espera a que terminen todas y allSettled se detiene en la primera que se resuelva", "allSettled solo funciona con promesas que ya se resolvieron sin ningún error", "Las dos se rechazan igual; allSettled solo cambia el nombre del método"],
    "Con allSettled se obtiene un array de { status, value | reason }, útil cuando no querés perder los resultados buenos si alguno falló.", M + "Reference/Global_Objects/Promise/allSettled"),
  sa("x", code`
const m = new Map([["a", 1]]);
m.set("b", 2);
console.log(m.size, [...m.keys()]);`, ["2 [ 'a', 'b' ]", "1 [ 'a' ]", "2 [ 1, 2 ]", "undefined [ 'a', 'b' ]"],
    "Map guarda pares clave-valor, recuerda el orden de inserción y tiene size.", M + "Reference/Global_Objects/Map"),
  op("x", "¿Qué hace `Object.freeze(obj)`?",
    ["Impide agregar, borrar o cambiar propiedades del objeto, pero solo en el primer nivel", "Hace una copia profunda del objeto para que no se pueda modificar el original", "Impide que otras funciones lean las propiedades del objeto congelado", "Convierte el objeto en un array de pares para poder recorrerlo con un bucle"],
    "Es superficial: si una propiedad es otro objeto, ese objeto interno sigue pudiendo cambiar.", M + "Reference/Global_Objects/Object/freeze"),
  op("x", "¿Qué es el hoisting?",
    ["Que las declaraciones se registran antes de ejecutar el código; let y const no se pueden usar antes de su línea (zona muerta temporal)", "Que las funciones se ejecutan al final del archivo, sin importar dónde se escribieron, y las variables siempre empiezan valiendo cero al declararse", "Que las variables se borran de la memoria al terminar de ejecutarse la función", "Que let y const se pueden usar antes de su línea con el valor undefined"],
    "var y las declaraciones de función se pueden usar antes; let y const existen pero lanzan ReferenceError hasta que se declaran.", "https://developer.mozilla.org/en-US/docs/Glossary/Hoisting"),
]);
