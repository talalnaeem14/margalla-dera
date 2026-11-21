// Rule 2: eligibility / compatibility.
// Breakfast items (until 11:30) cannot share an order with BBQ and karahi items
// (from 12:00). All-day items go with either.

function joinNames(items) {
  return items.map((i) => i.name).join(" and ");
}

// lines: [{ item, quantity }]. Returns null when the order is fine, otherwise an
// object naming BOTH sides of the conflict so the app can offer to remove either.
export function findConflict(lines) {
  const breakfast = lines.filter((l) => l.item.service === "breakfast").map((l) => l.item);
  const bbq = lines.filter((l) => l.item.service === "bbq").map((l) => l.item);
  if (breakfast.length === 0 || bbq.length === 0) return null;
  return {
    breakfast,
    bbq,
    message: `${joinNames(breakfast)} (breakfast, until 11:30) cannot be ordered with ${joinNames(bbq)} (BBQ, from 12:00). Remove one side to continue.`,
  };
}

// Is this item part of a conflict, either already in the order or if it were added?
// Used on the details page so the warning shows before adding AND stays visible
// while the clashing items are still in the order. Returns the conflict or null.
export function conflictIfAdded(lines, item) {
  const alreadyIn = lines.some((l) => l.item.id === item.id);
  const withItem = alreadyIn ? lines : [...lines, { item, quantity: 1 }];
  const conflict = findConflict(withItem);
  if (!conflict) return null;
  const involved = [...conflict.breakfast, ...conflict.bbq].some((i) => i.id === item.id);
  return involved ? conflict : null;
}
