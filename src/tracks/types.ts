// Estructura de las rutas Trainee: escalones que agregan temas y variantes
// (motor de base de datos, distribución…), con progreso por escalón.

import type { Rng } from "../gen/base";
import type { TrackId } from "../types";

export interface Exercise {
  title: string;
  text: string;
}

export interface Topic {
  id: string;
  /** genera un ejercicio para la variante; null si el tema no existe en esa variante */
  gen: (rng: Rng, variant: string) => Exercise | null;
}

export interface Step {
  id: string;
  /** nombre corto que se ve en la ruta: "SQLite", "Fedora", "Flexbox" */
  name: string;
  /** qué se aprende en el escalón */
  desc: string;
  /** variantes con las que se practica el escalón en modo guiado */
  variants: string[];
  /** temas nuevos que agrega el escalón */
  topics: Topic[];
}

export interface Variant {
  id: string;
  name: string;
}

export interface Track {
  id: TrackId;
  /** rótulo del fragmento: CONSULTA, COMANDO… */
  label: string;
  /** todos los símbolos que pueden aparecer (los verifica scripts/check-generators) */
  symbols: string[];
  steps: Step[];
  /**
   * true: el escalón j practica los temas de los escalones 0..j con su propia variante
   * (SQL en MySQL incluye lo aprendido en SQLite). false: cada escalón practica solo sus temas.
   */
  cumulative: boolean;
  /** variantes disponibles (selector de la práctica libre) */
  variants: Variant[];
  /** ajuste que guarda la variante elegida para la práctica libre */
  freeSetting?: "distro" | "dbEngine";
}

export const variantName = (t: Track, id: string) => t.variants.find((v) => v.id === id)?.name ?? id;
