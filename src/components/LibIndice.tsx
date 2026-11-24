import { GROUPS, SOON } from "../library/grupos";
import type { Topic } from "../library/types";
import { IconChevron } from "./icons";
import { TopicBadge } from "./TopicBadge";

export type Selection = { kind: "topic"; id: string } | { kind: "soon" };

/** Índice de la Biblioteca: los temas por grupo y la sección de próximamente. Los grupos se pliegan, salvo el del tema abierto. */
export function LibIndice({ topics, sel, searching, cerrados, onToggle, onTopic, onSoon }: {
  topics: Topic[]; sel: Selection; searching: boolean; cerrados: string[]; onToggle: (grupo: string) => void;
  onTopic: (id: string) => void; onSoon: () => void;
}) {
  const actual = sel.kind === "topic" ? topics.find((t) => t.id === sel.id)?.group : undefined;
  return (
    <nav className="lib-nav" aria-label="Temas de la biblioteca">
      {GROUPS.filter((g) => topics.some((t) => t.group === g)).map((g) => {
        const abierto = g === actual || !cerrados.includes(g);
        const temas = topics.filter((t) => t.group === g);
        return (
        <div key={g} className={`lib-group ${abierto ? "" : "cerrado"}`}>
          {g === actual ? (
            <div className="lib-group-name"><IconChevron size={14} />{g}</div>
          ) : (
            <button className="lib-group-name" aria-expanded={abierto} onClick={() => onToggle(g)}>
              <IconChevron size={14} />{g}
              {!abierto && <span className="lib-count">{temas.length}</span>}
            </button>
          )}
          {temas.map((t) => (
            <button
              key={t.id}
              className={`lib-tema ${sel.kind === "topic" && sel.id === t.id && !searching ? "on" : ""}`}
              aria-current={sel.kind === "topic" && sel.id === t.id ? "true" : undefined}
              onClick={() => onTopic(t.id)}
            >
              <TopicBadge topic={t} size={24} />
              <span>{t.name}</span>
              <span className="lib-count">{t.entries.length}</span>
            </button>
          ))}
        </div>
        );
      })}
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
