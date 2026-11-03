# Contribuir a N.E.O.-type

## Preparar el entorno

```bash
npm ci          # respeta el lockfile; .npmrc desactiva los scripts de instalación
npm run dev
```

Antes de abrir un pull request, verificá que pasen:

```bash
npm run build   # typecheck + build (incluye la Content Security Policy)
npm test        # todas las pruebas (detalle abajo)
```

| Comando | Qué prueba |
| --- | --- |
| `npm run check` | Generadores de código |
| `npm run test:logic` | Progreso, logros, resaltado, canciones guardadas, ejercicios de memoria y atajos de editor |
| `npm run test:regression` | Errores ya corregidos (ver `correcciones.txt`) |
| `npm run test:security` | Validación de datos y CSP del build |
| `npm run test:examples` | Sintaxis de los ejemplos de la Biblioteca, con el parser de cada lenguaje |
| `npm run test:projects` | Que los proyectos compilen y pasen sus pruebas |
| `npm run test:e2e` | La app en Chromium real: lección, pegar, Tab, desafío, modo calmo, exportar/importar, menú, proyectos, biblioteca y repaso |

`test:e2e` usa el build (`NeonType.html`) y necesita el navegador una sola vez:
`npx playwright-core install --only-shell chromium`.

`test:examples` y `test:projects` usan las herramientas de cada lenguaje (Python, Go, javac, dotnet, cargo,
rustfmt…). Si te falta alguna, esa parte se saltea con un aviso; en el CI están todas y no se saltea nada. Para los
proyectos de FastAPI hacen falta los paquetes de `scripts/requisitos-pruebas.txt`.

Si arreglás un error, agregá la prueba que lo detecta en `test:regression` o `test:e2e`.

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

## Agregar una ruta Trainee

1. Creá `src/tracks/<ruta>.ts` con un objeto `Track`: escalones en orden de dificultad, temas de cada escalón y, si
   aplica, variantes (motor, distribución…) con un ajuste para la práctica libre.
2. Cada tema devuelve `{ title, text }` para una variante, o `null` si el tema no existe en ella.
3. Registrala en `TRACKS` y `TRACK_ORDER` (`src/tracks/index.ts`), en `TrackId` (`src/types.ts`), en `LANGS`
   (`src/data/curriculum.ts`), en `LANG_IDS` (`src/sanitize.ts`), en el emblema y en el resaltado.
4. Corré `npm run check`: verifica que los textos usen solo los símbolos declarados (y que todos aparezcan), que sean
   ASCII sin espacios finales y que cada escalón tenga ejercicios escribibles en los cuatro teclados.

## Agregar un concepto

1. Agregá el id a `ConceptId` y su título en español a `CONCEPTS` (`src/gen/concepts.ts`).
2. Implementalo en los lenguajes que tenga sentido. Si un lenguaje no lo implementa, simplemente no aparece ahí.

## Agregar o cambiar un proyecto

Los proyectos están en `src/projects/projects.ts`, en orden de dificultad. El orden lo da `num`; el `id` no se cambia
nunca, porque los récords se guardan con él (por eso el tablero full stack sigue siendo `p10` aunque sea el 14). Para
escribir `${` dentro de un proyecto, poné `\${`. Cada archivo indica su resaltado y el ancho
de la sangría (`tabWidth`; 0 si usa tabulaciones reales, como Go o Makefile, y entonces se escribe con `tabs`).
`npm run check` verifica que cada proyecto sea más largo que el anterior, que sea ASCII sin espacios finales ni
`` ` `` o `~`, que las sangrías sean coherentes y que se pueda escribir con los cuatro teclados. El código tiene que
funcionar de verdad: sumá en `scripts/check-projects.ts` cómo se compila y se prueba, y corré `npm run test:projects`.

## Agregar un tema a la Biblioteca

1. Creá `src/library/<tema>.ts` exportando un objeto `Topic` (ver `src/library/types.ts`): resumen, datos rápidos,
   métodos de trabajo y entradas con los atajos `b()`, `m()` y `a()` (básico, intermedio, avanzado).
2. Escribí los ejemplos con la plantilla `` code`…` ``: las barras invertidas quedan tal cual; `` ` `` y `$` se escapan.
3. Sumalo a `TOPICS` en `src/library/index.ts`. Si estaba en Próximamente, sacalo de `SOON`.
4. `npm run test:logic` revisa que tenga los tres niveles, ejemplos y métodos de trabajo, y que los ids no se repitan.
5. `npm run test:examples` revisa la sintaxis de los ejemplos. Si el tema es de un lenguaje nuevo, sumale un revisor
   en `scripts/check-examples.ts`.

## Agregar o corregir un teclado

Los teclados están en `src/data/layouts.ts`. Cada tecla define `[normal, Shift, AltGr, Shift+AltGr]` y las teclas
muertas van en `dead`.

## Estilo

- TypeScript estricto, sin `any`.
- El código generado debe ser idiomático en su lenguaje y usar solo ASCII.
- Interfaz y títulos en español; nombres en el código generado en inglés.
