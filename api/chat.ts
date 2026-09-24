const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Content-Type", "application/json");
    return res.status(405).end(JSON.stringify({ error: "Method not allowed" }));
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.setHeader("Content-Type", "application/json");
    return res.status(500).end(JSON.stringify({ error: "API key not configured on server" }));
  }

  try {
    const { contents, system_instruction, generationConfig } = req.body || {};

    const geminiRes = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents, system_instruction, generationConfig }),
    });

    const text = await geminiRes.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      res.setHeader("Content-Type", "application/json");
      return res.status(502).end(JSON.stringify({ error: "Gemini returned invalid response" }));
    }

    res.setHeader("Content-Type", "application/json");
    return res.status(geminiRes.status).end(JSON.stringify(data));
  } catch (err: any) {
    console.error("Gemini proxy error:", err);
    res.setHeader("Content-Type", "application/json");
    return res.status(500).end(JSON.stringify({ error: err?.message || "Server error" }));
  }
}
