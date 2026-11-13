import { type Topic, a, b, code, m } from "./types";
import { claseSeguridadDatos } from "./clases/seguridad-datos";

export const seguridadDatos: Topic = {
  id: "seguridad-datos",
  name: "Seguridad de los datos",
  group: "Bases de datos",
  emblem: null,
  badge: "SG",
  color: "#ff5c7a",
  hl: "sql",
  summary:
    "Cómo proteger los datos que guarda una aplicación: consultas parametrizadas contra la inyección SQL, permisos mínimos por rol, contraseñas con hash, seguridad a nivel de fila, cifrado en tránsito y en reposo, y auditoría. " +
    "Los ejemplos son de PostgreSQL, pero las ideas valen para cualquier base.",
  facts: [
    { label: "Principio base", value: "mínimo privilegio: cada cosa con los permisos justos" },
    { label: "Riesgo número uno", value: "control de acceso roto e inyección (OWASP Top 10)" },
    { label: "Cifrado", value: "en tránsito (TLS) y en reposo (disco o columna)" },
    { label: "Contraseñas", value: "nunca en texto: hash lento con sal (bcrypt, Argon2)" },
  ],
  workflow: [
    { title: "Nunca armes SQL con texto del usuario", text: "Usá siempre consultas parametrizadas. Es la defensa más efectiva y barata contra la inyección SQL." },
    { title: "Un rol por función con lo justo", text: "La aplicación no es superusuario. Un rol para leer, otro para escribir, otro para migraciones: cada uno con solo lo que necesita." },
    { title: "Cifrá todo en tránsito", text: "La conexión a la base y a los servicios siempre con TLS verificado. Sin cifrado, cualquiera en el camino lee los datos." },
    { title: "Guardá lo mínimo", text: "El dato que no guardás no se puede filtrar. Pedí y conservá solo lo necesario, y borralo cuando deja de serlo." },
    { title: "Secretos fuera del código", text: "Contraseñas y claves van en variables de entorno o en un gestor de secretos, nunca en el repositorio." },
    { title: "Registrá y mirá los accesos", text: "Sin registros no sabés si hubo una intrusión. Anotá quién accedió a qué y revisá lo raro." },
  ],
  entries: [
    b("Inyección", "Consulta parametrizada con PREPARE", "El texto de la consulta y los valores viajan separados, así el dato nunca se interpreta como SQL. En el código de la aplicación se hace con los parámetros del driver.", code`
PREPARE buscar_usuario (text) AS
  SELECT id, nombre FROM usuarios WHERE email = $1;

EXECUTE buscar_usuario ('ana@ejemplo.com');
-- aunque el valor sea  ' OR '1'='1  se trata como un texto, no como SQL`, "parametros prepare inyeccion sql seguro consulta preparada"),
    b("Permisos", "Crear un rol sin privilegios de más", "Cada aplicación se conecta con su propio rol. Sin SUPERUSER, sin CREATEDB y con un límite de conexiones.", code`
CREATE ROLE app_web LOGIN PASSWORD 'cambiame-por-algo-largo'
  NOSUPERUSER NOCREATEDB NOCREATEROLE
  CONNECTION LIMIT 20;`, "rol usuario sin superuser privilegios minimo"),
    b("Permisos", "GRANT: solo lo necesario", "Dar permisos tabla por tabla y operación por operación. Lo que no se concede, no se puede hacer.", code`
GRANT CONNECT ON DATABASE tienda TO app_web;
GRANT USAGE ON SCHEMA public TO app_web;
GRANT SELECT, INSERT, UPDATE ON pedidos TO app_web;
GRANT SELECT ON productos TO app_web;
-- sin DELETE ni DROP: la aplicación no los necesita`, "grant permisos tabla minimo privilegio"),
    b("Permisos", "REVOKE: quitar lo que viene por defecto", "En muchas versiones, cualquier rol puede crear objetos en el esquema público y conectarse a cualquier base. Conviene cerrarlo.", code`
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON DATABASE tienda FROM PUBLIC;
REVOKE DELETE ON pedidos FROM app_web;`, "revoke public esquema por defecto quitar permisos"),
    m("Contraseñas", "Hash de contraseñas con pgcrypto", "Nunca guardes una contraseña en texto. crypt con gen_salt('bf') genera un hash lento con sal propia. Para verificar, se vuelve a calcular con la sal guardada.", code`
CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO usuarios (email, clave_hash)
VALUES ('ana@ejemplo.com', crypt('mi clave larga', gen_salt('bf', 12)));

SELECT id FROM usuarios
WHERE email = 'ana@ejemplo.com'
  AND clave_hash = crypt('mi clave larga', clave_hash);`, "contrasena hash bcrypt pgcrypto sal crypt"),
    m("Acceso", "Seguridad a nivel de fila", "Una política decide qué filas puede ver o modificar cada rol, en la propia base. Aunque la aplicación se equivoque en un WHERE, cada usuario solo ve lo suyo.", code`
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;

CREATE POLICY pedidos_propios ON pedidos
  USING (cliente_id = current_setting('app.cliente_id')::bigint);

-- la aplicación fija el cliente al empezar cada transacción
SET LOCAL app.cliente_id = '7';`, "row level security rls politica filas multiusuario"),
    m("Acceso", "Una vista que oculta columnas", "Una vista expone solo las columnas permitidas. Se da permiso sobre la vista y no sobre la tabla con los datos sensibles.", code`
CREATE VIEW usuarios_publico AS
  SELECT id, nombre, ciudad FROM usuarios;     -- sin email ni clave_hash

GRANT SELECT ON usuarios_publico TO app_lectura;
REVOKE ALL ON usuarios FROM app_lectura;`, "vista ocultar columnas datos sensibles enmascarar"),
    m("Cifrado", "Cifrar una columna con pgp_sym_encrypt", "Cifra el dato dentro de la base: sin la clave, lo que se guarda es ilegible. La clave no puede estar en la misma base ni en el código.", code`
INSERT INTO pacientes (nombre, diagnostico)
VALUES ('Ana', pgp_sym_encrypt('gripe', current_setting('app.clave')));

SELECT nombre, pgp_sym_decrypt(diagnostico, current_setting('app.clave')) AS diagnostico
FROM pacientes;`, "cifrar columna pgp encrypt decrypt clave sensible"),
    m("Cifrado", "Conexión cifrada y verificada", "Sin TLS, quien esté en el camino lee las consultas y las contraseñas. verify-full cifra y además comprueba que el servidor es el correcto.", code`
-- cadena de conexión de la aplicación
postgresql://app_web@db.ejemplo.com:5432/tienda?sslmode=verify-full&sslrootcert=/etc/ssl/ca.pem

-- desde el servidor: ver si las conexiones usan TLS
SELECT pid, ssl, version, cipher FROM pg_stat_ssl;`, "tls ssl cifrado transito sslmode verify full"),
    a("Auditoría", "Registrar los cambios con un trigger", "Un disparador (trigger) anota quién cambió qué y cuándo en una tabla de auditoría. Sirve para investigar y para cumplir normas.", code`
CREATE TABLE auditoria (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tabla text, operacion text, usuario text DEFAULT current_user,
  cuando timestamptz DEFAULT now(), antes jsonb, despues jsonb
);

CREATE FUNCTION auditar() RETURNS trigger AS $$
BEGIN
  INSERT INTO auditoria (tabla, operacion, antes, despues)
  VALUES (TG_TABLE_NAME, TG_OP, to_jsonb(OLD), to_jsonb(NEW));
  RETURN COALESCE(NEW, OLD);
END $$ LANGUAGE plpgsql;

CREATE TRIGGER auditar_pedidos AFTER UPDATE OR DELETE ON pedidos
  FOR EACH ROW EXECUTE FUNCTION auditar();`, "auditoria trigger registro cambios quien cuando"),
    a("Red", "pg_hba.conf: quién puede conectarse", "El archivo pg_hba.conf decide qué usuarios pueden conectarse a qué bases, desde qué direcciones y con qué método. La primera regla que coincide gana.", code`
# TIPO     BASE    USUARIO   DIRECCION        METODO
hostssl    tienda  app_web   10.0.1.0/24      scram-sha-256
host       all     all       0.0.0.0/0        reject`, "pg_hba autenticacion red direccion scram acceso"),
    a("Límites", "Limitar el daño de una consulta o un rol", "Un tiempo máximo por consulta y un límite de conexiones evitan que un error o un ataque tumbe la base entera.", code`
ALTER ROLE app_web SET statement_timeout = '5s';
ALTER ROLE app_web SET idle_in_transaction_session_timeout = '30s';
ALTER ROLE app_web CONNECTION LIMIT 20;`, "statement timeout limite conexiones denegacion servicio"),
  ],
  clase: claseSeguridadDatos,
};
