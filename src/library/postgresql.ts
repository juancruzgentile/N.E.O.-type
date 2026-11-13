import { type Topic, a, b, code, m } from "./types";
import { clasePostgresql } from "./clases/postgresql";

export const postgresql: Topic = {
  id: "postgresql",
  name: "PostgreSQL",
  group: "Bases de datos",
  emblem: null,
  badge: "PG",
  color: "#6a9fd8",
  hl: "sql",
  summary:
    "PostgreSQL es la base de datos relacional de código abierto más completa: transacciones ACID, índices de varios tipos, JSON, particionado, extensiones (como pgvector) y un planificador de consultas muy bueno. " +
    "Acá están las piezas que la distinguen de lo básico de SQL: tipos, jsonb, índices, bloqueos, EXPLAIN y mantenimiento.",
  facts: [
    { label: "Cliente", value: "psql" },
    { label: "Puerto", value: "5432" },
    { label: "Versión de referencia", value: "PostgreSQL 18" },
    { label: "Extensiones", value: "pgvector · PostGIS · pg_trgm" },
  ],
  workflow: [
    { title: "Un rol por aplicación", text: "No uses el superusuario postgres desde la aplicación. Creá un rol con solo los permisos que necesita." },
    { title: "Migraciones versionadas", text: "Cada cambio de esquema es un archivo aplicado en orden (con Flyway, Alembic, Prisma u otra herramienta). Nunca cambies producción a mano." },
    { title: "Medí con EXPLAIN ANALYZE", text: "Una consulta lenta casi siempre se explica mirando el plan: recorrido completo, falta de índice o estadísticas viejas." },
    { title: "Copias de seguridad probadas", text: "Hacé copias automáticas y probá restaurarlas. Una copia que nunca restauraste es una suposición." },
    { title: "Dejá trabajar al autovacuum", text: "No lo desactives. Las tablas con muchas actualizaciones necesitan limpieza para no inflarse." },
  ],
  entries: [
    b("Conectar", "psql: conectar y explorar", "El cliente de línea de comandos. Los comandos que empiezan con barra invertida son de psql, no de SQL.", code`
psql -h localhost -U app -d tienda

\l          -- lista las bases de datos
\c tienda   -- cambia de base
\dt         -- lista las tablas
\d pedidos  -- describe una tabla
\du         -- lista los roles
\q          -- salir`, "psql consola cliente terminal conectar"),
    b("Tipos", "Tipos útiles", "uuid para identificadores, timestamptz para fechas (guarda el instante, no la zona), numeric para dinero y jsonb para datos flexibles. Evitá float para dinero.", code`
CREATE TABLE pedidos (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creado    timestamptz NOT NULL DEFAULT now(),
  total     numeric(12, 2) NOT NULL CHECK (total >= 0),
  etiquetas text[],
  extra     jsonb
);`, "tipos uuid timestamptz numeric jsonb array fecha dinero"),
    m("JSON", "jsonb: consultar documentos", "jsonb guarda JSON en binario, se puede indexar y consultar. -> devuelve JSON, ->> devuelve texto y @> pregunta si contiene.", code`
SELECT extra->>'canal' AS canal
FROM pedidos
WHERE extra @> '{"pago": "tarjeta"}';

CREATE INDEX idx_pedidos_extra ON pedidos USING gin (extra);`, "json jsonb documento gin contiene"),
    m("Índices", "Índices: B-tree, GIN y parciales", "B-tree es el de siempre (igualdad y rangos), GIN sirve para jsonb, arreglos y texto completo, y uno parcial indexa solo las filas que importan.", code`
CREATE INDEX idx_pedidos_creado ON pedidos (creado);                   -- B-tree
CREATE INDEX idx_pedidos_etiq ON pedidos USING gin (etiquetas);        -- GIN
CREATE INDEX idx_pendientes ON pedidos (creado) WHERE estado = 'pendiente';   -- parcial`, "indice btree gin parcial rendimiento"),
    m("Concurrencia", "SELECT FOR UPDATE SKIP LOCKED", "Bloquea las filas que lees para que nadie más las tome, y SKIP LOCKED salta las que ya tiene otro. Sirve para una cola de trabajos en la propia base.", code`
BEGIN;
SELECT id, tarea FROM trabajos
WHERE estado = 'pendiente'
ORDER BY id
LIMIT 1
FOR UPDATE SKIP LOCKED;
-- ... procesar y marcar como hecho ...
UPDATE trabajos SET estado = 'hecho' WHERE id = 1;
COMMIT;`, "cola bloqueo lock concurrencia trabajos"),
    a("Rendimiento", "EXPLAIN ANALYZE", "EXPLAIN muestra el plan; con ANALYZE lo ejecuta de verdad y da tiempos y filas reales. BUFFERS suma cuántas páginas leyó.", code`
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM pedidos WHERE creado > now() - interval '7 days';
-- Seq Scan: recorrió toda la tabla. Index Scan: usó un índice.
-- Compará "rows" estimadas con las reales: si difieren mucho, corré ANALYZE.`, "explain analyze plan consulta lenta buffers"),
    a("Mantenimiento", "VACUUM y autovacuum", "PostgreSQL no borra en el lugar: una fila modificada deja la versión vieja hasta que VACUUM la limpia. El autovacuum lo hace solo; ANALYZE actualiza las estadísticas del planificador.", code`
VACUUM (ANALYZE) pedidos;

SELECT relname, n_dead_tup, last_autovacuum
FROM pg_stat_user_tables
ORDER BY n_dead_tup DESC LIMIT 5;`, "vacuum autovacuum mantenimiento bloat analyze"),
    a("Escala", "Particionado por rango", "Divide una tabla enorme en partes (por ejemplo, por mes). Las consultas que filtran por fecha leen solo las partes necesarias y borrar datos viejos es soltar una partición.", code`
CREATE TABLE eventos (
  id      bigint GENERATED ALWAYS AS IDENTITY,
  creado  timestamptz NOT NULL,
  dato    jsonb
) PARTITION BY RANGE (creado);

CREATE TABLE eventos_2026_11 PARTITION OF eventos
  FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');`, "particion particionado rango tabla grande"),
    b("Consultas", "RETURNING y UPSERT", "INSERT puede devolver lo que insertó (RETURNING) y resolver un conflicto de clave con ON CONFLICT: insertar si no existe, actualizar si existe.", code`
INSERT INTO visitas (pagina, total)
VALUES ('/inicio', 1)
ON CONFLICT (pagina) DO UPDATE SET total = visitas.total + 1
RETURNING pagina, total;`, "upsert on conflict returning insertar actualizar"),
    b("Seguridad", "Crear roles y dar permisos", "Un rol es un usuario o un grupo. La aplicación debe usar uno con los permisos justos, no el superusuario.", code`
CREATE ROLE app LOGIN PASSWORD 'cambiame';
GRANT CONNECT ON DATABASE tienda TO app;
GRANT USAGE ON SCHEMA public TO app;
GRANT SELECT, INSERT, UPDATE ON pedidos TO app;
REVOKE DELETE ON pedidos FROM app;`, "rol usuario grant revoke permisos privilegios"),
    m("Consultas", "Búsqueda de texto completo", "tsvector normaliza el texto (quita palabras vacías y raíces) y tsquery lo busca. Con un índice GIN es rápida.", code`
SELECT titulo
FROM articulos
WHERE to_tsvector('spanish', titulo || ' ' || cuerpo) @@ plainto_tsquery('spanish', 'bases de datos');

CREATE INDEX idx_articulos_fts ON articulos
  USING gin (to_tsvector('spanish', titulo || ' ' || cuerpo));`, "texto completo busqueda tsvector tsquery fts"),
    m("Consultas", "DISTINCT ON: el último de cada grupo", "DISTINCT ON se queda con la primera fila de cada grupo según el orden indicado. Sirve para traer el último pedido de cada cliente.", code`
SELECT DISTINCT ON (cliente_id) cliente_id, id, creado, total
FROM pedidos
ORDER BY cliente_id, creado DESC;`, "distinct on ultimo grupo primero cada"),
  ],
  clase: clasePostgresql,
};
