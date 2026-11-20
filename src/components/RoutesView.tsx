import type { AppState, LangId } from "../types";
import { LANGS, isTrack, symbolInfo } from "../data/curriculum";
import { comboText, isTypeable, layoutFor } from "../data/layouts";
import { STEP_WINDOW, playableChars, stageInfos, stepInfos } from "../engine/stats";
import { getProfile } from "../store";

function TrackRoute({ state, lang }: { state: AppState; lang: LangId }) {
  const s = state.settings;
  if (!isTrack(lang)) return null;
  const infos = stepInfos(lang, getProfile(state, lang), s);
  return (
    <div className="frame view">
      <h2>Ruta de {LANGS[lang].name}</h2>
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
  const layout = layoutFor(s);
  const profile = getProfile(state, lang);
  const infos = new Map(stageInfos(lang, profile, s).map((k) => [k.char, k]));
  return (
    <div className="frame view">
      <h2>Ruta de {LANGS[lang].name}</h2>
      <div className="sub">
        Orden en que se desbloquean los símbolos para tu teclado {layout.name}. Para pasar a la siguiente etapa, todos los
        símbolos desbloqueados tienen que estar en verde: al menos {s.minSamples} pulsaciones, {s.targetWpm} WPM y{" "}
        {s.minAccuracy}% de precisión.
      </div>
      {layout.notes && !layout.learned && <div className="note">{layout.notes}</div>}
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
                {symbolInfo(chars[0], lang)}
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
