// Grupos de la Biblioteca y lo que viene. Vive aparte para poder usarlo sin cargar el contenido de los temas.
import type { Soon, Topic } from "./types";

export const GROUPS: Topic["group"][] = ["Lenguajes", "Web y datos", "Bases de datos", "Herramientas", "IA", "Frameworks"];

/** Lo que viene: inteligencia artificial y herramientas para programar con ella. */
export const SOON: Soon[] = [
  { id: "ia", name: "IA: conceptos", desc: "Modelos de lenguaje, tokens, ventana de contexto, prompts, agentes, RAG y cómo evaluar respuestas." },
];
