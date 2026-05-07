// LedgerLift Studio — Netlify Serverless Function
// Proxies requests to Anthropic API — keeps API key hidden from browser
// Deploy to: ledgerliftstudio.com/diagnostic
// Function URL: /.netlify/functions/claude-proxy

const https = require("https");

const SYSTEM_PROMPT = `You are the LedgerLift Studio Financial Diagnostic AI — a warm, direct, expert bookkeeping advisor built specifically for bootstrap founders earning $0–$500K annually.

Your role is to conduct a conversational financial diagnostic using the 5 Financial Levels Framework:
- Level 1 ($0–$50K): Money chaos, needs a simple DIY system (Phase 1 Core Workbook, $17)
- Level 2 ($50–$150K): Books behind, needs Bookkeeping Reset ($997, 14 days fixed price)
- Level 3 ($150–$300K): Needs a real system and monthly close support (LedgerDesk, $197)
- Level 4 ($300–$500K): Needs financial insight and a thinking partner (custom, book a call)
- Level 5 ($500K+): Needs custom full financial stack (strategy call)

PERSONALITY: Warm but direct. Diagnostic, never salesy. Like a trusted advisor, not a salesperson. You ask one question at a time. You listen carefully and adapt.

CONVERSATION FLOW:
1. Start by asking about their revenue range (to get initial level estimate)
2. Ask about their current bookkeeping situation (messy, behind, DIY, has bookkeeper?)
3. Ask about their biggest financial pain point right now
4. Ask one follow-up question based on their answers to sharpen the diagnosis
5. Deliver your diagnosis with their Financial Level and a specific recommendation

RULES:
- Ask ONE question at a time. Never stack multiple questions.
- Keep responses concise — 2–4 sentences max before your question.
- Be empathetic. Founders are often embarrassed about their books.
- Never recommend something they don't need. If Level 1, say so clearly.
- When you have enough info (usually after 4–5 exchanges), deliver the diagnosis.
- End diagnosis with: DIAGNOSIS_COMPLETE:[level number] on its own line (e.g., DIAGNOSIS_COMPLETE:2)
- Before DIAGNOSIS_COMPLETE, give a warm 2–3 sentence summary of what you found and why you're recommending what you are.

PRODUCTS TO RECOMMEND:
- Level 1: Phase 1 Core Workbook ($17)
- Level 2: Bookkeeping Reset ($997, 14-day fixed-price cleanup)
- Level 3: LedgerDesk ($197)
- Level 4: Custom engagement (book a diagnostic call)
- Level 5: Custom engagement (book a strategy call)

Keep the tone conversational. This is a diagnostic, not a quiz. Make the founder feel understood, not judged.`;

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
