import { GROUPS, SOON } from "../library/index";
import type { Topic } from "../library/types";
import { TopicBadge } from "./TopicBadge";

export type Selection = { kind: "topic"; id: string } | { kind: "soon" };

/** Índice de la Biblioteca: los temas por grupo y la sección de próximamente. */
export function LibIndice({ topics, sel, searching, onTopic, onSoon }: {
  topics: Topic[]; sel: Selection; searching: boolean; onTopic: (id: string) => void; onSoon: () => void;
}) {
  return (
    <nav className="lib-nav" aria-label="Temas de la biblioteca">
      {GROUPS.filter((g) => topics.some((t) => t.group === g)).map((g) => (
        <div key={g} className="lib-group">
          <div className="lib-group-name">{g}</div>
          {topics.filter((t) => t.group === g).map((t) => (
            <button
              key={t.id}
              className={sel.kind === "topic" && sel.id === t.id && !searching ? "on" : ""}
              aria-current={sel.kind === "topic" && sel.id === t.id ? "true" : undefined}
              onClick={() => onTopic(t.id)}
            >
              <TopicBadge topic={t} size={24} />
              <span>{t.name}</span>
              <span className="lib-count">{t.entries.length}</span>
            </button>
          ))}
        </div>
      ))}
      <div className="lib-group">
        <div className="lib-group-name">Próximamente</div>
        <button
          className={sel.kind === "soon" && !searching ? "on" : ""}
          onClick={onSoon}
        >
          <span className="lib-badge small" aria-hidden="true">IA</span>
          <span>IA y herramientas</span>
          <span className="lib-count">{SOON.length}</span>
        </button>
      </div>
    </nav>
  );
}
