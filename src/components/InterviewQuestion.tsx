// Una pregunta de entrevista. En práctica se corrige al instante y explica; en el examen solo registra la respuesta.
import { useEffect, useMemo, useRef, useState } from "react";
import { makeRng } from "../gen/base";
import { corregirCodigo, opcionesMezcladas } from "../interview/engine";
import type { Pregunta } from "../interview/types";
import { formatoName, hlDe } from "../interview/util";
import { NIVELES, areaName } from "../interview/catalogo";
import { CodeBlock } from "./LibraryView";

interface Props {
  q: Pregunta;
  modo: "practica" | "examen";
  /** semilla del orden de las opciones */
  seed: number;
  onDone: (r: { ok: boolean; ms: number }) => void;
  /** texto del botón al terminar la pregunta en práctica */
  siguiente?: string;
}

const LETRAS = "ABCDE";

export function InterviewQuestion({ q, modo, seed, onDone, siguiente = "Siguiente" }: Props) {
  const mez = useMemo(() => (q.opciones ? opcionesMezcladas(q, makeRng(seed)) : null), [q, seed]);
  const [sel, setSel] = useState<number | null>(null);
  const [texto, setTexto] = useState("");
  const [res, setRes] = useState<{ ok: boolean; aviso?: string; esperada?: string; ms: number } | null>(null);
  const t0 = useRef(Date.now());
  const inputRef = useRef<HTMLInputElement>(null);

  // el padre le pone una key distinta a cada pregunta, así que empieza de cero sin reiniciar nada a mano
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const resolver = (r: { ok: boolean; aviso?: string; esperada?: string }) => {
    const ms = Date.now() - t0.current;
    if (modo === "examen") onDone({ ok: r.ok, ms });
    else setRes({ ...r, ms });
  };
  const responder = (i: number | null = sel) => {
    if (res) return;
    if (q.formato === "codigo") return resolver(corregirCodigo(q, texto));
    if (i === null || !mez) return;
    setSel(i);
    resolver({ ok: i === mez.correcta });
  };
  const seguir = () => res && onDone({ ok: res.ok, ms: res.ms });

  // teclado: 1..5 elige, Enter confirma (en el examen) o sigue (en práctica, ya respondida)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement | null)?.tagName === "INPUT") return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      // un botón enfocado ya reacciona al Enter por su cuenta: no se cuenta dos veces
      if (e.key === "Enter" && (e.target as HTMLElement | null)?.tagName === "BUTTON") return;
      if (res && e.key === "Enter") {
        e.preventDefault();
        seguir();
        return;
      }
      if (!mez || res) return;
      const n = Number(e.key);
      if (n >= 1 && n <= mez.opciones.length) {
        e.preventDefault();
        if (modo === "practica") responder(n - 1);
        else setSel(n - 1);
      } else if (e.key === "Enter" && sel !== null) {
        e.preventDefault();
        responder(sel);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const nivel = NIVELES.find((n) => n.id === q.nivel)?.nombre ?? q.nivel;
  return (
    <article className="iv-q" aria-label="Pregunta">
      <header className="iv-q-head">
        <span className="iv-tag">{areaName(q.area)}</span>
        <span className="iv-tag">{nivel}</span>
        <span className="iv-tag">{formatoName(q.formato)}</span>
      </header>
      <h3 className="iv-q-text">{q.texto}</h3>
      {q.codigo && <CodeBlock text={q.codigo} lang={hlDe(q)} />}

      {mez && (
        <div className="iv-opts" role="group" aria-label="Opciones">
          {mez.opciones.map((o, i) => {
            const mostrar = !!res;
            const cls = ["iv-opt"];
            if (sel === i) cls.push("sel");
            if (mostrar && i === mez.correcta) cls.push("right");
            if (mostrar && sel === i && i !== mez.correcta) cls.push("wrong");
            return (
              <button key={i} className={cls.join(" ")} aria-pressed={sel === i} disabled={mostrar} onClick={() => (modo === "practica" ? responder(i) : setSel(i))}>
                <span className="iv-letter">{LETRAS[i]}</span>
                <span className="iv-opt-text">{o}</span>
              </button>
            );
          })}
        </div>
      )}

      {q.formato === "codigo" && (
        <div className="iv-code-in">
          <input
            ref={inputRef}
            className="iv-input"
            value={texto}
            disabled={!!res}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !res && texto.trim() && (e.preventDefault(), responder())}
            placeholder="Escribí tu respuesta"
            aria-label="Tu respuesta"
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
          />
        </div>
      )}

      {modo === "examen" && !res && (
        <div className="iv-actions">
          <button className="btn primary" disabled={q.formato === "codigo" ? !texto.trim() : sel === null} onClick={() => responder()}>
            Responder
          </button>
        </div>
      )}

      {res && (
        <div className={`iv-feedback ${res.ok ? "ok" : "no"}`} role="status">
          <strong>{res.ok ? (res.aviso ? "Bien, con un detalle" : "¡Bien!") : "No era esa"}</strong>
          {q.formato === "codigo" && (
            <p>
              {res.aviso && <span>{res.aviso}. </span>}
              {!res.ok || res.aviso ? <>Una respuesta válida: <code>{res.esperada}</code></> : null}
            </p>
          )}
          <p>{q.explica}</p>
          <p className="iv-src">
            Fuente: <a href={q.fuente} target="_blank" rel="noopener noreferrer">{new URL(q.fuente).hostname.replace(/^www\./, "")}</a>
          </p>
          <div className="iv-actions">
            <button className="btn primary" onClick={seguir} autoFocus>{siguiente}</button>
          </div>
        </div>
      )}
    </article>
  );
}
