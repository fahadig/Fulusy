import { FormEvent, useState } from "react";
import { useApp } from "../contexts/AppContext";
import { t } from "../lib/i18n";
import type { ChatStyle, Digits, Language, Theme } from "../types";

export function Settings() {
  const { profile, expenses, categories, updateProfile, signOut, sendFeedback, deleteAccount } = useApp();
  const lang = profile?.language ?? "en";
  const [income, setIncome] = useState(String(profile?.monthly_income ?? ""));
  const [payday, setPayday] = useState(String(profile?.payday_day ?? ""));
  const [name, setName] = useState(profile?.display_name ?? "");
  const [fb, setFb] = useState("");
  const [fbOk, setFbOk] = useState(false);
  const [delText, setDelText] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    await updateProfile({
      display_name: name || null,
      monthly_income: Number(income) || 0,
      payday_day: Number(payday) || null,
    });
    setMsg(t(lang, "save") + " \u2713");
  }

  function exportCsv() {
    const header = "date,merchant,category,amount,note,source\n";
    const lines = expenses.map((e) => {
      const cat = categories.find((c) => c.id === e.category_id);
      const n = cat ? (lang === "ar" ? cat.name_ar : cat.name_en) : "";
      return [e.spent_at, e.merchant ?? "", n, e.amount, e.note ?? "", e.source]
        .map((x) => `"${String(x).replace(/"/g, '""')}"`)
        .join(",");
    });
    const blob = new Blob([header + lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "expenses.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="stack">
      <div className="card">
        <h2>{t(lang, "settings")}</h2>
        <form className="stack" onSubmit={saveProfile}>
          <div>
            <label>{t(lang, "displayName")}</label>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label>{t(lang, "salary")}</label>
            <input type="number" value={income} onChange={(e) => setIncome(e.target.value)} />
          </div>
          <div>
            <label>{t(lang, "payday")}</label>
            <input type="number" min={1} max={31} value={payday} onChange={(e) => setPayday(e.target.value)} />
          </div>
          <button className="btn block" type="submit">{t(lang, "save")}</button>
        </form>
        {msg && <p className="success">{msg}</p>}
      </div>

      <div className="card stack">
        <div>
          <label>{t(lang, "language")}</label>
          <div className="chip-row">
            {(["en", "ar"] as Language[]).map((l) => (
              <button key={l} type="button" className={`chip ${profile?.language === l ? "active" : ""}`} onClick={() => void updateProfile({ language: l })}>
                {l === "en" ? "English" : "\u0627\u0644\u0639\u0631\u0628\u064a\u0629"}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label>{t(lang, "chatStyle")}</label>
          <div className="chip-row">
            {([["en", "styleEn"], ["fusha", "styleFusha"], ["khaleeji", "styleKhaleeji"], ["arabizi", "styleArabizi"]] as [ChatStyle, string][]).map(([s, k]) => (
              <button key={s} type="button" className={`chip ${profile?.chat_style === s ? "active" : ""}`} onClick={() => void updateProfile({ chat_style: s })}>
                {t(lang, k)}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label>{t(lang, "theme")}</label>
          <div className="chip-row">
            {(["light", "dark", "ramadan"] as Theme[]).map((th) => (
              <button key={th} type="button" className={`chip ${profile?.theme === th ? "active" : ""}`} onClick={() => void updateProfile({ theme: th })}>
                {t(lang, th)}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label>{t(lang, "digits")}</label>
          <div className="chip-row">
            {(["latn", "arab"] as Digits[]).map((d) => (
              <button key={d} type="button" className={`chip ${profile?.digits === d ? "active" : ""}`} onClick={() => void updateProfile({ digits: d })}>
                {d === "arab" ? t(lang, "arabDigits") : t(lang, "latinDigits")}
              </button>
            ))}
          </div>
        </div>
        <label className="row">
          <input type="checkbox" checked={!!profile?.large_text} onChange={(e) => void updateProfile({ large_text: e.target.checked })} />
          {t(lang, "largeText")}
        </label>
      </div>

      <div className="card">
        <h3>{t(lang, "privacy")}</h3>
        <p className="muted">{t(lang, "privacyBody")}</p>
        <p className="muted">Region focus: United Arab Emirates and neighbouring Middle East markets.</p>
      </div>

      <div className="card">
        <h3>{t(lang, "install")}</h3>
        <p className="muted">{t(lang, "installIos")}</p>
        <p className="muted">{t(lang, "installAndroid")}</p>
      </div>

      <div className="card stack">
        <h3>{t(lang, "feedback")}</h3>
        <textarea placeholder={t(lang, "feedbackPlaceholder")} value={fb} onChange={(e) => setFb(e.target.value)} />
        <button className="btn secondary block" type="button" onClick={async () => { if (!fb.trim()) return; await sendFeedback(fb.trim()); setFb(""); setFbOk(true); }}>
          {t(lang, "send")}
        </button>
        {fbOk && <div className="success">{t(lang, "thanksFeedback")}</div>}
      </div>

      <div className="card stack">
        <button className="btn secondary block" type="button" onClick={exportCsv}>{t(lang, "exportData")}</button>
        <button className="btn ghost block" type="button" onClick={() => void signOut()}>{t(lang, "logout")}</button>
        <div>
          <label>{t(lang, "deleteAccount")}</label>
          <input placeholder={t(lang, "confirmDelete")} value={delText} onChange={(e) => setDelText(e.target.value)} />
          <button className="btn danger block" style={{ marginTop: 8 }} type="button" disabled={delText !== "DELETE"} onClick={async () => { await deleteAccount(); }}>
            {t(lang, "deleteAccount")}
          </button>
        </div>
      </div>
    </div>
  );
}
