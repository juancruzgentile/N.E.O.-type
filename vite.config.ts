import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

// El build genera un único index.html autocontenido (JS, CSS y fuentes
// incrustados) que se abre con doble clic, sin servidor ni internet.
export default defineConfig({
  base: "./",
  plugins: [react(), viteSingleFile()],
  build: {
    assetsInlineLimit: 100_000_000,
    chunkSizeWarningLimit: 5_000,
  },
});
