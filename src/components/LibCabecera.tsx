import type { CSSProperties } from "react";
import type { Topic } from "../library/types";
import { ClaudeBuddy } from "./ClaudeMark";
import { CodexBuddy } from "./CodexMark";
import { IconWarn } from "./icons";
import { TopicBadge } from "./TopicBadge";

/** Cabecera de un tema: el aviso (si tiene) y el nombre con su resumen. */
export function LibCabecera({ topic }: { topic: Topic }) {
  return (
    <>
      {topic.alert && (
        <aside className="lib-alert" role="alert">
          <h4><IconWarn size={20} /> {topic.alert.title}</h4>
          <ul>{topic.alert.items.map((t) => <li key={t}>{t}</li>)}</ul>
          {topic.alert.closing && <p>{topic.alert.closing}</p>}
        </aside>
      )}
      <div className={`lib-head ${topic.id === "claude" ? "lib-claude" : ""} ${topic.id === "codex" ? "lib-codex" : ""}`} style={{ "--lc": topic.color } as CSSProperties}>
        <TopicBadge topic={topic} size={56} />
        <div>
          <h3>{topic.name}</h3>
          <p>{topic.summary}</p>
        </div>
        {topic.id === "claude" && <ClaudeBuddy size={84} />}
        {topic.id === "codex" && <CodexBuddy size={84} />}
      </div>
    </>
  );
}
