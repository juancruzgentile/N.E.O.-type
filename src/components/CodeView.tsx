import { memo, useMemo } from "react";
import type { LangId } from "../types";
import { highlight } from "../highlight";
import type { TypingSession } from "../engine/session";

interface Props {
  session: TypingSession;
  lang: LangId | null;
  focus: string | null;
  /** cambia en cada pulsación para forzar el render */
  version: number;
  shake: boolean;
}

function CodeViewInner({ session, lang, focus, shake }: Props) {
  const text = session.text;
  const toks = useMemo(() => highlight(text, lang), [text, lang]);
  const lines = useMemo(() => {
    const out: { start: number; end: number }[] = [];
    let start = 0;
    for (let i = 0; i <= text.length; i++) {
      if (i === text.length || text[i] === "\n") {
        out.push({ start, end: i });
        start = i + 1;
      }
    }
    return out;
  }, [text]);

  const pos = session.pos;
  const curLine = lines.findIndex((l) => pos >= l.start && pos <= l.end);

  return (
    <div className="code-lines">
      {lines.map((l, li) => {
        const chars = [];
        for (let i = l.start; i <= l.end && i < text.length + 1; i++) {
          const isNl = i === l.end;
          if (isNl && i >= text.length) break;
          const ch = isNl ? "↵" : text[i];
          const cls = ["ch"];
          if (session.auto[i]) cls.push("auto");
          else if (i < pos) cls.push(session.wrong.has(i) ? "wrong" : "typed");
          else cls.push("pending");
          if (i === pos) cls.push("cursor");
          if (i === pos && shake) cls.push("shake", "err");
          if (i < pos && session.errors.has(i) && !session.wrong.has(i)) cls.push("errmark");
          if (isNl) cls.push("nl");
          else cls.push("tk-" + toks[i]);
          if (!isNl && focus && text[i] === focus && i >= pos) cls.push("focus-sym");
          const shown = session.wrong.has(i) && i < pos ? session.wrong.get(i)! : ch;
          chars.push(
            <span key={i} className={cls.join(" ")}>
              {isNl ? (i === pos ? "↵" : " ") : shown === " " ? " " : shown}
            </span>,
          );
        }
        return (
          <div key={li} className={"code-line" + (li === curLine ? " current" : "")}>
            <span className="ln">{li + 1}</span>
            <span>{chars}</span>
          </div>
        );
      })}
    </div>
  );
}

export const CodeView = memo(CodeViewInner);
