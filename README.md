# Fulusy

Mobile-first expense app for the **United Arab Emirates** and the wider Middle East.

**Repo:** https://github.com/fahadig/Fulusy

## Features

- Demo mode (no backend keys required)
- Voice input/output (on-device)
- On-device AI agents (cost analyst, savings coach, payment guard)
- Live payment reconciliation (card tap / mobile wallet via signed webhook)
- English + Arabic (RTL), dialects: فصحى / خليجي / Arabizi
- Supabase schema + edge functions

## Run

```bash
npm install
npm run dev
```

Use **Continue in demo mode** if Supabase env vars are empty.

## Supabase

1. Run `supabase/schema.sql` then `supabase/schema_payments.sql`
2. Deploy `engine`, `delete-account`, `payment-webhook`
3. Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
4. Set edge secret `PAYMENT_WEBHOOK_SECRET`

## Security

Never stores full card numbers, CVV, or wallet secrets. Optional last4 only. Webhooks require HMAC.
