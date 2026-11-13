import { type Topic, a, b, code, m } from "./types";
import { claseElegirBd } from "./clases/elegir-bd";

export const elegirBd: Topic = {
  id: "elegir-bd",
  name: "Elegir una base de datos",
  group: "Bases de datos",
  emblem: null,
  badge: "BD",
  color: "#4fd1c5",
  hl: "sql",
  summary:
    "No hay una base de datos mejor que las demás: hay modelos distintos para problemas distintos. Acá está cómo se ven los mismos datos en una base relacional, " +
    "documental y de clave-valor, qué prometen ACID y CAP, y cuándo ayuda un índice. La clase explica cómo decidir.",
  facts: [
    { label: "Modelos", value: "relacional · documento · clave-valor · columnas · grafo · series de tiempo" },
    { label: "Propiedades", value: "ACID (transacciones) · CAP (sistemas distribuidos)" },
    { label: "Punto de partida", value: "para datos con estructura, una base relacional" },
    { label: "Ejemplos", value: "PostgreSQL · MongoDB · Redis · Cassandra · Neo4j" },
  ],
  workflow: [
    { title: "Empezá por cómo se leen los datos", text: "Antes de elegir, anotá las consultas más frecuentes: por clave, por rango, con uniones, agregaciones. El patrón de acceso decide el modelo." },
    { title: "Una sola base alcanza más seguido de lo que parece", text: "Cada base extra suma instalación, copias de seguridad, monitoreo y fallas nuevas. Sumá otra cuando una necesidad concreta lo justifique." },
    { title: "Los datos importantes, en una base con transacciones", text: "Dinero, pedidos e inventario van en una base que garantice ACID. Las cachés y los contadores pueden vivir en otra." },
    { title: "Probá con tus propios datos", text: "Los números de rendimiento de las publicaciones valen poco: cargá un volumen parecido al real y medí tus consultas." },
  ],
  entries: [
    b("Modelos", "Relacional: tablas y claves", "Los datos se reparten en tablas relacionadas por claves. Cada dato vive en un solo lugar y las uniones (JOIN) lo reúnen al consultar.", code`
CREATE TABLE clientes (
  id     INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL
);
CREATE TABLE pedidos (
  id         INTEGER PRIMARY KEY,
  cliente_id INTEGER NOT NULL REFERENCES clientes (id),
  total      NUMERIC(10, 2) NOT NULL
);

SELECT c.nombre, SUM(p.total) AS gastado
FROM clientes c JOIN pedidos p ON p.cliente_id = c.id
GROUP BY c.nombre;`, "relacional tablas join claves normalizar"),
    b("Modelos", "Documento: todo junto en un JSON", "El pedido se guarda entero, con el cliente y los productos adentro. Se lee de una vez, pero el dato del cliente se repite en cada pedido.", code`
-- MongoDB: una colección "pedidos" con documentos así
{
  "_id": 1,
  "cliente": { "id": 7, "nombre": "Ana" },
  "items": [
    { "producto": "Cuaderno", "cantidad": 2, "precio": 25 }
  ],
  "total": 50
}`, "documento json mongodb embebido nosql"),
    b("Modelos", "Clave-valor: acceso por clave", "Un diccionario gigante: se guarda y se lee por clave, muy rápido, pero no se consulta por el contenido. Típico para cachés, sesiones y contadores.", code`
-- Redis
SET sesion:abc123 "{\"usuario\":7}" EX 3600
GET sesion:abc123
INCR visitas:home`, "clave valor redis cache sesion"),
    m("Propiedades", "ACID: todo o nada", "Una transacción ACID es atómica (se hace entera o nada), consistente (respeta las reglas), aislada (otras no la ven a medias) y durable (lo confirmado no se pierde).", code`
BEGIN;
UPDATE cuentas SET saldo = saldo - 100 WHERE id = 1;
UPDATE cuentas SET saldo = saldo + 100 WHERE id = 2;
COMMIT;   -- si algo falla antes: ROLLBACK y no pasó nada`, "acid transaccion atomica consistente aislada durable"),
    m("Propiedades", "Consistencia fuerte o eventual", "En un sistema distribuido, cuando hay una partición de red hay que elegir entre responder con datos que podrían estar viejos o negarse a responder (teorema CAP). En PostgreSQL se ve al decidir si el commit espera a la réplica.", code`
-- esperar a que la réplica confirme: consistencia fuerte, más latencia
SET synchronous_commit = on;

-- no esperar: más rápido, pero lo último puede perderse si cae el servidor
SET synchronous_commit = off;`, "cap consistencia eventual replica distribuido"),
    m("Rendimiento", "Índices: cuándo ayudan", "Un índice acelera las búsquedas por una columna a cambio de espacio y de escrituras más lentas. Ayuda en lo que filtrás o unís seguido; no en tablas chicas.", code`
CREATE INDEX idx_pedidos_cliente ON pedidos (cliente_id);

EXPLAIN SELECT * FROM pedidos WHERE cliente_id = 7;
-- "Index Scan" = usó el índice; "Seq Scan" = recorrió toda la tabla`, "indice rendimiento explain consulta lenta"),
    b("Modelos", "Columnas anchas: Cassandra", "Pensada para escribir muchísimo repartiendo los datos en muchos servidores. La clave de partición decide dónde vive cada fila, y se diseña la tabla según la consulta.", code`
CREATE TABLE lecturas (
  sensor_id text,
  momento   timestamp,
  valor     double,
  PRIMARY KEY (sensor_id, momento)
) WITH CLUSTERING ORDER BY (momento DESC);

SELECT * FROM lecturas WHERE sensor_id = 's1' LIMIT 10;`, "cassandra columnas anchas cql particion escritura"),
    b("Modelos", "Grafo: Cypher en Neo4j", "Los datos son nodos y relaciones, y la consulta describe un camino. Es natural para preguntas como amigos de amigos, rutas o recomendaciones.", code`
MATCH (a:Persona {nombre: 'Ana'})-[:AMIGO_DE*1..2]-(b:Persona)
RETURN DISTINCT b.nombre;`, "grafo neo4j cypher nodos relaciones recomendaciones"),
    m("Modelos", "Series de tiempo: agrupar por intervalos", "Los datos con marca de tiempo se consultan casi siempre agrupados por hora o por día. En PostgreSQL se hace con date_trunc; las bases especializadas lo optimizan.", code`
SELECT date_trunc('hour', momento) AS hora,
       avg(valor) AS promedio,
       max(valor) AS maximo
FROM metricas
WHERE momento > now() - interval '24 hours'
GROUP BY hora
ORDER BY hora;`, "series tiempo metricas sensores date_trunc intervalos"),
    m("Modelado", "Desnormalizar con una vista materializada", "Una vista materializada guarda el resultado de una consulta cara. Las lecturas son rápidas y se refresca cuando hace falta, a cambio de datos que pueden quedar atrasados.", code`
CREATE MATERIALIZED VIEW ventas_por_dia AS
SELECT date_trunc('day', creado) AS dia, sum(total) AS total
FROM pedidos
GROUP BY 1;

REFRESH MATERIALIZED VIEW ventas_por_dia;`, "desnormalizar vista materializada cache consulta cara"),
    a("Escala", "Replicación: copiar datos a otra base", "Una réplica recibe los cambios del servidor principal: sirve para repartir lecturas y para seguir funcionando si el principal cae. Siempre hay un retraso entre uno y otro.", code`
-- en el servidor principal
CREATE PUBLICATION todo FOR ALL TABLES;

-- en la réplica
CREATE SUBSCRIPTION copia
  CONNECTION 'host=principal dbname=tienda user=repl'
  PUBLICATION todo;`, "replicacion replica logica alta disponibilidad lecturas"),
    a("Escala", "Partición por hash: la idea del sharding", "Para repartir una tabla enorme, la clave de partición decide en qué parte cae cada fila. Con hash, el reparto es parejo; repartir entre servidores distintos es la misma idea.", code`
CREATE TABLE pedidos (
  id         bigint,
  cliente_id bigint NOT NULL,
  total      numeric
) PARTITION BY HASH (cliente_id);

CREATE TABLE pedidos_0 PARTITION OF pedidos FOR VALUES WITH (MODULUS 4, REMAINDER 0);
CREATE TABLE pedidos_1 PARTITION OF pedidos FOR VALUES WITH (MODULUS 4, REMAINDER 1);`, "sharding particion hash reparto escala horizontal"),
  ],
  clase: claseElegirBd,
};
