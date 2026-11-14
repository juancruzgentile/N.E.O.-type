import { type Clase, code } from "../types";

export const claseC: Clase = {
  titulo: "C de cero: el lenguaje que está debajo de casi todo",
  bajada:
    "La referencia rápida está en la otra pestaña. Esta es la clase completa: por qué C sigue vivo medio siglo después, cómo se pasa del código al programa, " +
    "tu primer programa, punteros y memoria, los errores que rompen programas y cuándo conviene usarlo.",
  secciones: [
    {
      heading: "Qué es y qué problema resuelve",
      parrafos: [
        "C es un lenguaje de programación **compilado**, de **tipado estático** y muy cercano al hardware. Te da **control directo sobre la memoria**: vos reservás, vos usás, vos liberás. Con eso se escriben sistemas operativos (el núcleo de Linux), controladores, bases de datos, intérpretes (el de Python está escrito en C), sistemas embebidos y las bibliotecas que todos los otros lenguajes usan por debajo.",
        "El problema que resolvió fue escribir un sistema operativo sin tener que hacerlo en el lenguaje ensamblador de cada máquina: C es lo bastante de alto nivel como para ser portable y lo bastante de bajo nivel como para ser rápido y predecible. Casi no hay nada oculto: lo que escribís es, en buena medida, lo que hace el procesador.",
        "Ese control tiene un costo. **C no te protege**: si te pasás de un arreglo o usás memoria liberada, el programa no avisa, simplemente hace algo impredecible.",
      ],
    },
    {
      heading: "Historia corta",
      parrafos: [
        "Lo creó **Dennis Ritchie** en los laboratorios Bell a principios de los años setenta, para reescribir el sistema operativo Unix, que hasta entonces se escribía en ensamblador. El libro de Brian Kernighan y Dennis Ritchie, \"El lenguaje de programación C\" (1978), lo difundió tanto que la versión original se llama \"K&R C\".",
      ],
      lista: [
        "1989 y 1990: ANSI e ISO estandarizan el lenguaje (C89 o C90).",
        "1999 (C99): comentarios con `//`, declarar variables en cualquier lugar y tipos de enteros de tamaño fijo.",
        "2011 (C11) y 2017 (C17): hilos y atómicos en la biblioteca estándar, y correcciones.",
        "C23 es la edición más reciente del estándar; los compiladores la van adoptando.",
        "Casi todos los lenguajes modernos (C++, Java, C#, Go, JavaScript) heredaron de C su **sintaxis de llaves**.",
      ],
    },
    {
      heading: "Cómo funciona por dentro",
      parrafos: [
        "Pasar de un archivo `.c` a un ejecutable lleva **cuatro etapas**, y conviene conocerlas porque cada una produce errores distintos. El preprocesador procesa las líneas que empiezan con `#` (los `#include` pegan el contenido de las cabeceras `.h`). El compilador traduce cada archivo a lenguaje ensamblador. El ensamblador lo convierte en código de máquina (un archivo objeto, `.o`). Y el enlazador (linker) junta todos los objetos y las bibliotecas en un ejecutable. Un error \"`undefined reference`\" es de la última etapa: usaste una función que declaraste pero nadie definió.",
        "En ejecución, la memoria tiene tres zonas. La **pila** (stack) guarda las variables locales y se libera sola al salir de cada función. El **montón** (heap) es memoria que pedís con `malloc` y devolvés con `free`. Y la zona estática guarda las variables globales. **No hay recolector de basura**: si no liberás la memoria del montón, queda ocupada hasta que el programa termina.",
      ],
    },
    {
      heading: "Tu primer programa, paso a paso",
      parrafos: [
        "Creá `saludo.c`, compilalo con `gcc saludo.c -o saludo` (o `cc`, `clang`) y corrélo con `./saludo Ana 2`.",
      ],
      codigo: [
        code`
#include <stdio.h>
#include <stdlib.h>

int main(int argc, char *argv[]) {
    const char *nombre = argc > 1 ? argv[1] : "mundo";
    int veces = argc > 2 ? atoi(argv[2]) : 1;

    for (int i = 1; i <= veces; i++) {
        printf("%d. Hola, %s\n", i, nombre);
    }
    return 0;
}`,
      ],
    },
    {
      heading: "Qué hace cada línea",
      parrafos: [
        "`#include <stdio.h>` trae las **declaraciones** de `printf` y similares; sin esa línea, el compilador no sabe que existen. `main` es el **punto de entrada**: `argc` es la cantidad de argumentos y `argv` la lista (el primero, `argv[0]`, es el nombre del programa). Un texto en C es un **arreglo de caracteres**, de ahí el tipo `char *`.",
        "`atoi` convierte el texto en entero (y devuelve 0 si no puede, sin avisar: por eso en código serio se usa `strtol`). `printf` **imprime con un formato**: `%d` es un entero y `%s` un texto, y `\\n` es el salto de línea. El `return 0` le dice al sistema que el programa terminó bien. Con los datos Ana y 2 imprime \"1. Hola, Ana\" y \"2. Hola, Ana\".",
      ],
    },
    {
      heading: "Los cinco conceptos que sostienen todo lo demás",
      parrafos: [
        "Con estos cinco entendés casi cualquier código C:",
      ],
      lista: [
        "**Tipos y tamaños**: `int`, `char`, `double`… ocupan una cantidad fija de bytes; `sizeof` te dice cuántos.",
        "**Punteros**: una variable que guarda la dirección de otra. `&` obtiene la dirección y `*` accede al valor apuntado.",
        "**Arreglos y textos**: un arreglo es memoria contigua; un texto es un arreglo de `char` terminado en un byte cero (`'\\0'`).",
        "**Memoria dinámica**: `malloc` reserva en el montón y `free` libera; cada `malloc` necesita su `free`.",
        "**Estructuras y cabeceras**: `struct` agrupa datos, y los archivos `.h` declaran lo que otros archivos pueden usar.",
      ],
      codigo: [
        code`
int x = 10;
int *p = &x;              // p guarda la dirección de x
*p = 20;                  // x ahora vale 20

char saludo[] = "hola";   // 5 bytes: h, o, l, a y el cero final

int *v = malloc(3 * sizeof *v);   // memoria en el montón
if (v == NULL) return 1;          // malloc puede fallar: comprobalo
v[0] = 1; v[1] = 2; v[2] = 3;
free(v);                          // se libera a mano
v = NULL;                         // para no usarla por error

struct Libro { char titulo[40]; int paginas; };`,
      ],
    },
    {
      heading: "Errores que comete casi todo el mundo",
      parrafos: [
        "En C, muchos errores no se ven: el programa compila y a veces hasta parece funcionar. Se llama **comportamiento indefinido** (undefined behavior): el estándar permite cualquier cosa. Los más comunes:",
      ],
      lista: [
        "**Pasarse del final de un arreglo** (buffer overflow): escribe sobre memoria que no es tuya; es la causa de incontables fallas de seguridad.",
        "Olvidar `free` (fuga de memoria), usar la memoria después de liberarla (use after free) o liberarla dos veces.",
        "Comparar textos con `==`: **compara direcciones, no contenido**. Usá `strcmp`.",
        "Usar una variable sin inicializar: tiene basura.",
        "Funciones peligrosas como `gets`, o `strcpy` sin comprobar el tamaño del destino. Usá `fgets` y las variantes con límite.",
      ],
      codigo: [
        code`
char a[] = "hola", b[] = "hola";
printf("%d\n", a == b);              // 0: compara direcciones
printf("%d\n", strcmp(a, b) == 0);   // 1: compara el contenido

int v[3] = {1, 2, 3};
v[3] = 9;                            // fuera de rango: comportamiento indefinido`,
      ],
    },
    {
      heading: "Dónde conviene usarlo y dónde no",
      parrafos: [
        "C es la herramienta correcta **cuando importa el control**, y la incorrecta casi siempre que no:",
      ],
      tabla: {
        cabeza: ["Caso", "¿C?", "Por qué"],
        filas: [
          ["Sistemas operativos y controladores", "Sí", "Acceso directo al hardware y a la memoria."],
          ["Sistemas embebidos con poca memoria", "Sí", "Casi no tiene costo oculto y compila para casi cualquier chip."],
          ["Bibliotecas que otros lenguajes van a usar", "Sí", "Todos saben llamar a una función de C."],
          ["Programas donde la velocidad es crítica", "Sí", "Compila a código nativo sin capas intermedias."],
          ["Aplicaciones web y de negocio", "No", "Sin cadenas, listas ni errores de seguridad gestionados, cuesta mucho más y es más riesgoso."],
          ["Software que procesa datos que vienen de afuera", "Con cuidado", "Los desbordamientos de memoria son una vía de ataque; un lenguaje seguro lo evita."],
        ],
      },
    },
    {
      heading: "Comparación con lenguajes cercanos",
      parrafos: [
        "Cuándo conviene otro:",
      ],
      tabla: {
        cabeza: ["Lenguaje", "Elegilo en vez de C cuando…"],
        filas: [
          ["C++", "querés lo mismo pero con clases, plantillas y una biblioteca estándar enorme."],
          ["Rust", "querés ese nivel de control con seguridad de memoria comprobada al compilar."],
          ["Go", "escribís servicios de red y preferís un recolector de basura."],
          ["Python", "querés velocidad de desarrollo; las partes críticas se pueden escribir en C aparte."],
        ],
      },
    },
    {
      heading: "Cómo seguir",
      parrafos: [
        "Hacé la ruta de C de la app, resolvé los proyectos y practicá compilando con las **advertencias activadas** (`gcc -Wall -Wextra`) y con el **verificador de memoria** (`-fsanitize=address`): son tu red de seguridad.",
        "Fuera de la app, cppreference tiene la referencia más completa de la biblioteca estándar de C, y el comité del estándar (WG14) publica los borradores del lenguaje. El libro clásico de Kernighan y Ritchie sigue siendo una lectura muy buena y corta.",
      ],
    },
  ],
  fuentes: [
    { texto: "Referencia de C (cppreference)", url: "https://en.cppreference.com/w/c" },
    { texto: "Comité del estándar C (WG14)", url: "https://www.open-std.org/jtc1/sc22/wg14/" },
    { texto: "Manual de GCC", url: "https://gcc.gnu.org/onlinedocs/gcc/" },
  ],
  revisada: "2026-11-12",
};
