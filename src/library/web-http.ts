import { type Topic, a, b, code, m } from "./types";
import { claseWebHttp } from "./clases/web-http";

export const webHttp: Topic = {
  id: "web-http",
  name: "Cómo funciona la web: HTTP, DNS y TLS",
  group: "Web y datos",
  emblem: null,
  badge: "WW",
  color: "#5ec8f2",
  hl: "linux",
  summary:
    "Qué pasa entre que escribís una dirección y se ve la página: el DNS la traduce a una IP, TCP y TLS abren una conexión segura, y HTTP pide y devuelve el contenido. " +
    "Los ejemplos usan curl, dig y openssl desde la terminal para ver cada paso con tus propios ojos.",
  facts: [
    { label: "Dirección", value: "esquema://dominio:puerto/ruta?consulta#ancla" },
    { label: "Métodos", value: "GET · POST · PUT · PATCH · DELETE" },
    { label: "Códigos", value: "2xx éxito · 3xx redirección · 4xx error del cliente · 5xx error del servidor" },
    { label: "Herramientas", value: "curl · dig · openssl · herramientas del navegador" },
  ],
  workflow: [
    { title: "Mirá la red en el navegador", text: "La pestaña Red de las herramientas de desarrollo muestra cada pedido, sus cabeceras, el código de respuesta y los tiempos." },
    { title: "Reproducí con curl", text: "Antes de culpar al código, repetí el pedido con curl -v. Si funciona ahí, el problema está en cómo lo hace tu aplicación." },
    { title: "Un error, un código", text: "4xx dice que el pedido está mal o no está permitido; 5xx, que el servidor falló. Leer el código ahorra mucho tiempo." },
    { title: "Siempre HTTPS", text: "HTTP sin cifrar deja leer y modificar todo en el camino. Redirigí a HTTPS y activá HSTS." },
    { title: "Cuando algo no carga, descartá por capas", text: "¿Resuelve el DNS? ¿Conecta el puerto? ¿Es válido el certificado? ¿Responde la aplicación? Cada capa se prueba con una herramienta distinta." },
  ],
  entries: [
    b("HTTP", "curl: un pedido GET", "curl hace pedidos HTTP desde la terminal. -i muestra las cabeceras de la respuesta y -s oculta la barra de progreso.", code`
curl https://example.com
curl -i https://example.com
curl -s https://api.ejemplo.com/usuarios/7 | head`, "curl get pedido http terminal"),
    b("HTTP", "Ver el diálogo completo con -v", "-v muestra todo: la conexión, el pedido que se envía (líneas con >) y la respuesta (líneas con <). Es la mejor herramienta para entender qué ocurre.", code`
curl -v https://example.com
# > GET / HTTP/2
# > Host: example.com
# < HTTP/2 200
# < content-type: text/html`, "curl verbose cabeceras diagnostico"),
    b("HTTP", "Códigos de estado", "El primer dígito resume el resultado. Los más comunes: 200 correcto, 201 creado, 301 y 302 redirección, 400 pedido mal formado, 401 sin autenticar, 403 sin permiso, 404 no existe, 429 demasiados pedidos y 500 error del servidor.", code`
curl -s -o /dev/null -w "%{http_code}\n" https://example.com          # 200
curl -s -o /dev/null -w "%{http_code}\n" https://example.com/nada      # 404`, "codigo estado status 404 500 200"),
    m("HTTP", "POST con JSON", "Para enviar datos se usa POST (o PUT y PATCH) con un cuerpo. La cabecera Content-Type avisa en qué formato viene.", code`
curl -X POST https://api.ejemplo.com/pedidos \
  -H "Content-Type: application/json" \
  -d '{"cliente": 7, "total": 50}'`, "post json cuerpo content-type enviar datos"),
    m("HTTP", "Autenticación con una cabecera", "Las APIs suelen pedir una clave o un token en la cabecera Authorization. Nunca lo pongas en la URL: queda en registros e historiales.", code`
curl https://api.ejemplo.com/perfil \
  -H "Authorization: Bearer $TOKEN"`, "authorization bearer token cabecera autenticacion"),
    m("HTTP", "Redirecciones", "Un 301 o 302 manda a otra dirección con la cabecera Location. curl no la sigue salvo que le pidas -L.", code`
curl -I http://example.com             # 301 y Location: https://example.com/
curl -L -s -o /dev/null -w "%{url_effective}\n" http://example.com`, "redireccion 301 302 location seguir"),
    m("HTTP", "Caché: Cache-Control y ETag", "Las cabeceras dicen cuánto puede guardarse una respuesta. Con ETag, el navegador pregunta si cambió y recibe un 304 sin cuerpo si no cambió.", code`
curl -sI https://ejemplo.com/logo.png | grep -iE "cache-control|etag"
# cache-control: public, max-age=31536000
# etag: "a1b2c3"

curl -sI https://ejemplo.com/logo.png -H 'If-None-Match: "a1b2c3"'     # 304 Not Modified`, "cache cache-control etag 304 condicional"),
    m("DNS", "dig: traducir un nombre a una IP", "El DNS convierte dominios en direcciones IP. dig consulta registros: A (IPv4), AAAA (IPv6), CNAME (alias), MX (correo) y TXT.", code`
dig +short example.com A
dig +short example.com AAAA
dig +short www.ejemplo.com CNAME
dig +short ejemplo.com MX
dig @1.1.1.1 example.com               # preguntarle a un servidor concreto`, "dns dig registro a cname mx resolver"),
    m("TLS", "openssl: ver el certificado de un sitio", "TLS cifra la conexión, y el certificado prueba que el servidor es quien dice ser. s_client muestra quién lo emitió y cuándo vence.", code`
openssl s_client -connect example.com:443 -servername example.com </dev/null 2>/dev/null \
  | openssl x509 -noout -subject -issuer -dates`, "tls certificado https openssl vencimiento ssl"),
    a("Navegador", "CORS: por qué el navegador bloquea un pedido", "El navegador no deja que una página lea respuestas de otro origen salvo que el servidor lo autorice con cabeceras CORS. Antes de un pedido no simple envía un OPTIONS de verificación.", code`
curl -i -X OPTIONS https://api.ejemplo.com/pedidos \
  -H "Origin: https://miapp.com" \
  -H "Access-Control-Request-Method: POST"
# access-control-allow-origin: https://miapp.com
# access-control-allow-methods: GET, POST`, "cors origen preflight options access-control"),
    a("Rendimiento", "Medir cada etapa de un pedido", "curl puede decir cuánto tardó cada paso: resolver el nombre, conectar, negociar TLS, esperar el primer byte y descargar.", code`
curl -s -o /dev/null https://example.com -w \
"dns: %{time_namelookup}s\nconexion: %{time_connect}s\ntls: %{time_appconnect}s\nprimer byte: %{time_starttransfer}s\ntotal: %{time_total}s\n"`, "tiempos latencia ttfb dns tls medir rendimiento"),
    a("Red", "Probar el camino: ping, traceroute y puertos", "ping comprueba si un equipo responde, traceroute muestra los saltos hasta él y nc revisa si un puerto está abierto.", code`
ping -c 3 example.com
traceroute example.com
nc -zv example.com 443          # ¿el puerto 443 acepta conexiones?`, "ping traceroute puerto nc red conectividad"),
  ],
  clase: claseWebHttp,
};
