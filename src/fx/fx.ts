// Efectos visuales disparados directamente sobre el DOM (Web Animations API),
// sin pasar por React, para no agregar latencia al tipear.

let enabled = true;
let active = 0;
const MAX_SPARKS = 8;

const MQ = "(prefers-reduced-motion: reduce)";
export const reducedMotion = () => typeof matchMedia !== "undefined" && matchMedia(MQ).matches;
/** Avisa cuando el sistema cambia la preferencia de reducir movimiento. */
export const onReducedMotionChange = (cb: () => void) => {
  if (typeof matchMedia === "undefined") return () => {};
  const mq = matchMedia(MQ);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

/** `on` debe ser la preferencia efectiva (ajuste del usuario y del sistema). */
export function setFxEnabled(on: boolean) {
  enabled = on && !reducedMotion();
  document.documentElement.classList.toggle("calm", !enabled);
}

export const fxOn = () => enabled;

function layer(): HTMLElement {
  let el = document.getElementById("fx-layer");
  if (!el) {
    el = document.createElement("div");
    el.id = "fx-layer";
    document.body.appendChild(el);
  }
  return el;
}

const keyEls = (code: string) =>
  Array.from(document.querySelectorAll<HTMLElement>(`.keyboard [data-code="${code}"]`));

const center = (el: Element) => {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
};

/** Onda en la tecla pulsada. */
export function keyHit(code: string | undefined, ok: boolean) {
  if (!enabled || !code) return;
  for (const el of keyEls(code)) {
    el.animate(
      ok
        ? [
            { filter: "brightness(2)", transform: "translateY(2px) scale(0.96)" },
            { filter: "brightness(1)", transform: "translateY(0) scale(1)" },
          ]
        : [
            { filter: "brightness(1.6) saturate(2) hue-rotate(-40deg)", transform: "translateX(-3px)" },
            { transform: "translateX(3px)" },
            { filter: "brightness(1)", transform: "translateX(0)" },
          ],
      { duration: ok ? 260 : 220, easing: "cubic-bezier(.2,.8,.2,1)" },
    );
    const ring = document.createElement("span");
    ring.className = ok ? "key-ring" : "key-ring bad";
    el.appendChild(ring);
    ring.animate(
      [
        { transform: "scale(0.6)", opacity: 0.9 },
        { transform: "scale(1.5)", opacity: 0 },
      ],
      { duration: 420, easing: "ease-out" },
    ).onfinish = () => ring.remove();
  }
}

/** Chispa que viaja desde la tecla hasta el cursor del panel de código. */
export function spark(code: string | undefined, color: string) {
  if (!enabled || !code || active >= MAX_SPARKS) return;
  const key = keyEls(code)[0];
  const cursor = document.querySelector(".code-box .ch.cursor") ?? document.querySelector(".code-box");
  if (!key || !cursor) return;
  const a = center(key);
  const b = center(cursor);
  // si la tecla no está visible (scroll), no hay chispa
  if (a.y > innerHeight + 40 || a.y < -40) return;
  const s = document.createElement("span");
  s.className = "spark";
  s.style.setProperty("--c", color);
  layer().appendChild(s);
  active++;
  const mx = (a.x + b.x) / 2 + (Math.random() - 0.5) * 220;
  const my = Math.min(a.y, b.y) - 40 - Math.random() * 60;
  s.animate(
    [
      { transform: `translate(${a.x}px, ${a.y}px) scale(1)`, opacity: 1 },
      { transform: `translate(${mx}px, ${my}px) scale(0.8)`, opacity: 0.9, offset: 0.55 },
      { transform: `translate(${b.x}px, ${b.y}px) scale(0.3)`, opacity: 0 },
    ],
    { duration: 520 + Math.random() * 120, easing: "cubic-bezier(.3,.6,.4,1)" },
  ).onfinish = () => {
    s.remove();
    active--;
  };
}

/** Ola que recorre el teclado de izquierda a derecha al terminar una lección. */
export function wave() {
  if (!enabled) return;
  const kb = document.querySelector(".keyboard");
  if (!kb) return;
  const kr = kb.getBoundingClientRect();
  kb.querySelectorAll<HTMLElement>(".key").forEach((el) => {
    const r = el.getBoundingClientRect();
    const delay = ((r.left - kr.left) / kr.width) * 520 + ((r.top - kr.top) / kr.height) * 80;
    el.animate(
      [
        { transform: "translateY(0)", filter: "brightness(1)" },
        { transform: "translateY(-7px)", filter: "brightness(1.9)", offset: 0.35 },
        { transform: "translateY(0)", filter: "brightness(1)" },
      ],
      { duration: 560, delay, easing: "ease-out" },
    );
  });
}

/** El símbolo nuevo cae desde arriba hasta su tecla. Resuelve al terminar. */
export function dropSymbol(chars: string[], codes: (string | undefined)[]): Promise<void> {
  if (!enabled) return Promise.resolve();
  const anims: Promise<void>[] = [];
  chars.slice(0, 4).forEach((ch, i) => {
    const code = codes[i];
    const key = code ? keyEls(code)[0] : null;
    const target = key ? center(key) : { x: innerWidth / 2, y: innerHeight * 0.7 };
    const g = document.createElement("span");
    g.className = "drop-glyph";
    g.textContent = ch;
    layer().appendChild(g);
    const startX = innerWidth / 2 + (i - (Math.min(chars.length, 4) - 1) / 2) * 90;
    const p = g.animate(
      [
        { transform: `translate(${startX}px, ${innerHeight * 0.18}px) translate(-50%, -50%) scale(0.2)`, opacity: 0 },
        { transform: `translate(${startX}px, ${innerHeight * 0.3}px) translate(-50%, -50%) scale(1.6)`, opacity: 1, offset: 0.35 },
        { transform: `translate(${startX}px, ${innerHeight * 0.3}px) translate(-50%, -50%) scale(1.5)`, opacity: 1, offset: 0.55 },
        { transform: `translate(${target.x}px, ${target.y}px) translate(-50%, -50%) scale(0.45)`, opacity: 0.9 },
      ],
      { duration: 1500, delay: i * 140, easing: "cubic-bezier(.5,0,.3,1)", fill: "forwards" },
    ).finished.then(() => {
      g.remove();
      if (key) {
        key.animate(
          [
            { boxShadow: "0 0 0 0 var(--yellow)", filter: "brightness(2.4)" },
            { boxShadow: "0 0 40px 12px transparent", filter: "brightness(1)" },
          ],
          { duration: 700, easing: "ease-out" },
        );
        burst(target.x, target.y);
      }
    });
    anims.push(p);
  });
  return Promise.all(anims).then(() => undefined);
}

/** Pequeña explosión de partículas en un punto. */
export function burst(x: number, y: number, n = 14) {
  if (!enabled) return;
  for (let i = 0; i < n; i++) {
    const s = document.createElement("span");
    s.className = "spark";
    s.style.setProperty("--c", "var(--yellow)");
    layer().appendChild(s);
    const ang = (i / n) * Math.PI * 2 + Math.random() * 0.4;
    const dist = 40 + Math.random() * 50;
    s.animate(
      [
        { transform: `translate(${x}px, ${y}px) scale(1)`, opacity: 1 },
        { transform: `translate(${x + Math.cos(ang) * dist}px, ${y + Math.sin(ang) * dist}px) scale(0.2)`, opacity: 0 },
      ],
      { duration: 600 + Math.random() * 200, easing: "cubic-bezier(.2,.8,.3,1)" },
    ).onfinish = () => s.remove();
  }
}
