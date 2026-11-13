import { type Clase, code } from "../types";

export const claseTesting: Clase = {
  titulo: "Testing: cómo saber que tu código funciona sin probarlo a mano cada vez",
  bajada:
    "Qué es una prueba automática y por qué cambia cómo programás, tu primera prueba con pytest, qué probar y qué no, " +
    "cómo evitar las pruebas que estorban y qué hacer con el código que parece imposible de probar.",
  secciones: [
    {
      heading: "Qué es y qué problema resuelve",
      parrafos: [
        "Una prueba automática es un programa que ejecuta otro programa (o una parte de él) con datos conocidos y comprueba que el resultado es el esperado. Se escribe una vez y se puede correr miles de veces, en segundos, cada vez que cambiás algo. Una colección de pruebas se llama suite, y las pruebas fallidas te dicen exactamente qué se rompió.",
        "El problema que resuelve es el miedo a tocar el código. Sin pruebas, cada cambio es una apuesta: arreglás una cosa y no sabés qué otra rompiste, así que probás a mano, siempre lo mismo, y siempre te olvidás de algo. Con pruebas, podés cambiar, mejorar y reorganizar con confianza, porque si algo se rompe lo sabés enseguida. Además sirven de documentación: muestran cómo se usa el código y qué debe hacer.",
      ],
    },
    {
      heading: "Historia corta",
      parrafos: [
        "Probar el código siempre existió, pero la prueba automática como práctica diaria viene de los noventa. Kent Beck creó SUnit para Smalltalk, y en 1997 Beck y Erich Gamma hicieron JUnit para Java, que originó la familia xUnit: casi todos los lenguajes tienen su variante. De ahí salió el desarrollo guiado por pruebas (TDD) y el movimiento de la programación extrema.",
        "En Python, el módulo unittest viene en la biblioteca estándar, pero pytest (de Holger Krekel, desde mediados de los dos mil) se volvió el estándar de la comunidad por su sintaxis más simple: funciones comunes y assert, sin clases ni métodos especiales. Hoy las pruebas se corren automáticamente en la integración continua, en cada cambio que se propone.",
      ],
    },
    {
      heading: "Cómo funciona por dentro",
      parrafos: [
        "pytest recorre el proyecto buscando archivos test_*.py, y dentro de ellos funciones cuyo nombre empieza con test_. Ejecuta cada una de forma aislada y la considera aprobada si termina sin excepción. Un assert falso lanza una excepción, y pytest, con una técnica llamada reescritura de asserts, muestra los valores de cada lado de la comparación, lo que hace los fallos fáciles de leer.",
        "Las dependencias de cada prueba se declaran con fixtures: funciones que preparan lo necesario y se piden por nombre como parámetro. pytest las crea antes de la prueba y las limpia después. Y el código fuera de tu control (la red, la hora, el azar, una base de datos) se reemplaza por dobles de prueba para que el resultado sea siempre el mismo.",
      ],
    },
    {
      heading: "Tu primera prueba, paso a paso",
      parrafos: [
        "Con pytest instalado (pip install pytest), creá dos archivos y corré pytest en esa carpeta.",
      ],
      codigo: [
        code`
# precios.py
def con_iva(precio, tasa=0.21):
    if precio < 0:
        raise ValueError("el precio no puede ser negativo")
    return round(precio * (1 + tasa), 2)

# test_precios.py
import pytest
from precios import con_iva

def test_aplica_el_iva():
    assert con_iva(100) == 121.0

def test_precio_cero():
    assert con_iva(0) == 0

def test_rechaza_precios_negativos():
    with pytest.raises(ValueError):
        con_iva(-1)`,
      ],
    },
    {
      heading: "Qué hace cada parte",
      parrafos: [
        "Cada función test_ es un caso independiente. La primera comprueba el caso normal, la segunda un borde (cero) y la tercera el caso de error: pytest.raises comprueba que la función lance la excepción esperada y falla si no lo hace. Fijate que probamos también lo que no debe funcionar; los errores se esconden en los bordes.",
        "Al correr pytest verás un punto por cada prueba aprobada y una F por cada fallo, con los detalles. Con pytest -x se detiene en el primer fallo, con pytest -k iva corre solo las pruebas cuyo nombre contiene iva, y con pytest -q reduce el ruido.",
      ],
    },
    {
      heading: "Los cinco conceptos que sostienen todo lo demás",
      parrafos: [
        "Con estos cinco escribís pruebas que ayudan:",
      ],
      lista: [
        "Arreglo, acción, comprobación (AAA): preparar el escenario, ejecutar una cosa y comprobar el resultado. Una idea por prueba.",
        "El tipo de prueba: unitarias (una pieza aislada, rápidas y muchas), de integración (varias piezas juntas, como tu código con una base de datos) y de punta a punta (el sistema completo, lentas y pocas). Es la pirámide de pruebas.",
        "Fixtures y parametrización: evitan repetir la preparación y permiten probar muchos casos con una sola función.",
        "Dobles de prueba: un stub devuelve respuestas fijas, un mock además verifica cómo se lo llamó, un fake es una implementación simple (como una base en memoria).",
        "Código fácil de probar: las funciones puras y las dependencias que se reciben como parámetro se prueban fácil; el código que mezcla lógica con la red o la hora, no.",
      ],
      codigo: [
        code`
import pytest
from datetime import datetime

@pytest.mark.parametrize("hora, esperado", [
    (9, "Buen día"),
    (11, "Buen día"),
    (12, "Buenas tardes"),
    (20, "Buenas tardes"),
])
def test_saludo(hora, esperado):
    assert saludo(datetime(2026, 1, 1, hora)) == esperado

# el código bajo prueba recibe el reloj en vez de pedirlo adentro
def saludo(ahora=None):
    ahora = ahora or datetime.now()
    return "Buen día" if ahora.hour < 12 else "Buenas tardes"`,
      ],
    },
    {
      heading: "Errores que comete casi todo el mundo",
      parrafos: [
        "Las pruebas mal hechas son peores que ninguna, porque dan una falsa seguridad o un trabajo constante:",
      ],
      lista: [
        "Probar la implementación y no el comportamiento: si la prueba se rompe cada vez que reorganizás el código sin cambiar lo que hace, está acoplada a los detalles.",
        "Pruebas que dependen unas de otras o del orden: una deja datos que la siguiente necesita. Cada una debe poder correr sola.",
        "Pruebas que a veces fallan (flaky): casi siempre dependen del tiempo, del azar, del orden o de la red. Controlá esas variables.",
        "Abusar de los mocks: si mockeás todo, la prueba solo verifica que tu código llama a tu mock. Preferí fakes y pruebas de integración para lo importante.",
        "Un assert que no puede fallar: assert resultado (cualquier valor verdadero pasa) en vez de comparar con el valor exacto.",
        "Perseguir el 100% de cobertura: mide líneas ejecutadas, no calidad. Mejor probar bien lo que importa.",
        "No probar los casos de error y los bordes: vacíos, ceros, negativos, nulos, textos enormes.",
        "Escribir la prueba y verla pasar sin haberla visto fallar nunca: puede que no pruebe nada.",
      ],
      codigo: [
        code`
# MAL: pasa con cualquier resultado que no sea vacío
def test_total_mal():
    assert carrito.total()

# BIEN: compara con el valor esperado
def test_total_bien():
    assert carrito.total() == 70

# MAL: depende del reloj real, falla un día de cada tanto
def test_vence_hoy():
    assert vence(datetime.now()) is True`,
      ],
    },
    {
      heading: "Dónde conviene probar y dónde no tanto",
      parrafos: [
        "Probar todo con el mismo esfuerzo no tiene sentido:",
      ],
      tabla: {
        cabeza: ["Qué", "¿Probar?", "Cómo"],
        filas: [
          ["Lógica de negocio (precios, reglas, cálculos)", "Siempre", "Pruebas unitarias rápidas y con muchos casos."],
          ["Errores que ya tuviste", "Siempre", "Una prueba que lo reproduzca, antes de arreglarlo."],
          ["Código que usa una base de datos", "Sí", "Pruebas de integración con una base descartable."],
          ["Recorridos críticos (registrarse, pagar)", "Sí, pocos", "Pruebas de punta a punta, cuidadas, en el navegador."],
          ["Interfaz y estilos", "A veces", "Pruebas de componentes o capturas; no todo merece una prueba."],
          ["Código de otras bibliotecas", "No", "Ya las prueban sus autores; probá cómo las usás."],
          ["Código desechable o de un solo uso", "Rara vez", "El costo no se paga."],
        ],
      },
    },
    {
      heading: "Comparación con alternativas",
      parrafos: [
        "Otras formas de comprobar el código, y cuándo conviene cada una:",
      ],
      tabla: {
        cabeza: ["Alternativa", "Conviene cuando…"],
        filas: [
          ["Probar a mano", "es una exploración única o un prototipo; no escala."],
          ["unittest (de la biblioteca estándar)", "no querés instalar nada; es más verboso que pytest."],
          ["Pruebas de propiedades (Hypothesis)", "querés que la herramienta invente casos y busque contraejemplos."],
          ["Tipos y análisis estático", "querés atrapar clases enteras de errores sin ejecutar nada; se complementa con las pruebas."],
          ["Pruebas de punta a punta (Playwright)", "necesitás comprobar el sistema completo como lo vería un usuario."],
        ],
      },
    },
    {
      heading: "Cómo seguir",
      parrafos: [
        "Usá la pestaña Referencia de este tema para recordar las herramientas. Para practicar, tomá un programa tuyo y escribí pruebas antes de cambiarlo: eso se llama probar el código heredado y es la mejor forma de aprender. O probá el desarrollo guiado por pruebas: escribir primero una prueba que falla, después el código mínimo que la hace pasar, y por último refactorizar.",
        "La documentación de pytest es muy buena y tiene guías para cada tema. Y el libro \"Test-Driven Development: By Example\", de Kent Beck, es corto y muestra la forma de pensar.",
      ],
    },
  ],
  fuentes: [
    { texto: "Documentación de pytest", url: "https://docs.pytest.org/en/stable/" },
    { texto: "pytest: fixtures", url: "https://docs.pytest.org/en/stable/how-to/fixtures.html" },
    { texto: "unittest.mock (Python)", url: "https://docs.python.org/3/library/unittest.mock.html" },
  ],
  revisada: "2026-11-12",
};
