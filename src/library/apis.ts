import { type Topic, a, b, code, m } from "./types";
import { claseApis } from "./clases/apis";

export const apis: Topic = {
  id: "apis",
  name: "APIs: REST, GraphQL y webhooks",
  group: "Web y datos",
  emblem: null,
  badge: "AP",
  color: "#f2b84b",
  hl: "javascript",
  summary:
    "Una API es la puerta por la que un programa le pide cosas a otro. Acá están las dos caras: consumir una API (fetch, autenticación, errores, paginación, reintentos) y diseñar la tuya (recursos REST, errores coherentes, idempotencia, límites, webhooks y GraphQL).",
  facts: [
    { label: "Estilos", value: "REST · GraphQL · gRPC" },
    { label: "Formato habitual", value: "JSON sobre HTTP" },
    { label: "Autenticación", value: "clave de API · Bearer · OAuth 2.0" },
    { label: "Contrato", value: "OpenAPI (REST) · esquema (GraphQL)" },
  ],
  workflow: [
    { title: "Diseñá la API desde quien la usa", text: "Escribí primero ejemplos de uso: qué pide el cliente y qué recibe. Si cuesta explicarlo, el diseño está mal." },
    { title: "Un contrato escrito", text: "Describí la API con OpenAPI o un esquema. Sirve de documentación, de validación y para generar clientes." },
    { title: "Errores previsibles", text: "Un mismo formato de error en toda la API, con el código HTTP correcto y un mensaje que le sirva a quien programa." },
    { title: "Nunca confíes en el cliente", text: "Validá todo lo que entra y comprobá los permisos de cada recurso en el servidor, no en la pantalla." },
    { title: "Pensá en los cambios", text: "Una API la usan otros: cambiar un campo los rompe. Versioná y agregá en vez de quitar." },
  ],
  entries: [
    b("Consumir", "fetch: un GET que devuelve JSON", "fetch hace un pedido HTTP y devuelve una promesa. response.json() lee el cuerpo y lo convierte en un objeto.", code`
const respuesta = await fetch("https://api.ejemplo.com/libros/7");
const libro = await respuesta.json();
console.log(libro.titulo);`, "fetch get json consumir api"),
    b("Consumir", "fetch: POST con JSON", "Para enviar datos se indica el método, la cabecera Content-Type y el cuerpo ya convertido a texto con JSON.stringify.", code`
const respuesta = await fetch("https://api.ejemplo.com/libros", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ titulo: "Dune", paginas: 600 }),
});
const creado = await respuesta.json();`, "fetch post json enviar crear"),
    b("Consumir", "Revisar response.ok", "fetch solo falla si no hay conexión. Un 404 o un 500 NO lanzan error: hay que mirar response.ok o el código de estado.", code`
const respuesta = await fetch("https://api.ejemplo.com/libros/999");
if (!respuesta.ok) {
  throw new Error("La API respondió " + respuesta.status);
}
const libro = await respuesta.json();`, "fetch ok error status 404 500 manejar"),
    m("Consumir", "Autenticación con Bearer", "El token va en la cabecera Authorization. Se guarda en el servidor o en una variable de entorno, nunca en el código ni en la URL.", code`
const respuesta = await fetch("https://api.ejemplo.com/perfil", {
  headers: { Authorization: "Bearer " + process.env.API_TOKEN },
});`, "bearer token authorization cabecera autenticacion"),
    m("Consumir", "Paginación con cursor", "Una lista grande se devuelve por partes. Con cursor, cada respuesta trae la marca para pedir la siguiente; es más estable que numerar páginas si los datos cambian.", code`
async function* todos(url) {
  let cursor = null;
  do {
    const r = await fetch(url + (cursor ? "?cursor=" + cursor : ""));
    const pagina = await r.json();
    yield* pagina.datos;
    cursor = pagina.siguiente;      // null cuando no hay más
  } while (cursor);
}

for await (const libro of todos("https://api.ejemplo.com/libros")) console.log(libro.titulo);`, "paginacion cursor pagina listas grandes"),
    m("Consumir", "Reintentos ante 429 y 503", "429 (demasiados pedidos) y 503 (servicio no disponible) suelen ser pasajeros. Si el servidor manda Retry-After (en segundos o como fecha HTTP), esperá ese tiempo; si no, retrocedé de forma exponencial.", code`
function esperaDe(valor, n) {
  if (valor && /^\d+$/.test(valor)) return Number(valor) * 1000;   // segundos
  const fecha = Date.parse(valor ?? "");                             // o una fecha HTTP
  return Number.isNaN(fecha) ? 2 ** n * 500 : Math.max(0, fecha - Date.now());
}

async function pedir(url, intentos = 4) {
  for (let n = 0; n < intentos; n++) {
    const r = await fetch(url);
    if (r.status !== 429 && r.status !== 503) return r;
    const espera = esperaDe(r.headers.get("Retry-After"), n);
    await new Promise((ok) => setTimeout(ok, espera));
  }
  throw new Error("La API sigue sin responder");
}`, "reintentos 429 503 retry-after backoff"),
    m("Diseñar", "REST: recursos y verbos", "Las rutas nombran cosas (sustantivos, en plural) y el verbo HTTP dice la acción. Los códigos de estado reflejan el resultado.", code`
import express from "express";
const app = express();
app.use(express.json());

app.get("/libros", (req, res) => res.json(libros));                  // lista
app.get("/libros/:id", (req, res) => {                               // uno
  const libro = libros.find((l) => l.id === Number(req.params.id));
  libro ? res.json(libro) : res.status(404).json({ error: "No existe" });
});
app.post("/libros", (req, res) => res.status(201).json(crear(req.body)));   // crear
app.delete("/libros/:id", (req, res) => res.status(204).end());             // borrar`, "rest recursos verbos rutas express diseno api"),
    m("Diseñar", "Errores con un formato único", "Todas las respuestas de error deberían tener la misma forma. El estándar problem+json define campos para eso: tipo, título, estado y detalle.", code`
res.status(422).type("application/problem+json").json({
  type: "https://api.ejemplo.com/errores/validacion",
  title: "Datos inválidos",
  status: 422,
  detail: "El campo 'paginas' tiene que ser un número positivo",
});`, "errores problem json formato 422 validacion"),
    a("Diseñar", "Clave de idempotencia en un POST", "Si el cliente reintenta un pago por un corte de red, no debe cobrarse dos veces. El cliente manda una clave única y el servidor devuelve el resultado ya calculado.", code`
const vistos = new Map();           // en producción: una tabla con clave única

app.post("/pagos", (req, res) => {
  const clave = req.get("Idempotency-Key");
  if (!clave) return res.status(400).json({ error: "Falta Idempotency-Key" });
  if (vistos.has(clave)) return res.status(200).json(vistos.get(clave));
  const pago = cobrar(req.body);
  vistos.set(clave, pago);
  res.status(201).json(pago);
});`, "idempotencia clave idempotency key pagos reintento"),
    a("Diseñar", "Limitar pedidos por cliente", "Un límite de frecuencia protege la API de abusos y de errores de un cliente. Al pasarse se responde 429 con Retry-After.", code`
const ventana = new Map();          // ip -> { n, hasta }   (ejemplo: en memoria de un solo proceso)

app.use((req, res, next) => {
  const ahora = Date.now();
  const v = ventana.get(req.ip) ?? { n: 0, hasta: ahora + 60_000 };
  if (ahora > v.hasta) { v.n = 0; v.hasta = ahora + 60_000; }
  v.n++;
  ventana.set(req.ip, v);
  if (v.n > 100) return res.set("Retry-After", "60").status(429).json({ error: "Demasiados pedidos" });
  next();
});`, "rate limit limite frecuencia 429 abuso"),
    a("Integrar", "Verificar la firma de un webhook", "Un webhook es una API al revés: el otro sistema te llama a vos. Cualquiera podría falsificar esa llamada, así que se comprueba la firma HMAC con una clave compartida. express.raw tiene que leer el cuerpo antes que cualquier express.json global, y timingSafeEqual exige el mismo largo en bytes.", code`
import crypto from "node:crypto";

app.post("/webhook", express.raw({ type: "application/json" }), (req, res) => {
  const esperada = crypto.createHmac("sha256", process.env.WEBHOOK_SECRET).update(req.body).digest("hex");
  const recibida = Buffer.from(req.get("X-Firma") ?? "");
  const iguales = recibida.length === esperada.length &&   // largo en bytes, no en letras
    crypto.timingSafeEqual(recibida, Buffer.from(esperada));
  if (!iguales) return res.status(401).end();
  res.status(200).end();       // responder rápido y procesar después
});`, "webhook firma hmac verificar seguridad timingsafeequal"),
    a("GraphQL", "GraphQL: pedir solo lo que necesitás", "En GraphQL hay un solo punto de entrada y el cliente describe qué campos quiere, incluso de recursos relacionados, en un único pedido.", code`
const consulta = \`
  query Libro($id: ID!) {
    libro(id: $id) {
      titulo
      autor { nombre }
    }
  }
\`;

const r = await fetch("https://api.ejemplo.com/graphql", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ query: consulta, variables: { id: "7" } }),
});
const { data, errors } = await r.json();    // OJO: GraphQL responde 200 aunque haya errors`, "graphql consulta query campos variables"),
  ],
  clase: claseApis,
};
