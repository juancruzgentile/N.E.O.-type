<div align="center">

# N.E.O.-type

**Mecanografía para programadores.** Aprendé a teclear código real más rápido: funciones, clases, enums y algoritmos
de 7 lenguajes, con un sistema adaptativo que te entrena cada símbolo hasta dominarlo.

![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646cff?logo=vite&logoColor=white)
![Offline](https://img.shields.io/badge/funciona-sin%20internet-2bff9a)
[![CI](https://github.com/juancruzgentile/N.E.O.-type/actions/workflows/ci.yml/badge.svg)](https://github.com/juancruzgentile/N.E.O.-type/actions/workflows/ci.yml)
[![CodeQL](https://github.com/juancruzgentile/N.E.O.-type/actions/workflows/codeql.yml/badge.svg)](https://github.com/juancruzgentile/N.E.O.-type/actions/workflows/codeql.yml)
![License](https://img.shields.io/badge/licencia-MIT-yellow)

![Práctica](docs/practica.jpg)

</div>

## ¿Qué es?

Los tutores de mecanografía clásicos entrenan palabras. Al programar, lo que frena son los símbolos: `[] {} () => -> :: != &&`.
N.E.O.-type te hace tipear **código real** —nunca se ejecuta, es solo para entrenar los dedos— y cada fragmento viene con
un título que explica qué hace.

- **7 lenguajes**: Python, JavaScript, TypeScript, Java, C#, Go y Rust.
- **Modo guiado adaptativo**: empezás con `(` y `)`. Cada símbolo nuevo se practica con ejercicios dirigidos y después con
  funciones reales que lo usan. El símbolo más débil es el *foco* y aparece en todas las lecciones.
- **Desbloqueo exigente**: la siguiente etapa se abre solo cuando todos tus símbolos superan el mínimo de pulsaciones,
  la velocidad objetivo y la precisión mínima (configurables).
- **Código infinito**: ~40 conceptos × 22 entidades de dominio × variantes por lenguaje → cientos de funciones distintas.
- **4 teclados físicos**: italiano, inglés (EE. UU.), español (España) y español (Latinoamérica), con la tecla, el dedo y
  los modificadores (Shift / AltGr) del siguiente carácter.
- **Modo libre y desafíos**: sprints de 30/60/120 s y "precisión perfecta", con récords.
- **Estadísticas**: evolución de velocidad y precisión, mapa de calor del teclado, calendario de práctica.
- **Música generativa**: 7 estaciones (lo-fi, lluvia, synthwave, espacio, zen, jazz y foco) sintetizadas en vivo con
  Web Audio, sin archivos ni licencias de por medio. Nunca suenan exactamente igual. También podés cargar tus propias
  canciones: quedan guardadas en el navegador.
- **Interfaz viva**: teclado flotante, fondo de partículas que late con la música, chispas de la tecla al código,
  brillo según tu racha de aciertos y animación al desbloquear cada símbolo. Todo se apaga desde Ajustes y respeta
  la preferencia del sistema de reducir movimiento.
- **Logros y temas**: 22 logros con insignias y 6 temas de color (Cyber, Neón, Synthwave, Matrix, Tokio noche y Claro),
  con una estética cyberpunk que nunca toca la legibilidad del código.
- **Tu perfil**: pantalla de inicio con efecto de cartel de neón, tu nombre y tu foto (o uno de los 12 avatares incluidos).
- **100 % offline**: el build es un único `NeonType.html` que se abre con doble clic. El progreso queda en tu navegador.

<table>
  <tr>
    <td><img src="docs/lenguajes.jpg" alt="Elegir lenguaje" /></td>
    <td><img src="docs/rutas.jpg" alt="Ruta de símbolos" /></td>
  </tr>
  <tr>
    <td align="center">Elegí un lenguaje</td>
    <td align="center">Ruta de símbolos según tu teclado</td>
  </tr>
  <tr>
    <td><img src="docs/estadisticas.jpg" alt="Estadísticas" /></td>
    <td><img src="docs/logros.jpg" alt="Logros" /></td>
  </tr>
  <tr>
    <td align="center">Estadísticas y mapa de calor</td>
    <td align="center">Logros</td>
  </tr>
</table>

![Temas](docs/temas.jpg)

<p align="center"><img src="docs/inicio.jpg" alt="Pantalla de inicio" width="760" /></p>

## Empezar

Requiere [Node.js](https://nodejs.org) 20 o superior.

```bash
git clone https://github.com/juancruzgentile/N.E.O.-type.git
cd N.E.O.-type
npm ci             # instala exactamente lo del lockfile, sin scripts de instalación
npm run build      # genera NeonType.html, autocontenido
```

Abrí `NeonType.html` con doble clic. Para desarrollar con recarga en caliente: `npm run dev`.

Atajos para quien no quiera usar la terminal:

| | Windows | Linux |
| --- | --- | --- |
| Construir | `construir.bat` | `./construir.sh` |
| Abrir | `iniciar.bat` | `./iniciar.sh` |
| Desarrollo | `desarrollo.bat` | `./desarrollo.sh` |

### Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Typecheck + build de un solo archivo (`dist/index.html` → `NeonType.html`) |
| `npm run check` | Genera miles de fragmentos y verifica que ninguno use símbolos fuera de la ruta de su lenguaje |
| `npm run test:security` | Tests de validación de datos y de la Content Security Policy del build |
| `npm run audit` | Auditoría de vulnerabilidades y firmas de las dependencias |

## Cómo funciona el modo guiado

1. Cada pulsación registra el tiempo desde la anterior y si fue correcta al primer intento.
2. Por símbolo se guarda una media exponencial del tiempo y la precisión de los últimos 50 intentos.
3. Un símbolo está **dominado** cuando tiene el mínimo de muestras, alcanza la velocidad objetivo y supera la precisión mínima.
4. Con todos los símbolos desbloqueados dominados, se abre la siguiente etapa de la ruta del lenguaje.
5. El generador elige fragmentos que usen **solo** símbolos desbloqueados y que contengan el símbolo foco.

## Estructura

```
src/
├── data/
│   ├── curriculum.ts    # orden de desbloqueo de símbolos por lenguaje
│   └── layouts.ts       # teclados IT / US / ES / LATAM: teclas, Shift, AltGr y dedos
├── gen/
│   ├── base.ts          # vocabulario de dominio, nombres (snake/camel/Pascal), español
│   ├── concepts.ts      # conceptos y sus títulos
│   ├── lang/            # un generador por lenguaje
│   ├── drills.ts        # ejercicios de símbolos
│   └── index.ts         # elige fragmentos según los símbolos permitidos
├── engine/
│   ├── session.ts       # procesa cada pulsación
│   └── stats.ts         # estadísticas, foco, desbloqueo, elección de lección
├── audio/
│   ├── music.ts         # motor de música generativa (instrumentos, estaciones, secuenciador)
│   └── tracks.ts        # canciones del usuario en IndexedDB
├── fx/fx.ts             # efectos sobre el DOM con Web Animations API (sin re-render de React)
├── sanitize.ts          # validación estricta de datos importados y guardados
└── components/          # interfaz en React
```

### Rendimiento

En una app de mecanografía la latencia importa más que cualquier efecto. Por eso las animaciones de cada pulsación
se aplican directo sobre el DOM, el fondo se dibuja en un canvas limitado a ~30 fps que se pausa con la pestaña
oculta, y los movimientos continuos usan solo `transform` y `opacity`. Los ciclos de las auroras (31, 43 y 59 s) y del
teclado (13, 17 y 23 s) son números primos para que las capas casi nunca vuelvan a coincidir.

## Privacidad y seguridad

- **100 % local**: sin servidor, sin cuentas y sin telemetría. El progreso, el perfil y tus canciones quedan solo en
  tu navegador.
- **Sin red**: la Content Security Policy del build prohíbe cualquier conexión, así que ningún dato puede salir de
  tu equipo.
- **Datos validados**: las copias de seguridad importadas se reconstruyen campo por campo con una lista blanca.
- **Cadena de suministro cuidada**: dependencias mínimas y fijadas, instalación sin scripts, auditoría, CodeQL y
  Dependabot.

Detalles y cómo reportar un problema: [SECURITY.md](SECURITY.md). Historial de cambios: [CHANGELOG.md](CHANGELOG.md).

## Contribuir

Las contribuciones son bienvenidas: nuevos lenguajes, conceptos, teclados o mejoras de la interfaz.
Mirá [CONTRIBUTING.md](CONTRIBUTING.md).

## Licencia

[MIT](LICENSE) © Juan Cruz Gentile. Las dependencias y fuentes incluidas tienen sus propias licencias: ver
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

Los nombres de los lenguajes son marcas de sus titulares y se usan solo para identificarlos; los emblemas son diseños
propios. La idea de la práctica adaptativa está inspirada en [keybr.com](https://www.keybr.com), pero N.E.O.-type es
una implementación independiente que no reutiliza su código ni su diseño.
