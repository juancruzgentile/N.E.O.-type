# Changelog

Todos los cambios relevantes del proyecto. El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/)
y el versionado sigue [SemVer](https://semver.org/lang/es/).

## [Sin publicar]

## [1.5.0] - 2026-10-28

Tutorial de bienvenida, nombre unificado como N.E.O.-type, navegación en pantallas chicas y correcciones de las
auditorías de la v1.4.0. Detalle de cada corrección en `correcciones.txt`.

### Corregido
- "Precisión perfecta" ya no da récord con un error en el último carácter.
- Al cortar un sprint, el fallo en la posición pendiente cuenta en la precisión.
- Pegar o arrastrar texto en la práctica ya no cuenta como tecleo; Tab libera el foco.
- Las copias de seguridad se exportan en JSON compacto y los límites se miden en bytes.
- Música: pausar conserva la posición, los ajustes importados se aplican, la selección sigue a la canción
  al quitar otras y IndexedDB espera la confirmación de cada transacción.
- No se repite el concepto de la lección anterior si hay alternativa.
- El título del ejercicio de proporciones CSS coincide con el código.
- Modo calmo: corta todas las animaciones, no calcula el fondo oculto y los logros quedan visibles.
- `npm run check` falla (código 1) si encuentra problemas.
- Requisito de Node corregido a `^20.19.0 || >=22.12.0`.
- Estadísticas ya no desborda en el celular: la tabla de símbolos se desplaza dentro de su recuadro.
- Al cerrar el tutorial, el foco vuelve al área de escritura en lugar de perderse.
- El CI corre en Ubuntu 24.04, porque Playwright todavía no instala el navegador en la 26.04.

### Agregado
- Tutorial de bienvenida: mensaje inicial y recorrido de 5 pasos con foco sobre la pantalla de práctica
  (código, teclado, símbolos, métricas y menú). Aparece una sola vez, se maneja con Enter / Esc / flechas
  y se repite desde Ajustes. Quien ya tenía días de práctica no lo ve automáticamente. Los textos se adaptan
  a lenguajes, rutas Trainee y modo libre; el foco queda dentro del diálogo y en pantallas chicas solo
  resalta elementos visibles.
- Navegación compacta cuando la ventana mide menos de 1250 px (antes desaparecía el menú).

### Cambiado
- El nombre se muestra igual en toda la app y la documentación: **N.E.O.-type** (antes aparecía también
  "NeonType" en la cabecera, el pie, la pantalla de inicio, el título de la pestaña y las capturas).
  La copia de seguridad se descarga como `neo-type-progreso-AAAA-MM-DD.json`. El progreso guardado no cambia.
- Pruebas nuevas, todas en CI: `test:logic` (progreso, logros, resaltado, canciones guardadas),
  `test:regression` (errores corregidos) y `test:e2e` (la app en Chromium real con Playwright).
- `npm test` corre todas las pruebas.
- Dependencia de desarrollo: `playwright-core` 1.56.1 (sin scripts de instalación).

## [1.4.0] - 2026-10-25

### Agregado
- **Rutas Trainee**: rutas por escalones de dificultad para las herramientas de todos los días. Cada escalón suma
  temas nuevos, se mezcla con los anteriores y las lecciones se enfocan en el escalón más flojo. Un escalón se domina
  cuando las últimas 3 lecciones promedian la velocidad y la precisión objetivo.
  - **Bases de datos**: SQLite → MySQL → PostgreSQL → MongoDB, con cada consulta en el dialecto de su motor.
  - **Terminal Linux**: Ubuntu/Mint → Debian → Fedora → CachyOS → Arch Linux, con comandos propios de cada
    distribución (gestor de paquetes, nombres de paquetes y servicios, grupos, firewall, AUR).
  - **HTML**: estructura, listas y tablas, formularios, semántica y accesibilidad, head y recursos.
  - **CSS**: selectores, modelo de caja, flexbox, grid, responsive, variables y animación.
  - **Formatos**: `.env`, `requirements.txt`, JSON, `package.json`, YAML y Markdown.
- Selector de motor de base de datos y de distribución en la práctica libre.
- 5 logros nuevos para las rutas Trainee.
- Tests de seguridad para los datos de las rutas nuevas y para el script incrustado del build.

### Cambiado
- La pantalla de inicio separa los lenguajes de programación de las rutas Trainee.
- La versión que muestra la app sale de `package.json`.

### Seguridad
- El build escapa `<!--` y `<script` dentro del JavaScript incrustado antes de calcular el hash de la CSP: juntas
  pueden impedir que el navegador cierre el elemento `<script>`.

## [1.3.0] - 2026-10-25

### Agregado
- Tema **Cyber** (nuevo tema por defecto): amarillo, rojo y cian sobre negro.
- Lenguaje visual cyberpunk en todos los temas: tipografía Chakra Petch en títulos, íconos angulares, marcos con
  muescas, botones con corte diagonal, menú numerado, glitch breve al entrar a cada pantalla y líneas de escaneo
  sobre el fondo. El panel de código no cambia: sigue en JetBrains Mono y sin efectos encima.
- Insignias de logros en SVG (marco octogonal, color según el rango) en lugar de emojis.
- Emblemas de lenguaje con forma de "datashard": monograma con aberración cromática, código de barras y número de serie.
- Content Security Policy estricta en el build: solo se ejecuta el script propio (por hash SHA-256), sin conexiones
  de red, sin recursos externos y con Trusted Types obligatorios.
- Validación estricta de todos los datos que entran a la app (copias de seguridad y datos guardados).
- Límites de tamaño y formato para fotos, canciones y copias de seguridad.
- Confirmación antes de importar una copia de seguridad.
- `npm run test:security`: tests automáticos de validación de datos y de la CSP.
- CodeQL (análisis estático de seguridad) y Dependabot con 7 días de espera para nuevas versiones.
- `SECURITY.md` con la política de seguridad y cómo reportar vulnerabilidades.

### Cambiado
- Las GitHub Actions están fijadas por hash de commit y el token del workflow es de solo lectura.
- `.npmrc` con `ignore-scripts=true`: las dependencias no ejecutan código al instalarse.
- Todas las dependencias con versión exacta. Los scripts de construcción usan `npm ci`.
- Orbitron reemplazada por Chakra Petch.

## [1.2.0] - 2026-10-25

### Agregado
- Pantalla de inicio con el logo encendiéndose como un cartel de neón; la primera vez pide nombre e imagen.
- Perfil editable: foto propia (recortada a 256 px y sin metadatos) o 12 avatares prediseñados.
- Emblemas propios para cada lenguaje.
- `THIRD_PARTY_NOTICES.md` con las licencias de las dependencias y fuentes incluidas.

### Cambiado
- Música unos 17 dB más fuerte, con limitador para evitar distorsión.

## [1.1.0] - 2026-10-25

### Agregado
- Música generativa: 7 estaciones sintetizadas en vivo y opción de cargar canciones propias.
- Teclado flotante, fondo de partículas que late con la música, auroras y efectos por pulsación.
- Brillo según la racha de aciertos, ola al terminar una lección y animación al desbloquear un símbolo.
- 22 logros y 5 temas de color.
- Opción para desactivar animaciones (respeta "reducir movimiento" del sistema).

## [1.0.0] - 2026-10-25

### Agregado
- Modo guiado adaptativo con desbloqueo exigente de símbolos.
- Generador de código para Python, JavaScript, TypeScript, Java, C#, Go y Rust.
- Teclados italiano, inglés (EE. UU.), español (España) y español (Latinoamérica).
- Modo libre, desafíos (sprints y precisión perfecta) y estadísticas con mapa de calor.
- Build de un solo archivo que funciona sin conexión.

[Sin publicar]: https://github.com/juancruzgentile/N.E.O.-type/compare/v1.5.0...main
[1.5.0]: https://github.com/juancruzgentile/N.E.O.-type/compare/7494b31...v1.5.0
[1.4.0]: https://github.com/juancruzgentile/N.E.O.-type/compare/32c443d...7494b31
[1.3.0]: https://github.com/juancruzgentile/N.E.O.-type/compare/e0ac0e7...32c443d
[1.2.0]: https://github.com/juancruzgentile/N.E.O.-type/compare/d7abd94...e0ac0e7
[1.1.0]: https://github.com/juancruzgentile/N.E.O.-type/compare/2242a79...d7abd94
[1.0.0]: https://github.com/juancruzgentile/N.E.O.-type/commit/2242a79
