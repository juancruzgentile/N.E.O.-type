// Fuente de cada ejemplo de la Biblioteca: [link a la documentación oficial, desde qué versión existe (si importa)].
export type Fuente = [url: string, desde?: string];
/** revisado: día en que se comprobó este tema (AAAA-MM-DD); si no está, vale la fecha general de index.ts. */
export type FuentesTema = { version: string; revisado?: string; entradas: Record<string, Fuente> };
