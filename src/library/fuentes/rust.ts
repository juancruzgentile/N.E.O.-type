import type { FuentesTema } from "./tipos";

const B = "https://doc.rust-lang.org/book/";
export const rust: FuentesTema = {
  version: "Rust 1.9x (edición 2024)",
  entradas: {
    "fn main y println!": [B + "ch01-02-hello-world.html"],
    "let y mut": [B + "ch03-01-variables-and-mutability.html"],
    "Tipos básicos": [B + "ch03-02-data-types.html"],
    "fn": [B + "ch03-03-how-functions-work.html"],
    "if, loop, while y for": [B + "ch03-05-control-flow.html"],
    "Vec": [B + "ch08-01-vectors.html"],
    "Ownership y préstamos": [B + "ch04-00-understanding-ownership.html"],
    "struct e impl": [B + "ch05-00-structs.html"],
    "enum y match": [B + "ch06-00-enums.html"],
    "Option y Result": [B + "ch09-02-recoverable-errors-with-result.html"],
    "Operador ?": [B + "ch09-02-recoverable-errors-with-result.html"],
    "HashMap": [B + "ch08-03-hash-maps.html"],
    "Iteradores y closures": [B + "ch13-00-functional-features.html"],
    "Traits": [B + "ch10-02-traits.html"],
    "Genéricos y trait bounds": [B + "ch10-01-syntax.html"],
    "Lifetimes": [B + "ch10-03-lifetime-syntax.html"],
    "Box, Rc y RefCell": [B + "ch15-00-smart-pointers.html"],
    "Hilos y Arc<Mutex>": [B + "ch16-00-concurrency.html"],
    "Cargo": ["https://doc.rust-lang.org/cargo/"],
    "#[test]": [B + "ch11-01-writing-tests.html"],
  },
};
