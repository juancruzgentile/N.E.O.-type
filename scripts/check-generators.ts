// Verifica los generadores: símbolos fuera del currículum, caracteres no ASCII,
// líneas con tabulaciones y desde qué etapa aparece código real.
import { LANGS, LANG_ORDER, allChars, unlockedChars } from "../src/data/curriculum";
import { makeRng } from "../src/gen/base";
import { IMPLS, findSnippet, randomSnippet, symbolsOf } from "../src/gen/index";
import { CONCEPTS } from "../src/gen/concepts";
import { drillLesson } from "../src/gen/drills";

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
console.log(problems ? `PROBLEMAS: ${problems}` : "OK sin problemas");
