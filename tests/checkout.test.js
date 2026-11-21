import test from "node:test";
import assert from "node:assert/strict";
import { menuItems } from "../src/data/menuItems.js";
import { EMPTY_FORM, LIMITS, firstInvalidField, validateCheckout } from "../src/utils/checkoutForm.js";
import { createOrder } from "../src/utils/order.js";

const valid = { ...EMPTY_FORM, nickname: "Ali", phone: "0300 1234567", sector: "H-11", address: "Street 4, house 12" };

test("a complete delivery form has no errors", () => {
  assert.deepEqual(validateCheckout(valid), {});
});

test("an empty form reports every required field with a specific message", () => {
  const errors = validateCheckout(EMPTY_FORM);
  assert.deepEqual(Object.keys(errors), ["nickname", "phone", "sector", "address"]);
  assert.match(errors.phone, /fictional/);
  assert.equal(firstInvalidField(errors), "nickname");
});

test("nickname length boundaries: 2 and 20 are fine, 1 and 21 are not", () => {
  const check = (nickname) => validateCheckout({ ...valid, nickname }).nickname;
  assert.equal(check("ab"), undefined);
  assert.equal(check("a".repeat(LIMITS.nicknameMax)), undefined);
  assert.ok(check("a"));
  assert.ok(check("a".repeat(LIMITS.nicknameMax + 1)));
  assert.ok(check("Ali!!"));
});

test("phone accepts spaces and dashes, and rejects wrong length or prefix", () => {
  const check = (phone) => validateCheckout({ ...valid, phone }).phone;
  assert.equal(check("0300-1234567"), undefined);
  assert.equal(check("03001234567"), undefined);
  assert.ok(check("030012345"));
  assert.ok(check("04001234567"));
  assert.ok(check("0300abc4567"));
});

test("pickup does not need a sector or address, and delivery does", () => {
  const pickup = { ...valid, method: "pickup", sector: "", address: "" };
  assert.deepEqual(validateCheckout(pickup), {});
  const delivery = { ...valid, sector: "" };
  assert.ok(validateCheckout(delivery).sector);
});

test("delivery address boundary: 5 characters is fine, 4 is not", () => {
  assert.equal(validateCheckout({ ...valid, address: "12345" }).address, undefined);
  assert.ok(validateCheckout({ ...valid, address: "1234" }).address);
});

test("notes limit: 120 characters is fine, 121 is not", () => {
  assert.equal(validateCheckout({ ...valid, notes: "x".repeat(LIMITS.notesMax) }).notes, undefined);
  assert.ok(validateCheckout({ ...valid, notes: "x".repeat(LIMITS.notesMax + 1) }).notes);
});

test("createOrder snapshots lines and totals for delivery", () => {
  const lassi = menuItems.find((i) => i.name === "Lassi");
  const order = createOrder({ form: valid, lines: [{ item: lassi, quantity: 2 }], reference: "MD-1", placedAt: "2026-11-21T10:00:00Z" });
  assert.equal(order.summary.subtotal, lassi.price * 2);
  assert.equal(order.summary.deliveryFee, 150);
  assert.equal(order.summary.total, lassi.price * 2 + 150);
  assert.equal(order.phone, "03001234567");
  assert.equal(order.fulfilment.sector, "H-11");
});

test("createOrder for pickup has no delivery fee and drops the delivery address", () => {
  const lassi = menuItems.find((i) => i.name === "Lassi");
  const form = { ...valid, method: "pickup" };
  const order = createOrder({ form, lines: [{ item: lassi, quantity: 1 }], reference: "MD-2", placedAt: "x" });
  assert.equal(order.summary.deliveryFee, 0);
  assert.equal(order.fulfilment.method, "pickup");
  assert.equal(order.fulfilment.sector, undefined);
});
