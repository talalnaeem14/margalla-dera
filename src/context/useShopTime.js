import { useContext } from "react";
import { ShopTimeContext } from "./shopTimeContext.js";

export function useShopTime() {
  const value = useContext(ShopTimeContext);
  if (!value) {
    throw new Error("useShopTime must be used inside ShopTimeProvider");
  }
  return value;
}
