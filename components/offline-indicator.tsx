'use client';

import { useEffect, useState } from 'react';
import { WifiOff, Wifi, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useOfflineSync } from '@/lib/hooks/use-offline-sync';

interface OfflineIndicatorProps {
  className?: string;
}

/**
 * OfflineIndicator component displays network status and offline queue information
 * 
 * Features:
 * - Real-time network status detection
 * - Persistent banner when offline
 * - Queue counter badge for pending uploads
 * - Sync status with animation
 * - User-friendly messages in Indonesian
 * - Automatic sync when connection is restored
 * - Manual sync trigger button
 */
export function OfflineIndicator({ className }: OfflineIndicatorProps) {
  const { isOnline, isSyncing, queueCount, syncQueue } = useOfflineSync();
  const [showSyncSuccess, setShowSyncSuccess] = useState(false);
  const [prevQueueCount, setPrevQueueCount] = useState(queueCount);

  // Show success message when queue is cleared
  useEffect(() => {
    if (prevQueueCount > 0 && queueCount === 0 && isOnline) {
      setShowSyncSuccess(true);
      setTimeout(() => setShowSyncSuccess(false), 3000);
    }
    setPrevQueueCount(queueCount);
  }, [queueCount, isOnline, prevQueueCount]);

  // Don't show anything if online and no queue
  if (isOnline && queueCount === 0 && !showSyncSuccess) {
    return null;
  }

  return (
    <div className={cn('fixed top-0 left-0 right-0 z-50', className)}>
      {/* Offline Banner */}
      {!isOnline && (
        <Alert
          variant="destructive"
          className="rounded-none border-x-0 border-t-0 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800"
        >
          <WifiOff className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          <AlertDescription className="flex items-center justify-between gap-2">
            <span className="text-orange-900 dark:text-orange-100">
              Anda sedang offline. Foto akan diunggah saat koneksi kembali.
            </span>
            {queueCount > 0 && (
              <Badge
                variant="secondary"
                className="bg-orange-100 dark:bg-orange-900 text-orange-900 dark:text-orange-100 border-orange-300 dark:border-orange-700"
              >
                {queueCount} foto menunggu
              </Badge>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Syncing Banner */}
      {isOnline && isSyncing && queueCount > 0 && (
        <Alert className="rounded-none border-x-0 border-t-0 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <RefreshCw className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-spin" />
          <AlertDescription className="flex items-center justify-between gap-2">
            <span className="text-blue-900 dark:text-blue-100">
              Mengunggah foto...
            </span>
            <Badge
              variant="secondary"
              className="bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 border-blue-300 dark:border-blue-700"
            >
              {queueCount} tersisa
            </Badge>
          </AlertDescription>
        </Alert>
      )}

      {/* Queue Pending Banner (Online but not syncing) */}
      {isOnline && !isSyncing && queueCount > 0 && !showSyncSuccess && (
        <Alert className="rounded-none border-x-0 border-t-0 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
          <Wifi className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <AlertDescription className="flex items-center justify-between gap-2">
            <span className="text-yellow-900 dark:text-yellow-100">
              Koneksi tersedia. Ada foto yang belum diunggah.
            </span>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="bg-yellow-100 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100 border-yellow-300 dark:border-yellow-700"
              >
                {queueCount} foto
              </Badge>
              <button
                onClick={syncQueue}
                className="text-xs font-medium text-yellow-900 dark:text-yellow-100 hover:underline focus:outline-none focus:ring-2 focus:ring-yellow-500 rounded px-2 py-1"
                aria-label="Sinkronkan sekarang"
              >
                Sinkronkan
              </button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Sync Success Banner */}
      {showSyncSuccess && (
        <Alert className="rounded-none border-x-0 border-t-0 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-900 dark:text-green-100">
            Sinkronisasi berhasil! Semua foto telah diunggah.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

/**
 * Hook to detect online/offline status
 * Returns current online status
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
