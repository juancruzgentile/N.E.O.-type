import { area, code, co, er, op, sa } from "./crear";

const W = "https://en.wikipedia.org/wiki/";
const D = "https://docs.python.org/3/";
export const algoritmos = area("algoritmos", [
  op("j", "¿Cuál es la complejidad de buscar un valor en una lista sin ordenar, recorriéndola de principio a fin?",
    ["O(n)", "O(1)", "O(log n)", "O(n²)"],
    "En el peor caso hay que mirar todos los elementos.", W + "Linear_search"),
  op("j", "¿Qué requiere la búsqueda binaria y cuánto cuesta?",
    ["Que los datos estén ordenados; O(log n)", "Que los datos estén repetidos al menos una vez; O(n)", "Que los datos sean solo números enteros positivos; O(n log n)", "No requiere ninguna condición sobre los datos; O(1)"],
    "Cada comparación descarta la mitad de lo que queda.", W + "Binary_search_algorithm"),
  op("j", "¿Qué diferencia hay entre una pila y una cola?",
    ["La pila saca primero lo último que entró (LIFO); la cola saca primero lo primero que entró (FIFO)", "La pila saca primero lo primero que entró (FIFO); la cola saca lo último (LIFO)", "Son iguales: las dos sacan los elementos en el mismo orden en que entraron", "La pila solo guarda números y la cola puede guardar cualquier tipo de dato"],
    "La pila sirve para deshacer o para recorrer en profundidad; la cola, para procesar en orden de llegada.", W + "Stack_(abstract_data_type)"),
  sa("j", code`
pila = []
pila.append(1)
pila.append(2)
print(pila.pop())`, ["2", "1", "[1, 2]", "Error"],
    "pop saca el último elemento agregado.", D + "tutorial/datastructures.html#using-lists-as-stacks", "python"),
  co("j", "Escribí una expresión de Python que sea True si el texto `s` es un palíndromo (se lee igual al revés).",
    ["s == s[::-1]"],
    "s[::-1] es el texto invertido.", D + "library/stdtypes.html#common-sequence-operations", "code", "python"),
  op("s", "¿Qué estructura permite buscar un valor por su clave en tiempo constante promedio?",
    ["Una tabla hash (diccionario)", "Una lista enlazada, que recorre los nodos desde el primero", "Una pila, que solo da acceso al último elemento guardado", "Un árbol sin ordenar, que revisa cada nodo uno por uno"],
    "Calcula una posición a partir de la clave. Con muchas colisiones, el costo sube.", W + "Hash_table"),
  op("s", "¿Cuál es la complejidad típica de ordenar con un algoritmo de comparación eficiente (por ejemplo, el sort de Python)?",
    ["O(n log n)", "O(n)", "O(log n)", "O(n²)"],
    "Con comparaciones no se puede ordenar mejor que n log n en el caso general.", W + "Comparison_sort"),
  sa("s", code`
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)

print([fib(i) for i in range(7)])`, ["[0, 1, 1, 2, 3, 5, 8]", "[1, 1, 2, 3, 5, 8, 13]", "[0, 1, 2, 3, 4, 5, 6]", "[0, 1, 1, 2, 3, 5]"],
    "Cada número es la suma de los dos anteriores.", W + "Fibonacci_sequence", "python"),
  op("s", "¿Para qué sirve el caso base en una función recursiva?",
    ["Para cortar la recursión: sin él la función se llama a sí misma sin parar", "Para hacer la función más rápida guardando los resultados ya calculados antes", "Para guardar el resultado final en una variable que se devuelve al terminar", "Para declarar los parámetros de entrada que la función necesita para empezar"],
    "Sin caso base, Python termina con RecursionError.", W + "Recursion_(computer_science)"),
  er("s", code`
def contar(n):
    return contar(n - 1)`, ["Falta el caso base: la función se llama infinitamente y termina con RecursionError", "n no puede ser un número entero dentro de una función recursiva en Python", "return no se puede usar en una función que se llama a sí misma", "Falta importar el módulo math para poder restar uno al parámetro n"],
    "Hay que decidir cuándo parar, por ejemplo: if n == 0: return 0.", D + "library/sys.html#sys.setrecursionlimit", "python"),
  op("s", "¿Qué diferencia hay entre recorrer un grafo en anchura (BFS) y en profundidad (DFS)?",
    ["BFS usa una cola y visita por niveles; DFS usa una pila (o recursión) y baja lo más posible antes de volver", "BFS usa una pila y baja lo más posible; DFS usa una cola y visita por niveles", "Son iguales: los dos visitan los nodos en el mismo orden con la misma estructura y solo cambia el nombre que se les da en cada libro de texto", "DFS solo funciona con árboles y BFS solo funciona con grafos que tienen ciclos"],
    "BFS encuentra el camino con menos aristas; DFS es útil para detectar ciclos y para backtracking.", W + "Breadth-first_search"),
  op("s", "Para encontrar dos números de una lista que sumen un objetivo en O(n), ¿qué se usa?",
    ["Un diccionario con los números ya vistos, para buscar el complemento de cada uno", "Dos bucles anidados que prueban cada par de números de la lista completa", "Ordenar la lista y recorrerla con una búsqueda lineal por cada número", "Una pila con los números vistos, que se vacía al encontrar la suma buscada"],
    "Por cada número x se pregunta si objetivo - x ya apareció.", W + "Subset_sum_problem"),
  sa("s", code`
from collections import deque

q = deque([1, 2, 3])
q.append(4)
print(q.popleft(), list(q))`, ["1 [2, 3, 4]", "4 [1, 2, 3]", "1 [1, 2, 3, 4]", "2 [1, 3, 4]"],
    "popleft saca el primero que entró; deque lo hace en O(1), a diferencia de list.pop(0).", D + "library/collections.html#collections.deque", "python"),
  op("s", "¿Cuál es el costo de buscar en un árbol binario de búsqueda balanceado y qué pasa si se degenera en una lista?",
    ["O(log n) si está balanceado y O(n) si se degenera", "O(1) siempre, porque el árbol permite llegar directo a cada valor guardado", "O(n) siempre, porque hay que revisar todos los nodos en cualquier caso", "O(n²) si está balanceado y O(log n) si se degenera en una lista enlazada"],
    "Los árboles AVL y rojo-negro se reequilibran para mantener la altura baja.", W + "Binary_search_tree"),
  co("s", "Escribí una expresión de Python que cuente cuántas veces aparece cada elemento de la lista `datos`, usando la biblioteca estándar.",
    ["Counter(datos)", "collections.Counter(datos)"],
    "Counter es un diccionario especializado en contar elementos.", D + "library/collections.html#collections.Counter", "code", "python"),
  op("s", "¿Qué significa que un ordenamiento sea estable?",
    ["Que los elementos iguales conservan el orden relativo que tenían", "Que nunca falla al ordenar, aunque haya valores repetidos o de tipos mezclados", "Que usa poca memoria y no necesita espacio adicional para ordenar los datos", "Que ordena siempre en tiempo lineal, sin importar cuántos elementos haya"],
    "Sirve para ordenar por varios criterios en pasos: primero por el secundario y después por el principal.", W + "Sorting_algorithm#Stability"),
  op("s", "¿Qué estructura conviene para sacar siempre el elemento de menor valor?",
    ["Un heap (cola de prioridad)", "Una pila, que devuelve siempre el último elemento que se agregó", "Un diccionario, que busca cada elemento por su clave en tiempo constante", "Un arreglo sin ordenar, que se recorre completo cada vez que se necesita"],
    "En Python, heapq saca el menor en O(log n).", D + "library/heapq.html"),
  sa("s", code`
def busqueda(lista, x):
    lo, hi = 0, len(lista) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if lista[mid] == x:
            return mid
        if lista[mid] < x:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1

print(busqueda([1, 3, 5, 7, 9], 7), busqueda([1, 3, 5], 4))`, ["3 -1", "2 -1", "3 0", "7 4"],
    "7 está en la posición 3; el 4 no está y devuelve -1.", W + "Binary_search_algorithm", "python"),
  op("x", "¿Qué es la programación dinámica?",
    ["Guardar los resultados de subproblemas que se repiten para no recalcularlos", "Programar mientras el programa se está ejecutando y modificar su código al vuelo", "Usar solo variables globales para que los subproblemas compartan sus resultados", "Evitar la recursión en todos los casos y resolver todo con bucles anidados"],
    "Fibonacci recursivo repite muchísimo trabajo; con memoización pasa de exponencial a lineal.", W + "Dynamic_programming"),
  op("x", "¿Para qué se usa el algoritmo de Dijkstra?",
    ["Para encontrar el camino más corto desde un nodo a los demás, con pesos no negativos", "Para ordenar una lista de números de menor a mayor en tiempo lineal", "Para buscar un texto dentro de otro sin recorrer todos los caracteres", "Para detectar ciclos dentro de una lista enlazada con memoria constante"],
    "Con pesos negativos hay que usar Bellman-Ford.", W + "Dijkstra%27s_algorithm"),
  op("x", "¿Cuál es el peor caso de quicksort y cuándo ocurre?",
    ["O(n²), cuando los pivotes elegidos dividen muy mal los datos (por ejemplo, ya ordenados con un pivote fijo)", "O(n), cuando los datos ya están ordenados y el pivote cae justo en el medio, porque cada vuelta solo recorre la mitad de los elementos", "O(log n), cuando hay muchos datos repetidos y el pivote se elige al azar", "Nunca tiene un peor caso: siempre divide los datos en dos mitades parejas"],
    "Elegir el pivote al azar o con la mediana de tres hace muy raro el peor caso.", W + "Quicksort"),
  sa("x", code`
from functools import lru_cache

@lru_cache(maxsize=None)
def f(n):
    return n if n < 2 else f(n - 1) + f(n - 2)

print(f(50))`, ["12586269025", "20365011074", "7778742049", "Error: demasiado lento"],
    "Con memoización cada valor se calcula una sola vez, así que f(50) responde al instante. El resultado es 12 586 269 025.", D + "library/functools.html#functools.lru_cache", "python"),
  op("x", "¿Cómo se detecta un ciclo en una lista enlazada con memoria constante?",
    ["Con dos punteros que avanzan a distinta velocidad (la tortuga y la liebre): si se encuentran, hay un ciclo", "Guardando todos los nodos visitados en un conjunto y buscando repetidos al final, lo que resuelve el problema pero usa memoria proporcional a la lista", "Recorriendo la lista dos veces y comparando el primer nodo con el último", "No se puede detectar un ciclo sin usar memoria que crezca con el tamaño"],
    "Es el algoritmo de Floyd: O(n) en tiempo y O(1) en memoria.", W + "Cycle_detection#Floyd's_tortoise_and_hare"),
  op("x", "¿Qué ordenamiento garantiza O(n log n) en el peor caso y es estable, a costa de memoria extra?",
    ["Merge sort", "Quicksort", "Bubble sort", "Selection sort"],
    "Divide la lista, ordena las mitades y las mezcla; necesita espacio adicional del orden de n.", W + "Merge_sort"),
  op("x", "¿Para qué sirve un trie?",
    ["Para guardar y buscar cadenas por prefijo, como en el autocompletado", "Para ordenar números enteros en tiempo lineal sin usar comparaciones", "Para guardar grafos con pesos y buscar el camino más corto entre nodos", "Para calcular promedios y medianas sobre una lista muy larga de valores"],
    "Buscar una palabra cuesta O(longitud de la palabra), sin importar cuántas palabras haya.", W + "Trie"),
  op("x", "¿Por qué se dice que `append` en una lista dinámica es O(1) amortizado?",
    ["Porque casi siempre cuesta poco y las pocas veces que hay que ampliar el arreglo se reparten entre todas las operaciones", "Porque nunca copia datos: la lista reserva memoria nueva cada vez que se agrega un elemento sin tener que mover los elementos que ya había", "Porque siempre cuesta exactamente lo mismo, sin importar cuántos elementos haya", "Porque la lista tiene tamaño fijo y no necesita ampliarse al agregar elementos"],
    "Duplicar la capacidad cuando se llena hace que el costo promedio por inserción sea constante.", W + "Amortized_analysis"),
  er("x", code`
def duplicados(nums):
    for i in range(len(nums)):
        for j in range(len(nums)):
            if nums[i] == nums[j]:
                return True
    return False`, ["Compara cada elemento consigo mismo (i == j), así que siempre devuelve True si la lista no está vacía", "range no acepta len como argumento y la función lanza un error de tipo apenas se ejecuta, antes de empezar a comparar los elementos de la lista", "Falta un else al final de la condición para que devuelva False en algún caso", "nums no puede ser una lista porque no se puede indexar dentro de un bucle"],
    "Habría que exigir i != j, y mejor todavía usar un conjunto para hacerlo en O(n).", D + "tutorial/datastructures.html#sets", "python"),
  co("x", "Escribí una expresión de Python que sea True si la lista `nums` tiene elementos repetidos, en O(n).",
    ["len(nums) != len(set(nums))", "len(set(nums)) != len(nums)", "len(set(nums)) < len(nums)", "len(nums) > len(set(nums))"],
    "Un set descarta los repetidos: si queda más corto, había duplicados.", D + "tutorial/datastructures.html#sets", "code", "python"),
  op("x", "¿Para qué sirve la estructura Union-Find?",
    ["Para saber rápido si dos elementos están en el mismo grupo y unir grupos", "Para ordenar una lista de elementos en tiempo casi lineal sin comparaciones", "Para buscar texto dentro de una cadena larga con un solo recorrido de ella", "Para calcular el camino más corto entre dos nodos con pesos no negativos"],
    "Con compresión de caminos y unión por rango, cada operación es casi constante.", W + "Disjoint-set_data_structure"),
]);
