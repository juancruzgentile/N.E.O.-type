import type { LangId } from "../types";
import { LANGS, LANG_ORDER } from "../data/curriculum";

/**
 * Emblema de lenguaje con forma de "datashard": placa angular con el monograma
 * desdoblado en rojo y cian (aberración cromática), código de barras y número de serie.
 * Es un diseño propio: no usa los logos oficiales, que son marcas registradas.
 */

const MONO: Record<LangId, string> = { python: "PY", javascript: "JS", typescript: "TS", java: "JV", csharp: "C#", go: "GO", rust: "RS" };

/** código de barras determinístico por lenguaje */
function bars(lang: LangId): [number, number][] {
  let seed = [...lang].reduce((a, c) => a * 31 + c.charCodeAt(0), 7) >>> 0;
  const out: [number, number][] = [];
  let x = 14;
  while (x < 46) {
    seed = (seed * 1103515245 + 12345) >>> 0;
    const w = 0.8 + ((seed >>> 16) % 3) * 0.8;
    out.push([x, w]);
    x += w + 1 + ((seed >>> 8) % 2);
  }
  return out;
}

export function LangEmblem({ lang, size = 56 }: { lang: LangId; size?: number }) {
  const color = LANGS[lang].color;
  const mono = MONO[lang];
  const small = size < 40;
  const serial = `0x${String(LANG_ORDER.indexOf(lang) + 1).padStart(2, "0")}`;
  return (
    <svg className="lang-emblem" width={size} height={size} viewBox="0 0 64 64" role="img" aria-label={LANGS[lang].name}>
      {/* placa con esquinas cortadas */}
      <polygon points="4,4 48,4 60,16 60,60 16,60 4,48" fill="var(--key-bg)" stroke={color} strokeWidth="2" />
      <polygon points="4,4 48,4 60,16 60,60 16,60 4,48" fill={color} fillOpacity="0.08" />
      {/* franja lateral y muesca */}
      <rect x="4" y="12" width="4" height="30" fill={color} />
      <polygon points="48,4 60,16 54,16 48,10" fill={color} />
      {!small && (
        <>
          <text x="56" y="12.5" fontSize="5" fill={color} fontFamily="'JetBrains Mono', monospace" textAnchor="end" opacity="0.9">{serial}</text>
          {bars(lang).map(([x, w], i) => <rect key={i} x={x} y="50" width={w} height="5" fill={color} opacity="0.75" />)}
        </>
      )}
      {/* monograma con aberración cromática */}
      <g fontFamily="'Chakra Petch', sans-serif" fontWeight="700" fontSize={small ? 26 : 22} textAnchor="middle" letterSpacing="-0.5">
        <text x={small ? 33.5 : 34.6} y={small ? 41 : 39} fill="#ff003c" opacity="0.85">{mono}</text>
        <text x={small ? 30.5 : 31.4} y={small ? 41 : 39} fill="#02d7f2" opacity="0.85">{mono}</text>
        <text x={small ? 32 : 33} y={small ? 41 : 39} fill="var(--strong)">{mono}</text>
      </g>
    </svg>
  );
}
