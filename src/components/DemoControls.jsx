import { useState } from "react";
import { useMenu } from "../context/useMenu.js";
import { isFailureSimulated, setFailureSimulated } from "../services/mockApi.js";

// Labelled demonstration control (Task 6): switches the menu loading failure on and off.
export default function DemoControls() {
  const { reload } = useMenu();
  const [failureOn, setFailureOn] = useState(isFailureSimulated);

  function handleChange(event) {
    const on = event.target.checked;
    setFailureSimulated(on);
    setFailureOn(on);
  }

  return (
    <section className="demo-controls" aria-label="Demonstration controls">
      <h2>Demonstration controls</h2>
      <label>
        <input type="checkbox" checked={failureOn} onChange={handleChange} /> Simulate a menu
        loading failure
      </label>
      <button type="button" className="btn btn-secondary" onClick={reload}>
        Reload menu
      </button>
    </section>
  );
}
