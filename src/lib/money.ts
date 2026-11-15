import type { Digits } from "../types";

const ARAB_DIGITS = "٠١٢٣٤٥٦٧٨٩";

export function toFils(aed: number): number {
  return Math.round(aed * 100);
}

export function fromFils(fils: number): number {
  return fils / 100;
}

export function formatAed(
  amount: number,
  digits: Digits = "latn",
  currency = "AED",
): string {
  const n = Number.isFinite(amount) ? amount : 0;
  const fixed = n.toFixed(2);
  const [whole, frac] = fixed.split(".");
  const withCommas = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  let body = `${withCommas}.${frac}`;
  if (digits === "arab") {
    body = body.replace(/\d/g, (d) => ARAB_DIGITS[Number(d)]);
  }
  return `${currency} ${body}`;
}

export function formatFilsAsAed(fils: number, digits: Digits = "latn"): string {
  return formatAed(fromFils(fils), digits);
}

export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}
