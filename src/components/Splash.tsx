import { useEffect, useMemo, useRef, useState } from "react";
import type { View } from "../types";
import { Avatar, AvatarPicker } from "./Avatar";

/** Opciones del menú principal. "continue" vuelve a donde estabas. */
export type MenuDest = "continue" | View;

const MENU: { dest: MenuDest; label: string; hint: string }[] = [
  { dest: "continue", label: "Continuar", hint: "Seguí donde lo dejaste" },
  { dest: "languages", label: "Lenguajes", hint: "Elegí qué practicar" },
  { dest: "challenges", label: "Desafíos y proyectos", hint: "Sprints, precisión y proyectos completos" },
  { dest: "library", label: "Biblioteca", hint: "Comandos y métodos de trabajo de cada lenguaje" },
  { dest: "settings", label: "Ajustes", hint: "Teclado, tema y copia de seguridad" },
];

interface Props {
  name: string;
  avatar: string;
  onEnter: (name: string, avatar: string, dest: MenuDest) => void;
  /** volviendo desde la app: el menú aparece enseguida, sin esperar la animación */
  quick?: boolean;
}

const LOGO = [">", "_", " ", "N", ".", "E", ".", "O", ".", "-", "T", "Y", "P", "E"];
/** desde acá el logo va en color de acento ("TYPE") */
const ACCENT_FROM = LOGO.indexOf("T");

/**
 * Pantalla de inicio: las letras del logo parpadean como un cartel de neón
 * hasta quedar encendidas. La primera vez pide nombre y avatar.
 */
export function Splash({ name, avatar, onEnter, quick = false }: Props) {
  const firstRun = !name.trim();
  const [nameDraft, setNameDraft] = useState(name);
  const [avatarDraft, setAvatarDraft] = useState(avatar);
  const [ready, setReady] = useState(quick);
  const [leaving, setLeaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLElement>(null);

  // cada letra con su propio retraso y duración: se encienden "a su ritmo"
  const timings = useMemo(
    () => LOGO.map((_, i) => ({ delay: 0.15 + Math.random() * 0.9 + (i >= ACCENT_FROM ? 0.15 : 0), dur: 0.7 + Math.random() * 0.6 })),
    [],
  );

  useEffect(() => {
    if (quick) {
      menuRef.current?.querySelector("button")?.focus();
      return;
    }
    const t = setTimeout(() => {
      setReady(true);
      setTimeout(() => inputRef.current?.focus(), 50);
    }, 1900);
    return () => clearTimeout(t);
  }, [quick]);

  const canEnter = !firstRun || nameDraft.trim().length > 0;

  const enter = (dest: MenuDest = "continue") => {
    if (!canEnter || leaving) return;
    setLeaving(true);
    setTimeout(() => onEnter(nameDraft.trim(), avatarDraft, dest), 650);
  };

  useEffect(() => {
    if (firstRun) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        // sobre una opción del menú, Enter y Espacio activan esa opción
        if ((e.target as HTMLElement).tagName === "BUTTON" && ready) return;
        e.preventDefault();
        if (!ready) setReady(true);
        else enter();
      }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  });

  return (
    <div className={`splash ${leaving ? "leaving" : ""}`}>
      <div className="splash-grid" aria-hidden="true" />
      <div className="splash-inner">
        <h1 className="neon-logo" aria-label="N.E.O.-type">
          {LOGO.map((ch, i) => (
            <span
              key={i}
              className={`nl ${i < 2 ? "prompt" : i >= ACCENT_FROM ? "type" : ""}`}
              style={{ animationDelay: `${timings[i].delay}s`, animationDuration: `${timings[i].dur}s` }}
              aria-hidden="true"
            >
              {ch === " " ? " " : ch}
            </span>
          ))}
        </h1>

        <div className={`splash-body ${ready ? "show" : ""}`} onClick={(e) => firstRun && e.stopPropagation()}>
          {firstRun ? (
            <form
              className="splash-form"
              onSubmit={(e) => {
                e.preventDefault();
                enter();
              }}
            >
              <label htmlFor="splash-name">¿Cómo te llamás?</label>
              <input
                id="splash-name" ref={inputRef} value={nameDraft} maxLength={24} autoComplete="off" placeholder="Tu nombre"
                onChange={(e) => setNameDraft(e.target.value)}
              />
              <div className="splash-sub">Elegí una imagen de perfil (o subí tu foto)</div>
              <AvatarPicker value={avatarDraft} name={nameDraft || "?"} onChange={setAvatarDraft} />
              <button className="btn primary" type="submit" disabled={!canEnter}>ENTRAR</button>
            </form>
          ) : (
            <div className="splash-welcome">
              <Avatar value={avatar} name={name} size={96} />
              <div className="splash-hello">Hola de nuevo, <b>{name}</b></div>
              <nav ref={menuRef} className="splash-menu" aria-label="Menú principal">
                {MENU.map((m) => (
                  <button key={m.dest} className={m.dest === "continue" ? "on" : ""} onClick={() => enter(m.dest)} tabIndex={ready ? 0 : -1}>
                    <span className="sm-label">{m.label}</span>
                    <span className="sm-hint">{m.hint}</span>
                  </button>
                ))}
              </nav>
              <div className="splash-press">Pulsá <b>ENTER</b> para continuar</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
