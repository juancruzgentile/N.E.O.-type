import type { FuentesTema } from "./tipos";

const H = "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/";
export const html: FuentesTema = {
  version: "HTML Living Standard",
  entradas: {
    "Documento base": [H + "html"],
    "Títulos y párrafos": [H + "Heading_Elements"],
    "a e img": [H + "a"],
    "ul, ol y li": [H + "ul"],
    "Etiquetas semánticas": ["https://developer.mozilla.org/en-US/docs/Glossary/Semantics"],
    "form, label e input": [H + "form"],
    "select, textarea y checkbox": [H + "select"],
    "table": [H + "table"],
    "link, script y meta": [H + "link"],
    "data-* e id/class": ["https://developer.mozilla.org/en-US/docs/Web/HTML/How_to/Use_data_attributes"],
    "ARIA y roles": ["https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA"],
    "picture, video y audio": [H + "picture"],
    "dialog y details": [H + "dialog"],
    "Carga diferida": ["https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Lazy_loading"],
  },
};
