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

// NOTE: SYSTEM_PROMPT removed from this file (June 18, 2026 — Session 35).
// It was unused dead code — the real system prompt lives in
// netlify/functions/claude-proxy.js and is the single source of truth.
// Keeping a duplicate copy here caused this file to drift out of sync
// with the backend prompt. Do not re-add a prompt constant here.

const CAL_LINK = "https://cal.com/ledgerliftstudio/free-15-minute-books-reality-report";
const SCOPING_CALL_LINK = "https://cal.com/ledgerliftstudio/custom-engagement-scoping-call";
// v2.9 — Payhip short links (Stan closes Nov 9, 2026). The redirects drop query
// strings, so no UTMs here; click counts live in the blog's Redirection log.
const SOLO_LINK = "https://blog.ledgerliftstudio.com/buy/solo";
const SHOP_LINK = "https://blog.ledgerliftstudio.com/shop";

// PRODUCT VERSION: v2.9 — Stan → Payhip repoint, retired products removed (Session 147)
// LAST REVIEWED: October 26, 2026
// CHANGE LOG (v2.9):
// - Stage 1 + reveal screen: Foundation Kit ($27) retired S107, Stan listing
//   drafted Sep 30 (404 since). Now routes to the free 15-minute call; the
//   Stage 1-only Foundation Kit button on the reveal screen is removed.
// - Stage 3: Monthly Close Command Center ($29) retired, Stan listing
//   drafted Sep 30 (404 since). Now routes to the free 15-minute call.
//   Solo deliberately NOT used here: Solo serves Systemized (S139).
// - Stage 4: LedgerDesk Solo link moved from Stan to SOLO_LINK (Payhip).
// - Stage 1 + 3 secondary link: SHOP_LINK, so neither stage has the same
//   URL on both buttons.
// - Intro byline: "Renee" → "Renée" (public name rule, Oct 14).
// - BUILD NOTE: SOLO_LINK and SHOP_LINK are both referenced below, so the
//   CI=true no-unused-vars rule is satisfied. Keep it that way.
// - ckTag values still UNCHANGED (Option B).
// PRODUCT VERSION: v2.8 — Stage 2 + Stage 5 routing repair (Session 105)
// LAST REVIEWED: August 15, 2026
// CHANGE LOG (v2.8):
// - Stage 5: repointed ctaLink from SOLO_STRATEGY_SESSION_LINK back to
//   SCOPING_CALL_LINK and replaced the recommendation with LedgerDesk
//   Custom ($2,500). Rationale: v2.5 moved Stage 5 to a self-serve Stan
//   Store checkout because Rec #11 wanted self-serve. That reasoning is
//   now wrong — LedgerDesk Custom is a $2,500 flat engagement (50% up
//   front / 50% at handover) that cannot be sold self-serve, so a scoping
//   call is the correct mechanism, not a bridge to one. Stage 5's own
//   description already described the Custom scoping path verbatim
//   ("no single off-the-shelf system fits without scoping first"); the
//   product it described simply didn't exist in July and does now.
// - DEPENDENCY — this had to ship BEFORE the $297 Stan listing retitle.
//   SOLO_STRATEGY_SESSION_LINK pointed at
//   /p/book-your-strategy-session-1f9cxvun, which is the exact listing
//   being repurposed as the Historical Summary Load. Had the retitle
//   landed first, Stage 5 would have either sold a Catch-Up summary load
//   to a Scaling founder or dead-linked. Both failures are silent.
// - Stage 5: fixed secondaryLink. It pointed at the same URL as ctaLink,
//   so "Have questions first? Let's talk it through" led to checkout —
//   Stage 5 was the only stage with no free-call exit. Now CAL_LINK.
// - Stage 5: removed the name "Financial Systems Strategy Session," which
//   never matched the live Stan listing name ("LedgerDesk Strategy
//   Session") — a mismatch that was live in the tool for six weeks.
// - Stage 2: routed to the free call with no product attached. Was
//   recommending "Bookkeeping Reset Service" at $997 — fully retired, so
//   the CTA booked founders onto a call for something undeliverable.
//   Not a 404; the quieter failure. Description rewritten to the
//   catch-up-then-load framing. DELIBERATELY NOT routed to the new $297
//   Historical Summary Load listing: the standard-vs-non-standard ratio
//   is unknown until the first three calls, and a published price becomes
//   a ceiling on a job four times the size.
// - Deleted the now-unused SOLO_STRATEGY_SESSION_LINK constant in the
//   SAME commit as the Stage 5 swap. This is the exact no-unused-vars
//   condition that hard-failed the v2.5 build under Netlify's CI=true and
//   left the live site serving v2.4 for weeks. Do not split these.
// - Stage 4: added the missing UTM query string to the LedgerDesk Solo
//   link. Stages 1 and 3 carried UTMs; 4 and 5 did not, which is part of
//   why Stan Store attribution reads "Other" only.
// - ckTag values left UNCHANGED again — same Option B decision as v2.0.
//   ConvertKit tags must be rebuilt before these can be renamed.
// PRODUCT VERSION: v2.7 — Rec #11 cleanup (Track 1, Session 66+)
// LAST REVIEWED: July 4, 2026
// CHANGE LOG (v2.7):
// - Stage 5: tightened price field from "$247–297" (a range covering both
//   Solo/Access tracks) to "$297" — matches the SOLO_STRATEGY_SESSION_LINK
//   the ctaLink now points to specifically. NOTE: if Stage 5 traffic ever
//   needs to branch by track (Solo vs Access), the $247 Access-track
//   Strategy Session is live at a separate Stan Store URL
//   (book-your-strategy-session-bk3emtji) — not wired into this stage,
//   since Stage 5 currently routes everyone through the Solo track only.
// PRODUCT VERSION: v2.6 — Rec #11 execution, build fix (Track 1, Session 66+)
// LAST REVIEWED: July 4, 2026
// CHANGE LOG (v2.6):
// - Removed the now-unused SCOPING_CALL_LINK constant. It was left over
//   from v2.4 after v2.5 swapped Stage 5's ctaLink/secondaryLink to
//   SOLO_STRATEGY_SESSION_LINK — nothing referenced it anymore. Netlify's
//   build runs with CI=true, which treats ESLint warnings (including
//   no-unused-vars) as hard build failures, so the v2.5 deploy failed at
//   the build stage and Netlify kept serving the last successful (v2.4)
//   build — which is why the live site still showed the old Cal.com
//   scoping-call link after the v2.5 push. This fix removes the dead
//   constant so the build succeeds and v2.5's actual intended change
//   (Stage 5 → Stan Store Strategy Session link) can go live.
// PRODUCT VERSION: v2.5 — Rec #11 execution (Track 1, Session 66+)
// LAST REVIEWED: July 4, 2026
// CHANGE LOG (v2.5):
// - Stage 5: swapped ctaLink/secondaryLink from SCOPING_CALL_LINK
//   (Cal.com bridge) to SOLO_STRATEGY_SESSION_LINK — the live Stan Store
//   "Coaching Call" product (Financial Systems Strategy Session, LedgerDesk
//   Solo track, $297). This is the real self-serve checkout Rec #11 called
//   for, replacing the temporary Cal.com bridge noted in v2.4. Stage 4
//   deliberately left untouched — stays a plain LedgerDesk Solo purchase,
//   no session attached (Stage 4 = tooling/time problem, self-serve fits;
//   Stage 5 = needs scoping first, session fits).
// - KNOWN OPEN ITEM: `price` field still reads "$247–297" (a range meant
//   to cover both Solo/Access tracks). Since ctaLink now points at the
//   $297 Solo-track product specifically, the displayed price should
//   likely be tightened to "$297" for accuracy — not changed here since
//   it wasn't in scope for this edit; flagging for a follow-up pass.
// PRODUCT VERSION: v2.4 — Session 65 audit remediation (part 2)
// LAST REVIEWED: July 3, 2026 (Session 65)
// CHANGE LOG (v2.4):
// - Stage 5: swapped ctaLink/secondaryLink from generic CAL_LINK to
//   SCOPING_CALL_LINK ("Custom Engagement Scoping Call") — a live Cal.com
//   event already built for exactly this purpose ("talk through where
//   your books and systems stand, and whether a custom build or ongoing
//   engagement is the right fit"), a closer match than the generic
//   15-minute diagnostic call used elsewhere. Still a temporary bridge
//   until Rec #8 / Gumroad→Stan Store migration gives the Financial
//   Systems Strategy Session a real self-serve checkout link.
// PRODUCT VERSION: v2.3 — Session 65 audit remediation
// LAST REVIEWED: July 3, 2026 (Session 65)
// CHANGE LOG (v2.3):
// - Removed "Stage N —" numbering from all `label` values. Locked rule
//   retires "Level N"/numbered-tier language brand-wide; the eyebrow
//   "YOUR BOOKKEEPING STAGE" already establishes context, so bare stage
//   names (e.g. "Foundation") read clean everywhere `label` is used.
// - Stage 3: fixed regression — was recommending LedgerDesk Solo ($197),
//   skipping Monthly Close Command Center ($29) entirely. This exact bug
//   was already found and fixed once (Session 35/37/38, mid-June 2026)
//   and had reverted by Session 65 — likely an old build redeployed.
//   Restored correct product, price, description, and live Stan Store
//   link (verified live in incognito, Session 65).
// - Stage 4: replaced undefined "Custom Engagement" / "Custom" price
//   (not on the locked product ladder) with LedgerDesk Solo ($197) —
//   matches the stage's own definition in the diagnostic system prompt
//   (single revenue stream, no team, tooling/time problem not scale).
//   Removed "Book a Free 15-Min Call" as the PRIMARY cta — that framing
//   is retired brand-wide in favor of the diagnostic tool itself doing
//   the qualifying. Kept a secondary call option for founders who have
//   questions before buying.
// - Stage 5: replaced undefined "Custom Engagement" / "Custom" price
//   with Financial Systems Strategy Session ($247–297) — matches the
//   stage's own definition (needs a thinking partner / scoping, not a
//   fixed self-serve product). KNOWN LIMITATION: this product is
//   currently Gumroad-only (confirmed in project knowledge,
//   VALUE_ADD_AUDIT_UPDATED.md) and Gumroad access is fully broken as
//   of Session 64. ctaLink is temporarily set to CAL_LINK as a bridge —
//   swap to the live Stan Store URL once Track 1 Rec #8 / the Gumroad→
//   Stan Store migration lands. See 90-Day Roadmap, Days 31–60.
// CHANGE LOG (v2.2, retained from Session 38):
// - Fixed Stage 2 description: Reset Service was framed as a destination
//   with no mention of LedgerDesk. Per the Reset Service Rule (Reset is
//   always an on-ramp, never a destination), rewrote to explicitly
//   forward-frame into LedgerDesk by name. Reviewed by Holistic Coach —
//   10/10, approved as-is.
// CHANGE LOG (v2.1, retained from Session 37):
// - Fixed Stage label drift: "Cleanup" → "Catch-Up" (Stage 2), "Systems" →
//   "Stabilizing" (Stage 3), "Strategy" → "Systemized" (Stage 4),
//   "Optimized" → "Scaling" (Stage 5). Stage names are locked brand-wide.
// - Removed per-stage revenue bracket fields/display ("$0–$50K" etc). The
//   Bookkeeping Maturity Stage framework is explicitly operational-
//   readiness based, not revenue-based.
// CHANGE LOG (v2.0, retained from Session 35):
// - Replaced all user-facing "Level"/"Financial Level" language with
//   "Stage"/"Bookkeeping Maturity Stage" to match Brand Foundation v1.0.
// - ConvertKit tag values (ckTag) left UNCHANGED on purpose — those tags
//   already exist in ConvertKit with "Level X -" naming and have
//   automations built against them. Renaming tags here without first
//   renaming/rebuilding them in ConvertKit would silently break tagging.
//   This is a deliberate scope decision (Option B) — revisit ckTag
//   values only after ConvertKit tags + automations are renamed/rebuilt
//   to match. Still true as of Session 105 — not touched.
const LEVELS = {
  1: {
    label: "Foundation",
    tagline: "You're flying blind with your money — and tax season is going to be a nightmare.",
    description: "At this stage, most founders are mixing personal and business money, have no idea what they're actually keeping after expenses, and will face a painful surprise at tax time. Every month without a system costs you clarity — and clarity is what helps you decide whether to keep going or pivot.",
    recommendation: "Free 15-Minute Books Review",
    price: "Free",
    cta: "Book My Free 15-Minute Books Review →",
    ctaLink: CAL_LINK,
    secondary: "Or see what LedgerLift Studio offers",
    secondaryLink: SHOP_LINK,
    color: BRAND.sage,
    icon: "🌱",
    ckTag: "Level 1 - Build Yourself First",
  },
  2: {
    label: "Catch-Up",
    tagline: "Your business is growing, but your books are reactive, behind, and hard to trust.",
    description: "At this stage, founders routinely underprice their services, miss tax deductions, and make hiring decisions based on bank balance instead of actual profit. Before any system can help you, the months you're behind have to be caught up and loaded in — and how much work that is depends entirely on how far back it goes and what shape your records are in. That's a conversation, not a checkout button. We'll look at what you've actually got, and what it takes to get you current. Then LedgerDesk is the system that keeps you there.",
    recommendation: "Books Catch-Up Call",
    price: "Free",
    cta: "Book a Free Catch-Up Call →",
    ctaLink: CAL_LINK,
    secondary: "Fifteen minutes, no pitch — we're just seeing where you stand",
    secondaryLink: CAL_LINK,
    color: BRAND.gold,
    icon: "🔄",
    ckTag: "Level 2 - Monthly Close Command Center",
  },
  3: {
    label: "Stabilizing",
    tagline: "You have revenue, but your financial systems haven't kept up with your growth.",
    description: "Without a repeatable close process, you're recreating the same reports from scratch each month, and the numbers exist but nobody fully trusts them for decisions. The fix is a close you run the same way every month, and what that takes depends on what you're running now. Fifteen minutes is enough to see what's missing and what the right next step is.",
    recommendation: "Free 15-Minute Books Review",
    price: "Free",
    cta: "Book My Free 15-Minute Books Review →",
    ctaLink: CAL_LINK,
    secondary: "Or see what LedgerLift Studio offers",
    secondaryLink: SHOP_LINK,
    color: BRAND.navyLight,
    icon: "⚙️",
    ckTag: "Level 3 - Build Business Systems",
  },
  4: {
    label: "Systemized",
    tagline: "You have a real business — but your financial infrastructure is still built for a smaller one.",
    description: "At your stage, gaps in your financial reporting cost real money — in overpaid taxes, underpriced offers, or missed opportunities to reinvest strategically. LedgerDesk is a real financial database system built for how your business actually operates — handed over so you own it. You don't need a bigger team to fix this. You need better infrastructure.",
    recommendation: "LedgerDesk Solo",
    price: "$197",
    cta: "Get LedgerDesk Solo →",
    ctaLink: SOLO_LINK,
    secondary: "Or book a free call to talk through your situation",
    secondaryLink: CAL_LINK,
    color: BRAND.coral,
    icon: "📈",
    ckTag: "Level 4 - Scale & Automate",
  },
  5: {
    label: "Scaling",
    tagline: "You've built something real. Your financial operations need to match the size of your ambition.",
    description: "At this stage, financial blind spots compound fast. Multiple revenue streams, job costing, inventory, or separate entities — you've outgrown what an off-the-shelf system can hold, and the shape of what you need can't be guessed at from a questionnaire. LedgerDesk Custom is a financial database built to your operation and handed over so you own it. It starts with a scoping call, because the build gets designed around how your business actually runs.",
    recommendation: "LedgerDesk Custom",
    price: "$2,500",
    cta: "Book Your Scoping Call →",
    ctaLink: SCOPING_CALL_LINK, // v2.8 — Custom is a $2,500 flat engagement; it cannot be sold self-serve, so the call IS the mechanism, not a bridge to one.
    secondary: "Have questions first? Book a free 15-minute call",
    secondaryLink: CAL_LINK, // v2.8 — was pointing at the same URL as ctaLink, leaving Stage 5 the only stage with no free-call exit.
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
          { role: "user", content: "Hi, I'd like to find out what stage my bookkeeping is at." },
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
      content: "First question — your bookkeeping situation right now: are you keeping up with it, months behind, or is it basically nonexistent?",
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
            Free · 2 Minutes · No Pitch
          </div>

          <h1 style={{ fontSize: "clamp(28px,5vw,44px)", color: BRAND.navy, textAlign: "center", lineHeight: 1.2, marginBottom: 20, fontWeight: 700 }}>
            Why Do Your Numbers<br />Never Make Sense?
          </h1>

          <p style={{ fontSize: 18, color: BRAND.gray, textAlign: "center", lineHeight: 1.7, marginBottom: 28, maxWidth: 520 }}>
            Answer 5 quick questions and we'll tell you exactly what's broken in your books and the fastest way to fix it — without hiring a $5K/month bookkeeper.
          </p>

          <p style={{ fontSize: 14, color: BRAND.gray, textAlign: "center", marginBottom: 24, fontStyle: "italic", maxWidth: 420 }}>
            Built by Renée Morrison — bookkeeper who's reviewed 100+ sets of bootstrap books.
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
            Get My Bookkeeping Stage →
          </button>

          <p style={{ marginTop: 16, fontSize: 13, color: BRAND.gray, textAlign: "center" }}>
            No signup required to start. Takes about 2 minutes.
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
            <div style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.8, marginBottom: 10 }}>Your Bookkeeping Stage</div>
            <h2 style={{ fontSize: 32, fontWeight: 700, margin: "0 0 8px 0", lineHeight: 1.2 }}>{LEVELS[pendingLevel].label}</h2>
            <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 12, padding: "16px 20px", marginTop: 16 }}>
              <p style={{ fontSize: 16, lineHeight: 1.6, margin: 0, fontStyle: "italic" }}>{LEVELS[pendingLevel].tagline}</p>
            </div>
          </div>

          <div style={{ background: "white", borderRadius: 16, padding: "24px 28px", width: "100%", marginBottom: 24, border: `2px solid ${BRAND.lightGray}`, boxSizing: "border-box" }}>
            <p style={{ fontSize: 14, color: BRAND.gray, textAlign: "center", margin: "0 0 16px 0", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>Your free report includes:</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {["Exactly what's costing you money right now", "The recommended next step for your stage", "A clear action plan — no guessing"].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: LEVELS[pendingLevel].color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "white", fontWeight: 700, flexShrink: 0 }}>✓</div>
                  <span style={{ fontSize: 14, color: BRAND.navy }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {!emailSubmitted ? (
            <form onSubmit={submitEmail} style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12, boxSizing: "border-box" }}>
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
            <div style={{ fontSize: 12, letterSpacing: "0.15em", textTransform: "uppercase", opacity: 0.8, marginBottom: 8 }}>Your Bookkeeping Stage</div>
            <h2 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 4px 0" }}>{name ? `${name}, you're ${level.label}` : level.label}</h2>
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
