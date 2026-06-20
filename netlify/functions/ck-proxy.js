// LedgerLift Studio — Netlify Serverless Function
// Proxies ConvertKit (Kit) subscribe requests — keeps API key hidden from browser
// Function URL: /.netlify/functions/ck-proxy
// VERSION: v1.1
// LAST REVIEWED: June 24, 2026 (Session 40)
// OWNER: Renee Morrison, LedgerLift Studio
//
// CHANGE LOG (v1.1) — ROOT CAUSE FIX:
// ConvertKit's v3 /forms/:id/subscribe endpoint requires `tags` to be an
// array of numeric Tag IDs, NOT tag name strings. This function was sending
// tags: [tag] where `tag` was a string like "Level 2 - Monthly Close
// Command Center". ConvertKit silently accepted the request (200 OK) but
// could not resolve a name to an ID, so the tag was never actually applied.
// Every subscriber just landed in the form's own default sequence
// ("Level 1 - Build Yourself First"), regardless of diagnosed stage.
// This is why Stage 1 always looked correct (coincidence — it's the form's
// default) and Stages 2-5 never tagged or triggered their automations,
// even with fresh test emails.
//
// FIX: added TAG_IDS map (tag name -> ConvertKit numeric Tag ID, pulled
// directly from each tag's URL in Kit's dashboard) and resolve the
// incoming tag name to its ID before sending to the API. If a tag name
// doesn't match anything in the map, we now log a clear error instead of
// silently subscribing with no tag.

// Map of ckTag values (must match App.jsx LEVELS[n].ckTag exactly) to
// ConvertKit numeric Tag IDs. Confirmed directly from Kit dashboard URLs,
// Session 40.
const TAG_IDS = {
  "Level 1 - Build Yourself First": 11922286,
  "Level 2 - Monthly Close Command Center": 11922289,
  "Level 3 - Build Business Systems": 11922292,
  "Level 4 - Scale & Automate": 11922294,
  "Level 5 - Optimize & Master": 11922297,
};

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }
  try {
    const { email, firstName, tag } = JSON.parse(event.body);
    if (!email) {
      return { statusCode: 400, body: JSON.stringify({ error: "Email is required" }) };
    }

    const tagId = TAG_IDS[tag];
    if (!tagId) {
      // Don't silently subscribe with no tag — that's exactly the bug we just fixed.
      // Log loudly so a future mismatch (e.g. ckTag renamed in App.jsx but not
      // updated here) is visible in Netlify function logs instead of invisible.
      console.error(`ck-proxy: no Tag ID mapped for tag "${tag}". Check TAG_IDS against App.jsx LEVELS.`);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: `Unknown tag: "${tag}" — not found in TAG_IDS map` }),
      };
    }

    const res = await fetch(
      `https://api.convertkit.com/v3/forms/${process.env.CONVERTKIT_FORM_ID}/subscribe`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: process.env.CONVERTKIT_API_KEY,
          email,
          first_name: firstName || "",
          tags: [tagId],
        }),
      }
    );
    const data = await res.json();
    if (!res.ok) {
      console.error("ConvertKit API error:", data);
      return { statusCode: res.status, body: JSON.stringify(data) };
    }
    return { statusCode: 200, body: JSON.stringify(data) };
  } catch (err) {
    console.error("ck-proxy error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
