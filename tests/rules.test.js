import test from "node:test";
import assert from "node:assert/strict";
import { menuItems } from "../src/data/menuItems.js";
import { canIncrease, checkQuantity } from "../src/rules/quantityRule.js";
import { findConflict } from "../src/rules/compatibilityRule.js";
import { isOpenAt, nextOpening, parseTime } from "../src/rules/orderingHours.js";
import { getOrderProblems } from "../src/rules/orderCheck.js";

const byId = (id) => menuItems.find((i) => i.id === id);
const line = (id, quantity = 1) => ({ item: byId(id), quantity });

// ---- Rule 1: quantity limit ----
test("Rule 1: a normal quantity is accepted", () => {
  assert.equal(checkQuantity(byId("lassi"), 4).ok, true);
});
test("Rule 1: exact limit is accepted (Weekend Karahi Feast x 2)", () => {
  assert.equal(checkQuantity(byId("weekend-karahi-feast"), 2).ok, true);
  assert.equal(canIncrease(byId("weekend-karahi-feast"), 2), false);
});
test("Rule 1: one over the limit is blocked with a specific message", () => {
  const result = checkQuantity(byId("weekend-karahi-feast"), 3);
  assert.equal(result.ok, false);
  assert.match(result.message, /Weekend Karahi Feast.*maximum 2/);
});
test("Rule 1: ordinary items stop at 10, zero and fractions are rejected", () => {
  assert.equal(checkQuantity(byId("lassi"), 10).ok, true);
  assert.equal(checkQuantity(byId("lassi"), 11).ok, false);
  assert.equal(checkQuantity(byId("lassi"), 0).ok, false);
  assert.equal(checkQuantity(byId("lassi"), 1.5).ok, false);
});

// ---- Rule 2: breakfast and BBQ cannot be mixed ----
test("Rule 2: breakfast with an all-day item is accepted", () => {
  assert.equal(findConflict([line("halwa-puri-plate"), line("chicken-tikka-roll")]), null);
});
test("Rule 2: breakfast plus BBQ conflicts and names both items", () => {
  const c = findConflict([line("halwa-puri-plate"), line("chicken-karahi-half")]);
  assert.notEqual(c, null);
  assert.match(c.message, /Halwa Puri Plate/);
  assert.match(c.message, /Chicken Karahi \(Half\)/);
});
test("Rule 2: removing the breakfast item clears the conflict", () => {
  assert.equal(findConflict([line("chicken-karahi-half"), line("chicken-tikka-roll")]), null);
});

// ---- Rule 3: ordering hours, 08:00 included, 22:30 excluded ----
test("Rule 3: boundary times", () => {
  assert.equal(isOpenAt(parseTime("07:59")), false);
  assert.equal(isOpenAt(parseTime("08:00")), true);
  assert.equal(isOpenAt(parseTime("22:29")), true);
  assert.equal(isOpenAt(parseTime("22:30")), false);
});
test("Rule 3: next opening is today before 08:00 and tomorrow after closing", () => {
  assert.equal(nextOpening(parseTime("07:59")).label, "today at 08:00");
  assert.equal(nextOpening(parseTime("23:00")).label, "tomorrow at 08:00");
  assert.equal(nextOpening(parseTime("12:00")), null);
});

// ---- All rules together ----
test("getOrderProblems: a valid order at 12:00 has no problems", () => {
  assert.deepEqual(getOrderProblems([line("lassi", 2)], parseTime("12:00")), []);
});
test("getOrderProblems: reports closed, conflict and over-limit together", () => {
  const codes = getOrderProblems(
    [line("halwa-puri-plate"), line("mutton-karahi-half", 3)],
    parseTime("22:30")
  ).map((p) => p.code);
  assert.deepEqual(codes.sort(), ["closed", "conflict", "quantity"]);
});
test("getOrderProblems: empty cart is a problem", () => {
  assert.equal(getOrderProblems([], parseTime("12:00"))[0].code, "empty");
});

test("getOrderProblems: a sold-out item blocks the order and is named", () => {
  const soldOut = { ...byId("lassi"), soldOut: true };
  const problems = getOrderProblems([{ item: soldOut, quantity: 1 }], parseTime("12:00"));
  assert.equal(problems[0].code, "unavailable");
  assert.match(problems[0].message, /Lassi is sold out/);
});

import { conflictIfAdded } from "../src/rules/compatibilityRule.js";
test("Rule 2: conflictIfAdded warns only when the new item causes the conflict", () => {
  assert.notEqual(conflictIfAdded([line("halwa-puri-plate")], byId("chicken-karahi-half")), null);
  assert.equal(conflictIfAdded([line("halwa-puri-plate")], byId("lassi")), null);
  assert.equal(conflictIfAdded([], byId("chicken-karahi-half")), null);
});

test("conflictIfAdded warns before adding and keeps warning once the item is in the order", async () => {
  const { conflictIfAdded } = await import("../src/rules/compatibilityRule.js");
  const halwa = { id: "h", name: "Halwa Puri Plate", service: "breakfast" };
  const karahi = { id: "k", name: "Chicken Karahi (Half)", service: "bbq" };
  assert.ok(conflictIfAdded([{ item: halwa, quantity: 1 }], karahi));
  assert.ok(conflictIfAdded([{ item: halwa, quantity: 1 }, { item: karahi, quantity: 1 }], karahi));
  assert.equal(conflictIfAdded([], karahi), null);
});
