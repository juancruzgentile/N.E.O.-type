import { type Topic, a, b, code, m } from "./types";
import { claseMongodb } from "./clases/mongodb";

export const mongodb: Topic = {
  id: "mongodb",
  name: "MongoDB",
  group: "Bases de datos",
  emblem: null,
  badge: "MG",
  color: "#4db33d",
  hl: "javascript",
  summary:
    "MongoDB es la base de datos documental más usada: guarda documentos parecidos a JSON (BSON) agrupados en colecciones, sin esquema fijo, y se consulta con un lenguaje de objetos. " +
    "Acá están los comandos de mongosh para guardar, buscar, actualizar, modelar, indexar, agregar y usar transacciones.",
  facts: [
    { label: "Cliente", value: "mongosh" },
    { label: "Puerto", value: "27017" },
    { label: "Formato", value: "documentos BSON en colecciones" },
    { label: "Versión de referencia", value: "MongoDB 8" },
  ],
  workflow: [
    { title: "Modelá según cómo lees", text: "Lo que se consulta junto se guarda junto. Embebé datos que se leen siempre con el documento principal; referenciá los que crecen sin límite o se comparten." },
    { title: "Aunque no haya esquema, validalo", text: "Las reglas de validación de la colección ($jsonSchema) evitan que entren documentos con campos mal escritos o tipos equivocados." },
    { title: "Índices para tus consultas", text: "Sin índice, cada find recorre toda la colección. Creá los índices que usan tus filtros y ordenamientos, y comprobalos con explain." },
    { title: "Cuidado con documentos que crecen", text: "Un documento no puede superar los 16 MB, y un arreglo que crece sin parar es una señal para pasar a una colección aparte." },
    { title: "Acceso con usuario y TLS", text: "Activá la autenticación, usá un usuario con los permisos justos, y nunca expongas el puerto a internet sin protección." },
  ],
  entries: [
    b("Conectar", "mongosh: conectar y explorar", "El shell de MongoDB. use cambia de base (se crea al guardar el primer dato) y db apunta a la base actual.", code`
mongosh "mongodb://localhost:27017"

use tienda
show collections
db.libros.countDocuments()`, "mongosh shell conectar base coleccion"),
    b("CRUD", "insertOne e insertMany", "Guardan documentos en una colección. Si no traen _id, MongoDB crea uno (un ObjectId). La colección se crea sola.", code`
db.libros.insertOne({ titulo: "Dune", autor: "Herbert", paginas: 600 })

db.libros.insertMany([
  { titulo: "Emma", autor: "Austen", paginas: 300 },
  { titulo: "Persuasion", autor: "Austen", paginas: 250 },
])`, "insertar guardar crear documento"),
    b("CRUD", "find: filtros y proyección", "find recibe un filtro y, opcionalmente, qué campos devolver. Los operadores empiezan con $: $gt, $in, $or, $regex…", code`
db.libros.find({ autor: "Austen", paginas: { $gt: 200 } })

// solo algunos campos (1 los incluye, 0 los oculta)
db.libros.find({}, { titulo: 1, _id: 0 }).sort({ titulo: 1 }).limit(5)

db.libros.findOne({ titulo: /^du/i })`, "buscar consultar filtro operadores gt in"),
    m("CRUD", "updateOne: $set, $inc y $push", "Modifica campos concretos con operadores, sin reemplazar el documento entero. Sin operadores da error: para reemplazar el documento entero está replaceOne.", code`
db.libros.updateOne(
  { titulo: "Dune" },
  {
    $set: { leido: true },
    $inc: { prestamos: 1 },
    $push: { resenas: { usuario: "Ana", nota: 5 } },
  }
)

db.libros.updateMany({ autor: "Austen" }, { $set: { clasico: true } })`, "actualizar modificar set inc push operadores"),
    m("Modelado", "Embeber o referenciar", "Embeber guarda el dato dentro del documento (una sola lectura). Referenciar guarda el _id y lo une con $lookup (útil si el dato crece o lo comparten muchos).", code`
// embebido: la dirección es parte del cliente
{ _id: 1, nombre: "Ana", direccion: { calle: "Sol 123", ciudad: "Madrid" } }

// referenciado: el pedido apunta al cliente
{ _id: 10, clienteId: 1, total: 50 }

db.pedidos.aggregate([
  { $lookup: { from: "clientes", localField: "clienteId", foreignField: "_id", as: "cliente" } },
])`, "modelado embeber referenciar lookup relaciones"),
    m("Índices", "createIndex y explain", "Un índice acelera filtros y ordenamientos. Los compuestos siguen el orden de los campos. explain muestra si se usó (IXSCAN) o si recorrió todo (COLLSCAN).", code`
db.libros.createIndex({ autor: 1, paginas: -1 })
db.libros.createIndex({ titulo: 1 }, { unique: true })

db.libros.find({ autor: "Austen" }).explain("executionStats")
// IXSCAN = usó el índice, COLLSCAN = recorrió toda la colección`, "indice index explain unique compuesto"),
    a("Agregación", "aggregate: $match, $group, $sort", "Un pipeline de etapas: cada una transforma los documentos que le llegan. Es el equivalente de WHERE, GROUP BY y ORDER BY juntos.", code`
db.libros.aggregate([
  { $match: { paginas: { $gt: 200 } } },
  { $group: { _id: "$autor", libros: { $sum: 1 }, promedio: { $avg: "$paginas" } } },
  { $sort: { libros: -1 } },
])`, "agregacion pipeline group match sum avg"),
    a("Transacciones", "Transacciones", "MongoDB garantiza que escribir un solo documento es atómico. Para varias escrituras a la vez existen transacciones con sesión (en un conjunto de réplicas).", code`
const sesion = db.getMongo().startSession()
sesion.withTransaction(() => {
  const cuentas = sesion.getDatabase("banco").cuentas
  cuentas.updateOne({ _id: 1 }, { $inc: { saldo: -100 } })
  cuentas.updateOne({ _id: 2 }, { $inc: { saldo: 100 } })
})`, "transaccion sesion atomica varias escrituras"),
    b("CRUD", "deleteOne y deleteMany", "Borran el primer documento que coincide o todos los que coinciden. Un filtro vacío borra todo, así que probalo antes con find.", code`
db.libros.deleteOne({ titulo: "Emma" })

db.libros.find({ paginas: { $lt: 100 } })      // revisá qué va a borrar
db.libros.deleteMany({ paginas: { $lt: 100 } })`, "borrar eliminar delete documento"),
    m("Consultas", "Arreglos: $elemMatch y $in", "$in pregunta si un campo vale alguno de una lista; $elemMatch exige que un mismo elemento del arreglo cumpla todas las condiciones.", code`
db.libros.find({ etiquetas: { $in: ["clasico", "ficcion"] } })

db.libros.find({
  resenas: { $elemMatch: { usuario: "Ana", nota: { $gte: 4 } } },
})`, "arreglo elemmatch in array etiquetas"),
    a("Índices", "Índices TTL y parciales", "Un índice TTL borra solo los documentos cuando pasa el tiempo indicado. Uno parcial indexa solo los documentos que cumplen una condición, y ahorra espacio.", code`
db.sesiones.createIndex({ creada: 1 }, { expireAfterSeconds: 3600 })

db.pedidos.createIndex(
  { cliente: 1 },
  { partialFilterExpression: { estado: "pendiente" } }
)`, "ttl expirar parcial indice sesiones borrar solo"),
    a("Validación", "Validación con $jsonSchema", "Aunque no haya esquema fijo, la colección puede exigir uno: campos obligatorios, tipos y rangos. Los documentos que no cumplen se rechazan.", code`
db.createCollection("usuarios", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email"],
      properties: {
        email: { bsonType: "string", pattern: "@" },
        edad: { bsonType: "int", minimum: 0 },
      },
    },
  },
})`, "validacion esquema jsonschema campos obligatorios tipos"),
  ],
  clase: claseMongodb,
};
