export default function handler(req, res) {
  try {
    // CORS
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.setHeader("Access-Control-Allow-Headers", "content-type, authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    if (req.method === "OPTIONS") return res.status(200).end();

    const isProd = process.env.NODE_ENV === "production";
    const cookie =
      [
        "admin_gate=",
        "HttpOnly",
        "SameSite=Lax",
        "Path=/",
        "Max-Age=0",
        isProd ? "Secure" : null,
      ].filter(Boolean).join("; ");

    res.setHeader("Set-Cookie", cookie);
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: "server_error" });
  }
}
