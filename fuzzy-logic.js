let daftarSiswa = [];


/**
 * Fungsi keanggotaan Triangular
 * @param {number} x - Nilai input
 * @param {number} a - Titik awal (membership = 0)
 * @param {number} b - Titik puncak (membership = 1)
 * @param {number} c - Titik akhir (membership = 0)
 * @returns {number} Nilai keanggotaan (0-1)
 */
function triangular(x, a, b, c) {
  if (x <= a || x >= c) return 0;
  if (x === b) return 1;
  if (x > a && x < b) return (x - a) / (b - a);
  return (c - x) / (c - b);
}

/**
 * Fungsi keanggotaan Trapezoidal
 * @param {number} x - Nilai input
 * @param {number} a - Titik awal
 * @param {number} b - Titik awal plateau
 * @param {number} c - Titik akhir plateau
 * @param {number} d - Titik akhir
 * @returns {number} Nilai keanggotaan (0-1)
 */
function trapezoidal(x, a, b, c, d) {
  if (x <= a || x >= d) return 0;
  if (x >= b && x <= c) return 1;
  if (x > a && x < b) return (x - a) / (b - a);
  return (d - x) / (d - c);
}

// ========================================
// 2. FUZZIFIKASI
// ========================================

/**
 * Mengkonversi nilai crisp menjadi nilai fuzzy untuk setiap kriteria
 * @param {number} nilai - Nilai input (0-100)
 * @returns {object} Nilai keanggotaan untuk setiap kategori
 */
function fuzzifikasi(nilai) {
  return {
    rendah: trapezoidal(nilai, 0, 0, 30, 50),
    sedang: triangular(nilai, 40, 60, 70),
    tinggi: trapezoidal(nilai, 60, 70, 100, 100)
  };
}

// ========================================
// 3. RULE BASE (BASIS ATURAN FUZZY)
// ========================================

/**
 * Menerapkan aturan fuzzy Mamdani
 * Menggunakan operator MIN untuk AND dan MAX untuk agregasi
 * @param {object} disiplin - Nilai fuzzy kedisiplinan
 * @param {object} prestasi - Nilai fuzzy prestasi
 * @param {object} sikap - Nilai fuzzy sikap
 * @returns {object} Hasil inferensi untuk setiap kategori output
 */
function inferensi(disiplin, prestasi, sikap) {
  // Definisi 27 aturan fuzzy (3x3x3 kombinasi)
  const rules = {
    // ===== SANGAT BAIK =====
    sangatBaik: [
      Math.min(disiplin.tinggi, prestasi.tinggi, sikap.tinggi),
      Math.min(disiplin.tinggi, prestasi.tinggi, sikap.sedang),
      Math.min(disiplin.sedang, prestasi.tinggi, sikap.tinggi),
    ],
    
    // ===== BAIK =====
    baik: [
      Math.min(disiplin.tinggi, prestasi.sedang, sikap.tinggi),
      Math.min(disiplin.sedang, prestasi.tinggi, sikap.sedang),
      Math.min(disiplin.sedang, prestasi.sedang, sikap.tinggi),
      Math.min(disiplin.tinggi, prestasi.sedang, sikap.sedang),
      Math.min(disiplin.tinggi, prestasi.tinggi, sikap.rendah),
      Math.min(disiplin.tinggi, prestasi.rendah, sikap.tinggi),
    ],
    
    // ===== CUKUP =====
    cukup: [
      Math.min(disiplin.sedang, prestasi.sedang, sikap.sedang),
      Math.min(disiplin.tinggi, prestasi.rendah, sikap.sedang),
      Math.min(disiplin.sedang, prestasi.tinggi, sikap.rendah),
      Math.min(disiplin.rendah, prestasi.tinggi, sikap.tinggi),
      Math.min(disiplin.sedang, prestasi.rendah, sikap.tinggi),
      Math.min(disiplin.rendah, prestasi.tinggi, sikap.sedang),
    ],
    
    // ===== KURANG =====
    kurang: [
      Math.min(disiplin.sedang, prestasi.sedang, sikap.rendah),
      Math.min(disiplin.sedang, prestasi.rendah, sikap.sedang),
      Math.min(disiplin.rendah, prestasi.sedang, sikap.sedang),
      Math.min(disiplin.tinggi, prestasi.rendah, sikap.rendah),
      Math.min(disiplin.rendah, prestasi.tinggi, sikap.rendah),
      Math.min(disiplin.rendah, prestasi.rendah, sikap.tinggi),
    ],
    
    // ===== SANGAT KURANG =====
    sangatKurang: [
      Math.min(disiplin.rendah, prestasi.rendah, sikap.rendah),
      Math.min(disiplin.rendah, prestasi.sedang, sikap.rendah),
      Math.min(disiplin.rendah, prestasi.rendah, sikap.sedang),
      Math.min(disiplin.sedang, prestasi.rendah, sikap.rendah),
    ]
  };

  // Agregasi menggunakan MAX untuk setiap kategori output
  return {
    sangatBaik: Math.max(...rules.sangatBaik),
    baik: Math.max(...rules.baik),
    cukup: Math.max(...rules.cukup),
    kurang: Math.max(...rules.kurang),
    sangatKurang: Math.max(...rules.sangatKurang)
  };
}

// ========================================
// 4. DEFUZZIFIKASI (METODE CENTROID/COA)
// ========================================

/**
 * Mengkonversi nilai fuzzy output menjadi nilai crisp
 * Menggunakan metode Center of Area (Centroid)
 * @param {object} hasilInferensi - Hasil dari proses inferensi
 * @returns {number} Nilai akhir (0-100)
 */
function defuzzifikasi(hasilInferensi) {
  // Titik pusat (centroid) untuk setiap kategori
  const centroids = {
    sangatKurang: 25,
    kurang: 45,
    cukup: 62,
    baik: 78,
    sangatBaik: 92
  };

  // Hitung pembilang dan penyebut untuk COA
  let pembilang = 0;
  let penyebut = 0;

  for (let kategori in hasilInferensi) {
    const membership = hasilInferensi[kategori];
    const centroid = centroids[kategori];
    
    pembilang += membership * centroid;
    penyebut += membership;
  }

  // Hindari pembagian dengan nol
  return penyebut > 0 ? pembilang / penyebut : 50;
}

// ========================================
// 5. FUNGSI UTAMA - PROSES FUZZY
// ========================================

function prosesFuzzy() {
  // Ambil input dari form
  const nama = document.getElementById("nama").value.trim();
  const disiplin = parseFloat(document.getElementById("disiplin").value);
  const prestasi = parseFloat(document.getElementById("prestasi").value);
  const sikap = parseFloat(document.getElementById("sikap").value);

  // Validasi input
  if (!nama) {
    alert("⚠️ Nama siswa harus diisi!");
    return;
  }

  if (isNaN(disiplin) || isNaN(prestasi) || isNaN(sikap)) {
    alert("⚠️ Semua nilai harus diisi dengan angka!");
    return;
  }

  if (disiplin < 0 || disiplin > 100 || prestasi < 0 || prestasi > 100 || sikap < 0 || sikap > 100) {
    alert("⚠️ Semua nilai harus berada dalam rentang 0-100!");
    return;
  }

  // STEP 1: Fuzzifikasi
  const fDisiplin = fuzzifikasi(disiplin);
  const fPrestasi = fuzzifikasi(prestasi);
  const fSikap = fuzzifikasi(sikap);

  // STEP 2: Inferensi
  const hasilInferensi = inferensi(fDisiplin, fPrestasi, fSikap);

  // STEP 3: Defuzzifikasi
  const nilaiAkhir = defuzzifikasi(hasilInferensi);

  // Tentukan kategori
  let kategori, badgeClass;
  if (nilaiAkhir >= 85) {
    kategori = "Sangat Baik";
    badgeClass = "badge-success";
  } else if (nilaiAkhir >= 70) {
    kategori = "Baik";
    badgeClass = "badge-info";
  } else if (nilaiAkhir >= 55) {
    kategori = "Cukup";
    badgeClass = "badge-warning";
  } else {
    kategori = "Kurang";
    badgeClass = "badge-danger";
  }

  // Tampilkan hasil
  tampilkanHasil(nama, disiplin, prestasi, sikap, fDisiplin, fPrestasi, fSikap, hasilInferensi, nilaiAkhir, kategori, badgeClass);

  // Simpan ke daftar siswa
  daftarSiswa.push({
    nama,
    disiplin,
    prestasi,
    sikap,
    nilaiAkhir: nilaiAkhir.toFixed(2),
    kategori
  });

  tampilkanRanking();
}

// ========================================
// 6. FUNGSI TAMPILAN
// ========================================

function tampilkanHasil(nama, disiplin, prestasi, sikap, fDisiplin, fPrestasi, fSikap, hasilInferensi, nilaiAkhir, kategori, badgeClass) {
  // Tampilkan section hasil
  document.getElementById("resultSection").style.display = "block";

  // Info siswa
  document.getElementById("studentInfo").innerHTML = `
    <div class="info-box">
      <h3>👤 ${nama}</h3>
      <p><strong>Kedisiplinan:</strong> ${disiplin} | <strong>Prestasi:</strong> ${prestasi} | <strong>Sikap:</strong> ${sikap}</p>
    </div>
  `;

  // Tab Fuzzifikasi
  document.getElementById("fuzzifikasi").innerHTML = `
    <h3>📊 Hasil Fuzzifikasi</h3>
    <p style="color: #666; margin-bottom: 15px;">Konversi nilai crisp (0-100) menjadi nilai fuzzy (0-1) untuk setiap kategori</p>
    <table>
      <thead>
        <tr>
          <th>Kriteria</th>
          <th>Rendah</th>
          <th>Sedang</th>
          <th>Tinggi</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Kedisiplinan</strong></td>
          <td>${fDisiplin.rendah.toFixed(3)}</td>
          <td>${fDisiplin.sedang.toFixed(3)}</td>
          <td>${fDisiplin.tinggi.toFixed(3)}</td>
        </tr>
        <tr>
          <td><strong>Prestasi Akademik</strong></td>
          <td>${fPrestasi.rendah.toFixed(3)}</td>
          <td>${fPrestasi.sedang.toFixed(3)}</td>
          <td>${fPrestasi.tinggi.toFixed(3)}</td>
        </tr>
        <tr>
          <td><strong>Sikap/Kepribadian</strong></td>
          <td>${fSikap.rendah.toFixed(3)}</td>
          <td>${fSikap.sedang.toFixed(3)}</td>
          <td>${fSikap.tinggi.toFixed(3)}</td>
        </tr>
      </tbody>
    </table>
  `;

  // Tab Inferensi
  document.getElementById("inferensi").innerHTML = `
    <h3>🧠 Hasil Inferensi (Rule Evaluation)</h3>
    <p style="color: #666; margin-bottom: 15px;">Agregasi aturan fuzzy menggunakan operator MIN (AND) dan MAX</p>
    
    <div class="rule-item">
      <span class="rule-name">Sangat Baik (μ ≥ 0.85)</span>
      <span class="rule-value">${hasilInferensi.sangatBaik.toFixed(3)}</span>
    </div>
    
    <div class="rule-item">
      <span class="rule-name">Baik (0.70 ≤ μ < 0.85)</span>
      <span class="rule-value">${hasilInferensi.baik.toFixed(3)}</span>
    </div>
    
    <div class="rule-item">
      <span class="rule-name">Cukup (0.55 ≤ μ < 0.70)</span>
      <span class="rule-value">${hasilInferensi.cukup.toFixed(3)}</span>
    </div>
    
    <div class="rule-item">
      <span class="rule-name">Kurang (0.40 ≤ μ < 0.55)</span>
      <span class="rule-value">${hasilInferensi.kurang.toFixed(3)}</span>
    </div>
    
    <div class="rule-item">
      <span class="rule-name">Sangat Kurang (μ < 0.40)</span>
      <span class="rule-value">${hasilInferensi.sangatKurang.toFixed(3)}</span>
    </div>
  `;

  // Tab Defuzzifikasi
  document.getElementById("defuzzifikasi").innerHTML = `
    <h3>🎯 Hasil Defuzzifikasi (Center of Area)</h3>
    <p style="color: #666; margin-bottom: 15px;">Konversi nilai fuzzy menjadi nilai crisp menggunakan metode Centroid</p>
    
    <div class="info-box">
      <h4>Formula Centroid (COA):</h4>
      <p style="font-family: monospace; background: white; padding: 10px; border-radius: 5px; margin-top: 10px;">
        z* = Σ(μ(z) × z) / Σμ(z)
      </p>
      <p style="margin-top: 10px; font-size: 0.9em;">
        Dimana z adalah centroid setiap kategori dan μ(z) adalah nilai keanggotaan hasil inferensi
      </p>
    </div>

    <table style="margin-top: 20px;">
      <thead>
        <tr>
          <th>Kategori</th>
          <th>Centroid (z)</th>
          <th>Membership (μ)</th>
          <th>μ × z</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Sangat Kurang</td>
          <td>25</td>
          <td>${hasilInferensi.sangatKurang.toFixed(3)}</td>
          <td>${(hasilInferensi.sangatKurang * 25).toFixed(3)}</td>
        </tr>
        <tr>
          <td>Kurang</td>
          <td>45</td>
          <td>${hasilInferensi.kurang.toFixed(3)}</td>
          <td>${(hasilInferensi.kurang * 45).toFixed(3)}</td>
        </tr>
        <tr>
          <td>Cukup</td>
          <td>62</td>
          <td>${hasilInferensi.cukup.toFixed(3)}</td>
          <td>${(hasilInferensi.cukup * 62).toFixed(3)}</td>
        </tr>
        <tr>
          <td>Baik</td>
          <td>78</td>
          <td>${hasilInferensi.baik.toFixed(3)}</td>
          <td>${(hasilInferensi.baik * 78).toFixed(3)}</td>
        </tr>
        <tr>
          <td>Sangat Baik</td>
          <td>92</td>
          <td>${hasilInferensi.sangatBaik.toFixed(3)}</td>
          <td>${(hasilInferensi.sangatBaik * 92).toFixed(3)}</td>
        </tr>
      </tbody>
    </table>

    <div class="final-score">
      <h3>Nilai Akhir Siswa</h3>
      <div class="score">${nilaiAkhir.toFixed(2)}</div>
      <div class="category">${kategori}</div>
    </div>
  `;

  // Scroll ke hasil
  document.getElementById("resultSection").scrollIntoView({ behavior: 'smooth' });
}

function tampilkanRanking() {
  if (daftarSiswa.length === 0) return;

  document.getElementById("rankingSection").style.display = "block";

  // Sort siswa berdasarkan nilai akhir (descending)
  const sortedSiswa = [...daftarSiswa].sort((a, b) => parseFloat(b.nilaiAkhir) - parseFloat(a.nilaiAkhir));

  let tableHTML = `
    <table>
      <thead>
        <tr>
          <th>Rank</th>
          <th>Nama</th>
          <th>Kedisiplinan</th>
          <th>Prestasi</th>
          <th>Sikap</th>
          <th>Nilai Akhir</th>
          <th>Kategori</th>
        </tr>
      </thead>
      <tbody>
  `;

  sortedSiswa.forEach((siswa, index) => {
    let badgeClass = "badge-danger";
    if (siswa.kategori === "Sangat Baik") badgeClass = "badge-success";
    else if (siswa.kategori === "Baik") badgeClass = "badge-info";
    else if (siswa.kategori === "Cukup") badgeClass = "badge-warning";

    const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "";

    tableHTML += `
      <tr>
        <td><strong>${medal} ${index + 1}</strong></td>
        <td><strong>${siswa.nama}</strong></td>
        <td>${siswa.disiplin}</td>
        <td>${siswa.prestasi}</td>
        <td>${siswa.sikap}</td>
        <td><strong>${siswa.nilaiAkhir}</strong></td>
        <td><span class="badge ${badgeClass}">${siswa.kategori}</span></td>
      </tr>
    `;
  });

  tableHTML += `
      </tbody>
    </table>
  `;

  document.getElementById("rankingTable").innerHTML = tableHTML;
}

// ========================================
// 7. FUNGSI HELPER
// ========================================

function showTab(tabName) {
  // Sembunyikan semua tab
  const tabs = document.querySelectorAll('.tab-content');
  tabs.forEach(tab => tab.classList.remove('active'));

  // Nonaktifkan semua tombol tab
  const btns = document.querySelectorAll('.tab-btn');
  btns.forEach(btn => btn.classList.remove('active'));

  // Tampilkan tab yang dipilih
  document.getElementById(tabName).classList.add('active');

  // Aktifkan tombol yang diklik
  event.target.classList.add('active');
}

function resetForm() {
  document.getElementById("fuzzyForm").reset();
  document.getElementById("resultSection").style.display = "none";
}