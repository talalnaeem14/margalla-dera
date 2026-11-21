import test from "node:test";
import assert from "node:assert/strict";
import { menuItems } from "../src/data/menuItems.js";
import {
  applyFilters,
  editDistance,
  filtersFromParams,
  filtersToParams,
  matchItems,
  suggestClosest,
} from "../src/utils/search.js";

test("editDistance counts a swapped pair of letters as one mistake", () => {
  assert.equal(editDistance("karhai", "karahi"), 1);
  assert.equal(editDistance("lassi", "lassi"), 0);
});

test("matchItems finds by name, ignores case, and empty search returns all", () => {
  assert.deepEqual(matchItems(menuItems, "LASSI").map((i) => i.id), ["lassi"]);
  assert.equal(matchItems(menuItems, "  ").length, menuItems.length);
});

test("matchItems requires every typed word to match", () => {
  const ids = matchItems(menuItems, "mutton karahi").map((i) => i.id);
  assert.deepEqual(ids, ["mutton-karahi-half"]);
});

test("suggestClosest corrects a one-letter typo", () => {
  assert.equal(suggestClosest(menuItems, "karhai"), "karahi");
  assert.equal(suggestClosest(menuItems, "lasi"), "lassi");
});

test("suggestClosest gives nothing for gibberish or already-valid searches", () => {
  assert.equal(suggestClosest(menuItems, "zzzzqqq"), null);
  assert.equal(suggestClosest(menuItems, "lassi"), null);
  assert.equal(suggestClosest(menuItems, "xy"), null);
});

test("budget filter keeps items at exactly the limit (boundary)", () => {
  const ids = applyFilters(menuItems, { maxPrice: 220 }).map((i) => i.id);
  assert.deepEqual(ids.sort(), ["lassi", "masala-fries"].sort());
  assert.ok(applyFilters(menuItems, { maxPrice: 219 }).every((i) => i.price <= 219));
});

test("search, category, budget and sort work together", () => {
  const result = applyFilters(menuItems, {
    category: "BBQ & Karahi",
    maxPrice: 3000,
    sort: "price-desc",
  });
  assert.deepEqual(result.map((i) => i.price), [2900, 1450, 950]);
});

test("applyFilters does not change the original array", () => {
  const before = menuItems.map((i) => i.id).join(",");
  applyFilters(menuItems, { sort: "price-desc" });
  assert.equal(menuItems.map((i) => i.id).join(","), before);
});

test("invalid URL values fall back to defaults", () => {
  const params = new URLSearchParams("category=nope&max=abc&sort=bad");
  assert.deepEqual(filtersFromParams(params, ["Drinks"]), {
    q: "", category: "all", maxPrice: null, sort: "recommended",
  });
});

test("filters survive a round trip through the URL", () => {
  const filters = { q: "roll", category: "Drinks", maxPrice: 500, sort: "name" };
  const back = filtersFromParams(filtersToParams(filters), ["Drinks"]);
  assert.deepEqual(back, filters);
});
