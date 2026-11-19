import type { KeyboardEvent } from "react";

/**
 * Teclado de un `role="tablist"` (patrón ARIA de pestañas): las flechas pasan a la pestaña
 * vecina (dando la vuelta), Inicio y Fin van a la primera y la última. La pestaña nueva
 * recibe el foco y se activa. Cada pestaña lleva `tabIndex` 0 si está elegida y -1 si no.
 */
export function tabKeys(e: KeyboardEvent<HTMLElement>) {
  const tabs = [...e.currentTarget.querySelectorAll<HTMLElement>('[role="tab"]')];
  const i = tabs.indexOf(document.activeElement as HTMLElement);
  if (i < 0) return;
  const next = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
  if (next === undefined) return;
  e.preventDefault();
  const tab = tabs[(next + tabs.length) % tabs.length];
  tab.focus();
  tab.click();
}
