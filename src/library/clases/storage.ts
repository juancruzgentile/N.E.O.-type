import { type Clase, code } from "../types";

export const claseStorage: Clase = {
  titulo: "Almacenamiento y copias de seguridad: dónde guardar y cómo no perderlo",
  bajada:
    "Las tres formas de guardar datos (bloques, archivos y objetos), cómo funciona S3, qué es una buena estrategia de copias y por qué " +
    "lo único que cuenta es que puedas restaurar.",
  secciones: [
    {
      heading: "Qué es y qué problema resuelve",
      parrafos: [
        "El almacenamiento es donde viven los datos que tu aplicación necesita guardar: la base de datos, pero también las imágenes que suben los usuarios, los documentos, los videos, los registros y las copias de seguridad. Cada tipo de dato encaja mejor en un tipo de almacenamiento, y elegir bien cambia el costo, la velocidad y la facilidad de crecer.",
        "El problema que resuelve es doble. Primero, que la base de datos no es el lugar para guardar archivos grandes: la hace pesada, cara y lenta de respaldar. Segundo, que los discos fallan, los servidores se pierden, los datos se borran por error y los ataques de ransomware los cifran. Todo dato que importa necesita copias, y las copias necesitan una estrategia.",
      ],
    },
    {
      heading: "Historia corta",
      parrafos: [
        "Durante décadas, guardar datos era sinónimo de discos conectados a un servidor (bloques) y carpetas compartidas por red (archivos). En 2006, Amazon lanzó S3, un servicio donde se guardan objetos por HTTP, sin discos ni servidores que administrar, con una durabilidad enorme. Fue el origen de la nube moderna, y su interfaz se volvió un estándar que imitan Cloudflare R2, MinIO, Backblaze y otros.",
        "En copias, la regla 3-2-1 (tres copias, en dos medios, una fuera del lugar) se atribuye al fotógrafo Peter Krogh, en los años dos mil, y sigue siendo la base. El ransomware de los últimos años le sumó una exigencia: que al menos una copia no se pueda modificar ni borrar.",
      ],
    },
    {
      heading: "Cómo funciona por dentro: bloques, archivos y objetos",
      parrafos: [
        "El almacenamiento de bloques es un disco crudo que se conecta a un servidor. El sistema operativo lo formatea y lo maneja. Es rápido y de baja latencia, ideal para el sistema operativo y para bases de datos. Normalmente se conecta a un solo servidor a la vez (EBS en AWS, discos locales).",
        "El almacenamiento de archivos es una jerarquía de carpetas compartida por red, que varios servidores montan a la vez (NFS, EFS). Sirve cuando hace falta que muchos procesos vean los mismos archivos, pero es más lento y limitado en escala. El almacenamiento de objetos no tiene carpetas reales: guarda objetos (el archivo más sus metadatos) bajo una clave en un bucket, y se accede con peticiones HTTP. Escala casi sin límite, es barato por gigabyte, y está replicado automáticamente. A cambio, no se puede editar un objeto a medias (se reemplaza entero) y el acceso es más lento que el de un disco.",
      ],
      tabla: {
        cabeza: ["Tipo", "Cómo se accede", "Ideal para", "Limitación"],
        filas: [
          ["Bloques", "Como un disco de un servidor", "Sistema operativo, bases de datos", "Atado a un servidor; hay que dimensionarlo."],
          ["Archivos", "Carpetas montadas por red", "Archivos compartidos entre varios servidores", "Más lento; escala menos."],
          ["Objetos", "HTTP: claves en un bucket", "Imágenes, videos, copias, registros", "No se edita a medias; más latencia."],
        ],
      },
    },
    {
      heading: "Tu primer ejemplo: S3 desde la terminal",
      parrafos: [
        "Con la CLI de AWS configurada (o con cualquier servicio compatible con S3):",
      ],
      codigo: [
        code`
aws s3 mb s3://mi-bucket-ana
aws s3 cp informe.pdf s3://mi-bucket-ana/informes/2026/
aws s3 ls s3://mi-bucket-ana/informes/ --human-readable

# acceso temporal a un objeto privado
aws s3 presign s3://mi-bucket-ana/informes/2026/informe.pdf --expires-in 900`,
      ],
    },
    {
      heading: "Qué hace cada parte",
      parrafos: [
        "Un bucket es el contenedor de nivel superior, con un nombre único. cp sube un archivo y le pone una clave (informes/2026/informe.pdf): las barras parecen carpetas, pero son parte del nombre. ls lista las claves que empiezan con un prefijo.",
        "La URL prefirmada es la manera correcta de compartir un objeto privado: el bucket sigue cerrado, y generás un enlace que funciona unos minutos. Así, una aplicación puede dejar que el navegador del usuario suba o descargue directamente a S3 sin pasar el archivo por tu servidor.",
      ],
    },
    {
      heading: "Una estrategia de copias que funciona",
      parrafos: [
        "Hacer una copia es fácil. Lo difícil es que la copia exista cuando la necesitás y que sirva. Cuatro ideas ordenan una buena estrategia:",
      ],
      lista: [
        "3-2-1: tres copias de los datos, en dos tipos de medio distintos, y una fuera del lugar (otra ubicación o la nube).",
        "Copias inmutables: al menos una que ni un administrador comprometido pueda borrar (Object Lock, o un medio desconectado).",
        "Historial, no solo la última: si un archivo se corrompe hoy, la copia de anoche ya lo copió corrupto. Guardá varias versiones.",
        "Restauración probada: programá restaurar de verdad cada tanto, y medí cuánto tarda. Dos números definen el plan: RPO (cuántos datos podés perder) y RTO (cuánto podés estar caído).",
      ],
      codigo: [
        code`
# copia lógica de PostgreSQL, comprimida
pg_dump -h localhost -U app -Fc tienda > tienda.dump

# copia con historial, cifrada y deduplicada
restic -r /mnt/respaldo/restic backup /home/ana/proyectos

# fuera del lugar
rclone sync /mnt/respaldo remoto:copias-ana

# y la prueba que nadie hace: restaurar
createdb tienda_prueba && pg_restore -d tienda_prueba tienda.dump`,
      ],
    },
    {
      heading: "Errores que comete casi todo el mundo",
      parrafos: [
        "Los que más cuestan:",
      ],
      lista: [
        "No probar nunca la restauración: la copia estaba vacía, incompleta o cifrada con una clave perdida, y se descubre en la emergencia.",
        "Guardar la copia en el mismo disco o servidor que los originales: falla uno y se van los dos.",
        "Confundir sincronizar con respaldar: una carpeta sincronizada replica también los borrados y la corrupción. Una copia necesita historial.",
        "Dejar un bucket público por error: es una de las causas más frecuentes de filtraciones. Bloqueá el acceso público y usá URL prefirmadas.",
        "Guardar archivos grandes dentro de la base de datos: la hace lenta y cara de respaldar. Guardá la clave del objeto.",
        "Perder la clave de cifrado de las copias: sin ella, la copia es basura. Guardala aparte, en un gestor de secretos.",
        "Olvidar el costo de salida: sacar muchos datos de una nube suele costar, por eso el costo de restaurar también se calcula.",
      ],
      codigo: [
        code`
# Verificar que la copia no se corrompió
sha256sum tienda.dump > tienda.sha256
sha256sum -c tienda.sha256

# Copias que no se pueden borrar durante 30 días
aws s3api put-object-lock-configuration --bucket copias-inmutables \
  --object-lock-configuration '{"ObjectLockEnabled":"Enabled","Rule":{"DefaultRetention":{"Mode":"COMPLIANCE","Days":30}}}'`,
      ],
    },
    {
      heading: "Dónde conviene cada tipo y dónde no",
      parrafos: [
        "Un criterio simple para decidir dónde va cada cosa:",
      ],
      tabla: {
        cabeza: ["Dato", "¿Dónde?", "Por qué"],
        filas: [
          ["Tablas de la aplicación", "Base de datos sobre almacenamiento de bloques", "Latencia baja y transacciones."],
          ["Imágenes, videos y documentos de usuarios", "Almacenamiento de objetos (S3)", "Barato, escalable y se sirve por HTTP o con una CDN."],
          ["Archivos compartidos entre servidores", "Sistema de archivos de red", "Todos ven la misma carpeta, aunque con menos escala."],
          ["Copias de seguridad", "Objetos con versionado y bloqueo", "Barato, duradero y protegible contra borrados."],
          ["Archivos temporales de un proceso", "Disco local", "Se descartan; no necesitan durabilidad."],
          ["Registros históricos poco consultados", "Objetos con clase de almacenamiento frío", "Muy barato si casi nunca se leen."],
        ],
      },
    },
    {
      heading: "Cómo seguir",
      parrafos: [
        "Usá la pestaña Referencia de este tema para recordar los comandos. Para practicar, armá una copia de una carpeta propia con restic, restaurala en otro lugar y comprobá que está todo. Después, creá un bucket y probá el versionado: subí un archivo, sobrescribilo, borralo y recuperalo.",
        "La documentación de S3 explica el versionado, el bloqueo de objetos y las clases de almacenamiento, y la de restic es clara y corta. La clase de seguridad de los datos de esta Biblioteca cubre cómo cifrar y controlar el acceso a todo esto.",
      ],
    },
  ],
  fuentes: [
    { texto: "Amazon S3: guía del usuario", url: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html" },
    { texto: "S3 Object Lock", url: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lock.html" },
    { texto: "restic: documentación", url: "https://restic.readthedocs.io/en/stable/" },
    { texto: "PostgreSQL: copias con pg_dump", url: "https://www.postgresql.org/docs/current/app-pgdump.html" },
  ],
  revisada: "2026-11-12",
};
