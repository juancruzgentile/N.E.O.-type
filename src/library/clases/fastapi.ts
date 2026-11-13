import { type Clase, code } from "../types";

export const claseFastapi: Clase = {
  titulo: "FastAPI de cero: APIs en Python guiadas por los tipos",
  bajada:
    "La referencia rápida está en la otra pestaña. Esta es la clase completa: qué es FastAPI y cómo los tipos de Python se vuelven validación y documentación, " +
    "tu primera API, los conceptos base, los errores típicos y cuándo conviene.",
  secciones: [
    {
      heading: "Qué es y qué problema resuelve",
      parrafos: [
        "FastAPI es un framework de Python para construir APIs web, es decir, servicios que reciben pedidos HTTP y devuelven datos (casi siempre JSON). Se usa para el back-end de aplicaciones, para microservicios y para exponer modelos de inteligencia artificial.",
        "El problema que resuelve es el de la repetición: en una API siempre hay que leer los parámetros, validarlos, convertirlos al tipo correcto, devolver un error claro si están mal y documentar todo. FastAPI lo hace por vos a partir de los type hints de Python que ya escribís. Declarás que un parámetro es un int, y el framework valida, convierte, rechaza lo inválido con un error 422 y lo agrega a la documentación interactiva, todo sin código extra.",
      ],
    },
    {
      heading: "Historia corta",
      parrafos: [
        "Lo creó Sebastián Ramírez y salió a fines de 2018. Se apoya en dos bibliotecas ya existentes: Starlette (que maneja la parte web asíncrona) y Pydantic (que valida y convierte datos usando los tipos). Creció muy rápido porque combinaba lo mejor de los frameworks anteriores: la sencillez de Flask, el rendimiento de las bibliotecas asíncronas y los tipos modernos de Python.",
      ],
      lista: [
        "Se ejecuta sobre ASGI, el estándar asíncrono de Python, con un servidor como Uvicorn.",
        "Genera por sí mismo la especificación OpenAPI de tu API, que sirve para documentación y para generar clientes.",
        "Hoy es muy usado para servir modelos de aprendizaje automático y para back-ends nuevos en Python.",
      ],
    },
    {
      heading: "Cómo funciona por dentro",
      parrafos: [
        "FastAPI lee la firma de cada función que decorás como ruta. De sus parámetros y tipos deduce de dónde viene cada dato (la ruta, la query o el cuerpo del pedido) y construye el validador con Pydantic. Cuando llega un pedido, el framework valida los datos, llama a tu función con los valores ya convertidos, y transforma lo que devuelve a JSON. Si algo no cumple los tipos, responde con un 422 detallado antes de llamar a tu código.",
        "Podés escribir las rutas como def común o como async def. La diferencia es importante: una función async def corre directamente en el bucle de eventos, que atiende a todos los pedidos con un solo hilo, así que no debe bloquearse; una función def común la corre FastAPI en un hilo aparte, y por eso puede hacer trabajo bloqueante sin frenar a los demás.",
      ],
    },
    {
      heading: "Tu primera API, paso a paso",
      parrafos: [
        "Instalá con pip install \"fastapi[standard]\", guardá esto en main.py y arrancá con fastapi dev main.py. Abrí http://127.0.0.1:8000/saludo/Ana?veces=2 y después http://127.0.0.1:8000/docs.",
      ],
      codigo: [
        code`
from fastapi import FastAPI

app = FastAPI()

@app.get("/saludo/{nombre}")
def saludo(nombre: str, veces: int = 1):
    return {"mensaje": [f"{i}. Hola, {nombre}" for i in range(1, veces + 1)]}`,
      ],
    },
    {
      heading: "Qué hace cada parte",
      parrafos: [
        "app = FastAPI() crea la aplicación, y @app.get(\"/saludo/{nombre}\") registra la función como respuesta a un GET en esa ruta. Como nombre aparece entre llaves en la ruta, FastAPI sabe que es un parámetro de ruta; veces no aparece, así que es un parámetro de query (lo que va después del ?), y como tiene valor por defecto es opcional.",
        "Si pedís /saludo/Ana?veces=dos, no se ejecuta tu código: la respuesta es un 422 que explica que veces tiene que ser un número entero. Y en /docs tenés una página interactiva (Swagger UI) con tu API documentada, donde podés probar cada ruta, generada sin que escribas nada.",
      ],
    },
    {
      heading: "Los cinco conceptos que sostienen todo lo demás",
      parrafos: [
        "Con estos cinco leés casi cualquier API FastAPI:",
      ],
      lista: [
        "Parámetros de ruta y de query: se deducen de la ruta y de los tipos.",
        "Modelos de Pydantic: describen el cuerpo del pedido (y la respuesta) con tipos y reglas de validación.",
        "Códigos de estado y errores: status_code en la ruta y HTTPException para devolver 404, 403, etc.",
        "Dependencias (Depends): funciones reutilizables que se inyectan en las rutas, por ejemplo para abrir una sesión de base de datos o comprobar la autenticación.",
        "response_model: define qué campos salen en la respuesta y filtra el resto, útil para no filtrar datos privados.",
      ],
      codigo: [
        code`
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

class LibroIn(BaseModel):
    titulo: str
    paginas: int = 0

libros: dict[int, LibroIn] = {}

@app.post("/libros", status_code=201)
def crear(libro: LibroIn):
    nuevo_id = len(libros) + 1
    libros[nuevo_id] = libro
    return {"id": nuevo_id, **libro.model_dump()}

@app.get("/libros/{libro_id}")
def ver(libro_id: int):
    if libro_id not in libros:
        raise HTTPException(status_code=404, detail="No existe")
    return libros[libro_id]`,
      ],
    },
    {
      heading: "Errores que comete casi todo el mundo",
      parrafos: [
        "Los más repetidos:",
      ],
      lista: [
        "Bloquear el bucle de eventos: llamar a time.sleep, a requests o a una base de datos síncrona dentro de una ruta async def congela a todos los usuarios. Usá def común o bibliotecas asíncronas.",
        "Devolver el modelo de la base tal cual: puede incluir la contraseña. Definí un response_model sin los campos privados.",
        "Guardar datos en variables globales y creer que persisten: con varios procesos de trabajo (workers) cada uno tiene los suyos, y se pierden al reiniciar. Usá una base de datos.",
        "Olvidarse de CORS cuando un front-end en otro dominio llama a la API: el navegador bloquea el pedido hasta que lo habilitás con el middleware.",
        "Dejar la lógica de negocio dentro de las rutas: cuesta probarla. Separala en funciones o servicios.",
      ],
      codigo: [
        code`
import time

@app.get("/mal")
async def mal():
    time.sleep(5)        # MAL: bloquea el bucle de eventos, nadie más recibe respuesta

@app.get("/bien")
def bien():
    time.sleep(5)        # FastAPI la corre en un hilo aparte: los demás siguen funcionando`,
      ],
    },
    {
      heading: "Dónde conviene usarlo y dónde no",
      parrafos: [
        "FastAPI es una gran opción para APIs, y menos para sitios completos:",
      ],
      tabla: {
        cabeza: ["Caso", "¿FastAPI?", "Por qué"],
        filas: [
          ["APIs JSON para un front-end o una app móvil", "Sí", "Validación y documentación automáticas."],
          ["Microservicios", "Sí", "Liviano, rápido de levantar y fácil de probar."],
          ["Servir modelos de aprendizaje automático", "Sí", "Está en Python, donde viven las bibliotecas de IA."],
          ["Sitios con páginas, usuarios y panel de administración", "No ideal", "Django trae todo eso ya hecho."],
          ["Aplicaciones donde todo se genera como HTML en el servidor", "No ideal", "Se puede, pero no es su fuerte."],
          ["Código que debe ser muy rápido en cálculo", "No", "Python sigue siendo Python; para eso hay otros lenguajes."],
        ],
      },
    },
    {
      heading: "Comparación con alternativas",
      parrafos: [
        "Cuándo conviene otra cosa:",
      ],
      tabla: {
        cabeza: ["Alternativa", "Elegila en vez de FastAPI cuando…"],
        filas: [
          ["Django (con Django REST Framework)", "querés base de datos, administración, usuarios y formularios incluidos."],
          ["Flask", "es un servicio muy chico y preferís hacer todo a mano."],
          ["Node.js (Express o NestJS)", "tu equipo trabaja todo en JavaScript o TypeScript."],
          ["Go o Spring Boot", "necesitás el máximo rendimiento o un entorno empresarial."],
        ],
      },
    },
    {
      heading: "Cómo seguir",
      parrafos: [
        "Hacé los proyectos de FastAPI de la app y usá la pestaña Referencia para recordar la sintaxis de cada parte.",
        "Fuera de la app, la documentación oficial tiene un tutorial paso a paso muy bien escrito (con versión en español), y la de Pydantic explica los modelos y las reglas de validación. Con la base lista, el siguiente paso es conectar una base de datos con SQLModel o SQLAlchemy.",
      ],
    },
  ],
  fuentes: [
    { texto: "Tutorial de FastAPI", url: "https://fastapi.tiangolo.com/tutorial/" },
    { texto: "Pydantic", url: "https://docs.pydantic.dev/latest/" },
    { texto: "FastAPI: concurrencia y async/await", url: "https://fastapi.tiangolo.com/async/" },
  ],
  revisada: "2026-11-12",
};
