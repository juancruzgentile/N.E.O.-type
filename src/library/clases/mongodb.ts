import { type Clase, code } from "../types";

export const claseMongodb: Clase = {
  titulo: "MongoDB y las bases de documentos: datos que viajan juntos",
  bajada:
    "Qué es una base documental, cómo piensa MongoDB, tu primera colección, el modelado que lo hace funcionar bien o mal, " +
    "los errores típicos y cuándo conviene elegirla (y cuándo no).",
  secciones: [
    {
      heading: "Qué es y qué problema resuelve",
      parrafos: [
        "MongoDB es una base de datos NoSQL de documentos. En vez de tablas con filas y columnas, guarda documentos parecidos a JSON, agrupados en colecciones. Cada documento puede tener campos distintos y contener arreglos y otros documentos anidados. Se usa para catálogos de productos, contenido, perfiles de usuario, registros y aplicaciones que cambian de forma rápido.",
        "El problema que resuelve es la distancia entre cómo la aplicación ve los datos (objetos anidados) y cómo los guarda una base relacional (tablas separadas que se unen). En MongoDB, un pedido con sus productos puede ser un solo documento: se lee y se escribe de una vez, sin uniones. Y como no exige un esquema fijo, agregar un campo nuevo no obliga a migrar la tabla entera.",
      ],
    },
    {
      heading: "Historia corta",
      parrafos: [
        "Lo creó la empresa 10gen (hoy MongoDB Inc.) y salió en 2009, en plena ola de bases NoSQL. El nombre viene de \"humongous\" (enorme). Ganó popularidad porque era muy fácil de empezar a usar con JavaScript y porque prometía escalar repartiendo los datos en muchas máquinas (sharding).",
        "Las primeras versiones tuvieron críticas por su durabilidad y por la falta de transacciones. Con el tiempo maduró: el motor WiredTiger mejoró el rendimiento, y las transacciones con varios documentos llegaron en la versión 4.0 (2018). Hoy ofrece también una versión gestionada en la nube (Atlas), búsqueda de texto y búsqueda vectorial.",
      ],
    },
    {
      heading: "Cómo funciona por dentro",
      parrafos: [
        "Los documentos se guardan en formato BSON, una versión binaria de JSON que agrega más tipos (fechas, enteros de 64 bits, ObjectId). Cada uno tiene un campo _id único, con índice automático. Un documento puede pesar hasta 16 MB. El motor de almacenamiento, WiredTiger, usa árboles B, compresión y un registro previo a las escrituras para ser durable.",
        "Para tener alta disponibilidad se usa un conjunto de réplicas: un nodo primario recibe las escrituras y otros secundarios las copian; si el primario cae, se elige otro. Para repartir datos entre servidores se usa sharding con una clave de partición. Las operaciones sobre un documento son atómicas, y por eso un buen modelo tiende a agrupar lo que cambia junto en un solo documento.",
      ],
    },
    {
      heading: "Tu primera colección, paso a paso",
      parrafos: [
        "Con MongoDB instalado (o un clúster gratuito en Atlas), abrí mongosh y probá.",
      ],
      codigo: [
        code`
use biblioteca

db.libros.insertMany([
  { titulo: "Dune", autor: "Herbert", paginas: 600, etiquetas: ["ficcion", "clasico"] },
  { titulo: "Emma", autor: "Austen", paginas: 300 },
])

db.libros.find({ paginas: { $gt: 250 } }, { titulo: 1, _id: 0 })

db.libros.updateOne({ titulo: "Emma" }, { $set: { leido: true } })

db.libros.createIndex({ autor: 1 })`,
      ],
    },
    {
      heading: "Qué hace cada parte",
      parrafos: [
        "use biblioteca cambia a una base que se crea cuando guardás el primer dato. insertMany crea la colección libros y guarda dos documentos con formas distintas: el primero tiene un arreglo etiquetas y el segundo no, y a MongoDB no le molesta. Cada uno recibe un _id automático.",
        "find recibe un filtro (los operadores comienzan con $) y una proyección que elige qué campos mostrar. updateOne con $set cambia solo ese campo sin reemplazar el documento. Y createIndex crea un índice por autor para que las búsquedas por ese campo no recorran toda la colección.",
      ],
    },
    {
      heading: "El modelado: la parte que importa",
      parrafos: [
        "En una base relacional modelás los datos según su naturaleza y después pensás las consultas. En MongoDB se hace al revés: modelás según cómo los vas a leer. Hay dos herramientas básicas. Embeber guarda un dato dentro de otro; es ideal para lo que se lee siempre junto y es acotado, como las direcciones de un cliente. Referenciar guarda el identificador del otro documento; conviene cuando el dato crece sin límite (los comentarios de un artículo viral) o lo comparten muchos documentos.",
        "Una regla práctica: embebé \"uno a pocos\", referenciá \"uno a muchos\" y \"muchos a muchos\". Y recordá que si guardás una copia de un dato en varios lugares (desnormalizar) ganás velocidad de lectura, pero tenés que mantener las copias al día.",
      ],
      codigo: [
        code`
// uno a pocos: embebido
{ _id: 1, nombre: "Ana", direcciones: [{ calle: "Sol 123" }, { calle: "Luna 45" }] }

// uno a muchos: referenciado
{ _id: 100, articulo: "Dune", autor: "Herbert" }
{ _id: 1, articuloId: 100, usuario: "Ana", texto: "Genial" }   // comentario

db.comentarios.find({ articuloId: 100 }).sort({ _id: -1 }).limit(20)`,
      ],
    },
    {
      heading: "Errores que comete casi todo el mundo",
      parrafos: [
        "Los que más se repiten:",
      ],
      lista: [
        "Tratarla como una base relacional: normalizar todo y unir con $lookup en cada consulta. Se pierde la ventaja del documento.",
        "Arreglos que crecen sin límite dentro de un documento: llegan al límite de 16 MB y se vuelven lentos.",
        "No crear índices: cada find recorre toda la colección. Mirá explain.",
        "Confundir actualizar con reemplazar: updateOne exige operadores como $set (sin ellos da error) y replaceOne pisa el documento entero. Con un filtro equivocado, cualquiera de los dos cambia el documento que no era.",
        "Exponer el puerto 27017 sin autenticación: es una de las causas más conocidas de filtraciones de datos.",
        "Creer que \"sin esquema\" significa \"sin estructura\": sin validación, los campos mal escritos se acumulan y los datos se vuelven inconsistentes.",
      ],
      codigo: [
        code`
// validación de esquema en la colección
db.createCollection("usuarios", {
  validator: {
    $jsonSchema: {
      required: ["email"],
      properties: {
        email: { bsonType: "string" },
        edad: { bsonType: "int", minimum: 0 },
      },
    },
  },
})`,
      ],
    },
    {
      heading: "Dónde conviene usarlo y dónde no",
      parrafos: [
        "MongoDB brilla con datos que viajan juntos y cambian de forma:",
      ],
      tabla: {
        cabeza: ["Caso", "¿MongoDB?", "Por qué"],
        filas: [
          ["Catálogos de productos con atributos variables", "Sí", "Cada producto puede tener campos distintos sin migraciones."],
          ["Contenido, perfiles y configuraciones", "Sí", "Se lee y se guarda el documento entero."],
          ["Prototipos y datos que cambian de forma rápido", "Sí", "No hay que definir el esquema de antemano."],
          ["Registros y eventos en grandes volúmenes", "Sí", "Con sharding reparte la carga."],
          ["Datos muy relacionados con muchas uniones", "No ideal", "Una base relacional resuelve mejor los JOIN y la integridad."],
          ["Transacciones financieras complejas con muchas tablas", "Con cuidado", "Existen, pero el modelo relacional las trata con más naturalidad."],
        ],
      },
    },
    {
      heading: "Comparación con alternativas",
      parrafos: [
        "Cuándo conviene otra cosa:",
      ],
      tabla: {
        cabeza: ["Alternativa", "Elegila en vez de MongoDB cuando…"],
        filas: [
          ["PostgreSQL con jsonb", "querés un solo motor para datos relacionales y semiestructurados."],
          ["DynamoDB o Cassandra", "necesitás una escala de escrituras muy grande con acceso por clave."],
          ["Redis", "el dato es de acceso ultrarrápido por clave, como una caché."],
          ["Elasticsearch", "el centro es la búsqueda de texto y el análisis de registros."],
        ],
      },
    },
    {
      heading: "Cómo seguir",
      parrafos: [
        "Usá la pestaña Referencia de este tema para recordar los comandos, y practicá con un clúster gratuito de Atlas o un contenedor local. Cargá datos de tu propio proyecto y modelalos de las dos maneras (embebida y referenciada) para ver la diferencia en las consultas.",
        "La documentación oficial incluye una guía de modelado de datos con patrones y anti-patrones, que es lo más valioso para aprender. Antes de publicar, repasá la lista de verificación de seguridad.",
      ],
    },
  ],
  fuentes: [
    { texto: "Manual de MongoDB", url: "https://www.mongodb.com/docs/manual/" },
    { texto: "Modelado de datos", url: "https://www.mongodb.com/docs/manual/data-modeling/" },
    { texto: "Lista de verificación de seguridad", url: "https://www.mongodb.com/docs/manual/administration/security-checklist/" },
  ],
  revisada: "2026-11-12",
};
