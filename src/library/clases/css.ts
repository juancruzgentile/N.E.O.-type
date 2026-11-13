import { type Clase, code } from "../types";

export const claseCss: Clase = {
  titulo: "CSS de cero: cómo decide el navegador qué se ve y dónde",
  bajada:
    "Qué es CSS y cómo resuelve conflictos entre reglas (la cascada), el modelo de caja, Flexbox y Grid, el diseño que se adapta a cualquier pantalla, " +
    "los errores que vuelven loco a cualquiera y cuándo conviene una herramienta encima.",
  secciones: [
    {
      heading: "Qué es y qué problema resuelve",
      parrafos: [
        "CSS (Cascading Style Sheets) es el lenguaje que le da aspecto a un documento HTML: colores, tipografías, tamaños, espacios, posición y animaciones. Funciona con reglas: un selector dice a qué elementos se aplica y un bloque de propiedades dice cómo se ven.",
        "El problema que resuelve es separar el contenido de la presentación. Antes de CSS, el aspecto se mezclaba con el HTML (etiquetas de fuente, tablas para ubicar cosas); cambiar el estilo de un sitio obligaba a tocar cada página. Con CSS, una hoja de estilos decide el aspecto de todo el sitio, y el mismo HTML puede verse distinto en el teléfono, en una pantalla grande o al imprimirse.",
      ],
    },
    {
      heading: "Historia corta",
      parrafos: [
        "Lo propuso Håkon Wium Lie en 1994, mientras trabajaba con Tim Berners-Lee en el CERN. CSS1 se publicó en 1996 y CSS2 en 1998. Durante años, los navegadores lo implementaban de formas distintas y hacer que una página se viera igual en todos era un trabajo agotador.",
      ],
      lista: [
        "CSS3 dejó de ser una versión única: el lenguaje se dividió en módulos (selectores, colores, Flexbox, Grid…) que avanzan por separado.",
        "Alrededor de 2015 a 2017 llegaron Flexbox y Grid, y el diseño de páginas dejó de depender de trucos con float.",
        "Las variables de CSS (propiedades personalizadas) permiten reutilizar valores y cambiar temas enteros.",
        "Más recientemente: container queries, el anidamiento de reglas nativo y selectores como :has(), que antes requerían JavaScript o preprocesadores.",
      ],
    },
    {
      heading: "Cómo funciona por dentro",
      parrafos: [
        "El navegador combina el DOM con todas las reglas de CSS que encuentra y calcula, para cada elemento, el valor final de cada propiedad. Cuando dos reglas se contradicen, decide la cascada, con este orden: primero la importancia (!important y el origen de la regla), después la especificidad (un selector de id pesa más que uno de clase, y este más que uno de etiqueta), y por último el orden (la que viene después gana). Muchos de los \"CSS que no funciona\" son una regla más específica en otro lugar.",
        "Algunas propiedades se heredan del elemento padre (color, tipografía) y otras no (margen, borde). Y todo elemento se dibuja como una caja: contenido, relleno (padding), borde y margen. Esa caja se coloca según el flujo normal del documento, o con Flexbox o Grid. Entender la caja y el flujo explica la mayoría de los problemas de diseño.",
      ],
    },
    {
      heading: "Tu primer CSS, paso a paso",
      parrafos: [
        "Con el index.html de la clase de HTML, creá un archivo estilos.css y enlazalo en el <head> con <link rel=\"stylesheet\" href=\"estilos.css\">.",
      ],
      codigo: [
        code`
:root {
  --fondo: #f7f4ef;
  --texto: #222;
  --acento: #0b6e4f;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, sans-serif;
  line-height: 1.5;
  color: var(--texto);
  background: var(--fondo);
}

main {
  max-width: 40rem;
  margin: 0 auto;
  padding: 1rem;
}

a {
  color: var(--acento);
}

a:hover,
a:focus-visible {
  text-decoration-thickness: 3px;
}`,
      ],
    },
    {
      heading: "Qué hace cada parte",
      parrafos: [
        ":root es el elemento raíz, y ahí se definen las variables (--acento) que se usan con var(). El selector * con box-sizing: border-box hace que el ancho de una caja incluya su relleno y su borde, lo que vuelve los cálculos mucho más predecibles; casi todos los proyectos lo ponen.",
        "En main, max-width limita el ancho de lectura y margin: 0 auto lo centra. Las unidades rem se basan en el tamaño de letra del usuario, así que el diseño respeta si agranda el texto. Y a:hover, a:focus-visible aplica el mismo estilo cuando se pasa el mouse o se llega con el teclado, algo que importa para la accesibilidad.",
      ],
    },
    {
      heading: "Los cinco conceptos que sostienen todo lo demás",
      parrafos: [
        "Con estos cinco leés y escribís casi cualquier CSS:",
      ],
      lista: [
        "Selectores y especificidad: etiqueta, clase (.), id (#), atributos, pseudoclases (:hover) y combinadores (espacio, >). Preferí clases con nombres claros.",
        "El modelo de caja: content, padding, border y margin. Con box-sizing: border-box el ancho incluye relleno y borde.",
        "Flexbox: acomoda elementos en una dimensión (una fila o una columna), con espacio, alineación y envoltura.",
        "Grid: acomoda en dos dimensiones, con filas y columnas. Ideal para la estructura de una página.",
        "Diseño adaptable: unidades relativas (rem, %, vw), media queries y funciones como clamp() y min() para que se vea bien desde el teléfono hasta una pantalla grande.",
      ],
      codigo: [
        code`
.tarjetas {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));   /* tantas columnas como entren */
  gap: 1rem;
}

.barra {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

h1 {
  font-size: clamp(1.5rem, 4vw, 3rem);    /* se adapta al ancho, con mínimo y máximo */
}

@media (prefers-color-scheme: dark) {
  :root { --fondo: #14110f; --texto: #eee; }
}`,
      ],
    },
    {
      heading: "Errores que comete casi todo el mundo",
      parrafos: [
        "Los que más frustran:",
      ],
      lista: [
        "Usar !important para ganar una pelea de especificidad: se llena de !important y nadie entiende nada. Bajá la especificidad del otro selector, o reorganizá.",
        "Olvidar box-sizing: border-box: un ancho del 100% más relleno se desborda de la pantalla.",
        "Márgenes que se fusionan: dos márgenes verticales que se tocan se colapsan en el mayor, no se suman.",
        "Tamaños de letra en píxeles: no respetan la preferencia del usuario. Usá rem.",
        "z-index que no funciona: solo actúa dentro de su contexto de apilamiento; un valor enorme no gana a otro contexto.",
        "Centrar con trucos: hoy se hace con Flexbox o Grid (place-items: center) y no con posicionamiento absoluto.",
        "Quitar el contorno de enfoque (outline: none) sin ofrecer otro: deja a quien navega con teclado sin saber dónde está.",
      ],
      codigo: [
        code`
/* MAL: la caja mide 100% + 2rem + borde, y se sale de la pantalla */
.panel { width: 100%; padding: 1rem; border: 1px solid; }

/* BIEN: con border-box, el ancho incluye todo */
*, *::before, *::after { box-sizing: border-box; }

/* centrar sin trucos */
.centrado { display: grid; place-items: center; min-height: 100vh; }`,
      ],
    },
    {
      heading: "Dónde conviene CSS puro y dónde una herramienta encima",
      parrafos: [
        "CSS moderno cubre mucho, pero a escala se suma ayuda:",
      ],
      tabla: {
        cabeza: ["Caso", "¿CSS puro?", "Por qué"],
        filas: [
          ["Sitios pequeños y medianos", "Sí", "CSS moderno (variables, Grid, anidamiento) alcanza."],
          ["Proyectos grandes con muchos equipos", "Con una convención", "Nombres de clases consistentes (BEM) o módulos de CSS evitan colisiones."],
          ["Prototipos rápidos", "Con una utilidad como Tailwind", "Se escriben clases en el HTML sin salir del archivo."],
          ["Estilos dependientes de datos de JavaScript", "Variables CSS", "JavaScript cambia una variable y CSS hace el resto."],
          ["Animaciones simples", "Sí", "transition y @keyframes funcionan bien y usan la GPU."],
          ["Respetar a quien prefiere menos movimiento", "Sí", "@media (prefers-reduced-motion) lo permite."],
        ],
      },
    },
    {
      heading: "Comparación con alternativas",
      parrafos: [
        "Cuándo conviene otra cosa:",
      ],
      tabla: {
        cabeza: ["Alternativa", "Elegila en vez de CSS plano cuando…"],
        filas: [
          ["Sass", "querés funciones y mezclas que CSS no tenía; hoy hace menos falta con las variables y el anidamiento nativos."],
          ["Tailwind CSS", "preferís componer el diseño con clases de utilidad directamente en el HTML."],
          ["CSS Modules o CSS-in-JS", "tus componentes necesitan estilos aislados que no choquen entre sí."],
          ["Una biblioteca de componentes", "no querés diseñar botones, menús y tablas desde cero."],
        ],
      },
    },
    {
      heading: "Cómo seguir",
      parrafos: [
        "Hacé la ruta de CSS de la app y usá la pestaña Referencia para recordar propiedades. Para practicar, tomá la página de la clase de HTML y hacela adaptable: una cuadrícula de tarjetas, un menú con Flexbox, un modo oscuro y un tamaño de letra que escale.",
        "MDN explica cada propiedad con ejemplos, y web.dev tiene el curso Learn CSS. Las herramientas de desarrollo del navegador (el inspector) te muestran qué reglas se aplican a cada elemento y de dónde vienen: es la mejor manera de entender la cascada.",
      ],
    },
  ],
  fuentes: [
    { texto: "MDN: CSS", url: "https://developer.mozilla.org/es/docs/Web/CSS" },
    { texto: "web.dev: Learn CSS", url: "https://web.dev/learn/css" },
    { texto: "MDN: la cascada (en inglés)", url: "https://developer.mozilla.org/en-US/docs/Web/CSS/Cascade" },
  ],
  revisada: "2026-11-12",
};
