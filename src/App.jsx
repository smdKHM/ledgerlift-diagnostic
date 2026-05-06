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

// ─── 5 FINANCIAL LEVELS ──────────────────────────────────────────────────────
const LEVELS = {
  1: {
    label: "Level 1 — Foundation",
    revenue: "$0–$50K",
    tagline: "You need a simple system, not a bookkeeper.",
    description:
      "Your books are either nonexistent or a mess of spreadsheets and receipts. The good news: you don't need to hire anyone yet. A solid template and a weekend afternoon will get you 80% of the way there.",
    recommendation: "Bookkeeping Quickstart Guide",
    price: "$47",
    cta: "Get the Quickstart Guide",
    ctaLink: "https://ledger-lift-studio.kit.com/8d5b5a114e",
    secondary: "Or book a free diagnostic call to confirm",
    secondaryLink: "https://ledger-lift-studio.kit.com/8d5b5a114e",
    color: BRAND.sage,
    icon: "🌱",
  },
  2: {
    label: "Level 2 — Cleanup",
    revenue: "$50K–$150K",
    tagline: "You need a Bookkeeping Reset, not a subscription.",
    description:
      "Your books are behind — possibly months behind. Accounts aren't reconciled, transactions are uncategorized, and tax season fills you with dread. A one-time Reset fixes everything in 14 days at a fixed price.",
    recommendation: "Bookkeeping Reset",
    price: "$997",
    cta: "Book a Free Diagnostic Call",
    ctaLink: "https://ledger-lift-studio.kit.com/dddc0c1e86",
    secondary: "Let's confirm this is right for you first",
    secondaryLink: "https://ledger-lift-studio.kit.com/dddc0c1e86",
    color: BRAND.gold,
    icon: "🔄",
  },
  3: {
    label: "Level 3 — Systems",
    revenue: "$150K–$300K",
    tagline: "You need ongoing support, not a one-time fix.",
    description:
      "Your books are mostly current but you're spending too much time managing them yourself. Monthly bookkeeping keeps everything clean and gives you reports you can actually use to run the business.",
    recommendation: "Monthly Bookkeeping — Basic",
    price: "$97–$297/mo",
    cta: "Book a Free Diagnostic Call",
    ctaLink: "https://ledger-lift-studio.kit.com/dddc0c1e86",
    secondary: "We'll confirm the right tier on the call",
    secondaryLink: "https://ledger-lift-studio.kit.com/dddc0c1e86",
    color: BRAND.navyLight,
    icon: "⚙️",
  },
  4: {
    label: "Level 4 — Strategy",
    revenue: "$300K–$500K",
    tagline: "You need financial insight, not just data.",
    description:
      "You have a bookkeeper or your books are current — but no one is turning the numbers into decisions. You need weekly strategic calls, scenario modeling, and a financial partner who thinks ahead with you.",
    recommendation: "Monthly Bookkeeping — CFO Tier",
    price: "$697/mo",
    cta: "Book a Free Diagnostic Call",
    ctaLink: "https://ledger-lift-studio.kit.com/dddc0c1e86",
    secondary: "CFO-level insight at a fraction of the cost",
    secondaryLink: "https://ledger-lift-studio.kit.com/dddc0c1e86",
    color: BRAND.coral,
    icon: "📈",
  },
  5: {
    label: "Level 5 — Optimized",
    revenue: "$500K+",
    tagline: "You need a full financial stack.",
    description:
      "Multiple revenue streams, a team, complex financials — you've outgrown standard bookkeeping. Let's have a real conversation about what a custom solution looks like for your business.",
    recommendation: "Custom Engagement",
    price: "Custom",
    cta: "Book a Strategy Call",
    ctaLink: "https://ledger-lift-studio.kit.com/dddc0c1e86",
    secondary: "Let's build the right solution together",
    secondaryLink: "https://ledger-lift-studio.kit.com/dddc0c1e86",
    color: BRAND.navy,
    icon: "🏆",
  },
};

// ─── API CALL (via Netlify Function) ─────────────────────────────────────────
async function callClaude(messages) {
  const response = await fetch("/.netlify/functions/claude-proxy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  if (!response.ok) throw new Error("API call failed");
  const data = await response.json();
  return data.content || "";
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
  const [diagnosedLevel, setDiagnosedLevel] = useState(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [pendingLevel, setPendingLevel] = useState(null);
  const [sessionId] = useState(() => generateSessionId());
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Start diagnostic ──────────────────────────────────────────────────────
  const startDiagnostic = async () => {
    setPhase("chat");
    setIsLoading(true);
    // Track: session started
    trackEvent(sessionId, { phase: "started", source: document.referrer || "direct", completed: false });
    try {
      const text = await callClaude([
        { role: "user", content: "Hi, I'd like to find out what financial level I'm at." },
      ]);
      setMessages([{ role: "assistant", content: text, id: Date.now() }]);
    } catch {
      setMessages([{
        role: "assistant",
        content: "Hey! I'm your LedgerLift financial advisor. Let's figure out exactly where your books stand. First question — roughly what's your annual revenue right now?",
        id: Date.now(),
      }]);
    }
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
        // Track: diagnosis reached
        trackEvent(sessionId, { phase: "diagnosed", level, completed: false });
        setTimeout(() => setPhase("email"), 1800);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: rawText, id: Date.now() }]);
      }
    } catch {
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "Sorry, I hit a snag. Could you tell me a bit more about your current bookkeeping situation?",
        id: Date.now(),
      }]);
    }
    setIsLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // ── Submit email ──────────────────────────────────────────────────────────
  const submitEmail = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setEmailSubmitted(true);
    // Track: email captured — full conversion event
    trackEvent(sessionId, { phase: "converted", level: pendingLevel, name, email, completed: true });
    setDiagnosedLevel(pendingLevel);
    setTimeout(() => setPhase("result"), 600);
  };

  const level = diagnosedLevel ? LEVELS[diagnosedLevel] : null;

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

          <p style={{ fontSize: 18, color: BRAND.gray, textAlign: "center", lineHeight: 1.7, marginBottom: 40, maxWidth: 520 }}>
            Answer a few questions and our AI advisor will identify your exact Financial Level and tell you precisely what your books need — whether that's a $47 template or a $997 reset.
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

          {/* Status pill */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, padding: "10px 16px", background: "white", borderRadius: 100, border: `1px solid ${BRAND.lightGray}`, width: "fit-content" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: BRAND.sage, animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: 13, color: BRAND.gray }}>Diagnostic in progress</span>
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
            <h2 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 4px 0" }}>{level.label}</h2>
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

          {/* CTAs */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
            <a href={level.ctaLink} target="_blank" rel="noopener noreferrer"
              style={{ background: level.color, color: "white", textDecoration: "none", borderRadius: 12, padding: 18, textAlign: "center", fontSize: 16, fontWeight: 600, display: "block", boxShadow: `0 8px 24px ${level.color}40` }}>
              {level.cta} →
            </a>
            <p style={{ textAlign: "center", fontSize: 13, color: BRAND.gray, margin: 0 }}>{level.secondary}</p>
          </div>

          {/* Retake */}
          <button
            onClick={() => { setPhase("intro"); setMessages([]); setDiagnosedLevel(null); setPendingLevel(null); setEmail(""); setName(""); setEmailSubmitted(false); }}
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
