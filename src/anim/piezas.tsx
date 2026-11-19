// Piezas comunes de las animaciones y los diagramas. Colores y letras salen de los tokens de src/styles/anim.css.

/** Número con coma decimal, como se escribe en castellano. */
export const num = (x: number) => x.toFixed(2).replace(".", ",").replace("-", "−");

/** Línea que se prende con la señal (o con el error si `err`). La señal se ve como puntos que viajan por el cable; el error, como guiones que corren hacia atrás (`atras`). */
export function Cable({ x1, y1, x2, y2, on, err, atras, ancho = 1.5 }: {
  x1: number; y1: number; x2: number; y2: number; on: boolean; err?: boolean; atras?: boolean; ancho?: number;
}) {
  const cls = on ? `anim-cable on${err ? " err flujo" : ""}${atras ? " atras" : ""}` : "anim-cable";
  const ruta = atras ? `M${x2} ${y2}L${x1} ${y1}` : `M${x1} ${y1}L${x2} ${y2}`;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} className={cls} strokeWidth={on ? ancho + 0.5 : ancho} />
      {on && !err && <circle r={3} className="anim-viaja" style={{ offsetPath: `path("${ruta}")`, animationDelay: `${-((x1 + y1 * 3) % 7) * 0.14}s` }} />}
    </g>
  );
}

/** Nodo: vacío cuando está quieto, con la señal (relleno suave y aro) cuando está activo, con borde de error si `err`; `tenue` lo baja de intensidad cuando el foco está en otro lado. */
export function Nodo({ cx, cy, r = 14, on, texto, err, tenue }: { cx: number; cy: number; r?: number; on: boolean; texto?: string; err?: boolean; tenue?: boolean }) {
  return (
    <g className={`anim-nodo-g${tenue && !on ? " tenue" : ""}`}>
      <circle cx={cx} cy={cy} r={r + 5} className={`anim-aro${on && !err ? " on" : ""}`} />
      <circle cx={cx} cy={cy} r={r} className={`anim-nodo${on ? " on" : ""}${err ? " err" : ""}`} />
      {texto && <text x={cx} y={cy + (r >= 30 ? 5.5 : 4)} className={`anim-nodo-t${r >= 30 ? " grande" : ""}`} textAnchor="middle">{texto}</text>}
    </g>
  );
}

/** Pastilla de estado dentro de la escena: texto corto sobre una cajita (con tono de error si `err`). `x` es el borde izquierdo y `y` el centro. */
export function Pastilla({ x, y, texto, dato, err }: { x: number; y: number; texto: string; dato?: string; err?: boolean }) {
  const w = Math.ceil(texto.length * 6.4 + (dato ? dato.length * 7.4 + 6 : 0) + 18);
  return (
    <g className={`anim-pastilla${err ? " err" : ""}`}>
      <rect x={x} y={y - 12} width={w} height={24} />
      <text x={x + 9} y={y + 4.5} className="a-s">{texto}{dato && <> <tspan className="a-n">{dato}</tspan></>}</text>
    </g>
  );
}
