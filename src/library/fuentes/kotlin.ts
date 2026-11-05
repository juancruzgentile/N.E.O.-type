import type { FuentesTema } from "./tipos";

const K = "https://kotlinlang.org/docs/";
export const kotlin: FuentesTema = {
  version: "Kotlin 2.x (compilador K2)",
  entradas: {
    "val, var y tipos": [K + "basic-syntax.html#variables"],
    "Plantillas de texto": [K + "strings.html#string-templates"],
    "if, when y for": [K + "control-flow.html"],
    "fun": [K + "functions.html"],
    "listOf y mapOf": [K + "collections-overview.html"],
    "Nulos seguros": [K + "null-safety.html"],
    "data class": [K + "data-classes.html"],
    "Clases y herencia": [K + "inheritance.html"],
    "Operaciones de colección": [K + "collection-operations.html"],
    "sealed y when": [K + "sealed-classes.html"],
    "Funciones de extensión": [K + "extensions.html"],
    "Gradle": [K + "gradle-configure-project.html"],
    "Corrutinas": [K + "coroutines-guide.html", "Kotlin 1.3"],
    "Flow": [K + "flow.html", "Kotlin 1.3"],
    "Funciones de alcance": [K + "scope-functions.html"],
    "Genéricos": [K + "generics.html"],
  },
};
