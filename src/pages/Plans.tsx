import { useApp } from "../contexts/AppContext";
import { t } from "../lib/i18n";
import { formatAed } from "../lib/money";

export function Plans() {
  const { profile, plans } = useApp();
  const lang = profile?.language ?? "en";
  const digits = profile?.digits ?? "latn";

  return (
    <div className="stack">
      <div className="card">
        <h2>{t(lang, "plans")}</h2>
        {plans.length === 0 && <p className="muted">{t(lang, "noExpenses")}</p>}
        {plans.map((p) => (
          <div className="list-item" key={p.id}>
            <div>
              <div>{p.scenario === "extra_expense" ? t(lang, "extraExpense") : t(lang, "monthlySavings")}</div>
              <div className="muted">{new Date(p.created_at).toLocaleString()}</div>
            </div>
            <strong>{formatAed(p.amount, digits)}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
