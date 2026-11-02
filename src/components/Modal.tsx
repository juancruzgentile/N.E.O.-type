import { type ReactNode, useRef } from "react";
import { createPortal } from "react-dom";
import { useModalFocus } from "./useModalFocus";

/** Ventana modal simple: fuera de la app (portal) y con el foco atrapado adentro. */
export function Modal({ labelledBy, className = "", children }: { labelledBy: string; className?: string; children: ReactNode }) {
  const boxRef = useRef<HTMLDivElement>(null);
  useModalFocus(boxRef);
  return createPortal(
    <div className="modal-back">
      <div ref={boxRef} className={"frame glow modal " + className} role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
        {children}
      </div>
    </div>,
    document.body,
  );
}
