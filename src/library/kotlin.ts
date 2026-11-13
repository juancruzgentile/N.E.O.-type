import { type Topic, a, b, code, m } from "./types";
import { claseKotlin } from "./clases/kotlin";

export const kotlin: Topic = {
  id: "kotlin",
  name: "Kotlin",
  group: "Lenguajes",
  emblem: "kotlin",
  badge: "KT",
  color: "#a97bff",
  hl: "kotlin",
  summary:
    "Lenguaje de JetBrains que corre en la JVM y es compatible con todo el código Java. Es el lenguaje oficial de " +
    "Android y se usa mucho en back-end (Spring, Ktor). Distingue en el tipo lo que puede ser null y tiene corrutinas " +
    "para la concurrencia.",
  facts: [
    { label: "Archivos", value: ".kt · .kts (scripts y Gradle)" },
    { label: "Ejecutar", value: "./gradlew run" },
    { label: "Paquetes", value: "Gradle con Maven Central" },
    { label: "Versión de referencia", value: "Kotlin 2.x (compilador K2)" },
    { label: "Estilo", value: "4 espacios · camelCase · tipos en PascalCase" },
  ],
  workflow: [
    { title: "Gradle con Kotlin DSL", text: "build.gradle.kts define dependencias y tareas; el wrapper ./gradlew fija la versión de Gradle." },
    { title: "val antes que var", text: "Preferí valores inmutables y colecciones de solo lectura (List en vez de MutableList)." },
    { title: "Null en el tipo", text: "String no puede ser null y String? sí. Usá ?. y ?: en lugar de !!." },
    { title: "data class para datos", text: "Generan equals, hashCode, toString y copy. Para cambiar un campo, copy(campo = nuevo)." },
    { title: "Tests con kotlin.test o JUnit 5", text: "Se corren con ./gradlew test; en Android, también hay tests instrumentados." },
  ],
  entries: [
    b("Datos", "val, var y tipos", "val no se puede reasignar, var sí. El tipo se infiere o va después de :.", code`
val nombre = "Ana"
var edad: Int = 30
edad += 1
val precio = 19.99
val activo = true`, "variable constante tipo"),
    b("Texto", "Plantillas de texto", "$variable o \${expresión} dentro de las comillas. Las comillas triples arman bloques.", code`
val saludo = "Hola, $nombre. Tenés \${edad + 1} años el año que viene"
val sql = """
    SELECT *
    FROM usuarios
""".trimIndent()`, "string interpolacion formato"),
    b("Control de flujo", "if, when y for", "if y when son expresiones: devuelven un valor.", code`
val estado = if (nota >= 6) "aprobado" else "desaprobado"

val texto = when (nota) {
    10 -> "excelente"
    in 6..9 -> "bien"
    else -> "a recuperar"
}

for (i in 1..10 step 2) println(i)`, "condicional when bucle rango"),
    b("Funciones", "fun", "Parámetros con nombre y valores por defecto; una función de una expresión usa =.", code`
fun saludar(nombre: String, veces: Int = 1): String =
    "Hola, $nombre! ".repeat(veces)

saludar("Ana", veces = 2)`, "funcion parametro defecto"),
    b("Colecciones", "listOf y mapOf", "Las colecciones son de solo lectura; las mutables se piden explícitamente.", code`
val nombres = listOf("Ana", "Luis")
val pendientes = mutableListOf<String>()
pendientes.add("Eva")
val edades = mapOf("Ana" to 30, "Luis" to 25)
val edadEva = edades["Eva"] ?: 0`, "lista mapa coleccion"),
    b("Null", "Nulos seguros", "?. llama solo si no es null y ?: da un valor alternativo.", code`
val largo = texto?.length ?: 0
val ciudad = usuario?.direccion?.ciudad
texto?.let { println(it.uppercase()) }`, "null opcional elvis"),

    m("Clases", "data class", "Clases de datos con equals, hashCode, toString y copy generados.", code`
data class Producto(val nombre: String, val precio: Double, val stock: Int = 0)

val yerba = Producto("Yerba", 3.5)
val masCara = yerba.copy(precio = 4.0)
val (nombre, precio) = yerba`, "clase datos record copy"),
    m("Clases", "Clases y herencia", "Las clases son final por defecto: open permite heredar y override reemplazar.", code`
open class Animal(val nombre: String) {
    open fun sonido() = "..."
}

class Perro(nombre: String) : Animal(nombre) {
    override fun sonido() = "guau"
}`, "clase herencia open override"),
    m("Colecciones", "Operaciones de colección", "filter, map, sumOf, groupBy y compañía, encadenadas.", code`
val total = pedidos.filter { it.pagado }.sumOf { it.total }
val porCiudad = clientes.groupBy { it.ciudad }
val nombres = usuarios.sortedBy { it.edad }.map { it.nombre }
val (activos, inactivos) = usuarios.partition { it.activo }`, "lambda filter map coleccion"),
    m("Tipos", "sealed y when", "Una jerarquía cerrada: when sabe que cubrió todos los casos.", code`
sealed interface Resultado {
    data class Exito(val datos: String) : Resultado
    data class Error(val codigo: Int) : Resultado
}

fun mostrar(r: Resultado) = when (r) {
    is Resultado.Exito -> r.datos
    is Resultado.Error -> "falló con \${r.codigo}"
}`, "sealed jerarquia when"),
    m("Funciones", "Funciones de extensión", "Agregan métodos a un tipo existente sin heredar.", code`
fun String.capitalizarPalabras(): String =
    split(" ").joinToString(" ") { it.replaceFirstChar(Char::uppercase) }

"hola mundo".capitalizarPalabras()`, "extension metodo"),
    m("Herramientas", "Gradle", "Compila, prueba y ejecuta el proyecto.", code`
./gradlew build
./gradlew test
./gradlew run`, "build compilar gradle"),

    a("Concurrencia", "Corrutinas", "Código asíncrono que se lee como secuencial (biblioteca kotlinx.coroutines).", code`
suspend fun cargarPerfil(): Perfil = coroutineScope {
    val usuario = async { api.usuario() }
    val fotos = async { api.fotos() }
    Perfil(usuario.await(), fotos.await())
}`, "corrutina async await suspend"),
    a("Concurrencia", "Flow", "Una secuencia de valores asíncrona: se transforma como una colección y se recolecta.", code`
fun precios(): Flow<Double> = flow {
    while (true) {
        emit(api.precioActual())
        delay(1_000)
    }
}

precios().filter { it > 100 }.collect { println(it) }`, "flow stream reactivo"),
    a("Funciones", "Funciones de alcance", "let, apply, also, run y with ejecutan un bloque sobre un objeto.", code`
val usuario = Usuario().apply {
    nombre = "Ana"
    edad = 30
}
val largo = texto?.let { it.trim().length }
lista.also { println("tiene \${it.size} elementos") }`, "let apply also scope"),
    a("Tipos", "Genéricos", "Tipos parametrizados; out e in indican varianza.", code`
class Caja<T>(val contenido: T)

fun <T : Comparable<T>> mayor(a: T, b: T): T = if (a > b) a else b

val cajas: List<Caja<out Number>> = listOf(Caja(1), Caja(2.5))`, "generico varianza"),
  ],
  clase: claseKotlin,
};
