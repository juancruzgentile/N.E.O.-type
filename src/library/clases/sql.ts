import { type Clase, code } from "../types";

export const claseSql: Clase = {
  titulo: "SQL de cero: preguntarle a los datos en vez de recorrerlos",
  bajada:
    "La referencia rápida está en la otra pestaña. Esta es la clase completa: qué es SQL y por qué se usa desde hace medio siglo, cómo piensa una base relacional, " +
    "tu primera tabla y consulta, los conceptos base, los errores típicos y cuándo conviene.",
  secciones: [
    {
      heading: "Qué es y qué problema resuelve",
      parrafos: [
        "SQL (Structured Query Language) es el lenguaje para trabajar con bases de datos relacionales: las que guardan la información en tablas con filas y columnas, como PostgreSQL, MySQL, SQLite, SQL Server u Oracle. Con SQL creás tablas, guardás datos y, sobre todo, hacés preguntas: \"cuántos pedidos hizo cada cliente este mes\".",
        "A diferencia de los lenguajes de programación comunes, SQL es declarativo: describís qué datos querés y no cómo obtenerlos. No escribís un bucle que recorre todo y va filtrando; escribís la condición y la base decide el camino más eficiente, usando índices si los hay. Eso lo hace corto y a la vez muy potente, y por eso casi todo sistema serio que guarda datos lo usa.",
      ],
    },
    {
      heading: "Historia corta",
      parrafos: [
        "En 1970, Edgar F. Codd (de IBM) propuso el modelo relacional: guardar los datos en tablas relacionadas por claves, en vez de en estructuras enredadas. Donald Chamberlin y Raymond Boyce, también de IBM, crearon a principios de los setenta un lenguaje para consultar ese modelo, que se llamó primero SEQUEL y después SQL.",
        "Oracle lo comercializó a fines de los setenta, y ANSI lo estandarizó en 1986 (ISO en 1987). Desde entonces el estándar se amplió varias veces, pero cada motor tiene su dialecto: lo básico funciona igual en todos, y las diferencias aparecen en las funciones de fechas, los tipos y las extensiones.",
      ],
      lista: [
        "Los datos que no encajan bien en tablas dieron lugar al movimiento NoSQL (años 2000), pero SQL no desapareció: muchos de esos sistemas terminaron sumando consultas parecidas.",
        "SQLite, una base de datos completa en un solo archivo, está en casi todos los teléfonos y navegadores.",
        "PostgreSQL es hoy la base de código abierto más completa; MySQL y MariaDB son muy usadas en la web.",
      ],
    },
    {
      heading: "Cómo funciona por dentro",
      parrafos: [
        "Cuando mandás una consulta, el motor hace tres cosas. La analiza y comprueba que las tablas y columnas existan. Después el optimizador elabora un plan: qué índices usar, en qué orden unir las tablas, cómo filtrar. Y por último lo ejecuta. Podés ver el plan con EXPLAIN. Por eso dos consultas que dan el mismo resultado pueden tardar milisegundos o minutos.",
        "El orden en que escribís una consulta no es el orden en que se evalúa. Lógicamente, primero se resuelve FROM (y los JOIN), después WHERE, luego GROUP BY, HAVING, SELECT, ORDER BY y por último LIMIT. Eso explica, por ejemplo, por qué no podés usar en el WHERE un alias que creaste en el SELECT.",
        "Las bases relacionales también ofrecen transacciones con las propiedades ACID: atómicas (o se hace todo o nada), consistentes (se respetan las reglas), aisladas (una transacción no ve a medias a otra) y durables (lo confirmado no se pierde). Es la razón por la que se confía en ellas para el dinero.",
      ],
    },
    {
      heading: "Tu primera tabla y tu primera consulta",
      parrafos: [
        "Con SQLite (sqlite3 libros.db) o cualquier otro motor, probá esto.",
      ],
      codigo: [
        code`
CREATE TABLE libros (
  id INTEGER PRIMARY KEY,
  titulo TEXT NOT NULL,
  autor TEXT NOT NULL,
  paginas INTEGER
);

INSERT INTO libros (titulo, autor, paginas) VALUES
  ('Dune', 'Herbert', 600),
  ('Emma', 'Austen', 300),
  ('Persuasión', 'Austen', 250);

SELECT autor, COUNT(*) AS cantidad, AVG(paginas) AS promedio
FROM libros
WHERE paginas > 200
GROUP BY autor
ORDER BY cantidad DESC;`,
      ],
    },
    {
      heading: "Qué hace cada parte",
      parrafos: [
        "CREATE TABLE define la estructura: cada columna con su tipo, NOT NULL para que sea obligatoria y PRIMARY KEY para identificar cada fila de forma única. INSERT agrega filas; los textos van entre comillas simples.",
        "La consulta se lee en orden lógico: de la tabla libros, quedate con las filas de más de 200 páginas, agrupalas por autor, calculá la cantidad y el promedio de cada grupo y mostralas de mayor a menor cantidad. El resultado es Austen con 2 libros y promedio 275, y Herbert con 1 libro y promedio 600.",
      ],
    },
    {
      heading: "Los cinco conceptos que sostienen todo lo demás",
      parrafos: [
        "Con estos cinco leés casi cualquier consulta:",
      ],
      lista: [
        "Tablas, claves primarias y foráneas: la clave primaria identifica una fila; la foránea apunta a la fila de otra tabla y así se relacionan.",
        "SELECT, WHERE y ORDER BY: qué columnas, qué filas, en qué orden.",
        "JOIN: une filas de dos tablas según una condición. INNER JOIN deja solo las que coinciden; LEFT JOIN conserva todas las de la izquierda.",
        "GROUP BY y agregaciones: COUNT, SUM, AVG, MIN, MAX sobre grupos. HAVING filtra los grupos.",
        "Índices y transacciones: el índice acelera las búsquedas, y la transacción agrupa varios cambios como una unidad.",
      ],
      codigo: [
        code`
SELECT p.id, c.nombre, p.total
FROM pedidos p
JOIN clientes c ON c.id = p.cliente_id      -- une cada pedido con su cliente
WHERE p.total > 100;

BEGIN;
UPDATE cuentas SET saldo = saldo - 50 WHERE id = 1;
UPDATE cuentas SET saldo = saldo + 50 WHERE id = 2;
COMMIT;                                     -- o se hacen las dos o no se hace ninguna

CREATE INDEX idx_pedidos_cliente ON pedidos (cliente_id);   -- acelera buscar por cliente`,
      ],
    },
    {
      heading: "Errores que comete casi todo el mundo",
      parrafos: [
        "Los más repetidos:",
      ],
      lista: [
        "Comparar con NULL usando =: NULL significa \"desconocido\", así que nada es igual a NULL. Usá IS NULL.",
        "Olvidar el WHERE en un UPDATE o un DELETE: cambia o borra todas las filas. Probá primero con un SELECT y usá una transacción.",
        "Armar consultas pegando texto del usuario: inyección SQL. Usá siempre parámetros (consultas preparadas).",
        "Usar SELECT * en código real: trae columnas de más y se rompe cuando cambia la tabla. Pedí las columnas que necesitás.",
        "Buscar por una columna sin índice en una tabla grande: la consulta recorre todo. Mirá el plan con EXPLAIN.",
        "Un JOIN que multiplica filas: si la condición une uno con muchos, los totales se inflan. Revisá con COUNT antes y después.",
      ],
      codigo: [
        code`
SELECT * FROM libros WHERE paginas = NULL;     -- nunca devuelve nada
SELECT * FROM libros WHERE paginas IS NULL;    -- correcto

UPDATE libros SET paginas = 0;                 -- sin WHERE: cambia TODAS las filas`,
      ],
    },
    {
      heading: "Dónde conviene usarlo y dónde no",
      parrafos: [
        "SQL es la opción por defecto para datos con estructura:",
      ],
      tabla: {
        cabeza: ["Caso", "¿SQL?", "Por qué"],
        filas: [
          ["Aplicaciones con usuarios, pedidos, pagos", "Sí", "Relaciones claras y transacciones que no pierden datos."],
          ["Informes y análisis de datos", "Sí", "Agrupar, filtrar y unir es lo que mejor hace."],
          ["Datos que cambian de forma todo el tiempo", "Con cuidado", "Un documento flexible (como en MongoDB) puede ser más cómodo, aunque PostgreSQL también guarda JSON."],
          ["Grafos de relaciones muy profundas", "No ideal", "Las bases de grafos recorren relaciones largas con más naturalidad."],
          ["Caché de acceso muy rápido por clave", "No ideal", "Una base en memoria como Redis es más simple."],
          ["Archivos grandes (imágenes, video)", "No", "Guardá el archivo en almacenamiento de objetos y en la base solo la referencia."],
        ],
      },
    },
    {
      heading: "Comparación con alternativas",
      parrafos: [
        "Cuándo conviene otra cosa:",
      ],
      tabla: {
        cabeza: ["Alternativa", "Elegila en vez de SQL cuando…"],
        filas: [
          ["MongoDB y bases de documentos", "los datos son documentos anidados con estructura variable."],
          ["Redis", "necesitás guardar y leer por clave a toda velocidad, como en una caché."],
          ["Una hoja de cálculo", "son pocos datos y los trabaja una sola persona."],
          ["pandas (Python)", "analizás un archivo local sin necesidad de una base."],
          ["Un ORM", "querés escribir consultas desde el lenguaje de tu aplicación; igual sigue habiendo SQL por debajo."],
        ],
      },
    },
    {
      heading: "Cómo seguir",
      parrafos: [
        "Hacé la ruta de SQL de la app, resolvé los proyectos y usá la pestaña Referencia para recordar la sintaxis. Practicá con datos de verdad: creá tu propia base con SQLite y hacé preguntas que te interesen.",
        "Fuera de la app, la documentación de PostgreSQL y la de SQLite son claras y completas, y Use The Index, Luke explica cómo funcionan los índices y por qué una consulta es lenta. Más adelante, en esta Biblioteca, vas a encontrar clases sobre cómo elegir una base de datos, PostgreSQL a fondo y bases NoSQL.",
      ],
    },
  ],
  fuentes: [
    { texto: "Documentación de PostgreSQL: SQL", url: "https://www.postgresql.org/docs/current/sql.html" },
    { texto: "SQLite: el lenguaje SQL", url: "https://sqlite.org/lang.html" },
    { texto: "Use The Index, Luke", url: "https://use-the-index-luke.com/" },
  ],
  revisada: "2026-11-12",
};
