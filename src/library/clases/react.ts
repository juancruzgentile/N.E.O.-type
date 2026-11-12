import { type Clase, code } from "../types";

export const claseReact: Clase = {
  titulo: "React de cero: interfaces como funciones del estado",
  bajada:
    "La referencia rápida está en la otra pestaña. Esta es la clase completa: qué problema resuelve React, cómo decide qué volver a dibujar, tu primer componente, " +
    "los conceptos base, los errores clásicos de estado y efectos, y cuándo conviene (o no) usarlo.",
  secciones: [
    {
      heading: "Qué es y qué problema resuelve",
      parrafos: [
        "React es una biblioteca de JavaScript para construir interfaces de usuario. Su idea central es que la pantalla es una función de los datos: describís cómo debe verse la interfaz para un estado dado, y cuando el estado cambia, React se ocupa de actualizar lo que haga falta. Se usa para aplicaciones web de una sola página, paneles, editores y, con React Native, aplicaciones móviles.",
        "El problema que resuelve es el de mantener la pantalla sincronizada con los datos. Con JavaScript puro, cada vez que un dato cambia tenés que buscar los elementos del DOM y actualizarlos uno por uno, y en una interfaz grande es muy fácil que se desincronicen. En React nunca tocás el DOM a mano: cambiás el estado y declarás el resultado.",
      ],
    },
    {
      heading: "Historia corta",
      parrafos: [
        "Lo creó Jordan Walke en Facebook y se usó por primera vez en el feed de noticias en 2011. Se publicó como código abierto en 2013. Al principio muchos desconfiaron de mezclar el marcado con el código (JSX), pero la idea de componentes reutilizables se impuso y hoy es la biblioteca de interfaces más usada.",
      ],
      lista: [
        "2019 (React 16.8): llegan los hooks (useState, useEffect…), que permiten usar estado en funciones y reemplazan a las clases.",
        "2022 (React 18): renderizado concurrente, que permite interrumpir y priorizar actualizaciones.",
        "2024 (React 19): acciones para formularios, el hook use y los componentes de servidor integrados.",
        "Hoy casi siempre se usa con TypeScript, un empaquetador como Vite, o un framework completo como Next.js.",
      ],
    },
    {
      heading: "Cómo funciona por dentro",
      parrafos: [
        "Un componente es una función que recibe datos (props) y devuelve lo que se ve, escrito en JSX, una sintaxis parecida a HTML que se traduce a llamadas a funciones de JavaScript. React guarda en memoria una descripción liviana de la interfaz (el DOM virtual). Cuando cambia el estado de un componente, React vuelve a ejecutar esa función, compara la nueva descripción con la anterior y aplica al DOM real solo las diferencias. A ese proceso se le llama reconciliación.",
        "Dos consecuencias que explican la mayoría de los problemas de los principiantes. Primera: la función del componente se ejecuta muchas veces, así que tiene que ser pura (el mismo estado y las mismas props dan el mismo resultado, sin efectos escondidos). Segunda: el estado no es una variable común; es memoria que React guarda entre las ejecuciones y que solo se cambia con la función que devuelve useState, porque así React sabe que tiene que volver a dibujar.",
      ],
    },
    {
      heading: "Tu primer componente, paso a paso",
      parrafos: [
        "Creá el proyecto con npm create vite@latest mi-app -- --template react-ts, instalá con npm install y arrancá con npm run dev. Reemplazá el contenido de src/App.tsx por esto.",
      ],
      codigo: [
        code`
import { useState } from "react";

type Props = { nombre: string };

function Saludo({ nombre }: Props) {
  const [veces, setVeces] = useState(0);

  return (
    <button onClick={() => setVeces(veces + 1)}>
      Hola, {nombre}. Clics: {veces}
    </button>
  );
}

export default function App() {
  return <Saludo nombre="Ana" />;
}`,
      ],
    },
    {
      heading: "Qué hace cada parte",
      parrafos: [
        "Saludo es un componente: una función cuyo nombre empieza con mayúscula. Recibe un objeto de props, que acá desestructuramos para sacar nombre, y el tipo Props dice qué forma tiene. useState(0) devuelve un par: el valor actual (veces, que arranca en 0) y la función para cambiarlo (setVeces).",
        "En el JSX, las llaves insertan expresiones de JavaScript, y onClick recibe una función. Al hacer clic se llama a setVeces con el valor nuevo; React vuelve a ejecutar Saludo y actualiza en el DOM solo el número del botón. En App usamos Saludo como si fuera una etiqueta HTML y le pasamos nombre como atributo.",
      ],
    },
    {
      heading: "Los cinco conceptos que sostienen todo lo demás",
      parrafos: [
        "Con estos cinco leés casi cualquier código React:",
      ],
      lista: [
        "Componentes y props: funciones que reciben datos de afuera. Las props son de solo lectura.",
        "Estado (useState): datos que cambian con el tiempo y hacen que el componente se vuelva a dibujar.",
        "Listas y claves: se muestran colecciones con map, y cada elemento necesita una key estable y única.",
        "Efectos (useEffect): código que sincroniza con algo de afuera de React, como un pedido a la red o un temporizador. No es para calcular valores.",
        "Subir el estado: si dos componentes necesitan el mismo dato, el estado vive en el padre común y baja por props.",
      ],
      codigo: [
        code`
function Lista({ libros }: { libros: { id: number; titulo: string }[] }) {
  return (
    <ul>
      {libros.map((l) => (
        <li key={l.id}>{l.titulo}</li>
      ))}
    </ul>
  );
}

function Reloj() {
  const [hora, setHora] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setHora(new Date()), 1000);
    return () => clearInterval(id);        // limpieza al desmontar
  }, []);                                  // [] = una sola vez
  return <p>{hora.toLocaleTimeString()}</p>;
}`,
      ],
    },
    {
      heading: "Errores que comete casi todo el mundo",
      parrafos: [
        "Casi todos vienen de no recordar cómo funciona el estado:",
      ],
      lista: [
        "Modificar el estado directamente (lista.push): React no se entera y no vuelve a dibujar. Creá un valor nuevo.",
        "Pensar que el estado cambia al instante: set solo programa el cambio. Si el valor nuevo depende del anterior, pasá una función.",
        "Usar el índice como key en listas que se reordenan o se borran: React confunde los elementos y se mezclan los estados.",
        "useEffect sin la lista de dependencias, o con una mal armada: se ejecuta en cada dibujo y puede provocar un bucle infinito.",
        "Usar un efecto para algo que se puede calcular al dibujar: guardar en estado un valor derivado de otro estado crea dos fuentes de verdad.",
      ],
      codigo: [
        code`
lista.push("a");                  // MAL: mutás el estado, React no se entera
setLista([...lista, "a"]);        // BIEN: un array nuevo

setVeces(veces + 1);
setVeces(veces + 1);              // suma 1, no 2: los dos leen el mismo valor
setVeces((v) => v + 1);
setVeces((v) => v + 1);           // suma 2

useEffect(() => { setX(x + 1); }); // sin dependencias: se dispara en cada dibujo, bucle infinito`,
      ],
    },
    {
      heading: "Dónde conviene usarlo y dónde no",
      parrafos: [
        "React encaja cuando la interfaz tiene mucho estado que cambia:",
      ],
      tabla: {
        cabeza: ["Caso", "¿React?", "Por qué"],
        filas: [
          ["Paneles, editores y aplicaciones con mucha interacción", "Sí", "El modelo de componentes y estado escala bien."],
          ["Aplicaciones que comparten código con móvil", "Sí", "React Native usa las mismas ideas."],
          ["Un equipo grande con muchas piezas reutilizables", "Sí", "El ecosistema es enorme y hay muchos desarrolladores que lo conocen."],
          ["Sitios de contenido (blogs, documentación)", "No necesariamente", "HTML generado en el servidor o un generador estático carga más rápido y no necesita tanto JavaScript."],
          ["Una página con un par de efectos", "No", "Con JavaScript común alcanza; React suma peso y pasos de construcción."],
          ["Sitios donde importa mucho el posicionamiento en buscadores", "Con un framework", "Hace falta renderizar en el servidor (Next.js, por ejemplo)."],
        ],
      },
    },
    {
      heading: "Comparación con alternativas",
      parrafos: [
        "Cuándo conviene otra cosa:",
      ],
      tabla: {
        cabeza: ["Alternativa", "Elegila en vez de React cuando…"],
        filas: [
          ["Vue", "querés una curva de aprendizaje más suave y plantillas más cerca de HTML."],
          ["Svelte", "querés menos código y que el compilador haga el trabajo en vez de un motor en el navegador."],
          ["Angular", "buscás un framework completo con todo decidido, común en empresas grandes."],
          ["HTML + JavaScript común", "la página es simple."],
        ],
      },
    },
    {
      heading: "Cómo seguir",
      parrafos: [
        "Hacé el proyecto de React de la app y usá la pestaña Referencia para recordar cómo se escribe cada hook.",
        "Fuera de la app, react.dev es la documentación oficial y está escrita como un curso, con ejercicios interactivos. Su sección \"Tu forma de pensar en React\" y la de \"Escapar de los efectos\" son las que más cambian la forma de programar.",
      ],
    },
  ],
  fuentes: [
    { texto: "react.dev: aprender React", url: "https://react.dev/learn" },
    { texto: "Referencia de React", url: "https://react.dev/reference/react" },
    { texto: "Anuncio de React 19", url: "https://react.dev/blog/2024/12/05/react-19" },
  ],
  revisada: "2026-11-12",
};
