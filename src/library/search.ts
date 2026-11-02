import type { Entry, Topic } from "./types";

/** Minúsculas y sin acentos: "Función" y "funcion" son lo mismo. */
export const normalize = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export interface Hit {
  topic: Topic;
  entry: Entry;
  score: number;
}

interface Indexed {
  topic: Topic;
  entry: Entry;
  name: string;
  topicName: string;
  cat: string;
  tags: string;
  desc: string;
  code: string;
}

const cache = new WeakMap<Topic[], Indexed[]>();

function index(topics: Topic[]): Indexed[] {
  const hit = cache.get(topics);
  if (hit) return hit;
  const out = topics.flatMap((topic) =>
    topic.entries.map((entry) => ({
      topic,
      entry,
      name: normalize(entry.name),
      topicName: normalize(`${topic.name} ${topic.id}`),
      cat: normalize(entry.cat),
      tags: normalize(entry.tags ?? ""),
      desc: normalize(entry.desc),
      code: normalize(entry.code),
    })),
  );
  cache.set(topics, out);
  return out;
}

/**
 * Busca en toda la biblioteca. Cada palabra de la consulta tiene que aparecer en
 * algún campo; pesa más si está en el nombre, después en la categoría o los
 * sinónimos, y menos en la descripción o el ejemplo. Nombrar el tema ("python
 * listas") filtra por ese tema.
 */
export function search(topics: Topic[], query: string, limit = 80): Hit[] {
  let words = normalize(query).split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  // una palabra que es el nombre de un tema ("python", "git", "css") filtra por ese tema
  const named = topics.filter((t) => words.some((w) => w === t.id || w === normalize(t.name).split(" ")[0]));
  if (named.length) {
    const ids = new Set(named.flatMap((t) => [t.id, normalize(t.name).split(" ")[0]]));
    const rest = words.filter((w) => !ids.has(w));
    // si solo se escribió el tema, se muestran sus entradas
    if (!rest.length) return named.flatMap((t) => t.entries.map((entry) => ({ topic: t, entry, score: 1 }))).slice(0, limit);
    words = rest;
    topics = named;
  }
  const out: Hit[] = [];
  for (const it of index(topics)) {
    let score = 0;
    let all = true;
    for (const w of words) {
      let s = 0;
      if (it.name === w) s = 100;
      else if (it.name.startsWith(w)) s = 60;
      else if (it.name.includes(w)) s = 40;
      else if (it.topicName.includes(w)) s = 25;
      else if (it.cat.includes(w) || it.tags.includes(w)) s = 20;
      else if (it.desc.includes(w)) s = 10;
      else if (it.code.includes(w)) s = 5;
      if (!s) {
        all = false;
        break;
      }
      score += s;
    }
    if (all) out.push({ topic: it.topic, entry: it.entry, score });
  }
  // a igual puntaje, lo más básico primero
  const lv = { basico: 0, intermedio: 1, avanzado: 2 };
  out.sort((a, b) => b.score - a.score || lv[a.entry.level] - lv[b.entry.level]);
  return out.slice(0, limit);
}

const slug = (s: string) => normalize(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
/** Identificador estable de una entrada (para enlazar y desplazarse hasta ella). */
export const entryId = (topic: Topic, entry: Entry) => `lib-${topic.id}-${slug(entry.cat)}-${slug(entry.name)}`;
