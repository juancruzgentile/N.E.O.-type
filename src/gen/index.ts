import type { CodeLangId as LangId, Lesson } from "../types";
import { LANGS } from "../data/curriculum";
import { type Rng, pick } from "./base";
import { CONCEPTS, type ConceptId, type LangImpls, makeFullCtx } from "./concepts";
import { python } from "./lang/python";
import { javascript, typescript } from "./lang/jsts";
import { java } from "./lang/java";
import { csharp } from "./lang/csharp";
import { go } from "./lang/go";
import { rust } from "./lang/rust";

export const IMPLS: Record<LangId, LangImpls> = { python, javascript, typescript, java, csharp, go, rust };

/** Símbolos (no letras ni espacios) que usa un texto. */
export function symbolsOf(text: string): Set<string> {
  const out = new Set<string>();
  for (const ch of text) if (!/[A-Za-z\s]/.test(ch)) out.add(ch);
  return out;
}

export interface Snippet {
  title: string;
  tags: string[];
  text: string;
  concept: ConceptId;
}

/** Genera un fragmento de código cualquiera del lenguaje. */
export function randomSnippet(lang: LangId, rng: Rng): Snippet {
  const impls = IMPLS[lang];
  const available = CONCEPTS.filter((c) => impls[c.id]);
  const concept = pick(rng, available);
  const ctx = makeFullCtx(rng);
  const out = impls[concept.id]!(ctx);
  const text = Array.isArray(out) ? pick(rng, out) : out;
  return {
    title: concept.title(ctx, lang),
    tags: [LANGS[lang].name, concept.cat],
    text,
    concept: concept.id,
  };
}

/** Todas las variantes de un intento (para poder elegir la que encaje con los símbolos permitidos). */
function snippetVariants(lang: LangId, rng: Rng): Snippet[] {
  const impls = IMPLS[lang];
  const available = CONCEPTS.filter((c) => impls[c.id]);
  const concept = pick(rng, available);
  const ctx = makeFullCtx(rng);
  const out = impls[concept.id]!(ctx);
  const texts = Array.isArray(out) ? out : [out];
  return texts.map((text) => ({
    title: concept.title(ctx, lang),
    tags: [LANGS[lang].name, concept.cat],
    text,
    concept: concept.id,
  }));
}

/**
 * Busca un fragmento que use solo símbolos permitidos. Si hay foco, prefiere
 * los que lo contienen (y cuantas más apariciones, mejor).
 * Los conceptos de `avoid` quedan excluidos mientras aparezca otro fragmento válido;
 * si en los intentos no aparece ninguno, se acepta repetir antes que no dar lección.
 */
export function findSnippet(
  lang: LangId,
  allowed: Set<string>,
  focus: string | null,
  rng: Rng,
  avoid: ConceptId[] = [],
  attempts = 220,
): Snippet | null {
  let best: Snippet | null = null;
  let bestScore = -1;
  // mejor candidato con un concepto a evitar: solo se usa si no hay alternativa
  let alt: Snippet | null = null;
  let altScore = -1;
  for (let i = 0; i < attempts; i++) {
    for (const sn of snippetVariants(lang, rng)) {
      const syms = symbolsOf(sn.text);
      let ok = true;
      for (const s of syms) if (!allowed.has(s)) { ok = false; break; }
      if (!ok) continue;
      let score = 1 + rng() * 0.5;
      if (focus) {
        const count = sn.text.split(focus).length - 1;
        if (count === 0) score -= 10;
        else score += Math.min(count, 6);
      }
      if (avoid.includes(sn.concept)) {
        if (score > altScore) {
          alt = sn;
          altScore = score;
        }
        continue;
      }
      if (score > bestScore) {
        best = sn;
        bestScore = score;
      }
    }
    if (bestScore >= 6) break;
  }
  const valid = (sn: Snippet | null, sc: number) => (sn && !(focus && sc < 0) ? sn : null);
  return valid(best, bestScore) ?? valid(alt, altScore);
}

export function snippetLesson(sn: Snippet, focus: string | null): Lesson {
  return { kind: "code", title: sn.title, tags: sn.tags, text: sn.text, focus, concept: sn.concept };
}
