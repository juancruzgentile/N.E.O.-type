import { useMemo } from "react";
import type { AppState, LangId } from "../types";
import { LANGS } from "../data/curriculum";
import { comboText, layoutFor } from "../data/layouts";
import { type KeyInfo, msToWpm, stageInfos } from "../engine/stats";
import { getProfile, today } from "../store";
import { Keyboard, heatColor } from "./Keyboard";

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
  const layout = layoutFor(s);
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
  const { n: totalLessons, ms: totalMs, chars: totalChars, best } = profile.totals;
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
      <h2>Estadísticas · {LANGS[lang].name}</h2>
      <div className="sub">Teclado {layout.name}. El mapa de calor muestra qué tan cerca está cada tecla del objetivo.</div>
      <div className="cards">
        <div className="stat-card"><div className="l">LECCIONES</div><div className="v">{totalLessons}</div></div>
        <div className="stat-card"><div className="l">TIEMPO PRACTICADO</div><div className="v">{Math.round(totalMs / 60000)} min</div></div>
        <div className="stat-card"><div className="l">CARACTERES</div><div className="v">{totalChars.toLocaleString("es-AR")}</div></div>
        <div className="stat-card"><div className="l">MEJOR VELOCIDAD</div><div className="v">{Math.round(best)} WPM</div></div>
        <div className="stat-card"><div className="l">PROMEDIO (ÚLT. 20)</div><div className="v">{Math.round(avg20)} WPM</div></div>
        <div className="stat-card"><div className="l">PRECISIÓN (ÚLT. 20)</div><div className="v">{(acc20 * 100).toFixed(1)}%</div></div>
      </div>

      <div className="section">Evolución <span style={{ fontSize: 12, color: "var(--cyan)" }}>━ WPM</span> <span style={{ fontSize: 12, color: "var(--yellow)" }}>━ precisión</span></div>
      <LineChart data={ls.slice(-80)} />

      <div className="section">Mapa de calor</div>
      <Keyboard layout={layout} heat={heat} />
      <div className="legend">
        <span><i style={{ background: "#4f6f86" }} />sin calibrar</span>
        <span><i style={{ background: "#ff3d6e" }} />lenta</span>
        <span><i style={{ background: "#ff9a3d" }} />mejorando</span>
        <span><i style={{ background: "#ffd23f" }} />casi</span>
        <span><i style={{ background: "#2bff9a" }} />dominada</span>
        <span><i style={{ background: "#173246" }} />bloqueada</span>
      </div>

      <div className="section">Símbolos</div>
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

      <div className="section">Calendario</div>
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
