/**
 * Custom hook for watermelon analysis flow
 * 
 * Handles the complete analysis flow:
 * 1. Image upload to Supabase Storage
 * 2. AI analysis via API
 * 3. Result display with loading states
 * 4. Error handling with user-friendly messages
 * 5. Offline mode support with IndexedDB queue
 * 
 * Features:
 * - Optimistic UI updates
 * - Loading states for each step
 * - Comprehensive error handling
 * - Toast notifications in Indonesian
 * - Offline queue management
 * - Automatic sync when online
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 5.1, 5.2, 5.3, 5.4, 5.5, 10.1
 */

'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { addToQueue } from '@/lib/offline/db';
import { useOfflineSync } from '@/lib/hooks/use-offline-sync';
import type { AnalysisResult, AnalysisMetadata } from '@/lib/types';

// ============================================================================
// Types
// ============================================================================

type AnalysisStage = 
  | 'idle'
  | 'validating-image'
  | 'uploading'
  | 'checking-watermelon'
  | 'analyzing-ripeness'
  | 'complete'
  | 'error';

interface AnalysisState {
  isUploading: boolean;
  isAnalyzing: boolean;
  uploadProgress: number;
  result: AnalysisResult | null;
  error: string | null;
  stage: AnalysisStage;
  stageMessage: string;
}

interface UseAnalysisReturn {
  // State
  isUploading: boolean;
  isAnalyzing: boolean;
  isLoading: boolean;
  uploadProgress: number;
  result: AnalysisResult | null;
  error: string | null;
  stage: AnalysisStage;
  stageMessage: string;
  
  // Actions
  analyzeImage: (imageBlob: Blob, userId: string, metadata?: AnalysisMetadata) => Promise<void>;
  reset: () => void;
}

// ============================================================================
// Hook
// ============================================================================

export function useAnalysis(): UseAnalysisReturn {
  const [state, setState] = useState<AnalysisState>({
    isUploading: false,
    isAnalyzing: false,
    uploadProgress: 0,
    result: null,
    error: null,
    stage: 'idle',
    stageMessage: '',
  });

  // Get offline sync status
  const { isOnline, refreshQueueCount } = useOfflineSync();

  /**
   * Update analysis stage with message
   */
  const updateStage = useCallback((stage: AnalysisStage, message: string) => {
    setState(prev => ({
      ...prev,
      stage,
      stageMessage: message,
    }));
  }, []);

  /**
   * Reset analysis state
   */
  const reset = useCallback(() => {
    setState({
      isUploading: false,
      isAnalyzing: false,
      uploadProgress: 0,
      result: null,
      error: null,
      stage: 'idle',
      stageMessage: '',
    });
  }, []);

  /**
   * Upload image to Supabase Storage
   */
  const uploadImage = useCallback(async (
    imageBlob: Blob,
    userId: string
  ): Promise<string> => {
    // Create form data
    const formData = new FormData();
    formData.append('file', imageBlob, 'watermelon.jpg');
    formData.append('userId', userId);

    // Upload with progress tracking
    setState(prev => ({ ...prev, isUploading: true, uploadProgress: 0 }));

    try {
      // Simulate progress (since fetch doesn't support upload progress)
      const progressInterval = setInterval(() => {
        setState(prev => ({
          ...prev,
          uploadProgress: Math.min(prev.uploadProgress + 10, 90),
        }));
      }, 200);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setState(prev => ({ ...prev, uploadProgress: 100 }));

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Gagal mengunggah gambar');
      }

      const data = await response.json();
      
      if (!data.success || !data.data?.url) {
        throw new Error('Gagal mendapatkan URL gambar');
      }

      return data.data.url;
    } finally {
      setState(prev => ({ ...prev, isUploading: false }));
    }
  }, []);

  /**
   * Analyze image using AI
   */
  const analyzeImageWithAI = useCallback(async (
    imageUrl: string,
    userId: string,
    metadata?: AnalysisMetadata
  ): Promise<AnalysisResult> => {
    setState(prev => ({ ...prev, isAnalyzing: true }));

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl,
          userId,
          metadata,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Check if it's a NOT_A_WATERMELON error
        if (errorData.error?.code === 'NOT_A_WATERMELON') {
          const detectedObject = errorData.error.detectedObject || 'Objek tidak dikenali';
          throw new Error(`Bukan semangka! Terdeteksi: ${detectedObject}`);
        }
        
        throw new Error(errorData.error?.message || 'Gagal menganalisis gambar');
      }

      const data = await response.json();
      
      if (!data.success || !data.data) {
        throw new Error('Gagal mendapatkan hasil analisis');
      }

      return data.data;
    } finally {
      setState(prev => ({ ...prev, isAnalyzing: false }));
    }
  }, []);

  /**
   * Complete analysis flow: upload → analyze → display result
   * Handles both online and offline modes with progressive feedback
   */
  const analyzeImage = useCallback(async (
    imageBlob: Blob,
    userId: string,
    metadata?: AnalysisMetadata
  ): Promise<void> => {
    // Reset previous state
    setState({
      isUploading: false,
      isAnalyzing: false,
      uploadProgress: 0,
      result: null,
      error: null,
      stage: 'idle',
      stageMessage: '',
    });

    // Check if offline
    if (!isOnline) {
      console.log('[useAnalysis] Offline mode: saving to queue');
      
      try {
        // Add to offline queue
        await addToQueue({
          imageBlob,
          userId,
          metadata,
          timestamp: new Date(),
          status: 'pending',
          retryCount: 0,
        });

        // Refresh queue count
        await refreshQueueCount();

        // Show offline notification
        toast.info('Mode offline', {
          description: 'Foto disimpan dan akan diunggah saat koneksi tersedia.',
          duration: 5000,
        });

        // Set error state to show offline message
        setState(prev => ({
          ...prev,
          error: 'Foto disimpan dalam antrian offline',
          stage: 'error',
          stageMessage: 'Mode offline',
        }));

        return;
      } catch (error) {
        console.error('[useAnalysis] Failed to save to queue:', error);
        
        toast.error('Gagal menyimpan foto', {
          description: 'Tidak dapat menyimpan foto ke antrian offline.',
        });

        setState(prev => ({
          ...prev,
          error: 'Gagal menyimpan foto ke antrian offline',
          stage: 'error',
          stageMessage: 'Gagal menyimpan',
        }));

        return;
      }
    }

    // Online mode - proceed with normal flow with progressive feedback
    try {
      // Stage 1: Validating image
      updateStage('validating-image', 'Memvalidasi gambar...');
      toast.loading('Memvalidasi gambar...', { id: 'analysis-flow' });
      
      // Simulate validation delay (in real implementation, add actual validation)
      await new Promise(resolve => setTimeout(resolve, 300));

      // Stage 2: Upload image
      updateStage('uploading', 'Mengunggah gambar...');
      toast.loading('Mengunggah gambar...', { id: 'analysis-flow' });
      
      const imageUrl = await uploadImage(imageBlob, userId);
      
      // Stage 3: Checking if watermelon
      updateStage('checking-watermelon', 'Memeriksa objek...');
      toast.loading('Memeriksa apakah semangka...', { id: 'analysis-flow' });
      
      // Small delay for UX
      await new Promise(resolve => setTimeout(resolve, 200));

      // Stage 4: Analyze ripeness with AI
      updateStage('analyzing-ripeness', 'Menganalisis kematangan...');
      toast.loading('Menganalisis kematangan...', { id: 'analysis-flow' });

      const result = await analyzeImageWithAI(imageUrl, userId, metadata);

      // Stage 5: Complete
      updateStage('complete', 'Analisis selesai!');
      
      setState(prev => ({
        ...prev,
        result,
        error: null,
        stage: 'complete',
        stageMessage: 'Analisis selesai!',
      }));

      // Show success toast
      toast.success('Analisis selesai!', {
        id: 'analysis-flow',
        description: `Semangka ${result.maturityStatus.toLowerCase()} dengan tingkat kepercayaan ${result.confidence}%`,
      });

    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Terjadi kesalahan saat menganalisis gambar';

      updateStage('error', errorMessage);
      
      setState(prev => ({
        ...prev,
        result: null,
        error: errorMessage,
        stage: 'error',
        stageMessage: errorMessage,
      }));

      // Show error toast
      toast.error('Analisis gagal', {
        id: 'analysis-flow',
        description: errorMessage,
      });

      console.error('[useAnalysis] Error:', error);
    }
  }, [isOnline, uploadImage, analyzeImageWithAI, refreshQueueCount, updateStage]);

  return {
    // State
    isUploading: state.isUploading,
    isAnalyzing: state.isAnalyzing,
    isLoading: state.isUploading || state.isAnalyzing,
    uploadProgress: state.uploadProgress,
    result: state.result,
    error: state.error,
    stage: state.stage,
    stageMessage: state.stageMessage,
    
    // Actions
    analyzeImage,
    reset,
  };
}
