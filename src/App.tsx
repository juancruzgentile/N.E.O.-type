import { useEffect, useState } from "react";
import type { LangId, View } from "./types";
import { useAppState } from "./store";
import { setFxEnabled } from "./fx/fx";
import { ACHIEVEMENTS, newAchievements } from "./engine/achievements";
import { sound } from "./sound";
import { Background } from "./components/Background";
import { Footer, Header, Sidebar } from "./components/Chrome";
import { useMusicInit } from "./components/MusicPlayer";
import { type Challenge, PracticeView } from "./components/PracticeView";
import {
  AchievementsView, ChallengesView, LanguagesView, RoutesView, SettingsView, StatsView,
} from "./components/Views";

export default function App() {
  const { state, update, saved, exportJson, importJson } = useAppState();
  const [view, setView] = useState<View>(state.lang ? "practice" : "languages");
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [toasts, setToasts] = useState<{ id: string; key: number }[]>([]);
  useMusicInit(state);

  const { theme, animations } = state.settings;

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

  return (
    <>
      <Background enabled={animations} theme={theme} />
      <div className="app">
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
              <SettingsView state={state} update={update} exportJson={exportJson} importJson={importJson} />
            )}
          </main>
          <Sidebar state={state} view={current} setView={goto} update={update} />
        </div>
        <Footer />
      </div>
      <div className="toasts" aria-live="polite">
        {toasts.map((t) => {
          const a = ACHIEVEMENTS.find((x) => x.id === t.id);
          if (!a) return null;
          return (
            <div key={t.key} className={`toast ${a.tier}`}>
              <span className="ach-icon" aria-hidden="true">{a.icon}</span>
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
