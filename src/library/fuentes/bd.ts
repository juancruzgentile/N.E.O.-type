import type { FuentesTema } from "./tipos";

const P = "https://www.postgresql.org/docs/current/";
const M = "https://www.mongodb.com/docs/manual/";
const R = "https://redis.io/docs/latest/";

export const elegirBd: FuentesTema = {
  version: "conceptos generales (ejemplos con PostgreSQL, MongoDB y Redis)",
  entradas: {
    "Relacional: tablas y claves": [P + "ddl-constraints.html"],
    "Documento: todo junto en un JSON": [M + "data-modeling/"],
    "Clave-valor: acceso por clave": [R + "develop/data-types/strings/"],
    "ACID: todo o nada": [P + "tutorial-transactions.html"],
    "Consistencia fuerte o eventual": [P + "runtime-config-wal.html#GUC-SYNCHRONOUS-COMMIT"],
    "Índices: cuándo ayudan": [P + "indexes-intro.html"],
    "Columnas anchas: Cassandra": ["https://cassandra.apache.org/doc/latest/cassandra/developing/cql/ddl.html"],
    "Grafo: Cypher en Neo4j": ["https://neo4j.com/docs/cypher-manual/current/"],
    "Series de tiempo: agrupar por intervalos": [P + "functions-datetime.html#FUNCTIONS-DATETIME-TRUNC"],
    "Desnormalizar con una vista materializada": [P + "sql-creatematerializedview.html"],
    "Replicación: copiar datos a otra base": [P + "logical-replication.html"],
    "Partición por hash: la idea del sharding": [P + "ddl-partitioning.html"],
  },
};

export const postgresql: FuentesTema = {
  version: "PostgreSQL 18",
  entradas: {
    "psql: conectar y explorar": [P + "app-psql.html"],
    "Tipos útiles": [P + "datatype.html"],
    "jsonb: consultar documentos": [P + "datatype-json.html"],
    "Índices: B-tree, GIN y parciales": [P + "indexes-types.html"],
    "SELECT FOR UPDATE SKIP LOCKED": [P + "sql-select.html#SQL-FOR-UPDATE-SHARE"],
    "EXPLAIN ANALYZE": [P + "using-explain.html"],
    "VACUUM y autovacuum": [P + "routine-vacuuming.html"],
    "Particionado por rango": [P + "ddl-partitioning.html"],
    "RETURNING y UPSERT": [P + "sql-insert.html#SQL-ON-CONFLICT"],
    "Crear roles y dar permisos": [P + "sql-grant.html"],
    "Búsqueda de texto completo": [P + "textsearch-intro.html"],
    "DISTINCT ON: el último de cada grupo": [P + "sql-select.html#SQL-DISTINCT"],
  },
};

export const mongodb: FuentesTema = {
  version: "MongoDB 8",
  entradas: {
    "mongosh: conectar y explorar": ["https://www.mongodb.com/docs/mongodb-shell/"],
    "insertOne e insertMany": [M + "reference/method/db.collection.insertOne/"],
    "find: filtros y proyección": [M + "reference/method/db.collection.find/"],
    "updateOne: $set, $inc y $push": [M + "reference/method/db.collection.updateOne/"],
    "Embeber o referenciar": [M + "data-modeling/"],
    "createIndex y explain": [M + "indexes/"],
    "aggregate: $match, $group, $sort": [M + "aggregation/"],
    "Transacciones": [M + "core/transactions/"],
    "deleteOne y deleteMany": [M + "reference/method/db.collection.deleteOne/"],
    "Arreglos: $elemMatch y $in": [M + "reference/operator/query/elemMatch/"],
    "Índices TTL y parciales": [M + "core/index-ttl/"],
    "Validación con $jsonSchema": [M + "core/schema-validation/"],
  },
};

export const redis: FuentesTema = {
  version: "Redis 8",
  entradas: {
    "SET, GET y EXPIRE": [R + "commands/set/"],
    "INCR: contadores": [R + "commands/incr/"],
    "Listas y conjuntos": [R + "develop/data-types/lists/"],
    "Hashes: HSET y HGETALL": [R + "develop/data-types/hashes/"],
    "Sorted sets: rankings": [R + "develop/data-types/sorted-sets/"],
    "Cache-aside con vencimiento": [R + "commands/expire/"],
    "Streams: XADD y XREADGROUP": [R + "develop/data-types/streams/"],
    "Persistencia: RDB y AOF": [R + "operate/oss_and_stack/management/persistence/"],
    "MSET, MGET y EXISTS": [R + "commands/mget/"],
    "Pub/Sub: PUBLISH y SUBSCRIBE": [R + "develop/pubsub/"],
    "Transacciones: MULTI y WATCH": [R + "develop/using-commands/transactions/"],
    "Scripts en Lua con EVAL": [R + "develop/programmability/eval-intro/"],
  },
};
