import { type Clase, code } from "../types";

export const claseSwiftui: Clase = {
  titulo: "SwiftUI de cero: interfaces de Apple descritas en vez de armadas",
  bajada:
    "La referencia rápida está en la otra pestaña. Esta es la clase completa: qué es SwiftUI y cómo piensa una interfaz declarativa, tu primera pantalla, " +
    "los conceptos base (vistas, modificadores y estado), los errores clásicos y cuándo conviene.",
  secciones: [
    {
      heading: "Qué es y qué problema resuelve",
      parrafos: [
        "SwiftUI es el framework de Apple para construir interfaces de usuario en iPhone, iPad, Mac, Apple Watch, Apple TV y Vision Pro, con el lenguaje Swift. En vez de crear botones y vistas paso a paso y ocuparte de actualizarlos, describís cómo debe verse la pantalla según el estado actual, y el sistema se encarga de dibujarla y de actualizarla cuando el estado cambia.",
        "El problema que resuelve es el de la complejidad de las interfaces tradicionales (UIKit y AppKit), donde había que sincronizar a mano lo que se ve con los datos, y era fácil que quedaran desfasados. Además, con un solo código y pocos cambios, la misma interfaz sirve para todas las plataformas de Apple.",
      ],
    },
    {
      heading: "Historia corta",
      parrafos: [
        "Apple lo presentó en la conferencia de desarrolladores de 2019, con iOS 13. Las primeras versiones tenían muchas limitaciones y se usaban en combinación con UIKit; con los años fue ganando funciones hasta ser la forma recomendada de crear aplicaciones nuevas.",
      ],
      lista: [
        "2022 (iOS 16): NavigationStack, una navegación mucho más flexible.",
        "2023 (iOS 17): la macro @Observable simplifica el manejo de modelos de datos.",
        "Las vistas previas (#Preview) muestran el resultado en Xcode mientras escribís.",
        "Se puede mezclar con UIKit: una vista de UIKit dentro de SwiftUI y al revés.",
      ],
    },
    {
      heading: "Cómo funciona por dentro",
      parrafos: [
        "Una vista en SwiftUI es una struct que cumple el protocolo View y tiene una propiedad body que describe su contenido. Esa struct es solo una descripción liviana, no la vista en pantalla: se crea y se destruye todo el tiempo, y es barato hacerlo. Lo que dura es el estado, que SwiftUI guarda aparte.",
        "Cuando el estado cambia, SwiftUI vuelve a pedir el body de las vistas que dependen de él, compara el resultado con el anterior y actualiza en pantalla solo las diferencias. Eso tiene una regla práctica: el body debe ser rápido y no tener efectos secundarios. El trabajo pesado va en otro lado, no adentro del body.",
      ],
    },
    {
      heading: "Tu primera pantalla, paso a paso",
      parrafos: [
        "En Xcode, creá un proyecto nuevo (App, interfaz SwiftUI) y reemplazá el contenido de ContentView.swift por esto. La vista previa aparece a la derecha.",
      ],
      codigo: [
        code`
import SwiftUI

struct Saludo: View {
    let nombre: String
    @State private var veces = 0

    var body: some View {
        VStack(spacing: 12) {
            Text("Hola, \(nombre)")
                .font(.title)
            Button("Clics: \(veces)") {
                veces += 1
            }
        }
        .padding()
    }
}

#Preview {
    Saludo(nombre: "Ana")
}`,
      ],
    },
    {
      heading: "Qué hace cada parte",
      parrafos: [
        "Saludo es una vista; body devuelve some View, es decir, \"algún tipo de vista\". VStack apila sus hijos en vertical. Text y Button son vistas básicas. Los métodos encadenados (.font, .padding) se llaman modificadores: cada uno devuelve una vista nueva que envuelve a la anterior.",
        "@State declara un dato que pertenece a la vista y que SwiftUI conserva entre una descripción y la siguiente. Cuando el botón hace veces += 1, SwiftUI se entera del cambio, vuelve a evaluar el body y actualiza el texto del botón. Nunca modificás la pantalla directamente.",
      ],
    },
    {
      heading: "Los cinco conceptos que sostienen todo lo demás",
      parrafos: [
        "Con estos cinco leés casi cualquier código SwiftUI:",
      ],
      lista: [
        "Vistas y contenedores: Text, Image, Button; VStack, HStack, ZStack, List y ForEach para combinarlas.",
        "Modificadores: cambian aspecto y comportamiento, y el orden en que los escribís importa.",
        "Estado: @State (el dato es de esta vista), @Binding (una referencia a un estado de otra vista) y @Observable para modelos compartidos.",
        "Navegación: NavigationStack con NavigationLink, y sheets para presentar pantallas encima.",
        "Datos y ciclo de vida: .task para lanzar trabajo asíncrono cuando la vista aparece.",
      ],
      codigo: [
        code`
struct Contador: View {
    @Binding var valor: Int                     // el dueño del dato está en otra vista

    var body: some View {
        Stepper("Cantidad: \(valor)", value: $valor)
    }
}

@Observable
class Estante {                                 // modelo compartido
    var libros: [String] = []
}

struct Pantalla: View {
    @State private var estante = Estante()

    var body: some View {
        NavigationStack {
            List(estante.libros, id: \.self) { titulo in
                NavigationLink(titulo) { Text(titulo) }
            }
            .task { estante.libros = ["Dune", "Emma"] }
        }
    }
}`,
      ],
    },
    {
      heading: "Errores que comete casi todo el mundo",
      parrafos: [
        "Los más repetidos:",
      ],
      lista: [
        "No saber que el orden de los modificadores cambia el resultado: .padding().background() no es lo mismo que .background().padding().",
        "Usar @State para datos compartidos entre pantallas: cada vista tendría su copia. Usá un modelo @Observable.",
        "Hacer trabajo pesado dentro del body: se vuelve a ejecutar muchas veces. Sacalo a una función, un modelo o un .task.",
        "ForEach con identificadores que cambian o se repiten: SwiftUI confunde los elementos y animaciones o estados salen mal. Usá un id estable.",
        "Cambiar el estado desde un hilo de fondo: provoca advertencias o comportamientos raros. Las actualizaciones de la interfaz van en el hilo principal (@MainActor).",
      ],
      codigo: [
        code`
Text("Hola").padding().background(.yellow)   // el fondo incluye el espacio
Text("Hola").background(.yellow).padding()   // el fondo solo detrás del texto`,
      ],
    },
    {
      heading: "Dónde conviene usarlo y dónde no",
      parrafos: [
        "SwiftUI es la opción recomendada para el ecosistema Apple:",
      ],
      tabla: {
        cabeza: ["Caso", "¿SwiftUI?", "Por qué"],
        filas: [
          ["Aplicaciones nuevas para iPhone, iPad y Mac", "Sí", "Es la forma recomendada y la que más evoluciona."],
          ["Apple Watch y widgets", "Sí", "Se construyen casi solo con SwiftUI."],
          ["Compartir interfaz entre plataformas Apple", "Sí", "Un código se adapta a cada pantalla."],
          ["Interfaces con controles muy específicos o muy viejos", "Con UIKit", "Hay cosas que SwiftUI todavía no cubre o que están más maduras en UIKit."],
          ["Aplicaciones que además tienen que correr en Android", "No", "SwiftUI es solo de Apple."],
          ["Soportar iOS muy antiguos", "Con cuidado", "Muchas funciones exigen versiones recientes del sistema."],
        ],
      },
    },
    {
      heading: "Comparación con alternativas",
      parrafos: [
        "Cuándo conviene otra cosa:",
      ],
      tabla: {
        cabeza: ["Alternativa", "Elegila en vez de SwiftUI cuando…"],
        filas: [
          ["UIKit", "mantenés una aplicación existente o necesitás un control que SwiftUI no ofrece."],
          ["Jetpack Compose", "el objetivo es Android; la idea es casi idéntica."],
          ["Flutter o React Native", "querés una sola base de código para iOS y Android."],
        ],
      },
    },
    {
      heading: "Cómo seguir",
      parrafos: [
        "Hacé primero la ruta de Swift y los proyectos de la app; después usá la pestaña Referencia para recordar la sintaxis de las vistas.",
        "Fuera de la app, los tutoriales oficiales de Apple (\"Develop in Swift\" y los de SwiftUI) son la mejor guía, paso a paso y con vistas previas. Necesitás Xcode, que corre en una Mac.",
      ],
    },
  ],
  fuentes: [
    { texto: "Tutoriales de SwiftUI (Apple)", url: "https://developer.apple.com/tutorials/swiftui" },
    { texto: "Documentación de SwiftUI", url: "https://developer.apple.com/documentation/swiftui" },
    { texto: "Develop in Swift", url: "https://developer.apple.com/tutorials/develop-in-swift/" },
  ],
  revisada: "2026-11-12",
};
