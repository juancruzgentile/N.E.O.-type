// Trae el contenido de cada tema recién cuando hace falta. En NeonType.html todo queda adentro igual; en la web cada
// archivo es un pedazo aparte que se baja al abrir su tema.
import { CATALOGO } from "./catalogo.gen";
import type { Topic } from "./types";

const web = () => import("./web");
const tools = () => import("./tools");
const fw = () => import("./frameworks");
const moviles = () => import("./frameworks-moviles");

/** Qué archivo tiene cada tema. Una prueba revisa que estén todos los del catálogo. */
const ARCHIVO: Record<string, () => Promise<object>> = {
  python: () => import("./python"), javascript: () => import("./javascript"), typescript: () => import("./typescript"),
  java: () => import("./java"), csharp: () => import("./csharp"), go: () => import("./go"), rust: () => import("./rust"),
  c: () => import("./c"), cpp: () => import("./cpp"), swift: () => import("./swift"), kotlin: () => import("./kotlin"),
  php: () => import("./php"), sql: () => import("./sql"), html: web, css: web, formats: tools, linux: tools, git: tools,
  "web-http": () => import("./web-http"), apis: () => import("./apis"), "elegir-bd": () => import("./elegir-bd"),
  postgresql: () => import("./postgresql"), mongodb: () => import("./mongodb"), redis: () => import("./redis"),
  vectoriales: () => import("./vectoriales"), asincronia: () => import("./asincronia"), storage: () => import("./storage"),
  "seguridad-datos": () => import("./seguridad-datos"), testing: () => import("./testing"), docker: () => import("./docker"),
  claude: () => import("./claude"), codex: () => import("./codex"), opencode: () => import("./opencode"),
  antigravity: () => import("./antigravity"), hermes: () => import("./hermes"), gemini: () => import("./gemini"),
  chatgpt: () => import("./chatgpt"), cursor: () => import("./cursor"),
  react: fw, fastapi: fw, django: fw, spring: fw, aspnet: fw, swiftui: moviles, compose: moviles, laravel: moviles,
};

const cargados = new Map<string, Topic>();
const enCamino = new Map<string, Promise<Topic>>();

/** El tema si ya está cargado. */
export const temaCargado = (id: string) => cargados.get(id);

/** Carga un tema. Si falla (por ejemplo, sin red) no queda guardado el error: el próximo intento vuelve a probar. */
export function cargarTema(id: string): Promise<Topic> {
  const listo = cargados.get(id);
  if (listo) return Promise.resolve(listo);
  let p = enCamino.get(id);
  if (!p) {
    const archivo = ARCHIVO[id];
    p = (archivo ? archivo() : Promise.reject(new Error(`tema desconocido: ${id}`))).then((m) => {
      const t = Object.values(m).find((v): v is Topic => !!v && typeof v === "object" && (v as Topic).id === id && Array.isArray((v as Topic).entries));
      if (!t) throw new Error(`el archivo no tiene el tema ${id}`);
      cargados.set(id, t);
      return t;
    });
    enCamino.set(id, p);
    p.catch(() => {}).finally(() => enCamino.delete(id));
  }
  return p;
}

let dueño: Map<string, string> | null = null;
/** De qué tema es una entrada, sin cargar nada (null si la entrada ya no existe). */
export function temaDeEntrada(id: string): string | null {
  dueño ??= new Map(CATALOGO.flatMap((t) => t.ids.map((s) => [`lib-${t.id}-${s}`, t.id] as const)));
  return dueño.get(id) ?? null;
}
