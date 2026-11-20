import type { CSSProperties, ReactNode } from "react";
import type { ReviewItem } from "../types";
import { entryId } from "../library/search";
import { type Entry, type Level, LEVELS, type Topic } from "../library/types";
import { kindNote } from "../library/kind";
import { fuenteDe } from "../library/fuentes/index";
import { MAX_BOX, whenText } from "../review/review";
import { today } from "../store";
import { CodeBlock, fechaLarga } from "./CodeBlock";
import { IconBook, IconKeyboard } from "./icons";
import { TopicBadge } from "./TopicBadge";
import { tabKeys } from "./tabs";

const levelName = (l: Level) => LEVELS.find((x) => x.id === l)!.name;

export function EntryCard({ topic, entry, showTopic, onOpenTopic, flash, rv, onPractice, onForget }: {
  topic: Topic; entry: Entry; showTopic?: boolean; onOpenTopic?: () => void; flash?: boolean;
  rv?: ReviewItem; onPractice: () => void; onForget: () => void;
}) {
  const kind = kindNote(topic.id, entry);
  const fuente = fuenteDe(topic.id, entry.name);
  return (
    <article id={entryId(topic, entry)} className={`lib-entry ${flash ? "flash" : ""}`} style={{ "--lc": topic.color } as CSSProperties}>
      <header>
        <h4>{entry.name}</h4>
        <span className={`lib-level ${entry.level}`}>{levelName(entry.level)}</span>
        <span className="lib-cat">{entry.cat}</span>
        {kind && <span className={`lib-kind ${kind.full ? "full" : ""}`} title={kind.note}>{kind.full ? "Programa completo" : "Fragmento"}</span>}
        {showTopic && (
          <button className="lib-topic-link" onClick={onOpenTopic} title={`Ver en ${topic.name}`}>
            <TopicBadge topic={topic} size={20} /> {topic.name}
          </button>
        )}
      </header>
      <p>{entry.desc}</p>
      <CodeBlock text={entry.code} lang={topic.hl} />
      {kind && !kind.full && <p className="lib-note">{kind.note}</p>}
      {fuente && (
        <p className="lib-source">
          <span>Fuente: <a href={fuente.url} target="_blank" rel="noopener noreferrer">{fuente.sitio}</a></span>
          <span>Versión: {fuente.version}</span>
          <span>Revisado: {fechaLarga(fuente.revisado)}</span>
        </p>
      )}
      <footer className="lib-entry-foot">
        <button className="btn small lib-practice" onClick={onPractice} title="Escribir este ejemplo y sumarlo a tu repaso">
          <IconKeyboard size={16} /> Practicar este ejemplo
        </button>
        {rv && (
          <span className={`lib-review ${rv.box >= MAX_BOX ? "mastered" : ""}`}>
            {rv.box >= MAX_BOX ? "Dominada" : "En repaso"} · {whenText(rv, today())}
            <button className="lib-forget" onClick={onForget} title="Quitar del repaso" aria-label={`Quitar ${entry.name} del repaso`}>×</button>
          </span>
        )}
      </footer>
    </article>
  );
}

/** Referencia rápida de un tema: datos, métodos de trabajo y los ejemplos por nivel. */
export function LibReferencia({ topic, level, onLevel, inReview, card }: {
  topic: Topic; level: Level | "all"; onLevel: (l: Level | "all") => void; inReview: number; card: (e: Entry) => ReactNode;
}) {
  const entries = topic.entries.filter((e) => level === "all" || e.level === level);
  return (
    <>
      <dl className="lib-facts">
        {topic.facts.map((f) => (
          <div key={f.label}>
            <dt>{f.label}</dt>
            <dd>{f.value}</dd>
          </div>
        ))}
      </dl>

      <div className="section"><IconBook size={18} /> MÉTODOS DE TRABAJO</div>
      <div className="lib-workflow">
        {topic.workflow.map((w) => (
          <div key={w.title} className="lib-tip">
            <h4>{w.title}</h4>
            <p>{w.text}</p>
          </div>
        ))}
      </div>

      <div className="section">
        COMANDOS Y CONCEPTOS
        {inReview > 0 && <span className="lib-in-review">{inReview} en tu repaso</span>}
      </div>
      <div className="seg lib-levels" role="tablist" aria-label="Nivel" onKeyDown={tabKeys}>
        {[{ id: "all" as const, name: "Todo" }, ...LEVELS].map((l) => (
          <button
            key={l.id}
            role="tab"
            id={`lib-nivel-${l.id}`}
            aria-controls="lib-nivel"
            aria-selected={level === l.id}
            tabIndex={level === l.id ? 0 : -1}
            className={level === l.id ? "on" : ""}
            onClick={() => onLevel(l.id)}
          >
            {l.name} ({l.id === "all" ? topic.entries.length : topic.entries.filter((e) => e.level === l.id).length})
          </button>
        ))}
      </div>
      <div id="lib-nivel" role="tabpanel" aria-labelledby={`lib-nivel-${level}`}>
      {LEVELS.filter((l) => level === "all" || level === l.id).map((l) => {
        const list = entries.filter((e) => e.level === l.id);
        if (!list.length) return null;
        return (
          <section key={l.id} className="lib-level-block">
            <h3 className={`lib-level-title ${l.id}`}>{l.name}</h3>
            <div className="lib-entries">
              {list.map(card)}
            </div>
          </section>
        );
      })}
      </div>
    </>
  );
}
