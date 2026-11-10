// Biblioteca: referencia rápida de cada lenguaje y herramienta de la app.
// Para sumar un tema: crear su archivo con un objeto Topic y agregarlo a TOPICS.
import type { Soon, Topic } from "./types";
import { python } from "./python";
import { javascript } from "./javascript";
import { typescript } from "./typescript";
import { java } from "./java";
import { csharp } from "./csharp";
import { go } from "./go";
import { rust } from "./rust";
import { c } from "./c";
import { cpp } from "./cpp";
import { swift } from "./swift";
import { kotlin } from "./kotlin";
import { php } from "./php";
import { sql } from "./sql";
import { css, html } from "./web";
import { formats, git, linux } from "./tools";
import { claude } from "./claude";
import { codex } from "./codex";

export const TOPICS: Topic[] = [
  python, javascript, typescript, java, csharp, go, rust, c, cpp, swift, kotlin, php,
  sql, html, css, formats,
  linux, git,
  claude, codex,
];

export const GROUPS: Topic["group"][] = ["Lenguajes", "Web y datos", "Herramientas", "IA", "Frameworks"];

/** Lo que viene: inteligencia artificial y herramientas para programar con ella. */
export const SOON: Soon[] = [
  { id: "ia", name: "IA: conceptos", desc: "Modelos de lenguaje, tokens, ventana de contexto, prompts, agentes, RAG y cómo evaluar respuestas." },
  { id: "chatgpt", name: "ChatGPT", desc: "El asistente de OpenAI: buenas prácticas para programar, depurar y aprender con él." },
  { id: "gemini", name: "Gemini", desc: "Los modelos y el asistente de Google, y su integración con las herramientas de desarrollo." },
  { id: "cursor", name: "Cursor", desc: "Editor de código con IA integrada: autocompletado, chat sobre el proyecto y agentes." },
  { id: "opencode", name: "OpenCode", desc: "Agente de programación de código abierto para la terminal, compatible con varios modelos." },
  { id: "antigravity", name: "Antigravity", desc: "El entorno de desarrollo de Google pensado para trabajar con agentes en el editor, la terminal y el navegador." },
  { id: "hermes", name: "Hermes", desc: "Hermes Agent, el agente de código abierto de Nous Research: memoria entre sesiones y habilidades reutilizables." },
];

export const totalEntries = TOPICS.reduce((n, t) => n + t.entries.length, 0);
