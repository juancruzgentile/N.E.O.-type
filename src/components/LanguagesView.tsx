import { type CSSProperties } from "react";
import type { AppState, LangId } from "../types";
import { LANGS, LANG_ORDER, TRACK_ORDER, isTrack, stageCount } from "../data/curriculum";
import { TRACKS } from "../tracks/index";
import { progressToNext } from "../engine/stats";
import { getProfile } from "../store";
import { LangEmblem } from "./LangEmblem";

function LangCard({ state, id, onPick }: { state: AppState; id: LangId; onPick: (l: LangId) => void }) {
  const p = getProfile(state, id);
  const prog = progressToNext(id, p, state.settings);
  const best = p.totals.best;
  const started = p.totals.n > 0;
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
      {started && (
        <div className="meta">
          <span>{p.totals.n} lecciones</span>
          <span>récord {Math.round(best)} WPM</span>
        </div>
      )}
      <div className="go">{started ? "Continuar →" : "Empezar →"}</div>
    </button>
  );
}

export function LanguagesView({ state, onPick }: { state: AppState; onPick: (l: LangId) => void }) {
  return (
    <div className="frame view">
      <h2>Elegí tu ruta</h2>
      <div className="sub">
        Cada lenguaje tiene su propia ruta de símbolos y su propio progreso. Empezás con pocos símbolos y se van
        desbloqueando a medida que demostrás velocidad y precisión.
      </div>
      <div className="section">Lenguajes de programación</div>
      <div className="grid-langs">
        {LANG_ORDER.map((id) => <LangCard key={id} state={state} id={id} onPick={onPick} />)}
      </div>
      <div className="section">Rutas trainee</div>
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
