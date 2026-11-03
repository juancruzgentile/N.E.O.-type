import { type Topic, a, b, code, m } from "./types";

export const rust: Topic = {
  id: "rust",
  name: "Rust",
  group: "Lenguajes",
  emblem: "rust",
  badge: "Rs",
  color: "#f46623",
  hl: "rust",
  summary:
    "Lenguaje de sistemas, compilado, con la velocidad de C y C++ y seguridad de memoria en el código seguro: el compilador verifica la propiedad (ownership) y los préstamos de cada valor. Los bloques unsafe y las llamadas a C quedan fuera de esa garantía y dependen de quien los escribe. " +
    "Se usa en herramientas de línea de comandos, navegadores, sistemas embebidos, WebAssembly y servicios de alto rendimiento.",
  facts: [
    { label: "Archivos", value: ".rs · Cargo.toml" },
    { label: "Ejecutar", value: "cargo run" },
    { label: "Paquetes", value: "crates.io (cargo add)" },
    { label: "Edición", value: "2024" },
    { label: "Herramientas", value: "rustfmt · clippy" },
  ],
  workflow: [
    { title: "Cargo para todo", text: "cargo new crea el proyecto; cargo build, run, test y doc cubren el día a día. Las dependencias van en Cargo.toml." },
    { title: "Escuchar al compilador", text: "Los mensajes de error de Rust explican el problema y muchas veces sugieren el arreglo. Leelos completos." },
    { title: "Clippy y rustfmt", text: "cargo fmt formatea y cargo clippy sugiere código más idiomático. Correlos antes de cada commit." },
    { title: "Result en vez de panic", text: "Las funciones que pueden fallar devuelven Result y se propagan con ?. unwrap queda para prototipos y tests." },
    { title: "Prestar antes que clonar", text: "Pasá referencias (&T) cuando no necesitás la propiedad del valor; clone solo cuando hace falta una copia." },
  ],
  entries: [
    b("Estructura", "fn main y println!", "El programa arranca en main. Las macros terminan en ! y println! formatea con llaves.", code`
fn main() {
    let nombre = "Ana";
    println!("Hola, {}!", nombre);
    println!("Hola, {nombre}!");
}`, "inicio imprimir macro"),
    b("Datos", "let y mut", "Las variables son inmutables por defecto; mut permite cambiarlas. El tipo se infiere o se anota.", code`
let x = 5;
let mut contador: u32 = 0;
contador += 1;
let x = x * 2; // sombra: nueva variable con el mismo nombre`, "variable mutable shadowing"),
    b("Datos", "Tipos básicos", "Enteros con y sin signo (i32, u64, usize), f64, bool, char, &str y String.", code`
let edad: u8 = 30;
let precio: f64 = 9.99;
let letra: char = 'a';
let saludo: &str = "hola";
let propio: String = String::from("hola");`, "tipos enteros string"),
    b("Funciones", "fn", "Los tipos de parámetros son obligatorios. La última expresión sin ; es el valor de retorno.", code`
fn area(ancho: f64, alto: f64) -> f64 {
    ancho * alto
}`, "funcion retorno"),
    b("Control de flujo", "if, loop, while y for", "if es una expresión; for recorre rangos e iteradores.", code`
let tipo = if n % 2 == 0 { "par" } else { "impar" };
for i in 0..3 {
    println!("{i}");
}
for nombre in &nombres {
    println!("{nombre}");
}`, "bucle condicional rango"),
    b("Colecciones", "Vec", "Vector dinámico. vec! lo crea con valores.", code`
let mut nums = vec![3, 1, 2];
nums.push(4);
nums.sort();
let primero = nums[0];
let tal_vez = nums.get(10); // Option<&i32>`, "vector lista array"),

    m("Memoria", "Ownership y préstamos", "Cada valor tiene un dueño. Al pasarlo se mueve; con & se presta sin moverlo y &mut permite modificarlo (uno a la vez).", code`
fn largo(s: &String) -> usize { s.len() }
fn agregar(s: &mut String) { s.push('!'); }

let mut texto = String::from("hola");
let n = largo(&texto);
agregar(&mut texto);
let movido = texto; // texto ya no se puede usar`, "propiedad prestamo borrow referencia"),
    m("Tipos", "struct e impl", "struct agrupa datos; impl le agrega métodos y funciones asociadas como new.", code`
struct Cuenta {
    titular: String,
    saldo: f64,
}

impl Cuenta {
    fn new(titular: &str) -> Self {
        Cuenta { titular: titular.to_string(), saldo: 0.0 }
    }
    fn depositar(&mut self, monto: f64) {
        self.saldo += monto;
    }
}`, "estructura metodo"),
    m("Tipos", "enum y match", "Los enums pueden llevar datos en cada variante. match obliga a cubrir todos los casos.", code`
enum Mensaje {
    Salir,
    Mover { x: i32, y: i32 },
    Escribir(String),
}

match msg {
    Mensaje::Salir => salir(),
    Mensaje::Mover { x, y } => mover(x, y),
    Mensaje::Escribir(t) => println!("{t}"),
}`, "enumeracion coincidencia"),
    m("Errores", "Option y Result", "Option<T> es Some(valor) o None; Result<T, E> es Ok(valor) o Err(error). Reemplazan a null y a las excepciones.", code`
fn buscar(usuarios: &[Usuario], id: u32) -> Option<&Usuario> {
    usuarios.iter().find(|u| u.id == id)
}

match buscar(&usuarios, 1) {
    Some(u) => println!("{}", u.nombre),
    None => println!("no existe"),
}
let n: i32 = "42".parse().unwrap_or(0);`, "opcion resultado null error"),
    m("Errores", "Operador ?", "Propaga el error hacia arriba si lo hay; si no, desenvuelve el valor.", code`
use std::fs;
use std::io;

fn leer_config() -> Result<String, io::Error> {
    let texto = fs::read_to_string("config.toml")?;
    Ok(texto.trim().to_string())
}`, "propagar error interrogacion"),
    m("Colecciones", "HashMap", "Diccionario de la biblioteca estándar. entry facilita insertar o actualizar.", code`
use std::collections::HashMap;

let mut conteo = HashMap::new();
for palabra in texto.split_whitespace() {
    *conteo.entry(palabra).or_insert(0) += 1;
}`, "mapa diccionario"),
    m("Iteradores", "Iteradores y closures", "Cadenas de iter, map, filter y collect. Las closures se escriben |x| expresión.", code`
let pares: Vec<i32> = nums.iter()
    .filter(|n| *n % 2 == 0)
    .map(|n| n * 10)
    .collect();
let total: i32 = nums.iter().sum();`, "iter map filter collect closure"),

    a("Tipos", "Traits", "Definen comportamiento compartido, como las interfaces. Se pueden implementar para tipos propios o derivar con #[derive].", code`
trait Forma {
    fn area(&self) -> f64;
    fn describir(&self) -> String {
        format!("área {:.2}", self.area())
    }
}

#[derive(Debug, Clone, PartialEq)]
struct Circulo { r: f64 }

impl Forma for Circulo {
    fn area(&self) -> f64 { std::f64::consts::PI * self.r * self.r }
}`, "trait interfaz derive"),
    a("Genéricos", "Genéricos y trait bounds", "Funciones genéricas que exigen capacidades con : Trait o where.", code`
fn mayor<T: PartialOrd + Copy>(lista: &[T]) -> Option<T> {
    let mut it = lista.iter().copied();
    let primero = it.next()?;
    Some(it.fold(primero, |m, x| if x > m { x } else { m }))
}`, "generics bounds where"),
    a("Memoria", "Lifetimes", "Indican cuánto vive una referencia para que el compilador garantice que nunca apunte a algo liberado.", code`
fn mas_largo<'a>(a: &'a str, b: &'a str) -> &'a str {
    if a.len() >= b.len() { a } else { b }
}`, "tiempo de vida referencias"),
    a("Memoria", "Box, Rc y RefCell", "Box guarda en el heap; Rc comparte propiedad; RefCell permite mutar con chequeo en tiempo de ejecución.", code`
use std::cell::RefCell;
use std::rc::Rc;

let compartido = Rc::new(RefCell::new(vec![1, 2]));
let otro = Rc::clone(&compartido);
otro.borrow_mut().push(3);`, "smart pointers puntero heap"),
    a("Concurrencia", "Hilos y Arc<Mutex>", "Arc comparte entre hilos y Mutex protege el acceso. El compilador impide carreras de datos.", code`
use std::sync::{Arc, Mutex};
use std::thread;

let total = Arc::new(Mutex::new(0));
let hilos: Vec<_> = (0..4).map(|_| {
    let total = Arc::clone(&total);
    thread::spawn(move || *total.lock().unwrap() += 1)
}).collect();
for h in hilos { h.join().unwrap(); }`, "threads concurrencia mutex"),
    a("Herramientas", "Cargo", "El gestor de proyectos y paquetes de Rust.", code`
cargo new mi_app
cargo add serde --features derive
cargo run --release
cargo test
cargo clippy
cargo fmt`, "cargo crates build"),
    a("Calidad", "#[test]", "Los tests viven en el mismo archivo, en un módulo tests.", code`
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn calcula_area() {
        assert_eq!(area(2.0, 3.0), 6.0);
    }
}`, "test prueba"),
  ],
};
