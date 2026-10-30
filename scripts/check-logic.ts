// Tests de la lógica de la app: progreso, logros, resaltado y canciones guardadas.
// Uso: npm run test:logic
import {
  applySamples, applyStep, canUnlock, emptyProfile, keyInfo, lessonScore, nextStage, pickFocus, stageInfos, stepInfos,
  STEP_WINDOW, MAX_SAMPLE_MS,
} from "../src/engine/stats";
import { ACHIEVEMENTS, newAchievements } from "../src/engine/achievements";
import { highlight } from "../src/highlight";
import { initialState, streakDays, today } from "../src/store";
import { LANGS, stageCount, unlockedChars } from "../src/data/curriculum";
import { TRACKS } from "../src/tracks/index";
import { KeyLearner, LAYOUTS, comboMap, comboText, isTypeable, layoutFor, readKey } from "../src/data/layouts";
import type { AppState, KeyStat, LessonResult, Profile } from "../src/types";

let failed = 0;
const ok = (cond: boolean, msg: string) => {
  if (!cond) failed++;
  console.log(`${cond ? "✓" : "✗"} ${msg}`);
};
const S = initialState().settings; // objetivo 30 WPM (400 ms por tecla), 20 muestras, 95 % de precisión
const dominated: KeyStat = { n: S.minSamples, ema: 300, hits: 50, misses: 0, recent: "1".repeat(50) };

// ── muestras por tecla ──
{
  const k = applySamples({}, [
    { char: "(", ms: null, error: false },
    { char: "(", ms: 300, error: false },
    { char: "(", ms: 500, error: true },
    { char: "(", ms: MAX_SAMPLE_MS + 1, error: false },
  ])["("];
  ok(k.hits === 3 && k.misses === 1 && k.recent === "1101", "aciertos, fallos e historial reciente");
  ok(k.n === 2 && Math.abs(k.ema - (300 * 0.9 + 500 * 0.1)) < 1e-9, "la velocidad ignora tiempos nulos y pausas largas");
  const long = applySamples({}, Array.from({ length: 80 }, () => ({ char: "x", ms: 200, error: false })))["x"];
  ok(long.recent.length === 50, "el historial reciente guarda las últimas 50");
}

// ── estado de cada símbolo ──
ok(keyInfo("(", dominated, S, false).state === "locked", "símbolo bloqueado");
ok(keyInfo("(", { ...dominated, n: S.minSamples - 1 }, S, true).state === "new", "con pocas muestras es nuevo");
ok(keyInfo("(", dominated, S, true).state === "mastered", "rápido y preciso: dominado");
ok(keyInfo("(", { ...dominated, ema: 600 }, S, true).state === "learning", "lento: en aprendizaje");
ok(keyInfo("(", { ...dominated, recent: "1".repeat(45) + "0".repeat(5) }, S, true).state === "learning",
  "90 % de precisión (< 95 %): en aprendizaje");

// ── desbloqueo de etapas (lenguajes) ──
{
  const lang = "python";
  const p0 = emptyProfile();
  ok(!canUnlock(lang, p0, S), "sin práctica no se desbloquea la etapa siguiente");
  const keys = Object.fromEntries(unlockedChars(lang, 0).map((c) => [c, dominated]));
  const p1: Profile = { ...p0, keys };
  ok(canUnlock(lang, p1, S), "con toda la etapa dominada se desbloquea la siguiente");
  const st = nextStage(lang, 0, S);
  ok(st > 0 && st <= stageCount(lang) - 1, "la etapa siguiente existe");
  const last: Profile = { ...p1, stage: LANGS[lang].stages.length - 1 };
  ok(!canUnlock(lang, last, S), "en la última etapa no hay más para desbloquear");
  const weakChar = unlockedChars(lang, 0)[0];
  const p2: Profile = { ...p1, keys: { ...keys, [weakChar]: { ...dominated, n: 1 } } };
  ok(pickFocus(lang, p2, S) === weakChar, "el foco es el símbolo más débil");
  ok(stageInfos(lang, p0, S).some((k) => k.state === "locked"), "las etapas futuras aparecen bloqueadas");
}

// ── escalones (rutas Trainee) ──
{
  const track = "sql";
  const first = TRACKS[track].steps[0].id;
  let steps = {};
  for (let i = 0; i < STEP_WINDOW - 1; i++) steps = applyStep(steps, first, 40, 0.99);
  const p: Profile = { ...emptyProfile(), steps };
  ok(stepInfos(track, p, S)[0].state === "new", `con menos de ${STEP_WINDOW} lecciones el escalón no se evalúa`);
  steps = applyStep(steps, first, 40, 0.99);
  ok(stepInfos(track, { ...p, steps }, S)[0].state === "mastered", "3 lecciones sobre el objetivo dominan el escalón");
  ok(canUnlock(track, { ...p, steps }, S), "escalón dominado: se desbloquea el siguiente");
  const slow = [1, 2, 3].reduce((acc) => applyStep(acc, first, 20, 0.99), {});
  ok(stepInfos(track, { ...p, steps: slow }, S)[0].state === "learning", "lecciones lentas: en aprendizaje");
  const many = Array.from({ length: 9 }).reduce<Record<string, never>>((acc) => applyStep(acc, first, 40, 1) as never, {});
  ok((many as Profile["steps"])[first].w.length === 5 && (many as Profile["steps"])[first].n === 9, "se guardan las últimas 5 y el total");
}

// ── puntaje ──
ok(lessonScore(100, 50, 1) === 500 && lessonScore(100, 50, 0.5) === 125, "el puntaje castiga la imprecisión al cuadrado");

// ── logros ──
{
  const lesson = (o: Partial<LessonResult> = {}): LessonResult =>
    ({ ts: new Date(2026, 0, 1, 12).getTime(), wpm: 20, acc: 0.9, chars: 100, ms: 30_000, score: 10, kind: "drill", ...o });
  const withLessons = (ls: LessonResult[], lang = "python"): AppState => {
    const s = initialState();
    s.profiles[`${lang}:${s.settings.layout}`] = { ...emptyProfile(), lessons: ls };
    return s;
  };
  const has = (s: AppState, id: string) => newAchievements(s).includes(id);
  ok(newAchievements(initialState()).length === 0, "estado vacío: ningún logro");
  ok(has(withLessons([lesson()]), "hello"), "primera lección: Primer commit");
  ok(has(withLessons(Array.from({ length: 10 }, () => lesson())), "lessons10"), "10 lecciones: Constante");
  ok(has(withLessons([lesson({ wpm: 31 })]), "wpm30"), "31 WPM: Hot reload");
  ok(!has(withLessons([lesson({ wpm: 31, chars: 59 })]), "wpm30"), "una lección de menos de 60 caracteres no cuenta para WPM");
  ok(has(withLessons([lesson({ kind: "code", acc: 1, chars: 60 })]), "clean"), "función sin errores: Código limpio");
  ok(!has(withLessons([lesson({ kind: "drill", acc: 1, chars: 60 })]), "clean"), "un ejercicio no cuenta como función");
  ok(has(withLessons([lesson({ ts: new Date(2026, 0, 1, 3).getTime() })]), "owl"), "lección a las 3 h: Búho nocturno");
  {
    const s = initialState();
    for (const l of ["python", "go", "rust"]) s.profiles[`${l}:${s.settings.layout}`] = { ...emptyProfile(), lessons: [lesson()] };
    ok(has(s, "polyglot") && !has(s, "allterrain"), "3 lenguajes: Políglota (no Todoterreno)");
  }
  {
    const s = initialState();
    const d = new Date();
    for (let i = 0; i < 3; i++) {
      s.days[today(d)] = 60;
      d.setDate(d.getDate() - 1);
    }
    ok(streakDays(s.days) === 3 && has(s, "streak3"), "3 días seguidos: Hábito");
    const y = initialState();
    const d2 = new Date();
    d2.setDate(d2.getDate() - 1);
    y.days[today(d2)] = 60;
    ok(streakDays(y.days) === 1, "si hoy no practicó, la racha cuenta desde ayer");
    const g = initialState();
    g.days[today()] = g.settings.dailyGoalMin * 60;
    ok(has(g, "goal"), "objetivo diario cumplido");
  }
  {
    const s = initialState();
    s.challenges["python:perfect"] = { wpm: 30, acc: 1, ts: 1 };
    s.challenges["python:sprint60"] = { wpm: 39, acc: 1, ts: 1 };
    ok(has(s, "surgeon") && !has(s, "sprinter"), "precisión perfecta: Cirujano; 39 WPM no alcanza Sprinter");
  }
  {
    const s = initialState();
    s.profiles[`sql:${s.settings.layout}`] = {
      ...emptyProfile(),
      steps: { [TRACKS.sql.steps[0].id]: { n: 3, w: [40, 40, 40], a: [1, 1, 1] } },
    };
    ok(has(s, "firststep") && !has(s, "dba"), "un escalón dominado: Primer escalón (no la ruta completa)");
  }
  {
    const s = withLessons([lesson()]);
    s.achievements.hello = 1;
    ok(!has(s, "hello"), "un logro ya registrado no se vuelve a otorgar");
  }
  const half = withLessons(Array.from({ length: 25 }, () => lesson()));
  const prog = ACHIEVEMENTS.find((a) => a.id === "lessons50")!.progress!(half);
  ok(Math.abs(prog - 0.5) < 1e-9, "el progreso de un logro va de 0 a 1");
  ok(new Set(ACHIEVEMENTS.map((a) => a.id)).size === ACHIEVEMENTS.length, "los ids de logros no se repiten");
}

// ── resaltado de código ──
for (const [lang, code] of [
  ["python", 'def f(x):\n    return x + 1  # suma'],
  ["javascript", 'const s = "hola";'],
  ["sql", "SELECT id FROM users;"],
] as const) {
  const toks = highlight(code, lang);
  ok(toks.length === code.length, `${lang}: un token por carácter`);
}
{
  const code = 'def f(x):\n    return "a"  # c';
  const t = highlight(code, "python");
  ok(t[0] === "kw" && t[code.indexOf('"a"')] === "str" && t[code.indexOf("#")] === "com", "python: palabra clave, cadena y comentario");
  ok(highlight("abc", null).length === 3, "sin lenguaje también devuelve un token por carácter");
}

// ── canciones guardadas (IndexedDB simulado) ──
{
  const events: string[] = [];
  let opened = 0;
  let closed = 0;
  let failPut = false;
  // la petición sale bien pero la transacción falla al confirmarse (p. ej. sin espacio al guardar)
  let failCommit = false;
  const data = new Map<string, unknown>();
  const later = (fn: () => void) => setTimeout(fn, 0);
  const fakeDb = {
    objectStoreNames: { contains: () => true },
    createObjectStore: () => ({}),
    close: () => void closed++,
    transaction: () => {
      const tx: any = { error: null, oncomplete: null, onabort: null, onerror: null };
      const req = (op: () => unknown, fails = false) => {
        const r: any = { result: undefined, error: null };
        later(() => {
          if (fails) {
            r.error = tx.error = new Error("QuotaExceededError");
            r.onerror?.();
            events.push("abort");
            tx.onabort?.();
            return;
          }
          const commitFails = failCommit;
          r.result = op();
          events.push("request");
          r.onsuccess?.();
          later(() => {
            if (commitFails) {
              tx.error = new Error("AbortError");
              tx.onabort?.();
              return;
            }
            events.push("complete");
            tx.oncomplete?.();
          });
        });
        return r;
      };
      tx.objectStore = () => ({
        put: (v: { id: string }) => req(() => data.set(v.id, v), failPut),
        getAll: () => req(() => [...data.values()]),
        delete: (id: string) => req(() => data.delete(id)),
      });
      return tx;
    },
  };
  (globalThis as any).indexedDB = {
    open: () => {
      opened++;
      const r: any = { result: fakeDb };
      later(() => r.onsuccess?.());
      return r;
    },
  };
  const { addTracks, loadTracks, removeTrack } = await import("../src/audio/tracks");
  const file = (name: string, type = "audio/mpeg") => new File(["x"], name, { type });

  const r1 = await addTracks([file("uno.mp3"), file("foto.png", "image/png")]);
  ok(r1.tracks.length === 1 && r1.tracks[0].name === "uno", "agrega canciones válidas y quita la extensión");
  ok(r1.rejected.length === 1 && r1.rejected[0].includes("formato"), "rechaza formatos que no son audio");
  failCommit = true;
  const r0 = await addTracks([file("tres.mp3")]);
  failCommit = false;
  data.delete([...data.keys()].find((k) => (data.get(k) as { name: string }).name === "tres") ?? "");
  ok(r0.rejected.length === 1, "si la transacción no se confirma, no se da por guardada");
  failPut = true;
  const r2 = await addTracks([file("dos.mp3")]);
  failPut = false;
  ok(r2.tracks.length === 1 && r2.rejected[0].includes("espacio"), "si la transacción se aborta, avisa y no la cuenta");
  ok((await removeTrack(r1.tracks[0].id)).length === 0, "quitar una canción la borra");
  ok((await loadTracks()).length === 0, "la lista guardada queda vacía");
  ok(opened > 0 && opened === closed, `cada conexión se cierra (${opened} abiertas, ${closed} cerradas)`);
}

// ── teclado real del usuario ──
{
  const keymap = { it: { "{": { code: "Digit7", shift: false, altgr: true }, "`": { code: "Quote", shift: true, altgr: true } } };
  const lay = layoutFor({ layout: "it", keymap });
  ok(lay !== LAYOUTS.it && layoutFor({ layout: "it", keymap }) === lay, "el teclado ajustado se arma una vez y se reutiliza");
  ok(layoutFor({ layout: "it", keymap: {} }) === LAYOUTS.it, "sin nada aprendido se usa la distribución tal cual");
  ok(comboText(lay, "{") === "AltGr + 7", `la combinación enseñada sale del teclado real (${comboText(lay, "{")})`);
  ok(comboMap(LAYOUTS.it).get("{")?.code === "BracketLeft", "la distribución base no se modifica");
  ok(!lay.legends.BracketLeft.includes("{"), "el símbolo deja de figurar en su tecla anterior");
  ok(isTypeable(lay, "`") && !isTypeable(LAYOUTS.it, "`"), "un símbolo sin tecla en la distribución pasa a ser practicable");
  ok(!("`" in lay.missing) && lay.learned === 2, "deja de figurar como faltante y se cuenta como aprendido");
  const bad = layoutFor({ layout: "it", keymap: { it: { "{": { code: "Numpad7", shift: false, altgr: false } } } });
  ok(bad === LAYOUTS.it, "se ignoran teclas físicas que no producen símbolos");

  const ev = (key: string, code: string, o: { shift?: boolean; alt?: boolean; altgr?: boolean } = {}) => ({
    key, code, shiftKey: !!o.shift, altKey: !!o.alt, ctrlKey: false, getModifierState: (m: string) => m === "AltGraph" && !!o.altgr,
  });
  ok(readKey(ev("a", "KeyA")) === null && readKey(ev("1", "Numpad1")) === null, "no aprende letras ni el teclado numérico");
  ok(JSON.stringify(readKey(ev("{", "Digit7", { altgr: true }))) === '{"key":"{","code":"Digit7","shift":false,"altgr":true}', "lee AltGr de Linux");
  ok(readKey(ev("[", "BracketLeft", { alt: true }))?.altgr === true, "Windows (Ctrl+Alt) y macOS (Opción) cuentan como AltGr");

  const learner = new KeyLearner();
  const obs = readKey(ev("{", "Digit7", { altgr: true }))!;
  ok(learner.observe(obs, LAYOUTS.it) === null, "una sola vez no alcanza para cambiar la combinación");
  ok(learner.observe(obs, LAYOUTS.it)?.code === "Digit7", "dos veces seguidas igual: se aprende");
  const okObs = readKey(ev("{", "BracketLeft", { altgr: true, shift: true }))!;
  ok(learner.observe(okObs, LAYOUTS.it) === null && learner.observe(okObs, LAYOUTS.it) === null, "si coincide con lo esperado no hay nada que aprender");
  learner.observe(obs, LAYOUTS.it);
  learner.observe(readKey(ev("{", "Digit8", { altgr: true }))!, LAYOUTS.it);
  ok(learner.observe(obs, LAYOUTS.it) === null, "observaciones distintas reinician la cuenta");
}

console.log(failed ? `\n${failed} test(s) fallaron` : "\nTodos los tests de lógica pasaron");
process.exit(failed ? 1 : 0);
