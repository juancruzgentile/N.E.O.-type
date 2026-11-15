import { type Clase, code } from "../types";

export const claseJava: Clase = {
  titulo: "Java de cero: tipado, objetos y una máquina virtual que corre en todos lados",
  bajada:
    "La referencia rápida está en la otra pestaña. Esta es la clase completa: de dónde viene Java, qué pasa entre el código fuente y el programa corriendo, " +
    "tu primer programa, los conceptos base, los errores típicos y en qué proyectos conviene.",
  secciones: [
    {
      heading: "Qué es y qué problema resuelve",
      parrafos: [
        "Java es un lenguaje de programación de **tipado estático** y **orientado a objetos**: cada variable tiene un tipo que se declara y se comprueba antes de ejecutar, y el código se organiza en clases. Se compila a un formato intermedio (bytecode) que corre sobre la **Máquina Virtual de Java (JVM)**.",
        "El problema que resolvió en los años noventa fue el de **portabilidad**: antes, un programa compilado para un sistema no corría en otro. Con Java, el mismo bytecode corre en cualquier sistema que tenga una JVM (la idea se resumía como \"escribilo una vez, corré donde sea\"). Hoy se usa sobre todo en sistemas empresariales y back-end de gran escala, en Android (junto con Kotlin) y en procesamiento de datos.",
        "Su punto fuerte es la estabilidad: el código escrito hace años sigue compilando, y hay un ecosistema enorme de bibliotecas y herramientas.",
      ],
    },
    {
      heading: "Historia corta",
      parrafos: [
        "Lo diseñó un equipo de Sun Microsystems liderado por **James Gosling** a principios de los noventa; al principio se llamaba Oak. Sun lo presentó públicamente en 1995. En 2010 Oracle compró Sun y heredó Java; Gosling dejó Oracle ese mismo año.",
        "Hoy Java se desarrolla como un proyecto abierto, **OpenJDK**, y hay varias distribuciones gratuitas del mismo código.",
      ],
      lista: [
        "Desde 2018 (Java 10), sale una **versión nueva cada seis meses**. Algunas son de **soporte largo (LTS)** y las empresas se quedan en ellas: Java 8, 11, 17, 21 y 25.",
        "Java 8 (2014) sumó las expresiones lambda y los streams, que cambiaron cómo se escribe el código.",
        "Java 16 sumó los records, clases de datos inmutables de una sola línea.",
        "Java 21 sumó los hilos virtuales, que hacen barato manejar miles de tareas esperando a la vez.",
      ],
    },
    {
      heading: "Cómo funciona por dentro",
      parrafos: [
        "El camino de un programa Java tiene tres pasos. El compilador (`javac`) traduce el código fuente (`.java`) a bytecode (`.class`). La JVM carga ese bytecode, lo verifica y empieza a ejecutarlo con un intérprete. Mientras corre, el **compilador JIT** (just in time) detecta las partes que se ejecutan más veces y las convierte en código de máquina optimizado. Por eso un programa Java **arranca más lento de lo que termina corriendo**: necesita \"calentarse\".",
        "La memoria la administra la JVM. Los objetos viven en el **heap** (montón) y cada hilo tiene su pila (stack) con las variables locales. El **recolector de basura** (garbage collector) libera solo los objetos que ya nadie usa; nunca liberás memoria a mano. Los tipos primitivos (`int`, `double`, `boolean`…) guardan el valor directamente; todo lo demás es una referencia a un objeto.",
        "Con `java Archivo.java` la JVM compila y corre un archivo suelto en un solo paso, ideal para aprender. En un proyecto real se usa una herramienta de construcción (Maven o Gradle).",
      ],
    },
    {
      heading: "Tu primer programa, paso a paso",
      parrafos: [
        "Creá un archivo `Saludo.java` (el **nombre tiene que coincidir con la clase pública**) y corrélo con `java Saludo.java Ana 2`.",
      ],
      codigo: [
        code`
public class Saludo {
    public static void main(String[] args) {
        String nombre = args.length > 0 ? args[0] : "mundo";
        int veces = args.length > 1 ? Integer.parseInt(args[1]) : 1;

        for (int i = 1; i <= veces; i++) {
            System.out.println(i + ". Hola, " + nombre);
        }
    }
}`,
      ],
    },
    {
      heading: "Qué hace cada línea",
      parrafos: [
        "En Java **todo código vive dentro de una clase**. `main` es el **punto de entrada**: la JVM busca un método con exactamente esa firma (`public static void main(String[] args)`). `args` son los argumentos de la línea de comandos, y es un arreglo de textos.",
        "Como Java es de tipado estático, **cada variable declara su tipo** (`String`, `int`). La expresión con `?` es un condicional corto: si hay argumento, lo usa; si no, toma un valor por defecto. `Integer.parseInt` convierte el texto del segundo argumento en un número y **lanza una excepción** si no lo es. Con los datos Ana y 2 imprime \"1. Hola, Ana\" y \"2. Hola, Ana\".",
      ],
    },
    {
      heading: "Los cinco conceptos que sostienen todo lo demás",
      parrafos: [
        "Con estos cinco entendés casi cualquier código Java:",
      ],
      lista: [
        "**Clases y objetos**: la clase es el molde; el objeto es una instancia. Un `record` es una clase de datos inmutable.",
        "**Primitivos y referencias**: `int` guarda un valor; `String` o `Libro` guardan una referencia a un objeto.",
        "**Colecciones y genéricos**: `List<Libro>`, `Map<String, Integer>`… el tipo entre `< >` evita mezclar datos.",
        "**Interfaces y polimorfismo**: una interfaz define qué se puede hacer, y varias clases lo implementan de formas distintas.",
        "**Excepciones**: los errores se lanzan (`throw`) y se atrapan (`try` / `catch`). Las comprobadas (checked) obligan a declararlas o atraparlas.",
      ],
      codigo: [
        code`
import java.util.*;

public class Conceptos {
    record Libro(String titulo, int paginas) {}     // clase de datos inmutable

    interface Descuento { double aplicar(double precio); }

    public static void main(String[] args) {
        int paginas = 300;                          // primitivo: guarda el valor
        Libro libro = new Libro("Dune", paginas);   // referencia: apunta a un objeto

        List<Libro> estante = new ArrayList<>();    // colección con genéricos
        estante.add(libro);

        Descuento mitad = precio -> precio / 2;     // una interfaz con un método admite lambda
        System.out.println(mitad.aplicar(20.0));    // 10.0

        try {
            Integer.parseInt("abc");
        } catch (NumberFormatException e) {         // excepción sin chequear
            System.out.println("No es un número: " + e.getMessage());
        }
    }
}`,
      ],
    },
    {
      heading: "Errores que comete casi todo el mundo",
      parrafos: [
        "Los que más se repiten:",
      ],
      lista: [
        "Comparar textos con `==`: compara si son **el mismo objeto**, no si **dicen lo mismo**. Usá `equals()`.",
        "`NullPointerException`: llamar a un método sobre una referencia que vale `null`. Es el **error más común**; comprobá antes, o devolvé `Optional` en vez de `null`.",
        "Modificar una lista mientras la recorrés con for-each: lanza `ConcurrentModificationException`. Usá un iterador o armá una lista nueva.",
        "La división de enteros: `7 / 2` da `3`, no `3.5`, porque ambos son `int`. Convertí uno a `double`.",
        "Redefinir `equals` sin `hashCode`: los objetos dejan de funcionar bien como claves de un `HashMap` o dentro de un `HashSet`.",
      ],
      codigo: [
        code`
String a = new String("hola");
String b = new String("hola");
System.out.println(a == b);        // false: son dos objetos distintos
System.out.println(a.equals(b));   // true: dicen lo mismo
System.out.println(7 / 2);         // 3   (división entera)
System.out.println(7 / 2.0);       // 3.5`,
      ],
    },
    {
      heading: "Dónde conviene usarlo y dónde no",
      parrafos: [
        "Java brilla en proyectos grandes y de larga vida:",
      ],
      tabla: {
        cabeza: ["Caso", "¿Java?", "Por qué"],
        filas: [
          ["Back-end empresarial, bancos, seguros", "Sí", "Estabilidad, tipado estático, Spring y un ecosistema enorme."],
          ["Servicios de alta concurrencia", "Sí", "La JVM está muy afinada y los hilos virtuales (Java 21) abaratan la concurrencia."],
          ["Procesamiento de datos a gran escala", "Sí", "Herramientas como Hadoop, Spark y Kafka corren sobre la JVM."],
          ["Aplicaciones Android", "Posible", "Se puede, pero hoy lo habitual es Kotlin."],
          ["Scripts rápidos y automatización", "No", "Hay mucha ceremonia para una tarea de diez líneas; Python es más ágil."],
          ["Herramientas que tienen que arrancar al instante", "Con cuidado", "La JVM tarda en arrancar y consume memoria; existen compilaciones nativas, pero es más trabajo."],
        ],
      },
    },
    {
      heading: "Comparación con lenguajes cercanos",
      parrafos: [
        "Cuándo conviene otro:",
      ],
      tabla: {
        cabeza: ["Lenguaje", "Elegilo en vez de Java cuando…"],
        filas: [
          ["Kotlin", "querés lo mismo (la JVM y las bibliotecas de Java) con una sintaxis más corta y con control de null en el tipo."],
          ["C#", "tu entorno es Microsoft o .NET; el lenguaje es muy parecido."],
          ["Go", "querés servicios más simples y un único ejecutable pequeño."],
          ["Python", "el trabajo es de datos, IA o scripts, y no hace falta tipado estático."],
        ],
      },
    },
    {
      heading: "Cómo seguir",
      parrafos: [
        "Hacé la ruta de Java de la app para que la sintaxis, que tiene bastante ceremonia, te salga sola. Resolvé los proyectos y usá la pestaña Referencia para el detalle de cada clase y método.",
        "Fuera de la app, dev.java es la puerta oficial de aprendizaje, y la documentación de la API explica cada clase de la biblioteca estándar. Con la base lista, Spring Boot (en Frameworks, cuando lo abras) es el paso natural para armar un servicio web.",
      ],
    },
  ],
  fuentes: [
    { texto: "dev.java: aprender", url: "https://dev.java/learn/" },
    { texto: "Documentación de la API de Java 25", url: "https://docs.oracle.com/en/java/javase/25/docs/api/" },
    { texto: "OpenJDK: proyecto JDK", url: "https://openjdk.org/projects/jdk/" },
  ],
  revisada: "2026-11-12",
};
