import { useCallback, useEffect, useMemo, useState } from "react";
import { loadMenu } from "../services/mockApi.js";
import { MenuContext } from "./menuContext.js";

// Loads the menu once and shares it with every page, so the menu and the
// details page always see the same data (FR08).
// It also holds the "sold out" demo overrides, so changing availability updates
// every page at once (Task 6 demonstration control).
export default function MenuProvider({ children }) {
  const [state, setState] = useState({ status: "loading", items: [], error: null });
  const [attempt, setAttempt] = useState(0);
  const [soldOutOverrides, setSoldOutOverrides] = useState({});

  useEffect(() => {
    let cancelled = false;

    loadMenu()
      .then((items) => {
        if (!cancelled) setState({ status: "ready", items, error: null });
      })
      .catch((err) => {
        if (!cancelled) setState({ status: "error", items: [], error: err.message });
      });

    // Cleanup: ignore a late answer if the component went away or a retry started.
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const reload = useCallback(() => {
    setState({ status: "loading", items: [], error: null });
    setAttempt((n) => n + 1); // functional update: next value depends on the previous one
  }, []);

  const setSoldOut = useCallback((id, soldOut) => {
    setSoldOutOverrides((prev) => ({ ...prev, [id]: soldOut }));
  }, []);

  // Derived value: the loaded items with any demo override applied on top.
  const items = useMemo(
    () => state.items.map((item) => (item.id in soldOutOverrides ? { ...item, soldOut: soldOutOverrides[item.id] } : item)),
    [state.items, soldOutOverrides]
  );

  const value = useMemo(
    () => ({ status: state.status, error: state.error, items, reload, setSoldOut }),
    [state.status, state.error, items, reload, setSoldOut]
  );

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}
