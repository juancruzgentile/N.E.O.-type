import { useEffect, useMemo, useRef, useState } from "react";
import { Avatar, AvatarPicker } from "./Avatar";

interface Props {
  name: string;
  avatar: string;
  onEnter: (name: string, avatar: string) => void;
}

const LOGO = [">", "_", " ", "N", "E", "O", "N", "T", "Y", "P", "E"];

/**
 * Pantalla de inicio: las letras del logo parpadean como un cartel de neón
 * hasta quedar encendidas. La primera vez pide nombre y avatar.
 */
export function Splash({ name, avatar, onEnter }: Props) {
  const firstRun = !name.trim();
  const [nameDraft, setNameDraft] = useState(name);
  const [avatarDraft, setAvatarDraft] = useState(avatar);
  const [ready, setReady] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // cada letra con su propio retraso y duración: se encienden "a su ritmo"
  const timings = useMemo(
    () => LOGO.map((_, i) => ({ delay: 0.15 + Math.random() * 0.9 + (i > 6 ? 0.15 : 0), dur: 0.7 + Math.random() * 0.6 })),
    [],
  );

  useEffect(() => {
    const t = setTimeout(() => {
      setReady(true);
      setTimeout(() => inputRef.current?.focus(), 50);
    }, 1900);
    return () => clearTimeout(t);
  }, []);

  const canEnter = !firstRun || nameDraft.trim().length > 0;

  const enter = () => {
    if (!canEnter || leaving) return;
    setLeaving(true);
    setTimeout(() => onEnter(nameDraft.trim(), avatarDraft), 650);
  };

  useEffect(() => {
    if (firstRun) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (!ready) setReady(true);
        else enter();
      }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  });

  return (
    <div className={`splash ${leaving ? "leaving" : ""}`} onClick={() => !firstRun && ready && enter()}>
      <div className="splash-grid" aria-hidden="true" />
      <div className="splash-inner">
        <h1 className="neon-logo" aria-label="NeonType">
          {LOGO.map((ch, i) => (
            <span
              key={i}
              className={`nl ${i < 2 ? "prompt" : i >= 7 ? "type" : ""}`}
              style={{ animationDelay: `${timings[i].delay}s`, animationDuration: `${timings[i].dur}s` }}
              aria-hidden="true"
            >
              {ch === " " ? " " : ch}
            </span>
          ))}
        </h1>
        <div className="splash-tag">ESCRIBE UN MEJOR MAÑANA</div>

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
              <div className="splash-press">Pulsá <b>ENTER</b> para entrar</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
