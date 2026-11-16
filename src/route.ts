// Navegación con el hash de la URL (#/biblioteca/git/clase): el botón Atrás vuelve, recargar no pierde el lugar y
// se puede enlazar a un tema. El hash viene de afuera: solo se compara contra pantallas y temas conocidos.
import type { View } from "./types";

const SLUG: Record<View, string> = {
  languages: "lenguajes", practice: "practica", routes: "rutas", stats: "estadisticas", challenges: "desafios",
  library: "biblioteca", interview: "entrevista", achievements: "logros", settings: "ajustes",
};

export const viewHash = (v: View, ...rest: string[]) => "#/" + [SLUG[v], ...rest].join("/");

export function readHash(): { view: View | null; rest: string[] } {
  const [slug, ...rest] = location.hash.replace(/^#\/?/, "").split("/");
  return { view: (Object.keys(SLUG) as View[]).find((v) => SLUG[v] === slug) ?? null, rest };
}

/** Cambia el hash sin disparar hashchange. Completar una URL que solo tenía la pantalla (#/biblioteca → #/biblioteca/git) reemplaza la entrada; lo demás suma una para el botón Atrás. */
export function writeHash(h: string, replace = false) {
  const cur = location.hash;
  if (h === cur) return;
  if (replace || (cur.split("/").length <= 2 && (cur.length <= 2 || h.startsWith(cur + "/")))) history.replaceState(null, "", h);
  else history.pushState(null, "", h);
}
