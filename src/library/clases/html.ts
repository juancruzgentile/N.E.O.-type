import { type Clase, code } from "../types";

export const claseHtml: Clase = {
  titulo: "HTML de cero: la estructura y el significado de una página",
  bajada:
    "Qué es HTML y qué hace el navegador con él, tu primera página, las etiquetas semánticas y la accesibilidad que vienen con ellas, " +
    "los errores que se repiten y cuándo conviene (o no) escribir HTML a mano.",
  secciones: [
    {
      heading: "Qué es y qué problema resuelve",
      parrafos: [
        "HTML (HyperText Markup Language) es el lenguaje de marcado con el que se escribe el contenido de las páginas web. No es un lenguaje de programación: no calcula ni decide. Describe qué es cada cosa: este texto es un título, esto es un párrafo, esto es un enlace, esto es una imagen, esto es un formulario. Marcar el significado, y no solo el aspecto, es lo que lo distingue.",
        "El problema que resuelve es el de compartir documentos que se puedan leer en cualquier dispositivo y navegador, y que estén enlazados entre sí. Como el HTML describe la estructura, el mismo documento puede mostrarse en un teléfono, en una pantalla grande, leerse en voz alta con un lector de pantalla o ser entendido por un buscador. CSS le pone el aspecto y JavaScript el comportamiento, pero la base de todo es el HTML.",
      ],
    },
    {
      heading: "Historia corta",
      parrafos: [
        "Lo inventó Tim Berners-Lee en el CERN a partir de 1989, junto con el protocolo HTTP y las direcciones web, para compartir documentos científicos. La primera descripción pública de HTML es de 1991. En los años noventa se estandarizó en versiones sucesivas (HTML 2.0 en 1995 y HTML 4.01 en 1999) mientras los navegadores competían agregando etiquetas propias.",
      ],
      lista: [
        "Los años 2000: el intento de hacerlo estricto con XML (XHTML) fracasó en la práctica; los navegadores seguían aceptando HTML flexible.",
        "HTML5 (recomendación en 2014) sumó etiquetas semánticas, audio, video, canvas y formularios más ricos, y definió cómo debe interpretarse hasta el HTML mal escrito.",
        "Desde 2019, el estándar es el HTML Living Standard, que mantiene el grupo WHATWG (formado por los fabricantes de navegadores) y se actualiza de forma continua, sin números de versión.",
      ],
    },
    {
      heading: "Cómo funciona por dentro",
      parrafos: [
        "Cuando el navegador recibe un documento HTML, lo analiza (parsea) y construye en memoria un árbol de objetos llamado DOM (Document Object Model): cada etiqueta es un nodo, con sus hijos. Es el DOM, y no el texto del archivo, lo que JavaScript manipula y lo que se dibuja. El analizador de HTML es muy tolerante: si te olvidás de cerrar una etiqueta, el navegador la arregla según reglas estandarizadas, sin mostrar un error.",
        "Después combina el DOM con las reglas de CSS para calcular qué se ve y dónde: determina el estilo de cada nodo, calcula las posiciones y tamaños (layout) y finalmente pinta los píxeles. Cada vez que JavaScript cambia el DOM, parte de ese proceso se repite, y por eso modificar la página de forma desordenada puede volverla lenta.",
      ],
    },
    {
      heading: "Tu primera página, paso a paso",
      parrafos: [
        "Guardá esto como index.html y abrilo en el navegador (doble clic). No hace falta un servidor.",
      ],
      codigo: [
        code`
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Mi primera página</title>
</head>
<body>
  <header>
    <h1>Hola, mundo</h1>
  </header>
  <main>
    <p>Esto es un párrafo con un <a href="https://developer.mozilla.org/es/">enlace</a>.</p>
    <img src="gato.jpg" alt="Un gato gris durmiendo sobre un sofá" width="300">
  </main>
  <footer><small>Hecho por Ana</small></footer>
</body>
</html>`,
      ],
    },
    {
      heading: "Qué hace cada parte",
      parrafos: [
        "<!DOCTYPE html> le avisa al navegador que use el modo estándar. En <html lang=\"es\">, el idioma sirve a los lectores de pantalla (pronuncian bien) y a los traductores. El <head> contiene datos sobre la página que no se muestran: la codificación de caracteres (utf-8, para que las tildes se vean bien), el viewport (para que se vea bien en el teléfono) y el título que aparece en la pestaña.",
        "Dentro del <body> está lo que se ve. Cada etiqueta tiene un significado: header y footer son la cabecera y el pie, main el contenido principal, h1 el título principal, p un párrafo, a un enlace y img una imagen. El atributo alt describe la imagen para quien no la ve, y es obligatorio en la práctica.",
      ],
    },
    {
      heading: "Los cinco conceptos que sostienen todo lo demás",
      parrafos: [
        "Con estos cinco entendés casi cualquier HTML:",
      ],
      lista: [
        "Elementos y atributos: <etiqueta atributo=\"valor\">contenido</etiqueta>. Algunos elementos no tienen contenido (img, br, input).",
        "Semántica: elegir la etiqueta por lo que significa. header, nav, main, article, section, aside y footer organizan la página; h1 a h6 forman el esquema de títulos.",
        "Formularios: form, input, label, select y button recogen datos. Cada campo necesita un label asociado.",
        "Enlaces y recursos: a para navegar; img, link y script para traer imágenes, estilos y código.",
        "Accesibilidad: el HTML bien escrito ya trae gran parte: orden de títulos, textos alternativos, etiquetas de formulario y botones reales.",
      ],
      codigo: [
        code`
<form action="/suscribir" method="post">
  <label for="correo">Correo</label>
  <input id="correo" name="correo" type="email" required autocomplete="email">

  <label>
    <input type="checkbox" name="acepto" required> Acepto las condiciones
  </label>

  <button type="submit">Suscribirme</button>
</form>`,
      ],
    },
    {
      heading: "Errores que comete casi todo el mundo",
      parrafos: [
        "Los que más se repiten:",
      ],
      lista: [
        "Usar div para todo: un botón hecho con div no se puede usar con el teclado ni lo anuncia el lector de pantalla. Usá button, a, nav, etc.",
        "Imágenes sin alt: quien no ve la imagen no sabe de qué se trata. Si es decorativa, alt vacío (alt=\"\").",
        "Campos de formulario sin label: no se sabe qué piden, y hacer clic en el texto no activa el campo.",
        "Saltar niveles de títulos o usar h1 solo por el tamaño: el esquema del documento queda sin sentido. El tamaño se cambia con CSS.",
        "Usar br o &nbsp; para separar con espacio: el espacio es tarea de CSS.",
        "Repetir un id en la misma página: los ids son únicos.",
        "Olvidar el meta viewport: en el teléfono la página se ve diminuta.",
      ],
      codigo: [
        code`
<!-- MAL: parece un botón pero no lo es -->
<div class="boton" onclick="enviar()">Enviar</div>

<!-- BIEN: se enfoca con el teclado y lo anuncian los lectores de pantalla -->
<button type="button" onclick="enviar()">Enviar</button>`,
      ],
    },
    {
      heading: "Dónde conviene escribirlo a mano y dónde no",
      parrafos: [
        "HTML siempre está, pero no siempre lo escribís vos:",
      ],
      tabla: {
        cabeza: ["Caso", "¿HTML a mano?", "Por qué"],
        filas: [
          ["Páginas simples, portafolios, documentación estática", "Sí", "Un archivo, sin herramientas ni compilación."],
          ["Aprender cómo funciona la web", "Sí", "Es la base de todo lo demás."],
          ["Aplicaciones con mucho estado e interacción", "Con un framework", "React, Vue o Svelte generan el HTML a partir de componentes."],
          ["Sitios con contenido que cambia seguido", "Con plantillas o un CMS", "El HTML se genera desde datos."],
          ["Correos electrónicos con formato", "Con cuidado", "Los clientes de correo soportan poco; se usan tablas y estilos en línea."],
          ["Documentos largos para leer o imprimir", "A veces Markdown", "Markdown se convierte a HTML y es más cómodo de escribir."],
        ],
      },
    },
    {
      heading: "Comparación con alternativas",
      parrafos: [
        "Cuándo conviene otra cosa:",
      ],
      tabla: {
        cabeza: ["Alternativa", "Elegila en vez de HTML directo cuando…"],
        filas: [
          ["Markdown", "escribís texto (documentación, blog) y no necesitás control fino de la estructura."],
          ["JSX (React)", "construís interfaces con componentes y mucha lógica."],
          ["Plantillas (Jinja, Blade, Razor)", "el servidor genera páginas a partir de datos."],
          ["PDF", "el documento debe verse exactamente igual al imprimirse."],
        ],
      },
    },
    {
      heading: "Cómo seguir",
      parrafos: [
        "Hacé la ruta de HTML de la app y usá la pestaña Referencia para recordar etiquetas y atributos. Para practicar, armá la página de una persona o un negocio ficticio con encabezado, secciones, una imagen y un formulario de contacto, y comprobá que se pueda recorrer solo con el teclado (Tab).",
        "MDN es la mejor referencia de cada etiqueta, y el estándar vivo del HTML está en la especificación de WHATWG. El validador de W3C y las herramientas de accesibilidad de los navegadores (Lighthouse) te dicen qué corregir. Después, la clase de CSS de esta Biblioteca explica cómo darle aspecto.",
      ],
    },
  ],
  fuentes: [
    { texto: "MDN: HTML", url: "https://developer.mozilla.org/es/docs/Web/HTML" },
    { texto: "Especificación HTML (WHATWG)", url: "https://html.spec.whatwg.org/multipage/" },
    { texto: "web.dev: Learn HTML", url: "https://web.dev/learn/html" },
  ],
  revisada: "2026-11-12",
};
