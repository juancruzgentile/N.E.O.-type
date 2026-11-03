import { type Field, type Nm, L, pascal, plural, snake } from "../base";
import type { FullCtx, LangImpls } from "../concepts";

// C++20: structs en PascalCase, funciones y miembros en snake_case (como la biblioteca estándar), std::vector para
// las colecciones y los algoritmos de std::ranges.

/** Palabras reservadas de C++ que aparecen como nombre de campo. */
const RESERVED: Record<string, string> = { explicit: "is_explicit" };
const id = (n: Nm) => RESERVED[snake(n)] ?? snake(n);

const ty = (f: Field) => ({ int: "int", float: "double", str: "std::string", bool: "bool" })[f.t];

const names = (c: FullCtx) => ({
  E: pascal(c.ent.s),
  v: snake(c.ent.s),
  vs: snake(c.ent.p),
  n: id(c.num.n),
  NT: ty(c.num),
  s: id(c.str.n),
  ss: snake(plural(c.str.n)),
  b: id(c.flag.n),
});

export const cpp: LangImpls = {
  sum: (c) => {
    const { E, v, vs, n, NT } = names(c);
    return [
      L(`${NT} total_${n}(const std::vector<${E}>& ${vs})`,
        `{`,
        `    return std::accumulate(${vs}.begin(), ${vs}.end(), ${NT}{},`,
        `        [](${NT} acc, const ${E}& ${v}) { return acc + ${v}.${n}; });`,
        `}`),
      L(`${NT} total_${n}(const std::vector<${E}>& ${vs})`,
        `{`,
        `    ${NT} total{};`,
        `    for (const auto& ${v} : ${vs}) {`,
        `        total += ${v}.${n};`,
        `    }`,
        `    return total;`,
        `}`),
    ];
  },
  avg: (c) => {
    const { E, v, vs, n } = names(c);
    return L(`double average_${n}(const std::vector<${E}>& ${vs})`,
      `{`,
      `    if (${vs}.empty()) {`,
      `        return 0.0;`,
      `    }`,
      `    double total = 0.0;`,
      `    for (const auto& ${v} : ${vs}) {`,
      `        total += ${v}.${n};`,
      `    }`,
      `    return total / ${vs}.size();`,
      `}`);
  },
  maxBy: (c) => {
    const { E, v, vs, n } = names(c);
    return L(`std::optional<${E}> ${v}_with_max_${n}(const std::vector<${E}>& ${vs})`,
      `{`,
      `    if (${vs}.empty()) {`,
      `        return std::nullopt;`,
      `    }`,
      `    return *std::ranges::max_element(${vs}, {}, &${E}::${n});`,
      `}`);
  },
  minBy: (c) => {
    const { E, v, vs, n } = names(c);
    return L(`std::optional<${E}> ${v}_with_min_${n}(const std::vector<${E}>& ${vs})`,
      `{`,
      `    if (${vs}.empty()) {`,
      `        return std::nullopt;`,
      `    }`,
      `    return *std::ranges::min_element(${vs}, {}, &${E}::${n});`,
      `}`);
  },
  filter: (c) => {
    const { E, v, vs, b } = names(c);
    return [
      L(`std::vector<${E}> ${b}_${vs}(const std::vector<${E}>& ${vs})`,
        `{`,
        `    std::vector<${E}> result;`,
        `    std::ranges::copy_if(${vs}, std::back_inserter(result), &${E}::${b});`,
        `    return result;`,
        `}`),
      L(`std::vector<${E}> ${b}_${vs}(const std::vector<${E}>& ${vs})`,
        `{`,
        `    std::vector<${E}> result;`,
        `    for (const auto& ${v} : ${vs}) {`,
        `        if (${v}.${b}) {`,
        `            result.push_back(${v});`,
        `        }`,
        `    }`,
        `    return result;`,
        `}`),
    ];
  },
  count: (c) => {
    const { E, vs, b } = names(c);
    return L(`std::size_t count_${b}_${vs}(const std::vector<${E}>& ${vs})`,
      `{`,
      `    return std::ranges::count_if(${vs}, &${E}::${b});`,
      `}`);
  },
  find: (c) => {
    const { E, v, vs, s } = names(c);
    return L(`std::optional<${E}> find_${v}_by_${s}(const std::vector<${E}>& ${vs}, std::string_view ${s})`,
      `{`,
      `    auto it = std::ranges::find(${vs}, ${s}, &${E}::${s});`,
      `    if (it == ${vs}.end()) {`,
      `        return std::nullopt;`,
      `    }`,
      `    return *it;`,
      `}`);
  },
  map: (c) => {
    const { E, v, vs, s, ss } = names(c);
    return L(`std::vector<std::string> ${v}_${ss}(const std::vector<${E}>& ${vs})`,
      `{`,
      `    std::vector<std::string> result;`,
      `    result.reserve(${vs}.size());`,
      `    std::ranges::transform(${vs}, std::back_inserter(result), &${E}::${s});`,
      `    return result;`,
      `}`);
  },
  sort: (c) => {
    const { E, vs, n } = names(c);
    return L(`void sort_${vs}_by_${n}(std::vector<${E}>& ${vs})`,
      `{`,
      `    std::ranges::sort(${vs}, std::greater{}, &${E}::${n});`,
      `}`);
  },
  any: (c) => {
    const { E, v, vs, n, NT } = names(c);
    return L(`bool any_${n}_above(const std::vector<${E}>& ${vs}, ${NT} limit)`,
      `{`,
      `    return std::ranges::any_of(${vs}, [limit](const ${E}& ${v}) { return ${v}.${n} > limit; });`,
      `}`);
  },
  classDef: (c) => {
    const { E } = names(c);
    return L(`struct ${E} {`,
      ...c.ent.fields.map((f) => `    ${ty(f)} ${id(f.n)}${f.t === "str" ? "" : "{}"};`),
      `};`);
  },
  validate: (c) => {
    const { E, v, n } = names(c);
    return L(`void validate_${n}(const ${E}& ${v})`,
      `{`,
      `    if (${v}.${n} < 0) {`,
      `        throw std::invalid_argument("${n} cannot be negative");`,
      `    }`,
      `}`);
  },
  toggle: (c) => {
    const { E, v, b } = names(c);
    return L(`void toggle_${b}(${E}& ${v})`,
      `{`,
      `    ${v}.${b} = !${v}.${b};`,
      `}`);
  },
  describe: (c) => {
    const { E, v, s, n } = names(c);
    return L(`std::string describe(const ${E}& ${v})`,
      `{`,
      `    return std::format("${E}: {} ({})", ${v}.${s}, ${v}.${n});`,
      `}`);
  },
  index: (c) => {
    const { E, v, vs, s } = names(c);
    return L(`std::unordered_map<std::string, ${E}> index_${vs}_by_${s}(const std::vector<${E}>& ${vs})`,
      `{`,
      `    std::unordered_map<std::string, ${E}> index;`,
      `    for (const auto& ${v} : ${vs}) {`,
      `        index.emplace(${v}.${s}, ${v});`,
      `    }`,
      `    return index;`,
      `}`);
  },
  topN: (c) => {
    const { E, vs, n } = names(c);
    return L(`std::vector<${E}> top_${vs}_by_${n}(std::vector<${E}> ${vs}, std::size_t n = 3)`,
      `{`,
      `    n = std::min(n, ${vs}.size());`,
      `    std::ranges::partial_sort(${vs}, ${vs}.begin() + n, std::greater{}, &${E}::${n});`,
      `    ${vs}.resize(n);`,
      `    return ${vs};`,
      `}`);
  },
  sumIf: (c) => {
    const { E, v, vs, n, NT, b } = names(c);
    return L(`${NT} total_${n}_of_${b}_${vs}(const std::vector<${E}>& ${vs})`,
      `{`,
      `    ${NT} total{};`,
      `    for (const auto& ${v} : ${vs}) {`,
      `        if (${v}.${b}) {`,
      `            total += ${v}.${n};`,
      `        }`,
      `    }`,
      `    return total;`,
      `}`);
  },
  page: (c) => {
    const { E, vs } = names(c);
    return L(`std::span<const ${E}> paginate_${vs}(std::span<const ${E}> ${vs}, std::size_t page, std::size_t size = 10)`,
      `{`,
      `    const auto first = (page - 1) * size;`,
      `    if (page == 0 || first >= ${vs}.size()) {`,
      `        return {};`,
      `    }`,
      `    return ${vs}.subspan(first, std::min(size, ${vs}.size() - first));`,
      `}`);
  },
  partition: (c) => {
    const { E, vs, b } = names(c);
    return L(`std::pair<std::vector<${E}>, std::vector<${E}>> split_${vs}_by_${b}(const std::vector<${E}>& ${vs})`,
      `{`,
      `    std::vector<${E}> matching;`,
      `    std::vector<${E}> rest;`,
      `    std::ranges::partition_copy(${vs}, std::back_inserter(matching), std::back_inserter(rest), &${E}::${b});`,
      `    return {matching, rest};`,
      `}`);
  },
  increase: (c) => {
    const { E, v, n, NT } = names(c);
    return L(`void increase_${n}(${E}& ${v}, ${NT} amount)`,
      `{`,
      `    if (amount <= 0) {`,
      `        throw std::invalid_argument("amount must be positive");`,
      `    }`,
      `    ${v}.${n} += amount;`,
      `}`);
  },
  fibonacci: () => L(`std::vector<long long> fibonacci(std::size_t n)`,
    `{`,
    `    std::vector<long long> sequence{0, 1};`,
    `    while (sequence.size() < n) {`,
    `        sequence.push_back(sequence[sequence.size() - 1] + sequence[sequence.size() - 2]);`,
    `    }`,
    `    sequence.resize(n);`,
    `    return sequence;`,
    `}`),
  factorial: () => [
    L(`unsigned long long factorial(unsigned int n)`,
      `{`,
      `    unsigned long long result = 1;`,
      `    for (unsigned int i = 2; i <= n; ++i) {`,
      `        result *= i;`,
      `    }`,
      `    return result;`,
      `}`),
    L(`constexpr unsigned long long factorial(unsigned int n)`,
      `{`,
      `    return n <= 1 ? 1 : n * factorial(n - 1);`,
      `}`),
  ],
  isPrime: () => L(`constexpr bool is_prime(int n)`,
    `{`,
    `    if (n < 2) {`,
    `        return false;`,
    `    }`,
    `    for (int i = 2; i * i <= n; ++i) {`,
    `        if (n % i == 0) {`,
    `            return false;`,
    `        }`,
    `    }`,
    `    return true;`,
    `}`),
  gcd: () => [
    L(`int gcd(int a, int b)`,
      `{`,
      `    return b == 0 ? a : gcd(b, a % b);`,
      `}`),
    L(`int gcd(int a, int b)`,
      `{`,
      `    return std::gcd(a, b);`,
      `}`),
  ],
  reverse: () => L(`std::string reverse(std::string text)`,
    `{`,
    `    std::ranges::reverse(text);`,
    `    return text;`,
    `}`),
  palindrome: () => L(`bool is_palindrome(std::string_view word)`,
    `{`,
    `    return std::ranges::equal(word, word | std::views::reverse);`,
    `}`),
  vowels: () => L(`std::size_t count_vowels(std::string_view text)`,
    `{`,
    `    return std::ranges::count_if(text, [](char ch) {`,
    `        return std::string_view{"aeiouAEIOU"}.find(ch) != std::string_view::npos;`,
    `    });`,
    `}`),
  fizzbuzz: () => L(`void fizzbuzz(int n)`,
    `{`,
    `    for (int i = 1; i <= n; ++i) {`,
    `        if (i % 15 == 0) {`,
    `            std::cout << "FizzBuzz\\n";`,
    `        } else if (i % 3 == 0) {`,
    `            std::cout << "Fizz\\n";`,
    `        } else if (i % 5 == 0) {`,
    `            std::cout << "Buzz\\n";`,
    `        } else {`,
    `            std::cout << i << '\\n';`,
    `        }`,
    `    }`,
    `}`),
  binarySearch: () => [
    L(`int binary_search(const std::vector<int>& items, int target)`,
      `{`,
      `    int low = 0;`,
      `    int high = static_cast<int>(items.size()) - 1;`,
      `    while (low <= high) {`,
      `        int mid = low + (high - low) / 2;`,
      `        if (items[mid] == target) {`,
      `            return mid;`,
      `        }`,
      `        if (items[mid] < target) {`,
      `            low = mid + 1;`,
      `        } else {`,
      `            high = mid - 1;`,
      `        }`,
      `    }`,
      `    return -1;`,
      `}`),
    L(`bool contains(const std::vector<int>& items, int target)`,
      `{`,
      `    return std::ranges::binary_search(items, target);`,
      `}`),
  ],
  clamp: () => L(`double clamp(double value, double min, double max)`,
    `{`,
    `    return std::clamp(value, min, max);`,
    `}`),
  celsius: () => L(`constexpr double celsius_to_fahrenheit(double celsius)`,
    `{`,
    `    return celsius * 9.0 / 5.0 + 32.0;`,
    `}`),
  discount: () => L(`double apply_discount(double price, double percent)`,
    `{`,
    `    if (percent < 0 || percent > 100) {`,
    `        throw std::out_of_range("percent must be between 0 and 100");`,
    `    }`,
    `    return price * (1 - percent / 100);`,
    `}`),
  maxValue: () => L(`int max_value(const std::vector<int>& numbers)`,
    `{`,
    `    int largest = numbers.front();`,
    `    for (int number : numbers) {`,
    `        if (number > largest) {`,
    `            largest = number;`,
    `        }`,
    `    }`,
    `    return largest;`,
    `}`),
  wordCount: () => L(`std::map<std::string, int> word_frequency(const std::string& text)`,
    `{`,
    `    std::map<std::string, int> counts;`,
    `    std::istringstream stream(text);`,
    `    std::string word;`,
    `    while (stream >> word) {`,
    `        ++counts[word];`,
    `    }`,
    `    return counts;`,
    `}`),
  readFile: () => L(`std::optional<std::string> read_file(const std::filesystem::path& path)`,
    `{`,
    `    std::ifstream file(path);`,
    `    if (!file) {`,
    `        std::cerr << "Could not read " << path << '\\n';`,
    `        return std::nullopt;`,
    `    }`,
    `    std::ostringstream content;`,
    `    content << file.rdbuf();`,
    `    return content.str();`,
    `}`),
  enum: (c) => {
    const name = pascal({ w: c.enumSet.name });
    return L(`enum class ${name} {`,
      ...c.enumSet.values.map((v) => `    ${pascal({ w: v })},`),
      `};`);
  },
  shape: (c) => {
    const s = c.shape;
    const T = pascal({ w: [s.name] });
    const area = {
      circle: `std::numbers::pi * radius * radius`,
      rect: `width * height`,
      square: `side * side`,
      triangle: `base * height / 2`,
    }[s.kind];
    return L(`class ${T} : public Shape {`,
      `public:`,
      `    ${s.params.length === 1 ? "explicit " : ""}${T}(${s.params.map((p) => `double ${p}`).join(", ")})`,
      `        : ${s.params.map((p) => `${p}(${p})`).join(", ")} {}`,
      ``,
      `    double area() const override { return ${area}; }`,
      ``,
      `private:`,
      ...s.params.map((p) => `    double ${p};`),
      `};`);
  },
  sumEven: () => L(`int sum_even(const std::vector<int>& numbers)`,
    `{`,
    `    int total = 0;`,
    `    for (int n : numbers | std::views::filter([](int x) { return x % 2 == 0; })) {`,
    `        total += n;`,
    `    }`,
    `    return total;`,
    `}`),
  average: () => L(`double average(const std::vector<double>& numbers)`,
    `{`,
    `    if (numbers.empty()) {`,
    `        return 0.0;`,
    `    }`,
    `    return std::accumulate(numbers.begin(), numbers.end(), 0.0) / numbers.size();`,
    `}`),
  capitalize: () => L(`std::string capitalize_words(std::string text)`,
    `{`,
    `    bool start = true;`,
    `    for (char& ch : text) {`,
    `        if (std::isspace(static_cast<unsigned char>(ch))) {`,
    `            start = true;`,
    `        } else if (start) {`,
    `            ch = static_cast<char>(std::toupper(static_cast<unsigned char>(ch)));`,
    `            start = false;`,
    `        }`,
    `    }`,
    `    return text;`,
    `}`),
};
