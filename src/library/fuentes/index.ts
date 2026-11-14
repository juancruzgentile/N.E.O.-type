import type { FuentesTema } from "./tipos";
import { python } from "./python";
import { javascript } from "./javascript";
import { typescript } from "./typescript";
import { java } from "./java";
import { csharp } from "./csharp";
import { go } from "./go";
import { rust } from "./rust";
import { c } from "./c";
import { cpp } from "./cpp";
import { sql } from "./sql";
import { html } from "./html";
import { css } from "./css";
import { formats } from "./formats";
import { linux } from "./linux";
import { git } from "./git";
import { swift } from "./swift";
import { kotlin } from "./kotlin";
import { php } from "./php";
import { claude } from "./claude";
import { codex } from "./codex";
import { hermes } from "./hermes";
import { antigravity } from "./antigravity";
import { opencode } from "./opencode";
import { webHttp, apis, testing, docker } from "./extras";
import { elegirBd, postgresql, mongodb, redis, vectoriales, asincronia, storage, seguridadDatos } from "./bd";
import { react, fastapi, django, spring, aspnet, swiftui, compose, laravel } from "./frameworks";

/** Día en que se confirmó cada link y cada versión contra la documentación oficial. */
export const REVISADO = "2026-11-05";

export const FUENTES: Record<string, FuentesTema> = { "web-http": webHttp, apis, testing, docker, python, javascript, typescript, java, csharp, go, rust, c, cpp, sql, html, css, formats, linux, git, swift, kotlin, php, claude, codex, hermes, antigravity, opencode, "elegir-bd": elegirBd, postgresql, mongodb, redis, vectoriales, asincronia, storage, "seguridad-datos": seguridadDatos, react, fastapi, django, spring, aspnet, swiftui, compose, laravel };

export interface FuenteDe {
  url: string;
  /** dominio, para mostrar en vez del link entero */
  sitio: string;
  /** desde qué versión funciona (la del ejemplo, o la de referencia del tema) */
  version: string;
  revisado: string;
}

/** Fuente de un ejemplo, o null si no tiene (o si el link no es https). */
export function fuenteDe(topicId: string, entryName: string): FuenteDe | null {
  const t = FUENTES[topicId];
  const f = t?.entradas[entryName];
  if (!f || !f[0].startsWith("https://")) return null;
  return { url: f[0], sitio: new URL(f[0]).hostname.replace(/^www\./, ""), version: f[1] ?? t.version, revisado: REVISADO };
}
