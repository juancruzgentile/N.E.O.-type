// Motor de música generativa con Web Audio: sin archivos, sin librerías.
// Cada estación es un secuenciador con variación aleatoria, así que nunca suena exactamente igual.

type Bus = {
  ctx: AudioContext;
  /** entrada seca de la música */
  dry: AudioNode;
  reverb: AudioNode;
  delay: AudioNode;
  noise: AudioBuffer;
  accent: (t: number, strength: number) => void;
};

const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12);
const rnd = Math.random;
const pick = <T,>(a: readonly T[]): T => a[Math.floor(rnd() * a.length)];
const chance = (p: number) => rnd() < p;

// ───────────────────────────── instrumentos ─────────────────────────────

function env(g: GainNode, t: number, peak: number, attack: number, decay: number) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(peak, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
}

function send(bus: Bus, node: AudioNode, rev = 0.3, dly = 0) {
  const ctx = bus.ctx;
  node.connect(bus.dry);
  if (rev > 0) {
    const r = ctx.createGain();
    r.gain.value = rev;
    node.connect(r).connect(bus.reverb);
  }
  if (dly > 0) {
    const d = ctx.createGain();
    d.gain.value = dly;
    node.connect(d).connect(bus.delay);
  }
}

/** Piano eléctrico tipo Rhodes: fundamental + armónicos + "tine" corto. */
function rhodes(bus: Bus, midi: number, t: number, dur: number, vel = 0.5, rev = 0.35) {
  const { ctx } = bus;
  const f = mtof(midi);
  const out = ctx.createGain();
  env(out, t, 0.07 * vel, 0.006, dur + 0.8);
  const partials: [number, number, number][] = [[1, 1, dur + 0.8], [2, 0.25, dur * 0.6], [7.1, 0.08, 0.12]];
  for (const [mult, gain, dec] of partials) {
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.value = f * mult;
    const g = ctx.createGain();
    env(g, t, gain, 0.004, dec);
    o.connect(g).connect(out);
    o.start(t);
    o.stop(t + dur + 1);
  }
  // trémolo suave
  const lfo = ctx.createOscillator();
  const depth = ctx.createGain();
  lfo.frequency.value = 4.2;
  depth.gain.value = 0.012 * vel;
  lfo.connect(depth).connect(out.gain);
  lfo.start(t);
  lfo.stop(t + dur + 1);
  send(bus, out, rev, 0.12);
}

/** Pad: osciladores desafinados con filtro y envolvente lenta. */
function pad(bus: Bus, notes: number[], t: number, dur: number, opts: { type?: OscillatorType; cutoff?: number; gain?: number; attack?: number; rev?: number } = {}) {
  const { ctx } = bus;
  const { type = "sawtooth", cutoff = 900, gain = 0.035, attack = 1.6, rev = 0.6 } = opts;
  const filt = ctx.createBiquadFilter();
  filt.type = "lowpass";
  filt.frequency.value = cutoff;
  filt.Q.value = 0.4;
  const out = ctx.createGain();
  // normaliza por cantidad de osciladores para que los acordes grandes no saturen
  const level = (gain * 2.2) / Math.sqrt(notes.length * 2);
  out.gain.setValueAtTime(0.0001, t);
  out.gain.linearRampToValueAtTime(level, t + attack);
  out.gain.setValueAtTime(level, t + Math.max(attack, dur - 1.5));
  out.gain.exponentialRampToValueAtTime(0.0001, t + dur + 1.5);
  for (const n of notes) {
    for (const det of [-7, 6]) {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.value = mtof(n);
      o.detune.value = det + (rnd() - 0.5) * 4;
      o.connect(filt);
      o.start(t);
      o.stop(t + dur + 2);
    }
  }
  filt.connect(out);
  send(bus, out, rev);
}

/** Campana: parciales inarmónicos. */
function bell(bus: Bus, midi: number, t: number, vel = 0.5, rev = 0.8) {
  const { ctx } = bus;
  const f = mtof(midi);
  const out = ctx.createGain();
  out.gain.value = 0.05 * vel;
  for (const [mult, g0, dec] of [[1, 1, 3.2], [2.76, 0.4, 1.8], [5.4, 0.18, 0.9], [8.93, 0.08, 0.4]] as const) {
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.value = f * mult;
    const g = ctx.createGain();
    env(g, t, g0, 0.003, dec);
    o.connect(g).connect(out);
    o.start(t);
    o.stop(t + dec + 0.1);
  }
  send(bus, out, rev, 0.2);
}

/** Cuerda pulsada suave (koto/arpa). */
function pluck(bus: Bus, midi: number, t: number, vel = 0.5, rev = 0.5, dly = 0.25) {
  const { ctx } = bus;
  const o = ctx.createOscillator();
  o.type = "triangle";
  o.frequency.value = mtof(midi);
  const filt = ctx.createBiquadFilter();
  filt.type = "lowpass";
  filt.frequency.setValueAtTime(4000, t);
  filt.frequency.exponentialRampToValueAtTime(600, t + 0.4);
  const g = ctx.createGain();
  env(g, t, 0.09 * vel, 0.003, 1.1);
  o.connect(filt).connect(g);
  o.start(t);
  o.stop(t + 1.3);
  send(bus, g, rev, dly);
}

function bass(bus: Bus, midi: number, t: number, dur: number, vel = 0.6) {
  const { ctx } = bus;
  const g = ctx.createGain();
  env(g, t, 0.16 * vel, 0.01, dur);
  const filt = ctx.createBiquadFilter();
  filt.type = "lowpass";
  filt.frequency.value = 420;
  for (const type of ["sine", "triangle"] as OscillatorType[]) {
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.value = mtof(midi);
    o.connect(filt);
    o.start(t);
    o.stop(t + dur + 0.1);
  }
  filt.connect(g);
  send(bus, g, 0.05);
}

function kick(bus: Bus, t: number, vel = 0.7) {
  const { ctx } = bus;
  const o = ctx.createOscillator();
  o.frequency.setValueAtTime(115, t);
  o.frequency.exponentialRampToValueAtTime(42, t + 0.14);
  const g = ctx.createGain();
  env(g, t, 0.32 * vel, 0.002, 0.32);
  o.connect(g);
  o.start(t);
  o.stop(t + 0.4);
  send(bus, g, 0);
  bus.accent(t, vel);
}

function noiseHit(bus: Bus, t: number, opts: { type: BiquadFilterType; freq: number; q?: number; gain: number; decay: number; rev?: number }) {
  const { ctx } = bus;
  const src = ctx.createBufferSource();
  src.buffer = bus.noise;
  const filt = ctx.createBiquadFilter();
  filt.type = opts.type;
  filt.frequency.value = opts.freq;
  filt.Q.value = opts.q ?? 0.8;
  const g = ctx.createGain();
  env(g, t, opts.gain, 0.002, opts.decay);
  src.connect(filt).connect(g);
  src.start(t, rnd() * 1.5);
  src.stop(t + opts.decay + 0.05);
  send(bus, g, opts.rev ?? 0.1);
}

const snare = (bus: Bus, t: number, vel = 0.5) =>
  noiseHit(bus, t, { type: "bandpass", freq: 1900, q: 0.7, gain: 0.12 * vel, decay: 0.18, rev: 0.25 });
const hat = (bus: Bus, t: number, vel = 0.4, open = false) =>
  noiseHit(bus, t, { type: "highpass", freq: 7500, gain: 0.05 * vel, decay: open ? 0.22 : 0.04 });
const brush = (bus: Bus, t: number, vel = 0.4) =>
  noiseHit(bus, t, { type: "bandpass", freq: 3500, q: 0.5, gain: 0.04 * vel, decay: 0.16, rev: 0.15 });

// ───────────────────────────── fondos continuos ─────────────────────────────

type Bed = { stop: (t: number) => void };

function noiseBed(bus: Bus, buffer: AudioBuffer, opts: { lp: number; hp: number; gain: number; lfo?: number }): Bed {
  const { ctx } = bus;
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.loop = true;
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = opts.lp;
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = opts.hp;
  const g = ctx.createGain();
  const t = ctx.currentTime;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(opts.gain, t + 3);
  src.connect(hp).connect(lp).connect(g).connect(bus.dry);
  let lfo: OscillatorNode | null = null;
  if (opts.lfo) {
    lfo = ctx.createOscillator();
    lfo.frequency.value = opts.lfo;
    const depth = ctx.createGain();
    depth.gain.value = opts.gain * 0.35;
    lfo.connect(depth).connect(g.gain);
    lfo.start();
  }
  src.start(t, rnd() * 2);
  return {
    stop: (at) => {
      g.gain.cancelScheduledValues(at);
      g.gain.setValueAtTime(g.gain.value, at);
      g.gain.linearRampToValueAtTime(0.0001, at + 1.2);
      src.stop(at + 1.3);
      lfo?.stop(at + 1.3);
    },
  };
}

// ───────────────────────────── estaciones ─────────────────────────────

interface Chord { root: number; notes: number[] }
const C = (root: number, ...notes: number[]): Chord => ({ root, notes });

export interface StationDef {
  id: string;
  name: string;
  desc: string;
  color: string;
  bpm: number;
  swing?: number;
  /** frecuencia de corte del filtro general (calidez) */
  warmth: number;
  beds?: (bus: Bus, buffers: Buffers) => Bed[];
  step: (bus: Bus, s: number, t: number, st: SeqState) => void;
}

interface SeqState {
  prog: Chord[];
  chord: Chord;
  melody: number;
  data: Record<string, number>;
}

interface Buffers {
  white: AudioBuffer;
  brown: AudioBuffer;
  vinyl: AudioBuffer;
}

const LOFI_PROGS = [
  [C(38, 53, 57, 60, 64), C(43, 53, 57, 59, 64), C(36, 52, 55, 59, 62), C(45, 55, 60, 62, 64)],
  [C(41, 52, 57, 60, 64), C(40, 50, 55, 59, 62), C(38, 53, 57, 60, 65), C(43, 53, 55, 59, 64)],
  [C(36, 52, 55, 59, 62), C(45, 52, 55, 60, 64), C(41, 52, 57, 60, 64), C(43, 53, 57, 59, 62)],
];
const JAZZ_PROGS = [
  [C(43, 53, 57, 58, 62), C(36, 52, 55, 58, 62), C(41, 52, 57, 60, 64), C(38, 53, 57, 60, 65)],
  [C(36, 51, 55, 58, 62), C(41, 51, 55, 57, 62), C(34, 50, 53, 57, 60), C(39, 50, 53, 55, 60)],
];
const WAVE_PROGS = [
  [C(45, 57, 60, 64), C(41, 57, 60, 65), C(48, 55, 60, 64), C(43, 55, 59, 62)],
  [C(45, 57, 60, 64), C(43, 55, 59, 62), C(41, 57, 60, 65), C(40, 56, 59, 64)],
];
const RAIN_PROGS = [
  [C(41, 57, 60, 64, 67), C(40, 55, 59, 62, 67), C(38, 57, 60, 62, 65), C(36, 55, 59, 62, 64)],
  [C(45, 55, 60, 64, 67), C(41, 57, 60, 64, 69), C(43, 55, 59, 62, 66), C(36, 52, 55, 59, 62)],
];
const SPACE_PROGS = [
  [C(38, 50, 57, 62, 64, 69), C(34, 50, 53, 58, 62, 65), C(36, 48, 55, 60, 64, 67), C(33, 45, 52, 57, 60, 64)],
];
const PENTA_D = [62, 65, 67, 69, 72, 74, 77, 79, 81];

/** Paso de melodía por escala con caminata aleatoria. */
function walk(st: SeqState, scale: number[]): number {
  st.melody = Math.max(0, Math.min(scale.length - 1, st.melody + pick([-2, -1, -1, 1, 1, 2, 0])));
  return scale[st.melody];
}

const chordScale = (ch: Chord) => [...ch.notes.map((n) => n + 12), ...ch.notes.map((n) => n + 24)].sort((a, b) => a - b);

function nextChord(st: SeqState, bar: number, progs: Chord[][], every = 1) {
  if (bar % (progs[0].length * every * 2) === 0) st.prog = pick(progs);
  st.chord = st.prog[Math.floor(bar / every) % st.prog.length];
}

export const STATIONS: StationDef[] = [
  {
    id: "lofi", name: "Lo-fi nocturno", desc: "Rhodes, vinilo y batería suave", color: "#b47bff",
    bpm: 72, swing: 0.16, warmth: 2600,
    beds: (bus, b) => [noiseBed(bus, b.vinyl, { lp: 6000, hp: 900, gain: 0.05 })],
    step: (bus, s, t, st) => {
      const step = s % 16;
      const bar = Math.floor(s / 16);
      const beat = 60 / 72;
      if (step === 0) {
        nextChord(st, bar, LOFI_PROGS);
        for (const n of st.chord.notes) rhodes(bus, n, t + rnd() * 0.02, beat * 2.2, 0.85);
        bass(bus, st.chord.root, t, beat * 1.5);
        bus.accent(t, 0.4);
      }
      if (step === 8 && chance(0.55)) for (const n of st.chord.notes.slice(1)) rhodes(bus, n, t + rnd() * 0.02, beat * 1.4, 0.6);
      if (step === 14 && chance(0.3)) for (const n of st.chord.notes.slice(1)) rhodes(bus, n, t, beat * 0.8, 0.3);
      if (step === 10 && chance(0.7)) bass(bus, st.chord.root + pick([7, 12, 0]), t, beat * 0.8, 0.5);
      if (step === 0 || (step === 10 && chance(0.6)) || (step === 7 && chance(0.25))) kick(bus, t, 0.6);
      if (step === 4 || step === 12) snare(bus, t, 0.45);
      if (step % 2 === 0 && chance(0.85)) hat(bus, t, 0.25 + rnd() * 0.25);
      if (step % 2 === 0 && chance(0.12)) rhodes(bus, walk(st, chordScale(st.chord)), t, beat * 0.7, 0.35, 0.5);
    },
  },
  {
    id: "rain", name: "Lluvia de neón", desc: "Pads largos bajo la lluvia", color: "#19d3ff",
    bpm: 60, warmth: 3200,
    beds: (bus, b) => [noiseBed(bus, b.white, { lp: 1400, hp: 350, gain: 0.07, lfo: 0.05 })],
    step: (bus, s, t, st) => {
      const bar = Math.floor(s / 16);
      if (s % 32 === 0) {
        nextChord(st, bar / 2, RAIN_PROGS);
        pad(bus, st.chord.notes, t, 8.5, { type: "triangle", cutoff: 1300, gain: 0.05, attack: 2.5 });
        bass(bus, st.chord.root, t, 6, 0.35);
        bus.accent(t, 0.35);
      }
      if (s % 2 === 0 && chance(0.07)) rhodes(bus, walk(st, chordScale(st.chord)), t, 2, 0.35, 0.7);
    },
  },
  {
    id: "synthwave", name: "Synthwave lento", desc: "Arpegios, neón y carretera", color: "#ff4fd8",
    bpm: 84, warmth: 4200,
    step: (bus, s, t, st) => {
      const step = s % 16;
      const bar = Math.floor(s / 16);
      const beat = 60 / 84;
      if (step === 0) {
        nextChord(st, bar, WAVE_PROGS);
        pad(bus, st.chord.notes.map((n) => n), t, beat * 4, { cutoff: 1100, gain: 0.03, attack: 0.6, rev: 0.5 });
        st.data.arp = Math.floor(rnd() * 3);
      }
      const tones = chordScale(st.chord);
      const order = [[0, 1, 2, 3, 4, 3, 2, 1], [0, 2, 1, 3, 2, 4, 3, 1], [4, 3, 2, 1, 0, 1, 2, 3]][st.data.arp ?? 0];
      if (chance(0.92)) pluck(bus, tones[order[step % 8]], t, 0.45, 0.3, 0.35);
      if (step % 2 === 0) bass(bus, st.chord.root - 12 + (step % 4 === 2 ? 12 : 0), t, beat * 0.45, 0.55);
      if (step % 4 === 0) kick(bus, t, 0.55);
      if (step === 4 || step === 12) snare(bus, t, 0.5);
      if (step % 4 === 2) hat(bus, t, 0.3, chance(0.2));
    },
  },
  {
    id: "space", name: "Espacio profundo", desc: "Drones y campanas lejanas", color: "#4f86ff",
    bpm: 40, warmth: 2400,
    beds: (bus, b) => [noiseBed(bus, b.brown, { lp: 300, hp: 40, gain: 0.05, lfo: 0.03 })],
    step: (bus, s, t, st) => {
      if (s % 32 === 0) {
        nextChord(st, s / 32, SPACE_PROGS);
        pad(bus, st.chord.notes, t, 13, { type: "sine", cutoff: 2000, gain: 0.05, attack: 4, rev: 0.9 });
        pad(bus, [st.chord.notes[st.chord.notes.length - 1] + 12], t + 2, 10, { type: "triangle", cutoff: 3000, gain: 0.012, attack: 4, rev: 1 });
        bus.accent(t, 0.3);
      }
      if (chance(0.045)) bell(bus, walk(st, chordScale(st.chord)) + 12, t, 0.35, 1);
    },
  },
  {
    id: "zen", name: "Jardín zen", desc: "Pentatónica, cuerdas y agua", color: "#2bff9a",
    bpm: 66, warmth: 3600,
    beds: (bus, b) => [noiseBed(bus, b.brown, { lp: 900, hp: 200, gain: 0.025, lfo: 0.08 })],
    step: (bus, s, t, st) => {
      if (s % 64 === 0) {
        pad(bus, [38, 45, 50], t, 15, { type: "sine", cutoff: 1200, gain: 0.05, attack: 3 });
        bus.accent(t, 0.3);
      }
      // frases con silencios: 4 compases de toque, a veces 2 de descanso
      const phrase = Math.floor(s / 32) % 3;
      if (s % 2 === 0 && phrase !== 2 && chance(0.28)) {
        pluck(bus, walk(st, PENTA_D), t, 0.55, 0.6, 0.3);
        bus.accent(t, 0.15);
      }
      if (chance(0.012)) bell(bus, pick(PENTA_D) + 12, t, 0.3);
    },
  },
  {
    id: "jazz", name: "Café jazz", desc: "Séptimas, walking bass y escobillas", color: "#ffd23f",
    bpm: 96, swing: 0.3, warmth: 3000,
    beds: (bus, b) => [noiseBed(bus, b.vinyl, { lp: 5000, hp: 1200, gain: 0.025 })],
    step: (bus, s, t, st) => {
      const step = s % 16;
      const bar = Math.floor(s / 16);
      const beat = 60 / 96;
      if (step === 0) nextChord(st, bar, JAZZ_PROGS);
      // walking bass: negras
      if (step % 4 === 0) {
        const root = st.chord.root;
        const next = st.prog[(bar + 1) % st.prog.length].root;
        const line = [root, root + pick([3, 4, 7]), root + pick([7, 9, 12]), next + pick([-1, 1])];
        bass(bus, line[step / 4], t, beat * 0.9, 0.55);
        bus.accent(t, step === 0 ? 0.35 : 0.15);
      }
      // comping del piano en contratiempos
      if ((step === 0 && chance(0.6)) || (step % 4 === 2 && chance(0.28)) || (step === 6 && chance(0.4))) {
        for (const n of st.chord.notes.slice(1)) rhodes(bus, n, t + rnd() * 0.015, beat * pick([0.5, 1, 1.5]), 0.4);
      }
      if (step % 4 === 0) hat(bus, t, 0.35, true);
      if (step % 8 === 6) hat(bus, t, 0.3);
      if (step % 2 === 0) brush(bus, t, 0.25 + rnd() * 0.3);
      if (step % 4 === 2 && chance(0.15)) rhodes(bus, walk(st, chordScale(st.chord)) + 12, t, beat, 0.35, 0.4);
    },
  },
  {
    id: "focus", name: "Foco puro", desc: "Ruido marrón y armonía mínima", color: "#7f9fb3",
    bpm: 50, warmth: 1800,
    beds: (bus, b) => [noiseBed(bus, b.brown, { lp: 600, hp: 30, gain: 0.11 })],
    step: (bus, s, t, st) => {
      if (s % 64 === 0) {
        nextChord(st, s / 64, RAIN_PROGS);
        pad(bus, st.chord.notes.slice(0, 3), t, 18, { type: "sine", cutoff: 1000, gain: 0.03, attack: 5, rev: 0.7 });
        bus.accent(t, 0.2);
      }
    },
  },
];

// ───────────────────────────── motor ─────────────────────────────

export interface UserTrack { id: string; name: string; blob: Blob }

export interface MusicSnapshot {
  playing: boolean;
  source: "station" | "user";
  station: number;
  userIndex: number;
  userTracks: { id: string; name: string }[];
  volume: number;
}

function makeBuffers(ctx: AudioContext): Buffers {
  const len = ctx.sampleRate * 3;
  const white = ctx.createBuffer(2, len, ctx.sampleRate);
  const brown = ctx.createBuffer(2, len, ctx.sampleRate);
  const vinyl = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const w = white.getChannelData(ch);
    const b = brown.getChannelData(ch);
    const v = vinyl.getChannelData(ch);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const x = Math.random() * 2 - 1;
      w[i] = x;
      last = (last + 0.02 * x) / 1.02;
      b[i] = last * 3.5;
      // vinilo: siseo muy bajo + crujidos esporádicos
      v[i] = x * 0.08 + (Math.random() < 0.0006 ? (Math.random() * 2 - 1) * 0.9 : 0);
    }
  }
  return { white, brown, vinyl };
}

function makeImpulse(ctx: AudioContext, seconds: number): AudioBuffer {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
  }
  return buf;
}

class MusicEngine {
  private ctx: AudioContext | null = null;
  private bus: Bus | null = null;
  private buffers: Buffers | null = null;
  private master: GainNode | null = null;
  private warmth: BiquadFilterNode | null = null;
  private analyser: AnalyserNode | null = null;
  private timer: number | null = null;
  private beds: Bed[] = [];
  private stepIndex = 0;
  private nextTime = 0;
  private seq: SeqState = { prog: LOFI_PROGS[0], chord: LOFI_PROGS[0][0], melody: 4, data: {} };
  private accents: { t: number; s: number }[] = [];
  private audioEl: HTMLAudioElement | null = null;
  private audioSrc: MediaElementAudioSourceNode | null = null;
  private tracks: UserTrack[] = [];
  private listeners = new Set<() => void>();
  private timeData = new Uint8Array(256);
  snap: MusicSnapshot = { playing: false, source: "station", station: 0, userIndex: 0, userTracks: [], volume: 0.5 };

  subscribe(fn: () => void) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private emit(patch: Partial<MusicSnapshot>) {
    this.snap = { ...this.snap, ...patch };
    this.listeners.forEach((l) => l());
  }

  private ensure(): Bus {
    if (this.bus && this.ctx) {
      if (this.ctx.state === "suspended") void this.ctx.resume();
      return this.bus;
    }
    const ctx = new AudioContext();
    const master = ctx.createGain();
    master.gain.value = this.snap.volume * 0.9;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16;
    comp.ratio.value = 3;
    const warmth = ctx.createBiquadFilter();
    warmth.type = "lowpass";
    warmth.frequency.value = 3000;
    const dry = ctx.createGain();
    const reverb = ctx.createConvolver();
    reverb.buffer = makeImpulse(ctx, 3.2);
    const revOut = ctx.createGain();
    revOut.gain.value = 0.55;
    const delay = ctx.createDelay(2);
    delay.delayTime.value = 0.42;
    const fb = ctx.createGain();
    fb.gain.value = 0.32;
    const delayOut = ctx.createGain();
    delayOut.gain.value = 0.5;
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;

    dry.connect(warmth);
    reverb.connect(revOut).connect(warmth);
    delay.connect(fb).connect(delay);
    delay.connect(delayOut).connect(warmth);
    warmth.connect(comp).connect(master).connect(analyser).connect(ctx.destination);

    this.ctx = ctx;
    this.master = master;
    this.warmth = warmth;
    this.analyser = analyser;
    this.buffers = makeBuffers(ctx);
    this.bus = {
      ctx, dry, reverb, delay, noise: this.buffers.white,
      accent: (t, s) => {
        this.accents.push({ t, s });
        if (this.accents.length > 32) this.accents.shift();
      },
    };
    return this.bus;
  }

  private stopAll() {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.ctx) for (const b of this.beds) b.stop(this.ctx.currentTime);
    this.beds = [];
    if (this.audioEl) {
      this.audioEl.pause();
      URL.revokeObjectURL(this.audioEl.src);
      this.audioSrc?.disconnect();
      this.audioEl = null;
      this.audioSrc = null;
    }
  }

  playStation(index: number) {
    const bus = this.ensure();
    this.stopAll();
    const st = STATIONS[(index + STATIONS.length) % STATIONS.length];
    const i = STATIONS.indexOf(st);
    const ctx = bus.ctx;
    this.warmth!.frequency.setTargetAtTime(st.warmth, ctx.currentTime, 0.5);
    this.beds = st.beds ? st.beds(bus, this.buffers!) : [];
    this.stepIndex = 0;
    this.seq = { prog: LOFI_PROGS[0], chord: LOFI_PROGS[0][0], melody: 4, data: {} };
    this.nextTime = ctx.currentTime + 0.15;
    const stepDur = 60 / st.bpm / 4;
    // planificador con anticipación: agenda los pasos de los próximos 150 ms
    this.timer = window.setInterval(() => {
      while (this.nextTime < ctx.currentTime + 0.15) {
        const swing = st.swing && this.stepIndex % 2 === 1 ? st.swing * stepDur : 0;
        st.step(bus, this.stepIndex, this.nextTime + swing, this.seq);
        this.stepIndex++;
        this.nextTime += stepDur;
      }
    }, 30);
    this.emit({ playing: true, source: "station", station: i });
  }

  setTracks(tracks: UserTrack[]) {
    this.tracks = tracks;
    this.emit({ userTracks: tracks.map((t) => ({ id: t.id, name: t.name })) });
  }

  playUser(index: number) {
    if (!this.tracks.length) return;
    const bus = this.ensure();
    this.stopAll();
    const i = (index + this.tracks.length) % this.tracks.length;
    const el = new Audio(URL.createObjectURL(this.tracks[i].blob));
    const src = bus.ctx.createMediaElementSource(el);
    src.connect(this.warmth!);
    this.warmth!.frequency.setTargetAtTime(20000, bus.ctx.currentTime, 0.1);
    el.onended = () => this.playUser(i + 1);
    void el.play();
    this.audioEl = el;
    this.audioSrc = src;
    this.emit({ playing: true, source: "user", userIndex: i });
  }

  toggle() {
    if (this.snap.playing) this.pause();
    else this.resume();
  }

  resume() {
    if (this.snap.source === "user" && this.tracks.length) this.playUser(this.snap.userIndex);
    else this.playStation(this.snap.station);
  }

  pause() {
    this.stopAll();
    this.emit({ playing: false });
  }

  next(dir = 1) {
    if (this.snap.source === "user") this.playUser(this.snap.userIndex + dir);
    else this.playStation(this.snap.station + dir);
  }

  setVolume(v: number) {
    if (this.master && this.ctx) this.master.gain.setTargetAtTime(v * 0.9, this.ctx.currentTime, 0.05);
    this.emit({ volume: v });
  }

  setStation(i: number) {
    this.emit({ station: i });
  }

  /** 0..1: intensidad del pulso musical en este instante (para las animaciones). */
  pulse(): number {
    if (!this.ctx || !this.snap.playing) return 0;
    if (this.snap.source === "user" && this.analyser) {
      this.analyser.getByteTimeDomainData(this.timeData);
      let sum = 0;
      for (const v of this.timeData) sum += ((v - 128) / 128) ** 2;
      return Math.min(1, Math.sqrt(sum / this.timeData.length) * 4);
    }
    const now = this.ctx.currentTime;
    let p = 0;
    for (const a of this.accents) {
      if (a.t > now) continue;
      p = Math.max(p, a.s * Math.exp(-(now - a.t) * 5));
    }
    return Math.min(1, p);
  }
}

export const music = new MusicEngine();
