// Where Margalla Dera delivers and how delivery is charged.
// All of this is fictional and used only by the simulated checkout.

export const DELIVERY_SECTORS = ["H-9", "H-10", "H-11", "H-12", "G-10", "G-11"];

export const PICKUP_POINT = {
  name: "Margalla Dera kitchen (fictional)",
  address: "H-11 Markaz, Islamabad",
};

// Delivery fee in Rs. It is free for pickup and for subtotals at or above the threshold.
export const DELIVERY_FEE = 150;
export const FREE_DELIVERY_FROM = 2500;