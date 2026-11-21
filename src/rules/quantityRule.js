// Rule 1: availability / capacity (numeric limit).
// Any item can be ordered 1 to 10 times; limited-batch items 1 to 2 times.
// The limit itself lives in the data (maxPerOrder in menuItems.js), so changing
// it there changes the whole app.

export function limitLabel(item) {
  return `Max ${item.maxPerOrder} per order`;
}

// Is this quantity allowed? Returns { ok, max, message }.
// The message is specific, so the customer knows which item and which limit.
export function checkQuantity(item, quantity) {
  const max = item.maxPerOrder;
  if (!Number.isInteger(quantity) || quantity < 1) {
    return { ok: false, max, message: `${item.name}: quantity must be a whole number from 1 to ${max}.` };
  }
  if (quantity > max) {
    const why = item.limitedBatch ? "limited batch, " : "";
    return { ok: false, max, message: `${item.name}: ${why}maximum ${max} per order.` };
  }
  return { ok: true, max, message: null };
}

// Can the plus button still add one more? (It is disabled when this is false.)
export function canIncrease(item, quantity) {
  return quantity < item.maxPerOrder;
}

// Pull a quantity back into the allowed range (used when restoring a saved cart).
export function clampQuantity(item, quantity) {
  if (!Number.isInteger(quantity) || quantity < 1) return 1;
  return Math.min(quantity, item.maxPerOrder);
}
