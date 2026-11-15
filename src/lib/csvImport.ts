import type { Category, Expense, MerchantRule } from "../types";
import { uid } from "./money";

const KEYWORDS: { cat: string; words: string[] }[] = [
  { cat: "Groceries", words: ["carrefour", "lulu", "spinneys", "choithrams", "union coop", "waitrose", "grocery", "supermarket", "baqala"] },
  { cat: "Transport", words: ["careem", "uber", "rta", "salik", "enoc", "adnoc", "emarat", "taxi", "metro", "parking"] },
  { cat: "Bills", words: ["dewa", "sewa", "addc", "aadc", "fewa", "etisalat", "du"] },
  { cat: "Dining out", words: ["talabat", "deliveroo", "noon food", "restaurant", "cafe", "coffee", "starbucks", "mcdonalds", "kfc"] },
  { cat: "Shopping", words: ["amazon", "noon", "namshi", "shein", "ikea", "centrepoint", "max fashion"] },
  { cat: "Entertainment", words: ["vox", "reel cinemas", "playstation", "steam"] },
  { cat: "Subscriptions", words: ["netflix", "shahid", "osn", "spotify", "anghami", "apple.com", "icloud"] },
];

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ",") {
      row.push(cell.trim());
      cell = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell.trim());
      if (row.some((x) => x)) rows.push(row);
      row = [];
      cell = "";
    } else cell += c;
  }
  row.push(cell.trim());
  if (row.some((x) => x)) rows.push(row);
  return rows;
}

export function cleanMerchant(desc: string): string {
  let s = desc
    .replace(/\b\d{4}[\s*-]*\d{4,}\b/g, " ")
    .replace(/\b\d{2}[\/\-]\d{2}[\/\-]\d{2,4}\b/g, " ")
    .replace(/\bREF[.:]?\s*\w+\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return s.split(" ").slice(0, 4).join(" ") || desc.slice(0, 24);
}

export function parseDate(raw: string): string | null {
  const t = raw.trim();
  let m = t.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = t.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (m) {
    const d = m[1].padStart(2, "0");
    const mo = m[2].padStart(2, "0");
    let y = m[3];
    if (y.length === 2) y = `20${y}`;
    return `${y}-${mo}-${d}`;
  }
  m = t.match(/^(\d{1,2})\s+([A-Za-z]{3,})\s+(\d{4})$/);
  if (m) {
    const months: Record<string, string> = {
      jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
      jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
    };
    const mo = months[m[2].slice(0, 3).toLowerCase()];
    if (mo) return `${m[3]}-${mo}-${m[1].padStart(2, "0")}`;
  }
  return null;
}

export function matchCategory(
  merchant: string,
  categories: Category[],
  rules: MerchantRule[],
): string | null {
  const lower = merchant.toLowerCase();
  for (const r of rules) {
    if (lower.includes(r.pattern.toLowerCase())) return r.category_id;
  }
  for (const k of KEYWORDS) {
    if (k.words.some((w) => new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(lower))) {
      const cat = categories.find((c) => c.name_en === k.cat);
      if (cat) return cat.id;
    }
  }
  return null;
}

export type ImportRow = {
  id: string;
  date: string;
  merchant: string;
  amount: number;
  category_id: string | null;
  selected: boolean;
  duplicate: boolean;
};

export function buildImportRows(
  rows: string[][],
  mapping: { date: number; desc: number; amount: number | null; debit: number | null; credit: number | null },
  categories: Category[],
  rules: MerchantRule[],
  existing: Expense[],
): ImportRow[] {
  const out: ImportRow[] = [];
  for (const r of rows.slice(1)) {
    const date = parseDate(r[mapping.date] ?? "");
    const merchant = cleanMerchant(r[mapping.desc] ?? "");
    let amount = 0;
    if (mapping.amount != null) {
      amount = Math.abs(parseFloat(String(r[mapping.amount]).replace(/,/g, "")) || 0);
      const raw = String(r[mapping.amount]);
      if (raw.includes("-") || raw.toLowerCase().includes("cr")) continue;
    } else {
      const debit = parseFloat(String(r[mapping.debit ?? -1] ?? "").replace(/,/g, "")) || 0;
      const credit = parseFloat(String(r[mapping.credit ?? -1] ?? "").replace(/,/g, "")) || 0;
      if (credit > 0 && debit <= 0) continue;
      amount = Math.abs(debit || 0);
    }
    if (!date || !(amount > 0)) continue;
    const category_id = matchCategory(merchant, categories, rules);
    const duplicate = existing.some(
      (e) => e.spent_at === date && e.amount === amount && (e.merchant || "").toLowerCase() === merchant.toLowerCase(),
    );
    out.push({
      id: uid("imp"),
      date,
      merchant,
      amount,
      category_id,
      selected: !duplicate && !!category_id,
      duplicate,
    });
  }
  return out;
}
