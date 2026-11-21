import { menuItems } from "../data/menuItems.js";

// Mock loader (FR14). It behaves like a network request: it is asynchronous,
// takes a moment, and can fail. A demonstration checkbox in the footer switches
// the failure on and off; the setting is kept in local storage.

export const FAILURE_KEY = "margalla-dera:simulate-failure";
const LOAD_DELAY_MS = 600;

export function isFailureSimulated() {
  try {
    return localStorage.getItem(FAILURE_KEY) === "1";
  } catch {
    return false; // storage unavailable: behave as if the failure is off
  }
}

export function setFailureSimulated(on) {
  try {
    if (on) {
      localStorage.setItem(FAILURE_KEY, "1");
    } else {
      localStorage.removeItem(FAILURE_KEY);
    }
  } catch {
    // storage unavailable: nothing to save
  }
}

export function loadMenu() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (isFailureSimulated()) {
        reject(new Error("The menu could not be loaded. Please try again."));
      } else {
        // Return copies so no component can change the original data.
        resolve(menuItems.map((item) => ({ ...item })));
      }
    }, LOAD_DELAY_MS);
  });
}
