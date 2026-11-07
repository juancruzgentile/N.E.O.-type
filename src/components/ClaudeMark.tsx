/**
 * Marca de Claude y la mascota de Claude Code, dibujadas a mano para esta app (no son los archivos oficiales).
 * La marca es una estrella de doce puntas; la mascota, un bicho de píxeles con dos ojos.
 */
const CORAL = "#d97757";

export function ClaudeMark({ size = 56 }: { size?: number }) {
  const rays = Array.from({ length: 12 }, (_, i) => {
    const a = (i * 30 * Math.PI) / 180;
    const len = i % 2 ? 19 : 24;
    return <line key={i} x1={32 + Math.sin(a) * 6} y1={32 - Math.cos(a) * 6} x2={32 + Math.sin(a) * len} y2={32 - Math.cos(a) * len} />;
  });
  return (
    <svg className="claude-mark" width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="Claude">
      <rect x="2" y="2" width="60" height="60" rx="14" fill="var(--key-bg)" stroke={CORAL} strokeWidth="2" />
      <g stroke={CORAL} strokeWidth="4.5" strokeLinecap="round">{rays}</g>
    </svg>
  );
}

export function ClaudeBuddy({ size = 64 }: { size?: number }) {
  return (
    <svg className="claude-buddy" width={size} height={(size * 14) / 22} viewBox="0 0 22 14" shapeRendering="crispEdges" aria-hidden="true">
      <g fill={CORAL}>
        <rect x="3" y="0" width="16" height="9" />
        <rect x="0" y="3" width="3" height="3" />
        <rect x="19" y="3" width="3" height="3" />
        <rect x="4" y="9" width="2" height="4" />
        <rect x="7" y="9" width="2" height="4" />
        <rect x="13" y="9" width="2" height="4" />
        <rect x="16" y="9" width="2" height="4" />
      </g>
      <g fill="#1a1a1a">
        <rect x="7" y="3" width="2" height="3" />
        <rect x="13" y="3" width="2" height="3" />
      </g>
    </svg>
  );
}
