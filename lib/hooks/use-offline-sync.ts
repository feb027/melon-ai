/**
 * Offline Sync Hook
 * 
 * React hook that integrates sync manager with toast notifications
 * and provides real-time sync status updates
 * 
 * Features:
 * - Automatic sync when connection is restored
 * - Real-time queue count updates
 * - Toast notifications for sync progress
 * - Manual sync trigger
 * - Network status detection
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { getSyncManager, type SyncStatus } from '@/lib/offline/sync';
import { getQueueCount } from '@/lib/offline/db';

export interface UseOfflineSyncReturn {
  isOnline: boolean;
  isSyncing: boolean;
  queueCount: number;
  syncStatus: SyncStatus;
  syncQueue: () => Promise<void>;
  refreshQueueCount: () => Promise<void>;
}

/**
 * Hook to manage offline sync with toast notifications
 * 
 * @returns Sync state and control functions
 */
export function useOfflineSync(): UseOfflineSyncReturn {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [queueCount, setQueueCount] = useState(0);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');

  // Get sync manager instance
  const syncManager = getSyncManager();

  /**
   * Refresh queue count from IndexedDB
   */
  const refreshQueueCount = useCallback(async () => {
    try {
      const count = await getQueueCount();
      setQueueCount(count);
    } catch (error) {
      console.error('[useOfflineSync] Failed to get queue count:', error);
    }
  }, []);

  /**
   * Manually trigger sync
   */
  const syncQueue = useCallback(async () => {
    if (!isOnline) {
      toast.error('Tidak ada koneksi internet', {
        description: 'Mohon periksa koneksi internet Anda.',
      });
      return;
    }

    if (isSyncing) {
      toast.info('Sinkronisasi sedang berlangsung', {
        description: 'Mohon tunggu hingga selesai.',
      });
      return;
    }

    try {
      const result = await syncManager.syncQueue();

      if (result.success) {
        if (result.uploaded > 0) {
          toast.success('Sinkronisasi berhasil!', {
            description: `${result.uploaded} foto berhasil diunggah.`,
          });
        }
      } else {
        if (result.uploaded > 0) {
          toast.warning('Sinkronisasi sebagian berhasil', {
            description: `${result.uploaded} berhasil, ${result.failed} gagal.`,
          });
        } else {
          toast.error('Sinkronisasi gagal', {
            description: 'Tidak ada foto yang berhasil diunggah.',
          });
        }
      }

      // Refresh queue count after sync
      await refreshQueueCount();
    } catch (error) {
      console.error('[useOfflineSync] Sync error:', error);
      toast.error('Terjadi kesalahan', {
        description: 'Gagal melakukan sinkronisasi.',
      });
    }
  }, [isOnline, isSyncing, syncManager, refreshQueueCount]);

  /**
   * Set up sync event listener
   */
  useEffect(() => {
    const unsubscribe = syncManager.onSyncEvent((event) => {
      setSyncStatus(event.status);
      setQueueCount(event.queueCount);

      // Update syncing state
      setIsSyncing(event.status === 'syncing');

      // Show toast notifications for status changes
      if (event.status === 'success' && event.message) {
        toast.success('Sinkronisasi berhasil!', {
          description: event.message,
        });
      } else if (event.status === 'error' && event.message) {
        toast.error('Sinkronisasi gagal', {
          description: event.message,
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [syncManager]);

  /**
   * Set up network status listener
   */
  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = navigator.onLine;
      setIsOnline(online);

      if (online) {
        toast.success('Koneksi tersedia', {
          description: 'Sinkronisasi otomatis akan dimulai.',
        });
      } else {
        toast.warning('Koneksi terputus', {
          description: 'Foto akan diunggah saat koneksi kembali.',
        });
      }
    };

    // Set initial status
    setIsOnline(navigator.onLine);

    // Listen for network changes
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  /**
   * Start auto-sync when component mounts
   */
  useEffect(() => {
    syncManager.startAutoSync();

    // Initial queue count
    refreshQueueCount();

    return () => {
      // Don't stop auto-sync on unmount - let it run globally
      // syncManager.stopAutoSync();
    };
  }, [syncManager, refreshQueueCount]);

  /**
   * Refresh queue count periodically
   */
  useEffect(() => {
    const interval = setInterval(() => {
      refreshQueueCount();
    }, 5000); // Every 5 seconds

    return () => {
      clearInterval(interval);
    };
  }, [refreshQueueCount]);

  return {
    isOnline,
    isSyncing,
    queueCount,
    syncStatus,
    syncQueue,
    refreshQueueCount,
  };
}
