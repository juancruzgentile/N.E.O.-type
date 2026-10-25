import { type Field, L, camel, kebab, pascal, plural, upper } from "../base";
import type { FullCtx, LangImpls } from "../concepts";

const tsType = (f: Field) => ({ int: "number", float: "number", str: "string", bool: "boolean" })[f.t];

function make(ts: boolean): LangImpls {
  /** anotación de tipo sólo en TS */
  const a = (t: string) => (ts ? `: ${t}` : "");
  const names = (c: FullCtx) => {
    const E = pascal(c.ent.s);
    return {
      E,
      Ep: pascal(c.ent.p),
      v: camel(c.ent.s),
      vs: camel(c.ent.p),
      N: camel(c.num.n),
      Np: pascal(c.num.n),
      S: camel(c.str.n),
      Sp: pascal(c.str.n),
      Ss: pascal(plural(c.str.n)),
      B: camel(c.flag.n),
      Bp: pascal(c.flag.n),
      arr: ts ? `: ${E}[]` : "",
    };
  };

  return {
    sum: (c) => {
      const { vs, v, N, Np, arr } = names(c);
      return [
        L(`function total${Np}(${vs}${arr})${a("number")} {`,
          `  let total = 0;`,
          `  for (const ${v} of ${vs}) {`,
          `    total += ${v}.${N};`,
          `  }`,
          `  return total;`,
          `}`),
        L(`const total${Np} = (${vs}${arr})${a("number")} =>`,
          `  ${vs}.reduce((sum, ${v}) => sum + ${v}.${N}, 0);`),
      ];
    },
    avg: (c) => {
      const { vs, v, N, Np, arr } = names(c);
      return L(`function average${Np}(${vs}${arr})${a("number")} {`,
        `  if (${vs}.length === 0) return 0;`,
        `  const sum = ${vs}.reduce((acc, ${v}) => acc + ${v}.${N}, 0);`,
        `  return sum / ${vs}.length;`,
        `}`);
    },
    maxBy: (c) => {
      const { E, vs, v, N, Np, arr } = names(c);
      return L(`function find${E}WithMax${Np}(${vs}${arr})${a(`${E} | undefined`)} {`,
        `  if (${vs}.length === 0) return undefined;`,
        `  return ${vs}.reduce((best, ${v}) => (${v}.${N} > best.${N} ? ${v} : best));`,
        `}`);
    },
    minBy: (c) => {
      const { E, vs, v, N, Np, arr } = names(c);
      return L(`function find${E}WithMin${Np}(${vs}${arr})${a(`${E} | undefined`)} {`,
        `  let best${a(`${E} | undefined`)};`,
        `  for (const ${v} of ${vs}) {`,
        `    if (!best || ${v}.${N} < best.${N}) {`,
        `      best = ${v};`,
        `    }`,
        `  }`,
        `  return best;`,
        `}`);
    },
    filter: (c) => {
      const { E, Ep, vs, v, B, Bp, arr } = names(c);
      return [
        L(`const get${Bp}${Ep} = (${vs}${arr})${a(`${E}[]`)} =>`,
          `  ${vs}.filter((${v}) => ${v}.${B});`),
        L(`function get${Bp}${Ep}(${vs}${arr})${a(`${E}[]`)} {`,
          `  return ${vs}.filter((${v}) => ${v}.${B});`,
          `}`),
      ];
    },
    count: (c) => {
      const { Ep, vs, v, B, Bp, arr } = names(c);
      return L(`function count${Bp}${Ep}(${vs}${arr})${a("number")} {`,
        `  return ${vs}.filter((${v}) => ${v}.${B}).length;`,
        `}`);
    },
    find: (c) => {
      const { E, vs, v, S, Sp, arr } = names(c);
      return [
        L(`const find${E}By${Sp} = (${vs}${arr}, ${S}${a("string")})${a(`${E} | undefined`)} =>`,
          `  ${vs}.find((${v}) => ${v}.${S} === ${S});`),
        L(`function find${E}By${Sp}(${vs}${arr}, ${S}${a("string")})${a(`${E} | null`)} {`,
          `  for (const ${v} of ${vs}) {`,
          `    if (${v}.${S} === ${S}) {`,
          `      return ${v};`,
          `    }`,
          `  }`,
          `  return null;`,
          `}`),
      ];
    },
    map: (c) => {
      const { E, vs, v, S, Ss, arr } = names(c);
      return L(`const get${E}${Ss} = (${vs}${arr})${a("string[]")} =>`,
        `  ${vs}.map((${v}) => ${v}.${S});`);
    },
    sort: (c) => {
      const { E, Ep, vs, N, Np, arr } = names(c);
      return [
        L(`function sort${Ep}By${Np}(${vs}${arr})${a(`${E}[]`)} {`,
          `  return [...${vs}].sort((a, b) => b.${N} - a.${N});`,
          `}`),
        L(`const sort${Ep}By${Np} = (${vs}${arr})${a(`${E}[]`)} =>`,
          `  ${vs}.toSorted((a, b) => b.${N} - a.${N});`),
      ];
    },
    any: (c) => {
      const { vs, v, N, Np, arr } = names(c);
      return L(`function any${Np}Above(${vs}${arr}, limit${a("number")})${a("boolean")} {`,
        `  return ${vs}.some((${v}) => ${v}.${N} > limit);`,
        `}`);
    },
    classDef: (c) => {
      const { E } = names(c);
      const fields = c.ent.fields;
      if (ts) {
        return [
          L(`interface ${E} {`, ...fields.map((f) => `  ${camel(f.n)}: ${tsType(f)};`), `}`),
          L(`type ${E} = {`, ...fields.map((f) => `  readonly ${camel(f.n)}: ${tsType(f)};`), `};`),
          L(`class ${E} {`,
            `  constructor(`,
            ...fields.map((f) => `    public ${camel(f.n)}: ${tsType(f)},`),
            `  ) {}`,
            `}`),
        ];
      }
      const params = fields.map((f) => camel(f.n)).join(", ");
      return L(`class ${E} {`,
        `  constructor(${params}) {`,
        ...fields.map((f) => `    this.${camel(f.n)} = ${camel(f.n)};`),
        `  }`,
        `}`);
    },
    validate: (c) => {
      const { E, v, N, Np } = names(c);
      return [
        L(`function validate${Np}(${v}${a(E)})${a("void")} {`,
          `  if (${v}.${N} < 0) {`,
          `    throw new RangeError(\`${N} cannot be negative: \${${v}.${N}}\`);`,
          `  }`,
          `}`),
        L(`function validate${Np}(${v}${a(E)})${a("void")} {`,
          `  if (${v}.${N} < 0) {`,
          `    throw new RangeError("${N} cannot be negative");`,
          `  }`,
          `}`),
      ];
    },
    toggle: (c) => {
      const { E, v, B, Bp } = names(c);
      return L(`function toggle${Bp}(${v}${a(E)})${a(E)} {`,
        `  return { ...${v}, ${B}: !${v}.${B} };`,
        `}`);
    },
    describe: (c) => {
      const { E, v, S, N } = names(c);
      return [
        L(`const describe${E} = (${v}${a(E)})${a("string")} =>`,
          `  \`${E}: \${${v}.${S}} (\${${v}.${N}})\`;`),
        L(`function describe${E}(${v}${a(E)})${a("string")} {`,
          `  return "${E}: " + ${v}.${S} + " (" + ${v}.${N} + ")";`,
          `}`),
      ];
    },
    index: (c) => {
      const { E, Ep, vs, v, S, Sp, arr } = names(c);
      return [
        L(`function index${Ep}By${Sp}(${vs}${arr})${a(`Map<string, ${E}>`)} {`,
          `  return new Map(${vs}.map((${v}) => [${v}.${S}, ${v}]));`,
          `}`),
        L(`function index${Ep}By${Sp}(${vs}${arr})${a(`Record<string, ${E}>`)} {`,
          `  const index${a(`Record<string, ${E}>`)} = {};`,
          `  for (const ${v} of ${vs}) {`,
          `    index[${v}.${S}] = ${v};`,
          `  }`,
          `  return index;`,
          `}`),
      ];
    },
    topN: (c) => {
      const { E, Ep, vs, N, Np, arr } = names(c);
      return L(`function top${Ep}By${Np}(${vs}${arr}, n = 3)${a(`${E}[]`)} {`,
        `  return [...${vs}].sort((a, b) => b.${N} - a.${N}).slice(0, n);`,
        `}`);
    },
    sumIf: (c) => {
      const { Ep, vs, v, N, Np, Bp, B, arr } = names(c);
      return L(`function total${Np}Of${Bp}${Ep}(${vs}${arr})${a("number")} {`,
        `  return ${vs}`,
        `    .filter((${v}) => ${v}.${B})`,
        `    .reduce((sum, ${v}) => sum + ${v}.${N}, 0);`,
        `}`);
    },
    page: (c) => {
      const { E, Ep, vs, arr } = names(c);
      return L(`function paginate${Ep}(${vs}${arr}, page${a("number")}, size = 10)${a(`${E}[]`)} {`,
        `  const start = (page - 1) * size;`,
        `  return ${vs}.slice(start, start + size);`,
        `}`);
    },
    fetch: (c) => {
      const { E, Ep } = names(c);
      const url = `/api/${kebab(c.ent.p)}`;
      return [
        L(`async function fetch${Ep}()${a(`Promise<${E}[]>`)} {`,
          `  const response = await fetch("${url}");`,
          `  if (!response.ok) {`,
          `    throw new Error(\`Request failed: \${response.status}\`);`,
          `  }`,
          `  return response.json();`,
          `}`),
        L(`async function fetch${Ep}()${a(`Promise<${E}[]>`)} {`,
          `  const response = await fetch("${url}");`,
          `  if (!response.ok) {`,
          `    throw new Error("Request failed: " + response.status);`,
          `  }`,
          `  return response.json();`,
          `}`),
      ];
    },
    partition: (c) => {
      const { E, Ep, vs, v, B, Bp, arr } = names(c);
      return L(`function split${Ep}By${Bp}(${vs}${arr})${a(`[${E}[], ${E}[]]`)} {`,
        `  const matching = ${vs}.filter((${v}) => ${v}.${B});`,
        `  const rest = ${vs}.filter((${v}) => !${v}.${B});`,
        `  return [matching, rest];`,
        `}`);
    },
    increase: (c) => {
      const { E, v, N, Np } = names(c);
      return L(`function increase${Np}(${v}${a(E)}, amount${a("number")})${a(E)} {`,
        `  if (amount <= 0) {`,
        `    throw new Error("amount must be positive");`,
        `  }`,
        `  return { ...${v}, ${N}: ${v}.${N} + amount };`,
        `}`);
    },
    fibonacci: () => L(`function fibonacci(n${a("number")})${a("number[]")} {`,
      `  const sequence = [0, 1];`,
      `  while (sequence.length < n) {`,
      `    sequence.push(sequence.at(-1)${ts ? "!" : ""} + sequence.at(-2)${ts ? "!" : ""});`,
      `  }`,
      `  return sequence.slice(0, n);`,
      `}`),
    factorial: () => [
      L(`function factorial(n${a("number")})${a("number")} {`,
        `  let result = 1;`,
        `  for (let i = 2; i <= n; i++) {`,
        `    result *= i;`,
        `  }`,
        `  return result;`,
        `}`),
      L(`const factorial = (n${a("number")})${a("number")} => (n <= 1 ? 1 : n * factorial(n - 1));`),
    ],
    isPrime: () => L(`function isPrime(n${a("number")})${a("boolean")} {`,
      `  if (n < 2) return false;`,
      `  for (let i = 2; i * i <= n; i++) {`,
      `    if (n % i === 0) return false;`,
      `  }`,
      `  return true;`,
      `}`),
    gcd: () => [
      L(`function gcd(a${a("number")}, b${a("number")})${a("number")} {`,
        `  while (b !== 0) {`,
        `    [a, b] = [b, a % b];`,
        `  }`,
        `  return a;`,
        `}`),
      L(`const gcd = (a${a("number")}, b${a("number")})${a("number")} => (b === 0 ? a : gcd(b, a % b));`),
    ],
    reverse: () => L(`const reverseText = (text${a("string")})${a("string")} => [...text].reverse().join("");`),
    palindrome: () => L(`function isPalindrome(word${a("string")})${a("boolean")} {`,
      `  const cleaned = word.toLowerCase().replaceAll(" ", "");`,
      `  return cleaned === [...cleaned].reverse().join("");`,
      `}`),
    vowels: () => L(`function countVowels(text${a("string")})${a("number")} {`,
      `  return [...text.toLowerCase()].filter((ch) => "aeiou".includes(ch)).length;`,
      `}`),
    fizzbuzz: () => L(`function fizzBuzz(n${a("number")})${a("void")} {`,
      `  for (let i = 1; i <= n; i++) {`,
      `    if (i % 15 === 0) console.log("FizzBuzz");`,
      `    else if (i % 3 === 0) console.log("Fizz");`,
      `    else if (i % 5 === 0) console.log("Buzz");`,
      `    else console.log(i);`,
      `  }`,
      `}`),
    binarySearch: () => L(`function binarySearch(items${a("number[]")}, target${a("number")})${a("number")} {`,
      `  let low = 0;`,
      `  let high = items.length - 1;`,
      `  while (low <= high) {`,
      `    const mid = Math.floor((low + high) / 2);`,
      `    if (items[mid] === target) return mid;`,
      `    if (items[mid] < target) low = mid + 1;`,
      `    else high = mid - 1;`,
      `  }`,
      `  return -1;`,
      `}`),
    clamp: () => L(`const clamp = (value${a("number")}, min${a("number")}, max${a("number")})${a("number")} =>`,
      `  Math.min(Math.max(value, min), max);`),
    celsius: () => L(`const celsiusToFahrenheit = (celsius${a("number")})${a("number")} => (celsius * 9) / 5 + 32;`),
    discount: () => L(`function applyDiscount(price${a("number")}, percent${a("number")})${a("number")} {`,
      `  if (percent < 0 || percent > 100) {`,
      `    throw new RangeError("percent must be between 0 and 100");`,
      `  }`,
      `  return Math.round(price * (100 - percent)) / 100;`,
      `}`),
    maxValue: () => L(`function maxValue(numbers${a("number[]")})${a("number")} {`,
      `  let largest = numbers[0];`,
      `  for (const number of numbers) {`,
      `    if (number > largest) largest = number;`,
      `  }`,
      `  return largest;`,
      `}`),
    wordCount: () => L(`function wordFrequency(text${a("string")})${a("Map<string, number>")} {`,
      `  const counts = new Map${ts ? "<string, number>" : ""}();`,
      `  for (const word of text.toLowerCase().split(" ")) {`,
      `    counts.set(word, (counts.get(word) ?? 0) + 1);`,
      `  }`,
      `  return counts;`,
      `}`),
    readFile: () => [
      L(`import { readFile } from "node:fs/promises";`,
        ``,
        `async function readText(path${a("string")})${a("Promise<string | null>")} {`,
        `  try {`,
        `    return await readFile(path, "utf8");`,
        `  } catch (error) {`,
        `    console.error(\`Could not read \${path}\`, error);`,
        `    return null;`,
        `  }`,
        `}`),
      L(`import { readFile } from "node:fs/promises";`,
        ``,
        `async function readText(path${a("string")})${a("Promise<string | null>")} {`,
        `  try {`,
        `    return await readFile(path, "utf8");`,
        `  } catch (error) {`,
        `    console.error("Could not read " + path, error);`,
        `    return null;`,
        `  }`,
        `}`),
    ],
    enum: (c) => {
      const name = pascal({ w: c.enumSet.name });
      const vals = c.enumSet.values;
      if (ts) {
        return [
          L(`enum ${name} {`, ...vals.map((v) => `  ${pascal({ w: v })} = "${upper({ w: v })}",`), `}`),
          L(`type ${name} = ${vals.map((v) => `"${camel({ w: v })}"`).join(" | ")};`),
        ];
      }
      return L(`const ${name} = Object.freeze({`, ...vals.map((v) => `  ${upper({ w: v })}: "${camel({ w: v })}",`), `});`);
    },
    shape: (c) => {
      const s = c.shape;
      const cls = pascal({ w: [s.name] });
      const area = {
        circle: `Math.PI * this.radius ** 2`,
        rect: `this.width * this.height`,
        square: `this.side ** 2`,
        triangle: `(this.base * this.height) / 2`,
      }[s.kind];
      if (ts) {
        return L(`class ${cls} implements Shape {`,
          `  constructor(${s.params.map((p) => `private readonly ${p}: number`).join(", ")}) {}`,
          ``,
          `  area(): number {`,
          `    return ${area};`,
          `  }`,
          `}`);
      }
      return L(`class ${cls} {`,
        `  constructor(${s.params.join(", ")}) {`,
        ...s.params.map((p) => `    this.${p} = ${p};`),
        `  }`,
        ``,
        `  area() {`,
        `    return ${area};`,
        `  }`,
        `}`);
    },
    sumEven: () => L(`const sumEven = (numbers${a("number[]")})${a("number")} =>`,
      `  numbers.filter((n) => n % 2 === 0).reduce((sum, n) => sum + n, 0);`),
    average: () => L(`function average(numbers${a("number[]")})${a("number")} {`,
      `  if (numbers.length === 0) return 0;`,
      `  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;`,
      `}`),
    capitalize: () => L(`const capitalizeWords = (text${a("string")})${a("string")} =>`,
      `  text`,
      `    .split(" ")`,
      `    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))`,
      `    .join(" ");`),
  };
}

export const javascript = make(false);
export const typescript = make(true);
