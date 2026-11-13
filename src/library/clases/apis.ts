import { type Clase, code } from "../types";

export const claseApis: Clase = {
  titulo: "APIs: la puerta por la que hablan los programas",
  bajada:
    "Qué es una API web, cómo se consume sin romperse y cómo se diseña una que otros quieran usar: REST, errores, autenticación, " +
    "idempotencia, límites, webhooks y GraphQL.",
  secciones: [
    {
      heading: "Qué es y qué problema resuelve",
      parrafos: [
        "API significa interfaz de programación de aplicaciones: el conjunto de operaciones que un programa ofrece para que otro lo use, sin saber cómo está hecho por dentro. En la web, casi siempre se trata de pedidos HTTP a una dirección, que devuelven datos en formato JSON. Tu aplicación móvil le habla a una API; tu front-end también; un sistema de pagos expone una API; y un asistente de inteligencia artificial se consume a través de una.",
        "El problema que resuelve es el de la separación y la integración. Con una API, el front-end y el back-end se desarrollan por separado, varios clientes (web, móvil, otros sistemas) usan la misma lógica, y las empresas pueden ofrecer sus funciones a otras sin compartir su código ni sus bases de datos. Una API bien diseñada es un contrato: lo que prometés no se rompe.",
      ],
    },
    {
      heading: "Historia corta",
      parrafos: [
        "Las llamadas entre programas existen desde siempre, pero la API web moderna nació a principios de los dos mil. En 2000, Roy Fielding describió en su tesis el estilo REST, que usa bien lo que HTTP ya ofrece (recursos con dirección, verbos, códigos de estado). Antes dominaban SOAP y XML, más pesados y rígidos.",
        "Con el auge de JSON y de las aplicaciones móviles, REST se volvió el estándar. En 2015 Facebook publicó GraphQL, pensado para que un cliente móvil pida en un solo viaje justo los datos que necesita. Y en servicios internos de alto rendimiento se usa gRPC, de Google. Hoy conviven los tres, con REST como el más común.",
      ],
    },
    {
      heading: "Cómo funciona por dentro",
      parrafos: [
        "Una API REST organiza todo en torno a recursos: las cosas de tu dominio (libros, pedidos, usuarios), cada una con una dirección. El verbo HTTP dice qué querés hacer con ella: GET lee, POST crea, PUT reemplaza, PATCH modifica una parte, DELETE borra. La respuesta lleva un código de estado que dice cómo salió y un cuerpo (casi siempre JSON). Cada pedido es independiente: el servidor no guarda estado de la conversación entre pedidos, y por eso las credenciales viajan en cada uno.",
        "Detrás de cada ruta hay un manejador: una función que valida la entrada, comprueba los permisos, hace el trabajo (casi siempre hablando con una base de datos) y arma la respuesta. GraphQL cambia el modelo: hay un único punto de entrada y el cliente describe, en una consulta, los campos exactos que quiere, incluso de recursos relacionados. A cambio, el servidor tiene que proteger mejor las consultas costosas.",
      ],
    },
    {
      heading: "Tu primera API, paso a paso",
      parrafos: [
        "Con Node.js y Express (npm install express), este archivo servidor.js ofrece una lista de libros. Corrélo con node servidor.js y probalo con curl.",
      ],
      codigo: [
        code`
import express from "express";

const app = express();
app.use(express.json());

const libros = [{ id: 1, titulo: "Dune" }];

app.get("/libros", (req, res) => res.json(libros));

app.get("/libros/:id", (req, res) => {
  const libro = libros.find((l) => l.id === Number(req.params.id));
  if (!libro) return res.status(404).json({ error: "No existe" });
  res.json(libro);
});

app.post("/libros", (req, res) => {
  const { titulo } = req.body;
  if (typeof titulo !== "string" || !titulo.trim()) {
    return res.status(422).json({ error: "El título es obligatorio" });
  }
  const nuevo = { id: libros.length + 1, titulo: titulo.trim() };
  libros.push(nuevo);
  res.status(201).json(nuevo);
});

app.listen(3000);`,
      ],
    },
    {
      heading: "Qué hace cada parte",
      parrafos: [
        "express.json() hace que el cuerpo de los pedidos JSON llegue ya convertido en un objeto. Cada app.get o app.post asocia un verbo y una ruta con una función; :id es un parámetro de ruta, que llega como texto y hay que convertir. Las respuestas usan el código correcto: 200 por defecto, 404 si el recurso no existe, 201 al crear y 422 si los datos no son válidos.",
        "Fijate en que el POST no confía en lo que llega: comprueba el tipo y que no esté vacío antes de usarlo. Es la regla de oro de toda API: la entrada es hostil hasta que se demuestre lo contrario. Para probarlo: curl localhost:3000/libros, y curl -X POST localhost:3000/libros -H \"Content-Type: application/json\" -d '{\"titulo\":\"Emma\"}'.",
      ],
    },
    {
      heading: "Los cinco conceptos que sostienen todo lo demás",
      parrafos: [
        "Con estos cinco diseñás y consumís casi cualquier API:",
      ],
      lista: [
        "Recursos y verbos: sustantivos en plural en la ruta (/libros), y el verbo HTTP como acción. Evitá rutas como /crearLibro.",
        "Códigos de estado y errores: el código correcto y un cuerpo de error con siempre la misma forma.",
        "Autenticación y autorización: quién sos (clave de API, token Bearer, OAuth) y qué podés hacer con cada recurso, comprobado en el servidor.",
        "Idempotencia y reintentos: los clientes reintentan; las operaciones que cambian cosas (como un pago) deben tolerarlo con una clave de idempotencia.",
        "Contrato y versiones: una descripción formal (OpenAPI) y cambios que no rompen a quien ya la usa.",
      ],
      codigo: [
        code`
// el cliente: tolerante a fallos
const r = await fetch("https://api.ejemplo.com/pagos", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer " + token,
    "Idempotency-Key": crypto.randomUUID(),    // el mismo en cada reintento
  },
  body: JSON.stringify({ cliente: 7, total: 50 }),
});
if (!r.ok) throw new Error("La API respondió " + r.status);`,
      ],
    },
    {
      heading: "Errores que comete casi todo el mundo",
      parrafos: [
        "Los que más se repiten, de los dos lados:",
      ],
      lista: [
        "Al consumir: creer que fetch falla con un 404 o un 500. No falla; hay que mirar response.ok.",
        "Guardar el token en el código del front-end o en la URL: cualquiera lo ve. Los secretos van en el servidor.",
        "No poner tiempo máximo ni reintentos: una API lenta cuelga tu aplicación, y una caída pasajera se vuelve un error para el usuario.",
        "Al diseñar: responder 200 con un mensaje de error adentro. Los clientes y las herramientas dependen del código de estado.",
        "Comprobar los permisos solo al mostrar el botón: quien llama directo a la API los salta. Es el riesgo número uno de la lista OWASP de seguridad de APIs.",
        "Devolver más datos de los necesarios (por ejemplo, el usuario completo con su hash de contraseña). Definí qué campos salen.",
        "Romper clientes sin avisar: quitar o renombrar un campo, cambiar un tipo. Agregá campos nuevos y versioná lo incompatible.",
        "No limitar la frecuencia ni el tamaño de las respuestas: un cliente con un error puede tumbar el servicio.",
      ],
      codigo: [
        code`
// MAL: devuelve el registro entero, con datos privados
res.json(usuario);        // incluye clave_hash, email, rol...

// BIEN: solo los campos públicos
res.json({ id: usuario.id, nombre: usuario.nombre });

// MAL: el error viaja con código 200
res.json({ ok: false, error: "No existe" });

// BIEN
res.status(404).json({ error: "No existe" });`,
      ],
    },
    {
      heading: "Dónde conviene cada estilo y dónde no",
      parrafos: [
        "No hay un estilo ganador:",
      ],
      tabla: {
        cabeza: ["Estilo", "Conviene cuando…", "Cuidado con…"],
        filas: [
          ["REST", "ofrecés recursos claros, querés usar la caché de HTTP y que la entienda cualquiera.", "Muchos viajes si el cliente necesita datos de varios recursos."],
          ["GraphQL", "hay muchos clientes con necesidades distintas (web, móvil) y querés pedir justo lo necesario.", "Consultas muy costosas; la caché es menos directa; todo responde 200."],
          ["gRPC", "es comunicación interna entre servicios, con contrato estricto y alto rendimiento.", "No lo habla un navegador directamente."],
          ["Webhooks", "querés avisar a otro sistema cuando algo ocurre, sin que pregunte todo el tiempo.", "Hay que verificar la firma y tolerar reintentos y duplicados."],
          ["WebSocket", "la comunicación es continua y en ambos sentidos.", "Mantener muchas conexiones abiertas cuesta recursos."],
        ],
      },
    },
    {
      heading: "Cómo seguir",
      parrafos: [
        "Usá la pestaña Referencia de este tema para recordar el código de cada pieza. Para practicar, armá una API pequeña de tu dominio (libros, tareas), documentala con OpenAPI, y escribí un cliente que la consuma con reintentos y manejo de errores. Después probala como si fueras un atacante: pedí recursos de otros usuarios, mandá datos inválidos y repetí pedidos.",
        "MDN explica fetch en detalle, y la lista OWASP de seguridad de APIs describe los riesgos principales. El libro \"Web API Design\", de Apigee, es corto y gratuito, y la especificación OpenAPI tiene una guía de introducción clara.",
      ],
    },
  ],
  fuentes: [
    { texto: "MDN: usar fetch", url: "https://developer.mozilla.org/es/docs/Web/API/Fetch_API/Using_Fetch" },
    { texto: "OWASP API Security Top 10", url: "https://owasp.org/API-Security/" },
    { texto: "Iniciativa OpenAPI", url: "https://learn.openapis.org/" },
    { texto: "GraphQL: aprender", url: "https://graphql.org/learn/" },
  ],
  revisada: "2026-11-12",
};
