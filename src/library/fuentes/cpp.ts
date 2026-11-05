import type { FuentesTema } from "./tipos";

const R = "https://en.cppreference.com/w/cpp/";
export const cpp: FuentesTema = {
  version: "C++20 (C++23 donde se indica)",
  entradas: {
    "main e iostream": [R + "io/cout"],
    "std::string": [R + "string/basic_string"],
    "std::vector": [R + "container/vector"],
    "auto y for de rango": [R + "language/range-for", "C++11"],
    "Referencias": [R + "language/reference"],
    "Sobrecarga y valores por defecto": [R + "language/default_arguments"],
    "class y constructores": [R + "language/constructor"],
    "RAII y unique_ptr": [R + "memory/unique_ptr", "C++11"],
    "map y unordered_map": [R + "container/map"],
    "Algoritmos y lambdas": [R + "language/lambda", "C++11"],
    "std::optional": [R + "utility/optional", "C++17"],
    "Excepciones": [R + "language/exceptions"],
    "enum class": [R + "language/enum", "C++11"],
    "Plantillas y concepts": [R + "language/constraints", "C++20"],
    "Herencia y virtual": [R + "language/virtual"],
    "Semántica de movimiento": [R + "utility/move", "C++11"],
    "std::ranges": [R + "ranges", "C++20"],
    "std::format": [R + "utility/format/format", "C++20"],
    "CMake": ["https://cmake.org/cmake/help/latest/guide/tutorial/index.html"],
  },
};
