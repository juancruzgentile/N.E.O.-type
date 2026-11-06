// Entrevista simulada: se siente como una entrevista de verdad. Hay reloj, no hay pistas, no se puede volver atrás
// y la corrección llega recién al final, en un informe.
import { useEffect, useMemo, useRef, useState } from "react";
import { makeRng } from "../gen/base";
import { BANCO } from "../interview/bank/index";
import { LANG_AREAS, NIVELES, PUESTOS, areaName } from "../interview/catalogo";
import { anotarRepaso, armarEntrevista, resultadoDe } from "../interview/engine";
import type { Nivel, Opciones, Pregunta, Respuesta, Resultado } from "../interview/types";
import { fechaCorta, mmss } from "../interview/util";
import type { AppState, InterviewRecord } from "../types";
import { today } from "../store";
import { ConfirmDialog } from "./ConfirmDialog";
import { InterviewQuestion } from "./InterviewQuestion";

interface Props {
  state: AppState;
  update: (fn: (s: AppState) => AppState) => void;
  /** hay una entrevista en curso: la app pide confirmar antes de salir */
  onLive: (live: boolean) => void;
  /** pasar a repasar estas preguntas (las falladas del informe) */
  onRepasar: (preguntas: Pregunta[]) => void;
}

const DURACIONES: (15 | 30 | 45)[] = [15, 30, 45];
const MAX_GUARDADAS = 50;

/** Lo que dice el entrevistador antes de cada pregunta: no adelanta si la anterior estuvo bien o mal. */
function entrevistador(prev: Pregunta | null, q: Pregunta, i: number, total: number, lang: string): string {
  const base = (() => {
    if (i === 0) return "Hola, gracias por venir. Vamos a empezar con algo para conocerte.";
    if (i === total - 1) return "Para cerrar, una última pregunta.";
    if (!prev || prev.area !== q.area) return q.area === lang ? `Ahora hablemos de ${areaName(q.area)}.` : `Cambiemos de tema: ${areaName(q.area)}.`;
    return ["Bien, sigamos.", "Gracias. Vamos con otra.", "Perfecto. Siguiente pregunta."][i % 3];
  })();
  const extra =
    q.formato === "codigo" ? " Escribí la respuesta como si la tipearas en el editor." :
    q.formato === "salida" ? " Mirá este código y decime qué imprime." :
    q.formato === "error" ? " Mirá este código: algo no está bien." : "";
  return base + extra;
}

const VEREDICTO: Record<Resultado["veredicto"], string> = {
  aprobado: "Aprobado. Se nota que dominás los temas: seguirías a la siguiente etapa.",
  casi: "Casi. Hay temas para reforzar antes de una entrevista real.",
  reforzar: "Todavía te falta práctica en varios temas. Repasá las que fallaste y probá de nuevo.",
};

export function InterviewExam({ state, update, onLive, onRepasar }: Props) {
  const [fase, setFase] = useState<"inicio" | "vivo" | "informe">("inicio");
  const [puesto, setPuesto] = useState("backend");
  const [lang, setLang] = useState<string>(LANG_AREAS.some((a) => a.id === state.lang) ? state.lang! : "python");
  const [nivel, setNivel] = useState<Nivel>("junior");
  const [minutos, setMinutos] = useState<15 | 30 | 45>(15);
  const [plan, setPlan] = useState<Pregunta[]>([]);
  const [i, setI] = useState(0);
  const [resp, setResp] = useState<Respuesta[]>([]);
  const [t0, setT0] = useState(0);
  const [ahora, setAhora] = useState(0);
  const [pregunta, setPregunta] = useState(false);
  const [informe, setInforme] = useState<{ r: Resultado; ms: number; falladas: Pregunta[]; opciones: Opciones } | null>(null);
  const cerrada = useRef(false);

  const total = minutos * 60_000;
  const restante = Math.max(0, total - (ahora - t0));

  const terminar = (respuestas: Respuesta[], pl: Pregunta[], opc: Opciones, inicio: number) => {
    if (cerrada.current) return;
    cerrada.current = true;
    // lo que no se alcanzó a responder cuenta como no respondido
    const completas: Respuesta[] = [...respuestas, ...pl.slice(respuestas.length).map((q) => ({ id: q.id, ok: false, ms: 0, vacia: true }))];
    const r = resultadoDe(completas, BANCO);
    const ms = Math.min(Date.now() - inicio, opc.minutos * 60_000);
    const ts = Date.now();
    const rec: InterviewRecord = {
      ts, puesto: opc.puesto, lang: opc.lang, nivel: opc.nivel, minutos: opc.minutos, ms,
      ok: r.ok, total: r.total,
      areas: Object.fromEntries(r.porArea.map((a) => [a.area, [a.ok, a.total] as [number, number]])),
    };
    update((s) => {
      const todas = { ...s.interviews, [`i${ts}`]: rec };
      const claves = Object.keys(todas).sort();
      for (const k of claves.slice(0, Math.max(0, claves.length - MAX_GUARDADAS))) delete todas[k];
      let rev = s.interviewReview;
      completas.forEach((c) => (rev = anotarRepaso(rev, c.id, c.ok, today())));
      return { ...s, interviews: todas, interviewReview: rev };
    });
    setInforme({ r, ms, falladas: completas.filter((c) => !c.ok).map((c) => BANCO.find((q) => q.id === c.id)!).filter(Boolean), opciones: opc });
    setFase("informe");
    onLive(false);
  };

  const empezar = () => {
    const opc: Opciones = { puesto, lang, nivel, minutos };
    const pl = armarEntrevista(opc, BANCO, makeRng(Date.now()));
    cerrada.current = false;
    setPlan(pl);
    setI(0);
    setResp([]);
    const inicio = Date.now();
    setT0(inicio);
    setAhora(inicio);
    setInforme(null);
    setFase("vivo");
    onLive(true);
  };

  // reloj: al llegar a cero la entrevista termina sola
  useEffect(() => {
    if (fase !== "vivo") return;
    const id = setInterval(() => setAhora(Date.now()), 500);
    return () => clearInterval(id);
  }, [fase]);
  useEffect(() => {
    if (fase === "vivo" && ahora - t0 >= total) terminar(resp, plan, { puesto, lang, nivel, minutos }, t0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ahora, fase]);
  // si se sale de la pantalla a mitad de camino, el aviso de "entrevista en curso" se apaga
  useEffect(() => () => onLive(false), [onLive]);

  const responder = (r: { ok: boolean; ms: number }) => {
    const q = plan[i];
    const nuevas = [...resp, { id: q.id, ok: r.ok, ms: r.ms }];
    setResp(nuevas);
    if (i + 1 >= plan.length) terminar(nuevas, plan, { puesto, lang, nivel, minutos }, t0);
    else setI(i + 1);
  };

  const historial = useMemo(
    () => Object.values(state.interviews).sort((a, b) => b.ts - a.ts),
    [state.interviews],
  );
  const mejor = historial.length ? Math.max(...historial.map((h) => Math.round((h.ok / h.total) * 100))) : null;

  if (fase === "vivo" && plan[i]) {
    const q = plan[i];
    const poco = restante < 60_000;
    return (
      <div className="iv-live">
        <div className="iv-live-head" role="status">
          <span>Pregunta {i + 1} de {plan.length}</span>
          <span className={`iv-timer ${poco ? "low" : ""}`} aria-label="Tiempo restante">{mmss(restante)}</span>
          <button className="btn small danger" onClick={() => setPregunta(true)}>Terminar ahora</button>
        </div>
        <div className="progress"><span style={{ width: `${(i / plan.length) * 100}%` }} /></div>
        <p className="iv-says"><span className="iv-who">Quien entrevista</span>{entrevistador(i ? plan[i - 1] : null, q, i, plan.length, lang)}</p>
        <InterviewQuestion key={`${q.id}-${i}`} q={q} modo="examen" seed={t0 + i} onDone={responder} />
        {pregunta && (
          <ConfirmDialog
            kicker="Entrevista en curso"
            title="¿Terminar la entrevista ahora?"
            message="Las preguntas que no respondiste cuentan como no respondidas. Se guarda el resultado."
            confirmLabel="Sí, terminar"
            cancelLabel="Seguir"
            onConfirm={() => (setPregunta(false), terminar(resp, plan, { puesto, lang, nivel, minutos }, t0))}
            onCancel={() => setPregunta(false)}
          />
        )}
      </div>
    );
  }

  if (fase === "informe" && informe) {
    const { r, ms, falladas, opciones } = informe;
    return (
      <div className="iv-report">
        <p className="iv-hint">{PUESTOS.find((p) => p.id === opciones.puesto)?.nombre} · {areaName(opciones.lang)} · {NIVELES.find((n) => n.id === opciones.nivel)?.nombre} · {opciones.minutos} min</p>
        <h3 className="iv-big">Nota {r.nota.toFixed(1)} sobre 10</h3>
        <p className={`iv-verdict ${r.veredicto}`}>{VEREDICTO[r.veredicto]}</p>
        <p>{r.ok} de {r.total} bien · tardaste {mmss(ms)}</p>
        <h4>Por área</h4>
        <ul className="iv-areas">
          {r.porArea.map((a) => (
            <li key={a.area}>
              <span>{areaName(a.area)}</span>
              <div className="progress"><span style={{ width: `${(a.ok / a.total) * 100}%` }} /></div>
              <span className="iv-n">{a.ok}/{a.total}</span>
            </li>
          ))}
        </ul>
        {falladas.length > 0 && (
          <>
            <h4>Para repasar ({falladas.length})</h4>
            <ul className="iv-failed">
              {falladas.map((q) => (
                <li key={q.id}>
                  <strong>{q.texto}</strong>
                  <span className="iv-answer-text">{q.formato === "codigo" ? q.respuestas?.[0] : q.opciones?.[0]}</span>
                  <span>{q.explica}</span>
                </li>
              ))}
            </ul>
            <p className="iv-hint">Quedaron en tu repaso: vuelven mañana, y cada vez más espaciadas si las vas acertando.</p>
          </>
        )}
        <div className="iv-actions">
          {falladas.length > 0 && <button className="btn primary" onClick={() => onRepasar(falladas)}>Repasar las falladas</button>}
          <button className="btn" onClick={() => setFase("inicio")}>Otra entrevista</button>
        </div>
      </div>
    );
  }

  return (
    <div className="iv-setup">
      <section className="iv-box">
        <h3>Armá tu entrevista</h3>
        <p>Preguntas de distintas áreas, con reloj y sin pistas. No se puede volver atrás y la corrección llega al final, en un informe.</p>
        <p className="iv-label">Puesto</p>
        <div className="iv-puestos" role="group" aria-label="Puesto">
          {PUESTOS.map((p) => (
            <button key={p.id} className={`iv-puesto ${puesto === p.id ? "on" : ""}`} aria-pressed={puesto === p.id} onClick={() => setPuesto(p.id)}>
              <strong>{p.nombre}</strong>
              <span>{p.desc}</span>
            </button>
          ))}
        </div>
        <p className="iv-label">Lenguaje</p>
        <div className="seg" role="group" aria-label="Lenguaje">
          {LANG_AREAS.map((a) => <button key={a.id} className={lang === a.id ? "on" : ""} aria-pressed={lang === a.id} onClick={() => setLang(a.id)}>{a.nombre}</button>)}
        </div>
        <p className="iv-label">Nivel</p>
        <div className="seg" role="group" aria-label="Nivel">
          {NIVELES.map((n) => <button key={n.id} className={nivel === n.id ? "on" : ""} aria-pressed={nivel === n.id} onClick={() => setNivel(n.id)}>{n.nombre}</button>)}
        </div>
        <p className="iv-label">Duración</p>
        <div className="seg" role="group" aria-label="Duración">
          {DURACIONES.map((d) => <button key={d} className={minutos === d ? "on" : ""} aria-pressed={minutos === d} onClick={() => setMinutos(d)}>{d} minutos</button>)}
        </div>
        <div className="iv-actions">
          <button className="btn primary" onClick={empezar}>Empezar la entrevista</button>
        </div>
      </section>

      {historial.length > 0 && (
        <section className="iv-box">
          <h3>Tus entrevistas</h3>
          <p>Mejor resultado: {mejor}%. Últimas:</p>
          <ul className="iv-history">
            {historial.slice(0, 6).map((h) => (
              <li key={h.ts}>
                <span>{fechaCorta(h.ts)}</span>
                <span>{PUESTOS.find((p) => p.id === h.puesto)?.nombre} · {areaName(h.lang)} · {NIVELES.find((n) => n.id === h.nivel)?.nombre}</span>
                <strong>{((h.ok / h.total) * 10).toFixed(1)}</strong>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
