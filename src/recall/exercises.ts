// Ejercicios de memoria: se lee una consigna y se escribe el comando o el código sin verlo.
// La primera respuesta es la que se muestra; las demás también valen.
import type { Kind } from "./check";

export interface Exercise {
  id: string;
  prompt: string;
  answers: string[];
  /** pista que se puede pedir después de un error grave (no da la respuesta) */
  hint: string;
  /** qué hace, para leer al acertar */
  why: string;
}

export interface RecallLevel {
  name: string;
  exercises: Exercise[];
}

export interface RecallTopic {
  /** id del tema en la Biblioteca */
  id: string;
  name: string;
  kind: Kind;
  levels: RecallLevel[];
}

type Raw = [prompt: string, answers: string[], hint: string, why: string];

const LEVEL_NAMES = ["Básico", "Intermedio", "Avanzado"];

function topic(id: string, name: string, kind: Kind, levels: Raw[][]): RecallTopic {
  return {
    id, name, kind,
    levels: levels.map((ex, li) => ({
      name: LEVEL_NAMES[li],
      exercises: ex.map(([prompt, answers, hint, why], i) => ({ id: `${id}-${li + 1}-${i + 1}`, prompt, answers, hint, why })),
    })),
  };
}

const git = topic("git", "Git", "shell", [
  [
    ["Mostrá el estado del repositorio: qué archivos cambiaron y cuáles están preparados.", ["git status", "git status -s"],
      "Es el comando que más se usa: una sola palabra después de git.", "git status muestra la rama, los cambios preparados, los sin preparar y los archivos nuevos."],
    ["Prepará todos los cambios del repositorio para el próximo commit.", ["git add -A", "git add --all", "git add ."],
      "git add con una opción que significa «todo», o con el punto de la carpeta actual.", "git add -A prepara archivos nuevos, modificados y borrados. Con . se limita a la carpeta actual."],
    ["Creá un commit con el mensaje «primer commit».", ['git commit -m "primer commit"'],
      "La opción del mensaje es la inicial de message, y el texto va entre comillas.", "git commit -m guarda lo preparado con ese mensaje, sin abrir el editor."],
    ["Mostrá el historial resumido, un commit por línea.", ["git log --oneline"],
      "git log con una opción larga que dice «una línea» en inglés.", "--oneline muestra el hash corto y el título de cada commit."],
  ],
  [
    ["Creá la rama «login» y cambiate a ella en un solo comando.", ["git switch -c login", "git checkout -b login"],
      "switch con la opción de create, o el clásico checkout con la de branch.", "git switch -c crea la rama desde donde estás y te cambia a ella."],
    ["Traé los cambios de la rama main del remoto origin y combinalos con tu rama.", ["git pull origin main"],
      "Es fetch + merge en un solo comando. Después van el remoto y la rama.", "git pull descarga los commits nuevos y los integra en tu rama actual."],
    ["Guardá aparte los cambios sin commitear para dejar el directorio limpio.", ["git stash", "git stash push"],
      "Pensá en «esconder» en inglés.", "git stash guarda los cambios en una pila; git stash pop los devuelve."],
    ["Mostrá las diferencias de lo que ya está preparado para el commit.", ["git diff --staged", "git diff --cached"],
      "git diff solo muestra lo no preparado: necesita una opción que diga «preparado».", "--staged (o --cached) compara lo preparado contra el último commit."],
  ],
  [
    ["Deshacé el último commit pero conservá sus cambios preparados.", ["git reset --soft HEAD~1", "git reset --soft HEAD^", "git reset --soft HEAD~"],
      "reset con la opción «suave», hacia el commit anterior a HEAD.", "--soft mueve la rama un commit atrás y deja todo preparado para volver a commitear."],
    ["Aplicá en tu rama solo el commit a1b2c3d, que está en otra rama.", ["git cherry-pick a1b2c3d"],
      "Es como «elegir una cereza»: un comando compuesto con guion.", "git cherry-pick copia ese commit sobre tu rama actual como uno nuevo."],
    ["Subí la rama login a origin y dejala vinculada para los próximos push.", ["git push -u origin login", "git push --set-upstream origin login"],
      "push con la opción que fija el upstream, después el remoto y la rama.", "-u guarda el vínculo: desde ahí alcanza con git push y git pull."],
    ["Mostrá a dónde apuntó HEAD en los últimos movimientos, para recuperar un commit perdido.", ["git reflog", "git reflog show"],
      "Es el registro (log) de las referencias (ref).", "git reflog lista cada movimiento de HEAD, incluso commits que ya no están en ninguna rama."],
  ],
]);

const linux = topic("linux", "Terminal Linux", "shell", [
  [
    ["Mostrá en qué carpeta estás.", ["pwd"],
      "Tres letras: print working directory.", "pwd imprime la ruta completa de la carpeta actual."],
    ["Listá todos los archivos de la carpeta, también los ocultos, en formato largo.", ["ls -la", "ls -al", "ls -l -a", "ls -a -l"],
      "ls con la opción de formato largo y la de «all».", "-l muestra permisos, dueño, tamaño y fecha; -a incluye los que empiezan con punto."],
    ["Creá la carpeta proyectos/web, junto con las carpetas intermedias que falten.", ["mkdir -p proyectos/web", "mkdir --parents proyectos/web"],
      "mkdir con la opción de «parents».", "-p crea toda la ruta y no falla si alguna carpeta ya existe."],
    ["Copiá la carpeta fotos completa, con todo su contenido, a respaldo.", ["cp -r fotos respaldo", "cp -R fotos respaldo", "cp -a fotos respaldo"],
      "cp necesita una opción para copiar carpetas: la de «recursivo».", "-r copia la carpeta y todo lo que tiene adentro."],
  ],
  [
    ["Buscá la palabra error en app.log sin distinguir mayúsculas de minúsculas.", ["grep -i error app.log"],
      "grep con la opción de «ignore case», después el patrón y el archivo.", "grep -i encuentra error, Error y ERROR."],
    ["Mostrá las últimas 20 líneas de app.log.", ["tail -n 20 app.log", "tail -20 app.log", "tail -n20 app.log"],
      "Lo contrario de head, con la opción de cantidad de líneas.", "tail -n 20 muestra el final del archivo; con -f lo seguiría en vivo."],
    ["Dale permiso de ejecución a script.sh.", ["chmod +x script.sh", "chmod u+x script.sh", "chmod a+x script.sh"],
      "chmod suma un permiso con + y la letra de «execute».", "+x permite ejecutarlo como ./script.sh."],
    ["Mostrá cuánto espacio libre queda en los discos, en unidades fáciles de leer.", ["df -h", "df -H"],
      "Dos letras de disk free, con la opción de «human».", "df -h muestra tamaños en K, M y G en vez de bloques."],
  ],
  [
    ["Buscá desde la carpeta actual los archivos que terminen en .log (el patrón entre comillas).", ['find . -name "*.log"', 'find . -type f -name "*.log"'],
      "find, después dónde buscar, y la opción del nombre con el patrón entre comillas para que no lo expanda la terminal.", "find . -name recorre todas las subcarpetas buscando nombres que coincidan con el patrón."],
    ["Contá cuántas líneas tiene app.log.", ["wc -l app.log", "wc -l < app.log"],
      "word count, con la opción de líneas.", "wc -l cuenta saltos de línea; sin opciones también muestra palabras y bytes."],
    ["Mostrá los procesos que contengan node, pasando la lista de procesos a grep por una tubería.", ["ps aux | grep node", "ps -ef | grep node"],
      "El comando de procesos con sus opciones de todos los usuarios, después | y grep.", "| pasa la salida de ps a grep, que se queda con las líneas que dicen node."],
    ["Creá el archivo comprimido respaldo.tar.gz con la carpeta sitio.", ["tar -czf respaldo.tar.gz sitio", "tar -zcf respaldo.tar.gz sitio", "tar czf respaldo.tar.gz sitio", "tar -czvf respaldo.tar.gz sitio", "tar -cvzf respaldo.tar.gz sitio"],
      "tar con las opciones de crear, gzip y archivo, después el nombre del archivo y lo que se guarda.", "c crea, z comprime con gzip y f indica el nombre del archivo que sigue."],
  ],
]);

const sql = topic("sql", "SQL", "sql", [
  [
    ["Traé el nombre y el email de todos los usuarios (tabla usuarios).", ["SELECT nombre, email FROM usuarios;"],
      "SELECT con las dos columnas separadas por coma, y FROM la tabla.", "Nombrar las columnas es mejor que *: trae solo lo que se usa."],
    ["Traé todas las columnas de los productos con precio mayor a 100.", ["SELECT * FROM productos WHERE precio > 100;"],
      "SELECT * … FROM … y la condición en WHERE.", "WHERE filtra filas antes de devolverlas."],
    ["Traé todos los productos ordenados por precio, del más caro al más barato.", ["SELECT * FROM productos ORDER BY precio DESC;"],
      "ORDER BY con la palabra de «descendente».", "DESC invierte el orden; sin nada es ASC, de menor a mayor."],
    ["Agregá a usuarios una fila con nombre Ana y email ana@mail.com.", ["INSERT INTO usuarios (nombre, email) VALUES ('Ana', 'ana@mail.com');"],
      "INSERT INTO la tabla con las columnas entre paréntesis, y VALUES con los textos entre comillas simples.", "Nombrar las columnas evita errores si la tabla cambia de orden."],
  ],
  [
    ["Contá cuántos pedidos tiene cada cliente: cliente_id y la cantidad, de la tabla pedidos.", ["SELECT cliente_id, COUNT(*) FROM pedidos GROUP BY cliente_id;", "SELECT cliente_id, COUNT(*) AS cantidad FROM pedidos GROUP BY cliente_id;"],
      "COUNT(*) junto con GROUP BY por la columna del cliente.", "GROUP BY arma un grupo por cliente y COUNT(*) cuenta las filas de cada uno."],
    ["Subí un 10 % el precio del producto con id 7.", ["UPDATE productos SET precio = precio * 1.1 WHERE id = 7;", "UPDATE productos SET precio = precio * 1.10 WHERE id = 7;"],
      "UPDATE … SET la columna con una cuenta sobre sí misma, y WHERE para no tocar las demás filas.", "Sin WHERE, UPDATE cambia todas las filas de la tabla."],
    ["Traé clientes.nombre y pedidos.total uniendo pedidos con clientes por cliente_id (sin alias).", [
      "SELECT clientes.nombre, pedidos.total FROM pedidos JOIN clientes ON clientes.id = pedidos.cliente_id;",
      "SELECT clientes.nombre, pedidos.total FROM pedidos JOIN clientes ON pedidos.cliente_id = clientes.id;",
      "SELECT clientes.nombre, pedidos.total FROM pedidos INNER JOIN clientes ON clientes.id = pedidos.cliente_id;",
      "SELECT clientes.nombre, pedidos.total FROM pedidos INNER JOIN clientes ON pedidos.cliente_id = clientes.id;",
    ], "FROM pedidos JOIN clientes, y en ON la igualdad entre el id del cliente y la columna del pedido.", "JOIN (o INNER JOIN) devuelve solo los pedidos que tienen un cliente que coincide."],
    ["Borrá los pedidos con total igual a 0.", ["DELETE FROM pedidos WHERE total = 0;"],
      "DELETE FROM la tabla, con WHERE.", "Antes de un DELETE conviene correr el SELECT con el mismo WHERE para ver qué se va a borrar."],
  ],
  [
    ["Mostrá cada categoría de productos con su cantidad, solo las que tienen más de 5.", ["SELECT categoria, COUNT(*) FROM productos GROUP BY categoria HAVING COUNT(*) > 5;"],
      "WHERE filtra filas; para filtrar grupos hace falta otra palabra después del GROUP BY.", "HAVING filtra después de agrupar, con funciones como COUNT."],
    ["Creá el índice idx_pedidos_cliente sobre la columna cliente_id de pedidos.", ["CREATE INDEX idx_pedidos_cliente ON pedidos (cliente_id);"],
      "CREATE INDEX nombre ON tabla y la columna entre paréntesis.", "El índice acelera filtros y uniones por cliente_id."],
    ["Traé el nombre de los clientes sin ningún pedido, con LEFT JOIN (sin alias).", [
      "SELECT clientes.nombre FROM clientes LEFT JOIN pedidos ON pedidos.cliente_id = clientes.id WHERE pedidos.id IS NULL;",
      "SELECT clientes.nombre FROM clientes LEFT JOIN pedidos ON clientes.id = pedidos.cliente_id WHERE pedidos.id IS NULL;",
    ], "LEFT JOIN conserva todos los clientes; los que no tienen pedido quedan con las columnas de pedidos en NULL.", "Filtrar con IS NULL sobre pedidos.id deja solo los clientes sin pedidos."],
    ["Activá el control de claves foráneas en SQLite.", ["PRAGMA foreign_keys = ON;", "PRAGMA foreign_keys = 1;"],
      "Es una instrucción especial de SQLite que empieza con PRAGMA.", "SQLite no controla las claves foráneas si no se activa en cada conexión."],
  ],
]);

const python = topic("python", "Python", "code", [
  [
    ["Mostrá en pantalla el texto Hola mundo.", ['print("Hola mundo")'],
      "La función que imprime, con el texto entre comillas.", "print escribe en la salida estándar y agrega un salto de línea."],
    ["Guardá en n la cantidad de elementos de la lista numeros.", ["n = len(numeros)"],
      "Una función integrada de tres letras: length.", "len sirve para listas, textos, diccionarios y cualquier colección."],
    ["Agregá el valor 5 al final de la lista numeros.", ["numeros.append(5)"],
      "Un método de la lista que significa «añadir».", "append modifica la lista en el lugar y devuelve None."],
    ["Convertí el texto edad_txt a número entero y guardalo en edad.", ["edad = int(edad_txt)"],
      "El nombre del tipo entero se usa como función.", "int() falla con ValueError si el texto no es un número."],
  ],
  [
    ["Creá cuadrados con los cuadrados de 0 a 9, usando una comprensión de listas con x.", ["cuadrados = [x ** 2 for x in range(10)]", "cuadrados = [x * x for x in range(10)]"],
      "Entre corchetes: la expresión, for x in, y range hasta 10 (no incluido).", "range(10) va de 0 a 9; la comprensión arma la lista en una línea."],
    ["Escribí la primera línea de un for que recorra nombres con su índice i y cada nombre.", ["for i, nombre in enumerate(nombres):"],
      "Una función integrada que devuelve pares (índice, valor). No olvides los dos puntos.", "enumerate evita llevar un contador a mano."],
    ["Guardá en edad el valor de la clave «edad» del diccionario persona, o 0 si no existe.", ['edad = persona.get("edad", 0)'],
      "Un método del diccionario que acepta un valor por defecto.", "get no lanza KeyError: devuelve el valor por defecto."],
    ["Guardá en saludo el texto Hola, seguido de nombre, con una f-string.", ['saludo = f"Hola, {nombre}"'],
      "Una f antes de las comillas y la variable entre llaves.", "Las f-strings evalúan lo que está entre llaves."],
  ],
  [
    ["Guardá en ordenados la lista productos ordenada por p[\"precio\"], sin modificar la original (usá lambda p).", ['ordenados = sorted(productos, key=lambda p: p["precio"])'],
      "La función integrada que devuelve una lista nueva, con key y una lambda.", "sorted crea una lista nueva; list.sort() cambiaría la original."],
    ["Creá el diccionario por_id con cada u de usuarios, usando u[\"id\"] como clave.", ['por_id = {u["id"]: u for u in usuarios}'],
      "Una comprensión de diccionario: entre llaves, clave: valor for … in ….", "Así se indexa una lista para buscar por id sin recorrerla."],
    ["Ejecutá la corrutina main() con asyncio.", ["asyncio.run(main())"],
      "Una función de asyncio que arranca el bucle de eventos.", "asyncio.run crea el bucle, corre la corrutina y lo cierra."],
    ["Importá solo la clase Path del módulo pathlib.", ["from pathlib import Path"],
      "from módulo import nombre.", "Path maneja rutas sin pelear con / o \\ según el sistema."],
  ],
]);

const javascript = topic("javascript", "JavaScript", "code", [
  [
    ["Mostrá Hola mundo en la consola.", ['console.log("Hola mundo");'],
      "Un método del objeto console.", "console.log escribe en la consola del navegador o de Node."],
    ["Declará la constante total con el valor 0.", ["const total = 0;"],
      "La palabra para valores que no se reasignan.", "const no se puede reasignar; let sí."],
    ["Agregá 5 al final del array numeros.", ["numeros.push(5);"],
      "El método que «empuja» un elemento al final.", "push modifica el array y devuelve el nuevo largo."],
    ["Declará la constante largo con la cantidad de elementos de numeros.", ["const largo = numeros.length;"],
      "Es una propiedad, no un método: va sin paréntesis.", "length siempre es el último índice más uno."],
  ],
  [
    ["Declará dobles con cada número de numeros multiplicado por 2, con map y una arrow function de parámetro n.", ["const dobles = numeros.map((n) => n * 2);", "const dobles = numeros.map(n => n * 2);"],
      "map recibe una función: (n) => la cuenta.", "map devuelve un array nuevo del mismo largo."],
    ["Declará mayores con las personas de 18 años o más, con filter y parámetro p (cada una tiene edad).", ["const mayores = personas.filter((p) => p.edad >= 18);", "const mayores = personas.filter(p => p.edad >= 18);"],
      "filter se queda con los elementos para los que la función devuelve true.", "filter devuelve un array nuevo, posiblemente más corto."],
    ["Sacá nombre y edad del objeto persona con desestructuración, en constantes.", ["const { nombre, edad } = persona;", "const { edad, nombre } = persona;"],
      "Llaves a la izquierda del igual, con los nombres de las propiedades.", "La desestructuración crea una constante por cada propiedad."],
    ["Guardá en json el objeto datos convertido a texto JSON.", ["const json = JSON.stringify(datos);"],
      "Un método del objeto JSON que convierte a string.", "JSON.parse hace el camino inverso."],
  ],
  [
    ["Guardá en res la respuesta de pedir /api/tareas con fetch, esperándola con await.", ['const res = await fetch("/api/tareas");'],
      "await delante de la llamada que devuelve una promesa.", "fetch devuelve una promesa de Response; después falta res.json()."],
    ["Declará nuevo como copia de config con debug en true, usando spread.", ["const nuevo = { ...config, debug: true };"],
      "Tres puntos para copiar las propiedades y después la que cambia.", "Lo que va después del spread pisa lo que venía de config."],
    ["Guardá en ciudad la ciudad de la direccion de usuario, sin fallar si usuario o direccion no existen.", ["const ciudad = usuario?.direccion?.ciudad;"],
      "Encadenamiento opcional: un signo antes de cada punto que puede fallar.", "?. devuelve undefined en vez de lanzar un error."],
    ["Declará limite con opciones.limite, o 10 si es null o undefined.", ["const limite = opciones.limite ?? 10;"],
      "No es ||: es el operador que solo mira null y undefined.", "?? respeta 0 y \"\", que con || se reemplazarían por 10."],
  ],
]);

export const RECALL: RecallTopic[] = [git, linux, sql, python, javascript];

export const allExercises = () => RECALL.flatMap((t) => t.levels.flatMap((l) => l.exercises));

export const levelDone = (done: Record<string, number>, level: RecallLevel) => level.exercises.every((e) => done[e.id]);

/** Un nivel se abre al completar el anterior. */
export const levelOpen = (done: Record<string, number>, topic: RecallTopic, index: number) =>
  index === 0 || levelDone(done, topic.levels[index - 1]);

export const findRecall = (topicId: string) => RECALL.find((t) => t.id === topicId) ?? null;
