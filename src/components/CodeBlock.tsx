import { memo, useMemo } from "react";
import type { LangId } from "../types";
import { highlight } from "../highlight";

/** Bloque de código con resaltado; agrupa caracteres seguidos del mismo tipo en un solo span. */
export const CodeBlock = memo(function CodeBlock({ text, lang }: { text: string; lang: LangId }) {
  const parts = useMemo(() => {
    const toks = highlight(text, lang);
    const out: { t: string; s: string }[] = [];
    for (let i = 0; i < text.length; i++) {
      const last = out[out.length - 1];
      if (last && last.t === toks[i]) last.s += text[i];
      else out.push({ t: toks[i], s: text[i] });
    }
    return out;
  }, [text, lang]);
  return (
    <pre className="lib-code"><code>{parts.map((p, i) => <span key={i} className={"tk-" + p.t}>{p.s}</span>)}</code></pre>
  );
});

export const fechaLarga = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("es", { day: "numeric", month: "long", year: "numeric" });
