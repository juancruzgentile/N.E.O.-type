import { type Clase, code } from "../types";

export const claseSwift: Clase = {
  titulo: "Swift de cero: el lenguaje moderno y seguro de las plataformas de Apple",
  bajada:
    "La referencia rápida está en la otra pestaña. Esta es la clase completa: qué es Swift y para qué se usa, cómo maneja la memoria, tu primer programa, " +
    "los conceptos base (opcionales y tipos por valor), los errores típicos y cuándo conviene.",
  secciones: [
    {
      heading: "Qué es y qué problema resuelve",
      parrafos: [
        "Swift es un lenguaje de programación **compilado**, de **tipado estático**, creado por Apple. Es el **lenguaje principal para desarrollar aplicaciones** para iPhone, iPad, Mac, Apple Watch, Apple TV y Vision Pro, normalmente con el entorno Xcode y la interfaz declarativa SwiftUI. También corre en Linux y Windows, y se usa para servidores y herramientas de línea de comandos.",
        "El problema que resuelve es el de escribir aplicaciones rápidas y seguras con un código claro. Reemplazó a Objective-C, un lenguaje de los años ochenta con una sintaxis difícil y que permitía muchos errores en ejecución. Swift está diseñado para que los errores más comunes (valores que pueden faltar, memoria, desbordamientos) **los detecte el compilador o fallen de forma previsible**.",
      ],
    },
    {
      heading: "Historia corta",
      parrafos: [
        "Lo empezó **Chris Lattner** en Apple en 2010 y se presentó al público en la conferencia de desarrolladores de 2014. En 2015 Apple lo publicó como **código abierto**, y hoy lo dirige una comunidad con un proceso abierto de propuestas.",
      ],
      lista: [
        "2019 (Swift 5): la interfaz binaria se estabiliza y el lenguaje pasa a formar parte del sistema operativo.",
        "2021 (Swift 5.5): llegan `async` y `await` y los actores, para escribir código concurrente.",
        "2024 (Swift 6): el modo del lenguaje 6 detecta las **carreras de datos** al compilar.",
        "Hoy: se usa con Xcode 26 como entorno de referencia, y SwiftUI es la forma recomendada de armar interfaces.",
      ],
    },
    {
      heading: "Cómo funciona por dentro",
      parrafos: [
        "Swift se compila con LLVM a código de máquina nativo, sin máquina virtual y sin recolector de basura. La memoria se administra con **ARC** (conteo automático de referencias): cada objeto cuenta cuántas referencias fuertes apuntan a él y se libera en el momento en que llegan a cero. Es determinista, pero tiene una trampa: dos objetos que se apuntan entre sí forman un **ciclo de retención** y nunca se liberan, por eso existen las referencias `weak` y `unowned`.",
        "La distinción más importante del lenguaje es entre **tipos por valor y tipos por referencia**. Las `struct` y los `enum` son por valor: al asignarlos o pasarlos se copian. Las `class` son por referencia: la copia apunta al mismo objeto. La biblioteca estándar (`Int`, `String`, `Array`, `Dictionary`) está construida con tipos por valor, y la recomendación es **empezar con** `struct` y pasar a `class` solo cuando necesitás identidad compartida.",
      ],
    },
    {
      heading: "Tu primer programa, paso a paso",
      parrafos: [
        "Con Swift instalado, creá `saludo.swift` y corrélo con `swift saludo.swift Ana 2`.",
      ],
      codigo: [
        code`
let args = CommandLine.arguments
let nombre = args.count > 1 ? args[1] : "mundo"
let veces = args.count > 2 ? Int(args[2]) ?? 1 : 1

for i in stride(from: 1, through: veces, by: 1) {
    print("\(i). Hola, \(nombre)")
}`,
      ],
    },
    {
      heading: "Qué hace cada línea",
      parrafos: [
        "`let` declara una **constante** y `var` una **variable**; Swift **infiere el tipo**. `CommandLine.arguments` es la lista de argumentos (el primero es el programa). `Int(args[2])` intenta convertir el texto en entero y devuelve un **opcional**: un `Int?` que vale un número o `nil`. El operador `??` entrega el valor de la derecha cuando el de la izquierda es `nil`.",
        "`stride` recorre desde 1 hasta `veces` de a uno, y no falla si `veces` es cero (en cambio, el rango `1...0` hace que el programa se detenga). Dentro del texto, `\\( )` inserta el valor de una expresión. Con Ana y 2 imprime \"1. Hola, Ana\" y \"2. Hola, Ana\".",
      ],
    },
    {
      heading: "Los cinco conceptos que sostienen todo lo demás",
      parrafos: [
        "Con estos cinco leés casi cualquier código Swift:",
      ],
      lista: [
        "**Opcionales**: un valor que puede faltar se escribe con `?` y hay que desenvolverlo (`if let`, `guard let`, `??`) antes de usarlo.",
        "**Struct, class y enum**: `struct` por valor, `class` por referencia, y los `enum` pueden llevar datos asociados.",
        "**Protocolos y extensiones**: un protocolo define qué debe poder hacer un tipo, y una extensión agrega funciones a un tipo que ya existe.",
        "**Closures**: funciones sin nombre que se pasan como valor; son la base de `map`, `filter` y de SwiftUI.",
        "**Concurrencia**: `async`/`await`, `Task` y actores.",
      ],
      codigo: [
        code`
struct Libro { let titulo: String; var paginas: Int }   // tipo por valor

var a = Libro(titulo: "Dune", paginas: 600)
var b = a                    // copia independiente
b.paginas = 1
print(a.paginas)             // 600

let texto: String? = nil     // puede faltar
if let t = texto { print(t) } else { print("sin texto") }
print(texto ?? "vacío")      // vacío

protocol Descuento { func aplicar(_ precio: Double) -> Double }

func cargar() async throws -> String {
    try await Task.sleep(for: .seconds(1))
    return "listo"
}`,
      ],
    },
    {
      heading: "Errores que comete casi todo el mundo",
      parrafos: [
        "Los más repetidos:",
      ],
      lista: [
        "**Forzar el desenvolvimiento** con `!`: si el valor es `nil`, la app se cierra. Usá `if let`, `guard let` o `??`.",
        "Los **ciclos de retención** con closures: un closure que captura `self` y se guarda en `self` nunca libera el objeto. Usá `[weak self]`.",
        "Confundir `struct` con `class`: modificar una copia y esperar que cambie el original (o al revés).",
        "Pasarse de un índice: `array[10]` en un arreglo corto detiene el programa; **Swift prefiere fallar a corromper memoria**.",
        "Desbordar un entero: `Int.max + 1` también detiene el programa. Usá `&+` si querés que dé la vuelta a propósito.",
      ],
      codigo: [
        code`
let n = Int("abc")        // Int? -> nil
// print(n!)              // se cierra: "Unexpectedly found nil"
print(n ?? 0)             // 0: la forma segura

let v = [1, 2, 3]
// print(v[3])            // se cierra: índice fuera de rango
print(v.first ?? 0)       // 1`,
      ],
    },
    {
      heading: "Dónde conviene usarlo y dónde no",
      parrafos: [
        "Swift brilla en el **mundo Apple**:",
      ],
      tabla: {
        cabeza: ["Caso", "¿Swift?", "Por qué"],
        filas: [
          ["Aplicaciones para iPhone, iPad y Mac", "Sí", "Es el lenguaje oficial, con SwiftUI y todas las APIs al día."],
          ["Apple Watch, Apple TV y Vision Pro", "Sí", "Son plataformas pensadas para Swift."],
          ["Herramientas de línea de comandos y servidores", "Posible", "Corre en Linux; el ecosistema de servidor es menor que el de Go o Java."],
          ["Aplicaciones para Android", "No", "Lo habitual es Kotlin; Swift para Android existe pero no es el camino principal."],
          ["Aplicaciones web", "No", "Se usa JavaScript o TypeScript en el navegador."],
          ["Ciencia de datos", "No", "El ecosistema está en Python."],
        ],
      },
    },
    {
      heading: "Comparación con lenguajes cercanos",
      parrafos: [
        "Cuándo conviene otro:",
      ],
      tabla: {
        cabeza: ["Lenguaje", "Elegilo en vez de Swift cuando…"],
        filas: [
          ["Kotlin", "el objetivo es Android; es muy parecido a Swift en estilo y seguridad."],
          ["Objective-C", "mantenés código antiguo de Apple que todavía lo usa."],
          ["Flutter (Dart) o React Native", "querés una sola base de código para iOS y Android."],
          ["Rust", "necesitás seguridad de memoria en sistemas de bajo nivel."],
        ],
      },
    },
    {
      heading: "Cómo seguir",
      parrafos: [
        "Hacé la ruta de Swift de la app, resolvé los proyectos y, cuando tengas la base, abrí **SwiftUI** (en Frameworks) para pasar a las interfaces.",
        "Fuera de la app, \"**The Swift Programming Language**\" es el libro oficial y gratuito, swift.org tiene guías para empezar y Apple ofrece tutoriales de SwiftUI paso a paso. Para practicar sin instalar nada necesitás Xcode en una Mac; en Linux podés usar la herramienta `swift` desde la terminal.",
      ],
    },
  ],
  fuentes: [
    { texto: "The Swift Programming Language", url: "https://docs.swift.org/swift-book/" },
    { texto: "Empezar con Swift", url: "https://www.swift.org/getting-started/" },
    { texto: "Sitio oficial de Swift", url: "https://www.swift.org/" },
  ],
  revisada: "2026-11-12",
};
