import { type Field, L, camel, kebab, pascal, plural } from "../base";
import type { FullCtx, LangImpls } from "../concepts";

// PHP 8.3: clases con promoción de propiedades en el constructor, tipos en parámetros y retornos, funciones flecha
// fn() => y las funciones array_* de la biblioteca estándar. Variables y funciones en camelCase.
// Los nombres de función no distinguen mayúsculas: readFile chocaría con readfile(), por eso readTextFile.

const ty = (f: Field) => ({ int: "int", float: "float", str: "string", bool: "bool" })[f.t];

const names = (c: FullCtx) => ({
  E: pascal(c.ent.s),
  Ep: pascal(c.ent.p),
  v: camel(c.ent.s),
  vs: camel(c.ent.p),
  n: camel(c.num.n),
  N: pascal(c.num.n),
  NT: ty(c.num),
  s: camel(c.str.n),
  S: pascal(c.str.n),
  b: camel(c.flag.n),
  B: pascal(c.flag.n),
});

export const php: LangImpls = {
  sum: (c) => {
    const { E, v, vs, n, N, NT } = names(c);
    return [
      L(`function total${N}(array $${vs}): ${NT}`,
        `{`,
        `    return array_sum(array_map(fn(${E} $${v}) => $${v}->${n}, $${vs}));`,
        `}`),
      L(`function total${N}(array $${vs}): ${NT}`,
        `{`,
        `    $total = 0;`,
        `    foreach ($${vs} as $${v}) {`,
        `        $total += $${v}->${n};`,
        `    }`,
        `    return $total;`,
        `}`),
    ];
  },
  avg: (c) => {
    const { E, v, vs, n, N } = names(c);
    return L(`function average${N}(array $${vs}): float`,
      `{`,
      `    if (count($${vs}) === 0) {`,
      `        return 0.0;`,
      `    }`,
      `    return array_sum(array_map(fn(${E} $${v}) => $${v}->${n}, $${vs})) / count($${vs});`,
      `}`);
  },
  maxBy: (c) => {
    const { E, v, vs, n, N } = names(c);
    return L(`function ${v}WithMax${N}(array $${vs}): ?${E}`,
      `{`,
      `    $best = null;`,
      `    foreach ($${vs} as $${v}) {`,
      `        if ($best === null || $${v}->${n} > $best->${n}) {`,
      `            $best = $${v};`,
      `        }`,
      `    }`,
      `    return $best;`,
      `}`);
  },
  minBy: (c) => {
    const { E, v, vs, n, N } = names(c);
    return L(`function ${v}WithMin${N}(array $${vs}): ?${E}`,
      `{`,
      `    $best = null;`,
      `    foreach ($${vs} as $${v}) {`,
      `        if ($best === null || $${v}->${n} < $best->${n}) {`,
      `            $best = $${v};`,
      `        }`,
      `    }`,
      `    return $best;`,
      `}`);
  },
  filter: (c) => {
    const { E, Ep, v, vs, b } = names(c);
    return L(`function ${b}${Ep}(array $${vs}): array`,
      `{`,
      `    return array_values(array_filter($${vs}, fn(${E} $${v}) => $${v}->${b}));`,
      `}`);
  },
  count: (c) => {
    const { E, Ep, v, vs, b, B } = names(c);
    return L(`function count${B}${Ep}(array $${vs}): int`,
      `{`,
      `    return count(array_filter($${vs}, fn(${E} $${v}) => $${v}->${b}));`,
      `}`);
  },
  find: (c) => {
    const { E, v, vs, s, S } = names(c);
    return L(`function find${E}By${S}(array $${vs}, string $${s}): ?${E}`,
      `{`,
      `    foreach ($${vs} as $${v}) {`,
      `        if ($${v}->${s} === $${s}) {`,
      `            return $${v};`,
      `        }`,
      `    }`,
      `    return null;`,
      `}`);
  },
  map: (c) => {
    const { E, v, vs, s } = names(c);
    return [
      L(`function ${v}${pascal(plural(c.str.n))}(array $${vs}): array`,
        `{`,
        `    return array_map(fn(${E} $${v}) => $${v}->${s}, $${vs});`,
        `}`),
      L(`function ${v}${pascal(plural(c.str.n))}(array $${vs}): array`,
        `{`,
        `    return array_column($${vs}, '${s}');`,
        `}`),
    ];
  },
  sort: (c) => {
    const { E, Ep, vs, n, N } = names(c);
    return L(`function sort${Ep}By${N}(array $${vs}): array`,
      `{`,
      `    usort($${vs}, fn(${E} $a, ${E} $b) => $b->${n} <=> $a->${n});`,
      `    return $${vs};`,
      `}`);
  },
  any: (c) => {
    const { v, vs, n, N, NT } = names(c);
    return L(`function any${N}Above(array $${vs}, ${NT} $limit): bool`,
      `{`,
      `    foreach ($${vs} as $${v}) {`,
      `        if ($${v}->${n} > $limit) {`,
      `            return true;`,
      `        }`,
      `    }`,
      `    return false;`,
      `}`);
  },
  classDef: (c) => {
    const { E } = names(c);
    return L(`final class ${E}`,
      `{`,
      `    public function __construct(`,
      ...c.ent.fields.map((f) => `        public ${ty(f)} $${camel(f.n)},`),
      `    ) {`,
      `    }`,
      `}`);
  },
  validate: (c) => {
    const { E, v, n, N } = names(c);
    return L(`function validate${N}(${E} $${v}): void`,
      `{`,
      `    if ($${v}->${n} < 0) {`,
      `        throw new InvalidArgumentException('${n} cannot be negative');`,
      `    }`,
      `}`);
  },
  toggle: (c) => {
    const { E, v, b, B } = names(c);
    return L(`function toggle${B}(${E} $${v}): void`,
      `{`,
      `    $${v}->${b} = !$${v}->${b};`,
      `}`);
  },
  describe: (c) => {
    const { E, v, s, n } = names(c);
    return [
      L(`function describe(${E} $${v}): string`,
        `{`,
        `    return "${E}: {$${v}->${s}} ({$${v}->${n}})";`,
        `}`),
      L(`function describe(${E} $${v}): string`,
        `{`,
        `    return sprintf('${E}: %s (%s)', $${v}->${s}, $${v}->${n});`,
        `}`),
    ];
  },
  index: (c) => {
    const { Ep, vs, s, S } = names(c);
    return L(`function index${Ep}By${S}(array $${vs}): array`,
      `{`,
      `    return array_column($${vs}, null, '${s}');`,
      `}`);
  },
  topN: (c) => {
    const { E, Ep, vs, n, N } = names(c);
    return L(`function top${Ep}By${N}(array $${vs}, int $count = 3): array`,
      `{`,
      `    usort($${vs}, fn(${E} $a, ${E} $b) => $b->${n} <=> $a->${n});`,
      `    return array_slice($${vs}, 0, $count);`,
      `}`);
  },
  sumIf: (c) => {
    const { Ep, v, vs, n, N, NT, B, b } = names(c);
    return L(`function total${N}Of${B}${Ep}(array $${vs}): ${NT}`,
      `{`,
      `    $total = 0;`,
      `    foreach ($${vs} as $${v}) {`,
      `        if ($${v}->${b}) {`,
      `            $total += $${v}->${n};`,
      `        }`,
      `    }`,
      `    return $total;`,
      `}`);
  },
  page: (c) => {
    const { Ep, vs } = names(c);
    return L(`function paginate${Ep}(array $${vs}, int $page, int $size = 10): array`,
      `{`,
      `    return array_slice($${vs}, max(0, ($page - 1) * $size), $size);`,
      `}`);
  },
  fetch: (c) => {
    const { Ep } = names(c);
    return L(`function fetch${Ep}(): array`,
      `{`,
      `    $json = file_get_contents('https://api.example.com/${kebab(c.ent.p)}');`,
      `    if ($json === false) {`,
      `        throw new RuntimeException('Could not download ${kebab(c.ent.p)}');`,
      `    }`,
      `    return json_decode($json, true, flags: JSON_THROW_ON_ERROR);`,
      `}`);
  },
  partition: (c) => {
    const { Ep, v, vs, b, B } = names(c);
    return L(`function split${Ep}By${B}(array $${vs}): array`,
      `{`,
      `    $matching = [];`,
      `    $rest = [];`,
      `    foreach ($${vs} as $${v}) {`,
      `        if ($${v}->${b}) {`,
      `            $matching[] = $${v};`,
      `        } else {`,
      `            $rest[] = $${v};`,
      `        }`,
      `    }`,
      `    return [$matching, $rest];`,
      `}`);
  },
  increase: (c) => {
    const { E, v, n, N, NT } = names(c);
    return L(`function increase${N}(${E} $${v}, ${NT} $amount): void`,
      `{`,
      `    if ($amount <= 0) {`,
      `        throw new InvalidArgumentException('amount must be positive');`,
      `    }`,
      `    $${v}->${n} += $amount;`,
      `}`);
  },
  fibonacci: () => L(`function fibonacci(int $n): array`,
    `{`,
    `    $sequence = [0, 1];`,
    `    while (count($sequence) < $n) {`,
    `        $sequence[] = $sequence[count($sequence) - 1] + $sequence[count($sequence) - 2];`,
    `    }`,
    `    return array_slice($sequence, 0, $n);`,
    `}`),
  factorial: () => [
    L(`function factorial(int $n): int`,
      `{`,
      `    return $n <= 1 ? 1 : $n * factorial($n - 1);`,
      `}`),
    L(`function factorial(int $n): int`,
      `{`,
      `    return array_product(range(1, max($n, 1)));`,
      `}`),
  ],
  isPrime: () => L(`function isPrime(int $n): bool`,
    `{`,
    `    if ($n < 2) {`,
    `        return false;`,
    `    }`,
    `    for ($i = 2; $i * $i <= $n; $i++) {`,
    `        if ($n % $i === 0) {`,
    `            return false;`,
    `        }`,
    `    }`,
    `    return true;`,
    `}`),
  gcd: () => L(`function gcd(int $a, int $b): int`,
    `{`,
    `    return $b === 0 ? $a : gcd($b, $a % $b);`,
    `}`),
  reverse: () => L(`function reverse(string $text): string`,
    `{`,
    `    return implode('', array_reverse(mb_str_split($text)));`,
    `}`),
  palindrome: () => L(`function isPalindrome(string $word): bool`,
    `{`,
    `    $cleaned = str_replace(' ', '', strtolower($word));`,
    `    return $cleaned === strrev($cleaned);`,
    `}`),
  vowels: () => L(`function countVowels(string $text): int`,
    `{`,
    `    return preg_match_all('/[aeiou]/i', $text);`,
    `}`),
  fizzbuzz: () => L(`function fizzBuzz(int $n): void`,
    `{`,
    `    for ($i = 1; $i <= $n; $i++) {`,
    `        echo match (true) {`,
    `            $i % 15 === 0 => 'FizzBuzz',`,
    `            $i % 3 === 0 => 'Fizz',`,
    `            $i % 5 === 0 => 'Buzz',`,
    `            default => $i,`,
    `        }, PHP_EOL;`,
    `    }`,
    `}`),
  binarySearch: () => L(`function binarySearch(array $items, int $target): int`,
    `{`,
    `    $low = 0;`,
    `    $high = count($items) - 1;`,
    `    while ($low <= $high) {`,
    `        $mid = intdiv($low + $high, 2);`,
    `        if ($items[$mid] === $target) {`,
    `            return $mid;`,
    `        }`,
    `        if ($items[$mid] < $target) {`,
    `            $low = $mid + 1;`,
    `        } else {`,
    `            $high = $mid - 1;`,
    `        }`,
    `    }`,
    `    return -1;`,
    `}`),
  clamp: () => L(`function clampValue(float $value, float $min, float $max): float`,
    `{`,
    `    return max($min, min($max, $value));`,
    `}`),
  celsius: () => L(`function celsiusToFahrenheit(float $celsius): float`,
    `{`,
    `    return $celsius * 9 / 5 + 32;`,
    `}`),
  discount: () => L(`function applyDiscount(float $price, float $percent): float`,
    `{`,
    `    if ($percent < 0 || $percent > 100) {`,
    `        throw new InvalidArgumentException('percent must be between 0 and 100');`,
    `    }`,
    `    return round($price * (1 - $percent / 100), 2);`,
    `}`),
  maxValue: () => L(`function maxValue(array $numbers): int`,
    `{`,
    `    $largest = $numbers[0];`,
    `    foreach ($numbers as $number) {`,
    `        if ($number > $largest) {`,
    `            $largest = $number;`,
    `        }`,
    `    }`,
    `    return $largest;`,
    `}`),
  wordCount: () => L(`function wordFrequency(string $text): array`,
    `{`,
    `    return array_count_values(str_word_count(strtolower($text), 1));`,
    `}`),
  readFile: () => L(`function readTextFile(string $path): ?string`,
    `{`,
    `    $content = @file_get_contents($path);`,
    `    if ($content === false) {`,
    `        error_log("Could not read $path");`,
    `        return null;`,
    `    }`,
    `    return $content;`,
    `}`),
  enum: (c) => {
    const name = pascal({ w: c.enumSet.name });
    return L(`enum ${name}: string`,
      `{`,
      ...c.enumSet.values.map((v) => `    case ${pascal({ w: v })} = '${v.join("_")}';`),
      `}`);
  },
  shape: (c) => {
    const s = c.shape;
    const T = pascal({ w: [s.name] });
    const area = {
      circle: `M_PI * $this->radius ** 2`,
      rect: `$this->width * $this->height`,
      square: `$this->side ** 2`,
      triangle: `$this->base * $this->height / 2`,
    }[s.kind];
    return L(`final class ${T} implements Shape`,
      `{`,
      `    public function __construct(${s.params.map((p) => `private float $${p}`).join(", ")})`,
      `    {`,
      `    }`,
      ``,
      `    public function area(): float`,
      `    {`,
      `        return ${area};`,
      `    }`,
      `}`);
  },
  sumEven: () => L(`function sumEven(array $numbers): int`,
    `{`,
    `    return array_sum(array_filter($numbers, fn(int $n) => $n % 2 === 0));`,
    `}`),
  average: () => L(`function average(array $numbers): float`,
    `{`,
    `    return $numbers === [] ? 0.0 : array_sum($numbers) / count($numbers);`,
    `}`),
  capitalize: () => L(`function capitalizeWords(string $text): string`,
    `{`,
    `    return ucwords($text);`,
    `}`),
};

