import { useCallback, useEffect, useRef, useState } from "react";
import type { AppState, LangId, Profile, Settings } from "./types";
import { emptyProfile } from "./engine/stats";
import { stageCount } from "./data/curriculum";
import { MAX_IMPORT_BYTES, byteLength, sanitizeState } from "./sanitize";

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
  tutorialDone: false,
  keymap: {},
  distro: "ubuntu",
  dbEngine: "sqlite",
};

export const initialState = (): AppState => ({
  version: 1,
  settings: { ...DEFAULT_SETTINGS },
  lang: null,
  mode: "guided",
  profiles: {},
  days: {},
  challenges: {},
  projects: {},
  review: {},
  achievements: {},
});

const stagesOf = (l: LangId) => stageCount(l);
const clean = (raw: unknown) => sanitizeState(raw, initialState(), stagesOf);

/** Lee el estado guardado; null si no hay o no es válido. */
function fromStorage(raw: string | null): AppState | null {
  try {
    if (!raw) return null;
    if (byteLength(raw) > MAX_IMPORT_BYTES) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || (parsed as { version?: unknown }).version !== 1) return null;
    const state = clean(parsed);
    // "Juan Dev" era el nombre por defecto de versiones anteriores: se pide uno real
    if (state.settings.userName === "Juan Dev") state.settings.userName = "";
    // quien ya practicaba antes de que existiera el tutorial no lo ve de golpe
    const rawSettings = (parsed as { settings?: unknown }).settings;
    const hadFlag = !!rawSettings && typeof rawSettings === "object" && "tutorialDone" in rawSettings;
    if (!hadFlag && Object.keys(state.days).length > 0) state.settings.tutorialDone = true;
    return state;
  } catch {
    return null;
  }
}

function readRaw(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/** Partes del estado que se combinan clave por clave. */
const MAPS = ["settings", "profiles", "days", "challenges", "projects", "review", "achievements"] as const;

/**
 * Combina los cambios de esta ventana (`ours`) con los de otra (`theirs`),
 * ambos hechos a partir de `base`. Gana lo que cambió esta ventana; el resto
 * se toma de la otra. Se compara clave por clave dentro de cada sección.
 */
export function mergeStates(base: AppState, ours: AppState, theirs: AppState): AppState {
  const out = { ...theirs } as AppState;
  if (ours.lang !== base.lang) out.lang = ours.lang;
  if (ours.mode !== base.mode) out.mode = ours.mode;
  for (const k of MAPS) {
    const b = base[k] as Record<string, unknown>;
    const o = ours[k] as Record<string, unknown>;
    const merged: Record<string, unknown> = { ...(theirs[k] as Record<string, unknown>) };
    for (const key of new Set([...Object.keys(b), ...Object.keys(o)])) {
      if (same(o[key], b[key])) continue;
      if (key in o) merged[key] = o[key];
      else delete merged[key];
    }
    (out as unknown as Record<string, unknown>)[k] = merged;
  }
  return out;
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

/** Copia de seguridad en JSON compacto. Falla si no se podría volver a importar. */
export function serializeState(state: AppState): string {
  // sin sangría: con ella una copia válida podía superar el límite de importación
  const json = JSON.stringify(state);
  if (byteLength(json) > MAX_IMPORT_BYTES) throw new Error("el progreso supera el límite de 5 MB y no se podría volver a importar");
  return json;
}

/** Lee y valida una copia de seguridad. */
export function parseBackup(json: string): AppState {
  if (byteLength(json) > MAX_IMPORT_BYTES) throw new Error("el archivo es demasiado grande");
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error("no es un JSON válido");
  }
  if (!parsed || typeof parsed !== "object" || (parsed as { version?: unknown }).version !== 1) {
    throw new Error("no es una copia de seguridad de N.E.O.-type");
  }
  return clean(parsed);
}

export function useAppState() {
  // último contenido de localStorage que esta ventana conoce, y el estado que representa
  const known = useRef<string | null>(null);
  const base = useRef<AppState | null>(null);
  const [state, setState] = useState<AppState>(() => {
    const raw = readRaw();
    const loaded = fromStorage(raw) ?? initialState();
    known.current = raw;
    base.current = loaded;
    return loaded;
  });
  const [saved, setSaved] = useState(true);

  // otra ventana guardó: se suman sus cambios sin pisar los de esta
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== KEY || e.newValue === null || e.newValue === known.current) return;
      const theirs = fromStorage(e.newValue);
      if (!theirs) return;
      const b = base.current ?? theirs;
      known.current = e.newValue;
      base.current = theirs;
      setState((ours) => mergeStates(b, ours, theirs));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // al abrir no se guarda: escribir sin cambios reales solo suma trabajo al navegador
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    let next = state;
    let json = JSON.stringify(next);
    if (json === known.current) {
      base.current = next;
      return;
    }
    // otra ventana escribió y su aviso todavía no llegó: se combina antes de guardar
    const raw = readRaw();
    if (raw !== known.current) {
      const theirs = fromStorage(raw);
      if (theirs && base.current) {
        next = mergeStates(base.current, state, theirs);
        json = JSON.stringify(next);
      }
    }
    try {
      localStorage.setItem(KEY, json);
      known.current = json;
      base.current = next;
      setSaved(true);
    } catch {
      setSaved(false);
    }
    if (next !== state) setState(next);
  }, [state]);

  const update = useCallback((fn: (s: AppState) => AppState) => setState(fn), []);

  const exportJson = useCallback(() => serializeState(state), [state]);
  const importJson = useCallback((json: string) => setState(parseBackup(json)), []);

  return { state, update, saved, exportJson, importJson };
}
