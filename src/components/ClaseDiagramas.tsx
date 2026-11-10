/**
 * Diagramas a mano para la clase de "Día de trabajo": SVG en línea, sin librerías de gráficos
 * ni imágenes externas (así no se rompe la CSP ni hace falta red). Los trazos usan las variables
 * de color del tema para verse bien en claro y oscuro; el acento es el teal de Codex.
 */
import type { ReactNode } from "react";
import type { DiagramaId } from "../library/types";

const TEAL = "#1a9c7c";
const txt = { fill: "var(--text)", fontFamily: "var(--mono)" } as const;
const muted = { fill: "var(--muted)", fontFamily: "var(--mono)" } as const;

function NeuronaDiagrama() {
  const inNodes = [40, 100, 160];
  const hidNodes = [20, 70, 130, 180];
  const outNode = 100;
  return (
    <svg viewBox="0 0 420 220" role="img" aria-label="Tres capas de una red neuronal: entrada, oculta y salida, todas conectadas entre sí">
      {inNodes.map((y1) =>
        hidNodes.map((y2) => (
          <line key={`${y1}-${y2}`} x1="80" y1={y1 + 10} x2="210" y2={y2 + 10} stroke="var(--line2)" strokeWidth="1" />
        )),
      )}
      {hidNodes.map((y2) => (
        <line key={`h-${y2}`} x1="210" y1={y2 + 10} x2="340" y2={outNode + 10} stroke="var(--line2)" strokeWidth="1" />
      ))}
      {inNodes.map((y, i) => <circle key={i} cx="80" cy={y + 10} r="10" fill="var(--panel2)" stroke={TEAL} strokeWidth="2" />)}
      {hidNodes.map((y, i) => <circle key={i} cx="210" cy={y + 10} r="10" fill="var(--panel2)" stroke={TEAL} strokeWidth="2" />)}
      <circle cx="340" cy={outNode + 10} r="12" fill={TEAL} stroke={TEAL} strokeWidth="2" />
      <text x="80" y="205" textAnchor="middle" fontSize="13" {...txt}>entrada</text>
      <text x="210" y="205" textAnchor="middle" fontSize="13" {...txt}>capa oculta</text>
      <text x="340" y="205" textAnchor="middle" fontSize="13" {...txt}>salida</text>
      <text x="210" y="20" textAnchor="middle" fontSize="11" {...muted}>cada línea es un peso que se ajusta al entrenar</text>
    </svg>
  );
}

function EntrenamientoDiagrama() {
  const pts = "20,30 60,60 100,70 140,100 180,95 220,120 260,115 300,135 340,140 380,145";
  return (
    <svg viewBox="0 0 420 200" role="img" aria-label="Curva de entrenamiento: el error baja de forma irregular a medida que pasan las épocas">
      <line x1="20" y1="20" x2="20" y2="160" stroke="var(--line2)" strokeWidth="1.5" />
      <line x1="20" y1="160" x2="400" y2="160" stroke="var(--line2)" strokeWidth="1.5" />
      <text x="10" y="18" fontSize="12" {...muted}>error</text>
      <text x="370" y="178" fontSize="12" {...muted}>épocas</text>
      <polyline points={pts} fill="none" stroke={TEAL} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx="380" cy="145" r="5" fill={TEAL} />
      <text x="300" y="60" fontSize="12" {...txt}>el modelo ajusta sus pesos</text>
      <text x="300" y="76" fontSize="12" {...txt}>para bajar este número</text>
    </svg>
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
    <svg viewBox="0 0 420 220" role="img" aria-label="El bucle de un agente: leer contexto, actuar, verificar y repetir, con una aprobación humana entre leer y actuar">
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
      <text x="210" y="42" textAnchor="middle" fontSize="10.5" fill={TEAL}>pide tu aprobación acá</text>
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
