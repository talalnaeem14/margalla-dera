import { useEffect, useMemo, useState } from "react";
import { minutesFromDate, parseTime } from "../rules/orderingHours.js";
import { ShopTimeContext } from "./shopTimeContext.js";

const CLOCK_TICK_MS = 30 * 1000;

// The time used by Rule 3 (ordering hours). It follows the real clock unless the
// "Simulated time" demo control is switched on.
export default function ShopTimeProvider({ children }) {
  const [now, setNow] = useState(() => new Date());
  const [isSimulated, setSimulated] = useState(false);
  const [simulatedTime, setSimulatedTime] = useState("12:00");

  // Keep the real clock fresh, and stop the timer when the provider goes away.
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), CLOCK_TICK_MS);
    return () => clearInterval(timer);
  }, []);

  const value = useMemo(() => {
    const simulatedMinutes = parseTime(simulatedTime);
    const useSimulated = isSimulated && simulatedMinutes !== null;
    return {
      minutes: useSimulated ? simulatedMinutes : minutesFromDate(now),
      isSimulated: useSimulated,
      simulatedTime,
      setSimulated,
      setSimulatedTime,
    };
  }, [now, isSimulated, simulatedTime]);

  return <ShopTimeContext.Provider value={value}>{children}</ShopTimeContext.Provider>;
}
