import { FormEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../contexts/AppContext";
import { t } from "../lib/i18n";

export function AddExpense() {
  const { profile, categories, addExpense } = useApp();
  const lang = profile?.language ?? "en";
  const [amount, setAmount] = useState("");
  const [merchant, setMerchant] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [ok, setOk] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sorted = useMemo(
    () =>
      [...categories].sort((a, b) =>
        (lang === "ar" ? a.name_ar : a.name_en).localeCompare(lang === "ar" ? b.name_ar : b.name_en),
      ),
    [categories, lang],
  );

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(false);
    const n = Number(amount);
    if (!(n > 0) || !categoryId) {
      setError(t(lang, "somethingWrong"));
      return;
    }
    await addExpense({
      amount: n,
      category_id: categoryId,
      merchant: merchant || null,
      note: note || null,
      spent_at: date,
      source: "manual",
    });
    setAmount("");
    setMerchant("");
    setNote("");
    setOk(true);
  }

  return (
    <div className="stack">
      <div className="card">
        <h2>{t(lang, "addExpense")}</h2>
        <form className="stack" onSubmit={onSubmit}>
          <div>
            <label>{t(lang, "amount")}</label>
            <input type="number" min="0.01" step="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div>
            <label>{t(lang, "merchant")}</label>
            <input value={merchant} onChange={(e) => setMerchant(e.target.value)} placeholder="Carrefour, Careem, Talabat…" />
          </div>
          <div>
            <label>{t(lang, "category")}</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
              {sorted.map((c) => (
                <option key={c.id} value={c.id}>
                  {lang === "ar" ? c.name_ar : c.name_en}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>{t(lang, "date")}</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div>
            <label>{t(lang, "note")}</label>
            <input value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          {error && <div className="error">{error}</div>}
          {ok && <div className="success">{t(lang, "save")} ✓</div>}
          <button className="btn block" type="submit">
            {t(lang, "addExpense")}
          </button>
        </form>
      </div>
      <Link to="/import" className="card" style={{ textDecoration: "none", color: "inherit" }}>
        <strong>{t(lang, "importCsv")}</strong>
        <div className="muted">CSV from online banking in the United Arab Emirates</div>
      </Link>
    </div>
  );
}
