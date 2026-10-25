import { type Field, L, camel, kebab, pascal, plural, upper } from "../base";
import type { FullCtx, LangImpls } from "../concepts";

const ty = (f: Field) => ({ int: "int", float: "double", str: "String", bool: "boolean" })[f.t];
const mapTo = (f: Field) => (f.t === "float" ? "mapToDouble" : "mapToInt");
const cmp = (f: Field) => (f.t === "float" ? "comparingDouble" : "comparingInt");
const zero = (f: Field) => (f.t === "float" ? "0.0" : "0");

const names = (c: FullCtx) => ({
  E: pascal(c.ent.s),
  Ep: pascal(c.ent.p),
  v: camel(c.ent.s),
  vs: camel(c.ent.p),
  N: camel(c.num.n),
  Np: pascal(c.num.n),
  NT: ty(c.num),
  S: camel(c.str.n),
  Sp: pascal(c.str.n),
  Ss: pascal(plural(c.str.n)),
  B: camel(c.flag.n),
  Bp: pascal(c.flag.n),
});

const recordFields = (c: FullCtx) => c.ent.fields.map((f) => `${ty(f)} ${camel(f.n)}`);

export const java: LangImpls = {
  sum: (c) => {
    const { E, v, vs, N, Np, NT } = names(c);
    return [
      L(`public static ${NT} total${Np}(List<${E}> ${vs}) {`,
        `    ${NT} total = ${zero(c.num)};`,
        `    for (${E} ${v} : ${vs}) {`,
        `        total += ${v}.${N}();`,
        `    }`,
        `    return total;`,
        `}`),
      L(`public static ${NT} total${Np}(List<${E}> ${vs}) {`,
        `    return ${vs}.stream().${mapTo(c.num)}(${E}::${N}).sum();`,
        `}`),
    ];
  },
  avg: (c) => {
    const { E, vs, N, Np } = names(c);
    return L(`public static double average${Np}(List<${E}> ${vs}) {`,
      `    return ${vs}.stream()`,
      `            .mapToDouble(${E}::${N})`,
      `            .average()`,
      `            .orElse(0.0);`,
      `}`);
  },
  maxBy: (c) => {
    const { E, vs, N, Np } = names(c);
    return L(`public static Optional<${E}> find${E}WithMax${Np}(List<${E}> ${vs}) {`,
      `    return ${vs}.stream().max(Comparator.${cmp(c.num)}(${E}::${N}));`,
      `}`);
  },
  minBy: (c) => {
    const { E, vs, N, Np } = names(c);
    return L(`public static Optional<${E}> find${E}WithMin${Np}(List<${E}> ${vs}) {`,
      `    return ${vs}.stream().min(Comparator.${cmp(c.num)}(${E}::${N}));`,
      `}`);
  },
  filter: (c) => {
    const { E, Ep, v, vs, B, Bp } = names(c);
    return [
      L(`public static List<${E}> get${Bp}${Ep}(List<${E}> ${vs}) {`,
        `    return ${vs}.stream().filter(${E}::${B}).toList();`,
        `}`),
      L(`public static List<${E}> get${Bp}${Ep}(List<${E}> ${vs}) {`,
        `    List<${E}> result = new ArrayList<>();`,
        `    for (${E} ${v} : ${vs}) {`,
        `        if (${v}.${B}()) {`,
        `            result.add(${v});`,
        `        }`,
        `    }`,
        `    return result;`,
        `}`),
    ];
  },
  count: (c) => {
    const { E, Ep, vs, B, Bp } = names(c);
    return L(`public static long count${Bp}${Ep}(List<${E}> ${vs}) {`,
      `    return ${vs}.stream().filter(${E}::${B}).count();`,
      `}`);
  },
  find: (c) => {
    const { E, v, vs, S, Sp } = names(c);
    return L(`public static Optional<${E}> find${E}By${Sp}(List<${E}> ${vs}, String ${S}) {`,
      `    return ${vs}.stream()`,
      `            .filter(${v} -> ${v}.${S}().equals(${S}))`,
      `            .findFirst();`,
      `}`);
  },
  map: (c) => {
    const { E, vs, S, Ss } = names(c);
    return L(`public static List<String> get${E}${Ss}(List<${E}> ${vs}) {`,
      `    return ${vs}.stream().map(${E}::${S}).toList();`,
      `}`);
  },
  sort: (c) => {
    const { E, Ep, vs, N, Np } = names(c);
    return L(`public static List<${E}> sort${Ep}By${Np}(List<${E}> ${vs}) {`,
      `    return ${vs}.stream()`,
      `            .sorted(Comparator.${cmp(c.num)}(${E}::${N}).reversed())`,
      `            .toList();`,
      `}`);
  },
  any: (c) => {
    const { E, v, vs, N, Np, NT } = names(c);
    return L(`public static boolean any${Np}Above(List<${E}> ${vs}, ${NT} limit) {`,
      `    return ${vs}.stream().anyMatch(${v} -> ${v}.${N}() > limit);`,
      `}`);
  },
  classDef: (c) => {
    const { E } = names(c);
    const fields = c.ent.fields;
    return [
      L(`public record ${E}(`, ...recordFields(c).map((f, i, all) => `        ${f}${i < all.length - 1 ? "," : ""}`), `) {}`),
      L(`public class ${E} {`,
        ...fields.map((f) => `    private final ${ty(f)} ${camel(f.n)};`),
        ``,
        `    public ${E}(${recordFields(c).join(", ")}) {`,
        ...fields.map((f) => `        this.${camel(f.n)} = ${camel(f.n)};`),
        `    }`,
        `}`),
    ];
  },
  validate: (c) => {
    const { E, N } = names(c);
    return L(`public record ${E}(${recordFields(c).join(", ")}) {`,
      `    public ${E} {`,
      `        if (${N} < 0) {`,
      `            throw new IllegalArgumentException("${N} cannot be negative");`,
      `        }`,
      `    }`,
      `}`);
  },
  toggle: (c) => {
    const { B, Bp } = names(c);
    return L(`public void toggle${Bp}() {`,
      `    this.${B} = !this.${B};`,
      `}`);
  },
  describe: (c) => {
    const { E, v, S, N } = names(c);
    return [
      L(`public static String describe(${E} ${v}) {`,
        `    return String.format("${E}: %s (%s)", ${v}.${S}(), ${v}.${N}());`,
        `}`),
      L(`@Override`,
        `public String toString() {`,
        `    return "${E}: " + ${S} + " (" + ${N} + ")";`,
        `}`),
    ];
  },
  index: (c) => {
    const { E, Ep, vs, S, Sp } = names(c);
    return L(`public static Map<String, ${E}> index${Ep}By${Sp}(List<${E}> ${vs}) {`,
      `    return ${vs}.stream()`,
      `            .collect(Collectors.toMap(${E}::${S}, Function.identity()));`,
      `}`);
  },
  topN: (c) => {
    const { E, Ep, vs, N, Np } = names(c);
    return L(`public static List<${E}> top${Ep}By${Np}(List<${E}> ${vs}, int n) {`,
      `    return ${vs}.stream()`,
      `            .sorted(Comparator.${cmp(c.num)}(${E}::${N}).reversed())`,
      `            .limit(n)`,
      `            .toList();`,
      `}`);
  },
  sumIf: (c) => {
    const { E, Ep, vs, N, Np, NT, B, Bp } = names(c);
    return L(`public static ${NT} total${Np}Of${Bp}${Ep}(List<${E}> ${vs}) {`,
      `    return ${vs}.stream()`,
      `            .filter(${E}::${B})`,
      `            .${mapTo(c.num)}(${E}::${N})`,
      `            .sum();`,
      `}`);
  },
  page: (c) => {
    const { E, Ep, vs } = names(c);
    return L(`public static List<${E}> paginate${Ep}(List<${E}> ${vs}, int page, int size) {`,
      `    int start = Math.min((page - 1) * size, ${vs}.size());`,
      `    int end = Math.min(start + size, ${vs}.size());`,
      `    return ${vs}.subList(start, end);`,
      `}`);
  },
  fetch: (c) => {
    const { Ep } = names(c);
    return L(`public static CompletableFuture<String> fetch${Ep}(HttpClient client) {`,
      `    HttpRequest request = HttpRequest.newBuilder()`,
      `            .uri(URI.create("https://api.example.com/${kebab(c.ent.p)}"))`,
      `            .GET()`,
      `            .build();`,
      `    return client.sendAsync(request, HttpResponse.BodyHandlers.ofString())`,
      `            .thenApply(HttpResponse::body);`,
      `}`);
  },
  partition: (c) => {
    const { E, Ep, vs, B, Bp } = names(c);
    return L(`public static Map<Boolean, List<${E}>> split${Ep}By${Bp}(List<${E}> ${vs}) {`,
      `    return ${vs}.stream().collect(Collectors.partitioningBy(${E}::${B}));`,
      `}`);
  },
  increase: (c) => {
    const { N, Np, NT } = names(c);
    return L(`public void increase${Np}(${NT} amount) {`,
      `    if (amount <= 0) {`,
      `        throw new IllegalArgumentException("amount must be positive");`,
      `    }`,
      `    this.${N} += amount;`,
      `}`);
  },
  fibonacci: () => L(`public static List<Integer> fibonacci(int n) {`,
    `    List<Integer> sequence = new ArrayList<>(List.of(0, 1));`,
    `    while (sequence.size() < n) {`,
    `        int size = sequence.size();`,
    `        sequence.add(sequence.get(size - 1) + sequence.get(size - 2));`,
    `    }`,
    `    return sequence.subList(0, n);`,
    `}`),
  factorial: () => [
    L(`public static long factorial(int n) {`,
      `    long result = 1;`,
      `    for (int i = 2; i <= n; i++) {`,
      `        result *= i;`,
      `    }`,
      `    return result;`,
      `}`),
    L(`public static long factorial(int n) {`,
      `    return n <= 1 ? 1 : n * factorial(n - 1);`,
      `}`),
  ],
  isPrime: () => L(`public static boolean isPrime(int n) {`,
    `    if (n < 2) {`,
    `        return false;`,
    `    }`,
    `    for (int i = 2; i * i <= n; i++) {`,
    `        if (n % i == 0) {`,
    `            return false;`,
    `        }`,
    `    }`,
    `    return true;`,
    `}`),
  gcd: () => L(`public static int gcd(int a, int b) {`,
    `    return b == 0 ? a : gcd(b, a % b);`,
    `}`),
  reverse: () => L(`public static String reverse(String text) {`,
    `    return new StringBuilder(text).reverse().toString();`,
    `}`),
  palindrome: () => L(`public static boolean isPalindrome(String word) {`,
    `    String cleaned = word.toLowerCase().replace(" ", "");`,
    `    return cleaned.equals(new StringBuilder(cleaned).reverse().toString());`,
    `}`),
  vowels: () => L(`public static int countVowels(String text) {`,
    `    int count = 0;`,
    `    for (char ch : text.toLowerCase().toCharArray()) {`,
    `        if ("aeiou".indexOf(ch) >= 0) {`,
    `            count++;`,
    `        }`,
    `    }`,
    `    return count;`,
    `}`),
  fizzbuzz: () => L(`public static void fizzBuzz(int n) {`,
    `    for (int i = 1; i <= n; i++) {`,
    `        if (i % 15 == 0) {`,
    `            System.out.println("FizzBuzz");`,
    `        } else if (i % 3 == 0) {`,
    `            System.out.println("Fizz");`,
    `        } else if (i % 5 == 0) {`,
    `            System.out.println("Buzz");`,
    `        } else {`,
    `            System.out.println(i);`,
    `        }`,
    `    }`,
    `}`),
  binarySearch: () => L(`public static int binarySearch(int[] items, int target) {`,
    `    int low = 0;`,
    `    int high = items.length - 1;`,
    `    while (low <= high) {`,
    `        int mid = (low + high) >>> 1;`,
    `        if (items[mid] == target) {`,
    `            return mid;`,
    `        } else if (items[mid] < target) {`,
    `            low = mid + 1;`,
    `        } else {`,
    `            high = mid - 1;`,
    `        }`,
    `    }`,
    `    return -1;`,
    `}`),
  clamp: () => L(`public static double clamp(double value, double min, double max) {`,
    `    return Math.max(min, Math.min(value, max));`,
    `}`),
  celsius: () => L(`public static double celsiusToFahrenheit(double celsius) {`,
    `    return celsius * 9 / 5 + 32;`,
    `}`),
  discount: () => L(`public static double applyDiscount(double price, double percent) {`,
    `    if (percent < 0 || percent > 100) {`,
    `        throw new IllegalArgumentException("percent must be between 0 and 100");`,
    `    }`,
    `    return Math.round(price * (100 - percent)) / 100.0;`,
    `}`),
  maxValue: () => L(`public static int maxValue(int[] numbers) {`,
    `    int largest = numbers[0];`,
    `    for (int number : numbers) {`,
    `        if (number > largest) {`,
    `            largest = number;`,
    `        }`,
    `    }`,
    `    return largest;`,
    `}`),
  wordCount: () => L(`public static Map<String, Integer> wordFrequency(String text) {`,
    `    Map<String, Integer> counts = new HashMap<>();`,
    `    for (String word : text.toLowerCase().split("\\\\s+")) {`,
    `        counts.merge(word, 1, Integer::sum);`,
    `    }`,
    `    return counts;`,
    `}`),
  readFile: () => L(`public static Optional<String> readFile(String path) {`,
    `    try {`,
    `        return Optional.of(Files.readString(Path.of(path)));`,
    `    } catch (IOException e) {`,
    `        System.err.println("Could not read file: " + e.getMessage());`,
    `        return Optional.empty();`,
    `    }`,
    `}`),
  enum: (c) => {
    const name = pascal({ w: c.enumSet.name });
    return L(`public enum ${name} {`,
      `    ${c.enumSet.values.map((v) => upper({ w: v })).join(",\n    ")}`,
      `}`);
  },
  shape: (c) => {
    const s = c.shape;
    const cls = pascal({ w: [s.name] });
    const area = {
      circle: `Math.PI * radius * radius`,
      rect: `width * height`,
      square: `side * side`,
      triangle: `base * height / 2`,
    }[s.kind];
    return L(`public record ${cls}(${s.params.map((p) => `double ${p}`).join(", ")}) implements Shape {`,
      `    @Override`,
      `    public double area() {`,
      `        return ${area};`,
      `    }`,
      `}`);
  },
  sumEven: () => L(`public static int sumEven(List<Integer> numbers) {`,
    `    return numbers.stream()`,
    `            .filter(n -> n % 2 == 0)`,
    `            .mapToInt(Integer::intValue)`,
    `            .sum();`,
    `}`),
  average: () => L(`public static double average(double[] numbers) {`,
    `    return Arrays.stream(numbers).average().orElse(0.0);`,
    `}`),
  capitalize: () => L(`public static String capitalizeWords(String text) {`,
    `    return Arrays.stream(text.split(" "))`,
    `            .map(w -> w.isEmpty() ? w : Character.toUpperCase(w.charAt(0)) + w.substring(1))`,
    `            .collect(Collectors.joining(" "));`,
    `}`),
};
