// Private Vercel serverless endpoint. Keep ADMIN_DASHBOARD_PASSWORD and Supabase service key in Vercel env vars.
const json = (res, status, body) => {
  res.status(status).setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
};

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return json(res, 405, { error: "Method not allowed" });
  }
  const expected = process.env.ADMIN_DASHBOARD_PASSWORD;
  const supplied = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!expected || !supplied || supplied !== expected) return json(res, 401, { error: "Incorrect dashboard password." });

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return json(res, 500, { error: "Database environment variables are missing." });

  try {
    const response = await fetch(`${url.replace(/\/$/, "")}/rest/v1/portfolio_visits?select=id,visited_at,ip_address,city,region,country,latitude,longitude,timezone,user_agent,referrer&order=visited_at.desc&limit=500`, {
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Cache-Control": "no-store" }
    });
    if (!response.ok) {
      console.error("Supabase read failed:", await response.text());
      return json(res, 502, { error: "Could not load visit records." });
    }
    const visits = await response.json();
    return json(res, 200, { count: visits.length, visits });
  } catch (error) {
    console.error("Admin visit endpoint error:", error);
    return json(res, 500, { error: "Could not load visit records." });
  }
};
