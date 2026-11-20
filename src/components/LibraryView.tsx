import { useEffect, useMemo, useRef, useState } from "react";
import type { AppState, LangId } from "../types";
import { SOON } from "../library/index";
import { visibleTopics } from "../library/unlock";
import { type Hit, entryId, search } from "../library/search";
import type { Entry, Level, Topic } from "../library/types";
import { ClaseView } from "./ClaseView";
import { IconBook, IconChalk, IconLock, IconSearch } from "./icons";
import { EntryPractice } from "./EntryPractice";
import { EntryCard, LibReferencia } from "./LibReferencia";
import { LibCabecera } from "./LibCabecera";
import { LibIndice, type Selection } from "./LibIndice";
import { tabKeys } from "./tabs";
import { findEntry } from "../review/review";
import { readHash, viewHash, writeHash } from "../route";

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
  // el tema y la pestaña vienen del hash si es un tema visible (#/biblioteca/git/clase)
  const fromHash = (): { sel: Selection; clase: boolean } | null => {
    const { view, rest: [id, tab] } = readHash();
    if (view !== "library") return null;
    if (id === "proximamente") return { sel: { kind: "soon" }, clase: false };
    const t = TOPICS.find((x) => x.id === id);
    return t ? { sel: { kind: "topic", id: t.id }, clase: tab === "clase" && !!t.clase } : null;
  };
  const [sel, setSel] = useState<Selection>(() => fromHash()?.sel ?? { kind: "topic", id: initial });
  const [claseOpen, setClaseOpen] = useState(() => fromHash()?.clase ?? false);
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

  useEffect(() => {
    writeHash(sel.kind === "soon" ? viewHash("library", "proximamente") : viewHash("library", sel.id, ...(claseOpen ? ["clase"] : [])));
  }, [sel, claseOpen]);
  useEffect(() => {
    const onHash = () => {
      const h = fromHash();
      if (!h) return;
      setPractice(null);
      setQuery("");
      setLevel("all");
      setSel(h.sel);
      setClaseOpen(h.clase);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  });

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
        <LibIndice
          topics={TOPICS}
          sel={sel}
          searching={!!q}
          cerrados={state.settings.libCerrados}
          onToggle={(g) => update((s) => {
            const c = s.settings.libCerrados;
            return { ...s, settings: { ...s.settings, libCerrados: c.includes(g) ? c.filter((x) => x !== g) : [...c, g] } };
          })}
          onTopic={(id) => {
            setQuery("");
            openTopic(id);
          }}
          onSoon={() => {
            setQuery("");
            setSel({ kind: "soon" });
          }}
        />

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
              <LibCabecera topic={topic} />

              {topic.clase && (
                <div className="seg lib-clase-toggle" role="tablist" aria-label="Vista" onKeyDown={tabKeys}>
                  <button role="tab" id="lib-tab-ref" aria-controls="lib-vista" aria-selected={!claseOpen} tabIndex={claseOpen ? -1 : 0} className={!claseOpen ? "on" : ""} onClick={() => setClaseOpen(false)}>
                    <IconBook size={16} /> Referencia
                  </button>
                  <button role="tab" id="lib-tab-clase" aria-controls="lib-vista" aria-selected={claseOpen} tabIndex={claseOpen ? 0 : -1} className={claseOpen ? "on" : ""} onClick={() => setClaseOpen(true)}>
                    <IconChalk size={16} /> {topic.clase.tab ?? "Clase"}
                  </button>
                </div>
              )}

              <div {...(topic.clase && { id: "lib-vista", role: "tabpanel", "aria-labelledby": claseOpen ? "lib-tab-clase" : "lib-tab-ref" })}>
              {topic.clase && claseOpen ? (
                <ClaseView clase={topic.clase} hl={topic.hl} color={topic.color} />
              ) : (
                <LibReferencia topic={topic} level={level} onLevel={setLevel} inReview={inReview} card={(e) => card(topic, e, { flash: flash === entryId(topic, e) })} />
              )}
              </div>
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
