// Los frameworks de Swift, Kotlin y PHP: SwiftUI, Jetpack Compose y Laravel. Se abren como los demás (ruta del lenguaje
// más un proyecto), pero cada uno con su proyecto: ver `projects` y unlock.ts.
import type { Framework } from "./frameworks";
import { a, b, code, m } from "./types";
import { claseSwiftui } from "./clases/swiftui";
import { claseCompose } from "./clases/compose";
import { claseLaravel } from "./clases/laravel";

export const swiftui: Framework = {
  id: "swiftui",
  name: "SwiftUI",
  group: "Frameworks",
  emblem: null,
  badge: "UI",
  color: "#f05138",
  hl: "swift",
  langs: ["swift"],
  projects: ["p15"],
  summary:
    "El framework de Apple para armar interfaces en iPhone, iPad, Mac, Watch y Vision. La pantalla se describe con " +
    "vistas pequeñas (structs) y SwiftUI la actualiza sola cuando cambia el estado: no hay que mover vistas a mano.",
  facts: [
    { label: "Archivos", value: ".swift (una vista por struct)" },
    { label: "Crear proyecto", value: "Xcode: File > New > Project > App" },
    { label: "Versión de referencia", value: "SwiftUI de iOS 18 · Swift 6" },
    { label: "Se usa con", value: "Swift Concurrency, SwiftData, Observation" },
  ],
  workflow: [
    { title: "Vistas chicas", text: "Una vista hace una cosa. Si el body crece, se parte en vistas más chicas con nombre propio." },
    { title: "Un dueño por cada dato", text: "El estado vive en un solo lugar (@State o un modelo); el resto de las vistas lo recibe y lo conecta." },
    { title: "El orden de los modificadores importa", text: "Cada modificador envuelve la vista anterior: padding antes o después del fondo da resultados distintos." },
    { title: "Vista previa siempre", text: "#Preview muestra la vista sin correr la app: sirve para probar estados raros (lista vacía, texto largo, modo oscuro)." },
  ],
  entries: [
    b("Vistas", "View y body", "Una vista es un struct que cumple View: su propiedad body describe lo que se ve.", code`
import SwiftUI

struct Saludo: View {
    var nombre: String

    var body: some View {
        Text("Hola, \(nombre)")
            .font(.title)
    }
}`, "vista struct body text"),
    b("Vistas", "VStack, HStack y Spacer", "Las pilas ordenan vistas en vertical u horizontal; Spacer ocupa el espacio que sobra.", code`
VStack(alignment: .leading, spacing: 8) {
    Text("Título").font(.headline)
    HStack {
        Image(systemName: "star.fill")
        Text("4.8")
        Spacer()
        Text("120 opiniones")
    }
}
.padding()`, "layout pila vertical horizontal spacer"),
    b("Estado", "@State", "Un valor que la vista posee: cuando cambia, SwiftUI vuelve a dibujar esa vista.", code`
struct Contador: View {
    @State private var cuenta = 0

    var body: some View {
        Button("Tocaste \(cuenta) veces") {
            cuenta += 1
        }
    }
}`, "estado reactivo boton contador"),
    b("Listas", "List y ForEach", "List muestra filas desplazables; cada elemento necesita una identidad estable.", code`
struct Tareas: View {
    let tareas = ["Comprar pan", "Estudiar Swift", "Salir a correr"]

    var body: some View {
        List(tareas, id: \.self) { tarea in
            Text(tarea)
        }
    }
}`, "lista filas id foreach"),
    m("Estado", "@Binding", "Una conexión a un estado que vive en otra vista: la vista hija lo lee y lo cambia sin ser la dueña.", code`
struct Interruptor: View {
    @Binding var activo: Bool

    var body: some View {
        Toggle("Notificaciones", isOn: $activo)
    }
}

struct Ajustes: View {
    @State private var notificaciones = true

    var body: some View {
        Interruptor(activo: $notificaciones)
    }
}`, "binding enlace estado compartido toggle"),
    m("Navegación", "NavigationStack", "Una pila de pantallas: NavigationLink empuja una pantalla nueva y la barra permite volver.", code`
NavigationStack {
    List(tareas, id: \.self) { tarea in
        NavigationLink(tarea) {
            Text("Detalle de \(tarea)")
        }
    }
    .navigationTitle("Tareas")
}`, "navegacion pantallas link detalle"),
    m("Datos", "@Observable", "Un modelo compartido: las vistas que leen sus propiedades se actualizan solas cuando cambian.", code`
@Observable
class Tienda {
    var productos: [String] = []

    func agregar(_ nombre: String) {
        productos.append(nombre)
    }
}

struct Carrito: View {
    @State private var tienda = Tienda()

    var body: some View {
        VStack {
            Text("Productos: \(tienda.productos.count)")
            Button("Agregar") { tienda.agregar("Mate") }
        }
    }
}`, "modelo observacion observable estado compartido"),
    m("Vistas", "Modificadores", "Cada modificador devuelve una vista nueva que envuelve a la anterior, por eso el orden cambia el resultado.", code`
Text("Hola")
    .padding()
    .background(Color.blue)
    .foregroundStyle(.white)
    .clipShape(RoundedRectangle(cornerRadius: 8))`, "estilo modificador padding fondo"),
    a("Concurrencia", "task y async", "El modificador task corre trabajo asincrónico cuando aparece la vista y lo cancela cuando desaparece.", code`
struct Perfil: View {
    @State private var nombre = "Cargando..."

    var body: some View {
        Text(nombre)
            .task {
                nombre = await cargarNombre()
            }
    }

    func cargarNombre() async -> String {
        try? await Task.sleep(for: .seconds(1))
        return "Ana"
    }
}`, "asincronico async await carga red"),
    b("Vistas", "Image y símbolos del sistema", "Image(systemName:) dibuja un símbolo de SF Symbols, que se estila como texto.", code`
Image(systemName: "heart.fill")
    .foregroundStyle(.red)
    .font(.largeTitle)`, "imagen icono simbolo sf symbols"),
    m("Formularios", "Form y TextField", "Form agrupa controles con el estilo de la plataforma; TextField y Stepper se enlazan al estado con $.", code`
struct Registro: View {
    @State private var nombre = ""
    @State private var edad = 18

    var body: some View {
        Form {
            TextField("Nombre", text: $nombre)
            Stepper("Edad: \(edad)", value: $edad, in: 0...120)
        }
    }
}`, "formulario campo texto stepper"),
    a("Calidad", "Vista previa con #Preview", "#Preview muestra la vista en el lienzo de Xcode sin correr la app, con los datos que elijas.", code`
#Preview {
    Saludo(nombre: "Ana")
}`, "preview lienzo xcode prueba"),
  ],
  clase: claseSwiftui,
};

export const compose: Framework = {
  id: "compose",
  name: "Jetpack Compose",
  group: "Frameworks",
  emblem: null,
  badge: "JC",
  color: "#3ddc84",
  hl: "kotlin",
  langs: ["kotlin"],
  projects: ["p16"],
  summary:
    "El kit de Android para armar interfaces con funciones de Kotlin. Cada parte de la pantalla es una función " +
    "@Composable; cuando cambia el estado, Compose vuelve a ejecutar solo las funciones que lo leen.",
  facts: [
    { label: "Archivos", value: ".kt (funciones @Composable)" },
    { label: "Crear proyecto", value: "Android Studio: New Project > Empty Activity" },
    { label: "Versión de referencia", value: "Compose con Kotlin 2.x" },
    { label: "Se usa con", value: "ViewModel, Navigation, Coroutines, Material 3" },
  ],
  workflow: [
    { title: "Funciones pequeñas", text: "Cada composable hace una cosa y recibe lo que necesita por parámetro, sin buscar datos por su cuenta." },
    { title: "El estado sube", text: "El composable que muestra un dato no lo posee: recibe el valor y un callback para cambiarlo (state hoisting)." },
    { title: "Modifier como último paso", text: "Casi todos los composables aceptan un Modifier con valor por defecto: así quien llama puede ajustar tamaño y márgenes." },
    { title: "Sin trabajo pesado al componer", text: "Una función puede ejecutarse muchas veces: las cargas van en LaunchedEffect o en el ViewModel, no en el cuerpo." },
  ],
  entries: [
    b("Funciones composable", "@Composable", "Una función marcada @Composable describe una parte de la pantalla; se vuelve a ejecutar cuando cambian sus datos.", code`
@Composable
fun Saludo(nombre: String) {
    Text(text = "Hola, $nombre")
}`, "funcion composable text pantalla"),
    b("Layouts", "Column, Row y Modifier", "Column y Row ordenan en vertical y horizontal; Modifier ajusta tamaño, márgenes y comportamiento.", code`
Column(modifier = Modifier.padding(16.dp)) {
    Text("Título", style = MaterialTheme.typography.titleLarge)
    Row(verticalAlignment = Alignment.CenterVertically) {
        Icon(Icons.Default.Star, contentDescription = null)
        Text("4.8")
    }
}`, "layout columna fila modifier padding"),
    b("Estado", "remember y mutableStateOf", "remember conserva un valor entre ejecuciones y mutableStateOf avisa a Compose cuando cambia.", code`
@Composable
fun Contador() {
    var cuenta by remember { mutableStateOf(0) }

    Button(onClick = { cuenta++ }) {
        Text("Tocaste $cuenta veces")
    }
}`, "estado remember contador boton"),
    b("Listas", "LazyColumn", "LazyColumn dibuja solo las filas que se ven, como un RecyclerView sin adaptador.", code`
@Composable
fun Tareas(tareas: List<String>) {
    LazyColumn {
        items(tareas) { tarea ->
            Text(tarea, modifier = Modifier.padding(8.dp))
        }
    }
}`, "lista filas lazy items"),
    m("Estado", "Elevar el estado", "El composable recibe el valor y un callback en vez de poseer el estado: queda reutilizable y fácil de probar.", code`
@Composable
fun Interruptor(activo: Boolean, alCambiar: (Boolean) -> Unit) {
    Switch(checked = activo, onCheckedChange = alCambiar)
}

@Composable
fun Ajustes() {
    var notificaciones by remember { mutableStateOf(true) }
    Interruptor(activo = notificaciones, alCambiar = { notificaciones = it })
}`, "state hoisting elevar estado callback"),
    m("Navegación", "NavHost", "NavHost cambia de pantalla según la ruta; cada pantalla se declara con composable.", code`
val navController = rememberNavController()

NavHost(navController = navController, startDestination = "lista") {
    composable("lista") { Lista(alAbrir = { navController.navigate("detalle/$it") }) }
    composable("detalle/{id}") { entrada -> Detalle(entrada.arguments?.getString("id")) }
}`, "navegacion rutas pantallas navcontroller"),
    m("Datos", "ViewModel y StateFlow", "El ViewModel guarda el estado de la pantalla y sobrevive a los giros; la interfaz lo observa con collectAsState.", code`
class TareasViewModel : ViewModel() {
    private val _tareas = MutableStateFlow(listOf<String>())
    val tareas: StateFlow<List<String>> = _tareas

    fun agregar(nombre: String) {
        _tareas.value = _tareas.value + nombre
    }
}

@Composable
fun Pantalla(viewModel: TareasViewModel = viewModel()) {
    val tareas by viewModel.tareas.collectAsState()
    Tareas(tareas)
}`, "viewmodel flow estado arquitectura"),
    m("Estilo", "El orden de los Modifier", "Los modificadores se aplican en el orden en que se escriben: un padding antes o después del fondo cambia el resultado.", code`
Box(
    modifier = Modifier
        .size(100.dp)
        .background(Color.Blue)
        .padding(16.dp)
        .clickable { }
)`, "modifier orden fondo padding click"),
    a("Efectos", "LaunchedEffect", "Corre una corrutina cuando el composable entra en pantalla y la reinicia si cambia la clave.", code`
@Composable
fun Perfil(id: String) {
    var nombre by remember { mutableStateOf("Cargando...") }

    LaunchedEffect(id) {
        nombre = cargarNombre(id)
    }

    Text(nombre)
}`, "efecto corrutina carga red"),
    b("Texto y botones", "Text y Button", "Text muestra texto; Button recibe qué hacer al tocarlo y su contenido como otro composable.", code`
Button(onClick = { guardar() }) {
    Text("Guardar")
}`, "boton texto click"),
    m("Formularios", "TextField", "Un campo de texto recibe su valor y avisa cada cambio: el estado vive afuera, en el composable que lo usa.", code`
var nombre by remember { mutableStateOf("") }

TextField(
    value = nombre,
    onValueChange = { nombre = it },
    label = { Text("Nombre") }
)`, "campo texto formulario entrada"),
    a("Calidad", "@Preview", "@Preview muestra un composable en Android Studio sin correr la app.", code`
@Preview(showBackground = true)
@Composable
fun SaludoPreview() {
    Saludo("Ana")
}`, "preview vista previa android studio"),
  ],
  clase: claseCompose,
};

export const laravel: Framework = {
  id: "laravel",
  name: "Laravel",
  group: "Frameworks",
  emblem: null,
  badge: "LV",
  color: "#ff2d20",
  hl: "php",
  langs: ["php"],
  projects: ["p17"],
  summary:
    "El framework web más usado de PHP. Trae rutas, controladores, plantillas Blade, un ORM (Eloquent), migraciones, " +
    "validación, colas y pruebas listas. La idea es que lo repetitivo ya esté resuelto y se escriba solo lo propio.",
  facts: [
    { label: "Crear proyecto", value: "composer create-project laravel/laravel app" },
    { label: "Ejecutar", value: "php artisan serve" },
    { label: "Versión de referencia", value: "Laravel 12" },
    { label: "Se usa con", value: "Eloquent, Blade, Livewire, Pest" },
  ],
  workflow: [
    { title: "Artisan genera lo repetitivo", text: "php artisan make:model, make:controller y make:migration crean los archivos con la estructura correcta." },
    { title: "Controladores finos", text: "El controlador recibe el pedido, delega y devuelve una respuesta. La lógica de negocio va en servicios o modelos." },
    { title: "Validar siempre en el servidor", text: "Todo dato que llega de afuera se valida con validate() o con un Form Request antes de usarlo." },
    { title: "Migraciones en el repositorio", text: "Cada cambio en la base va en una migración: así todo el equipo y el servidor llegan al mismo esquema." },
  ],
  entries: [
    b("Rutas", "Route::get", "routes/web.php conecta una URL con la función que responde; las llaves capturan partes de la URL.", code`
<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('inicio');
});

Route::get('/usuarios/{id}', function (string $id) {
    return "Usuario $id";
});`, "ruta url web get parametro"),
    b("Controladores", "Controller", "Un controlador agrupa las acciones de un recurso: listar, mostrar, crear.", code`
<?php

namespace App\Http\Controllers;

use App\Models\Libro;

class LibroController extends Controller
{
    public function index()
    {
        return view('libros.index', ['libros' => Libro::all()]);
    }

    public function show(Libro $libro)
    {
        return view('libros.show', ['libro' => $libro]);
    }
}`, "controlador accion index show vista"),
    b("Vistas", "Blade", "Blade son plantillas HTML con directivas como @foreach y {{ }}, que escapa el contenido por defecto.", code`
@foreach ($libros as $libro)
    <li>{{ $libro->titulo }} - {{ $libro->autor }}</li>
@endforeach`, "blade plantilla html foreach"),
    b("Modelos", "Eloquent", "Cada tabla tiene un modelo: se consulta, se crea y se guarda con métodos encadenados.", code`
<?php

use App\Models\Libro;

$libros = Libro::where('autor', 'Borges')->orderBy('titulo')->get();

$libro = Libro::find(1);
$libro->titulo = 'Ficciones';
$libro->save();

Libro::create(['titulo' => 'El Aleph', 'autor' => 'Borges']);`, "orm modelo consulta base datos"),
    m("Base de datos", "Migraciones", "Una migración describe un cambio en el esquema: up lo aplica y down lo deshace.", code`
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('libros', function (Blueprint $tabla) {
            $tabla->id();
            $tabla->string('titulo');
            $tabla->string('autor');
            $tabla->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('libros');
    }
};`, "migracion esquema tabla artisan"),
    m("Validación", "validate", "validate comprueba los datos del pedido; si algo falla, vuelve al formulario con los mensajes.", code`
<?php

class LibroController extends Controller
{
    public function store(Request $request)
    {
        $datos = $request->validate([
            'titulo' => 'required|string|max:255',
            'autor' => 'required|string',
        ]);

        Libro::create($datos);

        return redirect()->route('libros.index');
    }
}`, "validacion formulario request reglas"),
    m("Modelos", "hasMany y belongsTo", "Las relaciones se declaran como métodos del modelo y se usan como propiedades.", code`
<?php

class Autor extends Model
{
    public function libros()
    {
        return $this->hasMany(Libro::class);
    }
}

class Libro extends Model
{
    public function autor()
    {
        return $this->belongsTo(Autor::class);
    }
}`, "relaciones uno a muchos eloquent"),
    m("Rutas", "Middleware y grupos", "Un middleware filtra los pedidos antes de llegar al controlador; los grupos lo aplican a varias rutas.", code`
<?php

use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::get('/panel', [PanelController::class, 'index']);
    Route::resource('libros', LibroController::class);
});`, "middleware auth grupo resource"),
    a("Servicios", "Inyección de dependencias", "El contenedor de servicios arma las clases que se piden en el constructor, sin new.", code`
<?php

class PrestamoController extends Controller
{
    public function __construct(private PrestamoService $prestamos)
    {
    }

    public function store(Request $request)
    {
        $this->prestamos->prestar($request->integer('libro'), $request->string('persona'));

        return back();
    }
}`, "contenedor servicio inyeccion constructor"),
    m("Rutas", "Route::resource", "Una sola línea registra las siete rutas de un recurso: index, create, store, show, edit, update y destroy.", code`
<?php

use Illuminate\Support\Facades\Route;

Route::resource('libros', LibroController::class);`, "recurso crud rutas controlador"),
    a("Colas", "Jobs y colas", "Un job mueve trabajo lento (correos, informes) fuera del pedido: se encola y un worker lo ejecuta.", code`
<?php

class EnviarRecordatorio implements ShouldQueue
{
    use Queueable;

    public function __construct(private Prestamo $prestamo)
    {
    }

    public function handle(): void
    {
        Mail::to($this->prestamo->correo)->send(new Recordatorio($this->prestamo));
    }
}

EnviarRecordatorio::dispatch($prestamo);`, "cola job trabajo segundo plano worker"),
    a("Calidad", "Tests de feature", "Una prueba de feature hace pedidos HTTP a la aplicación y revisa la respuesta.", code`
<?php

use Tests\TestCase;

class LibrosTest extends TestCase
{
    public function test_lista_los_libros(): void
    {
        $respuesta = $this->get('/libros');

        $respuesta->assertStatus(200);
    }
}`, "test prueba http phpunit pest"),
  ],
  clase: claseLaravel,
};
