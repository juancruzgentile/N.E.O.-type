import { type Clase, code } from "../types";

export const claseSeguridadDatos: Clase = {
  titulo: "Seguridad de los datos: que lo guardado no se filtre ni se pierda",
  bajada:
    "Las defensas que de verdad importan al guardar datos: no confiar en lo que entra, dar permisos mínimos, cifrar, registrar. " +
    "Con los ataques más comunes (inyección SQL, control de acceso roto, filtraciones) y cómo se cierran.",
  secciones: [
    {
      heading: "Qué es y qué problema resuelve",
      parrafos: [
        "La seguridad de los datos es el conjunto de prácticas que evitan que la información guardada sea leída, modificada o destruida por quien no debe, y que ayudan a recuperarse si pasa. Se suele ordenar en tres propiedades: confidencialidad (solo accede quien debe), integridad (nadie la altera sin que se note) y disponibilidad (está cuando se necesita).",
        "El problema que resuelve es que una base de datos concentra lo más valioso de una aplicación y, a la vez, recibe datos de desconocidos todo el tiempo. Una filtración expone a los usuarios, cuesta dinero y reputación, y en muchos países tiene consecuencias legales. La buena noticia es que la mayoría de los ataques reales explotan errores comunes y conocidos, no técnicas sofisticadas, y se evitan con hábitos básicos.",
      ],
    },
    {
      heading: "Historia corta",
      parrafos: [
        "La inyección SQL se describió públicamente en 1998, y casi tres décadas después sigue apareciendo en las listas de riesgos: es el ejemplo de un error de diseño que el lenguaje no impide. OWASP, una organización abierta dedicada a la seguridad de las aplicaciones, publica desde 2003 su lista de los diez riesgos más críticos (OWASP Top 10). En las ediciones recientes, el control de acceso roto encabeza la lista y la inyección sigue entre los primeros puestos.",
        "En paralelo, la legislación cambió el panorama: normas como el RGPD europeo (2018) obligan a proteger los datos personales, a notificar las filtraciones y a poder borrar los datos de una persona. La seguridad dejó de ser opcional.",
      ],
    },
    {
      heading: "Cómo piensa un atacante",
      parrafos: [
        "Conviene entender cómo se ataca para defenderse. Un atacante rara vez rompe el cifrado: busca la puerta más fácil. Prueba si los datos que envía se interpretan como código (inyección). Prueba si puede ver datos de otro usuario cambiando un número en una dirección (control de acceso roto). Busca contraseñas filtradas en otros sitios y las prueba contra el tuyo. Busca bases expuestas sin contraseña en internet, claves olvidadas en el repositorio, copias de seguridad públicas.",
        "De ahí salen los tres principios que ordenan todo lo demás. Mínimo privilegio: que cada persona, aplicación y rol tenga solo los permisos que necesita, de modo que un compromiso cause poco daño. Defensa en profundidad: varias capas, para que el fallo de una no exponga todo. Y no confiar en nada que venga de afuera: todo dato externo se trata como potencialmente malicioso.",
      ],
    },
    {
      heading: "El ataque más famoso: la inyección SQL",
      parrafos: [
        "Ocurre cuando la aplicación arma una consulta pegando texto que escribió el usuario. Si el usuario escribe algo que parece SQL, la base lo ejecuta como tal. La defensa es una sola, simple y efectiva: las consultas parametrizadas, en las que el texto de la consulta y los valores viajan por separado, y los valores nunca se interpretan como código.",
      ],
      codigo: [
        {
          lang: "python",
          text: code`
email = request.args["email"]          # el usuario escribe:  ' OR '1'='1

# MAL: la entrada se vuelve parte del SQL
cur.execute("SELECT * FROM usuarios WHERE email = '" + email + "'")

# BIEN: parámetros; el valor nunca se interpreta como SQL
cur.execute("SELECT * FROM usuarios WHERE email = %s", (email,))`,
        },
      ],
    },
    {
      heading: "Las defensas, capa por capa",
      parrafos: [
        "Una base de datos bien protegida tiene varias capas. Ninguna alcanza sola:",
      ],
      lista: [
        "Red: la base no es accesible desde internet; solo la aplicación, por una red privada, y con una lista de direcciones permitidas.",
        "Autenticación: contraseñas largas y únicas por rol, método moderno (SCRAM), y claves en un gestor de secretos.",
        "Permisos: un rol por función con lo mínimo (leer, escribir, migrar), sin superusuario en la aplicación.",
        "Entradas: consultas parametrizadas siempre, y validación de lo que entra.",
        "Cifrado en tránsito: TLS verificado en toda conexión. En reposo: disco cifrado y, para lo más sensible, cifrado de columna.",
        "Contraseñas de usuarios: nunca en texto; hash lento con sal propia (Argon2 o bcrypt).",
        "Auditoría: registrar quién accede y cambia qué, y revisarlo.",
        "Copias: cifradas, probadas y fuera del alcance de un atacante que comprometa el servidor.",
      ],
      codigo: [
        code`
CREATE ROLE app_web LOGIN PASSWORD 'cambiame-por-algo-largo' NOSUPERUSER;
GRANT SELECT, INSERT, UPDATE ON pedidos TO app_web;     -- sin DELETE ni DROP

ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
CREATE POLICY propios ON pedidos
  USING (cliente_id = current_setting('app.cliente_id')::bigint);

-- contraseñas: hash lento con sal
INSERT INTO usuarios (email, clave_hash)
VALUES ('ana@ejemplo.com', crypt('mi clave larga', gen_salt('bf', 12)));`,
      ],
    },
    {
      heading: "Cifrado: qué protege y qué no",
      parrafos: [
        "El cifrado en tránsito (TLS) protege los datos mientras viajan por la red. El cifrado en reposo protege los datos guardados si alguien se lleva el disco o una copia. Pero ninguno de los dos protege contra una aplicación comprometida: si el atacante usa las credenciales de la aplicación, la base descifra los datos para él. Por eso se complementan con permisos mínimos.",
        "El cifrado de columnas (pgp_sym_encrypt en PostgreSQL, o cifrado en la aplicación) protege datos especialmente sensibles incluso frente a quien lee la base, a costa de que no se pueden buscar ni ordenar con facilidad. Y la regla de oro: la clave no puede vivir en el mismo lugar que los datos cifrados.",
      ],
    },
    {
      heading: "Errores que comete casi todo el mundo",
      parrafos: [
        "Los que más filtraciones provocaron:",
      ],
      lista: [
        "Una base expuesta a internet sin contraseña o con la de fábrica: motores de búsqueda de dispositivos las encuentran en minutos.",
        "Claves y contraseñas en el repositorio de código, incluso en el historial de Git. Si se subieron una vez, considerá que se filtraron y rotalas.",
        "La aplicación conectada como superusuario: una sola inyección da control total.",
        "Guardar contraseñas en texto o con un hash rápido sin sal (MD5, SHA-1): se descifran por fuerza bruta.",
        "Comprobar los permisos solo en el front-end: quien llama directo a la API los salta. Se verifican siempre en el servidor, por cada recurso.",
        "Mostrar errores internos al usuario (con la consulta, tablas, rutas): le regalan información al atacante.",
        "Datos reales en ambientes de prueba y desarrollo, con menos protección que producción.",
        "Copias de seguridad sin cifrar y en un lugar de acceso público.",
      ],
      codigo: [
        code`
-- ver rápidamente quién tiene privilegios de más
SELECT rolname, rolsuper, rolcreatedb, rolcreaterole
FROM pg_roles
WHERE rolsuper OR rolcreatedb OR rolcreaterole;

-- y qué puede hacer un rol sobre una tabla
SELECT privilege_type
FROM information_schema.role_table_grants
WHERE grantee = 'app_web' AND table_name = 'pedidos';`,
      ],
    },
    {
      heading: "Dónde se aplica cada defensa",
      parrafos: [
        "Qué defensa cubre qué riesgo:",
      ],
      tabla: {
        cabeza: ["Riesgo", "Defensa principal", "Complemento"],
        filas: [
          ["Inyección SQL", "Consultas parametrizadas", "Rol con permisos mínimos"],
          ["Control de acceso roto (ver datos ajenos)", "Verificar el permiso en el servidor por cada recurso", "Seguridad a nivel de fila"],
          ["Robo de contraseñas", "Hash lento con sal; segundo factor", "Detectar intentos masivos"],
          ["Interceptar la conexión", "TLS verificado", "Red privada"],
          ["Robo de un disco o de una copia", "Cifrado en reposo", "Copias cifradas con clave aparte"],
          ["Cuenta de aplicación comprometida", "Mínimo privilegio", "Auditoría y alertas"],
          ["Borrado o cifrado por ransomware", "Copias inmutables y probadas", "Segmentar la red"],
        ],
      },
    },
    {
      heading: "Cómo seguir",
      parrafos: [
        "Usá la pestaña Referencia de este tema para recordar los comandos de PostgreSQL. Para practicar, revisá un proyecto tuyo con esta lista: ¿la aplicación usa consultas parametrizadas?, ¿se conecta como superusuario?, ¿hay claves en el repositorio?, ¿la conexión usa TLS?, ¿probaste restaurar una copia?",
        "OWASP publica guías gratuitas y muy prácticas (la hoja de referencia de consultas parametrizadas y la de almacenamiento de contraseñas, entre otras), y la documentación de PostgreSQL explica roles, seguridad por fila y cifrado con detalle.",
      ],
    },
  ],
  fuentes: [
    { texto: "OWASP Top 10", url: "https://owasp.org/www-project-top-ten/" },
    { texto: "OWASP: consultas parametrizadas", url: "https://cheatsheetseries.owasp.org/cheatsheets/Query_Parameterization_Cheat_Sheet.html" },
    { texto: "OWASP: almacenamiento de contraseñas", url: "https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html" },
    { texto: "PostgreSQL: seguridad a nivel de fila", url: "https://www.postgresql.org/docs/current/ddl-rowsecurity.html" },
  ],
  revisada: "2026-11-12",
};
