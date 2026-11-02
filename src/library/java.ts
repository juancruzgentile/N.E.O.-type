import { type Topic, a, b, code, m } from "./types";

export const java: Topic = {
  id: "java",
  name: "Java",
  group: "Lenguajes",
  emblem: "java",
  badge: "Jv",
  color: "#f89820",
  hl: "java",
  summary:
    "Lenguaje orientado a objetos, de tipado estático, que corre sobre la máquina virtual de Java (JVM). " +
    "Domina en back-end empresarial (Spring), Android y sistemas grandes que necesitan estabilidad a largo plazo.",
  facts: [
    { label: "Archivos", value: ".java (una clase pública por archivo)" },
    { label: "Ejecutar", value: "java Main.java · javac + java" },
    { label: "Build", value: "Maven · Gradle" },
    { label: "Versión de referencia", value: "Java 25 LTS" },
    { label: "Estilo", value: "4 espacios · camelCase · PascalCase para clases" },
  ],
  workflow: [
    { title: "Proyecto con Maven o Gradle", text: "Manejan dependencias, compilación y tests. Estructura estándar: src/main/java para el código y src/test/java para las pruebas." },
    { title: "Usar una versión LTS", text: "Elegí una versión con soporte extendido (21 o 25) para producción y fijala en el build." },
    { title: "Records e inmutabilidad", text: "Para datos, records en lugar de clases con getters/setters. Campos final siempre que se pueda." },
    { title: "Tests con JUnit", text: "JUnit Jupiter con @Test y aserciones; mvn test o gradle test los corren." },
    { title: "Formato consistente", text: "Un formateador (google-java-format o el del IDE) y un linter (Checkstyle, SpotBugs) evitan discusiones de estilo." },
  ],
  entries: [
    b("Estructura", "public static void main", "Punto de entrada del programa. Desde Java 25 un archivo puede tener solo un void main() suelto.", code`
public class Main {
    public static void main(String[] args) {
        System.out.println("Hola, mundo");
    }
}`, "main inicio programa"),
    b("Datos", "Tipos y variables", "Primitivos (int, long, double, boolean, char) y referencias (String, clases). var infiere el tipo local.", code`
int edad = 30;
double precio = 9.99;
boolean activo = true;
String nombre = "Ana";
var lista = new ArrayList<String>();`, "variable tipo primitivo var"),
    b("Entrada y salida", "System.out.println / printf", "Imprime en consola; printf formatea con %d, %s, %.2f y %n para el salto de línea.", code`
System.out.println("Total: " + total);
System.out.printf("%s tiene %d años%n", nombre, edad);
System.out.printf("%.2f%n", precio);`, "imprimir formato"),
    b("Control de flujo", "if / else y switch", "Condicionales. El switch con flechas devuelve un valor y no necesita break.", code`
String tipo = switch (dia) {
    case SABADO, DOMINGO -> "fin de semana";
    default -> "laborable";
};`, "condicional switch expression"),
    b("Control de flujo", "for y for-each", "for clásico con índice y for-each para recorrer colecciones.", code`
for (int i = 0; i < 5; i++) {
    System.out.println(i);
}
for (String nombre : nombres) {
    System.out.println(nombre);
}`, "bucle loop"),
    b("Clases", "Clases y objetos", "Una clase define atributos y métodos; new crea instancias. this es el objeto actual.", code`
public class Cuenta {
    private double saldo;

    public void depositar(double monto) {
        this.saldo += monto;
    }

    public double getSaldo() {
        return saldo;
    }
}`, "clase objeto poo metodo"),
    b("Texto", "String", "Inmutable. equals compara contenido (== compara referencias). Métodos comunes: length, substring, split, trim.", code`
"Hola".equals(saludo);
nombre.toUpperCase();
"a,b,c".split(",");
String.join("-", partes);
"""
Texto
multilínea
""";`, "cadena texto equals"),

    m("Colecciones", "List, Map y Set", "Interfaces de colecciones. List.of y Map.of crean colecciones inmutables.", code`
List<String> nombres = new ArrayList<>();
nombres.add("Ana");
Map<String, Integer> edades = new HashMap<>();
edades.put("Ana", 30);
edades.getOrDefault("Luis", 0);
Set<String> unicos = new HashSet<>(nombres);`, "lista mapa conjunto coleccion"),
    m("Clases", "record", "Clase de datos inmutable: genera constructor, accesores, equals, hashCode y toString.", code`
public record Punto(int x, int y) {
    public Punto {
        if (x < 0) throw new IllegalArgumentException("x negativo");
    }
}
var p = new Punto(1, 2);
p.x();`, "registro datos inmutable"),
    m("Clases", "interface y herencia", "Una interface define un contrato; implements lo cumple. extends hereda de una clase.", code`
interface Forma {
    double area();
}
record Circulo(double r) implements Forma {
    public double area() { return Math.PI * r * r; }
}`, "interfaz implementar heredar"),
    m("Clases", "enum", "Conjunto fijo de constantes, que pueden tener datos y métodos.", code`
enum Prioridad {
    ALTA(1), MEDIA(2), BAJA(3);
    final int peso;
    Prioridad(int peso) { this.peso = peso; }
}`, "enumeracion constantes"),
    m("Errores", "try / catch / finally", "Maneja excepciones. try-with-resources cierra solo lo que se abrió.", code`
try (var lector = Files.newBufferedReader(Path.of("datos.txt"))) {
    lector.lines().forEach(System.out::println);
} catch (IOException e) {
    System.err.println("No se pudo leer: " + e.getMessage());
}`, "excepcion error recursos"),
    m("Funcional", "Lambdas y Streams", "Procesan colecciones de forma declarativa: filter, map, sorted y collect.", code`
List<String> activos = usuarios.stream()
        .filter(Usuario::activo)
        .map(Usuario::nombre)
        .sorted()
        .toList();`, "stream lambda funcional"),
    m("Funcional", "Optional", "Representa un valor que puede faltar, sin usar null.", code`
Optional<Usuario> u = repo.buscar(id);
String nombre = u.map(Usuario::nombre).orElse("anónimo");
u.ifPresent(x -> System.out.println(x));`, "nulo opcional null"),

    a("Genéricos", "Genéricos", "Clases y métodos parametrizados por tipo. Los comodines (? extends) dan flexibilidad.", code`
public static <T extends Comparable<T>> T mayor(List<T> lista) {
    return lista.stream().max(Comparator.naturalOrder()).orElseThrow();
}`, "generics tipos parametrizados"),
    a("Clases", "sealed y pattern matching", "sealed limita quién puede implementar una interfaz; el switch con patrones desarma cada caso sin casts.", code`
sealed interface Forma permits Circulo, Rect {}
record Circulo(double r) implements Forma {}
record Rect(double w, double h) implements Forma {}

double area(Forma f) {
    return switch (f) {
        case Circulo c -> Math.PI * c.r() * c.r();
        case Rect(double w, double h) -> w * h;
    };
}`, "sellada patrones switch"),
    a("Concurrencia", "Virtual threads", "Hilos livianos de la JVM: miles de tareas concurrentes con código bloqueante simple.", code`
try (var exec = Executors.newVirtualThreadPerTaskExecutor()) {
    for (var url : urls) {
        exec.submit(() -> descargar(url));
    }
}`, "hilos concurrencia threads"),
    a("Funcional", "Collectors", "Agrupan, cuentan y resumen streams.", code`
Map<String, Long> porCiudad = usuarios.stream()
        .collect(Collectors.groupingBy(Usuario::ciudad, Collectors.counting()));
String csv = nombres.stream().collect(Collectors.joining(","));`, "agrupar groupingBy"),
    a("Build", "Maven y Gradle", "Compilan, prueban y empaquetan. Los comandos más usados:", code`
mvn package          # compila, testea y genera el .jar
mvn test
gradle build
gradle test
java -jar target/app.jar`, "build dependencias jar"),
    a("Calidad", "JUnit", "Tests unitarios con @Test y aserciones.", code`
class CalculadoraTest {
    @Test
    void sumaDosNumeros() {
        assertEquals(5, new Calculadora().sumar(2, 3));
    }

    @Test
    void dividirPorCeroFalla() {
        assertThrows(ArithmeticException.class, () -> 1 / 0);
    }
}`, "test prueba junit"),
  ],
};
