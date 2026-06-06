<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <title>Rekomendasi Film XXI AI</title>
  <style>
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      margin: 24px auto; 
      max-width: 700px; 
      background-color: #f9f9f9;
      color: #333;
    }
    .container {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    h2 { color: #0056b3; }
    h3 { margin-top: 24px; color: #444; border-bottom: 2px solid #eee; padding-bottom: 5px; }
    input { 
      padding: 10px; 
      margin: 4px 0; 
      width: calc(100% - 24px);
      border: 1px solid #ccc;
      border-radius: 4px;
    }
    button { 
      padding: 10px 15px; 
      margin: 8px 4px 8px 0; 
      border: none;
      background-color: #0056b3;
      color: white;
      border-radius: 4px;
      cursor: pointer;
    }
    button:hover { background-color: #004494; }
    .box {
      border: 1px solid #ddd;
      background-color: #fafafa;
      padding: 12px;
      margin-top: 10px;
      white-space: pre-line;
      border-radius: 4px;
      min-height: 40px;
    }
    #aiImage {
      max-width:100%;
      border-radius:8px;
      margin-top:12px;
      display:none;
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }
  </style>
</head>
<body>

<div class="container">
  <h2>Sistem Rekomendasi Film Cinema XXI</h2>
  <p>Masukkan riwayat pencarian film atau genre Anda untuk mendapatkan rekomendasi tontonan dari AI.</p>

  <input id="searchQuery" placeholder="contoh: Spider-Man, Action, Horor komedi...">
  <button onclick="tambahRiwayat()">Tambah Pencarian</button>
  <button onclick="dapatkanRekomendasi()">Dapatkan Rekomendasi AI</button>

  <p id="totalPencarian">Total riwayat: 0 pencarian</p>

  <h3>Riwayat Pencarian Anda:</h3>
  <div id="list" class="box">Belum ada riwayat pencarian.</div>

  <h3>Rekomendasi Film AI:</h3>
  <div id="result" class="box">Belum dianalisis.</div>

  <h3>Generate Poster Film Khusus (AI):</h3>
  <p style="font-size: 14px; color: #666;">AI akan membuat poster film fiktif berdasarkan selera riwayat Anda.</p>
  <button id="generateBtn" style="display:inline-block;" onclick="generatePoster()">Buat Poster AI</button>
  <div id="imageStatus" class="box" style="border:none; background:none; padding:0; min-height: auto; margin-top: 10px;">Belum ada poster.</div>
  <img id="aiImage">

</div>

<script>
let riwayatPencarian = [];
let hasilAnalisis = "";

// Ganti URL ini sesuai project backend kamu di Vercel
const ANALYZE_API = "https://projek-film-backend.vercel.app/api/analyze";
const IMAGE_API = "https://projek-film-backend.vercel.app/api/generate-images";

function render() {
  const text = riwayatPencarian.map((p,i)=> `${i+1}. ${p}`).join("\n");
  document.getElementById("totalPencarian").innerText = `Total riwayat: ${riwayatPencarian.length} pencarian`;
  document.getElementById("list").innerText = text || "Belum ada riwayat pencarian.";
}

function resetPoster() {
  hasilAnalisis = "";
  document.getElementById("result").innerText = "Belum dianalisis.";
  document.getElementById("aiImage").style.display = "none";
  document.getElementById("aiImage").src = "";
  document.getElementById("imageStatus").innerText = "Belum ada poster.";
}

function tambahRiwayat() {
  const query = document.getElementById("searchQuery").value.trim();
  if (!query) return alert("Masukkan judul atau genre film terlebih dahulu!");
  riwayatPencarian.push(query);
  document.getElementById("searchQuery").value = "";
  resetPoster();
  render();
}

async function dapatkanRekomendasi() {
  if (riwayatPencarian.length === 0) return alert("Tambahkan riwayat pencarian terlebih dahulu!");
  document.getElementById("result").innerText = "Menganalisis selera film Anda...";
  resetPoster();

  const daftarRiwayat = riwayatPencarian.join(", ");

  try {
    const res = await fetch(ANALYZE_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ search_history: daftarRiwayat })
    });

    const json = await res.json();
    hasilAnalisis = json.result || "";
    document.getElementById("result").innerText = hasilAnalisis || json.error || "Tidak ada rekomendasi yang ditemukan.";
  } catch {
    document.getElementById("result").innerText = "Gagal menghubungi server AI.";
  }
}

async function generatePoster() {
  if (!riwayatPencarian.length) {
    document.getElementById("imageStatus").innerText = "Masukkan riwayat pencarian terlebih dahulu agar AI tahu selera Anda.";
    return;
  }
  if (!hasilAnalisis) {
    document.getElementById("imageStatus").innerText = "Klik Dapatkan Rekomendasi AI terlebih dahulu.";
    return;
  }

  document.getElementById("imageStatus").innerText = "Sedang membuat poster inspirasi...";
  document.getElementById("aiImage").style.display = "none";

  try {
    const res = await fetch(IMAGE_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ themes: hasilAnalisis })
    });

    const json = await res.json();

    if (json.image) {
      const img = document.getElementById("aiImage");
      img.src = `data:image/png;base64,${json.image}`;
      img.style.display = "block";
      document.getElementById("imageStatus").innerText = "Poster berhasil dibuat berdasarkan selera Anda!";
    } else {
      document.getElementById("imageStatus").innerText = json.error || "Gagal membuat poster.";
    }
  } catch {
    document.getElementById("imageStatus").innerText = "Gagal menghubungi server pembuat gambar.";
  }
}

render();
</script>
</body>
</html>
