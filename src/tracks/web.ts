// Rutas de HTML y CSS. El contenido de las páginas está en inglés, como el código.

import { type Rng, chance, int, pick } from "../gen/base";
import type { Exercise, Topic, Track } from "./types";

const L = (...lines: string[]) => lines.join("\n");
const ex = (title: string, ...lines: string[]): Exercise => ({ title, text: L(...lines) });
const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

// ─────────────────────────── Vocabulario ───────────────────────────

const SITES = [
  { name: "Neon Coffee", es: "una cafetería", items: ["Espresso", "Cappuccino", "Cold Brew", "Flat White"] },
  { name: "Pixel Gym", es: "un gimnasio", items: ["Yoga", "Crossfit", "Spinning", "Boxing"] },
  { name: "Byte Books", es: "una librería", items: ["Neuromancer", "Dune", "Snow Crash", "Foundation"] },
  { name: "Torino Bikes", es: "un taller de bicis", items: ["Repair", "Rental", "Tours", "Parts"] },
  { name: "Grid Studio", es: "un estudio de diseño", items: ["Branding", "Web Design", "Motion", "UX Audit"] },
  { name: "Retro Arcade", es: "un arcade", items: ["Pinball", "Pac-Man", "Tetris", "Street Fighter"] },
];
const PAGES = ["Home", "About", "Pricing", "Blog", "Contact", "Docs"];
const COLORS = ["#0f172a", "#f3e600", "#02d7f2", "#ff003c", "#1e293b", "#22c55e", "#e2e8f0", "#7c3aed", "#111827", "#f97316"];
const CLASSES = ["card", "hero", "navbar", "btn", "badge", "panel", "grid", "sidebar", "footer", "title", "avatar", "tag"];
const FONTS = ['"Inter", sans-serif', '"JetBrains Mono", monospace', "system-ui, sans-serif", '"Rajdhani", sans-serif'];

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const ind = (n: number, lines: string[]) => lines.map((l) => " ".repeat(n) + l);

// ─────────────────────────── HTML · escalón 1: estructura ───────────────────────────

const skeleton: Topic = {
  id: "skeleton",
  gen(rng) {
    const s = pick(rng, SITES);
    return ex(
      `Esqueleto de la página de ${s.es}`,
      "<!DOCTYPE html>",
      `<html lang="${pick(rng, ["en", "es", "it"])}">`,
      "  <head>",
      `    <meta charset="UTF-8">`,
      `    <title>${s.name}</title>`,
      "  </head>",
      "  <body>",
      `    <h1>${s.name}</h1>`,
      "  </body>",
      "</html>",
    );
  },
};

const textTags: Topic = {
  id: "text",
  gen(rng) {
    const s = pick(rng, SITES);
    const it = pick(rng, s.items);
    return pick(rng, [
      () => ex(
        `Título, subtítulo y párrafo para ${s.es}`,
        `<h1>${s.name}</h1>`,
        `<h2>Our ${it}</h2>`,
        `<p>Open every day from <strong>${int(rng, 7, 10)}:00</strong> to <em>${int(rng, 18, 23)}:00</em>.</p>`,
      ),
      () => ex(
        "Párrafo con salto de línea y una cita",
        `<p>Visit us at Via Roma ${int(rng, 1, 120)}<br>Torino, Italy</p>`,
        `<blockquote>The best ${it.toLowerCase()} in town.</blockquote>`,
      ),
      () => ex("Fragmento de código y atajo de teclado en un párrafo", `<p>Run <code>npm install</code> and press <kbd>Ctrl</kbd> + <kbd>C</kbd> to stop.</p>`),
    ])();
  },
};

const linksImages: Topic = {
  id: "links",
  gen(rng) {
    const s = pick(rng, SITES);
    const page = pick(rng, PAGES);
    return pick(rng, [
      () => ex(`Enlace a la página ${page}`, `<a href="/${slug(page)}.html">${page}</a>`),
      () => ex("Enlace externo que se abre en otra pestaña de forma segura", `<a href="https://example.com" target="_blank" rel="noopener noreferrer">Docs</a>`),
      () => ex(`Logo de ${s.es} con su texto alternativo`, `<img src="img/${slug(s.name)}.png" alt="${s.name} logo" width="${pick(rng, [120, 160, 200])}">`),
      () => ex("Enlace de email y de teléfono", `<a href="mailto:hello@${slug(s.name)}.com">Email us</a>`, `<a href="tel:+390111234567">Call us</a>`),
    ])();
  },
};

// ─────────────────────────── HTML · escalón 2: listas y tablas ───────────────────────────

const lists: Topic = {
  id: "lists",
  gen(rng) {
    const s = pick(rng, SITES);
    const ordered = chance(rng, 0.4);
    const tag = ordered ? "ol" : "ul";
    return ex(
      `Lista ${ordered ? "numerada" : "con viñetas"} de lo que ofrece ${s.es}`,
      `<${tag} class="services">`,
      ...ind(2, s.items.map((x) => `<li>${x}</li>`)),
      `</${tag}>`,
    );
  },
};

const navList: Topic = {
  id: "nav-list",
  gen(rng) {
    const pages = PAGES.slice(0, int(rng, 3, 5));
    return ex(
      "Menú de navegación con una lista de enlaces",
      "<ul>",
      ...ind(2, pages.map((p) => `<li><a href="/${slug(p)}">${p}</a></li>`)),
      "</ul>",
    );
  },
};

const table: Topic = {
  id: "table",
  gen(rng) {
    const s = pick(rng, SITES);
    const rows = s.items.slice(0, int(rng, 2, 4));
    return ex(
      `Tabla de precios de ${s.es}`,
      "<table>",
      "  <thead>",
      "    <tr><th>Item</th><th>Price</th></tr>",
      "  </thead>",
      "  <tbody>",
      ...ind(4, rows.map((r) => `<tr><td>${r}</td><td>${int(rng, 3, 60)}.${pick(rng, ["00", "50", "99"])}</td></tr>`)),
      "  </tbody>",
      "</table>",
    );
  },
};

// ─────────────────────────── HTML · escalón 3: formularios ───────────────────────────

const loginForm: Topic = {
  id: "form",
  gen(rng) {
    return pick(rng, [
      () => ex(
        "Formulario de inicio de sesión con etiquetas",
        `<form action="/login" method="post">`,
        `  <label for="email">Email</label>`,
        `  <input type="email" id="email" name="email" required>`,
        `  <label for="password">Password</label>`,
        `  <input type="password" id="password" name="password" minlength="8" required>`,
        `  <button type="submit">Sign in</button>`,
        "</form>",
      ),
      () => ex(
        "Formulario de contacto con área de texto",
        `<form action="/contact" method="post">`,
        `  <input type="text" name="name" placeholder="Your name" required>`,
        `  <textarea name="message" rows="${int(rng, 3, 6)}"></textarea>`,
        `  <button type="submit">Send</button>`,
        "</form>",
      ),
      () => ex(
        "Buscador con campo de búsqueda",
        `<form role="search" action="/search">`,
        `  <input type="search" name="q" placeholder="Search..." aria-label="Search">`,
        "</form>",
      ),
    ])();
  },
};

const formControls: Topic = {
  id: "controls",
  gen(rng) {
    const s = pick(rng, SITES);
    return pick(rng, [
      () => ex(
        `Selector de opciones para ${s.es}`,
        `<label for="plan">Choose</label>`,
        `<select id="plan" name="plan">`,
        ...ind(2, s.items.map((x) => `<option value="${slug(x)}">${x}</option>`)),
        "</select>",
      ),
      () => ex(
        "Casilla para aceptar los términos",
        `<input type="checkbox" id="terms" name="terms" required>`,
        `<label for="terms">I accept the terms</label>`,
      ),
      () => ex(
        "Campo numérico con mínimo, máximo y paso",
        `<input type="number" name="qty" min="1" max="${pick(rng, [10, 20, 99])}" step="1" value="1">`,
      ),
      () => ex(
        "Botones de opción para elegir la talla",
        `<input type="radio" id="s" name="size" value="s">`,
        `<label for="s">S</label>`,
        `<input type="radio" id="m" name="size" value="m" checked>`,
        `<label for="m">M</label>`,
      ),
    ])();
  },
};

// ─────────────────────────── HTML · escalón 4: semántica y accesibilidad ───────────────────────────

const layout: Topic = {
  id: "layout",
  gen(rng) {
    const s = pick(rng, SITES);
    return ex(
      `Estructura semántica de la página de ${s.es}`,
      "<header>",
      `  <nav aria-label="Main">`,
      `    <a href="/">${s.name}</a>`,
      "  </nav>",
      "</header>",
      "<main>",
      "  <article>",
      `    <h2>${pick(rng, s.items)}</h2>`,
      "  </article>",
      "</main>",
      `<footer>&copy; ${int(rng, 2024, 2026)} ${s.name}</footer>`,
    );
  },
};

const figure: Topic = {
  id: "figure",
  gen(rng) {
    const s = pick(rng, SITES);
    const it = pick(rng, s.items);
    return pick(rng, [
      () => ex(
        "Imagen con su pie de foto",
        "<figure>",
        `  <img src="img/${slug(it)}.jpg" alt="${it} at ${s.name}" loading="lazy">`,
        `  <figcaption>${it}</figcaption>`,
        "</figure>",
      ),
      () => ex(
        "Botón de cerrar accesible para lectores de pantalla",
        `<button type="button" aria-label="Close menu">`,
        `  <span aria-hidden="true">&times;</span>`,
        "</button>",
      ),
      () => ex(
        "Sección con título vinculado por aria-labelledby",
        `<section aria-labelledby="${slug(it)}-title">`,
        `  <h2 id="${slug(it)}-title">${it}</h2>`,
        "</section>",
      ),
      () => ex("Fecha legible por máquinas dentro de un artículo", `<p>Updated <time datetime="2026-${String(int(rng, 1, 12)).padStart(2, "0")}-15">last month</time></p>`),
    ])();
  },
};

// ─────────────────────────── HTML · escalón 5: head y recursos ───────────────────────────

const head: Topic = {
  id: "head",
  gen(rng) {
    const s = pick(rng, SITES);
    return pick(rng, [
      () => ex(
        "Etiquetas meta para que la página se vea bien en el móvil",
        `<meta charset="UTF-8">`,
        `<meta name="viewport" content="width=device-width, initial-scale=1">`,
        `<meta name="description" content="${s.name}: ${s.items.slice(0, 2).join(", ").toLowerCase()} and more.">`,
      ),
      () => ex(
        "Hoja de estilos, script diferido y favicon",
        `<link rel="stylesheet" href="css/styles.css">`,
        `<link rel="icon" href="favicon.svg" type="image/svg+xml">`,
        `<script src="js/app.js" defer></script>`,
      ),
      () => ex(
        "Metadatos Open Graph para compartir en redes",
        `<meta property="og:title" content="${s.name}">`,
        `<meta property="og:type" content="website">`,
        `<meta property="og:image" content="https://${slug(s.name)}.com/og.png">`,
      ),
      () => ex("Módulo de JavaScript", `<script type="module" src="/src/main.js"></script>`),
    ])();
  },
};

const media: Topic = {
  id: "media",
  gen(rng) {
    return pick(rng, [
      () => ex(
        "Video con controles y subtítulos",
        `<video controls width="${pick(rng, [480, 640, 720])}" poster="img/poster.jpg">`,
        `  <source src="media/intro.mp4" type="video/mp4">`,
        `  <track src="media/intro.vtt" kind="subtitles" srclang="es" label="Spanish">`,
        "</video>",
      ),
      () => ex(
        "Imagen adaptable con varias resoluciones",
        `<img src="img/hero-800.jpg"`,
        `     srcset="img/hero-400.jpg 400w, img/hero-800.jpg 800w"`,
        `     sizes="(max-width: 600px) 400px, 800px" alt="Hero">`,
      ),
      () => ex("Bloque desplegable con resumen", "<details>", "  <summary>Show more</summary>", "  <p>Hidden content.</p>", "</details>"),
    ])();
  },
};

export const HTML: Track = {
  id: "html",
  label: "MARCADO",
  cumulative: true,
  batch: 2,
  variants: [],
  symbols: ["<", ">", "/", "=", '"', "!", "-", ".", ":", ",", ";", "&", "?", "_", "(", ")", "+", ...DIGITS],
  steps: [
    { id: "structure", name: "Estructura", variants: [""], desc: "Esqueleto de una página, títulos, párrafos, énfasis, enlaces e imágenes", topics: [skeleton, textTags, linksImages] },
    { id: "lists", name: "Listas y tablas", variants: [""], desc: "Listas con y sin orden, menús de navegación y tablas con encabezado", topics: [lists, navList, table] },
    { id: "forms", name: "Formularios", variants: [""], desc: "Campos con etiquetas, validación, selectores, casillas y botones", topics: [loginForm, formControls] },
    { id: "semantic", name: "Semántica", variants: [""], desc: "header, nav, main, article, figure y atributos de accesibilidad (aria)", topics: [layout, figure] },
    { id: "head", name: "Head y recursos", variants: [""], desc: "Metadatos, hojas de estilo, scripts, Open Graph, video e imágenes adaptables", topics: [head, media] },
  ],
};

// ─────────────────────────── CSS ───────────────────────────

const cls = (rng: Rng) => pick(rng, CLASSES);
const color = (rng: Rng) => pick(rng, COLORS);
const px = (rng: Rng, a: number, b: number) => `${int(rng, a, b) * 2}px`;

const selectors: Topic = {
  id: "selectors",
  gen(rng) {
    const c = cls(rng);
    return pick(rng, [
      () => ex(`Color de texto y fondo para .${c}`, `.${c} {`, `  color: ${color(rng)};`, `  background-color: ${color(rng)};`, "}"),
      () => ex("Tipografía base del documento", "body {", `  font-family: ${pick(rng, FONTS)};`, `  font-size: ${pick(rng, [14, 16, 18])}px;`, `  line-height: ${pick(rng, ["1.5", "1.6", "1.4"])};`, "}"),
      () => ex(`Estilo para los enlaces dentro de .${c}`, `.${c} a {`, `  color: ${color(rng)};`, "  text-decoration: none;", "}"),
      () => ex("Estilo para un elemento por su id", `#${c} {`, `  font-weight: ${pick(rng, [600, 700, 800])};`, "  text-transform: uppercase;", "}"),
      () => ex("Mismo estilo para varios títulos", "h1, h2, h3 {", `  color: ${color(rng)};`, `  letter-spacing: ${pick(rng, ["0.5px", "1px", "2px"])};`, "}"),
    ])();
  },
};

const boxModel: Topic = {
  id: "box",
  gen(rng) {
    const c = cls(rng);
    return pick(rng, [
      () => ex("Todas las cajas miden con su borde incluido", "*, *::before, *::after {", "  box-sizing: border-box;", "}"),
      () => ex(
        `Espaciado, borde y esquinas redondeadas para .${c}`,
        `.${c} {`,
        `  padding: ${px(rng, 4, 12)} ${px(rng, 6, 16)};`,
        `  margin-bottom: ${px(rng, 4, 16)};`,
        `  border: 1px solid ${color(rng)};`,
        `  border-radius: ${px(rng, 2, 8)};`,
        "}",
      ),
      () => ex(`Centra .${c} con un ancho máximo`, `.${c} {`, `  max-width: ${pick(rng, [960, 1080, 1200])}px;`, "  margin: 0 auto;", "}"),
      () => ex(`Sombra suave para .${c}`, `.${c} {`, `  box-shadow: 0 ${px(rng, 1, 4)} ${px(rng, 6, 16)} rgba(0, 0, 0, 0.${int(rng, 1, 4)});`, "}"),
    ])();
  },
};

const flexbox: Topic = {
  id: "flex",
  gen(rng) {
    const c = cls(rng);
    return pick(rng, [
      () => ex(
        `Fila flexible con elementos centrados en .${c}`,
        `.${c} {`,
        "  display: flex;",
        `  justify-content: ${pick(rng, ["space-between", "center", "flex-end", "space-around"])};`,
        "  align-items: center;",
        `  gap: ${px(rng, 4, 12)};`,
        "}",
      ),
      () => ex(`Columna flexible que se reparte el espacio`, `.${c} {`, "  display: flex;", "  flex-direction: column;", "}", `.${c} > * {`, "  flex: 1;", "}"),
      () => ex(`Elementos que bajan de línea si no entran en .${c}`, `.${c} {`, "  display: flex;", "  flex-wrap: wrap;", `  gap: ${px(rng, 4, 12)} ${px(rng, 6, 16)};`, "}"),
      () => ex("Centra un elemento vertical y horizontalmente", ".center {", "  display: grid;", "  place-items: center;", "  min-height: 100vh;", "}"),
    ])();
  },
};

const grid: Topic = {
  id: "grid",
  gen(rng) {
    const c = cls(rng);
    return pick(rng, [
      () => ex(
        `Grilla de tarjetas que se adapta al ancho en .${c}`,
        `.${c} {`,
        "  display: grid;",
        `  grid-template-columns: repeat(auto-fill, minmax(${pick(rng, [180, 220, 260])}px, 1fr));`,
        `  gap: ${px(rng, 6, 14)};`,
        "}",
      ),
      () => ex(
        "Diseño de página con zonas de grilla",
        ".layout {",
        "  display: grid;",
        `  grid-template-columns: ${pick(rng, [200, 240, 280])}px 1fr;`,
        `  grid-template-areas: "side main";`,
        "}",
        ".sidebar { grid-area: side; }",
      ),
      () => ex(`Un elemento que ocupa dos columnas en .${c}`, `.${c} .wide {`, "  grid-column: span 2;", "}"),
    ])();
  },
};

const responsive: Topic = {
  id: "media",
  gen(rng) {
    const c = cls(rng);
    const bp = pick(rng, [600, 768, 900, 1024]);
    return pick(rng, [
      () => ex(`En pantallas chicas, .${c} pasa a una columna`, `@media (max-width: ${bp}px) {`, `  .${c} {`, "    flex-direction: column;", "  }", "}"),
      () => ex("Título que escala con la pantalla dentro de un rango", "h1 {", `  font-size: clamp(${pick(rng, ["1.5rem", "2rem"])}, 5vw, ${pick(rng, ["3rem", "4rem"])});`, "}"),
      () => ex("Oculta las animaciones si el usuario lo pidió", "@media (prefers-reduced-motion: reduce) {", "  * {", "    animation: none !important;", "  }", "}"),
      () => ex("Colores para el modo oscuro del sistema", "@media (prefers-color-scheme: dark) {", "  body {", `    background: ${color(rng)};`, "  }", "}"),
    ])();
  },
};

const vars: Topic = {
  id: "vars",
  gen(rng) {
    const c = cls(rng);
    return pick(rng, [
      () => ex(
        "Variables de color en :root y su uso",
        ":root {",
        `  --primary: ${color(rng)};`,
        `  --radius: ${px(rng, 2, 8)};`,
        "}",
        `.${c} {`,
        "  background: var(--primary);",
        "  border-radius: var(--radius);",
        "}",
      ),
      () => ex(`Transición al pasar el mouse sobre .${c}`, `.${c} {`, `  transition: transform 0.${int(rng, 1, 4)}s ease;`, "}", `.${c}:hover {`, `  transform: translateY(-${int(rng, 2, 6)}px);`, "}"),
      () => ex(
        "Animación de aparición con keyframes",
        "@keyframes fade-in {",
        "  from { opacity: 0; }",
        "  to { opacity: 1; }",
        "}",
        `.${c} {`,
        `  animation: fade-in 0.${int(rng, 2, 8)}s ease-out both;`,
        "}",
      ),
      () => ex(`Línea decorativa con ::before en .${c}`, `.${c}::before {`, `  content: "";`, "  display: block;", `  width: ${px(rng, 10, 30)};`, "  height: 2px;", `  background: ${color(rng)};`, "}"),
    ])();
  },
};

export const CSS: Track = {
  id: "css",
  label: "ESTILO",
  cumulative: true,
  batch: 2,
  variants: [],
  symbols: ["{", "}", ":", ";", ".", "#", "-", "(", ")", ",", "%", "*", ">", "@", '"', "/", "!", "_", ...DIGITS],
  steps: [
    { id: "selectors", name: "Selectores y color", variants: [""], desc: "Selectores por etiqueta, clase e id, colores, fondos y tipografía", topics: [selectors] },
    { id: "box", name: "Modelo de caja", variants: [""], desc: "padding, margin, bordes, box-sizing, ancho máximo y sombras", topics: [boxModel] },
    { id: "flex", name: "Flexbox", variants: [""], desc: "Filas y columnas flexibles, alineación, gap y elementos que se reparten el espacio", topics: [flexbox] },
    { id: "grid", name: "Grid", variants: [""], desc: "Grillas adaptables con repeat y minmax, zonas y elementos que ocupan varias celdas", topics: [grid] },
    { id: "responsive", name: "Responsive", variants: [""], desc: "Media queries, clamp, modo oscuro y movimiento reducido", topics: [responsive] },
    { id: "vars", name: "Variables y animación", variants: [""], desc: "Custom properties, transiciones, :hover, ::before y @keyframes", topics: [vars] },
  ],
};
