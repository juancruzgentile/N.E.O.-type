import type { CSSProperties } from "react";
import type { Topic } from "../library/types";
import { LangEmblem } from "./LangEmblem";
import { ClaudeMark } from "./ClaudeMark";
import { CodexMark } from "./CodexMark";

export function TopicBadge({ topic, size = 40 }: { topic: Topic; size?: number }) {
  if (topic.id === "claude") return <ClaudeMark size={size} />;
  if (topic.id === "codex") return <CodexMark size={size} />;
  if (topic.emblem) return <LangEmblem lang={topic.emblem} size={size} />;
  return (
    <span className="lib-badge" style={{ "--lc": topic.color, width: size, height: size, fontSize: Math.max(7, Math.round(size * 0.28)) } as CSSProperties} aria-hidden="true">
      {topic.badge}
    </span>
  );
}
