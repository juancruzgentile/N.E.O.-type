import { useRef, useState } from "react";
import type { AppState, ErrorMode, LayoutId, Settings, ThemeId } from "../types";
import { LANGS } from "../data/curriculum";
import { LAYOUTS, comboText, layoutFor } from "../data/layouts";
import { DEFAULT_SETTINGS, profileKey, today } from "../store";
import { AvatarPicker } from "./Avatar";
import { KeyCalibration } from "./KeyCalibration";
import { MAX_IMPORT_BYTES } from "../sanitize";

type Update = (fn: (s: AppState) => AppState) => void;

export const THEMES: { id: ThemeId; name: string; colors: string[] }[] = [
  { id: "cyber", name: "Cyber", colors: ["#07070c", "#f3e600", "#ff003c", "#02d7f2"] },
  { id: "neon", name: "Neón", colors: ["#030912", "#19d3ff", "#ff4fd8", "#2bff9a"] },
  { id: "synthwave", name: "Synthwave", colors: ["#140620", "#ff7edb", "#36f9f6", "#fede5d"] },
  { id: "matrix", name: "Matrix", colors: ["#000a03", "#39ff6a", "#c6ff3d", "#2bd16b"] },
  { id: "tokyo", name: "Tokio noche", colors: ["#1a1b26", "#7aa2f7", "#bb9af7", "#9ece6a"] },
  { id: "light", name: "Claro", colors: ["#eef3f8", "#0077c8", "#b03aa8", "#0f9d58"] },
];

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
  const [calibrating, setCalibrating] = useState(false);
  const layout = layoutFor(s);
  const learned = Object.keys(s.keymap[s.layout] ?? {});

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
      <h2>Ajustes</h2>
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
          <div className="help">Cambia el teclado en pantalla y las combinaciones que te enseña. {learned.length ? "" : (LAYOUTS[s.layout].notes ?? "")}</div>
          <div className="help">
            {learned.length
              ? `Ajustado a tu teclado real: ${learned.map((ch) => `${ch} (${comboText(layout, ch)})`).join(" · ")}`
              : "La app aprende sola dónde tenés cada símbolo mientras practicás. También podés calibrarlo de una vez."}
          </div>
          <div className="seg">
            <button onClick={() => setCalibrating(true)}>Calibrar teclado</button>
            {learned.length > 0 && (
              <button
                onClick={() => {
                  if (!confirm(`¿Olvidar los ${learned.length} símbolos aprendidos del teclado ${LAYOUTS[s.layout].short}?`)) return;
                  update((st) => ({ ...st, settings: { ...st.settings, keymap: { ...st.settings.keymap, [s.layout]: {} } } }));
                }}
              >
                Restablecer
              </button>
            )}
          </div>
          {calibrating && <KeyCalibration state={state} update={update} onClose={() => setCalibrating(false)} />}
        </div>

        <div className="setting">
          <label>Atajos de VS Code</label>
          <div className="seg">
            <button className={s.vscodeKeys === "pc" ? "on" : ""} onClick={() => set("vscodeKeys", "pc")}>Linux / Windows</button>
            <button className={s.vscodeKeys === "mac" ? "on" : ""} onClick={() => set("vscodeKeys", "mac")}>Mac</button>
          </div>
          <div className="help">Los que se practican en Desafíos → Atajos de editor. En Mac, Ctrl pasa a ser Cmd y Ctrl+flecha a ser Option+flecha.</div>
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
            N.E.O.-type v{__APP_VERSION__} · Licencia MIT. Usa React (MIT) y las fuentes JetBrains Mono, IBM Plex Sans y Chakra Petch
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
