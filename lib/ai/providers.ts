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
 * Zod schema for structured watermelon analysis output
 * Ensures consistent response format across all AI providers
 */
export const analysisSchema = z.object({
  isWatermelon: z.boolean().describe('Apakah objek dalam gambar adalah semangka'),
  detectedObject: z.string().optional().describe('Objek yang terdeteksi jika bukan semangka'),
  maturityStatus: z.enum(['Matang', 'Belum Matang']).describe('Status kematangan semangka'),
  confidence: z.number().min(0).max(100).describe('Tingkat kepercayaan analisis (0-100)'),
  sweetnessLevel: z.number().min(1).max(10).describe('Perkiraan tingkat kemanisan (1-10)'),
  watermelonType: z.enum(['merah', 'kuning', 'mini', 'inul']).describe('Jenis semangka'),
  skinQuality: z.enum(['baik', 'sedang', 'kurang baik']).describe('Kualitas kulit semangka'),
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
 * Analysis prompt in Indonesian for watermelon assessment
 * Used consistently across all AI providers
 * 
 * Enhanced with:
 * - Chain-of-thought reasoning
 * - Few-shot examples
 * - Detailed ripeness indicators
 * - Confidence calibration guidelines
 */
export const analysisPrompt = `Anda adalah ahli pertanian yang berpengalaman dalam menilai kematangan semangka. Analisis gambar ini dengan teliti menggunakan metode step-by-step.

**LANGKAH 1: VALIDASI OBJEK**
Pertama, periksa apakah objek dalam gambar adalah SEMANGKA.
- Jika BUKAN semangka → set isWatermelon = false, sebutkan objek yang terdeteksi di detectedObject
- Jika ADALAH semangka → set isWatermelon = true, lanjutkan ke analisis detail

**LANGKAH 2: PEMERIKSAAN KUALITAS GAMBAR**
Evaluasi kualitas gambar sebelum analisis:
- Apakah gambar jelas dan tidak blur?
- Apakah pencahayaan cukup baik?
- Apakah seluruh atau sebagian besar semangka terlihat?
- Jika kualitas buruk → turunkan confidence ke <60%

**LANGKAH 3: ANALISIS INDIKATOR KEMATANGAN (Chain-of-Thought)**

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

**LANGKAH 4: PENILAIAN KEMANISAN**
Korelasikan dengan indikator kematangan:
- Field spot besar + kuning tua → sweetness 8-10
- Field spot sedang + cream → sweetness 6-8
- Field spot kecil + pucat → sweetness 4-6
- Tidak ada field spot jelas → sweetness 3-5
- Webbing banyak → tambah +1 sweetness
- Jenis kuning → umumnya lebih manis (+1)

**LANGKAH 5: IDENTIFIKASI JENIS**
- **merah**: Semangka merah standar (paling umum)
- **kuning**: Daging kuning/emas (lebih manis, kulit mirip merah)
- **mini**: Ukuran kecil (<3kg), bentuk bulat
- **inul**: Varietas lokal Indonesia, kulit hijau gelap, bentuk lonjong

**LANGKAH 6: KUALITAS KULIT**
- **baik**: Kulit mulus, tidak ada goresan, noda, atau kerusakan
- **sedang**: Ada sedikit goresan/noda kecil (tidak mempengaruhi isi)
- **kurang baik**: Banyak kerusakan, busuk, retak, atau penyakit

**LANGKAH 7: KALIBRASI CONFIDENCE**

Gunakan pedoman ini untuk menentukan confidence (0-100):

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

**LANGKAH 8: REASONING (Penjelasan)**

Format penjelasan Anda seperti ini:

1. **Observasi**: [Apa yang Anda lihat dari gambar]
2. **Indikator Positif**: [Tanda-tanda semangka matang]
3. **Indikator Negatif**: [Tanda-tanda belum matang, jika ada]
4. **Kesimpulan**: [Keputusan final dengan alasan kuat]
5. **Rekomendasi**: [Kapan panen atau tunggu berapa hari]

**CONTOH ANALISIS (Few-Shot Examples):**

**Contoh 1 - Semangka Matang:**
"Observasi: Semangka dengan field spot kuning tua berukuran besar (~12cm), tangkai terlihat kering dan coklat, kulit kusam dengan kontras garis hijau tua-terang yang jelas.

Indikator Positif: Field spot kuning tua (indikator kuat matang), tangkai kering (sudah siap panen), kulit kusam (tidak mengkilap), kontras garis tinggi, ada webbing di beberapa bagian.

Indikator Negatif: Tidak ada indikator negatif yang signifikan.

Kesimpulan: Semangka ini MATANG dan siap dipanen. Tingkat kepercayaan 95% karena semua indikator utama menunjukkan kematangan optimal.

Rekomendasi: Panen sekarang untuk kualitas terbaik. Jangan ditunda lebih dari 2-3 hari agar tidak overripe."

**Contoh 2 - Semangka Belum Matang:**
"Observasi: Semangka dengan field spot putih kekuningan pucat, kulit mengkilap, garis-garis hijau dengan kontras rendah.

Indikator Positif: Bentuk simetris dan baik, tidak ada kerusakan pada kulit.

Indikator Negatif: Field spot masih pucat (belum matang), kulit mengkilap (tanda muda), kontras garis rendah, tangkai tidak terlihat untuk konfirmasi.

Kesimpulan: Semangka ini BELUM MATANG. Tingkat kepercayaan 80% berdasarkan field spot pucat dan kulit mengkilap.

Rekomendasi: Tunggu 5-7 hari lagi. Periksa kembali saat field spot berubah menjadi kuning tua/cream dan kulit menjadi kusam."

**Contoh 3 - Confidence Rendah:**
"Observasi: Gambar agak gelap, hanya sebagian semangka terlihat, field spot tidak terlihat dalam frame.

Indikator Positif: Kulit terlihat kusam (mungkin matang).

Indikator Negatif: Tidak bisa melihat field spot (indikator paling penting), tangkai tidak terlihat, pencahayaan buruk.

Kesimpulan: Sulit menentukan kematangan dengan pasti. Tingkat kepercayaan hanya 45% karena indikator utama tidak terlihat.

Rekomendasi: Ambil foto ulang dengan pencahayaan lebih baik dan pastikan field spot (bagian bawah semangka) terlihat jelas dalam frame."

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
