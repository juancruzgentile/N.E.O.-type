import { area, code, er, op, sa } from "./crear";

const G = "https://go.dev/";
export const go = area("go", [
  op("j", "¿Cuál es el valor cero de una variable `int` que no se inicializó?",
    ["0", "nil", "-1", "Indefinido: da error al leerla"],
    "En Go toda variable tiene valor cero: 0 para números, \"\" para string, false para bool y nil para punteros, slices y maps.", G + "ref/spec#The_zero_value"),
  sa("j", code`
package main

import "fmt"

func main() {
	s := []int{1, 2, 3}
	s = append(s, 4)
	fmt.Println(len(s), s)
}`, ["4 [1 2 3 4]", "3 [1 2 3]", "4 [1 2 3]", "3 [1 2 3 4]"],
    "append devuelve el slice con el elemento agregado: hay que guardar el resultado.", G + "blog/slices-intro"),
  er("j", code`
package main

func main() {
	x := 5
}`, ["Go no deja compilar una variable declarada y no usada", "Falta devolver un valor al final de la función main del programa", "x tiene que declararse con la palabra var en lugar de usar :=", "main no puede estar vacía y necesita al menos una llamada a fmt"],
    "Es una regla del compilador: toda variable local declarada tiene que usarse.", G + "ref/spec#Declarations_and_scope", "go"),
  op("j", "¿Qué hace `:=` en Go?",
    ["Declara una variable nueva y le asigna un valor, infiriendo el tipo, dentro de una función", "Compara dos valores y devuelve true si son iguales, dentro de una función", "Asigna un valor a una variable que ya existe sin declararla de nuevo", "Declara una constante cuyo valor no puede cambiar durante la ejecución"],
    "Solo se puede usar dentro de funciones. Fuera, se usa var.", G + "ref/spec#Short_variable_declarations"),
  sa("s", code`
package main

import "fmt"

func main() {
	defer fmt.Println("uno")
	defer fmt.Println("dos")
	fmt.Println("tres")
}`, ["tres\ndos\nuno", "uno\ndos\ntres", "tres\nuno\ndos", "uno\ndos"],
    "defer pospone la llamada hasta que la función termina y las ejecuta en orden inverso (la última, primero).", G + "blog/defer-panic-and-recover"),
  op("s", "¿Qué es una goroutine?",
    ["Una función que se ejecuta de forma concurrente, muy liviana, administrada por el runtime de Go", "Un hilo del sistema operativo que el programador crea y administra a mano, y que ocupa varios megabytes de memoria desde el momento en que arranca", "Un tipo de canal que sirve para pasar datos entre dos funciones", "Un paquete de la biblioteca estándar que sirve para escribir pruebas"],
    "Se lanza con la palabra go. Miles de goroutines caben en poca memoria.", G + "tour/concurrency/1"),
  sa("s", code`
package main

import "fmt"

func main() {
	m := map[string]int{"a": 1}
	v, ok := m["b"]
	fmt.Println(v, ok)
}`, ["0 false", "nil false", "0 true", "Error: la clave no existe"],
    "Leer una clave inexistente devuelve el valor cero; el segundo valor (ok) indica si estaba.", G + "blog/maps"),
  op("s", "¿Qué significa el patrón `if err != nil` en Go?",
    ["Que los errores son valores que las funciones devuelven y se comprueban de forma explícita", "Que Go usa excepciones con try y catch y los errores suben por la pila", "Que el error se ignora si vale nil y el programa sigue igual que antes", "Que el programa termina en cuanto cualquier función devuelve un error"],
    "No hay excepciones: cada función que puede fallar devuelve un error junto al resultado.", G + "blog/error-handling-and-go"),
  er("s", code`
package main

func main() {
	var m map[string]int
	m["a"] = 1
}`, ["Escribir en un map nil provoca un panic: hay que crearlo con make", "Falta importar el paquete fmt antes de poder usar la variable m", "Los maps no admiten textos como clave, solo números enteros", "m tiene que declararse con := en lugar de var dentro de una función"],
    "Un map declarado pero no inicializado es nil: se puede leer, pero no escribir. Se crea con make(map[string]int).", G + "blog/maps", "go"),
  op("s", "¿Qué diferencia hay entre un array y un slice en Go?",
    ["El tamaño del array forma parte de su tipo; el slice es una vista dinámica sobre un array", "El slice tiene tamaño fijo y el array es una vista dinámica sobre él", "Son iguales: Go usa las dos palabras para el mismo tipo de dato", "El array puede crecer con append y el slice no puede cambiar de tamaño"],
    "[3]int y [4]int son tipos distintos. Un slice tiene longitud y capacidad.", G + "blog/slices-intro"),
  op("x", "¿Qué pasa al enviar a un canal sin buffer?",
    ["El envío se bloquea hasta que otra goroutine reciba el valor", "El valor se guarda en el canal y el envío sigue sin esperar a nadie", "Se lanza un error en tiempo de compilación porque falta definir el buffer", "El valor se descarta y la goroutine que lo envió continúa su ejecución"],
    "Los canales sin buffer sincronizan a las dos goroutines.", G + "tour/concurrency/2"),
  op("x", "¿Para qué sirve el paquete `context`?",
    ["Para propagar cancelación, plazos y valores entre goroutines y llamadas", "Para leer archivos de configuración y variables de entorno al arrancar el programa", "Para crear canales con buffer que guardan los valores entre dos goroutines", "Para formatear textos con la fecha y la hora de cada operación en un registro"],
    "Se pasa como primer parámetro (ctx) para poder cortar una operación larga cuando el cliente se va.", "https://pkg.go.dev/context"),
  sa("x", code`
package main

import "fmt"

func main() {
	a := []int{1, 2, 3}
	b := a[:2]
	b = append(b, 99)
	fmt.Println(a)
}`, ["[1 2 99]", "[1 2 3]", "[1 2 3 99]", "[1 2]"],
    "b comparte el arreglo de a y todavía tiene capacidad: append escribe en la posición 3 del mismo arreglo.", G + "blog/slices-intro"),
  op("x", "¿Qué implica usar `any` (la interfaz vacía) como tipo?",
    ["Acepta cualquier valor, pero se pierde el chequeo de tipos y hay que usar type assertion para usarlo", "Es más rápida que los tipos concretos porque el compilador no comprueba nada sobre ella y el programa evita el costo de las conversiones", "Solo acepta números enteros y decimales, pero no textos ni estructuras", "Impide pasar punteros a las funciones que la reciben como parámetro"],
    "Conviene preferir tipos concretos o genéricos cuando se puede.", G + "tour/methods/14"),
]);
