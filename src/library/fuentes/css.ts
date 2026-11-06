import type { FuentesTema } from "./tipos";

const C = "https://developer.mozilla.org/en-US/docs/Web/CSS/";
export const css: FuentesTema = {
  version: "CSS moderno (los navegadores actuales)",
  entradas: {
    "Selectores básicos": [C + "CSS_selectors"],
    "Modelo de caja": [C + "CSS_box_model/Introduction_to_the_CSS_box_model"],
    "Tipografía": [C + "CSS_fonts"],
    "Colores y fondos": [C + "color"],
    "px, rem, %, vw": [C + "length"],
    "Flexbox": [C + "CSS_flexible_box_layout/Basic_concepts_of_flexbox"],
    "Grid": [C + "CSS_grid_layout/Basic_concepts_of_grid_layout"],
    "@media": [C + "@media"],
    "Custom properties": [C + "Using_CSS_custom_properties"],
    "position": [C + "position"],
    "Pseudoclases y pseudoelementos": [C + "Pseudo-classes"],
    "transition y @keyframes": [C + "CSS_transitions/Using_CSS_transitions"],
    "clamp(), min() y max()": [C + "clamp"],
    ":has() e :is()": [C + ":has", "Chrome 105 · Safari 15.4 · Firefox 121"],
    "Container queries": [C + "CSS_containment/Container_queries", "Chrome 105 · Safari 16 · Firefox 110"],
    "Anidamiento y @layer": [C + "CSS_nesting/Using_CSS_nesting", "Chrome 120 · Safari 17.2 · Firefox 117"],
  },
};
