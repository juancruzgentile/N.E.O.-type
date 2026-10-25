<div align="center">

# N.E.O.-type

**Mecanografía para programadores.** Aprendé a teclear código real más rápido: funciones, clases, enums y algoritmos
de 7 lenguajes, con un sistema adaptativo que te entrena cada símbolo hasta dominarlo.

![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646cff?logo=vite&logoColor=white)
![Offline](https://img.shields.io/badge/funciona-sin%20internet-2bff9a)
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
</table>

## Empezar

Requiere [Node.js](https://nodejs.org) 20 o superior.

```bash
git clone https://github.com/juancruzgentile/N.E.O.-type.git
cd N.E.O.-type
npm install
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
└── components/          # interfaz en React
```

## Contribuir

Las contribuciones son bienvenidas: nuevos lenguajes, conceptos, teclados o mejoras de la interfaz.
Mirá [CONTRIBUTING.md](CONTRIBUTING.md).

## Licencia

[MIT](LICENSE) © Juan Cruz Gentile

Inspirado en el sistema adaptativo de [keybr.com](https://www.keybr.com). No reutiliza su código.
