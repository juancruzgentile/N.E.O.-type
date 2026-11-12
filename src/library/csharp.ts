import { type Topic, a, b, code, m } from "./types";
import { claseCsharp } from "./clases/csharp";

export const csharp: Topic = {
  id: "csharp",
  name: "C#",
  group: "Lenguajes",
  emblem: "csharp",
  badge: "C#",
  color: "#a179dc",
  hl: "csharp",
  summary:
    "Lenguaje de Microsoft, orientado a objetos y con tipado estático, que corre sobre .NET en Windows, Linux y macOS. " +
    "Se usa en back-end (ASP.NET Core), aplicaciones de escritorio, videojuegos (Unity) y servicios en la nube.",
  facts: [
    { label: "Archivos", value: ".cs · .csproj" },
    { label: "Ejecutar", value: "dotnet run" },
    { label: "Paquetes", value: "NuGet (dotnet add package)" },
    { label: "Versión de referencia", value: ".NET 10 LTS · C# 14" },
    { label: "Estilo", value: "4 espacios · PascalCase en métodos" },
  ],
  workflow: [
    { title: "Todo pasa por la CLI dotnet", text: "dotnet new crea proyectos, dotnet build compila, dotnet test prueba y dotnet publish empaqueta." },
    { title: "Nullable activado", text: "Con <Nullable>enable</Nullable> el compilador avisa dónde un valor puede ser null." },
    { title: "async de punta a punta", text: "Si una operación es asíncrona (red, disco), propagá async/await hasta arriba; evitá .Result y .Wait()." },
    { title: "Inyección de dependencias", text: "En ASP.NET Core los servicios se registran en Program.cs y llegan por constructor." },
    { title: "Tests con xUnit", text: "Un proyecto de tests aparte (dotnet new xunit) referenciando el principal." },
  ],
  entries: [
    b("Estructura", "Top-level statements", "Un programa puede empezar directo en Program.cs, sin clase ni Main explícito.", code`
Console.WriteLine("Hola, mundo");
var nombre = Console.ReadLine();
Console.WriteLine($"Hola, {nombre}");`, "main inicio programa"),
    b("Datos", "Tipos y var", "int, double, decimal (dinero), bool, string, char. var infiere el tipo.", code`
int edad = 30;
decimal precio = 19.99m;
bool activo = true;
var nombre = "Ana";       // string`, "variable tipo"),
    b("Texto", "Interpolación $\"\"", "Cadenas con $ adelante: las expresiones van entre llaves, con formato opcional.", code`
Console.WriteLine($"Total: {total:C2}");
Console.WriteLine($"{nombre,-10}|{edad,5}");
var ruta = @"C:\datos\archivo.txt";`, "formato string interpolar"),
    b("Control de flujo", "if, switch y bucles", "Condicionales y bucles clásicos; foreach recorre colecciones.", code`
foreach (var item in items)
{
    if (item.Precio > 100) continue;
    Console.WriteLine(item.Nombre);
}`, "condicional bucle foreach"),
    b("Clases", "Clases y propiedades", "Las propiedades encapsulan campos con get/set; init solo permite asignar al crear. En un archivo con instrucciones de nivel superior (sin Main), las clases van después del código.", code`
var p = new Producto { Nombre = "Yerba", Precio = 3.5m };
Console.WriteLine(p.Nombre);

public class Producto
{
    public string Nombre { get; init; } = "";
    public decimal Precio { get; set; }
}`, "clase propiedad get set"),
    b("Colecciones", "List y Dictionary", "Colecciones genéricas más usadas.", code`
var nombres = new List<string> { "Ana", "Luis" };
nombres.Add("Eva");
var edades = new Dictionary<string, int> { ["Ana"] = 30 };
edades.TryGetValue("Luis", out var edad);`, "lista diccionario"),

    m("Clases", "record", "Tipo de datos con igualdad por valor; with crea una copia con cambios. Las propiedades de un record posicional son init: no se reasignan después de crearlo. Es una inmutabilidad superficial (una lista adentro se puede modificar) y un record struct sin readonly es mutable.", code`
var a = new Punto(1, 2);
var b = a with { Y = 5 };
Console.WriteLine(a == new Punto(1, 2)); // True

public record Punto(int X, int Y);`, "registro inmutable with"),
    m("Consultas", "LINQ", "Consultas sobre colecciones con métodos encadenados: Where, Select, OrderBy, GroupBy.", code`
var caros = productos
    .Where(p => p.Precio > 100)
    .OrderByDescending(p => p.Precio)
    .Select(p => p.Nombre)
    .ToList();`, "linq consulta filtrar"),
    m("Asincronía", "async / await y Task", "Métodos asíncronos que no bloquean el hilo mientras esperan red o disco.", code`
async Task<string> DescargarAsync(string url)
{
    using var http = new HttpClient();
    return await http.GetStringAsync(url);
}`, "asincrono task"),
    m("Null", "Nullable y operadores ?. ??", "string? puede ser null. ?. corta si es null y ?? da un valor por defecto.", code`
string? email = usuario?.Email;
var mostrar = email ?? "sin email";
usuario ??= new Usuario();`, "nulo null operador"),
    m("Errores", "try / catch / using", "Maneja excepciones; using libera recursos al salir del bloque.", code`
try
{
    using var lector = new StreamReader("datos.txt");
    Console.WriteLine(lector.ReadToEnd());
}
catch (FileNotFoundException ex)
{
    Console.Error.WriteLine(ex.Message);
}`, "excepcion recursos"),
    m("Clases", "interface", "Contrato que una clase implementa. Base de la inyección de dependencias.", code`
public interface IRepositorio<T>
{
    T? Buscar(int id);
    void Guardar(T item);
}`, "interfaz contrato"),

    a("Control de flujo", "Pattern matching", "switch con patrones de tipo, propiedades y rangos.", code`
string Categoria(object o) => o switch
{
    int n when n < 0 => "negativo",
    int => "entero",
    string { Length: 0 } => "texto vacío",
    Punto(0, 0) => "origen",
    _ => "otro",
};`, "switch patrones"),
    a("Genéricos", "Genéricos y restricciones", "Tipos parametrizados con where para exigir capacidades.", code`
public static T Mayor<T>(IEnumerable<T> items) where T : IComparable<T>
    => items.Aggregate((x, y) => x.CompareTo(y) >= 0 ? x : y);`, "generics where"),
    a("Web", "Minimal API (ASP.NET Core)", "Una API REST en pocas líneas.", code`
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/tareas", () => tareas);
app.MapPost("/tareas", (Tarea t) => { tareas.Add(t); return Results.Created($"/tareas/{t.Id}", t); });

app.Run();`, "api rest web aspnet"),
    a("Herramientas", "CLI dotnet", "Comandos del día a día.", code`
dotnet new console -n MiApp
dotnet add package Newtonsoft.Json
dotnet build
dotnet test
dotnet publish -c Release`, "dotnet nuget build"),
    a("Concurrencia", "IAsyncEnumerable", "Secuencias que llegan de a poco, recorridas con await foreach.", code`
async IAsyncEnumerable<int> Contar()
{
    for (var i = 0; i < 3; i++)
    {
        await Task.Delay(100);
        yield return i;
    }
}
await foreach (var n in Contar()) Console.WriteLine(n);`, "stream async yield"),
    a("Calidad", "xUnit", "Tests con [Fact] y [Theory].", code`
public class CalculadoraTests
{
    [Theory]
    [InlineData(2, 3, 5)]
    [InlineData(-1, 1, 0)]
    public void Suma(int a, int b, int esperado)
        => Assert.Equal(esperado, Calculadora.Sumar(a, b));
}`, "test prueba"),
  ],
  clase: claseCsharp,
};
