// Tests de regresión del motor de sesiones (errores de la auditoría v1.4.0).
// Uso: npm run test:session
import { TypingSession } from "../src/engine/session";
import { MAX_IMPORT_BYTES, byteLength } from "../src/sanitize";

let failed = 0;
const ok = (cond: boolean, msg: string) => {
  if (!cond) failed++;
  console.log(`${cond ? "✓" : "✗"} ${msg}`);
};
const type = (s: TypingSession, keys: string, mode: "block" | "advance" | "strict") =>
  [...keys].map((ch, i) => s.input(ch, 1000 + i * 200, mode));

// error en el último carácter: cierra el texto pero no es "done" ni precisión perfecta
{
  const s = new TypingSession("abc");
  const res = type(s, "abX", "advance");
  ok(res[2] === "error" && s.done, "un error en el último carácter devuelve error y cierra el texto");
  ok(s.result().errors === 1 && s.result().acc < 1, "ese error cuenta en la precisión");
}

// texto correcto completo
{
  const s = new TypingSession("abc");
  const res = type(s, "abc", "block");
  ok(res[2] === "done" && s.result().errors === 0 && s.result().acc === 1, "texto correcto: done con 0 errores");
}

// sesión cortada con un fallo en la posición pendiente (modo bloqueante)
{
  const s = new TypingSession("abc");
  type(s, "abX", "block");
  s.stop(2000);
  const r = s.result();
  ok(r.chars === 2 && r.attempted === 3, "la posición pendiente no suma caracteres pero sí intentos");
  ok(r.errors === 1 && Math.abs(r.acc - 2 / 3) < 1e-9, "la precisión parcial incluye el fallo pendiente");
  ok(s.samples().some((x) => x.char === "c" && x.error), "las muestras incluyen el símbolo fallado");
}

// el límite de importación se mide en bytes, como File.size
ok(byteLength("ñ") === 2 && byteLength("a") === 1, "byteLength cuenta bytes UTF-8");
ok(MAX_IMPORT_BYTES === 5 * 1024 * 1024, "límite de importación de 5 MiB");

console.log(failed ? `\n${failed} test(s) fallaron` : "\nTodos los tests del motor pasaron");
process.exit(failed ? 1 : 0);
