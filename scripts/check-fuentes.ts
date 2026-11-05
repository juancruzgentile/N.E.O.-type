// Revisa las fuentes de la Biblioteca (link oficial y versión de cada ejemplo).
// Sin red: cada ejemplo tiene fuente, los links son https y no hay nombres que sobren.
// Con FUENTES_RED=1: además abre cada link y comprueba que la página exista y que el ancla (#...) esté en ella.
//   FUENTES_RED=1 npm run test:fuentes
import { ALL_TOPICS } from "../src/library/unlock";
import { FUENTES } from "../src/library/fuentes/index";

let problems = 0;
const bad = (msg: string) => {
  problems++;
  console.log(`✗ ${msg}`);
};

for (const t of ALL_TOPICS) {
  const f = FUENTES[t.id];
  if (!f) {
    bad(`[${t.name}] el tema no tiene fuentes`);
    continue;
  }
  const names = new Set(t.entries.map((e) => e.name));
  for (const e of t.entries) {
    const s = f.entradas[e.name];
    if (!s) bad(`[${t.name}] ${e.name}: sin fuente`);
    else if (!/^https:\/\/[^\s]+$/.test(s[0])) bad(`[${t.name}] ${e.name}: el link no es https válido`);
  }
  for (const n of Object.keys(f.entradas)) if (!names.has(n)) bad(`[${t.name}] fuente para un ejemplo que no existe: ${n}`);
}

if (process.env.FUENTES_RED === "1") {
  const pages = new Map<string, Promise<{ status: number; html: string }>>();
  const load = (url: string) => {
    let p = pages.get(url);
    if (!p) {
      p = fetch(url, { redirect: "follow", headers: { "user-agent": "neo-type-check-fuentes" }, signal: AbortSignal.timeout(30000) })
        .then(async (r) => ({ status: r.status, html: r.ok ? await r.text() : "" }))
        .catch(() => ({ status: 0, html: "" }));
      pages.set(url, p);
    }
    return p;
  };
  const jobs: (() => Promise<void>)[] = [];
  for (const t of ALL_TOPICS) {
    for (const [name, [url]] of Object.entries(FUENTES[t.id]?.entradas ?? {})) {
      jobs.push(async () => {
        const [page, hash] = url.split("#");
        const r = await load(page);
        if (r.status !== 200) return bad(`[${t.name}] ${name}: ${url} respondió ${r.status || "sin respuesta"}`);
        if (hash && !new RegExp(`(id|name)=["']?${hash.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["' >]`).test(r.html))
          bad(`[${t.name}] ${name}: ${url} no tiene el ancla #${hash}`);
      });
    }
  }
  let next = 0;
  await Promise.all(Array.from({ length: 6 }, async () => { while (next < jobs.length) await jobs[next++](); }));
  console.log(`\nLinks abiertos: ${jobs.length} (${pages.size} páginas)`);
} else console.log("\n(Sin red: para abrir los links, FUENTES_RED=1)");

console.log(problems ? `\nPROBLEMAS: ${problems}` : "\nLas fuentes de la Biblioteca están completas y válidas");
process.exit(problems ? 1 : 0);
