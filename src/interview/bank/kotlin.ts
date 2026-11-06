import { area, er, op } from "./crear";

const K = "https://kotlinlang.org/docs/";
export const kotlin = area("kotlin", [
  op("j", "¿Qué diferencia hay entre `val` y `var` en Kotlin?",
    ["val no se puede reasignar; var sí", "val es para números y var para texto", "var es de solo lectura", "No hay diferencia"],
    "Se recomienda val por defecto: facilita razonar sobre el código.", K + "basic-syntax.html#variables"),
  op("j", "¿Qué diferencia hay entre `String` y `String?`?",
    ["String nunca es null; String? puede serlo y hay que tratarlo con cuidado", "String? nunca puede ser null y String sí puede serlo en cualquier momento", "String? es más rápido que String porque el compilador no comprueba su valor", "String? no se puede imprimir y hay que convertirlo antes a otro tipo"],
    "El sistema de tipos separa lo que puede ser null de lo que no, y evita muchos NullPointerException.", K + "null-safety.html"),
  er("j", `val s: String = null`, ["String no admite null: haría falta String?", "val no admite anotación de tipo", "Falta el punto y coma", "null se escribe NULL"],
    "Para permitir null hay que declarar el tipo con signo de pregunta.", K + "null-safety.html", "kotlin"),
  op("s", "¿Qué genera una `data class`?",
    ["equals, hashCode, toString, copy y componentes a partir de las propiedades del constructor", "Una base de datos en memoria con tablas y consultas ya definidas", "Una clase que no se puede instanciar y solo sirve para heredar de ella", "Una clase con un solo método que no recibe parámetros ni devuelve nada"],
    "data class Usuario(val nombre: String, val edad: Int) es una línea que reemplaza mucho código repetido.", K + "data-classes.html"),
  op("s", "¿Qué hacen los operadores `?.` y `?:`?",
    ["?. llama solo si no es null y ?: da un valor por defecto si es null", "?. convierte el valor a texto y ?: compara dos valores sin convertir sus tipos", "?. lanza una excepción si el valor es null y ?: la captura en seguida", "Los dos son iguales y sirven para comprobar si dos variables valen lo mismo"],
    "nombre?.length ?: 0 devuelve 0 si nombre es null.", K + "null-safety.html#safe-call-operator"),
  op("s", "¿En qué se parece `when` a un `switch`?",
    ["Elige entre casos, pero es una expresión que devuelve un valor y admite condiciones, rangos y tipos", "Es igual al switch de Java: solo compara números enteros y no devuelve ningún valor", "Solo funciona con enumeraciones y no admite condiciones, rangos ni tipos de datos", "Es un bucle que repite un bloque mientras se cumple una condición de entrada"],
    "Con una sealed class o un enum, el compilador exige cubrir todos los casos.", K + "control-flow.html#kotlin-conditions-when-statement"),
  op("x", "¿Qué son las corrutinas de Kotlin?",
    ["Tareas livianas que se pueden suspender sin bloquear el hilo", "Hilos del sistema operativo que se crean uno por cada tarea del programa", "Funciones que no devuelven ningún valor y se ejecutan siempre al inicio", "Un tipo de colección que guarda los resultados de tareas en segundo plano"],
    "Con suspend fun y launch/async se escribe código asincrónico que se lee como código secuencial.", K + "coroutines-overview.html"),
  op("x", "¿Para qué sirve una `sealed class`?",
    ["Para definir un conjunto cerrado de subtipos, así un when puede comprobar que cubre todos los casos", "Para evitar que se creen objetos de la clase y que solo se use como plantilla, de modo que ninguna otra clase pueda heredar de ella ni extenderla", "Para guardar constantes que no cambian durante la ejecución del programa", "Para hacer que una clase sea privada y solo se pueda usar en su archivo"],
    "Es ideal para modelar estados: Cargando, Éxito, Error.", K + "sealed-classes.html"),
]);
