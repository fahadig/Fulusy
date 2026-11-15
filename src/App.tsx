import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { AppProvider, useApp } from "./contexts/AppContext";
import { Auth } from "./pages/Auth";
import { AddExpense } from "./pages/AddExpense";
import { Assistant } from "./pages/Assistant";
import { Home } from "./pages/Home";
import { ImportCsv } from "./pages/ImportCsv";
import { Onboarding } from "./pages/Onboarding";
import { Plans } from "./pages/Plans";
import { Settings } from "./pages/Settings";
import { Agents } from "./pages/Agents";
import { Payments } from "./pages/Payments";

function ThemeSync() {
  const { profile } = useApp();
  useEffect(() => {
    const theme = profile?.theme ?? "light";
    const lang = profile?.language ?? "en";
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.setAttribute("data-large", profile?.large_text ? "true" : "false");
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [profile?.theme, profile?.language, profile?.large_text]);
  return null;
}

function Gate() {
  const { loading, userId, profile } = useApp();
  if (loading) {
    return (
      <div className="auth-wrap center">
        <p className="muted">…</p>
      </div>
    );
  }
  if (!userId) return <Auth />;
  if (!profile?.consent_at || !profile.monthly_income || !profile.payday_day) {
    return (
      <div className="app-shell">
        <div className="page">
          <Onboarding />
        </div>
      </div>
    );
  }
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/add" element={<AddExpense />} />
        <Route path="/assistant" element={<Assistant />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/import" element={<ImportCsv />} />
        <Route path="/agents" element={<Agents />} />
        <Route path="/payments" element={<Payments />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <ThemeSync />
        <Gate />
      </BrowserRouter>
    </AppProvider>
  );
}
