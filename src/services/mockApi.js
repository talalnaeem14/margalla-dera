import { menuItems } from "../data/menuItems.js";

// Mock loader (FR14, FR15). It behaves like a network request: it is asynchronous,
// takes a moment, and can fail or come back empty. Two labelled demonstration
// controls in the footer switch those behaviours on and off. The settings are kept
// in local storage so they survive a refresh.

export const FAILURE_KEY = "margalla-dera:simulate-failure";
export const EMPTY_KEY = "margalla-dera:simulate-empty";
const LOAD_DELAY_MS = 600;

function readFlag(key) {
  try {
    return localStorage.getItem(key) === "1";
  } catch {
    return false; // storage unavailable: behave as if the setting is off
  }
}

function writeFlag(key, on) {
  try {
    if (on) {
      localStorage.setItem(key, "1");
    } else {
      localStorage.removeItem(key);
    }
  } catch {
    // storage unavailable: nothing to save
  }
}

export const isFailureSimulated = () => readFlag(FAILURE_KEY);
export const setFailureSimulated = (on) => writeFlag(FAILURE_KEY, on);
export const isEmptySimulated = () => readFlag(EMPTY_KEY);
export const setEmptySimulated = (on) => writeFlag(EMPTY_KEY, on);

export function loadMenu() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (isFailureSimulated()) {
        reject(new Error("The menu could not be loaded. Please try again."));
      } else if (isEmptySimulated()) {
        resolve([]); // loaded fine, but there is nothing on the menu
      } else {
        // Return copies so no component can change the original data.
        resolve(menuItems.map((item) => ({ ...item })));
      }
    }, LOAD_DELAY_MS);
  });
}
