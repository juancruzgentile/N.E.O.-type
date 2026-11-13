// Frameworks: una sección de la Biblioteca que no aparece en ningún lado (ni en el menú, ni en la búsqueda) hasta
// que se gana. Cada framework se abre con la ruta de su lenguaje y el proyecto de ese framework. Las condiciones están
// en unlock.ts.
import type { CodeLangId } from "../types";
import { type Topic, a, b, code, m } from "./types";
import { compose, laravel, swiftui } from "./frameworks-moviles";
import { claseDjango } from "./clases/django";
import { claseFastapi } from "./clases/fastapi";
import { claseReact } from "./clases/react";
import { claseSpring } from "./clases/spring";

export interface Framework extends Topic {
  /** se desbloquea con cualquiera de estos lenguajes: su ruta completa y un proyecto que lo use */
  langs: CodeLangId[];
  /** ids de los proyectos que lo abren, junto con la ruta del lenguaje: alcanza con terminar uno de ellos */
  projects: string[];
}

export const react: Framework = {
  id: "react",
  name: "React",
  group: "Frameworks",
  emblem: null,
  badge: "RE",
  color: "#61dafb",
  hl: "typescript",
  langs: ["typescript", "javascript"],
  projects: ["p18"],
  summary:
    "Biblioteca de Meta para armar interfaces con componentes: funciones que reciben datos (props) y devuelven lo que " +
    "se ve, escrito en JSX. Cuando cambia el estado, React vuelve a dibujar solo lo necesario. Con TypeScript, los " +
    "componentes quedan tipados de punta a punta.",
  facts: [
    { label: "Archivos", value: ".tsx (componentes) · .ts" },
    { label: "Crear proyecto", value: "npm create vite@latest (plantilla react-ts)" },
    { label: "Versión de referencia", value: "React 19" },
    { label: "Se usa con", value: "Vite, Next.js, React Router, TanStack Query" },
  ],
  workflow: [
    { title: "Componentes chicos", text: "Cada componente hace una cosa. Si un archivo crece mucho, se parte en componentes más chicos." },
    { title: "El estado, lo más arriba que haga falta", text: "Cada dato vive en un solo lugar: el componente que lo comparte con sus hijos." },
    { title: "Derivá en vez de duplicar", text: "Lo que se puede calcular a partir del estado no se guarda como otro estado." },
    { title: "Efectos solo para el exterior", text: "useEffect es para sincronizar con algo fuera de React (red, timers, el DOM), no para calcular." },
  ],
  entries: [
    b("Componentes", "Componente y JSX", "Una función que devuelve JSX. Las expresiones van entre llaves.", code`
function Saludo({ nombre }: { nombre: string }) {
  return <h1>Hola, {nombre}</h1>;
}

export default function App() {
  return <Saludo nombre="Ana" />;
}`, "componente jsx funcion"),
    b("Componentes", "Props con tipos", "Las props se describen con un type o una interface; children es el contenido de adentro.", code`
type TarjetaProps = {
  titulo: string;
  destacada?: boolean;
  children: React.ReactNode;
};

function Tarjeta({ titulo, destacada = false, children }: TarjetaProps) {
  return (
    <section className={destacada ? "tarjeta destacada" : "tarjeta"}>
      <h2>{titulo}</h2>
      {children}
    </section>
  );
}`, "props propiedades children"),
    b("Estado", "useState", "Guarda un valor que, al cambiar, vuelve a dibujar el componente.", code`
import { useState } from "react";

function Contador() {
  const [cuenta, setCuenta] = useState(0);
  return <button onClick={() => setCuenta((c) => c + 1)}>Clicks: {cuenta}</button>;
}`, "estado state hook"),
    b("Listas", "Listas con key", "map convierte datos en elementos; key identifica cada uno entre renders.", code`
function ListaDeTareas({ tareas }: { tareas: { id: number; titulo: string }[] }) {
  return (
    <ul>
      {tareas.map((t) => (
        <li key={t.id}>{t.titulo}</li>
      ))}
    </ul>
  );
}`, "lista map key"),

    m("Formularios", "Formulario controlado", "El valor del input sale del estado y cada cambio lo actualiza.", code`
function Buscador({ onBuscar }: { onBuscar: (texto: string) => void }) {
  const [texto, setTexto] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onBuscar(texto);
      }}
    >
      <input value={texto} onChange={(e) => setTexto(e.target.value)} />
      <button disabled={!texto.trim()}>Buscar</button>
    </form>
  );
}`, "formulario input evento"),
    m("Efectos", "useEffect y fetch", "Sincroniza con algo externo. La función que devuelve limpia (acá, cancela el pedido).", code`
function Usuario({ id }: { id: number }) {
  const [nombre, setNombre] = useState<string | null>(null);

  useEffect(() => {
    const control = new AbortController();
    fetch(\`/api/usuarios/\${id}\`, { signal: control.signal })
      .then((r) => r.json())
      .then((u) => setNombre(u.nombre))
      .catch(() => {});
    return () => control.abort();
  }, [id]);

  return <p>{nombre ?? "Cargando…"}</p>;
}`, "efecto effect fetch api"),
    m("Hooks", "Hook propio", "Una función que empieza con use y combina otros hooks para reutilizar lógica.", code`
function useLocalStorage<T>(clave: string, inicial: T) {
  const [valor, setValor] = useState<T>(() => {
    const guardado = localStorage.getItem(clave);
    return guardado ? (JSON.parse(guardado) as T) : inicial;
  });
  useEffect(() => {
    localStorage.setItem(clave, JSON.stringify(valor));
  }, [clave, valor]);
  return [valor, setValor] as const;
}`, "custom hook reutilizar"),
    m("Estado", "Context", "Comparte un valor con todo un árbol de componentes sin pasarlo prop por prop.", code`
const TemaContext = createContext<"claro" | "oscuro">("claro");

function App() {
  return (
    <TemaContext.Provider value="oscuro">
      <Barra />
    </TemaContext.Provider>
  );
}

function Barra() {
  const tema = useContext(TemaContext);
  return <nav className={tema}>Menú</nav>;
}`, "context contexto global"),

    a("Estado", "useReducer", "Para estado con varias transiciones: una función (el reducer) recibe el estado y una acción y devuelve el nuevo. El reducer va afuera; useReducer, como todo hook, se llama dentro de un componente.", code`
type Accion = { tipo: "agregar"; texto: string } | { tipo: "borrar"; id: number };

function tareas(estado: Tarea[], accion: Accion): Tarea[] {
  switch (accion.tipo) {
    case "agregar":
      return [...estado, { id: Date.now(), texto: accion.texto }];
    case "borrar":
      return estado.filter((t) => t.id !== accion.id);
  }
}

function Tareas() {
  const [lista, despachar] = useReducer(tareas, []);
  return (
    <button onClick={() => despachar({ tipo: "agregar", texto: "Nueva" })}>
      Agregar ({lista.length})
    </button>
  );
}`, "reducer estado complejo"),
    a("Rendimiento", "useMemo y memo", "useMemo (dentro del componente) evita recalcular y memo (afuera, envolviendo un componente) evita volver a dibujarlo si sus props no cambiaron. Medí antes de usarlos.", code`
const Fila = memo(function Fila({ producto }: { producto: Producto }) {
  return <tr><td>{producto.nombre}</td></tr>;
});

function Tabla({ productos }: { productos: Producto[] }) {
  const ordenados = useMemo(
    () => [...productos].sort((x, y) => x.precio - y.precio),
    [productos],
  );
  return <table><tbody>{ordenados.map((p) => <Fila key={p.id} producto={p} />)}</tbody></table>;
}`, "memo rendimiento optimizar"),
    a("Rutas", "React Router", "Páginas con su propia URL dentro de la app; useParams lee los parámetros.", code`
import { BrowserRouter, Route, Routes, useParams } from "react-router";

function Producto() {
  const { id } = useParams();
  return <h1>Producto {id}</h1>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/productos/:id" element={<Producto />} />
      </Routes>
    </BrowserRouter>
  );
}`, "router rutas paginas navegacion"),
    a("Herramientas", "Vite y tests", "Vite crea y sirve el proyecto; Vitest con Testing Library prueba los componentes como los usa una persona.", code`
npm create vite@latest mi-app -- --template react-ts
cd mi-app
npm install
npm run dev
npm install -D vitest @testing-library/react`, "vite crear proyecto test"),
  ],
  clase: claseReact,
};

export const fastapi: Framework = {
  id: "fastapi",
  name: "FastAPI",
  group: "Frameworks",
  emblem: null,
  badge: "FA",
  color: "#05998b",
  hl: "python",
  langs: ["python"],
  projects: ["p12", "p14", "p10"],
  summary:
    "Framework de Python para APIs web. Los tipos de Python definen qué entra y qué sale: con ellos valida los datos " +
    "(con Pydantic), convierte a JSON y arma la documentación interactiva en /docs sin escribir nada más.",
  facts: [
    { label: "Instalar", value: "pip install \"fastapi[standard]\"" },
    { label: "Ejecutar", value: "fastapi dev main.py" },
    { label: "Documentación", value: "/docs (Swagger) y /redoc, generadas solas" },
    { label: "Se usa con", value: "Pydantic, SQLModel o SQLAlchemy, Uvicorn" },
  ],
  workflow: [
    { title: "Modelos para todo lo que entra", text: "Un BaseModel por cada cuerpo de pedido: la validación y los errores 422 salen solos." },
    { title: "Routers por tema", text: "APIRouter separa usuarios, pedidos, etc. en archivos y se incluyen en la app." },
    { title: "Dependencias con Depends", text: "La sesión de base de datos, el usuario autenticado y la configuración llegan por Depends." },
    { title: "Tests con TestClient", text: "Se prueban los endpoints sin levantar el servidor; las dependencias se reemplazan con dependency_overrides." },
  ],
  entries: [
    b("Rutas", "App y rutas", "Cada función decorada responde a un método y una ruta. Lo que devuelve se convierte en JSON.", code`
from fastapi import FastAPI

app = FastAPI()


@app.get("/")
def inicio():
    return {"mensaje": "hola"}`, "app ruta endpoint get"),
    b("Rutas", "Parámetros de ruta y de query", "Lo que está en la ruta es parámetro de ruta; el resto, query. El tipo los convierte y valida.", code`
@app.get("/productos/{producto_id}")
def ver_producto(producto_id: int, con_stock: bool = False):
    return {"id": producto_id, "con_stock": con_stock}`, "parametro query path"),
    b("Modelos", "Cuerpo con Pydantic", "Un BaseModel describe el JSON que llega. Si no cumple, responde 422 con el detalle.", code`
from pydantic import BaseModel, Field


class ProductoNuevo(BaseModel):
    nombre: str = Field(min_length=1)
    precio: float = Field(gt=0)
    stock: int = 0


@app.post("/productos", status_code=201)
def crear(producto: ProductoNuevo):
    return producto`, "pydantic modelo body validacion"),
    b("Errores", "HTTPException", "Corta el pedido con un código y un detalle.", code`
from fastapi import HTTPException


@app.get("/usuarios/{uid}")
def ver_usuario(uid: int):
    if uid not in usuarios:
        raise HTTPException(status_code=404, detail="No existe")
    return usuarios[uid]`, "error 404 excepcion"),

    m("Dependencias", "Depends", "Una función que FastAPI llama antes del endpoint y cuyo resultado inyecta.", code`
from typing import Annotated

from fastapi import Depends, Header


def usuario_actual(authorization: Annotated[str, Header()]) -> str:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401)
    return authorization.removeprefix("Bearer ")


@app.get("/perfil")
def perfil(usuario: Annotated[str, Depends(usuario_actual)]):
    return {"usuario": usuario}`, "dependencia inyeccion auth"),
    m("Organización", "APIRouter", "Agrupa rutas con un prefijo y etiquetas para la documentación.", code`
from fastapi import APIRouter

router = APIRouter(prefix="/pedidos", tags=["pedidos"])


@router.get("/")
def listar():
    return []


app.include_router(router)`, "router modulo prefijo"),
    m("Modelos", "response_model", "Define qué se devuelve: filtra campos que no deben salir, como contraseñas.", code`
class UsuarioPublico(BaseModel):
    id: int
    email: str


@app.get("/usuarios/{uid}", response_model=UsuarioPublico)
def ver(uid: int):
    return usuarios_db[uid]`, "respuesta salida filtrar"),
    m("Herramientas", "fastapi dev", "Levanta el servidor con recarga automática; fastapi run es para producción.", code`
pip install "fastapi[standard]"
fastapi dev main.py
fastapi run main.py --port 8000`, "servidor ejecutar uvicorn"),

    m("Datos", "Base de datos con SQLModel", "Modelos que son a la vez tabla y esquema de Pydantic; la sesión llega por Depends.", code`
from sqlmodel import Field, Session, SQLModel, create_engine, select


class Tarea(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    titulo: str
    hecha: bool = False


engine = create_engine("sqlite:///tareas.db")


def sesion():
    with Session(engine) as s:
        yield s


@app.get("/tareas")
def listar(s: Annotated[Session, Depends(sesion)]):
    return s.exec(select(Tarea)).all()`, "base datos sqlmodel orm sesion"),
    a("Async", "async def y tareas en segundo plano", "Los endpoints async no bloquean mientras esperan. BackgroundTasks corre algo después de responder.", code`
from fastapi import BackgroundTasks


async def enviar_mail(destino: str) -> None:
    ...


@app.post("/registro")
async def registrar(email: str, tareas: BackgroundTasks):
    tareas.add_task(enviar_mail, email)
    return {"ok": True}`, "async background asincrono"),
    a("Ciclo de vida", "lifespan", "Código que corre al arrancar y al apagar la app (conexiones, modelos cargados en memoria).", code`
from contextlib import asynccontextmanager


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.db = await conectar()
    yield
    await app.state.db.close()


app = FastAPI(lifespan=lifespan)`, "startup shutdown inicio"),
    a("Tests", "TestClient", "Prueba los endpoints sin servidor. dependency_overrides reemplaza dependencias.", code`
from fastapi.testclient import TestClient

app.dependency_overrides[usuario_actual] = lambda: "ana@test"
cliente = TestClient(app)


def test_perfil():
    respuesta = cliente.get("/perfil")
    assert respuesta.status_code == 200
    assert respuesta.json() == {"usuario": "ana@test"}`, "test prueba pytest"),
  ],
  clase: claseFastapi,
};

export const django: Framework = {
  id: "django",
  name: "Django",
  group: "Frameworks",
  emblem: null,
  badge: "DJ",
  color: "#44b78b",
  hl: "python",
  langs: ["python"],
  projects: ["p19"],
  summary:
    "Framework web de Python \"con pilas incluidas\": ORM, migraciones, panel de administración, autenticación, " +
    "formularios y plantillas vienen de fábrica. Un proyecto se divide en apps, cada una con sus modelos, vistas y URLs.",
  facts: [
    { label: "Crear proyecto", value: "django-admin startproject sitio" },
    { label: "Ejecutar", value: "python manage.py runserver" },
    { label: "Versión de referencia", value: "Django 5.2 LTS" },
    { label: "Se usa con", value: "PostgreSQL, Django REST Framework, Celery" },
  ],
  workflow: [
    { title: "Una app por tema", text: "python manage.py startapp crea una app; cada una con models.py, views.py, urls.py y admin.py." },
    { title: "Migraciones siempre", text: "Cada cambio en un modelo se convierte en migración con makemigrations y se aplica con migrate." },
    { title: "El admin es gratis", text: "Registrar un modelo en admin.py da una interfaz completa para cargar y editar datos." },
    { title: "Configuración por entorno", text: "DEBUG, SECRET_KEY y la base de datos salen de variables de entorno, nunca hardcodeadas." },
  ],
  entries: [
    b("Modelos", "Modelos", "Una clase por tabla; cada atributo es una columna.", code`
from django.db import models


class Producto(models.Model):
    nombre = models.CharField(max_length=120)
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)
    disponible = models.BooleanField(default=True)
    creado = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nombre`, "modelo tabla orm"),
    b("Vistas", "Vistas", "Una función recibe el pedido y devuelve una respuesta (HTML con render o JSON).", code`
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, render


def lista(request):
    productos = Producto.objects.filter(disponible=True)
    return render(request, "tienda/lista.html", {"productos": productos})


def detalle(request, pk):
    producto = get_object_or_404(Producto, pk=pk)
    return JsonResponse({"nombre": producto.nombre})`, "vista view request"),
    b("URLs", "urls.py", "Conecta rutas con vistas; los convertidores (<int:pk>) validan el tipo.", code`
from django.urls import path

from . import views

urlpatterns = [
    path("", views.lista, name="lista"),
    path("<int:pk>/", views.detalle, name="detalle"),
]`, "url ruta path"),
    b("Herramientas", "manage.py", "Los comandos de todos los días.", code`
python manage.py startapp tienda
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver`, "comandos migraciones servidor"),

    m("ORM", "Consultas", "filter, exclude, order_by y los lookups con doble guion bajo. Las consultas son perezosas.", code`
baratos = Producto.objects.filter(precio__lt=1000).order_by("precio")
con_nombre = Producto.objects.filter(nombre__icontains="yerba")
ultimo = Producto.objects.latest("creado")
cantidad = Producto.objects.exclude(disponible=False).count()`, "query consulta filter orm"),
    m("ORM", "Relaciones", "ForeignKey para muchos a uno y ManyToManyField para muchos a muchos.", code`
class Pedido(models.Model):
    cliente = models.ForeignKey("auth.User", on_delete=models.CASCADE, related_name="pedidos")
    productos = models.ManyToManyField(Producto)


pedidos = request.user.pedidos.prefetch_related("productos")`, "relacion foreign key muchos"),
    m("Admin", "Panel de administración", "Registrar un modelo y elegir qué columnas, filtros y búsquedas mostrar.", code`
from django.contrib import admin


@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ["nombre", "precio", "disponible"]
    list_filter = ["disponible"]
    search_fields = ["nombre"]`, "admin panel"),
    m("Formularios", "ModelForm", "Un formulario armado a partir del modelo, con validación incluida.", code`
from django import forms


class ProductoForm(forms.ModelForm):
    class Meta:
        model = Producto
        fields = ["nombre", "precio"]


form = ProductoForm(request.POST or None)
if form.is_valid():
    form.save()`, "formulario form validar"),

    m("Usuarios", "login_required y permisos", "Restringen una vista a usuarios logueados o con un permiso.", code`
from django.contrib.auth.decorators import login_required, permission_required


@login_required
def mi_cuenta(request):
    return render(request, "cuenta.html", {"usuario": request.user})


@permission_required("tienda.change_producto")
def editar(request, pk):
    ...`, "login autenticacion permiso usuario"),
    a("Vistas", "Vistas basadas en clases", "ListView, DetailView y compañía resuelven los casos comunes con poca configuración.", code`
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import ListView


class MisPedidos(LoginRequiredMixin, ListView):
    template_name = "tienda/pedidos.html"
    paginate_by = 20

    def get_queryset(self):
        return self.request.user.pedidos.order_by("-id")`, "class based view cbv"),
    a("ORM", "Transacciones y F", "atomic agrupa cambios; F() hace la cuenta en la base, sin leer el valor antes, así dos pedidos a la vez no se pisan. Usa el modelo Producto de la entrada Modelos.", code`
from django.db import transaction
from django.db.models import F

with transaction.atomic():
    Producto.objects.filter(pk=pk).update(stock=F("stock") - 1)
    Pedido.objects.create(cliente=request.user)`, "transaccion atomic concurrencia"),
    a("Tests", "TestCase", "Cada test corre en una transacción que se deshace; el cliente simula pedidos.", code`
from django.test import TestCase
from django.urls import reverse


class ListaTests(TestCase):
    def test_muestra_disponibles(self):
        Producto.objects.create(nombre="Yerba", precio=3500)
        respuesta = self.client.get(reverse("lista"))
        self.assertContains(respuesta, "Yerba")`, "test prueba cliente"),
  ],
  clase: claseDjango,
};

export const spring: Framework = {
  id: "spring",
  name: "Spring Boot",
  group: "Frameworks",
  emblem: null,
  badge: "SB",
  color: "#6db33f",
  hl: "java",
  langs: ["java"],
  projects: ["p20"],
  summary:
    "El framework más usado en back-end con Java. Spring Boot arranca una aplicación lista para producción con " +
    "configuración automática: servidor web embebido, inyección de dependencias, acceso a datos con JPA, seguridad " +
    "y métricas.",
  facts: [
    { label: "Crear proyecto", value: "start.spring.io (Maven o Gradle)" },
    { label: "Ejecutar", value: "./mvnw spring-boot:run" },
    { label: "Versión de referencia", value: "Spring Boot 3.5 · Java 21" },
    { label: "Configuración", value: "application.properties o application.yml" },
  ],
  workflow: [
    { title: "Capas", text: "Controller (HTTP) → Service (reglas del negocio) → Repository (datos). Cada una se prueba por separado." },
    { title: "Inyección por constructor", text: "Las dependencias llegan por el constructor: final, sin @Autowired en campos." },
    { title: "DTOs con records", text: "Lo que entra y sale por la API son records; las entidades JPA no se exponen directo." },
    { title: "Perfiles", text: "application-dev.yml y application-prod.yml separan la configuración de cada entorno." },
  ],
  entries: [
    b("Inicio", "@SpringBootApplication", "La clase principal arranca todo: escaneo de componentes y configuración automática.", code`
@SpringBootApplication
public class TiendaApplication {
    public static void main(String[] args) {
        SpringApplication.run(TiendaApplication.class, args);
    }
}`, "main inicio aplicacion"),
    b("Web", "@RestController", "Cada método atiende una ruta; lo que devuelve se convierte en JSON.", code`
@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    @GetMapping
    public List<ProductoDto> listar() {
        return List.of(new ProductoDto(1L, "Yerba", 3500));
    }

    @GetMapping("/{id}")
    public ProductoDto ver(@PathVariable Long id) {
        return new ProductoDto(id, "Yerba", 3500);
    }
}`, "controlador rest endpoint"),
    b("Web", "DTO con record", "Un record describe el JSON que entra o sale.", code`
public record ProductoDto(Long id, String nombre, double precio) {
}`, "dto record json"),
    b("Herramientas", "Maven wrapper", "Compila, prueba y levanta la app sin instalar Maven.", code`
./mvnw spring-boot:run
./mvnw test
./mvnw package`, "maven compilar ejecutar"),

    m("Servicios", "@Service e inyección", "La lógica va en servicios; las dependencias llegan por el constructor.", code`
@Service
public class PedidoService {
    private final PedidoRepository pedidos;

    public PedidoService(PedidoRepository pedidos) {
        this.pedidos = pedidos;
    }

    public Pedido confirmar(Long id) {
        var pedido = pedidos.findById(id).orElseThrow();
        pedido.setConfirmado(true);
        return pedidos.save(pedido);
    }
}`, "servicio inyeccion dependencia"),
    m("Datos", "Entidad JPA", "Una clase que se guarda en una tabla.", code`
@Entity
public class Pedido {
    @Id
    @GeneratedValue
    private Long id;

    private String cliente;
    private boolean confirmado;

    protected Pedido() {
    }
}`, "entidad jpa tabla"),
    m("Datos", "Repositorios", "Una interfaz alcanza: Spring Data genera las consultas a partir del nombre del método.", code`
public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    List<Pedido> findByConfirmadoFalse();
    Optional<Pedido> findFirstByClienteOrderByIdDesc(String cliente);
}`, "repositorio consultas spring data"),
    m("Web", "Validación", "Las anotaciones de Bean Validation sobre el DTO y @Valid en el controlador.", code`
public record NuevoProducto(@NotBlank String nombre, @Positive double precio) {
}

@PostMapping
public ResponseEntity<ProductoDto> crear(@Valid @RequestBody NuevoProducto nuevo) {
    var creado = servicio.crear(nuevo);
    return ResponseEntity.created(URI.create("/api/productos/" + creado.id())).body(creado);
}`, "validacion valid body"),

    m("Configuración", "@ConfigurationProperties", "Una sección de application.yml se lee como un record con tipos.", code`
@ConfigurationProperties(prefix = "tienda.envios")
public record EnviosProperties(String proveedor, int diasMaximos) {
}

@SpringBootApplication
@EnableConfigurationProperties(EnviosProperties.class)
public class TiendaApplication {
}`, "configuracion propiedades yml"),
    a("Web", "Manejo de errores", "@RestControllerAdvice traduce excepciones a respuestas HTTP con ProblemDetail.", code`
@RestControllerAdvice
public class Errores {
    @ExceptionHandler(NoSuchElementException.class)
    public ProblemDetail noEncontrado(NoSuchElementException e) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, "No existe");
    }
}`, "error excepcion 404 advice"),
    a("Datos", "@Transactional", "Todo lo del método se confirma junto o se deshace junto.", code`
@Transactional
public void transferir(Long origen, Long destino, BigDecimal monto) {
    var a = cuentas.findById(origen).orElseThrow();
    var b = cuentas.findById(destino).orElseThrow();
    a.debitar(monto);
    b.acreditar(monto);
}`, "transaccion jpa"),
    a("Tests", "Tests con MockMvc", "@WebMvcTest levanta solo la capa web; los servicios se reemplazan con @MockitoBean.", code`
@WebMvcTest(ProductoController.class)
class ProductoControllerTest {
    @Autowired
    MockMvc mvc;

    @Test
    void listaProductos() throws Exception {
        mvc.perform(get("/api/productos"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].nombre").value("Yerba"));
    }
}`, "test mockmvc prueba"),
  ],
  clase: claseSpring,
};

export const aspnet: Framework = {
  id: "aspnet",
  name: "ASP.NET Core",
  group: "Frameworks",
  emblem: null,
  badge: "NET",
  color: "#7a5cff",
  hl: "csharp",
  langs: ["csharp"],
  projects: ["p21"],
  summary:
    "El framework web de .NET para APIs, sitios y servicios en tiempo real. Con las minimal APIs, una API entera entra " +
    "en Program.cs; para proyectos grandes están los controladores. Trae inyección de dependencias, configuración y " +
    "logging integrados.",
  facts: [
    { label: "Crear proyecto", value: "dotnet new webapi" },
    { label: "Ejecutar", value: "dotnet watch run" },
    { label: "Versión de referencia", value: ".NET 10 LTS" },
    { label: "Se usa con", value: "Entity Framework Core, SignalR, Blazor" },
  ],
  workflow: [
    { title: "Program.cs arma todo", text: "Primero se registran servicios (builder.Services) y después se arma el pipeline y las rutas (app)." },
    { title: "Inyección de dependencias", text: "Los servicios se registran con su ciclo de vida (Singleton, Scoped, Transient) y llegan por parámetro." },
    { title: "Configuración por capas", text: "Se leen en este orden y cada fuente pisa a la anterior: appsettings.json, appsettings.{Entorno}.json, user-secrets (solo en Development), variables de entorno y argumentos de la línea de comandos." },
    { title: "EF Core con migraciones", text: "dotnet ef migrations add y dotnet ef database update mantienen la base al día con el modelo." },
  ],
  entries: [
    b("Inicio", "Minimal API", "Una API completa en Program.cs.", code`
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/", () => "Hola");
app.MapGet("/productos/{id:int}", (int id) => new { id, nombre = "Yerba" });

app.Run();`, "minimal api inicio"),
    b("Rutas", "Results y códigos HTTP", "Results devuelve respuestas tipadas: Ok, NotFound, Created.", code`
app.MapGet("/usuarios/{id}", (int id, UsuarioRepo repo) =>
    repo.Buscar(id) is { } usuario
        ? Results.Ok(usuario)
        : Results.NotFound());

app.MapPost("/usuarios", (NuevoUsuario nuevo, UsuarioRepo repo) =>
{
    var creado = repo.Crear(nuevo);
    return Results.Created($"/usuarios/{creado.Id}", creado);
});`, "results ok notfound created"),
    b("Datos", "Records como DTO", "Lo que entra y sale por la API.", code`
public record NuevoUsuario(string Nombre, string Email);
public record Usuario(int Id, string Nombre, string Email);`, "dto record"),
    b("Herramientas", "dotnet CLI", "Crear, ejecutar con recarga y probar.", code`
dotnet new webapi -n Tienda
cd Tienda
dotnet watch run
dotnet test`, "crear ejecutar watch"),

    m("Servicios", "Inyección de dependencias", "Se registran los servicios con su ciclo de vida y llegan por parámetro o constructor.", code`
builder.Services.AddSingleton<IReloj, RelojDelSistema>();
builder.Services.AddScoped<UsuarioRepo>();

public class UsuarioRepo(TiendaDb db)
{
    public Usuario? Buscar(int id) => db.Usuarios.Find(id);
}`, "inyeccion dependencia servicio"),
    m("Datos", "Entity Framework Core", "Un DbContext con un DbSet por tabla; las consultas se escriben con LINQ.", code`
public class TiendaDb(DbContextOptions<TiendaDb> options) : DbContext(options)
{
    public DbSet<Usuario> Usuarios => Set<Usuario>();
}

builder.Services.AddDbContext<TiendaDb>(o => o.UseSqlite("Data Source=tienda.db"));

var activos = await db.Usuarios.Where(u => u.Email.EndsWith("@empresa.com")).ToListAsync();`, "ef core dbcontext orm"),
    m("Rutas", "Grupos de rutas", "MapGroup comparte prefijo, filtros y autorización.", code`
var api = app.MapGroup("/api/pedidos").RequireAuthorization();
api.MapGet("/", (TiendaDb db) => db.Pedidos.ToListAsync());
api.MapDelete("/{id}", async (int id, TiendaDb db) =>
{
    var borrados = await db.Pedidos.Where(p => p.Id == id).ExecuteDeleteAsync();
    return borrados == 0 ? Results.NotFound() : Results.NoContent();
});`, "grupo prefijo rutas"),
    m("Configuración", "Opciones tipadas", "Una sección de appsettings.json se lee como una clase.", code`
public class OpcionesCorreo
{
    public string Servidor { get; set; } = "";
    public int Puerto { get; set; } = 587;
}

builder.Services.Configure<OpcionesCorreo>(builder.Configuration.GetSection("Correo"));`, "configuracion appsettings options"),

    m("Seguridad", "Autenticación con JWT", "Se registra el esquema y las rutas piden autorización.", code`
builder.Services.AddAuthentication().AddJwtBearer();
builder.Services.AddAuthorization();

var app = builder.Build();
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/perfil", (ClaimsPrincipal usuario) => usuario.Identity?.Name)
    .RequireAuthorization();`, "jwt autenticacion autorizacion token"),
    a("Pipeline", "Middleware", "Cada pedido pasa por una cadena; el orden importa.", code`
app.UseExceptionHandler("/error");
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.Use(async (contexto, siguiente) =>
{
    var inicio = DateTime.UtcNow;
    await siguiente(contexto);
    app.Logger.LogInformation("{Ruta} en {Ms} ms", contexto.Request.Path, (DateTime.UtcNow - inicio).TotalMilliseconds);
});`, "middleware pipeline orden"),
    a("Web", "Controladores", "Para APIs grandes: clases con atributos de ruta y validación automática.", code`
[ApiController]
[Route("api/[controller]")]
public class ProductosController(TiendaDb db) : ControllerBase
{
    [HttpGet("{id}")]
    public async Task<ActionResult<Producto>> Ver(int id) =>
        await db.Productos.FindAsync(id) is { } p ? p : NotFound();
}`, "controller atributos"),
    a("Tests", "WebApplicationFactory", "Levanta la app en memoria para probarla de punta a punta.", code`
public class ApiTests(WebApplicationFactory<Program> fabrica) : IClassFixture<WebApplicationFactory<Program>>
{
    [Fact]
    public async Task Inicio_responde_hola()
    {
        var cliente = fabrica.CreateClient();
        var texto = await cliente.GetStringAsync("/");
        Assert.Equal("Hola", texto);
    }
}`, "test integracion xunit"),
  ],
};

export const FRAMEWORKS: Framework[] = [react, fastapi, django, spring, aspnet, swiftui, compose, laravel];
