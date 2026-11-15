/**
 * Diagramas a mano para la clase de "Día de trabajo": SVG en línea, sin librerías de gráficos
 * ni imágenes externas (así no se rompe la CSP ni hace falta red). Los trazos usan las variables
 * de color del tema para verse bien en claro y oscuro; el prompt y el bucle usan el teal de Codex. La neurona y el
 * entrenamiento son animaciones paso a paso (ver Animacion.tsx).
 */
import type { ReactNode } from "react";
import type { DiagramaId } from "../library/types";
import { Animacion } from "./Animacion";

const TEAL = "#1a9c7c";
const txt = { fill: "var(--text)", fontFamily: "var(--mono)" } as const;
const muted = { fill: "var(--muted)", fontFamily: "var(--mono)" } as const;

/** Número con coma decimal, como se escribe en castellano. */
const num = (x: number) => x.toFixed(2).replace(".", ",").replace("-", "−");

/** Línea que se prende con la señal (o con el error si `err`); `flujo` dibuja la señal corriendo (hacia atrás con `atras`). */
function Cable({ x1, y1, x2, y2, on, err, atras, ancho = 1.5 }: {
  x1: number; y1: number; x2: number; y2: number; on: boolean; err?: boolean; atras?: boolean; ancho?: number;
}) {
  const cls = on ? `anim-cable on${err ? " err" : ""} flujo${atras ? " atras" : ""}` : "anim-cable";
  return <line x1={x1} y1={y1} x2={x2} y2={y2} className={cls} strokeWidth={on ? ancho + 1 : ancho} />;
}

/** Nodo: vacío cuando está quieto, relleno con la señal cuando está activo, con borde de error si `err`. */
function Nodo({ cx, cy, r = 14, on, texto, err }: { cx: number; cy: number; r?: number; on: boolean; texto?: string; err?: boolean }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} className={`anim-nodo${on ? " on" : ""}${err ? " err" : ""}`} />
      {texto && <text x={cx} y={cy + (r >= 30 ? 5.5 : 4)} className={`anim-nodo-t${on && !err ? " on" : ""}${r >= 30 ? " grande" : ""}`} textAnchor="middle">{texto}</text>}
    </g>
  );
}

const ENTRADAS = [0.9, 0.2, 0.6];
const PESOS = [0.8, -0.5, 0.3];
const SESGO = 0.1;
const SUMA = ENTRADAS.reduce((s, x, i) => s + x * PESOS[i], 0);
const SALIDA = Math.max(0, SUMA + SESGO);

const PASOS_NEURONA = [
  "Llegan tres números de entrada.",
  "Cada entrada se multiplica por el peso de su conexión.",
  `Se suma todo y se agrega el sesgo: ${num(SUMA)} + ${num(SESGO)} = ${num(SUMA + SESGO)}.`,
  "La activación (acá ReLU: lo negativo pasa a 0) decide la salida.",
  "Muchas neuronas juntas forman capas: la señal pasa de la entrada a la capa oculta…",
  "…y de la capa oculta a la salida. Cada línea es un peso que se ajusta al entrenar.",
];

// la red: entrada, capa oculta y salida, como en el dibujo de siempre
const RED_IN = [60, 120, 180];
const RED_HID = [40, 93, 147, 200];
const RED_X = [100, 280, 460];

function NeuronaDiagrama() {
  const ys = [36, 120, 204];
  // la fórmula va sobre su cable en los dos de arriba y debajo en el de abajo, así no cruza otras líneas
  const yFormula = [ys[0] - 10, ys[1] - 8, ys[2] + 22];
  return (
    <Animacion pasos={PASOS_NEURONA} label="Cómo calcula una neurona artificial y cómo pasa la señal por una red">
      {(p) => (
        <svg viewBox="0 0 560 250">
          <g className="anim-escena" style={{ opacity: p < 4 ? 1 : 0 }}>
            {ys.map((y) => <Cable key={y} x1={88} y1={y} x2={302} y2={120} on={p >= 1} />)}
            {ys.map((y, i) => (
              <g key={y}>
                <text x={98} y={yFormula[i]} className={`a-n${p === 1 ? " fuerte" : ""}`}>
                  {p >= 1 ? `${num(ENTRADAS[i])} × ${num(PESOS[i])} = ${num(ENTRADAS[i] * PESOS[i])}` : <><tspan className="a-u">peso </tspan>{num(PESOS[i])}</>}
                </text>
                <Nodo cx={70} cy={y} r={18} on={p === 0} texto={num(ENTRADAS[i])} />
              </g>
            ))}
            <Nodo cx={340} cy={120} r={38} on={p >= 2} texto={p >= 2 ? num(SUMA + SESGO) : "Σ"} />
            <text x={340} y={182} textAnchor="middle" className="a-s">
              {p >= 2 ? <>suma <tspan className="a-n">{num(SUMA)}</tspan> + sesgo <tspan className="a-n">{num(SESGO)}</tspan></> : "suma + sesgo"}
            </text>
            <Cable x1={378} y1={120} x2={478} y2={120} on={p === 3} />
            <text x={430} y={108} textAnchor="middle" className="a-s">activación</text>
            <Nodo cx={500} cy={120} r={22} on={p === 3} texto={p === 3 ? num(SALIDA) : "?"} />
            <text x={70} y={242} textAnchor="middle" className="a-t">entradas</text>
            <text x={340} y={242} textAnchor="middle" className="a-t">neurona</text>
            <text x={500} y={242} textAnchor="middle" className="a-t">salida</text>
          </g>
          <g className="anim-escena" style={{ opacity: p >= 4 ? 1 : 0 }}>
            {RED_IN.map((y1) => RED_HID.map((y2) => <Cable key={`${y1}-${y2}`} x1={RED_X[0]} y1={y1} x2={RED_X[1]} y2={y2} on={p === 4} ancho={1} />))}
            {RED_HID.map((y2) => <Cable key={y2} x1={RED_X[1]} y1={y2} x2={RED_X[2]} y2={120} on={p === 5} ancho={1} />)}
            {RED_IN.map((y) => <Nodo key={y} cx={RED_X[0]} cy={y} on={p === 4} />)}
            {RED_HID.map((y) => <Nodo key={y} cx={RED_X[1]} cy={y} on={p >= 4} />)}
            <Nodo cx={RED_X[2]} cy={120} r={16} on={p === 5} />
            <text x={RED_X[0]} y={242} textAnchor="middle" className="a-t">entrada</text>
            <text x={RED_X[1]} y={242} textAnchor="middle" className="a-t">capa oculta</text>
            <text x={RED_X[2]} y={242} textAnchor="middle" className="a-t">salida</text>
          </g>
        </svg>
      )}
    </Animacion>
  );
}

// cada época la salida se acerca al objetivo (1) y el error baja, con algún altibajo
const SALIDAS = [0.3, 0.52, 0.48, 0.71, 0.83];
const FASES = [
  "La red responde con sus pesos actuales",
  "Se compara con la respuesta correcta: la diferencia es el error",
  "El error vuelve hacia atrás por la red (retropropagación)",
  "Cada peso se corrige un poquito y el error queda anotado",
];
const PASOS_ENTRENAR = SALIDAS.flatMap((_, e) => FASES.map((f) => `Época ${e + 1}: ${f.toLowerCase()}.`));

function EntrenamientoDiagrama() {
  // la red a la izquierda (x 40 a 220) y la curva a la derecha: x de 380 a 540, y del error (0 a 1) entre 200 y 40
  const punto = (e: number) => `${380 + e * 40},${200 - (1 - SALIDAS[e]) * 160}`;
  const X = [40, 130, 220];
  return (
    <Animacion pasos={PASOS_ENTRENAR} label="Cómo se entrena una red: responde, mide el error, lo manda hacia atrás y corrige los pesos">
      {(p) => {
        const e = Math.floor(p / 4);
        const f = p % 4;
        const anotadas = f === 3 ? e + 1 : e;
        const err = f === 1 || f === 2;
        // el grosor de cada peso cambia en cada época, para que se vea que se corrigió
        const ancho = (i: number, j: number) => 1 + ((i * 7 + j * 3 + anotadas) % 4) * 0.5;
        return (
          <svg viewBox="0 0 560 250">
            {RED_IN.map((y1, i) => RED_HID.map((y2, j) => (
              <Cable key={`${y1}-${y2}`} x1={X[0]} y1={y1} x2={X[1]} y2={y2} on={f !== 1} atras={f === 2} err={f === 2} ancho={ancho(i, j)} />
            )))}
            {RED_HID.map((y2, j) => <Cable key={y2} x1={X[1]} y1={y2} x2={X[2]} y2={120} on={f !== 1} atras={f === 2} err={f === 2} ancho={ancho(4, j)} />)}
            {RED_IN.map((y) => <Nodo key={y} cx={X[0]} cy={y} r={11} on={false} />)}
            {RED_HID.map((y) => <Nodo key={y} cx={X[1]} cy={y} r={11} on={f === 3} />)}
            <Nodo cx={X[2]} cy={120} r={22} on err={err} texto={num(SALIDAS[e])} />
            {/* a la derecha de la salida no pasa ningún cable */}
            <text x={254} y={116} className="a-s">objetivo <tspan className="a-n">1,00</tspan></text>
            <text x={254} y={136} className={`a-s${err ? " err" : ""}`}>error <tspan className="a-n">{num(1 - SALIDAS[e])}</tspan></text>
            <text x={130} y={18} textAnchor="middle" className="a-t">la red</text>

            <line x1="360" y1="40" x2="360" y2="205" className="anim-eje" />
            <line x1="360" y1="205" x2="550" y2="205" className="anim-eje" />
            <text x={360} y={18} className="a-t">la curva de error</text>
            <text x={550} y={228} textAnchor="end" className="a-s">épocas</text>
            {anotadas > 1 && <polyline points={SALIDAS.slice(0, anotadas).map((_, k) => punto(k)).join(" ")} className="anim-curva" />}
            {SALIDAS.slice(0, anotadas).map((_, k) => {
              const [x, y] = punto(k).split(",");
              return <circle key={k} cx={x} cy={y} r="5" className="anim-punto" />;
            })}
          </svg>
        );
      }}
    </Animacion>
  );
}

function PromptDiagrama() {
  const boxes = [
    { y: 10, h: 32, label: "Rol y contexto", ej: "“Sos un agente que programa en TypeScript”" },
    { y: 52, h: 32, label: "Tarea concreta", ej: "“Agregá validación al formulario de login”" },
    { y: 94, h: 32, label: "Restricciones", ej: "“Sin librerías nuevas, seguí el estilo del repo”" },
    { y: 136, h: 32, label: "Formato de salida", ej: "“Explicá el cambio en 3 líneas al final”" },
  ];
  return (
    <svg viewBox="0 0 440 220" role="img" aria-label="Anatomía de un buen prompt: rol y contexto, tarea concreta, restricciones y formato de salida, que entran al modelo">
      {boxes.map((b) => (
        <g key={b.label}>
          <rect x="10" y={b.y} width="300" height={b.h} rx="4" fill="var(--panel2)" stroke={TEAL} strokeWidth="1.5" />
          <text x="20" y={b.y + 14} fontSize="12" fontWeight="700" {...txt}>{b.label}</text>
          <text x="20" y={b.y + 27} fontSize="10.5" {...muted}>{b.ej}</text>
        </g>
      ))}
      <path d="M160 178 v14 M160 192 l-6 -8 M160 192 l6 -8" stroke={TEAL} strokeWidth="2" fill="none" />
      <rect x="330" y="70" width="100" height="50" rx="6" fill={TEAL} />
      <text x="380" y="99" textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff">modelo</text>
      <path d="M150 50 L330 95 M150 125 L330 100" stroke="var(--line2)" strokeWidth="1" />
    </svg>
  );
}

function BucleDiagrama() {
  const steps = [
    { cx: 100, cy: 40, label: "1. Leer contexto", sub: "archivos, AGENTS.md" },
    { cx: 320, cy: 40, label: "2. Actuar", sub: "editar, correr comandos" },
    { cx: 320, cy: 170, label: "3. Verificar", sub: "tests, build" },
    { cx: 100, cy: 170, label: "repetir o terminar", sub: "" },
  ];
  return (
    <svg viewBox="0 0 420 220" role="img" aria-label="El bucle de un agente: leer contexto, actuar, verificar y repetir, con una evaluación de si hace falta aprobación humana entre leer y actuar">
      <path d="M150 40 H280" stroke="var(--line2)" strokeWidth="2" markerEnd="url(#codex-arrow)" fill="none" />
      <path d="M320 70 V140" stroke="var(--line2)" strokeWidth="2" markerEnd="url(#codex-arrow)" fill="none" />
      <path d="M280 170 H150" stroke="var(--line2)" strokeWidth="2" markerEnd="url(#codex-arrow)" fill="none" />
      <path d="M100 140 V70" stroke="var(--line2)" strokeWidth="2" markerEnd="url(#codex-arrow)" fill="none" />
      <defs>
        <marker id="codex-arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
          <path d="M0 0 L8 4 L0 8 z" fill="var(--line2)" />
        </marker>
      </defs>
      {steps.map((s) => (
        <g key={s.label}>
          <rect x={s.cx - 60} y={s.cy - 20} width="120" height="40" rx="6" fill="var(--panel2)" stroke={TEAL} strokeWidth="1.5" />
          <text x={s.cx} y={s.cy - 3} textAnchor="middle" fontSize="12" fontWeight="700" {...txt}>{s.label}</text>
          {s.sub && <text x={s.cx} y={s.cy + 12} textAnchor="middle" fontSize="10" {...muted}>{s.sub}</text>}
        </g>
      ))}
      <text x="210" y="42" textAnchor="middle" fontSize="10.5" fill={TEAL}>evalúa si necesita tu aprobación</text>
    </svg>
  );
}

const DIAGRAMS = {
  neurona: NeuronaDiagrama,
  entrenamiento: EntrenamientoDiagrama,
  prompt: PromptDiagrama,
  bucle: BucleDiagrama,
} satisfies Record<DiagramaId, () => ReactNode>;

export function ClaseDiagrama({ id }: { id: DiagramaId }) {
  const D = DIAGRAMS[id];
  return (
    <div className="clase-diagrama">
      <D />
    </div>
  );
}
