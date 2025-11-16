/**
 * Example usage of useAnalysis hook
 * 
 * This file demonstrates how to use the useAnalysis hook
 * in different scenarios and components.
 */

'use client';

import React from 'react';
import { useAnalysis } from './use-analysis';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Camera, Loader2 } from 'lucide-react';

// ============================================================================
// Example 1: Basic Usage
// ============================================================================

export function BasicAnalysisExample() {
  const { analyzeImage, isLoading, result, error } = useAnalysis();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Convert File to Blob
    const blob = new Blob([await file.arrayBuffer()], { type: file.type });
    
    // Start analysis
    await analyzeImage(blob, 'user-123');
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileSelect} />
      
      {isLoading && <p>Menganalisis...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {result && (
        <div>
          <h3>Hasil Analisis</h3>
          <p>Status: {result.maturityStatus}</p>
          <p>Kepercayaan: {result.confidence}%</p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Example 2: With Loading States
// ============================================================================

export function AnalysisWithLoadingStates() {
  const {
    analyzeImage,
    isUploading,
    isAnalyzing,
    uploadProgress,
    result,
    error,
  } = useAnalysis();

  const handleAnalyze = async (imageBlob: Blob) => {
    await analyzeImage(imageBlob, 'user-123', {
      location: 'Kebun A',
      batchId: 'batch-001',
    });
  };

  return (
    <div className="space-y-4">
      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Mengunggah gambar...</span>
          </div>
          <Progress value={uploadProgress} />
          <p className="text-sm text-muted-foreground">{uploadProgress}%</p>
        </div>
      )}

      {/* Analysis Loading */}
      {isAnalyzing && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Menganalisis dengan AI...</span>
          </div>
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-16 w-3/4" />
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">{result.maturityStatus}</h3>
          <p className="text-sm text-muted-foreground">
            Tingkat kepercayaan: {result.confidence}%
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-destructive p-4 text-destructive">
          {error}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Example 3: With Camera Integration
// ============================================================================

export function AnalysisWithCamera() {
  const { analyzeImage, isLoading, result, reset } = useAnalysis();
  const [showCamera, setShowCamera] = React.useState(false);

  const handleCapture = async (imageBlob: Blob) => {
    setShowCamera(false);
    await analyzeImage(imageBlob, 'user-123');
  };

  const handleRetry = () => {
    reset();
    setShowCamera(true);
  };

  return (
    <div className="space-y-4">
      {!showCamera && !result && (
        <Button onClick={() => setShowCamera(true)} size="lg">
          <Camera className="mr-2 h-5 w-5" />
          Ambil Foto
        </Button>
      )}

      {showCamera && (
        <div>
          {/* Camera component would go here */}
          <p>Camera interface...</p>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Memproses...</span>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <h3 className="text-xl font-bold">{result.maturityStatus}</h3>
            <p>Tingkat Kemanisan: {result.sweetnessLevel}/10</p>
            <p>Jenis: {result.watermelonType}</p>
          </div>
          <Button onClick={handleRetry}>Foto Lagi</Button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Example 4: With Optimistic UI
// ============================================================================

export function AnalysisWithOptimisticUI() {
  const { analyzeImage, isLoading, result } = useAnalysis();
  const [optimisticResult, setOptimisticResult] = React.useState<any>(null);

  const handleAnalyze = async (imageBlob: Blob) => {
    // Show optimistic result immediately
    setOptimisticResult({
      maturityStatus: 'Menganalisis...',
      confidence: 0,
    });

    // Perform actual analysis
    await analyzeImage(imageBlob, 'user-123');
    
    // Clear optimistic result
    setOptimisticResult(null);
  };

  const displayResult = result || optimisticResult;

  return (
    <div>
      {displayResult && (
        <div className={isLoading ? 'opacity-50' : ''}>
          <h3>{displayResult.maturityStatus}</h3>
          {displayResult.confidence > 0 && (
            <p>Kepercayaan: {displayResult.confidence}%</p>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Example 5: Error Handling
// ============================================================================

export function AnalysisWithErrorHandling() {
  const { analyzeImage, isLoading, result, error, reset } = useAnalysis();

  const handleAnalyze = async (imageBlob: Blob) => {
    try {
      await analyzeImage(imageBlob, 'user-123');
    } catch (err) {
      // Error is already handled by the hook and shown in toast
      console.error('Analysis failed:', err);
    }
  };

  const handleRetry = () => {
    reset();
    // Trigger new analysis
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <h4 className="font-semibold text-destructive">Terjadi Kesalahan</h4>
          <p className="text-sm text-destructive/80">{error}</p>
          <Button onClick={handleRetry} variant="outline" className="mt-2">
            Coba Lagi
          </Button>
        </div>
      )}

      {isLoading && <p>Memproses...</p>}
      
      {result && (
        <div className="rounded-lg border border-green-500 bg-green-50 p-4">
          <h4 className="font-semibold text-green-700">Analisis Berhasil</h4>
          <p className="text-sm">{result.maturityStatus}</p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Example 6: Multiple Analyses (Quick Succession)
// ============================================================================

export function MultipleAnalysesExample() {
  const { analyzeImage, isLoading, result, reset } = useAnalysis();
  const [history, setHistory] = React.useState<any[]>([]);

  const handleAnalyze = async (imageBlob: Blob) => {
    await analyzeImage(imageBlob, 'user-123');
  };

  // Save result to history when analysis completes
  React.useEffect(() => {
    if (result && !isLoading) {
      setHistory(prev => [result, ...prev].slice(0, 10)); // Keep last 10
      reset(); // Reset for next analysis
    }
  }, [result, isLoading, reset]);

  return (
    <div className="space-y-4">
      <Button onClick={() => {/* trigger camera */}}>
        Foto Lagi
      </Button>

      {isLoading && <p>Menganalisis...</p>}

      <div className="space-y-2">
        <h3 className="font-semibold">Riwayat Analisis</h3>
        {history.map((item, index) => (
          <div key={index} className="rounded border p-2">
            <p className="text-sm">{item.maturityStatus}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(item.createdAt).toLocaleTimeString('id-ID')}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Hook API Reference
// ============================================================================

/**
 * useAnalysis Hook API
 * 
 * State:
 * - isUploading: boolean - True when uploading image to storage
 * - isAnalyzing: boolean - True when analyzing with AI
 * - isLoading: boolean - True when either uploading or analyzing
 * - uploadProgress: number - Upload progress (0-100)
 * - result: AnalysisResult | null - Analysis result when complete
 * - error: string | null - Error message if analysis fails
 * 
 * Actions:
 * - analyzeImage(imageBlob, userId, metadata?) - Start analysis flow
 * - reset() - Reset all state to initial values
 * 
 * Usage:
 * ```typescript
 * const { analyzeImage, isLoading, result } = useAnalysis();
 * 
 * // Start analysis
 * await analyzeImage(imageBlob, 'user-123', {
 *   location: 'Kebun A',
 *   batchId: 'batch-001',
 * });
 * 
 * // Check loading state
 * if (isLoading) {
 *   return <Loader />;
 * }
 * 
 * // Display result
 * if (result) {
 *   return <AnalysisResult result={result} />;
 * }
 * ```
 * 
 * Toast Notifications:
 * - Loading: "Mengunggah gambar..." → "Menganalisis semangka..."
 * - Success: "Analisis selesai!" with result summary
 * - Error: "Analisis gagal" with error message
 * 
 * Error Handling:
 * - Network errors: "Gagal mengunggah gambar"
 * - AI errors: "Gagal menganalisis gambar"
 * - All errors are shown via toast and stored in error state
 * 
 * Requirements Covered:
 * - 1.1: Camera capture and image upload
 * - 1.2: AI analysis with cloud processing
 * - 1.3: Result display with confidence
 * - 1.4: Error handling with user-friendly messages
 * - 2.1: Display analysis results
 * - 10.1: Quick re-analysis flow
 */
