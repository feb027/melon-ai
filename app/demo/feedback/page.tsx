'use client';

import { useState } from 'react';
import { AnalysisResult } from '@/components/analysis-result';
import type { AnalysisResult as AnalysisResultType } from '@/lib/types';

/**
 * Feedback Demo Page
 * 
 * Demonstrates the feedback system functionality
 * Task 25: Implement feedback system
 */
export default function FeedbackDemoPage() {
  // Mock analysis result for demo
  const mockResult: AnalysisResultType = {
    id: '231a402e-1a7e-4966-8c68-03df82b6bacb',
    userId: null, // No user authentication required
    imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784acc?w=800&q=80',
    imageStoragePath: 'demo/watermelon.jpg',
    maturityStatus: 'Matang',
    confidence: 87.5,
    sweetnessLevel: 8,
    watermelonType: 'merah',
    skinQuality: 'baik',
    aiProvider: 'gemini',
    aiResponseTime: 2340,
    reasoning: `Berdasarkan analisis gambar semangka:

1. **Warna Kulit**: Kulit semangka menunjukkan warna hijau tua yang merata dengan garis-garis yang jelas, menandakan kematangan yang baik.

2. **Field Spot**: Terdapat bercak kuning kecoklatan di bagian bawah semangka yang cukup besar dan berwarna gelap, ini adalah indikator kuat bahwa semangka sudah matang.

3. **Tekstur Permukaan**: Permukaan kulit terlihat halus dan mengkilap, menunjukkan kondisi yang segar dan matang.

4. **Bentuk**: Semangka memiliki bentuk yang simetris dan proporsional, menandakan pertumbuhan yang baik.

Kesimpulan: Semangka ini sudah matang dan siap untuk dikonsumsi dengan tingkat kemanisan yang tinggi.`,
    metadata: {
      location: 'Kebun Demo',
      batchId: 'DEMO-001',
    },
    createdAt: new Date(),
  };

  const [showResult, setShowResult] = useState(true);

  const handleRetry = () => {
    console.log('Retry analysis');
    setShowResult(false);
    setTimeout(() => setShowResult(true), 500);
  };

  const handleFeedback = () => {
    console.log('Feedback callback triggered');
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Demo: Feedback System</h1>
          <p className="text-muted-foreground">
            Task 25: Implement feedback system untuk AI accuracy
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-muted/50 rounded-lg p-6 space-y-3">
          <h2 className="font-semibold text-lg">Cara Menggunakan:</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Klik tombol "Beri Feedback" di bawah hasil analisis</li>
            <li>Pilih apakah hasil analisis "Sesuai" atau "Tidak Sesuai"</li>
            <li>Jika tidak sesuai, pilih kondisi sebenarnya (Matang/Belum Matang)</li>
            <li>Tambahkan catatan opsional (maksimal 200 karakter)</li>
            <li>Klik "Kirim Feedback" untuk menyimpan</li>
            <li>Feedback akan disimpan ke database Supabase</li>
          </ol>
        </div>

        {/* Analysis Result with Feedback */}
        {showResult && (
          <AnalysisResult
            result={mockResult}
            onRetry={handleRetry}
            onFeedback={handleFeedback}
          />
        )}

        {/* Technical Details */}
        <div className="bg-muted/50 rounded-lg p-6 space-y-3">
          <h2 className="font-semibold text-lg">Technical Details:</h2>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li>
              <strong>API Endpoint:</strong> POST /api/feedback
            </li>
            <li>
              <strong>Database Table:</strong> feedbacks (Supabase PostgreSQL)
            </li>
            <li>
              <strong>Components:</strong> FeedbackDialog (shadcn/ui Dialog, Textarea, Label)
            </li>
            <li>
              <strong>Validation:</strong> Zod schema (max 200 chars for notes)
            </li>
            <li>
              <strong>Features:</strong> Duplicate prevention, thank you message, auto-close
            </li>
            <li>
              <strong>Requirements:</strong> 7.1, 7.2, 7.3, 7.4, 7.5
            </li>
          </ul>
        </div>

        {/* Database Schema */}
        <div className="bg-muted/50 rounded-lg p-6 space-y-3">
          <h2 className="font-semibold text-lg">Database Schema (feedbacks):</h2>
          <pre className="text-xs bg-background p-4 rounded overflow-x-auto">
{`CREATE TABLE feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES analyses(id),
  user_id UUID NOT NULL REFERENCES users(id),
  is_accurate BOOLEAN NOT NULL,
  notes TEXT,
  actual_maturity TEXT CHECK (actual_maturity IN ('Matang', 'Belum Matang')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);`}
          </pre>
        </div>
      </div>
    </div>
  );
}
