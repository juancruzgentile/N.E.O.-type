import { type CSSProperties } from "react";
import type { AppState, LangId } from "../types";
import { LANGS } from "../data/curriculum";
import type { Challenge } from "./PracticeView";
import { PROJECTS, formatTime, projectLines, projectUnlocked, requiredNum } from "../projects/projects";
import { IconLock } from "./icons";
import { RECALL, levelDone, levelOpen } from "../recall/exercises";
import { CATALOGO } from "../library/catalogo.gen";
import { SHORTCUT_SETS, levelDone as scLevelDone, levelOpen as scLevelOpen } from "../shortcuts/exercises";
import { TAUGHT_ONLY } from "../shortcuts/vscode";

interface ChallengesProps {
  state: AppState;
  lang: LangId;
  onStart: (c: Challenge) => void;
  onProject: (id: string) => void;
  onRecall: (topic: string, level: number) => void;
  onShortcut: (set: string, level: number) => void;
}

export function ChallengesView({ state, lang, onStart, onProject, onRecall, onShortcut }: ChallengesProps) {
  const items: { c: Challenge; title: string; desc: string }[] = [
    { c: { kind: "sprint", seconds: 30 }, title: "Sprint 30 s", desc: "Escribí todo el código que puedas en 30 segundos. Todos los símbolos habilitados." },
    { c: { kind: "sprint", seconds: 60 }, title: "Sprint 60 s", desc: "El clásico test de un minuto, pero con funciones reales del lenguaje." },
    { c: { kind: "sprint", seconds: 120 }, title: "Sprint 120 s", desc: "Resistencia: dos minutos sin parar." },
    { c: { kind: "perfect" }, title: "Precisión perfecta", desc: "Una función completa sin ningún error. Si te equivocás, vuelve a empezar." },
  ];
  return (
    <div className="frame view">
      <h2>Desafíos · {LANGS[lang].name}</h2>
      <div className="sub">Los desafíos usan todos los símbolos del lenguaje, sin importar tu nivel. También suman a tus estadísticas.</div>
      <div className="cards">
        {items.map(({ c, title, desc }) => {
          const key = `${lang}:${c.kind === "sprint" ? `sprint${c.seconds}` : "perfect"}`;
          const rec = state.challenges[key];
          return (
            <div key={key} className="challenge">
              <h3>{title}</h3>
              <p>{desc}</p>
              <div className="rec">{rec ? `Récord: ${Math.round(rec.wpm)} WPM · ${(rec.acc * 100).toFixed(0)}%` : "Sin récord todavía"}</div>
              <button className="btn" onClick={() => onStart(c)}>Empezar</button>
            </div>
          );
        })}
      </div>

      <div className="section" id="proyectos">Proyectos</div>
      <div className="sub">
        Veintiún programas completos para escribir de punta a punta, en el menor tiempo posible. Acá las sangrías no se
        saltan: se escriben con Tab o con espacios, como en un editor. Cada proyecto se desbloquea al terminar el
        anterior, y el último junta varios lenguajes en una aplicación entera. Los errores no avanzan y el reloj solo
        corre mientras escribís.
      </div>
      <div className="projects">
        {PROJECTS.map((p, i) => {
          const rec = state.projects[p.id];
          const open = projectUnlocked(state.projects, i);
          return (
            <div key={p.id} className={`project-card ${open ? "" : "locked"} ${rec ? "done" : ""}`}>
              <div className="pc-num">{String(p.num).padStart(2, "0")}</div>
              <div className="pc-body">
                <div className="pc-head">
                  <h3>{p.title}</h3>
                  <span className="pc-level">{p.level}</span>
                </div>
                <p>{p.desc}</p>
                <div className="pc-stack">{p.stack.map((t) => <span key={t}>{t}</span>)}</div>
                <div className="pc-meta">
                  {p.files.length} {p.files.length === 1 ? "archivo" : "archivos"} · {projectLines(p)} líneas · practicás {p.skills}
                </div>
              </div>
              <div className="pc-side">
                {open ? (
                  <>
                    <div className="rec">{rec ? `Récord: ${formatTime(rec.ms)} · ${Math.round(rec.wpm)} WPM` : "Sin terminar todavía"}</div>
                    <button className="btn primary" onClick={() => onProject(p.id)}>{rec ? "Mejorar tiempo" : "Empezar"}</button>
                  </>
                ) : (
                  <div className="pc-lock"><IconLock size={20} /> Terminá el proyecto {requiredNum(i)} para desbloquearlo</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="section" id="memoria">Ejercicios de memoria</div>
      <div className="sub">
        Leés una consigna y escribís el comando o el código sin verlo. Valen varias respuestas, y los detalles de
        estilo (espacios, comillas, orden de las opciones) se aceptan con un aviso. Un comando, una opción o un
        argumento distinto no deja avanzar: te dice qué revisar y podés pedir una pista. Cada nivel se abre al
        completar el anterior.
      </div>
      <div className="recall-topics">
        {RECALL.map((t) => {
          const lib = CATALOGO.find((x) => x.id === t.id);
          return (
            <div key={t.id} className="recall-topic" style={{ "--tc": lib?.color ?? "var(--cyan)" } as CSSProperties}>
              <h3>{t.name}</h3>
              <div className="recall-levels">
                {t.levels.map((lv, i) => {
                  const open = levelOpen(state.recall, t, i);
                  const solved = lv.exercises.filter((e) => state.recall[e.id]).length;
                  const full = levelDone(state.recall, lv);
                  return (
                    <button
                      key={lv.name}
                      className={"recall-level" + (full ? " done" : "") + (open ? "" : " locked")}
                      disabled={!open}
                      title={open ? undefined : `Completá ${t.levels[i - 1].name} para abrirlo`}
                      aria-label={`${t.name} ${lv.name}: ${open ? `${solved} de ${lv.exercises.length} resueltos` : "bloqueado"}`}
                      onClick={() => onRecall(t.id, i)}
                    >
                      <span className="rl-name">{!open && <IconLock size={14} />} {lv.name}</span>
                      <span className="rl-count">{open ? `${solved}/${lv.exercises.length}` : "bloqueado"}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="section" id="atajos">Atajos de editor</div>
      <div className="sub">
        Un editor de práctica con un objetivo: llegá al texto pedido usando los atajos de Vim o de VS Code. Cada
        ejercicio tiene un par de teclas: si lo igualás, tres estrellas. Se guarda tu mejor marca y cada nivel se abre
        al completar el anterior. Los atajos de VS Code son los de {state.settings.vscodeKeys === "mac" ? "Mac" : "Linux y Windows"} (se
        cambia en Ajustes).
      </div>
      <div className="recall-topics">
        {SHORTCUT_SETS.map((st) => (
          <div key={st.id} className="recall-topic" style={{ "--tc": st.id === "vim" ? "#57d38c" : "#3fa7ff" } as CSSProperties}>
            <h3>{st.name}</h3>
            <p className="sc-desc">{st.desc}</p>
            <div className="recall-levels">
              {st.levels.map((lv, i) => {
                const open = scLevelOpen(state.shortcuts, st, i);
                const got = lv.exercises.reduce((n, e) => n + (state.shortcuts[e.id]?.stars ?? 0), 0);
                const full = scLevelDone(state.shortcuts, lv);
                return (
                  <button
                    key={lv.name}
                    className={"recall-level" + (full ? " done" : "") + (open ? "" : " locked")}
                    disabled={!open}
                    title={open ? undefined : `Completá ${st.levels[i - 1].name} para abrirlo`}
                    aria-label={`${st.name} ${lv.name}: ${open ? `${got} de ${lv.exercises.length * 3} estrellas` : "bloqueado"}`}
                    onClick={() => onShortcut(st.id, i)}
                  >
                    <span className="rl-name">{!open && <IconLock size={14} />} {lv.name}</span>
                    <span className="rl-count">{open ? `★ ${got}/${lv.exercises.length * 3}` : "bloqueado"}</span>
                  </button>
                );
              })}
            </div>
            {st.id === "vscode" && (
              <details className="sc-taught">
                <summary>Atajos que se enseñan pero no se practican acá</summary>
                <ul>
                  {TAUGHT_ONLY.map((t) => (
                    <li key={t.pc}><kbd>{state.settings.vscodeKeys === "mac" ? t.mac : t.pc}</kbd> {t.what} <span>({t.why})</span></li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
