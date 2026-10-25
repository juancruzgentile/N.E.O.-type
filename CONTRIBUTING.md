# Contribuir a N.E.O.-type

## Preparar el entorno

```bash
npm ci          # respeta el lockfile; .npmrc desactiva los scripts de instalación
npm run dev
```

Antes de abrir un pull request, verificá que pasen:

```bash
npm run build          # typecheck + build (incluye la Content Security Policy)
npm run check          # validación de los generadores de código
npm run test:security  # validación de datos y CSP
```

Registrá los cambios visibles en `CHANGELOG.md`, en la sección de la próxima versión.

## Seguridad

- No uses `innerHTML`, `dangerouslySetInnerHTML` ni `eval`: la CSP y Trusted Types los bloquean en el build.
- La app no hace conexiones de red. Si una función nueva lo necesitara, hay que discutirlo antes (cambia el modelo
  de privacidad).
- Todo dato nuevo que se guarde debe validarse en `src/sanitize.ts`.
- Evitá agregar dependencias. Si es imprescindible, fijá la versión exacta.
- Las vulnerabilidades se reportan en privado (ver `SECURITY.md`).

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
