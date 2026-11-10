/**
 * Marca de Codex y su mascota, dibujadas a mano para esta app (no son los archivos oficiales).
 * La marca es un prompt de terminal (">_") en un recuadro; la mascota, un robot de píxeles con antena.
 */
const TEAL = "#1a9c7c";

export function CodexMark({ size = 56 }: { size?: number }) {
  return (
    <svg className="codex-mark" width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="Codex">
      <rect x="2" y="2" width="60" height="60" rx="14" fill="var(--key-bg)" stroke={TEAL} strokeWidth="2" />
      <g stroke={TEAL} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M20 22 L32 32 L20 42" />
        <path d="M36 42 L48 42" />
      </g>
    </svg>
  );
}

export function CodexBuddy({ size = 64 }: { size?: number }) {
  return (
    <svg className="codex-buddy" width={size} height={(size * 14) / 22} viewBox="0 0 22 14" shapeRendering="crispEdges" aria-hidden="true">
      <g fill={TEAL}>
        <rect x="10" y="0" width="2" height="2" />
        <rect x="4" y="2" width="14" height="8" />
        <rect x="1" y="4" width="3" height="3" />
        <rect x="18" y="4" width="3" height="3" />
        <rect x="5" y="10" width="2" height="4" />
        <rect x="8" y="10" width="2" height="4" />
        <rect x="12" y="10" width="2" height="4" />
        <rect x="15" y="10" width="2" height="4" />
      </g>
      <g fill="#0a1a16">
        <rect x="7" y="5" width="3" height="2" />
        <rect x="12" y="5" width="3" height="2" />
      </g>
    </svg>
  );
}
