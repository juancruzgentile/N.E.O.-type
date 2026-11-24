// Muestra qué ocupa lugar en la app, por zona y por archivo. Es una medida para comparar, no el build real.
// Uso: npm run peso
import { build } from "esbuild";

const { metafile } = await build({
  entryPoints: ["src/main.tsx"],
  bundle: true,
  minify: true,
  write: false,
  metafile: true,
  outdir: "peso",
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"' },
  loader: { ".woff": "dataurl", ".woff2": "dataurl" },
  logLevel: "error",
});

const zonaDe = (f) => {
  const pkg = f.match(/node_modules\/((?:@[^/]+\/)?[^/]+)/);
  if (pkg) return pkg[1].startsWith("@fontsource/") ? "fuentes" : pkg[1];
  if (f.startsWith("src/library/clases/")) return "library/clases";
  if (f.startsWith("src/library/fuentes/")) return "library/fuentes";
  return f.match(/^src\/([^/]+)\//)?.[1] ?? "otros";
};

const archivos = Object.values(metafile.outputs).flatMap((o) => Object.entries(o.inputs).map(([f, i]) => [f, i.bytesInOutput]));
const zonas = new Map();
for (const [f, b] of archivos) zonas.set(zonaDe(f), (zonas.get(zonaDe(f)) ?? 0) + b);
const total = archivos.reduce((n, [, b]) => n + b, 0);
const kb = (b) => `${(b / 1024).toFixed(0).padStart(6)} KB`;
const pct = (b) => `${((b / total) * 100).toFixed(1).padStart(5)} %`;

console.log(`Total: ${(total / 2 ** 20).toFixed(2)} MB\n\nPor zona:`);
for (const [z, b] of [...zonas].sort((x, y) => y[1] - x[1])) console.log(`${kb(b)} ${pct(b)}  ${z}`);
console.log("\nLos 12 archivos más pesados:");
for (const [f, b] of archivos.sort((x, y) => y[1] - x[1]).slice(0, 12)) console.log(`${kb(b)} ${pct(b)}  ${f}`);
