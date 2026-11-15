import { FormEvent, useState } from "react";
import { useApp } from "../contexts/AppContext";
import { channelLabel } from "../lib/payments";
import { formatAed } from "../lib/money";
import type { PaymentChannel } from "../types";

const DEMO_MERCHANTS = [
  "Carrefour City Centre",
  "Talabat",
  "ENOC Station",
  "Careem",
  "Noon",
  "Starbucks Dubai Mall",
];

export function Payments() {
  const { profile, payments, vendors, categories, ingestPayment } = useApp();
  const lang = profile?.language ?? "en";
  const digits = profile?.digits ?? "latn";
  const [amount, setAmount] = useState("35");
  const [merchant, setMerchant] = useState(DEMO_MERCHANTS[0]);
  const [channel, setChannel] = useState<PaymentChannel>("card_tap");
  const [msg, setMsg] = useState<string | null>(null);

  async function onSimulate(e: FormEvent) {
    e.preventDefault();
    const n = Number(amount);
    if (!(n > 0)) return;
    await ingestPayment({
      amount: n,
      merchantRaw: merchant,
      channel,
      last4: channel === "card_tap" ? "4242" : null,
      externalId: `demo_${Date.now()}`,
    });
    setMsg(
      lang === "ar"
        ? "\u062a\u0645 \u0627\u0644\u062a\u0633\u062c\u064a\u0644 \u0648\u0627\u0644\u0645\u0637\u0627\u0628\u0642\u0629 \u0641\u0648\u0631\u064b\u0627 \u0645\u0639 \u0627\u0644\u062a\u0635\u0646\u064a\u0641 \u0648\u0627\u0644\u0628\u0627\u0626\u0639."
        : "Recorded and reconciled immediately with category + vendor.",
    );
  }

  const catName = (id: string | null) => {
    if (!id) return "\u2014";
    const c = categories.find((x) => x.id === id);
    return lang === "ar" ? c?.name_ar ?? "\u2014" : c?.name_en ?? "\u2014";
  };

  return (
    <div className="stack">
      <div className="card">
        <h2>{lang === "ar" ? "\u0627\u0644\u0645\u062f\u0641\u0648\u0639\u0627\u062a \u0627\u0644\u062d\u064a\u0629" : "Live payments"}</h2>
        <p className="muted">
          {lang === "ar"
            ? "\u0627\u0644\u0644\u0645\u0633 \u0628\u0627\u0644\u0628\u0637\u0627\u0642\u0629 \u0623\u0648 \u0627\u0644\u0645\u062d\u0641\u0638\u0629 \u0641\u064a \u0627\u0644\u0625\u0646\u062a\u0627\u062c \u064a\u0635\u0644 \u0639\u0628\u0631 \u0648\u0627\u062c\u0647\u0629 \u0622\u0645\u0646\u0629 (Webhook \u0645\u0648\u0642\u0651\u0639) \u0623\u0648 \u0627\u0644\u062e\u062f\u0645\u0627\u062a \u0627\u0644\u0645\u0635\u0631\u0641\u064a\u0629 \u0627\u0644\u0645\u0641\u062a\u0648\u062d\u0629 \u2014 \u0628\u062f\u0648\u0646 \u062d\u0641\u0638 \u0631\u0642\u0645 \u0627\u0644\u0628\u0637\u0627\u0642\u0629 \u0627\u0644\u0643\u0627\u0645\u0644."
            : "In production, card/mobile taps arrive via a signed webhook or open-banking feed \u2014 never storing full card numbers. Demo simulates the same secure pipeline."}
        </p>
      </div>

      <form className="card stack" onSubmit={onSimulate}>
        <h3>{lang === "ar" ? "\u0645\u062d\u0627\u0643\u0627\u0629 \u062f\u0641\u0639" : "Simulate a payment"}</h3>
        <div>
          <label>{lang === "ar" ? "\u0627\u0644\u0645\u0628\u0644\u063a" : "Amount (AED)"}</label>
          <input type="number" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div>
          <label>{lang === "ar" ? "\u0627\u0644\u0628\u0627\u0626\u0639" : "Merchant / vendor"}</label>
          <select value={merchant} onChange={(e) => setMerchant(e.target.value)}>
            {DEMO_MERCHANTS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>{lang === "ar" ? "\u0627\u0644\u0642\u0646\u0627\u0629" : "Channel"}</label>
          <select value={channel} onChange={(e) => setChannel(e.target.value as PaymentChannel)}>
            <option value="card_tap">{channelLabel("card_tap", lang)}</option>
            <option value="mobile_wallet">{channelLabel("mobile_wallet", lang)}</option>
            <option value="open_banking">{channelLabel("open_banking", lang)}</option>
          </select>
        </div>
        <button className="btn block" type="submit">
          {lang === "ar" ? "\u062f\u0641\u0639 \u0648\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u0622\u0646" : "Pay & record now"}
        </button>
        {msg && <div className="success">{msg}</div>}
      </form>

      <div className="card">
        <h3>{lang === "ar" ? "\u0627\u0644\u0628\u0627\u0626\u0639\u0648\u0646" : "Vendors"}</h3>
        {vendors.length === 0 && <p className="muted">{lang === "ar" ? "\u0644\u0627 \u0628\u0627\u0626\u0639\u064a\u0646 \u0628\u0639\u062f." : "No vendors yet."}</p>}
        {vendors
          .slice()
          .sort((a, b) => b.payment_count - a.payment_count)
          .map((v) => (
            <div className="list-item" key={v.id}>
              <div>
                <div>{v.name}</div>
                <div className="muted">
                  {v.payment_count}\u00d7 \u00b7 {catName(v.default_category_id)}
                </div>
              </div>
              <span className="muted">{v.last_paid_at}</span>
            </div>
          ))}
      </div>

      <div className="card">
        <h3>{lang === "ar" ? "\u0633\u062c\u0644 \u0627\u0644\u0645\u062f\u0641\u0648\u0639\u0627\u062a" : "Payment log"}</h3>
        {payments.length === 0 && (
          <p className="muted">{lang === "ar" ? "\u0644\u0627 \u0645\u062f\u0641\u0648\u0639\u0627\u062a \u0628\u0639\u062f." : "No payments yet."}</p>
        )}
        {payments.map((p) => (
          <div className="list-item" key={p.id}>
            <div>
              <div>
                {p.merchant_normalized} \u00b7 {channelLabel(p.channel, lang)}
              </div>
              <div className="muted">
                {p.paid_at} \u00b7 {p.status}
                {p.last4 ? ` \u00b7 \u2022\u2022${p.last4}` : ""}
              </div>
            </div>
            <strong>{formatAed(p.amount, digits)}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
