import { type Field, L, kebab, pascal, plural, snake } from "../base";
import type { FullCtx, LangImpls } from "../concepts";

const ty = (f: Field) => ({ int: "i32", float: "f64", str: "String", bool: "bool" })[f.t];
const zero = (f: Field) => (f.t === "float" ? "0.0" : "0");
const isF = (f: Field) => f.t === "float";

const names = (c: FullCtx) => ({
  E: pascal(c.ent.s),
  v: snake(c.ent.s),
  vs: snake(c.ent.p),
  N: snake(c.num.n),
  NT: ty(c.num),
  S: snake(c.str.n),
  Ss: snake(plural(c.str.n)),
  B: snake(c.flag.n),
});

/** comparación descendente por campo numérico (f64 no implementa Ord) */
const desc = (c: FullCtx, N: string) => (isF(c.num) ? `b.${N}.total_cmp(&a.${N})` : `b.${N}.cmp(&a.${N})`);

export const rust: LangImpls = {
  sum: (c) => {
    const { E, v, vs, N, NT } = names(c);
    return [
      L(`fn total_${N}(${vs}: &[${E}]) -> ${NT} {`,
        `    ${vs}.iter().map(|${v}| ${v}.${N}).sum()`,
        `}`),
      L(`fn total_${N}(${vs}: &[${E}]) -> ${NT} {`,
        `    let mut total = ${zero(c.num)};`,
        `    for ${v} in ${vs} {`,
        `        total += ${v}.${N};`,
        `    }`,
        `    total`,
        `}`),
    ];
  },
  avg: (c) => {
    const { E, v, vs, N } = names(c);
    const val = isF(c.num) ? `${v}.${N}` : `${v}.${N} as f64`;
    return L(`fn average_${N}(${vs}: &[${E}]) -> f64 {`,
      `    if ${vs}.is_empty() {`,
      `        return 0.0;`,
      `    }`,
      `    let sum: f64 = ${vs}.iter().map(|${v}| ${val}).sum();`,
      `    sum / ${vs}.len() as f64`,
      `}`);
  },
  maxBy: (c) => {
    const { E, v, vs, N } = names(c);
    const body = isF(c.num)
      ? `    ${vs}.iter().max_by(|a, b| a.${N}.total_cmp(&b.${N}))`
      : `    ${vs}.iter().max_by_key(|${v}| ${v}.${N})`;
    return L(`fn ${v}_with_max_${N}(${vs}: &[${E}]) -> Option<&${E}> {`, body, `}`);
  },
  minBy: (c) => {
    const { E, v, vs, N } = names(c);
    const body = isF(c.num)
      ? `    ${vs}.iter().min_by(|a, b| a.${N}.total_cmp(&b.${N}))`
      : `    ${vs}.iter().min_by_key(|${v}| ${v}.${N})`;
    return L(`fn ${v}_with_min_${N}(${vs}: &[${E}]) -> Option<&${E}> {`, body, `}`);
  },
  filter: (c) => {
    const { E, v, vs, B } = names(c);
    return L(`fn ${B}_${vs}(${vs}: &[${E}]) -> Vec<&${E}> {`,
      `    ${vs}.iter().filter(|${v}| ${v}.${B}).collect()`,
      `}`);
  },
  count: (c) => {
    const { E, v, vs, B } = names(c);
    return L(`fn count_${B}_${vs}(${vs}: &[${E}]) -> usize {`,
      `    ${vs}.iter().filter(|${v}| ${v}.${B}).count()`,
      `}`);
  },
  find: (c) => {
    const { E, v, vs, S } = names(c);
    return L(`fn find_${v}_by_${S}<'a>(${vs}: &'a [${E}], ${S}: &str) -> Option<&'a ${E}> {`,
      `    ${vs}.iter().find(|${v}| ${v}.${S} == ${S})`,
      `}`);
  },
  map: (c) => {
    const { E, v, vs, S, Ss } = names(c);
    return L(`fn ${v}_${Ss}(${vs}: &[${E}]) -> Vec<String> {`,
      `    ${vs}.iter().map(|${v}| ${v}.${S}.clone()).collect()`,
      `}`);
  },
  sort: (c) => {
    const { E, vs, N } = names(c);
    return L(`fn sort_by_${N}(${vs}: &mut [${E}]) {`,
      `    ${vs}.sort_by(|a, b| ${desc(c, N)});`,
      `}`);
  },
  any: (c) => {
    const { E, v, vs, N, NT } = names(c);
    return L(`fn any_${N}_above(${vs}: &[${E}], limit: ${NT}) -> bool {`,
      `    ${vs}.iter().any(|${v}| ${v}.${N} > limit)`,
      `}`);
  },
  classDef: (c) => {
    const { E } = names(c);
    const fields = c.ent.fields.map((f) => `    pub ${snake(f.n)}: ${ty(f)},`);
    return [
      L(`#[derive(Debug, Clone)]`, `pub struct ${E} {`, ...fields, `}`),
      L(`#[derive(Debug, Clone, PartialEq)]`, `pub struct ${E} {`, ...fields, `}`),
    ];
  },
  validate: (c) => {
    const { E, N } = names(c);
    return L(`impl ${E} {`,
      `    pub fn validate(&self) -> Result<(), String> {`,
      `        if self.${N} < ${zero(c.num)} {`,
      `            return Err(format!("${N} cannot be negative: {}", self.${N}));`,
      `        }`,
      `        Ok(())`,
      `    }`,
      `}`);
  },
  toggle: (c) => {
    const { E, B } = names(c);
    return L(`impl ${E} {`,
      `    pub fn toggle_${B}(&mut self) {`,
      `        self.${B} = !self.${B};`,
      `    }`,
      `}`);
  },
  describe: (c) => {
    const { E, S, N } = names(c);
    return L(`impl fmt::Display for ${E} {`,
      `    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {`,
      `        write!(f, "${E}: {} ({})", self.${S}, self.${N})`,
      `    }`,
      `}`);
  },
  index: (c) => {
    const { E, v, vs, S } = names(c);
    return L(`fn index_by_${S}(${vs}: &[${E}]) -> HashMap<&str, &${E}> {`,
      `    ${vs}.iter().map(|${v}| (${v}.${S}.as_str(), ${v})).collect()`,
      `}`);
  },
  topN: (c) => {
    const { E, vs, N } = names(c);
    return L(`fn top_${vs}_by_${N}(${vs}: &[${E}], n: usize) -> Vec<&${E}> {`,
      `    let mut sorted: Vec<&${E}> = ${vs}.iter().collect();`,
      `    sorted.sort_by(|a, b| ${desc(c, N)});`,
      `    sorted.into_iter().take(n).collect()`,
      `}`);
  },
  sumIf: (c) => {
    const { E, v, vs, N, NT, B } = names(c);
    return L(`fn total_${N}_of_${B}(${vs}: &[${E}]) -> ${NT} {`,
      `    ${vs}.iter()`,
      `        .filter(|${v}| ${v}.${B})`,
      `        .map(|${v}| ${v}.${N})`,
      `        .sum()`,
      `}`);
  },
  page: (c) => {
    const { E, vs } = names(c);
    return L(`fn paginate_${vs}(${vs}: &[${E}], page: usize, size: usize) -> &[${E}] {`,
      `    let start = (page.saturating_sub(1) * size).min(${vs}.len());`,
      `    let end = (start + size).min(${vs}.len());`,
      `    &${vs}[start..end]`,
      `}`);
  },
  fetch: (c) => {
    const { E, vs } = names(c);
    return L(`async fn fetch_${vs}(client: &reqwest::Client) -> Result<Vec<${E}>, reqwest::Error> {`,
      `    client`,
      `        .get("https://api.example.com/${kebab(c.ent.p)}")`,
      `        .send()`,
      `        .await?`,
      `        .json::<Vec<${E}>>()`,
      `        .await`,
      `}`);
  },
  partition: (c) => {
    const { E, v, vs, B } = names(c);
    return L(`fn split_by_${B}(${vs}: Vec<${E}>) -> (Vec<${E}>, Vec<${E}>) {`,
      `    ${vs}.into_iter().partition(|${v}| ${v}.${B})`,
      `}`);
  },
  increase: (c) => {
    const { E, N, NT } = names(c);
    return L(`impl ${E} {`,
      `    pub fn increase_${N}(&mut self, amount: ${NT}) -> Result<(), String> {`,
      `        if amount <= ${zero(c.num)} {`,
      `            return Err(String::from("amount must be positive"));`,
      `        }`,
      `        self.${N} += amount;`,
      `        Ok(())`,
      `    }`,
      `}`);
  },
  fibonacci: () => L(`fn fibonacci(n: usize) -> Vec<u64> {`,
    `    let mut sequence = vec![0, 1];`,
    `    while sequence.len() < n {`,
    `        let next = sequence[sequence.len() - 1] + sequence[sequence.len() - 2];`,
    `        sequence.push(next);`,
    `    }`,
    `    sequence.truncate(n);`,
    `    sequence`,
    `}`),
  factorial: () => [
    L(`fn factorial(n: u64) -> u64 {`, `    (1..=n).product()`, `}`),
    L(`fn factorial(n: u64) -> u64 {`,
      `    match n {`,
      `        0 | 1 => 1,`,
      `        _ => n * factorial(n - 1),`,
      `    }`,
      `}`),
  ],
  isPrime: () => L(`fn is_prime(n: u32) -> bool {`,
    `    if n < 2 {`,
    `        return false;`,
    `    }`,
    `    (2..).take_while(|i| i * i <= n).all(|i| n % i != 0)`,
    `}`),
  gcd: () => L(`fn gcd(a: u64, b: u64) -> u64 {`,
    `    if b == 0 { a } else { gcd(b, a % b) }`,
    `}`),
  reverse: () => L(`fn reverse_text(text: &str) -> String {`, `    text.chars().rev().collect()`, `}`),
  palindrome: () => L(`fn is_palindrome(word: &str) -> bool {`,
    `    let cleaned: String = word.to_lowercase().chars().filter(|c| !c.is_whitespace()).collect();`,
    `    cleaned == cleaned.chars().rev().collect::<String>()`,
    `}`),
  vowels: () => L(`fn count_vowels(text: &str) -> usize {`,
    `    text.to_lowercase().chars().filter(|c| "aeiou".contains(*c)).count()`,
    `}`),
  fizzbuzz: () => L(`fn fizzbuzz(n: u32) {`,
    `    for i in 1..=n {`,
    `        match (i % 3, i % 5) {`,
    `            (0, 0) => println!("FizzBuzz"),`,
    `            (0, _) => println!("Fizz"),`,
    `            (_, 0) => println!("Buzz"),`,
    `            _ => println!("{}", i),`,
    `        }`,
    `    }`,
    `}`),
  binarySearch: () => L(`fn binary_search(items: &[i32], target: i32) -> Option<usize> {`,
    `    let (mut low, mut high) = (0, items.len());`,
    `    while low < high {`,
    `        let mid = low + (high - low) / 2;`,
    `        match items[mid].cmp(&target) {`,
    `            Ordering::Equal => return Some(mid),`,
    `            Ordering::Less => low = mid + 1,`,
    `            Ordering::Greater => high = mid,`,
    `        }`,
    `    }`,
    `    None`,
    `}`),
  clamp: () => L(`fn clamp(value: f64, min: f64, max: f64) -> f64 {`, `    value.max(min).min(max)`, `}`),
  celsius: () => L(`fn celsius_to_fahrenheit(celsius: f64) -> f64 {`, `    celsius * 9.0 / 5.0 + 32.0`, `}`),
  discount: () => L(`fn apply_discount(price: f64, percent: f64) -> Result<f64, String> {`,
    `    if !(0.0..=100.0).contains(&percent) {`,
    `        return Err(format!("invalid percent: {percent}"));`,
    `    }`,
    `    Ok((price * (100.0 - percent)).round() / 100.0)`,
    `}`),
  maxValue: () => L(`fn max_value(numbers: &[i32]) -> Option<i32> {`,
    `    let mut largest = *numbers.first()?;`,
    `    for &number in numbers {`,
    `        if number > largest {`,
    `            largest = number;`,
    `        }`,
    `    }`,
    `    Some(largest)`,
    `}`),
  wordCount: () => L(`fn word_frequency(text: &str) -> HashMap<String, usize> {`,
    `    let mut counts = HashMap::new();`,
    `    for word in text.to_lowercase().split_whitespace() {`,
    `        *counts.entry(word.to_string()).or_insert(0) += 1;`,
    `    }`,
    `    counts`,
    `}`),
  readFile: () => [
    L(`fn read_file(path: &str) -> io::Result<String> {`,
      `    let content = fs::read_to_string(path)?;`,
      `    Ok(content)`,
      `}`),
    L(`fn read_file(path: &str) -> Option<String> {`,
      `    match fs::read_to_string(path) {`,
      `        Ok(content) => Some(content),`,
      `        Err(error) => {`,
      `            eprintln!("could not read {path}: {error}");`,
      `            None`,
      `        }`,
      `    }`,
      `}`),
  ],
  enum: (c) => {
    const name = pascal({ w: c.enumSet.name });
    return L(`#[derive(Debug, Clone, Copy, PartialEq, Eq)]`,
      `pub enum ${name} {`,
      ...c.enumSet.values.map((v) => `    ${pascal({ w: v })},`),
      `}`);
  },
  shape: (c) => {
    const s = c.shape;
    const cls = pascal({ w: [s.name] });
    const area = {
      circle: `PI * self.radius * self.radius`,
      rect: `self.width * self.height`,
      square: `self.side * self.side`,
      triangle: `self.base * self.height / 2.0`,
    }[s.kind];
    return L(`struct ${cls} {`,
      ...s.params.map((p) => `    ${p}: f64,`),
      `}`,
      ``,
      `impl Shape for ${cls} {`,
      `    fn area(&self) -> f64 {`,
      `        ${area}`,
      `    }`,
      `}`);
  },
  sumEven: () => L(`fn sum_even(numbers: &[i32]) -> i32 {`,
    `    numbers.iter().filter(|&&n| n % 2 == 0).sum()`,
    `}`),
  average: () => L(`fn average(numbers: &[f64]) -> f64 {`,
    `    if numbers.is_empty() {`,
    `        return 0.0;`,
    `    }`,
    `    numbers.iter().sum::<f64>() / numbers.len() as f64`,
    `}`),
  capitalize: () => L(`fn capitalize_words(text: &str) -> String {`,
    `    text.split_whitespace()`,
    `        .map(|word| {`,
    `            let mut chars = word.chars();`,
    `            match chars.next() {`,
    `                Some(first) => first.to_uppercase().collect::<String>() + chars.as_str(),`,
    `                None => String::new(),`,
    `            }`,
    `        })`,
    `        .collect::<Vec<_>>()`,
    `        .join(" ")`,
    `}`),
};
