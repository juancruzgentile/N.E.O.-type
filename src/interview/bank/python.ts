import { area, code, co, er, op, sa } from "./crear";

const D = "https://docs.python.org/3/";
export const python = area("python", [
  op("j", "¿Cuál es la diferencia principal entre una lista y una tupla?",
    ["La lista se puede modificar; la tupla no (es inmutable)", "La tupla se puede modificar con append; la lista no (es inmutable)", "La lista solo guarda texto y la tupla puede guardar cualquier tipo", "La lista usa paréntesis y la tupla usa corchetes; no hay otra diferencia"],
    "Las listas son mutables (append, remove, asignación por índice). Las tuplas no cambian después de crearse, por eso pueden ser claves de un diccionario.", D + "tutorial/datastructures.html#tuples-and-sequences"),
  op("j", "¿Qué tipo tiene el resultado de 7 / 2 en Python 3?",
    ["float (3.5)", "int (3)", "int (4)", "Decimal"],
    "La división con / siempre devuelve float. Para la división entera se usa //.", D + "tutorial/introduction.html#numbers"),
  sa("j", `print(7 // 2, 7 % 2)`, ["3 1", "3.5 1", "4 1", "3 0"],
    "// es la división entera (3) y % es el resto (1).", D + "tutorial/introduction.html#numbers"),
  sa("j", `print("ab" * 3)`, ["ababab", "ab3", "Error", "ab ab ab"],
    "Multiplicar un str por un entero lo repite esa cantidad de veces.", D + "library/stdtypes.html#string-methods"),
  er("j", code`
edad = input("Edad: ")
if edad > 18:
    print("Mayor")`, ["input() devuelve un str, y comparar un str con un int lanza TypeError", "input() devuelve un int y comparar con 18 falla porque falta el signo >=", "El if no puede comparar números con la palabra edad como nombre de variable", "Falta convertir edad a float para que la comparación sea posible en Python"],
    "input() siempre devuelve texto. Hay que convertirlo: edad = int(input(...)).", D + "library/functions.html#input"),
  op("j", "¿Qué pasa si una excepción no se captura con try/except?",
    ["El programa termina y muestra el traceback", "El programa ignora el error y sigue con la línea siguiente sin avisar", "Python reintenta la línea una vez más antes de terminar el programa", "La excepción se guarda en un archivo de registro y el programa continúa"],
    "Una excepción sin manejar sube por la pila de llamadas y, si nadie la captura, termina el programa.", D + "tutorial/errors.html#handling-exceptions"),
  co("j", "Escribí una comprensión de listas que devuelva los cuadrados de los números de `nums`.",
    ["[n * n for n in nums]", "[n ** 2 for n in nums]", "[n**2 for n in nums]"],
    "Una comprensión arma la lista nueva en una sola expresión: [expresión for variable in iterable].", D + "tutorial/datastructures.html#list-comprehensions"),
  sa("j", code`
d = {"a": 1}
print(d.get("b", 0), "b" in d)`, ["0 False", "None False", "Error", "0 True"],
    "get devuelve el valor por defecto si la clave no existe y no la agrega; 'in' pregunta por las claves.", D + "library/stdtypes.html#dict.get"),
  sa("s", code`
def agregar(x, lista=[]):
    lista.append(x)
    return lista

print(agregar(1))
print(agregar(2))`, ["[1]\n[1, 2]", "[1]\n[2]", "[1, 2]\n[1, 2]", "Error"],
    "El valor por defecto [] se crea una sola vez, cuando se define la función, y se comparte entre llamadas. Por eso se usa None y se crea la lista adentro.", D + "tutorial/controlflow.html#default-argument-values"),
  er("s", code`
nums = [1, 2, 3, 4]
for n in nums:
    if n % 2 == 0:
        nums.remove(n)`, ["Se modifica la lista mientras se recorre, y se saltean elementos", "Se agota la memoria porque la lista crece sin parar dentro del bucle for", "remove borra todos los elementos iguales a n y deja la lista vacía siempre", "El operador % no se puede usar con enteros dentro de un bucle for"],
    "Al borrar elementos durante el for, los índices se corren y el recorrido se saltea el siguiente. Se arma una lista nueva con una comprensión.", D + "tutorial/datastructures.html#more-on-lists"),
  op("s", "¿Qué garantiza `with open(ruta) as f:`?",
    ["Que el archivo se cierra al salir del bloque, incluso si hay una excepción", "Que el archivo se carga completo en memoria antes de empezar el bloque", "Que otros programas no pueden leer el archivo mientras el bloque está abierto", "Que el archivo se crea de nuevo si ya existía, sin borrar su contenido anterior"],
    "with usa un administrador de contexto: al salir del bloque llama a su método de cierre aunque haya fallado algo.", D + "tutorial/inputoutput.html#reading-and-writing-files"),
  op("s", "¿Para qué sirve `if __name__ == \"__main__\":`?",
    ["Para que ese código corra solo si el archivo se ejecuta directamente, no cuando se importa", "Para declarar cuál es la función principal que Python tiene que llamar primero", "Para que el archivo se ejecute más rápido cuando se importa desde otro módulo", "Para impedir que otros archivos puedan importar el módulo por accidente"],
    "Cuando un archivo se importa, __name__ vale el nombre del módulo; cuando se ejecuta, vale \"__main__\".", D + "library/__main__.html"),
  sa("s", code`
funcs = [lambda: i for i in range(3)]
print([f() for f in funcs])`, ["[2, 2, 2]", "[0, 1, 2]", "[0, 0, 0]", "Error"],
    "Las lambdas guardan la variable i, no su valor. Cuando se llaman, el bucle ya terminó y i vale 2. Se arregla con lambda i=i: i.", D + "faq/programming.html#why-do-lambdas-defined-in-a-loop-with-different-values-all-return-the-same-result"),
  op("s", "¿Qué diferencia hay entre `==` e `is`?",
    ["== compara valores; is pregunta si son el mismo objeto", "== compara si son el mismo objeto; is compara los valores que contienen", "== solo sirve con números y is se usa con texto y con listas", "Son equivalentes; is es solo una forma más rápida de escribir =="],
    "Dos listas distintas con el mismo contenido son == pero no son 'is'. is se usa sobre todo con None: x is None.", D + "reference/expressions.html#is-not"),
  sa("s", code`
a = [1, 2, 3]
b = a
b.append(4)
print(a)`, ["[1, 2, 3, 4]", "[1, 2, 3]", "[4]", "Error"],
    "b = a no copia la lista: ambos nombres apuntan al mismo objeto. Para copiarla, a[:] o a.copy().", D + "tutorial/datastructures.html#more-on-lists"),
  sa("s", code`
x = [1, 2, 3]
y = x[:]
y.append(4)
print(x, y)`, ["[1, 2, 3] [1, 2, 3, 4]", "[1, 2, 3, 4] [1, 2, 3, 4]", "[1, 2, 3] [1, 2, 3]", "[1, 2, 3, 4] [1, 2, 3]"],
    "x[:] crea una copia superficial: cambiar y no toca x.", D + "tutorial/datastructures.html#more-on-lists"),
  op("s", "¿Qué es un generador en Python?",
    ["Una función con yield que produce los valores de a uno, a pedido", "Una lista que se guarda en disco y se carga entera cuando se necesita", "Una clase que crea hilos para ejecutar varias tareas al mismo tiempo", "Un decorador que acelera funciones guardando sus resultados en caché"],
    "Un generador no guarda todos los valores en memoria: calcula el siguiente cuando se lo piden (for, next).", D + "tutorial/classes.html#generators"),
  sa("s", `print(sum(x for x in range(5)))`, ["10", "15", "[0, 1, 2, 3, 4]", "4"],
    "range(5) va de 0 a 4 y la suma da 10. La expresión generadora no arma una lista intermedia.", D + "library/functions.html#sum"),
  co("s", "Escribí una expresión que devuelva `palabras` ordenada de la más corta a la más larga, sin modificar la lista original.",
    ["sorted(palabras, key=len)"],
    "sorted devuelve una lista nueva; el parámetro key recibe la función con la que se compara cada elemento.", D + "howto/sorting.html"),
  op("s", "¿Cuál es el costo promedio de preguntar `x in conjunto` si conjunto es un set?",
    ["O(1)", "O(n)", "O(log n)", "O(n²)"],
    "Los sets usan una tabla hash, así que buscar es constante en promedio. En una lista es O(n).", "https://wiki.python.org/moin/TimeComplexity"),
  op("s", "¿Qué te da `@dataclass` sobre una clase?",
    ["Genera __init__, __repr__ y __eq__ a partir de los campos declarados", "Guarda los objetos en una base de datos sin escribir ninguna consulta SQL", "Convierte todos los atributos de la clase en privados para evitar cambios", "Impide que la clase se pueda heredar y que se creen subclases de ella"],
    "El decorador escribe esos métodos por vos a partir de las anotaciones de tipo de la clase.", D + "library/dataclasses.html"),
  op("x", "¿Qué limita el GIL en la versión estándar de CPython?",
    ["Que dos hilos ejecuten bytecode de Python a la vez: los hilos no aceleran trabajo que usa solo CPU", "La cantidad de memoria que puede usar un programa, que no pasa de un gigabyte", "La cantidad de archivos que se pueden tener abiertos al mismo tiempo", "El uso de varios núcleos incluso cuando se trabaja con procesos separados"],
    "Para tareas de CPU se usan procesos (multiprocessing); los hilos sirven para esperar entrada y salida. Hay una versión opcional sin GIL desde Python 3.13.", D + "glossary.html#term-global-interpreter-lock"),
  op("x", "¿Qué hace un decorador?",
    ["Recibe una función y devuelve otra, normalmente envolviéndola", "Cambia el tipo de una variable cuando se llama a la función por primera vez", "Compila la función a código máquina para que se ejecute mucho más rápido", "Impide que la función se llame más de una vez durante la ejecución"],
    "@decorador antes de def equivale a f = decorador(f). Se usa para logs, caché, permisos, reintentos.", D + "glossary.html#term-decorator"),
  sa("x", code`
def f():
    try:
        return "try"
    finally:
        print("finally")

print(f())`, ["finally\ntry", "try", "try\nfinally", "finally"],
    "El bloque finally siempre corre antes de que la función devuelva el valor: primero se imprime 'finally' y después 'try'.", D + "tutorial/errors.html#defining-clean-up-actions"),
  op("x", "¿Qué devuelve llamar a una función `async def` sin usar await?",
    ["Una corrutina que todavía no se ejecutó", "El resultado de la función, calculado al instante", "Un hilo nuevo que ya empezó a ejecutarse en segundo plano", "None, porque falta el await para obtener el valor"],
    "La corrutina corre cuando se la espera con await o se la entrega a asyncio.run().", D + "library/asyncio-task.html"),
  op("x", "¿Para qué sirve un entorno virtual (venv)?",
    ["Para que cada proyecto tenga sus propias versiones de paquetes, sin pisarse con otros", "Para ejecutar el mismo programa en otro sistema operativo sin cambiar nada", "Para que el programa corra más rápido al usar un intérprete optimizado", "Para ocultar el código fuente de modo que nadie pueda leerlo ni copiarlo"],
    "Un venv es una carpeta con su propio intérprete y paquetes. Evita que dos proyectos necesiten versiones incompatibles de lo mismo.", D + "library/venv.html"),
]);
