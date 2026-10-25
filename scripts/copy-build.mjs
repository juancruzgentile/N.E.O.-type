// Copia el build autocontenido a la raíz como NeonType.html (se abre con doble clic).
import { copyFileSync } from "node:fs";
copyFileSync("dist/index.html", "NeonType.html");
console.log("NeonType.html actualizado.");
