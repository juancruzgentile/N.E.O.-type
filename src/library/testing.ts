import { type Topic, a, b, code, m } from "./types";
import { claseTesting } from "./clases/testing";

export const testing: Topic = {
  id: "testing",
  name: "Testing: pruebas automáticas",
  group: "Herramientas",
  emblem: null,
  badge: "TS",
  color: "#8bd450",
  hl: "python",
  summary:
    "Una prueba automática es un programa que comprueba que otro programa hace lo que debe. Acá están las herramientas de pytest para escribirlas bien: asserts, errores esperados, fixtures, parametrización, dobles de prueba, pruebas de integración y cómo hacer el código fácil de probar.",
  facts: [
    { label: "Herramienta", value: "pytest" },
    { label: "Ejecutar", value: "pytest -q · pytest -k nombre · pytest -x" },
    { label: "Archivos", value: "test_*.py con funciones test_*" },
    { label: "Tipos", value: "unitarias · de integración · de punta a punta" },
  ],
  workflow: [
    { title: "Arreglo, acción, comprobación", text: "Cada prueba prepara los datos, ejecuta una sola cosa y comprueba el resultado. Si cuesta leerla, probablemente prueba demasiado." },
    { title: "Probá comportamientos, no detalles internos", text: "Una prueba que se rompe cada vez que refactorizás, sin que cambie lo que hace el código, estorba en vez de ayudar." },
    { title: "Un error nuevo, una prueba nueva", text: "Cuando arreglás un fallo, primero escribí la prueba que lo reproduce. Así no vuelve." },
    { title: "Rápidas y sin azar", text: "Una suite lenta no se corre; una prueba que a veces falla sin motivo (flaky) no se respeta. Controlá el tiempo, el azar y la red." },
    { title: "Corrélas en cada cambio", text: "Las pruebas valen si se ejecutan solas: en tu editor al guardar y en la integración continua en cada pull request." },
  ],
  entries: [
    b("Primeros pasos", "Tu primera prueba con assert", "Una prueba es una función test_ que usa assert. Si la condición es falsa, la prueba falla y pytest muestra los valores involucrados.", code`
# test_precios.py
def con_iva(precio):
    return round(precio * 1.21, 2)

def test_con_iva():
    assert con_iva(100) == 121.0

def test_con_iva_cero():
    assert con_iva(0) == 0`, "assert test funcion pytest primera prueba"),
    b("Primeros pasos", "pytest.raises: comprobar que falla", "También hay que probar los errores: que una entrada inválida lance la excepción correcta y con el mensaje esperado.", code`
import pytest

def dividir(a, b):
    if b == 0:
        raise ValueError("el divisor no puede ser cero")
    return a / b

def test_dividir_por_cero():
    with pytest.raises(ValueError, match="no puede ser cero"):
        dividir(1, 0)`, "raises excepcion error esperado match"),
    b("Primeros pasos", "Arreglo, acción, comprobación", "Estructurar cada prueba en tres partes la vuelve legible: se prepara el escenario (arrange), se ejecuta la acción (act) y se comprueba (assert).", code`
def test_carrito_suma_el_total():
    # arreglo
    carrito = Carrito()
    carrito.agregar("cuaderno", precio=25, cantidad=2)
    carrito.agregar("lapiz", precio=5, cantidad=4)

    # acción
    total = carrito.total()

    # comprobación
    assert total == 70`, "aaa arrange act assert estructura prueba"),
    m("Fixtures", "Fixtures: preparar lo que necesita la prueba", "Una fixture es una función que prepara datos o recursos y se pide por nombre como parámetro. Evita repetir la preparación en cada prueba.", code`
import pytest

@pytest.fixture
def carrito():
    c = Carrito()
    c.agregar("cuaderno", precio=25, cantidad=2)
    return c

def test_total(carrito):
    assert carrito.total() == 50

def test_vaciar(carrito):
    carrito.vaciar()
    assert carrito.total() == 0`, "fixture preparar datos reutilizar parametro"),
    m("Fixtures", "parametrize: muchos casos, una prueba", "En vez de copiar la prueba con distintos valores, se escribe una vez y se listan los casos. Cada uno se ejecuta y se informa por separado.", code`
import pytest

@pytest.mark.parametrize("texto, esperado", [
    ("hola", True),
    ("", False),
    ("   ", False),
    ("a", True),
])
def test_tiene_contenido(texto, esperado):
    assert tiene_contenido(texto) == esperado`, "parametrize casos multiples valores tabla"),
    m("Fixtures", "tmp_path y monkeypatch", "tmp_path da una carpeta temporal que se borra sola, para no tocar archivos reales. monkeypatch cambia variables de entorno o atributos solo durante la prueba.", code`
def test_guardar_nota(tmp_path):
    ruta = tmp_path / "nota.txt"
    guardar_nota(ruta, "hola")
    assert ruta.read_text() == "hola"

def test_usa_la_variable_de_entorno(monkeypatch):
    monkeypatch.setenv("MODO", "prueba")
    assert leer_modo() == "prueba"`, "tmp_path monkeypatch archivos temporales entorno"),
    m("Dobles", "unittest.mock: reemplazar lo externo", "Una prueba unitaria no debe llamar a la red real. patch sustituye esa pieza por un doble de prueba, cuyo resultado controlás y cuyas llamadas podés verificar.", code`
from unittest.mock import patch

def test_obtener_clima_usa_la_api():
    with patch("clima.requests.get") as falso:
        falso.return_value.json.return_value = {"temp": 21}
        assert obtener_clima("Madrid") == 21
        falso.assert_called_once()`, "mock patch doble falso red api llamadas"),
    m("Diseño", "Controlar el tiempo inyectando el reloj", "Un código que llama a la fecha actual es difícil de probar. Si recibe el reloj como parámetro, la prueba le pasa la hora que quiera.", code`
from datetime import datetime

def saludo(ahora=None):
    ahora = ahora or datetime.now()
    return "Buen día" if ahora.hour < 12 else "Buenas tardes"

def test_saludo_de_mañana():
    assert saludo(datetime(2026, 1, 1, 9, 0)) == "Buen día"

def test_saludo_de_tarde():
    assert saludo(datetime(2026, 1, 1, 15, 0)) == "Buenas tardes"`, "tiempo reloj fecha inyectar dependencia determinista"),
    a("Fixtures", "Fixtures con yield: preparar y limpiar", "Todo lo que va antes del yield es la preparación y lo que va después es la limpieza, que se ejecuta aunque la prueba falle. El alcance decide cuántas veces se crea.", code`
import sqlite3
import pytest

@pytest.fixture(scope="module")
def base():
    conexion = sqlite3.connect(":memory:")
    conexion.execute("CREATE TABLE libros (id INTEGER PRIMARY KEY, titulo TEXT)")
    yield conexion          # la prueba usa la conexión acá
    conexion.close()        # limpieza`, "fixture yield scope teardown limpieza alcance"),
    a("Integración", "Prueba de integración con SQLite en memoria", "Una prueba de integración comprueba que varias piezas funcionan juntas, por ejemplo, tu código con una base de datos real pero descartable.", code`
def guardar(conexion, titulo):
    conexion.execute("INSERT INTO libros (titulo) VALUES (?)", (titulo,))

def buscar(conexion, texto):
    filas = conexion.execute("SELECT titulo FROM libros WHERE titulo LIKE ?", (f"%{texto}%",))
    return [f[0] for f in filas]

def test_guardar_y_buscar(base):
    guardar(base, "Dune")
    guardar(base, "Duna")
    assert buscar(base, "Du") == ["Dune", "Duna"]`, "integracion base datos sqlite memoria"),
    a("Organización", "Marcadores: skip, xfail y marcas propias", "skip omite una prueba y xfail indica que se espera que falle (un error conocido). Las marcas propias permiten correr solo un grupo.", code`
import sys
import pytest

@pytest.mark.skipif(sys.platform == "win32", reason="solo en Linux y macOS")
def test_permisos_unix():
    ...

@pytest.mark.xfail(reason="error conocido #123")
def test_caso_roto():
    assert False

@pytest.mark.lento
def test_proceso_largo():
    ...    # se corre con:  pytest -m "not lento"`, "skip xfail marcador mark omitir lentas"),
    a("Calidad", "Probar código asíncrono", "Una corrutina se prueba ejecutándola con asyncio.run, o con el complemento pytest-asyncio. La prueba comprueba el resultado, no solo que no explote.", code`
import asyncio

async def doble(n):
    await asyncio.sleep(0)
    return n * 2

def test_doble():
    assert asyncio.run(doble(21)) == 42`, "async asyncio corrutina probar pytest-asyncio"),
    a("Calidad", "Cobertura: qué líneas ejecutan las pruebas", "La cobertura mide qué parte del código se ejecutó durante las pruebas. Sirve para encontrar lo que nadie prueba, pero 100% no garantiza que esté bien probado.", code`
# pip install pytest-cov
# pytest --cov=mi_paquete --cov-report=term-missing
#
# Name           Stmts   Miss  Cover   Missing
# precios.py        12      2    83%   18-19      <- líneas que ninguna prueba ejecuta`, "cobertura coverage pytest-cov lineas"),
  ],
  clase: claseTesting,
};
