import { type Clase, code } from "../types";

export const claseRedis: Clase = {
  titulo: "Redis: la base de datos en memoria que acelera todo",
  bajada:
    "Qué es Redis, por qué es tan rápido, tu primera sesión con redis-cli, las estructuras que lo hacen versátil (caché, contadores, rankings, colas), " +
    "los errores típicos y cuándo conviene (y cuándo no).",
  secciones: [
    {
      heading: "Qué es y qué problema resuelve",
      parrafos: [
        "Redis (Remote Dictionary Server) es una base de datos de clave-valor que guarda los datos en memoria RAM. A diferencia de un diccionario simple, el valor puede ser una estructura: un texto, una lista, un conjunto, un hash, un conjunto ordenado, un stream. Se usa como caché, para sesiones de usuario, contadores, rankings, limitación de uso, colas de trabajos y mensajería.",
        "El problema que resuelve es la lentitud de ir siempre al disco o a una base relacional para datos que se piden muchísimo y cambian poco. Una consulta a Redis tarda microsegundos; una consulta a una base en disco puede tardar milisegundos. Poner Redis delante, como caché, reduce la carga de la base principal y acelera la aplicación.",
      ],
    },
    {
      heading: "Historia corta",
      parrafos: [
        "Lo creó Salvatore Sanfilippo (antirez) en 2009, porque necesitaba una forma muy rápida de procesar datos de un análisis de visitas web en tiempo real. Se publicó como código abierto y creció junto con las aplicaciones web modernas.",
        "Con los años cambió de licencia más de una vez: pasó de una licencia abierta tradicional a otras restrictivas para los proveedores de nube, y de ahí nació Valkey, una bifurcación mantenida por la Linux Foundation. Redis volvió a ofrecer una licencia de código abierto en versiones recientes. Si vas a usarlo en un producto, comprobá la licencia de la versión que elijas.",
      ],
    },
    {
      heading: "Cómo funciona por dentro",
      parrafos: [
        "La razón de su velocidad es simple: los datos viven en memoria y la mayor parte del trabajo lo hace un solo hilo, que ejecuta un comando completo antes de pasar al siguiente. Eso tiene dos consecuencias muy útiles. Cada comando es atómico: INCR no se pisa aunque lo llamen mil clientes a la vez, sin bloqueos. Y no hay que pensar en concurrencia dentro de un comando. El costo es que un comando lento (como recorrer una lista enorme) frena a todos los demás.",
        "Que esté en memoria no significa que se pierda todo al reiniciar. Hay dos mecanismos de persistencia: RDB (fotos periódicas del contenido) y AOF (un registro de cada escritura que se repite al arrancar). Con ninguno de los dos, Redis es solo una caché. Para alta disponibilidad usa réplicas y Sentinel, y para repartir datos entre máquinas, Redis Cluster.",
      ],
    },
    {
      heading: "Tu primera sesión, paso a paso",
      parrafos: [
        "Con Redis instalado (o con un contenedor), abrí redis-cli y probá.",
      ],
      codigo: [
        code`
SET saludo "hola" EX 60
GET saludo
TTL saludo

INCR visitas
INCR visitas

HSET usuario:1 nombre "Ana" ciudad "Madrid"
HGETALL usuario:1

ZADD ranking 100 "ana" 80 "luis"
ZREVRANGE ranking 0 -1 WITHSCORES`,
      ],
    },
    {
      heading: "Qué hace cada parte",
      parrafos: [
        "SET guarda un texto y EX 60 hace que desaparezca en 60 segundos; TTL te dice cuántos le quedan. INCR crea la clave si no existe y le suma uno, de forma atómica: después de dos llamadas, visitas vale 2. HSET guarda varios campos bajo una clave, como un objeto chico, y HGETALL los devuelve todos.",
        "ZADD agrega elementos con una puntuación a un conjunto ordenado; ZREVRANGE los devuelve de mayor a menor. Redis mantiene el orden por vos, así que un ranking en vivo es una sola estructura con dos comandos.",
      ],
    },
    {
      heading: "Los cinco usos que más se ven",
      parrafos: [
        "Casi todas las aplicaciones que usan Redis lo hacen para alguno de estos:",
      ],
      lista: [
        "Caché (cache-aside): la aplicación mira Redis primero; si no está, lee de la base, guarda con vencimiento y devuelve.",
        "Sesiones: un hash o un texto por sesión, con vencimiento, accesible desde cualquier servidor de la aplicación.",
        "Contadores y límites de uso: INCR más EXPIRE para contar pedidos por minuto de una IP.",
        "Rankings y feeds: conjuntos ordenados con la puntuación como fecha o puntos.",
        "Colas y mensajería: listas, streams con grupos de consumidores y publicación/suscripción (Pub/Sub).",
      ],
      codigo: [
        code`
# cache-aside
GET producto:42
# (si no hay valor, leer de la base de datos y luego:)
SET producto:42 "{...}" EX 300
# (cuando el producto cambia:)
DEL producto:42

# límite de 100 pedidos por minuto
INCR limite:ip:1.2.3.4
EXPIRE limite:ip:1.2.3.4 60`,
      ],
    },
    {
      heading: "Errores que comete casi todo el mundo",
      parrafos: [
        "Los que más se repiten:",
      ],
      lista: [
        "Guardar sin vencimiento: la memoria se llena de datos viejos hasta que Redis rechaza escrituras o desaloja claves sin que lo esperes.",
        "Usar KEYS * en producción: recorre toda la base y la bloquea. Usá SCAN.",
        "Tratarla como la base de datos principal sin persistencia: al reiniciar, sin RDB ni AOF, se pierde todo.",
        "Guardar valores gigantes: un solo valor de varios megabytes frena a todos los clientes mientras se transfiere.",
        "Dejar el puerto 6379 abierto a internet sin contraseña: es una causa conocida de intrusiones. Redis es para redes privadas.",
        "La invalidación de la caché: olvidar borrar o actualizar la clave cuando el dato cambia en la base, y servir datos viejos.",
      ],
      codigo: [
        code`
# MAL: bloquea el servidor mientras recorre todas las claves
KEYS usuario:*

# BIEN: avanza de a pedazos con un cursor
SCAN 0 MATCH usuario:* COUNT 100`,
      ],
    },
    {
      heading: "Dónde conviene usarlo y dónde no",
      parrafos: [
        "Redis es excelente como complemento, y más discutible como base principal:",
      ],
      tabla: {
        cabeza: ["Caso", "¿Redis?", "Por qué"],
        filas: [
          ["Caché de consultas y páginas", "Sí", "Lecturas en microsegundos y vencimiento automático."],
          ["Sesiones de usuario", "Sí", "Se comparten entre servidores y caducan solas."],
          ["Contadores, límites y rankings", "Sí", "Comandos atómicos y estructuras hechas para eso."],
          ["Colas simples y mensajería ligera", "Sí", "Listas, streams y Pub/Sub; para garantías fuertes, un broker dedicado."],
          ["Base de datos principal de datos críticos", "Con cuidado", "La memoria es cara y la persistencia es de menos garantías que en una base relacional."],
          ["Consultas con filtros, uniones y agregaciones", "No", "No tiene un lenguaje de consultas general; usá una base relacional."],
          ["Datos mucho más grandes que la memoria", "No", "Todo debe entrar en RAM."],
        ],
      },
    },
    {
      heading: "Comparación con alternativas",
      parrafos: [
        "Cuándo conviene otra cosa:",
      ],
      tabla: {
        cabeza: ["Alternativa", "Elegila en vez de Redis cuando…"],
        filas: [
          ["Memcached", "solo querés una caché de texto muy simple y multihilo."],
          ["PostgreSQL", "los datos son críticos y se consultan de formas variadas."],
          ["RabbitMQ o Kafka", "necesitás un sistema de mensajes con garantías de entrega y reintentos serios."],
          ["DynamoDB", "querés clave-valor persistente y administrado, sin límite de memoria."],
        ],
      },
    },
    {
      heading: "Cómo seguir",
      parrafos: [
        "Usá la pestaña Referencia de este tema para recordar los comandos, y probá en tu propio proyecto el patrón de caché con una consulta lenta: medí el tiempo antes y después.",
        "La documentación oficial describe cada comando con su complejidad, que es lo que hay que mirar antes de usarlo en producción. Después, la clase de procesos asíncronos de esta Biblioteca explica cuándo usar colas de mensajes con garantías de entrega.",
      ],
    },
  ],
  fuentes: [
    { texto: "Documentación de Redis", url: "https://redis.io/docs/latest/" },
    { texto: "Tipos de datos de Redis", url: "https://redis.io/docs/latest/develop/data-types/" },
    { texto: "Persistencia en Redis", url: "https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/" },
  ],
  revisada: "2026-11-12",
};
