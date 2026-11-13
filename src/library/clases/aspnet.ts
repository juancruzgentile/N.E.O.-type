import { type Clase, code } from "../types";

export const claseAspnet: Clase = {
  titulo: "ASP.NET Core de cero: APIs y sitios web rápidos sobre .NET",
  bajada:
    "La referencia rápida está en la otra pestaña. Esta es la clase completa: qué es ASP.NET Core y cómo viaja un pedido por su pipeline, tu primera API, " +
    "los conceptos base (inyección y Entity Framework), los errores clásicos y cuándo conviene.",
  secciones: [
    {
      heading: "Qué es y qué problema resuelve",
      parrafos: [
        "ASP.NET Core es el framework web de Microsoft para .NET. Con C# se construyen APIs REST, sitios con páginas, aplicaciones en tiempo real (SignalR) y servicios que se comunican entre sí. Trae servidor web propio (Kestrel), inyección de dependencias, configuración, registro de eventos, autenticación y autorización, todo integrado.",
        "El problema que resuelve es el de armar servicios web de producción con buen rendimiento y estructura sin juntar piezas de distintos proveedores: una sola plataforma, con herramientas excelentes, y que corre en Windows, Linux y macOS. Es de los frameworks más rápidos en las comparaciones de rendimiento de servicios HTTP.",
      ],
    },
    {
      heading: "Historia corta",
      parrafos: [
        "ASP.NET nació en 2002 junto con .NET Framework y funcionaba solo en Windows con el servidor IIS. En 2016, Microsoft lo reescribió desde cero como ASP.NET Core: de código abierto, multiplataforma y modular. Con la unificación de 2020 (.NET 5) el \"Core\" quedó como parte natural de .NET.",
      ],
      lista: [
        "2021 (.NET 6): llegan las minimal APIs, que permiten escribir una API completa en un solo archivo.",
        "Desde entonces sale una versión por año; la de referencia es .NET 10 (LTS).",
        "Se despliega como un ejecutable o un contenedor, sin depender de IIS.",
      ],
    },
    {
      heading: "Cómo funciona por dentro: el pipeline",
      parrafos: [
        "Un pedido entra por Kestrel y atraviesa una cadena de middleware: componentes que se ejecutan en orden, cada uno puede mirar o modificar el pedido, pasarlo al siguiente y después actuar sobre la respuesta cuando vuelve. Hay middleware de archivos estáticos, de enrutamiento, de autenticación, de autorización, de manejo de errores, de CORS… El orden en que los registrás importa, y es la fuente de muchos errores.",
        "Al final de la cadena, el enrutamiento elige el manejador: una función de una minimal API o un método de un controlador. Todo lo que ese código necesita (una base de datos, un servicio propio, la configuración) se lo pide al contenedor de inyección de dependencias, que ya viene integrado y construye cada objeto con el tiempo de vida que indicaste.",
      ],
    },
    {
      heading: "Tu primera API, paso a paso",
      parrafos: [
        "Con el SDK de .NET: dotnet new web -n Saludo, entrá a la carpeta, reemplazá Program.cs por esto y corré con dotnet watch run. Abrí /saludo/Ana?veces=2.",
      ],
      codigo: [
        code`
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/saludo/{nombre}", (string nombre, int veces = 1) =>
    Enumerable.Range(1, veces).Select(i => $"{i}. Hola, {nombre}"));

app.Run();`,
      ],
    },
    {
      heading: "Qué hace cada parte",
      parrafos: [
        "WebApplication.CreateBuilder prepara la configuración y el contenedor de servicios; Build crea la aplicación, y Run la pone a escuchar. MapGet asocia una ruta con una función: los parámetros se obtienen solos, nombre de la ruta (por estar entre llaves) y veces de la query (el valor por defecto lo vuelve opcional).",
        "Lo que devuelve la función se serializa a JSON: una lista de textos. Si el parámetro no se puede convertir (veces=dos), el framework responde con un error 400 sin ejecutar tu código. No hace falta ninguna clase ni controlador para una API chica.",
      ],
    },
    {
      heading: "Los cinco conceptos que sostienen todo lo demás",
      parrafos: [
        "Con estos cinco leés casi cualquier proyecto ASP.NET Core:",
      ],
      lista: [
        "Middleware y pipeline: el orden de app.Use… determina qué ocurre con cada pedido.",
        "Minimal APIs y controladores: MapGet, MapPost… para APIs simples, o clases con [ApiController] cuando crecen.",
        "Inyección de dependencias: AddSingleton (uno para toda la aplicación), AddScoped (uno por pedido) y AddTransient (uno por uso).",
        "Entity Framework Core: el ORM; las clases son tablas, los cambios de estructura se hacen con migraciones.",
        "Configuración: appsettings.json, variables de entorno y user-secrets para lo privado.",
      ],
      codigo: [
        code`
builder.Services.AddDbContext<AppDb>(o => o.UseSqlite("Data Source=libros.db"));
builder.Services.AddScoped<LibroService>();

app.MapGet("/libros/{id}", async (int id, AppDb db) =>
    await db.Libros.FindAsync(id) is Libro l ? Results.Ok(l) : Results.NotFound());

app.MapPost("/libros", async (Libro libro, AppDb db) =>
{
    db.Libros.Add(libro);
    await db.SaveChangesAsync();
    return Results.Created($"/libros/{libro.Id}", libro);
});`,
      ],
    },
    {
      heading: "Errores que comete casi todo el mundo",
      parrafos: [
        "Los más repetidos:",
      ],
      lista: [
        "Poner el middleware en el orden equivocado: la autorización antes de la autenticación no sabe quién es el usuario. Primero UseAuthentication, después UseAuthorization.",
        "Mezclar tiempos de vida: un servicio singleton que recibe uno scoped (como el DbContext) lo deja vivo para siempre y compartido entre hilos. Es el error de \"captive dependency\".",
        "Devolver las entidades de Entity Framework en la API: filtran campos internos y pueden generar ciclos al serializar. Usá DTOs o records.",
        "Olvidar el await, o usar async void: las excepciones se pierden y el pedido responde antes de terminar. Devolvé Task.",
        "Guardar secretos (contraseñas de bases, claves) en appsettings.json dentro del repositorio. Usá user-secrets en desarrollo y variables de entorno en producción.",
      ],
      codigo: [
        code`
builder.Services.AddSingleton<ServicioA>();   // vive toda la aplicación
builder.Services.AddScoped<AppDb>();          // uno por pedido
// MAL: si ServicioA recibe AppDb en el constructor, queda un DbContext congelado y compartido

app.UseAuthentication();    // primero: quién sos
app.UseAuthorization();     // después: qué podés hacer`,
      ],
    },
    {
      heading: "Dónde conviene usarlo y dónde no",
      parrafos: [
        "ASP.NET Core es muy sólido en el mundo .NET:",
      ],
      tabla: {
        cabeza: ["Caso", "¿ASP.NET Core?", "Por qué"],
        filas: [
          ["APIs REST y microservicios", "Sí", "Rendimiento alto, herramientas excelentes y minimal APIs."],
          ["Aplicaciones empresariales en un entorno Microsoft", "Sí", "Integra bien con Azure, SQL Server y Active Directory."],
          ["Tiempo real (chat, paneles en vivo)", "Sí", "SignalR está incluido."],
          ["Sitios con páginas generadas en el servidor", "Sí", "Razor Pages y Blazor."],
          ["Un equipo que no usa C#", "No", "El costo de aprender el ecosistema no se justifica."],
          ["Un script o un servicio de dos rutas en otro stack", "No", "Python o Node.js arrancan con menos ceremonia."],
        ],
      },
    },
    {
      heading: "Comparación con alternativas",
      parrafos: [
        "Cuándo conviene otra cosa:",
      ],
      tabla: {
        cabeza: ["Alternativa", "Elegila en vez de ASP.NET Core cuando…"],
        filas: [
          ["Spring Boot", "el entorno es Java; la arquitectura es muy parecida."],
          ["Django o FastAPI", "el equipo trabaja en Python."],
          ["Node.js (Express o NestJS)", "compartís código con un front-end en JavaScript."],
          ["Go", "querés servicios chicos y un solo ejecutable sin runtime."],
        ],
      },
    },
    {
      heading: "Cómo seguir",
      parrafos: [
        "Hacé el proyecto de ASP.NET Core de la app (una API de tareas) y usá la pestaña Referencia para recordar las piezas.",
        "Fuera de la app, Microsoft Learn tiene un tutorial de minimal APIs paso a paso, la documentación completa de ASP.NET Core y la de Entity Framework Core. Con la API andando, el siguiente paso es agregar autenticación y probar con pruebas de integración.",
      ],
    },
  ],
  fuentes: [
    { texto: "Documentación de ASP.NET Core", url: "https://learn.microsoft.com/es-es/aspnet/core/" },
    { texto: "Tutorial de minimal APIs", url: "https://learn.microsoft.com/es-es/aspnet/core/tutorials/min-web-api" },
    { texto: "Entity Framework Core", url: "https://learn.microsoft.com/es-es/ef/core/" },
  ],
  revisada: "2026-11-12",
};
