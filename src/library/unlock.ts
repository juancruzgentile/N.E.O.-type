// Qué temas de la Biblioteca se ven. Los frameworks quedan ocultos (ni en el menú ni en la búsqueda) hasta que se
// terminan la ruta de su lenguaje y el proyecto de ese framework. Una vez ganados, quedan guardados en el estado.
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

const has = (o: Record<string, unknown>, k: string) => Object.prototype.hasOwnProperty.call(o, k);

/** Hay al menos un proyecto terminado con un archivo en ese lenguaje. */
export const projectDoneIn = (s: AppState, lang: CodeLangId) =>
  PROJECTS.some((p) => has(s.projects, p.id) && p.files.some((f) => f.lang === lang));

/** La regla de hoy: la ruta del lenguaje completa y uno de los proyectos del framework. */
const earnedNow = (s: AppState, fw: Framework) =>
  fw.langs.some((lang) => routeDone(s, lang)) && fw.projects.some((id) => has(s.projects, id));

/** La regla de antes: la ruta del lenguaje y cualquier proyecto en ese lenguaje. Solo sirve para no quitarle a nadie lo que ya tenía. */
const earnedBefore = (s: AppState, fw: Framework) => fw.langs.some((lang) => routeDone(s, lang) && projectDoneIn(s, lang));

/** Un framework está abierto si ya se ganó (queda guardado) o si se cumple la regla de hoy. */
export const frameworkUnlocked = (s: AppState, fw: Framework) => has(s.frameworks, fw.id) || earnedNow(s, fw);

/**
 * Los frameworks que hay que guardar como ganados ahora: los de la regla de hoy y, una sola vez, los que la persona
 * ya tenía con la regla anterior.
 */
export const frameworksToGrant = (s: AppState): Framework[] =>
  FRAMEWORKS.filter((fw) => !has(s.frameworks, fw.id) && (earnedNow(s, fw) || (!s.frameworksChecked && earnedBefore(s, fw))));

/** Temas que se muestran: los de siempre más los frameworks ganados. */
export const visibleTopics = (s: AppState): Topic[] => [...TOPICS, ...FRAMEWORKS.filter((fw) => frameworkUnlocked(s, fw))];

/** Todos, ocultos incluidos: para encontrar una entrada que ya está en el repaso. */
export const ALL_TOPICS: Topic[] = [...TOPICS, ...FRAMEWORKS];
