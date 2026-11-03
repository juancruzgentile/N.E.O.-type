import { type Field, L, camel, kebab, pascal, plural, upper } from "../base";
import type { FullCtx, LangImpls } from "../concepts";

// Kotlin 2: data classes, funciones en camelCase, funciones de una expresión con = y las operaciones de colección
// de la biblioteca estándar (sumOf, filter, maxByOrNull, partition…).

const ty = (f: Field) => ({ int: "Int", float: "Double", str: "String", bool: "Boolean" })[f.t];

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
  ss: camel(plural(c.str.n)),
  b: camel(c.flag.n),
  B: pascal(c.flag.n),
});

export const kotlin: LangImpls = {
  sum: (c) => {
    const { E, vs, n, N, NT } = names(c);
    return [
      L(`fun total${N}(${vs}: List<${E}>): ${NT} = ${vs}.sumOf { it.${n} }`),
      L(`fun total${N}(${vs}: List<${E}>): ${NT} {`,
        `    var total: ${NT} = 0${NT === "Double" ? ".0" : ""}`,
        `    for (item in ${vs}) {`,
        `        total += item.${n}`,
        `    }`,
        `    return total`,
        `}`),
    ];
  },
  avg: (c) => {
    const { E, vs, n, N } = names(c);
    return L(`fun average${N}(${vs}: List<${E}>): Double =`,
      `    if (${vs}.isEmpty()) 0.0 else ${vs}.map { it.${n}.toDouble() }.average()`);
  },
  maxBy: (c) => {
    const { E, v, vs, n, N } = names(c);
    return L(`fun ${v}WithMax${N}(${vs}: List<${E}>): ${E}? = ${vs}.maxByOrNull { it.${n} }`);
  },
  minBy: (c) => {
    const { E, v, vs, n, N } = names(c);
    return L(`fun ${v}WithMin${N}(${vs}: List<${E}>): ${E}? = ${vs}.minByOrNull { it.${n} }`);
  },
  filter: (c) => {
    const { E, Ep, vs, b, B } = names(c);
    return [
      L(`fun ${b}${Ep}(${vs}: List<${E}>): List<${E}> = ${vs}.filter { it.${b} }`),
      L(`fun only${B}(${vs}: List<${E}>): List<${E}> {`,
        `    val result = mutableListOf<${E}>()`,
        `    for (item in ${vs}) {`,
        `        if (item.${b}) {`,
        `            result.add(item)`,
        `        }`,
        `    }`,
        `    return result`,
        `}`),
    ];
  },
  count: (c) => {
    const { E, Ep, vs, b, B } = names(c);
    return L(`fun count${B}${Ep}(${vs}: List<${E}>): Int = ${vs}.count { it.${b} }`);
  },
  find: (c) => {
    const { E, vs, s, S } = names(c);
    return L(`fun find${E}By${S}(${vs}: List<${E}>, ${s}: String): ${E}? =`,
      `    ${vs}.find { it.${s} == ${s} }`);
  },
  map: (c) => {
    const { E, v, vs, s, ss } = names(c);
    return [
      L(`fun ${v}${pascal(plural(c.str.n))}(${vs}: List<${E}>): List<String> = ${vs}.map { it.${s} }`),
      L(`fun ${ss}Of(${vs}: List<${E}>): List<String> = ${vs}.map(${E}::${s})`),
    ];
  },
  sort: (c) => {
    const { E, Ep, vs, n, N } = names(c);
    return L(`fun sort${Ep}By${N}(${vs}: List<${E}>): List<${E}> =`,
      `    ${vs}.sortedByDescending { it.${n} }`);
  },
  any: (c) => {
    const { E, vs, n, N, NT } = names(c);
    return L(`fun any${N}Above(${vs}: List<${E}>, limit: ${NT}): Boolean =`,
      `    ${vs}.any { it.${n} > limit }`);
  },
  classDef: (c) => {
    const { E } = names(c);
    return L(`data class ${E}(`,
      ...c.ent.fields.map((f) => `    val ${camel(f.n)}: ${ty(f)},`),
      `)`);
  },
  validate: (c) => {
    const { E, v, n, N } = names(c);
    return [
      L(`fun validate${N}(${v}: ${E}) {`,
        `    require(${v}.${n} >= 0) { "${n} cannot be negative" }`,
        `}`),
      L(`fun validate${N}(${v}: ${E}) {`,
        `    if (${v}.${n} < 0) {`,
        `        throw IllegalArgumentException("${n} cannot be negative")`,
        `    }`,
        `}`),
    ];
  },
  toggle: (c) => {
    const { E, v, b, B } = names(c);
    return L(`fun toggle${B}(${v}: ${E}): ${E} = ${v}.copy(${b} = !${v}.${b})`);
  },
  describe: (c) => {
    const { E, v, s, n } = names(c);
    return [
      L(`fun describe(${v}: ${E}): String = "${E}: \${${v}.${s}} (\${${v}.${n}})"`),
      L(`fun ${E}.describe(): String = "${E}: $${s} ($${n})"`),
    ];
  },
  index: (c) => {
    const { E, Ep, vs, s, S } = names(c);
    return L(`fun index${Ep}By${S}(${vs}: List<${E}>): Map<String, ${E}> =`,
      `    ${vs}.associateBy { it.${s} }`);
  },
  topN: (c) => {
    const { E, Ep, vs, n, N } = names(c);
    return L(`fun top${Ep}By${N}(${vs}: List<${E}>, count: Int = 3): List<${E}> =`,
      `    ${vs}.sortedByDescending { it.${n} }.take(count)`);
  },
  sumIf: (c) => {
    const { E, Ep, vs, n, N, NT, b, B } = names(c);
    return L(`fun total${N}Of${B}${Ep}(${vs}: List<${E}>): ${NT} =`,
      `    ${vs}.filter { it.${b} }.sumOf { it.${n} }`);
  },
  page: (c) => {
    const { E, Ep, vs } = names(c);
    return L(`fun paginate${Ep}(${vs}: List<${E}>, page: Int, size: Int = 10): List<${E}> =`,
      `    ${vs}.drop(((page - 1) * size).coerceAtLeast(0)).take(size)`);
  },
  fetch: (c) => {
    const { Ep } = names(c);
    return L(`fun fetch${Ep}(client: HttpClient): String {`,
      `    val request = HttpRequest.newBuilder(URI.create("https://api.example.com/${kebab(c.ent.p)}")).build()`,
      `    val response = client.send(request, HttpResponse.BodyHandlers.ofString())`,
      `    check(response.statusCode() == 200) { "HTTP \${response.statusCode()}" }`,
      `    return response.body()`,
      `}`);
  },
  partition: (c) => {
    const { E, Ep, vs, b, B } = names(c);
    return L(`fun split${Ep}By${B}(${vs}: List<${E}>): Pair<List<${E}>, List<${E}>> =`,
      `    ${vs}.partition { it.${b} }`);
  },
  increase: (c) => {
    const { E, v, n, N, NT } = names(c);
    return L(`fun increase${N}(${v}: ${E}, amount: ${NT}): ${E} {`,
      `    require(amount > 0) { "amount must be positive" }`,
      `    return ${v}.copy(${n} = ${v}.${n} + amount)`,
      `}`);
  },
  fibonacci: () => L(`fun fibonacci(n: Int): List<Long> {`,
    `    val sequence = mutableListOf(0L, 1L)`,
    `    while (sequence.size < n) {`,
    `        sequence.add(sequence[sequence.size - 1] + sequence[sequence.size - 2])`,
    `    }`,
    `    return sequence.take(n)`,
    `}`),
  factorial: () => [
    L(`fun factorial(n: Int): Long = if (n <= 1) 1 else n * factorial(n - 1)`),
    L(`fun factorial(n: Int): Long = (1..n).fold(1L) { acc, i -> acc * i }`),
  ],
  isPrime: () => L(`fun isPrime(n: Int): Boolean {`,
    `    if (n < 2) return false`,
    `    var i = 2`,
    `    while (i * i <= n) {`,
    `        if (n % i == 0) return false`,
    `        i++`,
    `    }`,
    `    return true`,
    `}`),
  gcd: () => L(`tailrec fun gcd(a: Int, b: Int): Int = if (b == 0) a else gcd(b, a % b)`),
  reverse: () => L(`fun reverse(text: String): String = text.reversed()`),
  palindrome: () => L(`fun isPalindrome(word: String): Boolean {`,
    `    val cleaned = word.lowercase().filterNot { it.isWhitespace() }`,
    `    return cleaned == cleaned.reversed()`,
    `}`),
  vowels: () => L(`fun countVowels(text: String): Int = text.lowercase().count { it in "aeiou" }`),
  fizzbuzz: () => L(`fun fizzBuzz(n: Int) {`,
    `    for (i in 1..n) {`,
    `        val output = when {`,
    `            i % 15 == 0 -> "FizzBuzz"`,
    `            i % 3 == 0 -> "Fizz"`,
    `            i % 5 == 0 -> "Buzz"`,
    `            else -> i.toString()`,
    `        }`,
    `        println(output)`,
    `    }`,
    `}`),
  binarySearch: () => [
    L(`fun binarySearch(items: List<Int>, target: Int): Int {`,
      `    var low = 0`,
      `    var high = items.size - 1`,
      `    while (low <= high) {`,
      `        val mid = low + (high - low) / 2`,
      `        when {`,
      `            items[mid] == target -> return mid`,
      `            items[mid] < target -> low = mid + 1`,
      `            else -> high = mid - 1`,
      `        }`,
      `    }`,
      `    return -1`,
      `}`),
    L(`fun contains(items: List<Int>, target: Int): Boolean = items.binarySearch(target) >= 0`),
  ],
  clamp: () => L(`fun clamp(value: Double, min: Double, max: Double): Double = value.coerceIn(min, max)`),
  celsius: () => L(`fun celsiusToFahrenheit(celsius: Double): Double = celsius * 9 / 5 + 32`),
  discount: () => L(`fun applyDiscount(price: Double, percent: Double): Double {`,
    `    require(percent in 0.0..100.0) { "percent must be between 0 and 100" }`,
    `    return price * (1 - percent / 100)`,
    `}`),
  maxValue: () => L(`fun maxValue(numbers: List<Int>): Int {`,
    `    var largest = numbers.first()`,
    `    for (number in numbers) {`,
    `        if (number > largest) largest = number`,
    `    }`,
    `    return largest`,
    `}`),
  wordCount: () => L(`fun wordFrequency(text: String): Map<String, Int> =`,
    `    text.lowercase()`,
    `        .split(" ")`,
    `        .filter { it.isNotBlank() }`,
    `        .groupingBy { it }`,
    `        .eachCount()`),
  readFile: () => L(`fun readFile(path: String): String? =`,
    `    try {`,
    `        File(path).readText()`,
    `    } catch (e: IOException) {`,
    `        System.err.println("Could not read $path: \${e.message}")`,
    `        null`,
    `    }`),
  enum: (c) => {
    const name = pascal({ w: c.enumSet.name });
    return L(`enum class ${name} {`,
      `    ${c.enumSet.values.map((v) => upper({ w: v })).join(", ")},`,
      `}`);
  },
  shape: (c) => {
    const s = c.shape;
    const T = pascal({ w: [s.name] });
    const area = {
      circle: `PI * radius * radius`,
      rect: `width * height`,
      square: `side * side`,
      triangle: `base * height / 2`,
    }[s.kind];
    return L(`class ${T}(${s.params.map((p) => `val ${p}: Double`).join(", ")}) : Shape {`,
      `    override fun area(): Double = ${area}`,
      `}`);
  },
  sumEven: () => L(`fun sumEven(numbers: List<Int>): Int = numbers.filter { it % 2 == 0 }.sum()`),
  average: () => L(`fun average(numbers: List<Double>): Double = if (numbers.isEmpty()) 0.0 else numbers.average()`),
  capitalize: () => L(`fun capitalizeWords(text: String): String =`,
    `    text.split(" ").joinToString(" ") { word -> word.replaceFirstChar { it.uppercase() } }`),
};
