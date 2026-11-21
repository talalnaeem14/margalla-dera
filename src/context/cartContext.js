import { createContext } from "react";

// Holds the shared order: { lines, itemCount, restoreNotes, addItem, setQuantity, removeItem, clearCart, dismissNotes }.
export const CartContext = createContext(null);
