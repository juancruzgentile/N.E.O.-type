import { useState } from "react";
import type { LangId, View } from "./types";
import { useAppState } from "./store";
import { Footer, Header, Sidebar } from "./components/Chrome";
import { type Challenge, PracticeView } from "./components/PracticeView";
import { ChallengesView, LanguagesView, RoutesView, SettingsView, StatsView } from "./components/Views";

export default function App() {
  const { state, update, saved, exportJson, importJson } = useAppState();
  const [view, setView] = useState<View>(state.lang ? "practice" : "languages");
  const [challenge, setChallenge] = useState<Challenge | null>(null);

  const lang = state.lang;
  const needsLang = !lang && view !== "settings";
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
          {current === "settings" && (
            <SettingsView state={state} update={update} exportJson={exportJson} importJson={importJson} />
          )}
        </main>
        <Sidebar state={state} view={current} setView={goto} />
      </div>
      <Footer />
    </div>
  );
}
