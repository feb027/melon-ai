/**
 * IndexedDB wrapper using Dexie.js for offline queue management
 * 
 * This module provides a type-safe interface for managing offline image uploads
 * when the user is disconnected from the internet. Images are stored locally
 * and automatically synced when connection is restored.
 */

import Dexie, { type EntityTable } from 'dexie';

/**
 * Offline queue item status
 */
export type QueueStatus = 'pending' | 'uploading' | 'failed';

/**
 * Offline queue item interface
 * Represents an image waiting to be uploaded to the cloud
 */
export interface OfflineQueueItem {
  id?: string; // Auto-generated UUID
  imageBlob: Blob; // The actual image data
  userId: string; // User who captured the image
  metadata?: {
    location?: string;
    batchId?: string;
    deviceInfo?: string;
  };
  timestamp: Date; // When the image was captured
  status: QueueStatus; // Current upload status
  retryCount: number; // Number of upload attempts
  lastError?: string; // Last error message if failed
  createdAt: Date; // When added to queue
  updatedAt: Date; // Last status update
}

/**
 * Dexie database class for offline queue management
 */
class OfflineDatabase extends Dexie {
  // Typed table for offline queue items
  offlineQueue!: EntityTable<OfflineQueueItem, 'id'>;

  constructor() {
    super('MelonAI_OfflineDB');

    // Define database schema
    // Version 1: Initial schema with offline_queue table
    this.version(1).stores({
      // Primary key: id (auto-generated)
      // Indexes: status, timestamp, userId for efficient queries
      offlineQueue: '++id, status, timestamp, userId, createdAt',
    });
  }
}

// Create singleton database instance
export const offlineDb = new OfflineDatabase();

/**
 * Queue Management Functions
 */

/**
 * Add a new item to the offline queue
 * @param item - Queue item without id (will be auto-generated)
 * @returns The generated id of the new queue item
 */
export async function addToQueue(
  item: Omit<OfflineQueueItem, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const now = new Date();
  const queueItem: Omit<OfflineQueueItem, 'id'> = {
    ...item,
    createdAt: now,
    updatedAt: now,
  };

  const id = await offlineDb.offlineQueue.add(queueItem as OfflineQueueItem);
  return id as string;
}

/**
 * Get a single queue item by id
 * @param id - Queue item id
 * @returns The queue item or undefined if not found
 */
export async function getQueueItem(
  id: string
): Promise<OfflineQueueItem | undefined> {
  return await offlineDb.offlineQueue.get(id);
}

/**
 * Get all queue items
 * @returns Array of all queue items, ordered by timestamp (oldest first)
 */
export async function getAllQueueItems(): Promise<OfflineQueueItem[]> {
  return await offlineDb.offlineQueue.orderBy('timestamp').toArray();
}

/**
 * Get queue items by status
 * @param status - Filter by status (pending, uploading, failed)
 * @returns Array of queue items with the specified status
 */
export async function getQueueItemsByStatus(
  status: QueueStatus
): Promise<OfflineQueueItem[]> {
  return await offlineDb.offlineQueue
    .where('status')
    .equals(status)
    .sortBy('timestamp');
}

/**
 * Get pending queue items (ready to upload)
 * @returns Array of pending queue items
 */
export async function getPendingQueueItems(): Promise<OfflineQueueItem[]> {
  return await getQueueItemsByStatus('pending');
}

/**
 * Get failed queue items (need retry)
 * @returns Array of failed queue items
 */
export async function getFailedQueueItems(): Promise<OfflineQueueItem[]> {
  return await getQueueItemsByStatus('failed');
}

/**
 * Get queue count by status
 * @param status - Optional status filter
 * @returns Number of items in queue
 */
export async function getQueueCount(status?: QueueStatus): Promise<number> {
  if (status) {
    return await offlineDb.offlineQueue.where('status').equals(status).count();
  }
  return await offlineDb.offlineQueue.count();
}

/**
 * Update queue item status
 * @param id - Queue item id
 * @param status - New status
 * @param error - Optional error message if status is 'failed'
 */
export async function updateQueueItemStatus(
  id: string,
  status: QueueStatus,
  error?: string
): Promise<void> {
  const updates: Partial<OfflineQueueItem> = {
    status,
    updatedAt: new Date(),
  };

  if (error) {
    updates.lastError = error;
  }

  // Increment retry count if status is 'failed'
  if (status === 'failed') {
    const item = await getQueueItem(id);
    if (item) {
      updates.retryCount = item.retryCount + 1;
    }
  }

  await offlineDb.offlineQueue.update(id, updates);
}

/**
 * Remove a queue item by id
 * @param id - Queue item id
 */
export async function removeQueueItem(id: string): Promise<void> {
  await offlineDb.offlineQueue.delete(id);
}

/**
 * Remove multiple queue items by ids
 * @param ids - Array of queue item ids
 */
export async function removeQueueItems(ids: string[]): Promise<void> {
  await offlineDb.offlineQueue.bulkDelete(ids);
}

/**
 * Clear all queue items
 * WARNING: This will delete all offline queue data
 */
export async function clearQueue(): Promise<void> {
  await offlineDb.offlineQueue.clear();
}

/**
 * Clear completed items (successfully uploaded)
 * This removes items that are no longer in the queue
 * (items are removed after successful upload, so this is for cleanup)
 */
export async function clearOldItems(olderThanDays: number = 7): Promise<void> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

  await offlineDb.offlineQueue
    .where('createdAt')
    .below(cutoffDate)
    .delete();
}

/**
 * Get queue statistics
 * @returns Object with queue statistics
 */
export async function getQueueStats(): Promise<{
  total: number;
  pending: number;
  uploading: number;
  failed: number;
  oldestItem?: Date;
  newestItem?: Date;
}> {
  const [total, pending, uploading, failed, items] = await Promise.all([
    getQueueCount(),
    getQueueCount('pending'),
    getQueueCount('uploading'),
    getQueueCount('failed'),
    getAllQueueItems(),
  ]);

  return {
    total,
    pending,
    uploading,
    failed,
    oldestItem: items[0]?.timestamp,
    newestItem: items[items.length - 1]?.timestamp,
  };
}

/**
 * Reset failed items to pending (for retry)
 * @param maxRetries - Optional max retry count filter
 */
export async function resetFailedItems(maxRetries?: number): Promise<number> {
  let query = offlineDb.offlineQueue.where('status').equals('failed');

  if (maxRetries !== undefined) {
    const items = await query.toArray();
    const itemsToReset = items.filter((item) => item.retryCount < maxRetries);
    const ids = itemsToReset.map((item) => item.id!);

    await Promise.all(
      ids.map((id) => updateQueueItemStatus(id, 'pending'))
    );

    return ids.length;
  }

  const count = await query.count();
  await query.modify({ status: 'pending', updatedAt: new Date() });
  return count;
}

/**
 * Export queue data (for debugging or backup)
 * @returns JSON string of all queue items
 */
export async function exportQueueData(): Promise<string> {
  const items = await getAllQueueItems();
  // Convert Blob to base64 for JSON serialization
  const serializedItems = await Promise.all(
    items.map(async (item) => ({
      ...item,
      imageBlob: await blobToBase64(item.imageBlob),
    }))
  );
  return JSON.stringify(serializedItems, null, 2);
}

/**
 * Helper function to convert Blob to base64
 */
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Database health check
 * @returns true if database is accessible
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await offlineDb.offlineQueue.count();
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}
