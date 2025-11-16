/**
 * Custom hook for watermelon analysis flow
 * 
 * Handles the complete analysis flow:
 * 1. Image upload to Supabase Storage
 * 2. AI analysis via API
 * 3. Result display with loading states
 * 4. Error handling with user-friendly messages
 * 
 * Features:
 * - Optimistic UI updates
 * - Loading states for each step
 * - Comprehensive error handling
 * - Toast notifications in Indonesian
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 10.1
 */

'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { AnalysisResult, AnalysisMetadata } from '@/lib/types';

// ============================================================================
// Types
// ============================================================================

interface AnalysisState {
  isUploading: boolean;
  isAnalyzing: boolean;
  uploadProgress: number;
  result: AnalysisResult | null;
  error: string | null;
}

interface UseAnalysisReturn {
  // State
  isUploading: boolean;
  isAnalyzing: boolean;
  isLoading: boolean;
  uploadProgress: number;
  result: AnalysisResult | null;
  error: string | null;
  
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
  });

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
    });

    try {
      // Step 1: Upload image
      toast.loading('Mengunggah gambar...', { id: 'analysis-flow' });
      
      const imageUrl = await uploadImage(imageBlob, userId);
      
      toast.loading('Menganalisis semangka...', { id: 'analysis-flow' });

      // Step 2: Analyze with AI
      const result = await analyzeImageWithAI(imageUrl, userId, metadata);

      // Step 3: Update state with result
      setState(prev => ({
        ...prev,
        result,
        error: null,
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

      setState(prev => ({
        ...prev,
        result: null,
        error: errorMessage,
      }));

      // Show error toast
      toast.error('Analisis gagal', {
        id: 'analysis-flow',
        description: errorMessage,
      });

      console.error('[useAnalysis] Error:', error);
    }
  }, [uploadImage, analyzeImageWithAI]);

  return {
    // State
    isUploading: state.isUploading,
    isAnalyzing: state.isAnalyzing,
    isLoading: state.isUploading || state.isAnalyzing,
    uploadProgress: state.uploadProgress,
    result: state.result,
    error: state.error,
    
    // Actions
    analyzeImage,
    reset,
  };
}
