import { area, code, er, op, sa } from "./crear";

const B = "https://doc.rust-lang.org/book/";
export const rust = area("rust", [
  op("j", "En Rust, ¿qué pasa si declarás `let x = 5;` y después intentás `x = 6;`?",
    ["No compila: las variables son inmutables por defecto", "Compila bien: x pasa a valer 6 desde ese momento del programa", "Compila con una advertencia, pero igual cambia el valor de la variable", "x se convierte automáticamente en una constante global del programa"],
    "Para poder cambiarla se declara con let mut x.", B + "ch03-01-variables-and-mutability.html"),
  op("j", "¿Qué diferencia hay entre `String` y `&str`?",
    ["String es un texto con dueño, guardado en el heap y modificable; &str es una referencia a texto", "Son lo mismo: &str es solo otra forma de escribir el tipo String", "&str puede crecer con push_str y String tiene un tamaño fijo para siempre, porque el texto de String vive en la pila y el de &str en el heap", "String guarda un solo carácter y &str guarda un texto de cualquier largo"],
    "Las funciones suelen recibir &str, que acepta tanto literales como String.", B + "ch04-03-slices.html#string-slices"),
  er("j", code`
fn main() {
    let x = 5;
    x = 6;
}`, ["No se puede asignar dos veces a una variable inmutable", "Falta devolver un valor al final de la función main del programa", "x tiene que ser de tipo u8 para poder cambiar su valor más adelante", "println! es obligatorio para poder usar una variable dentro de la función"],
    "El compilador pide let mut x si el valor va a cambiar.", B + "ch03-01-variables-and-mutability.html", "rust"),
  sa("j", code`
fn main() {
    let v = vec![1, 2, 3];
    let total: i32 = v.iter().sum();
    println!("{}", total);
}`, ["6", "3", "123", "[1, 2, 3]"],
    "iter().sum() suma todos los elementos del vector: 1 + 2 + 3.", B + "ch13-02-iterators.html"),
  op("s", "¿Qué es el ownership (la propiedad) en Rust?",
    ["Cada valor tiene un dueño; cuando el dueño sale de alcance, el valor se libera; mover un valor cambia el dueño", "El programador libera la memoria a mano con una llamada a free al terminar", "Un recolector de basura recorre el programa y libera la memoria de vez en cuando", "Todas las variables son globales y se liberan al terminar la ejecución del programa, de modo que dos funciones pueden modificar la misma sin conflicto"],
    "Es lo que permite gestionar la memoria sin recolector de basura y sin errores de uso después de liberar.", B + "ch04-01-what-is-ownership.html"),
  er("s", code`
fn main() {
    let a = String::from("hola");
    let b = a;
    println!("{}", a);
}`, ["a se movió a b: usar a después es un error (use of moved value)", "String::from no existe en Rust y hay que usar la función String::new", "Falta la palabra mut en a para poder asignar su valor a otra variable", "println! no acepta valores de tipo String dentro de las llaves del texto"],
    "Asignar un String mueve la propiedad. Para tener dos copias se usa a.clone(), o se presta con &a.", B + "ch04-01-what-is-ownership.html", "rust"),
  op("s", "¿Para qué se usa `Option<T>`?",
    ["Para representar un valor que puede faltar (Some o None), sin null", "Para devolver errores con un mensaje que explica por qué falló la operación", "Para hacer opcionales los parámetros de una función cuando se la llama", "Para guardar varios valores del mismo tipo dentro de una sola variable"],
    "El compilador obliga a decidir qué hacer en el caso None.", B + "ch06-01-defining-an-enum.html#the-option-enum-and-its-advantages-over-null-values"),
  op("s", "¿Qué hace el operador `?` en una función que devuelve `Result`?",
    ["Si el valor es Err, devuelve ese error de inmediato; si es Ok, sigue con el valor", "Ignora el error y sigue con la línea siguiente de la función sin avisar", "Convierte el Result en un Option y descarta el mensaje del error original", "Detiene todo el programa con un mensaje y un código de salida distinto de cero"],
    "Reemplaza a un match largo cuando solo querés propagar el error hacia arriba.", B + "ch09-02-recoverable-errors-with-result.html"),
  op("s", "¿Qué reglas de préstamo aplica Rust sobre un mismo dato?",
    ["Se permiten muchas referencias inmutables o una sola mutable a la vez, nunca las dos juntas", "Se permiten muchas referencias mutables al mismo dato, siempre que todas estén vivas a la vez", "Se permite una referencia mutable junto con varias inmutables al mismo tiempo", "No hay reglas: el compilador deja usar las referencias como quien programa quiera"],
    "Evita carreras de datos y referencias que apuntan a algo que cambió. Dos &mut a datos distintos sí pueden convivir.", B + "ch04-02-references-and-borrowing.html"),
  sa("s", code`
fn main() {
    let s = String::from("hola");
    let t = s.clone();
    println!("{} {}", s, t);
}`, ["hola hola", "hola", "Error: s se movió", "t"],
    "clone hace una copia profunda, así que s sigue siendo válido después.", B + "ch04-01-what-is-ownership.html"),
  op("x", "¿Para qué sirven los lifetimes?",
    ["Para decirle al compilador cuánto tiempo son válidas las referencias y evitar referencias colgantes", "Para medir cuánto tarda una función en ejecutarse y mostrar el tiempo", "Para liberar la memoria a mano cuando una variable deja de usarse", "Para crear hilos que se ejecutan durante un tiempo limitado y luego terminan solos, sin que el programa tenga que esperar a que acaben su trabajo"],
    "Casi siempre se infieren; se escriben a mano cuando una función devuelve una referencia que depende de varios parámetros.", B + "ch10-03-lifetime-syntax.html"),
  op("x", "¿Qué logra `Arc<Mutex<T>>`?",
    ["Compartir un dato entre hilos y modificarlo de forma segura, de a un hilo por vez", "Copiar el dato en cada hilo para que ninguno tenga que esperar a los demás", "Evitar el uso de hilos y que el programa corra siempre en un solo hilo", "Hacer que el dato sea inmutable para que nadie pueda modificarlo nunca más"],
    "Arc cuenta referencias de forma atómica y Mutex garantiza acceso exclusivo para escribir.", B + "ch16-03-shared-state.html"),
  op("x", "¿Qué es un `trait`?",
    ["Una definición de comportamiento compartido que distintos tipos pueden implementar", "Un tipo de dato numérico que ocupa lo mismo en cualquier arquitectura", "Una macro que sirve para imprimir valores con un formato en la consola", "Un módulo de la biblioteca estándar que se importa al principio del archivo"],
    "Es parecido a una interfaz: define métodos y los tipos los implementan con impl Trait for Tipo.", B + "ch10-02-traits.html"),
  op("x", "¿Qué diferencia hay entre `Rc` y `Arc`?",
    ["Arc cuenta referencias de forma atómica y sirve entre hilos; Rc es más barato y solo sirve en un hilo", "Rc sirve entre hilos y Arc solo sirve dentro de un único hilo del programa, porque cuenta las referencias de forma más lenta y con menos garantías", "Son idénticos: Arc es solo el nombre largo de Rc en la biblioteca estándar", "Arc no cuenta referencias y Rc las cuenta de forma atómica y segura"],
    "El compilador no deja enviar un Rc a otro hilo: protege contra errores de concurrencia.", B + "ch16-03-shared-state.html"),
]);
