import { type Field, L, camel, kebab, pascal, plural } from "../base";
import type { FullCtx, LangImpls } from "../concepts";

// Swift 6: structs con let/var, funciones y propiedades en camelCase, closures con $0 y los métodos de colección
// (reduce, filter, map, sorted, max).

const ty = (f: Field) => ({ int: "Int", float: "Double", str: "String", bool: "Bool" })[f.t];

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

export const swift: LangImpls = {
  sum: (c) => {
    const { E, vs, n, N, NT } = names(c);
    return [
      L(`func total${N}(_ ${vs}: [${E}]) -> ${NT} {`,
        `    ${vs}.reduce(0) { $0 + $1.${n} }`,
        `}`),
      L(`func total${N}(_ ${vs}: [${E}]) -> ${NT} {`,
        `    var total: ${NT} = 0`,
        `    for item in ${vs} {`,
        `        total += item.${n}`,
        `    }`,
        `    return total`,
        `}`),
    ];
  },
  avg: (c) => {
    const { E, vs, n, N } = names(c);
    return L(`func average${N}(_ ${vs}: [${E}]) -> Double {`,
      `    guard !${vs}.isEmpty else { return 0 }`,
      `    let total = ${vs}.reduce(0.0) { $0 + Double($1.${n}) }`,
      `    return total / Double(${vs}.count)`,
      `}`);
  },
  maxBy: (c) => {
    const { E, vs, n, N } = names(c);
    return L(`func ${camel(c.ent.s)}WithMax${N}(_ ${vs}: [${E}]) -> ${E}? {`,
      `    ${vs}.max { $0.${n} < $1.${n} }`,
      `}`);
  },
  minBy: (c) => {
    const { E, vs, n, N } = names(c);
    return L(`func ${camel(c.ent.s)}WithMin${N}(_ ${vs}: [${E}]) -> ${E}? {`,
      `    ${vs}.min { $0.${n} < $1.${n} }`,
      `}`);
  },
  filter: (c) => {
    const { E, Ep, vs, b, B } = names(c);
    return [
      L(`func ${b}${Ep}(_ ${vs}: [${E}]) -> [${E}] {`,
        `    ${vs}.filter { $0.${b} }`,
        `}`),
      L(`func ${b}${Ep}(_ ${vs}: [${E}]) -> [${E}] {`,
        `    ${vs}.filter(\\.${b})`,
        `}`),
      L(`func only${B}(_ ${vs}: [${E}]) -> [${E}] {`,
        `    var result: [${E}] = []`,
        `    for item in ${vs} where item.${b} {`,
        `        result.append(item)`,
        `    }`,
        `    return result`,
        `}`),
    ];
  },
  count: (c) => {
    const { E, Ep, vs, b, B } = names(c);
    return L(`func count${B}${Ep}(_ ${vs}: [${E}]) -> Int {`,
      `    ${vs}.filter { $0.${b} }.count`,
      `}`);
  },
  find: (c) => {
    const { E, vs, s, S } = names(c);
    return L(`func find${E}(by${S} ${s}: String, in ${vs}: [${E}]) -> ${E}? {`,
      `    ${vs}.first { $0.${s} == ${s} }`,
      `}`);
  },
  map: (c) => {
    const { E, vs, s, ss } = names(c);
    return [
      L(`func ${ss}(of ${vs}: [${E}]) -> [String] {`,
        `    ${vs}.map { $0.${s} }`,
        `}`),
      L(`func ${ss}(of ${vs}: [${E}]) -> [String] {`,
        `    ${vs}.map(\\.${s})`,
        `}`),
    ];
  },
  sort: (c) => {
    const { E, Ep, vs, n, N } = names(c);
    return L(`func sort${Ep}By${N}(_ ${vs}: [${E}]) -> [${E}] {`,
      `    ${vs}.sorted { $0.${n} > $1.${n} }`,
      `}`);
  },
  any: (c) => {
    const { E, vs, n, N, NT } = names(c);
    return L(`func any${N}(in ${vs}: [${E}], above limit: ${NT}) -> Bool {`,
      `    ${vs}.contains { $0.${n} > limit }`,
      `}`);
  },
  classDef: (c) => {
    const { E } = names(c);
    return L(`struct ${E}: Codable {`,
      ...c.ent.fields.map((f) => `    var ${camel(f.n)}: ${ty(f)}`),
      `}`);
  },
  validate: (c) => {
    const { E, v, n, N } = names(c);
    return L(`enum ValidationError: Error {`,
      `    case negative${N}`,
      `}`,
      ``,
      `func validate${N}(_ ${v}: ${E}) throws {`,
      `    guard ${v}.${n} >= 0 else {`,
      `        throw ValidationError.negative${N}`,
      `    }`,
      `}`);
  },
  toggle: (c) => {
    const { E, v, b, B } = names(c);
    return L(`func toggle${B}(_ ${v}: inout ${E}) {`,
      `    ${v}.${b}.toggle()`,
      `}`);
  },
  describe: (c) => {
    const { E, s, n } = names(c);
    return L(`extension ${E}: CustomStringConvertible {`,
      `    var description: String {`,
      `        "${E}: \\(${s}) (\\(${n}))"`,
      `    }`,
      `}`);
  },
  index: (c) => {
    const { E, Ep, vs, s, S } = names(c);
    return L(`func index${Ep}By${S}(_ ${vs}: [${E}]) -> [String: ${E}] {`,
      `    Dictionary(${vs}.map { ($0.${s}, $0) }, uniquingKeysWith: { first, _ in first })`,
      `}`);
  },
  topN: (c) => {
    const { E, Ep, vs, n, N } = names(c);
    return L(`func top${Ep}By${N}(_ ${vs}: [${E}], count: Int = 3) -> [${E}] {`,
      `    Array(${vs}.sorted { $0.${n} > $1.${n} }.prefix(count))`,
      `}`);
  },
  sumIf: (c) => {
    const { E, Ep, vs, n, N, NT, b, B } = names(c);
    return L(`func total${N}Of${B}${Ep}(_ ${vs}: [${E}]) -> ${NT} {`,
      `    ${vs}.filter { $0.${b} }.reduce(0) { $0 + $1.${n} }`,
      `}`);
  },
  page: (c) => {
    const { E, Ep, vs } = names(c);
    return L(`func paginate${Ep}(_ ${vs}: [${E}], page: Int, size: Int = 10) -> ArraySlice<${E}> {`,
      `    let start = (page - 1) * size`,
      `    guard page > 0, start < ${vs}.count else { return [] }`,
      `    return ${vs}[start..<min(start + size, ${vs}.count)]`,
      `}`);
  },
  fetch: (c) => {
    const { E, Ep } = names(c);
    return L(`func fetch${Ep}() async throws -> [${E}] {`,
      `    let url = URL(string: "https://api.example.com/${kebab(c.ent.p)}")!`,
      `    let (data, _) = try await URLSession.shared.data(from: url)`,
      `    return try JSONDecoder().decode([${E}].self, from: data)`,
      `}`);
  },
  partition: (c) => {
    const { E, Ep, vs, b, B } = names(c);
    return L(`func split${Ep}By${B}(_ ${vs}: [${E}]) -> (matching: [${E}], rest: [${E}]) {`,
      `    (${vs}.filter { $0.${b} }, ${vs}.filter { !$0.${b} })`,
      `}`);
  },
  increase: (c) => {
    const { E, v, n, N, NT } = names(c);
    return L(`func increase${N}(_ ${v}: ${E}, by amount: ${NT}) -> ${E} {`,
      `    precondition(amount > 0, "amount must be positive")`,
      `    var copy = ${v}`,
      `    copy.${n} += amount`,
      `    return copy`,
      `}`);
  },
  fibonacci: () => L(`func fibonacci(_ n: Int) -> [Int] {`,
    `    var sequence = [0, 1]`,
    `    while sequence.count < n {`,
    `        sequence.append(sequence[sequence.count - 1] + sequence[sequence.count - 2])`,
    `    }`,
    `    return Array(sequence.prefix(n))`,
    `}`),
  factorial: () => [
    L(`func factorial(_ n: Int) -> Int {`,
      `    n <= 1 ? 1 : n * factorial(n - 1)`,
      `}`),
    L(`func factorial(_ n: Int) -> Int {`,
      `    (1...max(n, 1)).reduce(1, *)`,
      `}`),
  ],
  isPrime: () => L(`func isPrime(_ n: Int) -> Bool {`,
    `    guard n >= 2 else { return false }`,
    `    var i = 2`,
    `    while i * i <= n {`,
    `        if n % i == 0 { return false }`,
    `        i += 1`,
    `    }`,
    `    return true`,
    `}`),
  gcd: () => L(`func gcd(_ a: Int, _ b: Int) -> Int {`,
    `    b == 0 ? a : gcd(b, a % b)`,
    `}`),
  reverse: () => L(`func reverse(_ text: String) -> String {`,
    `    String(text.reversed())`,
    `}`),
  palindrome: () => L(`func isPalindrome(_ word: String) -> Bool {`,
    `    let cleaned = word.lowercased().filter { !$0.isWhitespace }`,
    `    return cleaned == String(cleaned.reversed())`,
    `}`),
  vowels: () => L(`func countVowels(_ text: String) -> Int {`,
    `    text.lowercased().filter { "aeiou".contains($0) }.count`,
    `}`),
  fizzbuzz: () => L(`func fizzBuzz(_ n: Int) {`,
    `    for i in 1...n {`,
    `        switch (i % 3, i % 5) {`,
    `        case (0, 0): print("FizzBuzz")`,
    `        case (0, _): print("Fizz")`,
    `        case (_, 0): print("Buzz")`,
    `        default: print(i)`,
    `        }`,
    `    }`,
    `}`),
  binarySearch: () => L(`func binarySearch(_ items: [Int], for target: Int) -> Int? {`,
    `    var low = 0`,
    `    var high = items.count - 1`,
    `    while low <= high {`,
    `        let mid = low + (high - low) / 2`,
    `        if items[mid] == target { return mid }`,
    `        if items[mid] < target {`,
    `            low = mid + 1`,
    `        } else {`,
    `            high = mid - 1`,
    `        }`,
    `    }`,
    `    return nil`,
    `}`),
  clamp: () => L(`func clamp(_ value: Double, min lower: Double, max upper: Double) -> Double {`,
    `    min(max(value, lower), upper)`,
    `}`),
  celsius: () => L(`func celsiusToFahrenheit(_ celsius: Double) -> Double {`,
    `    celsius * 9 / 5 + 32`,
    `}`),
  discount: () => L(`func applyDiscount(to price: Double, percent: Double) -> Double {`,
    `    precondition((0...100).contains(percent), "percent must be between 0 and 100")`,
    `    return price * (1 - percent / 100)`,
    `}`),
  maxValue: () => L(`func maxValue(_ numbers: [Int]) -> Int? {`,
    `    guard var largest = numbers.first else { return nil }`,
    `    for number in numbers where number > largest {`,
    `        largest = number`,
    `    }`,
    `    return largest`,
    `}`),
  wordCount: () => L(`func wordFrequency(_ text: String) -> [String: Int] {`,
    `    var counts: [String: Int] = [:]`,
    `    for word in text.lowercased().split(separator: " ") {`,
    `        counts[String(word), default: 0] += 1`,
    `    }`,
    `    return counts`,
    `}`),
  readFile: () => L(`func readFile(at path: String) -> String? {`,
    `    do {`,
    `        return try String(contentsOfFile: path, encoding: .utf8)`,
    `    } catch {`,
    `        print("Could not read \\(path): \\(error)")`,
    `        return nil`,
    `    }`,
    `}`),
  enum: (c) => {
    const name = pascal({ w: c.enumSet.name });
    return L(`enum ${name}: String, CaseIterable {`,
      ...c.enumSet.values.map((v) => `    case ${camel({ w: v })}`),
      `}`);
  },
  shape: (c) => {
    const s = c.shape;
    const T = pascal({ w: [s.name] });
    const area = {
      circle: `Double.pi * radius * radius`,
      rect: `width * height`,
      square: `side * side`,
      triangle: `base * height / 2`,
    }[s.kind];
    return L(`struct ${T}: Shape {`,
      ...s.params.map((p) => `    let ${p}: Double`),
      ``,
      `    var area: Double { ${area} }`,
      `}`);
  },
  sumEven: () => L(`func sumEven(_ numbers: [Int]) -> Int {`,
    `    numbers.filter { $0 % 2 == 0 }.reduce(0, +)`,
    `}`),
  average: () => L(`func average(_ numbers: [Double]) -> Double {`,
    `    numbers.isEmpty ? 0 : numbers.reduce(0, +) / Double(numbers.count)`,
    `}`),
  capitalize: () => L(`func capitalizeWords(_ text: String) -> String {`,
    `    text.split(separator: " ").map { $0.prefix(1).uppercased() + $0.dropFirst() }.joined(separator: " ")`,
    `}`),
};
