import type { AppState } from "../types";
import { ACHIEVEMENTS } from "../engine/achievements";
import { AchBadge } from "./AchBadge";
import { LAYOUTS } from "../data/layouts";

export function AchievementsView({ state }: { state: AppState }) {
  const got = ACHIEVEMENTS.filter((a) => state.achievements[a.id]).length;
  return (
    <div className="frame view">
      <h2>Logros</h2>
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
