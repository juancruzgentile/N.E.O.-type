import { type CSSProperties, memo, useEffect, useMemo, useRef, useState } from "react";
import type { AppState, LangId, ReviewItem } from "../types";
import { highlight } from "../highlight";
import { GROUPS, SOON } from "../library/index";
import { visibleTopics } from "../library/unlock";
import { type Hit, entryId, search } from "../library/search";
import { type Entry, type Level, LEVELS, type Topic } from "../library/types";
import { LangEmblem } from "./LangEmblem";
import { ClaudeBuddy, ClaudeMark } from "./ClaudeMark";
import { CodexBuddy, CodexMark } from "./CodexMark";
import { ClaseView } from "./ClaseView";
import { IconBook, IconChalk, IconKeyboard, IconLock, IconSearch, IconWarn } from "./icons";
import { EntryPractice } from "./EntryPractice";
import { kindNote } from "../library/kind";
import { fuenteDe } from "../library/fuentes/index";
import { MAX_BOX, findEntry, whenText } from "../review/review";
import { today } from "../store";

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

function TopicBadge({ topic, size = 40 }: { topic: Topic; size?: number }) {
  if (topic.id === "claude") return <ClaudeMark size={size} />;
  if (topic.id === "codex") return <CodexMark size={size} />;
  if (topic.emblem) return <LangEmblem lang={topic.emblem} size={size} />;
  return (
    <span className="lib-badge" style={{ "--lc": topic.color, width: size, height: size, fontSize: Math.max(7, Math.round(size * 0.28)) } as CSSProperties} aria-hidden="true">
      {topic.badge}
    </span>
  );
}

export const fechaLarga = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("es", { day: "numeric", month: "long", year: "numeric" });
const levelName = (l: Level) => LEVELS.find((x) => x.id === l)!.name;

function EntryCard({ topic, entry, showTopic, onOpenTopic, flash, rv, onPractice, onForget }: {
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

type Selection = { kind: "topic"; id: string } | { kind: "soon" };

interface Props {
  lang: LangId | null;
  state: AppState;
  update: (fn: (s: AppState) => AppState) => void;
}

export function LibraryView({ lang, state, update }: Props) {
  // los frameworks solo aparecen (también en la búsqueda) una vez ganados
  const TOPICS = useMemo(() => visibleTopics(state), [state]);
  const totalEntries = TOPICS.reduce((n, t) => n + t.entries.length, 0);
  const initial = TOPICS.find((t) => t.id === lang)?.id ?? TOPICS[0].id;
  const [sel, setSel] = useState<Selection>({ kind: "topic", id: initial });
  const [claseOpen, setClaseOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [onlyTopic, setOnlyTopic] = useState(false);
  const [level, setLevel] = useState<Level | "all">("all");
  const [flash, setFlash] = useState<string | null>(null);
  const [practice, setPractice] = useState<string | null>(null);
  const practicing = practice ? findEntry(practice) : null;
  const inputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const topic = sel.kind === "topic" ? TOPICS.find((t) => t.id === sel.id)! : null;
  const q = query.trim();
  const hits: Hit[] = useMemo(
    () => (q ? search(onlyTopic && topic ? [topic] : TOPICS, q) : []),
    [q, onlyTopic, topic, TOPICS],
  );

  // "/" o Ctrl+K enfocan la búsqueda desde cualquier lugar de la biblioteca
  useEffect(() => {
    if (practice) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      const typing = ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName);
      if ((e.key === "/" && !typing) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k")) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [practice]);

  // después de abrir un resultado: desplazarse hasta la entrada y resaltarla
  useEffect(() => {
    if (!flash) return;
    const el = document.getElementById(flash);
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
    const t = setTimeout(() => setFlash(null), 1800);
    return () => clearTimeout(t);
  }, [flash]);

  const openTopic = (id: string) => {
    setSel({ kind: "topic", id });
    setLevel("all");
    setClaseOpen(false);
    contentRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  };

  const openHit = (h: Hit) => {
    setSel({ kind: "topic", id: h.topic.id });
    setQuery("");
    setLevel("all");
    setClaseOpen(false);
    setFlash(entryId(h.topic, h.entry));
  };

  const entries = topic ? topic.entries.filter((e) => level === "all" || e.level === level) : [];
  const forget = (id: string) =>
    update((s) => {
      const review = { ...s.review };
      delete review[id];
      return { ...s, review };
    });
  const card = (t: Topic, e: Entry, extra: { showTopic?: boolean; onOpenTopic?: () => void; flash?: boolean } = {}) => {
    const id = entryId(t, e);
    return <EntryCard key={id} topic={t} entry={e} {...extra} rv={state.review[id]} onPractice={() => setPractice(id)} onForget={() => forget(id)} />;
  };
  const inReview = topic ? topic.entries.filter((e) => state.review[entryId(topic, e)]).length : 0;

  return (
    <div className="frame view library">
      <h2>Biblioteca</h2>
      <div className="sub">
        Referencia rápida para programar: qué es cada lenguaje, cómo se trabaja con él y los comandos básicos, intermedios y
        avanzados con ejemplos. {totalEntries} entradas en {TOPICS.length} temas. Con <b>Practicar este ejemplo</b> lo escribís
        y queda en tu repaso: vuelve cada tanto en tus lecciones, más espaciado a medida que lo dominás.
      </div>

      <div className="lib-search" role="search">
        <IconSearch size={22} />
        <input
          ref={inputRef}
          type="search"
          value={query}
          placeholder="Buscar comando, función o concepto…"
          aria-label="Buscar en la biblioteca"
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setQuery("");
            if (e.key === "Enter" && hits[0]) openHit(hits[0]);
          }}
        />
        <kbd title="Atajo para buscar">/</kbd>
        {topic && (
          <label className="lib-scope">
            <input type="checkbox" checked={onlyTopic} onChange={(e) => setOnlyTopic(e.target.checked)} /> Solo {topic.name}
          </label>
        )}
      </div>

      <div className="lib-layout">
        <nav className="lib-nav" aria-label="Temas de la biblioteca">
          {GROUPS.filter((g) => TOPICS.some((t) => t.group === g)).map((g) => (
            <div key={g} className="lib-group">
              <div className="lib-group-name">{g}</div>
              {TOPICS.filter((t) => t.group === g).map((t) => (
                <button
                  key={t.id}
                  className={sel.kind === "topic" && sel.id === t.id && !q ? "on" : ""}
                  aria-current={sel.kind === "topic" && sel.id === t.id ? "true" : undefined}
                  onClick={() => {
                    setQuery("");
                    openTopic(t.id);
                  }}
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
              className={sel.kind === "soon" && !q ? "on" : ""}
              onClick={() => {
                setQuery("");
                setSel({ kind: "soon" });
              }}
            >
              <span className="lib-badge small" aria-hidden="true">IA</span>
              <span>IA y herramientas</span>
              <span className="lib-count">{SOON.length}</span>
            </button>
          </div>
        </nav>

        <div className="lib-content" ref={contentRef}>
          {q ? (
            <>
              <div className="section">
                {hits.length ? `${hits.length}${hits.length === 80 ? "+" : ""} resultados para "${q}"` : `Sin resultados para "${q}"`}
              </div>
              {!hits.length && <p className="lib-empty">Probá con otra palabra, un sinónimo o sin el nombre del lenguaje.</p>}
              <div className="lib-entries">
                {hits.map((h) => card(h.topic, h.entry, { showTopic: true, onOpenTopic: () => openHit(h) }))}
              </div>
            </>
          ) : sel.kind === "soon" ? (
            <>
              <div className="lib-head">
                <span className="lib-badge" aria-hidden="true">IA</span>
                <div>
                  <h3>Inteligencia artificial para programar</h3>
                  <p>Estas secciones están en preparación y se van a sumar en próximas versiones.</p>
                </div>
              </div>
              <div className="lib-soon">
                {SOON.map((s) => (
                  <div key={s.id} className="lib-soon-card" aria-disabled="true">
                    <div className="lib-soon-top">
                      <h4>{s.name}</h4>
                      <span className="soon-tag"><IconLock size={14} /> PRÓXIMAMENTE</span>
                    </div>
                    <p>{s.desc}</p>
                  </div>
                ))}
              </div>
            </>
          ) : topic ? (
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

              {topic.clase && (
                <div className="seg lib-clase-toggle" role="tablist" aria-label="Vista">
                  <button role="tab" aria-selected={!claseOpen} className={!claseOpen ? "on" : ""} onClick={() => setClaseOpen(false)}>
                    <IconBook size={16} /> Referencia
                  </button>
                  <button role="tab" aria-selected={claseOpen} className={claseOpen ? "on" : ""} onClick={() => setClaseOpen(true)}>
                    <IconChalk size={16} /> {topic.clase.tab ?? "Clase"}
                  </button>
                </div>
              )}

              {topic.clase && claseOpen ? (
                <ClaseView clase={topic.clase} hl={topic.hl} color={topic.color} />
              ) : (
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
                  <div className="seg lib-levels" role="tablist" aria-label="Nivel">
                    {[{ id: "all" as const, name: "Todo" }, ...LEVELS].map((l) => (
                      <button
                        key={l.id}
                        role="tab"
                        aria-selected={level === l.id}
                        className={level === l.id ? "on" : ""}
                        onClick={() => setLevel(l.id)}
                      >
                        {l.name} ({l.id === "all" ? topic.entries.length : topic.entries.filter((e) => e.level === l.id).length})
                      </button>
                    ))}
                  </div>
                  {LEVELS.filter((l) => level === "all" || level === l.id).map((l) => {
                    const list = entries.filter((e) => e.level === l.id);
                    if (!list.length) return null;
                    return (
                      <section key={l.id} className="lib-level-block">
                        <h3 className={`lib-level-title ${l.id}`}>{l.name}</h3>
                        <div className="lib-entries">
                          {list.map((e) => card(topic, e, { flash: flash === entryId(topic, e) }))}
                        </div>
                      </section>
                    );
                  })}
                </>
              )}
            </>
          ) : null}
        </div>
      </div>
      {practicing && (
        <EntryPractice
          key={practice}
          topic={practicing.topic}
          entry={practicing.entry}
          state={state}
          update={update}
          onClose={() => setPractice(null)}
        />
      )}
    </div>
  );
}
