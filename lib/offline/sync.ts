/**
 * Offline Sync Mechanism
 * 
 * This module handles automatic synchronization of offline queue items
 * when network connection is restored. Features include:
 * - Network status detection using navigator.onLine
 * - Automatic sync when connection is restored
 * - Retry logic with exponential backoff
 * - Real-time queue status updates
 * - Toast notifications for sync progress
 * - Graceful error handling
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */

import {
  getPendingQueueItems,
  getFailedQueueItems,
  updateQueueItemStatus,
  removeQueueItem,
  type OfflineQueueItem,
} from './db';

/**
 * Sync status type
 */
export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

/**
 * Sync result interface
 */
export interface SyncResult {
  success: boolean;
  uploaded: number;
  failed: number;
  errors: Array<{ id: string; error: string }>;
}

/**
 * Sync event callback type
 */
export type SyncEventCallback = (event: {
  status: SyncStatus;
  queueCount: number;
  message?: string;
}) => void;

/**
 * Exponential backoff configuration
 */
const BACKOFF_CONFIG = {
  initialDelay: 1000, // 1 second
  maxDelay: 60000, // 60 seconds
  multiplier: 2,
  maxRetries: 5,
};

/**
 * Sync manager class
 * Handles automatic synchronization of offline queue
 */
export class SyncManager {
  private isOnline: boolean = true;
  private isSyncing: boolean = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private eventCallbacks: Set<SyncEventCallback> = new Set();
  private retryTimeouts: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    // Initialize online status
    if (typeof window !== 'undefined') {
      this.isOnline = navigator.onLine;
      this.setupNetworkListeners();
    }
  }

  /**
   * Set up network status listeners
   * Automatically triggers sync when connection is restored
   */
  private setupNetworkListeners(): void {
    const handleOnline = () => {
      console.log('[SyncManager] Network connection restored');
      this.isOnline = true;
      this.notifyListeners('idle', 0, 'Koneksi internet tersedia');
      
      // Automatically start sync when coming back online
      this.startAutoSync();
    };

    const handleOffline = () => {
      console.log('[SyncManager] Network connection lost');
      this.isOnline = false;
      this.notifyListeners('idle', 0, 'Koneksi internet terputus');
      
      // Stop auto sync when going offline
      this.stopAutoSync();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
  }

  /**
   * Check if currently online
   */
  public isNetworkOnline(): boolean {
    return this.isOnline;
  }

  /**
   * Check if currently syncing
   */
  public isSyncInProgress(): boolean {
    return this.isSyncing;
  }

  /**
   * Subscribe to sync events
   * @param callback - Function to call when sync status changes
   * @returns Unsubscribe function
   */
  public onSyncEvent(callback: SyncEventCallback): () => void {
    this.eventCallbacks.add(callback);
    return () => {
      this.eventCallbacks.delete(callback);
    };
  }

  /**
   * Notify all listeners of sync status change
   */
  private notifyListeners(
    status: SyncStatus,
    queueCount: number,
    message?: string
  ): void {
    this.eventCallbacks.forEach((callback) => {
      callback({ status, queueCount, message });
    });
  }

  /**
   * Start automatic sync
   * Checks for pending items every 30 seconds
   */
  public startAutoSync(): void {
    if (this.syncInterval) {
      return; // Already running
    }

    console.log('[SyncManager] Starting auto-sync');

    // Immediate sync
    this.syncQueue();

    // Set up periodic sync (every 30 seconds)
    this.syncInterval = setInterval(() => {
      if (this.isOnline && !this.isSyncing) {
        this.syncQueue();
      }
    }, 30000);
  }

  /**
   * Stop automatic sync
   */
  public stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('[SyncManager] Auto-sync stopped');
    }
  }

  /**
   * Manually trigger sync
   * @returns Sync result
   */
  public async syncQueue(): Promise<SyncResult> {
    // Check if online
    if (!this.isOnline) {
      console.log('[SyncManager] Cannot sync: offline');
      return {
        success: false,
        uploaded: 0,
        failed: 0,
        errors: [{ id: 'network', error: 'Tidak ada koneksi internet' }],
      };
    }

    // Check if already syncing
    if (this.isSyncing) {
      console.log('[SyncManager] Sync already in progress');
      return {
        success: false,
        uploaded: 0,
        failed: 0,
        errors: [{ id: 'sync', error: 'Sinkronisasi sedang berlangsung' }],
      };
    }

    try {
      this.isSyncing = true;

      // Get pending and failed items
      const [pendingItems, failedItems] = await Promise.all([
        getPendingQueueItems(),
        getFailedQueueItems(),
      ]);

      // Combine items, prioritizing pending over failed
      const itemsToSync = [...pendingItems, ...failedItems];

      if (itemsToSync.length === 0) {
        console.log('[SyncManager] No items to sync');
        this.isSyncing = false;
        return {
          success: true,
          uploaded: 0,
          failed: 0,
          errors: [],
        };
      }

      console.log(`[SyncManager] Starting sync of ${itemsToSync.length} items`);
      this.notifyListeners('syncing', itemsToSync.length, 'Mengunggah foto...');

      // Sync items one by one
      let uploaded = 0;
      let failed = 0;
      const errors: Array<{ id: string; error: string }> = [];

      for (const item of itemsToSync) {
        try {
          await this.syncItem(item);
          uploaded++;
          
          // Notify progress
          const remaining = itemsToSync.length - uploaded - failed;
          this.notifyListeners('syncing', remaining, `${uploaded} foto berhasil diunggah`);
        } catch (error) {
          failed++;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          errors.push({ id: item.id!, error: errorMessage });
          
          console.error(`[SyncManager] Failed to sync item ${item.id}:`, error);
        }
      }

      // Notify completion
      if (failed === 0) {
        console.log(`[SyncManager] ✓ Sync completed: ${uploaded} uploaded`);
        this.notifyListeners('success', 0, `${uploaded} foto berhasil diunggah`);
      } else {
        console.log(`[SyncManager] Sync completed with errors: ${uploaded} uploaded, ${failed} failed`);
        this.notifyListeners('error', failed, `${uploaded} berhasil, ${failed} gagal`);
      }

      this.isSyncing = false;

      return {
        success: failed === 0,
        uploaded,
        failed,
        errors,
      };
    } catch (error) {
      console.error('[SyncManager] Sync error:', error);
      this.isSyncing = false;
      this.notifyListeners('error', 0, 'Gagal melakukan sinkronisasi');
      
      return {
        success: false,
        uploaded: 0,
        failed: 0,
        errors: [{ id: 'sync', error: error instanceof Error ? error.message : 'Unknown error' }],
      };
    }
  }

  /**
   * Sync a single queue item
   * @param item - Queue item to sync
   */
  private async syncItem(item: OfflineQueueItem): Promise<void> {
    const itemId = item.id!;

    // Check retry limit
    if (item.retryCount >= BACKOFF_CONFIG.maxRetries) {
      console.log(`[SyncManager] Item ${itemId} exceeded max retries`);
      throw new Error(`Maksimal ${BACKOFF_CONFIG.maxRetries} percobaan tercapai`);
    }

    // Update status to uploading
    await updateQueueItemStatus(itemId, 'uploading');

    try {
      // Step 1: Upload image
      const uploadResult = await this.uploadImage(item);

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Upload gagal');
      }

      // Step 2: Analyze image
      const analyzeResult = await this.analyzeImage(uploadResult.url!, item);

      if (!analyzeResult.success) {
        throw new Error(analyzeResult.error || 'Analisis gagal');
      }

      // Success - remove from queue
      await removeQueueItem(itemId);
      console.log(`[SyncManager] ✓ Item ${itemId} synced successfully`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Update status to failed
      await updateQueueItemStatus(itemId, 'failed', errorMessage);

      // Schedule retry with exponential backoff
      this.scheduleRetry(item);

      throw error;
    }
  }

  /**
   * Upload image to server
   * @param item - Queue item with image blob
   * @returns Upload result with URL
   */
  private async uploadImage(item: OfflineQueueItem): Promise<{
    success: boolean;
    url?: string;
    error?: string;
  }> {
    try {
      const formData = new FormData();
      formData.append('file', item.imageBlob);
      formData.append('userId', item.userId);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        return {
          success: false,
          error: result.error?.message || 'Upload gagal',
        };
      }

      return {
        success: true,
        url: result.data.url,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Analyze uploaded image
   * @param imageUrl - URL of uploaded image
   * @param item - Queue item with metadata
   * @returns Analysis result
   */
  private async analyzeImage(
    imageUrl: string,
    item: OfflineQueueItem
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl,
          userId: item.userId,
          metadata: item.metadata,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        return {
          success: false,
          error: result.error?.message || 'Analisis gagal',
        };
      }

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Schedule retry with exponential backoff
   * @param item - Queue item to retry
   */
  private scheduleRetry(item: OfflineQueueItem): void {
    const itemId = item.id!;

    // Clear existing timeout if any
    const existingTimeout = this.retryTimeouts.get(itemId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Calculate delay with exponential backoff
    const delay = Math.min(
      BACKOFF_CONFIG.initialDelay * Math.pow(BACKOFF_CONFIG.multiplier, item.retryCount),
      BACKOFF_CONFIG.maxDelay
    );

    console.log(`[SyncManager] Scheduling retry for item ${itemId} in ${delay}ms (attempt ${item.retryCount + 1})`);

    // Schedule retry
    const timeout = setTimeout(async () => {
      this.retryTimeouts.delete(itemId);

      // Only retry if online
      if (this.isOnline && !this.isSyncing) {
        try {
          // Reset status to pending for retry
          await updateQueueItemStatus(itemId, 'pending');
          
          // Trigger sync
          await this.syncQueue();
        } catch (error) {
          console.error(`[SyncManager] Retry failed for item ${itemId}:`, error);
        }
      }
    }, delay);

    this.retryTimeouts.set(itemId, timeout);
  }

  /**
   * Clear all retry timeouts
   */
  public clearRetryTimeouts(): void {
    this.retryTimeouts.forEach((timeout) => clearTimeout(timeout));
    this.retryTimeouts.clear();
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    this.stopAutoSync();
    this.clearRetryTimeouts();
    this.eventCallbacks.clear();
  }
}

/**
 * Global sync manager instance
 */
let syncManagerInstance: SyncManager | null = null;

/**
 * Get or create sync manager instance
 * @returns Sync manager instance
 */
export function getSyncManager(): SyncManager {
  if (!syncManagerInstance) {
    syncManagerInstance = new SyncManager();
  }
  return syncManagerInstance;
}

/**
 * Hook to use sync manager in React components
 * @returns Sync manager instance and helper functions
 */
export function useSyncManager() {
  if (typeof window === 'undefined') {
    // Server-side: return mock
    return {
      syncManager: null,
      isOnline: true,
      isSyncing: false,
      syncQueue: async () => ({ success: false, uploaded: 0, failed: 0, errors: [] }),
      startAutoSync: () => {},
      stopAutoSync: () => {},
    };
  }

  const syncManager = getSyncManager();

  return {
    syncManager,
    isOnline: syncManager.isNetworkOnline(),
    isSyncing: syncManager.isSyncInProgress(),
    syncQueue: () => syncManager.syncQueue(),
    startAutoSync: () => syncManager.startAutoSync(),
    stopAutoSync: () => syncManager.stopAutoSync(),
  };
}
