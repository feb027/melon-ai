'use client';

import { AnalysisResult } from '@/components/analysis-result';
import type { AnalysisResult as AnalysisResultType } from '@/lib/types';

/**
 * Demo page untuk melihat komponen AnalysisResult
 * Akses di: http://localhost:3000/demo/analysis-result
 */
export default function AnalysisResultDemoPage() {
  // Sample data: Semangka Matang
  const sampleMatang: AnalysisResultType = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    userId: 'user-demo',
    imageUrl: 'https://placehold.co/800x600/22c55e/ffffff?text=Semangka+Matang+%F0%9F%8D%89',
    imageStoragePath: 'demo/watermelon-ripe.jpg',
    maturityStatus: 'Matang',
    confidence: 87.5,
    sweetnessLevel: 8,
    watermelonType: 'merah',
    skinQuality: 'baik',
    aiProvider: 'gemini',
    aiResponseTime: 2340,
    reasoning: `Berdasarkan analisis gambar, semangka ini menunjukkan tanda-tanda kematangan yang baik:

1. **Warna Kulit**: Kulit semangka memiliki warna hijau tua yang merata dengan garis-garis yang jelas, menandakan kematangan optimal.

2. **Field Spot (Bercak Kuning)**: Terdapat bercak kuning keemasan di bagian bawah semangka yang menunjukkan buah telah matang di pohon dengan sempurna.

3. **Kondisi Tangkai**: Tangkai terlihat mulai mengering, yang merupakan indikator alami bahwa semangka sudah siap dipanen.

4. **Tekstur Permukaan**: Permukaan kulit terlihat halus dan mengkilap, menandakan kandungan air yang baik dan tingkat kemanisan yang tinggi.

5. **Bentuk**: Semangka memiliki bentuk yang simetris dan proporsional, menunjukkan pertumbuhan yang sehat.

Kesimpulan: Semangka ini sudah matang dan siap untuk dikonsumsi dengan perkiraan tingkat kemanisan 8/10.`,
    metadata: {
      location: 'Kebun Semangka Makmur, Jawa Timur',
      batchId: 'BATCH-2024-001',
    },
    createdAt: new Date(),
  };

  // Sample data: Semangka Belum Matang
  const sampleBelumMatang: AnalysisResultType = {
    id: '123e4567-e89b-12d3-a456-426614174001',
    userId: 'user-demo',
    imageUrl: 'https://placehold.co/800x600/f97316/ffffff?text=Semangka+Belum+Matang+%F0%9F%8D%89',
    imageStoragePath: 'demo/watermelon-unripe.jpg',
    maturityStatus: 'Belum Matang',
    confidence: 92.3,
    sweetnessLevel: 4,
    watermelonType: 'merah',
    skinQuality: 'sedang',
    aiProvider: 'gpt4-vision',
    aiResponseTime: 3120,
    reasoning: `Analisis menunjukkan semangka ini belum mencapai kematangan optimal:

1. **Warna Kulit**: Kulit masih memiliki warna hijau muda yang dominan, belum mencapai warna hijau tua yang menandakan kematangan.

2. **Field Spot**: Bercak di bagian bawah masih berwarna putih atau hijau muda, belum berubah menjadi kuning keemasan.

3. **Kondisi Tangkai**: Tangkai masih terlihat segar dan hijau, menandakan buah masih dalam proses pematangan.

4. **Tekstur**: Permukaan kulit terlihat agak kusam, menunjukkan kandungan gula yang belum optimal.

Rekomendasi: Tunggu 3-5 hari lagi sebelum dipanen untuk hasil yang lebih manis.`,
    createdAt: new Date(),
  };

  // Sample data: Semangka Kuning
  const sampleKuning: AnalysisResultType = {
    id: '123e4567-e89b-12d3-a456-426614174002',
    userId: 'user-demo',
    imageUrl: 'https://placehold.co/800x600/eab308/ffffff?text=Semangka+Kuning+%F0%9F%8D%89',
    imageStoragePath: 'demo/watermelon-yellow.jpg',
    maturityStatus: 'Matang',
    confidence: 78.2,
    sweetnessLevel: 7,
    watermelonType: 'kuning',
    skinQuality: 'baik',
    aiProvider: 'claude',
    aiResponseTime: 2890,
    reasoning: `Semangka kuning ini menunjukkan karakteristik kematangan yang baik:

1. **Jenis**: Teridentifikasi sebagai semangka kuning berdasarkan pola kulit dan bentuk.

2. **Kematangan**: Warna kulit hijau dengan garis-garis yang kontras menunjukkan kematangan yang baik.

3. **Kemanisan**: Diperkirakan memiliki tingkat kemanisan 7/10, khas untuk semangka kuning yang cenderung lebih lembut dan manis.

4. **Kondisi**: Kulit dalam kondisi baik tanpa kerusakan atau bercak yang mencurigakan.`,
    metadata: {
      location: 'Pasar Buah Segar, Jakarta',
    },
    createdAt: new Date(),
  };

  const handleRetry = () => {
    alert('Tombol "Foto Lagi" diklik! Dalam aplikasi sebenarnya, ini akan membuka kamera.');
  };

  const handleFeedback = () => {
    alert('Tombol "Beri Feedback" diklik! Fitur ini akan diimplementasikan di Task 25.');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container py-6">
          <h1 className="text-3xl font-bold">Demo: Komponen Hasil Analisis</h1>
          <p className="text-muted-foreground mt-2">
            Halaman demo untuk melihat komponen AnalysisResult dengan berbagai contoh data
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container py-8 space-y-12">
        {/* Example 1: Matang */}
        <section>
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-green-600">
              Contoh 1: Semangka Matang
            </h2>
            <p className="text-muted-foreground">
              Status: Matang | Confidence: 87.5% | Kemanisan: 8/10
            </p>
          </div>
          <AnalysisResult
            result={sampleMatang}
            onRetry={handleRetry}
            onFeedback={handleFeedback}
          />
        </section>

        {/* Example 2: Belum Matang */}
        <section>
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-orange-600">
              Contoh 2: Semangka Belum Matang
            </h2>
            <p className="text-muted-foreground">
              Status: Belum Matang | Confidence: 92.3% | Kemanisan: 4/10
            </p>
          </div>
          <AnalysisResult
            result={sampleBelumMatang}
            onRetry={handleRetry}
            onFeedback={handleFeedback}
          />
        </section>

        {/* Example 3: Semangka Kuning */}
        <section>
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-yellow-600">
              Contoh 3: Semangka Kuning
            </h2>
            <p className="text-muted-foreground">
              Status: Matang | Confidence: 78.2% | Kemanisan: 7/10
            </p>
          </div>
          <AnalysisResult
            result={sampleKuning}
            onRetry={handleRetry}
            onFeedback={handleFeedback}
          />
        </section>

        {/* Example 4: Tanpa Callbacks (View Only) */}
        <section>
          <div className="mb-4">
            <h2 className="text-2xl font-bold">
              Contoh 4: Mode View Only (Tanpa Tombol)
            </h2>
            <p className="text-muted-foreground">
              Komponen tanpa callback onRetry dan onFeedback
            </p>
          </div>
          <AnalysisResult result={sampleMatang} />
        </section>
      </div>

      {/* Footer Info */}
      <div className="border-t bg-muted/50 mt-12">
        <div className="container py-6">
          <h3 className="font-semibold mb-2">Cara Menggunakan:</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Scroll untuk melihat berbagai contoh hasil analisis</li>
            <li>• Klik badge status untuk melihat warna yang berbeda</li>
            <li>• Klik "Lihat Penjelasan Detail" untuk membuka modal dengan reasoning lengkap</li>
            <li>• Klik "Foto Lagi" untuk test callback onRetry</li>
            <li>• Klik "Beri Feedback" untuk test callback onFeedback</li>
            <li>• Resize browser untuk test responsive design</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
