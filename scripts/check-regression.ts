// Tests de regresión de los errores encontrados en las auditorías (ver correcciones.txt).
// Uso: npm run test:regression
import { readFileSync } from "node:fs";
import { TypingSession } from "../src/engine/session";
import { MAX_IMPORT_BYTES, byteLength } from "../src/sanitize";
import { initialState, parseBackup, serializeState } from "../src/store";
import { emptyProfile, fullSet } from "../src/engine/stats";
import { findSnippet } from "../src/gen/index";
import { makeRng } from "../src/gen/base";
import { LANG_ORDER } from "../src/data/curriculum";
import { TRACK_ORDER } from "../src/tracks/index";
import { LAYOUTS } from "../src/data/layouts";
import type { AppState, LessonResult } from "../src/types";

let failed = 0;
const ok = (cond: boolean, msg: string) => {
  if (!cond) failed++;
  console.log(`${cond ? "✓" : "✗"} ${msg}`);
};
const type = (s: TypingSession, keys: string, mode: "block" | "advance" | "strict") =>
  [...keys].map((ch, i) => s.input(ch, 1000 + i * 200, mode));

// ── motor de sesiones ──
for (const mode of ["advance", "strict"] as const) {
  const s = new TypingSession("abc");
  const res = type(s, "abX", mode);
  ok(res[2] === "error" && s.done && s.result().errors === 1, `${mode}: error en el último carácter devuelve error, cierra y cuenta`);
}
{
  const s = new TypingSession("abc");
  const res = type(s, "abc", "block");
  ok(res[2] === "done" && s.result().errors === 0 && s.result().acc === 1, "texto correcto: done con 0 errores");
}
{
  const s = new TypingSession("abc");
  type(s, "abX", "block");
  s.stop(2000);
  const r = s.result();
  ok(r.chars === 2 && r.attempted === 3, "posición pendiente: suma intentos pero no caracteres");
  ok(r.errors === 1 && Math.abs(r.acc - 2 / 3) < 1e-9, "posición pendiente: cuenta en la precisión");
  ok(s.samples().some((x) => x.char === "c" && x.error), "posición pendiente: entra en las muestras");
}

// ── copias de seguridad ──
ok(byteLength("ñ") === 2 && byteLength("a") === 1, "byteLength cuenta bytes UTF-8 (igual que File.size)");
{
  // estado grande y válido: 48 perfiles × 500 lecciones (el caso de la auditoría)
  const big: AppState = initialState();
  const lesson: LessonResult = { ts: 1_700_000_000_000, wpm: 61.234567, acc: 0.98765, chars: 240, ms: 52_345, score: 1234, kind: "code" };
  const langs = [...LANG_ORDER, ...TRACK_ORDER];
  for (const lang of langs) for (const layout of Object.keys(LAYOUTS)) {
    big.profiles[`${lang}:${layout}`] = { ...emptyProfile(), lessons: Array.from({ length: 500 }, (_, i) => ({ ...lesson, ts: lesson.ts + i })) };
  }
  const json = serializeState(big);
  ok(Object.keys(big.profiles).length === 48, "estado de prueba con 48 perfiles");
  ok(!json.includes("\n"), "la exportación es JSON compacto");
  ok(byteLength(json) <= MAX_IMPORT_BYTES, `una exportación grande entra en el límite (${byteLength(json)} bytes)`);
  let restored: AppState | null = null;
  try {
    restored = parseBackup(json);
  } catch {
    restored = null;
  }
  // se compara contra el estado original, no contra otra importación
  const canon = (v: unknown): unknown =>
    Array.isArray(v) ? v.map(canon)
    : v && typeof v === "object" ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, canon((v as Record<string, unknown>)[k])]))
    : v;
  const same = (a: unknown, b: unknown) => JSON.stringify(canon(a)) === JSON.stringify(canon(b));
  ok(restored !== null && same(restored.profiles, big.profiles), "esa exportación se vuelve a importar sin perder progreso");
  ok(restored !== null && same(restored, big), "y el estado completo queda igual al exportado");
  const huge = { ...initialState(), settings: { ...initialState().settings, userName: "x".repeat(MAX_IMPORT_BYTES) } };
  let threw = false;
  try {
    serializeState(huge);
  } catch {
    threw = true;
  }
  ok(threw, "exportar más de 5 MiB avisa en vez de generar una copia inservible");
  let rejected = false;
  try {
    parseBackup(" ".repeat(MAX_IMPORT_BYTES + 1));
  } catch {
    rejected = true;
  }
  ok(rejected, "importar más de 5 MiB se rechaza");
}

// ── conceptos: no se repite el anterior si hay alternativa ──
{
  let repeats = 0;
  let runs = 0;
  for (const lang of ["python", "javascript", "rust"] as const) {
    const allowed = fullSet(lang, initialState().settings);
    for (const focus of [null, "0", "("]) {
      for (let seed = 1; seed <= 150; seed++) {
        const rng = makeRng(seed);
        const a = findSnippet(lang, allowed, focus, rng);
        if (!a) continue;
        const b = findSnippet(lang, allowed, focus, rng, [a.concept]);
        runs++;
        if (b && b.concept === a.concept) repeats++;
      }
    }
  }
  ok(runs > 0 && repeats === 0, `ningún concepto repetido en ${runs} lecciones consecutivas`);
}
{
  // caso reproducido en la re-auditoría: Python, foco 0, semilla 123
  const allowed = fullSet("python", initialState().settings);
  const rng = makeRng(123);
  const a = findSnippet("python", allowed, "0", rng);
  const b = a && findSnippet("python", allowed, "0", rng, [a.concept]);
  ok(!!a && !!b && a.concept !== b.concept, "Python foco 0 semilla 123: el concepto no se repite");
}

// ── música: la selección sigue a la canción, no al índice ──
{
  // dobles mínimos de Web Audio y <audio> para correr el motor en Node
  const node: any = new Proxy(function () {}, {
    get: (_t, k) => (k === "then" ? undefined : k === "currentTime" ? 0 : node),
    apply: () => node,
    set: () => true,
  });
  const g = globalThis as any;
  g.AudioContext = class {
    sampleRate = 8;
    currentTime = 0;
    state = "running";
    destination = node;
    createBuffer = (_c: number, len: number) => ({ getChannelData: () => new Float32Array(len) });
    constructor() {
      return new Proxy(this, { get: (t: any, k) => (k in t ? t[k] : () => node) });
    }
  };
  let created = 0;
  const audios: { currentTime: number; paused: boolean }[] = [];
  g.Audio = class {
    src: string;
    currentTime = 0;
    paused = true;
    onended: (() => void) | null = null;
    constructor(src: string) {
      this.src = src;
      created++;
      audios.push(this);
    }
    play() {
      this.paused = false;
      return Promise.resolve();
    }
    pause() {
      this.paused = true;
    }
  };
  (URL as any).createObjectURL = (b: { tag: string }) => b.tag;
  (URL as any).revokeObjectURL = () => {};
  const { music } = await import("../src/audio/music");
  const t = (id: string) => ({ id, name: id.toUpperCase(), blob: { tag: id } as unknown as Blob });
  music.setTracks([t("a"), t("b"), t("c")]);
  music.playUser(1);
  music.setTracks([t("b"), t("c")]);
  ok(music.snap.userIndex === 0 && music.snap.userTracks[music.snap.userIndex].id === "b" && music.snap.playing,
    "quitar una canción anterior mantiene seleccionada la que suena");
  const before = created;
  const el = audios[audios.length - 1];
  el.currentTime = 42.5;
  music.pause();
  ok(el.paused && !music.snap.playing && el.currentTime === 42.5, "pausar detiene la canción en su posición");
  music.resume();
  ok(created === before && music.snap.playing && !el.paused && audios[audios.length - 1] === el,
    "reanudar sigue con el mismo audio");
  ok(el.currentTime === 42.5, "reanudar continúa desde 42,5 s (no vuelve al principio)");
  music.setTracks([t("c")]);
  ok(!music.snap.playing && music.snap.userIndex === 0, "quitar la canción que suena la detiene");
}

// ── CSS: en modo calmo los logros quedan visibles ──
{
  const css = readFileSync("src/styles.css", "utf8");
  ok(/html\.calm \.toast\s*\{[^}]*animation:\s*none\s*!important[^}]*opacity:\s*1/.test(css), "modo calmo: el aviso de logro no se anima y queda visible");
}

console.log(failed ? `\n${failed} test(s) fallaron` : "\nTodos los tests de regresión pasaron");
process.exit(failed ? 1 : 0);
