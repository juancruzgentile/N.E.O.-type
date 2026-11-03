// Revisa la sintaxis de los ejemplos de C# de la Biblioteca (lo usa scripts/check-examples.ts).
// Lee los ejemplos por la entrada estándar, separados por \0, y escribe una línea por ejemplo:
// "OK" o "ERROR línea N: mensaje". Se corre con: dotnet run scripts/csharp-sintaxis.cs
#:package Microsoft.CodeAnalysis.CSharp@4.14.0

using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;

var regular = new CSharpParseOptions(LanguageVersion.Preview);
// en modo script valen sentencias y declaraciones mezcladas, como en los fragmentos de la Biblioteca
var script = new CSharpParseOptions(LanguageVersion.Preview, kind: SourceCodeKind.Script);

foreach (var code in Console.In.ReadToEnd().Split('\0'))
{
    string? error = null;
    foreach (var opciones in new[] { regular, script })
    {
        var diag = CSharpSyntaxTree.ParseText(code, opciones).GetDiagnostics()
            .FirstOrDefault(d => d.Severity == DiagnosticSeverity.Error);
        if (diag is null)
        {
            error = null;
            break;
        }
        error ??= $"línea {diag.Location.GetLineSpan().StartLinePosition.Line + 1}: {diag.GetMessage()}";
    }
    Console.WriteLine(error is null ? "OK" : "ERROR " + error.ReplaceLineEndings(" "));
}
