// Tests de la lógica de la app: progreso, logros, resaltado y canciones guardadas.
// Uso: npm run test:logic
import {
  applySamples, applyStep, canUnlock, emptyProfile, keyInfo, lessonScore, nextStage, pickFocus, stageInfos, stepInfos,
  STEP_WINDOW, MAX_SAMPLE_MS,
} from "../src/engine/stats";
import { ACHIEVEMENTS, newAchievements } from "../src/engine/achievements";
import { highlight } from "../src/highlight";
import { initialState, mergeStates, streakDays, today } from "../src/store";
import { addTotals, totalsOf } from "../src/engine/totals";
import { check } from "../src/recall/check";
import { RECALL, allExercises, levelOpen } from "../src/recall/exercises";
import { SHORTCUT_SETS, allShortcutExercises, applyKey, levelOpen as scOpen, par, solved, stars, startState, stepCombo } from "../src/shortcuts/exercises";
import { createState } from "../src/shortcuts/buffer";
import { vimKey } from "../src/shortcuts/vim";
import { ACTIONS, TAUGHT_ONLY, readCombo, vscodeKey } from "../src/shortcuts/vscode";
import { LANGS, stageCount, unlockedChars } from "../src/data/curriculum";
import { TRACKS } from "../src/tracks/index";
import { KeyLearner, LAYOUTS, comboMap, comboText, isTypeable, layoutFor, readKey } from "../src/data/layouts";
import type { AppState, KeyStat, LessonResult, Profile } from "../src/types";
import { TypingSession } from "../src/engine/session";
import { SOON, TOPICS } from "../src/library/index";
import { ALL_TOPICS, frameworkUnlocked, routeDone, visibleTopics } from "../src/library/unlock";
import { FRAMEWORKS } from "../src/library/frameworks";
import { entryId, normalize, search } from "../src/library/search";
import { PROJECTS, projectUnlocked, requiredNum } from "../src/projects/projects";
import { INTERVALS, addDays, daysBetween, dueCount, findEntry, grade, pickDue, practiceFor, practiceText, reviewLesson, whenText } from "../src/review/review";

import { BANCO } from "../src/interview/bank/index";
import { AREAS, PREGUNTAS_POR_DURACION, PUESTOS } from "../src/interview/catalogo";
import { anotarRepaso, armarEntrevista, corregirCodigo, opcionesMezcladas, repasoPendiente, resultadoDe } from "../src/interview/engine";
import { makeRng } from "../src/gen/base";
import { sanitizeState } from "../src/sanitize";

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

// ── sangrías que se escriben (proyectos) ──
{
  const typeAll = (s: TypingSession, keys: string) => {
    for (const k of keys) s.input(k, 0, "block");
  };
  const auto = new TypingSession("if x:\n    y");
  ok(auto.auto.filter(Boolean).length === 4, "por defecto la sangría se salta sola");
  const s = new TypingSession("if x:\n    y = 1\n        z", { manualIndent: true, tabWidth: 4 });
  ok(s.auto.every((a) => !a), "con manualIndent ninguna posición se salta");
  typeAll(s, "if x:\n");
  ok(s.inIndent() && s.column() === 0, "al empezar la línea el cursor está en la sangría");
  ok(s.tab(0, "block") === "ok" && s.text[s.pos] === "y", "Tab completa una sangría de 4 espacios");
  ok(s.tab(0, "block") === "error" && s.text[s.pos] === "y", "Tab fuera de la sangría es un error y no avanza");
  typeAll(s, "y = 1\n");
  s.tab(0, "block");
  ok(s.column() === 4 && s.inIndent(), "Tab avanza hasta el próximo múltiplo del ancho");
  typeAll(s, "    ");
  ok(s.text[s.pos] === "z" && s.errors.size === 1, "la sangría también se puede escribir con espacios");
  const t = new TypingSession("func f() {\n\treturn\n}", { manualIndent: true });
  typeAll(t, "func f() {\n");
  ok(t.input(" ", 0, "block") === "error", "si la sangría es una tabulación, un espacio es un error");
  ok(t.tab(0, "block") === "ok" && t.text[t.pos] === "r", "Tab escribe una tabulación real (Go, Makefile)");
  const odd = new TypingSession("a\n  b", { manualIndent: true, tabWidth: 4 });
  typeAll(odd, "a\n");
  ok(odd.tab(0, "block") === "ok" && odd.text[odd.pos] === "b", "Tab no se pasa de la sangría si es más corta que el ancho");
  ok(highlight("\tx", "go")[0] === "sp", "la tabulación se resalta como espacio");
}

// ── biblioteca ──
{
  for (const t of ALL_TOPICS) {
    const levels = new Set(t.entries.map((e) => e.level));
    ok(levels.size === 3 && t.entries.length >= 12, `${t.name}: tiene entradas de los tres niveles (${t.entries.length})`);
    const ids = t.entries.map((e) => entryId(t, e));
    const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
    ok(dup.length === 0, `${t.name}: cada entrada tiene un id único${dup.length ? " — repetidos: " + dup.join(", ") : ""}`);
    ok(t.workflow.length >= 4 && t.facts.length >= 4 && t.summary.length > 80, `${t.name}: tiene resumen, datos y métodos de trabajo`);
    const empty = t.entries.filter((e) => !e.code.trim() || !e.desc.trim() || /\s$/.test(e.code));
    ok(empty.length === 0, `${t.name}: ninguna entrada sin ejemplo ni descripción`);
  }
  ok(new Set(ALL_TOPICS.map((t) => t.id)).size === ALL_TOPICS.length, "los temas no se repiten (frameworks incluidos)");
  ok(normalize("Función ÁRBOL") === "funcion arbol", "la búsqueda ignora acentos y mayúsculas");
  const rebase = search(TOPICS, "rebase");
  ok(rebase[0]?.entry.name === "git rebase", "buscar por nombre trae primero la coincidencia exacta");
  ok(search(TOPICS, "funcion").some((h) => h.topic.id === "python"), "buscar sin acento encuentra entradas con acento");
  const py = search(TOPICS, "python listas");
  ok(py.length > 0 && py.every((h) => h.topic.id === "python"), "nombrar el tema filtra por ese tema");
  ok(search(TOPICS, "zzzz-nada").length === 0 && search(TOPICS, "   ").length === 0, "sin coincidencias o vacío no devuelve nada");
  const names = SOON.map((s) => s.name).join(" ");
  ok(SOON.length === 9 && ["IA", "Claude", "ChatGPT", "Gemini", "Codex", "Cursor", "OpenCode", "Antigravity", "Hermes"].every((n) => names.includes(n)), "Próximamente lista IA, Claude, ChatGPT, Gemini, Codex, Cursor, OpenCode, Antigravity y Hermes");
}

// ── repaso espaciado ──
{
  const day = "2026-11-02";
  ok(addDays(day, 1) === "2026-11-03" && addDays("2026-12-31", 1) === "2027-01-01" && addDays("2026-03-28", 2) === "2026-03-30", "suma días entre meses, años y cambios de horario");
  ok(daysBetween(day, "2026-11-09") === 7 && daysBetween(day, "2026-11-01") === -1, "cuenta días entre fechas");
  const first = grade(undefined, 1, day);
  ok(first.counted && first.item.box === 0 && first.item.due === "2026-11-03", "una entrada nueva vuelve mañana");
  const failNew = grade(undefined, 0.5, day);
  ok(failNew.item.box === 0 && failNew.item.lapses === 0, "fallar la primera vez no cuenta como olvido");
  // subir de caja en cada repaso a tiempo: 1, 3, 7, 15 y 30 días
  let it = first.item;
  let d = it.due;
  const gaps: number[] = [];
  for (let i = 0; i < 5; i++) {
    it = grade(it, 0.99, d).item;
    gaps.push(daysBetween(d, it.due));
    d = it.due;
  }
  ok(JSON.stringify(gaps) === JSON.stringify([3, 7, 15, 30, 30]) && it.box === 4, "bien hecho sube de caja y tarda más en volver, hasta 30 días");
  const lapse = grade(it, 0.8, d);
  ok(lapse.item.box === 0 && lapse.item.due === addDays(d, INTERVALS[0]) && lapse.item.lapses === 1, "un mal repaso vuelve a la primera caja y reaparece mañana");
  const early = grade(first.item, 1, day);
  ok(!early.counted && early.item.box === 0 && early.item.due === first.item.due && early.item.n === 2, "practicar de nuevo el mismo día no adelanta la caja");
  ok(whenText(first.item, day) === "vuelve mañana" && whenText({ ...first.item, due: day }, day) === "toca hoy" && whenText({ ...first.item, due: "2026-11-09" }, day) === "vuelve en 7 días", "texto de cuándo vuelve");

  ok(practiceText("print('año')  \n\treturn …") === "print('ano')\n    return ...", "el texto de práctica saca tildes, cambia tabulaciones y símbolos raros");
  ok(practiceText("x = 1      # uno\n    y  =  2") === "x = 1 # uno\n    y = 2", "junta los espacios para alinear comentarios pero respeta la sangría");
  // cada ejemplo, en cada teclado con «Saltar símbolos sin tecla»: solo quedan símbolos con tecla
  const notTypeable: string[] = [];
  const empty: string[] = [];
  let droppedSome = 0;
  for (const layout of Object.values(LAYOUTS)) {
    for (const t of ALL_TOPICS) for (const e of t.entries) {
      const pr = practiceFor(e.code, layout);
      if ([...pr.text].some((c) => !isTypeable(layout, c))) notTypeable.push(`${layout.name} · ${t.id}: ${e.name}`);
      if (!pr.text) empty.push(`${layout.name} · ${t.id}: ${e.name}`);
      if (pr.dropped) droppedSome++;
    }
  }
  ok(notTypeable.length === 0, `con «Saltar símbolos» los ejemplos solo piden teclas que existen${notTypeable.length ? " — " + notTypeable.slice(0, 3).join(", ") : ""}`);
  ok(empty.length === 0, `ningún ejemplo queda vacío en ningún teclado${empty.length ? " — " + empty.slice(0, 3).join(", ") : ""}`);
  ok(droppedSome > 0, "en el teclado italiano se saltan líneas con ` o ~");
  const itKb = LAYOUTS.it;
  const pr = practiceFor("cd ~\nls -la\n\necho `date`\npwd", itKb);
  ok(pr.text === "ls -la\n\npwd" && pr.dropped === 2 && pr.missing.join("") === "~`", "salta las líneas con símbolos sin tecla y avisa cuáles");
  ok(practiceFor("cd ~", null).text === "cd ~", "sin la opción, el ejemplo queda completo");
  const tl = TOPICS.find((t) => t.id === "javascript")!.entries.find((e) => e.code.includes("`"))!;
  const tlId = entryId(TOPICS.find((t) => t.id === "javascript")!, tl);
  ok(!reviewLesson(tlId, itKb)?.text.includes("`") && reviewLesson(tlId, null)!.text.includes("`"), "el repaso intercalado también respeta el teclado");
  ok(ALL_TOPICS.every((t) => t.entries.every((e) => !/[^\x20-\x7e\n]/.test(practiceText(e.code)))), "el texto de práctica no tiene tildes ni símbolos fuera de ASCII");

  const py = TOPICS.find((t) => t.id === "python")!;
  const git = TOPICS.find((t) => t.id === "git")!;
  const pyId = entryId(py, py.entries[0]);
  const gitId = entryId(git, git.entries[0]);
  ok(findEntry(pyId)?.entry === py.entries[0] && findEntry("lib-no-existe") === null, "encuentra una entrada por id");
  const rv = {
    [gitId]: { box: 0, due: "2026-10-30", n: 1, lapses: 0, ts: 0 },
    [pyId]: { box: 1, due: "2026-11-01", n: 1, lapses: 0, ts: 0 },
    "lib-no-existe": { box: 0, due: "2026-01-01", n: 1, lapses: 0, ts: 0 },
    [entryId(py, py.entries[1])]: { box: 0, due: "2026-11-20", n: 1, lapses: 0, ts: 0 },
  };
  ok(pickDue(rv, "python", day) === pyId, "repasa primero lo del lenguaje que estás practicando");
  ok(pickDue(rv, "go", day) === gitId, "si no hay del lenguaje, lo más atrasado");
  ok(pickDue(rv, "go", day, [gitId, pyId]) === null && pickDue({}, "go", day) === null, "nada que repasar devuelve null");
  ok(dueCount(rv, day) === 2, "cuenta solo lo que toca hoy y sigue existiendo");
  const rl = reviewLesson(gitId);
  ok(rl?.label === "REPASO" && rl.review === gitId && rl.hl === git.hl && rl.text === practiceText(git.entries[0].code), "arma la lección de repaso con el ejemplo y su resaltado");
  ok(reviewLesson("lib-no-existe") === null, "una entrada que ya no existe no arma lección");
}

// ── ejercicios de memoria: corrección ──
{
  const st = (input: string, answers: string[], kind: "shell" | "sql" | "code") => check(input, answers, kind).status;
  const notes = (input: string, answers: string[], kind: "shell" | "sql" | "code") => {
    const v = check(input, answers, kind);
    return v.status === "minor" ? v.notes.join(" | ") : "";
  };
  const reason = (input: string, answers: string[], kind: "shell" | "sql" | "code") => {
    const v = check(input, answers, kind);
    return v.status === "wrong" ? v.reason : "";
  };
  ok(st("git status", ["git status"], "shell") === "ok" && st("  git status  ", ["git status"], "shell") === "ok", "respuesta exacta (con espacios alrededor) es correcta");
  ok(st("git checkout -b login", ["git switch -c login", "git checkout -b login"], "shell") === "ok", "valen varias respuestas");
  ok(/espacios/.test(notes("git  commit   -m \"x\"", ['git commit -m "x"'], "shell")), "espacios de más: leve");
  ok(/comillas/.test(notes("git commit -m 'x'", ['git commit -m "x"'], "shell")), "comillas simples en vez de dobles: leve");
  ok(/comillas/.test(notes("grep -i 'error' app.log", ["grep -i error app.log"], "shell")), "comillas que no hacen falta: leve");
  ok(/orden/.test(notes("tail app.log -n 20", ["tail -n 20 app.log"], "shell")), "otro orden de opciones (con su valor): leve");
  ok(/orden/.test(notes("find . -name \"*.log\" -type f", ['find . -type f -name "*.log"'], "shell")), "opciones con valor entre comillas, en otro orden: leve");
  ok(st("git commit -m \"otro\"", ['git commit -m "x"'], "shell") === "wrong", "otro mensaje: grave");
  ok(/otra cosa/.test(reason("git merge login", ["git switch -c login"], "shell")), "otro comando: grave y lo dice");
  ok(/--hard/.test(reason("git reset --hard HEAD~1", ["git reset --soft HEAD~1"], "shell")), "otra opción: grave y la nombra");
  ok(/Falta una opción/.test(reason("mkdir proyectos/web", ["mkdir -p proyectos/web"], "shell")), "falta una opción: grave");
  ok(/argumento/.test(reason("cp -r respaldo fotos", ["cp -r fotos respaldo"], "shell")), "argumentos al revés: grave");
  ok(st("ps aux | grep node", ["ps aux | grep node"], "shell") === "ok" && st("grep node | ps aux", ["ps aux | grep node"], "shell") === "wrong", "las tuberías respetan el orden de los tramos");
  ok(st('find . -name *.log', ['find . -name "*.log"'], "shell") === "wrong", "un patrón sin comillas no es lo mismo");
  ok(st("tail -n 2 app.log", ["tail -n 20 app.log"], "shell") === "wrong", "otro número: grave");

  const q = "SELECT nombre, email FROM usuarios;";
  ok(/MAYÚSCULAS/.test(notes("select nombre, email from usuarios;", [q], "sql")), "SQL en minúsculas: leve");
  ok(/;/.test(notes("SELECT nombre, email FROM usuarios", [q], "sql")), "SQL sin ; final: leve");
  ok(st("SELECT nombre,email FROM usuarios ;", [q], "sql") === "minor", "SQL con otros espacios: leve");
  ok(st("SELECT email, nombre FROM usuarios;", [q], "sql") === "wrong", "SQL con otras columnas en otro orden: grave");
  ok(/comillas simples/.test(reason('INSERT INTO t (a) VALUES ("Ana");', ["INSERT INTO t (a) VALUES ('Ana');"], "sql")), "SQL con comillas dobles en un texto: grave y lo explica");
  ok(st("SELECT * FROM usuarios WHERE nombre = 'ana';", ["SELECT * FROM usuarios WHERE nombre = 'Ana';"], "sql") === "wrong", "SQL: las mayúsculas dentro de un texto sí importan");
  ok(/DELETE/.test(reason("DELETE FROM pedidos;", ["SELECT * FROM pedidos;"], "sql")), "SQL con otra sentencia: grave");

  ok(/comillas/.test(notes("print('Hola mundo')", ['print("Hola mundo")'], "code")), "Python con comillas simples: leve");
  ok(st("n=len( numeros )", ["n = len(numeros)"], "code") === "minor", "código con otros espacios: leve");
  ok(st('print("Hola  mundo")', ['print("Hola mundo")'], "code") === "wrong", "los espacios dentro de un texto sí importan");
  ok(st('saludo = f"Hola,{nombre}"', ['saludo = f"Hola, {nombre}"'], "code") === "wrong", "un espacio menos dentro de una f-string es otro texto");
  ok(st("const total = 0", ["const total = 0;"], "code") === "minor", "JavaScript sin ; final: leve");
  ok(st("consttotal = 0;", ["const total = 0;"], "code") === "wrong", "palabras pegadas no son un detalle de espacios");
  ok(st("let total = 0;", ["const total = 0;"], "code") === "wrong", "let en vez de const: grave");
  ok(st("", ["pwd"], "shell") === "wrong" && reason("", ["pwd"], "shell") === "Escribí una respuesta.", "vacío no pasa");
}

// ── ejercicios de memoria: contenido ──
{
  const all = allExercises();
  ok(new Set(all.map((e) => e.id)).size === all.length, `ids únicos (${all.length} ejercicios)`);
  ok(RECALL.every((t) => t.levels.length === 3 && t.levels.every((l) => l.exercises.length >= 4)), "cada tema tiene 3 niveles con al menos 4 ejercicios");
  ok(RECALL.every((t) => TOPICS.some((x) => x.id === t.id)), "cada tema existe en la Biblioteca");
  const self = RECALL.flatMap((t) => t.levels.flatMap((l) => l.exercises.flatMap((e) => e.answers.filter((a) => check(a, e.answers, t.kind).status !== "ok").map((a) => `${e.id}: ${a}`))));
  ok(self.length === 0, `cada respuesta válida se corrige como correcta${self.length ? " — " + self.join(", ") : ""}`);
  ok(all.every((e) => e.prompt && e.hint && e.why && e.answers.length > 0 && !e.answers.some((a) => e.hint.includes(a))), "cada ejercicio tiene consigna, pista y explicación, y la pista no da la respuesta");
  // con cada teclado tiene que haber al menos una respuesta que se pueda escribir
  const noKey: string[] = [];
  for (const layout of Object.values(LAYOUTS))
    for (const e of all) if (!e.answers.some((a) => [...a].every((c) => isTypeable(layout, c)))) noKey.push(`${layout.name} · ${e.id}`);
  ok(noKey.length === 0, `todos se pueden responder con cualquier teclado${noKey.length ? " — " + noKey.join(", ") : ""}`);
  const git = RECALL[0];
  const first = Object.fromEntries(git.levels[0].exercises.map((e) => [e.id, 1]));
  ok(levelOpen({}, git, 0) && !levelOpen({}, git, 1) && levelOpen(first, git, 1) && !levelOpen(first, git, 2), "cada nivel se abre al completar el anterior");
  const almost = { ...first };
  delete almost[git.levels[0].exercises[3].id];
  ok(!levelOpen(almost, git, 1), "con un ejercicio sin resolver, el siguiente nivel sigue cerrado");
}

// ── atajos: motor de Vim ──
{
  const esc = (k: string) => k.replace(/<Esc>/g, "\u001b");
  const vrun = (lines: string[], keys: string, line = 0, col = 0) => {
    let st = createState(lines, line, col);
    for (const ch of esc(keys)) st = vimKey(st, ch === "\u001b" ? "Escape" : ch);
    return st;
  };
  ok(vrun(["uno dos tres"], "www").col === 11, "w en la última palabra se queda en el último carácter");
  ok(vrun(["uno dos tres"], "w").col === 4 && vrun(["uno dos tres"], "2w").col === 8 && vrun(["uno dos tres"], "$").col === 11, "w, 2w y $ mueven por palabras y al final");
  ok(vrun(["a(b, c)"], "w").col === 1 && vrun(["foo.bar"], "e").col === 2, "los signos son palabras aparte");
  ok(vrun(["uno dos tres"], "wdw").lines[0] === "uno tres", "dw borra la palabra y el espacio");
  ok(vrun(["uno dos tres"], "wwdw").lines[0] === "uno dos ", "dw en la última palabra no se lleva la línea siguiente");
  ok(vrun(["uno dos tres"], "wcwX<Esc>").lines[0] === "uno X tres", "cw cambia solo la palabra (como ce)");
  ok(vrun(["a", "b", "c", "d"], "j2dd").lines.join() === "a,d", "2dd borra dos líneas");
  ok(vrun(["a", "b"], "ddp").lines.join() === "b,a", "dd y p mueven una línea");
  ok(vrun(["x = 1"], "A;<Esc>u").lines[0] === "x = 1", "u deshace toda la inserción de una vez");
  ok(vrun(["f(a, b)"], "fadi(").lines[0] === "f()", "di( borra dentro de los paréntesis");
  ok(vrun(['s = "hola"'], 'ci"chau<Esc>').lines[0] === 's = "chau"', 'ci" funciona desde antes de las comillas');
  ok(vrun(["abc"], "rX").lines[0] === "Xbc" && vrun(["abc"], "3x").lines[0] === "", "r reemplaza y 3x borra tres");
  ok(vrun(["var a", "var b"], "cwlet<Esc>j0.").lines.join() === "let a,let b", ". repite el último cambio con su texto");
  ok(vrun(["a", "  b"], "J").lines[0] === "a b", "J une las líneas con un espacio");
  ok(vrun(["abc"], "i<Esc>").col === 0 && vrun(["abc"], "A<Esc>").col === 2, "Esc vuelve un lugar, como en Vim");
  ok(vrun(["abc"], "dz").lines[0] === "abc" && vrun(["abc"], "dz").pending === "", "un comando que no existe se descarta sin romper nada");
}

// ── atajos: motor de VS Code ──
{
  const O = { tab: 2, comment: "// " };
  const vs = (lines: string[], keys: string[], line = 0, col = 0, pf: "pc" | "mac" = "pc") => {
    let st = createState(lines, line, col);
    for (const k of keys) st = vscodeKey(st, k, pf, O);
    return st;
  };
  ok(vs(["a", "b", "c"], ["Ctrl+Shift+K"], 1).lines.join() === "a,c", "Ctrl+Shift+K borra la línea");
  ok(vs(["a", "b"], ["Alt+ArrowDown"]).lines.join() === "b,a" && vs(["a", "b"], ["Alt+ArrowUp"], 1).line === 0, "Alt+flecha mueve la línea y el cursor la sigue");
  ok(vs(["a"], ["Alt+Shift+ArrowDown"]).lines.length === 2 && vs(["a"], ["Ctrl+Alt+Shift+ArrowDown"]).lines.length === 2, "duplicar línea: Shift+Alt+↓ y la variante de Linux");
  ok(vs(["  x();"], ["Ctrl+/"]).lines[0] === "  // x();" && vs(["  // x();"], ["Ctrl+/"]).lines[0] === "  x();", "Ctrl+/ comenta y descomenta respetando la sangría");
  ok(vs(["if (a) {"], ["End", "Enter", "b"]).lines.join("|") === "if (a) {|  b", "Enter después de { agrega sangría");
  ok(vs(["foo bar"], ["Ctrl+ArrowRight"]).col === 3 && vs(["foo bar"], ["Ctrl+ArrowLeft"], 0, 7).col === 4, "Ctrl+flecha salta por palabras");
  ok(vs(["foo bar"], ["Ctrl+Backspace"], 0, 7).lines[0] === "foo " && vs(["foo bar"], ["Ctrl+Backspace"], 0, 4).lines[0] === "bar", "Ctrl+Retroceso borra la palabra anterior");
  ok(vs(["  hola"], ["Home"], 0, 5).col === 2 && vs(["  hola"], ["Home", "Home"], 0, 5).col === 0, "Home va al primer carácter y después a la columna 0");
  ok(vs(["hola mundo"], ["Shift+End", "x"], 0, 5).lines[0] === "hola x", "escribir reemplaza la selección");
  ok(vs(["a", "b", "c"], ["Ctrl+X", "ArrowDown", "Ctrl+V"]).lines.join() === "b,a,c", "Ctrl+X sin selección corta la línea y Ctrl+V la pega arriba");
  ok(vs(["x"], ["a", "b", "c", "Ctrl+Z"]).lines[0] === "x", "las letras seguidas se deshacen juntas");
  ok(vs(["a", "b"], ["Shift+ArrowDown", "Ctrl+]"]).lines.join() === "  a,b", "una selección que termina en la columna 0 no toma esa línea");
  ok(vs(["a"], ["Cmd+Shift+K"], 0, 0, "mac").lines.join() === "" && vs(["a"], ["Ctrl+Shift+K"], 0, 0, "mac").lines.join() === "a", "en Mac el atajo es con Cmd");
  ok(vs(["abc"], ["Ctrl+W"]).lines[0] === "abc", "un atajo que no es del editor no hace nada");
  const ev = (key: string, mods: Partial<Record<"ctrlKey" | "metaKey" | "altKey" | "shiftKey", boolean>> = {}, altGr = false) =>
    readCombo({ key, ctrlKey: false, metaKey: false, altKey: false, shiftKey: false, ...mods, getModifierState: (k) => k === "AltGraph" && altGr });
  ok(ev("k", { ctrlKey: true }) === "Ctrl+K" && ev("K", { ctrlKey: true, shiftKey: true }) === "Ctrl+Shift+K", "lee Ctrl+letra y Ctrl+Shift+letra");
  ok(ev("/", { ctrlKey: true, shiftKey: true }) === "Ctrl+/", "Ctrl+/ en teclados donde / lleva Shift (italiano)");
  ok(ev("a") === "a" && ev("A", { shiftKey: true }) === "A" && ev("Shift") === null && ev("Tab") === null, "las letras se escriben; Shift solo y Tab se ignoran");
  ok(ev("[", { altKey: true }, true) === "[" && ev("[", { ctrlKey: true, altKey: true }, true) === "[", "AltGr escribe el símbolo, no es un atajo");
  ok(ev("ArrowUp", { altKey: true }) === "Alt+ArrowUp" && ev("ArrowLeft", { metaKey: true, shiftKey: true }) === "Cmd+Shift+ArrowLeft", "lee flechas con modificadores");
  ok(TAUGHT_ONLY.every((t) => !Object.values(ACTIONS).some((a) => a.pc.includes(t.pc))), "los atajos solo enseñados no se cuentan como practicables");
}

// ── atajos: ejercicios ──
{
  const all = allShortcutExercises();
  ok(new Set(all.map((e) => e.id)).size === all.length && all.length === 24, `ids únicos (${all.length} ejercicios)`);
  const broken: string[] = [];
  for (const st of SHORTCUT_SETS) for (const l of st.levels) for (const e of l.exercises) for (const pf of st.id === "vim" ? (["pc"] as const) : (["pc", "mac"] as const)) {
    let ed = startState(e);
    if (solved(e, ed)) broken.push(`${e.id}: ya empieza resuelto`);
    for (const k of e.solution) ed = applyKey(st.id, ed, st.id === "vim" ? k : stepCombo(k, pf), pf);
    if (!solved(e, ed)) broken.push(`${e.id} (${pf}): ${JSON.stringify(ed.lines)}`);
  }
  ok(broken.length === 0, `cada solución de referencia llega al objetivo con Linux/Windows y Mac${broken.length ? " — " + broken.join("; ") : ""}`);
  ok(all.every((e) => e.solution.every((k) => !k.startsWith("@") || k.slice(1) in ACTIONS)), "las soluciones solo usan atajos conocidos");
  ok(SHORTCUT_SETS[0].levels.flatMap((l) => l.exercises).every((e) => (e.use ?? []).length > 0), "cada ejercicio de Vim muestra qué atajos usar");
  ok(stars(3, 3) === 3 && stars(2, 3) === 3 && stars(6, 3) === 2 && stars(7, 3) === 1 && par(all[0]) === all[0].solution.length, "estrellas: el par da 3, hasta 1,5 veces + 1 da 2");
  const vimSet = SHORTCUT_SETS[0];
  const lvl1 = Object.fromEntries(vimSet.levels[0].exercises.map((e) => [e.id, { stars: 1, keys: 9, ms: 1000 }]));
  ok(scOpen({}, vimSet, 0) && !scOpen({}, vimSet, 1) && scOpen(lvl1, vimSet, 1) && !scOpen(lvl1, vimSet, 2), "cada nivel de atajos se abre al completar el anterior");
}

// ── totales históricos ──
{
  const l = (wpm: number): LessonResult => ({ ts: 0, wpm, acc: 1, chars: 100, ms: 20000, score: 1, kind: "code" });
  const ls = Array.from({ length: 600 }, (_, i) => l(i === 3 ? 99 : 40));
  const t = ls.reduce(addTotals, totalsOf([]));
  ok(t.n === 600 && t.chars === 60000 && t.ms === 600 * 20000 && t.best === 99, "los totales cuentan todas las lecciones, también las que salen del historial");
  ok(totalsOf(ls.slice(-500)).best === 40, "con solo el historial se perdería el récord viejo");
}

// ── dos ventanas a la vez ──
{
  const base = initialState();
  const a = { ...base, settings: { ...base.settings, userName: "Ventana A" } };
  const b = { ...base, settings: { ...base.settings, targetWpm: 45 } };
  const m = mergeStates(base, b, a);
  ok(m.settings.userName === "Ventana A" && m.settings.targetWpm === 45, "se combinan cambios de dos ventanas en ajustes distintos");
  const a2 = { ...base, projects: { p01: { ms: 60000, wpm: 30, acc: 1, ts: 1 } } };
  const b2 = { ...base, review: { "lib-x": { box: 0, due: "2026-11-03", n: 1, lapses: 0, ts: 1 } }, lang: "go" as const };
  const m2 = mergeStates(base, b2, a2);
  ok(!!m2.projects.p01 && !!m2.review["lib-x"] && m2.lang === "go", "no se pierden récords ni repasos de la otra ventana");
  const base3 = { ...base, achievements: { a: 1, b: 2 } };
  const m3 = mergeStates(base3, { ...base3, achievements: { a: 1 } }, { ...base3, achievements: { a: 1, b: 2, c: 3 } });
  ok(!("b" in m3.achievements) && m3.achievements.c === 3, "lo que borró esta ventana se borra y lo nuevo de la otra se suma");
  const same = { ...base, settings: { ...base.settings, targetWpm: 50 } };
  ok(mergeStates(base, same, { ...base, settings: { ...base.settings, targetWpm: 35 } }).settings.targetWpm === 50, "si las dos cambiaron lo mismo, gana esta ventana");
}

// ── frameworks ocultos ──
{
  const base = initialState();
  const lastPy = LANGS.python.stages.length - 1;
  const keys = Object.fromEntries(LANGS.python.stages.flat().map((ch) => [ch, { n: 200, ema: 50, hits: 200, misses: 0, recent: "1".repeat(50) }]));
  const pyDone = { ...base.profiles["python:it"], stage: lastPy, steps: {}, keys, lessons: [], totals: totalsOf([]), score: 0 };
  const rec = { ms: 60000, wpm: 30, acc: 1, ts: 1 };
  const route = { ...base, profiles: { "python:it": pyDone } };
  const project = { ...base, projects: { p01: rec } };
  const both = { ...route, projects: { p01: rec } };
  const fw = (id: string) => FRAMEWORKS.find((f) => f.id === id)!;
  ok(routeDone(route, "python") && !routeDone(base, "python"), "la ruta de Python cuenta como terminada solo con todo dominado");
  ok(!frameworkUnlocked(base, fw("fastapi")), "sin nada hecho, FastAPI está oculto");
  ok(!frameworkUnlocked(route, fw("fastapi")) && !frameworkUnlocked(project, fw("fastapi")), "la ruta sola o un proyecto solo no alcanzan");
  ok(frameworkUnlocked(both, fw("fastapi")) && frameworkUnlocked(both, fw("django")), "ruta de Python + un proyecto en Python abren FastAPI y Django");
  ok(!frameworkUnlocked(both, fw("react")) && !frameworkUnlocked(both, fw("spring")), "los frameworks de otros lenguajes siguen ocultos");
  ok(!visibleTopics(base).some((t) => t.group === "Frameworks"), "al principio la Biblioteca no muestra ningún framework");
  ok(!search(visibleTopics(base), "fastapi").some((h) => h.topic.group === "Frameworks"), "la búsqueda tampoco encuentra frameworks ocultos");
  ok(visibleTopics(both).filter((t) => t.group === "Frameworks").map((t) => t.id).join() === "fastapi,django", "una vez ganados, aparecen en la Biblioteca");
  // SwiftUI, Compose y Laravel: la ruta de su lenguaje y SU proyecto (no cualquiera)
  const rutaDe = (lang: "swift" | "kotlin" | "php") => {
    const last = LANGS[lang].stages.length - 1;
    const ks = Object.fromEntries(LANGS[lang].stages.flat().map((ch) => [ch, { n: 200, ema: 50, hits: 200, misses: 0, recent: "1".repeat(50) }]));
    return { ...base.profiles["python:it"], stage: last, steps: {}, keys: ks, lessons: [], totals: totalsOf([]), score: 0 };
  };
  const moviles = [["swiftui", "swift", "p15"], ["compose", "kotlin", "p16"], ["laravel", "php", "p17"]] as const;
  for (const [id, lang, proj] of moviles) {
    const ruta = { ...base, profiles: { [`${lang}:it`]: rutaDe(lang) } };
    ok(!frameworkUnlocked(ruta, fw(id)) && !frameworkUnlocked({ ...base, projects: { [proj]: rec } }, fw(id)), `${id}: la ruta sola o el proyecto solo no alcanzan`);
    ok(frameworkUnlocked({ ...ruta, projects: { [proj]: rec } }, fw(id)), `${id}: la ruta de ${lang} más su proyecto lo abren`);
    const otro = moviles.find(([, , pr]) => pr !== proj)![2];
    ok(!frameworkUnlocked({ ...ruta, projects: { [otro]: rec } }, fw(id)), `${id}: el proyecto de otro lenguaje no lo abre`);
  }
  const unreachable = FRAMEWORKS.filter((f) => !PROJECTS.some((p) => p.files.some((x) => (f.langs as string[]).includes(x.lang))));
  ok(unreachable.length === 0, `cada framework tiene algún proyecto en su lenguaje, si no nadie lo podría abrir${unreachable.length ? " — " + unreachable.map((f) => f.name).join(", ") : ""}`);
}

// ── desbloqueo de proyectos ──
{
  const at = (id: string) => PROJECTS.findIndex((p) => p.id === id);
  const rec = { ms: 60000, wpm: 30, acc: 1, ts: 1 };
  ok(projectUnlocked({}, 0) && !projectUnlocked({}, 1), "sin nada hecho, solo el primero está abierto");
  ok(projectUnlocked({ p09: rec }, at("p11")) && !projectUnlocked({ p09: rec }, at("p10")), "terminar el 9 abre el gestor de notas, no el tablero");
  ok(projectUnlocked({ p14: rec }, at("p10")), "el tablero se abre al terminar el acortador");
  ok(projectUnlocked({ p10: rec }, at("p10")), "si ya terminaste el tablero cuando era el 10, sigue abierto");
  ok(!projectUnlocked({}, at("p15")) && projectUnlocked({ p06: rec }, at("p15")), "el conversor de Swift se abre al terminar el contador de palabras");
  ok(projectUnlocked({ p15: rec }, at("p16")) && projectUnlocked({ p16: rec }, at("p17")) && !projectUnlocked({ p15: rec }, at("p17")), "Swift, Kotlin y PHP se abren en ese orden");
  ok(projectUnlocked({ p06: rec }, at("p07")) && requiredNum(at("p07")) === 6, "el de SQLite sigue abriéndose con el 6, aunque ahora haya tres proyectos en el medio");
  ok(requiredNum(at("p16")) === 7 && requiredNum(at("p11")) === 12, "cada proyecto sabe cuál hay que terminar antes");
  ok(PROJECTS.every((p, i) => p.num === i + 1) && PROJECTS.at(-1)?.id === "p10", "el tablero es el 17 y conserva su id");
}

// ── entrevistas ──
{
  const q = (id: string) => BANCO.find((x) => x.id === id)!;
  ok(BANCO.length >= 280 && AREAS.every((a) => BANCO.some((x) => x.area === a.id)), "el banco tiene al menos 280 preguntas y todas las áreas tienen alguna");

  // armado de la entrevista
  for (const minutos of [15, 30, 45] as const) {
    const plan = armarEntrevista({ puesto: "backend", lang: "python", nivel: "semi", minutos }, BANCO, makeRng(7));
    ok(plan.length === PREGUNTAS_POR_DURACION[minutos], `${minutos} minutos: ${PREGUNTAS_POR_DURACION[minutos]} preguntas`);
    ok(new Set(plan.map((x) => x.id)).size === plan.length, `${minutos} minutos: sin preguntas repetidas`);
    ok(plan[0].area === "conductual" && plan.at(-1)!.area === "conductual", `${minutos} minutos: abre y cierra con una pregunta de conducta`);
    ok(plan.some((x) => x.area === "python") && plan.some((x) => x.formato === "codigo"), `${minutos} minutos: hay preguntas del lenguaje, con una de código`);
  }
  const permitidas = (puesto: string, lang: string) => new Set(["conductual", lang, ...PUESTOS.find((p) => p.id === puesto)!.areas]);
  ok(
    PUESTOS.every((p) => armarEntrevista({ puesto: p.id, lang: "go", nivel: "junior", minutos: 30 }, BANCO, makeRng(3)).every((x) => permitidas(p.id, "go").has(x.area))),
    "cada puesto solo trae las áreas que le tocan",
  );
  const mismo = (s: number) => armarEntrevista({ puesto: "fullstack", lang: "javascript", nivel: "senior", minutos: 30 }, BANCO, makeRng(s)).map((x) => x.id).join();
  ok(mismo(5) === mismo(5) && mismo(5) !== mismo(6), "con la misma semilla sale la misma entrevista, y con otra, distinta");
  // el nivel pedido pesa: senior trae más preguntas senior que junior
  const cuenta = (nivel: "junior" | "senior") => {
    let n = 0;
    for (let s = 0; s < 30; s++) n += armarEntrevista({ puesto: "backend", lang: "python", nivel, minutos: 30 }, BANCO, makeRng(s)).filter((x) => x.nivel === "senior").length;
    return n;
  };
  ok(cuenta("senior") > cuenta("junior") * 1.5, "pedir nivel senior trae bastantes más preguntas senior que pedir junior");

  // opciones mezcladas
  const py = q("python-01");
  const m = opcionesMezcladas(py, makeRng(11));
  ok(m.opciones[m.correcta] === py.opciones![0] && [...m.opciones].sort().join() === [...py.opciones!].sort().join(), "al mezclar las opciones se sigue sabiendo cuál es la correcta");
  ok([1, 2, 3, 4, 5, 6, 7, 8].some((s) => opcionesMezcladas(py, makeRng(s)).correcta !== 0), "la correcta no queda siempre en el mismo lugar");

  // corrección de código
  const sq = q("python-07");
  ok(corregirCodigo(sq, "[n * n for n in nums]").ok && corregirCodigo(sq, "[n ** 2 for n in nums]").ok, "código: valen las respuestas aceptadas");
  ok(!corregirCodigo(sq, "[n + n for n in nums]").ok && !corregirCodigo(sq, "nums").ok, "código: una respuesta distinta no vale");
  ok(corregirCodigo(q("git-03"), "git   switch -c login").ok, "código: los espacios de más se aceptan");

  // resultado
  const res = resultadoDe([{ id: "python-01", ok: true, ms: 1 }, { id: "python-02", ok: true, ms: 1 }, { id: "git-01", ok: false, ms: 1 }, { id: "sql-01", ok: false, ms: 1 }], BANCO);
  ok(res.ok === 2 && res.total === 4 && res.pct === 50 && res.nota === 5 && res.veredicto === "casi", "el resultado cuenta aciertos, nota y veredicto");
  ok(res.porArea[0].ok === 0 && res.porArea.at(-1)!.area === "python", "el informe ordena las áreas de peor a mejor");
  ok(resultadoDe(Array(10).fill(0).map((_, i) => ({ id: "python-01", ok: i < 7, ms: 1 })), BANCO).veredicto === "aprobado", "70 % o más es aprobado");
  ok(resultadoDe([{ id: "python-01", ok: false, ms: 1 }], BANCO).veredicto === "reforzar", "menos de 50 % es reforzar");

  // repaso de falladas
  const hoy = "2026-11-05";
  let rev = anotarRepaso({}, "python-01", true, hoy);
  ok(Object.keys(rev).length === 0, "una pregunta acertada que no estaba en el repaso no entra");
  rev = anotarRepaso(rev, "python-01", false, hoy);
  ok(rev["python-01"]?.box === 0 && rev["python-01"].due === "2026-11-06", "una pregunta fallada entra al repaso y vuelve mañana");
  ok(repasoPendiente(rev, BANCO, hoy).length === 0 && repasoPendiente(rev, BANCO, "2026-11-06").map((x) => x.id).join() === "python-01", "toca repasarla desde el día siguiente");
  const sube = anotarRepaso(rev, "python-01", true, "2026-11-06");
  ok(sube["python-01"].box === 1 && sube["python-01"].due === "2026-11-09", "acertarla cuando toca la sube de caja y tarda más en volver");
  ok(anotarRepaso(rev, "python-01", true, hoy)["python-01"].box === 0, "acertarla antes de que toque no la sube de caja");
  ok(anotarRepaso(sube, "python-01", false, "2026-11-09")["python-01"].box === 0 && anotarRepaso(sube, "python-01", false, "2026-11-09")["python-01"].lapses === 1, "fallarla otra vez la devuelve a la primera caja");
  ok(repasoPendiente({ "python-99": { box: 0, due: hoy, n: 1, lapses: 0, ts: 1 } }, BANCO, hoy).length === 0, "una pregunta que ya no existe en el banco se ignora");

  // datos guardados
  const stages = (l: Parameters<typeof stageCount>[0]) => stageCount(l);
  const limpio = sanitizeState(
    {
      interviewReview: {
        "python-01": { box: 9, due: "2026-11-06", n: 2, lapses: 0, ts: 1 },
        "x": { box: 0, due: "mañana" },
        "__proto__": { box: 0, due: "2026-11-06" },
        "Python-01": { box: 0, due: "2026-11-06" },
      },
      interviews: {
        i1762300000000: { ts: 1762300000000, puesto: "inventado", lang: "python", nivel: "genio", minutos: 15, ms: 5000, ok: 12, total: 8, areas: { python: [9, 8], "A B": [1, 1], git: "mal" } },
        i12: { ts: 1, ok: 1, total: 1 },
        i1762300000001: { ts: 1, ok: 1, total: 0 },
      },
    },
    initialState(),
    stages,
  );
  ok(Object.keys(limpio.interviewReview).join() === "python-01" && limpio.interviewReview["python-01"].box === 4, "el repaso de entrevistas descarta claves raras y limita la caja");
  const rec = limpio.interviews.i1762300000000;
  ok(Object.keys(limpio.interviews).length === 1 && rec.puesto === "general" && rec.nivel === "junior" && rec.ok === 8 && rec.total === 8, "las entrevistas guardadas se corrigen: puesto y nivel conocidos, bien <= total");
  ok(Object.keys(rec.areas).join() === "python" && rec.areas.python[0] === 8, "las áreas de una entrevista guardada se validan");
  const base = initialState();
  const unos = { ...base, interviews: { i1762300000000: rec } };
  const otros = { ...base, interviews: { i1762300000999: { ...rec, ts: 1762300000999 } } };
  const unidos = mergeStates(base, unos, otros);
  ok(Object.keys(unidos.interviews).length === 2, "dos ventanas que terminan una entrevista cada una no se pisan");
}

console.log(failed ? `\n${failed} test(s) fallaron` : "\nTodos los tests de lógica pasaron");
process.exit(failed ? 1 : 0);
