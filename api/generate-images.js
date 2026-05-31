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

  const { themes } = req.body;

  if (!themes) {
    return res.status(400).json({
      error: "Tema atau riwayat film kosong"
    });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({
      error: "OPENAI_API_KEY belum diatur di Environment Variables Vercel"
    });
  }

  try {
    const prompt = `
Buatkan sebuah poster film fiktif yang menarik berdasarkan selera film berikut:

${themes}

Ketentuan:
- poster hanya 1 gambar
- gaya sinematik dan menarik
- terlihat seperti poster film bioskop modern
- boleh menampilkan 1 atau beberapa elemen visual yang mewakili genre atau tema
- jangan menampilkan logo brand resmi
- judul film boleh fiktif
- suasana poster harus sesuai dengan tema pencarian pengguna
- tampilkan visual yang keren, dramatis, dan estetik
- jika tema mengarah ke action, horor, komedi, romantis, sci-fi, atau superhero, sesuaikan nuansa posternya
- hindari terlalu ramai
- hasil akhir harus tampak seperti poster film premium

Buat poster tanpa teks yang terlalu banyak. Fokus pada visual utama yang kuat.
    `;

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt: prompt,
        size: "1024x1024"
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "Gagal membuat gambar"
      });
    }

    if (!data.data || !data.data[0] || !data.data[0].b64_json) {
      return res.status(500).json({
        error: "Respons gambar dari OpenAI tidak valid"
      });
    }

    return res.status(200).json({
      image: data.data[0].b64_json
    });

  } catch (error) {
    console.error("Generate image error:", error);

    return res.status(500).json({
      error: "Gagal menghubungi image API"
    });
  }
}
