// LedgerLift Studio — Netlify Serverless Function
// Proxies diagnostic session tracking events to Google Sheets
// Function URL: /.netlify/functions/sheets-proxy
// Tab: DiagnosticSessions
// Columns: SessionID | Date | Time | Phase | FinancialLevel | Name | Email | Source | Completed

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

    const token = await getAccessToken();

    // Check if a row with this sessionId already exists
    const existing = await findSessionRow(token, sessionId);

    if (existing !== null) {
      // Update existing row — fill in any new fields
      await updateSessionRow(token, existing.rowIndex, {
        sessionId,
        date: existing.date || dateStr,
        time: existing.time || timeStr,
        phase,
        level: level || existing.level || "",
        name: name || existing.name || "",
        email: email || existing.email || "",
        source: source || existing.source || "",
        completed: completed ? "Yes" : existing.completed || "No",
      });
    } else {
      // Append new row
      await appendRow(token, [
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
    }

    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error("sheets-proxy error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: String(err) }) };
  }
};

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

  const tokenRes = await postForm("https://oauth2.googleapis.com/token",
    `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`);
  return tokenRes.access_token;
}

// ─── Find existing session row ────────────────────────────────────────────────
async function findSessionRow(token, sessionId) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(TAB)}`;
  const data = await sheetsGet(url, token);
  const rows = data.values || [];
  // Row 0 is headers, data starts at row 1 (rowIndex 0 = spreadsheet row 2)
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === sessionId) {
      return {
        rowIndex: i - 1, // 0-based data index for updateRow
        date: rows[i][1] || "",
        time: rows[i][2] || "",
        level: rows[i][4] || "",
        name: rows[i][5] || "",
        email: rows[i][6] || "",
        source: rows[i][7] || "",
        completed: rows[i][8] || "No",
      };
    }
  }
  return null;
}

// ─── Append new row ───────────────────────────────────────────────────────────
async function appendRow(token, values) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(TAB)}:append?valueInputOption=USER_ENTERED`;
  return sheetsPost(url, token, { values: [values] });
}

// ─── Update existing row ──────────────────────────────────────────────────────
async function updateSessionRow(token, rowIndex, row) {
  const range = `${TAB}!A${rowIndex + 2}`; // +2: 1-based + skip header
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;
  return sheetsPut(url, token, {
    values: [[
      row.sessionId, row.date, row.time, row.phase,
      row.level, row.name, row.email, row.source, row.completed,
    ]],
  });
}

// ─── HTTP helpers ─────────────────────────────────────────────────────────────
function sheetsGet(url, token) {
  return new Promise((resolve, reject) => {
    const opts = new URL(url);
    https.get({ hostname: opts.hostname, path: opts.pathname + opts.search, headers: { Authorization: `Bearer ${token}` } }, res => {
      let d = "";
      res.on("data", c => d += c);
      res.on("end", () => resolve(JSON.parse(d)));
    }).on("error", reject);
  });
}

function sheetsPost(url, token, body) {
  return sheetsMutate("POST", url, token, body);
}

function sheetsPut(url, token, body) {
  return sheetsMutate("PUT", url, token, body);
}

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
      res.on("end", () => resolve(JSON.parse(d)));
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
      headers: { "Content-Type": "application/x-www-form-urlencoded", "Content-Length": Buffer.byteLength(body) },
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
