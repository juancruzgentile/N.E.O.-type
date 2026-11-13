import { type Topic, a, b, code, m } from "./types";
import { claseStorage } from "./clases/storage";

export const storage: Topic = {
  id: "storage",
  name: "Almacenamiento y copias de seguridad",
  group: "Bases de datos",
  emblem: null,
  badge: "ST",
  color: "#7fd1ae",
  hl: "linux",
  summary:
    "Dónde y cómo se guardan los datos que no caben en una base: almacenamiento de bloques, de archivos y de objetos (S3), y cómo respaldarlos para poder recuperarlos. " +
    "Acá están los comandos para ver el espacio, copiar y verificar, trabajar con S3 y hacer copias de PostgreSQL y de carpetas con historial.",
  facts: [
    { label: "Bloques", value: "un disco para un servidor (EBS, discos locales)" },
    { label: "Archivos", value: "una carpeta compartida (NFS, EFS)" },
    { label: "Objetos", value: "claves y archivos por HTTP (S3, R2, MinIO)" },
    { label: "Regla de copias", value: "3-2-1: tres copias, dos medios, una fuera del lugar" },
  ],
  workflow: [
    { title: "Archivos en objetos, referencias en la base", text: "Imágenes, videos y documentos van a almacenamiento de objetos. En la base guardá solo la ruta o la clave." },
    { title: "Una copia en el mismo disco no es una copia", text: "Si falla el equipo, se pierde todo junto. Al menos una copia tiene que estar en otro lugar." },
    { title: "Probá restaurar", text: "Una copia que nunca restauraste es una suposición. Programá una restauración de prueba cada tanto." },
    { title: "Copias que no se puedan borrar", text: "Un ransomware o un error borra también las copias a las que tiene acceso. Usá versionado y bloqueo de objetos." },
    { title: "Cifrá y controlá el acceso", text: "Las copias tienen los mismos datos sensibles que la base. Cifralas y limitá quién las puede leer." },
  ],
  entries: [
    b("Disco", "df, du y lsblk: ver el espacio", "df muestra cuánto espacio libre queda por sistema de archivos, du cuánto ocupa cada carpeta y lsblk los discos y sus particiones.", code`
df -h
du -sh /var/lib/* | sort -h | tail
lsblk`, "espacio disco libre df du lsblk particiones"),
    b("Archivos", "tar y gzip: empaquetar y comprimir", "tar junta muchos archivos en uno solo y -z lo comprime con gzip. Con -x se extrae, con -t se lista sin extraer.", code`
tar -czf copia.tar.gz /home/ana/proyectos
tar -tzf copia.tar.gz | head
tar -xzf copia.tar.gz -C /tmp/restaurado`, "tar gzip comprimir empaquetar comprimir extraer"),
    b("Archivos", "rsync: copiar solo lo que cambió", "rsync compara origen y destino y transfiere solo las diferencias. Con --dry-run muestra qué haría sin tocar nada.", code`
rsync -avh --dry-run /home/ana/proyectos/ /mnt/respaldo/proyectos/
rsync -avh --delete /home/ana/proyectos/ /mnt/respaldo/proyectos/`, "rsync sincronizar copiar diferencias respaldo"),
    b("Verificar", "sha256sum: comprobar que no se corrompió", "Un hash identifica el contenido de un archivo. Si cambia un solo bit, cambia el hash: sirve para verificar una copia o una descarga.", code`
sha256sum copia.tar.gz > copia.sha256
sha256sum -c copia.sha256    # copia.tar.gz: OK`, "hash sha256 verificar integridad corrupcion"),
    m("Objetos", "S3 con la CLI de AWS: cp y sync", "S3 guarda objetos (archivos con una clave) en buckets, y se accede por HTTP. sync copia carpetas y sube solo lo que cambió.", code`
aws s3 cp informe.pdf s3://mi-bucket/informes/2026/
aws s3 sync ./fotos s3://mi-bucket/fotos --delete
aws s3 ls s3://mi-bucket/fotos/ --human-readable`, "s3 aws cli cp sync bucket objeto subir"),
    m("Objetos", "URL prefirmada", "Una URL prefirmada da acceso temporal a un objeto privado sin hacer público el bucket ni compartir credenciales. Caduca sola.", code`
aws s3 presign s3://mi-bucket/informes/2026/informe.pdf --expires-in 900
# devuelve una URL válida por 15 minutos`, "presigned url prefirmada acceso temporal compartir"),
    m("Objetos", "Versionado de un bucket", "Con el versionado activado, sobrescribir o borrar un objeto no lo destruye: guarda la versión anterior y permite volver atrás.", code`
aws s3api put-bucket-versioning --bucket mi-bucket \
  --versioning-configuration Status=Enabled

aws s3api list-object-versions --bucket mi-bucket --prefix informes/`, "versionado versiones s3 borrar recuperar"),
    m("Copias", "pg_dump y pg_restore", "pg_dump saca una copia lógica de una base de PostgreSQL mientras funciona. El formato custom (-Fc) se comprime y permite restaurar partes.", code`
pg_dump -h localhost -U app -Fc tienda > tienda.dump
pg_restore -h localhost -U app -d tienda_nueva --clean --if-exists tienda.dump`, "pg_dump pg_restore postgresql copia respaldo base"),
    m("Copias", "restic: copias cifradas y con historial", "restic guarda copias cifradas y deduplicadas en un repositorio (disco, S3, SFTP). Cada copia es una instantánea a la que se puede volver.", code`
restic init --repo /mnt/respaldo/restic
restic -r /mnt/respaldo/restic backup /home/ana/proyectos
restic -r /mnt/respaldo/restic snapshots
restic -r /mnt/respaldo/restic restore latest --target /tmp/restaurado`, "restic copias cifradas historial instantaneas deduplicar"),
    a("Copias", "Regla 3-2-1 con rclone", "Tres copias, en dos tipos de medio, una fuera del lugar. rclone sincroniza hacia casi cualquier servicio de almacenamiento.", code`
# copia 1: los datos originales
# copia 2: disco externo (rsync o restic)
# copia 3: fuera del lugar
rclone sync /mnt/respaldo remoto:copias-ana --transfers 4 --progress`, "321 rclone fuera del lugar nube respaldo"),
    a("Objetos", "Object Lock: copias que no se pueden borrar", "El bloqueo de objetos impide modificar o borrar un objeto durante un tiempo, incluso con credenciales de administrador. Protege las copias del ransomware.", code`
aws s3api create-bucket --bucket copias-inmutables --object-lock-enabled-for-bucket

aws s3api put-object-lock-configuration --bucket copias-inmutables \
  --object-lock-configuration \
  '{"ObjectLockEnabled":"Enabled","Rule":{"DefaultRetention":{"Mode":"COMPLIANCE","Days":30}}}'`, "object lock inmutable ransomware worm retencion"),
    a("Copias", "Probar la restauración", "Una copia vale lo que vale su restauración. Restaurá en una base nueva, comprobá que los datos están y medí cuánto tarda.", code`
createdb tienda_prueba
pg_restore -d tienda_prueba --exit-on-error tienda.dump
psql -d tienda_prueba -c "SELECT count(*) FROM pedidos;"
dropdb tienda_prueba`, "restaurar probar verificar copia tiempo recuperacion"),
  ],
  clase: claseStorage,
};
