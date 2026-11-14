// Pruebas en un navegador real (Chromium headless) sobre el build NeonType.html.
// Uso: npm run build && npm run test:e2e
// El navegador se instala una vez con: npx playwright-core install --only-shell chromium
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { tmpdir } from "node:os";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { once } from "node:events";
import { type Browser, type Page, chromium } from "playwright-core";
import { PROJECTS } from "../src/projects/projects";
import { LANGS } from "../src/data/curriculum";
import { TOPICS } from "../src/library/index";
import { entryId } from "../src/library/search";
import { BANCO } from "../src/interview/bank/index";

// Se sirve por http local y no se abre como file://: con file:// Chromium no garantiza que todas las páginas
// del contexto lean el mismo localStorage, y en el CI la recarga o una segunda ventana arrancaban vacías a veces.
const html = readFileSync(resolve("NeonType.html"));
const server = createServer((_, res) => res.writeHead(200, { "content-type": "text/html; charset=utf-8" }).end(html)).listen(0, "127.0.0.1");
await once(server, "listening");
const APP = `http://127.0.0.1:${(server.address() as AddressInfo).port}/`;
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
  opts: { reducedMotion?: "reduce" | "no-preference"; viewport?: { width: number; height: number }; clock?: boolean } = {},
) {
  const ctx = await browser.newContext({
    reducedMotion: opts.reducedMotion ?? "no-preference",
    acceptDownloads: true,
    ...(opts.viewport ? { viewport: opts.viewport } : {}),
  });
  if (opts.clock) await ctx.clock.install();
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
  await page.goto(APP);
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

// CHROMIUM_PATH permite usar un Chromium ya instalado si no coincide con la versión de Playwright
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
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
    // registra el texto de cada pegado que llega al área de escritura, para no confundir
    // "bloqueado" con "nunca llegó" ni con "llegó otra cosa"
    await page.evaluate(() => {
      const w = window as unknown as { pasted: string[] };
      w.pasted = [];
      const ta = document.querySelector<HTMLTextAreaElement>(".ta-hidden")!;
      ta.addEventListener("paste", (e) => w.pasted.push(e.clipboardData?.getData("text/plain") ?? ""), true);
      ta.addEventListener("input", (e) => {
        if ((e as InputEvent).inputType === "insertFromPaste") w.pasted.push((e as InputEvent).data ?? "");
      }, true);
    });
    const pastedTexts = () => page.evaluate(() => (window as unknown as { pasted: string[] }).pasted);
    // caso real: solo cuenta si el portapapeles quedó con el texto del ejercicio
    const wrote = await page.evaluate((t) => navigator.clipboard.writeText(t).then(() => true, () => false), firstLine);
    let real = false;
    if (wrote) {
      await page.keyboard.press("Control+V");
      await page.waitForTimeout(50);
      real = (await pastedTexts()).includes(firstLine);
    }
    // respaldo, informado aparte: el evento que genera el navegador al pegar, con el texto exacto
    if (!real) {
      await page.evaluate((t) => {
        const ta = document.querySelector<HTMLTextAreaElement>(".ta-hidden")!;
        ta.value = t;
        ta.dispatchEvent(new InputEvent("input", { inputType: "insertFromPaste", data: t, bubbles: true }));
      }, firstLine);
    }
    await page.waitForTimeout(150);
    const how = real ? "Ctrl+V real" : `evento simulado; ${wrote ? "Ctrl+V no entregó el texto" : "no se pudo preparar el portapapeles"}`;
    ok((await pastedTexts()).includes(firstLine), `el texto del ejercicio llega al área de escritura (${how})`);
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
    let { page, ctx } = await open(browser, seedState({ settings: { tutorialDone: false } }));
    await page.getByText("Te damos la bienvenida a").waitFor({ timeout: 5000 });
    ok(await page.getByText("no reemplaza el estudio").isVisible(), "la bienvenida muestra el aviso");
    {
      // primera bienvenida: Esc la cierra y el foco va a la práctica
      const first = await open(browser, seedState({ settings: { tutorialDone: false } }));
      await first.page.getByText("Te damos la bienvenida a").waitFor({ timeout: 5000 });
      await first.page.keyboard.press("Escape");
      ok(await first.page.evaluate(() => document.activeElement?.classList.contains("ta-hidden") ?? false),
        "cerrar la primera bienvenida con Esc deja el foco en el área de escritura");
      await first.ctx.close();
    }
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
    ok(await page.evaluate(() => document.activeElement !== document.body && !document.activeElement?.closest(".tour")),
      "al terminar, el foco no queda perdido en el documento");
    ok((await page.locator(".app[inert]").count()) === 0, "al cerrar, la app vuelve a ser interactiva");
    // se abre de nuevo con lo guardado. No se usa reload(): el Chromium de Playwright 1.64 a veces
    // recarga antes de terminar de escribir localStorage y la prueba fallaba sin que la app tuviera nada mal.
    const saved = await state(page);
    await ctx.close();
    ({ page, ctx } = await open(browser, saved));
    ok((await page.locator(".tour, .tour-back").count()) === 0, "no vuelve a aparecer al abrir de nuevo");
    await page.getByRole("button", { name: "Ajustes" }).click();
    await page.getByRole("button", { name: "Ver tutorial de bienvenida" }).click();
    await page.getByText("Te damos la bienvenida a").waitFor({ timeout: 5000 });
    await page.keyboard.press("Escape");
    ok((await page.locator(".tour-back").count()) === 0, "se repite desde Ajustes y Esc lo cierra");
    ok(await page.evaluate(() => document.activeElement?.classList.contains("ta-hidden") ?? false),
      "al cerrar, el foco queda en el área de escritura");
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
    const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    // cada vista por separado: la práctica puede entrar y otra vista desbordar
    const wide: string[] = [];
    if ((await overflow()) > 0) wide.push(`Práctica (${await overflow()} px)`);
    let navOk = true;
    for (const name of ["Rutas", "Estadísticas", "Desafíos", "Biblioteca", "Logros", "Ajustes", "Práctica"]) {
      await page.locator(".mobile-nav").getByRole("button", { name }).click();
      await page.waitForTimeout(200);
      navOk &&= (await page.locator('.mobile-nav button[aria-current="page"]').textContent())?.includes(name) ?? false;
      const px = await overflow();
      if (px > 0) wide.push(`${name} (${px} px)`);
    }
    await page.getByTitle("Elegir lenguaje").click();
    await page.waitForTimeout(200);
    if ((await overflow()) > 0) wide.push(`Lenguajes (${await overflow()} px)`);
    ok(navOk, `${label}: la navegación compacta lleva a cada sección`);
    ok(wide.length === 0, `${label}: ninguna vista se desplaza de costado${wide.length ? " — desbordan: " + wide.join(", ") : ""}`);
    await ctx.close();
  }

  // 9. menú principal: pregunta antes de salir y lleva a cada sección
  {
    const { page, errors, ctx } = await open(browser);
    await focusPractice(page);
    const text = await lessonText(page);
    await page.keyboard.type(text.trimStart()[0]);
    await page.getByTitle("Volver al menú principal").click();
    const dialog = page.getByRole("alertdialog");
    await dialog.waitFor();
    ok(await page.getByRole("button", { name: "Sí, volver al menú" }).evaluate((b) => b === document.activeElement), "el diálogo pone el foco en confirmar");
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "detached" });
    ok((await typedCount(page)) === 1 && !(await page.locator(".splash").count()), "Esc cancela y la lección sigue donde estaba");
    await page.getByTitle("Volver al menú principal").click();
    await page.getByRole("button", { name: "Seguir acá" }).click();
    ok(!(await page.locator(".splash").count()), "Seguir acá cierra el diálogo sin salir");
    await page.getByTitle("Volver al menú principal").click();
    await page.keyboard.press("Enter");
    await page.locator(".splash-menu").waitFor();
    ok(true, "Enter confirma y muestra el menú principal");
    await page.locator(".splash-menu").getByRole("button", { name: /Desafíos y proyectos/ }).click();
    await page.locator(".splash").waitFor({ state: "detached" });
    ok(/desafíos/i.test((await page.locator(".view h2").first().textContent()) ?? ""), "el menú lleva a la sección elegida");
    await page.getByTitle("Volver al menú principal").click();
    await page.keyboard.press("Enter");
    await page.locator(".splash-menu").waitFor();
    ok(await page.locator(".splash-menu button").first().evaluate((b) => b === document.activeElement), "al volver, el menú aparece con el foco en Continuar");
    await page.keyboard.press("Enter");
    await page.locator(".splash").waitFor({ state: "detached" });
    ok(errors.length === 0, `ida y vuelta al menú sin errores${errors.length ? ": " + errors[0] : ""}`);
    await ctx.close();
  }

  // 10. proyectos: sangrías con Tab, cronómetro, récord y desbloqueo en orden
  {
    const { page, errors, ctx } = await open(browser, seedState({ lang: "python" }));
    await page.locator(".nav").getByRole("button", { name: "Desafíos" }).click();
    const cards = page.locator(".project-card");
    ok((await cards.count()) === 21, "hay 21 proyectos");
    ok((await cards.nth(1).locator(".btn").count()) === 0 && /Terminá el proyecto 1/.test((await cards.nth(1).textContent()) ?? ""), "el proyecto 2 empieza bloqueado");
    await cards.nth(0).getByRole("button", { name: "Empezar" }).click();
    await page.waitForFunction(() => document.activeElement?.classList.contains("ta-hidden"));
    // Tab escribe la sangría y no saca el foco
    const first = PROJECTS[0].files[0].text;
    const typeProject = async (text: string, useTab: boolean) => {
      for (const line of text.split("\n").map((l, i, all) => ({ l, last: i === all.length - 1 }))) {
        const indent = /^ */.exec(line.l)![0].length;
        if (useTab) for (let k = 0; k < indent / 4; k++) await page.keyboard.press("Tab");
        else if (indent) await page.keyboard.type(" ".repeat(indent));
        if (line.l.trim()) await page.keyboard.type(line.l.trimStart());
        if (!line.last) await page.keyboard.press("Enter");
      }
    };
    const firstTwo = first.split("\n").slice(0, 2).join("\n");
    await typeProject(firstTwo, true);
    ok(await page.evaluate(() => document.activeElement?.classList.contains("ta-hidden")), "en un proyecto Tab escribe la sangría sin perder el foco");
    ok((await page.locator(".code-line.current .ch.ind.pending").count()) === 0 && (await page.locator(".code-line.current .ch.ind.typed").count()) === 4, "la sangría escrita con Tab cuenta como escrita");
    const before = await page.locator(".project-box .ch.typed").count();
    await page.keyboard.press("Tab");
    ok((await page.locator(".project-box .ch.typed").count()) === before, "Tab fuera de la sangría es un error y no avanza");
    // salir a mitad pide confirmación
    await page.locator(".nav").getByRole("button", { name: "Logros" }).click();
    await page.getByRole("alertdialog").waitFor();
    ok(true, "salir con un proyecto a medias pide confirmación");
    await page.getByRole("button", { name: "Seguir escribiendo" }).click();
    ok((await page.locator(".project-panel").count()) === 1, "cancelar deja el proyecto donde estaba");
    await page.locator(".project-box").click();
    // resto del archivo, con espacios en vez de Tab
    await page.keyboard.press("Enter");
    await typeProject(first.split("\n").slice(2).join("\n"), false);
    await page.locator(".modal .big").waitFor({ timeout: 10000 });
    const st = await state(page);
    ok(st.projects?.p01?.ms > 0 && st.projects.p01.acc > 0.9, "terminar el proyecto guarda el tiempo y la precisión");
    ok(/Desbloqueaste el proyecto 2/.test((await page.locator(".modal").textContent()) ?? ""), "terminar el primero desbloquea el segundo");
    await page.getByRole("button", { name: "Volver a desafíos" }).click();
    ok((await page.locator(".project-card").nth(1).getByRole("button", { name: "Empezar" }).count()) === 1, "el proyecto 2 ya se puede empezar");
    ok(errors.length === 0, `proyectos sin errores de consola${errors.length ? ": " + errors[0] : ""}`);
    await ctx.close();
  }

  // 11. biblioteca: temas, búsqueda rápida y próximamente
  {
    const { page, errors, ctx } = await open(browser, seedState({ lang: "go" }));
    await page.locator(".nav").getByRole("button", { name: "Biblioteca" }).click();
    await page.locator(".library").waitFor();
    ok((await page.locator(".lib-head h3").textContent()) === "Go", "abre en el lenguaje que estás practicando");
    await page.locator(".lib-nav").getByRole("button", { name: /Python/ }).click();
    ok((await page.locator(".lib-head h3").textContent()) === "Python", "cambia de tema desde el índice");
    const src = page.locator(".lib-entry").first().locator(".lib-source a");
    ok(
      /^https:\/\//.test((await src.getAttribute("href")) ?? "") && (await src.getAttribute("target")) === "_blank" && /noopener/.test((await src.getAttribute("rel")) ?? ""),
      "cada ejemplo enlaza su fuente oficial en una pestaña nueva y sin pasar datos",
    );
    ok(/Versión: .+Revisado: .*2026/.test((await page.locator(".lib-entry").first().locator(".lib-source").textContent()) ?? ""), "cada ejemplo dice desde qué versión funciona y cuándo se revisó");
    const all = await page.locator(".lib-entry").count();
    await page.locator(".lib-levels").getByRole("tab", { name: /Avanzado/ }).click();
    const adv = await page.locator(".lib-entry").count();
    ok(adv > 0 && adv < all && (await page.locator(".lib-level-title").count()) === 1, "el filtro de nivel muestra solo ese nivel");
    await page.locator(".lib-head").click();
    await page.keyboard.press("/");
    ok(await page.locator(".lib-search input[type=search]").evaluate((el) => el === document.activeElement), "/ enfoca la búsqueda");
    await page.keyboard.type("rebase");
    await page.locator(".lib-entry").first().waitFor();
    ok((await page.locator(".lib-entry h4").first().textContent()) === "git rebase", "la búsqueda encuentra en todos los temas");
    await page.keyboard.press("Enter");
    await page.locator(".lib-entry.flash").waitFor();
    ok((await page.locator(".lib-head h3").textContent()) === "Git" && (await page.locator(".lib-entry.flash h4").textContent()) === "git rebase", "Enter abre el primer resultado en su tema y lo resalta");
    await page.locator(".lib-search input[type=search]").fill("funcion flecha");
    await page.waitForTimeout(100);
    ok(/flecha/i.test((await page.locator(".lib-entry").first().textContent()) ?? ""), "busca sin acentos y con varias palabras");
    await page.locator(".lib-search input[type=search]").fill("xyzxyz");
    ok(/sin resultados/i.test((await page.locator(".lib-content .section").first().textContent()) ?? ""), "avisa cuando no hay resultados");
    await page.locator(".lib-search input[type=search]").press("Escape");
    await page.locator(".lib-nav").getByRole("button", { name: /IA y herramientas/ }).click();
    const soon = await page.locator(".lib-soon-card").allTextContents();
    ok(soon.length === 1 && soon.every((t) => /PRÓXIMAMENTE/.test(t)), "Próximamente muestra las 1 secciones de IA marcadas como próximamente");
    await page.locator(".lib-nav").getByRole("button", { name: /^Claude/ }).click();
    ok(/seguridad/i.test((await page.locator(".lib-alert").first().textContent()) ?? "") && (await page.locator(".claude-mark").count()) > 0, "Claude abre con el aviso rojo de seguridad y su logo");
    await page.locator(".lib-clase-toggle").getByRole("tab", { name: /^Clase$/ }).click();
    ok((await page.locator(".clase-seccion").count()) >= 11 && (await page.locator(".captura").count()) >= 2, "la clase de Claude muestra cómo se ven la terminal y la app");
    await page.locator(".lib-clase-toggle").getByRole("tab", { name: /Referencia/ }).click();
    await page.locator(".lib-nav").getByRole("button", { name: /^Codex/ }).click();
    ok(/seguridad/i.test((await page.locator(".lib-alert").first().textContent()) ?? "") && (await page.locator(".codex-mark").count()) > 0, "Codex abre con el aviso rojo de seguridad y su logo");
    await page.locator(".lib-clase-toggle").getByRole("tab", { name: /Día de trabajo/ }).click();
    ok((await page.locator(".clase-seccion").count()) >= 6 && (await page.locator(".clase-diagrama svg").count()) >= 1 && (await page.locator(".captura .cap-linea").count()) >= 4, "la clase de Codex tiene varias secciones, un diagrama y cómo se ve la CLI");
    ok((await page.locator(".clase-clave").count()) >= 10, "la clase de Codex resalta los conceptos clave");
    await page.locator(".lib-nav").getByRole("button", { name: /^Python/ }).click();
    await page.locator(".lib-clase-toggle").getByRole("tab", { name: /^Clase$/ }).click();
    ok((await page.locator(".clase-seccion").count()) >= 9 && (await page.locator(".clase .lib-code").count()) >= 3 && (await page.locator(".clase-tabla table").count()) >= 2, "la clase de Python muestra secciones, código resaltado y tablas");
    ok((await page.locator(".clase-fuentes a").count()) >= 1, "la clase de Python lista sus fuentes oficiales");
    ok(errors.length === 0, `biblioteca sin errores de consola${errors.length ? ": " + errors[0] : ""}`);
    await ctx.close();
  }

  // 11b. frameworks: ocultos hasta ganarlos (ruta de Python dominada + el proyecto del framework)
  {
    const hidden = await open(browser, seedState({ lang: "python" }));
    await hidden.page.locator(".nav").getByRole("button", { name: "Biblioteca" }).click();
    await hidden.page.locator(".library").waitFor();
    const groups = await hidden.page.locator(".lib-group-name").allTextContents();
    await hidden.page.locator(".lib-search input[type=search]").fill("fastapi dev");
    await hidden.page.waitForTimeout(100);
    const found = await hidden.page.locator(".lib-entry .lib-topic-tag, .lib-entry").allTextContents();
    ok(!groups.includes("Frameworks") && !found.some((t) => /FastAPI/.test(t)), "sin ganarlos, los frameworks no aparecen ni en el menú ni en la búsqueda");
    await hidden.ctx.close();

    const keys = Object.fromEntries(LANGS.python.stages.flat().map((ch) => [ch, { n: 200, ema: 50, hits: 200, misses: 0, recent: "1".repeat(50) }]));
    const won = await open(browser, seedState({
      lang: "python",
      profiles: { "python:it": { stage: LANGS.python.stages.length - 1, steps: {}, keys, lessons: [], totals: { n: 0, ms: 0, chars: 0, best: 0 }, score: 0 } },
      projects: { p12: { ms: 60000, wpm: 30, acc: 1, ts: 1 } },
      frameworksChecked: true, // alguien que ya pasó por la revisión de la regla anterior
    }));
    await won.page.locator(".nav").getByRole("button", { name: "Biblioteca" }).click();
    await won.page.locator(".library").waitFor();
    ok((await won.page.locator(".lib-group-name").allTextContents()).includes("Frameworks"), "con la ruta de Python y la API de recetas, aparece la sección Frameworks");
    await won.page.locator(".lib-nav").getByRole("button", { name: /FastAPI/ }).click();
    ok((await won.page.locator(".lib-head h3").textContent()) === "FastAPI", "se puede abrir FastAPI");
    ok(!(await won.page.locator(".lib-nav").getByRole("button", { name: /React/ }).count()), "React sigue oculto (no terminaste TypeScript ni JavaScript)");
    ok(!(await won.page.locator(".lib-nav").getByRole("button", { name: /Django/ }).count()), "Django sigue oculto: hace falta su propio proyecto, no cualquiera en Python");
    ok(won.errors.length === 0, `frameworks sin errores de consola${won.errors.length ? ": " + won.errors[0] : ""}`);
    await won.ctx.close();

    // quien ya tenía frameworks con la regla anterior (ruta + cualquier proyecto en Python) no los pierde, una sola vez
    const rec = { ms: 60000, wpm: 30, acc: 1, ts: 1 };
    const profile = { stage: LANGS.python.stages.length - 1, steps: {}, keys, lessons: [], totals: { n: 0, ms: 0, chars: 0, best: 0 }, score: 0 };
    const viejo = await open(browser, seedState({ lang: "python", profiles: { "python:it": profile }, projects: { p01: rec } }));
    await viejo.page.locator(".nav").getByRole("button", { name: "Biblioteca" }).click();
    await viejo.page.locator(".library").waitFor();
    ok(
      (await viejo.page.locator(".lib-nav").getByRole("button", { name: /Django/ }).count()) === 1 && (await viejo.page.locator(".lib-nav").getByRole("button", { name: /FastAPI/ }).count()) === 1,
      "quien ya tenía Django y FastAPI con la regla anterior los conserva",
    );
    ok(Object.keys((await state(viejo.page)).frameworks).sort().join() === "django,fastapi" && (await state(viejo.page)).frameworksChecked === true, "y quedan guardados para no volver a ocultarse");
    await viejo.ctx.close();
    const nuevo = await open(browser, seedState({ lang: "python", profiles: { "python:it": profile }, projects: { p01: rec }, frameworksChecked: true }));
    await nuevo.page.locator(".nav").getByRole("button", { name: "Biblioteca" }).click();
    await nuevo.page.locator(".library").waitFor();
    ok(!(await nuevo.page.locator(".lib-group-name").allTextContents()).includes("Frameworks"), "con la revisión ya hecha, un proyecto cualquiera en Python no abre nada");
    await nuevo.ctx.close();
  }

  // 12. practicar un ejemplo de la Biblioteca y repasarlo intercalado en las lecciones
  {
    const { page, errors, ctx } = await open(browser, seedState({ lang: "python" }));
    await page.locator(".nav").getByRole("button", { name: "Biblioteca" }).click();
    const entry = page.locator(".lib-entry").first();
    const id = (await entry.getAttribute("id")) ?? "";
    await entry.getByRole("button", { name: "Practicar este ejemplo" }).click();
    await page.locator(".entry-practice").waitFor();
    await page.waitForFunction(() => document.activeElement?.classList.contains("ta-hidden"));
    await page.keyboard.press("Escape");
    ok((await page.locator(".entry-practice").count()) === 0, "Esc cierra la práctica del ejemplo");
    await entry.getByRole("button", { name: "Practicar este ejemplo" }).click();
    await page.waitForFunction(() => document.activeElement?.classList.contains("ta-hidden"));
    const text = (await page.locator(".ep-box").getAttribute("data-text")) ?? "";
    await typeLesson(page, text);
    await page.locator(".ep-result").waitFor({ timeout: 5000 });
    let st = await state(page);
    ok(st.review?.[id]?.box === 0 && st.review[id].n === 1, "terminar el ejemplo lo suma al repaso");
    ok(/Quedó en tu repaso: vuelve mañana/.test((await page.locator(".ep-review").textContent()) ?? ""), "avisa cuándo vuelve");
    await page.getByRole("button", { name: "Volver a la Biblioteca" }).click();
    ok(/En repaso · vuelve mañana/.test((await entry.locator(".lib-review").textContent()) ?? ""), "la entrada muestra que está en repaso");
    ok(/1 en tu repaso/.test((await page.locator(".lib-in-review").textContent()) ?? ""), "el tema cuenta cuántas tiene en repaso");
    await entry.getByRole("button", { name: /Quitar .* del repaso/ }).click();
    st = await state(page);
    ok(!st.review?.[id] && (await entry.locator(".lib-review").count()) === 0, "se puede quitar una entrada del repaso");
    ok(st.profiles?.["python:it"] === undefined, "practicar desde la Biblioteca no toca el progreso del lenguaje");
    ok(errors.length === 0, `practicar ejemplos sin errores de consola${errors.length ? ": " + errors[0] : ""}`);
    await ctx.close();
  }
  {
    const git = TOPICS.find((t) => t.id === "git")!;
    const gid = entryId(git, git.entries[0]);
    const due = { box: 0, due: "2020-01-01", n: 1, lapses: 0, ts: 0 };
    const { page, errors, ctx } = await open(browser, seedState({ lang: "python", review: { [gid]: due } }));
    let found = false;
    let lessons = 0;
    for (let i = 0; i < 7 && !found; i++) {
      found = (await page.locator(".snippet-title.is-review").count()) > 0;
      if (found) break;
      // terminar lecciones puede desbloquear un símbolo: se cierra el aviso
      if (await page.locator(".modal-back").count()) await page.keyboard.press("Enter");
      await focusPractice(page);
      await typeLesson(page, await lessonText(page));
      lessons++;
      await page.waitForFunction((n) => {
        const st = JSON.parse(localStorage.getItem("neontype:v1") ?? "{}");
        return st.profiles?.["python:it"]?.lessons?.length === n;
      }, lessons);
    }
    ok(found && lessons >= 3 && lessons <= 5, `el repaso aparece intercalado entre las lecciones (después de ${lessons})`);
    ok(/REPASO/.test((await page.locator(".snippet-title").textContent()) ?? "") && /Git/.test((await page.locator(".code-head .tags").textContent()) ?? ""), "la lección de repaso se marca y dice de qué tema es");
    if (await page.locator(".modal-back").count()) await page.keyboard.press("Enter");
    await focusPractice(page);
    await typeLesson(page, await lessonText(page));
    await page.waitForFunction(() => /Repaso de/.test(document.querySelector(".panel-foot .last")?.textContent ?? ""));
    const st = await state(page);
    ok(st.review[gid]?.box === 1 && st.review[gid].due > "2020-01-01", "un repaso bien hecho sube de caja y se aleja la fecha");
    ok(st.profiles["python:it"].lessons.length === lessons, "el repaso no cuenta como lección del lenguaje");
    ok(/bien hecho · vuelve en 3 días/.test((await page.locator(".panel-foot .last").textContent()) ?? ""), "avisa cuándo vuelve el repaso");
    ok((await page.locator(".snippet-title.is-review").count()) === 0, "después sigue una lección normal");
    ok(errors.length === 0, `repaso intercalado sin errores de consola${errors.length ? ": " + errors[0] : ""}`);
    await ctx.close();
  }

  // 13. el diálogo de práctica atrapa el foco y respeta el teclado italiano
  {
    const { page, errors, ctx } = await open(browser, seedState({ lang: "javascript" }));
    await page.locator(".nav").getByRole("button", { name: "Biblioteca" }).click();
    await page.locator(".lib-search input[type=search]").fill("template literals");
    await page.locator(".lib-search input[type=search]").press("Enter");
    const entry = page.locator(".lib-entry", { hasText: "Template literals" }).first();
    await entry.getByRole("button", { name: "Practicar este ejemplo" }).click();
    await page.waitForFunction(() => document.activeElement?.classList.contains("ta-hidden"));
    const text = (await page.locator(".ep-box").getAttribute("data-text")) ?? "";
    ok(!text.includes("`") && /Salteé \d+ l[ií]neas? con `/.test((await page.locator(".ep-note").textContent()) ?? ""), "con teclado italiano salta las líneas con ` y lo avisa");
    const inside = () => page.evaluate(() => !!document.activeElement?.closest(".entry-practice"));
    let trapped = true;
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press("Tab");
      trapped &&= await inside();
    }
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press("Shift+Tab");
      trapped &&= await inside();
    }
    ok(trapped, "Tab y Shift+Tab no sacan el foco del diálogo");
    ok(await page.evaluate(() => (document.getElementById("root") as HTMLElement & { inert: boolean }).inert), "el resto de la app queda inerte mientras está abierto");
    await page.keyboard.press("Escape");
    ok(!(await page.evaluate(() => (document.getElementById("root") as HTMLElement & { inert: boolean }).inert)) && /Practicar este ejemplo/.test((await page.evaluate(() => document.activeElement?.textContent)) ?? ""), "al cerrar, la app vuelve a responder y el foco vuelve al botón");
    ok(errors.length === 0, `diálogo de práctica sin errores de consola${errors.length ? ": " + errors[0] : ""}`);
    await ctx.close();
  }

  // 14. dos ventanas abiertas no se pisan los cambios
  {
    const { page: a, errors, ctx } = await open(browser);
    const b = await ctx.newPage();
    b.on("pageerror", (e) => errors.push(e.message));
    await b.goto(APP);
    await b.locator(".code-box").waitFor();
    for (const p of [a, b]) await p.getByRole("button", { name: "Ajustes" }).click();
    await a.locator("input[placeholder='Tu nombre']").fill("Ventana A");
    await b.waitForFunction(() => (document.querySelector("input[placeholder='Tu nombre']") as HTMLInputElement)?.value === "Ventana A");
    ok(true, "la otra ventana ve el cambio al instante");
    await b.locator("input[type=range]").first().fill("45");
    await a.waitForFunction(() => /45 WPM/.test(document.querySelector("output")?.textContent ?? ""));
    const st = await state(a);
    ok(st.settings.userName === "Ventana A" && st.settings.targetWpm === 45, "el cambio de una ventana no borra el de la otra");
    ok(errors.length === 0, `dos ventanas sin errores${errors.length ? ": " + errors[0] : ""}`);
    await ctx.close();
  }

  // 15. ejercicios de memoria: corrección, pista, aviso leve y desbloqueo del nivel siguiente
  {
    const { page, errors, ctx } = await open(browser);
    await page.locator(".nav").getByRole("button", { name: "Desafíos" }).click();
    const inter = page.getByRole("button", { name: /^Git Intermedio/ });
    ok(await inter.isDisabled(), "el nivel Intermedio arranca bloqueado");
    await page.getByRole("button", { name: /^Git Básico/ }).click();
    const input = page.locator(".recall-input");
    await input.waitFor();
    ok(await input.evaluate((el) => el === document.activeElement), "el foco va directo a la respuesta");
    await input.fill("git log");
    await input.press("Enter");
    ok(/Todavía no\. Ese comando hace otra cosa/.test((await page.locator(".rf.wrong").textContent()) ?? ""), "un comando equivocado no avanza y dice por qué");
    ok((await page.locator(".recall").getByRole("button", { name: "Siguiente", exact: true }).count()) === 0, "con un error grave no se puede seguir");
    await page.getByRole("button", { name: "Ver una pista" }).click();
    ok(/Pista:/.test((await page.locator(".rf-hint").textContent()) ?? ""), "se puede pedir una pista");
    const answers = ["git   status", "git add -A", "git commit -m 'primer commit'", "git log --oneline"];
    for (const [i, a] of answers.entries()) {
      await input.fill(a);
      await input.press("Enter");
      await page.locator(".rf.ok, .rf.minor").waitFor();
      if (i === 0) ok(/espacios/.test((await page.locator(".rf.minor").textContent()) ?? ""), "espacios de más: vale con un aviso");
      if (i === 2) ok(/comillas/.test((await page.locator(".rf.minor").textContent()) ?? ""), "otras comillas: vale con un aviso");
      if (i === 3) ok((await page.locator(".rf.ok").count()) === 1, "respuesta exacta: correcta");
      await page.keyboard.press("Enter");
    }
    ok(/Nivel completo/.test((await page.locator(".recall h2").textContent()) ?? ""), "terminar los 4 ejercicios completa el nivel");
    const st = await state(page);
    ok(["git-1-1", "git-1-2", "git-1-3", "git-1-4"].every((id) => st.recall?.[id] > 0), "se guardan los ejercicios resueltos");
    await page.getByRole("button", { name: "Nivel Intermedio" }).click();
    ok(/intermedio/i.test((await page.locator(".recall .kicker").textContent()) ?? ""), "se abre el nivel siguiente");
    await page.getByRole("button", { name: "Volver a desafíos" }).click();
    ok(!(await inter.isDisabled()) && /0\/4/.test((await inter.textContent()) ?? ""), "en Desafíos el nivel Intermedio queda abierto");
    ok(errors.length === 0, `ejercicios de memoria sin errores de consola${errors.length ? ": " + errors[0] : ""}`);
    await ctx.close();
  }

  // 16. atajos de editor: Vim y VS Code con estrellas, desbloqueo y juego de Mac
  {
    const { page, errors, ctx } = await open(browser, seedState({ settings: { vscodeKeys: "pc" } }));
    await page.locator(".nav").getByRole("button", { name: "Desafíos" }).click();
    ok(await page.getByRole("button", { name: /^Vim Intermedio/ }).isDisabled(), "el nivel Intermedio de Vim arranca bloqueado");
    await page.getByRole("button", { name: /^Vim Básico/ }).click();
    const editor = page.locator(".sc-editor[tabindex]");
    await page.waitForFunction(() => document.activeElement?.classList.contains("sc-editor"));
    ok(true, "el foco va directo al editor");
    await page.keyboard.press("j");
    ok((await page.locator(".sc-status b").textContent()) === "1", "cada tecla cuenta");
    await page.locator(".panel-foot").getByRole("button", { name: /Reiniciar/ }).click();
    await editor.focus();
    for (const k of ["f", "l", "x"]) await page.keyboard.press(k);
    await page.locator(".sc-result").waitFor();
    ok((await page.locator(".sc-stars .on").count()) === 3, "resolverlo con el par da tres estrellas");
    let st = await state(page);
    ok(st.shortcuts?.["vim-1-1"]?.keys === 3 && st.shortcuts["vim-1-1"].stars === 3, "se guarda la marca");
    await page.getByRole("button", { name: "Siguiente ejercicio" }).click();
    await page.waitForFunction(() => document.activeElement?.classList.contains("sc-editor"));
    // en el modo inserción las letras se escriben; Esc vuelve al modo normal
    await page.keyboard.press("j");
    await page.keyboard.press("d");
    await page.keyboard.press("d");
    await page.locator(".sc-result").waitFor();
    await page.getByRole("button", { name: "Siguiente ejercicio" }).click();
    await page.keyboard.press("A");
    ok(/INSERTAR/.test((await page.locator(".sc-mode").textContent()) ?? ""), "A entra en modo inserción");
    await page.keyboard.press(";");
    await page.keyboard.press("Escape");
    await page.locator(".sc-result").waitFor();
    ok(/NORMAL/.test((await page.locator(".sc-mode").textContent()) ?? ""), "Esc vuelve al modo normal sin salir del ejercicio");
    await page.locator(".panel-foot").getByRole("button", { name: "Volver a desafíos" }).click();

    await page.getByRole("button", { name: /^VS Code Básico/ }).click();
    await page.waitForFunction(() => document.activeElement?.classList.contains("sc-editor"));
    ok(/Ctrl\+Shift\+K/.test((await page.locator(".sc-use").textContent()) ?? ""), "muestra el atajo de Linux/Windows");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Control+Shift+K");
    await page.locator(".sc-result").waitFor();
    st = await state(page);
    ok(st.shortcuts?.["vscode-1-1"]?.stars === 3, "Ctrl+Shift+K borra la línea y completa el ejercicio");
    await page.getByRole("button", { name: "Siguiente ejercicio" }).click();
    await page.keyboard.press("Tab");
    ok(await page.evaluate(() => !document.activeElement?.classList.contains("sc-editor")), "Tab saca el foco del editor (no queda atrapado)");
    await page.locator(".panel-foot").getByRole("button", { name: "Volver a desafíos" }).click();
    await page.locator(".sc-taught summary").click();
    ok(/Ctrl\+W/.test((await page.locator(".sc-taught").textContent()) ?? ""), "lista los atajos que solo se enseñan");

    await page.getByRole("button", { name: "Ajustes" }).click();
    await page.getByRole("button", { name: "Mac", exact: true }).click();
    await page.locator(".nav").getByRole("button", { name: "Desafíos" }).click();
    await page.getByRole("button", { name: /^VS Code Básico/ }).click();
    ok(/mac/i.test((await page.locator(".shortcut .kicker").textContent()) ?? "") && /Alt\+↑/.test((await page.locator(".sc-use").textContent()) ?? ""), "con Mac elegido, el ejercicio usa ese juego de atajos");
    ok(errors.length === 0, `atajos sin errores de consola${errors.length ? ": " + errors[0] : ""}`);
    await ctx.close();
  }

  // 17. entrevistas: banco, práctica con repaso y entrevista simulada con informe
  {
    const { page, errors, ctx } = await open(browser, seedState({ lang: "python" }));
    const preguntaActual = async () => {
      const texto = ((await page.locator(".iv-q .iv-q-text").textContent()) ?? "").trim();
      const codigo = (await page.locator(".iv-q .lib-code").count()) ? ((await page.locator(".iv-q .lib-code").textContent()) ?? "").trim() : "";
      const q = BANCO.find((x) => x.texto === texto && (x.codigo ?? "").trim() === codigo);
      if (!q) throw new Error(`pregunta que no está en el banco: ${texto}`);
      return q;
    };
    /** Contesta bien o mal la pregunta que está en pantalla. En el examen hay que confirmar con Responder. */
    const responder = async (bien: boolean, examen: boolean) => {
      const q = await preguntaActual();
      if (q.formato === "codigo") {
        await page.locator(".iv-input").fill(bien ? q.respuestas![0] : "zzz");
        if (examen) await page.getByRole("button", { name: "Responder", exact: true }).click();
        else await page.locator(".iv-input").press("Enter");
        return;
      }
      const textos = await page.locator(".iv-opt-text").allTextContents();
      await page.locator(".iv-opt").nth(textos.findIndex((x) => (x === q.opciones![0]) === bien)).click();
      if (examen) await page.getByRole("button", { name: "Responder", exact: true }).click();
    };

    await page.locator(".nav").getByRole("button", { name: "Entrevistas" }).click();
    await page.locator(".iv").waitFor();

    // banco
    await page.getByRole("tab", { name: "Banco de preguntas" }).click();
    ok((await page.locator(".iv-count").textContent())?.startsWith(`${BANCO.length} preguntas`) === true, "el banco muestra todas las preguntas");
    await page.getByRole("searchbox", { name: "Buscar preguntas" }).fill("decorador");
    const halladas = await page.locator(".iv-card").count();
    ok(halladas >= 1 && halladas < 10, "el buscador del banco filtra por texto");
    await page.locator(".iv-card").first().getByRole("button", { name: "Ver respuesta" }).click();
    const fuente = page.locator(".iv-card .iv-answer a").first();
    ok(
      /^https:\/\//.test((await fuente.getAttribute("href")) ?? "") && (await fuente.getAttribute("target")) === "_blank" && /noopener/.test((await fuente.getAttribute("rel")) ?? ""),
      "la respuesta del banco enlaza su fuente en una pestaña nueva y sin pasar datos",
    );

    // práctica: lo que se falla entra al repaso
    await page.getByRole("tab", { name: "Practicar" }).click();
    await page.getByRole("group", { name: "Cantidad" }).getByRole("button", { name: "5", exact: true }).click();
    await page.getByRole("button", { name: "Empezar a practicar" }).click();
    for (let n = 0; n < 5; n++) {
      await responder(n !== 0, false);
      await page.locator(".iv-feedback").waitFor();
      if (n === 0) ok(/No era esa/.test((await page.locator(".iv-feedback").textContent()) ?? ""), "al fallar, la práctica corrige al instante y explica");
      await page.locator(".iv-feedback .btn").click();
    }
    ok(/4 de 5 bien/.test((await page.locator(".iv-done .iv-big").textContent()) ?? ""), "la práctica termina con el resultado");
    const st1 = await state(page);
    ok(Object.keys(st1.interviewReview).length === 1, "la pregunta fallada entra al repaso y las acertadas, no");
    await page.getByRole("button", { name: "Volver a practicar" }).click();
    ok(await page.getByRole("button", { name: "Repasar las de hoy" }).isDisabled(), "lo fallado hoy vuelve mañana: hoy no hay nada para repasar");

    // terminar sin pulsar Siguiente no pierde la respuesta fallada
    await page.getByRole("button", { name: "Empezar a practicar" }).click();
    const antes = Object.keys((await state(page)).interviewReview);
    const qFallada = await preguntaActual();
    await responder(false, false);
    await page.locator(".iv-feedback").waitFor();
    await page.locator(".iv-progress").getByRole("button", { name: "Terminar" }).click();
    ok(Object.keys((await state(page)).interviewReview).includes(qFallada.id) && antes.length <= Object.keys((await state(page)).interviewReview).length, "una respuesta fallada se guarda en el repaso aunque se termine sin pulsar Siguiente");

    // entrevista simulada: reloj, sin corrección en el medio, aviso al salir e informe
    await page.getByRole("tab", { name: "Entrevista simulada" }).click();
    await page.getByRole("button", { name: "Empezar la entrevista" }).click();
    await page.locator(".iv-live").waitFor();
    ok(/Pregunta 1 de 8/.test((await page.locator(".iv-live-head").textContent()) ?? ""), "la entrevista de 15 minutos tiene 8 preguntas");
    ok(/^1[45]:\d\d$/.test(((await page.locator(".iv-timer").textContent()) ?? "").trim()), "el reloj arranca en 15 minutos");
    ok((await page.locator(".iv-q .iv-tag").first().textContent()) === "Conducta y trabajo en equipo", "la entrevista abre con una pregunta de conducta");
    ok((await page.getByRole("tab").count()) === 0, "durante la entrevista no hay pestañas para distraerse");
    await page.locator(".nav").getByRole("button", { name: "Biblioteca" }).click();
    ok(await page.getByText("¿Salir de la entrevista?").isVisible(), "salir a mitad de la entrevista pide confirmar");
    await page.getByRole("button", { name: "Seguir con la entrevista" }).click();
    ok(await page.locator(".iv-live").isVisible(), "seguir con la entrevista no la pierde");
    await page.locator("[data-tour=mode]").click();
    ok(await page.getByText("¿Salir de la entrevista?").isVisible(), "cambiar de modo a mitad de la entrevista también pide confirmar");
    await page.getByRole("button", { name: "Seguir con la entrevista" }).click();
    ok(await page.locator(".iv-live").isVisible(), "cancelar el cambio de modo no pierde la entrevista");
    for (let n = 0; n < 8; n++) {
      await responder(true, true);
      if (n === 0) ok((await page.locator(".iv-feedback").count()) === 0, "en la entrevista no hay corrección hasta el informe");
      if (n < 7) await page.locator(".iv-live-head").getByText(new RegExp(`Pregunta ${n + 2} de`)).waitFor();
    }
    await page.locator(".iv-report").waitFor();
    ok(/Nota 10\.0 sobre 10/.test((await page.locator(".iv-report .iv-big").textContent()) ?? "") && /Aprobado/.test((await page.locator(".iv-verdict").textContent()) ?? ""), "todo bien da nota 10 y aprobado");
    const st2 = await state(page);
    const recs = Object.values(st2.interviews) as { ok: number; total: number }[];
    ok(recs.length === 1 && recs[0].ok === 8 && recs[0].total === 8, "la entrevista terminada se guarda");

    // segunda entrevista, toda mal: el informe lista lo fallado y se repasa directo
    await page.getByRole("button", { name: "Otra entrevista" }).click();
    ok((await page.locator(".iv-history li").count()) === 1 && /10\.0/.test((await page.locator(".iv-history li").first().textContent()) ?? ""), "el historial muestra la entrevista anterior");
    await page.getByRole("button", { name: "Empezar la entrevista" }).click();
    for (let n = 0; n < 8; n++) {
      await responder(false, true);
      if (n < 7) await page.locator(".iv-live-head").getByText(new RegExp(`Pregunta ${n + 2} de`)).waitFor();
    }
    await page.locator(".iv-report").waitFor();
    ok(/Nota 0\.0/.test((await page.locator(".iv-report .iv-big").textContent()) ?? "") && /Para repasar \(8\)/.test((await page.locator(".iv-report").textContent()) ?? ""), "todo mal da nota 0 y lista las 8 para repasar");
    await page.getByRole("button", { name: "Repasar las falladas" }).click();
    await page.locator(".iv-run").waitFor();
    ok(/Repaso · pregunta 1 de 8/.test((await page.locator(".iv-progress").textContent()) ?? ""), "las falladas del informe se repasan directo");

    // persistencia (el guardado va con retraso: se espera a que estén las dos antes de recargar)
    for (let i = 0; i < 50 && Object.keys((await state(page)).interviews).length < 2; i++) await page.waitForTimeout(100);
    await page.reload();
    await page.locator(".nav").getByRole("button", { name: "Entrevistas" }).click();
    await page.getByRole("tab", { name: "Entrevista simulada" }).click();
    await page.locator(".iv-history li").first().waitFor();
    ok((await page.locator(".iv-history li").count()) === 2, "las entrevistas guardadas siguen después de recargar");
    ok(errors.length === 0, `entrevistas sin errores de consola${errors.length ? ": " + errors[0] : ""}`);
    await ctx.close();
  }

  // 17b. el reloj termina la entrevista solo y lo no respondido cuenta como no respondido
  {
    const { page, errors, ctx } = await open(browser, seedState({ lang: "python" }), { clock: true });
    await page.locator(".nav").getByRole("button", { name: "Entrevistas" }).click();
    await page.getByRole("button", { name: "Empezar la entrevista" }).click();
    await page.locator(".iv-live").waitFor();
    await page.clock.fastForward("16:00");
    await page.locator(".iv-report").waitFor();
    ok(/0 de 8 bien/.test((await page.locator(".iv-report").textContent()) ?? ""), "al acabarse el tiempo, la entrevista termina sola");
    const recs = Object.values((await state(page)).interviews) as { ok: number; total: number; ms: number }[];
    ok(recs.length === 1 && recs[0].total === 8 && recs[0].ms <= 15 * 60_000, "la entrevista cortada por el reloj se guarda con el tiempo límite");
    ok(errors.length === 0, `reloj de la entrevista sin errores de consola${errors.length ? ": " + errors[0] : ""}`);
    await ctx.close();
  }
} finally {
  await browser.close();
  server.close();
}

console.log(failed ? `\n${failed} prueba(s) fallaron` : "\nTodas las pruebas en navegador pasaron");
process.exit(failed ? 1 : 0);
