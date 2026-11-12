import { type Clase, code } from "../types";

export const claseWebHttp: Clase = {
  titulo: "Cómo funciona la web: del nombre de dominio a la página en pantalla",
  bajada:
    "Qué pasa en los milisegundos entre que escribís una dirección y se ve la página: DNS, conexión, cifrado y HTTP. " +
    "Con herramientas para mirar cada paso, las ideas que explican casi todos los errores y por qué el navegador a veces bloquea tus pedidos.",
  secciones: [
    {
      heading: "Qué es y qué problema resuelve",
      parrafos: [
        "La web es un sistema para pedir y recibir documentos y datos a través de internet. Se apoya en tres ideas simples: una dirección única para cada recurso (la URL), un protocolo común para pedirlo (HTTP) y un formato común para describir el contenido (HTML y sus compañeros). Un navegador es un cliente que hace pedidos HTTP y dibuja lo que recibe; una aplicación web es un servidor que responde a esos pedidos.",
        "Entender el camino de un pedido resuelve un problema práctico: cuando algo no carga, hay cinco o seis lugares donde puede fallar (el nombre no se resuelve, el servidor no responde, el certificado venció, la aplicación devuelve un error, el navegador bloquea la respuesta), y cada uno se diagnostica distinto. Quien conoce el camino encuentra el problema en minutos; quien no, prueba cosas al azar.",
      ],
    },
    {
      heading: "Historia corta",
      parrafos: [
        "Tim Berners-Lee la inventó en el CERN entre 1989 y 1991: la primera página, el primer servidor y el primer navegador. El DNS, el sistema que traduce nombres a direcciones IP, es anterior (Paul Mockapetris, 1983) y reemplazó a un archivo de texto compartido que había que descargar.",
      ],
      lista: [
        "HTTP/1.0 (1996) y HTTP/1.1 (1997): texto plano, un pedido tras otro por conexión. HTTP/1.1 se mantuvo casi veinte años.",
        "SSL de Netscape (1995), luego TLS: el cifrado que convirtió a la web en lugar seguro para pagar y para iniciar sesión. TLS 1.3 es de 2018.",
        "HTTP/2 (2015): binario y con varios pedidos a la vez por una sola conexión. HTTP/3 (2022): sobre QUIC, que usa UDP y se recupera mejor en redes malas.",
        "Let's Encrypt (2015) hizo gratuitos y automáticos los certificados, y HTTPS pasó de ser la excepción a ser la norma.",
      ],
    },
    {
      heading: "Cómo funciona por dentro: el camino de una URL",
      parrafos: [
        "Cuando escribís https://www.ejemplo.com/productos?id=7 y apretás Enter, el navegador hace, en orden, esto. Primero, el DNS: pregunta qué dirección IP tiene www.ejemplo.com (y guarda la respuesta un tiempo, el TTL). Segundo, abre una conexión TCP a esa IP, normalmente al puerto 443. Tercero, negocia TLS: el servidor presenta su certificado, el navegador comprueba que lo emitió una autoridad de confianza para ese dominio, y ambos acuerdan una clave para cifrar. Cuarto, envía el pedido HTTP, con el método (GET), la ruta, el dominio y cabeceras. Quinto, el servidor responde con un código de estado, cabeceras y un cuerpo.",
        "Con la respuesta, el navegador interpreta el HTML, descubre que necesita estilos, scripts e imágenes y hace más pedidos, en paralelo. Una página típica son decenas o cientos de pedidos. Cada paso tiene un costo de tiempo, por eso la latencia (la distancia a los servidores) importa tanto, y por eso existen las cachés, las redes de distribución de contenido (CDN) y las conexiones reutilizadas.",
      ],
    },
    {
      heading: "Tu primer pedido, mirado de cerca",
      parrafos: [
        "Con curl -v ves el diálogo completo. Las líneas con * son la conexión, las que empiezan con > son lo que envías y las que empiezan con < lo que recibís.",
      ],
      codigo: [
        code`
curl -v https://example.com 2>&1 | head -30

# * Host example.com:443 was resolved.          <- DNS
# * Connected to example.com port 443           <- TCP
# * SSL connection using TLSv1.3                <- TLS
# > GET / HTTP/2                                <- el pedido
# > Host: example.com
# > User-Agent: curl/8.x
# < HTTP/2 200                                  <- la respuesta
# < content-type: text/html
# < cache-control: max-age=...`,
      ],
    },
    {
      heading: "Qué hace cada parte",
      parrafos: [
        "La primera línea del pedido es el método (GET pide un recurso), la ruta y la versión del protocolo. Las cabeceras que siguen son pares nombre-valor con información extra: a quién se le pide (Host), quién pide (User-Agent), qué formatos acepta, si hay una credencial (Authorization). La respuesta empieza con el código de estado, seguido de sus propias cabeceras (tipo de contenido, caché, cookies) y, tras una línea en blanco, el cuerpo.",
        "Todo es texto legible (o equivalente en HTTP/2). Eso es lo que hace tan fácil depurar la web: podés pedir lo mismo con curl, ver exactamente qué se envía y comparar con lo que hace tu aplicación.",
      ],
    },
    {
      heading: "Los cinco conceptos que sostienen todo lo demás",
      parrafos: [
        "Con estos cinco entendés casi cualquier problema de la web:",
      ],
      lista: [
        "URL: esquema, dominio, puerto, ruta, consulta (?a=1) y ancla (#sección). El ancla nunca se envía al servidor.",
        "Métodos y códigos de estado: GET lee (no debe cambiar nada), POST crea o ejecuta, PUT y PATCH modifican, DELETE borra. 2xx éxito, 3xx redirección, 4xx culpa del cliente, 5xx culpa del servidor.",
        "Cabeceras: metadatos del pedido y la respuesta (Content-Type, Authorization, Cache-Control, Set-Cookie…).",
        "Sin estado y cookies: HTTP no recuerda nada entre pedidos. Para saber quién sos, el servidor entrega una cookie o un token, y el navegador lo devuelve en cada pedido.",
        "Caché y seguridad: Cache-Control dice cuánto puede reutilizarse una respuesta, y HTTPS cifra y autentica la conexión.",
      ],
      codigo: [
        code`
curl -i -X POST https://api.ejemplo.com/sesion \
  -H "Content-Type: application/json" \
  -d '{"usuario":"ana","clave":"..."}'
# HTTP/2 200
# set-cookie: sid=abc123; HttpOnly; Secure; SameSite=Lax; Max-Age=3600

curl https://api.ejemplo.com/perfil -b "sid=abc123"`,
      ],
    },
    {
      heading: "El misterio de CORS",
      parrafos: [
        "Por seguridad, el navegador aplica la política del mismo origen: una página cargada desde https://miapp.com no puede leer la respuesta de un pedido a https://api.otro.com, salvo que esa API lo permita con cabeceras (Access-Control-Allow-Origin y compañía). Esto es lo que se llama CORS, y es el origen de uno de los mensajes de error más consultados de la programación web.",
        "Tres cosas que aclaran el panorama. El bloqueo lo hace el navegador, no el servidor: curl o tu backend no tienen ese problema. El servidor igual recibe y procesa el pedido; lo que bloquea el navegador es que tu página lea la respuesta. Y la solución siempre está del lado del servidor, que tiene que responder con las cabeceras correctas (y, para pedidos que no son simples, contestar bien a un pedido OPTIONS previo).",
      ],
    },
    {
      heading: "Errores que comete casi todo el mundo",
      parrafos: [
        "Los que más se repiten:",
      ],
      lista: [
        "Usar GET para acciones que cambian datos (\"borrar\" con un enlace): un buscador o una precarga lo dispara sin querer.",
        "Poner contraseñas o tokens en la URL: quedan en el historial, en los registros del servidor y en las cabeceras Referer.",
        "Cookies sin las marcas de seguridad: sin HttpOnly las lee cualquier script; sin Secure viajan por HTTP; sin SameSite se envían en pedidos desde otros sitios.",
        "Contenido mixto: una página HTTPS que carga un script por HTTP es bloqueada por el navegador.",
        "No poner tiempos máximos en los pedidos del servidor a otros servicios: un servicio lento cuelga el tuyo.",
        "Confiar en lo que dice el cliente (cabeceras, campos ocultos, precios): todo se puede falsificar. Se valida en el servidor.",
        "Una redirección 301 equivocada: los navegadores la guardan casi para siempre, y corregirla del lado del servidor no alcanza.",
        "Olvidar renovar el certificado: el sitio pasa a mostrar un aviso de seguridad a todos los visitantes.",
      ],
      codigo: [
        code`
# ¿cuándo vence el certificado?
openssl s_client -connect ejemplo.com:443 -servername ejemplo.com </dev/null 2>/dev/null \
  | openssl x509 -noout -enddate

# ¿qué cookies y con qué marcas?
curl -sI https://ejemplo.com/login | grep -i set-cookie`,
      ],
    },
    {
      heading: "Dónde conviene cada versión y cada alternativa",
      parrafos: [
        "HTTP no es la única forma de comunicarse. Cuál usar según el caso:",
      ],
      tabla: {
        cabeza: ["Necesidad", "Opción", "Por qué"],
        filas: [
          ["Páginas y APIs de pedido y respuesta", "HTTP (idealmente HTTP/2 o HTTP/3)", "Es universal, cacheable y entendido por todas las herramientas."],
          ["Datos en tiempo real en ambos sentidos (chat, juegos)", "WebSocket", "Una conexión abierta por la que cualquiera de los dos envía cuando quiere."],
          ["Actualizaciones del servidor al cliente (notificaciones, progreso)", "Server-Sent Events", "Más simple que WebSocket si solo el servidor habla."],
          ["Comunicación entre microservicios con tipos estrictos", "gRPC", "Binario y rápido, con contrato definido."],
          ["Muchos pedidos chicos con pocos servidores", "HTTP/2 o HTTP/3", "Multiplexan varios pedidos por una conexión."],
          ["Servicios que necesitan baja latencia a usuarios lejanos", "CDN", "Acerca el contenido al usuario."],
        ],
      },
    },
    {
      heading: "Cómo seguir",
      parrafos: [
        "Usá la pestaña Referencia de este tema para recordar los comandos. Para practicar, tomá un sitio cualquiera y respondé con herramientas: ¿qué IP tiene?, ¿quién emitió su certificado y cuándo vence?, ¿qué código y qué cabeceras devuelve?, ¿cuánto tarda cada etapa? Después abrí la pestaña Red del navegador y mirá los mismos pedidos.",
        "MDN tiene una guía de HTTP completa y en español. Los estándares (las RFC 9110 y siguientes) son largos pero muy claros. Y la clase de APIs de esta Biblioteca sigue desde acá: cómo diseñar los pedidos y respuestas de un servicio.",
      ],
    },
  ],
  fuentes: [
    { texto: "MDN: HTTP", url: "https://developer.mozilla.org/es/docs/Web/HTTP" },
    { texto: "RFC 9110: semántica de HTTP", url: "https://www.rfc-editor.org/rfc/rfc9110" },
    { texto: "MDN: CORS", url: "https://developer.mozilla.org/es/docs/Web/HTTP/Guides/CORS" },
    { texto: "Documentación de curl", url: "https://curl.se/docs/manpage.html" },
  ],
  revisada: "2026-11-12",
};
