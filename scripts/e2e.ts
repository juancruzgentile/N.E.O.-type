// Pruebas en un navegador real (Chromium headless) sobre el build NeonType.html.
// Uso: npm run build && npm run test:e2e
// El navegador se instala una vez con: npx playwright-core install --only-shell chromium
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { tmpdir } from "node:os";
import { type Browser, type Page, chromium } from "playwright-core";

const FILE = "file://" + resolve("NeonType.html");
const KEY = "neontype:v1";

let failed = 0;
const ok = (cond: boolean, msg: string) => {
  if (!cond) failed++;
  console.log(`${cond ? "✓" : "✗"} ${msg}`);
};

type Seed = { settings?: Record<string, unknown>; [k: string]: unknown };
const seedState = (extra: Seed = {}) => ({
  version: 1,
  lang: "python",
  mode: "guided",
  profiles: {},
  days: {},
  challenges: {},
  achievements: {},
  ...extra,
  settings: { userName: "Test", showSplash: false, tutorialDone: true, animations: false, errorMode: "block", ...extra.settings },
});

/** Abre la app con un estado inicial. Devuelve la página y los errores de consola/página. */
async function open(
  browser: Browser,
  seed = seedState(),
  opts: { reducedMotion?: "reduce" | "no-preference"; viewport?: { width: number; height: number } } = {},
) {
  const ctx = await browser.newContext({
    reducedMotion: opts.reducedMotion ?? "no-preference",
    acceptDownloads: true,
    ...(opts.viewport ? { viewport: opts.viewport } : {}),
  });
  const page = await ctx.newPage();
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("dialog", (d) => void d.accept());
  await page.addInitScript(([k, v]) => {
    // solo en la primera carga: después la app maneja su propio estado
    if (!sessionStorage.getItem("seeded")) {
      localStorage.setItem(k, v);
      sessionStorage.setItem("seeded", "1");
    }
  }, [KEY, JSON.stringify(seed)] as const);
  await page.goto(FILE);
  await page.locator(".code-box").waitFor();
  return { page, errors, ctx };
}

const state = (page: Page) => page.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? "{}"), KEY);
const lessonText = (page: Page) => page.locator(".code-box").getAttribute("data-text").then((t) => t ?? "");
const typedCount = (page: Page) => page.locator(".code-box .ch.typed").count();
const focusPractice = async (page: Page) => {
  await page.locator(".code-box").click();
  await page.waitForFunction(() => document.activeElement?.classList.contains("ta-hidden"));
};

/** Teclea el texto como lo haría una persona (las sangrías se saltan solas). `lastWrong` falla la última tecla. */
async function typeLesson(page: Page, text: string, lastWrong = false) {
  let lineStart = true;
  let last = text.length - 1;
  while (last > 0 && text[last] === " ") last--;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === "\n") {
      await page.keyboard.press("Enter");
      lineStart = true;
      continue;
    }
    if (lineStart && ch === " ") continue;
    lineStart = false;
    const out = lastWrong && i === last ? (ch === "#" ? "@" : "#") : ch;
    await page.keyboard.insertText(out);
  }
}

const browser = await chromium.launch();
try {
  // 1. carga y lección completa
  {
    const { page, errors, ctx } = await open(browser);
    ok(errors.length === 0, `la app carga sin errores de consola ni de CSP${errors.length ? ": " + errors[0] : ""}`);
    await focusPractice(page);
    const text = await lessonText(page);
    await typeLesson(page, text);
    await page.locator(".panel-foot .last").waitFor({ timeout: 5000 });
    const st = await state(page);
    ok(st.profiles["python:it"]?.lessons?.length === 1, "completar una lección la guarda en el progreso");
    ok((await lessonText(page)) !== "" && (await typedCount(page)) === 0, "después se carga una lección nueva");
    await ctx.close();
  }

  // 2. pegar no cuenta como tecleo; Tab libera el foco
  {
    const { page, ctx } = await open(browser);
    await ctx.grantPermissions(["clipboard-read", "clipboard-write"]).catch(() => {});
    await focusPractice(page);
    const text = await lessonText(page);
    const firstLine = text.split("\n")[0].trimStart();
    await page.evaluate((t) => navigator.clipboard.writeText(t).catch(() => {}), firstLine);
    // cuenta los pegados que llegan al área de escritura, para no confundir "bloqueado" con "nunca llegó"
    await page.evaluate(() => {
      const w = window as unknown as { pastes: number };
      w.pastes = 0;
      const ta = document.querySelector<HTMLTextAreaElement>(".ta-hidden")!;
      ta.addEventListener("paste", () => w.pastes++, true);
      ta.addEventListener("input", (e) => { if ((e as InputEvent).inputType === "insertFromPaste") w.pastes++; }, true);
    });
    const pastes = () => page.evaluate(() => (window as unknown as { pastes: number }).pastes);
    await page.keyboard.press("Control+V");
    await page.waitForTimeout(50);
    const pasted = (await pastes()) > 0;
    // respaldo si el portapapeles no está disponible: evento de pegado igual al del navegador
    if (!pasted) {
      await page.evaluate((t) => {
        const ta = document.querySelector<HTMLTextAreaElement>(".ta-hidden")!;
        ta.value = t;
        ta.dispatchEvent(new InputEvent("input", { inputType: "insertFromPaste", data: t, bubbles: true }));
      }, firstLine);
    }
    await page.waitForTimeout(150);
    ok((await pastes()) > 0, `el pegado llega al área de escritura${pasted ? " (Ctrl+V real)" : " (evento simulado)"}`);
    ok((await typedCount(page)) === 0, "y aun así no avanza la lección");
    await page.keyboard.insertText(firstLine[0]);
    ok((await typedCount(page)) === 1, "teclear sí avanza");
    await page.keyboard.press("Tab");
    const forward = await page.evaluate(() => !document.activeElement?.classList.contains("ta-hidden") && document.activeElement !== document.body);
    ok(forward, "Tab saca el foco del área de práctica hacia otro control");
    await focusPractice(page);
    await page.keyboard.press("Shift+Tab");
    const back = await page.evaluate(() => !document.activeElement?.classList.contains("ta-hidden"));
    ok(back, "Shift+Tab también saca el foco");
    await ctx.close();
  }

  // 3. desafío de precisión perfecta: un error en el último carácter no da récord
  {
    const { page, ctx } = await open(browser, seedState({ settings: { errorMode: "advance" } }));
    await page.getByRole("button", { name: "Desafíos" }).click();
    await page.locator(".challenge", { hasText: "Precisión perfecta" }).getByRole("button", { name: "Empezar" }).click();
    await focusPractice(page);
    const text = await lessonText(page);
    await typeLesson(page, text, true);
    await page.waitForTimeout(200);
    let st = await state(page);
    ok(!st.challenges["python:perfect"] && (await page.locator(".modal", { hasText: "DESAFÍO" }).count()) === 0 &&
      (await page.locator(".modal", { hasText: "RÉCORD" }).count()) === 0, "error en el último carácter: sin récord y vuelve a empezar");
    ok((await page.locator(".timer", { hasText: "Fallos: 1" }).count()) === 1, "el fallo queda contado");
    await typeLesson(page, text);
    await page.locator(".modal", { hasText: "RÉCORD" }).waitFor({ timeout: 5000 });
    st = await state(page);
    ok(st.challenges["python:perfect"]?.acc === 1, "sin errores: se guarda el récord");
    await ctx.close();
  }

  // 4. movimiento reducido del sistema: modo calmo, sin fondo y logros visibles
  {
    const { page, ctx } = await open(browser, seedState({ settings: { animations: true } }), { reducedMotion: "reduce" });
    ok(await page.evaluate(() => document.documentElement.classList.contains("calm")), "la preferencia del sistema activa el modo calmo");
    ok(await page.locator(".bg-canvas").evaluate((c) => getComputedStyle(c).display === "none"), "el fondo animado no se muestra");
    await focusPractice(page);
    await typeLesson(page, await lessonText(page));
    const toast = page.locator(".toast").first();
    await toast.waitFor({ timeout: 5000 });
    await page.waitForTimeout(1000);
    const vis = await toast.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { op: Number(getComputedStyle(el).opacity), inside: r.right <= innerWidth + 1 && r.left >= 0 && r.width > 0 };
    });
    ok(vis.op === 1 && vis.inside, "el aviso de logro se ve completo y quieto");
    await page.waitForTimeout(4500);
    ok((await page.locator(".toast").count()) === 0, "el aviso se retira solo a los ~4,8 s");
    await ctx.close();
  }

  // 5. exportar, importar y sincronizar la música
  {
    const { page, ctx } = await open(browser);
    await page.getByRole("button", { name: "Ajustes" }).click();
    const dl = page.waitForEvent("download");
    await page.getByRole("button", { name: "Exportar progreso" }).click();
    const file = await (await dl).path();
    const json = readFileSync(file!, "utf8");
    ok(!json.includes("\n") && JSON.parse(json).version === 1, "exportar descarga JSON compacto y válido");
    const backup = JSON.parse(json);
    backup.settings.musicVolume = 0.25;
    backup.settings.musicStation = 2;
    backup.settings.userName = "Importado";
    const path = resolve(tmpdir(), "neontype-e2e.json");
    writeFileSync(path, JSON.stringify(backup));
    await page.locator('input[type="file"][accept="application/json"]').setInputFiles(path);
    await page.getByText("Progreso importado.").waitFor({ timeout: 5000 });
    ok((await state(page)).settings.userName === "Importado", "importar reemplaza el progreso");
    const vol = Number(await page.getByLabel("Volumen").inputValue());
    ok(Math.abs(vol - 0.25) < 1e-9, "el volumen importado llega al reproductor");
    const title = await page.locator(".player-title").textContent();
    await page.getByRole("button", { name: "Siguiente" }).click();
    await page.waitForTimeout(100);
    ok((await state(page)).settings.musicStation === 3, `la estación importada es el punto de partida (${title})`);
    await ctx.close();
  }

  // 6. tutorial de bienvenida: aparece una vez, bloquea el teclado y se puede repetir desde Ajustes
  {
    const { page, ctx } = await open(browser, seedState({ settings: { tutorialDone: false } }));
    await page.getByText("Te damos la bienvenida a").waitFor({ timeout: 5000 });
    ok(await page.getByText("no reemplaza el estudio").isVisible(), "la bienvenida muestra el aviso");
    ok((await page.locator(".app[inert]").count()) === 1, "la app queda inerte detrás del diálogo");
    await page.keyboard.press("Enter");
    await page.locator(".tour-spot").waitFor();
    ok((await page.locator(".tour-count").textContent()) === "1/5", "Enter abre el recorrido en el paso 1");
    await page.keyboard.insertText("x");
    ok((await typedCount(page)) === 0, "durante el recorrido no se escribe en la lección");
    // el foco no sale del diálogo con Tab ni Shift+Tab
    let inside = true;
    for (const key of ["Tab", "Tab", "Tab", "Tab", "Shift+Tab", "Shift+Tab", "Shift+Tab", "Shift+Tab"]) {
      await page.keyboard.press(key);
      inside &&= await page.evaluate(() => !!document.activeElement?.closest(".tour"));
    }
    ok(inside, "Tab y Shift+Tab mantienen el foco dentro del recorrido");
    await page.getByRole("button", { name: "Siguiente (Enter)" }).focus();
    await page.keyboard.press("Enter");
    ok((await page.locator(".tour-count").textContent()) === "2/5", "Enter sobre Siguiente avanza");
    await page.getByRole("button", { name: "Atrás" }).focus();
    await page.keyboard.press("Enter");
    ok((await page.locator(".tour-count").textContent()) === "1/5", "Enter sobre Atrás retrocede");
    await page.getByRole("button", { name: "Atrás" }).focus();
    await page.keyboard.press("Space");
    ok((await page.locator(".tour-back").count()) === 1, "Espacio sobre Atrás vuelve a la bienvenida");
    await page.keyboard.press("Enter");
    await page.locator(".tour-spot").waitFor();
    for (let i = 0; i < 5; i++) await page.keyboard.press("Enter");
    await page.locator(".tour").waitFor({ state: "detached" });
    ok((await state(page)).settings.tutorialDone === true, "terminar el recorrido lo marca como visto");
    ok((await page.locator(".app[inert]").count()) === 0, "al cerrar, la app vuelve a ser interactiva");
    await page.reload();
    await page.locator(".code-box").waitFor();
    ok((await page.locator(".tour, .tour-back").count()) === 0, "no vuelve a aparecer al recargar");
    await page.getByRole("button", { name: "Ajustes" }).click();
    await page.getByRole("button", { name: "Ver tutorial de bienvenida" }).click();
    await page.getByText("Te damos la bienvenida a").waitFor({ timeout: 5000 });
    await page.keyboard.press("Escape");
    ok((await page.locator(".tour-back").count()) === 0, "se repite desde Ajustes y Esc lo cierra");
    await page.getByRole("button", { name: "Ajustes" }).click();
    await page.getByRole("button", { name: "Ver tutorial de bienvenida" }).click();
    await page.getByRole("button", { name: "Saltar (Esc)" }).focus();
    await page.keyboard.press("Space");
    await page.waitForTimeout(100);
    ok((await page.locator(".tour-back").count()) === 0, "Espacio sobre Saltar cierra el tutorial");
    await ctx.close();
  }

  // 7. el tutorial explica lo que corresponde a cada ruta y modo
  {
    const { page, ctx } = await open(browser, seedState({ lang: "sql", settings: { tutorialDone: false } }));
    await page.keyboard.press("Enter");
    await page.locator(".tour-spot").waitFor();
    const texts: string[] = [];
    for (let i = 0; i < 5; i++) {
      texts.push((await page.locator(".tour-card").textContent()) ?? "");
      await page.keyboard.press("ArrowRight");
    }
    const all = texts.join(" ");
    ok(/escalones/i.test(all) && !all.includes("( y )"), "ruta SQL: habla de escalones, no de símbolos");
    ok(!/en vivo/i.test(all) && /última lección terminada/.test(all), "las métricas se describen como resultados de lecciones terminadas");
    await ctx.close();
  }
  {
    const { page, ctx } = await open(browser, seedState({ mode: "free", settings: { tutorialDone: false } }));
    await page.keyboard.press("Enter");
    await page.locator(".tour-spot").waitFor();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    ok(/MODO LIBRE/.test((await page.locator(".tour-card").textContent()) ?? ""), "modo libre: explica el modo libre");
    await ctx.close();
  }

  // 8. ventanas estrechas: navegación compacta y recorrido sobre elementos visibles
  for (const viewport of [{ width: 1000, height: 800 }, { width: 390, height: 844 }]) {
    const label = `${viewport.width}×${viewport.height}`;
    const { page, ctx } = await open(browser, seedState({ settings: { tutorialDone: false } }), { viewport });
    await page.keyboard.press("Enter");
    await page.locator(".tour-spot").waitFor();
    const total = Number(((await page.locator(".tour-count").textContent()) ?? "0/0").split("/")[1]);
    let spotsOk = true;
    for (let i = 0; i < total; i++) {
      await page.waitForTimeout(600);
      const box = await page.locator(".tour-spot").boundingBox();
      const card = await page.locator(".tour-card").boundingBox();
      const fits = (b: typeof box) => !!b && b.x >= -1 && b.x + b.width <= viewport.width + 1;
      spotsOk &&= !!box && box.width >= 40 && box.height >= 40 && fits(card);
      await page.keyboard.press("ArrowRight");
    }
    ok(spotsOk, `${label}: cada paso resalta un elemento visible y la tarjeta entra en pantalla (${total} pasos)`);
    await page.locator(".tour").waitFor({ state: "detached" });
    const scrollX = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    ok(scrollX <= 0, `${label}: sin desplazamiento horizontal`);
    await page.getByRole("button", { name: "Ajustes" }).click();
    await page.getByRole("button", { name: "Exportar progreso" }).waitFor({ timeout: 5000 });
    await page.getByRole("button", { name: "Estadísticas" }).click();
    ok((await page.locator('.mobile-nav button[aria-current="page"]').textContent())?.includes("Estadísticas") ?? false,
      `${label}: la navegación compacta lleva a Ajustes y Estadísticas`);
    await ctx.close();
  }
} finally {
  await browser.close();
}

console.log(failed ? `\n${failed} prueba(s) fallaron` : "\nTodas las pruebas en navegador pasaron");
process.exit(failed ? 1 : 0);
