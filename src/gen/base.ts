// Utilidades compartidas por los generadores de código.

export type Rng = () => number;

export function makeRng(seed = Date.now()): Rng {
  let s = seed >>> 0 || 1;
  return () => {
    // mulberry32
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const pick = <T,>(rng: Rng, arr: readonly T[]): T => arr[Math.floor(rng() * arr.length)];
export const chance = (rng: Rng, p: number) => rng() < p;
export const int = (rng: Rng, min: number, max: number) => min + Math.floor(rng() * (max - min + 1));

export function shuffle<T>(rng: Rng, arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1);

/** Nombre compuesto por palabras en inglés, en todos los estilos. */
export interface Nm {
  w: string[];
}
export const nm = (...w: string[]): Nm => ({ w });
export const snake = (n: Nm) => n.w.join("_");
export const camel = (n: Nm) => n.w[0] + n.w.slice(1).map(cap).join("");
export const pascal = (n: Nm) => n.w.map(cap).join("");
export const kebab = (n: Nm) => n.w.join("-");
export const upper = (n: Nm) => n.w.join("_").toUpperCase();
export const join = (...ns: (Nm | string)[]): Nm => ({
  w: ns.flatMap((x) => (typeof x === "string" ? x.split(" ") : x.w)),
});

export const L = (...lines: string[]) => lines.join("\n");

/** Indenta todas las líneas con n espacios. */
export const ind = (n: number, text: string) =>
  text
    .split("\n")
    .map((l) => (l.length ? " ".repeat(n) + l : l))
    .join("\n");

// ─────────────────────────── Vocabulario de dominio ───────────────────────────

export type FType = "int" | "float" | "str" | "bool";
export type Gender = "m" | "f";

export interface Field {
  n: Nm;
  t: FType;
  /** con artículo: "el precio", "la edad" */
  es: string;
  g: Gender;
  /** para bool: adjetivo en masculino singular */
  adj?: string;
  /** adjetivo invariable en género */
  inv?: boolean;
  /** verbo: "está" / "es" */
  verb?: "está" | "es";
}

export interface Entity {
  s: Nm;
  p: Nm;
  es: string;
  esP: string;
  g: Gender;
  fields: Field[];
}

const f = (w: string, t: FType, es: string, g: Gender = "m"): Field => ({ n: nm(...w.split(" ")), t, es, g });
const b = (w: string, adj: string, verb: "está" | "es" = "está", inv = false): Field => ({
  n: nm(...w.split(" ")), t: "bool", es: adj, g: "m", adj, verb, inv,
});
const e = (s: string, p: string, es: string, esP: string, g: Gender, fields: Field[]): Entity => ({
  s: nm(...s.split(" ")), p: nm(...p.split(" ")), es, esP, g, fields,
});

export const ENTITIES: Entity[] = [
  e("user", "users", "usuario", "usuarios", "m", [f("name", "str", "el nombre"), f("email", "str", "el email"), f("age", "int", "la edad", "f"), f("score", "int", "la puntuación", "f"), b("active", "activo")]),
  e("product", "products", "producto", "productos", "m", [f("name", "str", "el nombre"), f("code", "str", "el código"), f("price", "float", "el precio"), f("stock", "int", "el stock"), b("available", "disponible", "está", true)]),
  e("order", "orders", "pedido", "pedidos", "m", [f("reference", "str", "la referencia", "f"), f("total", "float", "el total"), f("quantity", "int", "la cantidad", "f"), b("paid", "pagado")]),
  e("invoice", "invoices", "factura", "facturas", "f", [f("number", "str", "el número"), f("amount", "float", "el importe"), f("tax", "float", "el impuesto"), b("paid", "pagado")]),
  e("todo item", "todo items", "tarea", "tareas", "f", [f("title", "str", "el título"), f("priority", "int", "la prioridad", "f"), f("estimate", "int", "la estimación", "f"), b("done", "completado")]),
  e("room", "rooms", "habitación", "habitaciones", "f", [f("number", "str", "el número"), f("price", "float", "el precio"), f("floor", "int", "el piso"), b("occupied", "ocupado")]),
  e("guest", "guests", "huésped", "huéspedes", "m", [f("name", "str", "el nombre"), f("country", "str", "el país"), f("nights", "int", "el número de noches"), b("vip", "VIP", "es", true)]),
  e("employee", "employees", "empleado", "empleados", "m", [f("name", "str", "el nombre"), f("department", "str", "el departamento"), f("salary", "float", "el salario"), f("age", "int", "la edad", "f"), b("remote", "remoto", "es")]),
  e("book", "books", "libro", "libros", "m", [f("title", "str", "el título"), f("author", "str", "el autor"), f("pages", "int", "el número de páginas"), b("available", "disponible", "está", true)]),
  e("song", "songs", "canción", "canciones", "f", [f("title", "str", "el título"), f("artist", "str", "el artista"), f("duration", "int", "la duración", "f"), f("plays", "int", "el número de reproducciones"), b("explicit", "explícito", "es")]),
  e("city", "cities", "ciudad", "ciudades", "f", [f("name", "str", "el nombre"), f("population", "int", "la población", "f"), f("area", "float", "la superficie", "f"), b("coastal", "costero", "es")]),
  e("player", "players", "jugador", "jugadores", "m", [f("nickname", "str", "el apodo"), f("score", "int", "la puntuación", "f"), f("level", "int", "el nivel"), b("online", "en línea", "está", true)]),
  e("ticket", "tickets", "entrada", "entradas", "f", [f("seat", "str", "el asiento"), f("price", "float", "el precio"), b("used", "usado")]),
  e("reservation", "reservations", "reserva", "reservas", "f", [f("code", "str", "el código"), f("nights", "int", "el número de noches"), f("total", "float", "el total"), b("confirmed", "confirmado")]),
  e("sensor", "sensors", "sensor", "sensores", "m", [f("label", "str", "la etiqueta", "f"), f("reading", "float", "la lectura", "f"), f("threshold", "float", "el umbral"), b("online", "en línea", "está", true)]),
  e("document", "documents", "documento", "documentos", "m", [f("name", "str", "el nombre"), f("extension", "str", "la extensión", "f"), f("size", "int", "el tamaño"), b("hidden", "oculto")]),
  e("message", "messages", "mensaje", "mensajes", "m", [f("sender", "str", "el remitente"), f("subject", "str", "el asunto"), f("priority", "int", "la prioridad", "f"), b("read", "leído")]),
  e("vehicle", "vehicles", "vehículo", "vehículos", "m", [f("plate", "str", "la matrícula", "f"), f("speed", "float", "la velocidad", "f"), f("mileage", "int", "el kilometraje"), b("electric", "eléctrico", "es")]),
  e("course", "courses", "curso", "cursos", "m", [f("title", "str", "el título"), f("students", "int", "el número de alumnos"), f("price", "float", "el precio"), b("published", "publicado")]),
  e("dish", "dishes", "plato", "platos", "m", [f("name", "str", "el nombre"), f("price", "float", "el precio"), f("calories", "int", "las calorías", "f"), b("vegan", "vegano", "es")]),
  e("account", "accounts", "cuenta", "cuentas", "f", [f("owner", "str", "el titular"), f("iban", "str", "el IBAN"), f("balance", "float", "el saldo"), b("blocked", "bloqueado")]),
  e("shipment", "shipments", "envío", "envíos", "m", [f("tracking code", "str", "el código de seguimiento"), f("weight", "float", "el peso"), f("distance", "int", "la distancia", "f"), b("delivered", "entregado")]),
];

// ─────────────────────────── Español ───────────────────────────

export const art = (g: Gender, plural = false) => (g === "m" ? (plural ? "los" : "el") : plural ? "las" : "la");
export const un = (g: Gender) => (g === "m" ? "un" : "una");
export const todos = (g: Gender) => (g === "m" ? "todos" : "todas");
export const algun = (g: Gender) => (g === "m" ? "algún" : "alguna");
export const cuantos = (g: Gender) => (g === "m" ? "cuántos" : "cuántas");

/** Adjetivo concordado con la entidad: "activo" → "activas". */
export function adj(field: Field, g: Gender, plural: boolean): string {
  let a = field.adj ?? "";
  if (!field.inv && g === "f" && a.endsWith("o")) a = a.slice(0, -1) + "a";
  if (plural && !field.inv) a = /[aeiouáéíóú]$/.test(a) ? a + "s" : a + "es";
  if (plural && field.inv && a === "disponible") a = "disponibles";
  return a;
}

export const verbP = (field: Field) => (field.verb === "es" ? "son" : "están");

/** "el precio" → "precio". */
export const bare = (field: Field) => field.es.replace(/^(el|la|los|las) /, "");

/** Concordancia del adjetivo "negativo" con el campo. */
export const negativo = (field: Field) => {
  const plural = /^(los|las) /.test(field.es);
  const base = field.g === "f" ? "negativa" : "negativo";
  return plural ? base + "s" : base;
};

// ─────────────────────────── Contexto de un concepto ───────────────────────────

export interface Ctx {
  rng: Rng;
  ent: Entity;
  num: Field;
  str: Field;
  flag: Field;
}

export function makeCtx(rng: Rng, ent: Entity = pick(rng, ENTITIES)): Ctx {
  const nums = ent.fields.filter((x) => x.t === "int" || x.t === "float");
  const strs = ent.fields.filter((x) => x.t === "str");
  const flags = ent.fields.filter((x) => x.t === "bool");
  return { rng, ent, num: pick(rng, nums), str: pick(rng, strs), flag: pick(rng, flags) };
}

/** Plural inglés sencillo para nombres de campo (emails, titles…). */
export const plural = (n: Nm): Nm => {
  const last = n.w[n.w.length - 1];
  const p = /(s|x|ch|sh)$/.test(last) ? last + "es" : /[^aeiou]y$/.test(last) ? last.slice(0, -1) + "ies" : last + "s";
  return { w: [...n.w.slice(0, -1), p] };
};

export const isNum = (fd: Field) => fd.t === "int" || fd.t === "float";
