// ============================================================
// APP.JSX PATCH — Level 1 + Level 2 Result Page Copy
// Date: May 11, 2026
// Changes:
//   - Outcome-based product names
//   - Rewritten headlines and diagnosis copy
//   - Secondary Reset CTA added to Level 1 and Level 2
// ============================================================
//
// HOW TO USE THIS FILE:
// Find the LEVELS object (or the result page render block) in
// your App.jsx. Replace the Level 1 and Level 2 entries with
// the objects below. Everything else in the file stays the same.
// ============================================================


// ─────────────────────────────────────────────────────────────
// LEVEL 1 — replace your existing level 1 object with this
// ─────────────────────────────────────────────────────────────

const LEVEL_1 = {
  level: 1,
  label: "Level 1 — Financial Foundation",
  headline: "Your books are costing you money right now — here's the fastest fix.",
  diagnosis:
    "At your stage, most founders have no real system — money is coming in and going out, but you can't tell what you're actually keeping. Business and personal expenses are probably mixed, taxes feel like a surprise every year, and every month without a clear foundation makes it harder to fix. The good news: this is the most fixable stage.",
  primaryCTA: {
    label: "Get your Financial Foundation Reset — $17",
    sublabel: "The Phase 1 Core Workbook walks you through building your financial foundation from scratch. Done in a weekend.",
    url: "https://stan.store/ledgerliftstudio",
  },
  secondaryCTA: {
    label: "Or if you're overwhelmed and want this done for you → Let's talk about a Bookkeeping Reset",
    url: "https://ledger-lift-studio.kit.com/dddc0c1e86",
  },
};


// ─────────────────────────────────────────────────────────────
// LEVEL 2 — replace your existing level 2 object with this
// ─────────────────────────────────────────────────────────────

const LEVEL_2 = {
  level: 2,
  label: "Level 2 — Needs a Bookkeeping Reset",
  headline: "Your books are behind — and that gap is getting more expensive every month.",
  diagnosis:
    "You're making real money, but your books don't reflect it. Transactions are piling up, months aren't closing, and you probably can't answer \"am I actually profitable?\" with confidence. At this level, a DIY template won't fix it — the backlog needs to be cleared first so you can see clearly. The Reset is built exactly for this.",
  primaryCTA: {
    label: "Book a free call — Bookkeeping Reset ($997)",
    sublabel:
      "Fixed price. 14 days. We clear your backlog, set up your system, and hand it back to you clean. No ongoing commitment required.",
    url: "https://ledger-lift-studio.kit.com/dddc0c1e86",
  },
  secondaryCTA: {
    label: "Not ready for the Reset yet? Start with the Monthly Close Command Center — $29",
    url: "https://stan.store/ledgerliftstudio",
  },
};


// ─────────────────────────────────────────────────────────────
// RESULT PAGE RENDER — if your App.jsx uses a render block
// instead of a LEVELS object, use this JSX snippet instead.
// Drop it into your result phase conditional.
// ─────────────────────────────────────────────────────────────

/*

{diagnosedLevel === 1 && (
  <div className="result-page">
    <p className="level-label">Level 1 — Financial Foundation</p>
    <h2 className="result-headline">
      Your books are costing you money right now — here's the fastest fix.
    </h2>
    <p className="result-diagnosis">
      At your stage, most founders have no real system — money is coming in and going
      out, but you can't tell what you're actually keeping. Business and personal
      expenses are probably mixed, taxes feel like a surprise every year, and every
      month without a clear foundation makes it harder to fix. The good news: this is
      the most fixable stage.
    </p>
    <a
      href="https://stan.store/ledgerliftstudio"
      className="cta-primary"
      target="_blank"
      rel="noopener noreferrer"
    >
      Get your Financial Foundation Reset — $17
    </a>
    <p className="cta-sublabel">
      The Phase 1 Core Workbook walks you through building your financial foundation
      from scratch. Done in a weekend.
    </p>
    <a
      href="https://ledger-lift-studio.kit.com/dddc0c1e86"
      className="cta-secondary"
      target="_blank"
      rel="noopener noreferrer"
    >
      Or if you're overwhelmed and want this done for you → Let's talk about a
      Bookkeeping Reset
    </a>
  </div>
)}

{diagnosedLevel === 2 && (
  <div className="result-page">
    <p className="level-label">Level 2 — Needs a Bookkeeping Reset</p>
    <h2 className="result-headline">
      Your books are behind — and that gap is getting more expensive every month.
    </h2>
    <p className="result-diagnosis">
      You're making real money, but your books don't reflect it. Transactions are
      piling up, months aren't closing, and you probably can't answer "am I actually
      profitable?" with confidence. At this level, a DIY template won't fix it — the
      backlog needs to be cleared first so you can see clearly. The Reset is built
      exactly for this.
    </p>
    <a
      href="https://ledger-lift-studio.kit.com/dddc0c1e86"
      className="cta-primary"
      target="_blank"
      rel="noopener noreferrer"
    >
      Book a free call — Bookkeeping Reset ($997)
    </a>
    <p className="cta-sublabel">
      Fixed price. 14 days. We clear your backlog, set up your system, and hand it
      back to you clean. No ongoing commitment required.
    </p>
    <a
      href="https://stan.store/ledgerliftstudio"
      className="cta-secondary"
      target="_blank"
      rel="noopener noreferrer"
    >
      Not ready for the Reset yet? Start with the Monthly Close Command Center — $29
    </a>
  </div>
)}

*/


// ─────────────────────────────────────────────────────────────
// NOTES
// ─────────────────────────────────────────────────────────────
//
// 1. The secondary CTA on Level 1 points to the diagnostic call
//    booking link — same as Level 2 primary. This surfaces the
//    Reset conversation for panicked Level 1 founders without
//    changing any routing logic.
//
// 2. The secondary CTA on Level 2 points to Stan Store — gives
//    fence-sitters a $29 exit rather than losing them entirely.
//
// 3. If your LEVELS object uses a different key structure than
//    shown above (e.g. `ctaUrl` instead of `url`), adjust the
//    key names to match your existing code. The copy itself
//    does not change.
//
// 4. No changes needed to claude-proxy.js for this update.
//    This is copy-only — zero routing changes.
// ─────────────────────────────────────────────────────────────
