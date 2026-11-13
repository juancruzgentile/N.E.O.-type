import { type Clase, code } from "../types";

export const claseAsincronia: Clase = {
  titulo: "Procesos asíncronos y colas: hacer más sin esperar",
  bajada:
    "Qué significa que algo sea asíncrono, la diferencia entre concurrencia dentro de un programa y colas entre programas, " +
    "las garantías reales de los mensajes (y por qué hay que tolerar duplicados), y los patrones que evitan perder trabajo.",
  secciones: [
    {
      heading: "Qué es y qué problema resuelve",
      parrafos: [
        "Un proceso asíncrono es uno que no te hace esperar. Pedís algo, seguís con otra cosa, y el resultado llega después. Hay dos escalas del problema y conviene no confundirlas. Dentro de un programa, la concurrencia permite hacer varias cosas mientras se espera (por ejemplo, mil pedidos a la red a la vez con asyncio). Entre programas, una cola de mensajes deja que un sistema encargue trabajo a otro sin esperarlo ni conocerlo.",
        "El problema que resuelve es doble. Primero, la velocidad percibida: si al registrarse un usuario tenés que enviar un correo, generar un PDF y avisar a otros tres sistemas, no debería esperar todo eso para ver una respuesta. Segundo, la resistencia: si una parte está lenta o caída, el trabajo se acumula en la cola en vez de perderse, y se procesa cuando la parte vuelve.",
      ],
    },
    {
      heading: "Historia corta",
      parrafos: [
        "Las colas de mensajes existen desde los años noventa en los grandes sistemas empresariales (IBM MQ). En los dos mil llegaron AMQP y RabbitMQ para estandarizarlas, y en 2011 LinkedIn publicó Kafka, que cambió la idea: en lugar de una cola de la que los mensajes desaparecen al leerse, un registro ordenado y persistente que muchos consumidores pueden releer.",
        "En el lado de los programas, los modelos de concurrencia fueron evolucionando: hilos, después procesos, y desde los años dos mil bucles de eventos (Node.js en 2009, asyncio en Python 3.4, en 2014). async y await se difundieron desde C# en 2012 hasta casi todos los lenguajes.",
      ],
    },
    {
      heading: "Cómo funciona por dentro",
      parrafos: [
        "Dentro de un programa hay tres herramientas. Los hilos (threads) corren en paralelo compartiendo memoria, lo que obliga a proteger los datos compartidos. Los procesos tienen memoria separada y aprovechan varios núcleos. Y asyncio usa un solo hilo con un bucle de eventos: cada corrutina cede el control cuando espera (await), y el bucle ejecuta otra. Es ideal para esperar red o disco con miles de tareas, y no sirve para cálculo pesado, porque una tarea larga sin await frena a todas.",
        "Entre programas, hay un intermediario (broker) con colas. El productor deja un mensaje; el broker lo guarda; un consumidor lo toma, lo procesa y confirma (ack). Si el consumidor se cae antes de confirmar, el broker entrega el mensaje de nuevo a otro. De eso sale la garantía realista: al menos una vez. La entrega exactamente una vez, de punta a punta, no existe en una red que puede fallar; lo que se hace es tolerar los duplicados.",
      ],
    },
    {
      heading: "Tu primer ejemplo, paso a paso",
      parrafos: [
        "Primero, concurrencia dentro de un programa. Tres tareas de un segundo se completan en un segundo en total:",
      ],
      codigo: [
        code`
import asyncio
import time

async def pedir(n):
    await asyncio.sleep(1)       # espera "de red": no bloquea el bucle
    return n * 2

async def main():
    inicio = time.perf_counter()
    resultados = await asyncio.gather(pedir(1), pedir(2), pedir(3))
    print(resultados, round(time.perf_counter() - inicio, 1), "s")   # [2, 4, 6] 1.0 s

asyncio.run(main())`,
      ],
    },
    {
      heading: "Qué pasa cuando se usa una cola",
      parrafos: [
        "Ahora con una cola entre programas. La aplicación web encola y responde; un trabajador aparte hace el trabajo lento. Con Celery y Redis:",
      ],
      codigo: [
        code`
# tareas.py
from celery import Celery

app = Celery("tienda", broker="redis://localhost:6379/0")

@app.task(autoretry_for=(ConnectionError,), retry_backoff=True, max_retries=5)
def enviar_correo(pedido_id):
    ...    # el trabajo lento

# en la vista web: encolar y responder enseguida
enviar_correo.delay(42)

# en otra terminal, el trabajador:  celery -A tareas worker`,
      ],
    },
    {
      heading: "Los conceptos que sostienen todo lo demás",
      parrafos: [
        "Con estos seis conceptos entendés casi cualquier sistema de colas:",
      ],
      lista: [
        "Productor, broker y consumidor: quien manda, quien guarda y quien trabaja.",
        "Confirmación (ack): el trabajo se da por hecho recién cuando el consumidor lo confirma. Sin confirmar, se reentrega.",
        "Idempotencia: ejecutar una tarea dos veces tiene el mismo efecto que una. Se logra con una clave única de lo ya procesado.",
        "Reintentos con backoff y jitter: esperar cada vez más, con un poco de azar, para no saturar el servicio que está fallando.",
        "Cola de mensajes muertos (dead letter): el destino de los mensajes que fallan demasiadas veces, para revisarlos a mano.",
        "Contrapresión: si los productores van más rápido que los consumidores, la cola crece; hay que limitar, escalar los trabajadores o rechazar.",
      ],
      codigo: [
        code`
import random, time

def con_reintentos(funcion, intentos=5, base=0.5, tope=30):
    for n in range(intentos):
        try:
            return funcion()
        except Exception:
            if n == intentos - 1:
                raise                                   # agotados: que lo vea la cola de muertos
            time.sleep(random.uniform(0, min(tope, base * 2 ** n)))`,
      ],
    },
    {
      heading: "RabbitMQ, Kafka y Redis: cuál es cuál",
      parrafos: [
        "Los tres se usan para mensajes pero son distintos. RabbitMQ es un broker de colas clásico: enruta mensajes a colas con reglas flexibles, y el mensaje desaparece cuando se confirma. Es ideal para repartir tareas entre trabajadores. Kafka es un registro distribuido y persistente: los mensajes se conservan un tiempo configurado y los consumidores recuerdan su posición, lo que permite releer y tener muchos consumidores independientes. Es ideal para flujos de eventos de gran volumen. Redis (listas o streams) es lo más simple si ya lo usás, con menos garantías.",
      ],
      tabla: {
        cabeza: ["Herramienta", "Elegila cuando…", "Cuidado con…"],
        filas: [
          ["RabbitMQ", "repartís tareas entre trabajadores con enrutamiento flexible.", "No es un registro para releer; cola muy larga consume memoria."],
          ["Kafka", "manejás flujos de eventos enormes, o varios sistemas leen lo mismo.", "Más complejo de operar; el orden es solo dentro de una partición."],
          ["Redis (listas o streams)", "ya lo usás y las garantías simples alcanzan.", "La persistencia y las garantías de entrega son más débiles."],
          ["Colas de la nube (SQS, Pub/Sub)", "no querés operar nada.", "Costos y límites propios de cada proveedor."],
        ],
      },
    },
    {
      heading: "Errores que comete casi todo el mundo",
      parrafos: [
        "Los que más dañan:",
      ],
      lista: [
        "No pensar en duplicados: cobrar dos veces porque el mensaje se reentregó. Toda tarea con efectos externos necesita una clave de idempotencia.",
        "Reintentar para siempre y sin pausa: convierte una falla chica en una caída. Limitá los intentos, usá backoff y enviá lo que no se resuelva a la cola de muertos.",
        "Guardar en la base y publicar el mensaje como dos pasos sueltos: si uno falla, se pierde o se duplica el aviso. Usá el patrón outbox.",
        "Bloquear el bucle de asyncio con código síncrono (time.sleep, requests): congela todas las tareas.",
        "Confirmar el mensaje antes de procesarlo: si el trabajador cae, el trabajo se pierde. Confirmá después.",
        "Mensajes enormes: guardá el dato en una base o en almacenamiento y mandá solo una referencia.",
        "No monitorear la cola: nadie se entera de que se acumulan miles de mensajes hasta que un usuario se queja.",
      ],
      codigo: [
        code`
import asyncio, time

async def mal():
    time.sleep(5)               # MAL: bloquea el bucle, todas las tareas se congelan

async def bien():
    await asyncio.sleep(5)      # BIEN: cede el control mientras espera`,
      ],
    },
    {
      heading: "Dónde conviene usarlo y dónde no",
      parrafos: [
        "No todo lo lento debe ir a una cola:",
      ],
      tabla: {
        cabeza: ["Caso", "¿Asíncrono?", "Por qué"],
        filas: [
          ["Enviar correos, notificaciones, informes", "Sí", "El usuario no necesita esperar el resultado."],
          ["Procesar imágenes, video o archivos subidos", "Sí", "Es lento y se puede repartir entre trabajadores."],
          ["Integración entre sistemas distintos", "Sí", "Desacopla: si uno cae, el otro sigue."],
          ["Picos de tráfico", "Sí", "La cola absorbe el pico y se vacía a ritmo constante."],
          ["Una operación de la que el usuario necesita el resultado ya", "No", "Una cola agrega demora y complejidad; mejor una llamada directa."],
          ["Un sistema chico con una sola tarea lenta ocasional", "Con cuidado", "Un hilo o una tarea en segundo plano simple puede alcanzar."],
        ],
      },
    },
    {
      heading: "Cómo seguir",
      parrafos: [
        "Usá la pestaña Referencia de este tema para recordar el código de cada pieza. Para practicar, armá un proyecto chico con una cola: una aplicación que encole un trabajo lento, un trabajador que lo haga, y probá tirar el trabajador a la mitad para ver cómo se reentrega.",
        "La documentación de asyncio de Python, la de Celery y la de RabbitMQ son claras y tienen guías de inicio. El libro \"Designing Data-Intensive Applications\", de Martin Kleppmann, dedica capítulos enteros a mensajería y a las garantías de entrega.",
      ],
    },
  ],
  fuentes: [
    { texto: "asyncio (documentación de Python)", url: "https://docs.python.org/3/library/asyncio.html" },
    { texto: "Celery: reintentos de tareas", url: "https://docs.celeryq.dev/en/stable/userguide/tasks.html#retrying" },
    { texto: "RabbitMQ: confirmaciones", url: "https://www.rabbitmq.com/docs/confirms" },
    { texto: "Backoff exponencial con jitter (AWS)", url: "https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/" },
  ],
  revisada: "2026-11-12",
};
