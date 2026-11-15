export type ChatStyle = "en" | "fusha" | "khaleeji" | "arabizi";
export type Language = "en" | "ar";
export type Theme = "light" | "dark" | "ramadan";
export type Digits = "arab" | "latn";
export type Tone = "casual" | "respectful";
export type Scenario = "extra_expense" | "monthly_savings";
export type ExpenseSource = "manual" | "receipt" | "statement" | "sms";

export type Profile = {
  id: string;
  display_name: string | null;
  payday_day: number | null;
  monthly_income: number | null;
  currency: string;
  language: Language;
  chat_style: ChatStyle;
  tone: Tone;
  theme: Theme;
  digits: Digits;
  large_text: boolean;
  consent_at: string | null;
};

export type Category = {
  id: string;
  user_id: string;
  name_en: string;
  name_ar: string;
  is_essential: boolean;
};

export type Expense = {
  id: string;
  user_id: string;
  amount: number;
  category_id: string;
  merchant: string | null;
  note: string | null;
  spent_at: string;
  source: ExpenseSource;
};

export type Budget = {
  id: string;
  user_id: string;
  category_id: string;
  monthly_amount: number;
};

export type Instalment = {
  id: string;
  user_id: string;
  item: string;
  amount: number;
  payment_number: number;
  total_payments: number;
  due_date: string;
};

export type Goal = {
  id: string;
  user_id: string;
  name: string;
  target: number;
  saved: number;
};

export type ImportantMark = {
  id: string;
  user_id: string;
  group_key: string;
  label: string | null;
};

export type MerchantRule = {
  id: string;
  user_id: string;
  pattern: string;
  category_id: string;
};

export type SavedPlan = {
  id: string;
  user_id: string;
  scenario: Scenario;
  amount: number;
  result: unknown;
  created_at: string;
};

export type GroupCut = {
  key: string;
  categoryId: string;
  label: string;
  planned: number;
  cut: number;
  occurrences: number | null;
  unitCost: number | null;
  locked: boolean;
  action?: string;
};

export type PlanResult = {
  amount: number;
  covered: number;
  shortfall: number;
  flexiblePlanned: number;
  percent: number;
  categoryCuts: {
    categoryId: string;
    planned: number;
    cut: number;
    percent: number;
  }[];
  groupCuts: GroupCut[];
};

export type Snapshot = {
  daysLeft: number;
  nextPayday: string;
  available: number;
  essentialsNeeded: number;
  currentMonthlySaving: number;
};

export type EngineResponse = {
  scenario?: Scenario;
  reply: string;
  plan: PlanResult;
  snapshot: Snapshot;
  units: "fils";
  error?: string;
};

export type PaymentChannel = "card_tap" | "mobile_wallet" | "bank_transfer" | "manual" | "open_banking";

export type PaymentEvent = {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  merchant_raw: string;
  merchant_normalized: string;
  channel: PaymentChannel;
  paid_at: string;
  external_id: string | null;
  last4: string | null;
  status: "received" | "categorized" | "reconciled" | "needs_review";
  expense_id: string | null;
  category_id: string | null;
  vendor_id: string | null;
  created_at: string;
};

export type Vendor = {
  id: string;
  user_id: string;
  name: string;
  normalized: string;
  default_category_id: string | null;
  payment_count: number;
  last_paid_at: string | null;
};

export type AgentRole = "cost_analyst" | "savings_coach" | "payment_guard";

export type AgentSuggestion = {
  id: string;
  role: AgentRole;
  title: string;
  body: string;
  severity: "info" | "watch" | "action";
  related_category_id?: string;
  related_vendor?: string;
};
