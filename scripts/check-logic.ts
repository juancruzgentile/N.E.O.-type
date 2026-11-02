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
import { TypingSession } from "../src/engine/session";
import { SOON, TOPICS } from "../src/library/index";
import { entryId, normalize, search } from "../src/library/search";
import { INTERVALS, addDays, daysBetween, dueCount, findEntry, grade, pickDue, practiceText, reviewLesson, whenText } from "../src/review/review";

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
  for (const t of TOPICS) {
    const levels = new Set(t.entries.map((e) => e.level));
    ok(levels.size === 3 && t.entries.length >= 12, `${t.name}: tiene entradas de los tres niveles (${t.entries.length})`);
    const ids = t.entries.map((e) => entryId(t, e));
    const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
    ok(dup.length === 0, `${t.name}: cada entrada tiene un id único${dup.length ? " — repetidos: " + dup.join(", ") : ""}`);
    ok(t.workflow.length >= 4 && t.facts.length >= 4 && t.summary.length > 80, `${t.name}: tiene resumen, datos y métodos de trabajo`);
    const empty = t.entries.filter((e) => !e.code.trim() || !e.desc.trim() || /\s$/.test(e.code));
    ok(empty.length === 0, `${t.name}: ninguna entrada sin ejemplo ni descripción`);
  }
  ok(new Set(TOPICS.map((t) => t.id)).size === TOPICS.length, "los temas no se repiten");
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
  let unTypeable: string[] = [];
  for (const t of TOPICS) for (const e of t.entries) {
    const txt = practiceText(e.code);
    if (/[^\x20-\x7e\n]/.test(txt) || !txt.trim()) unTypeable.push(`${t.id}: ${e.name}`);
  }
  ok(unTypeable.length === 0, `todos los ejemplos de la Biblioteca se pueden escribir en cualquier teclado${unTypeable.length ? " — " + unTypeable.slice(0, 3).join(", ") : ""}`);

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

console.log(failed ? `\n${failed} test(s) fallaron` : "\nTodos los tests de lógica pasaron");
process.exit(failed ? 1 : 0);
