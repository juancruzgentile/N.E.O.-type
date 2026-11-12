import { clasePython } from "./clases/python";
import { type Topic, a, b, code, m } from "./types";

export const python: Topic = {
  id: "python",
  name: "Python",
  group: "Lenguajes",
  emblem: "python",
  badge: "Py",
  color: "#4f9cff",
  hl: "python",
  summary:
    "Lenguaje interpretado, de tipado dinámico y sintaxis muy legible: los bloques se marcan con la sangría, no con llaves. " +
    "Se usa en automatización, ciencia de datos, inteligencia artificial, back-end web (Django, FastAPI) y scripts de todo tipo.",
  facts: [
    { label: "Archivos", value: ".py" },
    { label: "Ejecutar", value: "python archivo.py" },
    { label: "Paquetes", value: "pip · uv" },
    { label: "Versión de referencia", value: "3.14" },
    { label: "Estilo", value: "PEP 8 · 4 espacios" },
  ],
  workflow: [
    { title: "Un entorno virtual por proyecto", text: "Creá el entorno con python -m venv .venv (o uv venv) y activalo antes de instalar nada. Así cada proyecto tiene sus propias versiones de paquetes." },
    { title: "Dependencias en pyproject.toml", text: "Declará las dependencias en pyproject.toml. Con uv: uv add requests y uv sync reproducen el entorno exacto en otra máquina." },
    { title: "Formato y lint automáticos", text: "Ruff formatea (ruff format) y detecta errores comunes (ruff check). Configuralo en el editor para que se aplique al guardar." },
    { title: "Tipos donde importan", text: "Agregá type hints en funciones públicas y revisalos con mypy o pyright. Python no los exige al ejecutar, pero atrapan errores antes." },
    { title: "Tests con pytest", text: "Archivos test_*.py con funciones test_… y assert simples. pytest -q los encuentra y corre solos." },
    { title: "Estructura típica", text: "src/mi_paquete/ para el código, tests/ para las pruebas, pyproject.toml y README.md en la raíz. Los scripts usan if __name__ == \"__main__\":." },
  ],
  entries: [
    b("Entrada y salida", "print()", "Muestra valores en la consola. sep cambia el separador y end lo que va al final (por defecto un salto de línea).", code`
print("Hola", "mundo")          # Hola mundo
print("a", "b", sep=" - ")      # a - b
print("sin salto", end="")`, "imprimir mostrar consola salida"),
    b("Entrada y salida", "input()", "Pide un texto al usuario. Siempre devuelve un str: para números hay que convertirlo con int() o float().", code`
nombre = input("Tu nombre: ")
edad = int(input("Tu edad: "))`, "leer teclado entrada usuario"),
    b("Datos", "Variables y tipos", "Una variable es un nombre que apunta a un valor. Los tipos básicos son int, float, str, bool y None; type() dice cuál es.", code`
edad = 30            # int
precio = 9.99        # float
nombre = "Ana"       # str
activo = True        # bool
nada = None
print(type(precio))  # <class 'float'>`, "int float str bool none tipo"),
    b("Control de flujo", "if / elif / else", "Ejecuta un bloque según una condición. El bloque es todo lo que tiene más sangría que la línea del if.", code`
if nota >= 9:
    print("Excelente")
elif nota >= 6:
    print("Aprobado")
else:
    print("A recuperar")`, "condicional si sino"),
    b("Control de flujo", "for y range()", "Recorre cualquier secuencia. range(inicio, fin, paso) genera números sin incluir el fin.", code`
for fruta in ["manzana", "pera"]:
    print(fruta)

for i in range(0, 10, 2):
    print(i)  # 0 2 4 6 8`, "bucle loop iterar recorrer"),
    b("Control de flujo", "while, break y continue", "Repite mientras la condición sea verdadera. break corta el bucle y continue salta a la siguiente vuelta.", code`
intentos = 0
while intentos < 3:
    intentos += 1
    if intentos == 2:
        continue
    print(intentos)`, "bucle mientras"),
    b("Funciones", "def y return", "Define una función. Los parámetros pueden tener valor por defecto; return devuelve el resultado (sin return devuelve None).", code`
def saludar(nombre, saludo="Hola"):
    return f"{saludo}, {nombre}!"

saludar("Ana")            # 'Hola, Ana!'
saludar("Luis", "Buenas") # 'Buenas, Luis!'`, "funcion parametros argumentos"),
    b("Colecciones", "list", "Lista ordenada y modificable. Se accede por índice (desde 0, los negativos cuentan desde el final) y se corta con [inicio:fin].", code`
nums = [3, 1, 2]
nums.append(4)       # [3, 1, 2, 4]
nums.pop()           # saca y devuelve 4
nums[0]              # 3
nums[-1]             # 2
nums[1:]             # [1, 2]`, "lista array append pop slicing"),
    b("Colecciones", "dict", "Diccionario clave → valor. get() devuelve un valor por defecto si la clave no existe; items() recorre pares.", code`
edades = {"ana": 30, "luis": 25}
edades["eva"] = 41
edades.get("juan", 0)   # 0
for nombre, edad in edades.items():
    print(nombre, edad)`, "diccionario mapa clave valor"),
    b("Texto", "f-strings", "Cadenas con f adelante: lo que va entre llaves se evalúa. Después de : va el formato (decimales, ancho, alineación).", code`
precio = 1234.5
print(f"Total: {precio:.2f}")     # Total: 1234.50
print(f"{'id':<6}|{42:>5}")       # id    |   42
print(f"{precio=}")               # precio=1234.5`, "formato cadena interpolacion texto"),
    b("Texto", "Métodos de str", "Los textos son inmutables: cada método devuelve uno nuevo.", code`
"  hola  ".strip()          # 'hola'
"a,b,c".split(",")          # ['a', 'b', 'c']
"-".join(["a", "b"])        # 'a-b'
"Hola".upper().replace("O", "0")`, "split join strip upper lower replace cadena"),
    b("Funciones integradas", "len, sum, min, max, sorted", "Funciones que vienen con el lenguaje y sirven para cualquier colección.", code`
nums = [4, 1, 3]
len(nums)                 # 3
sum(nums)                 # 8
max(nums)                 # 4
sorted(nums, reverse=True)  # [4, 3, 1]`, "builtins integradas"),

    m("Colecciones", "Comprensiones", "Construyen listas, diccionarios o conjuntos en una sola expresión, con filtro opcional.", code`
cuadrados = [n * n for n in range(5)]
pares = [n for n in nums if n % 2 == 0]
por_nombre = {u["id"]: u for u in usuarios}`, "list comprehension comprension"),
    m("Errores", "try / except / finally", "Atrapa excepciones para manejarlas. else corre si no hubo error y finally corre siempre.", code`
try:
    n = int(texto)
except ValueError:
    print("No es un número")
else:
    print("OK", n)
finally:
    print("fin")`, "excepcion error manejo"),
    m("Errores", "raise", "Lanza una excepción. Conviene usar el tipo que mejor describe el problema (ValueError, KeyError…) o uno propio.", code`
class SaldoInsuficiente(Exception):
    pass

if monto > saldo:
    raise SaldoInsuficiente(f"Faltan {monto - saldo}")`, "lanzar excepcion propia"),
    m("Archivos", "with open()", "Abre un archivo y lo cierra solo al terminar el bloque, aunque haya un error. Indicá siempre el encoding.", code`
with open("datos.txt", encoding="utf-8") as f:
    for linea in f:
        print(linea.rstrip())

with open("salida.txt", "w", encoding="utf-8") as f:
    f.write("hola\n")`, "leer escribir archivo fichero"),
    m("Archivos", "pathlib.Path", "Rutas como objetos: unir, leer, escribir y buscar archivos sin pelearse con barras.", code`
from pathlib import Path

base = Path("datos")
archivo = base / "notas.txt"
archivo.write_text("hola", encoding="utf-8")
for p in base.glob("*.txt"):
    print(p.name, p.stat().st_size)`, "ruta directorio carpeta"),
    m("Módulos", "import", "Trae código de otro módulo. Un archivo .py es un módulo; una carpeta con módulos es un paquete.", code`
import json
from datetime import date, timedelta
from collections import Counter

Counter("banana").most_common(1)  # [('a', 3)]`, "modulo paquete importar"),
    m("Datos", "json", "Convierte entre objetos de Python y texto JSON.", code`
import json

texto = json.dumps({"ok": True}, indent=2)
datos = json.loads('{"n": 1}')
with open("conf.json", encoding="utf-8") as f:
    conf = json.load(f)`, "serializar parsear"),
    m("Clases", "class", "Agrupa datos y comportamiento. __init__ inicializa la instancia y self es la instancia misma.", code`
class Cuenta:
    def __init__(self, titular, saldo=0):
        self.titular = titular
        self.saldo = saldo

    def depositar(self, monto):
        self.saldo += monto

c = Cuenta("Ana")
c.depositar(100)`, "objeto poo clase metodo self"),
    m("Clases", "@dataclass", "Genera __init__, __repr__ y __eq__ a partir de los atributos con tipo. Ideal para objetos que son sobre todo datos.", code`
from dataclasses import dataclass, field

@dataclass
class Producto:
    nombre: str
    precio: float
    tags: list[str] = field(default_factory=list)`, "dataclass registro"),
    m("Funciones", "*args y **kwargs", "Reciben una cantidad variable de argumentos: posicionales en una tupla y con nombre en un diccionario.", code`
def log(*partes, **opciones):
    sep = opciones.get("sep", " ")
    print(sep.join(map(str, partes)))

log("a", 1, True, sep="|")  # a|1|True`, "argumentos variables"),
    m("Funciones", "lambda y key=", "Función anónima de una expresión. Se usa mucho como criterio de orden o filtro.", code`
usuarios.sort(key=lambda u: u["edad"])
mayor = max(productos, key=lambda p: p.precio)`, "anonima ordenar criterio"),
    m("Iteración", "enumerate() y zip()", "enumerate da índice y valor; zip recorre varias secuencias en paralelo.", code`
for i, nombre in enumerate(nombres, start=1):
    print(i, nombre)

for nombre, nota in zip(nombres, notas):
    print(nombre, nota)`, "indice paralelo"),

    a("Iteración", "Generadores y yield", "Una función con yield produce valores de a uno, sin armar toda la lista en memoria. Sirve para archivos grandes o secuencias infinitas.", code`
def leer_grande(ruta):
    with open(ruta, encoding="utf-8") as f:
        for linea in f:
            yield linea.rstrip()

total = sum(1 for _ in leer_grande("log.txt"))`, "generator perezoso lazy"),
    a("Funciones", "Decoradores", "Una función que envuelve a otra para agregarle comportamiento (medir tiempo, cachear, validar). functools.wraps conserva el nombre original.", code`
import functools, time

def cronometro(func):
    @functools.wraps(func)
    def envoltura(*args, **kwargs):
        t = time.perf_counter()
        try:
            return func(*args, **kwargs)
        finally:
            print(func.__name__, time.perf_counter() - t)
    return envoltura

@cronometro
def lento():
    time.sleep(1)`, "decorator wrapper"),
    a("Tipos", "Type hints", "Anotaciones de tipo para parámetros y retorno. No cambian la ejecución, pero el editor y mypy/pyright las usan para avisar errores.", code`
from typing import Iterable

def promedio(nums: Iterable[float]) -> float | None:
    lista = list(nums)
    return sum(lista) / len(lista) if lista else None

usuarios: dict[str, int] = {}`, "tipado typing mypy pyright anotaciones"),
    a("Control de flujo", "match / case", "Coincidencia de patrones: compara la forma de un valor, no solo su igualdad. Puede desarmar tuplas, listas y diccionarios.", code`
match comando.split():
    case ["salir"]:
        terminar()
    case ["ir", direccion]:
        mover(direccion)
    case ["tomar", *objetos] if objetos:
        tomar(objetos)
    case _:
        print("No entiendo")`, "pattern matching switch"),
    a("Concurrencia", "async / await", "Código asíncrono con asyncio: un solo hilo atiende muchas esperas de red a la vez (concurrencia, no paralelismo). Leer archivos con open() bloquea el bucle: para eso usá asyncio.to_thread() o una librería asíncrona.", code`
import asyncio

async def tarea(n):
    await asyncio.sleep(1)
    return n * 2

async def main():
    resultados = await asyncio.gather(*(tarea(i) for i in range(5)))
    print(resultados)

asyncio.run(main())`, "asyncio asincrono concurrencia corrutina"),
    a("Recursos", "Context managers propios", "Con contextlib.contextmanager se crea un with propio: lo de antes del yield abre y lo de después cierra.", code`
from contextlib import contextmanager

@contextmanager
def transaccion(con):
    try:
        yield con
        con.commit()
    except Exception:
        con.rollback()
        raise`, "with contextlib"),
    a("Entorno", "venv y uv", "Entornos aislados por proyecto. uv es un gestor muy rápido que crea el entorno, instala y bloquea versiones.", code`
python -m venv .venv
source .venv/bin/activate     # Windows: .venv\Scripts\activate
pip install requests

uv init mi-app && cd mi-app
uv add requests
uv run main.py`, "entorno virtual pip dependencias paquetes"),
    a("Calidad", "pytest", "Framework de tests: funciones test_ con assert simples. Las fixtures preparan datos y parametrize repite un test con varios casos.", code`
import pytest
from calc import dividir

@pytest.mark.parametrize("a, b, esperado", [(6, 3, 2), (5, 2, 2.5)])
def test_dividir(a, b, esperado):
    assert dividir(a, b) == esperado

def test_cero():
    with pytest.raises(ZeroDivisionError):
        dividir(1, 0)`, "test prueba unitaria testing"),
  ],
  clase: clasePython,
};
