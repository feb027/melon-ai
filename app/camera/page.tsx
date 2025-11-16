'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Camera as CameraIcon, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CameraCapture } from '@/components/camera-capture';
import { AnalysisResult } from '@/components/analysis-result';
import { useAnalysis } from '@/lib/hooks/use-analysis';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import type { AppError } from '@/lib/types';

/**
 * Camera Page
 * 
 * Main application page for watermelon analysis.
 * Integrates camera capture, AI analysis, and result display.
 */
export default function CameraPage() {
  const router = useRouter();
  const [showCamera, setShowCamera] = useState(true);
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

  /**
   * Handle successful image capture
   */
  const handleCapture = async (imageBlob: Blob) => {
    // Create preview URL
    const previewUrl = URL.createObjectURL(imageBlob);
    setCapturedImage(previewUrl);
    setShowCamera(false);

    // Start analysis (no userId needed for demo)
    await analyzeImage(imageBlob, '', {
      deviceInfo: navigator.userAgent,
    });
  };

  /**
   * Handle camera errors
   */
  const handleError = (error: AppError) => {
    console.error('Camera error:', error);
  };

  /**
   * Retry analysis with new photo
   */
  const handleRetry = () => {
    reset();
    setCapturedImage(null);
    setShowCamera(true);
  };

  /**
   * Go back to home
   */
  const handleBack = () => {
    if (isLoading) return; // Prevent navigation during analysis
    router.push('/');
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b shrink-0">
        <div className="flex items-center gap-4 h-14 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            aria-label="Kembali"
            className="shrink-0"
            disabled={isLoading}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-base sm:text-lg font-semibold truncate">
            {showCamera ? 'Ambil Foto Semangka' : 'Hasil Analisis'}
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto px-4 py-4 sm:py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Camera Interface */}
          {showCamera && !isLoading && !result && (
            <CameraCapture onCapture={handleCapture} onError={handleError} />
          )}

          {/* Loading States */}
          {isLoading && (
            <div className="space-y-4">
              {/* Image Preview */}
              {capturedImage && (
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
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
                    <span className="font-medium">Mengunggah gambar...</span>
                    <span className="text-muted-foreground">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}

              {/* Analysis Loading */}
              {isAnalyzing && (
                <div className="space-y-4">
                  <p className="text-center font-medium">Menganalisis dengan AI...</p>
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-20" />
                    <Skeleton className="h-20" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Analysis Result */}
          {result && !isLoading && (
            <div className="space-y-4">
              <AnalysisResult result={result} onRetry={handleRetry} />
              
              <div className="flex justify-center gap-4">
                <Button onClick={handleRetry} size="lg">
                  <CameraIcon className="mr-2 h-5 w-5" />
                  Foto Lagi
                </Button>
                <Button onClick={handleBack} variant="outline" size="lg">
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Kembali
                </Button>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="space-y-4 text-center">
              <div className="rounded-lg border border-destructive bg-destructive/10 p-6">
                <h3 className="font-semibold text-destructive mb-2">Analisis Gagal</h3>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
              
              <div className="flex justify-center gap-4">
                <Button onClick={handleRetry}>
                  <RotateCcw className="mr-2 h-5 w-5" />
                  Coba Lagi
                </Button>
                <Button onClick={handleBack} variant="outline">
                  Kembali
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
