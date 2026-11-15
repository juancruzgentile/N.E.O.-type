import { type Clase, code } from "../types";

export const claseCpp: Clase = {
  titulo: "C++ de cero: control de C con herramientas para organizar programas grandes",
  bajada:
    "La referencia rápida está en la otra pestaña. Esta es la clase completa: qué agrega C++ sobre C, la idea de RAII que lo hace distinto, " +
    "tu primer programa, los conceptos base, los errores típicos y cuándo conviene usarlo.",
  secciones: [
    {
      heading: "Qué es y qué problema resuelve",
      parrafos: [
        "C++ es un lenguaje compilado y de tipado estático que **parte de C** y le suma **clases**, **plantillas** (templates), una biblioteca estándar enorme y herramientas para escribir abstracciones sin pagar un costo extra al ejecutar. Se usa en motores de videojuegos, navegadores, bases de datos, finanzas de alta frecuencia, software de diseño y simulación y sistemas embebidos.",
        "El problema que resuelve es el de escribir programas grandes que tienen que ser muy rápidos. C te da el control pero te deja solo para organizar el código; los lenguajes con recolector de basura organizan bien pero pagan en rendimiento y en previsibilidad. C++ intenta las dos cosas: abstracciones de alto nivel que se compilan a código tan rápido como el que escribirías a mano (el principio de **abstracciones sin costo**).",
        "El precio es la complejidad: es un lenguaje enorme con décadas de historia, y hay muchas formas de hacer lo mismo, algunas peligrosas.",
      ],
    },
    {
      heading: "Historia corta",
      parrafos: [
        "Lo creó **Bjarne Stroustrup** en los laboratorios Bell. Empezó en 1979 como \"C con clases\" y se renombró C++ en 1983 (el `++` es el operador de incremento de C: un C mejorado). El primer estándar internacional salió en 1998.",
        "El gran punto de inflexión fue **C++11**, que **modernizó el lenguaje**: punteros inteligentes, lambdas, `auto` y semántica de movimiento. Desde entonces sale una edición cada tres años (14, 17, 20, 23…), y con cada una el código idiomático se parece menos al de C.",
      ],
      lista: [
        "C++20 sumó módulos, conceptos, corrutinas y rangos.",
        "Casi cualquier programa de C compila también como C++, con algunas excepciones.",
        "El comité del estándar (ISO) decide el lenguaje; hay varios compiladores (GCC, Clang, MSVC).",
      ],
    },
    {
      heading: "Cómo funciona por dentro: RAII",
      parrafos: [
        "La compilación es como la de C: el preprocesador, el compilador, el ensamblador y el enlazador. Las plantillas se resuelven en tiempo de compilación: el compilador genera una versión de la función o la clase para cada tipo con el que se usa. Por eso son rápidas, y por eso los errores de plantillas pueden ser tan largos.",
        "La idea que distingue a C++ de C es **RAII** (adquirir un recurso es inicializarlo). Cada objeto tiene un **constructor**, que adquiere lo que necesita (memoria, un archivo, un cerrojo), y un **destructor**, que lo libera. El destructor se ejecuta automáticamente y de forma previsible **cuando el objeto sale de su alcance**, incluso si ocurre una excepción. No hay recolector de basura, pero tampoco tenés que acordarte de llamar a `free`: los punteros inteligentes (`std::unique_ptr`, `std::shared_ptr`) y los contenedores (`std::vector`, `std::string`) liberan solos. El código moderno casi nunca usa `new` y `delete` directamente.",
      ],
    },
    {
      heading: "Tu primer programa, paso a paso",
      parrafos: [
        "Creá `saludo.cpp`, compilalo con `g++ -std=c++20 saludo.cpp -o saludo` (o `clang++`) y corrélo con `./saludo Ana 2`.",
      ],
      codigo: [
        code`
#include <iostream>
#include <string>

int main(int argc, char* argv[]) {
    std::string nombre = argc > 1 ? argv[1] : "mundo";
    int veces = argc > 2 ? std::stoi(argv[2]) : 1;

    for (int i = 1; i <= veces; ++i) {
        std::cout << i << ". Hola, " << nombre << '\n';
    }
}`,
      ],
    },
    {
      heading: "Qué hace cada línea",
      parrafos: [
        "`#include <iostream>` trae las herramientas de entrada y salida, y `<string>` el tipo `std::string`, que a diferencia del `char *` de C **maneja su propia memoria** y crece solo. Todo lo de la biblioteca estándar vive en el **espacio de nombres** `std`, de ahí el prefijo `std::`.",
        "`std::cout` es la **salida estándar** y `<<` \"envía\" valores a ella, uno detrás de otro. `std::stoi` convierte un texto en entero y **lanza una excepción** si no puede. `main` no necesita `return 0` al final: en C++ es implícito. Con Ana y 2 imprime \"1. Hola, Ana\" y \"2. Hola, Ana\".",
      ],
    },
    {
      heading: "Los cinco conceptos que sostienen todo lo demás",
      parrafos: [
        "Con estos cinco entendés casi cualquier código C++ moderno:",
      ],
      lista: [
        "**Clases con constructor y destructor**: los datos y las funciones juntos, y la vida del recurso atada al objeto.",
        "**Punteros inteligentes**: `unique_ptr` (un solo dueño) y `shared_ptr` (varios), en vez de `new` y `delete`.",
        "**Contenedores y algoritmos de la STL**: `vector`, `map`, `set`… junto con `sort`, `find`, `transform`.",
        "**Plantillas**: una función o clase escrita una vez que sirve para cualquier tipo.",
        "**Referencias** y `const`: pasar sin copiar (`&`) y prometer no modificar (`const`).",
      ],
      codigo: [
        code`
#include <algorithm>
#include <memory>
#include <string>
#include <vector>

class Archivo {                              // RAII
public:
    explicit Archivo(const std::string& ruta) { /* abrir */ }
    ~Archivo() { /* cerrar: se llama solo al salir del alcance */ }
};

template <typename T>
T maximo(T a, T b) { return a > b ? a : b; } // sirve para int, double, string…

int main() {
    auto p = std::make_unique<int>(42);      // se libera solo
    std::vector<int> v{3, 1, 2};
    std::sort(v.begin(), v.end());           // 1 2 3
    return maximo(*p, v.back()) == 42 ? 0 : 1;
}`,
      ],
    },
    {
      heading: "Errores que comete casi todo el mundo",
      parrafos: [
        "C++ hereda los peligros de C y agrega los suyos:",
      ],
      lista: [
        "Usar `new` y `delete` a mano: fugas y dobles liberaciones. Usá `make_unique` o contenedores.",
        "Devolver una referencia a una variable local: apunta a algo que ya no existe (**referencia colgante**).",
        "Modificar un contenedor mientras lo recorrés: los **iteradores quedan invalidados**.",
        "Usar una variable sin inicializar, o desbordar un arreglo: comportamiento indefinido, como en C.",
        "Copiar objetos grandes sin querer por pasar por valor: pasá por **referencia constante** (`const T&`).",
      ],
      codigo: [
        code`
const std::string& peor() {
    std::string s = "hola";
    return s;                          // MAL: s se destruye al salir de la función
}

std::vector<int> v{1, 2, 3};
for (int x : v)
    if (x == 2) v.push_back(9);        // MAL: push_back puede invalidar el recorrido`,
      ],
    },
    {
      heading: "Dónde conviene usarlo y dónde no",
      parrafos: [
        "C++ vale la pena cuando **el rendimiento y el control importan**:",
      ],
      tabla: {
        cabeza: ["Caso", "¿C++?", "Por qué"],
        filas: [
          ["Motores de videojuegos y gráficos", "Sí", "Rendimiento previsible y acceso directo al hardware."],
          ["Software de alto rendimiento (finanzas, simulación)", "Sí", "Abstracciones que se compilan sin costo."],
          ["Navegadores y bases de datos", "Sí", "Chrome, Firefox, MySQL y muchas más están hechos en C++."],
          ["Sistemas embebidos y dispositivos", "Sí", "Control fino con abstracciones."],
          ["Aplicaciones web y de negocio", "No", "Otros lenguajes dan mucha más rapidez de desarrollo."],
          ["Proyectos nuevos donde la seguridad de memoria es crítica", "Con cuidado", "Considerá Rust, que la garantiza al compilar."],
        ],
      },
    },
    {
      heading: "Comparación con lenguajes cercanos",
      parrafos: [
        "Cuándo conviene otro:",
      ],
      tabla: {
        cabeza: ["Lenguaje", "Elegilo en vez de C++ cuando…"],
        filas: [
          ["C", "necesitás algo mínimo, portable a cualquier chip o sencillo de enlazar con otros lenguajes."],
          ["Rust", "querés rendimiento similar con seguridad de memoria comprobada al compilar."],
          ["C#", "hacés un juego con Unity o una aplicación de escritorio y no necesitás tanto control."],
          ["Java o Go", "querés un recolector de basura y un desarrollo más rápido."],
        ],
      },
    },
    {
      heading: "Cómo seguir",
      parrafos: [
        "Hacé la ruta de C++ de la app, resolvé los proyectos y compilá siempre con advertencias (`-Wall -Wextra`) y con los verificadores (`-fsanitize=address,undefined`). Aprendé **el C++ moderno**, no el de hace veinte años.",
        "Fuera de la app, cppreference es la referencia más completa del lenguaje y de la biblioteca estándar, y las **C++ Core Guidelines** (de Stroustrup y Herb Sutter) explican cómo escribir C++ bien. isocpp.org reúne las noticias del estándar.",
      ],
    },
  ],
  fuentes: [
    { texto: "Referencia de C++ (cppreference)", url: "https://en.cppreference.com/w/cpp" },
    { texto: "C++ Core Guidelines", url: "https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines" },
    { texto: "isocpp.org: empezar", url: "https://isocpp.org/get-started" },
  ],
  revisada: "2026-11-12",
};
