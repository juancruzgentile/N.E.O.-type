// Practicar preguntas de entrevista con corrección al instante. Lo que se falla entra al repaso espaciado.
import { useEffect, useMemo, useState } from "react";
import { makeRng } from "../gen/base";
import { BANCO } from "../interview/bank/index";
import { AREAS, NIVELES } from "../interview/catalogo";
import { anotarRepaso, mezclar, repasoPendiente } from "../interview/engine";
import type { Formato, Nivel, Pregunta } from "../interview/types";
import { FORMATOS } from "../interview/util";
import type { AppState } from "../types";
import { today } from "../store";
import { InterviewQuestion } from "./InterviewQuestion";

interface Props {
  state: AppState;
  update: (fn: (s: AppState) => AppState) => void;
  /** abrir directo una sesión de repaso con estas preguntas (por ejemplo, las falladas de una entrevista) */
  empezarCon?: Pregunta[];
}

const CANTIDADES = [5, 10, 20];

export function InterviewPractice({ state, update, empezarCon }: Props) {
  const areaInicial = AREAS.some((a) => a.id === state.lang) ? state.lang! : "python";
  const [areas, setAreas] = useState<string[]>([areaInicial]);
  const [nivel, setNivel] = useState<"todos" | Nivel>("todos");
  const [formato, setFormato] = useState<"todos" | Formato>("todos");
  const [cant, setCant] = useState(10);
  const [sesion, setSesion] = useState<{ lista: Pregunta[]; i: number; ok: number; falladas: Pregunta[]; repaso: boolean; seed: number } | null>(null);
  const [aviso, setAviso] = useState("");

  const dia = today();
  const pendientes = useMemo(() => repasoPendiente(state.interviewReview, BANCO, dia), [state.interviewReview, dia]);
  const enRepaso = useMemo(() => BANCO.filter((q) => state.interviewReview[q.id]).length, [state.interviewReview]);

  const empezar = (lista: Pregunta[], repaso: boolean) => {
    if (!lista.length) {
      setAviso("No hay preguntas con esos filtros. Probá con otra área o nivel.");
      return;
    }
    setAviso("");
    setSesion({ lista, i: 0, ok: 0, falladas: [], repaso, seed: Date.now() });
  };
  const practicar = () => {
    const rng = makeRng(Date.now());
    const pool = BANCO.filter((q) => areas.includes(q.area) && (nivel === "todos" || q.nivel === nivel) && (formato === "todos" || q.formato === formato));
    empezar(mezclar(pool, rng).slice(0, cant), false);
  };
  const repasar = () => empezar(mezclar(pendientes, makeRng(Date.now())).slice(0, 20), true);

  // venir desde el informe de una entrevista: abre el repaso una sola vez
  useEffect(() => {
    if (empezarCon?.length) empezar(empezarCon, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // el intento se guarda apenas se corrige: terminar o cambiar de pestaña sin pulsar Siguiente no lo pierde
  const onAnswered = (r: { ok: boolean }) => {
    if (!sesion) return;
    const q = sesion.lista[sesion.i];
    update((s) => ({ ...s, interviewReview: anotarRepaso(s.interviewReview, q.id, r.ok, today()) }));
    setSesion((c) => c && { ...c, ok: c.ok + (r.ok ? 1 : 0), falladas: r.ok ? c.falladas : [...c.falladas, q] });
  };
  const onDone = () => setSesion((c) => c && { ...c, i: c.i + 1, seed: Date.now() });

  if (sesion && sesion.i < sesion.lista.length) {
    const q = sesion.lista[sesion.i];
    const ultima = sesion.i === sesion.lista.length - 1;
    return (
      <div className="iv-run">
        <div className="iv-progress" role="status">
          <span>{sesion.repaso ? "Repaso" : "Práctica"} · pregunta {sesion.i + 1} de {sesion.lista.length}</span>
          <div className="progress"><span style={{ width: `${(sesion.i / sesion.lista.length) * 100}%` }} /></div>
          <button className="btn small" onClick={() => setSesion(null)}>Terminar</button>
        </div>
        <InterviewQuestion key={`${q.id}-${sesion.i}`} q={q} modo="practica" seed={sesion.seed + sesion.i} onDone={onDone} onAnswered={onAnswered} siguiente={ultima ? "Ver resultado" : "Siguiente"} />
      </div>
    );
  }

  if (sesion) {
    const pct = Math.round((sesion.ok / sesion.lista.length) * 100);
    return (
      <div className="iv-done">
        <h3 className="iv-big">{sesion.ok} de {sesion.lista.length} bien · {pct}%</h3>
        {sesion.falladas.length ? (
          <>
            <p>Estas {sesion.falladas.length === 1 ? "quedó" : "quedaron"} en tu repaso y {sesion.falladas.length === 1 ? "vuelve" : "vuelven"} mañana:</p>
            <ul className="iv-failed">
              {sesion.falladas.map((q) => (
                <li key={q.id}><strong>{q.texto}</strong><span className="iv-answer-text">{q.formato === "codigo" ? q.respuestas?.[0] : q.opciones?.[0]}</span></li>
              ))}
            </ul>
          </>
        ) : (
          <p>Sin errores. Las que ya estaban en tu repaso suben de caja y tardan más en volver.</p>
        )}
        <div className="iv-actions">
          <button className="btn primary" onClick={() => setSesion(null)}>Volver a practicar</button>
        </div>
      </div>
    );
  }

  const alternar = (id: string) => setAreas((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));
  return (
    <div className="iv-setup">
      <section className="iv-box">
        <h3>Repaso de lo que fallaste</h3>
        <p>
          {enRepaso === 0
            ? "Todavía no hay preguntas en tu repaso. Las que falles al practicar o en una entrevista aparecen acá y vuelven cada vez más espaciadas."
            : `${enRepaso} en repaso · ${pendientes.length} ${pendientes.length === 1 ? "toca" : "tocan"} hoy.`}
        </p>
        <button className="btn primary" disabled={!pendientes.length} onClick={repasar}>Repasar las de hoy</button>
      </section>

      <section className="iv-box">
        <h3>Practicar</h3>
        <p className="iv-label">Áreas</p>
        <div className="seg" role="group" aria-label="Áreas">
          {AREAS.map((a) => <button key={a.id} className={areas.includes(a.id) ? "on" : ""} aria-pressed={areas.includes(a.id)} onClick={() => alternar(a.id)}>{a.nombre}</button>)}
        </div>
        <p className="iv-label">Nivel</p>
        <div className="seg" role="group" aria-label="Nivel">
          <button className={nivel === "todos" ? "on" : ""} onClick={() => setNivel("todos")}>Todos</button>
          {NIVELES.map((n) => <button key={n.id} className={nivel === n.id ? "on" : ""} onClick={() => setNivel(n.id)}>{n.nombre}</button>)}
        </div>
        <p className="iv-label">Tipo de pregunta</p>
        <div className="seg" role="group" aria-label="Tipo de pregunta">
          <button className={formato === "todos" ? "on" : ""} onClick={() => setFormato("todos")}>Todos</button>
          {FORMATOS.map((f) => <button key={f.id} className={formato === f.id ? "on" : ""} onClick={() => setFormato(f.id)}>{f.nombre}</button>)}
        </div>
        <p className="iv-label">Cantidad</p>
        <div className="seg" role="group" aria-label="Cantidad">
          {CANTIDADES.map((n) => <button key={n} className={cant === n ? "on" : ""} onClick={() => setCant(n)}>{n}</button>)}
        </div>
        <div className="iv-actions">
          <button className="btn primary" disabled={!areas.length} onClick={practicar}>Empezar a practicar</button>
          {!areas.length && <span className="iv-hint">Elegí al menos un área</span>}
        </div>
        {aviso && <p className="iv-hint" role="status">{aviso}</p>}
      </section>
    </div>
  );
}
