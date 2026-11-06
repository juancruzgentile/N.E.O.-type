import { area, code, er, op, sa } from "./crear";

const R = "https://en.cppreference.com/w/c/";
export const c = area("c", [
  op("j", "¿Qué tiene que hacer quien usa `malloc`?",
    ["Liberar el bloque con free cuando ya no lo necesite", "Nada: C libera la memoria solo cuando el programa sale de la función", "Llamar a free dos veces seguidas para asegurarse de que se liberó", "Declarar el puntero como const para que el sistema libere el bloque"],
    "Si no se libera hay una pérdida de memoria. Liberar dos veces el mismo bloque es un error grave.", R + "memory/malloc"),
  sa("j", code`
#include <stdio.h>

int main(void) {
    int a = 7, b = 2;
    printf("%d %d\n", a / b, a % b);
    return 0;
}`, ["3 1", "3.5 1", "4 1", "3 0"],
    "Con dos enteros, / es división entera (3) y % es el resto (1).", R + "language/operator_arithmetic"),
  er("j", code`
char s[3] = "hola";`, ["La cadena necesita 5 bytes (4 letras y el \\0 final) y el arreglo tiene solo 3", "Las cadenas no se pueden guardar en arreglos de tipo char en C", "Falta incluir string.h para poder inicializar una cadena con comillas", "char no puede ser un arreglo y hay que declarar la variable como string"],
    "Una cadena de C termina con '\\0', que ocupa un byte más que las letras.", R + "language/string_literal", "c"),
  op("j", "¿Por qué no hay que usar `gets`?",
    ["No limita cuánto lee y puede desbordar el arreglo; se reemplazó por fgets", "Es muy lenta y por eso se reemplazó por funciones más rápidas de lectura", "Solo lee números enteros y no sirve para leer textos con espacios", "Está reservada para el sistema operativo y no se puede llamar desde un programa"],
    "gets se eliminó del estándar (C11) por ser imposible de usar de forma segura.", R + "io/gets"),
  sa("s", code`
#include <stdio.h>

int main(void) {
    int arr[] = {10, 20, 30};
    int *p = arr;
    printf("%d %d\n", *(p + 1), p[2]);
    return 0;
}`, ["20 30", "10 20", "11 30", "20 20"],
    "p apunta al primer elemento; *(p + 1) es el segundo (20) y p[2] el tercero (30).", R + "language/operator_arithmetic#Pointer_arithmetic"),
  op("s", "¿Qué pasa al desreferenciar un puntero NULL?",
    ["Es comportamiento indefinido y normalmente el programa se cae", "Devuelve 0 y el programa sigue ejecutándose con normalidad", "Devuelve una cadena vacía y no provoca ningún tipo de error", "El compilador lo corrige solo y cambia el puntero por uno válido"],
    "Hay que comprobar que malloc y fopen no devolvieron NULL antes de usar el resultado.", R + "language/behavior"),
  er("s", code`
int *crear(void) {
    int x = 5;
    return &x;
}`, ["Devuelve la dirección de una variable local que deja de existir al terminar la función", "Falta incluir stdio.h para poder devolver un puntero desde una función", "No se puede devolver un puntero desde una función escrita en C", "x tiene que ser global para poder devolver su dirección sin problemas"],
    "Usar ese puntero después es comportamiento indefinido. Se resuelve con malloc o recibiendo un puntero del que llama.", R + "language/lifetime", "c"),
  op("s", "¿Qué significa `const char *p`?",
    ["Que no se puede modificar el texto al que apunta p a través de p", "Que p no puede apuntar a otro lugar después de inicializarse", "Que p es un puntero nulo que todavía no apunta a ningún texto", "Que el texto al que apunta p está cifrado y no se puede leer"],
    "char *const p es otra cosa: el puntero no cambia, pero el texto sí.", R + "language/const"),
  sa("s", code`
#include <stdio.h>
#include <string.h>

int main(void) {
    char s[] = "hola";
    printf("%zu %zu\n", strlen(s), sizeof(s));
    return 0;
}`, ["4 5", "4 4", "5 5", "5 4"],
    "strlen cuenta las letras (4) y sizeof incluye el '\\0' final (5).", R + "string/byte/strlen"),
  op("s", "¿Qué hace un `typedef struct`?",
    ["Le da un nombre más corto a un tipo de estructura, así no hace falta escribir struct cada vez", "Crea una variable de la estructura y reserva memoria para guardar sus campos", "Reserva memoria dinámica para la estructura y la libera al terminar", "Impide que la estructura se pueda copiar o asignar a otra variable"],
    "typedef struct { int x, y; } Punto; permite declarar Punto p;.", R + "language/typedef"),
  op("x", "¿Qué es un desbordamiento de búfer (buffer overflow)?",
    ["Escribir más allá del tamaño de un arreglo: es comportamiento indefinido y una vulnerabilidad típica", "Usar demasiada memoria dinámica sin liberarla, hasta que se agota el espacio disponible y el sistema operativo termina el programa por la fuerza", "Un error de sintaxis que el compilador detecta antes de ejecutar el programa", "Una variable sin inicializar que contiene un valor cualquiera en memoria"],
    "Por eso se prefieren fgets, snprintf y comprobar siempre los límites.", "https://owasp.org/www-community/vulnerabilities/Buffer_Overflow"),
  op("x", "¿Qué hace `static` en C?",
    ["Dentro de una función, conserva el valor entre llamadas; fuera de funciones, limita la visibilidad al archivo", "Hace que la variable sea constante y su valor no pueda cambiar nunca, ni siquiera dentro de la función donde fue declarada con esa palabra", "Reserva memoria dinámica que se libera sola al salir de la función", "Hace que la función se ejecute más rápido al guardarla en la caché"],
    "Tiene dos significados según dónde se use: duración del almacenamiento y enlace interno.", R + "language/storage_duration"),
]);
