import type { Profile } from "../types";
import { IconBolt, IconFlame, IconTarget, IconTrophy } from "./icons";

const fmt = (n: number) => Math.round(n).toLocaleString("es-AR");

function Bars({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(1, ...values);
  const vals = values.length ? values : [0, 0, 0, 0, 0];
  return (
    <div className="bars">
      {vals.map((v, i) => (
        <span key={i} style={{ height: `${Math.max(12, (v / max) * 100)}%`, background: color, boxShadow: `0 0 6px ${color}` }} />
      ))}
    </div>
  );
}

function Delta({ value, suffix = "", decimals = 0 }: { value: number | null; suffix?: string; decimals?: number }) {
  if (value === null) return <span className="delta flat">—</span>;
  const cls = value > 0 ? "delta" : value < 0 ? "delta neg" : "delta flat";
  const arrow = value > 0 ? "↑" : value < 0 ? "↓" : "·";
  return (
    <span className={cls}>
      {arrow} {value > 0 ? "+" : ""}
      {value.toFixed(decimals)}
      {suffix}
    </span>
  );
}

interface Props {
  profile: Profile;
  streak: number;
}

export function MetricCards({ profile, streak }: Props) {
  const ls = profile.lessons;
  const last = ls[ls.length - 1];
  const prev = ls.slice(-11, -1);
  const avg = (key: "wpm" | "acc") => (prev.length ? prev.reduce((s, l) => s + l[key], 0) / prev.length : null);
  const avgWpm = avg("wpm");
  const avgAcc = avg("acc");
  const recent = ls.slice(-6);

  const wpmDelta = last && avgWpm ? ((last.wpm - avgWpm) / avgWpm) * 100 : null;
  const accDelta = last && avgAcc !== null ? (last.acc - avgAcc) * 100 : null;

  return (
    <div className="metrics">
      <div className="frame metric">
        <div className="ico" style={{ color: "var(--green)" }}><IconBolt size={32} /></div>
        <div>
          <div className="label">VELOCIDAD</div>
          <div className="value">{last ? Math.round(last.wpm) : "—"}<small>WPM</small></div>
        </div>
        <div className="side">
          <Bars values={recent.map((l) => l.wpm)} color="var(--green)" />
          <Delta value={wpmDelta} suffix="%" />
        </div>
      </div>
      <div className="frame metric">
        <div className="ico" style={{ color: "var(--green)" }}><IconTarget size={32} /></div>
        <div>
          <div className="label">PRECISIÓN</div>
          <div className="value">{last ? (last.acc * 100).toFixed(1) : "—"}<small>%</small></div>
        </div>
        <div className="side">
          <Bars values={recent.map((l) => l.acc * 100 - 80)} color="var(--green)" />
          <Delta value={accDelta} suffix="%" decimals={1} />
        </div>
      </div>
      <div className="frame metric">
        <div className="ico" style={{ color: "var(--yellow)" }}><IconTrophy size={32} /></div>
        <div>
          <div className="label">PUNTUACIÓN</div>
          <div className="value">{fmt(profile.score)}</div>
        </div>
        <div className="side">
          <Bars values={recent.map((l) => l.score)} color="var(--green)" />
          <Delta value={last ? last.score : null} />
        </div>
      </div>
      <div className="frame metric">
        <div className="ico" style={{ color: "var(--red)" }}><IconFlame size={32} /></div>
        <div>
          <div className="label">RACHA</div>
          <div className="value">{streak}<small>{streak === 1 ? "día" : "días"}</small></div>
        </div>
        <div className="side">
          <Bars values={[1, 2, 3, 4, 5].map((i) => (i <= Math.min(streak, 5) ? i : 0.3))} color="var(--green)" />
          <span className="delta flat">seguidos</span>
        </div>
      </div>
    </div>
  );
}
