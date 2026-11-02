import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useModalFocus } from "./useModalFocus";

interface Props {
  kicker: string;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Pregunta antes de una acción que corta lo que estás haciendo.
 * Enter confirma, Esc cancela y el foco no sale del diálogo mientras está abierto.
 */
export function ConfirmDialog({ kicker, title, message, confirmLabel, cancelLabel = "Cancelar", onConfirm, onCancel }: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const okRef = useRef<HTMLButtonElement>(null);
  // el efecto se arma una sola vez: si el padre se vuelve a dibujar, el foco no salta
  const cancelRef = useRef(onCancel);
  cancelRef.current = onCancel;

  useModalFocus(boxRef);

  useEffect(() => {
    okRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        cancelRef.current();
      }
    };
    // en captura: tiene que ganarle a los atajos de la práctica (Esc reinicia)
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, []);

  return createPortal(
    <div className="modal-back" onClick={onCancel}>
      <div
        ref={boxRef}
        className="frame glow modal confirm"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-msg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="kicker">{kicker}</div>
        <h3 id="confirm-title" className="confirm-title">{title}</h3>
        <p id="confirm-msg">{message}</p>
        <div className="actions">
          <button ref={okRef} className="btn primary" onClick={onConfirm}>{confirmLabel}</button>
          <button className="btn" onClick={onCancel}>{cancelLabel}</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
