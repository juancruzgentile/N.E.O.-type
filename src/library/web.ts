import { type Topic, a, b, code, m } from "./types";

export const html: Topic = {
  id: "html",
  name: "HTML",
  group: "Web y datos",
  emblem: "html",
  badge: "<>",
  color: "#ff5c7a",
  hl: "html",
  summary:
    "El lenguaje de marcado que estructura las páginas web: dice qué es cada parte (título, párrafo, navegación, formulario). " +
    "No se programa con él; se describe el contenido. El estilo lo pone CSS y el comportamiento JavaScript.",
  facts: [
    { label: "Archivos", value: ".html" },
    { label: "Ver", value: "abrir en el navegador" },
    { label: "Validar", value: "validator.w3.org" },
    { label: "Estilo", value: "2 espacios · etiquetas en minúscula" },
  ],
  workflow: [
    { title: "Semántica primero", text: "Usá la etiqueta que describe el contenido (header, nav, main, article, button) antes que div y span. Mejora la accesibilidad y el SEO." },
    { title: "Accesible desde el inicio", text: "Todo img con alt, todo input con su label, un solo h1 por página y niveles de título en orden." },
    { title: "Estructura mínima", text: "<!DOCTYPE html>, html con lang, meta charset y meta viewport en todas las páginas." },
    { title: "Probar sin mouse", text: "Recorré la página con Tab: todo lo interactivo tiene que poder usarse con el teclado." },
  ],
  entries: [
    b("Estructura", "Documento base", "El esqueleto mínimo de una página.", code`
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Mi página</title>
  </head>
  <body>
    <h1>Hola</h1>
  </body>
</html>`, "doctype esqueleto plantilla"),
    b("Texto", "Títulos y párrafos", "h1 a h6 para títulos (en orden), p para párrafos, strong y em para énfasis.", code`
<h1>Título principal</h1>
<h2>Sección</h2>
<p>Un párrafo con <strong>algo importante</strong> y <em>énfasis</em>.</p>`, "h1 p strong em"),
    b("Enlaces", "a e img", "a enlaza a otra página o sección; img muestra una imagen (alt describe la imagen para quien no la ve).", code`
<a href="https://ejemplo.com">Ir al sitio</a>
<a href="#contacto">Ir a contacto</a>
<img src="foto.jpg" alt="Equipo de trabajo en la oficina" width="400">`, "link enlace imagen"),
    b("Listas", "ul, ol y li", "Listas sin orden (viñetas) y ordenadas (números).", code`
<ul>
  <li>Café</li>
  <li>Té</li>
</ul>
<ol>
  <li>Instalar</li>
  <li>Configurar</li>
</ol>`, "lista vinetas"),
    b("Estructura", "Etiquetas semánticas", "Describen el rol de cada parte de la página.", code`
<header>…</header>
<nav>…</nav>
<main>
  <article>
    <section>…</section>
  </article>
  <aside>…</aside>
</main>
<footer>…</footer>`, "semantica header nav main footer section"),

    m("Formularios", "form, label e input", "Formularios con sus campos. type cambia el teclado y la validación; label asociado con for/id.", code`
<form action="/registro" method="post">
  <label for="email">Email</label>
  <input id="email" name="email" type="email" required>
  <label for="clave">Clave</label>
  <input id="clave" name="clave" type="password" minlength="8">
  <button type="submit">Crear cuenta</button>
</form>`, "formulario campo input validacion"),
    m("Formularios", "select, textarea y checkbox", "Otros controles de formulario.", code`
<select name="pais">
  <option value="ar">Argentina</option>
  <option value="it" selected>Italia</option>
</select>
<textarea name="mensaje" rows="4"></textarea>
<label><input type="checkbox" name="acepto"> Acepto</label>`, "desplegable opciones"),
    m("Tablas", "table", "Datos tabulares (no para maquetar). thead, tbody y th con scope.", code`
<table>
  <thead>
    <tr><th scope="col">Producto</th><th scope="col">Precio</th></tr>
  </thead>
  <tbody>
    <tr><td>Yerba</td><td>3.50</td></tr>
  </tbody>
</table>`, "tabla filas columnas"),
    m("Recursos", "link, script y meta", "Cargan estilos y scripts y describen la página.", code`
<link rel="stylesheet" href="style.css">
<script type="module" src="app.js"></script>
<meta name="description" content="Resumen para buscadores">`, "css js cargar head"),
    m("Atributos", "data-* e id/class", "id identifica un elemento único; class agrupa para estilos; data-* guarda datos propios para JavaScript.", code`
<li class="tarea urgente" data-id="42" data-estado="pendiente">Llamar</li>
<!-- en JS: el.dataset.id === "42" -->`, "atributos datos clase"),

    a("Accesibilidad", "ARIA y roles", "Completan la semántica cuando HTML no alcanza. Primero usá elementos nativos; ARIA es el último recurso.", code`
<button aria-expanded="false" aria-controls="menu">Menú</button>
<ul id="menu" hidden>…</ul>
<div role="alert">Se guardaron los cambios</div>`, "aria accesibilidad lector pantalla"),
    a("Multimedia", "picture, video y audio", "Imágenes adaptables y multimedia con varias fuentes.", code`
<picture>
  <source srcset="foto.avif" type="image/avif">
  <img src="foto.jpg" alt="Paisaje" loading="lazy">
</picture>
<video src="demo.mp4" controls width="640"></video>`, "imagen responsive video lazy"),
    a("Interacción", "dialog y details", "Componentes nativos: ventanas modales y secciones desplegables sin JavaScript extra.", code`
<details>
  <summary>Ver más</summary>
  <p>Contenido oculto.</p>
</details>
<dialog id="confirmar">
  <form method="dialog"><button>Cerrar</button></form>
</dialog>`, "modal desplegable acordeon"),
    a("Rendimiento", "Carga diferida", "loading=\"lazy\" para imágenes fuera de pantalla y defer/module para scripts que no bloquean.", code`
<img src="grande.jpg" alt="…" loading="lazy" decoding="async">
<script src="analitica.js" defer></script>
<link rel="preload" href="fuente.woff2" as="font" crossorigin>`, "lazy defer preload rendimiento"),
  ],
};

export const css: Topic = {
  id: "css",
  name: "CSS",
  group: "Web y datos",
  emblem: "css",
  badge: "{}",
  color: "#2ee6d6",
  hl: "css",
  summary:
    "Hojas de estilo en cascada: definen cómo se ve el HTML (colores, tipografía, espaciado, disposición y animaciones). " +
    "Las reglas se aplican por selectores y, si chocan, gana la más específica o la última.",
  facts: [
    { label: "Archivos", value: ".css" },
    { label: "Unidades", value: "px · rem · % · vw/vh · fr" },
    { label: "Disposición", value: "Flexbox · Grid" },
    { label: "Estilo", value: "2 espacios · kebab-case" },
  ],
  workflow: [
    { title: "Mobile first", text: "Escribí primero los estilos para pantallas chicas y agregá @media (min-width: …) para las grandes." },
    { title: "Variables para el diseño", text: "Colores, espacios y tipografías en custom properties (--color-fondo) en :root. Cambiar el tema es cambiar variables." },
    { title: "Flexbox para una dirección, Grid para dos", text: "Flex alinea elementos en fila o columna; Grid arma la cuadrícula de la página." },
    { title: "Especificidad baja", text: "Preferí clases a ids y evitá !important. Una convención de nombres (como BEM) ayuda en proyectos grandes." },
    { title: "Probar en varios tamaños", text: "Las herramientas de desarrollo del navegador simulan pantallas: revisá 360 px, tablet y escritorio." },
  ],
  entries: [
    b("Sintaxis", "Selectores básicos", "Por etiqueta, clase (.), id (#), descendiente (espacio) e hijo directo (>).", code`
p { line-height: 1.6; }
.boton { padding: 8px 16px; }
#principal { max-width: 960px; }
nav a { color: inherit; }
ul > li { list-style: none; }`, "selector clase id"),
    b("Caja", "Modelo de caja", "Cada elemento es una caja: contenido, padding, borde y margen. box-sizing: border-box hace que el ancho incluya padding y borde.", code`
* { box-sizing: border-box; }
.tarjeta {
  width: 300px;
  padding: 16px;
  border: 1px solid #ccc;
  margin: 0 auto;
}`, "box model margin padding border"),
    b("Texto", "Tipografía", "Fuente, tamaño, peso, alto de línea y alineación.", code`
body {
  font-family: system-ui, sans-serif;
  font-size: 1rem;
  line-height: 1.5;
}
h1 { font-weight: 700; text-align: center; }`, "fuente font texto"),
    b("Color", "Colores y fondos", "Colores por nombre, hex, rgb u hsl; fondos con color, imagen o degradé.", code`
.alerta {
  color: #b00020;
  background: rgb(255 0 0 / 0.08);
}
.hero { background: linear-gradient(135deg, #0f172a, #1e293b); }`, "color fondo degradado"),
    b("Unidades", "px, rem, %, vw", "px fijo; rem relativo a la fuente raíz (accesible); % del contenedor; vw/vh de la ventana.", code`
html { font-size: 100%; }    /* 1rem = 16px por defecto */
.contenedor { width: min(90%, 1100px); }
.hero { min-height: 60vh; }`, "medidas unidades rem"),

    m("Disposición", "Flexbox", "Alinea elementos en una dirección. justify-content reparte en el eje principal y align-items en el cruzado.", code`
.barra {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}`, "flex alinear centrar"),
    m("Disposición", "Grid", "Cuadrículas en dos dimensiones. repeat con auto-fill y minmax crea grillas que se adaptan solas.", code`
.galeria {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}
.pagina { grid-template-areas: "cabecera cabecera" "menu contenido"; }`, "grilla cuadricula"),
    m("Diseño adaptable", "@media", "Aplica estilos según el tamaño de pantalla u otras preferencias del usuario.", code`
@media (min-width: 768px) {
  .menu { display: flex; }
}
@media (prefers-color-scheme: dark) {
  :root { --fondo: #0f172a; }
}`, "responsive media query breakpoint"),
    m("Variables", "Custom properties", "Variables nativas: se definen con -- y se usan con var().", code`
:root {
  --primario: #38bdf8;
  --espacio: 16px;
}
.boton {
  background: var(--primario);
  padding: var(--espacio);
}`, "variables css custom properties"),
    m("Posición", "position", "relative, absolute, fixed y sticky para sacar o fijar elementos.", code`
.contenedor { position: relative; }
.insignia { position: absolute; top: 8px; right: 8px; }
.cabecera { position: sticky; top: 0; }`, "posicion absolute sticky fixed"),
    m("Sintaxis", "Pseudoclases y pseudoelementos", ":hover, :focus-visible, :nth-child para estados y posiciones; ::before y ::after para contenido decorativo.", code`
a:hover { text-decoration: underline; }
button:focus-visible { outline: 2px solid var(--primario); }
li:nth-child(odd) { background: #f5f5f5; }
.nuevo::after { content: " ★"; }`, "hover focus before after"),

    a("Animación", "transition y @keyframes", "Transiciones entre estados y animaciones con fotogramas clave. Respetá prefers-reduced-motion.", code`
.boton { transition: transform 0.2s ease; }
.boton:hover { transform: translateY(-2px); }

@keyframes aparecer {
  from { opacity: 0; }
  to { opacity: 1; }
}
.modal { animation: aparecer 0.3s both; }

@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}`, "animacion transicion"),
    a("Funciones", "clamp(), min() y max()", "Valores fluidos que se adaptan sin media queries.", code`
h1 { font-size: clamp(1.75rem, 4vw, 3rem); }
.contenedor { width: min(100% - 32px, 1100px); }`, "fluido tipografia responsive"),
    a("Selectores", ":has() e :is()", ":has elige un elemento según lo que contiene; :is agrupa selectores.", code`
.tarjeta:has(img) { padding-top: 0; }
form:has(input:invalid) button { opacity: 0.5; }
:is(h1, h2, h3) { line-height: 1.2; }`, "selector padre has"),
    a("Diseño adaptable", "Container queries", "Estilos según el tamaño del contenedor, no de la ventana: componentes realmente reutilizables.", code`
.tarjetas { container-type: inline-size; }
@container (min-width: 500px) {
  .tarjeta { display: grid; grid-template-columns: 1fr 2fr; }
}`, "container query componente"),
    a("Organización", "Anidamiento y @layer", "CSS nativo permite anidar reglas y ordenar la cascada por capas.", code`
@layer base, componentes, utilidades;

@layer componentes {
  .menu {
    display: flex;
    & a { color: inherit; }
    &:hover { background: #eee; }
  }
}`, "nesting capas layer cascada"),
  ],
};
