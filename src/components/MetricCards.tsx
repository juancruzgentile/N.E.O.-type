import { memo, useEffect, useRef, useState } from "react";
import type { Profile } from "../types";
import { fxOn } from "../fx/fx";
import { IconBolt, IconFlame, IconTarget, IconTrophy } from "./icons";

const fmt = (n: number) => Math.round(n).toLocaleString("es-AR");

/** Anima un número desde su valor anterior hasta el nuevo. */
function useCountUp(value: number, ms = 750): number {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    if (!fxOn() || from.current === value) {
      from.current = value;
      setShown(value);
      return;
    }
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / ms);
      const e = 1 - Math.pow(1 - k, 3);
      setShown(a + (value - a) * e);
      if (k < 1) raf = requestAnimationFrame(tick);
      else from.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      from.current = value;
    };
  }, [value, ms]);
  return shown;
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

export const MetricCards = memo(function MetricCards({ profile, streak }: Props) {
  const ls = profile.lessons;
  const last = ls[ls.length - 1];
  const prev = ls.slice(-11, -1);
  const avg = (key: "wpm" | "acc") => (prev.length ? prev.reduce((s, l) => s + l[key], 0) / prev.length : null);
  const avgWpm = avg("wpm");
  const avgAcc = avg("acc");

  const wpmShown = useCountUp(last ? last.wpm : 0);
  const accShown = useCountUp(last ? last.acc * 100 : 0);
  const scoreShown = useCountUp(profile.score);

  const wpmDelta = last && avgWpm ? ((last.wpm - avgWpm) / avgWpm) * 100 : null;
  const accDelta = last && avgAcc !== null ? (last.acc - avgAcc) * 100 : null;

  return (
    <div className="metrics" data-tour="metrics">
      <div className="frame metric">
        <div className="ico" style={{ color: "var(--green)" }}><IconBolt size={32} /></div>
        <div>
          <div className="label">Velocidad</div>
          <div className="value">{last ? Math.round(wpmShown) : "—"}<small>WPM</small></div>
        </div>
        <div className="side">
          <Delta value={wpmDelta} suffix="%" />
        </div>
      </div>
      <div className="frame metric">
        <div className="ico" style={{ color: "var(--green)" }}><IconTarget size={32} /></div>
        <div>
          <div className="label">Precisión</div>
          <div className="value">{last ? accShown.toFixed(1) : "—"}<small>%</small></div>
        </div>
        <div className="side">
          <Delta value={accDelta} suffix="%" decimals={1} />
        </div>
      </div>
      <div className="frame metric">
        <div className="ico" style={{ color: "var(--yellow)" }}><IconTrophy size={32} /></div>
        <div>
          <div className="label">Puntuación</div>
          <div className="value">{fmt(scoreShown)}</div>
        </div>
        <div className="side">
          <Delta value={last ? last.score : null} />
        </div>
      </div>
      <div className="frame metric">
        <div className="ico" style={{ color: "var(--red)" }}><IconFlame size={32} /></div>
        <div>
          <div className="label">Racha</div>
          <div className="value">{streak}<small>{streak === 1 ? "día" : "días"}</small></div>
        </div>
        <div className="side">
          <span className="delta flat">seguidos</span>
        </div>
      </div>
    </div>
  );
});
