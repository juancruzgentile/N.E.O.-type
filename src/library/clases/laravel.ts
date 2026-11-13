import { type Clase, code } from "../types";

export const claseLaravel: Clase = {
  titulo: "Laravel de cero: el framework de PHP con todo a mano",
  bajada:
    "La referencia rápida está en la otra pestaña. Esta es la clase completa: qué es Laravel y cómo viaja un pedido por dentro, tu primera ruta, " +
    "los conceptos base (Eloquent, migraciones y Blade), los errores clásicos de seguridad y cuándo conviene.",
  secciones: [
    {
      heading: "Qué es y qué problema resuelve",
      parrafos: [
        "Laravel es un framework web de PHP, de los llamados \"con baterías incluidas\": trae rutas, un ORM (Eloquent), un sistema de migraciones, plantillas (Blade), validación, autenticación, colas de tareas, envío de correo, almacenamiento de archivos y una herramienta de línea de comandos (Artisan). Es el framework de PHP más popular y se usa para tiendas, paneles, APIs y aplicaciones de negocio.",
        "El problema que resuelve es el de escribir aplicaciones web en PHP de forma ordenada. El PHP sin estructura tiende al código enredado y a los errores de seguridad; Laravel impone una organización clara y trae las piezas comunes ya resueltas, con una sintaxis legible y muy pensada para la comodidad de quien programa.",
      ],
    },
    {
      heading: "Historia corta",
      parrafos: [
        "Lo creó Taylor Otwell en 2011, buscando una alternativa más expresiva a los frameworks de PHP de la época, e inspirándose en Ruby on Rails. Creció muy rápido por su documentación y su comunidad, y hoy tiene un ecosistema grande: Forge y Vapor para desplegar, Livewire e Inertia para interfaces, Sail y Herd para el entorno local.",
      ],
      lista: [
        "Sale una versión mayor por año; la de referencia en la app es Laravel 12.",
        "Está construido sobre componentes de Symfony, otro framework muy respetado de PHP.",
        "Requiere un PHP moderno: aprovecha tipos, enumeraciones y atributos.",
      ],
    },
    {
      heading: "Cómo funciona por dentro: el camino de un pedido",
      parrafos: [
        "Todos los pedidos entran por un único archivo, public/index.php, que arranca la aplicación. El pedido pasa por una cadena de middleware (sesiones, protección CSRF, autenticación), el enrutador busca en routes/web.php (o api.php) cuál es la ruta que coincide y llama a su manejador: una función o un método de un controlador. El manejador devuelve una respuesta (HTML de una vista Blade, JSON, una redirección).",
        "En el centro hay un contenedor de servicios que construye los objetos y entrega a cada clase lo que pide en su constructor (inyección de dependencias). Eloquent traduce las operaciones sobre modelos (Libro::where(...)->get()) a consultas SQL, y las migraciones son archivos PHP versionados que describen la estructura de la base de datos para reproducirla en cualquier entorno.",
      ],
    },
    {
      heading: "Tu primera ruta, paso a paso",
      parrafos: [
        "Con PHP y Composer instalados: composer create-project laravel/laravel sitio, entrá a la carpeta y php artisan serve. Agregá esto al final de routes/web.php y abrí http://127.0.0.1:8000/saludo/Ana?veces=2.",
      ],
      codigo: [
        code`
use Illuminate\Support\Facades\Route;

Route::get('/saludo/{nombre}', function (string $nombre) {
    $veces = max(1, request()->integer('veces', 1));

    return collect(range(1, $veces))->map(fn ($i) => "$i. Hola, $nombre");
});`,
      ],
    },
    {
      heading: "Qué hace cada parte",
      parrafos: [
        "Route::get asocia una ruta con una función, y {nombre} es un parámetro que llega como argumento. request()->integer('veces', 1) lee el valor de la query y lo convierte a entero, con 1 por defecto. collect arma una colección, un objeto con métodos encadenables (map, filter, sum…), y una colección que se devuelve se convierte sola en JSON.",
        "Para una página de verdad, la ruta llamaría a una vista (return view('saludo', [...])) y esa vista sería un archivo Blade en resources/views. Con php artisan route:list ves todas las rutas de la aplicación.",
      ],
    },
    {
      heading: "Los cinco conceptos que sostienen todo lo demás",
      parrafos: [
        "Con estos cinco leés casi cualquier proyecto Laravel:",
      ],
      lista: [
        "Rutas y controladores: routes/web.php apunta a métodos de clases en app/Http/Controllers.",
        "Eloquent: un modelo por tabla, con relaciones como belongsTo y hasMany.",
        "Migraciones: cada cambio de la base se escribe en PHP y se aplica con php artisan migrate.",
        "Blade: plantillas con {{ }} (que escapa el contenido) y directivas como @foreach y @if.",
        "Validación y middleware: $request->validate() comprueba los datos, y el middleware filtra pedidos (por ejemplo, exigir que el usuario haya iniciado sesión).",
      ],
      codigo: [
        code`
// app/Models/Libro.php
class Libro extends Model
{
    protected $fillable = ['titulo', 'paginas'];

    public function autor() { return $this->belongsTo(Autor::class); }
}

// database/migrations/..._crear_libros.php
Schema::create('libros', function (Blueprint $t) {
    $t->id();
    $t->string('titulo');
    $t->unsignedInteger('paginas')->default(0);
    $t->timestamps();
});

// app/Http/Controllers/LibroController.php
public function store(Request $request)
{
    $datos = $request->validate(['titulo' => 'required|max:100', 'paginas' => 'integer|min:1']);
    return Libro::create($datos);
}

// resources/views/libros.blade.php
@foreach ($libros as $libro)
    <li>{{ $libro->titulo }}</li>
@endforeach`,
      ],
    },
    {
      heading: "Errores que comete casi todo el mundo",
      parrafos: [
        "Los más repetidos:",
      ],
      lista: [
        "Asignación masiva sin protección: Libro::create($request->all()) deja que cualquier campo del pedido llegue a la base. Validá y definí $fillable.",
        "El problema N+1: recorrer modelos y consultar una relación en cada vuelta. Cargá las relaciones de antemano con with().",
        "Dejar APP_DEBUG=true o subir el archivo .env al repositorio: expone claves y datos internos. El .env nunca se publica.",
        "Imprimir con {!! !!} contenido que viene del usuario: no se escapa y abre la puerta al XSS. Usá {{ }}.",
        "Olvidar @csrf en un formulario, o desactivar la protección para que \"ande\": es una puerta abierta a ataques.",
      ],
      codigo: [
        code`
// N+1: una consulta extra por cada libro
foreach (Libro::all() as $l) { echo $l->autor->nombre; }

// 2 consultas en total
foreach (Libro::with('autor')->get() as $l) { echo $l->autor->nombre; }

Libro::create($request->all());                   // MAL: cualquier campo llega a la base
Libro::create($request->validate(['titulo' => 'required']));   // BIEN`,
      ],
    },
    {
      heading: "Dónde conviene usarlo y dónde no",
      parrafos: [
        "Laravel es una gran opción para aplicaciones web en PHP:",
      ],
      tabla: {
        cabeza: ["Caso", "¿Laravel?", "Por qué"],
        filas: [
          ["Aplicaciones de negocio, paneles y tiendas", "Sí", "Todo lo común ya está resuelto y bien integrado."],
          ["APIs para un front-end o una app móvil", "Sí", "Recursos, validación y autenticación incluidos."],
          ["Equipos chicos que necesitan avanzar rápido", "Sí", "Muy buena documentación y convenciones claras."],
          ["Una página con dos formularios", "No", "Es mucho más de lo necesario; PHP simple alcanza."],
          ["Sitios de contenido editable por no técnicos", "Con un CMS", "WordPress u otros CMS resuelven la edición de contenido."],
          ["Servicios de muy alta concurrencia", "Con cuidado", "El modelo de un pedido por programa pide más recursos; hay herramientas como Octane."],
        ],
      },
    },
    {
      heading: "Comparación con alternativas",
      parrafos: [
        "Cuándo conviene otra cosa:",
      ],
      tabla: {
        cabeza: ["Alternativa", "Elegila en vez de Laravel cuando…"],
        filas: [
          ["Symfony", "querés más control, componentes sueltos y una arquitectura muy flexible."],
          ["Django", "tu equipo trabaja en Python; la filosofía es muy parecida."],
          ["Ruby on Rails", "tu equipo está en Ruby; es el origen de muchas de las ideas de Laravel."],
          ["WordPress", "el proyecto es un sitio de contenido, no una aplicación."],
        ],
      },
    },
    {
      heading: "Cómo seguir",
      parrafos: [
        "Hacé primero la ruta de PHP y los proyectos de la app; después usá la pestaña Referencia para recordar la sintaxis de rutas, Eloquent y Blade.",
        "Fuera de la app, la documentación oficial de Laravel es una de las mejores de cualquier framework, y Laracasts reúne cursos en video. Antes de publicar, repasá la lista de optimización y despliegue.",
      ],
    },
  ],
  fuentes: [
    { texto: "Documentación de Laravel", url: "https://laravel.com/docs" },
    { texto: "Eloquent ORM", url: "https://laravel.com/docs/eloquent" },
    { texto: "Despliegue de Laravel", url: "https://laravel.com/docs/deployment" },
  ],
  revisada: "2026-11-12",
};
