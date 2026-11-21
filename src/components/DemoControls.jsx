import { useState } from "react";
import { useMenu } from "../context/useMenu.js";
import { useShopTime } from "../context/useShopTime.js";
import "../styles/cart.css";

const BOUNDARY_TIMES = ["07:59", "08:00", "22:29", "22:30"];

// Labelled demonstration controls (Task 6): simulated clock for Rule 3 and a
// switch that marks an item sold out. Not part of the customer journey.
export default function DemoControls() {
  const { items, setSoldOut } = useMenu();
  const { isSimulated, simulatedTime, setSimulated, setSimulatedTime } = useShopTime();
  const [chosenId, setChosenId] = useState("");

  const selected = items.find((i) => i.id === chosenId) ?? items[0];

  return (
    <section className="container demo-panel" aria-labelledby="demo-title">
      <h2 id="demo-title">Demonstration controls (for testing only)</h2>

      <fieldset>
        <legend>Simulated time</legend>
        <label>
          <input type="checkbox" checked={isSimulated} onChange={(e) => setSimulated(e.target.checked)} /> Use
          simulated time
        </label>
        <label className="demo-inline">
          Shop time
          <input
            type="time"
            value={simulatedTime}
            disabled={!isSimulated}
            onChange={(e) => setSimulatedTime(e.target.value)}
          />
        </label>
        <div className="demo-buttons" role="group" aria-label="Boundary times">
          {BOUNDARY_TIMES.map((t) => (
            <button
              key={t}
              type="button"
              className="btn btn-secondary demo-button"
              onClick={() => {
                setSimulated(true);
                setSimulatedTime(t);
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </fieldset>

      {selected && (
        <fieldset>
          <legend>Item availability</legend>
          <label className="demo-inline">
            Item
            <select value={selected.id} onChange={(e) => setChosenId(e.target.value)}>
              {items.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <input type="checkbox" checked={selected.soldOut} onChange={(e) => setSoldOut(selected.id, e.target.checked)} />{" "}
            Mark as sold out
          </label>
        </fieldset>
      )}
    </section>
  );
}
