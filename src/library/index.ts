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
import { cursor } from "./cursor";
import { chatgpt } from "./chatgpt";
import { gemini } from "./gemini";
import { hermes } from "./hermes";
import { antigravity } from "./antigravity";
import { opencode } from "./opencode";
import { elegirBd } from "./elegir-bd";
import { postgresql } from "./postgresql";
import { mongodb } from "./mongodb";
import { redis } from "./redis";
import { vectoriales } from "./vectoriales";
import { asincronia } from "./asincronia";
import { storage } from "./storage";
import { seguridadDatos } from "./seguridad-datos";
import { webHttp } from "./web-http";
import { apis } from "./apis";
import { testing } from "./testing";
import { docker } from "./docker";

export const TOPICS: Topic[] = [
  python, javascript, typescript, java, csharp, go, rust, c, cpp, swift, kotlin, php,
  sql, html, css, formats, webHttp, apis,
  elegirBd, postgresql, mongodb, redis, vectoriales, asincronia, storage, seguridadDatos,
  linux, git, testing, docker,
  claude, codex, opencode, antigravity, hermes, gemini, chatgpt, cursor,
];

export const GROUPS: Topic["group"][] = ["Lenguajes", "Web y datos", "Bases de datos", "Herramientas", "IA", "Frameworks"];

/** Lo que viene: inteligencia artificial y herramientas para programar con ella. */
export const SOON: Soon[] = [
  { id: "ia", name: "IA: conceptos", desc: "Modelos de lenguaje, tokens, ventana de contexto, prompts, agentes, RAG y cómo evaluar respuestas." },
];

export const totalEntries = TOPICS.reduce((n, t) => n + t.entries.length, 0);
