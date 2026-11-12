import { type Clase, code } from "../types";

export const claseTypescript: Clase = {
  titulo: "TypeScript de cero: JavaScript que te avisa antes de romperse",
  bajada:
    "La referencia rápida está en la otra pestaña. Esta es la clase completa: qué agrega TypeScript sobre JavaScript, qué pasa con los tipos cuando el programa corre, " +
    "tu primer programa, los conceptos base, los errores típicos y cuándo vale la pena usarlo.",
  secciones: [
    {
      heading: "Qué es y qué problema resuelve",
      parrafos: [
        "TypeScript es JavaScript con un sistema de tipos encima. Todo programa JavaScript válido es también un programa TypeScript, y lo que se agrega son anotaciones que dicen qué forma tienen los datos: este parámetro es un texto, esta función devuelve un número, este objeto tiene estas propiedades.",
        "El problema que resuelve: en JavaScript, un error de tipo (llamar a una función con el argumento equivocado, leer una propiedad que no existe) aparece recién cuando ese código se ejecuta, a veces en producción. TypeScript revisa todo eso mientras escribís, en el editor, antes de correr nada. Además mejora el autocompletado y hace que renombrar o cambiar una función en un proyecto grande sea seguro.",
        "No es otro lenguaje que reemplace a JavaScript: se traduce a JavaScript y corre donde corre JavaScript.",
      ],
    },
    {
      heading: "Historia corta",
      parrafos: [
        "Lo creó Microsoft, con Anders Hejlsberg (el diseñador de C#) como arquitecto principal, y se hizo público en octubre de 2012. La versión 1.0 llegó en abril de 2014. Es de código abierto.",
        "Se volvió estándar en el mundo web cuando grandes proyectos lo adoptaron, entre ellos Angular, y los editores (sobre todo Visual Studio Code) mostraron lo bien que se sentía programar con autocompletado preciso.",
      ],
      lista: [
        "2016: TypeScript 2.0 trae el modo estricto con control de null y undefined, la mejora que más errores evita.",
        "2025: el equipo anuncia que reescribe el compilador en Go para hacerlo mucho más rápido. TypeScript 6.0 es la última versión escrita en TypeScript, y la 7.0 es la primera del compilador nativo.",
        "Hoy: Node.js puede ejecutar archivos .ts quitándoles los tipos, con límites (ver más abajo).",
      ],
    },
    {
      heading: "Cómo funciona por dentro: los tipos se borran",
      parrafos: [
        "Esta es la idea más importante de la clase: los tipos existen solo mientras escribís y compilás. El compilador (tsc) revisa el programa, avisa de los errores y escribe un archivo JavaScript común, sin ninguna anotación. A eso se le llama borrado de tipos (type erasure). Cuando el programa corre, ya no queda ni rastro de los tipos.",
        "Dos consecuencias prácticas. Primera: TypeScript no te protege de los datos que llegan de afuera (una respuesta de una API, un JSON, lo que escribe el usuario). Podés decir que un JSON tiene cierta forma, pero nadie lo comprueba al ejecutar: si lo validás, tiene que ser con código tuyo. Segunda: no se puede preguntar por un tipo en ejecución, porque ya no existe (por ejemplo, instanceof con una interfaz no funciona).",
        "TypeScript además usa tipado estructural: dos tipos son compatibles si tienen la misma forma, aunque se llamen distinto. Si un objeto tiene las propiedades que se piden, sirve.",
      ],
    },
    {
      heading: "Tu primer programa, paso a paso",
      parrafos: [
        "Creá saludo.ts. Para correrlo sin compilar a mano podés usar npx tsx saludo.ts; para solo revisar los tipos, npx tsc --noEmit saludo.ts.",
      ],
      codigo: [
        code`
function saludar(nombre: string, veces: number): string[] {
  return Array.from({ length: veces }, (_, i) => \`\${i + 1}. Hola, \${nombre}\`);
}

console.log(saludar("Ana", 2).join("\n"));
// saludar("Ana", "2");   // error: "2" es un string y se esperaba un number`,
      ],
    },
    {
      heading: "Qué hace cada línea",
      parrafos: [
        "Después de cada parámetro, : string y : number son las anotaciones. Después de los paréntesis, : string[] dice que la función devuelve una lista de textos. El compilador compara cada llamada con esa firma, y por eso la línea comentada fallaría: el 2 entre comillas es un texto y se pedía un número.",
        "El resto es JavaScript puro: Array.from arma una lista con tantos elementos como indique length, y la plantilla con comillas invertidas arma cada línea. Lo que casi nunca tenés que escribir es el tipo de las variables locales: TypeScript lo infiere solo a partir del valor (inferencia de tipos).",
      ],
    },
    {
      heading: "Los cinco conceptos que sostienen todo lo demás",
      parrafos: [
        "Con estos cinco leés casi cualquier código TypeScript:",
      ],
      lista: [
        "Anotación e inferencia: escribís el tipo en las fronteras (parámetros, lo que devuelve una función) y dejás que se infiera en el resto.",
        "type e interface: describen la forma de un objeto. Con ? una propiedad es opcional.",
        "Uniones: A | B significa \"uno de los dos\". Con una propiedad que distingue los casos (una unión discriminada) el compilador sabe en cada rama con cuál tratás.",
        "Genéricos: <T> escribe una función o un tipo una sola vez para varios tipos, sin perder precisión.",
        "Modo estricto (\"strict\": true en tsconfig.json): activa el control de null y undefined y otras revisiones. Encendelo siempre.",
      ],
      codigo: [
        code`
type Usuario = { nombre: string; edad?: number };   // edad es opcional

type Resultado =
  | { ok: true; valor: number }
  | { ok: false; error: string };                   // unión discriminada

function mostrar(r: Resultado) {
  if (r.ok) console.log(r.valor);                   // aquí TypeScript sabe que hay valor
  else console.log(r.error);                        // y aquí que hay error
}

function primero<T>(xs: T[]): T | undefined {       // genérico
  return xs[0];
}

const n = primero([3, 4]);        // n: number | undefined
// n.toFixed(1);                  // error con strict: n puede ser undefined
n?.toFixed(1);                    // bien: solo si existe`,
      ],
    },
    {
      heading: "Errores que comete casi todo el mundo",
      parrafos: [
        "Casi todos vienen de creer que los tipos protegen más de lo que protegen:",
      ],
      lista: [
        "Usar any para que el error desaparezca: apaga la revisión justo donde hacía falta. Si no sabés el tipo, usá unknown, que obliga a comprobarlo antes de usarlo.",
        "Callar al compilador con \"as\": una aserción de tipo no convierte ni comprueba nada, solo le dice a TypeScript que te crea. Si te equivocás, el error llega en ejecución.",
        "Creer que JSON.parse devuelve un tipo conocido: devuelve any. Validá los datos externos antes de confiar.",
        "No activar el modo estricto: sin él, null y undefined se cuelan por todas partes.",
        "Ejecutar .ts con node sin saber el límite: Node solo quita los tipos; la sintaxis que genera código (enum, propiedades declaradas en el constructor) no la acepta en ese modo. Para eso se usa tsx o tsc.",
      ],
      codigo: [
        code`
const crudo = '{"nombre": 42}';
const u = JSON.parse(crudo) as { nombre: string };   // compila sin quejas
console.log(u.nombre.toUpperCase());                 // falla al ejecutar: 42 no tiene toUpperCase`,
      ],
    },
    {
      heading: "Dónde conviene usarlo y dónde no",
      parrafos: [
        "En proyectos de cierto tamaño casi siempre conviene. Dónde sí y dónde no tanto:",
      ],
      tabla: {
        cabeza: ["Caso", "¿TypeScript?", "Por qué"],
        filas: [
          ["Aplicaciones web medianas y grandes", "Sí", "El editor te guía y los cambios grandes son seguros."],
          ["Bibliotecas que otros van a usar", "Sí", "Los tipos son parte de la documentación y dan autocompletado a quien las usa."],
          ["Back-end con Node.js", "Sí", "Los mismos tipos del front-end se pueden compartir con la API."],
          ["Un script de diez líneas", "Es opcional", "El paso de compilar pesa más que lo que aporta."],
          ["Código que corre sin pasos de construcción en un navegador", "No directamente", "El navegador solo entiende JavaScript; hace falta compilar."],
          ["Validar datos que llegan de afuera", "No alcanza solo", "Los tipos se borran al ejecutar: hay que validar con código."],
        ],
      },
    },
    {
      heading: "Comparación con lenguajes cercanos",
      parrafos: [
        "Cuándo conviene otra cosa:",
      ],
      tabla: {
        cabeza: ["Lenguaje", "Elegilo en vez de TypeScript cuando…"],
        filas: [
          ["JavaScript", "el proyecto es chico, una prueba rápida o un script."],
          ["Python con type hints", "el trabajo es de datos o de IA; las anotaciones son opcionales y se revisan con una herramienta aparte."],
          ["Java, C# o Kotlin", "querés tipos que sigan existiendo al ejecutar y un back-end empresarial."],
          ["Rust o Go", "necesitás rendimiento y tipos que además comprueba el compilador a nivel de memoria o concurrencia."],
        ],
      },
    },
    {
      heading: "Cómo seguir",
      parrafos: [
        "Hacé la ruta de TypeScript de la app, resolvé los proyectos y usá la pestaña Referencia para la sintaxis exacta de los tipos.",
        "Fuera de la app, el Handbook oficial es el mejor recorrido y la referencia de tsconfig explica cada opción del compilador. Con la base lista, React (en Frameworks, cuando lo abras) es el paso natural para ver TypeScript aplicado a interfaces.",
      ],
    },
  ],
  fuentes: [
    { texto: "TypeScript Handbook", url: "https://www.typescriptlang.org/docs/handbook/intro.html" },
    { texto: "Referencia de tsconfig", url: "https://www.typescriptlang.org/tsconfig/" },
    { texto: "Node.js: ejecutar TypeScript", url: "https://nodejs.org/api/typescript.html" },
  ],
  revisada: "2026-11-12",
};
