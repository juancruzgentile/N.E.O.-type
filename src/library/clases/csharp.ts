import { type Clase, code } from "../types";

export const claseCsharp: Clase = {
  titulo: "C# de cero: un lenguaje moderno sobre .NET",
  bajada:
    "La referencia rápida está en la otra pestaña. Esta es la clase completa: qué es C# y qué es .NET, cómo corre un programa, tu primer programa, " +
    "los conceptos base (con LINQ y async), los errores típicos y en qué proyectos conviene.",
  secciones: [
    {
      heading: "Qué es y qué problema resuelve",
      parrafos: [
        "C# (se lee \"si sharp\") es un lenguaje de programación de **tipado estático** y **orientado a objetos**, que también incorpora ideas funcionales. Se usa junto con **.NET**, la plataforma que trae el entorno de ejecución, la biblioteca estándar y las herramientas. Con C# se hacen servicios web y APIs, aplicaciones de escritorio y móviles, herramientas de línea de comandos, videojuegos con Unity y programas en la nube.",
        "El problema que resuelve es el de escribir software de producción con **seguridad y buen rendimiento sin la ceremonia** de otros lenguajes: tipos que se comprueban al compilar, un recolector de basura, excelente soporte del editor y una biblioteca estándar muy completa. Es, en muchos sentidos, un Java más moderno y con más azúcar sintáctico.",
      ],
    },
    {
      heading: "Historia corta",
      parrafos: [
        "Lo diseñó Microsoft con **Anders Hejlsberg** como arquitecto principal. Se anunció en el año 2000 y salió en 2002 junto con .NET Framework, que durante años funcionó solo en Windows.",
        "El gran cambio llegó con .NET Core (2016): una versión de **código abierto y multiplataforma**. En 2020 se unificó todo bajo el nombre .NET 5, y desde entonces sale una versión por año; las pares tienen soporte largo (LTS). La de referencia hoy es .NET 10, con C# 14.",
      ],
      lista: [
        "C# 3 (2007): **LINQ**, consultas sobre colecciones escritas dentro del propio lenguaje.",
        "C# 5 (2012): `async` y `await`, que influyeron en JavaScript, Python y Rust.",
        "C# 8 (2019): tipos de referencia que aceptan o no `null`, para evitar el error más común.",
        "C# 9 (2020): **records** y programas sin clase `Main` (instrucciones de nivel superior).",
      ],
    },
    {
      heading: "Cómo funciona por dentro",
      parrafos: [
        "El compilador de C# no genera código de máquina sino un **lenguaje intermedio (IL)** dentro de un ensamblado (`.dll` o `.exe`). Al ejecutarlo, el CLR (Common Language Runtime) lo carga, lo verifica y un **compilador JIT** lo traduce a código de máquina de tu procesador mientras corre. También existe la compilación anticipada (AOT) para generar un ejecutable nativo.",
        "La memoria la administra el recolector de basura. Hay dos grandes familias de tipos: los **tipos por valor** (`int`, `bool`, `struct`), que se copian al asignarlos, y los **tipos por referencia** (`class`, `string`, arrays), donde la variable apunta a un objeto. Entender esa diferencia explica muchos comportamientos que sorprenden al empezar.",
        "Como F# y Visual Basic también compilan a IL, todos comparten la misma biblioteca de clases.",
      ],
    },
    {
      heading: "Tu primer programa, paso a paso",
      parrafos: [
        "Con el SDK de .NET instalado: `dotnet new console -n Saludo`, entrá a la carpeta y reemplazá el contenido de `Program.cs` por esto. Después `dotnet run -- Ana 2`.",
      ],
      codigo: [
        code`
var nombre = args.Length > 0 ? args[0] : "mundo";
var veces = args.Length > 1 ? int.Parse(args[1]) : 1;

for (var i = 1; i <= veces; i++)
{
    Console.WriteLine($"{i}. Hola, {nombre}");
}`,
      ],
    },
    {
      heading: "Qué hace cada línea",
      parrafos: [
        "No hay clase ni método `Main`: desde C# 9 un archivo puede empezar directamente por las instrucciones (el compilador genera el `Main` por vos), y `args` es el arreglo de argumentos. `var` le pide al compilador que **infiera el tipo**; sigue siendo tipado estático, solo que no lo escribís. `int.Parse` convierte el texto en número y **lanza una excepción** si no puede.",
        "El signo `$` delante de las comillas arma una **cadena interpolada**: lo que va entre llaves se calcula y se inserta. Con Ana y 2 imprime \"1. Hola, Ana\" y \"2. Hola, Ana\".",
      ],
    },
    {
      heading: "Los cinco conceptos que sostienen todo lo demás",
      parrafos: [
        "Con estos cinco leés casi cualquier código C#:",
      ],
      lista: [
        "**Clases, structs y records**: la clase es un molde por referencia, el struct un valor, y el record una clase de datos inmutable con comparación por contenido.",
        "**Propiedades**: campos con `get` y `set` que se usan como variables.",
        "**LINQ**: `Where`, `Select`, `OrderBy`… transforman colecciones con una cadena de llamadas.",
        "**Null seguro**: `string?` admite `null` y `string` no; el compilador avisa si olvidás comprobarlo.",
        "`async` y `await` con `Task`: **esperar sin bloquear el hilo**.",
      ],
      codigo: [
        code`
var libros = new List<Libro> { new("Dune", 600), new("Emma", 300) };

var largos = libros.Where(l => l.Paginas > 400)   // LINQ
                   .Select(l => l.Titulo)
                   .ToList();                     // ["Dune"]

string? nota = null;                              // el ? dice que puede ser null
Console.WriteLine(nota?.Length ?? 0);             // 0

async Task<string> LeerAsync(string ruta) => await File.ReadAllTextAsync(ruta);

record Libro(string Titulo, int Paginas);         // las declaraciones de tipos van al final`,
      ],
    },
    {
      heading: "Errores que comete casi todo el mundo",
      parrafos: [
        "Los más repetidos:",
      ],
      lista: [
        "`NullReferenceException`: usar algo que vale `null`. Activá los tipos que aceptan null y atendé las advertencias.",
        "Usar `double` o `float` para dinero: **acumulan errores de redondeo**. Usá `decimal`.",
        "Olvidar el `await`, o usar `async void`: los errores se pierden o se vuelven imposibles de atrapar. Devolvé `Task`.",
        "Bloquear con `.Result` o `.Wait()` sobre una tarea: puede dejar la aplicación colgada. Usá `await` hasta el final de la cadena.",
        "No saber que **LINQ es perezoso**: una consulta **se evalúa cuando la recorrés**, no cuando la escribís, y se vuelve a evaluar cada vez que la recorrés.",
      ],
      codigo: [
        code`
Console.WriteLine(0.1 + 0.2 == 0.3);       // False  (double)
Console.WriteLine(0.1m + 0.2m == 0.3m);    // True   (decimal)

var numeros = new List<int> { 1, 2, 3 };
var pares = numeros.Where(n => n % 2 == 0);   // todavía no se ejecutó
numeros.Add(4);
Console.WriteLine(pares.Count());             // 2: se evalúa recién acá, ya con el 4`,
      ],
    },
    {
      heading: "Dónde conviene usarlo y dónde no",
      parrafos: [
        "C# cubre muchísimo terreno:",
      ],
      tabla: {
        cabeza: ["Caso", "¿C#?", "Por qué"],
        filas: [
          ["APIs y servicios web (ASP.NET Core)", "Sí", "Muy rápido, maduro y con excelentes herramientas."],
          ["Videojuegos", "Sí", "Es el lenguaje de Unity y de Godot (con .NET)."],
          ["Aplicaciones de escritorio y empresariales", "Sí", "Ecosistema fuerte, sobre todo en Windows."],
          ["Aplicaciones móviles multiplataforma", "Posible", ".NET MAUI existe; muchos equipos prefieren Swift y Kotlin nativos."],
          ["Ciencia de datos e IA", "No es lo habitual", "El ecosistema está en Python."],
          ["Scripts rápidos", "No", "Hay que crear un proyecto; para una tarea corta, Python o Bash son más ágiles."],
        ],
      },
    },
    {
      heading: "Comparación con lenguajes cercanos",
      parrafos: [
        "Cuándo conviene otro:",
      ],
      tabla: {
        cabeza: ["Lenguaje", "Elegilo en vez de C# cuando…"],
        filas: [
          ["Java", "tu equipo o tu empresa ya está en el mundo Java y Spring."],
          ["Go", "querés servicios de red simples y un ejecutable muy chico."],
          ["Rust o C++", "necesitás control total de la memoria y el máximo rendimiento."],
          ["TypeScript", "ya trabajás todo en JavaScript y querés un solo lenguaje."],
        ],
      },
    },
    {
      heading: "Cómo seguir",
      parrafos: [
        "Hacé la ruta de C# de la app, resolvé los proyectos y usá la pestaña Referencia para el detalle de la sintaxis y de LINQ.",
        "Fuera de la app, Microsoft Learn tiene el recorrido oficial (un tour de C# y la guía de .NET). Con la base lista, ASP.NET Core (en Frameworks, cuando lo abras) es el paso natural para construir una API.",
      ],
    },
  ],
  fuentes: [
    { texto: "Tour de C# (Microsoft Learn)", url: "https://learn.microsoft.com/es-es/dotnet/csharp/tour-of-csharp/" },
    { texto: "Introducción a .NET", url: "https://learn.microsoft.com/es-es/dotnet/core/introduction" },
    { texto: "Historia de C#", url: "https://learn.microsoft.com/es-es/dotnet/csharp/whats-new/csharp-version-history" },
  ],
  revisada: "2026-11-12",
};
