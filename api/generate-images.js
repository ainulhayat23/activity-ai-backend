export default async function handler(req, res) {
  // Header CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Gunakan method POST" });

  const { themes } = req.body;

  if (!themes) {
    return res.status(400).json({ error: "Tema atau riwayat film kosong" });
  }

  try {
    // Prompt Pollinations
    const prompt = `
Buatkan sebuah poster film fiktif berdasarkan selera film berikut:

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
- tanpa terlalu banyak teks
- fokus pada visual utama yang kuat
`.trim();

    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true`;

    const imageResponse = await fetch(imageUrl);

    if (!imageResponse.ok) {
      return res.status(imageResponse.status).json({
        error: "Gagal membuat poster dari image API gratis"
      });
    }

    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString("base64");

    return res.status(200).json({ image: base64Image });

  } catch (error) {
    console.error("Generate image error:", error);
    return res.status(500).json({ error: "Gagal menghubungi image API" });
  }
}
