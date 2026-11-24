// El contenido completo de los temas, todo junto: solo para las pruebas. La app los carga de a uno con carga.ts.
import { FRAMEWORKS } from "./frameworks";
import { TOPICS } from "./index";
import type { Topic } from "./types";

/** Todos, ocultos incluidos. */
export const ALL_TOPICS: Topic[] = [...TOPICS, ...FRAMEWORKS];
