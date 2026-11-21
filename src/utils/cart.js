// Cart logic. The cart is a plain array of { id, quantity }.
// Every function returns a NEW array and never changes the one it was given
// (immutable updates), which is what lets React notice the change.

import { clampQuantity } from "../rules/quantityRule.js";

export function addItem(cart, item, amount = 1) {
  const existing = cart.find((line) => line.id === item.id);
  if (!existing) {
    return [...cart, { id: item.id, quantity: clampQuantity(item, amount) }];
  }
  return cart.map((line) =>
    line.id === item.id ? { ...line, quantity: clampQuantity(item, line.quantity + amount) } : line
  );
}

export function setQuantity(cart, item, quantity) {
  if (quantity < 1) return removeItem(cart, item.id);
  return cart.map((line) =>
    line.id === item.id ? { ...line, quantity: clampQuantity(item, quantity) } : line
  );
}

export function removeItem(cart, id) {
  return cart.filter((line) => line.id !== id);
}

// Join cart entries with menu records: [{ item, quantity }]. Unknown ids are skipped.
export function cartLines(cart, menuItems) {
  return cart.flatMap((line) => {
    const item = menuItems.find((m) => m.id === line.id);
    return item ? [{ item, quantity: line.quantity }] : [];
  });
}

// A cart read back from localStorage may be old, edited or damaged, so it is
// checked against the current menu. Every correction is reported, nothing is silent.
export function sanitizeCart(saved, menuItems) {
  const notes = [];
  if (!Array.isArray(saved)) return { cart: [], notes };

  const seen = new Set();
  const cart = [];
  for (const entry of saved) {
    const id = entry && entry.id;
    const item = menuItems.find((m) => m.id === id);
    if (!item) {
      notes.push("An item in your saved order is no longer on the menu and was removed.");
      continue;
    }
    if (seen.has(id)) continue;
    seen.add(id);
    if (item.soldOut) {
      notes.push(`${item.name} is sold out now and was removed from your saved order.`);
      continue;
    }
    const wanted = Number(entry.quantity);
    const fixed = clampQuantity(item, wanted);
    if (Number.isInteger(wanted) && wanted > item.maxPerOrder) {
      notes.push(`${item.name} was reduced from ${wanted} to ${fixed} (maximum ${item.maxPerOrder} per order).`);
    }
    cart.push({ id, quantity: fixed });
  }
  return { cart, notes };
}
