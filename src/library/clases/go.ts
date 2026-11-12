import { type Clase, code } from "../types";

export const claseGo: Clase = {
  titulo: "Go de cero: simple, rápido y hecho para servicios de red",
  bajada:
    "La referencia rápida está en la otra pestaña. Esta es la clase completa: por qué existe Go, cómo corre un programa, tu primer programa, " +
    "los conceptos base (errores como valores, goroutines y canales), los errores típicos y en qué proyectos conviene.",
  secciones: [
    {
      heading: "Qué es y qué problema resuelve",
      parrafos: [
        "Go (también llamado Golang) es un lenguaje compilado, de tipado estático, con recolector de basura y una sintaxis deliberadamente chica. Compila a un único ejecutable que no necesita instalar nada más para correr. Se usa para servicios web y APIs, herramientas de línea de comandos y, sobre todo, infraestructura en la nube: Docker y Kubernetes están escritos en Go.",
        "El problema que resuelve es el de la complejidad. Nació para escribir software de servidor en equipos grandes sin sufrir tiempos de compilación enormes, jerarquías de clases enredadas o formas distintas de hacer lo mismo. Go te ofrece pocas cosas y una sola manera de hacerlas, así que el código de un desconocido se lee casi como el tuyo.",
      ],
    },
    {
      heading: "Historia corta",
      parrafos: [
        "Lo diseñaron en Google, a partir de 2007, Robert Griesemer, Rob Pike y Ken Thompson (uno de los creadores de Unix y de C). Se publicó como código abierto en 2009 y la versión 1.0 salió en marzo de 2012 con una promesa que se mantiene: el código escrito para Go 1 sigue compilando en las versiones nuevas.",
      ],
      lista: [
        "2018 (Go 1.11): los módulos y go.mod resuelven las dependencias.",
        "2022 (Go 1.18): llegan los genéricos, después de años de debate.",
        "Desde entonces: dos versiones por año, con mejoras chicas y compatibles.",
        "go fmt formatea todo el código de la misma manera: ya no se discute el estilo.",
      ],
    },
    {
      heading: "Cómo funciona por dentro",
      parrafos: [
        "go build compila rápido el programa y todas sus dependencias a código de máquina, dentro de un único binario que incluye el runtime de Go (el recolector de basura y el planificador). Podés compilar para otro sistema cambiando dos variables (GOOS y GOARCH), sin instalar herramientas extra.",
        "Lo más característico es la concurrencia. Una goroutine es una función que corre de forma concurrente, y es tan liviana (empieza con unos pocos kilobytes de pila) que podés tener miles. El planificador del runtime las reparte entre los hilos del sistema. Para que se comuniquen, Go usa canales: un tubo por donde una goroutine manda valores y otra los recibe. El lema del lenguaje lo resume: no te comuniques compartiendo memoria; compartí memoria comunicándote.",
      ],
    },
    {
      heading: "Tu primer programa, paso a paso",
      parrafos: [
        "Creá un archivo saludo.go y corrélo con go run saludo.go Ana 2.",
      ],
      codigo: [
        code`
package main

import (
	"fmt"
	"os"
	"strconv"
)

func main() {
	nombre := "mundo"
	veces := 1
	if len(os.Args) > 1 {
		nombre = os.Args[1]
	}
	if len(os.Args) > 2 {
		n, err := strconv.Atoi(os.Args[2])
		if err != nil {
			fmt.Println("veces tiene que ser un número")
			os.Exit(1)
		}
		veces = n
	}
	for i := 1; i <= veces; i++ {
		fmt.Printf("%d. Hola, %s\n", i, nombre)
	}
}`,
      ],
    },
    {
      heading: "Qué hace cada línea",
      parrafos: [
        "Todo archivo empieza con package; el programa ejecutable es el package main, y su punto de entrada es la función main. Los imports traen paquetes de la biblioteca estándar. Si importás algo que no usás, o declarás una variable que no usás, no compila: Go lo trata como un error.",
        ":= declara una variable infiriendo su tipo. strconv.Atoi convierte un texto en entero y devuelve dos valores: el resultado y un error. Esa es la forma de Go de manejar fallos: no hay excepciones, devolvés el error como un valor más y quien llama lo comprueba (if err != nil). Con Ana y 2 imprime \"1. Hola, Ana\" y \"2. Hola, Ana\".",
      ],
    },
    {
      heading: "Los cinco conceptos que sostienen todo lo demás",
      parrafos: [
        "Con estos cinco leés casi cualquier código Go:",
      ],
      lista: [
        "Structs y métodos: Go no tiene clases ni herencia; agrupás datos en un struct y le asociás funciones.",
        "Interfaces implícitas: un tipo cumple una interfaz con solo tener sus métodos; no se declara.",
        "Errores como valores: las funciones devuelven (resultado, error) y se comprueba con if err != nil.",
        "Slices y maps: la lista dinámica y el diccionario del lenguaje.",
        "Goroutines y canales: concurrencia con go f() y chan.",
      ],
      codigo: [
        code`
type Libro struct {
	Titulo  string
	Paginas int
}

func (l Libro) Largo() bool { return l.Paginas > 400 }   // método

type Lector interface{ Leer() string }                    // cualquier tipo con Leer() la cumple

func dividir(a, b int) (int, error) {
	if b == 0 {
		return 0, errors.New("división por cero")
	}
	return a / b, nil
}

func main() {
	canal := make(chan int)
	go func() { canal <- 42 }()   // una goroutine manda un valor
	fmt.Println(<-canal)          // main lo recibe: 42
}`,
      ],
    },
    {
      heading: "Errores que comete casi todo el mundo",
      parrafos: [
        "Los que más se repiten:",
      ],
      lista: [
        "Ignorar el error devuelto (usar _ para tirarlo): el programa sigue con datos inválidos.",
        "Olvidar que un slice comparte memoria con el arreglo del que salió: modificar uno cambia el otro.",
        "Escribir en un map que vale nil: provoca un pánico. Crealo con make o con un literal.",
        "Lanzar goroutines sin pensar cómo terminan: si nadie recibe del canal, se quedan colgadas para siempre (una fuga).",
        "Acceder a una variable desde varias goroutines sin proteger: una condición de carrera. Usá canales, sync.Mutex y go test -race.",
      ],
      codigo: [
        code`
a := []int{1, 2, 3}
b := a[:2]         // comparte memoria con a
b[0] = 99
fmt.Println(a)     // [99 2 3]

var m map[string]int
m["x"] = 1         // panic: assignment to entry in nil map`,
      ],
    },
    {
      heading: "Dónde conviene usarlo y dónde no",
      parrafos: [
        "Go brilla en lo que fue diseñado para hacer:",
      ],
      tabla: {
        cabeza: ["Caso", "¿Go?", "Por qué"],
        filas: [
          ["Servicios web y microservicios", "Sí", "Rápido, poco consumo y la concurrencia es parte del lenguaje."],
          ["Herramientas de línea de comandos", "Sí", "Un único binario fácil de distribuir."],
          ["Infraestructura y herramientas de nube", "Sí", "Docker, Kubernetes y Terraform están escritos en Go."],
          ["Interfaces gráficas y juegos", "No", "El ecosistema es chico y el lenguaje no está pensado para eso."],
          ["Ciencia de datos e IA", "No", "El ecosistema está en Python."],
          ["Programas con lógica de dominio muy compleja", "Con cuidado", "Hay pocas herramientas de abstracción; el código puede resultar repetitivo."],
        ],
      },
    },
    {
      heading: "Comparación con lenguajes cercanos",
      parrafos: [
        "Cuándo conviene otro:",
      ],
      tabla: {
        cabeza: ["Lenguaje", "Elegilo en vez de Go cuando…"],
        filas: [
          ["Rust", "necesitás control total de la memoria y no querés un recolector de basura."],
          ["Java o C#", "tu proyecto necesita un ecosistema empresarial enorme y mucha abstracción."],
          ["Python", "querés escribir rápido un script o trabajar con datos."],
          ["Node.js", "compartís código con un front-end en JavaScript."],
        ],
      },
    },
    {
      heading: "Cómo seguir",
      parrafos: [
        "Hacé la ruta de Go de la app y resolvé los proyectos. Usá la pestaña Referencia para recordar la sintaxis.",
        "Fuera de la app, A Tour of Go es una introducción interactiva oficial muy corta, y Effective Go explica cómo escribir Go idiomático. Las preguntas frecuentes del sitio responden por qué el lenguaje tomó cada decisión.",
      ],
    },
  ],
  fuentes: [
    { texto: "A Tour of Go", url: "https://go.dev/tour/" },
    { texto: "Effective Go", url: "https://go.dev/doc/effective_go" },
    { texto: "Preguntas frecuentes de Go", url: "https://go.dev/doc/faq" },
  ],
  revisada: "2026-11-12",
};
