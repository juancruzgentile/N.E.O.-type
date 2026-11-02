import { type RefObject, useEffect } from "react";

const FOCUSABLE = "button:not([disabled]), textarea, input, select, a[href], [tabindex]:not([tabindex='-1'])";

// cuántos diálogos hay abiertos: la app vuelve a ser usable cuando se cierra el último
let open = 0;

/**
 * Comportamiento común de los diálogos modales: el resto de la app queda inerte
 * (ni el teclado ni los lectores de pantalla llegan a ella), Tab y Shift+Tab
 * dan la vuelta dentro del diálogo y al cerrarlo el foco vuelve a donde estaba.
 */
export function useModalFocus(boxRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    const root = document.getElementById("root");
    open++;
    if (root) root.inert = true;

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || e.defaultPrevented) return;
      const box = boxRef.current;
      if (!box) return;
      const items = [...box.querySelectorAll<HTMLElement>(FOCUSABLE)];
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      const outside = !active || !box.contains(active);
      if (e.shiftKey && (outside || active === first)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (outside || active === last)) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      open--;
      if (root && open === 0) root.inert = false;
      if (before && document.contains(before)) before.focus();
    };
  }, [boxRef]);
}
