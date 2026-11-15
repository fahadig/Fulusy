/**
 * Secure payment capture + live reconciliation.
 * Never store full card PAN, CVV, wallet credentials, bank passwords.
 */
import type { Category, Expense, MerchantRule, PaymentChannel, PaymentEvent, Vendor } from "../types";
import { matchCategory } from "./csvImport";
import { uid } from "./money";

export function normalizeMerchant(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/\b(pos|visa|mastercard|mada|apple pay|samsung pay|google pay)\b/gi, " ")
    .replace(/[^a-z0-9\u0600-\u06ff\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 48);
}

export function displayVendorName(normalized: string): string {
  if (!normalized) return "Unknown vendor";
  return normalized
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export type ReconcileResult = {
  payment: PaymentEvent;
  expense: Expense;
  vendor: Vendor;
  createdVendor: boolean;
};

export function reconcilePayment(input: {
  userId: string;
  amount: number;
  currency?: string;
  merchantRaw: string;
  channel: PaymentChannel;
  paidAt?: string;
  externalId?: string | null;
  last4?: string | null;
  categories: Category[];
  rules: MerchantRule[];
  vendors: Vendor[];
}): ReconcileResult {
  const paid_at = (input.paidAt ?? new Date().toISOString()).slice(0, 10);
  const normalized = normalizeMerchant(input.merchantRaw) || "unknown vendor";
  const display = displayVendorName(normalized);

  let vendor = input.vendors.find((v) => v.normalized === normalized);
  let createdVendor = false;
  if (!vendor) {
    vendor = {
      id: uid("ven"),
      user_id: input.userId,
      name: display,
      normalized,
      default_category_id: null,
      payment_count: 0,
      last_paid_at: null,
    };
    createdVendor = true;
  }

  let category_id =
    vendor.default_category_id ||
    matchCategory(display, input.categories, input.rules) ||
    matchCategory(normalized, input.categories, input.rules);

  const status = category_id ? "reconciled" : "needs_review";
  if (!category_id) {
    category_id =
      input.categories.find((c) => c.name_en === "Shopping")?.id ||
      input.categories.find((c) => !c.is_essential)?.id ||
      input.categories[0]?.id ||
      null;
  }

  const expenseId = uid("exp");
  const paymentId = uid("pay");

  const expense: Expense = {
    id: expenseId,
    user_id: input.userId,
    amount: input.amount,
    category_id: category_id!,
    merchant: display,
    note: `Auto · ${input.channel}`,
    spent_at: paid_at,
    source: input.channel === "manual" ? "manual" : "statement",
  };

  vendor = {
    ...vendor,
    payment_count: vendor.payment_count + 1,
    last_paid_at: paid_at,
    default_category_id: vendor.default_category_id || category_id,
  };

  const payment: PaymentEvent = {
    id: paymentId,
    user_id: input.userId,
    amount: input.amount,
    currency: input.currency ?? "AED",
    merchant_raw: input.merchantRaw,
    merchant_normalized: normalized,
    channel: input.channel,
    paid_at,
    external_id: input.externalId ?? null,
    last4: input.last4 ?? null,
    status: category_id ? (status as PaymentEvent["status"]) : "needs_review",
    expense_id: expenseId,
    category_id,
    vendor_id: vendor.id,
    created_at: new Date().toISOString(),
  };

  if (matchCategory(display, input.categories, input.rules) || vendor.default_category_id) {
    payment.status = "reconciled";
  } else if (category_id) {
    payment.status = "categorized";
  }

  return { payment, expense, vendor, createdVendor };
}

export function channelLabel(ch: PaymentChannel, lang: "en" | "ar"): string {
  const en: Record<PaymentChannel, string> = {
    card_tap: "Card tap",
    mobile_wallet: "Mobile wallet / tap",
    bank_transfer: "Bank transfer",
    manual: "Manual",
    open_banking: "Open banking feed",
  };
  const ar: Record<PaymentChannel, string> = {
    card_tap: "بطاقة — لمس",
    mobile_wallet: "محفظة جوال — لمس",
    bank_transfer: "تحويل بنكي",
    manual: "يدوي",
    open_banking: "الخدمات المصرفية المفتوحة",
  };
  return lang === "ar" ? ar[ch] : en[ch];
}
