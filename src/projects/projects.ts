// Proyectos: programas completos que hay que escribir de punta a punta, sangrías
// incluidas, en el menor tiempo posible. Se desbloquean en orden.
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
}

/** Bloque de código: quita el salto inicial y los espacios finales. Respeta las barras invertidas. */
const src = (s: TemplateStringsArray) => String.raw(s).replace(/^\n/, "").replace(/\s+$/, "");
/** Igual que `src`, pero cada grupo de 4 espacios al principio de línea pasa a ser una tabulación. */
const tabs = (s: TemplateStringsArray) =>
  src(s).replace(/^(?: {4})+/gm, (m) => "\t".repeat(m.length / 4));

const py = (name: string, text: string): ProjectFile => ({ name, lang: "python", tabWidth: 4, text });

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
    id: "p07",
    num: 7,
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
    num: 8,
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
    num: 9,
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
    id: "p10",
    num: 10,
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

/** Un proyecto se desbloquea al terminar el anterior. */
export function projectUnlocked(done: Record<string, unknown>, index: number): boolean {
  return index === 0 || Object.prototype.hasOwnProperty.call(done, PROJECTS[index - 1].id);
}

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
