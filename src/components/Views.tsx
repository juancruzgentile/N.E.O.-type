import { type CSSProperties, useMemo, useRef, useState } from "react";
import type { AppState, ErrorMode, LangId, LayoutId, Settings, ThemeId } from "../types";
import { ACHIEVEMENTS } from "../engine/achievements";
import { AchBadge } from "./AchBadge";
import { LANGS, LANG_ORDER, SYMBOL_INFO, TRACK_ORDER, isTrack, stageCount } from "../data/curriculum";
import { TRACKS } from "../tracks/index";
import { LAYOUTS, comboText, isTypeable } from "../data/layouts";
import { type KeyInfo, STEP_WINDOW, msToWpm, playableChars, progressToNext, stageInfos, stepInfos } from "../engine/stats";
import { DEFAULT_SETTINGS, getProfile, profileKey, today } from "../store";
import { LangEmblem } from "./LangEmblem";
import { AvatarPicker } from "./Avatar";
import { MAX_IMPORT_BYTES } from "../sanitize";
import { Keyboard, heatColor } from "./Keyboard";
import type { Challenge } from "./PracticeView";

type Update = (fn: (s: AppState) => AppState) => void;

// ─────────────────────────── Lenguajes ───────────────────────────

function LangCard({ state, id, onPick }: { state: AppState; id: LangId; onPick: (l: LangId) => void }) {
  const p = getProfile(state, id);
  const prog = progressToNext(id, p, state.settings);
  const best = p.lessons.reduce((m, l) => Math.max(m, l.wpm), 0);
  const started = p.lessons.length > 0;
  const total = stageCount(id);
  const track = isTrack(id);
  const pct = track
    ? prog.mastered / total
    : (p.stage + (prog.total ? prog.mastered / prog.total : 0)) / total;
  return (
    <button className="lang-card" onClick={() => onPick(id)} style={{ "--lc": LANGS[id].color } as CSSProperties}>
      <div className="top">
        <LangEmblem lang={id} size={64} />
        <div>
          <div className="nm">{LANGS[id].name}</div>
          <div style={{ color: "var(--muted)", fontSize: 15 }}>
            {track ? `Escalón ${p.stage + 1} de ${total}` : `Nivel ${p.stage + 1} de ${total}`}
          </div>
        </div>
      </div>
      {track && <div className="lang-steps">{TRACKS[id].steps.map((st) => st.name).join(" → ")}</div>}
      <div className="progress">
        <span style={{ width: `${pct * 100}%` }} />
      </div>
      <div className="meta">
        <span>{p.lessons.length} lecciones</span>
        <span>récord {Math.round(best)} WPM</span>
      </div>
      <div className="go">{started ? "CONTINUAR →" : "EMPEZAR →"}</div>
    </button>
  );
}

export function LanguagesView({ state, onPick }: { state: AppState; onPick: (l: LangId) => void }) {
  return (
    <div className="frame view">
      <h2>ELEGÍ TU RUTA</h2>
      <div className="sub">
        Cada lenguaje tiene su propia ruta de símbolos y su propio progreso. Empezás con pocos símbolos y se van
        desbloqueando a medida que demostrás velocidad y precisión.
      </div>
      <div className="section">LENGUAJES DE PROGRAMACIÓN</div>
      <div className="grid-langs">
        {LANG_ORDER.map((id) => <LangCard key={id} state={state} id={id} onPick={onPick} />)}
      </div>
      <div className="section">RUTAS TRAINEE</div>
      <div className="sub">
        Herramientas de todos los días, por escalones de dificultad. Cada escalón nuevo se mezcla con los anteriores y
        las lecciones se enfocan en el que tengas más flojo.
      </div>
      <div className="grid-langs">
        {TRACK_ORDER.map((id) => <LangCard key={id} state={state} id={id} onPick={onPick} />)}
      </div>
    </div>
  );
}

// ─────────────────────────── Rutas ───────────────────────────

function TrackRoute({ state, lang }: { state: AppState; lang: LangId }) {
  const s = state.settings;
  if (!isTrack(lang)) return null;
  const infos = stepInfos(lang, getProfile(state, lang), s);
  return (
    <div className="frame view">
      <h2>RUTA DE {LANGS[lang].name.toUpperCase()}</h2>
      <div className="sub">
        Escalones en orden de dificultad. Cada uno suma temas nuevos y se mezcla con los anteriores. Para pasar al
        siguiente, todos los escalones desbloqueados tienen que estar en verde: tus últimas {STEP_WINDOW} lecciones de
        cada uno tienen que promediar {s.targetWpm} WPM y {s.minAccuracy}% de precisión.
      </div>
      <div className="route">
        {infos.map((x) => (
          <div key={x.id} className={`route-row step-row ${x.state === "locked" ? "locked" : ""} ${x.index === getProfile(state, lang).stage ? "current" : ""}`}>
            <span className="n">{String(x.index + 1).padStart(2, "0")}</span>
            <span className="syms step-name">{x.name}</span>
            <span className="desc">{x.desc}</span>
            <span className="combo">
              {x.state === "locked"
                ? "—"
                : x.wpm === null
                  ? `${x.lessons} / ${STEP_WINDOW} lecciones para calibrar`
                  : `${Math.round(x.wpm)} WPM · ${Math.round((x.acc ?? 0) * 100)}% · ${x.lessons} lecciones`}
            </span>
            <span>
              <span className={`state ${x.state}`}>
                {x.state === "locked" ? "bloqueado" : x.state === "mastered" ? "dominado" : x.state === "new" ? "calibrando" : "aprendiendo"}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RoutesView({ state, lang }: { state: AppState; lang: LangId }) {
  if (isTrack(lang)) return <TrackRoute state={state} lang={lang} />;
  const s = state.settings;
  const layout = LAYOUTS[s.layout];
  const profile = getProfile(state, lang);
  const infos = new Map(stageInfos(lang, profile, s).map((k) => [k.char, k]));
  return (
    <div className="frame view">
      <h2>RUTA DE {LANGS[lang].name.toUpperCase()}</h2>
      <div className="sub">
        Orden en que se desbloquean los símbolos para tu teclado {layout.name}. Para pasar a la siguiente etapa, todos los
        símbolos desbloqueados tienen que estar en verde: al menos {s.minSamples} pulsaciones, {s.targetWpm} WPM y{" "}
        {s.minAccuracy}% de precisión.
      </div>
      {layout.notes && <div className="note">{layout.notes}</div>}
      <div className="route">
        {LANGS[lang].stages.map((chars, i) => {
          const playable = playableChars(chars, s);
          const skipped = chars.filter((c) => !isTypeable(layout, c));
          const state_ = i < profile.stage ? "done" : i === profile.stage ? "current" : "locked";
          const states = playable.map((c) => infos.get(c)?.state ?? "locked");
          const allMastered = states.length > 0 && states.every((x) => x === "mastered");
          const label = chars.length > 4 ? "0-9" : chars.join(" ");
          return (
            <div key={i} className={`route-row ${state_ === "current" ? "current" : ""} ${state_ === "locked" ? "locked" : ""}`}>
              <span className="n">{String(i + 1).padStart(2, "0")}</span>
              <span className="syms">{label}</span>
              <span className="desc">
                {SYMBOL_INFO[chars[0]]}
                {skipped.length > 0 && s.excludeMissing && (
                  <span style={{ color: "var(--dim)" }}> · se salta: {skipped.join(" ")} no tiene tecla</span>
                )}
              </span>
              <span className="combo">
                {chars.length > 4 ? "fila de números" : chars.map((c) => `${c}: ${comboText(layout, c)}`).join("  ·  ")}
              </span>
              <span>
                <span className={`state ${state_ === "locked" ? "locked" : allMastered ? "mastered" : state_ === "current" ? "learning" : "new"}`}>
                  {state_ === "locked" ? "bloqueado" : allMastered ? "dominado" : "aprendiendo"}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────── Estadísticas ───────────────────────────

function LineChart({ data }: { data: { wpm: number; acc: number }[] }) {
  const W = 900;
  const H = 220;
  const pad = { l: 40, r: 40, t: 14, b: 24 };
  if (data.length < 2) {
    return <div style={{ color: "var(--muted)", padding: 20 }}>Completá al menos dos lecciones para ver la evolución.</div>;
  }
  const maxW = Math.max(10, ...data.map((d) => d.wpm)) * 1.1;
  const x = (i: number) => pad.l + (i / (data.length - 1)) * (W - pad.l - pad.r);
  const yW = (v: number) => H - pad.b - (v / maxW) * (H - pad.t - pad.b);
  const yA = (v: number) => H - pad.b - ((v - 0.7) / 0.3) * (H - pad.t - pad.b);
  const path = (f: (d: { wpm: number; acc: number }) => number) =>
    data.map((d, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${f(d).toFixed(1)}`).join(" ");
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * maxW);
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label="Evolución de velocidad y precisión">
      <g className="grid">
        {ticks.map((t) => <line key={t} x1={pad.l} x2={W - pad.r} y1={yW(t)} y2={yW(t)} />)}
      </g>
      {ticks.map((t) => <text key={t} x={pad.l - 8} y={yW(t) + 4} textAnchor="end">{Math.round(t)}</text>)}
      {[0.7, 0.85, 1].map((a) => <text key={a} x={W - pad.r + 8} y={yA(a) + 4}>{Math.round(a * 100)}%</text>)}
      <path d={path((d) => yA(Math.max(0.7, d.acc)))} fill="none" stroke="var(--yellow)" strokeWidth="1.5" strokeOpacity="0.7" />
      <path d={path((d) => yW(d.wpm))} fill="none" stroke="var(--cyan)" strokeWidth="2.5" style={{ filter: "drop-shadow(0 0 4px var(--cyan))" }} />
    </svg>
  );
}

export function StatsView({ state, lang }: { state: AppState; lang: LangId }) {
  const s = state.settings;
  const layout = LAYOUTS[s.layout];
  const profile = getProfile(state, lang);
  const infos = stageInfos(lang, profile, s);
  const heat = new Map<string, KeyInfo>(infos.map((k) => [k.char, k]));
  // letras y otros caracteres tecleados también entran al mapa de calor
  for (const [ch, k] of Object.entries(profile.keys)) {
    if (!heat.has(ch) && k.n > 0) {
      const wpm = msToWpm(k.ema);
      heat.set(ch, {
        char: ch, state: wpm >= s.targetWpm ? "mastered" : "learning", confidence: Math.min(1, wpm / s.targetWpm),
        samples: k.n, accuracy: k.hits / Math.max(1, k.hits + k.misses), wpm,
      });
    }
  }
  const ls = profile.lessons;
  const totalMs = ls.reduce((a, l) => a + l.ms, 0);
  const totalChars = ls.reduce((a, l) => a + l.chars, 0);
  const best = ls.reduce((m, l) => Math.max(m, l.wpm), 0);
  const last20 = ls.slice(-20);
  const avg20 = last20.length ? last20.reduce((a, l) => a + l.wpm, 0) / last20.length : 0;
  const acc20 = last20.length ? last20.reduce((a, l) => a + l.acc, 0) / last20.length : 0;

  const weeks = 18;
  const cal = useMemo(() => {
    const out: { day: string; secs: number }[] = [];
    const d = new Date();
    d.setDate(d.getDate() - (weeks * 7 - 1) - ((d.getDay() + 6) % 7) + 6);
    for (let i = 0; i < weeks * 7; i++) {
      const key = today(d);
      out.push({ day: key, secs: state.days[key] ?? 0 });
      d.setDate(d.getDate() + 1);
    }
    return out;
  }, [state.days]);

  return (
    <div className="frame view">
      <h2>ESTADÍSTICAS · {LANGS[lang].name.toUpperCase()}</h2>
      <div className="sub">Teclado {layout.name}. El mapa de calor muestra qué tan cerca está cada tecla del objetivo.</div>
      <div className="cards">
        <div className="stat-card"><div className="l">LECCIONES</div><div className="v">{ls.length}</div></div>
        <div className="stat-card"><div className="l">TIEMPO PRACTICADO</div><div className="v">{Math.round(totalMs / 60000)} min</div></div>
        <div className="stat-card"><div className="l">CARACTERES</div><div className="v">{totalChars.toLocaleString("es-AR")}</div></div>
        <div className="stat-card"><div className="l">MEJOR VELOCIDAD</div><div className="v">{Math.round(best)} WPM</div></div>
        <div className="stat-card"><div className="l">PROMEDIO (ÚLT. 20)</div><div className="v">{Math.round(avg20)} WPM</div></div>
        <div className="stat-card"><div className="l">PRECISIÓN (ÚLT. 20)</div><div className="v">{(acc20 * 100).toFixed(1)}%</div></div>
      </div>

      <div className="section">EVOLUCIÓN <span style={{ fontSize: 12, color: "var(--cyan)" }}>━ WPM</span> <span style={{ fontSize: 12, color: "var(--yellow)" }}>━ precisión</span></div>
      <LineChart data={ls.slice(-80)} />

      <div className="section">MAPA DE CALOR</div>
      <Keyboard layout={layout} heat={heat} />
      <div className="legend">
        <span><i style={{ background: "#4f6f86" }} />sin calibrar</span>
        <span><i style={{ background: "#ff3d6e" }} />lenta</span>
        <span><i style={{ background: "#ff9a3d" }} />mejorando</span>
        <span><i style={{ background: "#ffd23f" }} />casi</span>
        <span><i style={{ background: "#2bff9a" }} />dominada</span>
        <span><i style={{ background: "#173246" }} />bloqueada</span>
      </div>

      <div className="section">SÍMBOLOS</div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>SÍMBOLO</th><th>CÓMO SE ESCRIBE</th><th>MUESTRAS</th><th>VELOCIDAD</th><th>PRECISIÓN</th><th>ESTADO</th></tr>
          </thead>
          <tbody>
            {infos.map((k) => (
              <tr key={k.char}>
                <td className="sym" style={{ color: heatColor(k) }}>{k.char}</td>
                <td style={{ color: "var(--yellow)" }}>{comboText(layout, k.char)}</td>
                <td>{k.samples}</td>
                <td>{k.wpm ? `${Math.round(k.wpm)} WPM` : "—"}</td>
                <td>{k.samples ? `${Math.round(k.accuracy * 100)}%` : "—"}</td>
                <td>
                  <span className={`state ${k.state}`}>
                    {{ locked: "bloqueado", new: "sin calibrar", learning: "aprendiendo", mastered: "dominado" }[k.state]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="section">CALENDARIO</div>
      <div className="cal">
        {cal.map((c) => {
          const m = c.secs / 60;
          const bg = m === 0 ? undefined : m < 5 ? "#0b5d4a" : m < 15 ? "#13a374" : "#2bff9a";
          return <i key={c.day} title={`${c.day}: ${Math.round(m)} min`} style={bg ? { background: bg, borderColor: bg } : undefined} />;
        })}
      </div>
    </div>
  );
}

// ─────────────────────────── Desafíos ───────────────────────────

export function ChallengesView({ state, lang, onStart }: { state: AppState; lang: LangId; onStart: (c: Challenge) => void }) {
  const items: { c: Challenge; title: string; desc: string }[] = [
    { c: { kind: "sprint", seconds: 30 }, title: "Sprint 30 s", desc: "Escribí todo el código que puedas en 30 segundos. Todos los símbolos habilitados." },
    { c: { kind: "sprint", seconds: 60 }, title: "Sprint 60 s", desc: "El clásico test de un minuto, pero con funciones reales del lenguaje." },
    { c: { kind: "sprint", seconds: 120 }, title: "Sprint 120 s", desc: "Resistencia: dos minutos sin parar." },
    { c: { kind: "perfect" }, title: "Precisión perfecta", desc: "Una función completa sin ningún error. Si te equivocás, vuelve a empezar." },
  ];
  return (
    <div className="frame view">
      <h2>DESAFÍOS · {LANGS[lang].name.toUpperCase()}</h2>
      <div className="sub">Los desafíos usan todos los símbolos del lenguaje, sin importar tu nivel. También suman a tus estadísticas.</div>
      <div className="cards">
        {items.map(({ c, title, desc }) => {
          const key = `${lang}:${c.kind === "sprint" ? `sprint${c.seconds}` : "perfect"}`;
          const rec = state.challenges[key];
          return (
            <div key={key} className="challenge">
              <h3>{title}</h3>
              <p>{desc}</p>
              <div className="rec">{rec ? `Récord: ${Math.round(rec.wpm)} WPM · ${(rec.acc * 100).toFixed(0)}%` : "Sin récord todavía"}</div>
              <button className="btn primary" onClick={() => onStart(c)}>Empezar</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────── Logros ───────────────────────────

export function AchievementsView({ state }: { state: AppState }) {
  const got = ACHIEVEMENTS.filter((a) => state.achievements[a.id]).length;
  return (
    <div className="frame view">
      <h2>LOGROS</h2>
      <div className="sub">
        {got} de {ACHIEVEMENTS.length} desbloqueados. Se cuentan con el teclado actual ({LAYOUTS[state.settings.layout].name}).
      </div>
      <div className="progress" style={{ marginBottom: 22 }}><span style={{ width: `${(got / ACHIEVEMENTS.length) * 100}%` }} /></div>
      <div className="ach-grid">
        {ACHIEVEMENTS.map((a) => {
          const ts = state.achievements[a.id];
          const prog = !ts && a.progress ? a.progress(state) : null;
          return (
            <div key={a.id} className={`ach ${a.tier} ${ts ? "got" : "locked"}`}>
              <AchBadge id={a.id} tier={a.tier} unlocked={!!ts} />
              <div className="ach-body">
                <div className="ach-name">{a.name}</div>
                <div className="ach-desc">{a.desc}</div>
                {ts ? (
                  <div className="ach-date">Desbloqueado el {new Date(ts).toLocaleDateString("es-AR")}</div>
                ) : prog !== null ? (
                  <div className="ach-prog"><span style={{ width: `${Math.round(prog * 100)}%` }} /></div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const THEMES: { id: ThemeId; name: string; colors: string[] }[] = [
  { id: "cyber", name: "Cyber", colors: ["#07070c", "#f3e600", "#ff003c", "#02d7f2"] },
  { id: "neon", name: "Neón", colors: ["#030912", "#19d3ff", "#ff4fd8", "#2bff9a"] },
  { id: "synthwave", name: "Synthwave", colors: ["#140620", "#ff7edb", "#36f9f6", "#fede5d"] },
  { id: "matrix", name: "Matrix", colors: ["#000a03", "#39ff6a", "#c6ff3d", "#2bd16b"] },
  { id: "tokyo", name: "Tokio noche", colors: ["#1a1b26", "#7aa2f7", "#bb9af7", "#9ece6a"] },
  { id: "light", name: "Claro", colors: ["#eef3f8", "#0077c8", "#b03aa8", "#0f9d58"] },
];

// ─────────────────────────── Ajustes ───────────────────────────

interface SettingsProps {
  state: AppState;
  update: Update;
  exportJson: () => string;
  importJson: (json: string) => void;
  onTutorial: () => void;
}

export function SettingsView({ state, update, exportJson, importJson, onTutorial }: SettingsProps) {
  const s = state.settings;
  const set = <K extends keyof Settings>(k: K, v: Settings[K]) =>
    update((st) => ({ ...st, settings: { ...st.settings, [k]: v } }));
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState("");

  const download = () => {
    let json: string;
    try {
      json = exportJson();
    } catch (e) {
      setMsg("No se pudo exportar: " + (e as Error).message);
      return;
    }
    const blob = new Blob([json], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `neo-type-progreso-${today()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const onFile = async (f: File | undefined) => {
    if (!f) return;
    if (f.size > MAX_IMPORT_BYTES) {
      setMsg("No se pudo importar: el archivo es demasiado grande.");
      return;
    }
    if (!confirm("Importar reemplaza todo tu progreso actual por el del archivo. ¿Continuar?")) return;
    try {
      importJson(await f.text());
      setMsg("Progreso importado.");
    } catch (e) {
      setMsg("No se pudo importar: " + (e as Error).message);
    }
  };
  const resetLang = () => {
    if (!state.lang) return;
    if (!confirm(`¿Borrar todo el progreso de ${LANGS[state.lang].name} con el teclado ${LAYOUTS[s.layout].short}?`)) return;
    const key = profileKey(state.lang, s.layout);
    update((st) => {
      const profiles = { ...st.profiles };
      delete profiles[key];
      return { ...st, profiles };
    });
    setMsg("Progreso del lenguaje borrado.");
  };

  const errorModes: { id: ErrorMode; label: string }[] = [
    { id: "block", label: "Frenar en el error" },
    { id: "advance", label: "Avanzar + Backspace" },
    { id: "strict", label: "Avanzar sin borrar" },
  ];

  return (
    <div className="frame view">
      <h2>AJUSTES</h2>
      <div className="sub">Todo se guarda en este navegador. El progreso es independiente para cada lenguaje y cada teclado.</div>
      <div className="settings">
        <div className="setting">
          <label>Tema</label>
          <div className="themes">
            {THEMES.map((t) => (
              <button key={t.id} className={`theme-sw ${s.theme === t.id ? "on" : ""}`} onClick={() => set("theme", t.id)} title={t.name}>
                <span className="sw" style={{ background: `linear-gradient(135deg, ${t.colors[0]} 0 45%, ${t.colors[1]} 45% 65%, ${t.colors[2]} 65% 82%, ${t.colors[3]} 82%)` }} />
                {t.name}
              </button>
            ))}
          </div>
        </div>

        <div className="setting">
          <label>Teclado físico</label>
          <div className="seg">
            {(Object.keys(LAYOUTS) as LayoutId[]).map((id) => (
              <button key={id} className={s.layout === id ? "on" : ""} onClick={() => set("layout", id)}>{LAYOUTS[id].name}</button>
            ))}
          </div>
          <div className="help">Cambia el teclado en pantalla y las combinaciones que te enseña. {LAYOUTS[s.layout].notes ?? ""}</div>
        </div>

        <div className="setting">
          <label>Velocidad objetivo</label>
          <div className="range-row">
            <input type="range" min={15} max={90} step={1} value={s.targetWpm} onChange={(e) => set("targetWpm", Number(e.target.value))} />
            <output>{s.targetWpm} WPM</output>
          </div>
          <div className="help">Velocidad que tiene que alcanzar cada símbolo para considerarse dominado.</div>
        </div>

        <div className="setting">
          <label>Precisión mínima</label>
          <div className="range-row">
            <input type="range" min={80} max={100} step={1} value={s.minAccuracy} onChange={(e) => set("minAccuracy", Number(e.target.value))} />
            <output>{s.minAccuracy}%</output>
          </div>
          <div className="help">Calculada sobre los últimos 50 intentos de cada símbolo.</div>
        </div>

        <div className="setting">
          <label>Pulsaciones mínimas por símbolo</label>
          <div className="range-row">
            <input type="range" min={5} max={60} step={1} value={s.minSamples} onChange={(e) => set("minSamples", Number(e.target.value))} />
            <output>{s.minSamples}</output>
          </div>
          <div className="help">Antes de esto el símbolo se muestra "sin calibrar" y se practica con ejercicios dirigidos.</div>
        </div>

        <div className="setting">
          <label>Cuando te equivocás</label>
          <div className="seg">
            {errorModes.map((m) => (
              <button key={m.id} className={s.errorMode === m.id ? "on" : ""} onClick={() => set("errorMode", m.id)}>{m.label}</button>
            ))}
          </div>
          <div className="help">"Frenar" no avanza hasta que escribas la tecla correcta (recomendado para aprender).</div>
        </div>

        <div className="setting">
          <label>Objetivo diario</label>
          <div className="range-row">
            <input type="range" min={5} max={120} step={5} value={s.dailyGoalMin} onChange={(e) => set("dailyGoalMin", Number(e.target.value))} />
            <output>{s.dailyGoalMin} min</output>
          </div>
        </div>

        <div className="setting">
          <label>Opciones</label>
          <label className="toggle"><input type="checkbox" checked={s.showKeyboard} onChange={(e) => set("showKeyboard", e.target.checked)} /> Mostrar teclado en pantalla</label>
          <label className="toggle"><input type="checkbox" checked={s.sound} onChange={(e) => set("sound", e.target.checked)} /> Sonidos de teclas</label>
          <label className="toggle"><input type="checkbox" checked={s.animations} onChange={(e) => set("animations", e.target.checked)} /> Animaciones y fondo animado</label>
          <label className="toggle"><input type="checkbox" checked={s.excludeMissing} onChange={(e) => set("excludeMissing", e.target.checked)} /> Saltar símbolos sin tecla en mi teclado</label>
          <div className="help">Con el teclado italiano, ` y ~ no tienen tecla: si desactivás esta opción, vas a tener que escribirlos con códigos Alt.</div>
        </div>

        <div className="setting">
          <label>Perfil</label>
          <input type="text" value={s.userName} maxLength={24} placeholder="Tu nombre" onChange={(e) => set("userName", e.target.value)} />
          <AvatarPicker value={s.avatar} name={s.userName} onChange={(v) => set("avatar", v)} />
          <label className="toggle"><input type="checkbox" checked={s.showSplash} onChange={(e) => set("showSplash", e.target.checked)} /> Mostrar la pantalla de inicio al abrir</label>
          <button className="btn small" onClick={onTutorial}>Ver tutorial de bienvenida</button>
        </div>

        <div className="setting">
          <label>Acerca de</label>
          <div className="help">
            N.E.O.-type v{__APP_VERSION__} · Licencia MIT. Usa React (MIT) y las fuentes JetBrains Mono, Rajdhani y Chakra Petch
            (SIL Open Font License 1.1). Los nombres de los lenguajes son marcas de sus respectivos dueños y se usan solo
            para identificarlos; los emblemas son diseños propios. El detalle está en THIRD_PARTY_NOTICES.md.
          </div>
        </div>

        <div className="setting">
          <label>Copia de seguridad</label>
          <div className="seg">
            <button onClick={download}>Exportar progreso</button>
            <button onClick={() => fileRef.current?.click()}>Importar progreso</button>
            <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => onFile(e.target.files?.[0])} />
          </div>
          <div className="help">Útil para pasar tu progreso entre computadoras o navegadores.</div>
        </div>

        <div className="setting">
          <label>Reiniciar</label>
          <div className="seg">
            <button className="btn danger" onClick={resetLang} disabled={!state.lang}>Borrar progreso del lenguaje actual</button>
            <button className="btn" onClick={() => update((st) => ({ ...st, settings: { ...DEFAULT_SETTINGS, userName: st.settings.userName } }))}>Ajustes por defecto</button>
          </div>
          {msg && <div className="help" style={{ color: "var(--green)" }}>{msg}</div>}
        </div>
      </div>
    </div>
  );
}
