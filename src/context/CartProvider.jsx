import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addItem as addToCart,
  cartLines,
  removeItem as removeFromCart,
  sanitizeCart,
  setQuantity as setCartQuantity,
} from "../utils/cart.js";
import { CartContext } from "./cartContext.js";
import { useMenu } from "./useMenu.js";

const STORAGE_KEY = "margalla-dera-cart-v1";

// Read the saved cart. Anything unreadable becomes an empty cart instead of a crash.
function readSavedCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// One shared cart for the whole app (FR07, FR08) saved in localStorage (FR13).
// Only the cart is saved: no form data and no personal details.
export default function CartProvider({ children }) {
  const { status, items } = useMenu();
  const [cart, setCart] = useState(readSavedCart);
  const [restoreNotes, setRestoreNotes] = useState([]);
  const [restored, setRestored] = useState(false);

  // Once the menu has loaded, check the saved cart against it exactly once.
  // Setting state while rendering is allowed in React when it is guarded like this.
  if (status === "ready" && !restored) {
    const result = sanitizeCart(cart, items);
    setRestored(true);
    setCart(result.cart);
    setRestoreNotes(result.notes);
  }

  // Save after every change, but only after the restore check so a damaged
  // saved cart is never overwritten before it has been explained.
  useEffect(() => {
    if (!restored) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Storage can be full or blocked. The cart still works for this visit.
    }
  }, [cart, restored]);

  // Every update uses the previous cart and returns a new array (immutable).
  const addItem = useCallback((item, amount = 1) => setCart((prev) => addToCart(prev, item, amount)), []);
  const setQuantity = useCallback((item, quantity) => setCart((prev) => setCartQuantity(prev, item, quantity)), []);
  const removeItem = useCallback((id) => setCart((prev) => removeFromCart(prev, id)), []);
  const clearCart = useCallback(() => setCart([]), []);
  const dismissNotes = useCallback(() => setRestoreNotes([]), []);

  // Derived values: the lines and the count are calculated, never stored.
  const lines = useMemo(() => cartLines(cart, items), [cart, items]);
  const itemCount = useMemo(() => lines.reduce((sum, l) => sum + l.quantity, 0), [lines]);

  const value = useMemo(
    () => ({ lines, itemCount, restoreNotes, addItem, setQuantity, removeItem, clearCart, dismissNotes }),
    [lines, itemCount, restoreNotes, addItem, setQuantity, removeItem, clearCart, dismissNotes]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
