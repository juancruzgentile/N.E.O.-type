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

const GH = "https://github.com/pgvector/pgvector";
export const vectoriales: FuentesTema = {
  version: "pgvector 0.8 sobre PostgreSQL",
  entradas: {
    "Crear la extensión y la columna": [GH],
    "Insertar y leer vectores": [GH],
    "Vecinos más cercanos: ORDER BY": [GH],
    "Elegir la métrica": [GH],
    "Índice HNSW": [GH, "pgvector 0.5"],
    "Índice IVFFlat": [GH],
    "Filtrar por metadatos y similitud": [GH],
    "Búsqueda híbrida: texto y vectores": [GH],
    "Calidad contra velocidad: ef_search y probes": [GH],
    "Medir el recall contra la búsqueda exacta": [GH],
    "halfvec: la mitad de espacio": [GH, "pgvector 0.7"],
    "Guardar fragmentos para RAG": [GH],
  },
};

const PY = "https://docs.python.org/3/library/";
export const asincronia: FuentesTema = {
  version: "Python 3.14 (asyncio) y las herramientas citadas",
  entradas: {
    "async y await": [PY + "asyncio-task.html"],
    "gather: varias tareas a la vez": [PY + "asyncio-task.html#asyncio.gather"],
    "Productor y consumidor con queue.Queue": [PY + "queue.html"],
    "Timeout con wait_for": [PY + "asyncio-task.html#asyncio.wait_for"],
    "Semaphore: limitar la concurrencia": [PY + "asyncio-sync.html#asyncio.Semaphore"],
    "Backoff exponencial con jitter": ["https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/"],
    "Celery: tarea con reintentos": ["https://docs.celeryq.dev/en/stable/userguide/tasks.html#retrying"],
    "Una clave única evita el doble efecto": [P + "sql-insert.html#SQL-ON-CONFLICT"],
    "RabbitMQ: publicar y confirmar con ack": ["https://www.rabbitmq.com/docs/confirms"],
    "Cola de mensajes muertos en RabbitMQ": ["https://www.rabbitmq.com/docs/dlx"],
    "Kafka: grupo de consumidores": ["https://kafka.apache.org/documentation/"],
    "Outbox: publicar sin perder ni duplicar": ["https://microservices.io/patterns/data/transactional-outbox.html"],
  },
};

const AWS = "https://docs.aws.amazon.com/";
const GNU = "https://www.gnu.org/software/";
export const storage: FuentesTema = {
  version: "herramientas de uso general (GNU, AWS CLI, restic, rclone)",
  entradas: {
    "df, du y lsblk: ver el espacio": [GNU + "coreutils/manual/html_node/df-invocation.html"],
    "tar y gzip: empaquetar y comprimir": [GNU + "tar/manual/tar.html"],
    "rsync: copiar solo lo que cambió": ["https://download.samba.org/pub/rsync/rsync.1"],
    "sha256sum: comprobar que no se corrompió": [GNU + "coreutils/manual/html_node/sha2-utilities.html"],
    "S3 con la CLI de AWS: cp y sync": [AWS + "cli/latest/reference/s3/sync.html"],
    "URL prefirmada": [AWS + "cli/latest/reference/s3/presign.html"],
    "Versionado de un bucket": [AWS + "AmazonS3/latest/userguide/Versioning.html"],
    "pg_dump y pg_restore": [P + "app-pgdump.html"],
    "restic: copias cifradas y con historial": ["https://restic.readthedocs.io/en/stable/"],
    "Regla 3-2-1 con rclone": ["https://rclone.org/commands/rclone_sync/"],
    "Object Lock: copias que no se pueden borrar": [AWS + "AmazonS3/latest/userguide/object-lock.html"],
    "Probar la restauración": [P + "app-pgrestore.html"],
  },
};

export const seguridadDatos: FuentesTema = {
  version: "PostgreSQL 18 (las ideas valen para cualquier base)",
  entradas: {
    "Consulta parametrizada con PREPARE": [P + "sql-prepare.html"],
    "Crear un rol sin privilegios de más": [P + "sql-createrole.html"],
    "GRANT: solo lo necesario": [P + "sql-grant.html"],
    "REVOKE: quitar lo que viene por defecto": [P + "sql-revoke.html"],
    "Hash de contraseñas con pgcrypto": [P + "pgcrypto.html"],
    "Seguridad a nivel de fila": [P + "ddl-rowsecurity.html"],
    "Una vista que oculta columnas": [P + "sql-createview.html"],
    "Cifrar una columna con pgp_sym_encrypt": [P + "pgcrypto.html#PGCRYPTO-PGP-ENC-FUNCS"],
    "Conexión cifrada y verificada": [P + "libpq-ssl.html"],
    "Registrar los cambios con un trigger": [P + "plpgsql-trigger.html"],
    "pg_hba.conf: quién puede conectarse": [P + "auth-pg-hba-conf.html"],
    "Limitar el daño de una consulta o un rol": [P + "runtime-config-client.html#GUC-STATEMENT-TIMEOUT"],
  },
};
