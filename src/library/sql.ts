import { type Topic, a, b, code, m } from "./types";

export const sql: Topic = {
  id: "sql",
  name: "SQL y bases de datos",
  group: "Web y datos",
  emblem: "sql",
  badge: "DB",
  color: "#ffb547",
  hl: "sql",
  summary:
    "SQL es el lenguaje para consultar y modificar bases de datos relacionales: los datos viven en tablas con filas y columnas, relacionadas por claves. " +
    "Los motores más usados son PostgreSQL, MySQL/MariaDB y SQLite. MongoDB es una base documental (no usa SQL) y se incluye al final.",
  facts: [
    { label: "Archivos", value: ".sql" },
    { label: "Clientes", value: "psql · mysql · sqlite3" },
    { label: "Motores", value: "PostgreSQL · MySQL · SQLite" },
    { label: "Convención", value: "palabras clave en MAYÚSCULAS" },
  ],
  workflow: [
    { title: "Migraciones versionadas", text: "Cada cambio de esquema es un archivo numerado (001_crear_tareas.sql…) aplicado en orden. Nunca edites a mano la base de producción." },
    { title: "Consultas con parámetros", text: "Nunca armes SQL concatenando texto del usuario: usá parámetros (?, %s, $1) para evitar inyección SQL." },
    { title: "Claves e índices", text: "Toda tabla con PRIMARY KEY; claves foráneas para las relaciones; índices en las columnas que se filtran o se unen seguido." },
    { title: "Transacciones", text: "Agrupá en una transacción los cambios que tienen que pasar todos juntos o ninguno (por ejemplo, mover dinero entre cuentas)." },
    { title: "Medir antes de optimizar", text: "EXPLAIN (o EXPLAIN ANALYZE en PostgreSQL) muestra cómo se ejecuta una consulta y si usa los índices." },
  ],
  entries: [
    b("Consultas", "SELECT … FROM", "Lee columnas de una tabla. * trae todas, pero conviene nombrar las que se usan.", code`
SELECT nombre, email
FROM usuarios;`, "consultar leer seleccionar"),
    b("Consultas", "WHERE", "Filtra filas. Combina condiciones con AND, OR, NOT, IN, BETWEEN, LIKE e IS NULL.", code`
SELECT * FROM productos
WHERE precio BETWEEN 10 AND 50
  AND categoria IN ('comida', 'limpieza')
  AND nombre LIKE 'Yer%';`, "filtrar condicion like"),
    b("Consultas", "ORDER BY y LIMIT", "Ordena el resultado y limita la cantidad de filas.", code`
SELECT nombre, precio FROM productos
ORDER BY precio DESC, nombre
LIMIT 10;`, "ordenar paginar top"),
    b("Modificar", "INSERT INTO", "Agrega filas nuevas.", code`
INSERT INTO usuarios (nombre, email)
VALUES ('Ana', 'ana@mail.com'),
       ('Luis', 'luis@mail.com');`, "insertar agregar crear fila"),
    b("Modificar", "UPDATE", "Cambia valores de filas existentes. Sin WHERE cambia TODAS las filas.", code`
UPDATE productos
SET precio = precio * 1.10
WHERE categoria = 'comida';`, "actualizar modificar"),
    b("Modificar", "DELETE", "Borra filas. Igual que UPDATE: siempre con WHERE (probalo antes con un SELECT).", code`
DELETE FROM sesiones
WHERE vence < CURRENT_DATE;`, "borrar eliminar"),
    b("Esquema", "CREATE TABLE", "Crea una tabla con columnas, tipos y restricciones.", code`
CREATE TABLE tareas (
    id INTEGER PRIMARY KEY,
    titulo VARCHAR(120) NOT NULL,
    hecha BOOLEAN NOT NULL DEFAULT FALSE
);`, "crear tabla esquema ddl"),

    m("Consultas", "JOIN", "Une tablas por una columna en común. INNER JOIN trae solo las que coinciden; LEFT JOIN conserva todas las de la izquierda.", code`
SELECT p.id, c.nombre, p.total
FROM pedidos AS p
JOIN clientes AS c ON c.id = p.cliente_id
LEFT JOIN envios AS e ON e.pedido_id = p.id
WHERE e.id IS NULL;   -- pedidos sin envío`, "unir relacionar inner left"),
    m("Agregación", "GROUP BY y funciones", "Agrupa filas y calcula COUNT, SUM, AVG, MIN o MAX por grupo. HAVING filtra los grupos.", code`
SELECT categoria, COUNT(*) AS cantidad, AVG(precio) AS promedio
FROM productos
GROUP BY categoria
HAVING COUNT(*) > 5;`, "agrupar contar sumar promedio having"),
    m("Esquema", "Claves foráneas", "REFERENCES asegura que la relación apunte a una fila que existe. ON DELETE define qué pasa al borrar.", code`
CREATE TABLE pedidos (
    id INTEGER PRIMARY KEY,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    total NUMERIC(10, 2) NOT NULL CHECK (total >= 0)
);`, "foreign key relacion integridad"),
    m("Esquema", "ALTER TABLE", "Modifica una tabla existente: agregar o renombrar columnas, restricciones.", code`
ALTER TABLE usuarios ADD COLUMN telefono VARCHAR(30);
ALTER TABLE usuarios RENAME COLUMN telefono TO celular;`, "modificar tabla columna"),
    m("Rendimiento", "CREATE INDEX", "Acelera búsquedas y uniones por una columna, a cambio de espacio y escrituras un poco más lentas.", code`
CREATE INDEX idx_pedidos_cliente ON pedidos (cliente_id);
CREATE UNIQUE INDEX idx_usuarios_email ON usuarios (email);`, "indice rendimiento velocidad"),
    m("Transacciones", "BEGIN / COMMIT / ROLLBACK", "Ejecuta varios cambios como uno solo: o se aplican todos o ninguno.", code`
BEGIN;
UPDATE cuentas SET saldo = saldo - 100 WHERE id = 1;
UPDATE cuentas SET saldo = saldo + 100 WHERE id = 2;
COMMIT;   -- o ROLLBACK si algo salió mal`, "transaccion atomico"),
    m("Consultas", "Subconsultas", "Una consulta dentro de otra, en WHERE, FROM o SELECT.", code`
SELECT nombre FROM clientes
WHERE id IN (SELECT cliente_id FROM pedidos WHERE total > 1000);`, "subquery anidada"),

    a("Consultas", "WITH (CTE)", "Nombra una consulta intermedia para usarla después. Hace legibles las consultas largas.", code`
WITH ventas_mes AS (
    SELECT cliente_id, SUM(total) AS total
    FROM pedidos
    WHERE fecha >= DATE '2026-11-01'
    GROUP BY cliente_id
)
SELECT c.nombre, v.total
FROM ventas_mes v JOIN clientes c ON c.id = v.cliente_id
ORDER BY v.total DESC;`, "cte with recursiva"),
    a("Consultas", "Funciones de ventana", "Calculan sobre un grupo de filas sin colapsarlas: rankings, acumulados, comparaciones con la fila anterior.", code`
SELECT nombre, categoria, precio,
       RANK() OVER (PARTITION BY categoria ORDER BY precio DESC) AS puesto,
       SUM(precio) OVER (ORDER BY id) AS acumulado
FROM productos;`, "window over partition rank"),
    a("Modificar", "Upsert", "Inserta o, si ya existe, actualiza. La sintaxis cambia según el motor.", code`
-- PostgreSQL y SQLite
INSERT INTO stock (producto_id, cantidad) VALUES (7, 5)
ON CONFLICT (producto_id) DO UPDATE SET cantidad = stock.cantidad + 5;

-- MySQL
INSERT INTO stock (producto_id, cantidad) VALUES (7, 5)
ON DUPLICATE KEY UPDATE cantidad = cantidad + 5;`, "insertar actualizar conflicto"),
    a("Rendimiento", "EXPLAIN", "Muestra el plan de ejecución: si usa índices o recorre toda la tabla.", code`
EXPLAIN ANALYZE
SELECT * FROM pedidos WHERE cliente_id = 42;`, "plan optimizar analizar"),
    a("Seguridad", "Consultas parametrizadas", "Los valores van aparte de la consulta: el motor nunca los interpreta como SQL. Es la defensa contra la inyección SQL.", code`
-- Python (sqlite3)
cur.execute("SELECT * FROM usuarios WHERE email = ?", (email,))
-- Node (pg)
await db.query("SELECT * FROM usuarios WHERE email = $1", [email]);`, "inyeccion sql injection seguridad"),
    a("MongoDB", "MongoDB: find y updateOne", "Base documental: guarda objetos JSON en colecciones. Las consultas son objetos.", code`
db.tareas.insertOne({ titulo: "Comprar", hecha: false, tags: ["casa"] });
db.tareas.find({ hecha: false, tags: "casa" }).sort({ creada: -1 }).limit(10);
db.tareas.updateOne({ _id: id }, { $set: { hecha: true } });`, "mongo nosql documentos"),
    a("MongoDB", "MongoDB: aggregate", "Pipeline de etapas para agrupar y transformar, como GROUP BY.", code`
db.pedidos.aggregate([
  { $match: { estado: "pagado" } },
  { $group: { _id: "$clienteId", total: { $sum: "$total" } } },
  { $sort: { total: -1 } },
]);`, "pipeline agrupar nosql"),
  ],
};
