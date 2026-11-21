// Builds the confirmation record for a simulated order (FR16).
// It is a snapshot: later menu or cart changes must not alter a placed order.

import { PICKUP_POINT } from "../data/serviceAreas.js";
import { calculateSummary } from "./pricing.js";
import { normalizePhone } from "./checkoutForm.js";

export function createOrder({ form, lines, reference, placedAt }) {
  const summary = calculateSummary(lines, form.method);
  const fulfilment =
    form.method === "delivery"
      ? { method: "delivery", sector: form.sector, address: form.address.trim() }
      : { method: "pickup", name: PICKUP_POINT.name, address: PICKUP_POINT.address };

  return {
    reference,
    placedAt,
    nickname: form.nickname.trim(),
    phone: normalizePhone(form.phone),
    notes: form.notes.trim(),
    fulfilment,
    lines: lines.map(({ item, quantity }) => ({
      id: item.id,
      name: item.name,
      unitPrice: item.price,
      quantity,
      lineTotal: item.price * quantity,
    })),
    summary,
  };
}
