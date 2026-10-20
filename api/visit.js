// Vercel serverless function: records one page visit and exposes only aggregate count.
// Required environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
const allowedMethods = ["GET", "POST"];

function json(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

async function supabaseRequest(path, options = {}) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Visitor database is not configured.");
  return fetch(`${url.replace(/\/$/, "")}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
}

module.exports = async function handler(req, res) {
  if (!allowedMethods.includes(req.method)) {
    res.setHeader("Allow", allowedMethods.join(", "));
    return json(res, 405, { error: "Method not allowed" });
  }

  try {
    if (req.method === "GET") {
      const response = await supabaseRequest("portfolio_visits?select=id", {
        method: "HEAD",
        headers: { Prefer: "count=exact", Range: "0-0" }
      });
      if (!response.ok) return json(res, 502, { error: "Could not read visit count." });
      const range = response.headers.get("content-range") || "*/0";
      const count = Number(range.split("/").pop()) || 0;
      return json(res, 200, { count });
    }

    // Log IP and coarse IP-based geolocation from Vercel's trusted request headers.
    const forwarded = req.headers["x-forwarded-for"];
    const ip = (typeof forwarded === "string" ? forwarded.split(",")[0].trim() : "") ||
      req.headers["x-real-ip"] || req.socket?.remoteAddress || null;

    // Basic same-origin check to reduce casual third-party spam. This is not authentication.
    const origin = req.headers.origin;
    const host = req.headers.host;
    if (origin && host) {
      try {
        if (new URL(origin).host !== host) return json(res, 403, { error: "Origin not allowed." });
      } catch { return json(res, 403, { error: "Invalid origin." }); }
    }

    const record = {
      ip_address: ip,
      city: req.headers["x-vercel-ip-city"] ? decodeURIComponent(req.headers["x-vercel-ip-city"]) : null,
      region: req.headers["x-vercel-ip-country-region"] || null,
      country: req.headers["x-vercel-ip-country"] || null,
      latitude: req.headers["x-vercel-ip-latitude"] ? Number(req.headers["x-vercel-ip-latitude"]) : null,
      longitude: req.headers["x-vercel-ip-longitude"] ? Number(req.headers["x-vercel-ip-longitude"]) : null,
      timezone: req.headers["x-vercel-ip-timezone"] || null,
      user_agent: String(req.headers["user-agent"] || "").slice(0, 500),
      referrer: String(req.headers.referer || "").slice(0, 1000)
    };

    const response = await supabaseRequest("portfolio_visits", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify(record)
    });
    if (!response.ok) {
      const detail = await response.text();
      console.error("Supabase insert failed:", detail);
      return json(res, 502, { error: "Could not save visit. Check database setup." });
    }
    return json(res, 201, { ok: true });
  } catch (error) {
    console.error("Visitor endpoint error:", error);
    return json(res, 500, { error: "Visitor tracking is not configured yet." });
  }
};
