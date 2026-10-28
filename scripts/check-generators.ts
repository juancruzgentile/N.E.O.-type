// Verifica los generadores: símbolos fuera del currículum, caracteres no ASCII,
// líneas con tabulaciones y desde qué etapa aparece código real.
import { LANGS, LANG_ORDER, allChars, unlockedChars } from "../src/data/curriculum";
import { makeRng } from "../src/gen/base";
import { IMPLS, findSnippet, randomSnippet, symbolsOf } from "../src/gen/index";
import { CONCEPTS } from "../src/gen/concepts";
import { drillLesson } from "../src/gen/drills";
import { TRACKS, TRACK_ORDER, freeExercise, stepExercise } from "../src/tracks/index";
import { LAYOUTS } from "../src/data/layouts";
import { fullSet } from "../src/engine/stats";
import { DEFAULT_SETTINGS } from "../src/store";

let problems = 0;
const rng = makeRng(42);
for (const lang of LANG_ORDER) {
  const all = new Set(allChars(lang));
  const missingConcepts = CONCEPTS.filter((c) => !IMPLS[lang][c.id]).map((c) => c.id);
  const titles = new Set<string>();
  const texts = new Set<string>();
  for (let i = 0; i < 4000; i++) {
    const sn = randomSnippet(lang, rng);
    titles.add(sn.title);
    texts.add(sn.text);
    for (const s of symbolsOf(sn.text)) {
      if (!all.has(s)) { problems++; console.log(`[${lang}] símbolo fuera del currículum: ${JSON.stringify(s)} en ${sn.concept}`); }
    }
    if (/[^\x20-\x7e\n]/.test(sn.text)) { problems++; console.log(`[${lang}] carácter no ASCII en ${sn.concept}: ${sn.text}`); }
    if (/ +\n|\t/.test(sn.text)) { problems++; console.log(`[${lang}] espacios finales o tab en ${sn.concept}`); }
  }
  let firstCode = -1;
  const stages = LANGS[lang].stages;
  for (let st = 0; st < stages.length; st++) {
    const allowed = new Set(unlockedChars(lang, st));
    if (findSnippet(lang, allowed, null, rng, [], 300)) { firstCode = st; break; }
  }
  // drills: cada símbolo del currículum tiene ejercicio
  for (let st = 0; st < stages.length; st++) {
    const allowed = new Set(unlockedChars(lang, st));
    for (const f of stages[st]) {
      const d = drillLesson(allowed, f, rng);
      if (!d.text.includes(f)) { problems++; console.log(`[${lang}] drill sin foco ${f} en etapa ${st}`); }
      for (const s of symbolsOf(d.text)) if (!allowed.has(s)) { problems++; console.log(`[${lang}] drill usa ${s} bloqueado (foco ${f})`); }
    }
  }
  console.log(`${lang.padEnd(11)} conceptos faltantes: ${missingConcepts.length ? missingConcepts.join(",") : "-"} | títulos distintos: ${titles.size} | fragmentos distintos: ${texts.size} | código real desde etapa ${firstCode + 1}/${stages.length} (${stages.slice(0, firstCode + 1).flat().join(" ")})`);
}

// rutas Trainee: cada escalón y cada variante generan ejercicios válidos, en todos los teclados
for (const id of TRACK_ORDER) {
  const t = TRACKS[id];
  const all = new Set(t.symbols);
  const titles = new Set<string>();
  const texts = new Set<string>();
  const check = (where: string, title: string, text: string) => {
    titles.add(title);
    texts.add(text);
    for (const s of symbolsOf(text)) if (!all.has(s)) { problems++; console.log(`[${id}] símbolo fuera de la lista: ${JSON.stringify(s)} (${where}: ${title})`); }
    if (/[^\x20-\x7e\n]/.test(text)) { problems++; console.log(`[${id}] carácter no ASCII (${where}): ${text}`); }
    if (/ +\n|\t| $/.test(text)) { problems++; console.log(`[${id}] espacios finales o tab (${where}: ${title})`); }
    if (!text.trim()) { problems++; console.log(`[${id}] texto vacío (${where})`); }
  };
  t.steps.forEach((st, i) => {
    for (let k = 0; k < 1500; k++) {
      const e = stepExercise(t, i, rng, all);
      if (!e) { problems++; console.log(`[${id}] el escalón ${st.id} no generó ejercicio`); break; }
      check(st.id, e.title, e.text);
    }
    for (const topic of st.topics) {
      const ok = st.variants.some((v) => Array.from({ length: 30 }, () => topic.gen(rng, v)).some(Boolean));
      if (!ok) { problems++; console.log(`[${id}] el tema ${topic.id} nunca genera en ${st.id}`); }
    }
  });
  for (const v of t.variants) {
    for (let k = 0; k < 800; k++) {
      const e = freeExercise(t, t.freeSetting ? v.id : null, rng, all);
      if (!e) { problems++; console.log(`[${id}] libre sin ejercicio en ${v.id}`); break; }
      check(`libre ${v.id}`, e.title, e.text);
    }
  }
  const used = new Set([...texts].flatMap((x) => [...symbolsOf(x)]));
  const unused = t.symbols.filter((c) => !used.has(c));
  if (unused.length) { problems++; console.log(`[${id}] símbolos declarados que nunca aparecen: ${unused.join(" ")}`); }
  const missing: string[] = [];
  for (const layout of Object.keys(LAYOUTS) as (keyof typeof LAYOUTS)[]) {
    const allowed = fullSet(id, { ...DEFAULT_SETTINGS, layout, excludeMissing: true });
    t.steps.forEach((st, i) => {
      if (!stepExercise(t, i, rng, allowed, 400)) { problems++; missing.push(`${layout}:${st.id}`); }
    });
  }
  if (missing.length) console.log(`[${id}] escalones sin ejercicio escribible: ${missing.join(", ")}`);
  console.log(`${id.padEnd(11)} escalones: ${t.steps.length} | temas: ${t.steps.reduce((n, s) => n + s.topics.length, 0)} | títulos distintos: ${titles.size} | fragmentos distintos: ${texts.size}`);
}
console.log(problems ? `PROBLEMAS: ${problems}` : "OK sin problemas");
// sin esto CI aprobaba aunque hubiera problemas
if (problems) process.exitCode = 1;
