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

// ─── FIX #1: SYSTEM PROMPT ───────────────────────────────────────────────────
// Named SYSTEM_PROMPT to match the variable your claude-proxy.js already reads.
// eslint-disable-next-line no-unused-vars
const SYSTEM_PROMPT = `You are a financial diagnostic advisor for LedgerLift Studio, a bookkeeping service built for bootstrap founders. Your job is to figure out which of the 5 Financial Levels a founder is at, then tell them clearly what they need — no fluff, no sales pitch.

Your voice: Direct, warm, slightly casual. You're the knowledgeable friend who happens to know bookkeeping inside out. You've seen hundreds of sets of messy books. You're not here to judge — you're here to give a real answer.

━━━ THE 5 FINANCIAL LEVELS ━━━

Level 1 — Foundation ($0–$50K revenue)
- No bookkeeping system or a chaotic spreadsheet
- Can't tell if they made money last month
- Expenses mixed with personal spending
- Hasn't filed taxes properly or relies on a shoebox
- What they need: A simple DIY system (the Phase 1 Workbook, $17)

Level 2 — Cleanup ($50K–$150K revenue)
- Has some system but it's months behind
- Transactions uncategorized, accounts unreconciled
- Dreads tax season because the books are a mess
- Knows something's wrong but doesn't know where to start
- What they need: A one-time Bookkeeping Reset ($997, done in 14 days)

Level 3 — Systems ($150K–$300K revenue)
- Books are mostly current but managing them takes too much founder time
- No real monthly close process
- Reports exist but aren't being used to make decisions
- Ready to hand this off to a real system
- What they need: LedgerDesk ($197) — a done-with-you system for monthly close

Level 4 — Strategy ($300K–$500K revenue)
- Books are clean (maybe has a bookkeeper already)
- Revenue is real but cash flow is confusing
- No one is turning the numbers into decisions
- Needs a financial thinking partner, not just a data entry service
- What they need: A diagnostic call to scope a custom ongoing engagement

Level 5 — Optimized ($500K+ revenue)
- Multiple revenue streams, possibly a small team
- Complex financials, needs real financial infrastructure
- Standard bookkeeping tools have been outgrown
- What they need: Custom engagement — must talk directly

━━━ YOUR DIAGNOSTIC PROCESS ━━━

Ask exactly these 5 questions, one at a time. Wait for each answer before asking the next. Do not ask two questions in one message.

Q1 (Revenue): "First question — roughly what's your annual revenue right now? Ballpark is fine."

Q2 (Bookkeeping status): Based on their revenue range, ask something like: "And how would you describe your bookkeeping situation right now — are you keeping up, behind, or is it basically nonexistent?"

Q3 (Pain point): Dig into the specific pain. Examples: "When's the last time your books were fully caught up?" or "Do you know roughly what your profit margin is right now?" or "What happens at tax time — do you hand over organized records or a shoebox?"

Q4 (Time/effort): "How much time are you currently spending trying to manage your finances each week?"

Q5 (Urgency/goal): "What's the main thing you want to fix or understand about your finances right now?"

After Q5, or earlier if the picture is already crystal clear, make your diagnosis.

━━━ DIAGNOSIS RULES ━━━

When you have enough information (usually after Q3–Q5, sometimes after Q2 if it's obvious):

1. Give a 2–3 sentence warm, direct summary of what you're seeing. Sound like a friend giving a real read, not a chatbot generating a report.

2. Name their level clearly: "Based on what you've told me, you're a Level [N]."

3. Tell them what that means in plain English — one sentence.

4. End your message with the exact string: DIAGNOSIS_COMPLETE:[N]
   Replace [N] with the level number (1, 2, 3, 4, or 5).
   Example: DIAGNOSIS_COMPLETE:2

This string will be hidden from the user and used to route them to the right result page. Do not explain it or reference it in your message.

━━━ IMPORTANT GUARDRAILS ━━━

- Never mention specific product names or prices during the conversation. The result page handles that.
- Never say "LedgerLift" or reference the company by name. Just be the advisor.
- Do not use words like "amazing," "game-changing," or "solution."
- If someone seems defensive about their books being messy, normalize it: "That's honestly the most common situation I see."
- If someone's revenue or situation puts them clearly at Level 1 or 2, you can make the diagnosis after Q3 — no need to force all 5 questions.
- Keep responses short. 3–5 sentences max per message during the diagnostic. This is a conversation, not a report.
- If someone asks what this tool is or who made it, say it's a free financial diagnostic — keep it brief and redirect to the questions.`;

// ─── FIX #3: LEVELS — products, prices, and CTAs aligned with strategy docs ──
// Primary CTA → product purchase (Stan Store) for Levels 1–2.
// Secondary CTA → diagnostic call booking for all levels.
// Levels 3–5 primary CTA → diagnostic call (higher-touch, needs a conversation).
const LEVELS = {
  1: {
    label: "Level 1 — Foundation",
    revenue: "$0–$50K",
    tagline: "You need a simple system, not a bookkeeper.",
    description:
      "Your books are either nonexistent or a mess of receipts and guesses. The good news: you don't need to hire anyone yet. A solid template and a focused weekend will get you 80% of the way there.",
    recommendation: "Phase 1 Core Workbook",
    price: "$17",
    cta: "Get the Phase 1 Workbook →",
    ctaLink: "https://stan.store/ledgerliftstudio",
    secondary: "Or book a free call to talk through your situation",
    secondaryLink: "https://ledger-lift-studio.kit.com/dddc0c1e86",
    color: BRAND.sage,
    icon: "🌱",
    ckTag: "diagnostic-level-1",
  },
  2: {
    label: "Level 2 — Cleanup",
    revenue: "$50K–$150K",
    tagline: "You need a Bookkeeping Reset, not a subscription.",
    description:
      "Your books are behind — possibly months behind. Accounts aren't reconciled, transactions are uncategorized, and tax season fills you with dread. A one-time Reset fixes everything in 14 days at a fixed price.",
    recommendation: "Bookkeeping Reset Service",
    price: "$997",
    cta: "Book a Free Diagnostic Call →",
    ctaLink: "https://ledger-lift-studio.kit.com/dddc0c1e86",
    secondary: "Let's confirm this is the right fit first",
    secondaryLink: "https://ledger-lift-studio.kit.com/dddc0c1e86",
    color: BRAND.gold,
    icon: "🔄",
    ckTag: "diagnostic-level-2",
  },
  3: {
    label: "Level 3 — Systems",
    revenue: "$150K–$300K",
    tagline: "You need ongoing support, not a one-time fix.",
    description:
      "Your books are mostly current but you're spending too much time managing them yourself. LedgerDesk gives you a real system and monthly close support so you can stop being your own bookkeeper.",
    recommendation: "LedgerDesk",
    price: "$197",
    cta: "Book a Free Diagnostic Call →",
    ctaLink: "https://ledger-lift-studio.kit.com/dddc0c1e86",
    secondary: "We'll confirm the right setup on the call",
    secondaryLink: "https://ledger-lift-studio.kit.com/dddc0c1e86",
    color: BRAND.navyLight,
    icon: "⚙️",
    ckTag: "diagnostic-level-3",
  },
  4: {
    label: "Level 4 — Strategy",
    revenue: "$300K–$500K",
    tagline: "You need financial insight, not just clean books.",
    description:
      "You have the data but nobody's turning it into decisions. You need a financial partner who reads your numbers and thinks ahead with you — not just a bookkeeper who files transactions.",
    recommendation: "Reset + Strategy Call",
    price: "Custom",
    cta: "Book a Free Diagnostic Call →",
    ctaLink: "https://ledger-lift-studio.kit.com/dddc0c1e86",
    secondary: "Let's figure out exactly what you need",
    secondaryLink: "https://ledger-lift-studio.kit.com/dddc0c1e86",
    color: BRAND.coral,
    icon: "📈",
    ckTag: "diagnostic-level-4",
  },
  5: {
    label: "Level 5 — Optimized",
    revenue: "$500K+",
    tagline: "You need a full financial stack.",
    description:
      "Multiple revenue streams, a team, complex financials — you've outgrown standard bookkeeping. Let's have a real conversation about a custom solution for your business.",
    recommendation: "Custom Engagement",
    price: "Custom",
    cta: "Book a Strategy Call →",
    ctaLink: "https://ledger-lift-studio.kit.com/dddc0c1e86",
    secondary: "Let's build the right solution together",
    secondaryLink: "https://ledger-lift-studio.kit.com/dddc0c1e86",
    color: BRAND.navy,
    icon: "🏆",
    ckTag: "diagnostic-level-5",
  },
};

// ─── API CALL (via Netlify Function) ─────────────────────────────────────────
// FIX #1: No longer sends system prompt in the body — claude-proxy.js already
// reads SYSTEM_PROMPT from the component scope and injects it into the
// Anthropic API call. Messages only.
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

// ─── FIX #2: CONVERTKIT INTEGRATION ──────────────────────────────────────────
// Subscribes the user and applies a level-specific tag so the right email
// sequence fires automatically.
//
// SETUP REQUIRED — deploy netlify/functions/ck-proxy.js:
//
// exports.handler = async (event) => {
//   if (event.httpMethod !== "POST") return { statusCode: 405 };
//   const { email, firstName, tag } = JSON.parse(event.body);
//   const res = await fetch(
//     `https://api.convertkit.com/v3/forms/${process.env.CONVERTKIT_FORM_ID}/subscribe`,
//     {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         api_key: process.env.CONVERTKIT_API_KEY,
//         email,
//         first_name: firstName,
//         tags: [tag],
//       }),
//     }
//   );
//   const data = await res.json();
//   return { statusCode: res.ok ? 200 : 500, body: JSON.stringify(data) };
// };
//
// Also set these Netlify env vars:
//   CONVERTKIT_API_KEY=your_api_key
//   CONVERTKIT_FORM_ID=your_form_id
//
// In ConvertKit: create tags diagnostic-level-1 through diagnostic-level-5,
// then set up automations: tag applied → enter matching email sequence.

async function subscribeToConvertKit({ email, firstName, level }) {
  const levelData = LEVELS[level];
  if (!levelData) return;
  try {
    const response = await fetch("/.netlify/functions/ck-proxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        firstName,
        tag: levelData.ckTag,
      }),
    });
    if (!response.ok) {
      console.error("ConvertKit subscription failed:", await response.text().catch(() => ""));
    } else {
      console.log(`[CK] Subscribed ${email} with tag ${levelData.ckTag}`);
    }
  } catch (err) {
    // Non-blocking — CK failure never prevents the user seeing their result
    console.error("ConvertKit error (non-blocking):", err);
  }
}

// ─── SESSION TRACKING ────────────────────────────────────────────────────────
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

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function LedgerLiftDiagnostic() {
  const [phase, setPhase] = useState("intro"); // intro | chat | email | result
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

  // ── Start diagnostic ──────────────────────────────────────────────────────
  const startDiagnostic = async () => {
    setPhase("chat");
    setIsLoading(true);
    setApiError(null);
    trackEvent(sessionId, { phase: "started", source: document.referrer || "direct", completed: false });

    // Retry up to 2 times before falling back to hardcoded opener
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

    // Fallback if both attempts fail
    setMessages([{
      role: "assistant",
      content: "Hey! I'm your financial advisor. Let's figure out exactly where your books stand.\n\nFirst question — roughly what's your annual revenue right now? Ballpark is fine.",
      id: Date.now(),
    }]);
    setQuestionCount(1);
    setIsLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // ── Send message ──────────────────────────────────────────────────────────
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
          setTimeout(() => setPhase("email"), 1800);
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

    // Both attempts failed — show error with retry affordance
    setIsLoading(false);
    setApiError("Something went wrong. Try sending your message again, or book a call directly.");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // ── Submit email ──────────────────────────────────────────────────────────
  // FIX #2: Now subscribes to ConvertKit with level tag before showing result
  const submitEmail = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setEmailSubmitted(true);

    await subscribeToConvertKit({
      email: email.trim(),
      firstName: name.trim() || undefined,
      level: pendingLevel,
    });

    trackEvent(sessionId, { phase: "converted", level: pendingLevel, name, email, completed: true });
    setDiagnosedLevel(pendingLevel);
    setTimeout(() => setPhase("result"), 600);
  };

  const level = diagnosedLevel ? LEVELS[diagnosedLevel] : null;
  const progressPct = Math.min((questionCount / MAX_QUESTIONS) * 100, 90);

  // ─────────────────────────────────────────────────────────────────────────
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

      {/* ══════════════════════════════════════════════════════════════════════
          PHASE: INTRO
      ══════════════════════════════════════════════════════════════════════ */}
      {phase === "intro" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 24px", maxWidth: 680, margin: "0 auto", width: "100%" }}>
          <div style={{ background: BRAND.gold, color: BRAND.navy, fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", padding: "6px 16px", borderRadius: 100, marginBottom: 32 }}>
            Free · 5 Minutes · No Pitch
          </div>

          <h1 style={{ fontSize: "clamp(28px,5vw,44px)", color: BRAND.navy, textAlign: "center", lineHeight: 1.2, marginBottom: 20, fontWeight: 700 }}>
            What Financial Level<br />Are You Actually At?
          </h1>

          <p style={{ fontSize: 18, color: BRAND.gray, textAlign: "center", lineHeight: 1.7, marginBottom: 28, maxWidth: 520 }}>
            Answer a few questions and our AI advisor will identify your exact Financial Level and tell you precisely what your books need — whether that's a $17 template or a $997 reset.
          </p>

          {/* Trust signal */}
          <p style={{ fontSize: 14, color: BRAND.gray, textAlign: "center", marginBottom: 40, fontStyle: "italic", maxWidth: 420 }}>
            Built by Renee Morrison — bookkeeper who's reviewed 100+ sets of bootstrap books.
          </p>

          {/* Level preview pills */}
          <div style={{ display: "flex", gap: 8, marginBottom: 48, flexWrap: "wrap", justifyContent: "center" }}>
            {Object.entries(LEVELS).map(([num, l]) => (
              <div key={num} style={{ background: "white", border: `2px solid ${l.color}20`, borderRadius: 12, padding: "12px 16px", textAlign: "center", minWidth: 90 }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{l.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: l.color, letterSpacing: "0.05em" }}>Level {num}</div>
                <div style={{ fontSize: 10, color: BRAND.gray }}>{l.revenue}</div>
              </div>
            ))}
          </div>

          <button
            onClick={startDiagnostic}
            style={{ background: BRAND.navy, color: "white", border: "none", borderRadius: 12, padding: "18px 48px", fontSize: 17, fontWeight: 600, cursor: "pointer", letterSpacing: "0.02em", fontFamily: "Georgia,serif", boxShadow: `0 8px 32px ${BRAND.navy}40` }}
            onMouseEnter={e => { e.target.style.background = BRAND.navyLight; e.target.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.target.style.background = BRAND.navy; e.target.style.transform = "translateY(0)"; }}
          >
            Start My Free Diagnostic →
          </button>

          <p style={{ marginTop: 20, fontSize: 13, color: BRAND.gray, textAlign: "center" }}>No signup required to start. Takes about 5 minutes.</p>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          PHASE: CHAT
      ══════════════════════════════════════════════════════════════════════ */}
      {phase === "chat" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", maxWidth: 720, width: "100%", margin: "0 auto", padding: "24px 16px" }}>

          {/* Progress bar */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: BRAND.sage }} />
                <span style={{ fontSize: 13, color: BRAND.gray }}>Diagnostic in progress</span>
              </div>
              <span style={{ fontSize: 12, color: BRAND.gray }}>
                Question {Math.min(questionCount, MAX_QUESTIONS)} of {MAX_QUESTIONS}
              </span>
            </div>
            <div style={{ height: 4, background: BRAND.lightGray, borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progressPct}%`, background: BRAND.sage, borderRadius: 2, transition: "width 0.4s ease" }} />
            </div>
          </div>

          {/* Messages */}
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

            {/* Typing indicator */}
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

            {/* Error state with retry */}
            {apiError && (
              <div style={{ background: "#FEF3F2", border: "1px solid #FECDCA", borderRadius: 12, padding: "14px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
                <p style={{ fontSize: 14, color: "#912018", margin: 0 }}>{apiError}</p>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <button
                    onClick={() => { setApiError(null); sendMessage(); }}
                    style={{ background: BRAND.navy, color: "white", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, cursor: "pointer", fontFamily: "Georgia,serif" }}
                  >
                    Try again
                  </button>
                  <a
                    href="https://ledger-lift-studio.kit.com/dddc0c1e86"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 13, color: BRAND.gray, textDecoration: "underline" }}
                  >
                    Book a call instead
                  </a>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input bar */}
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

      {/* ══════════════════════════════════════════════════════════════════════
          PHASE: EMAIL CAPTURE
      ══════════════════════════════════════════════════════════════════════ */}
      {phase === "email" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 24px", maxWidth: 560, margin: "0 auto", width: "100%" }}>
          <div style={{ fontSize: 48, marginBottom: 24 }}>{pendingLevel ? LEVELS[pendingLevel].icon : "📊"}</div>
          <h2 style={{ fontSize: 28, color: BRAND.navy, textAlign: "center", marginBottom: 12, fontWeight: 700 }}>Your diagnosis is ready.</h2>
          <p style={{ fontSize: 16, color: BRAND.gray, textAlign: "center", lineHeight: 1.6, marginBottom: 40, maxWidth: 420 }}>
            Enter your name and email to get your full Financial Health Report — your Financial Level, what it means, and your exact next step.
          </p>

          {!emailSubmitted ? (
            <form onSubmit={submitEmail} style={{ width: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
              <input type="text" placeholder="Your first name" value={name} onChange={e => setName(e.target.value)} required
                style={{ width: "100%", padding: "16px 20px", borderRadius: 12, border: `2px solid ${BRAND.navy}20`, fontSize: 16, color: BRAND.navy, background: "white", outline: "none", fontFamily: "Georgia,serif", boxSizing: "border-box" }} />
              <input type="email" placeholder="Your email address" value={email} onChange={e => setEmail(e.target.value)} required
                style={{ width: "100%", padding: "16px 20px", borderRadius: 12, border: `2px solid ${BRAND.navy}20`, fontSize: 16, color: BRAND.navy, background: "white", outline: "none", fontFamily: "Georgia,serif", boxSizing: "border-box" }} />
              <button type="submit"
                style={{ background: BRAND.navy, color: "white", border: "none", borderRadius: 12, padding: 18, fontSize: 16, fontWeight: 600, cursor: "pointer", fontFamily: "Georgia,serif", marginTop: 4, boxShadow: `0 8px 24px ${BRAND.navy}30` }}>
                Show My Financial Level →
              </button>
              <p style={{ textAlign: "center", fontSize: 12, color: BRAND.gray, marginTop: 4 }}>No spam. Unsubscribe anytime.</p>
            </form>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <div style={{ width: 60, height: 60, background: BRAND.sage, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, color: "white" }}>✓</div>
              <p style={{ color: BRAND.sage, fontSize: 16 }}>Loading your results...</p>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          PHASE: RESULT
      ══════════════════════════════════════════════════════════════════════ */}
      {phase === "result" && level && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 24px", maxWidth: 680, margin: "0 auto", width: "100%" }}>

          {/* Level badge */}
          <div style={{ background: level.color, color: "white", borderRadius: 20, padding: "32px 40px", textAlign: "center", width: "100%", marginBottom: 32, boxShadow: `0 16px 48px ${level.color}40`, boxSizing: "border-box" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>{level.icon}</div>
            <div style={{ fontSize: 12, letterSpacing: "0.15em", textTransform: "uppercase", opacity: 0.8, marginBottom: 8 }}>Your Financial Level</div>
            {/* Personalized with name if provided */}
            <h2 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 4px 0" }}>
              {name ? `${name}, you're ${level.label}` : level.label}
            </h2>
            <div style={{ fontSize: 15, opacity: 0.85 }}>{level.revenue} annual revenue</div>
          </div>

          {/* Diagnosis */}
          <div style={{ background: "white", borderRadius: 16, padding: "24px 28px", width: "100%", marginBottom: 20, border: `2px solid ${level.color}30`, boxSizing: "border-box" }}>
            <p style={{ fontSize: 18, fontWeight: 700, color: BRAND.navy, margin: "0 0 12px 0" }}>{level.tagline}</p>
            <p style={{ fontSize: 15, color: BRAND.gray, lineHeight: 1.7, margin: 0 }}>{level.description}</p>
          </div>

          {/* Recommendation */}
          <div style={{ background: BRAND.navy, borderRadius: 16, padding: "24px 28px", width: "100%", marginBottom: 20, boxSizing: "border-box" }}>
            <div style={{ fontSize: 11, color: BRAND.gold, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Our Recommendation</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: "white" }}>{level.recommendation}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: BRAND.gold }}>{level.price}</div>
            </div>
          </div>

          {/* CTAs — primary to product, secondary to call */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
            <a href={level.ctaLink} target="_blank" rel="noopener noreferrer"
              style={{ background: level.color, color: "white", textDecoration: "none", borderRadius: 12, padding: 18, textAlign: "center", fontSize: 16, fontWeight: 600, display: "block", boxShadow: `0 8px 24px ${level.color}40`, boxSizing: "border-box" }}>
              {level.cta}
            </a>
            <a href={level.secondaryLink} target="_blank" rel="noopener noreferrer"
              style={{ textAlign: "center", fontSize: 13, color: BRAND.gray, textDecoration: "underline", display: "block" }}>
              {level.secondary}
            </a>
          </div>

          {/* Retake */}
          <button
            onClick={() => {
              setPhase("intro");
              setMessages([]);
              setDiagnosedLevel(null);
              setPendingLevel(null);
              setEmail("");
              setName("");
              setEmailSubmitted(false);
              setQuestionCount(0);
              setApiError(null);
            }}
            style={{ background: "transparent", border: "none", color: BRAND.gray, fontSize: 13, cursor: "pointer", marginTop: 32, textDecoration: "underline" }}>
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
