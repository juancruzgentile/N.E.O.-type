// Proyectos: programas completos que hay que escribir de punta a punta, sangrías
// incluidas, en el menor tiempo posible. Se desbloquean en orden.
//
// El orden lo da `num`, no el id: los ids no se cambian nunca porque los récords se guardan con ellos.
// Por eso el tablero full stack sigue siendo "p10" aunque ahora sea el proyecto 14.
//
// Reglas del contenido (las verifica `npm run check`):
// - solo ASCII imprimible, sin espacios al final de línea, sin ` ni ~ (no tienen tecla en el teclado italiano)
// - las sangrías con espacios son múltiplos de `tabWidth`; Go y Makefile usan tabulaciones reales
import type { LangId } from "../types";

export interface ProjectFile {
  /** ruta del archivo dentro del proyecto */
  name: string;
  /** resaltado de sintaxis */
  lang: LangId;
  /** ancho de la sangría; 0 si el archivo usa tabulaciones */
  tabWidth: number;
  text: string;
}

export interface Project {
  id: string;
  num: number;
  title: string;
  level: string;
  /** lenguajes y formatos que aparecen, para mostrar */
  stack: string[];
  desc: string;
  /** qué se practica, en pocas palabras */
  skills: string;
  files: ProjectFile[];
  /** id del proyecto que lo abre; si falta, se abre al terminar el anterior de la lista */
  after?: string;
}

/**
 * Bloque de código: quita el salto inicial y los espacios finales. Respeta las barras invertidas, salvo en \${,
 * que se escribe así para que no sea una interpolación de la plantilla.
 */
const src = (s: TemplateStringsArray) => String.raw(s).replace(/\\\$\{/g, "${").replace(/^\n/, "").replace(/\s+$/, "");
/** Igual que `src`, pero cada grupo de 4 espacios al principio de línea pasa a ser una tabulación. */
const tabs = (s: TemplateStringsArray) =>
  src(s).replace(/^(?: {4})+/gm, (m) => "\t".repeat(m.length / 4));

const py = (name: string, text: string): ProjectFile => ({ name, lang: "python", tabWidth: 4, text });
const html = (name: string, text: string): ProjectFile => ({ name, lang: "html", tabWidth: 2, text });

export const PROJECTS: Project[] = [
  {
    id: "p01",
    num: 1,
    title: "Calculadora de propinas",
    level: "Inicial",
    stack: ["Python"],
    desc: "Un programa de consola que pide el total, la propina y cuántas personas pagan, y reparte la cuenta.",
    skills: "funciones, input, f-strings y la sangría de 4 espacios de Python",
    files: [
      py("propinas.py", src`
def calcular_propina(total, porcentaje):
    return total * porcentaje / 100


def dividir_cuenta(total, personas):
    if personas <= 0:
        raise ValueError("Tiene que haber al menos una persona")
    return round(total / personas, 2)


def main():
    total = float(input("Total de la cuenta: "))
    porcentaje = int(input("Propina (%): "))
    personas = int(input("Cuantas personas pagan? "))

    propina = calcular_propina(total, porcentaje)
    cuenta = total + propina
    por_persona = dividir_cuenta(cuenta, personas)

    print(f"Propina: {propina:.2f}")
    print(f"Total con propina: {cuenta:.2f}")
    print(f"Cada persona paga: {por_persona:.2f}")


if __name__ == "__main__":
    main()
`),
    ],
  },
  {
    id: "p02",
    num: 2,
    title: "Lista de tareas",
    level: "Inicial",
    stack: ["JavaScript"],
    desc: "Una lista de tareas en memoria: agregar, completar, filtrar pendientes y mostrar un resumen.",
    skills: "objetos, arrays, find y filter, funciones flecha y bloques con llaves",
    files: [
      {
        name: "tareas.js", lang: "javascript", tabWidth: 2, text: src`
const tareas = [];
let siguienteId = 1;

function agregar(titulo, prioridad = "media") {
  const tarea = { id: siguienteId++, titulo, prioridad, hecha: false };
  tareas.push(tarea);
  return tarea;
}

function completar(id) {
  const tarea = tareas.find((t) => t.id === id);
  if (!tarea) {
    throw new Error("No existe la tarea " + id);
  }
  tarea.hecha = true;
}

function pendientes() {
  return tareas.filter((t) => !t.hecha);
}

function resumen() {
  const hechas = tareas.length - pendientes().length;
  return hechas + " de " + tareas.length + " tareas terminadas";
}

function mostrar() {
  for (const t of tareas) {
    const marca = t.hecha ? "[x]" : "[ ]";
    console.log(marca + " " + t.id + ". " + t.titulo + " (" + t.prioridad + ")");
  }
  console.log(resumen());
}

agregar("Comprar cafe", "alta");
agregar("Repasar arrays");
agregar("Ordenar el escritorio", "baja");
completar(1);
mostrar();
`,
      },
    ],
  },
  {
    id: "p03",
    num: 3,
    title: "Tarjeta de perfil",
    level: "Básico",
    stack: ["HTML", "CSS"],
    desc: "Una página con tu tarjeta de presentación: estructura en HTML y estilos con variables, grid y flexbox.",
    skills: "etiquetas anidadas, atributos, selectores, variables CSS y sangría de 2 espacios",
    files: [
      {
        name: "index.html", lang: "html", tabWidth: 2, text: src`
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Mi perfil</title>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <main class="card">
      <img class="avatar" src="avatar.png" alt="Foto de perfil">
      <h1>Ana Torres</h1>
      <p class="role">Desarrolladora web</p>
      <ul class="skills">
        <li>HTML</li>
        <li>CSS</li>
        <li>JavaScript</li>
      </ul>
      <nav class="links">
        <a href="https://github.com">GitHub</a>
        <a href="mailto:ana@mail.com">Escribime</a>
      </nav>
    </main>
  </body>
</html>
`,
      },
      {
        name: "style.css", lang: "css", tabWidth: 2, text: src`
:root {
  --bg: #0f172a;
  --card: #1e293b;
  --accent: #38bdf8;
  --text: #e2e8f0;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: var(--bg);
  color: var(--text);
  font-family: system-ui, sans-serif;
}

.card {
  width: min(360px, 90vw);
  padding: 32px;
  border-radius: 16px;
  background: var(--card);
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 3px solid var(--accent);
}

.role {
  color: var(--accent);
}

.skills {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 0;
  list-style: none;
}

.skills li {
  padding: 4px 10px;
  border: 1px solid var(--accent);
  border-radius: 999px;
}

.links a {
  margin: 0 8px;
  color: var(--text);
}

.links a:hover {
  color: var(--accent);
}
`,
      },
    ],
  },
  {
    id: "p04",
    num: 4,
    title: "Agenda de contactos",
    level: "Básico",
    stack: ["Python", "JSON"],
    desc: "Una agenda que guarda los contactos en un archivo JSON: agregar, buscar, eliminar y listar ordenado.",
    skills: "clases, dataclasses, archivos, comprensiones de listas y tres niveles de sangría",
    files: [
      py("agenda.py", src`
import json
from dataclasses import asdict, dataclass
from pathlib import Path

ARCHIVO = Path("agenda.json")


@dataclass
class Contacto:
    nombre: str
    telefono: str
    email: str = ""


class Agenda:
    def __init__(self, archivo=ARCHIVO):
        self.archivo = archivo
        self.contactos = []
        self.cargar()

    def cargar(self):
        if not self.archivo.exists():
            return
        datos = json.loads(self.archivo.read_text(encoding="utf-8"))
        self.contactos = [Contacto(**c) for c in datos]

    def guardar(self):
        datos = [asdict(c) for c in self.contactos]
        texto = json.dumps(datos, indent=2, ensure_ascii=False)
        self.archivo.write_text(texto, encoding="utf-8")

    def agregar(self, contacto):
        if self.buscar(contacto.nombre):
            raise ValueError(f"{contacto.nombre} ya esta en la agenda")
        self.contactos.append(contacto)
        self.guardar()

    def buscar(self, nombre):
        nombre = nombre.lower()
        for contacto in self.contactos:
            if contacto.nombre.lower() == nombre:
                return contacto
        return None

    def eliminar(self, nombre):
        contacto = self.buscar(nombre)
        if contacto is None:
            return False
        self.contactos.remove(contacto)
        self.guardar()
        return True

    def listar(self):
        return sorted(self.contactos, key=lambda c: c.nombre.lower())


if __name__ == "__main__":
    agenda = Agenda()
    try:
        agenda.agregar(Contacto("Ana", "555-1234", "ana@mail.com"))
        agenda.agregar(Contacto("Luis", "555-9876"))
    except ValueError as error:
        print(error)
    for c in agenda.listar():
        print(f"{c.nombre:<10} {c.telefono:<12} {c.email}")
`),
    ],
  },
  {
    id: "p05",
    num: 5,
    title: "Inventario tipado",
    level: "Intermedio",
    stack: ["TypeScript"],
    desc: "Un inventario con tipos e interfaces: productos, movimientos de stock, alertas y valor total.",
    skills: "tipos unión, interfaces, genéricos, clases con campos privados y encadenar métodos",
    files: [
      {
        name: "tipos.ts", lang: "typescript", tabWidth: 2, text: src`
export type Categoria = "comida" | "limpieza" | "tecnologia";

export interface Producto {
  readonly id: number;
  nombre: string;
  categoria: Categoria;
  precio: number;
  stock: number;
}

export interface Movimiento {
  productoId: number;
  cantidad: number;
  tipo: "entrada" | "salida";
  fecha: Date;
}
`,
      },
      {
        name: "inventario.ts", lang: "typescript", tabWidth: 2, text: src`
import type { Categoria, Movimiento, Producto } from "./tipos";

export class Inventario {
  private productos = new Map<number, Producto>();
  private movimientos: Movimiento[] = [];
  private siguienteId = 1;

  agregar(datos: Omit<Producto, "id">): Producto {
    const producto: Producto = { id: this.siguienteId++, ...datos };
    this.productos.set(producto.id, producto);
    return producto;
  }

  mover(productoId: number, cantidad: number, tipo: Movimiento["tipo"]): void {
    const producto = this.productos.get(productoId);
    if (!producto) {
      throw new Error("Producto inexistente: " + productoId);
    }
    if (tipo === "salida" && producto.stock < cantidad) {
      throw new Error("No hay stock suficiente de " + producto.nombre);
    }
    producto.stock += tipo === "entrada" ? cantidad : -cantidad;
    this.movimientos.push({ productoId, cantidad, tipo, fecha: new Date() });
  }

  porCategoria(categoria: Categoria): Producto[] {
    return [...this.productos.values()].filter((p) => p.categoria === categoria);
  }

  stockBajo(minimo = 5): Producto[] {
    return [...this.productos.values()]
      .filter((p) => p.stock < minimo)
      .sort((a, b) => a.stock - b.stock);
  }

  valorTotal(): number {
    let total = 0;
    for (const p of this.productos.values()) {
      total += p.precio * p.stock;
    }
    return Math.round(total * 100) / 100;
  }

  historial(productoId?: number): Movimiento[] {
    if (productoId === undefined) {
      return [...this.movimientos];
    }
    return this.movimientos.filter((m) => m.productoId === productoId);
  }
}

const inv = new Inventario();
const yerba = inv.agregar({ nombre: "Yerba", categoria: "comida", precio: 3.5, stock: 20 });
inv.agregar({ nombre: "Detergente", categoria: "limpieza", precio: 2.25, stock: 4 });
inv.mover(yerba.id, 18, "salida");
console.log(inv.stockBajo().map((p) => p.nombre));
console.log("Valor del inventario:", inv.valorTotal());
`,
      },
    ],
  },
  {
    id: "p06",
    num: 6,
    title: "Contador de palabras",
    level: "Intermedio",
    stack: ["Go"],
    desc: "Una herramienta de línea de comandos que lee un archivo (o la entrada estándar) y muestra las palabras más repetidas.",
    skills: "tabulaciones reales (gofmt), flags, structs, maps, slices, closures, io.Reader y manejo de errores",
    files: [
      {
        name: "go.mod", lang: "go", tabWidth: 0, text: src`
module contador

go 1.22
`,
      },
      {
        name: "main.go", lang: "go", tabWidth: 0, text: tabs`
package main

import (
    "bufio"
    "flag"
    "fmt"
    "io"
    "os"
    "sort"
    "strings"
    "unicode"
)

type Conteo struct {
    Palabra string
    Veces   int
}

func contar(texto string) map[string]int {
    conteo := make(map[string]int)
    separar := func(r rune) bool {
        return !unicode.IsLetter(r) && !unicode.IsNumber(r)
    }
    for _, palabra := range strings.FieldsFunc(texto, separar) {
        conteo[strings.ToLower(palabra)]++
    }
    return conteo
}

func filtrar(conteo map[string]int, minimo int) map[string]int {
    for palabra := range conteo {
        if len([]rune(palabra)) < minimo {
            delete(conteo, palabra)
        }
    }
    return conteo
}

func ordenar(conteo map[string]int) []Conteo {
    lista := make([]Conteo, 0, len(conteo))
    for palabra, veces := range conteo {
        lista = append(lista, Conteo{Palabra: palabra, Veces: veces})
    }
    sort.Slice(lista, func(i, j int) bool {
        if lista[i].Veces == lista[j].Veces {
            return lista[i].Palabra < lista[j].Palabra
        }
        return lista[i].Veces > lista[j].Veces
    })
    return lista
}

func leer(r io.Reader) (string, error) {
    var sb strings.Builder
    escaner := bufio.NewScanner(r)
    for escaner.Scan() {
        sb.WriteString(escaner.Text())
        sb.WriteString("\n")
    }
    return sb.String(), escaner.Err()
}

func resumen(conteo map[string]int) (total int, promedio float64) {
    letras := 0
    for palabra, veces := range conteo {
        total += veces
        letras += len([]rune(palabra)) * veces
    }
    if total > 0 {
        promedio = float64(letras) / float64(total)
    }
    return total, promedio
}

func abrir(ruta string) (io.ReadCloser, error) {
    if ruta == "-" {
        return io.NopCloser(os.Stdin), nil
    }
    return os.Open(ruta)
}

func main() {
    top := flag.Int("top", 10, "cuantas palabras mostrar")
    minimo := flag.Int("min", 1, "largo minimo de cada palabra")
    flag.Parse()

    ruta := "-"
    if flag.NArg() > 0 {
        ruta = flag.Arg(0)
    }
    entrada, err := abrir(ruta)
    if err != nil {
        fmt.Fprintln(os.Stderr, "Error:", err)
        os.Exit(1)
    }
    defer entrada.Close()

    texto, err := leer(entrada)
    if err != nil {
        fmt.Fprintln(os.Stderr, "Error:", err)
        os.Exit(1)
    }
    conteo := filtrar(contar(texto), *minimo)
    lista := ordenar(conteo)
    for i, c := range lista {
        if i == *top {
            break
        }
        fmt.Printf("%2d. %-15s %d\n", i+1, c.Palabra, c.Veces)
    }
    total, promedio := resumen(conteo)
    fmt.Printf("Palabras: %d (%d distintas), largo promedio %.1f\n", total, len(lista), promedio)
}
`,
      },
    ],
  },
  {
    id: "p15",
    num: 7,
    title: "Conversor de unidades",
    level: "Intermedio",
    stack: ["Swift"],
    desc: "Un programa de consola que convierte longitudes y temperaturas, avisa cuando no entiende un pedido y cuenta cuántas conversiones hizo.",
    skills: "enums con propiedades, structs, opcionales, guard y bucles de Swift",
    files: [
      {
        name: "main.swift",
        lang: "swift",
        tabWidth: 4,
        text: src`
enum Unidad: String, CaseIterable {
    case metros
    case kilometros
    case millas
    case pies

    // cuantos metros vale una unidad
    var enMetros: Double {
        switch self {
        case .metros: return 1
        case .kilometros: return 1000
        case .millas: return 1609.344
        case .pies: return 0.3048
        }
    }
}

enum Escala: String {
    case celsius
    case fahrenheit
    case kelvin

    func aCelsius(_ valor: Double) -> Double {
        switch self {
        case .celsius: return valor
        case .fahrenheit: return (valor - 32) * 5 / 9
        case .kelvin: return valor - 273.15
        }
    }

    func desdeCelsius(_ valor: Double) -> Double {
        switch self {
        case .celsius: return valor
        case .fahrenheit: return valor * 9 / 5 + 32
        case .kelvin: return valor + 273.15
        }
    }
}

struct Medida {
    let valor: Double
    let unidad: Unidad

    func convertir(a destino: Unidad) -> Medida {
        let metros = valor * unidad.enMetros
        return Medida(valor: metros / destino.enMetros, unidad: destino)
    }

    var texto: String {
        let redondeado = (valor * 100).rounded() / 100
        return "\(redondeado) \(unidad.rawValue)"
    }
}

struct Historial {
    private(set) var lineas: [String] = []

    mutating func anotar(_ linea: String) {
        lineas.append(linea)
    }

    var cantidad: Int {
        return lineas.count
    }
}

func parsear(_ texto: String) -> Medida? {
    let partes = texto.split(separator: " ")
    guard partes.count == 2,
          let valor = Double(partes[0]),
          let unidad = Unidad(rawValue: String(partes[1])) else {
        return nil
    }
    return Medida(valor: valor, unidad: unidad)
}

func convertirTemperatura(_ valor: Double, de origen: Escala, a destino: Escala) -> Double {
    let enCelsius = origen.aCelsius(valor)
    return destino.desdeCelsius(enCelsius)
}

var historial = Historial()
let pedidos = ["10 kilometros", "5 millas", "100 pies", "3 leguas"]
for pedido in pedidos {
    guard let medida = parsear(pedido) else {
        print("No entiendo: \(pedido)")
        continue
    }
    for destino in Unidad.allCases where destino != medida.unidad {
        let linea = "\(medida.texto) = \(medida.convertir(a: destino).texto)"
        print(linea)
        historial.anotar(linea)
    }
}

let temperaturas = [
    "100 celsius = \(convertirTemperatura(100, de: .celsius, a: .fahrenheit)) fahrenheit",
    "32 fahrenheit = \(convertirTemperatura(32, de: .fahrenheit, a: .kelvin)) kelvin",
]
for linea in temperaturas {
    print(linea)
    historial.anotar(linea)
}
print("Conversiones hechas: \(historial.cantidad)")`,
      },
    ],
  },
  {
    id: "p16",
    num: 8,
    title: "Biblioteca de préstamos",
    level: "Intermedio",
    stack: ["Kotlin"],
    desc: "Una biblioteca en memoria: se agregan libros, se prestan a una persona por unos días, se devuelven y se calculan las multas por atraso.",
    skills: "data class, sealed class, when, colecciones y funciones de extensión de Kotlin",
    files: [
      {
        name: "Prestamos.kt",
        lang: "kotlin",
        tabWidth: 4,
        text: src`
data class Libro(val id: Int, val titulo: String, val autor: String)

sealed class Estado {
    object Disponible : Estado()
    data class Prestado(val persona: String, val dias: Int) : Estado()
}

fun List<Libro>.deAutor(autor: String): List<Libro> = filter { it.autor == autor }

fun multaPorAtraso(diasPrestado: Int, limite: Int = 14, porDia: Int = 50): Int {
    val atraso = diasPrestado - limite
    return if (atraso > 0) atraso * porDia else 0
}

class Biblioteca {
    private val libros = mutableListOf<Libro>()
    private val estados = mutableMapOf<Int, Estado>()

    fun agregar(titulo: String, autor: String): Libro {
        val libro = Libro(libros.size + 1, titulo, autor)
        libros.add(libro)
        estados[libro.id] = Estado.Disponible
        return libro
    }

    fun prestar(id: Int, persona: String, dias: Int): Boolean {
        if (estados[id] != Estado.Disponible) return false
        estados[id] = Estado.Prestado(persona, dias)
        return true
    }

    fun devolver(id: Int): Boolean {
        if (estados[id] !is Estado.Prestado) return false
        estados[id] = Estado.Disponible
        return true
    }

    fun catalogo(): List<Libro> = libros.toList()

    fun libroDe(id: Int): Libro? = libros.firstOrNull { it.id == id }

    fun disponibles(): List<Libro> = libros.filter { estados[it.id] == Estado.Disponible }

    fun prestadosA(persona: String): List<Libro> = libros.filter { libro ->
        val estado = estados[libro.id]
        estado is Estado.Prestado && estado.persona == persona
    }

    fun porAutor(): Map<String, List<String>> = libros.groupBy({ it.autor }, { it.titulo })

    fun resumen(): List<String> = libros.map { libro ->
        val estado = when (val e = estados[libro.id]) {
            is Estado.Prestado -> "prestado a \${e.persona} por \${e.dias} dias"
            else -> "disponible"
        }
        "\${libro.id}. \${libro.titulo} (\${libro.autor}) - $estado"
    }
}

fun main() {
    val biblioteca = Biblioteca()
    biblioteca.agregar("Rayuela", "Cortazar")
    biblioteca.agregar("Ficciones", "Borges")
    biblioteca.agregar("El Aleph", "Borges")

    println(biblioteca.prestar(1, "Ana", 14))
    println(biblioteca.prestar(1, "Luis", 7))
    println(biblioteca.prestar(3, "Luis", 7))
    println(biblioteca.devolver(2))
    println(biblioteca.devolver(1))
    println(biblioteca.catalogo().deAutor("Borges").size)
    println(biblioteca.libroDe(2)?.titulo ?: "no existe")
    println(biblioteca.libroDe(9)?.titulo ?: "no existe")
    println(biblioteca.disponibles().size)
    println(biblioteca.prestadosA("Luis").map { it.titulo })
    biblioteca.porAutor().forEach { (autor, titulos) ->
        println("$autor: \${titulos.joinToString(", ")}")
    }
    println(multaPorAtraso(20))
    println(multaPorAtraso(10))
    biblioteca.resumen().forEach { println(it) }
}`,
      },
    ],
  },
  {
    id: "p17",
    num: 9,
    title: "Mini router de URLs",
    level: "Intermedio",
    stack: ["PHP"],
    desc: "Un enrutador como el de los frameworks: se registran rutas con parámetros, se agrupan bajo un prefijo y cada pedido se resuelve en la función que le toca.",
    skills: "clases, closures, expresiones regulares y argumentos con nombre de PHP",
    files: [
      {
        name: "router.php",
        lang: "php",
        tabWidth: 4,
        text: src`
<?php

declare(strict_types=1);

function pagina(string $titulo, string $cuerpo = ''): string
{
    $html = "<h1>$titulo</h1>";
    if ($cuerpo !== '') {
        $html .= "<p>$cuerpo</p>";
    }
    return $html;
}

class Router
{
    private array $rutas = [];
    private array $filtros = [];

    public function agregar(string $metodo, string $patron, callable $accion): void
    {
        $regex = preg_replace('/\{(\w+)\}/', '(?P<$1>[^/]+)', $patron);
        $this->rutas[] = [$metodo, '#^' . $regex . '$#', $accion];
    }

    public function antes(callable $filtro): void
    {
        $this->filtros[] = $filtro;
    }

    public function grupo(string $prefijo, callable $definir): void
    {
        $definir(new Grupo($this, $prefijo));
    }

    public function cantidad(): int
    {
        return count($this->rutas);
    }

    public function resolver(string $metodo, string $ruta): string
    {
        foreach ($this->filtros as $filtro) {
            $respuesta = $filtro($metodo, $ruta);
            if ($respuesta !== null) {
                return $respuesta;
            }
        }
        $otroMetodo = false;
        foreach ($this->rutas as [$m, $regex, $accion]) {
            if (!preg_match($regex, $ruta, $coincidencia)) {
                continue;
            }
            if ($m !== $metodo) {
                $otroMetodo = true;
                continue;
            }
            $parametros = array_filter($coincidencia, 'is_string', ARRAY_FILTER_USE_KEY);
            return $accion(...$parametros);
        }
        return $otroMetodo ? '405 Metodo no permitido' : '404 No encontrado';
    }
}

class Grupo
{
    public function __construct(private Router $router, private string $prefijo)
    {
    }

    public function agregar(string $metodo, string $patron, callable $accion): void
    {
        $this->router->agregar($metodo, $this->prefijo . $patron, $accion);
    }
}

$router = new Router();
$router->antes(function (string $metodo, string $ruta): ?string {
    return str_starts_with($ruta, '/admin') ? '403 Prohibido' : null;
});
$router->agregar('GET', '/', fn() => pagina('Inicio', 'Bienvenida'));
$router->agregar('GET', '/usuarios/{id}', fn(string $id) => pagina("Usuario $id"));
$router->agregar('GET', '/posts/{anio}/{slug}', fn(string $anio, string $slug) => "Post $slug de $anio");
$router->grupo('/api', function (Grupo $g) {
    $g->agregar('GET', '/ping', fn() => 'pong');
    $g->agregar('GET', '/libros/{id}', fn(string $id) => "Libro $id");
});

$pruebas = [
    ['GET', '/'],
    ['GET', '/usuarios/42'],
    ['GET', '/posts/2026/hola-mundo'],
    ['GET', '/api/ping'],
    ['GET', '/api/libros/7'],
    ['GET', '/admin/panel'],
    ['POST', '/usuarios/42'],
    ['GET', '/nada'],
];

foreach ($pruebas as [$metodo, $ruta]) {
    echo $metodo . ' ' . $ruta . ' -> ' . $router->resolver($metodo, $ruta) . PHP_EOL;
}
echo 'Rutas: ' . $router->cantidad() . PHP_EOL;`,
      },
    ],
  },
  {
    id: "p07",
    num: 10,
    after: "p06",
    title: "Biblioteca con SQLite",
    level: "Avanzado",
    stack: ["SQL", "Python"],
    desc: "El sistema de préstamos de una biblioteca: esquema SQL con claves foráneas y un módulo Python que lo usa.",
    skills: "CREATE TABLE, claves foráneas, consultas con parámetros, transacciones y JOIN",
    files: [
      {
        name: "schema.sql", lang: "sql", tabWidth: 4, text: src`
CREATE TABLE IF NOT EXISTS autores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS libros (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    autor_id INTEGER NOT NULL REFERENCES autores(id),
    anio INTEGER,
    disponible INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS prestamos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    libro_id INTEGER NOT NULL REFERENCES libros(id),
    socio TEXT NOT NULL,
    desde TEXT NOT NULL DEFAULT CURRENT_DATE,
    hasta TEXT
);

CREATE INDEX IF NOT EXISTS idx_libros_autor ON libros(autor_id);
`,
      },
      py("biblioteca.py", src`
import sqlite3
from pathlib import Path

DB = Path("biblioteca.db")
ESQUEMA = Path("schema.sql")


def conectar():
    conexion = sqlite3.connect(DB)
    conexion.row_factory = sqlite3.Row
    conexion.execute("PRAGMA foreign_keys = ON")
    conexion.executescript(ESQUEMA.read_text(encoding="utf-8"))
    return conexion


def autor_id(conexion, nombre):
    fila = conexion.execute(
        "SELECT id FROM autores WHERE nombre = ?", (nombre,)
    ).fetchone()
    if fila:
        return fila["id"]
    cursor = conexion.execute("INSERT INTO autores (nombre) VALUES (?)", (nombre,))
    return cursor.lastrowid


def agregar_libro(conexion, titulo, autor, anio=None):
    with conexion:
        conexion.execute(
            "INSERT INTO libros (titulo, autor_id, anio) VALUES (?, ?, ?)",
            (titulo, autor_id(conexion, autor), anio),
        )


def prestar(conexion, libro_id, socio):
    with conexion:
        libro = conexion.execute(
            "SELECT disponible FROM libros WHERE id = ?", (libro_id,)
        ).fetchone()
        if libro is None or not libro["disponible"]:
            raise ValueError("El libro no esta disponible")
        conexion.execute(
            "INSERT INTO prestamos (libro_id, socio) VALUES (?, ?)", (libro_id, socio)
        )
        conexion.execute("UPDATE libros SET disponible = 0 WHERE id = ?", (libro_id,))


def devolver(conexion, libro_id):
    with conexion:
        conexion.execute(
            "UPDATE prestamos SET hasta = CURRENT_DATE "
            "WHERE libro_id = ? AND hasta IS NULL",
            (libro_id,),
        )
        conexion.execute("UPDATE libros SET disponible = 1 WHERE id = ?", (libro_id,))


def catalogo(conexion):
    return conexion.execute(
        """
        SELECT l.id, l.titulo, a.nombre AS autor, l.disponible
        FROM libros AS l
        JOIN autores AS a ON a.id = l.autor_id
        ORDER BY a.nombre, l.titulo
        """
    ).fetchall()


if __name__ == "__main__":
    con = conectar()
    if not catalogo(con):
        agregar_libro(con, "Rayuela", "Julio Cortazar", 1963)
        agregar_libro(con, "Ficciones", "Jorge Luis Borges", 1944)
    prestar(con, 1, "Marta")
    for fila in catalogo(con):
        estado = "disponible" if fila["disponible"] else "prestado"
        print(f"{fila['id']:>3} {fila['titulo']:<20} {fila['autor']:<20} {estado}")
    devolver(con, 1)
`),
    ],
  },
  {
    id: "p08",
    num: 11,
    title: "Control de gastos",
    level: "Avanzado",
    stack: ["Rust"],
    desc: "Una billetera con presupuesto: registra gastos validados, agrupa por categoría y encuentra el mayor.",
    skills: "enums, structs, impl, traits, Result y Option, match, closures e iteradores",
    files: [
      {
        name: "src/main.rs", lang: "rust", tabWidth: 4, text: src`
use std::collections::HashMap;
use std::fmt;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
enum Categoria {
    Comida,
    Transporte,
    Ocio,
    Servicios,
}

impl fmt::Display for Categoria {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        let nombre = match self {
            Categoria::Comida => "Comida",
            Categoria::Transporte => "Transporte",
            Categoria::Ocio => "Ocio",
            Categoria::Servicios => "Servicios",
        };
        f.pad(nombre)
    }
}

#[derive(Debug)]
struct Gasto {
    descripcion: String,
    monto: f64,
    categoria: Categoria,
}

#[derive(Debug)]
enum ErrorGasto {
    MontoInvalido(f64),
    SinDescripcion,
}

struct Billetera {
    presupuesto: f64,
    gastos: Vec<Gasto>,
}

impl Billetera {
    fn new(presupuesto: f64) -> Self {
        Billetera { presupuesto, gastos: Vec::new() }
    }

    fn registrar(&mut self, descripcion: &str, monto: f64, categoria: Categoria) -> Result<(), ErrorGasto> {
        if monto <= 0.0 {
            return Err(ErrorGasto::MontoInvalido(monto));
        }
        if descripcion.trim().is_empty() {
            return Err(ErrorGasto::SinDescripcion);
        }
        self.gastos.push(Gasto {
            descripcion: descripcion.to_string(),
            monto,
            categoria,
        });
        Ok(())
    }

    fn total(&self) -> f64 {
        self.gastos.iter().map(|g| g.monto).sum()
    }

    fn restante(&self) -> f64 {
        self.presupuesto - self.total()
    }

    fn por_categoria(&self) -> HashMap<Categoria, f64> {
        let mut mapa = HashMap::new();
        for gasto in &self.gastos {
            *mapa.entry(gasto.categoria).or_insert(0.0) += gasto.monto;
        }
        mapa
    }

    fn mayor_gasto(&self) -> Option<&Gasto> {
        self.gastos
            .iter()
            .max_by(|a, b| a.monto.partial_cmp(&b.monto).unwrap())
    }
}

fn main() {
    let mut billetera = Billetera::new(500.0);
    let movimientos = [
        ("Supermercado", 82.5, Categoria::Comida),
        ("Colectivo", 12.0, Categoria::Transporte),
        ("Cine", 25.0, Categoria::Ocio),
        ("Internet", 40.0, Categoria::Servicios),
        ("", 10.0, Categoria::Ocio),
        ("Cafe", -3.0, Categoria::Comida),
    ];

    for (descripcion, monto, categoria) in movimientos {
        match billetera.registrar(descripcion, monto, categoria) {
            Ok(()) => println!("Registrado: {} ({:.2})", descripcion, monto),
            Err(ErrorGasto::MontoInvalido(m)) => println!("Monto invalido: {:.2}", m),
            Err(ErrorGasto::SinDescripcion) => println!("Falta la descripcion"),
        }
    }

    let mut resumen: Vec<_> = billetera.por_categoria().into_iter().collect();
    resumen.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap());
    for (categoria, monto) in resumen {
        println!("{:<12} {:>8.2}", categoria, monto);
    }

    if let Some(g) = billetera.mayor_gasto() {
        println!("Mayor gasto: {} ({:.2})", g.descripcion, g.monto);
    }
    println!("Te quedan {:.2} de {:.2}", billetera.restante(), billetera.presupuesto);
}
`,
      },
    ],
  },
  {
    id: "p09",
    num: 12,
    title: "Sistema de reservas",
    level: "Experto",
    stack: ["Java"],
    desc: "Las reservas de un hotel en cuatro archivos: records con validación, enums con datos, streams y Optional.",
    skills: "records, enums, colecciones, streams encadenados, lambdas y excepciones",
    files: [
      {
        name: "Reserva.java", lang: "java", tabWidth: 4, text: src`
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

public record Reserva(int numero, String huesped, int habitacion, LocalDate entrada, LocalDate salida) {

    public Reserva {
        if (huesped == null || huesped.isBlank()) {
            throw new IllegalArgumentException("Falta el nombre del huesped");
        }
        if (!salida.isAfter(entrada)) {
            throw new IllegalArgumentException("La salida tiene que ser despues de la entrada");
        }
    }

    public long noches() {
        return ChronoUnit.DAYS.between(entrada, salida);
    }

    public boolean seSuperponeCon(LocalDate desde, LocalDate hasta) {
        return entrada.isBefore(hasta) && desde.isBefore(salida);
    }
}
`,
      },
      {
        name: "TipoHabitacion.java", lang: "java", tabWidth: 4, text: src`
public enum TipoHabitacion {
    SIMPLE(1, 45.0),
    DOBLE(2, 70.0),
    SUITE(4, 150.0);

    private final int capacidad;
    private final double precioNoche;

    TipoHabitacion(int capacidad, double precioNoche) {
        this.capacidad = capacidad;
        this.precioNoche = precioNoche;
    }

    public int capacidad() {
        return capacidad;
    }

    public double precioNoche() {
        return precioNoche;
    }
}
`,
      },
      {
        name: "Hotel.java", lang: "java", tabWidth: 4, text: src`
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public class Hotel {
    private final Map<Integer, TipoHabitacion> habitaciones = new LinkedHashMap<>();
    private final List<Reserva> reservas = new ArrayList<>();
    private int siguienteNumero = 1;

    public void agregarHabitacion(int numero, TipoHabitacion tipo) {
        habitaciones.put(numero, tipo);
    }

    public boolean estaLibre(int habitacion, LocalDate desde, LocalDate hasta) {
        return reservas.stream()
                .filter(r -> r.habitacion() == habitacion)
                .noneMatch(r -> r.seSuperponeCon(desde, hasta));
    }

    public Optional<Integer> buscarLibre(int personas, LocalDate desde, LocalDate hasta) {
        return habitaciones.entrySet().stream()
                .filter(e -> e.getValue().capacidad() >= personas)
                .filter(e -> estaLibre(e.getKey(), desde, hasta))
                .sorted(Comparator.comparingDouble(e -> e.getValue().precioNoche()))
                .map(Map.Entry::getKey)
                .findFirst();
    }

    public Reserva reservar(String huesped, int personas, LocalDate desde, LocalDate hasta) {
        int habitacion = buscarLibre(personas, desde, hasta)
                .orElseThrow(() -> new IllegalStateException("No hay habitaciones libres"));
        Reserva reserva = new Reserva(siguienteNumero++, huesped, habitacion, desde, hasta);
        reservas.add(reserva);
        return reserva;
    }

    public boolean cancelar(int numero) {
        return reservas.removeIf(r -> r.numero() == numero);
    }

    public double costo(Reserva reserva) {
        TipoHabitacion tipo = habitaciones.get(reserva.habitacion());
        return tipo.precioNoche() * reserva.noches();
    }

    public List<Reserva> reservasDe(String huesped) {
        return reservas.stream()
                .filter(r -> r.huesped().equalsIgnoreCase(huesped))
                .toList();
    }
}
`,
      },
      {
        name: "Main.java", lang: "java", tabWidth: 4, text: src`
import java.time.LocalDate;

public class Main {
    public static void main(String[] args) {
        Hotel hotel = new Hotel();
        hotel.agregarHabitacion(101, TipoHabitacion.SIMPLE);
        hotel.agregarHabitacion(102, TipoHabitacion.DOBLE);
        hotel.agregarHabitacion(201, TipoHabitacion.SUITE);

        LocalDate hoy = LocalDate.of(2026, 12, 20);
        Reserva ana = hotel.reservar("Ana", 2, hoy, hoy.plusDays(3));
        Reserva luis = hotel.reservar("Luis", 2, hoy.plusDays(1), hoy.plusDays(2));
        System.out.printf("Ana: habitacion %d, %d noches, %.2f%n", ana.habitacion(), ana.noches(), hotel.costo(ana));
        System.out.printf("Luis: habitacion %d, %.2f%n", luis.habitacion(), hotel.costo(luis));

        try {
            hotel.reservar("Grupo", 6, hoy, hoy.plusDays(1));
        } catch (IllegalStateException e) {
            System.out.println("No se pudo reservar: " + e.getMessage());
        }

        hotel.cancelar(ana.numero());
        System.out.println("Libre la 102? " + hotel.estaLibre(102, hoy, hoy.plusDays(3)));
    }
}
`,
      },
    ],
  },
  {
    id: "p11",
    num: 13,
    title: "Gestor de notas",
    level: "Experto",
    stack: ["C#", "XML"],
    desc: "Una aplicación de consola en .NET que guarda notas en JSON: agregar, listar, buscar, borrar y un resumen por prioridad.",
    skills: "records, enums, LINQ, switch con condiciones, interpolación y llaves en su propia línea",
    files: [
      {
        name: "Notas.csproj", lang: "html", tabWidth: 2, text: src`
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net10.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>

</Project>
`,
      },
      {
        name: "Nota.cs", lang: "csharp", tabWidth: 4, text: src`
namespace Notas;

public enum Prioridad
{
    Baja,
    Media,
    Alta,
}

public record Nota(int Id, string Titulo, string Texto, Prioridad Prioridad, DateTime Creada)
{
    public bool Contiene(string buscado) =>
        Titulo.Contains(buscado, StringComparison.OrdinalIgnoreCase)
        || Texto.Contains(buscado, StringComparison.OrdinalIgnoreCase);

    public override string ToString() =>
        $"#{Id} [{Prioridad}] {Titulo} ({Creada:yyyy-MM-dd})";
}
`,
      },
      {
        name: "Repositorio.cs", lang: "csharp", tabWidth: 4, text: src`
using System.Text;
using System.Text.Json;

namespace Notas;

public class Repositorio
{
    private static readonly JsonSerializerOptions Opciones = new() { WriteIndented = true };

    private readonly string ruta;
    private readonly List<Nota> notas;

    public Repositorio(string ruta)
    {
        this.ruta = ruta;
        notas = File.Exists(ruta)
            ? JsonSerializer.Deserialize<List<Nota>>(File.ReadAllText(ruta)) ?? new List<Nota>()
            : new List<Nota>();
    }

    public IReadOnlyList<Nota> Todas => notas;

    public Nota Agregar(string titulo, string texto, Prioridad prioridad)
    {
        if (string.IsNullOrWhiteSpace(titulo))
        {
            throw new ArgumentException("La nota necesita un titulo", nameof(titulo));
        }

        var id = notas.Count == 0 ? 1 : notas.Max(n => n.Id) + 1;
        var nota = new Nota(id, titulo.Trim(), texto.Trim(), prioridad, DateTime.Now);
        notas.Add(nota);
        Guardar();
        return nota;
    }

    public bool Borrar(int id)
    {
        var borradas = notas.RemoveAll(n => n.Id == id);
        if (borradas > 0)
        {
            Guardar();
        }
        return borradas > 0;
    }

    public IEnumerable<Nota> Buscar(string texto) =>
        notas.Where(n => n.Contiene(texto))
            .OrderByDescending(n => n.Prioridad)
            .ThenBy(n => n.Id);

    public Dictionary<Prioridad, int> ContarPorPrioridad() =>
        notas.GroupBy(n => n.Prioridad)
            .OrderByDescending(g => g.Key)
            .ToDictionary(g => g.Key, g => g.Count());

    public string ExportarMarkdown()
    {
        var md = new StringBuilder("# Notas\n");
        foreach (var grupo in notas.GroupBy(n => n.Prioridad).OrderByDescending(g => g.Key))
        {
            md.AppendLine().AppendLine($"## {grupo.Key} ({grupo.Count()})").AppendLine();
            foreach (var nota in grupo.OrderBy(n => n.Creada))
            {
                md.AppendLine($"- **{nota.Titulo}**: {nota.Texto}");
            }
        }
        return md.ToString();
    }

    private void Guardar() =>
        File.WriteAllText(ruta, JsonSerializer.Serialize(notas, Opciones));
}
`,
      },
      {
        name: "Program.cs", lang: "csharp", tabWidth: 4, text: src`
using Notas;

var repo = new Repositorio("notas.json");

if (args.Length == 0)
{
    MostrarAyuda();
    return;
}

switch (args[0])
{
    case "agregar" when args.Length >= 3:
        var prioridad = args.Length >= 4 && Enum.TryParse<Prioridad>(args[3], true, out var elegida)
            ? elegida
            : Prioridad.Media;
        var nota = repo.Agregar(args[1], args[2], prioridad);
        Console.WriteLine($"Guardada: {nota}");
        break;

    case "listar":
        foreach (var n in repo.Todas.OrderBy(x => x.Id))
        {
            Console.WriteLine(n);
        }
        break;

    case "buscar" when args.Length >= 2:
        var encontradas = repo.Buscar(args[1]).ToList();
        Console.WriteLine($"{encontradas.Count} nota(s) con \"{args[1]}\"");
        foreach (var n in encontradas)
        {
            Console.WriteLine(n);
        }
        break;

    case "borrar" when args.Length >= 2 && int.TryParse(args[1], out var id):
        Console.WriteLine(repo.Borrar(id) ? $"Nota {id} borrada" : $"No existe la nota {id}");
        break;

    case "resumen":
        foreach (var (prio, cantidad) in repo.ContarPorPrioridad())
        {
            Console.WriteLine($"{prio,-6} {cantidad}");
        }
        break;

    case "exportar":
        var destino = args.Length >= 2 ? args[1] : "notas.md";
        File.WriteAllText(destino, repo.ExportarMarkdown());
        Console.WriteLine($"Exportadas {repo.Todas.Count} nota(s) a {destino}");
        break;

    default:
        MostrarAyuda();
        break;
}

static void MostrarAyuda()
{
    Console.WriteLine("Uso:");
    Console.WriteLine("  notas agregar <titulo> <texto> [baja|media|alta]");
    Console.WriteLine("  notas listar");
    Console.WriteLine("  notas buscar <texto>");
    Console.WriteLine("  notas borrar <id>");
    Console.WriteLine("  notas resumen");
    Console.WriteLine("  notas exportar [archivo.md]");
}
`,
      },
    ],
  },
  {
    id: "p12",
    num: 14,
    title: "API de recetas",
    level: "Experto",
    stack: ["Python", "FastAPI", "pytest"],
    desc: "Una API REST chica con FastAPI que guarda recetas en memoria, con validación, filtros y sus propias pruebas.",
    skills: "decoradores, modelos de Pydantic, anotaciones de tipos, códigos HTTP y pruebas con pytest",
    files: [
      {
        name: "requirements.txt", lang: "formats", tabWidth: 4, text: src`
fastapi
httpx2
pytest
`,
      },
      py("main.py", src`
from datetime import date
from typing import Annotated

from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, Field

app = FastAPI(title="Recetario")


class RecetaNueva(BaseModel):
    nombre: str = Field(min_length=1, max_length=80)
    minutos: int = Field(gt=0, le=600)
    ingredientes: list[str] = Field(min_length=1)
    vegetariana: bool = False


class Receta(RecetaNueva):
    id: int
    creada: date


recetas: dict[int, Receta] = {}
siguiente_id = 1


@app.get("/recetas")
def listar(
    vegetariana: bool | None = None,
    max_minutos: Annotated[int | None, Query(gt=0)] = None,
) -> list[Receta]:
    resultado = list(recetas.values())
    if vegetariana is not None:
        resultado = [r for r in resultado if r.vegetariana == vegetariana]
    if max_minutos is not None:
        resultado = [r for r in resultado if r.minutos <= max_minutos]
    return sorted(resultado, key=lambda r: r.minutos)


@app.get("/recetas/buscar")
def buscar(texto: Annotated[str, Query(min_length=2)]) -> list[Receta]:
    buscado = texto.lower()
    return [
        r
        for r in recetas.values()
        if buscado in r.nombre.lower() or any(buscado in i.lower() for i in r.ingredientes)
    ]


@app.get("/recetas/{receta_id}")
def obtener(receta_id: int) -> Receta:
    if receta_id not in recetas:
        raise HTTPException(status_code=404, detail="La receta no existe")
    return recetas[receta_id]


@app.post("/recetas", status_code=201)
def crear(nueva: RecetaNueva) -> Receta:
    global siguiente_id
    receta = Receta(id=siguiente_id, creada=date.today(), **nueva.model_dump())
    recetas[receta.id] = receta
    siguiente_id += 1
    return receta


@app.put("/recetas/{receta_id}")
def reemplazar(receta_id: int, cambios: RecetaNueva) -> Receta:
    actual = obtener(receta_id)
    receta = Receta(id=actual.id, creada=actual.creada, **cambios.model_dump())
    recetas[receta_id] = receta
    return receta


@app.delete("/recetas/{receta_id}", status_code=204)
def borrar(receta_id: int) -> None:
    if recetas.pop(receta_id, None) is None:
        raise HTTPException(status_code=404, detail="La receta no existe")


@app.get("/ingredientes")
def ingredientes() -> dict[str, int]:
    conteo: dict[str, int] = {}
    for receta in recetas.values():
        for ingrediente in receta.ingredientes:
            clave = ingrediente.strip().lower()
            conteo[clave] = conteo.get(clave, 0) + 1
    return dict(sorted(conteo.items(), key=lambda par: (-par[1], par[0])))
`),
      py("test_main.py", src`
import pytest
from fastapi.testclient import TestClient

import main

cliente = TestClient(main.app)


@pytest.fixture(autouse=True)
def vaciar():
    main.recetas.clear()
    main.siguiente_id = 1


def crear(nombre="Tortilla", minutos=30, ingredientes=("huevo", "papa"), vegetariana=True):
    respuesta = cliente.post(
        "/recetas",
        json={
            "nombre": nombre,
            "minutos": minutos,
            "ingredientes": list(ingredientes),
            "vegetariana": vegetariana,
        },
    )
    assert respuesta.status_code == 201
    return respuesta.json()


def test_crear_y_obtener():
    receta = crear()
    assert receta["id"] == 1
    assert cliente.get("/recetas/1").json()["nombre"] == "Tortilla"


def test_valida_los_datos():
    respuesta = cliente.post("/recetas", json={"nombre": "", "minutos": 0, "ingredientes": []})
    assert respuesta.status_code == 422


def test_filtra_y_ordena():
    crear("Guiso", 90, ("carne", "papa"), False)
    crear("Ensalada", 10, ("lechuga",), True)
    crear("Tortilla", 30)
    rapidas = cliente.get("/recetas", params={"max_minutos": 40}).json()
    assert [r["nombre"] for r in rapidas] == ["Ensalada", "Tortilla"]
    sin_carne = cliente.get("/recetas", params={"vegetariana": True}).json()
    assert len(sin_carne) == 2
    assert all(r["vegetariana"] for r in sin_carne)


def test_reemplazar_y_borrar():
    crear()
    cambios = {"nombre": "Tortilla de papa", "minutos": 35, "ingredientes": ["huevo", "papa", "cebolla"]}
    assert cliente.put("/recetas/1", json=cambios).json()["minutos"] == 35
    assert cliente.delete("/recetas/1").status_code == 204
    assert cliente.get("/recetas/1").status_code == 404
    assert cliente.delete("/recetas/1").status_code == 404


def test_busca_por_nombre_o_ingrediente():
    crear("Tortilla", 30, ("huevo", "papa"))
    crear("Ensalada", 10, ("lechuga", "tomate"))
    assert [r["nombre"] for r in cliente.get("/recetas/buscar", params={"texto": "PAPA"}).json()] == ["Tortilla"]
    assert [r["nombre"] for r in cliente.get("/recetas/buscar", params={"texto": "ensa"}).json()] == ["Ensalada"]
    assert cliente.get("/recetas/buscar", params={"texto": "x"}).status_code == 422


def test_cuenta_ingredientes():
    crear("Tortilla", 30, ("Huevo", "papa"))
    crear("Pure", 25, ("papa", "manteca"))
    assert cliente.get("/ingredientes").json() == {"papa": 2, "huevo": 1, "manteca": 1}
`),
    ],
  },
  {
    id: "p13",
    num: 15,
    title: "Copias de seguridad",
    level: "Experto",
    stack: ["Bash", "Makefile"],
    desc:
      "Un script de Bash que comprime una carpeta, guarda su suma SHA-256, verifica, restaura y borra las copias " +
      "viejas, con un Makefile para usarlo y un script que lo prueba.",
    skills: "variables con valor por defecto, arrays, funciones, case, subshells y las tabulaciones de Makefile",
    files: [
      {
        name: "respaldo.sh", lang: "linux", tabWidth: 4, text: src`
#!/usr/bin/env bash
# Copias de seguridad comprimidas de una carpeta, con verificacion y rotacion.
set -euo pipefail

ORIGEN="\${ORIGEN:-./datos}"
DESTINO="\${DESTINO:-./copias}"
CONSERVAR="\${CONSERVAR:-5}"
EXCLUIR="\${EXCLUIR:-.respaldoignore}"

uso() {
    echo "Uso: $0 {crear|listar|estado|verificar|restaurar <archivo> <carpeta>|rotar}" >&2
    exit 1
}

error() {
    echo "error: $*" >&2
    exit 1
}

crear() {
    [[ -d "$ORIGEN" ]] || error "no existe la carpeta $ORIGEN"
    mkdir -p "$DESTINO"
    local nombre
    nombre="copia-$(date +%Y%m%d-%H%M%S-%3N).tar.gz"
    local opciones=()
    if [[ -f "$ORIGEN/$EXCLUIR" ]]; then
        opciones+=(--exclude-from="$ORIGEN/$EXCLUIR")
    fi
    tar -czf "$DESTINO/$nombre" "\${opciones[@]}" -C "$(dirname "$ORIGEN")" "$(basename "$ORIGEN")"
    (cd "$DESTINO" && sha256sum "$nombre" > "$nombre.sha256")
    echo "Creada $DESTINO/$nombre ($(du -h "$DESTINO/$nombre" | cut -f1))"
}

listar() {
    shopt -s nullglob
    local copias=("$DESTINO"/copia-*.tar.gz)
    if (( \${#copias[@]} == 0 )); then
        echo "No hay copias en $DESTINO"
        return
    fi
    for copia in "\${copias[@]}"; do
        printf "%-40s %8s\n" "$(basename "$copia")" "$(du -h "$copia" | cut -f1)"
    done
}

estado() {
    shopt -s nullglob
    local copias=("$DESTINO"/copia-*.tar.gz)
    echo "Origen:    $ORIGEN"
    echo "Destino:   $DESTINO"
    echo "Copias:    \${#copias[@]} (se conservan $CONSERVAR)"
    if (( \${#copias[@]} > 0 )); then
        echo "Ocupan:    $(du -ch "\${copias[@]}" | tail -n 1 | cut -f1)"
        echo "La ultima: $(basename "\${copias[-1]}")"
    fi
}

verificar() {
    shopt -s nullglob
    local fallas=0
    for suma in "$DESTINO"/*.sha256; do
        if (cd "$DESTINO" && sha256sum --quiet -c "$(basename "$suma")"); then
            echo "OK    $(basename "$suma" .sha256)"
        else
            echo "FALLA $(basename "$suma" .sha256)"
            fallas=$((fallas + 1))
        fi
    done
    (( fallas == 0 )) || error "$fallas copia(s) danadas"
}

restaurar() {
    local archivo="\${1:-}" carpeta="\${2:-}"
    [[ -f "$archivo" && -n "$carpeta" ]] || uso
    (cd "$(dirname "$archivo")" && sha256sum --quiet -c "$(basename "$archivo").sha256") \
        || error "la copia $archivo no pasa la verificacion"
    mkdir -p "$carpeta"
    tar -xzf "$archivo" -C "$carpeta"
    echo "Restaurada en $carpeta"
}

rotar() {
    shopt -s nullglob
    local copias=("$DESTINO"/copia-*.tar.gz)
    local sobran=$(( \${#copias[@]} - CONSERVAR ))
    if (( sobran <= 0 )); then
        echo "Nada para borrar (\${#copias[@]} de $CONSERVAR)"
        return
    fi
    for copia in "\${copias[@]:0:sobran}"; do
        rm -f -- "$copia" "$copia.sha256"
        echo "Borrada $(basename "$copia")"
    done
}

case "\${1:-}" in
    crear) crear ;;
    listar) listar ;;
    estado) estado ;;
    verificar) verificar ;;
    restaurar) restaurar "\${2:-}" "\${3:-}" ;;
    rotar) rotar ;;
    *) uso ;;
esac
`,
      },
      {
        name: "probar.sh", lang: "linux", tabWidth: 4, text: src`
#!/usr/bin/env bash
# Prueba respaldo.sh de punta a punta en una carpeta temporal.
set -euo pipefail

aqui="$(cd "$(dirname "$0")" && pwd)"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

export ORIGEN="$tmp/datos" DESTINO="$tmp/copias" CONSERVAR=2
mkdir -p "$ORIGEN/sub" "$ORIGEN/cache"
echo "hola" > "$ORIGEN/a.txt"
echo "chau" > "$ORIGEN/sub/b.txt"
echo "temporal" > "$ORIGEN/cache/c.tmp"
echo "cache" > "$ORIGEN/.respaldoignore"

falla() {
    echo "FALLA: $*" >&2
    exit 1
}

respaldo() {
    bash "$aqui/respaldo.sh" "$@"
}

for _ in 1 2 3; do
    respaldo crear > /dev/null
done
[[ $(ls "$DESTINO"/*.tar.gz | wc -l) -eq 3 ]] || falla "se esperaban 3 copias"

respaldo verificar > /dev/null || falla "las copias nuevas no pasan la verificacion"

respaldo rotar > /dev/null
[[ $(ls "$DESTINO"/*.tar.gz | wc -l) -eq 2 ]] || falla "rotar tenia que dejar 2 copias"

ultima="$(ls "$DESTINO"/*.tar.gz | tail -n 1)"
respaldo restaurar "$ultima" "$tmp/vuelta" > /dev/null
[[ ! -e "$tmp/vuelta/datos/cache" ]] || falla "no respeto .respaldoignore"
diff -r --exclude=cache "$ORIGEN" "$tmp/vuelta/datos" || falla "lo restaurado no coincide con el original"
[[ "$(respaldo estado)" == *"Copias:    2 "* ]] || falla "estado no cuenta bien las copias"

echo "rota" >> "$ultima"
if respaldo verificar > /dev/null 2>&1; then
    falla "una copia danada paso la verificacion"
fi
if respaldo restaurar "$ultima" "$tmp/otra" > /dev/null 2>&1; then
    falla "se restauro una copia danada"
fi

echo "Todas las pruebas pasaron"
`,
      },
      {
        name: "Makefile", lang: "linux", tabWidth: 0, text: tabs`
SHELL := /bin/bash
ORIGEN ?= ./datos
DESTINO ?= ./copias
CONSERVAR ?= 5
EN ?= ./restaurado

export ORIGEN DESTINO CONSERVAR

.PHONY: copia lista estado verificar rotar restaurar probar limpiar

copia:
    bash respaldo.sh crear

lista:
    bash respaldo.sh listar

estado:
    bash respaldo.sh estado

verificar:
    bash respaldo.sh verificar

rotar: verificar
    bash respaldo.sh rotar

restaurar:
    @test -n "$(ARCHIVO)" || (echo "Falta ARCHIVO=copias/copia-....tar.gz" && exit 1)
    bash respaldo.sh restaurar "$(ARCHIVO)" "$(EN)"

probar:
    bash probar.sh

limpiar:
    rm -rf "$(DESTINO)" "$(EN)"
`,
      },
    ],
  },
  {
    id: "p14",
    num: 16,
    title: "Acortador de enlaces en contenedores",
    level: "Experto",
    stack: ["Python", "FastAPI", "SQLite", "Docker", "YAML"],
    desc:
      "Un acortador de enlaces con FastAPI y SQLite, empaquetado con Dockerfile y Docker Compose, con un volumen " +
      "para no perder los datos.",
    skills: "SQL dentro de Python, variables de entorno, Dockerfile, .dockerignore y la sangría de 2 espacios de YAML",
    files: [
      {
        name: "requirements.txt", lang: "formats", tabWidth: 4, text: src`
fastapi
uvicorn[standard]
`,
      },
      py("main.py", src`
import os
import secrets
import sqlite3
from contextlib import asynccontextmanager, closing

from fastapi import FastAPI, HTTPException
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, Field, HttpUrl

RUTA_DB = os.environ.get("RUTA_DB", "enlaces.db")
URL_BASE = os.environ.get("URL_BASE", "http://localhost:8000")


def conectar():
    conexion = sqlite3.connect(RUTA_DB)
    conexion.row_factory = sqlite3.Row
    return conexion


@asynccontextmanager
async def ciclo_de_vida(app: FastAPI):
    with closing(conectar()) as conexion, conexion:
        conexion.execute(
            "CREATE TABLE IF NOT EXISTS enlaces ("
            " codigo TEXT PRIMARY KEY,"
            " destino TEXT NOT NULL,"
            " visitas INTEGER NOT NULL DEFAULT 0)"
        )
    yield


app = FastAPI(title="Acortador", lifespan=ciclo_de_vida)


class EnlaceNuevo(BaseModel):
    destino: HttpUrl
    codigo: str | None = Field(default=None, pattern=r"^[A-Za-z0-9_-]{3,20}$")


@app.get("/salud")
def salud():
    return {"estado": "ok"}


@app.post("/enlaces", status_code=201)
def acortar(enlace: EnlaceNuevo):
    codigo = enlace.codigo or secrets.token_urlsafe(5)
    if codigo in ("salud", "enlaces"):
        raise HTTPException(status_code=409, detail="Ese codigo esta reservado")
    try:
        with closing(conectar()) as conexion, conexion:
            conexion.execute(
                "INSERT INTO enlaces (codigo, destino) VALUES (?, ?)",
                (codigo, str(enlace.destino)),
            )
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=409, detail="Ese codigo ya esta en uso") from None
    return {"codigo": codigo, "corto": f"{URL_BASE}/{codigo}"}


@app.get("/enlaces")
def mas_visitados(limite: int = 10):
    limite = max(1, min(limite, 100))
    with closing(conectar()) as conexion:
        filas = conexion.execute(
            "SELECT * FROM enlaces ORDER BY visitas DESC, codigo LIMIT ?",
            (limite,),
        ).fetchall()
    return [dict(fila) for fila in filas]


@app.get("/enlaces/{codigo}")
def estadisticas(codigo: str):
    with closing(conectar()) as conexion:
        fila = conexion.execute("SELECT * FROM enlaces WHERE codigo = ?", (codigo,)).fetchone()
    if fila is None:
        raise HTTPException(status_code=404, detail="No existe ese enlace")
    return dict(fila)


@app.delete("/enlaces/{codigo}", status_code=204)
def borrar(codigo: str):
    with closing(conectar()) as conexion, conexion:
        borradas = conexion.execute("DELETE FROM enlaces WHERE codigo = ?", (codigo,)).rowcount
    if borradas == 0:
        raise HTTPException(status_code=404, detail="No existe ese enlace")


@app.get("/{codigo}")
def redirigir(codigo: str):
    with closing(conectar()) as conexion, conexion:
        filas = conexion.execute(
            "UPDATE enlaces SET visitas = visitas + 1 WHERE codigo = ? RETURNING destino",
            (codigo,),
        ).fetchall()
    if not filas:
        raise HTTPException(status_code=404, detail="No existe ese enlace")
    return RedirectResponse(filas[0]["destino"], status_code=307)
`),
      py("test_main.py", src`
import os
import tempfile

os.environ["RUTA_DB"] = os.path.join(tempfile.mkdtemp(), "prueba.db")

from fastapi.testclient import TestClient  # noqa: E402

import main  # noqa: E402


def test_acorta_redirige_y_cuenta():
    with TestClient(main.app) as cliente:
        creado = cliente.post("/enlaces", json={"destino": "https://example.com/una/ruta"})
        assert creado.status_code == 201
        codigo = creado.json()["codigo"]

        salto = cliente.get(f"/{codigo}", follow_redirects=False)
        assert salto.status_code == 307
        assert salto.headers["location"] == "https://example.com/una/ruta"
        assert cliente.get(f"/enlaces/{codigo}").json()["visitas"] == 1


def test_rechaza_lo_que_no_es_una_url():
    with TestClient(main.app) as cliente:
        assert cliente.post("/enlaces", json={"destino": "no es una url"}).status_code == 422


def test_codigo_propio_y_repetido():
    with TestClient(main.app) as cliente:
        datos = {"destino": "https://example.com", "codigo": "mi-enlace"}
        assert cliente.post("/enlaces", json=datos).json()["codigo"] == "mi-enlace"
        assert cliente.post("/enlaces", json=datos).status_code == 409
        assert cliente.post("/enlaces", json={**datos, "codigo": "salud"}).status_code == 409
        assert cliente.post("/enlaces", json={**datos, "codigo": "con espacios"}).status_code == 422


def test_lista_los_mas_visitados_y_borra():
    with TestClient(main.app) as cliente:
        cliente.post("/enlaces", json={"destino": "https://example.com/a", "codigo": "aaa"})
        cliente.post("/enlaces", json={"destino": "https://example.com/b", "codigo": "bbb"})
        for _ in range(3):
            cliente.get("/bbb", follow_redirects=False)
        primero = cliente.get("/enlaces", params={"limite": 1}).json()
        assert [e["codigo"] for e in primero] == ["bbb"]
        assert cliente.delete("/enlaces/bbb").status_code == 204
        assert cliente.delete("/enlaces/bbb").status_code == 404


def test_codigo_que_no_existe():
    with TestClient(main.app) as cliente:
        assert cliente.get("/nada", follow_redirects=False).status_code == 404
        assert cliente.get("/enlaces/nada").status_code == 404
`),
      {
        name: "Dockerfile", lang: "formats", tabWidth: 4, text: src`
FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY main.py .

RUN useradd --create-home acortador && mkdir /datos && chown acortador /datos
USER acortador

EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=3s \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/salud')"
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
`,
      },
      {
        name: ".dockerignore", lang: "formats", tabWidth: 4, text: src`
__pycache__/
*.pyc
*.db
.env
.venv/
test_main.py
`,
      },
      {
        name: ".env", lang: "formats", tabWidth: 4, text: src`
URL_BASE=http://localhost:8000
`,
      },
      {
        name: "docker-compose.yml", lang: "formats", tabWidth: 2, text: src`
services:
  api:
    build: .
    env_file: .env
    environment:
      RUTA_DB: /datos/enlaces.db
    volumes:
      - enlaces:/datos
    ports:
      - "8000:8000"
    restart: unless-stopped

volumes:
  enlaces:
`,
      },
    ],
  },
  {
    id: "p18",
    num: 17,
    title: "Lista de tareas con React",
    level: "Avanzado",
    stack: ["TypeScript", "React"],
    desc: "Una aplicación de tareas con componentes: se agregan, se marcan, se borran y se filtran, con el estado en un solo lugar.",
    skills: "componentes, props tipadas, useState y listas con key de React",
    after: "p05",
    files: [
      {
        name: "Tarea.tsx",
        lang: "typescript",
        tabWidth: 2,
        text: src`
export interface Tarea {
  id: number;
  titulo: string;
  hecha: boolean;
}

interface Props {
  tarea: Tarea;
  alCambiar: (id: number) => void;
  alBorrar: (id: number) => void;
}

export function FilaTarea({ tarea, alCambiar, alBorrar }: Props) {
  return (
    <li className={tarea.hecha ? "hecha" : ""}>
      <label>
        <input
          type="checkbox"
          checked={tarea.hecha}
          onChange={() => alCambiar(tarea.id)}
        />
        {tarea.titulo}
      </label>
      <button onClick={() => alBorrar(tarea.id)}>Borrar</button>
    </li>
  );
}`,
      },
      {
        name: "App.tsx",
        lang: "typescript",
        tabWidth: 2,
        text: src`
import { type FormEvent, useState } from "react";
import { FilaTarea, type Tarea } from "./Tarea";

type Filtro = "todas" | "pendientes" | "hechas";
const FILTROS: Filtro[] = ["todas", "pendientes", "hechas"];

export default function App() {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [texto, setTexto] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todas");

  function agregar(e: FormEvent) {
    e.preventDefault();
    const titulo = texto.trim();
    if (!titulo) return;
    setTareas([...tareas, { id: Date.now(), titulo, hecha: false }]);
    setTexto("");
  }

  function cambiar(id: number) {
    setTareas(tareas.map((t) => (t.id === id ? { ...t, hecha: !t.hecha } : t)));
  }

  function borrar(id: number) {
    setTareas(tareas.filter((t) => t.id !== id));
  }

  const visibles = tareas.filter((t) => {
    if (filtro === "pendientes") return !t.hecha;
    if (filtro === "hechas") return t.hecha;
    return true;
  });
  const pendientes = tareas.filter((t) => !t.hecha).length;

  return (
    <main>
      <h1>Tareas</h1>
      <form onSubmit={agregar}>
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Nueva tarea"
        />
        <button type="submit">Agregar</button>
      </form>
      <nav>
        {FILTROS.map((f) => (
          <button key={f} disabled={f === filtro} onClick={() => setFiltro(f)}>
            {f}
          </button>
        ))}
      </nav>
      <ul>
        {visibles.map((t) => (
          <FilaTarea key={t.id} tarea={t} alCambiar={cambiar} alBorrar={borrar} />
        ))}
      </ul>
      <p>{pendientes} pendientes</p>
    </main>
  );
}`,
      },
    ],
  },
  {
    id: "p19",
    num: 18,
    title: "Blog con Django",
    level: "Experto",
    stack: ["Python", "Django"],
    desc: "Las piezas de una app Django: modelos con relación, un formulario con validación, vistas, rutas y el panel de administración.",
    skills: "modelos, ModelForm, vistas, urls y admin de Django",
    after: "p07",
    files: [
      py("blog/models.py", src`
from django.db import models


class Autor(models.Model):
    nombre = models.CharField(max_length=100)

    class Meta:
        verbose_name_plural = "autores"

    def __str__(self):
        return self.nombre


class Articulo(models.Model):
    autor = models.ForeignKey(Autor, on_delete=models.CASCADE, related_name="articulos")
    titulo = models.CharField(max_length=200)
    cuerpo = models.TextField()
    publicado = models.BooleanField(default=False)
    creado = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-creado"]

    def __str__(self):
        return self.titulo

    def resumen(self):
        return self.cuerpo[:100]`),
      py("blog/forms.py", src`
from django import forms

from .models import Articulo


class ArticuloForm(forms.ModelForm):
    class Meta:
        model = Articulo
        fields = ["autor", "titulo", "cuerpo", "publicado"]

    def clean_titulo(self):
        titulo = self.cleaned_data["titulo"].strip()
        if len(titulo) < 5:
            raise forms.ValidationError("El titulo es muy corto")
        return titulo`),
      py("blog/views.py", src`
from django.shortcuts import get_object_or_404, redirect, render

from .forms import ArticuloForm
from .models import Articulo


def lista(request):
    articulos = Articulo.objects.filter(publicado=True).select_related("autor")
    return render(request, "blog/lista.html", {"articulos": articulos})


def detalle(request, pk):
    articulo = get_object_or_404(Articulo, pk=pk, publicado=True)
    return render(request, "blog/detalle.html", {"articulo": articulo})


def nuevo(request):
    if request.method == "POST":
        form = ArticuloForm(request.POST)
        if form.is_valid():
            articulo = form.save()
            return redirect("detalle", pk=articulo.pk)
    else:
        form = ArticuloForm()
    return render(request, "blog/formulario.html", {"form": form})`),
      py("blog/urls.py", src`
from django.urls import path

from . import views

urlpatterns = [
    path("", views.lista, name="lista"),
    path("articulos/nuevo/", views.nuevo, name="nuevo"),
    path("articulos/<int:pk>/", views.detalle, name="detalle"),
]`),
      html("blog/templates/blog/lista.html", src`
<h1>Blog</h1>
<ul>
  {% for articulo in articulos %}
    <li>
      <a href="{% url 'detalle' articulo.pk %}">{{ articulo.titulo }}</a>
      por {{ articulo.autor }}
    </li>
  {% empty %}
    <li>Todavia no hay articulos.</li>
  {% endfor %}
</ul>
<a href="{% url 'nuevo' %}">Escribir un articulo</a>`),
      html("blog/templates/blog/detalle.html", src`
<h1>{{ articulo.titulo }}</h1>
<p>Por {{ articulo.autor }} el {{ articulo.creado|date:"d/m/Y" }}</p>
<div>{{ articulo.cuerpo|linebreaks }}</div>
<a href="{% url 'lista' %}">Volver</a>`),
      html("blog/templates/blog/formulario.html", src`
<h1>Nuevo articulo</h1>
<form method="post">
  {% csrf_token %}
  {{ form.as_p }}
  <button type="submit">Guardar</button>
</form>
<a href="{% url 'lista' %}">Cancelar</a>`),
      py("blog/admin.py", src`
from django.contrib import admin

from .models import Articulo, Autor


@admin.register(Articulo)
class ArticuloAdmin(admin.ModelAdmin):
    list_display = ["titulo", "autor", "publicado", "creado"]
    list_filter = ["publicado", "autor"]
    search_fields = ["titulo", "cuerpo"]


admin.site.register(Autor)`),
    ],
  },
  {
    id: "p20",
    num: 19,
    title: "API de libros con Spring Boot",
    level: "Experto",
    stack: ["Java", "Spring Boot"],
    desc: "Una API REST con las capas de Spring: controlador, servicio, un registro como DTO validado y un manejador de errores.",
    skills: "controladores, inyección por constructor, validación y manejo de errores de Spring Boot",
    after: "p09",
    files: [
      {
        name: "src/main/java/ejemplo/biblioteca/BibliotecaApplication.java",
        lang: "java",
        tabWidth: 4,
        text: src`
package ejemplo.biblioteca;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BibliotecaApplication {

    public static void main(String[] args) {
        SpringApplication.run(BibliotecaApplication.class, args);
    }
}`,
      },
      {
        name: "src/main/java/ejemplo/biblioteca/Libro.java",
        lang: "java",
        tabWidth: 4,
        text: src`
package ejemplo.biblioteca;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

public record Libro(
        Long id,
        @NotBlank(message = "El titulo es obligatorio") String titulo,
        @NotBlank(message = "El autor es obligatorio") String autor,
        @Positive(message = "Las paginas tienen que ser positivas") int paginas) {
}`,
      },
      {
        name: "src/main/java/ejemplo/biblioteca/LibroNoEncontradoException.java",
        lang: "java",
        tabWidth: 4,
        text: src`
package ejemplo.biblioteca;

public class LibroNoEncontradoException extends RuntimeException {

    public LibroNoEncontradoException(long id) {
        super("No existe el libro " + id);
    }
}`,
      },
      {
        name: "src/main/java/ejemplo/biblioteca/LibroService.java",
        lang: "java",
        tabWidth: 4,
        text: src`
package ejemplo.biblioteca;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.stereotype.Service;

@Service
public class LibroService {

    private final List<Libro> libros = new ArrayList<>();
    private final AtomicLong siguiente = new AtomicLong(1);

    public synchronized List<Libro> todos(String autor) {
        return libros.stream()
                .filter(libro -> autor == null || libro.autor().equalsIgnoreCase(autor))
                .toList();
    }

    public synchronized Libro buscar(long id) {
        return libros.stream()
                .filter(libro -> libro.id() == id)
                .findFirst()
                .orElseThrow(() -> new LibroNoEncontradoException(id));
    }

    public synchronized Libro crear(Libro datos) {
        Libro libro = new Libro(siguiente.getAndIncrement(), datos.titulo(), datos.autor(), datos.paginas());
        libros.add(libro);
        return libro;
    }

    public synchronized void borrar(long id) {
        Libro libro = buscar(id);
        libros.remove(libro);
    }
}`,
      },
      {
        name: "src/main/java/ejemplo/biblioteca/LibroController.java",
        lang: "java",
        tabWidth: 4,
        text: src`
package ejemplo.biblioteca;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/libros")
public class LibroController {

    private final LibroService servicio;

    public LibroController(LibroService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public List<Libro> listar(@RequestParam(required = false) String autor) {
        return servicio.todos(autor);
    }

    @GetMapping("/{id}")
    public Libro mostrar(@PathVariable long id) {
        return servicio.buscar(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Libro crear(@Valid @RequestBody Libro datos) {
        return servicio.crear(datos);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void borrar(@PathVariable long id) {
        servicio.borrar(id);
    }
}`,
      },
      {
        name: "src/main/java/ejemplo/biblioteca/ManejadorErrores.java",
        lang: "java",
        tabWidth: 4,
        text: src`
package ejemplo.biblioteca;

import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ManejadorErrores {

    @ExceptionHandler(LibroNoEncontradoException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Map<String, String> noEncontrado(LibroNoEncontradoException e) {
        return Map.of("error", e.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> invalido(MethodArgumentNotValidException e) {
        String mensaje = e.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .findFirst()
                .orElse("Datos invalidos");
        return Map.of("error", mensaje);
    }
}`,
      },
    ],
  },
  {
    id: "p21",
    num: 20,
    title: "API de tareas con ASP.NET Core",
    level: "Experto",
    stack: ["C#", "ASP.NET Core"],
    desc: "Una minimal API con grupo de rutas, un servicio por inyección de dependencias, validación, un middleware y un resumen.",
    skills: "minimal APIs, Results, inyección de dependencias, validación y middleware de ASP.NET Core",
    after: "p11",
    files: [
      {
        name: "Tareas.csproj",
        lang: "html",
        tabWidth: 2,
        text: src`
<Project Sdk="Microsoft.NET.Sdk.Web">

  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>

</Project>`,
      },
      {
        name: "Reloj.cs",
        lang: "csharp",
        tabWidth: 4,
        text: src`
namespace Tareas;

public interface IReloj
{
    DateTime Ahora();
}

public class RelojSistema : IReloj
{
    public DateTime Ahora() => DateTime.UtcNow;
}`,
      },
      {
        name: "Modelos.cs",
        lang: "csharp",
        tabWidth: 4,
        text: src`
namespace Tareas;

public record Tarea(int Id, string Titulo, bool Hecha, DateTime Creada);

public record Resumen(int Total, int Hechas, int Pendientes);

public class NuevaTarea
{
    public string? Titulo { get; set; }

    public Dictionary<string, string[]> Validar()
    {
        var errores = new Dictionary<string, string[]>();
        if (string.IsNullOrWhiteSpace(Titulo))
        {
            errores["titulo"] = new[] { "El titulo es obligatorio" };
        }
        else if (Titulo.Length > 100)
        {
            errores["titulo"] = new[] { "El titulo no puede pasar de 100 caracteres" };
        }
        return errores;
    }
}`,
      },
      {
        name: "Repositorio.cs",
        lang: "csharp",
        tabWidth: 4,
        text: src`
namespace Tareas;

public class RepositorioTareas
{
    private readonly List<Tarea> _tareas = new();
    private readonly object _candado = new();
    private readonly IReloj _reloj;
    private int _siguiente = 1;

    public RepositorioTareas(IReloj reloj)
    {
        _reloj = reloj;
    }

    public IReadOnlyList<Tarea> Todas(bool? hechas = null, int pagina = 1, int porPagina = 10)
    {
        lock (_candado)
        {
            return _tareas
                .Where(t => hechas is null || t.Hecha == hechas)
                .OrderBy(t => t.Creada)
                .Skip((Math.Max(pagina, 1) - 1) * porPagina)
                .Take(porPagina)
                .ToList();
        }
    }

    public Tarea? Buscar(int id)
    {
        lock (_candado)
        {
            return _tareas.FirstOrDefault(t => t.Id == id);
        }
    }

    public Tarea Crear(string titulo)
    {
        lock (_candado)
        {
            var tarea = new Tarea(_siguiente++, titulo.Trim(), false, _reloj.Ahora());
            _tareas.Add(tarea);
            return tarea;
        }
    }

    public Tarea? MarcarHecha(int id)
    {
        lock (_candado)
        {
            var indice = _tareas.FindIndex(t => t.Id == id);
            if (indice < 0)
            {
                return null;
            }
            _tareas[indice] = _tareas[indice] with { Hecha = true };
            return _tareas[indice];
        }
    }

    public Tarea? Renombrar(int id, string titulo)
    {
        lock (_candado)
        {
            var indice = _tareas.FindIndex(t => t.Id == id);
            if (indice < 0)
            {
                return null;
            }
            _tareas[indice] = _tareas[indice] with { Titulo = titulo.Trim() };
            return _tareas[indice];
        }
    }

    public bool Borrar(int id)
    {
        lock (_candado)
        {
            return _tareas.RemoveAll(t => t.Id == id) > 0;
        }
    }

    public Resumen Resumir()
    {
        lock (_candado)
        {
            var hechas = _tareas.Count(t => t.Hecha);
            return new Resumen(_tareas.Count, hechas, _tareas.Count - hechas);
        }
    }
}`,
      },
      {
        name: "Program.cs",
        lang: "csharp",
        tabWidth: 4,
        text: src`
using Tareas;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSingleton<IReloj, RelojSistema>();
builder.Services.AddSingleton<RepositorioTareas>();

var app = builder.Build();

app.Use(async (contexto, siguiente) =>
{
    var inicio = DateTime.UtcNow;
    await siguiente();
    var ms = (DateTime.UtcNow - inicio).TotalMilliseconds;
    app.Logger.LogInformation("{Metodo} {Ruta} -> {Estado} en {Ms} ms",
        contexto.Request.Method, contexto.Request.Path, contexto.Response.StatusCode, ms);
});

app.MapGet("/", () => "API de tareas");

var tareas = app.MapGroup("/tareas");

tareas.MapGet("/", (RepositorioTareas repo, bool? hechas, int? pagina) =>
    Results.Ok(repo.Todas(hechas, pagina ?? 1)));

tareas.MapGet("/resumen", (RepositorioTareas repo) =>
    Results.Ok(repo.Resumir()));

tareas.MapGet("/{id:int}", (int id, RepositorioTareas repo) =>
    repo.Buscar(id) is Tarea tarea ? Results.Ok(tarea) : Results.NotFound());

tareas.MapPost("/", (NuevaTarea datos, RepositorioTareas repo) =>
{
    var errores = datos.Validar();
    if (errores.Count > 0)
    {
        return Results.ValidationProblem(errores);
    }

    var tarea = repo.Crear(datos.Titulo!);
    return Results.Created("/tareas/" + tarea.Id, tarea);
});

tareas.MapPut("/{id:int}", (int id, NuevaTarea datos, RepositorioTareas repo) =>
{
    var errores = datos.Validar();
    if (errores.Count > 0)
    {
        return Results.ValidationProblem(errores);
    }

    return repo.Renombrar(id, datos.Titulo!) is Tarea tarea ? Results.Ok(tarea) : Results.NotFound();
});

tareas.MapPut("/{id:int}/hecha", (int id, RepositorioTareas repo) =>
    repo.MarcarHecha(id) is Tarea tarea ? Results.Ok(tarea) : Results.NotFound());

tareas.MapDelete("/{id:int}", (int id, RepositorioTareas repo) =>
    repo.Borrar(id) ? Results.NoContent() : Results.NotFound());

app.Run();`,
      },
    ],
  },
  {
    id: "p10",
    num: 21,
    after: "p14",
    title: "Tablero de tareas full stack",
    level: "Maestro",
    stack: ["Makefile", "Docker", "YAML", "SQL", "Python", "HTML", "CSS", "TypeScript"],
    desc:
      "Una aplicación completa en nueve archivos: base PostgreSQL, API REST con FastAPI, front-end en TypeScript, " +
      "contenedores con Docker Compose y un Makefile para manejarlo todo.",
    skills: "cambiar de lenguaje y de sangría en cada archivo: tabulaciones, YAML, SQL, Python, HTML, CSS y TypeScript",
    files: [
      {
        name: "Makefile", lang: "linux", tabWidth: 0, text: tabs`
.PHONY: dev web test db clean

dev:
    docker compose up --build

web:
    npx tsc web/app.ts --target es2022 --lib es2022,dom --outDir web

test:
    cd api && python -m pytest -q

db:
    docker compose exec db psql -U tablero -d tablero -f /schema/schema.sql

clean:
    docker compose down -v
`,
      },
      {
        name: "docker-compose.yml", lang: "formats", tabWidth: 2, text: src`
services:
  db:
    image: postgres:17
    environment:
      POSTGRES_USER: tablero
      POSTGRES_PASSWORD: tablero
      POSTGRES_DB: tablero
    volumes:
      - datos:/var/lib/postgresql/data
      - ./db:/schema:ro
    ports:
      - "5432:5432"
  api:
    build: ./api
    environment:
      DATABASE_URL: postgresql://tablero:tablero@db:5432/tablero
    depends_on:
      - db
    ports:
      - "8000:8000"
  web:
    image: nginx:alpine
    volumes:
      - ./web:/usr/share/nginx/html:ro
    ports:
      - "8080:80"

volumes:
  datos:
`,
      },
      {
        name: "db/schema.sql", lang: "sql", tabWidth: 4, text: src`
CREATE TABLE IF NOT EXISTS tareas (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(120) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente'
        CHECK (estado IN ('pendiente', 'en_curso', 'hecha')),
    prioridad SMALLINT NOT NULL DEFAULT 2,
    creada TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tareas_estado ON tareas (estado);
`,
      },
      {
        name: "api/requirements.txt", lang: "formats", tabWidth: 4, text: src`
fastapi
uvicorn[standard]
psycopg[binary]
`,
      },
      {
        name: "api/Dockerfile", lang: "formats", tabWidth: 4, text: src`
FROM python:3.13-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
`,
      },
      py("api/main.py", src`
import os
from contextlib import contextmanager
from typing import Literal

import psycopg
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from psycopg.rows import dict_row
from pydantic import BaseModel, Field

DATABASE_URL = os.environ["DATABASE_URL"]
Estado = Literal["pendiente", "en_curso", "hecha"]

app = FastAPI(title="Tablero de tareas")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class TareaNueva(BaseModel):
    titulo: str = Field(min_length=1, max_length=120)
    prioridad: int = Field(default=2, ge=1, le=3)


class CambioEstado(BaseModel):
    estado: Estado


@contextmanager
def db():
    with psycopg.connect(DATABASE_URL, row_factory=dict_row) as conexion:
        yield conexion


@app.get("/tareas")
def listar(estado: Estado | None = None):
    consulta = "SELECT * FROM tareas"
    parametros = []
    if estado:
        consulta += " WHERE estado = %s"
        parametros.append(estado)
    consulta += " ORDER BY prioridad, creada"
    with db() as conexion:
        return conexion.execute(consulta, parametros).fetchall()


@app.post("/tareas", status_code=201)
def crear(tarea: TareaNueva):
    with db() as conexion:
        return conexion.execute(
            "INSERT INTO tareas (titulo, prioridad) VALUES (%s, %s) RETURNING *",
            (tarea.titulo, tarea.prioridad),
        ).fetchone()


@app.patch("/tareas/{tarea_id}")
def cambiar_estado(tarea_id: int, cambio: CambioEstado):
    with db() as conexion:
        fila = conexion.execute(
            "UPDATE tareas SET estado = %s WHERE id = %s RETURNING *",
            (cambio.estado, tarea_id),
        ).fetchone()
    if fila is None:
        raise HTTPException(status_code=404, detail="La tarea no existe")
    return fila


@app.delete("/tareas/{tarea_id}", status_code=204)
def borrar(tarea_id: int):
    with db() as conexion:
        borradas = conexion.execute("DELETE FROM tareas WHERE id = %s", (tarea_id,)).rowcount
    if borradas == 0:
        raise HTTPException(status_code=404, detail="La tarea no existe")
`),
      {
        name: "web/index.html", lang: "html", tabWidth: 2, text: src`
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Tablero de tareas</title>
    <link rel="stylesheet" href="style.css">
    <script type="module" src="app.js"></script>
  </head>
  <body>
    <header>
      <h1>Tablero de tareas</h1>
      <form id="nueva">
        <input name="titulo" placeholder="Nueva tarea" required maxlength="120">
        <select name="prioridad">
          <option value="1">Alta</option>
          <option value="2" selected>Media</option>
          <option value="3">Baja</option>
        </select>
        <button type="submit">Agregar</button>
      </form>
    </header>
    <main class="tablero">
      <section class="columna" data-estado="pendiente">
        <h2>Pendiente</h2>
        <ul></ul>
      </section>
      <section class="columna" data-estado="en_curso">
        <h2>En curso</h2>
        <ul></ul>
      </section>
      <section class="columna" data-estado="hecha">
        <h2>Hecha</h2>
        <ul></ul>
      </section>
    </main>
  </body>
</html>
`,
      },
      {
        name: "web/style.css", lang: "css", tabWidth: 2, text: src`
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  background: #0f172a;
  color: #e2e8f0;
}

header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 24px;
  background: #1e293b;
}

form {
  display: flex;
  gap: 8px;
}

.tablero {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 24px;
}

.columna ul {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0;
  list-style: none;
}

.columna li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-left: 4px solid #64748b;
  border-radius: 6px;
  background: #1e293b;
}

.columna li button {
  margin-left: auto;
}

.columna li button + button {
  margin-left: 0;
}

.prioridad-1 {
  border-left-color: #f87171;
}

.prioridad-3 {
  border-left-color: #4ade80;
}

@media (max-width: 720px) {
  .tablero {
    grid-template-columns: 1fr;
  }
}
`,
      },
      {
        name: "web/app.ts", lang: "typescript", tabWidth: 2, text: src`
type Estado = "pendiente" | "en_curso" | "hecha";

interface Tarea {
  id: number;
  titulo: string;
  estado: Estado;
  prioridad: number;
}

const API = "http://localhost:8000";
const SIGUIENTE: Record<Estado, Estado | null> = {
  pendiente: "en_curso",
  en_curso: "hecha",
  hecha: null,
};

async function pedir<T>(ruta: string, opciones: RequestInit = {}): Promise<T> {
  const respuesta = await fetch(API + ruta, {
    headers: { "Content-Type": "application/json" },
    ...opciones,
  });
  if (!respuesta.ok) {
    throw new Error("Error " + respuesta.status + " en " + ruta);
  }
  return respuesta.status === 204 ? (undefined as T) : respuesta.json();
}

function tarjeta(tarea: Tarea): HTMLLIElement {
  const li = document.createElement("li");
  li.className = "prioridad-" + tarea.prioridad;
  li.textContent = tarea.titulo;
  const siguiente = SIGUIENTE[tarea.estado];
  if (siguiente) {
    const avanzar = document.createElement("button");
    avanzar.textContent = "Avanzar";
    avanzar.addEventListener("click", () => mover(tarea.id, siguiente));
    li.append(avanzar);
  }
  const borrar = document.createElement("button");
  borrar.textContent = "Borrar";
  borrar.addEventListener("click", () => quitar(tarea.id));
  li.append(borrar);
  return li;
}

async function dibujar(): Promise<void> {
  const tareas = await pedir<Tarea[]>("/tareas");
  document.querySelectorAll<HTMLElement>(".columna").forEach((columna) => {
    const lista = columna.querySelector("ul")!;
    const estado = columna.dataset.estado as Estado;
    lista.replaceChildren(...tareas.filter((t) => t.estado === estado).map(tarjeta));
  });
}

async function mover(id: number, estado: Estado): Promise<void> {
  await pedir("/tareas/" + id, { method: "PATCH", body: JSON.stringify({ estado }) });
  await dibujar();
}

async function quitar(id: number): Promise<void> {
  await pedir("/tareas/" + id, { method: "DELETE" });
  await dibujar();
}

const formulario = document.querySelector<HTMLFormElement>("#nueva")!;
formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  const datos = new FormData(formulario);
  await pedir("/tareas", {
    method: "POST",
    body: JSON.stringify({
      titulo: datos.get("titulo"),
      prioridad: Number(datos.get("prioridad")),
    }),
  });
  formulario.reset();
  await dibujar();
});

dibujar().catch((error) => console.error(error));
`,
      },
    ],
  },
];

export const PROJECT_IDS = PROJECTS.map((p) => p.id);

const has = (done: Record<string, unknown>, id: string) => Object.prototype.hasOwnProperty.call(done, id);

/**
 * Un proyecto se desbloquea al terminar el anterior. Si ya lo terminaste, queda abierto aunque el orden cambie
 * (el tablero full stack era el 10 y ahora es el 14: los ids no cambian, así que los récords se conservan).
 */
export function projectUnlocked(done: Record<string, unknown>, index: number): boolean {
  const p = PROJECTS[index];
  return index === 0 || has(done, p.id) || has(done, p.after ?? PROJECTS[index - 1].id);
}

/** Número del proyecto que hay que terminar para abrir el que está en la posición `index`. */
export const requiredNum = (index: number): number => {
  const after = PROJECTS[index].after;
  return after ? (PROJECTS.find((p) => p.id === after)?.num ?? index) : index;
};

/** Caracteres a escribir en todo el proyecto (para mostrar el tamaño). */
export const projectChars = (p: Project) => p.files.reduce((n, f) => n + f.text.length, 0);
export const projectLines = (p: Project) => p.files.reduce((n, f) => n + f.text.split("\n").length, 0);

/** mm:ss (o h:mm:ss) */
export function formatTime(ms: number): string {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = String(m).padStart(h ? 2 : 1, "0");
  return (h ? `${h}:` : "") + `${mm}:${String(s).padStart(2, "0")}`;
}
