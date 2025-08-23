export default function handler(req, res) {
  try {
    // CORS
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.setHeader("Access-Control-Allow-Headers", "content-type, authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    if (req.method === "OPTIONS") return res.status(200).end();

    if (req.method !== "POST") return res.status(405).end();

    const { password } = req.body || {};
    const ADMIN_PANEL_PASSWORD = process.env.ADMIN_PANEL_PASSWORD; // 👈 su Vercel va impostata

    if (!password || password !== ADMIN_PANEL_PASSWORD) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const maxAge = 60 * 60 * 4; // 4 ore
    const isProd = process.env.NODE_ENV === "production";
    const cookie =
      [
        "admin_gate=1",
        "HttpOnly",
        "SameSite=Lax",
        "Path=/",
        `Max-Age=${maxAge}`,
        isProd ? "Secure" : null, // in dev niente Secure
      ].filter(Boolean).join("; ");

    res.setHeader("Set-Cookie", cookie);
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: "server_error" });
  }
}
