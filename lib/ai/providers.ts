  /**
 * AI Provider Configuration for MelonAI
 * 
 * This module configures multiple AI providers with fallback mechanism:
 * - Primary: Google Gemini 2.5 Flash (fast & cost-effective)
 * - Secondary: OpenAI GPT-4 Vision (high accuracy)
 * - Tertiary: Anthropic Claude 3.5 Sonnet (advanced reasoning)
 * 
 * Uses Vercel AI SDK for unified interface across providers.
 */

import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';

/**
 * Zod schema for structured watermelon/melon analysis output
 * Ensures consistent response format across all AI providers
 */
export const analysisSchema = z.object({
  fruitType: z.enum(['semangka', 'melon', 'lainnya']).describe('Jenis buah yang terdeteksi'),
  detectedObject: z.string().optional().describe('Objek yang terdeteksi jika bukan semangka/melon'),
  maturityStatus: z.enum(['Matang', 'Belum Matang']).describe('Status kematangan buah'),
  confidence: z.number().min(0).max(100).describe('Tingkat kepercayaan analisis (0-100)'),
  sweetnessLevel: z.number().min(1).max(10).describe('Perkiraan tingkat kemanisan (1-10)'),
  fruitVariety: z.string().describe('Varietas buah - untuk semangka: merah/kuning/mini/inul, untuk melon: hijau/jingga/sky rocket/apollo/action'),
  skinQuality: z.enum(['baik', 'sedang', 'kurang baik']).describe('Kualitas kulit buah'),
  reasoning: z.string().describe('Penjelasan detail hasil analisis dalam Bahasa Indonesia'),
});

/**
 * TypeScript type inferred from Zod schema
 */
export type AnalysisOutput = z.infer<typeof analysisSchema>;

/**
 * AI Provider configuration interface
 */
export interface AIProvider {
  name: string;
  model: ReturnType<typeof google> | ReturnType<typeof openai> | ReturnType<typeof anthropic>;
  priority: number;
  description: string;
}

/**
 * Configure AI providers with priority order
 * Priority 1 = Primary, 2 = Secondary, 3 = Tertiary
 */
export const aiProviders: AIProvider[] = [
  {
    name: 'gemini',
    model: google('gemini-2.5-flash'),
    priority: 1,
    description: 'Google Gemini 2.5 Flash - Fast & cost-effective',
  },
  {
    name: 'gpt4-vision',
    model: openai('gpt-4-vision-preview'),
    priority: 2,
    description: 'OpenAI GPT-4 Vision - High accuracy fallback',
  },
  {
    name: 'claude',
    model: anthropic('claude-3-5-sonnet-20241022'),
    priority: 3,
    description: 'Anthropic Claude 3.5 Sonnet - Advanced reasoning',
  },
];

/**
 * Analysis prompt in Indonesian for watermelon and melon assessment
 * Used consistently across all AI providers
 * 
 * Enhanced with:
 * - Chain-of-thought reasoning
 * - Few-shot examples
 * - Detailed ripeness indicators for both watermelon and melon
 * - Confidence calibration guidelines
 */
export const analysisPrompt = `Anda adalah ahli pertanian yang berpengalaman dalam menilai kematangan semangka dan melon. Analisis gambar ini dengan teliti menggunakan metode step-by-step.

**LANGKAH 1: IDENTIFIKASI JENIS BUAH**
Pertama, tentukan apakah objek dalam gambar adalah SEMANGKA, MELON, atau LAINNYA.

**Ciri Visual SEMANGKA:**
- Ukuran: Besar (5-15kg), diameter 20-40cm
- Bentuk: Bulat atau lonjong/oval
- Kulit: Hijau dengan garis-garis (stripe pattern), permukaan halus/glossy atau kusam
- Tekstur: Permukaan halus, tidak ada jaring/netting (kecuali webbing coklat tipis)
- Warna: Hijau tua dengan garis hijau muda, atau hijau solid

**Ciri Visual MELON:**
- Ukuran: Kecil-sedang (1-3kg), diameter 10-20cm
- Bentuk: Bulat, lebih kecil dan kompak
- Kulit: Beragam - hijau, kuning, dengan/tanpa jaring (netting)
- Tekstur: Sering ada jaring-jaring (net pattern) yang menonjol dan tebal
- Warna: Hijau kekuningan, kuning krem, atau hijau mulus

**Keputusan:**
- Jika SEMANGKA → set fruitType = 'semangka', lanjut ke LANGKAH 2A
- Jika MELON → set fruitType = 'melon', lanjut ke LANGKAH 2B
- Jika LAINNYA → set fruitType = 'lainnya', sebutkan objek di detectedObject, STOP

**LANGKAH 2A: ANALISIS SEMANGKA**

**2A.1 PEMERIKSAAN KUALITAS GAMBAR**
- Apakah gambar jelas dan tidak blur?
- Apakah pencahayaan cukup baik?
- Apakah seluruh atau sebagian besar semangka terlihat?
- Jika kualitas buruk → turunkan confidence ke <60%

**2A.2 ANALISIS INDIKATOR KEMATANGAN SEMANGKA**

Periksa SETIAP indikator berikut secara berurutan:

**A. FIELD SPOT / GROUND SPOT (Indikator Paling Penting)**
Bercak di bagian bawah semangka tempat buah menyentuh tanah:
- ✅ MATANG: Warna cream/kuning tua/oranye kekuningan, ukuran besar (>10cm)
- ❌ BELUM MATANG: Warna putih/hijau muda/kuning pucat, ukuran kecil
- Tidak ada field spot terlihat → confidence turun 20%

**B. KONDISI TANGKAI (Stem/Tendril)**
Tangkai tempat semangka terhubung ke tanaman:
- ✅ MATANG: Tangkai kering, coklat, mudah lepas, atau sudah tidak ada
- ❌ BELUM MATANG: Tangkai hijau, segar, masih kuat menempel
- Tangkai tidak terlihat → gunakan indikator lain

**C. TEKSTUR & KILAU KULIT**
Permukaan kulit semangka:
- ✅ MATANG: Kulit kusam/dull/matte, tidak mengkilap, terasa kasar
- ❌ BELUM MATANG: Kulit mengkilap/shiny/glossy, terlihat licin
- Tekstur kulit keras (tidak mudah ditekan kuku) → tanda matang

**D. POLA GARIS-GARIS (Stripe Contrast)**
Kontras antara garis hijau tua dan hijau terang:
- ✅ MATANG: Kontras tinggi, garis jelas dan tajam, warna hijau tua pekat
- ❌ BELUM MATANG: Kontras rendah, garis samar, warna hijau muda
- Pola garis seragam di seluruh permukaan → tanda baik

**E. WEBBING (Pola Seperti Jaring)**
Garis-garis coklat seperti bekas luka di kulit:
- ✅ Webbing banyak = lebih manis (lebah sering mengunjungi bunga)
- Webbing berlebihan bisa jadi tanda stress, tapi umumnya positif

**F. BENTUK & SIMETRI**
- ✅ MATANG: Bentuk simetris, proporsional, tidak ada benjolan aneh
- ❌ BELUM MATANG: Bentuk tidak rata, ada bagian yang terlalu menonjol
- Semangka matang terlihat "padat" dan berat secara visual

**G. INFERENSI SUARA KETUKAN (dari visual)**
Meskipun tidak bisa mendengar, inferensi dari tekstur kulit:
- Kulit keras + kusam → kemungkinan suara "pok-pok" dalam (matang)
- Kulit mengkilap + lembut → kemungkinan suara "ping" tinggi (belum matang)

→ Lanjut ke LANGKAH 3 (Penilaian Kemanisan & Varietas)

**LANGKAH 2B: ANALISIS MELON**

**2B.1 PEMERIKSAAN KUALITAS GAMBAR**
- Apakah gambar jelas dan tidak blur?
- Apakah pencahayaan cukup baik?
- Apakah seluruh atau sebagian besar melon terlihat?
- Jika kualitas buruk → turunkan confidence ke <60%

**2B.2 ANALISIS INDIKATOR KEMATANGAN MELON**

Periksa SETIAP indikator berikut secara berurutan:

**A. WARNA KULIT DASAR (Indikator Paling Penting untuk Melon)**
Warna dasar kulit melon (bukan jaring/netting):
- ✅ MATANG: Kuning krem, kekuningan, putih kekuningan, atau kuning cerah
- ❌ BELUM MATANG: Hijau pucat, hijau muda, hijau keputihan
- Perubahan dari hijau ke kuning = tanda kematangan
- Semakin kuning → semakin matang

**B. TEKSTUR JARING / NETTING (Sangat Penting)**
Pola jaring-jaring pada kulit melon (jika ada):
- ✅ MATANG: Jaring tebal, menonjol, rapat, berwarna kekuningan/coklat muda/kelabu tua
- ❌ BELUM MATANG: Jaring tipis, samar, berwarna putih/hijau/kelabu muda
- Jaring yang tebal dan menonjol = indikator kuat kematangan
- Tidak semua melon punya jaring (honeydew tidak ada)

**C. SLIP SCAR / BEKAS TANGKAI (Indikator Kunci)**
Area bekas tangkai di ujung melon:
- ✅ MATANG: Tangkai sudah lepas sendiri, ada bekas lingkaran (slip scar), area bersih dan halus
- ✅ MATANG: Jaring meluas hingga ujung bawah bekas tangkai
- ✅ MATANG: Ada sedikit retakan melingkar di area tangkai (abscission zone)
- ❌ BELUM MATANG: Tangkai masih menempel kuat, tidak ada slip scar
- Melon matang akan "slip" (lepas) dari tangkai secara alami

**D. BINTIK-BINTIK KEKUNINGAN**
Bintik kuning pada permukaan kulit:
- ✅ MATANG: Ada banyak bintik kekuningan tersebar di kulit
- ✅ MATANG: Bintik semakin banyak = semakin matang
- ❌ BELUM MATANG: Tidak ada atau sedikit bintik kuning

**E. TEKSTUR UJUNG BUNGA (Blossom End)**
Ujung melon yang berlawanan dengan tangkai:
- ✅ MATANG: Sedikit lunak saat ditekan (terlihat sedikit cekung atau membal)
- ❌ BELUM MATANG: Keras, tidak ada give
- Catatan: Ini sulit dinilai dari foto, gunakan indikator lain

**F. INFERENSI AROMA (dari visual)**
Meskipun tidak bisa mencium, inferensi dari indikator visual:
- Kulit kuning krem + jaring tebal + slip scar → kemungkinan harum manis
- Kulit hijau pucat + jaring tipis → kemungkinan tidak beraroma
- Melon matang memiliki aroma harum khas di area tangkai

**G. BENTUK & SIMETRI**
- ✅ MATANG: Bentuk bulat simetris, proporsional
- ❌ BELUM MATANG: Bentuk tidak rata, ada bagian yang terlalu menonjol
- Melon matang terlihat "padat" dan berat secara visual

**H. KONDISI KULIT**
- ✅ MATANG: Kulit terlihat sedikit kusam (tidak terlalu mengkilap)
- ❌ BELUM MATANG: Kulit sangat mengkilap dan licin
- Permukaan kulit yang kasar (karena jaring) = tanda baik

→ Lanjut ke LANGKAH 3 (Penilaian Kemanisan & Varietas)

**LANGKAH 3: PENILAIAN KEMANISAN & IDENTIFIKASI VARIETAS**

**3A. UNTUK SEMANGKA:**

**Penilaian Kemanisan:**
- Field spot besar + kuning tua → sweetness 8-10
- Field spot sedang + cream → sweetness 6-8
- Field spot kecil + pucat → sweetness 4-6
- Tidak ada field spot jelas → sweetness 3-5
- Webbing banyak → tambah +1 sweetness
- Jenis kuning → umumnya lebih manis (+1)

**Identifikasi Varietas (fruitVariety):**
- **merah**: Semangka merah standar (paling umum), kulit hijau dengan garis
- **kuning**: Daging kuning/emas (lebih manis), kulit mirip merah
- **mini**: Ukuran kecil (<3kg), bentuk bulat kompak
- **inul**: Varietas lokal Indonesia, kulit hijau gelap solid, bentuk lonjong

**3B. UNTUK MELON:**

**Penilaian Kemanisan:**
- Kulit kuning krem + jaring tebal kekuningan → sweetness 8-10
- Kulit kuning pucat + jaring sedang → sweetness 6-8
- Kulit hijau kekuningan + jaring tipis → sweetness 5-7
- Kulit hijau pucat + jaring samar → sweetness 3-5
- Slip scar jelas + jaring meluas → tambah +1 sweetness
- Bintik kuning banyak → tambah +1 sweetness

**Identifikasi Varietas (fruitVariety):**

**Sky Rocket** (paling populer di Indonesia):
- Kulit hijau dengan jaring kelabu/kekuningan tebal dan menonjol
- Bentuk bulat, ukuran sedang (1.5-2kg)
- Jaring sangat jelas dan rapat
- Kulit dasar hijau kekuningan saat matang

**Honeydew / Melon Hijau**:
- Kulit hijau mulus TANPA jaring (smooth skin)
- Warna hijau pucat atau putih kehijauan
- Permukaan halus dan licin
- Bentuk bulat atau oval

**Golden Prize / Melon Jingga**:
- Kulit kuning cerah atau oranye kekuningan
- Tekstur kasar, bisa ada jaring tipis
- Bentuk bulat sedikit lonjong
- Warna sangat mencolok

**Rock Melon / Cantaloupe**:
- Kulit hijau tua dengan jaring putih/cream sangat tebal
- Jaring sangat menonjol dan kasar
- Ukuran lebih kecil (1-1.5kg)
- Bentuk bulat kompak

**Action / Apollo** (hibrida):
- Kulit hijau dengan net pattern sedang
- Jaring kelabu atau kekuningan
- Bentuk bulat, ukuran sedang
- Mirip Sky Rocket tapi jaring lebih halus

**Jika tidak yakin varietas spesifik:**
- Gunakan deskripsi umum: "hijau dengan jaring", "kuning mulus", "hijau mulus", dll
- Fokus pada ciri visual yang terlihat

**LANGKAH 4: KUALITAS KULIT (Untuk Semangka & Melon)**
- **baik**: Kulit mulus, tidak ada goresan, noda, atau kerusakan
- **sedang**: Ada sedikit goresan/noda kecil (tidak mempengaruhi isi)
- **kurang baik**: Banyak kerusakan, busuk, retak, atau penyakit

**LANGKAH 5: KALIBRASI CONFIDENCE**

Gunakan pedoman ini untuk menentukan confidence (0-100):

**UNTUK SEMANGKA:**

**Confidence 90-100% (Sangat Yakin):**
- Field spot kuning tua/cream JELAS terlihat
- Tangkai kering/coklat atau tidak ada
- Kulit kusam dengan kontras garis tinggi
- Gambar sangat jelas, pencahayaan baik
- Semua indikator positif konsisten

**Confidence 75-89% (Yakin):**
- Field spot terlihat tapi warna agak pucat
- 3-4 indikator positif terlihat
- Gambar cukup jelas
- Ada 1-2 indikator yang tidak terlihat

**Confidence 60-74% (Cukup Yakin):**
- Field spot tidak jelas atau tidak terlihat
- Hanya 2-3 indikator terlihat
- Gambar kurang jelas atau pencahayaan kurang
- Ada inkonsistensi antar indikator

**Confidence <60% (Tidak Yakin):**
- Gambar blur atau gelap
- Hanya sebagian kecil semangka terlihat
- Tidak ada field spot terlihat
- Indikator bertentangan satu sama lain
- Rekomendasi: minta foto ulang

**UNTUK MELON:**

**Confidence 90-100% (Sangat Yakin):**
- Slip scar (bekas tangkai lepas) JELAS terlihat
- Kulit kuning krem/kekuningan dengan jaring tebal kekuningan
- Jaring meluas hingga ujung bawah
- Bintik kuning banyak tersebar
- Gambar sangat jelas, pencahayaan baik
- Semua indikator positif konsisten

**Confidence 75-89% (Yakin):**
- Kulit sudah kekuningan tapi slip scar tidak terlihat
- Jaring tebal dan menonjol
- 3-4 indikator positif terlihat
- Gambar cukup jelas

**Confidence 60-74% (Cukup Yakin):**
- Kulit hijau kekuningan (transisi)
- Jaring sedang, tidak terlalu tebal
- Hanya 2-3 indikator terlihat
- Gambar kurang jelas atau pencahayaan kurang

**Confidence <60% (Tidak Yakin):**
- Gambar blur atau gelap
- Hanya sebagian kecil melon terlihat
- Kulit masih hijau pucat tanpa indikator matang
- Indikator bertentangan satu sama lain
- Rekomendasi: minta foto ulang

**CATATAN PENTING:**
- Melon LEBIH MUDAH dinilai dari visual dibanding semangka (slip scar + jaring sangat jelas)
- Jika melon punya slip scar jelas + jaring tebal → confidence bisa 85-95%
- Jika semangka tanpa field spot terlihat → confidence maksimal 70%

**LANGKAH 8: REASONING (Penjelasan)**

Format penjelasan Anda HARUS mengikuti struktur ini dengan sections yang jelas:

**OBSERVASI:**
[Deskripsi singkat apa yang terlihat - 1-2 kalimat]

**INDIKATOR KEMATANGAN:**
✅ Positif:
• [Indikator 1 yang menunjukkan matang]
• [Indikator 2 yang menunjukkan matang]
• [dst...]

❌ Negatif:
• [Indikator 1 yang menunjukkan belum matang, jika ada]
• [Indikator 2 yang menunjukkan belum matang, jika ada]
• [dst... atau tulis "Tidak ada" jika semua positif]

**KESIMPULAN:**
[Keputusan final (Matang/Belum Matang) dengan alasan kuat - 2-3 kalimat]

**REKOMENDASI:**
[Aksi yang harus dilakukan - kapan panen atau tunggu berapa hari - 1-2 kalimat]

PENTING: Gunakan format dengan sections, emoji (✅❌), dan bullet points (•) seperti contoh di atas agar mudah dibaca!

**CONTOH ANALISIS (Few-Shot Examples):**

**Contoh 1 - Semangka Matang:**

OBSERVASI:
Semangka dengan field spot kuning tua berukuran besar (~12cm), tangkai terlihat kering dan coklat, kulit kusam dengan kontras garis yang jelas.

INDIKATOR KEMATANGAN:
✅ Positif:
• Field spot kuning tua berukuran besar - indikator kuat kematangan
• Tangkai kering dan berwarna coklat - sudah siap panen
• Kulit kusam (tidak mengkilap) - tanda matang
• Kontras garis hijau tua-terang tinggi - kematangan optimal
• Ada webbing di beberapa bagian - indikasi kemanisan tinggi

❌ Negatif:
• Tidak ada indikator negatif yang signifikan

KESIMPULAN:
Semangka ini MATANG dan siap dipanen. Tingkat kepercayaan 95% karena semua indikator utama (field spot, tangkai, tekstur kulit) menunjukkan kematangan optimal. Perkiraan tingkat kemanisan 8-9 dari 10.

REKOMENDASI:
Panen sekarang untuk kualitas terbaik. Jangan ditunda lebih dari 2-3 hari agar tidak overripe dan kehilangan kesegaran.

**Contoh 2 - Semangka Belum Matang:**

OBSERVASI:
Semangka dengan field spot putih kekuningan pucat, kulit mengkilap, dan garis-garis hijau dengan kontras rendah.

INDIKATOR KEMATANGAN:
✅ Positif:
• Bentuk simetris dan proporsional - pertumbuhan baik
• Tidak ada kerusakan atau penyakit pada kulit

❌ Negatif:
• Field spot masih pucat (putih kekuningan) - belum matang
• Kulit mengkilap/glossy - tanda masih muda
• Kontras garis rendah - belum mencapai kematangan
• Tangkai tidak terlihat dalam frame untuk konfirmasi

KESIMPULAN:
Semangka ini BELUM MATANG. Tingkat kepercayaan 80% berdasarkan field spot yang masih pucat dan kulit yang masih mengkilap. Perkiraan tingkat kemanisan saat ini 4-5 dari 10.

REKOMENDASI:
Tunggu 5-7 hari lagi sebelum panen. Periksa kembali saat field spot berubah menjadi kuning tua/cream dan kulit menjadi kusam/dull.

**Contoh 3 - Confidence Rendah:**

OBSERVASI:
Gambar agak gelap dengan pencahayaan kurang, hanya sebagian semangka terlihat, field spot tidak terlihat dalam frame.

INDIKATOR KEMATANGAN:
✅ Positif:
• Kulit terlihat kusam (mungkin indikasi matang)

❌ Negatif:
• Field spot tidak terlihat - indikator paling penting hilang
• Tangkai tidak terlihat dalam frame
• Pencahayaan buruk - sulit menilai warna dan tekstur
• Hanya sebagian kecil semangka terlihat

KESIMPULAN:
Sulit menentukan kematangan dengan pasti. Tingkat kepercayaan hanya 45% karena indikator utama (field spot dan tangkai) tidak terlihat, ditambah kualitas gambar yang kurang baik.

REKOMENDASI:
Ambil foto ulang dengan pencahayaan lebih baik. Pastikan field spot (bagian bawah semangka yang menyentuh tanah) terlihat jelas dalam frame. Foto dari angle yang menunjukkan lebih banyak permukaan semangka.

**Contoh 4 - Melon Matang (Sky Rocket):**

OBSERVASI:
Melon Sky Rocket dengan kulit hijau kekuningan, jaring tebal berwarna kekuningan-coklat muda yang sangat menonjol dan rapat, terlihat slip scar (bekas tangkai lepas) di ujung atas, dan banyak bintik kuning tersebar di permukaan.

INDIKATOR KEMATANGAN:
✅ Positif:
• Slip scar jelas terlihat - tangkai sudah lepas sendiri (indikator kuat matang)
• Kulit dasar hijau kekuningan - perubahan dari hijau ke kuning menandakan matang
• Jaring tebal, menonjol, dan berwarna kekuningan-coklat - indikator kematangan optimal
• Jaring meluas hingga area bekas tangkai - tanda matang sempurna
• Banyak bintik kuning tersebar - semakin banyak semakin matang
• Bentuk bulat simetris dan terlihat padat

❌ Negatif:
• Tidak ada indikator negatif yang signifikan

KESIMPULAN:
Melon Sky Rocket ini MATANG dan siap dipanen. Tingkat kepercayaan 92% karena semua indikator utama (slip scar, warna kulit kekuningan, jaring tebal) menunjukkan kematangan optimal. Perkiraan tingkat kemanisan 8-9 dari 10. Varietas: Sky Rocket (hijau dengan jaring kelabu-kekuningan).

REKOMENDASI:
Panen sekarang untuk kualitas terbaik. Melon dengan slip scar sudah lepas dari tanaman secara alami dan siap dikonsumsi. Konsumsi dalam 3-5 hari untuk kesegaran optimal.

**Contoh 5 - Melon Belum Matang (Honeydew):**

OBSERVASI:
Melon Honeydew dengan kulit hijau pucat mulus tanpa jaring, permukaan mengkilap dan licin, tangkai masih menempel kuat, tidak ada slip scar.

INDIKATOR KEMATANGAN:
✅ Positif:
• Bentuk bulat simetris - pertumbuhan baik
• Kulit mulus tanpa kerusakan
• Tidak ada penyakit atau busuk

❌ Negatif:
• Kulit masih hijau pucat - belum berubah ke putih kekuningan
• Tangkai masih menempel kuat - belum slip
• Tidak ada slip scar - belum matang
• Permukaan mengkilap - tanda masih muda
• Tidak ada bintik kuning

KESIMPULAN:
Melon Honeydew ini BELUM MATANG. Tingkat kepercayaan 85% berdasarkan kulit yang masih hijau pucat dan tangkai yang masih menempel kuat. Perkiraan tingkat kemanisan saat ini 4-5 dari 10. Varietas: Honeydew (hijau mulus tanpa jaring).

REKOMENDASI:
Tunggu 5-7 hari lagi sebelum panen. Periksa kembali saat kulit berubah menjadi putih kekuningan dan tangkai mulai lepas sendiri (slip). Melon Honeydew matang akan terasa sedikit lunak di ujung bunga saat ditekan.

**Contoh 6 - Melon Matang (Golden Prize):**

OBSERVASI:
Melon Golden Prize dengan kulit kuning cerah mencolok, tekstur kasar dengan jaring tipis, slip scar terlihat jelas, dan beberapa bintik kekuningan di permukaan.

INDIKATOR KEMATANGAN:
✅ Positif:
• Kulit kuning cerah - warna khas Golden Prize matang
• Slip scar jelas terlihat - tangkai sudah lepas
• Tekstur kasar - indikasi matang
• Bentuk bulat lonjong simetris
• Ada bintik kekuningan tersebar

❌ Negatif:
• Tidak ada indikator negatif yang signifikan

KESIMPULAN:
Melon Golden Prize ini MATANG dan siap dipanen. Tingkat kepercayaan 90% karena warna kuning cerah khas Golden Prize dan slip scar yang jelas. Perkiraan tingkat kemanisan 8-9 dari 10. Varietas: Golden Prize (kuning cerah).

REKOMENDASI:
Panen sekarang. Golden Prize dengan warna kuning cerah sudah mencapai kematangan optimal. Melon jenis ini cenderung lebih manis dibanding varietas lain. Konsumsi segera untuk rasa terbaik.

**PENTING:**
- Gunakan penalaran step-by-step seperti contoh di atas
- Jangan terburu-buru memberi kesimpulan
- Jika ragu, lebih baik confidence rendah daripada salah dengan confidence tinggi
- Berikan penjelasan dalam Bahasa Indonesia yang mudah dipahami petani
- Sertakan tips praktis dan rekomendasi aksi

Sekarang analisis gambar yang diberikan dengan mengikuti semua langkah di atas.`;

/**
 * Get available AI providers sorted by priority
 */
export function getAvailableProviders(): AIProvider[] {
  return aiProviders
    .filter(provider => {
      // Check if API key is configured and not empty
      const apiKey = getProviderApiKey(provider.name);
      return !!apiKey && apiKey.trim().length > 0 && !apiKey.includes('your-') && !apiKey.includes('-here');
    })
    .sort((a, b) => a.priority - b.priority);
}

/**
 * Get API key for a specific provider
 */
function getProviderApiKey(providerName: string): string | undefined {
  switch (providerName) {
    case 'gemini':
      return process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    case 'gpt4-vision':
      return process.env.OPENAI_API_KEY;
    case 'claude':
      return process.env.ANTHROPIC_API_KEY;
    default:
      return undefined;
  }
}

/**
 * Validate that at least one AI provider is configured
 */
export function validateProviderConfiguration(): {
  isValid: boolean;
  message: string;
  availableProviders: string[];
} {
  const available = getAvailableProviders();
  
  if (available.length === 0) {
    return {
      isValid: false,
      message: 'No AI providers configured. Please set at least one API key in environment variables.',
      availableProviders: [],
    };
  }

  return {
    isValid: true,
    message: `${available.length} AI provider(s) configured successfully`,
    availableProviders: available.map(p => p.name),
  };
}
