import { area, er, op } from "./crear";

const S = "https://docs.swift.org/swift-book/documentation/the-swift-programming-language/";
export const swift = area("swift", [
  op("j", "¿Qué diferencia hay entre `let` y `var` en Swift?",
    ["let declara una constante y var una variable que se puede cambiar", "let es para números y var para textos y otros tipos de datos", "var es más rápida que let porque el compilador no comprueba su valor", "No hay diferencia: las dos declaran variables que se pueden cambiar"],
    "Swift recomienda usar let siempre que se pueda.", S + "thebasics/"),
  op("j", "¿Qué es un valor opcional (`Int?`)?",
    ["Un valor que puede ser un entero o nil, y hay que desenvolverlo antes de usarlo", "Un entero que se puede omitir al escribir el código, sin que falle", "Un entero con signo que guarda valores negativos además de los positivos", "Un entero que no se puede cambiar una vez que se le asigna un valor"],
    "Se desenvuelve con if let, guard let, ?? o (con cuidado) con !.", S + "thebasics/"),
  er("j", `let x: Int = nil`, ["Int no admite nil: haría falta Int?", "Falta el punto y coma", "let no admite tipos", "nil se escribe NULL"],
    "Solo los tipos opcionales pueden valer nil.", S + "thebasics/", "swift"),
  op("s", "¿Cuál es la diferencia entre `struct` y `class` en Swift?",
    ["struct es un tipo por valor (se copia); class es un tipo por referencia", "struct es un tipo por referencia y class es un tipo por valor que se copia", "struct no puede tener métodos y class sí puede tenerlos en Swift", "class se copia al asignarla a otra variable y struct comparte la referencia"],
    "Por eso Swift prefiere struct para modelos de datos.", S + "classesandstructures/"),
  op("s", "¿Para qué sirve `guard let`?",
    ["Para desenvolver un opcional y salir de la función si es nil, dejando el valor disponible después", "Para proteger una variable de cambios mientras se ejecuta el resto de la función", "Para atrapar errores lanzados por una función sin escribir un bloque do-catch", "Para crear un bucle que se repite mientras el valor opcional no sea nil"],
    "Evita anidar if let uno dentro de otro.", S + "controlflow/"),
  op("s", "¿Qué hace ARC?",
    ["Cuenta las referencias fuertes a cada objeto y lo libera cuando llegan a cero", "Es un recolector de basura que corre cada tanto y libera objetos sin uso", "Compila el código de Swift a otro lenguaje antes de ejecutarlo en el dispositivo", "Valida los tipos de las variables mientras se escribe el código en Xcode"],
    "Por eso los ciclos de referencias fuertes causan pérdidas de memoria.", S + "automaticreferencecounting/"),
  op("x", "¿Qué problema resuelve un `actor`?",
    ["Aísla su estado mutable para que no haya condiciones de carrera entre tareas concurrentes", "Dibuja la interfaz de la aplicación a partir de una descripción de sus vistas", "Reemplaza a las clases en todos los casos y no admite propiedades mutables", "Permite herencia múltiple entre tipos que se ejecutan en tareas distintas"],
    "Solo una tarea a la vez accede al estado del actor; los demás esperan con await.", S + "concurrency/"),
  op("x", "¿Para qué se usa `[weak self]` en un closure?",
    ["Para evitar un ciclo de referencias fuertes entre el objeto y el closure", "Para que el closure se ejecute más rápido que si se usara una referencia fuerte", "Para que self sea constante dentro del closure y no se pueda cambiar", "Para ejecutar el closure en otro hilo y no frenar la interfaz de la aplicación"],
    "self pasa a ser opcional dentro del closure.", S + "automaticreferencecounting/"),
]);
