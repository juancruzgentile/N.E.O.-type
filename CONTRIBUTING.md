# Contribuir a N.E.O.-type

## Preparar el entorno

```bash
npm install
npm run dev
```

Antes de abrir un pull request, verificá que pasen:

```bash
npm run build   # typecheck + build
npm run check   # validación de los generadores de código
```

## Agregar un lenguaje

1. Creá `src/gen/lang/<lenguaje>.ts` exportando un objeto `LangImpls`: una función por concepto de
   `src/gen/concepts.ts` que devuelve una o varias variantes de código.
2. Registralo en `IMPLS` (`src/gen/index.ts`) y en `LangId` (`src/types.ts`).
3. Definí su ruta de símbolos en `src/data/curriculum.ts`. Conviene que los primeros símbolos permitan generar
   código real pronto (`npm run check` informa desde qué etapa aparece).
4. Agregá palabras clave para el resaltado en `src/highlight.ts`.

## Agregar un concepto

1. Agregá el id a `ConceptId` y su título en español a `CONCEPTS` (`src/gen/concepts.ts`).
2. Implementalo en los lenguajes que tenga sentido. Si un lenguaje no lo implementa, simplemente no aparece ahí.

## Agregar o corregir un teclado

Los teclados están en `src/data/layouts.ts`. Cada tecla define `[normal, Shift, AltGr, Shift+AltGr]` y las teclas
muertas van en `dead`.

## Estilo

- TypeScript estricto, sin `any`.
- El código generado debe ser idiomático en su lenguaje y usar solo ASCII.
- Interfaz y títulos en español; nombres en el código generado en inglés.
