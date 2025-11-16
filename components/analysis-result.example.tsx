/**
 * Example usage of AnalysisResult component
 * 
 * This file demonstrates how to use the AnalysisResult component
 * with sample data. This is for development/testing purposes only.
 */

import { AnalysisResult } from './analysis-result';
import type { AnalysisResult as AnalysisResultType } from '@/lib/types';

// Sample analysis result data
const sampleResult: AnalysisResultType = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  userId: 'user-123',
  imageUrl: '/sample-watermelon.jpg',
  imageStoragePath: 'user-123/1234567890-watermelon.jpg',
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

// Example with "Belum Matang" status
const sampleUnripeResult: AnalysisResultType = {
  id: '123e4567-e89b-12d3-a456-426614174001',
  userId: 'user-123',
  imageUrl: '/sample-watermelon-unripe.jpg',
  imageStoragePath: 'user-123/1234567891-watermelon.jpg',
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

// Example component usage
export function AnalysisResultExample() {
  const handleRetry = () => {
    console.log('Retry button clicked - open camera');
  };

  const handleFeedback = () => {
    console.log('Feedback button clicked');
  };

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Contoh: Semangka Matang</h2>
        <AnalysisResult
          result={sampleResult}
          onRetry={handleRetry}
          onFeedback={handleFeedback}
        />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Contoh: Semangka Belum Matang</h2>
        <AnalysisResult
          result={sampleUnripeResult}
          onRetry={handleRetry}
          onFeedback={handleFeedback}
        />
      </div>
    </div>
  );
}
