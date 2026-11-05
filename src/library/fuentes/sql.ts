import type { FuentesTema } from "./tipos";

const P = "https://www.postgresql.org/docs/current/";
export const sql: FuentesTema = {
  version: "PostgreSQL 18 (el estándar SQL varía entre motores)",
  entradas: {
    "SELECT … FROM": [P + "sql-select.html"],
    "WHERE": [P + "sql-select.html#SQL-WHERE"],
    "ORDER BY y LIMIT": [P + "sql-select.html#SQL-ORDERBY"],
    "INSERT INTO": [P + "sql-insert.html"],
    "UPDATE": [P + "sql-update.html"],
    "DELETE": [P + "sql-delete.html"],
    "CREATE TABLE": [P + "sql-createtable.html"],
    "JOIN": [P + "queries-table-expressions.html#QUERIES-JOIN"],
    "GROUP BY y funciones": [P + "queries-table-expressions.html#QUERIES-GROUP"],
    "Claves foráneas": [P + "ddl-constraints.html#DDL-CONSTRAINTS-FK"],
    "ALTER TABLE": [P + "sql-altertable.html"],
    "CREATE INDEX": [P + "sql-createindex.html"],
    "BEGIN / COMMIT / ROLLBACK": [P + "tutorial-transactions.html"],
    "Subconsultas": [P + "functions-subquery.html"],
    "WITH (CTE)": [P + "queries-with.html", "PostgreSQL 8.4"],
    "Funciones de ventana": [P + "tutorial-window.html", "PostgreSQL 8.4"],
    "Upsert": [P + "sql-insert.html#SQL-ON-CONFLICT", "PostgreSQL 9.5"],
    "EXPLAIN": [P + "sql-explain.html"],
    "Consultas parametrizadas": ["https://cheatsheetseries.owasp.org/cheatsheets/Query_Parameterization_Cheat_Sheet.html"],
    "MongoDB: find y updateOne": ["https://www.mongodb.com/docs/manual/reference/method/db.collection.find/"],
    "MongoDB: aggregate": ["https://www.mongodb.com/docs/manual/aggregation/"],
  },
};
