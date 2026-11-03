import { type Topic, a, b, code, m } from "./types";

export const cpp: Topic = {
  id: "cpp",
  name: "C++",
  group: "Lenguajes",
  emblem: "cpp",
  badge: "C++",
  color: "#f34b7d",
  hl: "cpp",
  summary:
    "Descendiente de C con clases, plantillas y una biblioteca estándar enorme. Se usa donde importa el rendimiento: " +
    "videojuegos y motores (Unreal), navegadores, bases de datos, trading, audio y sistemas embebidos. El C++ moderno " +
    "(11 en adelante) maneja la memoria con RAII y punteros inteligentes en lugar de new y delete.",
  facts: [
    { label: "Archivos", value: ".cpp (código) · .hpp o .h (cabeceras)" },
    { label: "Compilar", value: "g++ -std=c++20 -Wall -Wextra main.cpp -o app" },
    { label: "Proyectos", value: "CMake · paquetes con vcpkg o Conan" },
    { label: "Versión de referencia", value: "C++20 · C++23 en compiladores nuevos" },
    { label: "Estilo", value: "Varía por proyecto; la biblioteca estándar usa snake_case" },
  ],
  workflow: [
    { title: "RAII para todo", text: "Cada recurso (memoria, archivo, lock) pertenece a un objeto que lo libera en su destructor. Casi nunca hace falta delete." },
    { title: "Contenedores y algoritmos", text: "std::vector, std::string y <algorithm> antes que arrays crudos y bucles a mano." },
    { title: "CMake para compilar", text: "Un CMakeLists.txt describe el proyecto: cmake -B build && cmake --build build." },
    { title: "Advertencias y sanitizers", text: "-Wall -Wextra -Wpedantic y -fsanitize=address,undefined en desarrollo." },
    { title: "Tests", text: "GoogleTest o Catch2, en un ejecutable aparte que corre con ctest." },
  ],
  entries: [
    b("Estructura", "main e iostream", "El programa empieza en main. std::cout escribe y std::cin lee; << y >> encadenan valores.", code`
#include <iostream>
#include <string>

int main()
{
    std::string nombre;
    std::cout << "Como te llamas? ";
    std::cin >> nombre;
    std::cout << "Hola, " << nombre << '\n';
}`, "inicio programa imprimir cout cin"),
    b("Texto", "std::string", "Cadena que maneja su propia memoria: se compara con ==, se concatena con + y crece sola.", code`
std::string saludo = "Hola";
saludo += ", mundo";
if (saludo.starts_with("Hola")) {
    std::cout << saludo.size() << ' ' << saludo.substr(0, 4) << '\n';
}
auto pos = saludo.find("mundo");`, "string texto cadena"),
    b("Colecciones", "std::vector", "Array dinámico: el contenedor que más se usa. push_back agrega al final.", code`
#include <vector>

std::vector<int> notas{7, 9, 4};
notas.push_back(10);
for (int nota : notas) {
    std::cout << nota << ' ';
}
std::cout << notas.size() << '\n';`, "vector lista arreglo dinamico"),
    b("Datos", "auto y for de rango", "auto deduce el tipo; el for de rango recorre cualquier contenedor. const auto& evita copiar.", code`
auto total = 0.0;
for (const auto& producto : productos) {
    total += producto.precio;
}`, "deducir tipo recorrer"),
    b("Funciones", "Referencias", "Una referencia (&) es otro nombre para la misma variable: sirve para modificar o para no copiar.", code`
void duplicar(int& valor)
{
    valor *= 2;
}

void mostrar(const std::string& texto)
{
    std::cout << texto << '\n';
}`, "referencia parametro copia"),
    b("Funciones", "Sobrecarga y valores por defecto", "Varias funciones con el mismo nombre y distintos parámetros; los parámetros pueden tener valor por defecto.", code`
double area(double radio);
double area(double ancho, double alto);
std::string repetir(const std::string& texto, int veces = 2);`, "sobrecargar overload defecto"),

    m("Clases", "class y constructores", "public y private controlan el acceso. La lista de inicialización arma los miembros antes del cuerpo.", code`
class Cuenta {
public:
    explicit Cuenta(std::string titular) : titular_(std::move(titular)) {}

    void depositar(double monto) { saldo_ += monto; }
    double saldo() const { return saldo_; }

private:
    std::string titular_;
    double saldo_ = 0.0;
};`, "clase objeto constructor"),
    m("Memoria", "RAII y unique_ptr", "unique_ptr es dueño único de un objeto y lo borra al salir de alcance; shared_ptr comparte la propiedad.", code`
#include <memory>

auto cuenta = std::make_unique<Cuenta>("Ana");
cuenta->depositar(100);

auto config = std::make_shared<Config>();
auto otra = config;   // los dos apuntan al mismo objeto`, "puntero inteligente memoria smart pointer"),
    m("Colecciones", "map y unordered_map", "Diccionarios: map ordena por clave, unordered_map es más rápido sin orden.", code`
#include <unordered_map>

std::unordered_map<std::string, int> edades{{"ana", 30}};
edades["luis"] = 25;
if (auto it = edades.find("eva"); it != edades.end()) {
    std::cout << it->second << '\n';
}
for (const auto& [nombre, edad] : edades) {
    std::cout << nombre << ": " << edad << '\n';
}`, "diccionario mapa clave valor"),
    m("Algoritmos", "Algoritmos y lambdas", "<algorithm> trae sort, find_if, count_if y muchos más. Una lambda es una función anónima.", code`
#include <algorithm>

std::sort(numeros.begin(), numeros.end());
auto mayores = std::count_if(numeros.begin(), numeros.end(),
    [](int n) { return n > 10; });
auto limite = 5;
auto it = std::find_if(numeros.begin(), numeros.end(),
    [limite](int n) { return n > limite; });`, "ordenar buscar lambda funcion anonima"),
    m("Tipos", "std::optional", "Un valor que puede no estar, en lugar de devolver -1 o un puntero nulo.", code`
#include <optional>

std::optional<int> buscar_edad(const std::string& nombre)
{
    if (nombre == "ana") {
        return 30;
    }
    return std::nullopt;
}

if (auto edad = buscar_edad("ana")) {
    std::cout << *edad << '\n';
}`, "opcional nulo valor ausente"),
    m("Errores", "Excepciones", "throw lanza un error y try/catch lo atrapa. Capturá por referencia constante.", code`
#include <stdexcept>

try {
    if (monto <= 0) {
        throw std::invalid_argument("el monto tiene que ser positivo");
    }
} catch (const std::exception& e) {
    std::cerr << "Error: " << e.what() << '\n';
}`, "error excepcion try catch throw"),
    m("Tipos", "enum class", "Enumeración con nombres propios: no se convierte sola a int ni choca con otros nombres.", code`
enum class Estado { Pendiente, Pagado, Enviado };

Estado estado = Estado::Pagado;
if (estado == Estado::Pagado) {
    std::cout << "listo para enviar\n";
}`, "enumeracion enum"),

    a("Plantillas", "Plantillas y concepts", "Código genérico para cualquier tipo. Los concepts de C++20 piden requisitos al tipo.", code`
#include <concepts>

template <typename T>
T mayor(T a, T b)
{
    return a > b ? a : b;
}

template <std::integral T>
T doble(T valor)
{
    return valor * 2;
}`, "template generico concept"),
    a("Clases", "Herencia y virtual", "Una clase base con métodos virtual permite polimorfismo; override verifica que se esté reemplazando uno.", code`
class Forma {
public:
    virtual ~Forma() = default;
    virtual double area() const = 0;
};

class Circulo : public Forma {
public:
    explicit Circulo(double r) : r_(r) {}
    double area() const override { return 3.14159 * r_ * r_; }

private:
    double r_;
};`, "herencia polimorfismo virtual override"),
    a("Memoria", "Semántica de movimiento", "std::move transfiere los recursos de un objeto a otro en vez de copiarlos.", code`
std::vector<std::string> nombres;
std::string nombre = "un texto largo";
nombres.push_back(std::move(nombre));   // nombre queda vacío pero válido

std::vector<int> crear()
{
    std::vector<int> v(1000);
    return v;   // se mueve, no se copia
}`, "move mover rvalue copia"),
    a("Algoritmos", "std::ranges", "C++20: algoritmos que reciben el contenedor entero y vistas que se encadenan con |.", code`
#include <ranges>

std::ranges::sort(productos, {}, &Producto::precio);
auto pares = numeros
    | std::views::filter([](int n) { return n % 2 == 0; })
    | std::views::transform([](int n) { return n * n; });`, "ranges views pipeline"),
    a("Texto", "std::format", "Formato con llaves, como en Python (C++20). En C++23, std::println imprime directo.", code`
#include <format>

std::string linea = std::format("{} tiene {} años", nombre, edad);
std::string precio = std::format("{:.2f}", 19.5);
std::string tabla = std::format("|{:<10}|{:>5}|", "Ana", 30);`, "formato imprimir printf"),
    a("Herramientas", "CMake", "Describe cómo compilar el proyecto; genera los archivos para make, Ninja o Visual Studio.", code`
cmake -B build -DCMAKE_BUILD_TYPE=Debug
cmake --build build
ctest --test-dir build`, "compilar construir build cmake"),
  ],
};
