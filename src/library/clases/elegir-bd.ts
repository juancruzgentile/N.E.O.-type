import { type Clase, code } from "../types";

export const claseElegirBd: Clase = {
  titulo: "Elegir una base de datos: modelos, garantías y cómo decidir",
  bajada:
    "Hay decenas de bases de datos y casi todas son buenas en algo. Esta clase explica por qué existen tantas, qué cambia entre un modelo y otro, " +
    "qué prometen ACID y CAP y, sobre todo, cómo decidir sin dejarte llevar por la moda.",
  secciones: [
    {
      heading: "Qué es una base de datos y por qué hay tantas",
      parrafos: [
        "Una base de datos es un programa que guarda información de forma durable y permite consultarla y modificarla de manera ordenada y segura, incluso con muchos usuarios a la vez. Podrías guardar todo en archivos, pero tendrías que resolver vos las búsquedas rápidas, los cambios simultáneos, los cortes de luz a mitad de una escritura y la integridad de los datos. La base de datos resuelve todo eso una sola vez.",
        "Hay muchas porque guardar datos tiene tensiones que no se pueden resolver todas a la vez: consultas flexibles contra velocidad, garantías fuertes contra capacidad de crecer en muchas máquinas, estructura rígida contra libertad de cambiar. Cada base elige un equilibrio distinto, y por eso se parecen a herramientas de un taller, no a marcas de lo mismo.",
      ],
    },
    {
      heading: "Historia corta",
      parrafos: [
        "En los años sesenta, las bases eran jerárquicas o de red: los datos se enlazaban con punteros y cada consulta dependía de cómo estaban guardados. En 1970, Edgar Codd propuso el modelo relacional: tablas, claves y un lenguaje declarativo, sin depender de la forma física. Durante décadas fue casi el único camino, con Oracle, DB2, MySQL y PostgreSQL.",
        "A partir de los años dos mil, las empresas de internet tuvieron volúmenes y requisitos que las bases relacionales de entonces no cubrían bien: millones de usuarios, datos con formas variables, necesidad de repartir la carga en muchas máquinas. Surgieron bases como Cassandra, MongoDB y Redis, agrupadas bajo la etiqueta NoSQL (\"no solo SQL\"). Hoy la frontera es difusa: las relacionales guardan JSON y escalan mejor, y varias NoSQL ofrecen transacciones y consultas parecidas a SQL.",
      ],
    },
    {
      heading: "Cómo guarda los datos una base por dentro",
      parrafos: [
        "Casi todas comparten dos ideas. La primera es el registro de escrituras anticipado (WAL): antes de modificar los datos, la base anota el cambio en un registro secuencial. Si el servidor se corta, al arrancar relee ese registro y deja todo consistente. Es lo que hace durable una transacción confirmada.",
        "La segunda es cómo se organizan los datos en disco para buscarlos rápido. Las bases relacionales clásicas (PostgreSQL, MySQL) usan árboles B: estructuras ordenadas que encuentran una clave en pocas lecturas y funcionan bien para lecturas y escrituras mezcladas. Otras (Cassandra, RocksDB) usan árboles LSM: acumulan las escrituras en memoria y las vuelcan ordenadas en bloque, lo que las hace muy rápidas para escribir, a cambio de trabajo de fondo para compactar. Redis guarda todo en memoria, por eso responde en microsegundos, y opcionalmente lo persiste.",
      ],
    },
    {
      heading: "Los modelos principales",
      parrafos: [
        "Mirá los mismos datos, pedidos de clientes, en tres modelos distintos:",
      ],
      lista: [
        "Relacional (PostgreSQL, MySQL, SQLite): tablas con filas y columnas, relacionadas por claves. Muy buena para datos con estructura y para consultas que combinan información.",
        "Documento (MongoDB): cada registro es un documento JSON anidado. Cómoda cuando los datos se leen y escriben juntos y su forma varía.",
        "Clave-valor (Redis, DynamoDB): un diccionario. Acceso muy rápido por clave, ideal para cachés y sesiones.",
        "Columnas anchas (Cassandra): pensadas para escrituras masivas repartidas en muchas máquinas.",
        "Grafo (Neo4j): nodos y relaciones; brillan en recorridos como \"amigos de amigos\".",
        "Series de tiempo (TimescaleDB, InfluxDB): datos con marca de tiempo, como métricas y sensores.",
        "Vectorial (pgvector, bases dedicadas): buscan por similitud entre embeddings, la base de la búsqueda semántica y de RAG.",
      ],
      codigo: [
        code`
-- Relacional: cada dato en un solo lugar, se une al consultar
SELECT c.nombre, SUM(p.total)
FROM clientes c JOIN pedidos p ON p.cliente_id = c.id
GROUP BY c.nombre;

-- Documento: el pedido entero en un solo documento
-- { "_id": 1, "cliente": { "id": 7, "nombre": "Ana" }, "items": [...], "total": 50 }

-- Clave-valor: solo se lee por clave
-- GET pedido:1`,
      ],
    },
    {
      heading: "ACID, CAP y la \"C\" que no es la misma",
      parrafos: [
        "ACID describe las garantías de una transacción: atómica (se aplica entera o nada), consistente (respeta las reglas del esquema, como claves y restricciones), aislada (otras transacciones no la ven a medias) y durable (lo confirmado sobrevive a un corte). Es lo que necesitás para dinero, inventario y reservas.",
        "El teorema CAP habla de sistemas distribuidos: ante una partición de red (algunas máquinas no se pueden comunicar), hay que elegir entre consistencia (todos ven el mismo dato, aunque algunas peticiones se rechacen) y disponibilidad (siempre se responde, aunque el dato pueda estar desactualizado). Muchas bases NoSQL eligen disponibilidad con consistencia eventual: las réplicas convergen con el tiempo.",
        "Cuidado con una confusión muy común: la \"C\" de ACID y la \"C\" de CAP son cosas distintas. En ACID significa que se respetan las reglas de integridad de los datos; en CAP, que todas las copias coinciden. Y el teorema solo aplica cuando hay una partición: el extenso PACELC agrega que, incluso sin falla, hay una disyuntiva entre latencia y consistencia.",
      ],
      codigo: [
        code`
BEGIN;
UPDATE cuentas SET saldo = saldo - 100 WHERE id = 1;
UPDATE cuentas SET saldo = saldo + 100 WHERE id = 2;
COMMIT;   -- las dos o ninguna

SET synchronous_commit = on;   -- el commit espera a la réplica: más consistente, más lento`,
      ],
    },
    {
      heading: "Cómo decidir",
      parrafos: [
        "Un método simple: anotá cómo se van a leer y escribir los datos, y recién después mirá las herramientas. Estas preguntas ordenan la decisión:",
      ],
      lista: [
        "¿Hay relaciones entre los datos y consultas que los combinan? Relacional.",
        "¿Cada entidad se lee y se escribe entera, y su forma cambia? Documento.",
        "¿Se accede siempre por una clave conocida y se necesita velocidad extrema? Clave-valor.",
        "¿Los errores en los datos cuestan dinero? Elegí transacciones ACID.",
        "¿Cuánto vas a crecer de verdad? Una base relacional en un servidor bien dimensionado atiende mucho más de lo que se cree.",
        "¿Quién la va a operar? Una base que tu equipo no sabe respaldar ni monitorear es un riesgo.",
      ],
      tabla: {
        cabeza: ["Necesidad", "Opción habitual"],
        filas: [
          ["Datos de una aplicación con usuarios, pedidos y pagos", "PostgreSQL o MySQL"],
          ["Documentos con forma variable, catálogos, contenido", "MongoDB (o jsonb en PostgreSQL)"],
          ["Caché, sesiones, contadores, rankings, colas simples", "Redis"],
          ["Millones de escrituras por segundo repartidas", "Cassandra o DynamoDB"],
          ["Relaciones profundas (recomendaciones, fraude)", "Neo4j u otra base de grafos"],
          ["Métricas y sensores", "TimescaleDB o InfluxDB"],
          ["Búsqueda por significado (RAG)", "pgvector o una base vectorial"],
          ["Un archivo local sin servidor", "SQLite"],
        ],
      },
    },
    {
      heading: "Errores que comete casi todo el mundo",
      parrafos: [
        "Los que más se repiten al elegir:",
      ],
      lista: [
        "Elegir por moda o por el currículum, y no por el problema: la base \"más escalable\" suele ser la menos cómoda para el 95% de los proyectos.",
        "Elegir una base sin transacciones para datos críticos y escribir a mano la lógica de consistencia: es más difícil de lo que parece.",
        "Usar la base de documentos como si fuera relacional, o al revés: se pierde lo bueno de cada una.",
        "Guardar archivos grandes (imágenes, videos) dentro de la base: usá almacenamiento de objetos y guardá solo la referencia.",
        "Sumar cinco bases \"porque cada una es la mejor en lo suyo\": cada una agrega copias de seguridad, monitoreo y fallas nuevas.",
        "No pensar en los respaldos y la recuperación hasta que hace falta.",
      ],
    },
    {
      heading: "Dónde conviene una sola base y dónde varias",
      parrafos: [
        "Combinar bases (a veces llamado persistencia políglota) es legítimo cuando cada una cumple un papel claro:",
      ],
      tabla: {
        cabeza: ["Situación", "¿Varias bases?", "Por qué"],
        filas: [
          ["Aplicación nueva, equipo chico", "No", "Una sola base relacional resuelve casi todo; menos piezas, menos fallas."],
          ["Datos críticos + caché de lecturas frecuentes", "Sí", "PostgreSQL como fuente de verdad y Redis como caché con vencimiento."],
          ["Datos de aplicación + búsqueda por similitud", "A veces", "pgvector evita una base extra hasta que el volumen lo exija."],
          ["Aplicación + métricas de alto volumen", "Sí", "Las métricas con marca de tiempo van mejor en una base de series de tiempo."],
          ["Muchos equipos con necesidades muy distintas", "Sí", "Cada servicio elige lo que mejor encaja, con costo de operación."],
        ],
      },
    },
    {
      heading: "Cómo seguir",
      parrafos: [
        "Esta clase es el mapa. En la Biblioteca tenés una clase y una referencia de PostgreSQL a fondo, de MongoDB, de Redis, de bases de datos vectoriales, de procesos asíncronos, de almacenamiento y de seguridad de los datos.",
        "Para profundizar, el libro \"Designing Data-Intensive Applications\", de Martin Kleppmann, es la referencia más recomendada sobre estos temas, y la documentación de PostgreSQL explica con claridad los conceptos de transacciones y de índices.",
      ],
    },
  ],
  fuentes: [
    { texto: "PostgreSQL: transacciones", url: "https://www.postgresql.org/docs/current/tutorial-transactions.html" },
    { texto: "MongoDB: modelado de datos", url: "https://www.mongodb.com/docs/manual/data-modeling/" },
    { texto: "Redis: tipos de datos", url: "https://redis.io/docs/latest/develop/data-types/" },
  ],
  revisada: "2026-11-12",
};
