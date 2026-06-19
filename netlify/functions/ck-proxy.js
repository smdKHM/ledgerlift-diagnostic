exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { email, firstName, tag } = JSON.parse(event.body);

    if (!email) {
      return { statusCode: 400, body: JSON.stringify({ error: "Email is required" }) };
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
          tags: [tag],
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
