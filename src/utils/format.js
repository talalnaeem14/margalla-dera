// Formats a number as a price, e.g. 1450 -> "Rs. 1,450".
export function formatPrice(amount) {
  return `Rs. ${amount.toLocaleString("en-PK")}`;
}
