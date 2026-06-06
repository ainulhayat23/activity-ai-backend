export default async function handler(req, res) {
  // Header CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Gunakan method POST" });

  const { themes } = req.body;
  if (!themes || themes.trim() === "") {
    return res.status(400).json({ error: "Tema atau riwayat film kosong" });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "GEMINI_API_KEY belum diatur di Vercel" });
  }

  try {
    // Prompt untuk poster
    const prompt = `
Buatkan sebuah poster film fiktif yang menarik berdasarkan selera film berikut:
${themes}

Ketentuan:
- Poster hanya 1 gambar
- Gaya sinematik dan menarik
- Sesuai suasana dan genre film
- Visual keren dan dramatis
- Fokus karakter utama
- Tidak menampilkan watermark atau logo brand
`.trim();

    // Request ke Gemini generative content API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { parts: [{ text: `Buatlah poster film dalam bentuk deskripsi visual detail agar bisa dijadikan gambar: ${prompt}` }] }
          ]
        })
      }
    );

    const data = await response.json();
    if (!response.ok) {
      console.error("Gemini poster error:", data);
      return res.status(response.status).json({ error: data.error?.message || "Gagal generate poster dari Gemini" });
    }

    // Ambil text dari Gemini → nanti di frontend bisa dipakai untuk generate image via DALL·E / library lain
    const posterDescription = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!posterDescription) return res.status(500).json({ error: "Gemini tidak menghasilkan deskripsi poster" });

    // Kembalikan deskripsi sebagai placeholder base64 untuk frontend
    // (Frontend bisa memanfaatkan library image generation atau API lain untuk render gambar)
    return res.status(200).json({ image: Buffer.from(posterDescription).toString("base64") });

  } catch (error) {
    console.error("Generate poster Gemini error:", error);
    return res.status(500).json({ error: "Gagal menghubungi Gemini API" });
  }
}
