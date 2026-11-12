import { type Clase, code } from "../types";

export const claseKotlin: Clase = {
  titulo: "Kotlin de cero: Java sin la ceremonia y con null bajo control",
  bajada:
    "La referencia rápida está en la otra pestaña. Esta es la clase completa: qué es Kotlin y por qué Android lo adoptó, cómo corre, tu primer programa, " +
    "los conceptos base (null seguro, data class, corrutinas), los errores típicos y cuándo conviene.",
  secciones: [
    {
      heading: "Qué es y qué problema resuelve",
      parrafos: [
        "Kotlin es un lenguaje de programación moderno, de tipado estático, creado por JetBrains (la empresa de IntelliJ y Android Studio). Se usa sobre todo para aplicaciones Android y para back-end en la JVM (con Spring o Ktor), y también para compartir código entre plataformas con Kotlin Multiplatform. Es 100% interoperable con Java: podés usar cualquier biblioteca de Java y mezclar los dos lenguajes en el mismo proyecto.",
        "El problema que resuelve es el de la verbosidad y los errores clásicos de Java. Lo que en Java lleva una clase de cincuenta líneas, en Kotlin se escribe en una. Y el error más famoso de la programación, la referencia nula (el NullPointerException), se vuelve una parte del sistema de tipos: el compilador distingue un texto que nunca es null de uno que puede serlo, y te obliga a manejar la diferencia.",
      ],
    },
    {
      heading: "Historia corta",
      parrafos: [
        "JetBrains lo presentó en 2011 y publicó la versión 1.0 en febrero de 2016. Su nombre viene de la isla Kotlin, cerca de San Petersburgo. El gran impulso llegó en mayo de 2017, cuando Google lo anunció como lenguaje oficial para Android, y en 2019 Android pasó a ser \"Kotlin primero\": las novedades y la documentación se escriben primero para Kotlin.",
      ],
      lista: [
        "Las corrutinas (2018) trajeron una forma simple de escribir código asíncrono.",
        "Kotlin Multiplatform permite compartir lógica entre Android, iOS, escritorio y web.",
        "Kotlin 2.0 (2024) estrenó el compilador K2, más rápido y que mejora el análisis de tipos.",
        "El lenguaje lo mantiene JetBrains con una fundación y una comunidad abierta, bajo licencia Apache 2.0.",
      ],
    },
    {
      heading: "Cómo funciona por dentro",
      parrafos: [
        "En la JVM, el compilador de Kotlin genera el mismo bytecode que Java, y por eso corre en cualquier sistema con una JVM y puede llamar a código Java sin pegamento. Para otras plataformas, el mismo lenguaje se compila a JavaScript, a WebAssembly o a código nativo (para iOS, por ejemplo). Por eso un proyecto de Android se construye con Gradle como uno de Java.",
        "Las corrutinas son el mecanismo de concurrencia. Una función marcada como suspend puede pausarse (por ejemplo, mientras espera la red) sin bloquear el hilo y retomarse después. A diferencia de un hilo, una corrutina cuesta muy poco, así que podés lanzar miles. La idea es la misma que async y await de otros lenguajes, pero escrita como si fuera código común, de arriba hacia abajo.",
      ],
    },
    {
      heading: "Tu primer programa, paso a paso",
      parrafos: [
        "Con un proyecto de Gradle (./gradlew run) o con el compilador (kotlinc saludo.kt -include-runtime -d saludo.jar y java -jar saludo.jar Ana 2), este es el archivo saludo.kt.",
      ],
      codigo: [
        code`
fun main(args: Array<String>) {
    val nombre = args.getOrElse(0) { "mundo" }
    val veces = args.getOrNull(1)?.toIntOrNull() ?: 1

    for (i in 1..veces) {
        println("$i. Hola, $nombre")
    }
}`,
      ],
    },
    {
      heading: "Qué hace cada línea",
      parrafos: [
        "fun declara una función y main es el punto de entrada. val declara un valor que no se reasigna (var uno que sí). El tipo se infiere. getOrElse devuelve el argumento si existe o el valor por defecto del bloque; getOrNull devuelve null si no hay segundo argumento, ?. sigue solo si no es null, toIntOrNull convierte sin lanzar una excepción, y el operador ?: (\"elvis\") usa el valor de la derecha cuando el de la izquierda es null.",
        "1..veces es un rango que incluye el final, y el signo $ dentro de un texto inserta una variable. No hay punto y coma. Con Ana y 2 imprime \"1. Hola, Ana\" y \"2. Hola, Ana\".",
      ],
    },
    {
      heading: "Los cinco conceptos que sostienen todo lo demás",
      parrafos: [
        "Con estos cinco leés casi cualquier código Kotlin:",
      ],
      lista: [
        "Null seguro: String no admite null y String? sí; usás ?. y ?: para trabajar con lo opcional.",
        "Data class: una clase de datos con equals, toString y copy generados automáticamente.",
        "Colecciones y lambdas: filter, map, groupBy… se encadenan con funciones sin nombre.",
        "Funciones de extensión y when: agregás funciones a tipos existentes, y when es un switch que devuelve un valor.",
        "Corrutinas: suspend, launch y async para el código asíncrono.",
      ],
      codigo: [
        code`
data class Libro(val titulo: String, val paginas: Int)   // equals, toString y copy gratis

val libros = listOf(Libro("Dune", 600), Libro("Emma", 300))
val largos = libros.filter { it.paginas > 400 }.map { it.titulo }   // [Dune]

val nota: String? = null
println(nota?.length ?: 0)                 // 0

fun String.gritar() = uppercase() + "!"    // función de extensión
println("hola".gritar())                   // HOLA!

val tipo = when (libros.size) { 0 -> "vacío"; 1 -> "uno"; else -> "varios" }

suspend fun cargar(): String {             // corrutina (necesita kotlinx.coroutines)
    delay(1000)
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
        "Abusar de !!: fuerza el valor y lanza NullPointerException si es null. Usá ?., ?: o let.",
        "Creer que val es inmutable en profundidad: la referencia no cambia, pero una lista mutable adentro sí puede cambiar.",
        "Confundir == con ===: == compara el contenido (equals), === la identidad.",
        "Lanzar corrutinas con GlobalScope: no se cancelan con la pantalla y filtran memoria. Usá el alcance del ciclo de vida o de la aplicación.",
        "Desbordar un entero sin darte cuenta: Int.MAX_VALUE + 1 da la vuelta, como en Java.",
      ],
      codigo: [
        code`
val lista = mutableListOf(1, 2)
val otra = lista             // misma lista, otro nombre
otra.add(3)
println(lista)               // [1, 2, 3]: val no vuelve inmutable el contenido

val x: String? = null
// println(x!!.length)       // NullPointerException
println(Int.MAX_VALUE + 1)   // -2147483648: da la vuelta sin avisar`,
      ],
    },
    {
      heading: "Dónde conviene usarlo y dónde no",
      parrafos: [
        "Kotlin tiene dos hogares claros:",
      ],
      tabla: {
        cabeza: ["Caso", "¿Kotlin?", "Por qué"],
        filas: [
          ["Aplicaciones Android", "Sí", "Es el lenguaje preferido de Google, con Jetpack Compose para las interfaces."],
          ["Back-end en la JVM (Spring, Ktor)", "Sí", "Menos código que Java y el mismo ecosistema."],
          ["Compartir lógica entre Android e iOS", "Sí", "Kotlin Multiplatform."],
          ["Scripts rápidos", "Con cuidado", "Hay que compilar y arrancar la JVM; Python es más ágil."],
          ["Aplicaciones solo para iPhone", "No", "Swift es el camino natural."],
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
        cabeza: ["Lenguaje", "Elegilo en vez de Kotlin cuando…"],
        filas: [
          ["Java", "tu equipo y tu código son todos de Java y no querés mezclar."],
          ["Swift", "el objetivo es iOS; el estilo es muy parecido."],
          ["Dart (Flutter)", "querés una sola base de código para móviles con una interfaz propia."],
          ["TypeScript", "ya trabajás todo en JavaScript."],
        ],
      },
    },
    {
      heading: "Cómo seguir",
      parrafos: [
        "Hacé la ruta de Kotlin de la app, resolvé los proyectos y, cuando tengas la base, abrí Jetpack Compose (en Frameworks) para pasar a las interfaces de Android.",
        "Fuera de la app, kotlinlang.org tiene la documentación oficial, un recorrido interactivo (Kotlin Koans) y la guía de corrutinas. Para Android, la guía de desarrolladores de Google explica la parte de la plataforma.",
      ],
    },
  ],
  fuentes: [
    { texto: "Documentación de Kotlin", url: "https://kotlinlang.org/docs/home.html" },
    { texto: "Primeros pasos con Kotlin", url: "https://kotlinlang.org/docs/getting-started.html" },
    { texto: "Kotlin en Android", url: "https://developer.android.com/kotlin" },
  ],
  revisada: "2026-11-12",
};
