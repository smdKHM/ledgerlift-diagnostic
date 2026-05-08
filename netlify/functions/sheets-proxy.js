// LedgerLift Studio — Netlify Serverless Function
// Proxies diagnostic session tracking events to Google Sheets
// Simplified: always appends, no find-and-update logic
const https = require("https");

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SERVICE_ACCOUNT_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
const TAB = "DiagnosticSessions";

exports.handler = async function (event) {
  const headers = {
    "Access-Control-Allow-Origin": "https://diagnostic.ledgerliftstudio.com",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };

  try {
    const body = JSON.parse(event.body);
    const { sessionId, phase, level, name, email, source, completed } = body;

    if (!sessionId || !phase) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "sessionId and phase required" }) };
    }

    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" });
    const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    console.log(`[sheets-proxy] SHEET_ID in use: ${SHEET_ID}`);
    console.log(`[sheets-proxy] TAB: ${TAB}`);

    const token = await getAccessToken();
    console.log(`[sheets-proxy] Got access token: ${token ? "yes" : "no"}`);

    const result = await appendRow(token, [
      sessionId,
      dateStr,
      timeStr,
      phase,
      level ? String(level) : "",
      name || "",
      email || "",
      source || "direct",
      completed ? "Yes" : "No",
    ]);

    console.log(`[sheets-proxy] Appended row: ${sessionId} | ${phase} | level ${level || "?"}`);
    console.log(`[sheets-proxy] API response: ${JSON.stringify(result)}`);

    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error("sheets-proxy error:", err.message || err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: String(err) }) };
  }
};

// ─── Append new row ───────────────────────────────────────────────────────────
async function appendRow(token, values) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(TAB)}:append?valueInputOption=USER_ENTERED`;
  return sheetsMutate("POST", url, token, { values: [values] });
}

// ─── Google Auth ──────────────────────────────────────────────────────────────
async function getAccessToken() {
  const key = JSON.parse(SERVICE_ACCOUNT_KEY);
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const claim = Buffer.from(JSON.stringify({
    iss: key.client_email,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  })).toString("base64url");
  const crypto = require("crypto");
  const sign = crypto.createSign("RSA-SHA256");
  sign.update(`${header}.${claim}`);
  const sig = sign.sign(key.private_key, "base64url");
  const jwt = `${header}.${claim}.${sig}`;
  const tokenRes = await postForm(
    "https://oauth2.googleapis.com/token",
    `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`
  );
  return tokenRes.access_token;
}

// ─── HTTP helpers ─────────────────────────────────────────────────────────────
function sheetsMutate(method, url, token, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const opts = new URL(url);
    const req = https.request({
      hostname: opts.hostname,
      path: opts.pathname + opts.search,
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
      },
    }, res => {
      let d = "";
      res.on("data", c => d += c);
      res.on("end", () => {
        try {
          resolve(JSON.parse(d));
        } catch {
          resolve(d);
        }
      });
    });
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

function postForm(url, body) {
  return new Promise((resolve, reject) => {
    const opts = new URL(url);
    const req = https.request({
      hostname: opts.hostname,
      path: opts.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(body),
      },
    }, res => {
      let d = "";
      res.on("data", c => d += c);
      res.on("end", () => resolve(JSON.parse(d)));
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}
