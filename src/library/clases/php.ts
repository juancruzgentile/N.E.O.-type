import { type Clase, code } from "../types";

export const clasePhp: Clase = {
  titulo: "PHP de cero: el lenguaje que mueve gran parte de la web",
  bajada:
    "La referencia rápida está en la otra pestaña. Esta es la clase completa: qué es PHP y cómo se ejecuta en cada pedido web, tu primer programa, " +
    "los conceptos base, los errores de seguridad que hay que conocer y cuándo conviene.",
  secciones: [
    {
      heading: "Qué es y qué problema resuelve",
      parrafos: [
        "PHP es un lenguaje de programación pensado desde el principio para el **back-end de sitios web**: recibe un pedido del navegador, consulta una base de datos y arma la respuesta (casi siempre HTML o JSON). Es de **tipado dinámico** (con tipos opcionales cada vez más completos) y es muy fácil de poner en marcha en cualquier servidor. Está detrás de WordPress, Drupal, Moodle y de aplicaciones hechas con Laravel o Symfony.",
        "El problema que resolvió fue hacer **páginas dinámicas** cuando casi todo eran archivos HTML estáticos: se puede **mezclar PHP dentro de un HTML** y funciona al instante. Con el tiempo se profesionalizó: hoy el PHP moderno tiene tipos, clases, enumeraciones, un gestor de paquetes (Composer) y frameworks muy completos.",
      ],
    },
    {
      heading: "Historia corta",
      parrafos: [
        "Lo creó **Rasmus Lerdorf** en 1994 como un conjunto de herramientas para su página personal (\"Personal Home Page\"); hoy el nombre significa \"PHP: Hypertext Preprocessor\". PHP 3 (1998) lo reescribió y lo volvió un lenguaje de uso general, y PHP 5 (2004) agregó una **programación orientada a objetos** seria.",
      ],
      lista: [
        "PHP 7 (2015): el **salto de velocidad** más grande de su historia y más tipos.",
        "PHP 8 (2020): argumentos con nombre, `match`, atributos y el **compilador JIT**.",
        "Desde entonces, una versión nueva cada noviembre; la de referencia en la app es PHP 8.4.",
        "Su reputación de caótico venía de las primeras versiones; el PHP actual es otro lenguaje.",
      ],
    },
    {
      heading: "Cómo funciona por dentro: un pedido, un programa",
      parrafos: [
        "La característica que define a PHP es su **modelo de ejecución**. Cada vez que llega un pedido HTTP, el servidor (con PHP-FPM, Apache o el servidor integrado) arranca tu script, lo ejecuta de arriba a abajo, devuelve la respuesta y termina. No queda nada en memoria para el siguiente pedido: cada uno empieza de cero (se dice que PHP **no comparte estado**). Si necesitás recordar algo entre pedidos, lo guardás afuera: en la sesión, en una base de datos o en una caché.",
        "Eso lo hace simple de razonar y de escalar horizontalmente, aunque obliga a pensar distinto que en un servidor que se queda corriendo. Por dentro, el motor (Zend Engine) compila el código a instrucciones propias, y **OPcache** las guarda para no volver a compilar el mismo archivo en cada pedido.",
      ],
    },
    {
      heading: "Tu primer programa, paso a paso",
      parrafos: [
        "Creá `saludo.php` y corrélo con `php saludo.php Ana 2`. Para verlo en un navegador, `php -S localhost:8000` levanta un servidor de prueba.",
      ],
      codigo: [
        code`
<?php
$nombre = $argv[1] ?? "mundo";
$veces = (int) ($argv[2] ?? 1);

for ($i = 1; $i <= $veces; $i++) {
    echo "$i. Hola, $nombre\n";
}`,
      ],
    },
    {
      heading: "Qué hace cada línea",
      parrafos: [
        "El archivo empieza con `<?php`: lo que está fuera de esas marcas **se envía tal cual como texto**, y es lo que permite mezclar PHP con HTML. Las **variables empiezan con** `$`. `$argv` es la lista de argumentos de la línea de comandos. El operador `??` usa el valor de la derecha si el de la izquierda no existe o es `null`, y `(int)` convierte el texto en un entero.",
        "Dentro de comillas dobles, las **variables se reemplazan por su valor** (con comillas simples no). `echo` imprime. Con Ana y 2 imprime \"1. Hola, Ana\" y \"2. Hola, Ana\".",
      ],
    },
    {
      heading: "Los cinco conceptos que sostienen todo lo demás",
      parrafos: [
        "Con estos cinco leés casi cualquier código PHP:",
      ],
      lista: [
        "**Arrays**: la estructura central. El mismo array sirve de lista y de diccionario (asociativo).",
        "**Funciones con tipos**: `declare(strict_types=1)` hace que los tipos de los parámetros se respeten.",
        "**Clases modernas**: constructor promovido, propiedades `readonly`, interfaces y enumeraciones.",
        "**Superglobales**: `$_GET`, `$_POST`, `$_SERVER` y `$_SESSION` traen los datos del pedido; nunca confíes en ellos.",
        "**Composer y PDO**: Composer instala paquetes, y PDO accede a las bases de datos con consultas preparadas.",
      ],
      codigo: [
        code`
<?php
declare(strict_types=1);

$precios = ["Dune" => 600, "Emma" => 300];                  // array asociativo
$largos = array_filter($precios, fn($p) => $p > 400);      // ["Dune" => 600]

function conIva(float $precio): float { return $precio * 1.21; }

final class Libro {
    public function __construct(
        public readonly string $titulo,
        public readonly int $paginas,
    ) {}
}
$libro = new Libro("Dune", 600);

$pdo = new PDO("sqlite::memory:");
$stmt = $pdo->prepare("SELECT * FROM libros WHERE id = ?");  // consulta preparada
$stmt->execute([$_GET["id"] ?? 0]);`,
      ],
    },
    {
      heading: "Errores que comete casi todo el mundo",
      parrafos: [
        "En PHP los errores más graves son de seguridad, porque el código recibe datos de desconocidos todo el tiempo:",
      ],
      lista: [
        "**Inyección SQL**: armar una consulta pegando texto del usuario. Usá siempre **consultas preparadas**.",
        "**XSS**: mostrar texto del usuario en una página sin escaparlo. Usá `htmlspecialchars` al imprimir.",
        "Comparar con `==` sin saber las reglas de conversión: preferí `===`. (En PHP 8 `\"abc\" == 0` ya es `false`; en PHP 7 era `true`.)",
        "Dejar los errores a la vista (`display_errors`) en producción: expone rutas y datos internos.",
        "Confiar en `$_POST`, `$_GET` y las subidas de archivos sin validar el tipo, el tamaño y el contenido.",
      ],
      codigo: [
        code`
// MAL: inyección SQL si el id viene del usuario
$pdo->query("SELECT * FROM usuarios WHERE id = " . $_GET["id"]);

// BIEN: consulta preparada
$stmt = $pdo->prepare("SELECT * FROM usuarios WHERE id = ?");
$stmt->execute([$_GET["id"]]);

echo htmlspecialchars($comentario, ENT_QUOTES, "UTF-8");   // evita XSS al mostrar`,
      ],
    },
    {
      heading: "Dónde conviene usarlo y dónde no",
      parrafos: [
        "PHP es una excelente opción para web, y casi nada más:",
      ],
      tabla: {
        cabeza: ["Caso", "¿PHP?", "Por qué"],
        filas: [
          ["Sitios y tiendas con WordPress", "Sí", "Es el lenguaje de WordPress, con un ecosistema enorme de temas y plugins."],
          ["Aplicaciones web con Laravel o Symfony", "Sí", "Frameworks maduros, con todo incluido."],
          ["Hosting barato y despliegue simple", "Sí", "Casi cualquier hosting lo soporta."],
          ["Servicios en tiempo real con conexiones largas", "No es lo natural", "El modelo de un pedido, un programa no encaja bien; hay herramientas como Swoole, pero Node.js o Go son más naturales."],
          ["Aplicaciones móviles o de escritorio", "No", "No fue pensado para eso."],
          ["Cálculo intensivo o ciencia de datos", "No", "El ecosistema está en Python."],
        ],
      },
    },
    {
      heading: "Comparación con lenguajes cercanos",
      parrafos: [
        "Cuándo conviene otro:",
      ],
      tabla: {
        cabeza: ["Lenguaje", "Elegilo en vez de PHP cuando…"],
        filas: [
          ["Python (Django o FastAPI)", "el back-end comparte código con datos o inteligencia artificial."],
          ["Node.js (JavaScript o TypeScript)", "querés el mismo lenguaje en el front-end y el back-end."],
          ["Java o C#", "el sistema es grande y empresarial, con tipado estático obligatorio."],
          ["Go", "necesitás servicios de alto rendimiento con muchas conexiones."],
        ],
      },
    },
    {
      heading: "Cómo seguir",
      parrafos: [
        "Hacé la ruta de PHP de la app, resolvé los proyectos y, cuando tengas la base, abrí Laravel (en Frameworks) para ver cómo se organiza una aplicación real.",
        "Fuera de la app, el manual oficial en php.net está en español y es muy bueno (cada función tiene ejemplos). PHP: The Right Way reúne las buenas prácticas actuales, y la página de versiones indica qué rama recibe soporte.",
      ],
    },
  ],
  fuentes: [
    { texto: "Manual de PHP", url: "https://www.php.net/manual/es/" },
    { texto: "Versiones de PHP y su soporte", url: "https://www.php.net/supported-versions.php" },
    { texto: "PHP: The Right Way", url: "https://phptherightway.com/" },
  ],
  revisada: "2026-11-12",
};
