import type { ReactElement } from "react";
import type { LangId } from "../types";
import { LANGS } from "../data/curriculum";

/**
 * Emblemas originales para cada lenguaje (no son los logos oficiales, que son
 * marcas registradas): un motivo de la "personalidad" técnica de cada uno.
 */
const S = { fill: "none", strokeWidth: 3.2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

const ART: Record<LangId, (c: string) => ReactElement> = {
  // indentación: el bloque es la sangría
  python: (c) => (
    <g {...S} stroke={c}>
      <path d="M17 21h14" /><path d="M23 29h18" /><path d="M29 37h14" /><path d="M23 45h10" />
      <circle cx="35" cy="21" r="1.6" fill={c} /><circle cx="35" cy="17" r="1.6" fill={c} />
    </g>
  ),
  // llaves con un rayo: rápido, dinámico, en todas partes
  javascript: (c) => (
    <g {...S} stroke={c}>
      <path d="M22 16c-5 0-5 3-5 7s0 5-4 7c4 2 4 3 4 7s0 7 5 7M42 16c5 0 5 3 5 7s0 5 4 7c-4 2-4 3-4 7s0 7-5 7" />
      <path d="M34 19l-6 12h8l-6 12" fill={c} fillOpacity="0.25" />
    </g>
  ),
  // genérico <T>: tipos
  typescript: (c) => (
    <g {...S} stroke={c}>
      <path d="M21 20 11 32l10 12M43 20l10 12-10 12" />
      <path d="M25 24h14M32 24v18" />
    </g>
  ),
  // cubos apilados: objetos y la máquina virtual
  java: (c) => (
    <g {...S} stroke={c}>
      <path d="M32 14l10 5-10 5-10-5z" fill={c} fillOpacity="0.2" /><path d="M22 19v10l10 5 10-5V19" /><path d="M32 24v10" />
      <path d="M21 36l-8 4v8l8 4 8-4v-8z" /><path d="M43 36l-8 4v8l8 4 8-4v-8z" />
    </g>
  ),
  // nota musical con sostenido
  csharp: (c) => (
    <g {...S} stroke={c}>
      <circle cx="21" cy="42" r="5" fill={c} fillOpacity="0.25" /><path d="M26 42V18l12-3v6l-12 3" />
      <path d="M40 30v18M46 29v18M37 36h12M37 42h12" />
    </g>
  ),
  // concurrencia: tareas que corren en paralelo y se comunican
  go: (c) => (
    <g {...S} stroke={c}>
      <circle cx="18" cy="22" r="5" /><circle cx="46" cy="22" r="5" /><circle cx="32" cy="45" r="5" fill={c} fillOpacity="0.25" />
      <path d="M24 22h16M43 27l-8 13M21 27l8 13" /><path d="M36 19l4 3-4 3" />
    </g>
  ),
  // escudo con cerradura: seguridad de memoria
  rust: (c) => (
    <g {...S} stroke={c}>
      <path d="M32 13l15 6v10c0 10-6 17-15 21-9-4-15-11-15-21V19z" fill={c} fillOpacity="0.12" />
      <circle cx="32" cy="29" r="4" /><path d="M32 33v7" />
    </g>
  ),
};

export function LangEmblem({ lang, size = 56 }: { lang: LangId; size?: number }) {
  const color = LANGS[lang].color;
  return (
    <svg className="lang-emblem" width={size} height={size} viewBox="0 0 64 64" role="img" aria-label={LANGS[lang].name}>
      <circle cx="32" cy="32" r="30" fill="var(--key-bg)" stroke={color} strokeOpacity="0.55" strokeWidth="1.5" />
      <circle cx="32" cy="32" r="26" fill={color} fillOpacity="0.07" />
      {ART[lang](color)}
    </svg>
  );
}
