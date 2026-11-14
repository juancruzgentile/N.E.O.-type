import { type Clase, code } from "../types";

export const claseJavascript: Clase = {
  titulo: "JavaScript de cero: el lenguaje de la web, del navegador al servidor",
  bajada:
    "La referencia rápida está en la otra pestaña. Esta es la clase completa: de dónde sale JavaScript, cómo piensa un solo hilo con un bucle de eventos, " +
    "tu primer programa, los conceptos que sostienen todo, los errores clásicos y cuándo conviene (o no) usarlo.",
  secciones: [
    {
      heading: "Qué es y qué problema resuelve",
      parrafos: [
        "JavaScript es el lenguaje de programación de la web. Es el único que todos los navegadores ejecutan directamente, así que es lo que hace que una página reaccione: validar un formulario sin recargar, abrir un menú, actualizar un dato en pantalla, dibujar en un lienzo. Es de **tipado dinámico**, multiparadigma (se puede escribir con funciones, con objetos o mezclando) y está pensado para reaccionar a eventos.",
        "El problema que resuelve es que una página HTML con CSS es estática: muestra contenido pero no hace nada con él. JavaScript le agrega **comportamiento**. Y desde que existe Node.js (y después Deno y Bun) el mismo lenguaje también corre fuera del navegador, en servidores, herramientas de línea de comandos y aplicaciones de escritorio. **Un solo lenguaje para el front-end y el back-end**.",
        "Una aclaración que evita confusiones: JavaScript **no tiene nada que ver con Java**, más allá del nombre. Son lenguajes distintos, con ideas distintas.",
      ],
    },
    {
      heading: "Historia corta",
      parrafos: [
        "Lo creó **Brendan Eich** en 1995 en Netscape, la empresa del navegador más usado de esa época. Cuenta la historia que el primer prototipo lo escribió en unos diez días. Se llamó Mocha, después LiveScript y finalmente JavaScript, un nombre elegido por marketing porque Java estaba de moda.",
        "Con varios navegadores haciendo cosas distintas, el lenguaje se estandarizó en ECMA International con el nombre oficial **ECMAScript** (la primera edición salió en 1997). \"JavaScript\" es el nombre popular y \"ECMAScript\" el estándar que lo define.",
      ],
      lista: [
        "2009: nace Node.js, que lleva el motor V8 de Chrome al servidor.",
        "2015: **ECMAScript 2015 (ES6)** es el mayor cambio de su historia: `let` y `const`, funciones flecha, clases, módulos, promesas, plantillas con comillas invertidas.",
        "Desde 2015: una **edición nueva por año**, con mejoras chicas (`async`/`await`, el operador `?.`, el operador `??`, entre muchas otras).",
        "Hoy: el código que escribís suele pasar por TypeScript, un empaquetador y un framework, pero por debajo todo termina siendo JavaScript.",
      ],
    },
    {
      heading: "Cómo funciona por dentro: un hilo y un bucle de eventos",
      parrafos: [
        "Cada navegador trae un motor que ejecuta JavaScript: V8 en Chrome, Edge y Node, SpiderMonkey en Firefox, JavaScriptCore en Safari. Los motores modernos **compilan el código mientras corre** (JIT) y optimizan las partes que más se repiten.",
        "Lo más importante para entenderlo: JavaScript ejecuta tu código en un **solo hilo**. Hace una cosa a la vez. Entonces, ¿cómo espera un pedido de red sin congelar la página? Lo delega: el navegador (o Node) hace la espera por fuera, y cuando termina deja un aviso en una cola. El **bucle de eventos** (event loop) mira la cola y, cuando el hilo está libre, ejecuta lo que sigue. Las promesas tienen una cola propia con prioridad (las **microtareas**) que se vacía antes de pasar a la cola de los temporizadores.",
        "Por eso este programa imprime los números en un orden que parece raro hasta que lo entendés:",
      ],
      codigo: [
        code`
console.log("1");
setTimeout(() => console.log("2"), 0);       // va a la cola de tareas
Promise.resolve().then(() => console.log("3")); // va a la cola de microtareas
console.log("4");
// imprime: 1, 4, 3, 2`,
      ],
    },
    {
      heading: "Tu primer programa, paso a paso",
      parrafos: [
        "Creá un archivo `saludo.js` y corrélo con `node saludo.js Ana 2` (necesitás tener Node.js instalado). En el navegador, el mismo código funciona pegado en la consola de las herramientas de desarrollo, cambiando solo cómo se leen los datos.",
      ],
      codigo: [
        code`
const nombre = process.argv[2] ?? "mundo";
const veces = Number(process.argv[3] ?? 1);

for (let i = 1; i <= veces; i++) {
  console.log(\`\${i}. Hola, \${nombre}\`);
}`,
      ],
    },
    {
      heading: "Qué hace cada línea",
      parrafos: [
        "`process.argv` es la **lista de argumentos** con los que se ejecutó el programa: las dos primeras posiciones son Node y el archivo, así que tus datos empiezan en la posición 2. El operador `??` usa el valor de la derecha solo si el de la izquierda es `undefined` o `null`. Los argumentos **llegan como texto**, por eso `Number()` convierte el segundo en un número.",
        "`const` declara una variable que **no se puede reasignar**; `let` una que sí. Para el contador del `for` hace falta `let` porque cambia en cada vuelta. Las comillas invertidas arman una **plantilla**: lo que va dentro de `\${ }` se calcula y se inserta en el texto. Con los datos Ana y 2 imprime \"1. Hola, Ana\" y \"2. Hola, Ana\".",
      ],
    },
    {
      heading: "Los cinco conceptos que sostienen todo lo demás",
      parrafos: [
        "Con estos cinco leés casi cualquier código JavaScript: variables y tipos, funciones, objetos y arrays, asincronía y módulos.",
      ],
      lista: [
        "**Variables y tipos**: `const` y `let` (evitá `var`). Los tipos primitivos son `number`, `string`, `boolean`, `null`, `undefined`, `bigint` y `symbol`; todo lo demás es un objeto.",
        "**Funciones**: son valores. Se guardan en variables, se pasan a otras funciones y se devuelven. Las funciones flecha (`=>`) son la forma corta.",
        "**Objetos y arrays**: `{ clave: valor }` y `[a, b, c]`. Con `map`, `filter` y `reduce` transformás colecciones sin escribir bucles.",
        "**Asincronía**: una promesa representa un valor que va a llegar. `async`/`await` permite escribir el código que espera como si fuera lineal.",
        "**Módulos**: `export` saca algo de un archivo e `import` lo trae a otro.",
      ],
      codigo: [
        code`
const precios = [10, 25, 40];                              // arrays
const conIva = precios.map((p) => p * 1.21);               // funciones flecha
const producto = { nombre: "Cuaderno", precio: 25 };       // objetos
const { nombre, precio } = producto;                       // desestructuración

async function cargarUsuario(id) {                         // asincronía
  const respuesta = await fetch(\`https://api.ejemplo.com/usuarios/\${id}\`);
  if (!respuesta.ok) throw new Error("HTTP " + respuesta.status);
  return respuesta.json();
}

export { cargarUsuario };                                  // módulos`,
      ],
    },
    {
      heading: "Errores que comete casi todo el mundo",
      parrafos: [
        "Los clásicos, con su explicación:",
      ],
      lista: [
        "Usar `==` en vez de `===`: `==` **convierte los tipos** antes de comparar y da resultados raros (`0 == \"\"` es `true`). Usá siempre `===`.",
        "Los decimales: `0.1 + 0.2` no da `0.3`, da `0.30000000000000004`. Es una limitación de cómo los números de coma flotante se guardan en binario, no un error de JavaScript. Para dinero, trabajá en **centavos enteros**.",
        "Olvidar el `await`: sin `await`, la función `async` **devuelve una promesa**, no el valor, y el código sigue sin esperar.",
        "Perder el `this`: un método que se pasa suelto (por ejemplo como callback) deja de apuntar a su objeto. Las funciones flecha lo evitan porque heredan el `this` de donde se escribieron.",
        "Mutar sin querer: `sort()` y `reverse()` **modifican el array original**. Hacé una copia primero con `[...arr]`.",
        "`typeof null` devuelve `\"object\"`: es un error histórico que no se puede corregir sin romper la web.",
      ],
      codigo: [
        code`
console.log(0 == "");          // true  (convierte tipos)
console.log(0 === "");         // false (compara tipo y valor)
console.log(0.1 + 0.2);        // 0.30000000000000004

const letras = ["b", "a", "c"];
const ordenadas = [...letras].sort();   // copia: letras queda como estaba`,
      ],
    },
    {
      heading: "Dónde conviene usarlo y dónde no",
      parrafos: [
        "JavaScript puede casi todo, pero no es la mejor herramienta para todo:",
      ],
      tabla: {
        cabeza: ["Caso", "¿JavaScript?", "Por qué"],
        filas: [
          ["Interactividad en páginas web", "Sí, es la única opción", "Es lo que ejecuta el navegador."],
          ["APIs y servicios en tiempo real", "Sí", "Node.js maneja muchas conexiones a la vez con su bucle de eventos."],
          ["Aplicaciones de escritorio y móviles multiplataforma", "Sí", "Electron, React Native y similares comparten código con la web."],
          ["Herramientas de línea de comandos y scripts de construcción", "Sí", "El ecosistema de npm tiene paquetes para casi todo."],
          ["Cálculo pesado que ocupa todos los núcleos", "No", "Un solo hilo; se necesitan hilos de trabajo (workers) o otro lenguaje."],
          ["Proyectos grandes con muchos equipos", "Con TypeScript", "Sin tipos, los errores aparecen recién al ejecutar."],
          ["Sistemas con poca memoria o tiempo real estricto", "No", "El recolector de basura y el motor consumen recursos."],
        ],
      },
    },
    {
      heading: "Comparación con lenguajes cercanos",
      parrafos: [
        "Elegir lenguaje suele ser **elegir ecosistema**. Cuándo conviene otro:",
      ],
      tabla: {
        cabeza: ["Lenguaje", "Elegilo en vez de JavaScript cuando…"],
        filas: [
          ["TypeScript", "el proyecto va a crecer: es JavaScript con tipos y detecta errores antes de ejecutar."],
          ["Python", "el trabajo es de datos, ciencia o inteligencia artificial."],
          ["Go o Rust", "necesitás servicios más rápidos, con menos memoria y un único ejecutable."],
          ["Java o C#", "el back-end es grande y empresarial, con tipado estático y mucho ecosistema."],
        ],
      },
    },
    {
      heading: "Cómo seguir",
      parrafos: [
        "Hacé la ruta de JavaScript de la app para que la sintaxis te salga sola, resolvé los proyectos y usá la pestaña Referencia cuando necesites el detalle de una función.",
        "Fuera de la app, la referencia más completa y mejor mantenida es MDN, que explica cada función con ejemplos y compatibilidad entre navegadores. El estándar en sí está en la página de ECMA-262, y para Node.js la documentación oficial incluye guías para empezar. Cuando tengas la base, el paso natural es TypeScript y después React (en Frameworks, cuando lo abras).",
      ],
    },
  ],
  fuentes: [
    { texto: "MDN: JavaScript", url: "https://developer.mozilla.org/es/docs/Web/JavaScript" },
    { texto: "ECMA-262: el estándar", url: "https://tc39.es/ecma262/" },
    { texto: "Node.js: aprender", url: "https://nodejs.org/en/learn" },
  ],
  revisada: "2026-11-12",
};
