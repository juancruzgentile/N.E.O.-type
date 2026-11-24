// El contenido completo de los temas. Lo que solo necesita listarlos usa catalogo.gen.ts.
import type { AppState } from "../types";
import { FRAMEWORKS } from "./frameworks";
import { TOPICS } from "./index";
import type { Topic } from "./types";
import { frameworkUnlocked } from "./unlock";

/** Temas que se muestran: los de siempre más los frameworks ganados. */
export const visibleTopics = (s: AppState): Topic[] => [...TOPICS, ...FRAMEWORKS.filter((fw) => frameworkUnlocked(s, fw))];

/** Todos, ocultos incluidos: para encontrar una entrada que ya está en el repaso. */
export const ALL_TOPICS: Topic[] = [...TOPICS, ...FRAMEWORKS];
