import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { LangId, View } from "./types";
import { useAppState } from "./store";
import { onReducedMotionChange, reducedMotion, setFxEnabled } from "./fx/fx";
import { ACHIEVEMENTS, newAchievements } from "./engine/achievements";
import { sound } from "./sound";
import { Background } from "./components/Background";
import { type MenuDest, Splash } from "./components/Splash";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { ProjectView } from "./components/ProjectView";
import { RecallView } from "./components/RecallView";
import { ShortcutView } from "./components/ShortcutView";
import { findSet } from "./shortcuts/exercises";
import { findRecall } from "./recall/exercises";
import { PROJECTS } from "./projects/projects";
import { AchBadge } from "./components/AchBadge";
import { Footer, Header, MobileNav, Sidebar } from "./components/Chrome";
import { useMusicInit } from "./components/MusicPlayer";
import { Tutorial } from "./components/Tutorial";
import { type Challenge, PracticeView } from "./components/PracticeView";
import {
  AchievementsView, ChallengesView, LanguagesView, RoutesView, SettingsView, StatsView,
} from "./components/Views";
import { LibraryView } from "./components/LibraryView";
import { InterviewView } from "./components/InterviewView";
import { frameworksToGrant } from "./library/unlock";

export default function App() {
  const { state, update, saved, exportJson, importJson } = useAppState();
  const [view, setView] = useState<View>(state.lang ? "practice" : "languages");
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [toasts, setToasts] = useState<{ id: string; key: number }[]>([]);
  const [splash, setSplash] = useState(() => state.settings.showSplash || !state.settings.userName.trim());
  const [askMenu, setAskMenu] = useState(false);
  // true cuando el menú se abre desde la app (no al arrancar)
  const [fromApp, setFromApp] = useState(false);
  // proyecto abierto y si tiene un intento a medias (para preguntar antes de salir)
  const [projectId, setProjectId] = useState<string | null>(null);
  const projectBusy = useRef(false);
  const onProjectBusy = useCallback((b: boolean) => {
    projectBusy.current = b;
  }, []);
  // entrevista simulada en curso
  const interviewBusy = useRef(false);
  const onInterviewBusy = useCallback((b: boolean) => {
    interviewBusy.current = b;
  }, []);
  // ejercicios de memoria abiertos (n cambia para volver a empezar el mismo nivel)
  const [recallSel, setRecallSel] = useState<{ topic: string; level: number; n: number } | null>(null);
  const [shortcutSel, setShortcutSel] = useState<{ set: string; level: number; n: number } | null>(null);
  const [pendingLeave, setPendingLeave] = useState<(() => void) | null>(null);
  /** Corre `fn` enseguida, o después de confirmar si hay un proyecto a medias. */
  const guard = (fn: () => void) => {
    if (projectBusy.current || interviewBusy.current) setPendingLeave(() => fn);
    else fn();
  };
  useMusicInit(state);

  const { theme } = state.settings;
  // preferencia efectiva de movimiento: ajuste de la app y del sistema, en un solo lugar
  const systemReduced = useSyncExternalStore(onReducedMotionChange, reducedMotion);
  const animations = state.settings.animations && !systemReduced;

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    setFxEnabled(animations);
  }, [animations]);

  // logros: se evalúan sobre el estado guardado, así que nunca se duplican
  useEffect(() => {
    const ids = newAchievements(state);
    if (!ids.length) return;
    const now = Date.now();
    update((s) => ({ ...s, achievements: { ...s.achievements, ...Object.fromEntries(ids.map((id) => [id, now])) } }));
    // con datos importados o viejos no hace falta festejar todo de golpe
    const show = ids.slice(0, 3).map((id, i) => ({ id, key: now + i }));
    setToasts((t) => [...t, ...show]);
    if (state.settings.sound) sound.unlock();
    for (const t of show) setTimeout(() => setToasts((x) => x.filter((y) => y.key !== t.key)), 4800);
  }, [state, update]);

  // frameworks ganados: quedan guardados, así que no se vuelven a ocultar. La primera vez también se guardan los que la
  // persona ya tenía con la regla anterior (sin avisos: la sección sigue siendo secreta)
  useEffect(() => {
    const ganar = frameworksToGrant(state);
    if (!ganar.length && state.frameworksChecked) return;
    const now = Date.now();
    update((s) => ({
      ...s,
      frameworksChecked: true,
      frameworks: { ...s.frameworks, ...Object.fromEntries(frameworksToGrant(s).map((fw) => [fw.id, now])) },
    }));
  }, [state, update]);

  const lang = state.lang;
  const needsLang = !lang && view !== "settings" && view !== "achievements" && view !== "library" && view !== "interview";
  const current: View = needsLang ? "languages" : view;

  const pickLang = (l: LangId) => {
    update((s) => ({ ...s, lang: l }));
    setChallenge(null);
    setProjectId(null);
    setRecallSel(null);
    setShortcutSel(null);
    setView("practice");
  };

  const goto = (v: View) =>
    guard(() => {
      setProjectId(null);
      setRecallSel(null);
      setShortcutSel(null);
      if (v !== "practice") setChallenge(null);
      setView(v);
    });

  const project = projectId ? PROJECTS.find((p) => p.id === projectId) ?? null : null;
  const recallTopic = recallSel ? findRecall(recallSel.topic) : null;
  const shortcutSet = shortcutSel ? findSet(shortcutSel.set) : null;
  const challengeLabel = project
    ? `Proyecto ${String(project.num).padStart(2, "0")}`
    : recallTopic
      ? `Memoria · ${recallTopic.name}`
      : shortcutSet
        ? `Atajos · ${shortcutSet.name}`
    : challenge
      ? challenge.kind === "sprint" ? `Sprint ${challenge.seconds}s` : "Precisión perfecta"
      : null;

  if (splash) {
    return (
      <>
        <Background enabled={animations} theme={theme} />
        <Splash
          name={state.settings.userName}
          avatar={state.settings.avatar}
          quick={fromApp}
          onEnter={(name, avatar, dest: MenuDest) => {
            update((s) => ({ ...s, settings: { ...s.settings, userName: name || s.settings.userName, avatar } }));
            if (dest !== "continue") goto(dest);
            setSplash(false);
          }}
        />
      </>
    );
  }

  return (
    <>
      <Background enabled={animations} theme={theme} />
      <div className="app app-in">
        <Header
          state={state}
          saved={saved}
          challengeLabel={challengeLabel}
          onToggleMode={() => {
            if (project) {
              guard(() => setProjectId(null));
              return;
            }
            if (recallSel || shortcutSel) {
              setRecallSel(null);
              setShortcutSel(null);
              return;
            }
            if (challenge) {
              setChallenge(null);
              return;
            }
            update((s) => ({ ...s, mode: s.mode === "guided" ? "free" : "guided" }));
            setView(lang ? "practice" : "languages");
          }}
          onPickLang={() => goto("languages")}
          onMenu={() => setAskMenu(true)}
        />
        <MobileNav view={current} setView={goto} />
        <div className="body">
          <main className="main">
            {current === "languages" && <LanguagesView state={state} onPick={pickLang} />}
            {current === "practice" && lang && (
              <PracticeView
                key={lang + (challenge ? JSON.stringify(challenge) : "")}
                state={state}
                update={update}
                lang={lang}
                challenge={challenge}
                onExitChallenge={() => {
                  setChallenge(null);
                  setView("challenges");
                }}
              />
            )}
            {current === "routes" && lang && <RoutesView state={state} lang={lang} />}
            {current === "stats" && lang && <StatsView state={state} lang={lang} />}
            {current === "challenges" && lang && project && (
              <ProjectView
                key={project.id}
                project={project}
                state={state}
                update={update}
                onBusy={onProjectBusy}
                onExit={() => setProjectId(null)}
                onOpen={(id) => setProjectId(id)}
              />
            )}
            {current === "challenges" && lang && !project && recallTopic && recallSel && (
              <RecallView
                key={`${recallSel.topic}-${recallSel.level}-${recallSel.n}`}
                topic={recallTopic}
                level={recallSel.level}
                state={state}
                update={update}
                onExit={() => setRecallSel(null)}
                onOpen={(level) => setRecallSel((r) => ({ topic: r!.topic, level, n: (r?.n ?? 0) + 1 }))}
              />
            )}
            {current === "challenges" && lang && !project && !recallTopic && shortcutSet && shortcutSel && (
              <ShortcutView
                key={`${shortcutSel.set}-${shortcutSel.level}-${shortcutSel.n}`}
                set={shortcutSet}
                level={shortcutSel.level}
                state={state}
                update={update}
                onExit={() => setShortcutSel(null)}
                onOpen={(level) => setShortcutSel((r) => ({ set: r!.set, level, n: (r?.n ?? 0) + 1 }))}
              />
            )}
            {current === "challenges" && lang && !project && !recallTopic && !shortcutSet && (
              <ChallengesView
                state={state}
                lang={lang}
                onStart={(c) => {
                  setChallenge(c);
                  setView("practice");
                }}
                onProject={(id) => {
                  setChallenge(null);
                  setProjectId(id);
                }}
                onRecall={(topic, level) => {
                  setChallenge(null);
                  setRecallSel({ topic, level, n: 0 });
                }}
                onShortcut={(id, level) => {
                  setChallenge(null);
                  setShortcutSel({ set: id, level, n: 0 });
                }}
              />
            )}
            {current === "library" && <LibraryView lang={lang} state={state} update={update} />}
            {current === "interview" && <InterviewView state={state} update={update} onBusy={onInterviewBusy} />}
            {current === "achievements" && <AchievementsView state={state} />}
            {current === "settings" && (
              <SettingsView
                state={state}
                update={update}
                exportJson={exportJson}
                importJson={importJson}
                onTutorial={() => {
                  update((s) => ({ ...s, settings: { ...s.settings, tutorialDone: false } }));
                  setChallenge(null);
                  setView("practice");
                }}
              />
            )}
          </main>
          <Sidebar state={state} view={current} setView={goto} update={update} />
        </div>
        <Footer />
      </div>
      {current === "practice" && lang && !challenge && !state.settings.tutorialDone && (
        <Tutorial
          name={state.settings.userName.trim()}
          lang={lang}
          mode={state.mode}
          animations={animations}
          onClose={() => update((s) => ({ ...s, settings: { ...s.settings, tutorialDone: true } }))}
        />
      )}
      {askMenu && (
        <ConfirmDialog
          kicker="Menú principal"
          title="¿Volver al menú principal?"
          message={
            interviewBusy.current
              ? "Vas a salir de la entrevista en curso y no se guarda su resultado."
              : projectBusy.current
              ? "Vas a salir del proyecto en curso y ese intento no se guarda. Tus récords quedan guardados."
              : challenge
              ? "Vas a salir del desafío en curso y ese intento no se guarda. El resto de tu progreso queda guardado."
              : "Tu progreso queda guardado. Si estabas en medio de una lección, ese intento se descarta."
          }
          confirmLabel="Sí, volver al menú"
          cancelLabel="Seguir acá"
          onConfirm={() => {
            setAskMenu(false);
            setChallenge(null);
            setProjectId(null);
            setRecallSel(null);
            setShortcutSel(null);
            setFromApp(true);
            setSplash(true);
          }}
          onCancel={() => setAskMenu(false)}
        />
      )}
      {pendingLeave && (
        <ConfirmDialog
          kicker={interviewBusy.current ? "Entrevista en curso" : "Proyecto en curso"}
          title={interviewBusy.current ? "¿Salir de la entrevista?" : "¿Salir del proyecto?"}
          message={interviewBusy.current ? "Vas a perder el avance y no se guarda el resultado." : "Vas a perder el avance de este intento. Tus récords anteriores quedan guardados."}
          confirmLabel="Sí, salir"
          cancelLabel={interviewBusy.current ? "Seguir con la entrevista" : "Seguir escribiendo"}
          onConfirm={() => {
            const fn = pendingLeave;
            setPendingLeave(null);
            projectBusy.current = false;
            interviewBusy.current = false;
            fn();
          }}
          onCancel={() => setPendingLeave(null)}
        />
      )}
      <div className="toasts" aria-live="polite">
        {toasts.map((t) => {
          const a = ACHIEVEMENTS.find((x) => x.id === t.id);
          if (!a) return null;
          return (
            <div key={t.key} className={`toast ${a.tier}`}>
              <AchBadge id={a.id} tier={a.tier} unlocked size={56} />
              <div>
                <div className="toast-kicker">Logro desbloqueado</div>
                <div className="toast-name">{a.name}</div>
                <div className="toast-desc">{a.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
