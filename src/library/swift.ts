import { type Topic, a, b, code, m } from "./types";
import { claseSwift } from "./clases/swift";

export const swift: Topic = {
  id: "swift",
  name: "Swift",
  group: "Lenguajes",
  emblem: "swift",
  badge: "SW",
  color: "#ff8a3d",
  hl: "swift",
  summary:
    "El lenguaje de Apple para iOS, macOS, watchOS y visionOS, también disponible en Linux y Windows. Es seguro por " +
    "diseño (opcionales en lugar de null, tipos de valor), rápido y expresivo. Con SwiftUI se arman interfaces " +
    "declarativas.",
  facts: [
    { label: "Archivos", value: ".swift · Package.swift" },
    { label: "Ejecutar", value: "swift run · swift main.swift" },
    { label: "Paquetes", value: "Swift Package Manager (swift package)" },
    { label: "Versión de referencia", value: "Swift 6 · Xcode 26" },
    { label: "Estilo", value: "4 espacios · camelCase · tipos en PascalCase" },
  ],
  workflow: [
    { title: "Xcode o SwiftPM", text: "Las apps se hacen en Xcode; las bibliotecas y herramientas de línea de comandos, con swift package init." },
    { title: "struct antes que class", text: "Los structs se copian y no comparten estado; class solo cuando hace falta identidad o herencia." },
    { title: "Opcionales sin !", text: "Desenvolvé con if let, guard let o ??. El ! fuerza y, si el valor es nil, la app se cae." },
    { title: "Concurrencia estricta", text: "Swift 6 verifica en compilación los accesos entre hilos: async/await, actors y Sendable." },
    { title: "Tests con Swift Testing", text: "@Test y #expect, o XCTest en proyectos más viejos. Se corren con swift test." },
  ],
  entries: [
    b("Datos", "let, var y tipos", "let es constante y var variable. El tipo se infiere o se escribe después de :.", code`
let nombre = "Ana"
var edad: Int = 30
edad += 1
let precio = 19.99      // Double
let activo = true`, "variable constante tipo"),
    b("Texto", "Interpolación", "Las expresiones se meten en un String con \\( ). Las comillas triples arman textos de varias líneas.", code`
let saludo = "Hola, \(nombre). Tenés \(edad) años"
let mensaje = """
    Pedido confirmado
    Total: \(total)
    """`, "string cadena formato"),
    b("Control de flujo", "if, for y switch", "switch tiene que cubrir todos los casos y no necesita break.", code`
for i in 1...5 where i % 2 == 0 {
    print(i)
}

switch nota {
case 9...10: print("excelente")
case 6..<9: print("aprobado")
default: print("a recuperar")
}`, "condicional bucle rango"),
    b("Funciones", "func y etiquetas", "Los parámetros tienen etiqueta externa; _ la omite.", code`
func saludar(_ nombre: String, veces: Int = 1) -> String {
    String(repeating: "Hola, \(nombre)! ", count: veces)
}

saludar("Ana", veces: 2)`, "funcion parametro etiqueta"),
    b("Colecciones", "Arrays y diccionarios", "Colecciones con tipo. Se modifican si se declaran con var.", code`
var nombres = ["Ana", "Luis"]
nombres.append("Eva")
var edades: [String: Int] = ["Ana": 30]
edades["Luis"] = 25
let edadEva = edades["Eva", default: 0]`, "lista array diccionario"),
    b("Opcionales", "Opcionales", "Un valor que puede ser nil. Se desenvuelve con if let, guard let o ??.", code`
let numero = Int("42")          // Int?
if let numero {
    print(numero * 2)
}
let nombre = usuario?.nombre ?? "anónimo"`, "optional nil null"),

    m("Tipos", "struct y class", "struct es un tipo de valor (se copia); class es de referencia y permite herencia.", code`
struct Punto {
    var x: Double
    var y: Double

    mutating func mover(dx: Double) {
        x += dx
    }
}

final class Cuenta {
    private(set) var saldo = 0.0
    func depositar(_ monto: Double) { saldo += monto }
}`, "estructura clase valor referencia"),
    m("Tipos", "enum con valores asociados", "Cada caso puede llevar datos; switch los extrae.", code`
enum Resultado {
    case exito(datos: String)
    case error(codigo: Int)
}

switch resultado {
case .exito(let datos): print(datos)
case .error(let codigo): print("falló con \(codigo)")
}`, "enumeracion caso asociado"),
    m("Funciones", "Closures", "Funciones anónimas. $0 y $1 son los parámetros; si es el último argumento, va fuera de los paréntesis.", code`
let pares = numeros.filter { $0 % 2 == 0 }
let nombres = usuarios.map(\.nombre)
let ordenados = productos.sorted { $0.precio < $1.precio }
let total = precios.reduce(0, +)`, "closure lambda map filter"),
    m("Tipos", "Protocolos", "Un contrato de propiedades y métodos. Las extensiones pueden dar implementaciones por defecto.", code`
protocol Forma {
    var area: Double { get }
}

struct Cuadrado: Forma {
    let lado: Double
    var area: Double { lado * lado }
}`, "protocolo interfaz extension"),
    m("Errores", "throws y do/catch", "Las funciones que pueden fallar se marcan con throws y se llaman con try.", code`
enum ErrorDeRed: Error {
    case sinConexion
}

func descargar() throws -> String {
    throw ErrorDeRed.sinConexion
}

do {
    let datos = try descargar()
    print(datos)
} catch {
    print("Error: \(error)")
}`, "error excepcion try catch"),
    m("Herramientas", "Swift Package Manager", "Crea, compila, prueba y ejecuta paquetes.", code`
swift package init --type executable
swift build
swift test
swift run`, "paquete dependencias spm"),

    a("Concurrencia", "async/await", "Funciones asíncronas que se esperan sin bloquear. async let corre tareas en paralelo.", code`
func cargarPerfil() async throws -> Perfil {
    async let usuario = api.usuario()
    async let fotos = api.fotos()
    return try await Perfil(usuario: usuario, fotos: fotos)
}`, "asincrono concurrencia await"),
    a("Concurrencia", "actor", "Un tipo que protege su estado: solo un llamado a la vez accede a él.", code`
actor Contador {
    private var valor = 0

    func incrementar() -> Int {
        valor += 1
        return valor
    }
}

let contador = Contador()
let nuevo = await contador.incrementar()`, "actor concurrencia hilo"),
    a("Tipos", "Genéricos", "Funciones y tipos que sirven para cualquier tipo que cumpla un protocolo.", code`
func mayor<T: Comparable>(_ a: T, _ b: T) -> T {
    a > b ? a : b
}

struct Pila<Elemento> {
    private var items: [Elemento] = []
    mutating func apilar(_ item: Elemento) { items.append(item) }
    mutating func desapilar() -> Elemento? { items.popLast() }
}`, "generico template"),
    a("Datos", "Codable", "Convierte tipos a JSON y de vuelta con JSONEncoder y JSONDecoder.", code`
struct Tarea: Codable {
    let titulo: String
    let hecha: Bool
}

let json = try JSONEncoder().encode(Tarea(titulo: "Pagar", hecha: false))
let tarea = try JSONDecoder().decode(Tarea.self, from: json)`, "json serializar decodificar"),
    a("Interfaz", "SwiftUI", "Interfaces declarativas: la vista se describe a partir del estado y se actualiza sola.", code`
struct ContadorView: View {
    @State private var cuenta = 0

    var body: some View {
        Button("Sumar: \(cuenta)") {
            cuenta += 1
        }
    }
}`, "interfaz ui vista ios"),
  ],
  clase: claseSwift,
};
