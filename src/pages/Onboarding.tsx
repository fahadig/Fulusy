import { FormEvent, useState } from "react";
import { useApp } from "../contexts/AppContext";
import { t } from "../lib/i18n";

export function Onboarding() {
  const { profile, updateProfile } = useApp();
  const lang = profile?.language ?? "en";
  const [name, setName] = useState(profile?.display_name ?? "");
  const [income, setIncome] = useState(String(profile?.monthly_income ?? ""));
  const [payday, setPayday] = useState(String(profile?.payday_day ?? "28"));
  const [consent, setConsent] = useState(!!profile?.consent_at);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!consent) {
      setError(t(lang, "consent"));
      return;
    }
    const monthly_income = Number(income);
    const payday_day = Number(payday);
    if (!(monthly_income >= 0) || payday_day < 1 || payday_day > 31) {
      setError(t(lang, "somethingWrong"));
      return;
    }
    await updateProfile({
      display_name: name || null,
      monthly_income,
      payday_day,
      consent_at: new Date().toISOString(),
    });
  }

  return (
    <div className="stack">
      <div className="card">
        <h2>{t(lang, "onboardingTitle")}</h2>
        <p className="muted">{t(lang, "onboardingHint")}</p>
        <p className="muted">Built for people in the United Arab Emirates and across the Middle East.</p>
        <form className="stack" onSubmit={onSubmit} style={{ marginTop: 12 }}>
          <div>
            <label>{t(lang, "displayName")}</label>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label>{t(lang, "salary")}</label>
            <input type="number" min={0} step="0.01" required value={income} onChange={(e) => setIncome(e.target.value)} />
          </div>
          <div>
            <label>{t(lang, "payday")}</label>
            <input type="number" min={1} max={31} required value={payday} onChange={(e) => setPayday(e.target.value)} />
          </div>
          <label className="row" style={{ gap: 10 }}>
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            <span>{t(lang, "consent")}</span>
          </label>
          {error && <div className="error">{error}</div>}
          <button className="btn block" type="submit">
            {t(lang, "continue")}
          </button>
        </form>
      </div>
    </div>
  );
}
