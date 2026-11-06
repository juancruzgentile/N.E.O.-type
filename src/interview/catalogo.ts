import type { Area, Nivel, Puesto } from "./types";

export const AREAS: Area[] = [
  { id: "python", nombre: "Python", grupo: "Lenguajes" },
  { id: "javascript", nombre: "JavaScript", grupo: "Lenguajes" },
  { id: "typescript", nombre: "TypeScript", grupo: "Lenguajes" },
  { id: "java", nombre: "Java", grupo: "Lenguajes" },
  { id: "csharp", nombre: "C#", grupo: "Lenguajes" },
  { id: "go", nombre: "Go", grupo: "Lenguajes" },
  { id: "rust", nombre: "Rust", grupo: "Lenguajes" },
  { id: "c", nombre: "C", grupo: "Lenguajes" },
  { id: "cpp", nombre: "C++", grupo: "Lenguajes" },
  { id: "swift", nombre: "Swift", grupo: "Lenguajes" },
  { id: "kotlin", nombre: "Kotlin", grupo: "Lenguajes" },
  { id: "php", nombre: "PHP", grupo: "Lenguajes" },
  { id: "sql", nombre: "SQL y bases de datos", grupo: "Web y datos" },
  { id: "html", nombre: "HTML", grupo: "Web y datos" },
  { id: "css", nombre: "CSS", grupo: "Web y datos" },
  { id: "linux", nombre: "Terminal Linux", grupo: "Herramientas" },
  { id: "git", nombre: "Git", grupo: "Herramientas" },
  { id: "algoritmos", nombre: "Algoritmos y estructuras", grupo: "General" },
  { id: "conductual", nombre: "Conducta y trabajo en equipo", grupo: "General" },
];

export const areaName = (id: string) => AREAS.find((a) => a.id === id)?.nombre ?? id;
export const LANG_AREAS = AREAS.filter((a) => a.grupo === "Lenguajes");

export const NIVELES: { id: Nivel; nombre: string }[] = [
  { id: "junior", nombre: "Junior" },
  { id: "semi", nombre: "Semi senior" },
  { id: "senior", nombre: "Senior" },
];

export const PUESTOS: Puesto[] = [
  { id: "backend", nombre: "Backend", desc: "Lenguaje, bases de datos, terminal, Git y algoritmos.", areas: ["sql", "linux", "git", "algoritmos"] },
  { id: "frontend", nombre: "Frontend", desc: "Lenguaje, HTML, CSS, Git y algoritmos.", areas: ["html", "css", "git", "algoritmos"] },
  { id: "fullstack", nombre: "Full stack", desc: "Lenguaje, web, bases de datos, Git y algoritmos.", areas: ["html", "css", "sql", "git", "algoritmos"] },
  { id: "general", nombre: "Programación general", desc: "Lenguaje, Git, terminal y algoritmos.", areas: ["git", "linux", "algoritmos"] },
];

/** Cuántas preguntas tiene la entrevista según su duración. */
export const PREGUNTAS_POR_DURACION: Record<15 | 30 | 45, number> = { 15: 8, 30: 14, 45: 20 };
