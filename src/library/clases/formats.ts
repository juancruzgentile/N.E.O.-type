import { type Clase, code } from "../types";

export const claseFormats: Clase = {
  titulo: "Formatos de datos: JSON, YAML, TOML, Markdown y .env",
  bajada:
    "Los formatos de texto con los que los programas intercambian datos y se configuran. Qué es cada uno, por qué existen tantos, " +
    "las trampas de cada uno (como el famoso problema de Noruega en YAML) y cuándo conviene elegir cuál.",
  secciones: [
    {
      heading: "Qué es y qué problema resuelve",
      parrafos: [
        "Un formato de datos es un acuerdo sobre cómo escribir información como texto para que dos programas (o un programa y una persona) se entiendan. Cuando una aplicación le manda datos a otra, cuando guardás una configuración o cuando documentás un proyecto, necesitás un formato que ambos lados sepan leer.",
        "Existen varios porque cada uno prioriza algo distinto. JSON es simple y universal para intercambiar datos entre programas. YAML es cómodo para que una persona escriba configuraciones largas. TOML es claro y poco ambiguo para configurar proyectos. Markdown sirve para escribir texto con formato. Y los archivos .env guardan variables de entorno, sobre todo secretos. Elegir bien evita errores y malentendidos.",
      ],
    },
    {
      heading: "Historia corta",
      parrafos: [
        "XML (1998) fue el primer formato de intercambio ampliamente adoptado: potente pero verboso. A principios de los dos mil, Douglas Crockford descubrió y popularizó JSON, un subconjunto de la sintaxis de JavaScript que era mucho más liviano, y desplazó a XML en las APIs web. YAML apareció en 2001 buscando legibilidad humana, y Markdown, creado por John Gruber en 2004, buscaba texto plano que se leyera bien y se convirtiera a HTML.",
        "TOML lo creó Tom Preston-Werner (cofundador de GitHub) en 2013 como una configuración obvia y sin sorpresas; hoy es el de pyproject.toml en Python y Cargo.toml en Rust. Y los archivos .env se difundieron con la metodología de las \"aplicaciones de doce factores\", que recomienda guardar la configuración en el entorno y no en el código.",
      ],
    },
    {
      heading: "Cómo funciona por dentro",
      parrafos: [
        "Todos estos formatos pasan por dos pasos: un analizador (parser) lee el texto y lo convierte en estructuras del lenguaje (diccionarios, listas, números, textos), y un serializador hace el camino inverso. Si el texto no cumple la sintaxis, el analizador rechaza todo, y por eso una coma de más en JSON rompe el archivo entero.",
        "Lo que cambia entre formatos es qué tan estrictos son. JSON es estricto y chico: solo objetos, listas, textos, números, booleanos y null; claves siempre entre comillas dobles; sin comentarios ni comas finales. YAML es mucho más flexible: la estructura se define por la sangría (solo espacios), admite comentarios y tipos inferidos del texto, y esa flexibilidad es también su mayor fuente de sorpresas. TOML tiene tipos explícitos, incluidas las fechas. Los .env son apenas líneas CLAVE=valor.",
      ],
    },
    {
      heading: "El mismo dato en tres formatos",
      parrafos: [
        "Una configuración de servidor, escrita en JSON, YAML y TOML:",
      ],
      codigo: [
        { lang: "formats", text: code`
{
  "servidor": { "puerto": 8080, "debug": false },
  "admins": ["ana", "luis"]
}` },
        { lang: "formats", text: code`
servidor:
  puerto: 8080
  debug: false
admins:
  - ana
  - luis` },
        { lang: "formats", text: code`
admins = ["ana", "luis"]

[servidor]
puerto = 8080
debug = false` },
      ],
    },
    {
      heading: "Los cinco conceptos que sostienen todo lo demás",
      parrafos: [
        "Con estos cinco usás cualquiera de los formatos sin miedo:",
      ],
      lista: [
        "Estructura: objetos (clave → valor) y listas, anidados. Todos los formatos comparten esta idea.",
        "Tipos: texto, número, booleano y nulo. En JSON son pocos y explícitos; en YAML se infieren del texto, y eso trae trampas.",
        "Comentarios: JSON no admite comentarios; YAML, TOML y .env sí (con #). Por eso JSON no es bueno para configuración escrita a mano.",
        "Validación: un esquema (JSON Schema) define qué forma tienen los datos válidos y permite comprobar un archivo antes de usarlo.",
        "Secretos: lo sensible (claves, contraseñas) va en variables de entorno o en un gestor de secretos, no en un archivo versionado.",
      ],
      codigo: [
        { lang: "formats", text: code`
# .env  (NO se sube al repositorio; se sube un .env.example sin valores)
DATABASE_URL=postgresql://app@localhost:5432/tienda
SECRET_KEY=cambiame
DEBUG=false` },
      ],
    },
    {
      heading: "Errores que comete casi todo el mundo",
      parrafos: [
        "Las trampas más conocidas:",
      ],
      lista: [
        "Coma final o comillas simples en JSON: no es válido. Las claves van siempre entre comillas dobles, y el último elemento no lleva coma.",
        "Tabuladores en YAML: la sangría solo admite espacios. Una tabulación es un error.",
        "El problema de Noruega en YAML: en YAML 1.1, el texto NO (código de país de Noruega) se interpreta como el booleano falso, y yes, no, on y off también. Escribilo entre comillas.",
        "Números que pierden precisión: JSON no distingue enteros de decimales, y los lenguajes que usan coma flotante pierden dígitos en enteros muy grandes (identificadores de 64 bits). Mandalos como texto.",
        "Subir el .env real al repositorio: las claves quedan en el historial para siempre. Usá .gitignore y un .env.example.",
        "Editar a mano un archivo generado (como un lockfile): se pisa la próxima vez que se genera.",
        "Cargar YAML de fuentes no confiables con un cargador inseguro: puede ejecutar código. Usá siempre el cargador seguro (safe_load en Python).",
      ],
      codigo: [
        { lang: "formats", text: code`
# YAML 1.1: estos valores NO son lo que parecen
pais: NO          # se lee como false
activo: yes       # se lee como true
version: 1.10     # se lee como el número 1.1

# entre comillas son texto
pais: "NO"
version: "1.10"` },
      ],
    },
    {
      heading: "Dónde conviene cada formato y dónde no",
      parrafos: [
        "Una guía rápida para elegir:",
      ],
      tabla: {
        cabeza: ["Formato", "Conviene para", "Cuidado con"],
        filas: [
          ["JSON", "APIs, intercambio entre programas, almacenamiento simple", "Sin comentarios ni comas finales; incómodo para escribir a mano."],
          ["YAML", "Configuración larga que escribe una persona (CI, Docker Compose, Kubernetes)", "La sangría y los tipos inferidos; cargarlo de fuentes no confiables."],
          ["TOML", "Configuración de proyectos (pyproject.toml, Cargo.toml)", "Poco apropiado para datos muy anidados."],
          ["Markdown", "Documentación, README, notas", "No es un formato de datos; hay variantes distintas."],
          [".env", "Variables de entorno y secretos de desarrollo", "No se sube a Git; no tiene tipos ni estructura."],
          ["CSV", "Tablas planas para hojas de cálculo", "Sin tipos; las comas y saltos de línea dentro de un campo complican."],
        ],
      },
    },
    {
      heading: "Comparación con alternativas",
      parrafos: [
        "Cuándo conviene otra cosa:",
      ],
      tabla: {
        cabeza: ["Alternativa", "Elegila en vez de JSON o YAML cuando…"],
        filas: [
          ["XML", "trabajás con sistemas antiguos o documentos con mucho texto mezclado con marcas (por ejemplo, XHTML o SVG)."],
          ["Protocol Buffers o MessagePack", "necesitás un formato binario, más chico y rápido, entre servicios."],
          ["CSV o Parquet", "los datos son una tabla grande para análisis."],
          ["Una base de datos", "los datos se consultan, cambian seguido o los usan muchos a la vez."],
        ],
      },
    },
    {
      heading: "Cómo seguir",
      parrafos: [
        "Hacé la ruta de Formatos de la app y usá la pestaña Referencia para recordar la sintaxis de cada uno. Para practicar, escribí la configuración de un proyecto en los tres formatos y cargala con un programa que la lea y compruebe los tipos.",
        "Las especificaciones son cortas y legibles: json.org resume JSON en una página, TOML tiene su sitio oficial con la especificación, y YAML tiene la suya. Para Markdown, la especificación CommonMark define una versión sin ambigüedades.",
      ],
    },
  ],
  fuentes: [
    { texto: "JSON: introducción", url: "https://www.json.org/json-es.html" },
    { texto: "Especificación de YAML", url: "https://yaml.org/spec/1.2.2/" },
    { texto: "TOML (en inglés)", url: "https://toml.io/en/" },
    { texto: "CommonMark", url: "https://commonmark.org/" },
  ],
  revisada: "2026-11-12",
};
