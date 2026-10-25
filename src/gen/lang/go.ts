import { type Field, L, camel, pascal, plural, snake } from "../base";
import type { FullCtx, LangImpls } from "../concepts";

const ty = (f: Field) => ({ int: "int", float: "float64", str: "string", bool: "bool" })[f.t];

const names = (c: FullCtx) => ({
  E: pascal(c.ent.s),
  Ep: pascal(c.ent.p),
  r: c.ent.s.w[0][0],
  v: camel(c.ent.s),
  vs: camel(c.ent.p),
  N: pascal(c.num.n),
  NT: ty(c.num),
  S: pascal(c.str.n),
  s: camel(c.str.n),
  Ss: pascal(plural(c.str.n)),
  B: pascal(c.flag.n),
});

/** Campos de struct alineados como lo haría gofmt. */
function structFields(c: FullCtx, tags: boolean): string[] {
  const fs = c.ent.fields;
  const nameW = Math.max(...fs.map((f) => pascal(f.n).length));
  const typeW = Math.max(...fs.map((f) => ty(f).length));
  return fs.map((f) => {
    const name = pascal(f.n).padEnd(nameW);
    if (!tags) return `    ${name} ${ty(f)}`;
    return `    ${name} ${ty(f).padEnd(typeW)} \`json:"${snake(f.n)}"\``;
  });
}

export const go: LangImpls = {
  sum: (c) => {
    const { E, v, vs, N, NT } = names(c);
    return L(`func Total${N}(${vs} []${E}) ${NT} {`,
      `    var total ${NT}`,
      `    for _, ${v} := range ${vs} {`,
      `        total += ${v}.${N}`,
      `    }`,
      `    return total`,
      `}`);
  },
  avg: (c) => {
    const { E, v, vs, N } = names(c);
    const val = c.num.t === "float" ? `${v}.${N}` : `float64(${v}.${N})`;
    return L(`func Average${N}(${vs} []${E}) float64 {`,
      `    if len(${vs}) == 0 {`,
      `        return 0`,
      `    }`,
      `    var sum float64`,
      `    for _, ${v} := range ${vs} {`,
      `        sum += ${val}`,
      `    }`,
      `    return sum / float64(len(${vs}))`,
      `}`);
  },
  maxBy: (c) => {
    const { E, v, vs, N } = names(c);
    return L(`func Find${E}WithMax${N}(${vs} []${E}) (${E}, bool) {`,
      `    if len(${vs}) == 0 {`,
      `        return ${E}{}, false`,
      `    }`,
      `    best := ${vs}[0]`,
      `    for _, ${v} := range ${vs}[1:] {`,
      `        if ${v}.${N} > best.${N} {`,
      `            best = ${v}`,
      `        }`,
      `    }`,
      `    return best, true`,
      `}`);
  },
  minBy: (c) => {
    const { E, vs, N } = names(c);
    return L(`func Find${E}WithMin${N}(${vs} []${E}) (${E}, bool) {`,
      `    if len(${vs}) == 0 {`,
      `        return ${E}{}, false`,
      `    }`,
      `    return slices.MinFunc(${vs}, func(a, b ${E}) int {`,
      `        return cmp.Compare(a.${N}, b.${N})`,
      `    }), true`,
      `}`);
  },
  filter: (c) => {
    const { E, Ep, v, vs, B } = names(c);
    return L(`func ${B}${Ep}(${vs} []${E}) []${E} {`,
      `    var result []${E}`,
      `    for _, ${v} := range ${vs} {`,
      `        if ${v}.${B} {`,
      `            result = append(result, ${v})`,
      `        }`,
      `    }`,
      `    return result`,
      `}`);
  },
  count: (c) => {
    const { E, Ep, v, vs, B } = names(c);
    return L(`func Count${B}${Ep}(${vs} []${E}) int {`,
      `    count := 0`,
      `    for _, ${v} := range ${vs} {`,
      `        if ${v}.${B} {`,
      `            count++`,
      `        }`,
      `    }`,
      `    return count`,
      `}`);
  },
  find: (c) => {
    const { E, v, vs, S, s } = names(c);
    return L(`func Find${E}By${S}(${vs} []${E}, ${s} string) (*${E}, error) {`,
      `    for i := range ${vs} {`,
      `        if ${vs}[i].${S} == ${s} {`,
      `            return &${vs}[i], nil`,
      `        }`,
      `    }`,
      `    return nil, fmt.Errorf("${v} not found: %s", ${s})`,
      `}`);
  },
  map: (c) => {
    const { E, v, vs, S, Ss } = names(c);
    return L(`func ${E}${Ss}(${vs} []${E}) []string {`,
      `    result := make([]string, 0, len(${vs}))`,
      `    for _, ${v} := range ${vs} {`,
      `        result = append(result, ${v}.${S})`,
      `    }`,
      `    return result`,
      `}`);
  },
  sort: (c) => {
    const { E, Ep, vs, N } = names(c);
    return [
      L(`func Sort${Ep}By${N}(${vs} []${E}) {`,
        `    sort.Slice(${vs}, func(i, j int) bool {`,
        `        return ${vs}[i].${N} > ${vs}[j].${N}`,
        `    })`,
        `}`),
      L(`func Sort${Ep}By${N}(${vs} []${E}) {`,
        `    slices.SortFunc(${vs}, func(a, b ${E}) int {`,
        `        return cmp.Compare(b.${N}, a.${N})`,
        `    })`,
        `}`),
    ];
  },
  any: (c) => {
    const { E, v, vs, N, NT } = names(c);
    return L(`func Any${N}Above(${vs} []${E}, limit ${NT}) bool {`,
      `    for _, ${v} := range ${vs} {`,
      `        if ${v}.${N} > limit {`,
      `            return true`,
      `        }`,
      `    }`,
      `    return false`,
      `}`);
  },
  classDef: (c) => {
    const { E } = names(c);
    return [
      L(`type ${E} struct {`, ...structFields(c, false), `}`),
      L(`type ${E} struct {`, ...structFields(c, true), `}`),
    ];
  },
  validate: (c) => {
    const { E, r, N } = names(c);
    return L(`func (${r} ${E}) Validate() error {`,
      `    if ${r}.${N} < 0 {`,
      `        return errors.New("${snake(c.num.n)} cannot be negative")`,
      `    }`,
      `    return nil`,
      `}`);
  },
  toggle: (c) => {
    const { E, r, B } = names(c);
    return L(`func (${r} *${E}) Toggle${B}() {`,
      `    ${r}.${B} = !${r}.${B}`,
      `}`);
  },
  describe: (c) => {
    const { E, r, S, N } = names(c);
    return L(`func (${r} ${E}) String() string {`,
      `    return fmt.Sprintf("${E}: %s (%v)", ${r}.${S}, ${r}.${N})`,
      `}`);
  },
  index: (c) => {
    const { E, Ep, v, vs, S } = names(c);
    return L(`func Index${Ep}By${S}(${vs} []${E}) map[string]${E} {`,
      `    index := make(map[string]${E}, len(${vs}))`,
      `    for _, ${v} := range ${vs} {`,
      `        index[${v}.${S}] = ${v}`,
      `    }`,
      `    return index`,
      `}`);
  },
  topN: (c) => {
    const { E, Ep, vs, N } = names(c);
    return L(`func Top${Ep}By${N}(${vs} []${E}, n int) []${E} {`,
      `    sorted := slices.Clone(${vs})`,
      `    sort.Slice(sorted, func(i, j int) bool {`,
      `        return sorted[i].${N} > sorted[j].${N}`,
      `    })`,
      `    return sorted[:min(n, len(sorted))]`,
      `}`);
  },
  sumIf: (c) => {
    const { E, Ep, v, vs, N, NT, B } = names(c);
    return L(`func Total${N}Of${B}${Ep}(${vs} []${E}) ${NT} {`,
      `    var total ${NT}`,
      `    for _, ${v} := range ${vs} {`,
      `        if ${v}.${B} {`,
      `            total += ${v}.${N}`,
      `        }`,
      `    }`,
      `    return total`,
      `}`);
  },
  page: (c) => {
    const { E, Ep, vs } = names(c);
    return L(`func Paginate${Ep}(${vs} []${E}, page, size int) []${E} {`,
      `    start := (page - 1) * size`,
      `    if start >= len(${vs}) {`,
      `        return nil`,
      `    }`,
      `    end := min(start+size, len(${vs}))`,
      `    return ${vs}[start:end]`,
      `}`);
  },
  fetch: (c) => {
    const { E, Ep, vs } = names(c);
    return L(`func Fetch${Ep}(url string) ([]${E}, error) {`,
      `    resp, err := http.Get(url)`,
      `    if err != nil {`,
      `        return nil, err`,
      `    }`,
      `    defer resp.Body.Close()`,
      ``,
      `    var ${vs} []${E}`,
      `    if err := json.NewDecoder(resp.Body).Decode(&${vs}); err != nil {`,
      `        return nil, err`,
      `    }`,
      `    return ${vs}, nil`,
      `}`);
  },
  partition: (c) => {
    const { E, Ep, v, vs, B } = names(c);
    return L(`func Split${Ep}By${B}(${vs} []${E}) (matching, rest []${E}) {`,
      `    for _, ${v} := range ${vs} {`,
      `        if ${v}.${B} {`,
      `            matching = append(matching, ${v})`,
      `        } else {`,
      `            rest = append(rest, ${v})`,
      `        }`,
      `    }`,
      `    return matching, rest`,
      `}`);
  },
  increase: (c) => {
    const { E, r, N, NT } = names(c);
    return L(`func (${r} *${E}) Increase${N}(amount ${NT}) error {`,
      `    if amount <= 0 {`,
      `        return errors.New("amount must be positive")`,
      `    }`,
      `    ${r}.${N} += amount`,
      `    return nil`,
      `}`);
  },
  fibonacci: () => L(`func Fibonacci(n int) []int {`,
    `    sequence := []int{0, 1}`,
    `    for len(sequence) < n {`,
    `        size := len(sequence)`,
    `        sequence = append(sequence, sequence[size-1]+sequence[size-2])`,
    `    }`,
    `    return sequence[:min(n, len(sequence))]`,
    `}`),
  factorial: () => L(`func Factorial(n int) int {`,
    `    result := 1`,
    `    for i := 2; i <= n; i++ {`,
    `        result *= i`,
    `    }`,
    `    return result`,
    `}`),
  isPrime: () => L(`func IsPrime(n int) bool {`,
    `    if n < 2 {`,
    `        return false`,
    `    }`,
    `    for i := 2; i*i <= n; i++ {`,
    `        if n%i == 0 {`,
    `            return false`,
    `        }`,
    `    }`,
    `    return true`,
    `}`),
  gcd: () => L(`func Gcd(a, b int) int {`,
    `    for b != 0 {`,
    `        a, b = b, a%b`,
    `    }`,
    `    return a`,
    `}`),
  reverse: () => L(`func Reverse(text string) string {`,
    `    runes := []rune(text)`,
    `    for i, j := 0, len(runes)-1; i < j; i, j = i+1, j-1 {`,
    `        runes[i], runes[j] = runes[j], runes[i]`,
    `    }`,
    `    return string(runes)`,
    `}`),
  palindrome: () => L(`func IsPalindrome(word string) bool {`,
    `    cleaned := strings.ToLower(strings.ReplaceAll(word, " ", ""))`,
    `    return cleaned == Reverse(cleaned)`,
    `}`),
  vowels: () => L(`func CountVowels(text string) int {`,
    `    count := 0`,
    `    for _, ch := range strings.ToLower(text) {`,
    `        if strings.ContainsRune("aeiou", ch) {`,
    `            count++`,
    `        }`,
    `    }`,
    `    return count`,
    `}`),
  fizzbuzz: () => L(`func FizzBuzz(n int) {`,
    `    for i := 1; i <= n; i++ {`,
    `        switch {`,
    `        case i%15 == 0:`,
    `            fmt.Println("FizzBuzz")`,
    `        case i%3 == 0:`,
    `            fmt.Println("Fizz")`,
    `        case i%5 == 0:`,
    `            fmt.Println("Buzz")`,
    `        default:`,
    `            fmt.Println(i)`,
    `        }`,
    `    }`,
    `}`),
  binarySearch: () => L(`func BinarySearch(items []int, target int) int {`,
    `    low, high := 0, len(items)-1`,
    `    for low <= high {`,
    `        mid := (low + high) / 2`,
    `        switch {`,
    `        case items[mid] == target:`,
    `            return mid`,
    `        case items[mid] < target:`,
    `            low = mid + 1`,
    `        default:`,
    `            high = mid - 1`,
    `        }`,
    `    }`,
    `    return -1`,
    `}`),
  clamp: () => L(`func Clamp(value, low, high float64) float64 {`,
    `    return max(low, min(value, high))`,
    `}`),
  celsius: () => L(`func CelsiusToFahrenheit(celsius float64) float64 {`,
    `    return celsius*9/5 + 32`,
    `}`),
  discount: () => L(`func ApplyDiscount(price, percent float64) (float64, error) {`,
    `    if percent < 0 || percent > 100 {`,
    `        return 0, fmt.Errorf("invalid percent: %.2f", percent)`,
    `    }`,
    `    return math.Round(price*(100-percent)) / 100, nil`,
    `}`),
  maxValue: () => L(`func MaxValue(numbers []int) int {`,
    `    largest := numbers[0]`,
    `    for _, number := range numbers[1:] {`,
    `        if number > largest {`,
    `            largest = number`,
    `        }`,
    `    }`,
    `    return largest`,
    `}`),
  wordCount: () => L(`func WordFrequency(text string) map[string]int {`,
    `    counts := make(map[string]int)`,
    `    for _, word := range strings.Fields(strings.ToLower(text)) {`,
    `        counts[word]++`,
    `    }`,
    `    return counts`,
    `}`),
  readFile: () => L(`func ReadFile(path string) (string, error) {`,
    `    data, err := os.ReadFile(path)`,
    `    if err != nil {`,
    `        return "", fmt.Errorf("read %s: %w", path, err)`,
    `    }`,
    `    return string(data), nil`,
    `}`),
  enum: (c) => {
    const name = pascal({ w: c.enumSet.name });
    const vals = c.enumSet.values.map((v) => name + pascal({ w: v }));
    return L(`type ${name} int`,
      ``,
      `const (`,
      `    ${vals[0]} ${name} = iota`,
      ...vals.slice(1).map((v) => `    ${v}`),
      `)`);
  },
  shape: (c) => {
    const s = c.shape;
    const cls = pascal({ w: [s.name] });
    const r = s.name[0];
    const P = (p: string) => pascal({ w: [p] });
    const area = {
      circle: `math.Pi * ${r}.Radius * ${r}.Radius`,
      rect: `${r}.Width * ${r}.Height`,
      square: `${r}.Side * ${r}.Side`,
      triangle: `${r}.Base * ${r}.Height / 2`,
    }[s.kind];
    return L(`type ${cls} struct {`,
      `    ${s.params.map(P).join(", ")} float64`,
      `}`,
      ``,
      `func (${r} ${cls}) Area() float64 {`,
      `    return ${area}`,
      `}`);
  },
  sumEven: () => L(`func SumEven(numbers []int) int {`,
    `    sum := 0`,
    `    for _, n := range numbers {`,
    `        if n%2 == 0 {`,
    `            sum += n`,
    `        }`,
    `    }`,
    `    return sum`,
    `}`),
  average: () => L(`func Average(numbers []float64) float64 {`,
    `    if len(numbers) == 0 {`,
    `        return 0`,
    `    }`,
    `    var sum float64`,
    `    for _, n := range numbers {`,
    `        sum += n`,
    `    }`,
    `    return sum / float64(len(numbers))`,
    `}`),
  capitalize: () => L(`func CapitalizeWords(text string) string {`,
    `    words := strings.Fields(text)`,
    `    for i, word := range words {`,
    `        words[i] = strings.ToUpper(word[:1]) + word[1:]`,
    `    }`,
    `    return strings.Join(words, " ")`,
    `}`),
};
