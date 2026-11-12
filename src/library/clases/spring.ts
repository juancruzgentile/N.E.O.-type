import { type Clase, code } from "../types";

export const claseSpring: Clase = {
  titulo: "Spring Boot de cero: servicios Java listos para producción",
  bajada:
    "La referencia rápida está en la otra pestaña. Esta es la clase completa: qué es Spring y qué agrega Spring Boot, la inyección de dependencias que lo sostiene, " +
    "tu primer servicio, los conceptos base, los errores clásicos y cuándo conviene.",
  secciones: [
    {
      heading: "Qué es y qué problema resuelve",
      parrafos: [
        "Spring es el framework más usado para aplicaciones en Java, y Spring Boot es la forma moderna de usarlo: arranca un proyecto con configuración mínima, incluye un servidor web embebido y trae \"starters\" que agrupan todo lo necesario para cada tarea (web, base de datos, seguridad, mensajería). Se usa para APIs REST, microservicios y sistemas empresariales.",
        "El problema que resuelve es doble. Spring (el framework) resolvió la complejidad de las aplicaciones empresariales de Java de principios de los 2000: en vez de que cada clase cree sus propias dependencias, un contenedor las crea y las entrega, lo que hace el código fácil de probar y de cambiar. Spring Boot resolvió después la complejidad de configurar todo eso: con una clase y una anotación tenés un servidor web funcionando.",
      ],
    },
    {
      heading: "Historia corta",
      parrafos: [
        "Lo creó Rod Johnson, a partir de las ideas de su libro de 2002 sobre diseño de aplicaciones empresariales, como alternativa liviana al estándar J2EE de la época, muy pesado. La versión 1.0 salió en 2004. En 2014 llegó Spring Boot, que cambió la forma de usarlo: configuración automática, servidor embebido y un ejecutable único para desplegar.",
      ],
      lista: [
        "Spring Boot 3 (2022) exigió Java 17 como mínimo y pasó al espacio de nombres jakarta.",
        "Hoy una aplicación se despliega como un archivo .jar que contiene su propio servidor (Tomcat por defecto).",
        "El ecosistema incluye Spring Data (bases de datos), Spring Security (autenticación), Spring Cloud (microservicios) y más.",
      ],
    },
    {
      heading: "Cómo funciona por dentro: contenedor e inyección",
      parrafos: [
        "En el centro hay un contenedor de inversión de control. Al arrancar, Spring recorre tu código buscando clases con anotaciones como @Component, @Service, @Repository o @RestController, y crea un objeto de cada una (un bean). Cuando una clase necesita a otra, la declarás en su constructor y Spring le entrega la instancia: eso es la inyección de dependencias. Vos no escribís new para tus servicios.",
        "La configuración automática de Spring Boot mira qué bibliotecas hay en el proyecto y configura lo razonable: si encuentra el starter web, levanta un servidor; si encuentra un driver de base de datos y su configuración, abre el pool de conexiones. Las anotaciones como @Transactional funcionan mediante proxies: Spring envuelve tu bean en un objeto que agrega comportamiento antes y después de cada llamada, y eso explica algunos errores clásicos.",
      ],
    },
    {
      heading: "Tu primer servicio, paso a paso",
      parrafos: [
        "Generá el proyecto en start.spring.io (Maven, Java, con la dependencia Spring Web), descomprimilo y agregá una clase controladora. Corré con ./mvnw spring-boot:run y abrí http://localhost:8080/libros/1.",
      ],
      codigo: [
        code`
@SpringBootApplication
public class App {
    public static void main(String[] args) {
        SpringApplication.run(App.class, args);
    }
}

@RestController
@RequestMapping("/libros")
class LibroController {
    record Libro(long id, String titulo) {}

    @GetMapping("/{id}")
    Libro ver(@PathVariable long id) {
        return new Libro(id, "Dune");
    }
}`,
      ],
    },
    {
      heading: "Qué hace cada parte",
      parrafos: [
        "@SpringBootApplication combina tres cosas: marca la clase de configuración, activa la configuración automática y le dice a Spring que busque componentes en este paquete y los de abajo (por eso las demás clases tienen que estar en el mismo paquete o en uno interno). SpringApplication.run arranca el contenedor y el servidor.",
        "@RestController marca una clase que atiende pedidos web y cuyos valores devueltos se escriben directamente en la respuesta. @RequestMapping fija el prefijo de la ruta, @GetMapping la ruta de este método, y @PathVariable toma el id de la URL. El record Libro se convierte a JSON automáticamente: la respuesta es {\"id\":1,\"titulo\":\"Dune\"}.",
      ],
    },
    {
      heading: "Los cinco conceptos que sostienen todo lo demás",
      parrafos: [
        "Con estos cinco leés casi cualquier proyecto Spring Boot:",
      ],
      lista: [
        "Beans e inyección de dependencias: las clases anotadas las crea el contenedor y se piden por constructor.",
        "Controladores REST: @RestController, @GetMapping, @PostMapping, @RequestBody y @ResponseStatus.",
        "Spring Data JPA: con solo declarar una interfaz Repository obtenés guardar, buscar y borrar sin escribir SQL.",
        "Configuración y perfiles: application.properties o application.yml, con perfiles (dev, prod) y variables de entorno.",
        "Pruebas: @SpringBootTest levanta la aplicación y MockMvc simula pedidos HTTP.",
      ],
      codigo: [
        code`
interface LibroRepo extends JpaRepository<Libro, Long> {
    List<Libro> findByPaginasGreaterThan(int paginas);   // la consulta se deduce del nombre
}

@Service
class LibroService {
    private final LibroRepo repo;                        // inyección por constructor

    LibroService(LibroRepo repo) {
        this.repo = repo;
    }

    @Transactional
    public Libro guardar(Libro libro) {
        return repo.save(libro);
    }
}`,
      ],
    },
    {
      heading: "Errores que comete casi todo el mundo",
      parrafos: [
        "Los más repetidos:",
      ],
      lista: [
        "Inyectar con @Autowired sobre el campo: funciona, pero dificulta las pruebas y oculta las dependencias. Preferí el constructor.",
        "Llamar a un método @Transactional desde otro método de la misma clase: la llamada no pasa por el proxy y la transacción no se abre.",
        "Exponer las entidades de la base directamente en la API: filtran campos internos y atan la API al esquema. Usá objetos de transferencia (DTO o records).",
        "El problema N+1 con JPA y las relaciones perezosas: una consulta por cada elemento. Usá join fetch o un grafo de entidades.",
        "Poner las clases fuera del paquete de la aplicación: el escaneo de componentes no las encuentra y falla con \"No qualifying bean\".",
      ],
      codigo: [
        code`
@Service
class PedidoService {
    @Transactional
    public void cancelar(long id) { /* ... */ }

    public void cancelarTodos() {
        cancelar(1);        // MAL: la llamada interna no pasa por el proxy, sin transacción
    }
}`,
      ],
    },
    {
      heading: "Dónde conviene usarlo y dónde no",
      parrafos: [
        "Spring Boot es la opción por defecto en el mundo empresarial de Java:",
      ],
      tabla: {
        cabeza: ["Caso", "¿Spring Boot?", "Por qué"],
        filas: [
          ["APIs y microservicios empresariales", "Sí", "Ecosistema enorme, seguridad y pruebas maduras."],
          ["Sistemas grandes con muchos equipos", "Sí", "Convenciones claras y mucha gente que lo conoce."],
          ["Aplicaciones con base de datos relacional", "Sí", "Spring Data y las transacciones simplifican todo."],
          ["Funciones que arrancan al instante (serverless)", "Con cuidado", "El arranque y la memoria son altos; se puede compilar a nativo con GraalVM."],
          ["Un script o una herramienta de unas pocas líneas", "No", "Es mucho aparato para algo chico."],
          ["Prototipos muy rápidos", "No ideal", "La configuración y el ciclo de compilación pesan más que en Python o Node."],
        ],
      },
    },
    {
      heading: "Comparación con alternativas",
      parrafos: [
        "Cuándo conviene otra cosa:",
      ],
      tabla: {
        cabeza: ["Alternativa", "Elegila en vez de Spring Boot cuando…"],
        filas: [
          ["Quarkus o Micronaut", "el arranque rápido y el bajo consumo de memoria son prioridad."],
          ["Ktor", "escribís en Kotlin y preferís algo más liviano."],
          ["ASP.NET Core", "tu entorno es .NET; la arquitectura es muy parecida."],
          ["Django o FastAPI", "el equipo trabaja en Python."],
        ],
      },
    },
    {
      heading: "Cómo seguir",
      parrafos: [
        "Hacé el proyecto de Spring Boot de la app (una API de libros) y usá la pestaña Referencia para recordar las anotaciones.",
        "Fuera de la app, las guías de spring.io (\"Getting Started\") son cortas, están actualizadas y cada una resuelve un caso concreto. La referencia de Spring Boot explica la configuración automática en detalle, y vale la pena leerla cuando algo \"mágico\" no hace lo que esperabas.",
      ],
    },
  ],
  fuentes: [
    { texto: "Spring Boot: referencia", url: "https://docs.spring.io/spring-boot/" },
    { texto: "Guías de Spring", url: "https://spring.io/guides" },
    { texto: "Spring Initializr", url: "https://start.spring.io/" },
  ],
  revisada: "2026-11-12",
};
