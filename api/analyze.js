export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Gunakan method POST" });

  const { search_history } = req.body;
  if (!search_history) return res.status(400).json({ error: "Riwayat pencarian film kosong" });
  if (!process.env.GEMINI_API_KEY) return res.status(500).json({ error: "GEMINI_API_KEY belum diatur di Vercel" });

  try {
    const prompt = `
Berikut riwayat pencarian film atau genre dari pengguna:
${search_history}

Tolong berikan rekomendasi film yang cocok berdasarkan riwayat tersebut.
Format jawaban:
1. Analisis singkat selera pengguna
2. 5 rekomendasi film yang cocok
3. Alasan singkat untuk setiap rekomendasi
4. Saran genre tambahan yang mungkin disukai
Gunakan bahasa Indonesia yang sederhana dan rapi.
    `.trim();

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      }
    );

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.error?.message || "Gagal mendapatkan respons dari Gemini" });

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Gemini tidak memberikan rekomendasi.";
    return res.status(200).json({ result: text });

  } catch (error) {
    console.error("Analyze error:", error);
    return res.status(500).json({ error: "Gagal menghubungi Gemini AI" });
  }
}
