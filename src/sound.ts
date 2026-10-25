// Sonidos sintetizados con Web Audio (sin archivos).
let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function blip(freq: number, dur: number, type: OscillatorType, gain: number) {
  const a = audio();
  if (!a) return;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(gain, a.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + dur);
  osc.connect(g).connect(a.destination);
  osc.start();
  osc.stop(a.currentTime + dur);
}

export const sound = {
  key: () => blip(1800 + Math.random() * 300, 0.025, "square", 0.025),
  error: () => blip(140, 0.12, "sawtooth", 0.06),
  done: () => {
    blip(660, 0.09, "sine", 0.08);
    setTimeout(() => blip(990, 0.14, "sine", 0.08), 90);
  },
  unlock: () => {
    [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => blip(f, 0.16, "triangle", 0.08), i * 90));
  },
};
