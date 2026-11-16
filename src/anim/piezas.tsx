// Piezas comunes de las animaciones y los diagramas. Colores y letras salen de los tokens de src/styles/anim.css.

/** Número con coma decimal, como se escribe en castellano. */
export const num = (x: number) => x.toFixed(2).replace(".", ",").replace("-", "−");

/** Línea que se prende con la señal (o con el error si `err`); `flujo` dibuja la señal corriendo (hacia atrás con `atras`). */
export function Cable({ x1, y1, x2, y2, on, err, atras, ancho = 1.5 }: {
  x1: number; y1: number; x2: number; y2: number; on: boolean; err?: boolean; atras?: boolean; ancho?: number;
}) {
  const cls = on ? `anim-cable on${err ? " err" : ""} flujo${atras ? " atras" : ""}` : "anim-cable";
  return <line x1={x1} y1={y1} x2={x2} y2={y2} className={cls} strokeWidth={on ? ancho + 1 : ancho} />;
}

/** Nodo: vacío cuando está quieto, relleno con la señal cuando está activo, con borde de error si `err`. */
export function Nodo({ cx, cy, r = 14, on, texto, err }: { cx: number; cy: number; r?: number; on: boolean; texto?: string; err?: boolean }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} className={`anim-nodo${on ? " on" : ""}${err ? " err" : ""}`} />
      {texto && <text x={cx} y={cy + (r >= 30 ? 5.5 : 4)} className={`anim-nodo-t${on && !err ? " on" : ""}${r >= 30 ? " grande" : ""}`} textAnchor="middle">{texto}</text>}
    </g>
  );
}
