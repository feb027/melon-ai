'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useOfflineSync } from '@/lib/hooks/use-offline-sync';
import { addToQueue } from '@/lib/offline/db';
import type { CameraComponentProps, AppError } from '@/lib/types';

/**
 * Camera Capture Component
 * 
 * Provides device camera access with live preview, image capture,
 * and automatic compression. Handles all camera-related errors
 * with user-friendly messages in Indonesian.
 * 
 * Features:
 * - Live camera preview with guidance overlay
 * - Image capture with loading state
 * - Automatic image compression (max 2MB)
 * - Error handling (permission denied, no camera, etc.)
 * - Visual feedback for successful capture
 * - Offline mode support with IndexedDB queue
 * - Automatic sync when connection is restored
 * 
 * Requirements: 1.1, 1.2, 1.3, 5.1, 5.2, 5.3, 5.4, 5.5, 8.2
 */
export function CameraCapture({ onCapture, onError }: CameraComponentProps) {
  // Offline sync hook
  const { isOnline, refreshQueueCount } = useOfflineSync();
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCaptured, setIsCaptured] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /**
   * Request camera permission and start video stream
   */
  const startCamera = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if page is served over HTTPS (required for camera access on mobile)
      const isSecureContext = window.isSecureContext || window.location.protocol === 'https:';
      if (!isSecureContext && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        const err: AppError = {
          type: 'CAMERA_ACCESS_DENIED',
          message: 'HTTPS required for camera access',
          userMessage: 'Akses kamera memerlukan koneksi HTTPS yang aman. Silakan akses aplikasi melalui HTTPS atau gunakan ngrok/tunneling untuk testing.',
          retryable: false,
        };
        setError(err);
        onError(err);
        return;
      }

      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        const err: AppError = {
          type: 'CAMERA_ACCESS_DENIED',
          message: 'getUserMedia not supported',
          userMessage: 'Browser Anda tidak mendukung akses kamera. Gunakan browser modern seperti Chrome atau Safari.',
          retryable: false,
        };
        setError(err);
        onError(err);
        return;
      }

      // Request camera access with mobile-optimized constraints
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      setStream(mediaStream);
      setPermissionState('granted');

      // Attach stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      
      let appError: AppError;
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          appError = {
            type: 'CAMERA_ACCESS_DENIED',
            message: err.message,
            userMessage: 'Akses kamera ditolak. Mohon izinkan akses kamera di pengaturan browser Anda.',
            retryable: true,
            action: startCamera,
          };
          setPermissionState('denied');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          appError = {
            type: 'CAMERA_ACCESS_DENIED',
            message: err.message,
            userMessage: 'Kamera tidak ditemukan. Pastikan perangkat Anda memiliki kamera.',
            retryable: false,
          };
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          appError = {
            type: 'CAMERA_ACCESS_DENIED',
            message: err.message,
            userMessage: 'Kamera sedang digunakan oleh aplikasi lain. Tutup aplikasi lain dan coba lagi.',
            retryable: true,
            action: startCamera,
          };
        } else {
          appError = {
            type: 'UNKNOWN_ERROR',
            message: err.message,
            userMessage: 'Terjadi kesalahan saat mengakses kamera. Silakan coba lagi.',
            retryable: true,
            action: startCamera,
          };
        }
      } else {
        appError = {
          type: 'UNKNOWN_ERROR',
          message: 'Unknown error',
          userMessage: 'Terjadi kesalahan yang tidak diketahui. Silakan coba lagi.',
          retryable: true,
          action: startCamera,
        };
      }
      
      setError(appError);
      onError(appError);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Stop camera stream and release resources
   */
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  /**
   * Compress image to max 2MB using Canvas API
   */
  const compressImage = async (blob: Blob): Promise<Blob> => {
    const MAX_SIZE = 2 * 1024 * 1024; // 2MB
    
    if (blob.size <= MAX_SIZE) {
      return blob;
    }

    // Calculate compression quality needed
    let quality = 0.9;
    const ratio = MAX_SIZE / blob.size;
    if (ratio < 0.5) {
      quality = 0.7;
    } else if (ratio < 0.8) {
      quality = 0.8;
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob(
          (compressedBlob) => {
            if (compressedBlob) {
              // If still too large, reduce dimensions
              if (compressedBlob.size > MAX_SIZE) {
                const scale = Math.sqrt(MAX_SIZE / compressedBlob.size);
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                canvas.toBlob(
                  (finalBlob) => {
                    resolve(finalBlob || blob);
                  },
                  'image/jpeg',
                  0.7
                );
              } else {
                resolve(compressedBlob);
              }
            } else {
              resolve(blob);
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(blob);
    });
  };

  /**
   * Capture photo from video stream
   * Handles both online and offline modes
   */
  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    try {
      setIsLoading(true);
      setError(null);

      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => {
            if (b) resolve(b);
            else reject(new Error('Failed to create blob'));
          },
          'image/jpeg',
          0.95
        );
      });

      // Compress image if needed
      const compressedBlob = await compressImage(blob);

      // Show success feedback
      setIsCaptured(true);
      setTimeout(() => setIsCaptured(false), 1000);

      // Check if offline - save to IndexedDB queue
      if (!isOnline) {
        console.log('[CameraCapture] Offline mode: saving to queue');
        
        // Add to offline queue
        await addToQueue({
          imageBlob: compressedBlob,
          userId: 'default-user', // TODO: Get from auth context
          metadata: {
            deviceInfo: navigator.userAgent,
          },
          timestamp: new Date(),
          status: 'pending',
          retryCount: 0,
        });

        // Refresh queue count
        await refreshQueueCount();

        // Show offline notification
        const offlineError: AppError = {
          type: 'NETWORK_ERROR',
          message: 'Offline mode',
          userMessage: 'Foto disimpan. Akan diunggah saat koneksi tersedia.',
          retryable: false,
        };
        
        setError(offlineError);
        
        // Still call onCapture for UI updates
        onCapture(compressedBlob);
      } else {
        // Online mode - proceed normally
        onCapture(compressedBlob);
      }
    } catch (err) {
      console.error('Capture error:', err);
      
      const appError: AppError = {
        type: 'UNKNOWN_ERROR',
        message: err instanceof Error ? err.message : 'Unknown error',
        userMessage: 'Gagal mengambil foto. Silakan coba lagi.',
        retryable: true,
        action: capturePhoto,
      };
      
      setError(appError);
      onError(appError);
    } finally {
      setIsLoading(false);
    }
  };

  // Start camera on mount
  useEffect(() => {
    startCamera();
    
    // Cleanup on unmount
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col gap-4">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="shrink-0">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {error.userMessage}
            {error.retryable && error.action && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2 w-full"
                onClick={error.action}
              >
                Coba Lagi
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Camera Preview */}
      <div className="relative flex-1 bg-black rounded-lg overflow-hidden min-h-0">
        {/* Video Element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        {/* Hidden Canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Guidance Overlay */}
        {stream && !isCaptured && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Center guide frame */}
            <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-8">
              <div className="w-full max-w-sm sm:max-w-md aspect-square border-2 border-white/50 rounded-lg">
                {/* Corner markers */}
                <div className="relative w-full h-full">
                  <div className="absolute top-0 left-0 w-6 h-6 sm:w-8 sm:h-8 border-t-4 border-l-4 border-primary" />
                  <div className="absolute top-0 right-0 w-6 h-6 sm:w-8 sm:h-8 border-t-4 border-r-4 border-primary" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 sm:w-8 sm:h-8 border-b-4 border-l-4 border-primary" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 sm:w-8 sm:h-8 border-b-4 border-r-4 border-primary" />
                </div>
              </div>
            </div>

            {/* Instruction text */}
            <div className="absolute bottom-20 sm:bottom-24 left-0 right-0 text-center px-4">
              <p className="text-white text-xs sm:text-sm font-medium bg-black/50 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full inline-block">
                Posisikan semangka di dalam bingkai
              </p>
            </div>
          </div>
        )}

        {/* Success Feedback */}
        {isCaptured && (
          <div className="absolute inset-0 bg-white/20 flex items-center justify-center">
            <div className="bg-primary rounded-full p-4">
              <CheckCircle2 className="h-12 w-12 text-white" />
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && !stream && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 text-white animate-spin mx-auto" />
              <p className="text-white text-sm">Membuka kamera...</p>
            </div>
          </div>
        )}

        {/* No Camera State */}
        {!stream && !isLoading && permissionState === 'denied' && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-8">
            <div className="text-center space-y-4">
              <Camera className="h-16 w-16 text-white/50 mx-auto" />
              <p className="text-white text-sm">
                Akses kamera diperlukan untuk mengambil foto
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Capture Button */}
      {stream && (
        <div className="shrink-0 flex justify-center items-center pb-safe">
          <Button
            size="lg"
            className="min-h-16 min-w-16 sm:min-h-20 sm:min-w-20 rounded-full shadow-lg"
            onClick={capturePhoto}
            disabled={isLoading || isCaptured}
            aria-label="Ambil foto"
          >
            {isLoading ? (
              <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin" />
            ) : (
              <Camera className="h-6 w-6 sm:h-8 sm:w-8" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
