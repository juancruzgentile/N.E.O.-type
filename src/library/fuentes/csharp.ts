import type { FuentesTema } from "./tipos";

const C = "https://learn.microsoft.com/en-us/dotnet/csharp/";
export const csharp: FuentesTema = {
  version: "C# 14 (.NET 10)",
  entradas: {
    "Top-level statements": [C + "fundamentals/program-structure/top-level-statements", "C# 9"],
    "Tipos y var": [C + "language-reference/builtin-types/built-in-types"],
    "Interpolación $\"\"": [C + "tutorials/string-interpolation", "C# 6"],
    "if, switch y bucles": [C + "language-reference/statements/selection-statements"],
    "Clases y propiedades": [C + "programming-guide/classes-and-structs/properties"],
    "List y Dictionary": ["https://learn.microsoft.com/en-us/dotnet/standard/collections/"],
    "record": [C + "language-reference/builtin-types/record", "C# 9"],
    "LINQ": [C + "linq/"],
    "async / await y Task": [C + "asynchronous-programming/", "C# 5"],
    "Nullable y operadores ?. ??": [C + "nullable-references", "C# 8"],
    "try / catch / using": [C + "language-reference/statements/exception-handling-statements"],
    "interface": [C + "fundamentals/types/interfaces"],
    "Pattern matching": [C + "fundamentals/functional/pattern-matching"],
    "Genéricos y restricciones": [C + "programming-guide/generics/constraints-on-type-parameters"],
    "Minimal API (ASP.NET Core)": ["https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/overview", ".NET 6"],
    "CLI dotnet": ["https://learn.microsoft.com/en-us/dotnet/core/tools/"],
    "IAsyncEnumerable": [C + "asynchronous-programming/generate-consume-asynchronous-stream", "C# 8"],
    "xUnit": ["https://learn.microsoft.com/en-us/dotnet/core/testing/unit-testing-csharp-with-xunit"],
  },
};
