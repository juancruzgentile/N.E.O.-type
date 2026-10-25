import { FINGER_NAMES, type LayoutDef, comboMap, comboText } from "../data/layouts";
import type { KeyInfo } from "../engine/stats";

interface Props {
  infos: KeyInfo[];
  focus: string | null;
  next: string | null;
  layout: LayoutDef;
  showChips: boolean;
}

const display = (ch: string) => (ch === "\n" ? "↵" : ch === " " ? "␣" : ch);

export function KeySet({ infos, focus, next, layout, showChips }: Props) {
  const combo = next ? comboMap(layout).get(next) : undefined;
  return (
    <div className="frame keyset">
      {showChips && (
        <>
          <span className="lbl">SÍMBOLOS</span>
          <div className="chips">
            {infos.map((k) => (
              <span
                key={k.char}
                className={`chip ${k.state} ${k.char === focus ? "focus" : ""}`}
                title={
                  k.state === "locked"
                    ? "Bloqueado"
                    : `${k.samples} muestras · ${Math.round(k.wpm)} WPM · ${Math.round(k.accuracy * 100)}% precisión`
                }
                style={
                  k.state === "learning" && k.confidence !== null
                    ? { background: `color-mix(in srgb, ${k.confidence < 0.5 ? "#ff3d6e" : k.confidence < 0.8 ? "#ff9a3d" : "#ffd23f"} 35%, transparent)` }
                    : undefined
                }
              >
                {k.char}
              </span>
            ))}
          </div>
        </>
      )}
      <div className="hint">
        {next !== null && (
          <>
            <span>Siguiente:</span>
            <span className="k">{display(next)}</span>
            <span className="combo">{comboText(layout, next)}</span>
            {combo && <span>· {FINGER_NAMES[combo.finger]}</span>}
          </>
        )}
      </div>
    </div>
  );
}
