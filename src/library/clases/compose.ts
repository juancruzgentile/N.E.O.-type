import { type Clase, code } from "../types";

export const claseCompose: Clase = {
  titulo: "Jetpack Compose de cero: interfaces de Android como funciones de Kotlin",
  bajada:
    "La referencia rápida está en la otra pestaña. Esta es la clase completa: qué es Compose y cómo funciona la recomposición, tu primera pantalla, " +
    "los conceptos base (composables, estado y Modifier), los errores clásicos y cuándo conviene.",
  secciones: [
    {
      heading: "Qué es y qué problema resuelve",
      parrafos: [
        "Jetpack Compose es el kit de Google para construir interfaces de usuario en Android con Kotlin, de forma declarativa. La interfaz se escribe como funciones: cada función describe un pedazo de pantalla según los datos que recibe, y cuando los datos cambian, Compose vuelve a ejecutar solo las funciones afectadas.",
        "El problema que resuelve es el del sistema anterior, basado en archivos XML y en vistas que había que buscar y modificar desde el código. Mantener sincronizadas la pantalla y los datos era una fuente constante de errores. Con Compose, la interfaz es código Kotlin común (con sus condicionales, bucles y funciones) y el estado es la única fuente de verdad.",
      ],
    },
    {
      heading: "Historia corta",
      parrafos: [
        "Google lo anunció en 2019 y publicó la versión 1.0 estable en julio de 2021. Hoy es la forma recomendada de crear interfaces de Android, y las bibliotecas de diseño (Material 3) se actualizan primero para Compose.",
      ],
      lista: [
        "Funciona junto con las vistas clásicas: se puede migrar pantalla por pantalla.",
        "Compose Multiplatform, de JetBrains, lleva la misma idea a escritorio, iOS y web.",
        "Las vistas previas (@Preview) muestran los composables en Android Studio sin ejecutar la aplicación.",
      ],
    },
    {
      heading: "Cómo funciona por dentro: composición y recomposición",
      parrafos: [
        "Una función marcada con @Composable no devuelve una vista: emite elementos a un árbol que Compose mantiene en memoria. La primera ejecución arma ese árbol (la composición). Cuando un dato de estado que alguna función leyó cambia, Compose vuelve a ejecutar solo esas funciones y actualiza el árbol: eso se llama recomposición.",
        "De esto salen las reglas de oro. Los composables pueden ejecutarse muchas veces y en cualquier orden, así que no deben tener efectos secundarios en su cuerpo. Y las variables comunes se reinician en cada ejecución: para que un dato sobreviva a la recomposición se guarda con remember, y para que Compose se entere de que cambió tiene que ser un estado (mutableStateOf).",
      ],
    },
    {
      heading: "Tu primera pantalla, paso a paso",
      parrafos: [
        "En Android Studio, creá un proyecto nuevo con la plantilla Empty Activity (usa Compose) y escribí esta función. La llamás desde setContent en la actividad.",
      ],
      codigo: [
        code`
@Composable
fun Saludo(nombre: String) {
    var veces by remember { mutableIntStateOf(0) }

    Column(modifier = Modifier.padding(16.dp)) {
        Text("Hola, $nombre", style = MaterialTheme.typography.headlineMedium)
        Button(onClick = { veces++ }) {
            Text("Clics: $veces")
        }
    }
}`,
      ],
    },
    {
      heading: "Qué hace cada parte",
      parrafos: [
        "Saludo es un composable: sus parámetros son los datos que recibe. mutableIntStateOf(0) crea un estado observable y remember lo conserva entre recomposiciones; con by, veces se usa como una variable común. Column apila sus hijos en vertical, y Text y Button son composables que ya vienen en la biblioteca.",
        "Modifier es la lista de ajustes que se aplica a un elemento (margen, tamaño, clic, fondo). Cuando el botón ejecuta veces++, Compose detecta que el estado cambió y recompone solo lo que lo lee, es decir, el texto del botón.",
      ],
    },
    {
      heading: "Los cinco conceptos que sostienen todo lo demás",
      parrafos: [
        "Con estos cinco leés casi cualquier código Compose:",
      ],
      lista: [
        "Composables: funciones @Composable que describen la interfaz; se combinan unas dentro de otras.",
        "Estado: remember + mutableStateOf; con rememberSaveable el valor sobrevive a rotar la pantalla.",
        "Modifier: encadena ajustes, y el orden importa.",
        "Listas: LazyColumn y LazyRow dibujan solo lo visible, con items y una key estable.",
        "Elevar el estado (state hoisting): el composable recibe el valor y un callback, y el estado vive más arriba, normalmente en un ViewModel.",
      ],
      codigo: [
        code`
@Composable
fun Estante(libros: List<Libro>, alAbrir: (Libro) -> Unit) {   // el estado viene de afuera
    LazyColumn {
        items(libros, key = { it.id }) { libro ->
            Text(
                libro.titulo,
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { alAbrir(libro) }
                    .padding(16.dp)
            )
        }
    }
}

class EstanteViewModel : ViewModel() {
    val libros = MutableStateFlow(listOf<Libro>())
}`,
      ],
    },
    {
      heading: "Errores que comete casi todo el mundo",
      parrafos: [
        "Los más repetidos:",
      ],
      lista: [
        "Usar una variable común en vez de un estado: se reinicia en cada recomposición y la pantalla no se actualiza. Usá remember con mutableStateOf.",
        "Perder el estado al rotar la pantalla: remember se pierde al recrearse la actividad. Usá rememberSaveable o un ViewModel.",
        "Hacer trabajo con efectos (pedir a la red, guardar) directamente en el cuerpo del composable: se repetiría en cada recomposición. Usá LaunchedEffect o un ViewModel.",
        "Listas sin key estable: al reordenar o borrar, el estado de cada ítem se confunde.",
        "Olvidar que el orden de los Modifier importa: .padding(16.dp).background(...) no es igual a .background(...).padding(16.dp).",
      ],
      codigo: [
        code`
var n = 0                                             // MAL: se reinicia en cada recomposición
var a by remember { mutableIntStateOf(0) }            // BIEN
var b by rememberSaveable { mutableIntStateOf(0) }    // sobrevive a rotar la pantalla

LaunchedEffect(id) { cargar(id) }                     // un efecto con ciclo de vida, no en el cuerpo`,
      ],
    },
    {
      heading: "Dónde conviene usarlo y dónde no",
      parrafos: [
        "Compose es el camino actual para Android:",
      ],
      tabla: {
        cabeza: ["Caso", "¿Compose?", "Por qué"],
        filas: [
          ["Aplicaciones Android nuevas", "Sí", "Es la forma recomendada por Google, con menos código que las vistas XML."],
          ["Interfaces con mucho estado y animaciones", "Sí", "El modelo declarativo lo hace natural."],
          ["Compartir interfaz con escritorio o iOS", "Posible", "Compose Multiplatform."],
          ["Aplicaciones con mucho código de vistas clásicas", "Gradual", "Se migra pantalla por pantalla, sin reescribir todo."],
          ["Aplicaciones solo para iPhone", "No", "SwiftUI es el camino natural."],
          ["Interfaces web", "No", "Es para aplicaciones, no para páginas."],
        ],
      },
    },
    {
      heading: "Comparación con alternativas",
      parrafos: [
        "Cuándo conviene otra cosa:",
      ],
      tabla: {
        cabeza: ["Alternativa", "Elegila en vez de Compose cuando…"],
        filas: [
          ["Vistas con XML", "mantenés una aplicación vieja que todavía no migraste."],
          ["SwiftUI", "el objetivo es iOS; la idea es casi la misma."],
          ["Flutter o React Native", "querés una sola base de código para iOS y Android."],
        ],
      },
    },
    {
      heading: "Cómo seguir",
      parrafos: [
        "Hacé primero la ruta de Kotlin y los proyectos de la app; después usá la pestaña Referencia para recordar la sintaxis de los composables.",
        "Fuera de la app, developer.android.com/compose reúne el curso oficial, con ejercicios (\"codelabs\") paso a paso, y la guía de estado explica en detalle los temas de recomposición y de elevar el estado. Necesitás Android Studio.",
      ],
    },
  ],
  fuentes: [
    { texto: "Jetpack Compose (Android Developers)", url: "https://developer.android.com/compose" },
    { texto: "Estado en Compose", url: "https://developer.android.com/develop/ui/compose/state" },
    { texto: "Kotlin en Android", url: "https://developer.android.com/kotlin" },
  ],
  revisada: "2026-11-12",
};
