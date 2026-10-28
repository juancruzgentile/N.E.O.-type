import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { AppState } from "../types";
import { STATIONS, music } from "../audio/music";
import { addTracks, loadTracks, removeTrack } from "../audio/tracks";
import { IconMusic, IconNext, IconPause, IconPlay, IconPrev, IconVolume } from "./icons";

type Update = (fn: (s: AppState) => AppState) => void;

export const useMusic = () => useSyncExternalStore((cb) => music.subscribe(cb), () => music.snap);

/** Sincroniza el motor con los ajustes guardados y carga las canciones del usuario. */
export function useMusicInit(state: AppState) {
  const { musicVolume, musicStation } = state.settings;
  // las canciones se cargan una sola vez
  useEffect(() => {
    void loadTracks().then((t) => music.setTracks(t));
  }, []);
  // volumen y estación se sincronizan siempre (también al importar o restablecer)
  useEffect(() => {
    if (music.snap.volume !== musicVolume) music.setVolume(musicVolume);
  }, [musicVolume]);
  useEffect(() => {
    if (music.snap.station === musicStation) return;
    // si suena una estación, se cambia de verdad; si no, solo queda elegida
    if (music.snap.playing && music.snap.source === "station") music.playStation(musicStation);
    else music.setStation(musicStation);
  }, [musicStation]);
}

export function MusicPlayer({ update }: { update: Update }) {
  const snap = useMusic();
  const fileRef = useRef<HTMLInputElement>(null);
  const [showList, setShowList] = useState(false);
  const isUser = snap.source === "user";
  const st = STATIONS[snap.station];
  const title = isUser ? snap.userTracks[snap.userIndex]?.name ?? "Mis canciones" : st.name;
  const sub = isUser ? `Mis canciones · ${snap.userIndex + 1}/${snap.userTracks.length}` : st.desc;

  const saveStation = (i: number) =>
    update((s) => ({ ...s, settings: { ...s.settings, musicStation: (i + STATIONS.length) % STATIONS.length } }));

  const go = (dir: number) => {
    music.next(dir);
    if (!isUser) saveStation(music.snap.station);
  };

  const onFiles = async (files: File[]) => {
    if (!files?.length) return;
    const { tracks, rejected } = await addTracks(files);
    music.setTracks(tracks);
    setShowList(true);
    if (rejected.length) alert("No se agregaron:\n" + rejected.join("\n"));
  };

  return (
    <div className="player">
      <h4>
        <IconMusic size={18} /> MÚSICA
        {snap.playing && (
          <span className="eq" aria-hidden="true"><i /><i /><i /></span>
        )}
      </h4>
      <div className="player-now">
        <span className="st-dot" style={{ background: isUser ? "var(--cyan)" : st.color, color: isUser ? "var(--cyan)" : st.color }} />
        <div className="player-txt">
          <div className="player-title" title={title}>{title}</div>
          <div className="player-sub">{sub}</div>
        </div>
      </div>
      <div className="player-ctrl">
        <button className="icon-btn" onClick={() => go(-1)} title="Anterior" aria-label="Anterior"><IconPrev size={20} /></button>
        <button className="play-btn" onClick={() => music.toggle()} title={snap.playing ? "Pausa" : "Reproducir"} aria-label={snap.playing ? "Pausa" : "Reproducir"}>
          {snap.playing ? <IconPause size={22} /> : <IconPlay size={22} />}
        </button>
        <button className="icon-btn" onClick={() => go(1)} title="Siguiente" aria-label="Siguiente"><IconNext size={20} /></button>
        <span className="vol">
          <IconVolume size={18} />
          <input
            type="range" min={0} max={1} step={0.01} value={snap.volume} aria-label="Volumen"
            onChange={(e) => music.setVolume(Number(e.target.value))}
            onPointerUp={() => update((s) => ({ ...s, settings: { ...s.settings, musicVolume: music.snap.volume } }))}
            onKeyUp={() => update((s) => ({ ...s, settings: { ...s.settings, musicVolume: music.snap.volume } }))}
          />
        </span>
      </div>
      <div className="player-src">
        <button className={!isUser ? "on" : ""} onClick={() => music.playStation(snap.station)}>Estaciones</button>
        <button
          className={isUser ? "on" : ""}
          onClick={() => (snap.userTracks.length ? music.playUser(snap.userIndex) : fileRef.current?.click())}
        >
          Mis canciones{snap.userTracks.length ? ` (${snap.userTracks.length})` : ""}
        </button>
        <button onClick={() => setShowList((v) => !v)} title="Administrar canciones">⋯</button>
      </div>
      {showList && (
        <div className="track-list">
          {snap.userTracks.length === 0 && <div className="player-sub">Agregá MP3, OGG o WAV: quedan guardados en este navegador.</div>}
          {snap.userTracks.map((t, i) => (
            <div key={t.id} className={`track ${isUser && i === snap.userIndex ? "on" : ""}`}>
              <button className="track-name" onClick={() => music.playUser(i)} title={t.name}>{t.name}</button>
              <button
                className="icon-btn" aria-label={`Quitar ${t.name}`} title="Quitar"
                onClick={async () => {
                  const tracks = await removeTrack(t.id);
                  if (isUser && i === snap.userIndex) music.pause();
                  music.setTracks(tracks);
                }}
              >
                ×
              </button>
            </div>
          ))}
          <button className="btn small" onClick={() => fileRef.current?.click()}>+ Agregar canciones</button>
        </div>
      )}
      <input ref={fileRef} type="file" accept="audio/*" multiple hidden onChange={(e) => { const list = Array.from(e.target.files ?? []); e.target.value = ""; void onFiles(list); }} />
    </div>
  );
}

/** Botón compacto para la cabecera (visible también en pantallas chicas). */
export function MusicMini() {
  const snap = useMusic();
  const name = snap.source === "user" ? snap.userTracks[snap.userIndex]?.name : STATIONS[snap.station].name;
  return (
    <button className="icon-btn music-mini" onClick={() => music.toggle()} title={snap.playing ? `Pausar: ${name}` : "Reproducir música"}>
      {snap.playing ? <IconPause size={20} /> : <IconMusic size={20} />}
    </button>
  );
}
