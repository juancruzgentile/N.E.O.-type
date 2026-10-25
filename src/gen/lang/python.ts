import { type Field, L, kebab, pascal, snake, upper } from "../base";
import type { FullCtx, LangImpls } from "../concepts";

const ty = (f: Field) => ({ int: "int", float: "float", str: "str", bool: "bool" })[f.t];
const zero = (f: Field) => (f.t === "float" ? "0.0" : "0");

const names = (c: FullCtx) => ({
  E: pascal(c.ent.s),
  v: snake(c.ent.s),
  vs: snake(c.ent.p),
  N: snake(c.num.n),
  NT: ty(c.num),
  S: snake(c.str.n),
  B: snake(c.flag.n),
});

export const python: LangImpls = {
  sum: (c) => {
    const { E, v, vs, N, NT } = names(c);
    return [
      L(`def total_${N}(${vs}: list[${E}]) -> ${NT}:`,
        `    total = ${zero(c.num)}`,
        `    for ${v} in ${vs}:`,
        `        total += ${v}.${N}`,
        `    return total`),
      L(`def total_${N}(${vs}: list[${E}]) -> ${NT}:`,
        `    return sum(${v}.${N} for ${v} in ${vs})`),
    ];
  },
  avg: (c) => {
    const { E, v, vs, N } = names(c);
    return L(`def average_${N}(${vs}: list[${E}]) -> float:`,
      `    if not ${vs}:`,
      `        return 0.0`,
      `    return sum(${v}.${N} for ${v} in ${vs}) / len(${vs})`);
  },
  maxBy: (c) => {
    const { E, v, vs, N } = names(c);
    return L(`def ${v}_with_max_${N}(${vs}: list[${E}]) -> ${E} | None:`,
      `    if not ${vs}:`,
      `        return None`,
      `    return max(${vs}, key=lambda ${v}: ${v}.${N})`);
  },
  minBy: (c) => {
    const { E, v, vs, N } = names(c);
    return L(`def ${v}_with_min_${N}(${vs}: list[${E}]) -> ${E} | None:`,
      `    return min(${vs}, key=lambda ${v}: ${v}.${N}, default=None)`);
  },
  filter: (c) => {
    const { E, v, vs, B } = names(c);
    return [
      L(`def ${B}_${vs}(${vs}: list[${E}]) -> list[${E}]:`,
        `    return [${v} for ${v} in ${vs} if ${v}.${B}]`),
      L(`def ${B}_${vs}(${vs}: list[${E}]) -> list[${E}]:`,
        `    result = []`,
        `    for ${v} in ${vs}:`,
        `        if ${v}.${B}:`,
        `            result.append(${v})`,
        `    return result`),
    ];
  },
  count: (c) => {
    const { E, v, vs, B } = names(c);
    return L(`def count_${B}_${vs}(${vs}: list[${E}]) -> int:`,
      `    return sum(1 for ${v} in ${vs} if ${v}.${B})`);
  },
  find: (c) => {
    const { E, v, vs, S } = names(c);
    return [
      L(`def find_${v}_by_${S}(${vs}: list[${E}], ${S}: str) -> ${E} | None:`,
        `    for ${v} in ${vs}:`,
        `        if ${v}.${S} == ${S}:`,
        `            return ${v}`,
        `    return None`),
      L(`def find_${v}_by_${S}(${vs}: list[${E}], ${S}: str) -> ${E} | None:`,
        `    return next((${v} for ${v} in ${vs} if ${v}.${S} == ${S}), None)`),
    ];
  },
  map: (c) => {
    const { E, v, vs, S } = names(c);
    return L(`def collect_${S}(${vs}: list[${E}]) -> list[str]:`,
      `    return [${v}.${S} for ${v} in ${vs}]`);
  },
  sort: (c) => {
    const { E, v, vs, N } = names(c);
    return L(`def sort_by_${N}(${vs}: list[${E}]) -> list[${E}]:`,
      `    return sorted(${vs}, key=lambda ${v}: ${v}.${N}, reverse=True)`);
  },
  any: (c) => {
    const { E, v, vs, N, NT } = names(c);
    return L(`def any_${N}_above(${vs}: list[${E}], limit: ${NT}) -> bool:`,
      `    return any(${v}.${N} > limit for ${v} in ${vs})`);
  },
  classDef: (c) => {
    const { E } = names(c);
    const fields = c.ent.fields.map((f) => `    ${snake(f.n)}: ${ty(f)}`);
    const params = c.ent.fields.map((f) => `${snake(f.n)}: ${ty(f)}`).join(", ");
    const assigns = c.ent.fields.map((f) => `        self.${snake(f.n)} = ${snake(f.n)}`);
    return [
      L(`from dataclasses import dataclass`, ``, ``, `@dataclass`, `class ${E}:`, ...fields),
      L(`class ${E}:`, `    def __init__(self, ${params}) -> None:`, ...assigns),
    ];
  },
  validate: (c) => {
    const { E, v, N } = names(c);
    return [
      L(`def validate_${N}(${v}: ${E}) -> None:`,
        `    if ${v}.${N} < 0:`,
        `        raise ValueError(f"${N} cannot be negative: {${v}.${N}}")`),
      L(`def validate_${N}(${v}: ${E}) -> None:`,
        `    if ${v}.${N} < 0:`,
        `        raise ValueError("${N} cannot be negative")`),
    ];
  },
  toggle: (c) => {
    const { E, v, B } = names(c);
    return L(`def toggle_${B}(${v}: ${E}) -> ${E}:`,
      `    ${v}.${B} = not ${v}.${B}`,
      `    return ${v}`);
  },
  describe: (c) => {
    const { E, v, S, N } = names(c);
    return [
      L(`def describe_${v}(${v}: ${E}) -> str:`,
        `    return f"${E}(${S}={${v}.${S}}, ${N}={${v}.${N}})"`),
      L(`def describe_${v}(${v}: ${E}) -> str:`,
        `    return "${E}: " + ${v}.${S} + " (" + str(${v}.${N}) + ")"`),
    ];
  },
  index: (c) => {
    const { E, v, vs, S } = names(c);
    return L(`def index_by_${S}(${vs}: list[${E}]) -> dict[str, ${E}]:`,
      `    return {${v}.${S}: ${v} for ${v} in ${vs}}`);
  },
  topN: (c) => {
    const { E, v, vs, N } = names(c);
    return L(`def top_${vs}_by_${N}(${vs}: list[${E}], n: int = 3) -> list[${E}]:`,
      `    ranked = sorted(${vs}, key=lambda ${v}: ${v}.${N}, reverse=True)`,
      `    return ranked[:n]`);
  },
  sumIf: (c) => {
    const { E, v, vs, N, NT, B } = names(c);
    return L(`def total_${N}_of_${B}(${vs}: list[${E}]) -> ${NT}:`,
      `    return sum(${v}.${N} for ${v} in ${vs} if ${v}.${B})`);
  },
  page: (c) => {
    const { E, vs } = names(c);
    return L(`def paginate_${vs}(${vs}: list[${E}], page: int, size: int = 10) -> list[${E}]:`,
      `    start = (page - 1) * size`,
      `    return ${vs}[start:start + size]`);
  },
  fetch: (c) => {
    const { vs } = names(c);
    return L(`async def fetch_${vs}(client: httpx.AsyncClient) -> list[dict]:`,
      `    response = await client.get("/api/${kebab(c.ent.p)}")`,
      `    response.raise_for_status()`,
      `    return response.json()`);
  },
  partition: (c) => {
    const { E, v, vs, B } = names(c);
    return L(`def split_by_${B}(${vs}: list[${E}]) -> tuple[list[${E}], list[${E}]]:`,
      `    matching = [${v} for ${v} in ${vs} if ${v}.${B}]`,
      `    rest = [${v} for ${v} in ${vs} if not ${v}.${B}]`,
      `    return matching, rest`);
  },
  increase: (c) => {
    const { E, v, N, NT } = names(c);
    return L(`def increase_${N}(${v}: ${E}, amount: ${NT}) -> None:`,
      `    if amount <= 0:`,
      `        raise ValueError("amount must be positive")`,
      `    ${v}.${N} += amount`);
  },
  fibonacci: () => [
    L(`def fibonacci(n: int) -> list[int]:`,
      `    sequence = [0, 1]`,
      `    while len(sequence) < n:`,
      `        sequence.append(sequence[-1] + sequence[-2])`,
      `    return sequence[:n]`),
    L(`def fibonacci(n: int) -> list[int]:`,
      `    a, b = 0, 1`,
      `    result = []`,
      `    for _ in range(n):`,
      `        result.append(a)`,
      `        a, b = b, a + b`,
      `    return result`),
  ],
  factorial: () => [
    L(`def factorial(n: int) -> int:`,
      `    result = 1`,
      `    for i in range(2, n + 1):`,
      `        result *= i`,
      `    return result`),
    L(`def factorial(n: int) -> int:`,
      `    if n <= 1:`,
      `        return 1`,
      `    return n * factorial(n - 1)`),
  ],
  isPrime: () => L(`def is_prime(n: int) -> bool:`,
    `    if n < 2:`,
    `        return False`,
    `    for i in range(2, int(n ** 0.5) + 1):`,
    `        if n % i == 0:`,
    `            return False`,
    `    return True`),
  gcd: () => L(`def gcd(a: int, b: int) -> int:`,
    `    while b:`,
    `        a, b = b, a % b`,
    `    return a`),
  reverse: () => L(`def reverse_text(text: str) -> str:`, `    return text[::-1]`),
  palindrome: () => L(`def is_palindrome(word: str) -> bool:`,
    `    cleaned = word.lower().replace(" ", "")`,
    `    return cleaned == cleaned[::-1]`),
  vowels: () => L(`def count_vowels(text: str) -> int:`,
    `    return sum(1 for char in text.lower() if char in "aeiou")`),
  fizzbuzz: () => L(`def fizzbuzz(n: int) -> None:`,
    `    for i in range(1, n + 1):`,
    `        if i % 15 == 0:`,
    `            print("FizzBuzz")`,
    `        elif i % 3 == 0:`,
    `            print("Fizz")`,
    `        elif i % 5 == 0:`,
    `            print("Buzz")`,
    `        else:`,
    `            print(i)`),
  binarySearch: () => L(`def binary_search(items: list[int], target: int) -> int:`,
    `    low, high = 0, len(items) - 1`,
    `    while low <= high:`,
    `        mid = (low + high) // 2`,
    `        if items[mid] == target:`,
    `            return mid`,
    `        if items[mid] < target:`,
    `            low = mid + 1`,
    `        else:`,
    `            high = mid - 1`,
    `    return -1`),
  clamp: () => L(`def clamp(value: float, minimum: float, maximum: float) -> float:`,
    `    return max(minimum, min(value, maximum))`),
  celsius: () => L(`def celsius_to_fahrenheit(celsius: float) -> float:`,
    `    return celsius * 9 / 5 + 32`),
  discount: () => L(`def apply_discount(price: float, percent: float) -> float:`,
    `    if not 0 <= percent <= 100:`,
    `        raise ValueError("percent must be between 0 and 100")`,
    `    return round(price * (1 - percent / 100), 2)`),
  maxValue: () => L(`def max_value(numbers: list[int]) -> int:`,
    `    largest = numbers[0]`,
    `    for number in numbers[1:]:`,
    `        if number > largest:`,
    `            largest = number`,
    `    return largest`),
  wordCount: () => [
    L(`from collections import Counter`, ``, ``,
      `def word_frequency(text: str) -> dict[str, int]:`,
      `    return dict(Counter(text.lower().split()))`),
    L(`def word_frequency(text: str) -> dict[str, int]:`,
      `    counts: dict[str, int] = {}`,
      `    for word in text.lower().split():`,
      `        counts[word] = counts.get(word, 0) + 1`,
      `    return counts`),
  ],
  readFile: () => L(`def read_file(path: str) -> str | None:`,
    `    try:`,
    `        with open(path, encoding="utf-8") as file:`,
    `            return file.read()`,
    `    except FileNotFoundError:`,
    `        print(f"File not found: {path}")`,
    `        return None`),
  enum: (c) => {
    const name = pascal({ w: c.enumSet.name });
    return L(`from enum import Enum`, ``, ``, `class ${name}(Enum):`,
      ...c.enumSet.values.map((v) => `    ${upper({ w: v })} = "${snake({ w: v })}"`));
  },
  shape: (c) => {
    const s = c.shape;
    const cls = pascal({ w: [s.name] });
    const params = s.params.map((p) => `${p}: float`).join(", ");
    const area = {
      circle: `math.pi * self.radius ** 2`,
      rect: `self.width * self.height`,
      square: `self.side ** 2`,
      triangle: `self.base * self.height / 2`,
    }[s.kind];
    return L(`class ${cls}(Shape):`,
      `    def __init__(self, ${params}) -> None:`,
      ...s.params.map((p) => `        self.${p} = ${p}`),
      ``,
      `    def area(self) -> float:`,
      `        return ${area}`);
  },
  sumEven: () => L(`def sum_even(numbers: list[int]) -> int:`,
    `    return sum(n for n in numbers if n % 2 == 0)`),
  average: () => L(`def average(numbers: list[float]) -> float:`,
    `    return sum(numbers) / len(numbers) if numbers else 0.0`),
  capitalize: () => L(`def capitalize_words(text: str) -> str:`,
    `    return " ".join(word.capitalize() for word in text.split())`),
};
