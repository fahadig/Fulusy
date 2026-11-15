import { FormEvent, useMemo, useState } from "react";
import { useApp } from "../contexts/AppContext";
import { agentReplyToQuestion, runCostAnalyst } from "../lib/aiAgent";
import { t } from "../lib/i18n";
import { listenOnce, speak, voiceSupported, type VoiceStatus } from "../lib/voice";

export function Agents() {
  const { profile, categories, expenses, payments, vendors } = useApp();
  const lang = profile?.language ?? "en";
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [voice, setVoice] = useState<VoiceStatus>("idle");

  const suggestions = useMemo(() => {
    if (!profile) return [];
    return runCostAnalyst({
      profile,
      categories,
      expenses,
      vendors,
      payments,
    });
  }, [profile, categories, expenses, vendors, payments]);

  function ask(q: string) {
    if (!profile) return;
    const reply = agentReplyToQuestion(q, {
      profile,
      categories,
      expenses,
      suggestions,
    });
    setAnswer(reply);
    speak(reply, lang === "ar" ? "ar" : "en");
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;
    ask(question.trim());
  }

  function startVoice() {
    listenOnce({
      lang: lang === "ar" ? "ar" : "en",
      onStatus: setVoice,
      onText: (text) => {
        setQuestion(text);
        ask(text);
      },
    });
  }

  return (
    <div className="stack">
      <div className="card">
        <h2>{lang === "ar" ? "وكلاء التحليل" : "AI agents"}</h2>
        <p className="muted">
          {lang === "ar"
            ? "تحليل التكلفة وتوصيات التوفير تعمل على جهازك من أرقامك فقط. لا تُرسل بيانات البطاقة إلى نموذج خارجي."
            : "Cost analysis and savings coaches run on-device from your numbers only. Card data is never sent to an external model."}
        </p>
      </div>

      {suggestions.map((s) => (
        <div className="card" key={s.id}>
          <div className="row between">
            <strong>{s.title}</strong>
            <span className="tag">{s.severity}</span>
          </div>
          <p className="muted" style={{ marginBottom: 0 }}>
            {s.body}
          </p>
          <div className="muted" style={{ marginTop: 6, fontSize: "0.8rem" }}>
            {s.role === "cost_analyst"
              ? lang === "ar"
                ? "وكيل التكلفة"
                : "Cost analyst"
              : s.role === "savings_coach"
                ? lang === "ar"
                  ? "وكيل التوفير"
                  : "Savings coach"
                : lang === "ar"
                  ? "حارس المدفوعات"
                  : "Payment guard"}
          </div>
        </div>
      ))}

      <form className="card stack" onSubmit={onSubmit}>
        <label>{lang === "ar" ? "اسأل الوكيل" : "Ask the agent"}</label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={lang === "ar" ? "كيف أوفر هذا الشهر؟" : "How can I save this month?"}
        />
        <div className="row">
          <button className="btn" type="submit" style={{ flex: 1 }}>
            {lang === "ar" ? "تحليل" : "Analyse"}
          </button>
          <button
            className="btn secondary"
            type="button"
            disabled={!voiceSupported() || voice === "listening"}
            onClick={startVoice}
            title="Voice"
          >
            {voice === "listening" ? "…" : "🎙"}
          </button>
        </div>
        {!voiceSupported() && (
          <p className="muted">{lang === "ar" ? "الصوت غير مدعوم في هذا المتصفح." : "Voice not supported in this browser."}</p>
        )}
        {answer && (
          <div className="bubble bot" dir={lang === "ar" ? "rtl" : "ltr"}>
            {answer}
          </div>
        )}
      </form>
    </div>
  );
}
