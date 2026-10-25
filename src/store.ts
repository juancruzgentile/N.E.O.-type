import { useCallback, useEffect, useRef, useState } from "react";
import type { AppState, LangId, Profile, Settings } from "./types";
import { emptyProfile } from "./engine/stats";

const KEY = "neontype:v1";

export const DEFAULT_SETTINGS: Settings = {
  layout: "it",
  targetWpm: 30,
  minSamples: 20,
  minAccuracy: 95,
  errorMode: "block",
  sound: false,
  showKeyboard: true,
  excludeMissing: true,
  dailyGoalMin: 20,
  userName: "Juan Dev",
};

export const initialState = (): AppState => ({
  version: 1,
  settings: { ...DEFAULT_SETTINGS },
  lang: null,
  mode: "guided",
  profiles: {},
  days: {},
  challenges: {},
});

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initialState();
    const parsed = JSON.parse(raw) as AppState;
    if (parsed.version !== 1) return initialState();
    return { ...initialState(), ...parsed, settings: { ...DEFAULT_SETTINGS, ...parsed.settings } };
  } catch {
    return initialState();
  }
}

export const profileKey = (lang: LangId, layout: string) => `${lang}:${layout}`;

export function getProfile(state: AppState, lang: LangId): Profile {
  return state.profiles[profileKey(lang, state.settings.layout)] ?? emptyProfile();
}

export const today = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function streakDays(days: Record<string, number>): number {
  let streak = 0;
  const d = new Date();
  // si hoy todavía no practicó, la racha cuenta desde ayer
  if (!days[today(d)]) d.setDate(d.getDate() - 1);
  while (days[today(d)]) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export function useAppState() {
  const [state, setState] = useState<AppState>(load);
  const [saved, setSaved] = useState(true);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      setSaved(true);
    } catch {
      setSaved(false);
    }
  }, [state]);

  const update = useCallback((fn: (s: AppState) => AppState) => setState(fn), []);

  const exportJson = useCallback(() => JSON.stringify(state, null, 2), [state]);

  const importJson = useCallback((json: string) => {
    const parsed = JSON.parse(json) as AppState;
    if (parsed.version !== 1 || !parsed.settings) throw new Error("Archivo no válido");
    setState({ ...initialState(), ...parsed, settings: { ...DEFAULT_SETTINGS, ...parsed.settings } });
  }, []);

  return { state, update, saved, exportJson, importJson };
}
