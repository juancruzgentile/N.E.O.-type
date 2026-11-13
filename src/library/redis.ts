import { type Topic, a, b, code, m } from "./types";
import { claseRedis } from "./clases/redis";

export const redis: Topic = {
  id: "redis",
  name: "Redis",
  group: "Bases de datos",
  emblem: null,
  badge: "RD",
  color: "#e0524d",
  hl: "linux",
  summary:
    "Redis es una base de datos en memoria de clave-valor, con estructuras de datos (textos, listas, conjuntos, hashes, conjuntos ordenados, streams). Responde en microsegundos y se usa como caché, para sesiones, contadores, rankings, colas y mensajería. " +
    "Acá están los comandos de redis-cli por estructura y cómo se persiste.",
  facts: [
    { label: "Cliente", value: "redis-cli" },
    { label: "Puerto", value: "6379" },
    { label: "Modelo", value: "clave → estructura de datos, en memoria" },
    { label: "Versión de referencia", value: "Redis 8" },
  ],
  workflow: [
    { title: "Todo con vencimiento", text: "Los datos de caché llevan siempre un tiempo de vida (EX o EXPIRE). Sin él, la memoria se llena de cosas viejas." },
    { title: "Nombres de clave con estructura", text: "Usá prefijos separados por dos puntos (usuario:7:sesion). Facilita leer, borrar y monitorear por grupo." },
    { title: "La memoria es el límite", text: "Configurá maxmemory y una política de desalojo (por ejemplo allkeys-lru) para que Redis no crezca sin fin." },
    { title: "No uses KEYS * en producción", text: "Recorre toda la base y la bloquea. Usá SCAN, que avanza de a pedazos." },
    { title: "Nunca lo expongas a internet", text: "Redis no está pensado para el acceso público: ponelo en una red privada, con contraseña y ACL." },
  ],
  entries: [
    b("Texto", "SET, GET y EXPIRE", "SET guarda un valor, GET lo lee y EX fija cuántos segundos vive. TTL dice cuánto le queda.", code`
SET sesion:abc "usuario-7" EX 3600
GET sesion:abc
TTL sesion:abc
EXPIRE sesion:abc 600
DEL sesion:abc`, "set get expire ttl vencimiento string"),
    b("Texto", "INCR: contadores", "INCR suma 1 de forma atómica, aunque lo llamen mil clientes a la vez. Sirve para contadores y para limitar la frecuencia de uso.", code`
INCR visitas:home
INCRBY ventas:hoy 25
GET visitas:home

# límite de pedidos por minuto
INCR limite:ip:1.2.3.4
EXPIRE limite:ip:1.2.3.4 60`, "incr contador atomico limite rate"),
    b("Estructuras", "Listas y conjuntos", "Una lista guarda elementos en orden (LPUSH, RPOP, LRANGE). Un conjunto guarda elementos sin repetir (SADD, SISMEMBER, SMEMBERS).", code`
LPUSH cola:correos "a@x.com" "b@x.com"
RPOP cola:correos
LRANGE cola:correos 0 -1

SADD etiquetas:post:1 "redis" "bases"
SISMEMBER etiquetas:post:1 "redis"`, "lista conjunto lpush sadd cola set"),
    m("Estructuras", "Hashes: HSET y HGETALL", "Un hash guarda varios campos bajo una clave, como un objeto chico. Es más compacto que muchas claves sueltas.", code`
HSET usuario:7 nombre "Ana" ciudad "Madrid" visitas 0
HGET usuario:7 nombre
HINCRBY usuario:7 visitas 1
HGETALL usuario:7`, "hash hset hget objeto campos"),
    m("Estructuras", "Sorted sets: rankings", "Un conjunto ordenado guarda elementos con una puntuación y los mantiene ordenados. Ideal para rankings y para ordenar por fecha.", code`
ZADD ranking 120 "ana" 95 "luis" 150 "eva"
ZINCRBY ranking 10 "luis"
ZREVRANGE ranking 0 2 WITHSCORES
ZRANK ranking "ana"`, "ranking zadd sorted set puntuacion"),
    m("Caché", "Cache-aside con vencimiento", "El patrón más usado: la aplicación mira primero en Redis; si no está, lo busca en la base, lo guarda con vencimiento y lo devuelve.", code`
# 1. GET producto:42     -> si hay valor, listo
# 2. si no hay: SELECT en la base de datos
# 3. SET producto:42 "{...}" EX 300
# 4. cuando el producto cambia: DEL producto:42

GET producto:42
SET producto:42 "{\"nombre\":\"Cuaderno\"}" EX 300
DEL producto:42`, "cache aside patron vencimiento invalidar"),
    a("Mensajes", "Streams: XADD y XREADGROUP", "Un stream es un registro de eventos con identificador. Los grupos de consumidores reparten los mensajes entre varios procesos y XACK confirma cada uno.", code`
XADD pedidos * cliente 7 total 50
XGROUP CREATE pedidos workers $ MKSTREAM
XREADGROUP GROUP workers w1 COUNT 1 STREAMS pedidos >
XACK pedidos workers 1700000000000-0`, "stream xadd xreadgroup cola mensajes eventos"),
    a("Persistencia", "Persistencia: RDB y AOF", "RDB guarda fotos periódicas de los datos (compacto, pero se puede perder lo último). AOF anota cada escritura (más seguro, más grande). Se pueden combinar.", code`
# redis.conf
save 900 1          # foto si hubo 1 cambio en 15 minutos
appendonly yes      # registro de cada escritura
appendfsync everysec

maxmemory 512mb
maxmemory-policy allkeys-lru`, "persistencia rdb aof maxmemory lru configuracion"),
    b("Texto", "MSET, MGET y EXISTS", "Guardan y leen varias claves en un solo viaje a la red, que suele ser el mayor costo. EXISTS pregunta si una clave está.", code`
MSET color:a "rojo" color:b "azul"
MGET color:a color:b color:c
EXISTS color:a
DEL color:a color:b`, "mset mget exists varias claves lote"),
    m("Mensajes", "Pub/Sub: PUBLISH y SUBSCRIBE", "Publicación y suscripción: quien publica en un canal lo recibe quien esté suscripto en ese momento. No guarda mensajes: si nadie escucha, se pierden.", code`
# terminal 1
SUBSCRIBE novedades

# terminal 2
PUBLISH novedades "hay stock nuevo"`, "pubsub publish subscribe canal mensajes tiempo real"),
    m("Atomicidad", "Transacciones: MULTI y WATCH", "MULTI y EXEC ejecutan varios comandos juntos, sin que otro cliente se meta en el medio. WATCH cancela la transacción si alguien cambió una clave que vigilabas.", code`
WATCH saldo:7
MULTI
DECRBY saldo:7 100
INCRBY saldo:8 100
EXEC`, "transaccion multi exec watch atomico optimista"),
    a("Scripts", "Scripts en Lua con EVAL", "Un script se ejecuta entero y de forma atómica dentro de Redis. Sirve para lógica que no admite que otro cliente se interponga, como un límite de uso.", code`
EVAL "local n = redis.call('INCR', KEYS[1]) if n == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end return n" 1 limite:ip:1.2.3.4 60`, "lua eval script atomico limite"),
  ],
  clase: claseRedis,
};
