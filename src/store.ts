import { useCallback, useEffect, useRef, useState } from "react";
import type { AppState, LangId, Profile, Settings } from "./types";
import { emptyProfile } from "./engine/stats";
import { LANGS } from "./data/curriculum";
import { MAX_IMPORT_BYTES, sanitizeState } from "./sanitize";

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
  userName: "",
  theme: "cyber",
  animations: true,
  musicVolume: 0.7,
  musicStation: 0,
  avatar: "",
  showSplash: true,
};

export const initialState = (): AppState => ({
  version: 1,
  settings: { ...DEFAULT_SETTINGS },
  lang: null,
  mode: "guided",
  profiles: {},
  days: {},
  challenges: {},
  achievements: {},
});

const stagesOf = (l: LangId) => LANGS[l].stages.length;
const clean = (raw: unknown) => sanitizeState(raw, initialState(), stagesOf);

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initialState();
    if (raw.length > MAX_IMPORT_BYTES) return initialState();
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || (parsed as { version?: unknown }).version !== 1) return initialState();
    const state = clean(parsed);
    // "Juan Dev" era el nombre por defecto de versiones anteriores: se pide uno real
    if (state.settings.userName === "Juan Dev") state.settings.userName = "";
    return state;
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
    if (json.length > MAX_IMPORT_BYTES) throw new Error("el archivo es demasiado grande");
    let parsed: unknown;
    try {
      parsed = JSON.parse(json);
    } catch {
      throw new Error("no es un JSON válido");
    }
    if (!parsed || typeof parsed !== "object" || (parsed as { version?: unknown }).version !== 1) {
      throw new Error("no es una copia de seguridad de NeonType");
    }
    setState(clean(parsed));
  }, []);

  return { state, update, saved, exportJson, importJson };
}
