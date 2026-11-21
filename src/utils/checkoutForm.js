// Checkout form rules (FR10). Pure functions with no React, so they can be tested.
// validateCheckout returns an object of { fieldName: "specific message" }.
// An empty object means the form is valid.

import { DELIVERY_SECTORS } from "../data/serviceAreas.js";

export const EMPTY_FORM = {
  nickname: "",
  phone: "",
  method: "delivery",
  sector: "",
  address: "",
  notes: "",
};

// Named limits so they are easy to find and change.
export const LIMITS = {
  nicknameMin: 2,
  nicknameMax: 20,
  addressMin: 5,
  addressMax: 80,
  notesMax: 120,
};

// Order the fields appear on the page. Used to focus the first mistake.
export const FIELD_ORDER = ["nickname", "phone", "method", "sector", "address", "notes"];

// Spaces and dashes are allowed while typing: "0300 1234567" and "0300-1234567" both work.
export function normalizePhone(value) {
  return value.replace(/[\s-]/g, "");
}

export function validateCheckout(form) {
  const errors = {};

  const nickname = form.nickname.trim();
  if (nickname.length === 0) {
    errors.nickname = "Enter a nickname so we can call out your order.";
  } else if (nickname.length < LIMITS.nicknameMin) {
    errors.nickname = `Nickname must be at least ${LIMITS.nicknameMin} characters.`;
  } else if (nickname.length > LIMITS.nicknameMax) {
    errors.nickname = `Nickname can be at most ${LIMITS.nicknameMax} characters (you have ${nickname.length}).`;
  } else if (!/^[\p{L}\p{N} ]+$/u.test(nickname)) {
    errors.nickname = "Use only letters, numbers and spaces in the nickname.";
  }

  const phone = normalizePhone(form.phone);
  if (phone.length === 0) {
    errors.phone = "Enter a phone number. Use a fictional one, like 0300 0000000.";
  } else if (!/^\d+$/.test(phone)) {
    errors.phone = "The phone number can contain digits, spaces and dashes only.";
  } else if (!/^03\d{9}$/.test(phone)) {
    errors.phone = "Enter 11 digits starting with 03, like 0300 0000000.";
  }

  if (form.method !== "delivery" && form.method !== "pickup") {
    errors.method = "Choose delivery or pickup.";
  }

  // Delivery details only matter for delivery. For pickup they are kept in the form
  // (so switching back does not lose them) but are not checked.
  if (form.method === "delivery") {
    if (!DELIVERY_SECTORS.includes(form.sector)) {
      errors.sector = "Choose one of our delivery sectors.";
    }
    const address = form.address.trim();
    if (address.length < LIMITS.addressMin) {
      errors.address = `Enter a street or house description (at least ${LIMITS.addressMin} characters).`;
    } else if (address.length > LIMITS.addressMax) {
      errors.address = `Keep the address under ${LIMITS.addressMax} characters (you have ${address.length}).`;
    }
  }

  if (form.notes.length > LIMITS.notesMax) {
    errors.notes = `Notes can be at most ${LIMITS.notesMax} characters (you have ${form.notes.length}).`;
  }

  return errors;
}

// The first field with a mistake, in page order, or null.
export function firstInvalidField(errors) {
  return FIELD_ORDER.find((name) => name in errors) ?? null;
}
