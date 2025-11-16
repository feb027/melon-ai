/**
 * Analysis Flow Demo Page
 * 
 * Demonstrates the complete analysis flow:
 * - Camera capture
 * - Image upload with progress
 * - AI analysis with loading states
 * - Result display
 * - Error handling with toast notifications
 * 
 * This page integrates:
 * - CameraCapture component
 * - useAnalysis hook
 * - AnalysisResult component
 * - Loading states (Skeleton, Progress)
 * - Toast notifications (Sonner)
 */

'use client';

import { useState } from 'react';
import { CameraCapture } from '@/components/camera-capture';
import { AnalysisResult } from '@/components/analysis-result';
import { useAnalysis } from '@/lib/hooks/use-analysis';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Camera, Loader2, RotateCcw } from 'lucide-react';

export default function AnalysisFlowDemo() {
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  const {
    isUploading,
    isAnalyzing,
    isLoading,
    uploadProgress,
    result,
    error,
    analyzeImage,
    reset,
  } = useAnalysis();

  // Mock user ID (in production, get from auth)
  // Using a valid UUID format for demo
  const userId = '00000000-0000-0000-0000-000000000001';

  const handleCapture = async (imageBlob: Blob) => {
    // Create preview URL
    const previewUrl = URL.createObjectURL(imageBlob);
    setCapturedImage(previewUrl);
    setShowCamera(false);

    // Start analysis
    await analyzeImage(imageBlob, userId, {
      location: 'Demo Location',
      deviceInfo: navigator.userAgent,
    });
  };

  const handleRetry = () => {
    reset();
    setCapturedImage(null);
    setShowCamera(true);
  };

  const handleReset = () => {
    reset();
    setCapturedImage(null);
    setShowCamera(false);
  };

  return (
    <div className="container mx-auto max-w-4xl p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Demo Alur Analisis</h1>
        <p className="text-muted-foreground">
          Demonstrasi lengkap: Kamera → Upload → Analisis AI → Hasil
        </p>
      </div>

      {/* Main Content */}
      {!showCamera && !capturedImage && !result && (
        <Card>
          <CardHeader>
            <CardTitle>Mulai Analisis</CardTitle>
            <CardDescription>
              Ambil foto semangka untuk memulai analisis kematangan
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button
              size="lg"
              onClick={() => setShowCamera(true)}
              className="min-h-16 min-w-16"
            >
              <Camera className="mr-2 h-6 w-6" />
              Buka Kamera
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Camera Interface */}
      {showCamera && (
        <Card>
          <CardHeader>
            <CardTitle>Ambil Foto Semangka</CardTitle>
            <CardDescription>
              Posisikan semangka di tengah frame dan pastikan pencahayaan cukup
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CameraCapture
              onCapture={handleCapture}
              onError={(error) => {
                console.error('Camera error:', error);
                setShowCamera(false);
              }}
            />
            <div className="mt-4 flex justify-center">
              <Button
                variant="outline"
                onClick={() => setShowCamera(false)}
              >
                Batal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading States */}
      {isLoading && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              {isUploading ? 'Mengunggah Gambar...' : 'Menganalisis Semangka...'}
            </CardTitle>
            <CardDescription>
              {isUploading 
                ? 'Mohon tunggu, gambar sedang diunggah ke server'
                : 'AI sedang menganalisis kematangan dan kualitas semangka'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Image Preview */}
            {capturedImage && (
              <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                <img
                  src={capturedImage}
                  alt="Captured watermelon"
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            {/* Upload Progress */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress Upload</span>
                  <span className="font-medium">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}

            {/* Analysis Loading Skeleton */}
            {isAnalyzing && (
              <div className="space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-6 w-2/3" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Analysis Result */}
      {result && !isLoading && (
        <div className="space-y-4">
          <AnalysisResult result={result} onRetry={handleRetry} />
          
          <div className="flex justify-center gap-4">
            <Button onClick={handleRetry} size="lg">
              <Camera className="mr-2 h-5 w-5" />
              Foto Lagi
            </Button>
            <Button onClick={handleReset} variant="outline" size="lg">
              <RotateCcw className="mr-2 h-5 w-5" />
              Reset
            </Button>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Analisis Gagal</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center gap-4">
            <Button onClick={handleRetry}>
              <RotateCcw className="mr-2 h-5 w-5" />
              Coba Lagi
            </Button>
            <Button onClick={handleReset} variant="outline">
              Kembali
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Debug Info */}
      <Card className="bg-muted">
        <CardHeader>
          <CardTitle className="text-sm">Status Debug</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-1">
          <div className="flex justify-between">
            <span>Kamera Aktif:</span>
            <span className="font-mono">{showCamera ? 'Ya' : 'Tidak'}</span>
          </div>
          <div className="flex justify-between">
            <span>Gambar Tertangkap:</span>
            <span className="font-mono">{capturedImage ? 'Ya' : 'Tidak'}</span>
          </div>
          <div className="flex justify-between">
            <span>Sedang Upload:</span>
            <span className="font-mono">{isUploading ? 'Ya' : 'Tidak'}</span>
          </div>
          <div className="flex justify-between">
            <span>Progress Upload:</span>
            <span className="font-mono">{uploadProgress}%</span>
          </div>
          <div className="flex justify-between">
            <span>Sedang Analisis:</span>
            <span className="font-mono">{isAnalyzing ? 'Ya' : 'Tidak'}</span>
          </div>
          <div className="flex justify-between">
            <span>Hasil Tersedia:</span>
            <span className="font-mono">{result ? 'Ya' : 'Tidak'}</span>
          </div>
          <div className="flex justify-between">
            <span>Error:</span>
            <span className="font-mono">{error ? 'Ya' : 'Tidak'}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
