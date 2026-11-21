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

// Would adding this item create a conflict? Used to warn before the click.
export function wouldConflict(lines, item) {
  return findConflict([...lines, { item, quantity: 1 }]) !== null;
}
