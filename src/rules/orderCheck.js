// Puts the three rules together: what stops this order from being placed right now?
// The cart page shows every message, and checkout is disabled while any exist.

import { findConflict } from "./compatibilityRule.js";
import { isOpenAt, statusMessage } from "./orderingHours.js";
import { checkQuantity } from "./quantityRule.js";

export function getOrderProblems(lines, minutes) {
  const problems = [];
  if (lines.length === 0) {
    problems.push({ code: "empty", message: "Your order is empty. Add an item to continue." });
  }
  for (const { item, quantity } of lines) {
    if (item.soldOut) {
      problems.push({ code: "unavailable", itemId: item.id, message: `${item.name} is sold out. Remove it to continue.` });
    }
    const result = checkQuantity(item, quantity);
    if (!result.ok) problems.push({ code: "quantity", itemId: item.id, message: result.message });
  }
  const conflict = findConflict(lines);
  if (conflict) problems.push({ code: "conflict", message: conflict.message });
  if (!isOpenAt(minutes)) problems.push({ code: "closed", message: statusMessage(minutes) });
  return problems;
}
