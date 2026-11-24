// Regenera el catálogo liviano de la Biblioteca. Uso: npm run catalogo
import { writeFileSync } from "node:fs";
import { textoCatalogo } from "./catalogo-texto";

writeFileSync("src/library/catalogo.gen.ts", textoCatalogo());
console.log("src/library/catalogo.gen.ts actualizado.");
