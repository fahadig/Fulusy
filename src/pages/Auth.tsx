import { FormEvent, useState } from "react";
import { BrandMark } from "../components/BrandMark";
import { useApp } from "../contexts/AppContext";
import { t } from "../lib/i18n";
import { isDemoMode } from "../lib/supabase";

export function Auth() {
  const { signIn, signUp, enterDemo } = useApp();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const lang = "en";

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const err = mode === "in" ? await signIn(email, password) : await signUp(email, password);
    if (err) setError(err);
    setBusy(false);
  }

  return (
    <div className="auth-wrap">
      <div className="card">
        <div className="hero" style={{ marginBottom: 16 }}>
          <BrandMark />
          <div>
            <h1 style={{ margin: 0, fontSize: "1.35rem" }}>{t(lang, "appName")}</h1>
            <p className="muted" style={{ margin: "4px 0 0" }}>
              Smart spending for the United Arab Emirates & the wider Middle East
            </p>
          </div>
        </div>

        {isDemoMode && (
          <div className="banner">
            <strong>{t(lang, "demoMode")}</strong>
            <div className="muted">{t(lang, "demoHint")}</div>
          </div>
        )}

        <form className="stack" onSubmit={onSubmit}>
          <div>
            <label htmlFor="email">{t(lang, "email")}</label>
            <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label htmlFor="password">{t(lang, "password")}</label>
            <input id="password" type="password" autoComplete={mode === "in" ? "current-password" : "new-password"} required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <div className="error">{error}</div>}
          <button className="btn block" disabled={busy} type="submit">
            {mode === "in" ? t(lang, "signIn") : t(lang, "signUp")}
          </button>
        </form>

        <p className="center muted" style={{ marginTop: 14 }}>
          {mode === "in" ? (
            <>
              {t(lang, "createAccount")}?{" "}
              <button className="btn ghost" type="button" onClick={() => setMode("up")}>
                {t(lang, "signUp")}
              </button>
            </>
          ) : (
            <>
              {t(lang, "welcomeBack")}?{" "}
              <button className="btn ghost" type="button" onClick={() => setMode("in")}>
                {t(lang, "signIn")}
              </button>
            </>
          )}
        </p>

        {isDemoMode && (
          <>
            <p className="center muted">{t(lang, "or")}</p>
            <button className="btn secondary block" type="button" onClick={enterDemo}>
              {t(lang, "useDemo")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
