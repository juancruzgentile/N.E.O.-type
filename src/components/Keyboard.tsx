import type { CSSProperties } from "react";
import { type Finger, type LayoutDef, comboMap, rowsFor } from "../data/layouts";
import type { KeyInfo } from "../engine/stats";

export const FINGER_COLORS: Record<Finger, string> = {
  lp: "#ff4fd8",
  lr: "#ffd23f",
  lm: "#2bff9a",
  li: "#19d3ff",
  ri: "#4f86ff",
  rm: "#2bff9a",
  rr: "#ffd23f",
  rp: "#ff4fd8",
  th: "#7f9fb3",
};

/** Color de confianza: rojo → amarillo → verde. */
export function heatColor(info: KeyInfo | undefined): string {
  if (!info || info.state === "locked") return "#173246";
  if (info.confidence === null) return "#4f6f86";
  const c = info.confidence;
  if (info.state === "mastered") return "#2bff9a";
  if (c < 0.5) return "#ff3d6e";
  if (c < 0.8) return "#ff9a3d";
  return "#ffd23f";
}

interface Props {
  layout: LayoutDef;
  next?: string | null;
  /** flota suavemente (en práctica); el mapa de calor queda quieto */
  float?: boolean;
  /** modo mapa de calor: info por carácter */
  heat?: Map<string, KeyInfo>;
}

export function Keyboard({ layout, next, heat, float = false }: Props) {
  const rows = rowsFor(layout);
  const combos = comboMap(layout);
  const combo = next ? combos.get(next) : undefined;
  const leftHand = combo && ["lp", "lr", "lm", "li"].includes(combo.finger);

  return (
    <div className={"keyboard-wrap" + (float ? " floating" : "")}>
      <div className="kb-f1">
      <div className="kb-f2">
      <div className="keyboard" role="img" aria-label="Teclado en pantalla">
        {rows.map((row, ri) => (
          <div className="krow" key={ri}>
            {row.map((k, ki) => {
              const lg = layout.legends[k.code];
              const isLetter = !!lg && /^[a-zà-ÿñ]$/.test(lg[0]) && lg[1] === lg[0].toUpperCase();
              const isNext = !!combo && combo.code === k.code;
              let isMod = false;
              if (combo) {
                if (combo.shift && k.code === (leftHand ? "ShiftRight" : "ShiftLeft")) isMod = true;
                if (combo.altgr && k.code === "AltRight") isMod = true;
              }
              const style = { "--w": k.w, "--fc": FINGER_COLORS[k.finger] } as CSSProperties;
              let heatStyle: CSSProperties = {};
              if (heat && lg) {
                const infos = lg.filter((ch): ch is string => !!ch).map((ch) => heat.get(ch)).filter((x): x is KeyInfo => !!x);
                if (infos.length) {
                  const unlockedInfos = infos.filter((i) => i.state !== "locked");
                  const worst = (unlockedInfos.length ? unlockedInfos : infos).sort(
                    (a, b) => (a.confidence ?? -1) - (b.confidence ?? -1),
                  )[0];
                  heatStyle = { "--hc": heatColor(worst) } as CSSProperties;
                }
              }
              const cls = [
                "key",
                !lg ? "special" : "",
                lg && !isLetter ? "has-sh" : "",
                isNext ? "next" : "",
                isMod ? "mod" : "",
                heat && "--hc" in heatStyle ? "heat" : "",
                k.code === "KeyF" || k.code === "KeyJ" ? "bump" : "",
              ].join(" ");
              return (
                <div key={k.code + ki} data-code={k.code} className={cls} style={{ ...style, ...heatStyle }}>
                  {!lg && <span className="main">{k.label}</span>}
                  {lg && isLetter && <span className="main">{lg[1]}</span>}
                  {lg && !isLetter && (
                    <>
                      <span className="sh">{lg[1]}</span>
                      <span className="bs">{lg[0]}</span>
                      {lg[2] && <span className="ag">{lg[2]}</span>}
                      {lg[3] && <span className="ag2">{lg[3]}</span>}
                    </>
                  )}
                  {lg && isLetter && lg[2] && <span className="ag">{lg[2]}</span>}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      </div>
      </div>
      <div className="kb-shadow" aria-hidden="true" />
    </div>
  );
}
