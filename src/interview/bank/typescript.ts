import { area, code, co, er, op, sa } from "./crear";

const T = "https://www.typescriptlang.org/docs/handbook/";
export const typescript = area("typescript", [
  op("j", "¿Qué hace TypeScript con los tipos cuando compila?",
    ["Los borra: el JavaScript resultante no tiene tipos", "Los convierte en validaciones que corren en tiempo de ejecución", "Los guarda en un archivo aparte que se carga al correr", "Los reemplaza por comentarios que el navegador revisa"],
    "Los tipos solo existen en el chequeo antes de ejecutar. Para validar datos que llegan de afuera hay que escribir validaciones en código.", T + "2/everyday-types.html"),
  op("j", "¿Qué diferencia práctica hay entre `interface` y `type`?",
    ["Ambos describen formas de objetos; type además permite uniones y alias de cualquier tipo, e interface se puede extender o ampliar", "interface funciona en tiempo de ejecución y puede validar datos que llegan de afuera, mientras que type solo existe en el chequeo de tipos del compilador", "type no admite propiedades opcionales ni de solo lectura en ningún caso", "interface solo se puede usar para describir clases y nunca objetos comunes"],
    "Para objetos se pueden usar los dos. Una unión como string | number solo se escribe con type.", T + "2/everyday-types.html#differences-between-type-aliases-and-interfaces"),
  er("j", `let edad: number = "30";`, ["Un string no se puede asignar a una variable de tipo number", "number no existe en TypeScript y hay que declarar la variable como Number", "Falta el punto y coma al final de la declaración para que compile", "let no admite anotaciones de tipo; solo const permite declarar el tipo"],
    "El compilador marca el error antes de ejecutar: el tipo declarado es number y el valor es un texto.", T + "2/everyday-types.html", "typescript"),
  op("j", "¿Qué diferencia hay entre `any` y `unknown`?",
    ["unknown obliga a comprobar el tipo antes de usar el valor; any apaga el chequeo", "any es más seguro porque acepta cualquier valor sin tener que comprobarlo después", "Son equivalentes; unknown es solo el nombre nuevo que se le dio a any", "unknown solo se puede usar con números y any con el resto de los tipos"],
    "Con unknown tenés que acotar el tipo (typeof, instanceof…) antes de operar. any deja pasar errores.", T + "2/functions.html#unknown"),
  co("j", "Escribí la anotación para que la variable `ids` sea un array de números: `let ids` ...",
    ["let ids: number[]", "let ids: Array<number>"],
    "number[] y Array<number> son lo mismo.", T + "2/everyday-types.html#arrays"),
  sa("s", code`
type P = { x: number; y?: number };
const p: P = { x: 1 };
console.log(p.y ?? "sin y");`, ["sin y", "undefined", "0", "Error"],
    "La propiedad y es opcional, así que vale undefined y ?? usa el valor de la derecha.", T + "2/objects.html#optional-properties", "typescript"),
  op("s", "¿Qué es un tipo unión como `string | number`?",
    ["Un tipo que puede ser uno de varios tipos", "Un tipo que es a la vez string y number", "Un tipo que convierte textos en números", "Un tipo que solo existe en tiempo de ejecución"],
    "Antes de usar el valor hay que acotarlo para saber cuál de los tipos es.", T + "2/everyday-types.html#union-types"),
  op("s", "¿Para qué sirve el narrowing (acotar el tipo)?",
    ["Para pasar de un tipo amplio a uno más específico con comprobaciones como typeof, in o instanceof", "Para reducir el tamaño del archivo JavaScript que se genera al compilar", "Para convertir un valor de un tipo a otro de forma automática al ejecutar el programa, sin escribir ninguna conversión explícita en el código", "Para evitar que una función pueda recibir parámetros de más de un tipo"],
    "Dentro del if (typeof x === 'string'), TypeScript sabe que x es un string.", T + "2/narrowing.html"),
  er("s", code`
function largo(x: string | number) {
  return x.length;
}`, ["number no tiene la propiedad length: hay que acotar el tipo con typeof", "length no existe en TypeScript y hay que usar la propiedad size", "Falta indicar el tipo de retorno de la función, porque no se infiere", "Las uniones no se pueden usar en parámetros: hay que escribir dos funciones"],
    "Con una unión solo podés usar lo que tienen en común todos los tipos, a menos que acotes con typeof.", T + "2/narrowing.html", "typescript"),
  op("s", "¿Qué hace `Partial<T>`?",
    ["Vuelve opcionales todas las propiedades de T", "Quita las propiedades opcionales de T y deja solo las obligatorias", "Hace que todas las propiedades de T sean de solo lectura y no cambien", "Elige solo algunas de las propiedades de T y descarta las demás"],
    "Es útil para objetos de actualización donde se manda solo lo que cambió.", "https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype"),
  op("s", "¿Qué garantiza `readonly` en una propiedad?",
    ["Que no se puede asignar después de crear el objeto, según el chequeo de tipos", "Que el valor se cifra en memoria para que otros programas no puedan leerlo", "Que el objeto se congela en tiempo de ejecución y nadie puede modificarlo", "Que la propiedad es privada y solo se puede leer dentro de la clase"],
    "readonly existe solo en el chequeo de tipos: no impide cambios en JavaScript puro.", T + "2/objects.html#readonly-properties"),
  op("x", "¿Qué hace el operador `satisfies`?",
    ["Comprueba que un valor cumple un tipo sin ensanchar el tipo que se infiere", "Convierte el valor al tipo indicado, igual que la aserción con la palabra as", "Valida el valor en tiempo de ejecución y lanza un error si no coincide", "Ensancha el tipo del valor para que acepte todas las propiedades posibles"],
    "Con satisfies conservás el tipo específico (por ejemplo, las claves exactas) y aun así se verifica que cumple el tipo.", "https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html#the-satisfies-operator"),
  op("x", "¿Para qué se usa el tipo `never` en un `switch`?",
    ["Para comprobar que se cubrieron todos los casos de una unión: si falta uno, no compila", "Para indicar que la función devuelve null en todos los casos posibles", "Para ignorar un caso de la unión sin que el compilador avise del olvido", "Para repetir un caso de la unión dentro del switch con otro código"],
    "En el default se asigna el valor a una variable de tipo never; si queda algún caso sin tratar, el compilador marca error.", T + "2/narrowing.html#exhaustiveness-checking"),
  op("x", "¿Qué problema resuelven los genéricos?",
    ["Escribir una función o tipo que funcione con varios tipos manteniendo la relación entre entrada y salida", "Hacer que el código compilado corra más rápido que el escrito con tipos normales, porque el compilador genera instrucciones distintas para cada tipo", "Evitar tener que escribir tipos en cualquier parte del programa", "Permitir que una clase herede de varias clases al mismo tiempo en TypeScript"],
    "function primero<T>(a: T[]): T devuelve el mismo tipo que tiene el array, no un any.", T + "2/generics.html"),
  sa("x", code`
enum Color { Rojo, Verde }
console.log(Color.Verde, Color[0]);`, ["1 Rojo", "Verde Rojo", "1 0", "Error"],
    "Los enums numéricos generan un objeto con mapeo en las dos direcciones: Color.Verde es 1 y Color[0] es 'Rojo'.", T + "enums.html", "typescript"),
  op("x", "¿Qué tipo tiene `keyof typeof obj`?",
    ["La unión de las claves de obj, como tipos literales (por ejemplo \"nombre\" | \"edad\")", "El tipo de los valores de obj, unidos en una sola unión de tipos", "El tipo del objeto completo, con todas sus propiedades y sus valores", "Siempre string, porque las claves de los objetos siempre son texto"],
    "typeof obj toma el tipo del objeto y keyof saca sus claves (string, number o symbol, según cómo estén declaradas).", T + "2/keyof-types.html"),
]);
