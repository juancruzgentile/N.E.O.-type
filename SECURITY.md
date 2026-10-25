# Seguridad

## Reportar una vulnerabilidad

Si encontrás un problema de seguridad, **no abras un issue público**. Reportalo de forma privada desde la pestaña
**Security → Report a vulnerability** del repositorio. Voy a responder lo antes posible.

## Versiones con soporte

Solo la última versión publicada en `main` recibe correcciones.

## Modelo de seguridad

N.E.O.-type es una aplicación 100 % local: un único archivo HTML que corre en el navegador, sin servidor, sin cuentas
y sin telemetría.

**Privacidad**

- No hace ninguna conexión de red. La Content Security Policy del build lo impide (`connect-src 'none'`), así que
  ningún dato puede salir de tu equipo aunque una dependencia lo intentara.
- El progreso, el perfil y las canciones propias se guardan solo en tu navegador (`localStorage` e `IndexedDB`).
- Las fotos de perfil se recortan y se vuelven a codificar en el propio navegador: se descartan metadatos como la
  ubicación GPS.

**Protecciones en la aplicación**

- **Content Security Policy estricta** generada en el build: solo puede ejecutarse el script propio (verificado por
  hash SHA-256); se bloquean scripts inyectados, `eval`, recursos externos, formularios, iframes y workers.
- **Trusted Types** obligatorios: ninguna cadena de texto puede convertirse en HTML ejecutable.
- **Validación estricta de datos**: todo lo que entra (copias de seguridad importadas o datos guardados) se
  reconstruye con una lista blanca de campos, tipos y rangos. Se descartan claves desconocidas, `__proto__`,
  URLs externas y caracteres de control o de dirección de texto.
- **Límites de archivos**: copias de seguridad hasta 5 MB, imágenes hasta 10 MB (PNG, JPG, WebP o GIF), canciones
  hasta 40 MB y como máximo 50.
- Todo el texto se muestra escapado por React; no se usa `innerHTML` ni `eval` en el código del proyecto.

**Cadena de suministro**

- Pocas dependencias y todas con versión exacta, más un `package-lock.json` con hashes de integridad.
- `.npmrc` con `ignore-scripts=true`: las dependencias no ejecutan código al instalarse.
- CI con `npm ci`, `npm audit`, verificación de firmas de paquetes y tests de seguridad en cada cambio.
- Las GitHub Actions están fijadas por hash de commit y el token del workflow es de solo lectura.
- CodeQL analiza el código en cada cambio y una vez por semana.
- Dependabot propone actualizaciones con 7 días de espera, para no adoptar versiones recién publicadas.

## Recomendaciones para quien contribuya

- Activá la autenticación en dos pasos en GitHub (y en npm si publicás paquetes).
- No agregues dependencias sin necesidad. Si hace falta una, revisá su mantenimiento y su historial.
- Usá `npm ci`, no `npm install`, para respetar el lockfile.
