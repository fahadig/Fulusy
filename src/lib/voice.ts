/** Browser voice I/O — stays on-device when the OS supports it. */

export type VoiceStatus = "idle" | "listening" | "unsupported" | "error";

type SpeechRec = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((ev: { results: { [i: number]: { [j: number]: { transcript: string }; isFinal: boolean } } }) => void) | null;
  onerror: ((ev: { error: string }) => void) | null;
  onend: (() => void) | null;
};

function getRecognition(): SpeechRec | null {
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRec;
    webkitSpeechRecognition?: new () => SpeechRec;
  };
  const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

export function voiceSupported(): boolean {
  return !!getRecognition();
}

export function speak(text: string, lang: string): void {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang.startsWith("ar") ? "ar-AE" : "en-AE";
  window.speechSynthesis.speak(u);
}

export function listenOnce(opts: {
  lang: string;
  onText: (text: string) => void;
  onStatus: (s: VoiceStatus) => void;
}): () => void {
  const rec = getRecognition();
  if (!rec) {
    opts.onStatus("unsupported");
    return () => {};
  }
  rec.lang = opts.lang.startsWith("ar") ? "ar-AE" : "en-AE";
  rec.continuous = false;
  rec.interimResults = false;
  rec.onresult = (ev) => {
    const t = ev.results[0]?.[0]?.transcript?.trim();
    if (t) opts.onText(t);
  };
  rec.onerror = () => opts.onStatus("error");
  rec.onend = () => opts.onStatus("idle");
  opts.onStatus("listening");
  try {
    rec.start();
  } catch {
    opts.onStatus("error");
  }
  return () => {
    try {
      rec.stop();
    } catch {
      /* ignore */
    }
  };
}

/** Map spoken phrases (EN + Gulf-ish) to app intents. */
export function parseVoiceIntent(text: string): {
  intent: "extra_expense" | "monthly_savings" | "add_expense" | "analyze" | "home" | "unknown";
  amount?: number;
  merchant?: string;
} {
  const s = text.toLowerCase().trim();
  const amountMatch = s.match(/(\d+(?:[.,]\d{1,2})?)\s*(aed|dirham|درهم)?/);
  const amount = amountMatch ? parseFloat(amountMatch[1].replace(",", ".")) : undefined;

  if (/extra|مصروف إضافي|مصروف زيادة|before payday|قبل الراتب/.test(s)) {
    return { intent: "extra_expense", amount };
  }
  if (/save|savings|توفير|أوفر|awaffer|monthly/.test(s)) {
    return { intent: "monthly_savings", amount };
  }
  if (/analyze|analysis|تحليل|overview|summary|ملخص/.test(s)) {
    return { intent: "analyze" };
  }
  if (/add|سجل|أضف|spent|دفعت|paid/.test(s)) {
    const merchant =
      s.match(/(?:at|from|في|من)\s+([a-z\u0600-\u06ff][\w\u0600-\u06ff\s]{1,40})/i)?.[1]?.trim() ||
      undefined;
    return { intent: "add_expense", amount, merchant };
  }
  if (/home|رئيس|dashboard/.test(s)) return { intent: "home" };
  return { intent: "unknown", amount };
}
