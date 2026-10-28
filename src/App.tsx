import { useEffect, useState, useSyncExternalStore } from "react";
import type { LangId, View } from "./types";
import { useAppState } from "./store";
import { onReducedMotionChange, reducedMotion, setFxEnabled } from "./fx/fx";
import { ACHIEVEMENTS, newAchievements } from "./engine/achievements";
import { sound } from "./sound";
import { Background } from "./components/Background";
import { Splash } from "./components/Splash";
import { AchBadge } from "./components/AchBadge";
import { Footer, Header, MobileNav, Sidebar } from "./components/Chrome";
import { useMusicInit } from "./components/MusicPlayer";
import { Tutorial } from "./components/Tutorial";
import { type Challenge, PracticeView } from "./components/PracticeView";
import {
  AchievementsView, ChallengesView, LanguagesView, RoutesView, SettingsView, StatsView,
} from "./components/Views";

export default function App() {
  const { state, update, saved, exportJson, importJson } = useAppState();
  const [view, setView] = useState<View>(state.lang ? "practice" : "languages");
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [toasts, setToasts] = useState<{ id: string; key: number }[]>([]);
  const [splash, setSplash] = useState(() => state.settings.showSplash || !state.settings.userName.trim());
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

  const lang = state.lang;
  const needsLang = !lang && view !== "settings" && view !== "achievements";
  const current: View = needsLang ? "languages" : view;

  const pickLang = (l: LangId) => {
    update((s) => ({ ...s, lang: l }));
    setChallenge(null);
    setView("practice");
  };

  const goto = (v: View) => {
    if (v !== "practice") setChallenge(null);
    setView(v);
  };

  const challengeLabel = challenge
    ? challenge.kind === "sprint" ? `Sprint ${challenge.seconds}s` : "Precisión perfecta"
    : null;

  if (splash) {
    return (
      <>
        <Background enabled={animations} theme={theme} />
        <Splash
          name={state.settings.userName}
          avatar={state.settings.avatar}
          onEnter={(name, avatar) => {
            update((s) => ({ ...s, settings: { ...s.settings, userName: name || s.settings.userName, avatar } }));
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
            if (challenge) {
              setChallenge(null);
              return;
            }
            update((s) => ({ ...s, mode: s.mode === "guided" ? "free" : "guided" }));
            setView(lang ? "practice" : "languages");
          }}
          onPickLang={() => goto("languages")}
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
            {current === "challenges" && lang && (
              <ChallengesView
                state={state}
                lang={lang}
                onStart={(c) => {
                  setChallenge(c);
                  setView("practice");
                }}
              />
            )}
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
      <div className="toasts" aria-live="polite">
        {toasts.map((t) => {
          const a = ACHIEVEMENTS.find((x) => x.id === t.id);
          if (!a) return null;
          return (
            <div key={t.key} className={`toast ${a.tier}`}>
              <AchBadge id={a.id} tier={a.tier} unlocked size={56} />
              <div>
                <div className="toast-kicker">LOGRO DESBLOQUEADO</div>
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
