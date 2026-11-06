import type { FuentesTema } from "./tipos";

const P = "https://www.php.net/manual/en/";
export const php: FuentesTema = {
  version: "PHP 8.4",
  entradas: {
    "<?php y echo": [P + "language.basic-syntax.phptags.php"],
    "Comillas simples y dobles": [P + "language.types.string.php"],
    "if, foreach y match": [P + "control-structures.match.php", "PHP 8.0"],
    "Funciones con tipos": [P + "language.types.declarations.php", "PHP 7.0"],
    "Arrays": [P + "language.types.array.php"],
    "Clases y propiedades promovidas": [P + "language.oop5.decon.php#language.oop5.decon.constructor.promotion", "PHP 8.0"],
    "enum": [P + "language.enumerations.php", "PHP 8.1"],
    "array_map, array_filter y usort": [P + "function.array-map.php"],
    "Excepciones": [P + "class.exception.php"],
    "PDO y consultas preparadas": [P + "pdo.prepared-statements.php"],
    "Composer": ["https://getcomposer.org/doc/"],
    "Interfaces y traits": [P + "language.oop5.traits.php"],
    "Namespaces y autoload": [P + "language.namespaces.php"],
    "Escapar la salida": [P + "function.htmlspecialchars.php"],
    "Tipos avanzados": [P + "language.types.declarations.php", "PHP 8.0"],
  },
};
