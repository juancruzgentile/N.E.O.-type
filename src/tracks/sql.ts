// Ruta de bases de datos: SQLite → MySQL → PostgreSQL → MongoDB.
// Cada tema se escribe en el dialecto de cada motor; MongoDB usa la sintaxis de mongosh.

import {
  type Entity, ENTITIES, type Field, type Rng, adj, art, bare, camel, chance, cuantos, int, join, nm, pick, snake, un, verbP,
} from "../gen/base";
import type { Exercise, Topic, Track } from "./types";

type Db = "sqlite" | "mysql" | "postgresql" | "mongodb";
const NAME: Record<Db, string> = { sqlite: "SQLite", mysql: "MySQL", postgresql: "PostgreSQL", mongodb: "MongoDB" };

interface Q {
  db: Db;
  mongo: boolean;
  ent: Entity;
  num: Field;
  str: Field;
  flag: Field;
  /** tabla o colección */
  T: string;
  rng: Rng;
}

function ctx(rng: Rng, db: Db, ent: Entity = pick(rng, ENTITIES)): Q {
  const nums = ent.fields.filter((x) => x.t === "int" || x.t === "float");
  const strs = ent.fields.filter((x) => x.t === "str");
  const flags = ent.fields.filter((x) => x.t === "bool");
  const mongo = db === "mongodb";
  return {
    db, mongo, ent, rng,
    num: pick(rng, nums), str: pick(rng, strs), flag: pick(rng, flags),
    T: mongo ? camel(ent.p) : snake(ent.p),
  };
}

/** Nombre de columna o campo: snake_case en SQL, camelCase en MongoDB; los booleanos llevan "is". */
const col = (q: Q, f: Field) => {
  const n = f.t === "bool" ? join("is", f.n) : f.n;
  return q.mongo ? camel(n) : snake(n);
};

const STR_VALUES: Record<string, string[]> = {
  name: ["Ana", "Bruno", "Carla", "Diego", "Elena", "Franco", "Lucia", "Marco", "Nora", "Pablo"],
  email: ["ana@example.com", "bruno@example.com", "carla@example.com", "dev@example.com"],
  country: ["Italy", "Argentina", "Spain", "Chile", "Uruguay"],
  department: ["sales", "support", "finance", "engineering"],
  author: ["Borges", "Calvino", "Eco", "Cortazar"],
  artist: ["Soda Stereo", "Daft Punk", "Vangelis"],
  title: ["Neuromancer", "Clean Code", "Dune", "Ficciones"],
  extension: ["pdf", "txt", "csv", "png"],
  nickname: ["neo", "trinity", "morpheus", "cipher"],
};
const GENERIC = ["alpha", "bravo", "delta", "omega", "zeta"];

/** valores de "name" según la entidad (una ciudad no se llama Ana) */
const NAME_BY_ENTITY: Record<string, string[]> = {
  city: ["Torino", "Rosario", "Madrid", "Lima", "Milano"],
  product: ["Keyboard", "Monitor", "Mouse", "Headset"],
  dish: ["Pizza", "Ramen", "Empanada", "Risotto"],
  document: ["report", "invoice", "backup", "notes"],
};

function strVal(rng: Rng, f: Field, ent?: Entity): string {
  const key = f.n.w.join(" ");
  if (key === "name" && ent && NAME_BY_ENTITY[ent.s.w.join(" ")]) return pick(rng, NAME_BY_ENTITY[ent.s.w.join(" ")]);
  if (STR_VALUES[key]) return pick(rng, STR_VALUES[key]);
  if (/code|reference|number|plate|seat|iban|tracking/.test(key)) return `${pick(rng, ["A", "B", "X", "K"])}-${int(rng, 100, 999)}`;
  return pick(rng, GENERIC);
}

function numVal(rng: Rng, f: Field): number | string {
  const key = f.n.w.join(" ");
  if (key === "age") return int(rng, 18, 65);
  if (f.t === "float") return `${int(rng, 5, 400)}.${pick(rng, ["5", "99", "25", "75"])}`;
  return int(rng, 2, 500);
}

/** Literal en la sintaxis del motor. */
function lit(q: Q, v: string | number | boolean): string {
  if (typeof v === "boolean") return q.mongo ? String(v) : q.db === "sqlite" ? (v ? "1" : "0") : v ? "TRUE" : "FALSE";
  if (typeof v === "number") return String(v);
  if (/^\d+(\.\d+)?$/.test(v)) return v;
  return q.mongo ? `"${v}"` : `'${v}'`;
}

const val = (q: Q, f: Field) => (f.t === "bool" ? chance(q.rng, 0.7) : f.t === "str" ? strVal(q.rng, f, q.ent) : numVal(q.rng, f));
/** "el precio" → "al precio" */
const alDe = (es: string) => es.replace(/^el /, "al ").replace(/^(la|los|las) /, "a $1 ");

function sqlType(q: Q, f: Field): string {
  const { db } = q;
  if (f.t === "int") return db === "mysql" ? "INT" : "INTEGER";
  if (f.t === "float") return db === "sqlite" ? "REAL" : db === "mysql" ? "DECIMAL(10, 2)" : "NUMERIC(10, 2)";
  if (f.t === "str") return db === "sqlite" ? "TEXT" : db === "postgresql" && chance(q.rng, 0.4) ? "TEXT" : "VARCHAR(120)";
  return db === "sqlite" ? "INTEGER" : "BOOLEAN";
}

const L = (...lines: string[]) => lines.join("\n");
const ex = (title: string, ...lines: string[]): Exercise => ({ title, text: L(...lines) });
const en = (q: Q) => NAME[q.db];
const los = (q: Q) => `${art(q.ent.g, true)} ${q.ent.esP}`;
/** "mongo: { a: 1, b: true }" */
const obj = (pairs: [string, string][]) => `{ ${pairs.map(([k, v]) => `${k}: ${v}`).join(", ")} }`;

// ─────────────────────────── Escalón 1: lo básico ───────────────────────────

const createTable: Topic = {
  id: "create",
  gen(rng, db) {
    const q = ctx(rng, db as Db);
    if (q.mongo) {
      const req = q.ent.fields.filter((f) => f.t === "str").map((f) => `"${col(q, f)}"`);
      return ex(
        `Crea la colección de ${q.ent.esP} en MongoDB con campos obligatorios`,
        `db.createCollection("${q.T}", {`,
        `  validator: {`,
        `    $jsonSchema: {`,
        `      required: [${req.join(", ")}]`,
        `    }`,
        `  }`,
        `});`,
      );
    }
    const pk =
      q.db === "sqlite" ? "id INTEGER PRIMARY KEY AUTOINCREMENT"
      : q.db === "mysql" ? "id INT AUTO_INCREMENT PRIMARY KEY"
      : pick(rng, ["id SERIAL PRIMARY KEY", "id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY"]);
    const cols = q.ent.fields.map((f) => {
      let c = `${col(q, f)} ${sqlType(q, f)}`;
      if (f.t === "str" && f === q.ent.fields[0]) c += " NOT NULL";
      if (f.t === "bool") c += ` DEFAULT ${lit(q, true)}`;
      return c;
    });
    if (chance(rng, 0.5)) {
      cols.push(
        q.db === "sqlite" ? "created_at TEXT DEFAULT CURRENT_TIMESTAMP"
        : q.db === "mysql" ? "created_at DATETIME DEFAULT CURRENT_TIMESTAMP"
        : "created_at TIMESTAMPTZ DEFAULT now()",
      );
    }
    const end = q.db === "mysql" && chance(rng, 0.5) ? ") ENGINE=InnoDB;" : ");";
    return ex(
      `Crea la tabla de ${q.ent.esP} en ${en(q)}`,
      `CREATE TABLE ${q.T} (`,
      ...[pk, ...cols].map((c, i, a) => `  ${c}${i < a.length - 1 ? "," : ""}`),
      end,
    );
  },
};

const insert: Topic = {
  id: "insert",
  gen(rng, db) {
    const q = ctx(rng, db as Db);
    const fields = q.ent.fields.slice(0, Math.min(q.ent.fields.length, int(rng, 2, 4)));
    const rows = int(rng, 1, 3);
    const title = rows === 1
      ? `Inserta ${un(q.ent.g)} ${q.ent.es} en ${en(q)}`
      : `Inserta ${rows} ${q.ent.esP} de una sola vez en ${en(q)}`;
    if (q.mongo) {
      const docs = Array.from({ length: rows }, () => obj(fields.map((f) => [col(q, f), lit(q, val(q, f))])));
      if (rows === 1) return ex(title, `db.${q.T}.insertOne(${docs[0]});`);
      return ex(title, `db.${q.T}.insertMany([`, ...docs.map((d, i) => `  ${d}${i < docs.length - 1 ? "," : ""}`), `]);`);
    }
    const values = Array.from({ length: rows }, () => `(${fields.map((f) => lit(q, val(q, f))).join(", ")})`);
    const head = `INSERT INTO ${q.T} (${fields.map((f) => col(q, f)).join(", ")})`;
    if (rows === 1) return ex(title, head, `VALUES ${values[0]};`);
    return ex(title, head, `VALUES`, ...values.map((v, i) => `  ${v}${i < values.length - 1 ? "," : ";"}`));
  },
};

const selectWhere: Topic = {
  id: "where",
  gen(rng, db) {
    const q = ctx(rng, db as Db);
    const n = numVal(rng, q.num);
    const op = pick(rng, [[">=", "$gte", "de al menos"], [">", "$gt", "mayor a"], ["<", "$lt", "menor a"]] as const);
    const title = `Busca ${los(q)} ${adj(q.flag, q.ent.g, true)} con ${bare(q.num)} ${op[2]} ${n}`;
    if (q.mongo) {
      return ex(
        title,
        `db.${q.T}.find(`,
        `  { ${col(q, q.num)}: { ${op[1]}: ${n} }, ${col(q, q.flag)}: true },`,
        `  { ${col(q, q.str)}: 1, ${col(q, q.num)}: 1 }`,
        `);`,
      );
    }
    return ex(
      title,
      `SELECT ${col(q, q.str)}, ${col(q, q.num)}`,
      `FROM ${q.T}`,
      `WHERE ${col(q, q.num)} ${op[0]} ${n} AND ${col(q, q.flag)} = ${lit(q, true)};`,
    );
  },
};

const orderLimit: Topic = {
  id: "order",
  gen(rng, db) {
    const q = ctx(rng, db as Db);
    const k = pick(rng, [5, 10, 20]);
    const desc = chance(rng, 0.6);
    const title = `Lista ${art(q.ent.g, true)} ${k} ${q.ent.esP} con ${desc ? "mayor" : "menor"} ${bare(q.num)}`;
    if (q.mongo) return ex(title, `db.${q.T}.find().sort({ ${col(q, q.num)}: ${desc ? -1 : 1} }).limit(${k});`);
    return ex(title, `SELECT *`, `FROM ${q.T}`, `ORDER BY ${col(q, q.num)} ${desc ? "DESC" : "ASC"}`, `LIMIT ${k};`);
  },
};

const update: Topic = {
  id: "update",
  gen(rng, db) {
    const q = ctx(rng, db as Db);
    if (chance(rng, 0.5)) {
      const n = numVal(rng, q.num);
      const title = `Marca como no ${adj(q.flag, q.ent.g, true)} a ${los(q)} con ${bare(q.num)} menor a ${n}`;
      if (q.mongo) {
        return ex(title, `db.${q.T}.updateMany(`, `  { ${col(q, q.num)}: { $lt: ${n} } },`, `  { $set: { ${col(q, q.flag)}: false } }`, `);`);
      }
      return ex(title, `UPDATE ${q.T}`, `SET ${col(q, q.flag)} = ${lit(q, false)}`, `WHERE ${col(q, q.num)} < ${n};`);
    }
    const k = int(rng, 1, 10);
    const title = `Aumenta en ${k} ${q.num.es} de ${los(q)} ${adj(q.flag, q.ent.g, true)}`;
    if (q.mongo) {
      return ex(title, `db.${q.T}.updateMany(`, `  { ${col(q, q.flag)}: true },`, `  { $inc: { ${col(q, q.num)}: ${k} } }`, `);`);
    }
    const c = col(q, q.num);
    return ex(title, `UPDATE ${q.T}`, `SET ${c} = ${c} + ${k}`, `WHERE ${col(q, q.flag)} = ${lit(q, true)};`);
  },
};

const remove: Topic = {
  id: "delete",
  gen(rng, db) {
    const q = ctx(rng, db as Db);
    const title = `Borra ${los(q)} que no ${verbP(q.flag)} ${adj(q.flag, q.ent.g, true)}`;
    if (q.mongo) return ex(title, `db.${q.T}.deleteMany({ ${col(q, q.flag)}: false });`);
    return ex(title, `DELETE FROM ${q.T}`, `WHERE ${col(q, q.flag)} = ${lit(q, false)};`);
  },
};

const count: Topic = {
  id: "count",
  gen(rng, db) {
    const q = ctx(rng, db as Db);
    const title = `Cuenta ${cuantos(q.ent.g)} ${q.ent.esP} ${verbP(q.flag)} ${adj(q.flag, q.ent.g, true)}`;
    if (q.mongo) return ex(title, `db.${q.T}.countDocuments({ ${col(q, q.flag)}: true });`);
    return ex(title, `SELECT COUNT(*) AS total`, `FROM ${q.T}`, `WHERE ${col(q, q.flag)} = ${lit(q, true)};`);
  },
};

// ─────────────────────────── Escalón 2: relaciones y agregados ───────────────────────────

/** relaciones uno a muchos: padre, hijo, columna del padre y del hijo */
const RELATIONS = [
  { p: nm("user"), pp: nm("users"), c: nm("orders"), pc: "name", cc: "total", es: "los pedidos", pes: "usuario", g: "m" },
  { p: nm("guest"), pp: nm("guests"), c: nm("reservations"), pc: "name", cc: "nights", es: "las reservas", pes: "huésped", g: "m" },
  { p: nm("author"), pp: nm("authors"), c: nm("books"), pc: "name", cc: "title", es: "los libros", pes: "autor", g: "m" },
  { p: nm("artist"), pp: nm("artists"), c: nm("songs"), pc: "name", cc: "title", es: "las canciones", pes: "artista", g: "m" },
  { p: nm("department"), pp: nm("departments"), c: nm("employees"), pc: "name", cc: "salary", es: "los empleados", pes: "departamento", g: "m" },
  { p: nm("course"), pp: nm("courses"), c: nm("enrollments"), pc: "title", cc: "grade", es: "las inscripciones", pes: "curso", g: "m" },
] as const;

const joinTopic: Topic = {
  id: "join",
  gen(rng, db) {
    const r = pick(rng, RELATIONS);
    const left = chance(rng, 0.35);
    if (db === "mongodb") {
      return ex(
        `Une ${r.es} con los datos de su ${r.pes} usando $lookup`,
        `db.${camel(r.c)}.aggregate([`,
        `  {`,
        `    $lookup: {`,
        `      from: "${camel(r.pp)}",`,
        `      localField: "${camel(join(r.p, "id"))}",`,
        `      foreignField: "_id",`,
        `      as: "${camel(r.p)}"`,
        `    }`,
        `  },`,
        `  { $unwind: "$${camel(r.p)}" }`,
        `]);`,
      );
    }
    const a = r.p.w[0][0];
    const b = r.c.w[0][0] === a ? "x" : r.c.w[0][0];
    return ex(
      left
        ? `Lista cada ${r.pes} con ${r.es}, incluyendo los que no tienen ninguno, en ${NAME[db as Db]}`
        : `Lista ${r.es} junto al ${r.pc === "title" ? "título" : "nombre"} de su ${r.pes} en ${NAME[db as Db]}`,
      `SELECT ${a}.${r.pc}, ${b}.${r.cc}`,
      `FROM ${snake(r.pp)} AS ${a}`,
      `${left ? "LEFT JOIN" : "JOIN"} ${snake(r.c)} AS ${b} ON ${b}.${snake(join(r.p, "id"))} = ${a}.id`,
      `ORDER BY ${a}.${r.pc};`,
    );
  },
};

const AGG = [
  ["SUM", "$sum", "el total"],
  ["AVG", "$avg", "el promedio"],
  ["MAX", "$max", "el máximo"],
] as const;

const GROUPABLE = ["department", "country", "author", "artist", "extension", "sender", "floor", "level", "priority"];

const groupBy: Topic = {
  id: "group",
  gen(rng, db) {
    const q = ctx(rng, db as Db);
    const g = pick(rng, AGG);
    const min = int(rng, 2, 10);
    // se agrupa por un campo categórico; si la entidad no tiene, por el booleano
    const cat = q.ent.fields.find((f) => GROUPABLE.includes(f.n.w.join(" "))) ?? q.flag;
    const by = cat.t === "bool"
      ? `entre ${adj(cat, q.ent.g, true)} y no ${adj(cat, q.ent.g, true)}`
      : `por ${bare(cat)}`;
    const title = `Agrupa ${los(q)} ${by} y calcula ${g[2]} de ${bare(q.num)}`;
    if (q.mongo) {
      const field = col(q, q.num);
      return ex(
        title,
        `db.${q.T}.aggregate([`,
        `  { $group: { _id: "$${col(q, cat)}", total: { $sum: 1 }, ${g[1].slice(1)}: { ${g[1]}: "$${field}" } } },`,
        `  { $match: { total: { $gte: ${min} } } },`,
        `  { $sort: { total: -1 } }`,
        `]);`,
      );
    }
    const c = col(q, cat);
    const alias = `${g[0].toLowerCase()}_${col(q, q.num)}`;
    return ex(
      title,
      `SELECT ${c}, COUNT(*) AS total, ${g[0]}(${col(q, q.num)}) AS ${alias}`,
      `FROM ${q.T}`,
      `GROUP BY ${c}`,
      `HAVING COUNT(*) >= ${min}`,
      `ORDER BY total DESC;`,
    );
  },
};

const upsert: Topic = {
  id: "upsert",
  gen(rng, db) {
    const q = ctx(rng, db as Db);
    const key = col(q, q.str);
    const v = lit(q, strVal(rng, q.str, q.ent));
    const n = lit(q, numVal(rng, q.num));
    const c = col(q, q.num);
    const title = `Inserta o actualiza ${un(q.ent.g)} ${q.ent.es} según ${q.str.es} (upsert) en ${en(q)}`;
    if (q.mongo) {
      return ex(title, `db.${q.T}.updateOne(`, `  { ${key}: ${v} },`, `  { $set: { ${c}: ${n} } },`, `  { upsert: true }`, `);`);
    }
    if (q.db === "mysql") {
      return ex(title, `INSERT INTO ${q.T} (${key}, ${c})`, `VALUES (${v}, ${n}) AS new`, `ON DUPLICATE KEY UPDATE ${c} = new.${c};`);
    }
    const exc = q.db === "postgresql" ? "EXCLUDED" : "excluded";
    return ex(title, `INSERT INTO ${q.T} (${key}, ${c})`, `VALUES (${v}, ${n})`, `ON CONFLICT (${key})`, `DO UPDATE SET ${c} = ${exc}.${c};`);
  },
};

const index: Topic = {
  id: "index",
  gen(rng, db) {
    const q = ctx(rng, db as Db);
    const unique = chance(rng, 0.5);
    const f = unique ? q.str : q.num;
    const title = `Crea un índice${unique ? " único" : ""} sobre ${f.es} de ${q.ent.esP} en ${en(q)}`;
    if (q.mongo) return ex(title, `db.${q.T}.createIndex({ ${col(q, f)}: 1 }${unique ? ", { unique: true }" : ""});`);
    return ex(title, `CREATE ${unique ? "UNIQUE " : ""}INDEX idx_${q.T}_${col(q, f)}`, `ON ${q.T} (${col(q, f)});`);
  },
};

const NEW_COLS = [
  { n: nm("notes"), es: "notas", t: { sqlite: "TEXT", mysql: "VARCHAR(255)", postgresql: "TEXT" }, m: '""' },
  { n: nm("updated", "at"), es: "fecha de actualización", t: { sqlite: "TEXT", mysql: "DATETIME", postgresql: "TIMESTAMPTZ" }, m: "new Date()" },
  { n: nm("discount"), es: "descuento", t: { sqlite: "REAL", mysql: "DECIMAL(5, 2)", postgresql: "NUMERIC(5, 2)" }, m: "0" },
] as const;

const alter: Topic = {
  id: "alter",
  gen(rng, db) {
    const q = ctx(rng, db as Db);
    const c = pick(rng, NEW_COLS);
    if (q.mongo) {
      return ex(
        `Agrega el campo de ${c.es} a todos los documentos de ${q.ent.esP}`,
        `db.${q.T}.updateMany(`,
        `  { ${camel(c.n)}: { $exists: false } },`,
        `  { $set: { ${camel(c.n)}: ${c.m} } }`,
        `);`,
      );
    }
    return ex(
      `Agrega la columna de ${c.es} a la tabla de ${q.ent.esP} en ${en(q)}`,
      `ALTER TABLE ${q.T}`,
      `ADD COLUMN ${snake(c.n)} ${c.t[q.db as "sqlite"]};`,
    );
  },
};

const like: Topic = {
  id: "like",
  gen(rng, db) {
    const q = ctx(rng, db as Db);
    const pre = strVal(rng, q.str, q.ent).slice(0, 2);
    const cuyo = q.str.g === "f" ? "cuya" : "cuyo";
    const title = `Busca ${los(q)} ${cuyo} ${bare(q.str)} empieza con "${pre}" en ${en(q)}`;
    if (q.mongo) return ex(title, `db.${q.T}.find({ ${col(q, q.str)}: { $regex: "^${pre}", $options: "i" } });`);
    const op = q.db === "postgresql" && chance(rng, 0.5) ? "ILIKE" : "LIKE";
    return ex(title, `SELECT *`, `FROM ${q.T}`, `WHERE ${col(q, q.str)} ${op} '${pre}%';`);
  },
};

// ─────────────────────────── Escalón 3: SQL avanzado ───────────────────────────

const returning: Topic = {
  id: "returning",
  gen(rng, db) {
    if (db === "mysql") return null; // MySQL no tiene RETURNING
    const q = ctx(rng, db as Db);
    const k = int(rng, 1, 5);
    const c = col(q, q.num);
    const id = int(rng, 1, 999);
    const title = `Resta ${k} ${alDe(q.num.es)} de ${un(q.ent.g)} ${q.ent.es} y devuelve el valor nuevo en ${en(q)}`;
    if (q.mongo) {
      return ex(
        title,
        `db.${q.T}.findOneAndUpdate(`,
        `  { ${col(q, q.str)}: ${lit(q, strVal(rng, q.str, q.ent))} },`,
        `  { $inc: { ${c}: -${k} } },`,
        `  { returnDocument: "after" }`,
        `);`,
      );
    }
    return ex(title, `UPDATE ${q.T}`, `SET ${c} = ${c} - ${k}`, `WHERE id = ${id}`, `RETURNING id, ${c};`);
  },
};

const cte: Topic = {
  id: "cte",
  gen(rng, db) {
    if (db === "mongodb") return null;
    const q = ctx(rng, db as Db);
    const a = adj(q.flag, q.ent.g, true);
    const name = `${col(q, q.flag).replace(/^is_/, "")}_${q.T}`;
    return ex(
      `Usa una CTE para quedarte con ${los(q)} ${a} y ordenarlos por ${bare(q.num)} en ${en(q)}`,
      `WITH ${name} AS (`,
      `  SELECT id, ${col(q, q.str)}, ${col(q, q.num)}`,
      `  FROM ${q.T}`,
      `  WHERE ${col(q, q.flag)} = ${lit(q, true)}`,
      `)`,
      `SELECT *`,
      `FROM ${name}`,
      `ORDER BY ${col(q, q.num)} DESC;`,
    );
  },
};

const windowFn: Topic = {
  id: "window",
  gen(rng, db) {
    if (db === "mongodb") return null;
    const q = ctx(rng, db as Db);
    const fn = pick(rng, ["RANK()", "ROW_NUMBER()", "DENSE_RANK()"]);
    const part = chance(rng, 0.5);
    return ex(
      `Calcula la posición de cada ${q.ent.es} según ${q.num.es}${part ? ` dentro de cada ${bare(q.str)}` : ""} en ${en(q)}`,
      `SELECT ${col(q, q.str)}, ${col(q, q.num)},`,
      `  ${fn} OVER (${part ? `PARTITION BY ${col(q, q.str)} ` : ""}ORDER BY ${col(q, q.num)} DESC) AS position`,
      `FROM ${q.T};`,
    );
  },
};

const transaction: Topic = {
  id: "transaction",
  gen(rng, db) {
    if (db === "mongodb") return null;
    const q = ctx(rng, db as Db);
    const k = int(rng, 1, 50);
    const c = col(q, q.num);
    const a = int(rng, 1, 50);
    const b = a + int(rng, 1, 50);
    return ex(
      `Mueve ${k} de ${bare(q.num)} entre dos ${q.ent.esP} dentro de una transacción en ${en(q)}`,
      q.db === "mysql" ? "START TRANSACTION;" : "BEGIN;",
      `UPDATE ${q.T} SET ${c} = ${c} - ${k} WHERE id = ${a};`,
      `UPDATE ${q.T} SET ${c} = ${c} + ${k} WHERE id = ${b};`,
      `COMMIT;`,
    );
  },
};

const JSON_VALUES: Record<string, string[]> = {
  city: ["Torino", "Rosario", "Madrid"],
  country: ["Italy", "Argentina", "Spain"],
  plan: ["free", "pro", "team"],
  source: ["web", "mobile", "ads"],
  language: ["es", "it", "en"],
};
const JSON_KEYS = Object.keys(JSON_VALUES);

const jsonTopic: Topic = {
  id: "json",
  gen(rng, db) {
    const q = ctx(rng, db as Db);
    const [k1, k2] = [pick(rng, JSON_KEYS), pick(rng, JSON_KEYS)];
    if (k1 === k2) return null;
    const v = pick(rng, JSON_VALUES[k2]);
    const title = `Lee "${k1}" del JSON de ${los(q)} filtrando por "${k2}" en ${en(q)}`;
    if (q.mongo) return ex(title, `db.${q.T}.find(`, `  { "meta.${k2}": "${v}" },`, `  { "meta.${k1}": 1 }`, `);`);
    const get = (k: string) =>
      q.db === "sqlite" ? `json_extract(meta, '$.${k}')` : q.db === "mysql" ? `meta ->> '$.${k}'` : `meta ->> '${k}'`;
    return ex(title, `SELECT id, ${get(k1)} AS ${k1}`, `FROM ${q.T}`, `WHERE ${get(k2)} = '${v}';`);
  },
};

// ─────────────────────────── Escalón 4: documentos ───────────────────────────

const pushTopic: Topic = {
  id: "push",
  gen(rng, db) {
    if (db !== "mongodb") return null;
    const q = ctx(rng, db as Db);
    const tag = pick(rng, ["vip", "new", "priority", "archived", "beta"]);
    const pull = chance(rng, 0.3);
    return ex(
      pull
        ? `Quita la etiqueta "${tag}" de todos ${los(q)}`
        : `Agrega la etiqueta "${tag}" a ${los(q)} ${adj(q.flag, q.ent.g, true)} sin repetirla`,
      `db.${q.T}.updateMany(`,
      pull ? `  {},` : `  { ${col(q, q.flag)}: true },`,
      pull ? `  { $pull: { tags: "${tag}" } }` : `  { $addToSet: { tags: "${tag}" } }`,
      `);`,
    );
  },
};

const inTopic: Topic = {
  id: "in",
  gen(rng, db) {
    if (db !== "mongodb") return null;
    const q = ctx(rng, db as Db);
    const vals = [...new Set([strVal(rng, q.str, q.ent), strVal(rng, q.str, q.ent), strVal(rng, q.str, q.ent)])].map((v) => `"${v}"`);
    return ex(
      `Busca ${los(q)} cuyo campo ${bare(q.str)} sea uno de varios valores`,
      `db.${q.T}.find({ ${col(q, q.str)}: { $in: [${vals.join(", ")}] } });`,
    );
  },
};

const paginate: Topic = {
  id: "paginate",
  gen(rng, db) {
    if (db !== "mongodb") return null;
    const q = ctx(rng, db as Db);
    const size = pick(rng, [10, 20, 25]);
    const page = int(rng, 2, 6);
    return ex(
      `Muestra la página ${page} de ${q.ent.esP} (de ${size} en ${size}) ordenada por ${bare(q.str)}`,
      `db.${q.T}`,
      `  .find({}, { ${col(q, q.str)}: 1, ${col(q, q.num)}: 1, _id: 0 })`,
      `  .sort({ ${col(q, q.str)}: 1 })`,
      `  .skip(${size * (page - 1)})`,
      `  .limit(${size});`,
    );
  },
};

const project: Topic = {
  id: "project",
  gen(rng, db) {
    if (db !== "mongodb") return null;
    const q = ctx(rng, db as Db);
    const f = pick(rng, ["1.21", "0.9", "1.1", "100"]);
    const c = col(q, q.num);
    return ex(
      `Calcula un campo derivado de ${q.num.es} para ${los(q)} ${adj(q.flag, q.ent.g, true)}`,
      `db.${q.T}.aggregate([`,
      `  { $match: { ${col(q, q.flag)}: true } },`,
      `  { $project: { ${col(q, q.str)}: 1, result: { $multiply: ["$${c}", ${f}] } } }`,
      `]);`,
    );
  },
};

// ─────────────────────────── Ruta ───────────────────────────

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

export const SQL: Track = {
  id: "sql",
  label: "CONSULTA",
  cumulative: true,
  freeSetting: "dbEngine",
  variants: (Object.keys(NAME) as Db[]).map((id) => ({ id, name: NAME[id] })),
  symbols: ["(", ")", ",", ";", "=", "'", "*", ".", "_", ">", "<", "-", "%", "{", "}", ":", '"', "$", "[", "]", "^", ...DIGITS],
  steps: [
    {
      id: "sqlite", name: "SQLite", variants: ["sqlite"],
      desc: "Lo esencial: crear tablas, insertar, consultar con filtros, ordenar, actualizar, borrar y contar",
      topics: [createTable, insert, selectWhere, orderLimit, update, remove, count],
    },
    {
      id: "mysql", name: "MySQL", variants: ["mysql"],
      desc: "Relaciones y agregados: JOIN, GROUP BY con HAVING, índices, upsert, ALTER TABLE y LIKE",
      topics: [joinTopic, groupBy, upsert, index, alter, like],
    },
    {
      id: "postgresql", name: "PostgreSQL", variants: ["postgresql"],
      desc: "SQL avanzado: RETURNING, CTE con WITH, funciones de ventana, transacciones y JSON",
      topics: [returning, cte, windowFn, transaction, jsonTopic],
    },
    {
      id: "mongodb", name: "MongoDB", variants: ["mongodb"],
      desc: "Documentos con mongosh: todo lo anterior en MongoDB más arrays, $in, paginación y agregaciones",
      topics: [pushTopic, inTopic, paginate, project],
    },
  ],
};
