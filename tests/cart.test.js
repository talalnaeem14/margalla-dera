import test from "node:test";
import assert from "node:assert/strict";
import { menuItems } from "../src/data/menuItems.js";
import { addItem, cartLines, removeItem, sanitizeCart, setQuantity } from "../src/utils/cart.js";
import { calculateSummary, deliveryFeeFor } from "../src/utils/pricing.js";

const byId = (id) => menuItems.find((i) => i.id === id);

test("addItem adds, then increases, without changing the old cart", () => {
  const empty = [];
  const one = addItem(empty, byId("lassi"));
  const two = addItem(one, byId("lassi"));
  assert.deepEqual(empty, []);
  assert.deepEqual(one, [{ id: "lassi", quantity: 1 }]);
  assert.deepEqual(two, [{ id: "lassi", quantity: 2 }]);
});
test("addItem never goes past the limit", () => {
  let cart = [];
  for (let i = 0; i < 5; i++) cart = addItem(cart, byId("mutton-karahi-half"));
  assert.equal(cart[0].quantity, 2);
});
test("setQuantity to 0 removes the line; removeItem removes by id", () => {
  const cart = [{ id: "lassi", quantity: 2 }, { id: "masala-fries", quantity: 1 }];
  assert.deepEqual(setQuantity(cart, byId("lassi"), 0), [{ id: "masala-fries", quantity: 1 }]);
  assert.deepEqual(removeItem(cart, "lassi"), [{ id: "masala-fries", quantity: 1 }]);
  assert.equal(cart.length, 2);
});
test("cartLines skips ids that are not on the menu", () => {
  const lines = cartLines([{ id: "lassi", quantity: 1 }, { id: "ghost", quantity: 1 }], menuItems);
  assert.equal(lines.length, 1);
});
test("sanitizeCart fixes a damaged saved cart and explains every change", () => {
  const { cart, notes } = sanitizeCart(
    [{ id: "weekend-karahi-feast", quantity: 5 }, { id: "ghost", quantity: 1 }, { id: "lassi", quantity: "x" }],
    menuItems
  );
  assert.deepEqual(cart, [{ id: "weekend-karahi-feast", quantity: 2 }, { id: "lassi", quantity: 1 }]);
  assert.equal(notes.length, 2);
  assert.deepEqual(sanitizeCart("garbage", menuItems), { cart: [], notes: [] });
});
test("sanitizeCart removes sold-out items with a note", () => {
  const menu = menuItems.map((i) => (i.id === "lassi" ? { ...i, soldOut: true } : i));
  const { cart, notes } = sanitizeCart([{ id: "lassi", quantity: 1 }], menu);
  assert.deepEqual(cart, []);
  assert.match(notes[0], /Lassi is sold out/);
});

test("delivery fee: charged below Rs. 2500, free at exactly 2500, free for pickup", () => {
  assert.equal(deliveryFeeFor(2499, "delivery"), 150);
  assert.equal(deliveryFeeFor(2500, "delivery"), 0);
  assert.equal(deliveryFeeFor(500, "pickup"), 0);
  assert.equal(deliveryFeeFor(0, "delivery"), 0);
});
test("calculateSummary totals, serves and amount left for free delivery", () => {
  const lines = [{ item: byId("student-combo"), quantity: 2 }, { item: byId("lassi"), quantity: 1 }];
  const s = calculateSummary(lines, "delivery");
  assert.equal(s.subtotal, 1490);
  assert.equal(s.deliveryFee, 150);
  assert.equal(s.total, 1640);
  assert.equal(s.serves, 3);
  assert.equal(s.amountToFreeDelivery, 1010);
});
