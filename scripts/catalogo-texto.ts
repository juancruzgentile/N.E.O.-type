// Arma src/library/catalogo.gen.ts a partir de los temas: una sola fuente de verdad.
import { FRAMEWORKS, type Framework } from "../src/library/frameworks";
import { TOPICS } from "../src/library/index";
import type { TemaCatalogo, Topic } from "../src/library/types";

const fila = (t: Topic | Framework): TemaCatalogo => ({
  id: t.id, name: t.name, group: t.group, emblem: t.emblem, badge: t.badge, color: t.color, hl: t.hl,
  entradas: t.entries.length,
  ...("langs" in t ? { langs: t.langs, projects: t.projects } : {}),
});

export const textoCatalogo = () =>
  `// Generado con npm run catalogo. No editar a mano.
import type { TemaCatalogo } from "./types";

export const CATALOGO: TemaCatalogo[] = [
${[...TOPICS, ...FRAMEWORKS].map((t) => `  ${JSON.stringify(fila(t))},`).join("\n")}
];
`;
