import { createContext } from "react";

// Holds the shop clock: { minutes, isSimulated, simulatedTime, setSimulated, setSimulatedTime }.
export const ShopTimeContext = createContext(null);
