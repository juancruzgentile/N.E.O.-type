import type { ErrorMode, Sample } from "../types";

/**
 * "done" solo se devuelve si la última pulsación fue correcta. Si fue un error
 * que igual cerró el texto (modos que avanzan) se devuelve "error" y `done` queda en true.
 */
export type InputResult = "ok" | "error" | "done" | "ignored";

/**
 * Estado de una lección en curso. Las sangrías al principio de cada línea se
 * saltan solas: el cursor pasa directo al primer carácter con contenido.
 */
export class TypingSession {
  readonly text: string;
  readonly auto: boolean[];
  pos = 0;
  /** posiciones con error en el primer intento */
  errors = new Set<number>();
  /** carácter equivocado escrito (modos que avanzan con error) */
  wrong = new Map<number, string>();
  /** ms que tardó cada posición */
  timing = new Map<number, number>();
  startTs: number | null = null;
  endTs: number | null = null;
  lastTs: number | null = null;
  keystrokes = 0;
  lastError = 0;

  constructor(text: string) {
    this.text = text;
    this.auto = new Array(text.length).fill(false);
    let lineStart = true;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (ch === "\n") {
        lineStart = true;
        continue;
      }
      if (lineStart && ch === " ") this.auto[i] = true;
      else lineStart = false;
    }
    this.skipAuto();
  }

  get done() {
    return this.pos >= this.text.length;
  }

  get typeable() {
    return this.auto.filter((a) => !a).length;
  }

  private skipAuto() {
    while (this.pos < this.text.length && this.auto[this.pos]) this.pos++;
  }

  input(ch: string, now: number, mode: ErrorMode): InputResult {
    if (this.done) return "ignored";
    if (this.startTs === null) this.startTs = now;
    this.keystrokes++;
    const expected = this.text[this.pos];
    const ms = this.lastTs === null ? null : now - this.lastTs;
    if (ch === expected) {
      if (ms !== null) this.timing.set(this.pos, ms);
      this.lastTs = now;
      this.pos++;
      this.skipAuto();
      if (this.done) {
        this.endTs = now;
        return "done";
      }
      return "ok";
    }
    this.errors.add(this.pos);
    this.lastError = now;
    if (mode === "block") return "error";
    // modos que avanzan
    this.wrong.set(this.pos, ch);
    this.lastTs = now;
    this.pos++;
    this.skipAuto();
    if (this.done) this.endTs = now;
    return "error";
  }

  backspace(mode: ErrorMode): boolean {
    if (mode !== "advance" || this.pos === 0) return false;
    let p = this.pos - 1;
    while (p > 0 && this.auto[p]) p--;
    if (this.auto[p]) return false;
    this.pos = p;
    this.wrong.delete(p);
    this.timing.delete(p);
    return true;
  }

  /** Corta la lección (desafíos con tiempo). */
  stop(now: number) {
    this.endTs = now;
  }

  /** Posiciones tecleadas hasta ahora (sin sangrías). */
  typedPositions(): number[] {
    const out: number[] = [];
    for (let i = 0; i < Math.min(this.pos, this.text.length); i++) if (!this.auto[i]) out.push(i);
    return out;
  }

  /** Posición actual si ya se falló en ella pero todavía no se completó (sesión cortada a mitad). */
  pendingError(): number | null {
    return !this.done && this.errors.has(this.pos) ? this.pos : null;
  }

  samples(): Sample[] {
    const out: Sample[] = this.typedPositions().map((i) => ({
      char: this.text[i],
      ms: this.timing.get(i) ?? null,
      error: this.errors.has(i),
    }));
    // el fallo en la posición pendiente también entrena ese símbolo
    const p = this.pendingError();
    if (p !== null) out.push({ char: this.text[p], ms: null, error: true });
    return out;
  }

  /**
   * Resultado: wpm sobre caracteres correctos, precisión al primer intento.
   * `attempted` suma la posición pendiente con error: cuenta para la precisión pero no en `chars`.
   */
  result(now = this.endTs ?? performance.now()) {
    const typed = this.typedPositions();
    const correct = typed.filter((i) => !this.wrong.has(i)).length;
    const pending = this.pendingError() === null ? 0 : 1;
    const errors = typed.filter((i) => this.errors.has(i)).length + pending;
    const attempted = typed.length + pending;
    const ms = this.startTs === null ? 0 : Math.max(1, now - this.startTs);
    const wpm = ms > 0 ? correct / 5 / (ms / 60000) : 0;
    const acc = attempted ? (attempted - errors) / attempted : 1;
    return { wpm, acc, chars: typed.length, attempted, ms, errors };
  }
}
