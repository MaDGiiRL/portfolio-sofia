export default function handler(req, res) {
  try {
    const cookie = req.headers.cookie || "";
    const ok = cookie.split(";").some(c => c.trim().startsWith("admin_gate=1"));
    // CORS base (se non serve, puoi rimuoverlo)
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.setHeader("Access-Control-Allow-Headers", "content-type, authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");

    if (req.method === "OPTIONS") return res.status(200).end();
    return res.status(200).json({ ok });
  } catch (e) {
    return res.status(500).json({ error: "server_error" });
  }
}