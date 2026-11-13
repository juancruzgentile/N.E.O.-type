import { type Topic, a, b, code, m } from "./types";
import { clasePhp } from "./clases/php";

export const php: Topic = {
  id: "php",
  name: "PHP",
  group: "Lenguajes",
  emblem: "php",
  badge: "PHP",
  color: "#8892ff",
  hl: "php",
  summary:
    "Lenguaje pensado para la web que corre en el servidor. Mueve buena parte de internet: WordPress, Wikipedia y " +
    "frameworks como Laravel y Symfony. El PHP moderno (8 en adelante) tiene tipos, enums, clases de solo lectura y " +
    "un compilador JIT.",
  facts: [
    { label: "Archivos", value: ".php · composer.json" },
    { label: "Ejecutar", value: "php script.php · php -S localhost:8000" },
    { label: "Paquetes", value: "Composer (Packagist)" },
    { label: "Versión de referencia", value: "PHP 8.4" },
    { label: "Estilo", value: "PSR-12 · 4 espacios · camelCase en métodos" },
  ],
  workflow: [
    { title: "declare(strict_types=1)", text: "Al principio de cada archivo: evita conversiones de tipo silenciosas." },
    { title: "Composer y autoload", text: "composer require agrega dependencias y el autoload PSR-4 carga las clases sin require a mano." },
    { title: "Nunca SQL armado a mano", text: "Usá PDO con consultas preparadas; los datos van como parámetros, no concatenados." },
    { title: "Escapá lo que mostrás", text: "htmlspecialchars antes de imprimir datos del usuario en HTML (o un motor de plantillas que lo haga solo)." },
    { title: "Tests y análisis", text: "PHPUnit para tests y PHPStan o Psalm para encontrar errores de tipos sin ejecutar." },
  ],
  entries: [
    b("Estructura", "<?php y echo", "El código va después de <?php. echo imprime; las variables empiezan con $.", code`
<?php
declare(strict_types=1);

$nombre = 'Ana';
echo "Hola, $nombre\n";`, "inicio imprimir variable"),
    b("Texto", "Comillas simples y dobles", "Las comillas dobles interpolan variables; las simples no. El punto concatena.", code`
$saludo = "Hola, {$usuario->nombre}";
$literal = 'Esto no cambia: $nombre';
$completo = $nombre . ' ' . $apellido;
$largo = strlen($texto);`, "string cadena concatenar"),
    b("Control de flujo", "if, foreach y match", "match compara con === y devuelve un valor.", code`
foreach ($productos as $indice => $producto) {
    if ($producto->stock === 0) {
        continue;
    }
    echo $producto->nombre, PHP_EOL;
}

$texto = match (true) {
    $nota >= 9 => 'excelente',
    $nota >= 6 => 'aprobado',
    default => 'a recuperar',
};`, "condicional bucle foreach match"),
    b("Funciones", "Funciones con tipos", "Parámetros y retorno tipados; ? permite null.", code`
function saludar(string $nombre, int $veces = 1): string
{
    return str_repeat("Hola, $nombre! ", $veces);
}

echo saludar('Ana', veces: 2);`, "funcion parametro tipo"),
    b("Colecciones", "Arrays", "Un array sirve de lista y de diccionario.", code`
$nombres = ['Ana', 'Luis'];
$nombres[] = 'Eva';
$edades = ['Ana' => 30, 'Luis' => 25];
$edadEva = $edades['Eva'] ?? 0;
echo count($nombres);`, "array lista diccionario"),

    m("Clases", "Clases y propiedades promovidas", "El constructor puede declarar las propiedades; readonly impide cambiarlas.", code`
final class Producto
{
    public function __construct(
        public readonly string $nombre,
        private float $precio,
    ) {
    }

    public function precio(): float
    {
        return $this->precio;
    }
}

$yerba = new Producto('Yerba', 3.5);`, "clase objeto constructor readonly"),
    m("Tipos", "enum", "Enumeraciones con valor (backed enums) y métodos.", code`
enum Estado: string
{
    case Pendiente = 'pendiente';
    case Pagado = 'pagado';

    public function etiqueta(): string
    {
        return ucfirst($this->value);
    }
}

$estado = Estado::from('pagado');`, "enumeracion enum"),
    m("Colecciones", "array_map, array_filter y usort", "Funciones de array con funciones flecha fn() =>.", code`
$pagados = array_filter($pedidos, fn(Pedido $p) => $p->pagado);
$totales = array_map(fn(Pedido $p) => $p->total, $pagados);
$suma = array_sum($totales);
usort($productos, fn($a, $b) => $a->precio <=> $b->precio);`, "map filter ordenar arrow"),
    m("Errores", "Excepciones", "throw lanza y try/catch atrapa; finally corre siempre.", code`
try {
    $datos = json_decode($json, true, flags: JSON_THROW_ON_ERROR);
} catch (JsonException $e) {
    error_log('JSON inválido: ' . $e->getMessage());
} finally {
    fclose($archivo);
}`, "error excepcion try catch"),
    m("Bases de datos", "PDO y consultas preparadas", "Los valores van como parámetros: nunca concatenados en el SQL.", code`
$pdo = new PDO('sqlite:app.db', options: [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
$consulta = $pdo->prepare('SELECT * FROM usuarios WHERE email = :email');
$consulta->execute(['email' => $email]);
$usuario = $consulta->fetch(PDO::FETCH_ASSOC);`, "sql base datos pdo inyeccion"),
    m("Herramientas", "Composer", "Gestor de dependencias y autoload.", code`
composer init
composer require guzzlehttp/guzzle
composer install
composer dump-autoload`, "paquetes dependencias autoload"),

    a("Clases", "Interfaces y traits", "Una interfaz define un contrato; un trait reutiliza código entre clases.", code`
interface Forma
{
    public function area(): float;
}

trait ConNombre
{
    public function nombre(): string
    {
        return static::class;
    }
}

final class Circulo implements Forma
{
    use ConNombre;

    public function __construct(private float $radio)
    {
    }

    public function area(): float
    {
        return M_PI * $this->radio ** 2;
    }
}`, "interfaz trait herencia"),
    a("Clases", "Namespaces y autoload", "Los namespaces ordenan las clases; con PSR-4 el autoload las encuentra por su ruta.", code`
<?php
declare(strict_types=1);

namespace App\Servicios;

use App\Modelos\Usuario;
use InvalidArgumentException;

final class Registro
{
    public function crear(string $email): Usuario
    {
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new InvalidArgumentException('Email inválido');
        }
        return new Usuario($email);
    }
}`, "namespace use autoload psr"),
    a("Web", "Escapar la salida", "Todo lo que viene del usuario se escapa antes de imprimirlo en HTML.", code`
<p>Hola, <?= htmlspecialchars($nombre, ENT_QUOTES, 'UTF-8') ?></p>
<a href="/perfil?id=<?= urlencode((string) $id) ?>">Perfil</a>`, "xss seguridad html escapar"),
    a("Tipos", "Tipos avanzados", "Uniones, nullables, never y propiedades con hooks (PHP 8.4).", code`
function buscar(int|string $id): ?Usuario
{
    return null;
}

function fallar(string $motivo): never
{
    throw new RuntimeException($motivo);
}

final class Temperatura
{
    public float $celsius {
        set => $value < -273.15 ? throw new ValueError('bajo el cero absoluto') : $value;
    }
}`, "union nullable never hooks"),
  ],
  clase: clasePhp,
};
