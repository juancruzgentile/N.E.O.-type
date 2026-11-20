// Dibujos de IA: la neurona y el entrenamiento (animados), el prompt y el bucle del agente (quietos).
import { Animacion } from "./Animacion";
import { Cable, Nodo, Pastilla, num } from "./piezas";

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
const FASES_NEURONA = ["entradas", "pesos", "suma + sesgo", "activación", "capas", "capas"].map((f, i) => `${i + 1} · ${f}`);

const RED_IN = [60, 120, 180];
const RED_HID = [40, 93, 147, 200];
const RED_X = [100, 280, 460];

export function NeuronaDiagrama() {
  const ys = [36, 120, 204];
  // la fórmula va sobre su cable en los dos de arriba y debajo en el de abajo, así no cruza otras líneas
  const yFormula = [ys[0] - 10, ys[1] - 8, ys[2] + 22];
  return (
    <Animacion pasos={PASOS_NEURONA} fases={FASES_NEURONA} label="Cómo calcula una neurona artificial y cómo pasa la señal por una red">
      {(p) => (
        <svg viewBox="0 0 560 250">
          <g className="anim-escena" style={{ opacity: p < 4 ? 1 : 0 }}>
            {ys.map((y) => <Cable key={y} x1={88} y1={y} x2={302} y2={120} on={p >= 1} />)}
            {ys.map((y, i) => (
              <g key={y}>
                <text x={98} y={yFormula[i]} className={`a-n${p === 1 ? " fuerte" : ""}`}>
                  {p >= 1 ? `${num(ENTRADAS[i])} × ${num(PESOS[i])} = ${num(ENTRADAS[i] * PESOS[i])}` : <><tspan className="a-u">peso </tspan>{num(PESOS[i])}</>}
                </text>
                <Nodo cx={70} cy={y} r={18} on={p === 0} tenue={p > 0} texto={num(ENTRADAS[i])} />
              </g>
            ))}
            <Nodo cx={340} cy={120} r={38} on={p >= 2} tenue={p < 2} texto={p >= 2 ? num(SUMA + SESGO) : "Σ"} />
            <text x={340} y={182} textAnchor="middle" className="a-s">
              {p >= 2 ? <>suma <tspan className="a-n">{num(SUMA)}</tspan> + sesgo <tspan className="a-n">{num(SESGO)}</tspan></> : "suma + sesgo"}
            </text>
            <Cable x1={378} y1={120} x2={478} y2={120} on={p === 3} />
            <text x={430} y={108} textAnchor="middle" className="a-s">activación</text>
            <Nodo cx={500} cy={120} r={22} on={p === 3} tenue={p !== 3} texto={p === 3 ? num(SALIDA) : "?"} />
            <text x={70} y={242} textAnchor="middle" className="a-t">entradas</text>
            <text x={340} y={242} textAnchor="middle" className="a-t">neurona</text>
            <text x={500} y={242} textAnchor="middle" className="a-t">salida</text>
          </g>
          <g className="anim-escena" style={{ opacity: p >= 4 ? 1 : 0 }}>
            {RED_IN.map((y1) => RED_HID.map((y2) => <Cable key={`${y1}-${y2}`} x1={RED_X[0]} y1={y1} x2={RED_X[1]} y2={y2} on={p === 4} ancho={1} />))}
            {RED_HID.map((y2) => <Cable key={y2} x1={RED_X[1]} y1={y2} x2={RED_X[2]} y2={120} on={p === 5} ancho={1} />)}
            {RED_IN.map((y) => <Nodo key={y} cx={RED_X[0]} cy={y} on={p === 4} tenue />)}
            {RED_HID.map((y) => <Nodo key={y} cx={RED_X[1]} cy={y} on={p >= 4} />)}
            <Nodo cx={RED_X[2]} cy={120} r={16} on={p === 5} tenue />
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
const FASES_CORTAS = ["respuesta", "error", "retropropagación", "corrección"];
const PASOS_ENTRENAR = SALIDAS.flatMap((_, e) => FASES.map((f) => `Época ${e + 1}: ${f.toLowerCase()}.`));

export function EntrenamientoDiagrama() {
  // la red a la izquierda (x 40 a 220) y la curva a la derecha, en dos SVG para apilarlos en el celular: x de 380 a 540, y del error (0 a 1) entre 200 y 40
  const punto = (e: number) => `${380 + e * 40},${200 - (1 - SALIDAS[e]) * 160}`;
  const X = [40, 130, 220];
  return (
    <Animacion pasos={PASOS_ENTRENAR} fases={SALIDAS.flatMap((_, e) => FASES_CORTAS.map((f) => `época ${e + 1} · ${f}`))} label="Cómo se entrena una red: responde, mide el error, lo manda hacia atrás y corrige los pesos">
      {(p) => {
        const e = Math.floor(p / 4);
        const f = p % 4;
        const anotadas = f === 3 ? e + 1 : e;
        const err = f === 1 || f === 2;
        // el grosor de cada peso cambia en cada época, para que se vea que se corrigió
        const ancho = (i: number, j: number) => 1 + ((i * 7 + j * 3 + anotadas) % 4) * 0.5;
        return (
          <div className="anim-par">
            <svg viewBox="10 0 340 250" className="anim-par-red">
              {RED_IN.map((y1, i) => RED_HID.map((y2, j) => (
                <Cable key={`${y1}-${y2}`} x1={X[0]} y1={y1} x2={X[1]} y2={y2} on={f !== 1} atras={f === 2} err={f === 2} ancho={ancho(i, j)} />
              )))}
              {RED_HID.map((y2, j) => <Cable key={y2} x1={X[1]} y1={y2} x2={X[2]} y2={120} on={f !== 1} atras={f === 2} err={f === 2} ancho={ancho(4, j)} />)}
              {RED_IN.map((y) => <Nodo key={y} cx={X[0]} cy={y} r={11} on={false} tenue />)}
              {RED_HID.map((y) => <Nodo key={y} cx={X[1]} cy={y} r={11} on={f === 3} tenue={f !== 3} />)}
              <Nodo cx={X[2]} cy={120} r={22} on err={err} texto={num(SALIDAS[e])} />
              {/* a la derecha de la salida no pasa ningún cable */}
              <text x={254} y={104} className="a-s">objetivo <tspan className="a-n">1,00</tspan></text>
              <Pastilla x={252} y={128} texto="error" dato={num(1 - SALIDAS[e])} err={err} />
              <text x={130} y={18} textAnchor="middle" className="a-t">la red</text>
            </svg>
            <svg viewBox="340 0 220 250" className="anim-par-curva">
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
          </div>
        );
      }}
    </Animacion>
  );
}

export function PromptDiagrama() {
  const partes = [
    { label: "Rol y contexto", ej: "“Sos un agente que programa en TypeScript”" },
    { label: "Tarea concreta", ej: "“Agregá validación al formulario de login”" },
    { label: "Restricciones", ej: "“Sin librerías nuevas, seguí el estilo del repo”" },
    { label: "Formato de salida", ej: "“Explicá el cambio en 3 líneas al final”" },
  ];
  return (
    <div className="diag">
      <svg viewBox="0 0 560 220" role="img" aria-label="Anatomía de un buen prompt: rol y contexto, tarea concreta, restricciones y formato de salida, que entran al modelo">
        <defs>
          <marker id="prompt-flecha" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
            <path d="M0 0 L10 5 L0 10 z" className="anim-punta" />
          </marker>
        </defs>
        {partes.map((b, i) => {
          const y = 8 + i * 52;
          return (
            <g key={b.label}>
              <path d={`M360 ${y + 23} L428 111`} className="anim-flecha" markerEnd="url(#prompt-flecha)" />
              <rect x="8" y={y} width="352" height="46" rx="4" className="anim-caja" />
              <text x="22" y={y + 19} className="a-t">{b.label}</text>
              <text x="22" y={y + 36} className="a-s">{b.ej}</text>
            </g>
          );
        })}
        <rect x="430" y="86" width="122" height="50" rx="6" className="anim-caja on" />
        <text x="491" y="116" textAnchor="middle" className="a-t sobre">modelo</text>
      </svg>
    </div>
  );
}

export function BucleDiagrama() {
  const pasos = [
    { cx: 90, cy: 40, label: "1. Leer contexto", sub: "archivos y reglas" },
    { cx: 470, cy: 40, label: "2. Actuar", sub: "editar, correr comandos" },
    { cx: 470, cy: 190, label: "3. Verificar", sub: "tests, build" },
    { cx: 90, cy: 190, label: "repetir o terminar", sub: "" },
  ];
  return (
    <div className="diag">
      <svg viewBox="0 0 560 230" role="img" aria-label="El bucle de un agente: leer contexto, actuar, verificar y repetir, con una evaluación de si hace falta aprobación humana entre leer y actuar">
        <defs>
          <marker id="bucle-flecha" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto">
            <path d="M0 0 L10 5 L0 10 z" className="anim-punta" />
          </marker>
        </defs>
        {["M174 40 H386", "M470 70 V160", "M386 190 H174", "M90 160 V70"].map((d) => (
          <path key={d} d={d} className="anim-flecha" markerEnd="url(#bucle-flecha)" />
        ))}
        <text x="280" y="28" textAnchor="middle" className="a-s">evalúa si necesita tu aprobación</text>
        {pasos.map((s) => (
          <g key={s.label}>
            <rect x={s.cx - 80} y={s.cy - 26} width="160" height="52" rx="6" className="anim-caja" />
            <text x={s.cx} y={s.sub ? s.cy - 4 : s.cy + 5} textAnchor="middle" className="a-t">{s.label}</text>
            {s.sub && <text x={s.cx} y={s.cy + 14} textAnchor="middle" className="a-s">{s.sub}</text>}
          </g>
        ))}
      </svg>
    </div>
  );
}
