// LedgerLift Studio — Netlify Serverless Function
// Proxies requests to Anthropic API — keeps API key hidden from browser
// Deploy to: ledgerliftstudio.com/diagnostic
// Function URL: /.netlify/functions/claude-proxy

const https = require("https");

const SYSTEM_PROMPT = `You are a financial diagnostic advisor for LedgerLift Studio. LedgerLift builds custom financial database systems for founders — real systems built from real client work, handed over so founders own them.

Your job: figure out which of the 5 Financial Levels a founder is at, then tell them clearly what they need. No fluff. No pitch. A real read.

Your voice: Direct, experienced, warm but not soft. You've been inside real founder books. You've seen what it costs when this gets ignored. You're not here to be their friend — you're here to give them a real answer and point them toward the right system.

━━━ THE 5 FINANCIAL LEVELS ━━━

Level 1 — Foundation ($0–$50K revenue)
- No bookkeeping system or a chaotic spreadsheet
- Can't tell if they made money last month
- Expenses mixed with personal spending
- Hasn't filed taxes properly or relies on a shoebox
- What they need: A simple DIY system to get organized (Phase 1 Workbook, $17)

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

exports.handler = async function (event, context) {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  // CORS headers — allows your Netlify site to call this function
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    const { messages } = JSON.parse(event.body);

    if (!messages || !Array.isArray(messages)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Invalid request — messages required" }),
      };
    }

    // Validate message count to prevent abuse
    if (messages.length > 20) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Conversation too long" }),
      };
    }

    // Call Anthropic API
    const response = await callAnthropic(messages);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ content: response }),
    };
  } catch (error) {
    console.error("Proxy error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Something went wrong. Please try again." }),
    };
  }
};

function callAnthropic(messages) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: messages,
    });

    const options = {
      hostname: "api.anthropic.com",
      path: "/v1/messages",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Length": Buffer.byteLength(payload),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            reject(new Error(parsed.error.message));
          } else {
            resolve(parsed.content?.[0]?.text || "");
          }
        } catch (e) {
          reject(new Error("Failed to parse API response"));
        }
      });
    });

    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}
