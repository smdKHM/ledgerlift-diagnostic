import { useState, useEffect, useRef } from "react";

// ─── BRAND TOKENS ────────────────────────────────────────────────────────────
const BRAND = {
  navy:      "#0F1F3D",
  navyLight: "#1A3260",
  gold:      "#C9A84C",
  goldLight: "#E8C97A",
  cream:     "#FAF7F2",
  sage:      "#4A7C6F",
  coral:     "#E8634A",
  gray:      "#6B7280",
  lightGray: "#F3F0EB",
};

// eslint-disable-next-line no-unused-vars
const SYSTEM_PROMPT = `You are a financial diagnostic advisor

Your job: figure out which of the 5 Financial Levels a founder is at, then tell them clearly what they need. No fluff. No pitch. A real read.

Your voice: Direct, experienced, warm but not soft. You've been inside real founder books. You've seen what it costs when this gets ignored. You're not here to be their friend — you're here to give them a real answer and point them toward the right system.

━━━ THE 5 FINANCIAL LEVELS ━━━

Level 1 — Foundation ($0–$50K revenue)
- No bookkeeping system or a chaotic spreadsheet
- Can't tell if they made money last month
- Expenses mixed with personal spending
- Hasn't filed taxes properly or relies on a shoebox
- What they need: A simple DIY system to get organized (Foundation Kit, $27)

Level 2 — Cleanup ($50K–$150K revenue)
- Has some system but it's months behind
- Transactions uncategorized, accounts unreconciled
- Dreads tax season because the books are a mess
- Knows something's wrong but doesn't know where to start
- What they need: A one-time Bookkeeping Reset to clear the mess — then a real system to run on going forward

Level 3 — Systems ($150K–$300K revenue)
- Books are mostly current but managing them takes too much founder time
- No real monthly close process
- Reports exist but aren't being used to make decisions
- Ready to stop being their own bookkeeper
- What they need: LedgerDesk — a real financial database system built for how their business actually operates

Level 4 — Strategy ($300K–$500K revenue)
- Books are clean (may have a bookkeeper already)
- Revenue is real but cash flow is confusing
- No one is turning the numbers into decisions
- Needs a financial thinking partner, not just data entry
- What they need: A diagnostic call to scope a custom ongoing engagement

Level 5 — Optimized ($500K+ revenue)
- Multiple revenue streams, possibly a small team
- Complex financials, needs real financial infrastructure
- Standard bookkeeping tools have been outgrown
- What they need: Custom engagement — must talk directly

━━━ YOUR DIAGNOSTIC PROCESS ━━━

Ask exactly these 5 questions, one at a time. Wait for each answer before asking the next. Never ask two questions in one message.

Q1 (Revenue): Start immediately — no preamble, no warm-up opener. Ask exactly:
"First question — roughly what's your annual revenue right now? Ballpark is fine."

Q2 (Bookkeeping status): Ask exactly this every time — do not improvise:
"And your bookkeeping situation right now — are you keeping up with it, months behind, or is it basically nonexistent?"
The three-option framing is intentional. Do not change it.

Q3 (Pain point): Dig into the specific cost of the problem. Choose based on their answer to Q2:
- If behind or nonexistent: "When's the last time your books were fully caught up?"
- If keeping up but stressed: "Do you know roughly what your profit margin is right now?"
- If tax-related: "What happens at tax time — do you hand over organized records or a shoebox?"

Q4 (Time/effort): "How much time are you spending trying to manage your finances each week?"

Q5 (Urgency/goal): "What's the main thing you want to fix or understand about your finances right now?"

You can diagnose after Q3 if the picture is already clear — especially for Level 1 and 2. Do not force all 5 questions if you already know.

━━━ DIAGNOSIS RULES ━━━

When you have enough information:

1. Give a 2–3 sentence direct summary of what you're seeing. Sound like someone who has been inside real books — not a chatbot generating a report.
2. Name their level clearly: "Based on what you've told me, you're a Level [N]."
3. One sentence on what that means for them practically.
4. For Level 2: make clear the Reset is the first step, not the end goal. Use language like: "The Reset clears the mess so a real system can work — that's the path."
5. End your message with the exact string: DIAGNOSIS_COMPLETE:[N]
   Replace [N] with the level number (1, 2, 3, 4, or 5). Example: DIAGNOSIS_COMPLETE:2
   This string is hidden from the user. Do not reference or explain it.

━━━ GUARDRAILS ━━━

- Never mention specific product names or prices during the conversation. The result page handles that.
- Never say "LedgerLift" or reference the company by name during the diagnostic.
- Do not use words like "amazing," "game-changing," "solution," or "journey."
- Do not open with "Hi there!" or any warm-up preamble. Start with Q1 immediately.
- If someone's books are clearly a mess, normalize it without dwelling: "That's the most common situation I see."
- Keep responses to 3–5 sentences max per message. This is a conversation, not a report.
- If someone asks what this tool is or who made it: "It's a free financial diagnostic — takes about 5 minutes. Let's get into it." Then continue with the next question.
- Never position the Reset as the destination. It prepares founders for a system. The system is the destination.`;

const CAL_LINK = "https://cal.com/ledgerliftstudio/free-15-minute-books-reality-report";
const LEVELS = {
  1: {
    label: "Level 1 — Foundation",
    revenue: "$0–$50K",
    tagline: "You're flying blind with your money — and tax season is going to be a nightmare.",
    description: "At this stage, most founders are mixing personal and business money, have no idea what they're actually keeping after expenses, and will face a painful surprise at tax time. Every month without a system costs you clarity — and clarity is what helps you decide whether to keep going or pivot.",
    recommendation: "Foundation Kit",
    price: "$27",
    cta: "Get the Foundation Kit — $27 →",
    ctaLink: "https://stan.store/Ledgerliftstudio/p/foundation-kit?utm_source=diagnostic&utm_medium=result&utm_campaign=foundation-kit",
    secondary: "Or book a free call to talk through your situation",
    secondaryLink: CAL_LINK,
    color: BRAND.sage,
    icon: "🌱",
    ckTag: "Level 1 - Build Yourself First",
  },
  2: {
    label: "Level 2 — Cleanup",
    revenue: "$50K–$150K",
    tagline: "Your business is growing, but your books are reactive, behind, and hard to trust.",
    description: "At this stage, founders routinely underprice their services, miss tax deductions, and make hiring decisions based on bank balance instead of actual profit. The Reset clears the mess in 14 days at a fixed price — then you run on a real system going forward. You can't build on a broken foundation.",
    recommendation: "Bookkeeping Reset Service",
    price: "$997",
    cta: "Book a Free 15-Min Call →",
    ctaLink: CAL_LINK,
    secondary: "Let's confirm this is the right fit first",
    secondaryLink: CAL_LINK,
    color: BRAND.gold,
    icon: "🔄",
    ckTag: "Level 2 - Monthly Close Command Center",
  },
  3: {
    label: "Level 3 — Systems",
    revenue: "$150K–$300K",
    tagline: "You have revenue, but your financial systems haven't kept up with your growth.",
    description: "Without a real system, you're spending hours each month recreating context you should already have. Your CPA is working from incomplete data. And the decisions you're making about hiring, pricing, and reinvestment are based on guesses, not numbers. LedgerDesk is a real financial database system built for how your business actually operates — handed over so you own it.",
    recommendation: "LedgerDesk Solo",
    price: "$197",
    cta: "Get LedgerDesk Solo →",
    ctaLink: "https://stan.store/Ledgerliftstudio/p/ledgerdesk-solo--bookkeeping-for-founders",
    secondary: "Or book a free call to confirm this is the right fit",
    secondaryLink: CAL_LINK,
    color: BRAND.navyLight,
    icon: "⚙️",
    ckTag: "Level 3 - Build Business Systems",
  },
  4: {
    label: "Level 4 — Strategy",
    revenue: "$300K–$500K",
    tagline: "You have a real business — but your financial infrastructure is still built for a smaller one.",
    description: "At your revenue level, gaps in your financial reporting cost real money — in overpaid taxes, underpriced offers, or missed opportunities to reinvest strategically. You have the data but nobody's turning it into decisions. You need a financial partner who reads your numbers and thinks ahead with you — not just someone who files transactions.",
    recommendation: "Custom Engagement",
    price: "Custom",
    cta: "Book a Free 15-Min Call →",
    ctaLink: CAL_LINK,
    secondary: "Let's figure out exactly what you need",
    secondaryLink: CAL_LINK,
    color: BRAND.coral,
    icon: "📈",
    ckTag: "Level 4 - Scale & Automate",
  },
  5: {
    label: "Level 5 — Optimized",
    revenue: "$500K+",
    tagline: "You've built something real. Your financial operations need to match the size of your ambition.",
    description: "At this stage, financial blind spots compound fast. A miscategorized expense, an unreviewed P&L, or a tax position you didn't plan for can cost you more than a full year of bookkeeping. Multiple revenue streams, a team, complex financials — you've outgrown standard tools. Let's build the right infrastructure for where you're going.",
    recommendation: "Custom Engagement",
    price: "Custom",
    cta: "Book a Strategy Call →",
    ctaLink: CAL_LINK,
    secondary: "Let's build the right solution together",
    secondaryLink: CAL_LINK,
    color: BRAND.navy,
    icon: "🏆",
    ckTag: "Level 5 - Optimize & Master",
  },
};

async function callClaude(messages) {
  const response = await fetch("/.netlify/functions/claude-proxy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  if (!response.ok) {
    const err = await response.text().catch(() => "Unknown error");
    throw new Error(`API error ${response.status}: ${err}`);
  }
  const data = await response.json();
  return data.content || "";
}

async function subscribeToConvertKit({ email, firstName, level }) {
  const levelData = LEVELS[level];
  if (!levelData) return;
  try {
    const response = await fetch("/.netlify/functions/ck-proxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, firstName, tag: levelData.ckTag }),
    });
    if (!response.ok) {
      console.error("ConvertKit subscription failed:", await response.text().catch(() => ""));
    }
  } catch (err) {
    console.error("ConvertKit error (non-blocking):", err);
  }
}

function generateSessionId() {
  return `diag_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

async function trackEvent(sessionId, payload) {
  try {
    await fetch("/.netlify/functions/sheets-proxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, ...payload }),
    });
  } catch {
    // Tracking never breaks the diagnostic experience
  }
}

export default function LedgerLiftDiagnostic() {
  const [phase, setPhase] = useState("intro");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [diagnosedLevel, setDiagnosedLevel] = useState(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [pendingLevel, setPendingLevel] = useState(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [sessionId] = useState(() => generateSessionId());
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const MAX_QUESTIONS = 5;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startDiagnostic = async () => {
    setPhase("chat");
    setIsLoading(true);
    setApiError(null);
    trackEvent(sessionId, { phase: "started", source: document.referrer || "direct", completed: false });
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const text = await callClaude([
          { role: "user", content: "Hi, I'd like to find out what financial level I'm at." },
        ]);
        setMessages([{ role: "assistant", content: text, id: Date.now() }]);
        setQuestionCount(1);
        setIsLoading(false);
        setTimeout(() => inputRef.current?.focus(), 100);
        return;
      } catch {
        if (attempt < 1) await new Promise(r => setTimeout(r, 1500));
      }
    }
    setMessages([{
      role: "assistant",
      content: "First question — roughly what's your annual revenue right now? Ballpark is fine.",
      id: Date.now(),
    }]);
    setQuestionCount(1);
    setIsLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = { role: "user", content: input.trim(), id: Date.now() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setApiError(null);
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const rawText = await callClaude(
          newMessages.map((m) => ({ role: m.role, content: m.content }))
        );
        const diagnosisMatch = rawText.match(/DIAGNOSIS_COMPLETE:(\d)/);
        if (diagnosisMatch) {
          const level = parseInt(diagnosisMatch[1]);
          const cleanText = rawText.replace(/DIAGNOSIS_COMPLETE:\d/, "").trim();
          setMessages((prev) => [...prev, { role: "assistant", content: cleanText, id: Date.now() }]);
          setPendingLevel(level);
          trackEvent(sessionId, { phase: "diagnosed", level, completed: false });
          setTimeout(() => setPhase("reveal"), 1800);
        } else {
          setMessages((prev) => [...prev, { role: "assistant", content: rawText, id: Date.now() }]);
          setQuestionCount((c) => Math.min(c + 1, MAX_QUESTIONS));
        }
        setIsLoading(false);
        return;
      } catch {
        if (attempt < 1) await new Promise(r => setTimeout(r, 1500));
      }
    }
    setIsLoading(false);
    setApiError("Something went wrong. Try sending your message again, or book a call directly.");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const submitEmail = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setEmailSubmitted(true);
    await subscribeToConvertKit({ email: email.trim(), firstName: name.trim() || undefined, level: pendingLevel });
    trackEvent(sessionId, { phase: "converted", level: pendingLevel, name, email, completed: true });
    setDiagnosedLevel(pendingLevel);
    setTimeout(() => setPhase("result"), 600);
  };

  const level = (diagnosedLevel ? LEVELS[diagnosedLevel] : null) || (pendingLevel ? LEVELS[pendingLevel] : null);
  const progressPct = Math.min((questionCount / MAX_QUESTIONS) * 100, 90);

  return (
    <div style={{ fontFamily: "'Georgia','Times New Roman',serif", minHeight: "100vh", background: BRAND.cream, display: "flex", flexDirection: "column" }}>

      {/* ── Header ── */}
      <header style={{ background: BRAND.navy, padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: 36, height: 36, background: BRAND.gold, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: "bold", color: BRAND.navy }}>L</div>
          <span style={{ color: BRAND.cream, fontSize: 16, fontWeight: 600, letterSpacing: "0.02em" }}>LedgerLift Studio</span>
        </div>
        <span style={{ color: BRAND.gold, fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase" }}>Financial Diagnostic</span>
      </header>

      {/* ══ PHASE: INTRO ══ */}
      {phase === "intro" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 24px", maxWidth: 680, margin: "0 auto", width: "100%" }}>
          <div style={{ background: BRAND.gold, color: BRAND.navy, fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", padding: "6px 16px", borderRadius: 100, marginBottom: 32 }}>
            Free · 5 Minutes · No Pitch
          </div>

          <h1 style={{ fontSize: "clamp(28px,5vw,44px)", color: BRAND.navy, textAlign: "center", lineHeight: 1.2, marginBottom: 20, fontWeight: 700 }}>
            Why Do Your Numbers<br />Never Make Sense?
          </h1>

          <p style={{ fontSize: 18, color: BRAND.gray, textAlign: "center", lineHeight: 1.7, marginBottom: 28, maxWidth: 520 }}>
            Answer 5 quick questions and we'll tell you exactly what's broken in your books and the fastest way to fix it — without hiring a $5K/month bookkeeper.
          </p>

          <p style={{ fontSize: 14, color: BRAND.gray, textAlign: "center", marginBottom: 24, fontStyle: "italic", maxWidth: 420 }}>
            Built by Renee Morrison — bookkeeper who's reviewed 100+ sets of bootstrap books.
          </p>

          <p style={{ fontSize: 15, color: BRAND.gray, textAlign: "center", marginBottom: 48, maxWidth: 460 }}>
            Built for founders at $0–$500K — wherever you are, you'll know exactly what to fix first.
          </p>

          <button
            onClick={startDiagnostic}
            style={{ background: BRAND.navy, color: "white", border: "none", borderRadius: 12, padding: "18px 48px", fontSize: 17, fontWeight: 600, cursor: "pointer", letterSpacing: "0.02em", fontFamily: "Georgia,serif", boxShadow: `0 8px 32px ${BRAND.navy}40` }}
            onMouseEnter={e => { e.target.style.background = BRAND.navyLight; e.target.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.target.style.background = BRAND.navy; e.target.style.transform = "translateY(0)"; }}
          >
            Get My Financial Level →
          </button>

          <p style={{ marginTop: 16, fontSize: 13, color: BRAND.gray, textAlign: "center" }}>
            No signup required to start. Takes about 5 minutes.
          </p>
        </div>
      )}

      {/* ══ PHASE: CHAT ══ */}
      {phase === "chat" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", maxWidth: 720, width: "100%", margin: "0 auto", padding: "24px 16px" }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: BRAND.sage }} />
                <span style={{ fontSize: 13, color: BRAND.gray }}>Diagnostic in progress</span>
              </div>
              <span style={{ fontSize: 12, color: BRAND.gray }}>Question {Math.min(questionCount, MAX_QUESTIONS)} of {MAX_QUESTIONS}</span>
            </div>
            <div style={{ height: 4, background: BRAND.lightGray, borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progressPct}%`, background: BRAND.sage, borderRadius: 2, transition: "width 0.4s ease" }} />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16, marginBottom: 20, minHeight: 300, maxHeight: 420 }}>
            {messages.map((msg) => (
              <div key={msg.id} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 10 }}>
                {msg.role === "assistant" && (
                  <div style={{ width: 32, height: 32, background: BRAND.navy, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "white", flexShrink: 0 }}>L</div>
                )}
                <div style={{
                  maxWidth: "75%", padding: "14px 18px",
                  borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  background: msg.role === "user" ? BRAND.navy : "white",
                  color: msg.role === "user" ? "white" : BRAND.navy,
                  fontSize: 15, lineHeight: 1.6,
                  boxShadow: msg.role === "assistant" ? "0 2px 12px rgba(0,0,0,0.06)" : "none",
                  border: msg.role === "assistant" ? `1px solid ${BRAND.lightGray}` : "none",
                  whiteSpace: "pre-line",
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
                <div style={{ width: 32, height: 32, background: BRAND.navy, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "white", flexShrink: 0 }}>L</div>
                <div style={{ padding: "14px 20px", background: "white", borderRadius: "18px 18px 18px 4px", border: `1px solid ${BRAND.lightGray}`, display: "flex", gap: 6, alignItems: "center" }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: BRAND.navy, opacity: 0.4, animation: `bounce 1.2s ${i*0.2}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
            {apiError && (
              <div style={{ background: "#FEF3F2", border: "1px solid #FECDCA", borderRadius: 12, padding: "14px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
                <p style={{ fontSize: 14, color: "#912018", margin: 0 }}>{apiError}</p>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <button onClick={() => { setApiError(null); sendMessage(); }} style={{ background: BRAND.navy, color: "white", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, cursor: "pointer", fontFamily: "Georgia,serif" }}>Try again</button>
                  <a href={CAL_LINK} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: BRAND.gray, textDecoration: "underline" }}>Book a call instead</a>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={{ display: "flex", gap: 12, background: "white", borderRadius: 16, padding: "8px 8px 8px 20px", border: `2px solid ${BRAND.navy}20`, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your answer..."
              rows={1}
              style={{ flex: 1, border: "none", outline: "none", fontSize: 15, color: BRAND.navy, background: "transparent", resize: "none", fontFamily: "Georgia,serif", lineHeight: 1.5, paddingTop: 8 }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              style={{ background: input.trim() && !isLoading ? BRAND.navy : BRAND.lightGray, color: input.trim() && !isLoading ? "white" : BRAND.gray, border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: input.trim() && !isLoading ? "pointer" : "not-allowed", flexShrink: 0, alignSelf: "flex-end" }}
            >
              Send →
            </button>
          </div>
        </div>
      )}

      {/* ══ PHASE: REVEAL ══ */}
      {phase === "reveal" && pendingLevel && LEVELS[pendingLevel] && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 24px", maxWidth: 600, margin: "0 auto", width: "100%" }}>
          <div style={{ background: LEVELS[pendingLevel].color, color: "white", borderRadius: 24, padding: "40px 40px 32px", textAlign: "center", width: "100%", marginBottom: 28, boxShadow: `0 20px 60px ${LEVELS[pendingLevel].color}50`, boxSizing: "border-box" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>{LEVELS[pendingLevel].icon}</div>
            <div style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.8, marginBottom: 10 }}>Your Financial Level</div>
            <h2 style={{ fontSize: 32, fontWeight: 700, margin: "0 0 8px 0", lineHeight: 1.2 }}>{LEVELS[pendingLevel].label}</h2>
            <div style={{ fontSize: 15, opacity: 0.85, marginBottom: 20 }}>{LEVELS[pendingLevel].revenue} annual revenue</div>
            <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 12, padding: "16px 20px" }}>
              <p style={{ fontSize: 16, lineHeight: 1.6, margin: 0, fontStyle: "italic" }}>{LEVELS[pendingLevel].tagline}</p>
            </div>
          </div>

          <div style={{ background: "white", borderRadius: 16, padding: "24px 28px", width: "100%", marginBottom: 24, border: `2px solid ${BRAND.lightGray}`, boxSizing: "border-box" }}>
            <p style={{ fontSize: 14, color: BRAND.gray, textAlign: "center", margin: "0 0 16px 0", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>Your free report includes:</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {["Exactly what's costing you money right now", "The recommended next step for your level", "A clear action plan — no guessing"].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: LEVELS[pendingLevel].color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "white", fontWeight: 700, flexShrink: 0 }}>✓</div>
                  <span style={{ fontSize: 14, color: BRAND.navy }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {!emailSubmitted ? (
            <form onSubmit={submitEmail} style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12, boxSizing: "border-box" }}>
              {pendingLevel === 1 && (
                <>
                  <a
                    href="https://stan.store/Ledgerliftstudio/p/foundation-kit?utm_source=diagnostic&utm_medium=reveal&utm_campaign=foundation-kit"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "block", background: BRAND.gold, color: BRAND.navy, textDecoration: "none", borderRadius: 12, padding: 18, textAlign: "center", fontSize: 16, fontWeight: 700, boxSizing: "border-box", boxShadow: `0 8px 24px ${BRAND.gold}50` }}
                  >
                    Get the Foundation Kit — $27 →
                  </a>
                  <p style={{ textAlign: "center", fontSize: 12, color: BRAND.gray, margin: "0 0 4px 0" }}>
                    Instant download. No email required.
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0" }}>
                    <div style={{ flex: 1, height: 1, background: `${BRAND.navy}15` }} />
                    <span style={{ fontSize: 12, color: BRAND.gray, whiteSpace: "nowrap" }}>or get your free personalized report</span>
                    <div style={{ flex: 1, height: 1, background: `${BRAND.navy}15` }} />
                  </div>
                </>
              )}
              <input type="text" placeholder="Your first name" value={name} onChange={e => setName(e.target.value)} required style={{ width: "100%", padding: "16px 20px", borderRadius: 12, border: `2px solid ${BRAND.navy}20`, fontSize: 16, color: BRAND.navy, background: "white", outline: "none", fontFamily: "Georgia,serif", boxSizing: "border-box" }} />
              <input type="email" placeholder="Your email address" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: "100%", padding: "16px 20px", borderRadius: 12, border: `2px solid ${BRAND.navy}20`, fontSize: 16, color: BRAND.navy, background: "white", outline: "none", fontFamily: "Georgia,serif", boxSizing: "border-box" }} />
              <button type="submit" style={{ background: LEVELS[pendingLevel].color, color: "white", border: "none", borderRadius: 12, padding: 18, fontSize: 16, fontWeight: 600, cursor: "pointer", fontFamily: "Georgia,serif", boxShadow: `0 8px 24px ${LEVELS[pendingLevel].color}40` }}>
                Get My Full {LEVELS[pendingLevel].label} Report →
              </button>
              <p style={{ textAlign: "center", fontSize: 12, color: BRAND.gray, margin: 0 }}>No spam. Unsubscribe anytime.</p>
            </form>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <div style={{ width: 60, height: 60, background: BRAND.sage, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, color: "white" }}>✓</div>
              <p style={{ color: BRAND.sage, fontSize: 16 }}>Loading your full report...</p>
            </div>
          )}
        </div>
      )}

      {/* ══ PHASE: RESULT ══ */}
      {phase === "result" && level && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 24px", maxWidth: 680, margin: "0 auto", width: "100%" }}>
          <div style={{ background: level.color, color: "white", borderRadius: 20, padding: "32px 40px", textAlign: "center", width: "100%", marginBottom: 32, boxShadow: `0 16px 48px ${level.color}40`, boxSizing: "border-box" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>{level.icon}</div>
            <div style={{ fontSize: 12, letterSpacing: "0.15em", textTransform: "uppercase", opacity: 0.8, marginBottom: 8 }}>Your Financial Level</div>
            <h2 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 4px 0" }}>{name ? `${name}, you're ${level.label}` : level.label}</h2>
            <div style={{ fontSize: 15, opacity: 0.85 }}>{level.revenue} annual revenue</div>
          </div>

          <div style={{ background: "white", borderRadius: 16, padding: "24px 28px", width: "100%", marginBottom: 20, border: `2px solid ${level.color}30`, boxSizing: "border-box" }}>
            <p style={{ fontSize: 18, fontWeight: 700, color: BRAND.navy, margin: "0 0 12px 0" }}>{level.tagline}</p>
            <p style={{ fontSize: 15, color: BRAND.gray, lineHeight: 1.7, margin: 0 }}>{level.description}</p>
          </div>

          <div style={{ background: BRAND.navy, borderRadius: 16, padding: "24px 28px", width: "100%", marginBottom: 20, boxSizing: "border-box" }}>
            <div style={{ fontSize: 11, color: BRAND.gold, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Our Recommendation</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: "white" }}>{level.recommendation}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: BRAND.gold }}>{level.price}</div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
            <a href={level.ctaLink} target="_blank" rel="noopener noreferrer" style={{ background: level.color, color: "white", textDecoration: "none", borderRadius: 12, padding: 18, textAlign: "center", fontSize: 16, fontWeight: 600, display: "block", boxShadow: `0 8px 24px ${level.color}40`, boxSizing: "border-box" }}>
              {level.cta}
            </a>
            <a href={level.secondaryLink} target="_blank" rel="noopener noreferrer" style={{ textAlign: "center", fontSize: 13, color: BRAND.gray, textDecoration: "underline", display: "block" }}>
              {level.secondary}
            </a>
          </div>

          <button
            onClick={() => { setPhase("intro"); setMessages([]); setDiagnosedLevel(null); setPendingLevel(null); setEmail(""); setName(""); setEmailSubmitted(false); setQuestionCount(0); setApiError(null); }}
            style={{ background: "transparent", border: "none", color: BRAND.gray, fontSize: 13, cursor: "pointer", marginTop: 32, textDecoration: "underline" }}
          >
            Retake the diagnostic
          </button>
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes bounce { 0%,80%,100%{transform:translateY(0);opacity:0.4} 40%{transform:translateY(-6px);opacity:1} }
      `}</style>
    </div>
  );
}
