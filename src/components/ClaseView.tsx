import type { CSSProperties, ReactNode } from "react";
import type { LangId } from "../types";
import type { Captura, CapturaTramo, Clase } from "../library/types";
import { ClaseDiagrama } from "./ClaseDiagramas";
import { CodeBlock, fechaLarga } from "./LibraryView";

const ALT: Record<string, string> = {
  neurona: "Esquema de una red neuronal con capa de entrada, capa oculta y salida",
  entrenamiento: "Curva de entrenamiento: el error bajando a medida que pasan las épocas",
  prompt: "Las cuatro partes de un buen prompt entrando al modelo",
  bucle: "El bucle de un agente: leer, actuar, verificar y repetir",
};

/** Marca simple del texto de las clases: **concepto clave** y `código en línea`. */
export function Rico({ text }: { text: string }): ReactNode {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/).map((t, i) =>
    t.startsWith("**") ? <strong key={i} className="clase-clave">{t.slice(2, -2)}</strong>
    : t.startsWith("`") ? <code key={i} className="clase-cod">{t.slice(1, -1)}</code>
    : t,
  );
}

const Linea = ({ l }: { l: CapturaTramo[] }) => (
  <div className="cap-linea">{l.length ? l.map((x, i) => <span key={i} className={x.c ? `cap-${x.c}` : undefined}>{x.t}</span>) : "\u00a0"}</div>
);

/** Cómo se ve una herramienta, recreado con texto: una terminal o los paneles de una app. */
function CapturaVista({ c }: { c: Captura }) {
  return (
    <figure className="clase-figura">
      <div className={`captura captura-${c.tipo}`} role="img" aria-label={c.pie}>
        <div className="cap-barra" aria-hidden="true"><i /><i /><i /><span>{c.titulo}</span></div>
        {c.tipo === "terminal" ? (
          <div className="cap-term">{c.lineas?.map((l, i) => <Linea key={i} l={l} />)}</div>
        ) : (
          <div className="cap-app">
            {c.paneles?.map((p) => (
              <div key={p.nombre} className="cap-panel" style={{ flex: p.ancho ?? 1 }}>
                <div className="cap-panel-nombre">{p.nombre}</div>
                {p.lineas.map((l, i) => <Linea key={i} l={l} />)}
              </div>
            ))}
          </div>
        )}
      </div>
      <figcaption>{c.pie}</figcaption>
    </figure>
  );
}

export function ClaseView({ clase, hl, color }: { clase: Clase; hl: LangId; color: string }) {
  return (
    <div className="clase" style={{ "--lc": color } as CSSProperties}>
      <h3 className="clase-titulo">{clase.titulo}</h3>
      <p className="clase-bajada"><Rico text={clase.bajada} /></p>
      {clase.secciones.map((s, i) => (
        <section key={s.heading} className="clase-seccion">
          <h4><span className="clase-num">{String(i + 1).padStart(2, "0")}</span> {s.heading}</h4>
          {s.parrafos.map((p, j) => <p key={j}><Rico text={p} /></p>)}
          {s.lista && <ul>{s.lista.map((x, j) => <li key={j}><Rico text={x} /></li>)}</ul>}
          {s.codigo?.map((c, j) => (typeof c === "string" ? <CodeBlock key={j} text={c} lang={hl} /> : <CodeBlock key={j} text={c.text} lang={c.lang} />))}
          {s.tabla && (
            <div className="clase-tabla">
              <table>
                <thead><tr>{s.tabla.cabeza.map((h) => <th key={h}>{h}</th>)}</tr></thead>
                <tbody>{s.tabla.filas.map((f, j) => <tr key={j}>{f.map((c, k) => <td key={k}><Rico text={c} /></td>)}</tr>)}</tbody>
              </table>
            </div>
          )}
          {s.captura && <CapturaVista c={s.captura} />}
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
