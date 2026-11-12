import { type Clase, code } from "../types";

export const clasePostgresql: Clase = {
  titulo: "PostgreSQL a fondo: la base relacional que casi todo lo puede",
  bajada:
    "Más allá del SQL básico: por qué PostgreSQL es tan elegida, cómo funciona por dentro (MVCC, WAL, planificador), tu primera base, " +
    "los conceptos que más se usan, los errores típicos y cuándo conviene.",
  secciones: [
    {
      heading: "Qué es y qué problema resuelve",
      parrafos: [
        "PostgreSQL (se dice \"postgres\") es un sistema de gestión de bases de datos relacionales de código abierto. Guarda datos en tablas, los consulta con SQL y garantiza que las transacciones cumplan ACID. Además de lo estándar, soporta JSON, arreglos, búsqueda de texto, datos geográficos (con PostGIS), búsqueda vectorial (con pgvector) y extensiones que le agregan funciones sin tocar el motor.",
        "El problema que resuelve es el de tener, en una sola base gratuita, casi todo lo que una aplicación necesita: integridad fuerte para los datos importantes, flexibilidad cuando hay datos semiestructurados y rendimiento que escala bastante lejos en un solo servidor. Por eso es la opción por defecto de muchos equipos.",
      ],
    },
    {
      heading: "Historia corta",
      parrafos: [
        "Viene del proyecto POSTGRES, que Michael Stonebraker lideró en la Universidad de California en Berkeley a partir de 1986, como sucesor de Ingres (de ahí el nombre: post-Ingres). En 1994 se le agregó un intérprete de SQL (salió como Postgres95) y en 1996 pasó a llamarse PostgreSQL. Desde entonces lo desarrolla una comunidad independiente, sin una empresa dueña, y sale una versión mayor por año.",
      ],
      lista: [
        "Tiene licencia propia muy permisiva (parecida a MIT), lo que permite usarlo y vender productos basados en él sin restricciones.",
        "Muchos servicios gestionados en la nube (Amazon RDS y Aurora, Google Cloud SQL, Azure, Supabase, Neon) ofrecen PostgreSQL.",
        "Cada versión tiene soporte durante cinco años, y la comunidad avisa con tiempo antes de retirar una.",
      ],
    },
    {
      heading: "Cómo funciona por dentro",
      parrafos: [
        "PostgreSQL arranca un proceso por cada conexión. Cada conexión es relativamente pesada, por eso las aplicaciones usan un pool de conexiones (como PgBouncer) en vez de abrir cientos. Una consulta pasa por el analizador, el planificador (que elige entre muchas formas de ejecutarla según las estadísticas de los datos) y el ejecutor.",
        "La concurrencia se resuelve con MVCC (control de concurrencia multiversión): al modificar una fila no se pisa la vieja, se crea una versión nueva, y cada transacción ve la versión que le corresponde según cuándo empezó. Por eso las lecturas no bloquean a las escrituras. La contrapartida es que las versiones viejas se acumulan hasta que VACUUM las limpia (el autovacuum lo hace solo). Y la durabilidad la da el WAL: cada cambio se anota primero en un registro secuencial, que permite recuperarse de un corte y armar réplicas.",
      ],
    },
    {
      heading: "Tu primera base, paso a paso",
      parrafos: [
        "Con PostgreSQL instalado (o con un contenedor), creá un rol, una base y probá esto con psql.",
      ],
      codigo: [
        code`
CREATE ROLE app LOGIN PASSWORD 'cambiame';
CREATE DATABASE tienda OWNER app;

-- ahora conectado a tienda:
CREATE TABLE productos (
  id     bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre text NOT NULL,
  precio numeric(10, 2) NOT NULL CHECK (precio >= 0),
  datos  jsonb NOT NULL DEFAULT '{}'
);

INSERT INTO productos (nombre, precio, datos)
VALUES ('Cuaderno', 25, '{"color": "azul"}')
RETURNING id;

SELECT nombre, datos->>'color' AS color FROM productos WHERE precio < 100;`,
      ],
    },
    {
      heading: "Qué hace cada parte",
      parrafos: [
        "Creamos un rol (el \"usuario\" de PostgreSQL) con contraseña y una base cuyo dueño es ese rol. En la tabla, GENERATED ALWAYS AS IDENTITY es la forma moderna de tener una clave autoincremental, CHECK impide precios negativos, y jsonb guarda un documento flexible junto a las columnas rígidas.",
        "RETURNING es una característica muy útil de PostgreSQL: el INSERT devuelve las columnas de lo que insertó, sin necesidad de otra consulta. Y datos->>'color' extrae un campo del JSON como texto.",
      ],
    },
    {
      heading: "Los cinco conceptos que más se usan",
      parrafos: [
        "Con estos cinco sacás el provecho principal de PostgreSQL:",
      ],
      lista: [
        "Tipos ricos: uuid, timestamptz, numeric, arreglos, rangos, enumeraciones y jsonb.",
        "Índices variados: B-tree para casi todo, GIN para jsonb, arreglos y texto, GiST y BRIN para geografía y datos ordenados, parciales y de expresiones.",
        "Transacciones y niveles de aislamiento: por defecto, READ COMMITTED; SERIALIZABLE para lo más estricto.",
        "EXPLAIN ANALYZE: la herramienta para entender por qué una consulta es lenta.",
        "Extensiones: CREATE EXTENSION agrega pgvector (vectores), pg_trgm (búsqueda por parecido), PostGIS (mapas) y más.",
      ],
      codigo: [
        code`
CREATE INDEX idx_prod_datos ON productos USING gin (datos);

BEGIN ISOLATION LEVEL SERIALIZABLE;
-- ... operaciones que no toleran anomalías ...
COMMIT;

CREATE EXTENSION IF NOT EXISTS pg_trgm;
SELECT nombre FROM productos WHERE nombre % 'cuadreno';   -- tolera errores de tipeo

EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM productos WHERE datos @> '{"color": "azul"}';`,
      ],
    },
    {
      heading: "Errores que comete casi todo el mundo",
      parrafos: [
        "Los que más se repiten:",
      ],
      lista: [
        "Abrir una conexión por pedido sin pool: se agotan las conexiones. Usá un pool de la aplicación o PgBouncer.",
        "Consultar por una columna sin índice en una tabla grande: Seq Scan en cada pedido. Mirá el plan con EXPLAIN.",
        "Usar float para dinero: acumula errores de redondeo. Usá numeric.",
        "Guardar fechas sin zona horaria (timestamp) cuando hay usuarios en varios países. Preferí timestamptz.",
        "Transacciones largas que quedan abiertas: impiden que el vacuum limpie y bloquean otras. Mantenelas cortas.",
        "Armar consultas pegando texto del usuario: inyección SQL. Usá parámetros siempre.",
        "Cambiar el esquema en producción con una operación que bloquea la tabla entera, sin probar antes en una copia.",
      ],
      codigo: [
        code`
-- ver quién tiene transacciones abiertas hace rato
SELECT pid, state, now() - xact_start AS duracion, left(query, 60)
FROM pg_stat_activity
WHERE xact_start IS NOT NULL
ORDER BY duracion DESC;`,
      ],
    },
    {
      heading: "Dónde conviene usarlo y dónde no",
      parrafos: [
        "PostgreSQL es una elección muy segura para la mayoría de las aplicaciones:",
      ],
      tabla: {
        cabeza: ["Caso", "¿PostgreSQL?", "Por qué"],
        filas: [
          ["Aplicaciones web y de negocio", "Sí", "Integridad, transacciones y consultas potentes."],
          ["Datos mezclados: tablas y documentos JSON", "Sí", "jsonb se indexa y se consulta con eficiencia."],
          ["Búsqueda geográfica o vectorial", "Sí", "PostGIS y pgvector son extensiones muy usadas."],
          ["Informes y análisis moderados", "Sí", "Funciones de ventana, CTE y buen planificador."],
          ["Caché de latencia de microsegundos", "No", "Una base en memoria como Redis es más adecuada."],
          ["Escrituras masivas repartidas en cientos de nodos", "No ideal", "Cassandra o DynamoDB están pensadas para eso."],
          ["Análisis de petabytes", "No", "Una base columnar o un almacén de datos es más adecuado."],
        ],
      },
    },
    {
      heading: "Comparación con alternativas",
      parrafos: [
        "Cuándo conviene otra cosa:",
      ],
      tabla: {
        cabeza: ["Alternativa", "Elegila en vez de PostgreSQL cuando…"],
        filas: [
          ["MySQL o MariaDB", "tu hosting o tu equipo ya los usa; para lo básico son equivalentes."],
          ["SQLite", "la aplicación es local o de un solo usuario, sin servidor."],
          ["MongoDB", "los datos son documentos de forma muy variable y no hay relaciones."],
          ["SQL Server u Oracle", "tu empresa ya está en ese ecosistema o necesita su soporte comercial."],
        ],
      },
    },
    {
      heading: "Cómo seguir",
      parrafos: [
        "Usá la pestaña Referencia de este tema para recordar la sintaxis, y practicá con una base propia: cargá datos reales y mirá los planes de tus consultas.",
        "La documentación oficial de PostgreSQL es excepcionalmente buena: el capítulo de tutorial, el de índices y el de rendimiento son una clase completa. Después, la clase de seguridad de datos de esta Biblioteca explica cómo darle permisos mínimos a cada rol.",
      ],
    },
  ],
  fuentes: [
    { texto: "Documentación de PostgreSQL", url: "https://www.postgresql.org/docs/current/" },
    { texto: "Tutorial de PostgreSQL", url: "https://www.postgresql.org/docs/current/tutorial.html" },
    { texto: "Sobre PostgreSQL: historia", url: "https://www.postgresql.org/docs/current/history.html" },
  ],
  revisada: "2026-11-12",
};
