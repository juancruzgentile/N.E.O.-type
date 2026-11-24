import { useEffect, useState } from "react";
import { VERSION_NUEVA, actualizar, hayVersionNueva } from "../web";

/** Aviso de la web cuando bajó una versión nueva: se aplica recién cuando la persona toca Actualizar. */
export function AvisoVersion() {
  const [hay, setHay] = useState(hayVersionNueva);
  useEffect(() => {
    const f = () => setHay(true);
    window.addEventListener(VERSION_NUEVA, f);
    return () => window.removeEventListener(VERSION_NUEVA, f);
  }, []);
  if (!hay) return null;
  return (
    <div className="aviso-version" role="status">
      <span>Hay una versión nueva de N.E.O.-type. Tu progreso queda igual.</span>
      <button className="btn primary small" onClick={actualizar}>Actualizar</button>
      <button className="btn small" onClick={() => setHay(false)}>Después</button>
    </div>
  );
}
