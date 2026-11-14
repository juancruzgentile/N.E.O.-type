import { type Topic, a, b, code, m } from "./types";
import { claseAsincronia } from "./clases/asincronia";

export const asincronia: Topic = {
  id: "asincronia",
  name: "Procesos asíncronos y colas",
  group: "Bases de datos",
  emblem: null,
  badge: "AQ",
  color: "#ff9f43",
  hl: "python",
  summary:
    "Hacer varias cosas sin esperar a que cada una termine: concurrencia con asyncio, trabajos en segundo plano, y colas de mensajes (RabbitMQ, Kafka, Celery) que desacoplan quien pide de quien trabaja. " +
    "Lo difícil no es mandar el trabajo sino que sea seguro repetirlo: reintentos, idempotencia y mensajes que no se pueden procesar.",
  facts: [
    { label: "En un proceso", value: "asyncio · hilos · multiprocessing" },
    { label: "Trabajos en segundo plano", value: "Celery · RQ · BullMQ" },
    { label: "Brokers de mensajes", value: "RabbitMQ · Kafka · Redis Streams · SQS" },
    { label: "Garantía realista", value: "al menos una vez (hay que tolerar duplicados)" },
  ],
  workflow: [
    { title: "Sacá de la petición lo que no hace falta esperar", text: "Enviar un correo o generar un informe no tiene que demorar la respuesta al usuario. Encolalo y respondé enseguida." },
    { title: "Asumí que todo mensaje llega más de una vez", text: "La entrega exactamente una vez de punta a punta no existe. Diseñá cada tarea para que repetirla no cause daño (idempotencia)." },
    { title: "Reintentá con pausas crecientes", text: "Un fallo temporal se resuelve esperando. Aumentá la espera entre intentos y sumale un poco de azar para que no reintenten todos a la vez." },
    { title: "Un destino para lo imposible", text: "Después de varios intentos, mové el mensaje a una cola de mensajes muertos para revisarlo a mano, en vez de reintentarlo para siempre." },
    { title: "Mirá la longitud de la cola", text: "Si la cola crece más rápido de lo que se vacía, los trabajadores no dan abasto. Es la primera alarma que conviene tener." },
  ],
  entries: [
    b("asyncio", "async y await", "Una función async def devuelve una corrutina. await la espera sin bloquear el hilo, y mientras tanto el bucle de eventos puede ejecutar otras.", code`
import asyncio

async def pedir(nombre, demora):
    await asyncio.sleep(demora)      # simula esperar a la red
    return f"{nombre} listo"

async def main():
    print(await pedir("a", 1))

asyncio.run(main())`, "asyncio async await corrutina bucle eventos"),
    b("asyncio", "gather: varias tareas a la vez", "asyncio.gather lanza varias corrutinas juntas y espera a todas. Tres pedidos de un segundo tardan un segundo, no tres.", code`
import asyncio

async def pedir(n):
    await asyncio.sleep(1)
    return n * 2

async def main():
    resultados = await asyncio.gather(pedir(1), pedir(2), pedir(3))
    print(resultados)    # [2, 4, 6], en alrededor de 1 segundo

asyncio.run(main())`, "gather concurrencia varias tareas paralelo"),
    b("Hilos", "Productor y consumidor con queue.Queue", "Una cola segura entre hilos: uno produce trabajo y otros lo consumen. task_done y join permiten esperar a que se termine todo.", code`
import queue
import threading

cola = queue.Queue()

def trabajador():
    while True:
        tarea = cola.get()
        print("procesando", tarea)
        cola.task_done()

threading.Thread(target=trabajador, daemon=True).start()
for i in range(5):
    cola.put(i)
cola.join()          # espera a que se procesen las 5`, "queue hilos thread productor consumidor cola"),
    m("asyncio", "Timeout con wait_for", "Una espera sin límite puede colgar el sistema. wait_for cancela la tarea y lanza TimeoutError cuando pasa el tiempo.", code`
import asyncio

async def lenta():
    await asyncio.sleep(10)

async def main():
    try:
        await asyncio.wait_for(lenta(), timeout=2)
    except asyncio.TimeoutError:
        print("tardó demasiado")

asyncio.run(main())`, "timeout wait_for cancelar espera limite"),
    m("asyncio", "Semaphore: limitar la concurrencia", "Lanzar mil pedidos a la vez puede tumbar el servidor del otro lado. Un semáforo deja pasar solo una cantidad a la vez.", code`
import asyncio

limite = asyncio.Semaphore(5)      # como máximo 5 a la vez

async def pedir(url):
    async with limite:
        await asyncio.sleep(1)     # acá iría el pedido real
        return url

async def main():
    await asyncio.gather(*(pedir(f"/{i}") for i in range(20)))

asyncio.run(main())`, "semaforo limitar concurrencia rate limit"),
    m("Reintentos", "Backoff exponencial con jitter", "Esperar el doble cada vez da tiempo a que el problema se resuelva. El jitter (un poco de azar) evita que todos los clientes reintenten a la vez y vuelvan a saturar el servidor.", code`
import random
import time

def con_reintentos(funcion, intentos=5, base=0.5, tope=30):
    for n in range(intentos):
        try:
            return funcion()
        except Exception:
            if n == intentos - 1:
                raise
            espera = min(tope, base * 2 ** n)
            time.sleep(random.uniform(0, espera))   # jitter completo`, "reintentos backoff exponencial jitter espera"),
    m("Trabajos", "Celery: tarea con reintentos", "Celery ejecuta funciones en procesos aparte, tomadas de una cola. autoretry_for y retry_backoff reintentan solos con espera creciente cuando la tarea lanza esa excepción. Por defecto Celery confirma el mensaje antes de ejecutarlo: acks_late=True lo confirma al terminar, para que una tarea cortada se reentregue (tiene que ser idempotente).", code`
from celery import Celery

app = Celery("tienda", broker="redis://localhost:6379/0")

@app.task(bind=True, acks_late=True, autoretry_for=(ConnectionError,),
          retry_backoff=True, retry_jitter=True, max_retries=5)
def enviar_correo(self, pedido_id):
    ...    # si lanza ConnectionError, se reintenta

# desde la aplicación: encolar y seguir
enviar_correo.delay(42)`, "celery tarea reintentos cola trabajos segundo plano"),
    m("Idempotencia", "Una clave única evita el doble efecto", "Si un mensaje puede llegar dos veces, la tarea guarda una clave única de lo que ya procesó. El segundo intento choca con la clave y no repite el efecto.", code`
def cobrar(conexion, clave, cliente, monto):
    with conexion.cursor() as cur:
        cur.execute(
            "INSERT INTO cobros (clave, cliente, monto) VALUES (%s, %s, %s) "
            "ON CONFLICT (clave) DO NOTHING",
            (clave, cliente, monto),
        )
        if cur.rowcount == 0:
            return "ya estaba cobrado"
    conexion.commit()
    return "cobrado"`, "idempotencia clave unica duplicado exactamente una vez"),
    a("Brokers", "RabbitMQ: publicar y confirmar con ack", "El consumidor confirma (ack) cuando terminó. Si cae antes, el broker vuelve a entregar el mensaje a otro. Por eso un mensaje puede llegar más de una vez.", code`
import pika

conexion = pika.BlockingConnection(pika.ConnectionParameters("localhost"))
canal = conexion.channel()
canal.queue_declare(queue="pedidos", durable=True)

canal.basic_publish(exchange="", routing_key="pedidos", body=b"pedido-42",
                    properties=pika.BasicProperties(delivery_mode=2))   # persistente

def procesar(ch, metodo, props, cuerpo):
    print("recibido", cuerpo)
    ch.basic_ack(delivery_tag=metodo.delivery_tag)   # recién ahora se da por hecho

canal.basic_qos(prefetch_count=1)
canal.basic_consume(queue="pedidos", on_message_callback=procesar)
canal.start_consuming()`, "rabbitmq pika ack confirmar mensaje cola"),
    a("Brokers", "Cola de mensajes muertos en RabbitMQ", "Un mensaje que falla una y otra vez no debe trabar la cola. Se redirige a una cola de mensajes muertos (dead letter) para revisarlo a mano.", code`
canal.queue_declare(queue="pedidos_muertos", durable=True)
canal.queue_declare(
    queue="pedidos",
    durable=True,
    arguments={
        "x-dead-letter-exchange": "",
        "x-dead-letter-routing-key": "pedidos_muertos",
    },
)

# en el consumidor, cuando ya no tiene sentido reintentar:
# ch.basic_nack(delivery_tag=metodo.delivery_tag, requeue=False)`, "dead letter mensajes muertos dlx nack rabbitmq"),
    a("Brokers", "Kafka: grupo de consumidores", "Kafka guarda los mensajes en un registro por particiones. Los consumidores de un mismo grupo se reparten las particiones, y cada uno recuerda hasta dónde leyó (offset).", code`
from confluent_kafka import Consumer

consumidor = Consumer({
    "bootstrap.servers": "localhost:9092",
    "group.id": "facturacion",
    "enable.auto.commit": False,        # confirmo yo, después de procesar
    "auto.offset.reset": "earliest",
})
consumidor.subscribe(["pedidos"])

while True:
    mensaje = consumidor.poll(1.0)
    if mensaje is None or mensaje.error():
        continue
    print(mensaje.key(), mensaje.value())
    consumidor.commit(message=mensaje)`, "kafka consumidor grupo offset particion"),
    a("Patrón", "Outbox: publicar sin perder ni duplicar", "Guardar en la base y avisar al broker son dos escrituras que pueden fallar por separado. Con outbox, el aviso se guarda en la misma transacción y otro proceso lo publica después.", code`
def crear_pedido(conexion, datos):
    with conexion.cursor() as cur:
        cur.execute("INSERT INTO pedidos (cliente, total) VALUES (%s, %s) RETURNING id",
                    (datos["cliente"], datos["total"]))
        pedido_id = cur.fetchone()[0]
        cur.execute("INSERT INTO outbox (tipo, contenido) VALUES (%s, %s)",
                    ("pedido_creado", str(pedido_id)))
    conexion.commit()    # o se guardan los dos, o ninguno

# otro proceso lee la tabla outbox, publica en el broker y marca como enviado`, "outbox transaccional publicar evento consistencia dual write"),
  ],
  clase: claseAsincronia,
};
