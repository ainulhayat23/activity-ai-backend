export default async function handler(req, res) {
  // Header CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight
  if (req.method === "OPTIONS") return res.status(200).end();

  // Hanya menerima POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Gunakan method POST" });
  }

  // Ambil dan trim body
  const search_history = (req.body.search_history || "").trim();
  if (!search_history) {
    return res.status(400).json({ error: "Riwayat pencarian film kosong" });
  }

  // Pastikan GEMINI_API_KEY ada
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "GEMINI_API_KEY belum diatur di Vercel" });
  }

  try {
    // Buat prompt
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

    // Request ke Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      }
    );

    const data = await response.json();

    // Jika response bukan OK
    if (!response.ok) {
      console.error("Gemini error response:", data);
      return res.status(response.status).json({
        error: data.error?.message || "Gagal mendapatkan respons dari Gemini"
      });
    }

    // Ambil hasil text dari Gemini
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Gemini tidak memberikan rekomendasi.";

    return res.status(200).json({ result: text });

  } catch (error) {
    console.error("Analyze error:", error);
    return res.status(500).json({ error: "Gagal menghubungi Gemini AI" });
  }
}
