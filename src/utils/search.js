// Search, filter and sort logic for the menu (Problem 1, DECISIONS.md decision 1).
// Everything here is a pure function: same input, same output, no React.
// That makes it easy to test and easy to explain.

export const SORT_OPTIONS = [
  { value: "recommended", label: "Recommended" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Name: A to Z" },
];

export const DEFAULT_FILTERS = {
  q: "",
  category: "all",
  maxPrice: null, // null means "no budget limit"
  sort: "recommended",
};

// Lower-case, strip punctuation, collapse spaces: "Aloo-Paratha!" -> "aloo paratha"
export function normalize(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function tokens(text) {
  const n = normalize(text);
  return n === "" ? [] : n.split(" ");
}

// Edit distance where one swap of neighbouring letters counts as 1 mistake.
// "karhai" -> "karahi" is 1, "majrsty" -> "majesty" is 1.
export function editDistance(a, b) {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const d = Array.from({ length: rows }, () => new Array(cols).fill(0));
  for (let i = 0; i < rows; i++) d[i][0] = i;
  for (let j = 0; j < cols; j++) d[0][j] = j;
  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[a.length][b.length];
}

// How many mistakes we forgive depends on word length. Short words get none,
// so "tea" is never "corrected" into something unrelated.
const MAX_MISTAKES_SHORT = 0; // up to 3 letters
const MAX_MISTAKES_MEDIUM = 1; // 4 to 5 letters
const MAX_MISTAKES_LONG = 2; // 6 letters or more

function allowedMistakes(word) {
  if (word.length <= 3) return MAX_MISTAKES_SHORT;
  if (word.length <= 5) return MAX_MISTAKES_MEDIUM;
  return MAX_MISTAKES_LONG;
}

function searchableText(item) {
  return normalize(`${item.name} ${item.category} ${item.description}`);
}

// An item matches when EVERY word typed appears somewhere in its name, category
// or description. An empty search matches everything.
export function matchItems(items, query) {
  const words = tokens(query);
  if (words.length === 0) return items;
  return items.filter((item) => {
    const text = searchableText(item);
    return words.every((w) => text.includes(w));
  });
}

// "Did you mean...?" Returns a corrected search string, or null if there is
// nothing sensible to suggest. Never applied automatically (see DECISIONS.md).
export function suggestClosest(items, query) {
  const words = tokens(query);
  if (words.length === 0) return null;

  const vocabulary = new Set();
  items.forEach((item) => tokens(searchableText(item)).forEach((w) => vocabulary.add(w)));
  const vocab = [...vocabulary].filter((w) => w.length >= 3);

  let changed = false;
  const corrected = [];
  for (const word of words) {
    if (matchItems(items, word).length > 0) {
      corrected.push(word); // this word already finds something, keep it
      continue;
    }
    let best = null;
    let bestDistance = Infinity;
    for (const candidate of vocab) {
      const dist = editDistance(word, candidate);
      if (dist < bestDistance) {
        best = candidate;
        bestDistance = dist;
      }
    }
    if (best === null || bestDistance > allowedMistakes(word)) return null;
    corrected.push(best);
    changed = true;
  }
  if (!changed) return null;
  const suggestion = corrected.join(" ");
  // Only suggest it if it actually finds something.
  return matchItems(items, suggestion).length > 0 ? suggestion : null;
}

export function getCategories(items) {
  return [...new Set(items.map((item) => item.category))];
}

export function priceRange(items) {
  const prices = items.map((item) => item.price);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

// The one function the menu page calls. Search, category, budget and sort all
// apply to the same list, in this order. The original array is never changed.
export function applyFilters(items, filters) {
  const f = { ...DEFAULT_FILTERS, ...filters };
  let result = matchItems(items, f.q);
  if (f.category !== "all") {
    result = result.filter((item) => item.category === f.category);
  }
  if (f.maxPrice !== null) {
    result = result.filter((item) => item.price <= f.maxPrice);
  }
  const sorted = [...result];
  if (f.sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
  else if (f.sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
  else if (f.sort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
  return sorted;
}

// ---- Filters <-> URL (/?q=lassi&max=500&sort=price-asc) ----
// The URL holds the filters, so Back, Refresh and shared links keep them.
// Anything invalid in the URL is ignored instead of breaking the page.

export function filtersFromParams(params, categories) {
  const q = (params.get("q") ?? "").slice(0, 60);

  const rawCategory = params.get("category");
  const category = categories.includes(rawCategory) ? rawCategory : "all";

  const rawMax = params.get("max");
  const parsedMax = rawMax === null || rawMax.trim() === "" ? NaN : Number(rawMax);
  const maxPrice = Number.isFinite(parsedMax) && parsedMax > 0 ? Math.round(parsedMax) : null;

  const rawSort = params.get("sort");
  const sort = SORT_OPTIONS.some((o) => o.value === rawSort) ? rawSort : "recommended";

  return { q, category, maxPrice, sort };
}

export function filtersToParams(filters) {
  const params = new URLSearchParams();
  if (filters.q.trim() !== "") params.set("q", filters.q);
  if (filters.category !== "all") params.set("category", filters.category);
  if (filters.maxPrice !== null) params.set("max", String(filters.maxPrice));
  if (filters.sort !== "recommended") params.set("sort", filters.sort);
  return params;
}

export function hasActiveFilters(filters) {
  return (
    filters.q.trim() !== "" ||
    filters.category !== "all" ||
    filters.maxPrice !== null ||
    filters.sort !== "recommended"
  );
}
