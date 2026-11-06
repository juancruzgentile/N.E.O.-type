import { area, code, er, op, sa } from "./crear";

const T = "https://docs.oracle.com/javase/tutorial/";
const A = "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/";
export const java = area("java", [
  op("j", "¿Qué diferencia hay entre `==` y `equals` al comparar dos String?",
    ["== compara si son el mismo objeto; equals compara el contenido", "== compara el contenido y equals compara si son el mismo objeto en memoria", "Son iguales siempre: ninguna de las dos distingue entre dos objetos distintos", "equals solo funciona con números enteros y == se usa con los textos"],
    "Dos String con el mismo texto pueden ser objetos distintos. Para comparar contenido se usa equals.", A + "lang/String.html#equals(java.lang.Object)"),
  sa("j", code`
public class Main {
    public static void main(String[] args) {
        String a = "hola";
        String b = new String("hola");
        System.out.println(a == b);
        System.out.println(a.equals(b));
    }
}`, ["false\ntrue", "true\ntrue", "true\nfalse", "false\nfalse"],
    "new String(...) crea un objeto distinto del literal, así que == da false; equals compara el texto y da true.", A + "lang/String.html"),
  op("j", "¿Qué diferencia hay entre `int` e `Integer`?",
    ["int es un tipo primitivo; Integer es un objeto envoltorio que puede ser null", "Son lo mismo: Integer es solo otro nombre del tipo primitivo int en Java", "Integer es más rápido que int porque se guarda siempre en la memoria caché", "int puede valer null y Integer no, porque Integer es un tipo primitivo"],
    "Las colecciones como List<Integer> guardan objetos, no primitivos. El paso entre uno y otro se llama autoboxing.", T + "java/data/autoboxing.html"),
  er("j", code`
int x = 5;
String s = x;`, ["No se puede asignar un int a un String sin convertirlo (por ejemplo, String.valueOf(x))", "Falta el punto y coma al final de la segunda línea del código de Java", "String no existe en Java y hay que declarar la variable como Text", "x tiene que ser double para poder asignarse a una variable de tipo String"],
    "Java no convierte números a texto de forma implícita al asignar. Se usa String.valueOf(x) o Integer.toString(x).", T + "java/nutsandbolts/datatypes.html", "java"),
  op("j", "¿Qué significa que un método sea `static`?",
    ["Pertenece a la clase y se puede llamar sin crear un objeto", "No se puede heredar ni sobrescribir desde ninguna otra clase del programa", "No devuelve ningún valor y solo puede usarse con el tipo void", "Solo puede llamarse una vez durante toda la ejecución del programa"],
    "main es static para que la JVM pueda llamarlo sin crear antes un objeto.", T + "java/javaOO/classvars.html"),
  op("s", "¿Qué garantiza un try-with-resources?",
    ["Que el recurso (un AutoCloseable) se cierra al salir del bloque, aunque haya una excepción", "Que no se lanzan excepciones dentro del bloque, ni siquiera por errores de lectura", "Que el recurso se abre más rápido porque la JVM lo guarda en memoria", "Que el recurso se comparte entre todos los hilos del programa sin bloqueos"],
    "Reemplaza al finally que cierra archivos, conexiones y streams.", T + "essential/exceptions/tryResourceClose.html"),
  op("s", "¿Qué diferencia hay entre acceder por índice en un ArrayList y en un LinkedList?",
    ["ArrayList accede en tiempo constante; LinkedList tiene que recorrer desde un extremo", "LinkedList accede en tiempo constante y ArrayList tiene que recorrer la lista desde un extremo", "Son iguales: las dos acceden por índice en el mismo tiempo siempre", "ArrayList no permite acceder por índice; solo se puede recorrer con un iterador"],
    "ArrayList se apoya en un arreglo. LinkedList solo gana al insertar o borrar en los extremos.", A + "util/ArrayList.html"),
  op("s", "¿Qué es un `record`?",
    ["Una clase concisa, de datos inmutables, con constructor, accesores, equals, hashCode y toString generados", "Un tipo especial para guardar audio y video dentro de la aplicación", "Una anotación que sirve para registrar los eventos del programa en un archivo, de modo que cada método marcado deja una línea en el registro", "Una interfaz sin métodos que ninguna otra clase puede llegar a implementar"],
    "record Punto(int x, int y) {} reemplaza decenas de líneas de código repetitivo.", "https://dev.java/learn/records/"),
  sa("s", code`
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<Integer> nums = List.of(1, 2, 3, 4);
        System.out.println(nums.stream().filter(n -> n % 2 == 0).map(n -> n * n).toList());
    }
}`, ["[4, 16]", "[2, 4]", "[1, 9]", "[1, 4, 9, 16]"],
    "filter se queda con los pares (2 y 4) y map los eleva al cuadrado (4 y 16).", "https://dev.java/learn/api/streams/"),
  er("s", code`
List<String> l = List.of("a", "b");
l.add("c");`, ["List.of devuelve una lista inmutable: add lanza UnsupportedOperationException", "Falta importar la clase String antes de poder usarla dentro de la lista", "add no existe en List: solo se pueden agregar elementos con append", "List.of solo acepta números y por eso falla al recibir textos como a y b"],
    "Para una lista que se pueda modificar se usa new ArrayList<>(List.of(...)).", A + "util/List.html#of(E...)", "java"),
  op("s", "¿Para qué sirve `Optional`?",
    ["Para representar un valor que puede faltar, sin devolver null", "Para hacer opcionales los parámetros de un método, sin tener que pasarlos todos", "Para guardar valores en una base de datos sin escribir la consulta SQL", "Para crear hilos que se ejecutan solo cuando la persona usuaria lo pide"],
    "Obliga a quien llama a decidir qué hacer si no hay valor (orElse, ifPresent…).", A + "util/Optional.html"),
  op("s", "¿Qué regla une a `equals` y `hashCode`?",
    ["Si dos objetos son iguales según equals, tienen que dar el mismo hashCode", "Si el hashCode es igual en dos objetos, equals siempre tiene que dar true", "No tienen ninguna relación: se pueden definir por separado sin ningún problema", "hashCode solo se usa con String y no hay que definirlo en otras clases"],
    "Si se rompe, colecciones como HashMap y HashSet fallan al buscar.", A + "lang/Object.html#hashCode()"),
  op("s", "¿Qué diferencia hay entre excepciones checked y unchecked?",
    ["Las checked hay que capturarlas o declararlas con throws; las unchecked (RuntimeException) no", "Las unchecked hay que declararlas siempre con throws y las checked, no", "Las checked no se pueden lanzar nunca desde un método del programa", "No hay diferencia: todas se tratan igual y ninguna obliga a capturarlas ni a declararlas, así que el compilador nunca las revisa en el código"],
    "IOException es checked. NullPointerException y IllegalArgumentException son unchecked.", T + "essential/exceptions/catchOrDeclare.html"),
  op("s", "¿Cuál es una diferencia entre interface y clase abstracta?",
    ["Una clase puede implementar varias interfaces, pero extender una sola clase", "Las interfaces pueden tener constructores y las clases abstractas no pueden tenerlos", "Una clase abstracta no puede tener métodos con código, solo declaraciones", "No hay ninguna diferencia: son dos formas de escribir exactamente lo mismo"],
    "Por eso las interfaces se usan para definir contratos que distintas clases cumplen.", T + "java/IandI/abstract.html"),
  op("x", "¿Qué son los virtual threads de Java 21?",
    ["Hilos livianos gestionados por la JVM, pensados para muchas tareas que esperan entrada y salida", "Hilos que corren en otra máquina para repartir el trabajo entre varios servidores", "Hilos que no pueden bloquearse nunca, ni siquiera al esperar entrada y salida", "Un reemplazo de las corrutinas de Kotlin que se agregó al lenguaje Java"],
    "Permiten un hilo por tarea sin el costo de los hilos del sistema operativo.", "https://docs.oracle.com/en/java/javase/21/core/virtual-threads.html"),
  op("x", "¿Qué hace el recolector de basura (garbage collector)?",
    ["Libera la memoria de los objetos a los que el programa ya no puede llegar", "Borra los archivos temporales que el programa deja en el disco al terminar", "Cierra las conexiones y los archivos abiertos cuando ya nadie los usa", "Acelera el arranque de la JVM guardando una copia de las clases cargadas"],
    "No libera otros recursos como archivos o sockets: esos hay que cerrarlos.", "https://docs.oracle.com/en/java/javase/21/gctuning/introduction-garbage-collection-tuning.html"),
  op("x", "¿Qué garantiza `volatile` en una variable?",
    ["Que los cambios que hace un hilo sean visibles para los demás, pero no hace atómicas las operaciones compuestas", "Que la variable se guarda en disco y no se pierde cuando termina el programa, de modo que los hilos la comparten incluso entre ejecuciones distintas", "Que solo un hilo puede leer la variable y los demás tienen que esperar", "Que la operación i++ sobre esa variable pasa a ser atómica y segura"],
    "Para operaciones compuestas se usan AtomicInteger, synchronized o locks.", "https://docs.oracle.com/javase/specs/jls/se21/html/jls-17.html#jls-17.4"),
  op("x", "¿Qué hace `sealed` en una clase o interfaz?",
    ["Restringe qué clases pueden extenderla o implementarla", "La hace inmutable, de modo que ninguna de sus propiedades pueda cambiar", "Impide crear instancias de la clase con la palabra new en el programa", "La cifra en memoria para que otros programas no puedan leer sus datos"],
    "Junto con pattern matching permite un switch exhaustivo sobre los casos permitidos.", "https://docs.oracle.com/en/java/javase/21/language/sealed-classes-and-interfaces.html"),
  sa("x", code`
public class Main {
    static int f() {
        try {
            return 1;
        } finally {
            System.out.println("f");
        }
    }

    public static void main(String[] args) {
        System.out.println(f());
    }
}`, ["f\n1", "1", "1\nf", "f"],
    "El finally corre antes de que el método devuelva el valor, así que se imprime 'f' y después 1.", T + "essential/exceptions/finally.html"),
]);
