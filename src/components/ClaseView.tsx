import type { Clase } from "../library/types";
import { ClaseDiagrama } from "./ClaseDiagramas";

const ALT: Record<string, string> = {
  neurona: "Esquema de una red neuronal con capa de entrada, capa oculta y salida",
  entrenamiento: "Curva de entrenamiento: el error bajando a medida que pasan las épocas",
  prompt: "Las cuatro partes de un buen prompt entrando al modelo",
  bucle: "El bucle de un agente: leer, actuar, verificar y repetir",
};

export function ClaseView({ clase }: { clase: Clase }) {
  return (
    <div className="clase">
      <h3 className="clase-titulo">{clase.titulo}</h3>
      <p className="clase-bajada">{clase.bajada}</p>
      {clase.secciones.map((s, i) => (
        <section key={s.heading} className="clase-seccion">
          <h4><span className="clase-num">{String(i + 1).padStart(2, "0")}</span> {s.heading}</h4>
          {s.parrafos.map((p, j) => <p key={j}>{p}</p>)}
          {s.diagrama && (
            <figure className="clase-figura">
              <ClaseDiagrama id={s.diagrama} />
              <figcaption>{ALT[s.diagrama]}</figcaption>
            </figure>
          )}
        </section>
      ))}
    </div>
  );
}
