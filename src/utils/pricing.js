// Order summary: subtotal, delivery fee, total and how many people it serves.
// Delivery costs DELIVERY_FEE, free from FREE_DELIVERY_FROM and for pickup.

import { DELIVERY_FEE, FREE_DELIVERY_FROM } from "../data/serviceAreas.js";

export function deliveryFeeFor(subtotal, method) {
  if (method !== "delivery" || subtotal === 0) return 0;
  return subtotal >= FREE_DELIVERY_FROM ? 0 : DELIVERY_FEE;
}

export function calculateSummary(lines, method = "delivery") {
  const subtotal = lines.reduce((sum, l) => sum + l.item.price * l.quantity, 0);
  const deliveryFee = deliveryFeeFor(subtotal, method);
  return {
    itemCount: lines.reduce((sum, l) => sum + l.quantity, 0),
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
    serves: lines.reduce((sum, l) => sum + l.item.serves * l.quantity, 0),
    amountToFreeDelivery:
      method === "delivery" && subtotal > 0 && subtotal < FREE_DELIVERY_FROM
        ? FREE_DELIVERY_FROM - subtotal
        : 0,
  };
}
