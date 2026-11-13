import { type Topic, a, b, code, m } from "./types";
import { claseC } from "./clases/c";

export const c: Topic = {
  id: "c",
  name: "C",
  group: "Lenguajes",
  emblem: "c",
  badge: "C",
  color: "#9fb3c8",
  hl: "c",
  summary:
    "Lenguaje compilado, chico y cercano al hardware. Con él están hechos Linux, la mayoría de los sistemas operativos, " +
    "SQLite, intérpretes como CPython y muchísimo software embebido. No tiene clases ni recolector de basura: la " +
    "memoria la manejás vos.",
  facts: [
    { label: "Archivos", value: ".c (código) · .h (cabeceras)" },
    { label: "Compilar", value: "gcc -Wall -Wextra -std=c17 main.c -o app" },
    { label: "Paquetes", value: "No tiene gestor oficial: bibliotecas del sistema, vcpkg o Conan" },
    { label: "Versión de referencia", value: "C17 · C23 en GCC 15 y Clang 18+" },
    { label: "Estilo", value: "snake_case · llaves según el proyecto (K&R o Allman)" },
  ],
  workflow: [
    { title: "Compilá con advertencias", text: "-Wall -Wextra (y -Werror en el CI) detectan muchísimos errores antes de ejecutar." },
    { title: "Sanitizers mientras desarrollás", text: "-fsanitize=address,undefined encuentra accesos fuera de rango, memoria liberada dos veces y comportamiento indefinido." },
    { title: "Cada malloc con su free", text: "Decidí quién es dueño de cada bloque de memoria y liberalo una sola vez. valgrind ayuda a encontrar fugas." },
    { title: "Cabeceras con guardas", text: "Cada .h declara la interfaz y lleva #ifndef/#define/#endif (o #pragma once) para no incluirse dos veces." },
    { title: "Make o CMake", text: "Para más de un archivo, un Makefile o CMake se encarga de compilar solo lo que cambió." },
  ],
  entries: [
    b("Estructura", "main y printf", "Todo programa empieza en main. printf escribe con formato: %d enteros, %f decimales, %s cadenas, %c caracteres.", code`
#include <stdio.h>

int main(void)
{
    int edad = 30;
    printf("Hola, tengo %d años\n", edad);
    return 0;
}`, "inicio programa imprimir hola mundo"),
    b("Datos", "Tipos básicos", "int, long, double, char y bool (con stdbool.h). sizeof dice cuántos bytes ocupa cada uno.", code`
#include <stdbool.h>

int cantidad = 3;
long poblacion = 45000000L;
double precio = 19.99;
char inicial = 'A';
bool activo = true;
printf("%zu bytes\n", sizeof(double));`, "variable entero decimal booleano sizeof"),
    b("Control de flujo", "if, for y while", "Las condiciones van entre paréntesis y cualquier valor distinto de 0 es verdadero.", code`
for (int i = 0; i < 10; i++) {
    if (i % 2 == 0) {
        continue;
    }
    printf("%d\n", i);
}

while (intentos > 0) {
    intentos--;
}`, "condicional bucle repetir"),
    b("Funciones", "Funciones y prototipos", "Una función se declara (prototipo) antes de usarse; la definición puede ir después o en otro archivo.", code`
#include <stdio.h>

int sumar(int a, int b);

int main(void)
{
    printf("%d\n", sumar(2, 3));
    return 0;
}

int sumar(int a, int b)
{
    return a + b;
}`, "funcion declarar prototipo"),
    b("Colecciones", "Arrays", "Tamaño fijo y sin control de límites: recorrer fuera del array es comportamiento indefinido.", code`
int notas[5] = {7, 9, 4, 10, 8};
size_t cantidad = sizeof notas / sizeof notas[0];
for (size_t i = 0; i < cantidad; i++) {
    printf("%d ", notas[i]);
}`, "arreglo vector lista"),
    b("Texto", "Cadenas", "Una cadena es un array de char que termina en '\\0'. No se comparan con ==: se usa strcmp.", code`
#include <string.h>

char nombre[32] = "Ana";
strncat(nombre, " Paz", sizeof nombre - strlen(nombre) - 1);
if (strcmp(nombre, "Ana Paz") == 0) {
    printf("%s tiene %zu letras\n", nombre, strlen(nombre));
}`, "string texto strcmp strlen"),
    b("Entrada y salida", "fgets y sscanf", "fgets lee hasta el fin de línea o hasta llenar el buffer, sin desbordarlo: si la línea es más larga, el resto queda para la próxima lectura. Después se interpreta con sscanf o strtol.", code`
char linea[64];
int edad;
if (fgets(linea, sizeof linea, stdin) != NULL && sscanf(linea, "%d", &edad) == 1) {
    printf("Edad: %d\n", edad);
}`, "leer teclado entrada scanf"),

    m("Punteros", "Punteros", "Un puntero guarda una dirección de memoria. & obtiene la dirección y * accede al valor.", code`
void duplicar(int *valor)
{
    *valor *= 2;
}

int numero = 21;
int *p = &numero;
duplicar(p);
printf("%d\n", numero);   // 42`, "direccion memoria referencia"),
    m("Tipos", "struct y typedef", "Agrupan datos relacionados. Con un puntero a struct se accede a los campos con ->.", code`
typedef struct {
    char nombre[40];
    double precio;
    int stock;
} Producto;

void reponer(Producto *p, int cantidad)
{
    p->stock += cantidad;
}`, "estructura registro typedef"),
    m("Memoria", "malloc y free", "Pedí memoria dinámica con malloc o calloc, comprobá que no sea NULL y liberala con free.", code`
#include <stdlib.h>

size_t n = 100;
int *datos = malloc(n * sizeof *datos);
if (datos == NULL) {
    perror("malloc");
    return 1;
}
datos[0] = 42;
free(datos);
datos = NULL;`, "memoria dinamica heap liberar"),
    m("Archivos", "fopen, fgets y fclose", "Abrí, comprobá el error, leé línea por línea y cerrá siempre.", code`
FILE *archivo = fopen("datos.txt", "r");
if (archivo == NULL) {
    perror("datos.txt");
    return 1;
}
char linea[256];
while (fgets(linea, sizeof linea, archivo) != NULL) {
    fputs(linea, stdout);
}
fclose(archivo);`, "archivo leer escribir fichero"),
    m("Tipos", "enum y switch", "enum da nombres a constantes enteras; switch elige según el valor (sin break, sigue al siguiente case).", code`
typedef enum { ROJO, AMARILLO, VERDE } Semaforo;

const char *accion(Semaforo s)
{
    switch (s) {
    case ROJO:
        return "frenar";
    case AMARILLO:
        return "precaucion";
    default:
        return "avanzar";
    }
}`, "enumeracion constante switch case"),
    m("Herramientas", "gcc y make", "Compilá con advertencias y depuración; make recompila solo lo que cambió.", code`
gcc -Wall -Wextra -std=c17 -g main.c util.c -o app
./app
gcc -fsanitize=address,undefined -g main.c -o app
make`, "compilar compilador makefile"),

    a("Punteros", "Punteros a función y qsort", "Una función se puede pasar como argumento. qsort ordena cualquier array con un comparador.", code`
int comparar(const void *a, const void *b)
{
    int x = *(const int *)a;
    int y = *(const int *)b;
    return (x > y) - (x < y);
}

int numeros[] = {5, 2, 9, 1};
qsort(numeros, 4, sizeof numeros[0], comparar);`, "callback ordenar comparador"),
    a("Punteros", "const y punteros", "const a la izquierda del * protege el dato; a la derecha, el puntero.", code`
const char *mensaje = "hola";     // el texto no se puede cambiar
char *const buffer = malloc(64);  // el puntero no se puede mover
size_t largo(const char *texto);  // promete no modificar el texto`, "constante solo lectura"),
    a("Preprocesador", "Cabeceras y guardas", "El .h declara lo público; las guardas evitan incluirlo dos veces. static deja una función privada a su archivo.", code`
// lista.h
#ifndef LISTA_H
#define LISTA_H

#include <stddef.h>

typedef struct Lista Lista;

Lista *lista_crear(void);
void lista_agregar(Lista *lista, int valor);
size_t lista_largo(const Lista *lista);
void lista_destruir(Lista *lista);

#endif`, "header include define modulo"),
    a("Errores", "Errores con errno", "Muchas funciones de la biblioteca dejan el motivo del fallo en errno; hay que ponerlo en 0 antes y mirarlo solo si la función indica error. Con strtol, además, fin dice hasta dónde leyó: si no avanzó o sobró texto, no era un número.", code`
#include <errno.h>
#include <string.h>

char *fin;
errno = 0;
long valor = strtol(texto, &fin, 10);
if (fin == texto || *fin != '\0') {
    fprintf(stderr, "no es un numero: %s\n", texto);
} else if (errno == ERANGE) {
    fprintf(stderr, "fuera de rango: %s\n", strerror(errno));
}`, "error manejo strtol perror"),
    a("Memoria", "valgrind y sanitizers", "Herramientas para encontrar fugas, accesos inválidos y comportamiento indefinido.", code`
gcc -g -fsanitize=address,undefined main.c -o app && ./app
valgrind --leak-check=full ./app`, "fuga memoria depurar asan"),
  ],
  clase: claseC,
};
