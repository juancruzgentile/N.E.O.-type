import type { FuentesTema } from "./tipos";

const MDN = "https://developer.mozilla.org/es/docs/Web/";
const CURL = "https://curl.se/docs/manpage.html";
export const webHttp: FuentesTema = {
  version: "HTTP/1.1, HTTP/2 y HTTP/3 (RFC 9110 y siguientes)",
  entradas: {
    "curl: un pedido GET": [CURL],
    "Ver el diálogo completo con -v": [CURL],
    "Códigos de estado": [MDN + "HTTP/Reference/Status"],
    "POST con JSON": [MDN + "HTTP/Reference/Methods/POST"],
    "Autenticación con una cabecera": [MDN + "HTTP/Reference/Headers/Authorization"],
    "Redirecciones": ["https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Redirections"],
    "Caché: Cache-Control y ETag": [MDN + "HTTP/Guides/Caching"],
    "dig: traducir un nombre a una IP": ["https://bind9.readthedocs.io/en/latest/manpages.html"],
    "openssl: ver el certificado de un sitio": ["https://docs.openssl.org/master/man1/openssl-s_client/"],
    "CORS: por qué el navegador bloquea un pedido": [MDN + "HTTP/Guides/CORS"],
    "Medir cada etapa de un pedido": [CURL],
    "Probar el camino: ping, traceroute y puertos": ["https://github.com/iputils/iputils"],
  },
};

const FETCH = MDN + "API/Fetch_API/Using_Fetch";
export const apis: FuentesTema = {
  version: "JSON sobre HTTP (Node.js 24, Express 5)",
  entradas: {
    "fetch: un GET que devuelve JSON": [FETCH],
    "fetch: POST con JSON": [FETCH],
    "Revisar response.ok": [MDN + "API/Response/ok"],
    "Autenticación con Bearer": ["https://www.rfc-editor.org/rfc/rfc6750"],
    "Paginación con cursor": [MDN + "JavaScript/Reference/Statements/for-await...of"],
    "Reintentos ante 429 y 503": ["https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Retry-After"],
    "REST: recursos y verbos": ["https://expressjs.com/en/guide/routing.html"],
    "Errores con un formato único": ["https://www.rfc-editor.org/rfc/rfc9457"],
    "Clave de idempotencia en un POST": ["https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/"],
    "Limitar pedidos por cliente": ["https://owasp.org/API-Security/editions/2023/en/0xa4-unrestricted-resource-consumption/"],
    "Verificar la firma de un webhook": ["https://nodejs.org/api/crypto.html"],
    "GraphQL: pedir solo lo que necesitás": ["https://graphql.org/learn/queries/"],
  },
};

const PT = "https://docs.pytest.org/en/stable/";
export const testing: FuentesTema = {
  version: "pytest 8 y Python 3.14",
  entradas: {
    "Tu primera prueba con assert": [PT + "how-to/assert.html"],
    "pytest.raises: comprobar que falla": [PT + "how-to/assert.html"],
    "Arreglo, acción, comprobación": [PT + "explanation/anatomy.html"],
    "Fixtures: preparar lo que necesita la prueba": [PT + "how-to/fixtures.html"],
    "parametrize: muchos casos, una prueba": [PT + "how-to/parametrize.html"],
    "tmp_path y monkeypatch": [PT + "how-to/tmp_path.html"],
    "unittest.mock: reemplazar lo externo": ["https://docs.python.org/3/library/unittest.mock.html"],
    "Controlar el tiempo inyectando el reloj": ["https://docs.python.org/3/library/datetime.html"],
    "Fixtures con yield: preparar y limpiar": [PT + "how-to/fixtures.html"],
    "Prueba de integración con SQLite en memoria": ["https://docs.python.org/3/library/sqlite3.html"],
    "Marcadores: skip, xfail y marcas propias": [PT + "how-to/skipping.html"],
    "Probar código asíncrono": ["https://docs.python.org/3/library/asyncio-runner.html"],
    "Cobertura: qué líneas ejecutan las pruebas": ["https://pytest-cov.readthedocs.io/en/latest/"],
  },
};

const D = "https://docs.docker.com/";
export const docker: FuentesTema = {
  version: "Docker Engine 28 y Compose v2",
  entradas: {
    "docker run: arrancar un contenedor": [D + "reference/cli/docker/container/run/"],
    "ps, logs, exec y stop": [D + "reference/cli/docker/container/ls/"],
    "Imágenes: pull, images y rmi": [D + "reference/cli/docker/image/pull/"],
    "Un Dockerfile básico": [D + "reference/dockerfile/"],
    "docker build y etiquetas": [D + "reference/cli/docker/buildx/build/"],
    "Puertos y variables de entorno": [D + "reference/cli/docker/container/run/"],
    "Volúmenes: que los datos sobrevivan": [D + "engine/storage/volumes/"],
    ".dockerignore: no mandar de más": [D + "build/concepts/context/"],
    "Docker Compose: varios servicios juntos": [D + "compose/"],
    "Construcción en varias etapas": [D + "build/building/multi-stage/"],
    "Usuario sin privilegios y healthcheck": [D + "reference/dockerfile/"],
    "Ver el espacio y limpiar": [D + "reference/cli/docker/system/prune/"],
  },
};
