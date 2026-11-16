/**
 * Animaciones y diagramas de las clases: SVG en línea, sin librerías ni imágenes externas (así no se rompe la CSP
 * ni hace falta red). Cada dibujo vive en el archivo de su tema y se registra acá una sola vez; una clase lo pide
 * por su id. Para reusar uno en otro tema se pide el mismo id, nunca se copia.
 */
import type { ReactNode } from "react";
import type { DiagramaId } from "../library/types";
import { BucleDiagrama, EntrenamientoDiagrama, NeuronaDiagrama, PromptDiagrama } from "./ia";

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
