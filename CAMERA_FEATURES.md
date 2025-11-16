# 📷 Fitur Kamera MelonAI

## Fitur-Fitur Baru

### 1. 🔍 Zoom In/Out
- **Tombol:** Ikon `+` dan `-` di pojok kanan atas
- **Fungsi:** Memperbesar atau memperkecil tampilan kamera
- **Indikator:** Level zoom ditampilkan di pojok kiri atas (contoh: "2.5x")
- **Catatan:** Fitur ini hanya tersedia jika kamera HP mendukung zoom digital

### 2. 🔄 Ganti Kamera (Depan/Belakang)
- **Tombol:** Ikon kamera dengan panah di pojok kanan atas
- **Fungsi:** Beralih antara kamera depan dan belakang
- **Default:** Kamera belakang (untuk foto semangka)
- **Kegunaan:** Bisa digunakan untuk selfie atau foto dari sudut berbeda

### 3. ⛶ Mode Fullscreen
- **Tombol:** Ikon maximize di pojok kanan atas
- **Fungsi:** Membuka kamera dalam mode layar penuh
- **Kegunaan:** Memberikan area preview yang lebih luas
- **Keluar:** Tekan tombol yang sama atau tombol ESC

### 4. 🎯 Guidance Frame
- **Tampilan:** Bingkai persegi dengan sudut berwarna hijau
- **Fungsi:** Membantu memposisikan semangka di tengah frame
- **Instruksi:** "Posisikan semangka di dalam bingkai"

### 5. ✅ Visual Feedback
- **Saat Capture:** Animasi checkmark hijau
- **Loading:** Spinner dengan teks "Membuka kamera..."
- **Error:** Alert merah dengan pesan error dalam Bahasa Indonesia

## Cara Menggunakan

### Mengambil Foto Sempurna

1. **Buka halaman kamera** dari tombol "Foto Semangka"
2. **Izinkan akses kamera** saat browser meminta
3. **Posisikan semangka** di dalam bingkai persegi
4. **Gunakan zoom** jika semangka terlalu jauh atau terlalu dekat
5. **Ganti kamera** jika perlu sudut pandang berbeda
6. **Tekan tombol capture** (ikon kamera besar di bawah)
7. **Tunggu feedback** - akan muncul checkmark hijau saat berhasil

### Tips Menggunakan Zoom

- **Zoom In (+):** Gunakan untuk detail lebih jelas pada semangka yang jauh
- **Zoom Out (-):** Gunakan untuk melihat semangka secara keseluruhan
- **Level Optimal:** 1.0x - 2.0x untuk hasil terbaik
- **Hindari:** Zoom terlalu tinggi (>3x) karena bisa membuat gambar blur

### Tips Menggunakan Switch Camera

- **Kamera Belakang (Default):** Lebih baik untuk foto objek (semangka)
- **Kamera Depan:** Bisa digunakan untuk selfie dengan semangka
- **Kualitas:** Kamera belakang biasanya memiliki resolusi lebih tinggi

### Tips Fullscreen Mode

- **Kapan Digunakan:** Saat butuh area preview lebih luas
- **Keuntungan:** Lebih mudah melihat detail semangka
- **Mobile:** Sangat berguna di HP dengan layar kecil
- **Keluar:** Tekan tombol fullscreen lagi atau ESC

## Kompatibilitas Browser

| Fitur | Chrome | Firefox | Safari | Edge |
|-------|--------|---------|--------|------|
| Basic Camera | ✅ | ✅ | ✅ | ✅ |
| Zoom | ✅ | ⚠️ Terbatas | ⚠️ Terbatas | ✅ |
| Switch Camera | ✅ | ✅ | ✅ | ✅ |
| Fullscreen | ✅ | ✅ | ✅ | ✅ |

**Catatan:**
- ✅ = Fully supported
- ⚠️ = Partially supported (tergantung device)
- ❌ = Not supported

## Troubleshooting

### Zoom tidak muncul
**Penyebab:** Kamera HP tidak mendukung zoom digital
**Solusi:** Gunakan jarak fisik untuk adjust ukuran objek

### Switch camera tidak bekerja
**Penyebab:** HP hanya memiliki 1 kamera
**Solusi:** Fitur ini hanya tersedia di device dengan multiple cameras

### Fullscreen tidak berfungsi
**Penyebab:** Browser tidak mendukung Fullscreen API
**Solusi:** Update browser ke versi terbaru

### Gambar blur saat zoom
**Penyebab:** Zoom digital terlalu tinggi
**Solusi:** Kurangi zoom atau dekatkan HP ke semangka

## Spesifikasi Teknis

### Resolusi Kamera
- **Ideal:** 1920x1080 (Full HD)
- **Minimum:** 1280x720 (HD)
- **Format:** JPEG dengan quality 95%

### Kompresi Gambar
- **Max Size:** 2MB
- **Quality:** 90% (auto-adjust jika terlalu besar)
- **Algoritma:** Canvas API dengan progressive compression

### Zoom Range
- **Minimum:** 1.0x (no zoom)
- **Maximum:** Tergantung device (biasanya 3.0x - 5.0x)
- **Step:** 0.1x per tap

## Keyboard Shortcuts (Desktop)

- **Space:** Ambil foto
- **Z:** Zoom in
- **X:** Zoom out
- **C:** Switch camera
- **F:** Toggle fullscreen
- **ESC:** Keluar fullscreen

*Catatan: Keyboard shortcuts akan ditambahkan di update berikutnya*

## Fitur Mendatang

- [ ] Pinch to zoom (gesture)
- [ ] Flash/torch control
- [ ] Grid overlay (rule of thirds)
- [ ] Timer/countdown
- [ ] Burst mode (multiple shots)
- [ ] Manual focus control
- [ ] Exposure adjustment
- [ ] Filter preview

---

**Versi:** 1.0.0  
**Last Updated:** 2024
