// Entrevistas: banco de preguntas para estudiar, práctica con corrección y entrevista simulada.
import { useCallback, useState } from "react";
import type { AppState } from "../types";
import { BANCO } from "../interview/bank/index";
import type { Pregunta } from "../interview/types";
import { InterviewBank } from "./InterviewBank";
import { InterviewExam } from "./InterviewExam";
import { InterviewPractice } from "./InterviewPractice";

interface Props {
  state: AppState;
  update: (fn: (s: AppState) => AppState) => void;
  /** hay una entrevista en curso (la app pide confirmar antes de salir) */
  onBusy: (busy: boolean) => void;
}

type Tab = "entrevista" | "practicar" | "banco";
const TABS: { id: Tab; nombre: string }[] = [
  { id: "entrevista", nombre: "Entrevista simulada" },
  { id: "practicar", nombre: "Practicar" },
  { id: "banco", nombre: "Banco de preguntas" },
];

export function InterviewView({ state, update, onBusy }: Props) {
  const [tab, setTab] = useState<Tab>("entrevista");
  const [vivo, setVivo] = useState(false);
  const [repaso, setRepaso] = useState<{ n: number; preguntas: Pregunta[] } | null>(null);
  const onLive = useCallback((v: boolean) => {
    setVivo(v);
    onBusy(v);
  }, [onBusy]);

  return (
    <div className="frame view iv">
      <h2>Entrevistas</h2>
      {!vivo && (
        <>
          <div className="sub">
            {BANCO.length} preguntas para prepararte. Estudialas en el banco, practicalas con corrección al instante o ponete a prueba con una entrevista simulada.
          </div>
          <div className="seg iv-tabs" role="tablist" aria-label="Entrevistas">
            {TABS.map((t) => (
              <button key={t.id} role="tab" aria-selected={tab === t.id} className={tab === t.id ? "on" : ""} onClick={() => setTab(t.id)}>{t.nombre}</button>
            ))}
          </div>
        </>
      )}
      {tab === "entrevista" && (
        <InterviewExam state={state} update={update} onLive={onLive} onRepasar={(preguntas) => { setRepaso((r) => ({ n: (r?.n ?? 0) + 1, preguntas })); setTab("practicar"); }} />
      )}
      {tab === "practicar" && <InterviewPractice key={repaso?.n ?? 0} state={state} update={update} empezarCon={repaso?.preguntas} />}
      {tab === "banco" && <InterviewBank />}
    </div>
  );
}
