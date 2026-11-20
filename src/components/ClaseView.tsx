import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from "react";
import type { LangId } from "../types";
import { tramos } from "../library/marcas";
import type { Captura, CapturaTramo, Clase } from "../library/types";
import { ClaseDiagrama } from "../anim";
import { CodeBlock, fechaLarga } from "./CodeBlock";
import { IconChevron } from "./icons";
import { writeHash } from "../route";

const ALT: Record<string, string> = {
  neurona: "Una neurona paso a paso (entradas por pesos, suma, sesgo y activación) y después la señal pasando por la red",
  entrenamiento: "Entrenamiento: la red responde, mide el error, lo manda hacia atrás y corrige los pesos, época por época",
  prompt: "Las cuatro partes de un buen prompt entrando al modelo",
  bucle: "El bucle de un agente: leer, actuar, verificar y repetir",
};

/** Marca simple del texto de las clases: **concepto clave** y `código en línea`. */
export function Rico({ text }: { text: string }): ReactNode {
  return tramos(text).map((x, i) =>
    x.tipo === "clave" ? <strong key={i} className="clase-clave">{x.t}</strong>
    : x.tipo === "cod" ? <code key={i} className="clase-cod">{x.t}</code>
    : x.t,
  );
}

const Linea = ({ l }: { l: CapturaTramo[] }) => (
  <div className="cap-linea">{l.length ? l.map((x, i) => <span key={i} className={x.c ? `cap-${x.c}` : undefined}>{x.t}</span>) : "\u00a0"}</div>
);

/** Cómo se ve una herramienta, recreado con texto: una terminal o los paneles de una app. El texto queda a la vista del lector de pantalla, línea por línea. */
function CapturaVista({ c }: { c: Captura }) {
  return (
    <figure className="clase-figura">
      <div className={`captura captura-${c.tipo}`}>
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

/**
 * La clase con su índice "En esta clase": marca la sección que estás leyendo y la deja en la URL (base + "/3").
 * `irA` (1, 2…) es la sección a la que hay que llevar al lector, por ejemplo al abrir un enlace.
 */
export function ClaseView({ clase, hl, color, base, irA }: { clase: Clase; hl: LangId; color: string; base: string; irA?: number }) {
  const [actual, setActual] = useState(0);
  const [abierto, setAbierto] = useState(false);
  const raiz = useRef<HTMLDivElement>(null);
  const n = clase.secciones.length;

  const ir = (i: number) => {
    setAbierto(false);
    raiz.current?.querySelector(`#clase-${i + 1}`)?.scrollIntoView({ block: "start" });
  };
  useEffect(() => {
    if (irA && Number.isInteger(irA) && irA >= 1 && irA <= n) ir(irA - 1);
  }, [irA, n]);

  // la sección actual es la primera que cruza la franja de arriba de la pantalla
  useEffect(() => {
    const secciones = [...(raiz.current?.querySelectorAll<HTMLElement>(".clase-seccion") ?? [])];
    const visibles = new Set<number>();
    const io = new IntersectionObserver((entradas) => {
      for (const e of entradas) {
        const i = secciones.indexOf(e.target as HTMLElement);
        if (e.isIntersecting) visibles.add(i); else visibles.delete(i);
      }
      if (visibles.size) setActual(Math.min(...visibles));
    }, { rootMargin: "-70px 0px -60% 0px" }); // debajo de la barra fija, en el tercio de arriba
    secciones.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [clase]);
  const primera = useRef(true);
  useEffect(() => {
    // la primera vez no: abrir la clase sin sección no tiene que cambiar la URL
    if (primera.current) { primera.current = false; return; }
    writeHash(`${base}/${actual + 1}`, true);
  }, [actual, base]);

  return (
    <div className="clase-layout" ref={raiz}>
    <nav className="clase-indice" aria-label="En esta clase">
      <button className="clase-indice-boton" aria-expanded={abierto} aria-controls="clase-indice-lista" onClick={() => setAbierto((a) => !a)}>
        <IconChevron size={14} /> En esta clase <span className="clase-indice-pos">{actual + 1} de {n}</span>
      </button>
      <div className="clase-indice-titulo">En esta clase</div>
      <ol id="clase-indice-lista" className={abierto ? "abierto" : ""}>
        {clase.secciones.map((s, i) => (
          <li key={s.heading}>
            <a href={`${base}/${i + 1}`} aria-current={i === actual ? "location" : undefined} onClick={(e) => { e.preventDefault(); ir(i); }}>
              {s.heading}
            </a>
          </li>
        ))}
      </ol>
    </nav>
    <div className="clase" style={{ "--lc": color } as CSSProperties}>
      <h3 className="clase-titulo">{clase.titulo}</h3>
      <p className="clase-bajada"><Rico text={clase.bajada} /></p>
      {clase.secciones.map((s, i) => (
        <section key={s.heading} id={`clase-${i + 1}`} className="clase-seccion">
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
    </div>
  );
}
