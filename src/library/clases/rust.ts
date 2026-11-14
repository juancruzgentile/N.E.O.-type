import { type Clase, code } from "../types";

export const claseRust: Clase = {
  titulo: "Rust de cero: velocidad de C con la memoria bajo control",
  bajada:
    "La referencia rápida está en la otra pestaña. Esta es la clase completa: qué problema ataca Rust, la idea de propiedad que lo distingue, " +
    "tu primer programa, los conceptos base, los errores típicos y en qué proyectos conviene.",
  secciones: [
    {
      heading: "Qué es y qué problema resuelve",
      parrafos: [
        "Rust es un lenguaje compilado, de tipado estático y pensado para programas rápidos y seguros. Genera código de máquina nativo, sin máquina virtual y sin recolector de basura, con un **rendimiento comparable al de C y C++**. Se usa en sistemas operativos, navegadores, motores de juegos, herramientas de línea de comandos, WebAssembly y servicios de red.",
        "El problema que resuelve es la **seguridad de memoria**. En C y C++ es fácil leer memoria ya liberada, liberar dos veces o provocar carreras de datos entre hilos, y esos errores están detrás de una parte enorme de las vulnerabilidades de seguridad. Rust **los detecta al compilar** con un sistema de propiedad (ownership), así que si el programa compila, esa clase de errores no puede ocurrir (fuera de los bloques marcados como `unsafe`).",
        "El precio de esto es una **curva de aprendizaje más empinada**: el compilador es estricto y al principio vas a discutir con él.",
      ],
    },
    {
      heading: "Historia corta",
      parrafos: [
        "Empezó como proyecto personal de **Graydon Hoare**, un empleado de Mozilla, hacia 2006. Mozilla lo patrocinó oficialmente desde 2009, porque quería reescribir partes del navegador (el proyecto Servo) con más seguridad y paralelismo. La versión 1.0, con la promesa de estabilidad, salió en mayo de 2015.",
        "En 2021 Mozilla dejó el proyecto en manos de la **Rust Foundation**, con empresas como Amazon, Google, Microsoft y Huawei. Rust se volvió un lenguaje aceptado para partes del núcleo de Linux y muy elegido en las encuestas de desarrolladores.",
      ],
      lista: [
        "Cada tres años, aproximadamente, sale una **edición** (2015, 2018, 2021, 2024) que agrupa cambios; el código viejo sigue compilando.",
        "Cada seis semanas sale una versión nueva del compilador.",
        "`cargo`, la herramienta oficial, instala dependencias, compila, prueba y publica; es parte de lo que hace amable al lenguaje.",
      ],
    },
    {
      heading: "Cómo funciona por dentro: propiedad y préstamos",
      parrafos: [
        "Rust compila a código nativo (usa LLVM para optimizar). Como no hay recolector de basura, necesita saber en tiempo de compilación cuándo liberar cada cosa. Lo hace con tres reglas: cada valor tiene un **único dueño**; cuando el dueño sale de su alcance, el valor se libera; y asignar o pasar un valor a otro lugar **lo mueve**, de modo que el dueño anterior ya no lo puede usar.",
        "Para usar un valor sin quedártelo, lo prestás con una **referencia** (`&`). Hay dos tipos de préstamo y una regla: o tenés muchas referencias de solo lectura (`&`), o tenés una sola mutable (`&mut`), nunca las dos al mismo tiempo. Esta regla es la que impide, al compilar, las carreras de datos y los punteros colgados. Un verificador (el **borrow checker**) la comprueba, y no cuesta nada al ejecutar.",
      ],
      codigo: [
        code`
fn largo(texto: &str) -> usize { texto.len() }   // préstamo: no toma la propiedad

fn main() {
    let a = String::from("hola");
    let b = a;                      // MUEVE: a deja de ser válido
    // println!("{a}");             // error: valor movido
    println!("{}", largo(&b));      // presta b y sigue siendo tuyo: 4
}`,
      ],
    },
    {
      heading: "Tu primer programa, paso a paso",
      parrafos: [
        "Con Rust instalado (`rustup`): `cargo new saludo`, entrá a la carpeta y reemplazá `src/main.rs` por esto. Después `cargo run -- Ana 2`.",
      ],
      codigo: [
        code`
use std::env;

fn main() {
    let args: Vec<String> = env::args().collect();
    let nombre = args.get(1).map(String::as_str).unwrap_or("mundo");
    let veces: u32 = args.get(2).and_then(|s| s.parse().ok()).unwrap_or(1);

    for i in 1..=veces {
        println!("{i}. Hola, {nombre}");
    }
}`,
      ],
    },
    {
      heading: "Qué hace cada línea",
      parrafos: [
        "`env::args()` entrega los argumentos del programa y `collect()` los junta en un `Vec<String>`, una lista dinámica. `args.get(1)` no falla si no existe: devuelve un `Option`, que es `Some(valor)` o `None`. Rust **no tiene null**; la ausencia de un valor se expresa con ese tipo y **el compilador te obliga a manejarla**. `unwrap_or` usa el valor por defecto cuando es `None`.",
        "Para el número, `parse()` intenta convertir y devuelve un `Result` (`Ok` o `Err`); con `.ok()` lo transformamos en `Option`. `1..=veces` es un rango que incluye el final. `println!` lleva una exclamación porque es una **macro**, y lo que va entre llaves se reemplaza por la variable. Las variables son **inmutables por defecto**: para cambiar una se declara con `let mut`.",
      ],
    },
    {
      heading: "Los cinco conceptos que sostienen todo lo demás",
      parrafos: [
        "Con estos cinco leés casi cualquier código Rust:",
      ],
      lista: [
        "**Propiedad y préstamos**: lo de la sección anterior.",
        "**Enums y match**: un `enum` guarda datos distintos en cada variante, y `match` obliga a cubrir todos los casos.",
        "**Option y Result**: no hay `null` ni excepciones; la ausencia y el error son valores del sistema de tipos.",
        "**Structs, impl y traits**: los datos se definen con `struct`, los métodos en un bloque `impl`, y los traits (como las interfaces) definen comportamiento compartido.",
        "El operador `?`: **propaga un error hacia arriba** con una sola letra.",
      ],
      codigo: [
        code`
use std::num::ParseIntError;

fn leer_edad(s: &str) -> Result<u32, ParseIntError> {
    let n = s.trim().parse::<u32>()?;   // si falla, devuelve el error y sale
    Ok(n)
}

fn main() {
    match leer_edad("42") {
        Ok(edad) => println!("edad: {edad}"),
        Err(e) => println!("no es un número: {e}"),
    }
}`,
      ],
    },
    {
      heading: "Errores que comete casi todo el mundo",
      parrafos: [
        "Los que más se repiten:",
      ],
      lista: [
        "Pelear con el borrow checker clonando todo: `.clone()` por todos lados compila, pero tira la ventaja de rendimiento. Primero **pensá quién debería ser el dueño**.",
        "Usar `unwrap()` o `expect()` en código real: provoca un **pánico** si el valor no está. Manejá el caso con `match` o con `?`.",
        "Confundir `String` con `&str`: `String` es **dueña de su texto** y crece; `&str` es una **vista prestada**.",
        "Modificar algo mientras lo tenés prestado: el compilador lo rechaza, y el mensaje de error suele indicar exactamente cómo arreglarlo.",
        "Esperar que un desbordamiento de enteros avise siempre: en compilación de depuración provoca un pánico, pero en la de producción (release) da la vuelta sin avisar.",
      ],
      codigo: [
        code`
let mut v = vec![1, 2, 3];
let primero = &v[0];      // préstamo inmutable
v.push(4);                // error: v no se puede modificar mientras está prestado
println!("{primero}");    // (push podría mover el vector y dejar primero colgando)`,
      ],
    },
    {
      heading: "Dónde conviene usarlo y dónde no",
      parrafos: [
        "Rust es una gran herramienta, pero cuesta más que otras:",
      ],
      tabla: {
        cabeza: ["Caso", "¿Rust?", "Por qué"],
        filas: [
          ["Sistemas, motores y herramientas de bajo nivel", "Sí", "Rendimiento de C sin los errores de memoria."],
          ["Herramientas de línea de comandos rápidas", "Sí", "Un binario nativo y `cargo` hace muy fácil publicarlas."],
          ["WebAssembly", "Sí", "Compila a WebAssembly con muy buen soporte."],
          ["Servicios de red de alto rendimiento", "Sí", "Sin recolector de basura, con latencias previsibles."],
          ["Prototipos y scripts", "No", "La rigurosidad del compilador frena cuando todavía no sabés qué querés."],
          ["Aplicaciones de negocio con mucho cambio", "Con cuidado", "Otros lenguajes dan más rapidez de desarrollo."],
          ["Interfaces gráficas", "Posible", "El ecosistema existe pero es joven."],
        ],
      },
    },
    {
      heading: "Comparación con lenguajes cercanos",
      parrafos: [
        "Cuándo conviene otro:",
      ],
      tabla: {
        cabeza: ["Lenguaje", "Elegilo en vez de Rust cuando…"],
        filas: [
          ["C o C++", "tenés que integrarte con una base de código enorme que ya existe en ese lenguaje."],
          ["Go", "querés servicios de red simples, con una curva de aprendizaje mucho más suave."],
          ["Python", "el objetivo es escribir rápido o trabajar con datos; podés llamar a código Rust desde Python para las partes lentas."],
          ["Java o C#", "tu proyecto es una aplicación empresarial y un recolector de basura no es un problema."],
        ],
      },
    },
    {
      heading: "Cómo seguir",
      parrafos: [
        "Hacé la ruta de Rust de la app y resolvé los proyectos. Usá la pestaña Referencia para recordar la sintaxis, y no te frustres con el compilador: sus mensajes son de los mejores que hay.",
        "Fuera de la app, el libro oficial (The Rust Programming Language, \"el Book\") es el recorrido recomendado, y su capítulo 4 sobre propiedad merece leerse dos veces. Rustlings te da ejercicios cortos para practicar con el compilador.",
      ],
    },
  ],
  fuentes: [
    { texto: "The Rust Programming Language", url: "https://doc.rust-lang.org/book/" },
    { texto: "Entender la propiedad (ownership)", url: "https://doc.rust-lang.org/book/ch04-00-understanding-ownership.html" },
    { texto: "Aprender Rust", url: "https://www.rust-lang.org/learn" },
  ],
  revisada: "2026-11-12",
};
