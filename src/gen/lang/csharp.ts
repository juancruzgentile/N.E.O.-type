import { type Field, L, camel, kebab, pascal, plural } from "../base";
import type { FullCtx, LangImpls } from "../concepts";

const ty = (f: Field) => ({ int: "int", float: "double", str: "string", bool: "bool" })[f.t];

const names = (c: FullCtx) => ({
  E: pascal(c.ent.s),
  Ep: pascal(c.ent.p),
  v: camel(c.ent.s),
  vs: camel(c.ent.p),
  N: pascal(c.num.n),
  NT: ty(c.num),
  S: pascal(c.str.n),
  s: camel(c.str.n),
  Ss: pascal(plural(c.str.n)),
  B: pascal(c.flag.n),
});

const props = (c: FullCtx) => c.ent.fields.map((f) => `${ty(f)} ${pascal(f.n)}`);

export const csharp: LangImpls = {
  sum: (c) => {
    const { E, v, vs, N, NT } = names(c);
    return [
      L(`public static ${NT} Total${N}(IEnumerable<${E}> ${vs}) =>`,
        `    ${vs}.Sum(${v} => ${v}.${N});`),
      L(`public static ${NT} Total${N}(List<${E}> ${vs})`,
        `{`,
        `    ${NT} total = 0;`,
        `    foreach (var ${v} in ${vs})`,
        `    {`,
        `        total += ${v}.${N};`,
        `    }`,
        `    return total;`,
        `}`),
    ];
  },
  avg: (c) => {
    const { E, v, vs, N } = names(c);
    return L(`public static double Average${N}(IReadOnlyCollection<${E}> ${vs})`,
      `{`,
      `    return ${vs}.Count == 0 ? 0 : ${vs}.Average(${v} => ${v}.${N});`,
      `}`);
  },
  maxBy: (c) => {
    const { E, v, vs, N } = names(c);
    return L(`public static ${E}? Find${E}WithMax${N}(IEnumerable<${E}> ${vs}) =>`,
      `    ${vs}.MaxBy(${v} => ${v}.${N});`);
  },
  minBy: (c) => {
    const { E, v, vs, N } = names(c);
    return L(`public static ${E}? Find${E}WithMin${N}(IEnumerable<${E}> ${vs}) =>`,
      `    ${vs}.MinBy(${v} => ${v}.${N});`);
  },
  filter: (c) => {
    const { E, Ep, v, vs, B } = names(c);
    return [
      L(`public static List<${E}> Get${B}${Ep}(IEnumerable<${E}> ${vs}) =>`,
        `    ${vs}.Where(${v} => ${v}.${B}).ToList();`),
      L(`public static List<${E}> Get${B}${Ep}(IEnumerable<${E}> ${vs})`,
        `{`,
        `    var result = new List<${E}>();`,
        `    foreach (var ${v} in ${vs})`,
        `    {`,
        `        if (${v}.${B})`,
        `        {`,
        `            result.Add(${v});`,
        `        }`,
        `    }`,
        `    return result;`,
        `}`),
    ];
  },
  count: (c) => {
    const { E, Ep, v, vs, B } = names(c);
    return L(`public static int Count${B}${Ep}(IEnumerable<${E}> ${vs}) =>`,
      `    ${vs}.Count(${v} => ${v}.${B});`);
  },
  find: (c) => {
    const { E, v, vs, S, s } = names(c);
    return L(`public static ${E}? Find${E}By${S}(IEnumerable<${E}> ${vs}, string ${s}) =>`,
      `    ${vs}.FirstOrDefault(${v} => ${v}.${S} == ${s});`);
  },
  map: (c) => {
    const { E, v, vs, S, Ss } = names(c);
    return L(`public static List<string> Get${E}${Ss}(IEnumerable<${E}> ${vs}) =>`,
      `    ${vs}.Select(${v} => ${v}.${S}).ToList();`);
  },
  sort: (c) => {
    const { E, Ep, v, vs, N } = names(c);
    return L(`public static List<${E}> Sort${Ep}By${N}(IEnumerable<${E}> ${vs}) =>`,
      `    ${vs}.OrderByDescending(${v} => ${v}.${N}).ToList();`);
  },
  any: (c) => {
    const { E, v, vs, N, NT } = names(c);
    return L(`public static bool Any${N}Above(IEnumerable<${E}> ${vs}, ${NT} limit) =>`,
      `    ${vs}.Any(${v} => ${v}.${N} > limit);`);
  },
  classDef: (c) => {
    const { E } = names(c);
    return [
      L(`public record ${E}(${props(c).join(", ")});`),
      L(`public class ${E}`,
        `{`,
        ...c.ent.fields.map((f) =>
          `    public ${ty(f)} ${pascal(f.n)} { get; set; }${f.t === "str" ? " = string.Empty;" : ""}`),
        `}`),
    ];
  },
  validate: (c) => {
    const { E, v, N } = names(c);
    return L(`public static void Validate${N}(${E} ${v})`,
      `{`,
      `    if (${v}.${N} < 0)`,
      `    {`,
      `        throw new ArgumentOutOfRangeException(nameof(${v}), "${N} cannot be negative");`,
      `    }`,
      `}`);
  },
  toggle: (c) => {
    const { E, v, B } = names(c);
    return L(`public static ${E} Toggle${B}(${E} ${v}) =>`,
      `    ${v} with { ${B} = !${v}.${B} };`);
  },
  describe: (c) => {
    const { E, v, S, N } = names(c);
    return [
      L(`public static string Describe(${E} ${v}) =>`,
        `    $"${E}: {${v}.${S}} ({${v}.${N}})";`),
      L(`public override string ToString()`,
        `{`,
        `    return "${E}: " + ${S} + " (" + ${N} + ")";`,
        `}`),
    ];
  },
  index: (c) => {
    const { E, Ep, v, vs, S } = names(c);
    return L(`public static Dictionary<string, ${E}> Index${Ep}By${S}(IEnumerable<${E}> ${vs}) =>`,
      `    ${vs}.ToDictionary(${v} => ${v}.${S});`);
  },
  topN: (c) => {
    const { E, Ep, v, vs, N } = names(c);
    return L(`public static List<${E}> Top${Ep}By${N}(IEnumerable<${E}> ${vs}, int n = 3) =>`,
      `    ${vs}.OrderByDescending(${v} => ${v}.${N}).Take(n).ToList();`);
  },
  sumIf: (c) => {
    const { E, Ep, v, vs, N, NT, B } = names(c);
    return L(`public static ${NT} Total${N}Of${B}${Ep}(IEnumerable<${E}> ${vs}) =>`,
      `    ${vs}.Where(${v} => ${v}.${B}).Sum(${v} => ${v}.${N});`);
  },
  page: (c) => {
    const { E, Ep, vs } = names(c);
    return L(`public static List<${E}> Paginate${Ep}(IEnumerable<${E}> ${vs}, int page, int size = 10) =>`,
      `    ${vs}.Skip((page - 1) * size).Take(size).ToList();`);
  },
  fetch: (c) => {
    const { E, Ep } = names(c);
    return L(`public static async Task<List<${E}>?> Fetch${Ep}Async(HttpClient client)`,
      `{`,
      `    var response = await client.GetAsync("api/${kebab(c.ent.p)}");`,
      `    response.EnsureSuccessStatusCode();`,
      `    return await response.Content.ReadFromJsonAsync<List<${E}>>();`,
      `}`);
  },
  partition: (c) => {
    const { E, Ep, v, vs, B } = names(c);
    return L(`public static (List<${E}> Matching, List<${E}> Rest) Split${Ep}By${B}(List<${E}> ${vs})`,
      `{`,
      `    var lookup = ${vs}.ToLookup(${v} => ${v}.${B});`,
      `    return (lookup[true].ToList(), lookup[false].ToList());`,
      `}`);
  },
  increase: (c) => {
    const { E, v, N, NT } = names(c);
    return L(`public static ${E} Increase${N}(${E} ${v}, ${NT} amount)`,
      `{`,
      `    if (amount <= 0)`,
      `    {`,
      `        throw new ArgumentException("amount must be positive", nameof(amount));`,
      `    }`,
      `    return ${v} with { ${N} = ${v}.${N} + amount };`,
      `}`);
  },
  fibonacci: () => L(`public static List<int> Fibonacci(int n)`,
    `{`,
    `    var sequence = new List<int> { 0, 1 };`,
    `    while (sequence.Count < n)`,
    `    {`,
    `        sequence.Add(sequence[^1] + sequence[^2]);`,
    `    }`,
    `    return sequence.Take(n).ToList();`,
    `}`),
  factorial: () => [
    L(`public static long Factorial(int n)`,
      `{`,
      `    long result = 1;`,
      `    for (var i = 2; i <= n; i++)`,
      `    {`,
      `        result *= i;`,
      `    }`,
      `    return result;`,
      `}`),
    L(`public static long Factorial(int n) => n <= 1 ? 1 : n * Factorial(n - 1);`),
  ],
  isPrime: () => L(`public static bool IsPrime(int n)`,
    `{`,
    `    if (n < 2) return false;`,
    `    for (var i = 2; i * i <= n; i++)`,
    `    {`,
    `        if (n % i == 0) return false;`,
    `    }`,
    `    return true;`,
    `}`),
  gcd: () => L(`public static int Gcd(int a, int b) => b == 0 ? a : Gcd(b, a % b);`),
  reverse: () => L(`public static string Reverse(string text) =>`,
    `    new string(text.Reverse().ToArray());`),
  palindrome: () => L(`public static bool IsPalindrome(string word)`,
    `{`,
    `    var cleaned = word.ToLower().Replace(" ", "");`,
    `    return cleaned.SequenceEqual(cleaned.Reverse());`,
    `}`),
  vowels: () => L(`public static int CountVowels(string text) =>`,
    `    text.ToLower().Count(ch => "aeiou".Contains(ch));`),
  fizzbuzz: () => L(`public static void FizzBuzz(int n)`,
    `{`,
    `    for (var i = 1; i <= n; i++)`,
    `    {`,
    `        var output = (i % 3, i % 5) switch`,
    `        {`,
    `            (0, 0) => "FizzBuzz",`,
    `            (0, _) => "Fizz",`,
    `            (_, 0) => "Buzz",`,
    `            _ => i.ToString(),`,
    `        };`,
    `        Console.WriteLine(output);`,
    `    }`,
    `}`),
  binarySearch: () => L(`public static int BinarySearch(int[] items, int target)`,
    `{`,
    `    int low = 0, high = items.Length - 1;`,
    `    while (low <= high)`,
    `    {`,
    `        var mid = low + (high - low) / 2;`,
    `        if (items[mid] == target) return mid;`,
    `        if (items[mid] < target) low = mid + 1;`,
    `        else high = mid - 1;`,
    `    }`,
    `    return -1;`,
    `}`),
  clamp: () => L(`public static double Clamp(double value, double min, double max) =>`,
    `    Math.Clamp(value, min, max);`),
  celsius: () => L(`public static double CelsiusToFahrenheit(double celsius) => celsius * 9 / 5 + 32;`),
  discount: () => L(`public static decimal ApplyDiscount(decimal price, decimal percent)`,
    `{`,
    `    if (percent is < 0 or > 100)`,
    `    {`,
    `        throw new ArgumentOutOfRangeException(nameof(percent));`,
    `    }`,
    `    return Math.Round(price * (1 - percent / 100), 2);`,
    `}`),
  maxValue: () => L(`public static int MaxValue(int[] numbers)`,
    `{`,
    `    var largest = numbers[0];`,
    `    foreach (var number in numbers)`,
    `    {`,
    `        if (number > largest) largest = number;`,
    `    }`,
    `    return largest;`,
    `}`),
  wordCount: () => L(`public static Dictionary<string, int> WordFrequency(string text) =>`,
    `    text.ToLower()`,
    `        .Split(' ', StringSplitOptions.RemoveEmptyEntries)`,
    `        .GroupBy(word => word)`,
    `        .ToDictionary(group => group.Key, group => group.Count());`),
  readFile: () => L(`public static string? ReadFile(string path)`,
    `{`,
    `    try`,
    `    {`,
    `        return File.ReadAllText(path);`,
    `    }`,
    `    catch (IOException ex)`,
    `    {`,
    `        Console.Error.WriteLine($"Could not read {path}: {ex.Message}");`,
    `        return null;`,
    `    }`,
    `}`),
  enum: (c) => {
    const name = pascal({ w: c.enumSet.name });
    return L(`public enum ${name}`,
      `{`,
      ...c.enumSet.values.map((v) => `    ${pascal({ w: v })},`),
      `}`);
  },
  shape: (c) => {
    const s = c.shape;
    const cls = pascal({ w: [s.name] });
    const P = (p: string) => pascal({ w: [p] });
    const area = {
      circle: `Math.PI * Radius * Radius`,
      rect: `Width * Height`,
      square: `Side * Side`,
      triangle: `Base * Height / 2`,
    }[s.kind];
    return L(`public record ${cls}(${s.params.map((p) => `double ${P(p)}`).join(", ")}) : IShape`,
      `{`,
      `    public double Area() => ${area};`,
      `}`);
  },
  sumEven: () => L(`public static int SumEven(IEnumerable<int> numbers) =>`,
    `    numbers.Where(n => n % 2 == 0).Sum();`),
  average: () => L(`public static double Average(IReadOnlyCollection<double> numbers) =>`,
    `    numbers.Count == 0 ? 0 : numbers.Average();`),
  capitalize: () => L(`public static string CapitalizeWords(string text) =>`,
    `    string.Join(" ", text.Split(' ').Select(w => w.Length == 0 ? w : char.ToUpper(w[0]) + w[1..]));`),
};
