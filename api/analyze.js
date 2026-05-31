export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Gunakan method POST" });
  }

  const searchHistory = req.body.search_history || req.body.activities;

  if (!searchHistory) {
    return res.status(400).json({
      error: "Riwayat pencarian film kosong"
    });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({
      error: "OPENAI_API_KEY belum diatur di Vercel"
    });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: `
Berikut adalah riwayat pencarian film atau genre dari pengguna:

${searchHistory}

Tolong berikan rekomendasi film yang cocok berdasarkan riwayat tersebut.

Format jawaban:
1. Analisis singkat selera pengguna
2. 5 rekomendasi film yang cocok
3. Alasan singkat untuk setiap rekomendasi
4. Saran genre tambahan yang mungkin disukai

Gunakan bahasa Indonesia yang sederhana, rapi, dan mudah dipahami.
        `
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "Gagal mendapatkan respons dari OpenAI"
      });
    }

    let text = "";

    try {
      text = data.output[0].content[0].text;
    } catch (e) {
      text = JSON.stringify(data);
    }

    return res.status(200).json({
      result: text
    });

  } catch (error) {
    console.error("Analyze error:", error);

    return res.status(500).json({
      error: "Gagal menghubungi AI"
    });
  }
}
