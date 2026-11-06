import { area, code, er, op, sa } from "./crear";

const R = "https://en.cppreference.com/w/cpp/";
export const cpp = area("cpp", [
  op("j", "¿Qué es una referencia en C++?",
    ["Un alias de otra variable: no puede ser nula ni cambiarse para apuntar a otra", "Un puntero que se puede reasignar y que también puede valer nullptr", "Una copia independiente del valor que se guarda en otra posición de memoria", "Una variable global que se puede leer desde cualquier archivo del programa"],
    "int& r = x; hace que r y x sean el mismo objeto.", R + "language/reference"),
  sa("j", code`
#include <iostream>
#include <vector>

int main() {
    std::vector<int> v = {1, 2, 3};
    v.push_back(4);
    std::cout << v.size() << " " << v.back() << "\n";
}`, ["4 4", "3 3", "4 3", "3 4"],
    "push_back agrega al final: el vector tiene 4 elementos y el último es 4.", R + "container/vector"),
  er("j", code`
std::vector<int> v;
v[0] = 1;`, ["El vector está vacío: v[0] accede fuera de rango (comportamiento indefinido); hay que usar push_back o resize", "Falta incluir iostream para poder usar vectores dentro de la función main", "Los vectores no pueden guardar números enteros, solo caracteres y textos", "v necesita ser un puntero para poder asignarle un valor en la posición cero, porque un vector declarado sin elementos no admite el operador corchetes"],
    "El operador [] no comprueba límites. at() sí, y lanza una excepción.", R + "container/vector/operator_at", "cpp"),
  op("s", "¿Qué es RAII?",
    ["Adquirir el recurso en el constructor y liberarlo en el destructor, para que se libere solo al salir del alcance", "Una forma de capturar excepciones con try y catch para que el programa nunca se detenga, aunque ocurra un error grave durante la ejecución", "Una técnica para copiar objetos grandes sin repetir la memoria que usan", "Un recolector de basura que libera los objetos cuando dejan de usarse"],
    "Es la base de std::unique_ptr, std::lock_guard y los archivos de fstream.", R + "language/raii"),
  op("s", "¿Qué garantiza `std::unique_ptr`?",
    ["Que un único dueño libera el objeto automáticamente; no se copia, se mueve", "Que el objeto se comparte entre muchos dueños y se libera con el último", "Que el objeto vive durante todo el programa sin liberarse nunca", "Que el objeto es de solo lectura y no se puede modificar por nadie"],
    "Para compartir la propiedad se usa std::shared_ptr.", R + "memory/unique_ptr"),
  sa("s", code`
#include <iostream>
#include <string>

int main() {
    std::string s = "hola";
    std::string& r = s;
    r += "!";
    std::cout << s << "\n";
}`, ["hola!", "hola", "!", "Error"],
    "r es una referencia a s: modificar r modifica s.", R + "language/reference"),
  op("s", "¿Por qué la clase base de una jerarquía suele tener un destructor `virtual`?",
    ["Para que al borrar un objeto derivado a través de un puntero a la base se llame al destructor correcto", "Para que la clase no se pueda heredar y nadie pueda crear subclases", "Para que el destructor sea más rápido al borrar un objeto de la clase, porque así el compilador evita buscar la tabla de métodos en cada llamada", "Para que la clase no se pueda copiar ni asignar a otra variable"],
    "Sin destructor virtual, borrar por un puntero base es comportamiento indefinido.", R + "language/destructor"),
  op("s", "¿Qué hace `const` al final de un método, como `int tam() const;`?",
    ["Promete que el método no modifica el objeto", "Hace que el método devuelva una constante", "Impide que se llame más de una vez", "Hace el método estático"],
    "Solo los métodos const se pueden llamar sobre un objeto const.", R + "language/member_functions"),
  op("x", "¿Para qué sirve `std::move`?",
    ["Para convertir un objeto en una referencia temporal y permitir que sus recursos se muevan en lugar de copiarse", "Para mover un archivo de una carpeta a otra desde dentro del programa", "Para copiar un objeto más rápido sin reservar memoria nueva para su contenido, dejando el original intacto y con los mismos valores que antes", "Para borrar un objeto y liberar su memoria de forma inmediata en ese punto"],
    "Después de mover, el objeto original queda en un estado válido pero no especificado.", R + "utility/move"),
  op("x", "¿Qué aportan los `concepts` de C++20?",
    ["Restringen qué tipos acepta una plantilla, con errores de compilación más claros", "Reemplazan a las clases en C++20 y permiten escribir programas sin ellas", "Hacen que las plantillas se ejecuten más rápido porque se compilan antes", "Permiten herencia múltiple de plantillas sin ambigüedad en el compilador"],
    "template <std::integral T> acepta solo tipos enteros.", R + "language/constraints"),
  sa("x", code`
#include <iostream>
#include <memory>

int main() {
    auto a = std::make_unique<int>(5);
    auto b = std::move(a);
    std::cout << (a == nullptr) << " " << *b << "\n";
}`, ["1 5", "0 5", "1 0", "Error: no compila"],
    "Al mover un unique_ptr, el original queda en nullptr y el destino tiene el objeto.", R + "memory/unique_ptr"),
  op("x", "¿Qué significa comportamiento indefinido (undefined behavior)?",
    ["Que el estándar no dice qué pasa: puede andar, fallar o dar resultados incorrectos", "Que el compilador muestra un error y el programa no llega a compilar", "Que el programa se cierra siempre con un mensaje de error en pantalla", "Que la salida es aleatoria pero segura y nunca daña ningún dato"],
    "Por ejemplo: acceso fuera de rango, desreferenciar nullptr, desbordamiento de enteros con signo.", R + "language/ub"),
]);
