import type { ReactNode } from "react";
import type { AppState, LangId, View } from "../types";
import { LANGS } from "../data/curriculum";
import { progressToNext } from "../engine/stats";
import { getProfile, today } from "../store";
import {
  IconChart, IconChevron, IconClock, IconCross, IconExpand, IconGear, IconKeyboard, IconMap, IconMedal, IconPulse, IconTrophy,
} from "./icons";
import { MusicMini, MusicPlayer } from "./MusicPlayer";

export function LangBadge({ lang, size }: { lang: LangId; size?: number }) {
  const l = LANGS[lang];
  return (
    <span className="lang-badge" style={{ background: l.color, ...(size ? { width: size, height: size } : {}) }}>
      {l.badge}
    </span>
  );
}

interface HeaderProps {
  state: AppState;
  saved: boolean;
  onToggleMode: () => void;
  onPickLang: () => void;
  challengeLabel: string | null;
}

export function Header({ state, saved, onToggleMode, onPickLang, challengeLabel }: HeaderProps) {
  const lang = state.lang;
  const stage = lang ? getProfile(state, lang).stage : 0;
  const fullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen?.();
  };
  return (
    <header className="frame header">
      <div className="brand">
        <span className="prompt">&gt;_</span>
        <span>
          NEON<span className="type">TYPE</span>
        </span>
      </div>
      <div className="tagline">
        Escribe un
        <br />
        mejor mañana
      </div>
      <button className="pill" onClick={onToggleMode} title="Cambiar entre modo guiado y libre">
        <IconCross size={22} />
        {challengeLabel ?? (state.mode === "guided" ? "Modo guiado" : "Modo libre")}
      </button>
      <span style={{ color: "var(--dim)" }}><IconChevron /></span>
      <button className="pill" onClick={onPickLang} title="Elegir lenguaje">
        {lang ? (
          <>
            <LangBadge lang={lang} />
            {LANGS[lang].name} <span style={{ color: "var(--dim)" }}>•</span>{" "}
            <span className="accent">Nivel {String(stage + 1).padStart(2, "0")}</span>
          </>
        ) : (
          "Elegí un lenguaje"
        )}
      </button>
      <span className="spacer" />
      <div className="status" title={saved ? "El progreso se guarda en este navegador" : "No se pudo guardar"}>
        <span className={saved ? "dot" : "dot off"} />
        {saved ? "PROGRESO GUARDADO" : "SIN GUARDAR"}
      </div>
      <MusicMini />
      <button className="icon-btn" onClick={fullscreen} title="Pantalla completa">
        <IconExpand />
      </button>
    </header>
  );
}

interface SidebarProps {
  state: AppState;
  view: View;
  setView: (v: View) => void;
  update: (fn: (s: AppState) => AppState) => void;
}

const NAV: { id: View; label: string; icon: ReactNode }[] = [
  { id: "practice", label: "Práctica", icon: <IconKeyboard size={30} /> },
  { id: "routes", label: "Rutas", icon: <IconMap size={30} /> },
  { id: "stats", label: "Estadísticas", icon: <IconChart size={30} /> },
  { id: "challenges", label: "Desafíos", icon: <IconTrophy size={30} /> },
  { id: "achievements", label: "Logros", icon: <IconMedal size={30} /> },
  { id: "settings", label: "Ajustes", icon: <IconGear size={30} /> },
];

export function Sidebar({ state, view, setView, update }: SidebarProps) {
  const lang = state.lang;
  const profile = lang ? getProfile(state, lang) : null;
  const prog = lang && profile ? progressToNext(lang, profile, state.settings) : { mastered: 0, total: 0 };
  const maxStage = lang ? LANGS[lang].stages.length : 1;
  const pct = prog.total ? (prog.mastered / prog.total) * 100 : 0;
  const mins = Math.floor((state.days[today()] ?? 0) / 60);
  const goal = state.settings.dailyGoalMin;
  const goalPct = Math.min(1, mins / goal);
  const R = 46;
  const C = 2 * Math.PI * R;
  const initials = state.settings.userName.trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?";

  return (
    <aside className="frame sidebar">
      <div className="profile">
        <div className="avatar">
          {initials}
          <span className="online" />
        </div>
        <div className="uname">{state.settings.userName || "Sin nombre"}</div>
        <div className="umotto">Code. Practice. Improve.</div>
      </div>
      <div className="lvl">
        <div className="lvl-head">
          NIVEL <b>{profile ? String(profile.stage + 1).padStart(2, "0") : "--"}</b>
          <span style={{ color: "var(--dim)", fontSize: 13 }}> / {String(maxStage).padStart(2, "0")}</span>
        </div>
        <div className="progress"><span style={{ width: `${pct}%` }} /></div>
        <div className="lvl-sub">
          {lang ? `${prog.mastered} / ${prog.total} símbolos dominados` : "Elegí un lenguaje para empezar"}
        </div>
      </div>
      <nav className="nav">
        {NAV.map((n) => (
          <button key={n.id} className={view === n.id ? "active" : ""} onClick={() => setView(n.id)}>
            {n.icon}
            {n.label}
            <span className="chev"><IconChevron /></span>
          </button>
        ))}
      </nav>
      <div className="goal">
        <h4>OBJETIVO DIARIO</h4>
        <div className="goal-row">
          <svg width="110" height="110" viewBox="0 0 110 110" aria-hidden="true">
            <circle cx="55" cy="55" r={R} stroke="#0a2133" strokeWidth="8" fill="none" />
            <circle
              cx="55" cy="55" r={R} stroke="var(--green)" strokeWidth="8" fill="none" strokeLinecap="round"
              strokeDasharray={`${C * goalPct} ${C}`} transform="rotate(-90 55 55)"
              style={{ filter: "drop-shadow(0 0 6px var(--green))" }}
            />
            <foreignObject x="35" y="35" width="40" height="40">
              <div style={{ color: "var(--cyan)", display: "grid", placeItems: "center", height: "100%" }}><IconClock size={30} /></div>
            </foreignObject>
          </svg>
          <div>
            <div className="goal-num">{mins} <small>/ {goal} MIN</small></div>
            <div className="goal-txt">{goalPct >= 1 ? "¡Objetivo cumplido!" : mins > 0 ? "Seguí así." : "¡A teclear!"}</div>
          </div>
        </div>
      </div>
      <MusicPlayer update={update} />
      <div className="version">v1.0.0</div>
    </aside>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <span className="b">NEONTYPE</span>
      <span>// MEJOR ESCRITURA. MEJOR CÓDIGO.</span>
      <span className="grow" />
      <span className="steps">
        <IconPulse size={20} /> ENFOQUE • PRÁCTICA • PROGRESO • RESULTADOS
      </span>
    </footer>
  );
}
