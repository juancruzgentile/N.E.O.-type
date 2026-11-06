// Banco de preguntas: se estudian con la respuesta a mano, con filtros y buscador.
import { useMemo, useState } from "react";
import { BANCO } from "../interview/bank/index";
import { AREAS, NIVELES, areaName } from "../interview/catalogo";
import type { Formato, Nivel, Pregunta } from "../interview/types";
import { FORMATOS, formatoName, hlDe } from "../interview/util";
import { IconSearch } from "./icons";
import { CodeBlock } from "./LibraryView";

const sinAcentos = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const POR_PAGINA = 30;

function Respuesta({ q }: { q: Pregunta }) {
  const correcta = q.formato === "codigo" ? q.respuestas?.join("  ·  ") : q.opciones?.[0];
  return (
    <div className="iv-answer">
      <p><strong>Respuesta:</strong> <span className="iv-answer-text">{correcta}</span></p>
      <p>{q.explica}</p>
      <p className="iv-src">
        Fuente: <a href={q.fuente} target="_blank" rel="noopener noreferrer">{new URL(q.fuente).hostname.replace(/^www\./, "")}</a>
      </p>
    </div>
  );
}

function Tarjeta({ q }: { q: Pregunta }) {
  const [ver, setVer] = useState(false);
  const nivel = NIVELES.find((n) => n.id === q.nivel)?.nombre;
  return (
    <article className="iv-card">
      <header className="iv-q-head">
        <span className="iv-tag">{areaName(q.area)}</span>
        <span className="iv-tag">{nivel}</span>
        <span className="iv-tag">{formatoName(q.formato)}</span>
      </header>
      <h4 className="iv-q-text">{q.texto}</h4>
      {q.codigo && <CodeBlock text={q.codigo} lang={hlDe(q)} />}
      {q.opciones && q.formato !== "codigo" && (
        <ul className="iv-bank-opts">
          {[...q.opciones].sort().map((o) => <li key={o}>{o}</li>)}
        </ul>
      )}
      <button className="btn small" aria-expanded={ver} onClick={() => setVer((v) => !v)}>
        {ver ? "Ocultar respuesta" : "Ver respuesta"}
      </button>
      {ver && <Respuesta q={q} />}
    </article>
  );
}

export function InterviewBank() {
  const [area, setArea] = useState("todas");
  const [nivel, setNivel] = useState<"todos" | Nivel>("todos");
  const [formato, setFormato] = useState<"todos" | Formato>("todos");
  const [busca, setBusca] = useState("");
  const [cant, setCant] = useState(POR_PAGINA);

  const lista = useMemo(() => {
    const t = sinAcentos(busca.trim());
    return BANCO.filter(
      (q) =>
        (area === "todas" || q.area === area) &&
        (nivel === "todos" || q.nivel === nivel) &&
        (formato === "todos" || q.formato === formato) &&
        (!t || sinAcentos(`${q.texto} ${q.codigo ?? ""} ${q.explica}`).includes(t)),
    );
  }, [area, nivel, formato, busca]);

  const filtro = (set: () => void) => () => {
    set();
    setCant(POR_PAGINA);
  };

  return (
    <div className="iv-bank">
      <div className="lib-search iv-search">
        <IconSearch size={20} />
        <input type="search" value={busca} onChange={(e) => (setBusca(e.target.value), setCant(POR_PAGINA))} placeholder="Buscar una pregunta o un concepto…" aria-label="Buscar preguntas" />
      </div>
      <div className="iv-filters">
        <label>Área
          <select value={area} onChange={(e) => (setArea(e.target.value), setCant(POR_PAGINA))}>
            <option value="todas">Todas ({BANCO.length})</option>
            {AREAS.map((a) => <option key={a.id} value={a.id}>{a.nombre} ({BANCO.filter((q) => q.area === a.id).length})</option>)}
          </select>
        </label>
        <div className="seg" role="group" aria-label="Nivel">
          <button className={nivel === "todos" ? "on" : ""} onClick={filtro(() => setNivel("todos"))}>Todos los niveles</button>
          {NIVELES.map((n) => <button key={n.id} className={nivel === n.id ? "on" : ""} onClick={filtro(() => setNivel(n.id))}>{n.nombre}</button>)}
        </div>
        <div className="seg" role="group" aria-label="Tipo de pregunta">
          <button className={formato === "todos" ? "on" : ""} onClick={filtro(() => setFormato("todos"))}>Todos los tipos</button>
          {FORMATOS.map((f) => <button key={f.id} className={formato === f.id ? "on" : ""} onClick={filtro(() => setFormato(f.id))}>{f.nombre}</button>)}
        </div>
      </div>
      <p className="iv-count" role="status">{lista.length} {lista.length === 1 ? "pregunta" : "preguntas"}</p>
      <div className="iv-list">
        {lista.slice(0, cant).map((q) => <Tarjeta key={q.id} q={q} />)}
      </div>
      {lista.length > cant && (
        <div className="iv-actions">
          <button className="btn" onClick={() => setCant((c) => c + POR_PAGINA)}>Mostrar más ({lista.length - cant})</button>
        </div>
      )}
    </div>
  );
}
