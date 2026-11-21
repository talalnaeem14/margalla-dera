// Rule 3: pricing / fulfilment (order cutoff).
// Orders are accepted from 08:00 to 22:30 shop time: 08:00 is included, 22:30 is not.
// Times are handled as "minutes since midnight" so they are easy to compare and test.

export const OPENING_TIME = "08:00";
export const CLOSING_TIME = "22:30";

export function parseTime(text) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(text);
  if (!match) return null;
  const hours = Number(match[1]);
  const mins = Number(match[2]);
  if (hours > 23 || mins > 59) return null;
  return hours * 60 + mins;
}

export function formatTime(minutes) {
  const h = String(Math.floor(minutes / 60)).padStart(2, "0");
  const m = String(minutes % 60).padStart(2, "0");
  return `${h}:${m}`;
}

export function minutesFromDate(date) {
  return date.getHours() * 60 + date.getMinutes();
}

const OPENS = parseTime(OPENING_TIME);
const CLOSES = parseTime(CLOSING_TIME);

export function isOpenAt(minutes) {
  return minutes >= OPENS && minutes < CLOSES;
}

// When can the customer order next? null while open.
export function nextOpening(minutes) {
  if (isOpenAt(minutes)) return null;
  const day = minutes < OPENS ? "today" : "tomorrow";
  return { day, time: OPENING_TIME, label: `${day} at ${OPENING_TIME}` };
}

// One sentence for the banner and the cart.
export function statusMessage(minutes) {
  if (isOpenAt(minutes)) return `Open now. Orders accepted until ${CLOSING_TIME}.`;
  return `Closed now. We open ${nextOpening(minutes).label}.`;
}
