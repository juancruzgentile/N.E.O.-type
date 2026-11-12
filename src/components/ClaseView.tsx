import type { LangId } from "../types";
import type { Clase } from "../library/types";
import { ClaseDiagrama } from "./ClaseDiagramas";
import { CodeBlock, fechaLarga } from "./LibraryView";

const ALT: Record<string, string> = {
  neurona: "Esquema de una red neuronal con capa de entrada, capa oculta y salida",
  entrenamiento: "Curva de entrenamiento: el error bajando a medida que pasan las épocas",
  prompt: "Las cuatro partes de un buen prompt entrando al modelo",
  bucle: "El bucle de un agente: leer, actuar, verificar y repetir",
};

export function ClaseView({ clase, hl }: { clase: Clase; hl: LangId }) {
  return (
    <div className="clase">
      <h3 className="clase-titulo">{clase.titulo}</h3>
      <p className="clase-bajada">{clase.bajada}</p>
      {clase.secciones.map((s, i) => (
        <section key={s.heading} className="clase-seccion">
          <h4><span className="clase-num">{String(i + 1).padStart(2, "0")}</span> {s.heading}</h4>
          {s.parrafos.map((p, j) => <p key={j}>{p}</p>)}
          {s.lista && <ul>{s.lista.map((x, j) => <li key={j}>{x}</li>)}</ul>}
          {s.codigo?.map((c, j) => <CodeBlock key={j} text={c} lang={hl} />)}
          {s.tabla && (
            <div className="clase-tabla">
              <table>
                <thead><tr>{s.tabla.cabeza.map((h) => <th key={h}>{h}</th>)}</tr></thead>
                <tbody>{s.tabla.filas.map((f, j) => <tr key={j}>{f.map((c, k) => <td key={k}>{c}</td>)}</tr>)}</tbody>
              </table>
            </div>
          )}
          {s.diagrama && (
            <figure className="clase-figura">
              <ClaseDiagrama id={s.diagrama} />
              <figcaption>{ALT[s.diagrama]}</figcaption>
            </figure>
          )}
        </section>
      ))}
      {clase.fuentes && (
        <p className="lib-source clase-fuentes">
          {clase.fuentes.map((f) => <span key={f.url}>Fuente: <a href={f.url} target="_blank" rel="noopener noreferrer">{f.texto}</a></span>)}
          {clase.revisada && <span>Revisada: {fechaLarga(clase.revisada)}</span>}
        </p>
      )}
    </div>
  );
}
