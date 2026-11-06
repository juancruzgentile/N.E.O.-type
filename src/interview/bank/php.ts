import { area, code, er, op } from "./crear";

const P = "https://www.php.net/manual/en/";
export const php = area("php", [
  op("j", "¿Qué diferencia hay entre `==` y `===` en PHP?",
    ["== compara después de convertir los tipos; === compara valor y tipo", "== compara valor y tipo a la vez y === convierte los tipos antes de comparar", "=== compara solo el tipo de los dos valores y no mira su contenido", "== compara referencias de objetos y === compara los valores de las variables"],
    "Por ejemplo, 0 == \"a\" era true en versiones viejas. Se recomienda usar ===.", P + "language.operators.comparison.php"),
  op("j", "¿Cómo se escribe una variable en PHP?",
    ["Con el signo $ delante del nombre", "Con @ delante", "Con la palabra var obligatoria", "Sin ningún signo"],
    "$nombre = \"Ana\"; Los nombres distinguen mayúsculas y minúsculas.", P + "language.variables.basics.php"),
  er("j", code`
$sql = "SELECT * FROM usuarios WHERE id = " . $_GET["id"];`, ["Concatenar datos del usuario en la consulta permite inyección SQL: hay que usar consultas preparadas", "Falta el punto y coma al final de la línea que arma la consulta", "$_GET no existe en PHP y hay que leer el valor con $_PARAM", "SELECT no se puede escribir dentro de un texto en el código de PHP, y hay que armar las consultas con funciones propias del lenguaje para cada cláusula"],
    "Con PDO se escribe WHERE id = :id y se pasan los valores aparte.", P + "pdo.prepared-statements.php", "php"),
  op("s", "¿Por qué se usan consultas preparadas con PDO?",
    ["Para separar la consulta de los datos y evitar la inyección SQL", "Para que la consulta sea más corta y no tener que escribir tanto código SQL", "Para guardar la consulta en un archivo y reutilizarla desde otros programas", "Para evitar escribir SQL y trabajar solo con funciones propias de PHP"],
    "Los valores nunca se interpretan como parte del SQL.", P + "pdo.prepared-statements.php"),
  op("s", "¿Qué diferencia hay entre `match` y `switch` en PHP 8?",
    ["match compara con === , devuelve un valor y falla si no hay coincidencia", "match usa == y deja pasar de un caso al siguiente igual que switch", "match solo sirve con números enteros y no admite texto ni otros valores", "match necesita un break al final de cada caso para no ejecutar el resto"],
    "No necesita break y lanza UnhandledMatchError si ningún caso coincide.", P + "control-structures.match.php"),
  op("s", "¿Qué hace el operador `??`?",
    ["Devuelve el valor de la izquierda si existe y no es null; si no, el de la derecha", "Compara dos valores y devuelve true si los dos son iguales y del mismo tipo", "Convierte el valor de la izquierda a booleano y lo devuelve como resultado", "Concatena dos textos y devuelve el resultado en una sola cadena de caracteres"],
    "$_GET[\"x\"] ?? \"defecto\" no lanza aviso si la clave no existe.", P + "language.operators.comparison.php#language.operators.comparison.coalesce"),
  op("x", "¿Para qué se usa `htmlspecialchars` al imprimir datos del usuario en una página?",
    ["Para evitar XSS: convierte los caracteres especiales de HTML en entidades", "Para comprimir el texto antes de mostrarlo y que la página cargue más rápido", "Para validar que un correo electrónico tenga el formato que se espera", "Para cifrar el texto y que otras personas no puedan leerlo en la página"],
    "Se escapa la salida en el momento de imprimir, según el contexto (HTML, atributo, JavaScript).", P + "function.htmlspecialchars.php"),
  op("x", "¿Qué logra el autoload PSR-4 de Composer?",
    ["Cargar las clases automáticamente según su espacio de nombres y la ruta del archivo, sin escribir require", "Instalar los paquetes de Packagist más rápido que con la instalación normal", "Compilar el código PHP a un formato que se ejecuta más rápido en el servidor, guardando una copia ya procesada de cada archivo en la carpeta vendor", "Evitar tener que usar namespaces en las clases de la aplicación"],
    "Se configura en composer.json y se incluye con require 'vendor/autoload.php'.", "https://getcomposer.org/doc/04-schema.md#psr-4"),
]);
