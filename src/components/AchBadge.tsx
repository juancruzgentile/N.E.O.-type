import type { ReactElement } from "react";

/** Insignias de logros: marco octogonal angular + glifo o número. */

export const TIER_COLORS = { bronze: "#ff6b35", silver: "#02d7f2", gold: "#f3e600" } as const;
export type Tier = keyof typeof TIER_COLORS;

const P = (d: string) => <path d={d} />;

/** glifos en una caja de 24×24 */
const GLYPHS: Record<string, ReactElement> = {
  hello: P("M5 8l4 4-4 4M11 16h8"),
  clean: P("M12 3l2.2 6.8L21 12l-6.8 2.2L12 21l-2.2-6.8L3 12l6.8-2.2z"),
  symbols10: P("M9 5c-2 0-2 2-2 4s0 2-2 3c2 1 2 1 2 3s0 4 2 4M15 5c2 0 2 2 2 4s0 2 2 3c-2 1-2 1-2 3s0 4-2 4"),
  brackets: P("M9 4H5v16h4M15 4h4v16h-4M10 12h4"),
  altgr: <g>{P("M3 6h18v12H3z")}{P("M7 15l2.5-6 2.5 6M8 13h3M15 9v6h3")}</g>,
  route: <g>{P("M4 18h5l3-8 3 8h5")}<rect x="10.5" y="4" width="3" height="3" /></g>,
  polyglot: <g>{P("M12 3l8 4.5v9L12 21l-8-4.5v-9z")}{P("M4 7.5l8 4.5 8-4.5M12 12v9")}</g>,
  allterrain: <g>{P("M12 2v5M12 17v5M2 12h5M17 12h5")}{P("M12 7l2 5-2 5-2-5z")}</g>,
  goal: <g>{P("M12 3v4M12 17v4M3 12h4M17 12h4")}<rect x="8" y="8" width="8" height="8" /></g>,
  sprinter: P("M4 6l6 6-6 6M11 6l6 6-6 6M18 8l3 4-3 4"),
  surgeon: <g>{P("M12 2v7M12 15v7M2 12h7M15 12h7")}<rect x="10.5" y="10.5" width="3" height="3" /></g>,
  firststep: P("M4 20h6v-6h6V8h4"),
  dba: <g>{P("M5 6c0-1.7 3.1-3 7-3s7 1.3 7 3-3.1 3-7 3-7-1.3-7-3z")}{P("M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3")}</g>,
  sysadmin: <g>{P("M3 4h18v16H3z")}{P("M7 9l3 3-3 3M12 15h5")}</g>,
  webdev: P("M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"),
  trainee: P("M5 10l7-5 7 5M5 15l7-5 7 5M5 20l7-5 7 5"),
  owl: P("M15 3a9 9 0 1 0 6 14 7 7 0 0 1-6-14z"),
};

/** logros que se muestran con número + unidad */
const NUMBERS: Record<string, [string, string]> = {
  lessons10: ["10", "LEC"], lessons50: ["50", "LEC"], lessons200: ["200", "LEC"],
  wpm30: ["30", "WPM"], wpm50: ["50", "WPM"], wpm70: ["70", "WPM"], wpm90: ["90", "WPM"],
  streak3: ["3", "DÍAS"], streak7: ["7", "DÍAS"], streak30: ["30", "DÍAS"],
};

export function AchBadge({ id, tier, unlocked, size = 52 }: { id: string; tier: Tier; unlocked: boolean; size?: number }) {
  const color = unlocked ? TIER_COLORS[tier] : "var(--dim)";
  const num = NUMBERS[id];
  return (
    <svg className={`ach-badge ${unlocked ? "on" : ""}`} width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <polygon points="14,2 34,2 46,14 46,34 34,46 14,46 2,34 2,14" fill={unlocked ? color : "none"} fillOpacity="0.1" stroke={color} strokeWidth="1.6" strokeDasharray={unlocked ? undefined : "3 3"} />
      <polygon points="16,6 32,6 42,16 42,32 32,42 16,42 6,32 6,16" fill="none" stroke={color} strokeOpacity="0.35" strokeWidth="0.8" />
      {/* marca de rango: 1, 2 o 3 muescas */}
      {Array.from({ length: tier === "gold" ? 3 : tier === "silver" ? 2 : 1 }).map((_, i) => (
        <rect key={i} x={20 + i * 3} y="43.2" width="2" height="2.4" fill={color} />
      ))}
      {num ? (
        <g fill={color} fontFamily="'Chakra Petch', sans-serif" fontWeight="700" textAnchor="middle">
          <text x="24" y={num[0].length > 2 ? 26 : 27} fontSize={num[0].length > 2 ? 13 : 16}>{num[0]}</text>
          <text x="24" y="35" fontSize="6.5" letterSpacing="1">{num[1]}</text>
        </g>
      ) : (
        <g transform="translate(12 12)" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="square" strokeLinejoin="miter">
          {GLYPHS[id] ?? GLYPHS.hello}
        </g>
      )}
    </svg>
  );
}
