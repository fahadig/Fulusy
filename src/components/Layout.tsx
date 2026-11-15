import { NavLink, Outlet } from "react-router-dom";
import { t } from "../lib/i18n";
import { useApp } from "../contexts/AppContext";

export function Layout() {
  const { profile } = useApp();
  const lang = profile?.language ?? "en";
  return (
    <div className="app-shell">
      <div className="page">
        <Outlet />
      </div>
      <nav className="nav" aria-label="Main">
        <NavLink to="/" end>
          <span className="ico">⌂</span>
          {t(lang, "home")}
        </NavLink>
        <NavLink to="/add">
          <span className="ico">＋</span>
          {t(lang, "add")}
        </NavLink>
        <NavLink to="/payments">
          <span className="ico">💳</span>
          {lang === "ar" ? "دفع" : "Pay"}
        </NavLink>
        <NavLink to="/agents">
          <span className="ico">🤖</span>
          {lang === "ar" ? "وكيل" : "Agent"}
        </NavLink>
        <NavLink to="/settings">
          <span className="ico">⚙</span>
          {t(lang, "settings")}
        </NavLink>
      </nav>
    </div>
  );
}
