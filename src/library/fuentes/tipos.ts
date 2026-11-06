// Fuente de cada ejemplo de la Biblioteca: [link a la documentación oficial, desde qué versión existe (si importa)].
export type Fuente = [url: string, desde?: string];
export type FuentesTema = { version: string; entradas: Record<string, Fuente> };
