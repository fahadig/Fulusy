-- Additive: vendors + payment events for live reconciliation
-- Run after schema.sql. Never store full PAN / CVV / wallet secrets.

create table if not exists public.vendors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  normalized text not null,
  default_category_id uuid references public.categories(id) on delete set null,
  payment_count int not null default 0,
  last_paid_at date,
  created_at timestamptz not null default now(),
  unique (user_id, normalized)
);

create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  currency text not null default 'AED',
  merchant_raw text not null,
  merchant_normalized text not null,
  channel text not null check (channel in ('card_tap','mobile_wallet','bank_transfer','manual','open_banking')),
  paid_at date not null default current_date,
  external_id text,
  last4 text,
  status text not null default 'received'
    check (status in ('received','categorized','reconciled','needs_review')),
  expense_id uuid references public.expenses(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  vendor_id uuid references public.vendors(id) on delete set null,
  created_at timestamptz not null default now()
);

create unique index if not exists payment_events_user_external
  on public.payment_events (user_id, external_id)
  where external_id is not null;

alter table public.vendors enable row level security;
alter table public.payment_events enable row level security;

create policy "own vendors" on public.vendors for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own payments" on public.payment_events for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
