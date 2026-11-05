// Motor de las entrevistas: arma la entrevista, corrige y lleva el repaso de las preguntas falladas.
import { type Rng } from "../gen/base";
import { check } from "../recall/check";
import { grade, isDue } from "../review/review";
import type { ReviewItem } from "../types";
import { PREGUNTAS_POR_DURACION, PUESTOS } from "./catalogo";
import type { Nivel, Opciones, Pregunta, Resultado, Respuesta } from "./types";

export function mezclar<T>(arr: readonly T[], rng: Rng): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Las opciones de la pregunta en orden mezclado; `correcta` es el lugar de la que vale. */
export function opcionesMezcladas(q: Pregunta, rng: Rng): { opciones: string[]; correcta: number } {
  const base = q.opciones ?? [];
  const orden = mezclar(
    base.map((_, i) => i),
    rng,
  );
  return { opciones: orden.map((i) => base[i]), correcta: orden.indexOf(0) };
}

/** Corrige una pregunta de código. Un error leve (espacios, comillas…) cuenta como bien y trae un aviso. */
export function corregirCodigo(q: Pregunta, escrito: string): { ok: boolean; aviso?: string; esperada: string } {
  const respuestas = q.respuestas ?? [];
  const v = check(escrito, respuestas, q.kind ?? "code");
  if (v.status === "ok") return { ok: true, esperada: respuestas[0] };
  if (v.status === "minor") return { ok: true, aviso: v.notes.join(" · "), esperada: v.expected };
  return { ok: false, aviso: v.reason, esperada: respuestas[0] };
}

const ORDEN: Nivel[] = ["junior", "semi", "senior"];
/** Cuánto pesa una pregunta según qué tan cerca está del nivel pedido. */
const peso = (q: Pregunta, nivel: Nivel) => {
  const d = Math.abs(ORDEN.indexOf(q.nivel) - ORDEN.indexOf(nivel));
  return d === 0 ? 4 : d === 1 ? 1 : 0.25;
};

/** Toma `n` preguntas sin repetir; las del nivel pedido salen más seguido. */
function tomar(pool: Pregunta[], n: number, nivel: Nivel, rng: Rng): Pregunta[] {
  return pool
    .map((q) => ({ q, k: Math.pow(rng(), 1 / peso(q, nivel)) }))
    .sort((a, b) => b.k - a.k)
    .slice(0, n)
    .map((x) => x.q);
}

/**
 * Arma la entrevista: abre con una pregunta de conducta, sigue con el lenguaje, después con las otras áreas del
 * puesto, deja el código para el final y cierra con otra de conducta.
 */
export function armarEntrevista(op: Opciones, banco: Pregunta[], rng: Rng): Pregunta[] {
  const total = PREGUNTAS_POR_DURACION[op.minutos];
  const puesto = PUESTOS.find((p) => p.id === op.puesto) ?? PUESTOS[0];
  const usadas = new Set<string>();
  const sacar = (area: string, n: number, filtro: (q: Pregunta) => boolean = () => true) => {
    const t = tomar(
      banco.filter((q) => q.area === area && !usadas.has(q.id) && filtro(q)),
      n,
      op.nivel,
      rng,
    );
    t.forEach((q) => usadas.add(q.id));
    return t;
  };

  const conducta = sacar("conductual", 2, (q) => q.formato === "situacion");
  const apertura = conducta.slice(0, 1);
  const cierre = conducta.slice(1, 2);
  const centro = total - apertura.length - cierre.length;
  const deLang = Math.ceil(centro * 0.5);
  const otras = puesto.areas;
  const reparto = otras.map((_, i) => Math.floor((centro - deLang) / otras.length) + (i < (centro - deLang) % otras.length ? 1 : 0));

  const codigo = sacar(op.lang, 1, (q) => q.formato === "codigo");
  const lenguaje = [...sacar(op.lang, deLang - codigo.length, (q) => q.formato !== "codigo"), ...codigo];
  const resto = otras.flatMap((a, i) => sacar(a, reparto[i]));

  // si faltan preguntas en alguna área, se completa con el lenguaje y después con el resto del banco
  let faltan = centro - lenguaje.length - resto.length;
  const extra: Pregunta[] = [];
  for (const area of [op.lang, ...otras]) {
    if (faltan <= 0) break;
    const t = sacar(area, faltan);
    extra.push(...t);
    faltan -= t.length;
  }

  // lenguaje primero (el código al final de ese tramo), después las otras áreas agrupadas
  const noCodigo = lenguaje.filter((q) => q.formato !== "codigo");
  const seguidas = [...noCodigo, ...resto, ...extra];
  return [...apertura, ...seguidas, ...lenguaje.filter((q) => q.formato === "codigo"), ...cierre];
}

export function resultadoDe(respuestas: Respuesta[], banco: Pregunta[]): Resultado {
  const area = new Map<string, { ok: number; total: number }>();
  for (const r of respuestas) {
    const a = banco.find((q) => q.id === r.id)?.area ?? "otras";
    const x = area.get(a) ?? { ok: 0, total: 0 };
    x.total++;
    if (r.ok) x.ok++;
    area.set(a, x);
  }
  const ok = respuestas.filter((r) => r.ok).length;
  const total = respuestas.length;
  const pct = total ? Math.round((ok / total) * 100) : 0;
  return {
    ok,
    total,
    pct,
    nota: Math.round(pct) / 10,
    veredicto: pct >= 70 ? "aprobado" : pct >= 50 ? "casi" : "reforzar",
    porArea: [...area].map(([a, x]) => ({ area: a, ...x })).sort((p, q) => p.ok / p.total - q.ok / q.total),
  };
}

/** Preguntas del repaso que tocan hoy y que siguen existiendo en el banco. */
export function repasoPendiente(rev: Record<string, ReviewItem>, banco: Pregunta[], dia: string): Pregunta[] {
  return banco.filter((q) => rev[q.id] && isDue(rev[q.id], dia));
}

/** Anota un intento: una pregunta que no estaba en el repaso entra solo si se falló. */
export function anotarRepaso(rev: Record<string, ReviewItem>, id: string, ok: boolean, dia: string): Record<string, ReviewItem> {
  const actual = rev[id];
  if (!actual && ok) return rev;
  return { ...rev, [id]: grade(actual, ok ? 1 : 0, dia).item };
}
