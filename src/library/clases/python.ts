import { type Clase, code } from "../types";

export const clasePython: Clase = {
  titulo: "Python de cero: qué es, cómo piensa y cuándo usarlo",
  bajada:
    "La referencia rápida está en la otra pestaña. Esta es la clase completa: de dónde viene Python, qué pasa por dentro cuando corrés un archivo, " +
    "cómo escribir tu primer programa, qué errores comete casi todo el mundo y en qué proyectos conviene (y en cuáles no).",
  secciones: [
    {
      heading: "Qué es y qué problema resuelve",
      parrafos: [
        "Python es un lenguaje de programación de propósito general: sirve para casi cualquier cosa, desde un script de diez líneas que renombra archivos hasta el back-end de un sitio con millones de usuarios. Es interpretado (lo ejecuta otro programa, el intérprete, sin que tengas que compilarlo a mano) y de tipado dinámico (no declarás de qué tipo es cada variable; el tipo lo tiene el valor).",
        "El problema que resuelve es el tiempo entre tener una idea y verla funcionando. Su sintaxis se parece mucho a un pseudocódigo en inglés, los bloques se marcan con la sangría en vez de llaves, y trae de fábrica lo que otros lenguajes obligan a instalar: listas, diccionarios, manejo de archivos, fechas, JSON, expresiones regulares, un servidor web básico, pruebas.",
        "Por eso se volvió el lenguaje del \"pegamento\": conecta sistemas, procesa datos y automatiza tareas. Y es el lenguaje dominante en ciencia de datos e inteligencia artificial, no porque sea rápido (no lo es), sino porque las bibliotecas pesadas (NumPy, pandas, PyTorch) están escritas en C, C++ o Rust y vos las manejás desde Python con código corto.",
      ],
    },
    {
      heading: "Historia corta",
      parrafos: [
        "Lo creó Guido van Rossum en el centro de investigación CWI, en los Países Bajos, como sucesor de un lenguaje de enseñanza llamado ABC. En febrero de 1991 publicó la primera versión pública (la 0.9.0). El nombre no viene de la serpiente sino de Monty Python's Flying Circus, el programa de humor británico que Guido veía en esa época.",
        "En 2001 se creó la Python Software Foundation, una organización sin fines de lucro que es dueña de la propiedad intelectual del lenguaje. En 2018 Guido dejó el rol de líder del proyecto, y hoy lo guía un consejo de cinco personas elegidas por los desarrolladores (el Steering Council).",
      ],
      lista: [
        "2000: Python 2.0 suma, entre otras cosas, las listas por comprensión y la recolección de ciclos de basura.",
        "3 de diciembre de 2008: Python 3.0. Corrigió errores de diseño de la versión 2 y por eso rompió la compatibilidad: el código viejo no corría sin cambios, y la migración llevó más de una década.",
        "1 de enero de 2020: Python 2 dejó de recibir mantenimiento (la última versión fue la 2.7.18). Hoy todo lo que aprendas es Python 3.",
        "Octubre de 2025: Python 3.14. La compilación \"free-threaded\" (sin el GIL, ver la sección siguiente) pasó de experimental a oficialmente soportada, aunque sigue siendo opcional.",
      ],
    },
    {
      heading: "Cómo funciona por dentro",
      parrafos: [
        "Cuando corrés python archivo.py pasan dos cosas. Primero, CPython (la implementación oficial, escrita en C) traduce tu código a bytecode, una lista de instrucciones simples que guarda en la carpeta __pycache__ para no repetir el trabajo. Después, una máquina virtual ejecuta ese bytecode instrucción por instrucción. Por eso Python no es de los lenguajes más rápidos: hay una capa en el medio.",
        "La idea que más cambia cómo programás es esta: en Python todo es un objeto (números, textos, funciones, módulos) y una variable no es una caja con un valor adentro, es un nombre pegado a un objeto. Dos nombres pueden apuntar al mismo objeto. Con valores que no cambian (números, textos, tuplas) no lo notás, pero con una lista sí:",
      ],
      codigo: [
        code`
a = [1, 2]
b = a              # b es otro nombre para la MISMA lista, no una copia
b.append(3)
print(a)           # [1, 2, 3]
print(a is b)      # True: es el mismo objeto
c = a.copy()       # esto sí es una copia independiente
c.append(4)
print(a)           # [1, 2, 3]`,
      ],
    },
    {
      heading: "Memoria y el GIL",
      parrafos: [
        "No liberás la memoria a mano. Cada objeto cuenta cuántos nombres lo usan; cuando el contador llega a cero, se libera solo. Un recolector aparte busca los ciclos (objetos que se apuntan entre sí) que el contador no puede detectar.",
        "El GIL (Global Interpreter Lock) es un cerrojo de CPython: en la compilación de siempre, solo un hilo ejecuta bytecode a la vez. Consecuencias prácticas: los hilos (threading) sirven cuando el programa espera entrada y salida, como red o disco, pero no aceleran cálculo puro; para repartir cálculo entre núcleos se usa multiprocessing, que lanza procesos separados. Para muchas tareas de espera simultánea, asyncio. Desde Python 3.14 existe además una compilación sin GIL, soportada pero opcional y todavía no la predeterminada.",
      ],
    },
    {
      heading: "Tu primer programa, paso a paso",
      parrafos: [
        "Creá un archivo saludo.py con este contenido y corrélo con python saludo.py.",
      ],
      codigo: [
        code`
nombre = input("¿Cómo te llamás? ")
veces = int(input("¿Cuántas veces? "))

for i in range(veces):
    print(f"{i + 1}. Hola, {nombre}")`,
      ],
    },
    {
      heading: "Qué hace cada línea",
      parrafos: [
        "input() muestra el mensaje, espera que escribas y devuelve siempre un texto (str), aunque hayas tipeado un número. Por eso la segunda línea lo envuelve en int(): convierte ese texto en un número entero. Si escribís letras, int() falla con un ValueError.",
        "range(veces) genera los números 0, 1, 2… hasta veces - 1. El for repite el bloque indentado una vez por cada número. La sangría de cuatro espacios no es decoración: es lo que le dice a Python qué líneas pertenecen al for.",
        "La f delante de las comillas arma una f-string: lo que va entre llaves se calcula y se inserta en el texto. Con 2 veces y el nombre Ana imprime \"1. Hola, Ana\" y \"2. Hola, Ana\".",
      ],
    },
    {
      heading: "Los cinco conceptos que sostienen todo lo demás",
      parrafos: [
        "Si entendés estos cinco, podés leer casi cualquier programa en Python: los tipos de valores, las colecciones, el flujo con sangría, las funciones, y los módulos con el manejo de errores. El ejemplo los junta en orden.",
      ],
      lista: [
        "Tipos: int, float, str, bool y None. type(x) te dice cuál es.",
        "Colecciones: list (ordenada y modificable), tuple (ordenada e inmutable), dict (clave → valor) y set (sin repetidos).",
        "Flujo: if / elif / else, for y while. Los bloques se marcan con la sangría.",
        "Funciones: def nombre(parametros): con return. Son objetos como cualquier otro, se pueden pasar a otras funciones.",
        "Módulos y errores: import trae código de otro archivo o de la biblioteca estándar; try / except atrapa los errores que esperás.",
      ],
      codigo: [
        code`
precio = 9.99                         # tipos
notas = {"Ana": 9, "Luis": 7}         # colecciones

for nombre, nota in notas.items():    # flujo
    if nota >= 8:
        print(nombre, "aprobó con distinción")

def promedio(valores):                # funciones
    return sum(valores) / len(valores)

print(promedio(notas.values()))       # 8.0

import json                           # módulos y errores
try:
    datos = json.loads("{roto")
except json.JSONDecodeError as e:
    print("JSON inválido:", e)`,
      ],
    },
    {
      heading: "Errores que comete casi todo el mundo",
      parrafos: [
        "Todos tienen explicación, y conocerlos te ahorra horas:",
      ],
      lista: [
        "Mezclar tabuladores y espacios, o sangrar mal: IndentationError. Configurá el editor para que use 4 espacios.",
        "Olvidar que input() devuelve texto: \"5\" + \"3\" da \"53\", no 8. Convertí con int() o float().",
        "Comparar valores con is: is pregunta si es el mismo objeto, == pregunta si valen lo mismo. Para valores, usá ==; is se reserva para None.",
        "Modificar una lista mientras la recorrés con for: se saltea elementos. Recorré una copia o armá una lista nueva.",
        "Instalar paquetes con pip sin un entorno virtual: se mezclan las versiones entre proyectos. Un entorno por proyecto (python -m venv .venv o uv venv).",
        "El argumento por defecto mutable, el clásico de las entrevistas:",
      ],
      codigo: [
        code`
def agregar(x, lista=[]):        # MAL: la lista se crea una sola vez, al definir la función
    lista.append(x)
    return lista

print(agregar(1))                # [1]
print(agregar(2))                # [1, 2]  ¡la lista se arrastra entre llamadas!

def agregar(x, lista=None):      # BIEN: se crea una nueva en cada llamada
    if lista is None:
        lista = []
    lista.append(x)
    return lista`,
      ],
    },
    {
      heading: "Dónde conviene usarlo y dónde no",
      parrafos: [
        "Python no es el mejor para todo, y saberlo es parte de usarlo bien:",
      ],
      tabla: {
        cabeza: ["Caso", "¿Python?", "Por qué"],
        filas: [
          ["Automatizar tareas y escribir scripts", "Sí", "Poco código, biblioteca estándar enorme, corre en cualquier sistema."],
          ["Datos, ciencia e inteligencia artificial", "Sí", "NumPy, pandas y PyTorch hacen el trabajo pesado en C o C++; vos escribís poco código."],
          ["Back-end web y APIs", "Sí", "Django y FastAPI son maduros y muy usados."],
          ["Prototipos y aprender a programar", "Sí", "La sintaxis estorba poco y el intérprete interactivo permite probar al instante."],
          ["Aplicaciones móviles", "No es lo habitual", "En Android e iOS lo normal es Kotlin y Swift."],
          ["Juegos 3D y motores gráficos", "No", "El intérprete es lento para el bucle de cada fotograma; se usa C++ o C#."],
          ["Cálculo intensivo escrito en Python puro", "No", "Es decenas de veces más lento que C, Rust o Go; usá una biblioteca nativa o otro lenguaje."],
          ["Programas que necesitan un único ejecutable pequeño", "Con cuidado", "Hay que empaquetar el intérprete junto al programa; Go o Rust lo resuelven mejor."],
        ],
      },
    },
    {
      heading: "Comparación con lenguajes cercanos",
      parrafos: [
        "Elegir lenguaje suele ser elegir el ecosistema, no la sintaxis. Para decidir:",
      ],
      tabla: {
        cabeza: ["Lenguaje", "Elegilo en vez de Python cuando…"],
        filas: [
          ["JavaScript / TypeScript", "el código corre en el navegador, o querés un solo lenguaje para front y back."],
          ["Go", "necesitás servicios de red rápidos, concurrencia simple y un único binario fácil de desplegar."],
          ["Rust", "importan el rendimiento y la seguridad de memoria, por ejemplo en herramientas de sistema."],
          ["Java / C#", "el proyecto es grande, con muchos equipos, y querés tipado estático obligatorio y un ecosistema empresarial."],
          ["SQL", "el problema es consultar datos: se pregunta a la base, no se recorre en un for."],
        ],
      },
    },
    {
      heading: "Cómo seguir",
      parrafos: [
        "Esta clase te da el mapa. Para recorrerlo: hacé la ruta de Python de la app para que los símbolos y la sintaxis te salgan sin pensar, resolvé los proyectos (hay desde una calculadora hasta una API), y usá la pestaña Referencia cuando necesites la sintaxis exacta de algo.",
        "Fuera de la app, el tutorial oficial es lo mejor que hay para el siguiente paso. Dos lecturas cortas que valen la pena: la guía de estilo PEP 8, y el Zen de Python (escribí import this en el intérprete). Cuando tengas la base, FastAPI y Django (en Frameworks, cuando los abras) son el siguiente escalón para hacer web.",
      ],
    },
  ],
  fuentes: [
    { texto: "Tutorial oficial de Python", url: "https://docs.python.org/3/tutorial/" },
    { texto: "Preguntas generales (historia y nombre)", url: "https://docs.python.org/3/faq/general.html" },
    { texto: "Novedades de Python 3.14", url: "https://docs.python.org/3/whatsnew/3.14.html" },
    { texto: "PEP 8: guía de estilo", url: "https://peps.python.org/pep-0008/" },
  ],
  revisada: "2026-11-12",
};
