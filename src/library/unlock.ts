// Qué temas de la Biblioteca se ven. Los frameworks quedan ocultos (ni en el menú ni en la búsqueda) hasta que se
// terminan la ruta de su lenguaje y un proyecto que lo use.
import { LANGS } from "../data/curriculum";
import { stageInfos } from "../engine/stats";
import { PROJECTS } from "../projects/projects";
import type { AppState, CodeLangId } from "../types";
import { type Framework, FRAMEWORKS } from "./frameworks";
import { TOPICS } from "./index";
import type { Topic } from "./types";

/** La ruta de un lenguaje está completa con algún teclado: última etapa y todos sus símbolos dominados. */
export function routeDone(s: AppState, lang: CodeLangId): boolean {
  const last = LANGS[lang].stages.length - 1;
  return Object.entries(s.profiles).some(([key, p]) => {
    const [l, layout] = key.split(":");
    if (l !== lang || p.stage < last) return false;
    const infos = stageInfos(lang, p, { ...s.settings, layout: layout as AppState["settings"]["layout"] });
    return infos.length > 0 && infos.every((k) => k.state === "mastered");
  });
}

/** Hay al menos un proyecto terminado con un archivo en ese lenguaje. */
export const projectDoneIn = (s: AppState, lang: CodeLangId) =>
  PROJECTS.some((p) => Object.prototype.hasOwnProperty.call(s.projects, p.id) && p.files.some((f) => f.lang === lang));

export const frameworkUnlocked = (s: AppState, fw: Framework) =>
  fw.langs.some((lang) => routeDone(s, lang) && projectDoneIn(s, lang));

/** Temas que se muestran: los de siempre más los frameworks ganados. */
export const visibleTopics = (s: AppState): Topic[] => [...TOPICS, ...FRAMEWORKS.filter((fw) => frameworkUnlocked(s, fw))];

/** Todos, ocultos incluidos: para encontrar una entrada que ya está en el repaso. */
export const ALL_TOPICS: Topic[] = [...TOPICS, ...FRAMEWORKS];
