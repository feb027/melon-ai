'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CameraCapture } from '@/components/camera-capture';
import { useToast } from '@/hooks/use-toast';
import type { AppError } from '@/lib/types';

/**
 * Camera Page
 * 
 * Provides camera interface for capturing watermelon images.
 * Handles image capture and navigation to analysis.
 */
export default function CameraPage() {
  const router = useRouter();
  const { toast } = useToast();

  /**
   * Handle successful image capture
   */
  const handleCapture = (imageBlob: Blob) => {
    
    // Show success toast
    toast({
      title: 'Foto berhasil diambil!',
      description: 'Memproses gambar...',
    });

    // TODO: Navigate to analysis page or upload image
    // For now, just log the image size
    console.log('Image captured:', {
      size: imageBlob.size,
      type: imageBlob.type,
      sizeInMB: (imageBlob.size / (1024 * 1024)).toFixed(2),
    });

    // In the future, this will:
    // 1. Upload image to Supabase Storage
    // 2. Call AI analysis API
    // 3. Navigate to results page
  };

  /**
   * Handle camera errors
   */
  const handleError = (error: AppError) => {
    toast({
      variant: 'destructive',
      title: 'Terjadi kesalahan',
      description: error.userMessage,
    });
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background border-b shrink-0">
        <div className="flex items-center gap-4 h-14 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            aria-label="Kembali"
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-base sm:text-lg font-semibold truncate">Ambil Foto Semangka</h1>
        </div>
      </header>

      {/* Camera Component - Full height minus header */}
      <main className="flex-1 overflow-hidden px-4 py-4 sm:py-6">
        <CameraCapture onCapture={handleCapture} onError={handleError} />
      </main>
    </div>
  );
}
