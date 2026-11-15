import { Link } from "react-router-dom";
import { BrandMark } from "../components/BrandMark";
import { useApp } from "../contexts/AppContext";
import { buildSnapshot } from "../lib/engine";
import { t } from "../lib/i18n";
import { formatAed, formatFilsAsAed } from "../lib/money";

export function Home() {
  const { profile, categories, expenses, demo } = useApp();
  const lang = profile?.language ?? "en";
  const digits = profile?.digits ?? "latn";

  const snap =
    profile?.payday_day && profile.monthly_income
      ? buildSnapshot({
          today: new Date(),
          paydayDay: profile.payday_day,
          monthlyIncome: profile.monthly_income,
          categories,
          expenses,
          instalments: [],
        })
      : null;

  const monthKey = new Date().toISOString().slice(0, 7);
  const monthSpend = expenses
    .filter((e) => e.spent_at.startsWith(monthKey))
    .reduce((s, e) => s + e.amount, 0);

  const recent = expenses.slice(0, 8);
  const catName = (id: string) => {
    const c = categories.find((x) => x.id === id);
    return lang === "ar" ? c?.name_ar ?? "\u2014" : c?.name_en ?? "\u2014";
  };

  return (
    <div className="stack">
      <div className="card">
        <div className="hero">
          <BrandMark />
          <div>
            <h2 style={{ margin: 0 }}>
              {profile?.display_name ? `${profile.display_name}` : t(lang, "appName")}
            </h2>
            <p className="muted" style={{ margin: "4px 0 0" }}>
              {demo ? t(lang, "demoMode") : "United Arab Emirates \u00b7 AED"}
            </p>
          </div>
        </div>
      </div>

      {snap && (
        <div className="card">
          <div className="stat-grid">
            <div className="stat">
              <div className="k">{t(lang, "untilPayday")}</div>
              <div className="v">
                {snap.daysLeft} {t(lang, "days")}
              </div>
            </div>
            <div className="stat">
              <div className="k">{t(lang, "available")}</div>
              <div className="v">{formatFilsAsAed(snap.available, digits)}</div>
            </div>
            <div className="stat">
              <div className="k">{t(lang, "essentials")}</div>
              <div className="v">{formatFilsAsAed(snap.essentialsNeeded, digits)}</div>
            </div>
            <div className="stat">
              <div className="k">{t(lang, "thisMonth")}</div>
              <div className="v">{formatAed(monthSpend, digits)}</div>
            </div>
          </div>
          <p className="muted" style={{ marginTop: 10 }}>
            {t(lang, "nextPayday")}: {snap.nextPayday}
          </p>
        </div>
      )}

      <Link to="/assistant?q=extra" className="card" style={{ textDecoration: "none", color: "inherit" }}>
        <strong>{t(lang, "askAssistant")}</strong>
      </Link>
      <div className="stat-grid">
        <Link to="/payments" className="card" style={{ textDecoration: "none", color: "inherit", marginBottom: 0 }}>
          <strong>{lang === "ar" ? "\u062f\u0641\u0639 \u0628\u0627\u0644\u0644\u0645\u0633" : "Tap payments"}</strong>
          <div className="muted">{lang === "ar" ? "\u0628\u0637\u0627\u0642\u0629 \u0623\u0648 \u0645\u062d\u0641\u0638\u0629" : "Card or mobile wallet"}</div>
        </Link>
        <Link to="/agents" className="card" style={{ textDecoration: "none", color: "inherit", marginBottom: 0 }}>
          <strong>{lang === "ar" ? "\u0648\u0643\u064a\u0644 \u0630\u0643\u064a" : "AI agents"}</strong>
          <div className="muted">{lang === "ar" ? "\u062a\u062d\u0644\u064a\u0644 \u0648\u062a\u0648\u0641\u064a\u0631" : "Analyse & save"}</div>
        </Link>
      </div>

      <div className="card">
        <h3>{t(lang, "recent")}</h3>
        {recent.length === 0 && <p className="muted">{t(lang, "noExpenses")}</p>}
        {recent.map((e) => (
          <div className="list-item" key={e.id}>
            <div>
              <div>{e.merchant || catName(e.category_id)}</div>
              <div className="muted">
                {e.spent_at} \u00b7 {catName(e.category_id)}
              </div>
            </div>
            <strong>{formatAed(e.amount, digits)}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
