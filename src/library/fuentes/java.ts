import type { FuentesTema } from "./tipos";

const T = "https://docs.oracle.com/javase/tutorial/";
const A = "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/";
export const java: FuentesTema = {
  version: "Java 25 (LTS)",
  entradas: {
    "public static void main": [T + "getStarted/application/index.html"],
    "Tipos y variables": [T + "java/nutsandbolts/variables.html"],
    "System.out.println / printf": [A + "io/PrintStream.html"],
    "if / else y switch": [T + "java/nutsandbolts/flow.html"],
    "for y for-each": [T + "java/nutsandbolts/for.html"],
    "Clases y objetos": [T + "java/javaOO/index.html"],
    "String": [A + "lang/String.html"],
    "List, Map y Set": [T + "collections/index.html"],
    "record": ["https://dev.java/learn/records/", "Java 16"],
    "interface y herencia": [T + "java/IandI/index.html"],
    "enum": [T + "java/javaOO/enum.html"],
    "try / catch / finally": [T + "essential/exceptions/index.html"],
    "Lambdas y Streams": ["https://dev.java/learn/api/streams/", "Java 8"],
    "Optional": [A + "util/Optional.html", "Java 8"],
    "Genéricos": [T + "java/generics/index.html"],
    "sealed y pattern matching": ["https://docs.oracle.com/en/java/javase/21/language/pattern-matching.html", "Java 21"],
    "Virtual threads": ["https://docs.oracle.com/en/java/javase/21/core/virtual-threads.html", "Java 21"],
    "Collectors": [A + "util/stream/Collectors.html", "Java 8"],
    "Maven y Gradle": ["https://maven.apache.org/guides/getting-started/"],
    "JUnit": ["https://docs.junit.org/current/user-guide/", "JUnit 5"],
  },
};
