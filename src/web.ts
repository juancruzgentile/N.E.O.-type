// Solo en la web: guarda la app en la máquina para usarla sin internet y avisa cuando hay una versión nueva.
// El progreso vive en localStorage y el service worker no lo toca nunca.
let esperando: ServiceWorker | null = null;

export const VERSION_NUEVA = "neo:version-nueva";
export const hayVersionNueva = () => !!esperando;

/** Pasa a la versión nueva y recarga. Solo cuando la persona lo pide: así no se corta una lección a la mitad. */
export function actualizar() {
  if (!esperando) return;
  navigator.serviceWorker.addEventListener("controllerchange", () => location.reload(), { once: true });
  esperando.postMessage("actualizar");
}

export function registrarWeb() {
  if (!("serviceWorker" in navigator)) return;
  // la CSP pide Trusted Types: esta política solo deja pasar el service worker de la app
  const tt = (window as unknown as { trustedTypes?: { createPolicy: (n: string, p: object) => { createScriptURL: (u: string) => unknown } } }).trustedTypes;
  const politica = tt?.createPolicy("neo-sw", { createScriptURL: (u: string) => { if (u !== "./sw.js") throw new TypeError(u); return u; } });
  const url = (politica ? politica.createScriptURL("./sw.js") : "./sw.js") as string;
  const ver = (sw: ServiceWorker | null) => {
    // sin controlador es la primera instalación: no hay nada viejo que reemplazar
    if (!sw || !navigator.serviceWorker.controller) return;
    esperando = sw;
    window.dispatchEvent(new Event(VERSION_NUEVA));
  };
  navigator.serviceWorker.register(url).then((reg) => {
    if (!reg) return; // con los service workers bloqueados (por ejemplo, en algunas pruebas) no hay registro
    ver(reg.waiting);
    reg.addEventListener("updatefound", () => {
      const sw = reg.installing;
      sw?.addEventListener("statechange", () => sw.state === "installed" && ver(sw));
    });
  }, () => {}); // sin service worker la web anda igual, solo que necesita red
}
