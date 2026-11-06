import type { Pregunta } from "../types";
import { python } from "./python";
import { javascript } from "./javascript";
import { typescript } from "./typescript";
import { java } from "./java";
import { csharp } from "./csharp";
import { go } from "./go";
import { rust } from "./rust";
import { c } from "./c";
import { cpp } from "./cpp";
import { swift } from "./swift";
import { kotlin } from "./kotlin";
import { php } from "./php";
import { sql } from "./sql";
import { html, css } from "./web";
import { linux, git } from "./herramientas";
import { algoritmos } from "./algoritmos";
import { conductual } from "./conductual";

/** Todas las preguntas. Los ids son area-NN en el orden de cada archivo: solo se agregan al final. */
export const BANCO: Pregunta[] = [...python, ...javascript, ...typescript, ...java, ...csharp, ...go, ...rust, ...c, ...cpp, ...swift, ...kotlin, ...php, ...sql, ...html, ...css, ...linux, ...git, ...algoritmos, ...conductual];
