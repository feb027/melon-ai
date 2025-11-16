/**
 * Unit tests for Offline Queue Database
 * Tests IndexedDB operations for offline queue management
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  addToQueue,
  getQueueItem,
  getAllQueueItems,
  getQueueItemsByStatus,
  getPendingQueueItems,
  getFailedQueueItems,
  getQueueCount,
  updateQueueItemStatus,
  removeQueueItem,
  clearQueue,
  getQueueStats,
  resetFailedItems,
  checkDatabaseHealth,
  type OfflineQueueItem,
} from './db';

describe.skip('Offline Queue Database', () => {
  // Skipped: IndexedDB tests require a browser environment with IndexedDB support
  // jsdom doesn't provide IndexedDB API
  // These tests should be run in a browser environment using Playwright or similar
  
  // Clean up database before each test
  beforeEach(async () => {
    await clearQueue();
  });

  afterEach(async () => {
    await clearQueue();
  });

  describe('addToQueue', () => {
    it('should add item to queue with auto-generated id', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/jpeg' });
      const item = {
        imageBlob: mockBlob,
        userId: 'user-123',
        timestamp: new Date(),
        status: 'pending' as const,
        retryCount: 0,
      };

      const id = await addToQueue(item);

      expect(id).toBeDefined();
      expect(typeof id).toBe('string');

      const retrieved = await getQueueItem(id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.userId).toBe('user-123');
      expect(retrieved?.status).toBe('pending');
    });

    it('should add item with metadata', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/jpeg' });
      const item = {
        imageBlob: mockBlob,
        userId: 'user-123',
        metadata: {
          location: 'Kebun A',
          batchId: 'batch-001',
        },
        timestamp: new Date(),
        status: 'pending' as const,
        retryCount: 0,
      };

      const id = await addToQueue(item);
      const retrieved = await getQueueItem(id);

      expect(retrieved?.metadata?.location).toBe('Kebun A');
      expect(retrieved?.metadata?.batchId).toBe('batch-001');
    });
  });

  describe('getQueueItem', () => {
    it('should return undefined for non-existent id', async () => {
      const item = await getQueueItem('non-existent-id');
      expect(item).toBeUndefined();
    });

    it('should retrieve item by id', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/jpeg' });
      const id = await addToQueue({
        imageBlob: mockBlob,
        userId: 'user-123',
        timestamp: new Date(),
        status: 'pending' as const,
        retryCount: 0,
      });

      const item = await getQueueItem(id);
      expect(item).toBeDefined();
      expect(item?.id).toBe(id);
    });
  });

  describe('getAllQueueItems', () => {
    it('should return empty array when queue is empty', async () => {
      const items = await getAllQueueItems();
      expect(items).toEqual([]);
    });

    it('should return all items ordered by timestamp', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/jpeg' });
      const now = new Date();

      // Add items with different timestamps
      await addToQueue({
        imageBlob: mockBlob,
        userId: 'user-1',
        timestamp: new Date(now.getTime() + 2000),
        status: 'pending' as const,
        retryCount: 0,
      });

      await addToQueue({
        imageBlob: mockBlob,
        userId: 'user-2',
        timestamp: new Date(now.getTime() + 1000),
        status: 'pending' as const,
        retryCount: 0,
      });

      await addToQueue({
        imageBlob: mockBlob,
        userId: 'user-3',
        timestamp: now,
        status: 'pending' as const,
        retryCount: 0,
      });

      const items = await getAllQueueItems();
      expect(items).toHaveLength(3);
      // Should be ordered by timestamp (oldest first)
      expect(items[0].userId).toBe('user-3');
      expect(items[1].userId).toBe('user-2');
      expect(items[2].userId).toBe('user-1');
    });
  });

  describe('getQueueItemsByStatus', () => {
    it('should filter items by status', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/jpeg' });

      await addToQueue({
        imageBlob: mockBlob,
        userId: 'user-1',
        timestamp: new Date(),
        status: 'pending' as const,
        retryCount: 0,
      });

      await addToQueue({
        imageBlob: mockBlob,
        userId: 'user-2',
        timestamp: new Date(),
        status: 'failed' as const,
        retryCount: 1,
      });

      await addToQueue({
        imageBlob: mockBlob,
        userId: 'user-3',
        timestamp: new Date(),
        status: 'pending' as const,
        retryCount: 0,
      });

      const pendingItems = await getQueueItemsByStatus('pending');
      const failedItems = await getQueueItemsByStatus('failed');

      expect(pendingItems).toHaveLength(2);
      expect(failedItems).toHaveLength(1);
      expect(failedItems[0].userId).toBe('user-2');
    });
  });

  describe('getPendingQueueItems', () => {
    it('should return only pending items', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/jpeg' });

      await addToQueue({
        imageBlob: mockBlob,
        userId: 'user-1',
        timestamp: new Date(),
        status: 'pending' as const,
        retryCount: 0,
      });

      await addToQueue({
        imageBlob: mockBlob,
        userId: 'user-2',
        timestamp: new Date(),
        status: 'uploading' as const,
        retryCount: 0,
      });

      const items = await getPendingQueueItems();
      expect(items).toHaveLength(1);
      expect(items[0].status).toBe('pending');
    });
  });

  describe('getFailedQueueItems', () => {
    it('should return only failed items', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/jpeg' });

      await addToQueue({
        imageBlob: mockBlob,
        userId: 'user-1',
        timestamp: new Date(),
        status: 'failed' as const,
        retryCount: 2,
      });

      await addToQueue({
        imageBlob: mockBlob,
        userId: 'user-2',
        timestamp: new Date(),
        status: 'pending' as const,
        retryCount: 0,
      });

      const items = await getFailedQueueItems();
      expect(items).toHaveLength(1);
      expect(items[0].status).toBe('failed');
    });
  });

  describe('getQueueCount', () => {
    it('should return total count without filter', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/jpeg' });

      await addToQueue({
        imageBlob: mockBlob,
        userId: 'user-1',
        timestamp: new Date(),
        status: 'pending' as const,
        retryCount: 0,
      });

      await addToQueue({
        imageBlob: mockBlob,
        userId: 'user-2',
        timestamp: new Date(),
        status: 'failed' as const,
        retryCount: 1,
      });

      const count = await getQueueCount();
      expect(count).toBe(2);
    });

    it('should return count by status', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/jpeg' });

      await addToQueue({
        imageBlob: mockBlob,
        userId: 'user-1',
        timestamp: new Date(),
        status: 'pending' as const,
        retryCount: 0,
      });

      await addToQueue({
        imageBlob: mockBlob,
        userId: 'user-2',
        timestamp: new Date(),
        status: 'pending' as const,
        retryCount: 0,
      });

      await addToQueue({
        imageBlob: mockBlob,
        userId: 'user-3',
        timestamp: new Date(),
        status: 'failed' as const,
        retryCount: 1,
      });

      const pendingCount = await getQueueCount('pending');
      const failedCount = await getQueueCount('failed');

      expect(pendingCount).toBe(2);
      expect(failedCount).toBe(1);
    });
  });

  describe('updateQueueItemStatus', () => {
    it('should update item status', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/jpeg' });
      const id = await addToQueue({
        imageBlob: mockBlob,
        userId: 'user-1',
        timestamp: new Date(),
        status: 'pending' as const,
        retryCount: 0,
      });

      await updateQueueItemStatus(id, 'uploading');

      const item = await getQueueItem(id);
      expect(item?.status).toBe('uploading');
    });

    it('should increment retry count when status is failed', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/jpeg' });
      const id = await addToQueue({
        imageBlob: mockBlob,
        userId: 'user-1',
        timestamp: new Date(),
        status: 'pending' as const,
        retryCount: 0,
      });

      await updateQueueItemStatus(id, 'failed', 'Network error');

      const item = await getQueueItem(id);
      expect(item?.status).toBe('failed');
      expect(item?.retryCount).toBe(1);
      expect(item?.lastError).toBe('Network error');
    });
  });

  describe('removeQueueItem', () => {
    it('should remove item from queue', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/jpeg' });
      const id = await addToQueue({
        imageBlob: mockBlob,
        userId: 'user-1',
        timestamp: new Date(),
        status: 'pending' as const,
        retryCount: 0,
      });

      await removeQueueItem(id);

      const item = await getQueueItem(id);
      expect(item).toBeUndefined();
    });
  });

  describe('clearQueue', () => {
    it('should remove all items from queue', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/jpeg' });

      await addToQueue({
        imageBlob: mockBlob,
        userId: 'user-1',
        timestamp: new Date(),
        status: 'pending' as const,
        retryCount: 0,
      });

      await addToQueue({
        imageBlob: mockBlob,
        userId: 'user-2',
        timestamp: new Date(),
        status: 'failed' as const,
        retryCount: 1,
      });

      await clearQueue();

      const count = await getQueueCount();
      expect(count).toBe(0);
    });
  });

  describe('getQueueStats', () => {
    it('should return correct statistics', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/jpeg' });
      const now = new Date();

      await addToQueue({
        imageBlob: mockBlob,
        userId: 'user-1',
        timestamp: now,
        status: 'pending' as const,
        retryCount: 0,
      });

      await addToQueue({
        imageBlob: mockBlob,
        userId: 'user-2',
        timestamp: new Date(now.getTime() + 1000),
        status: 'failed' as const,
        retryCount: 1,
      });

      await addToQueue({
        imageBlob: mockBlob,
        userId: 'user-3',
        timestamp: new Date(now.getTime() + 2000),
        status: 'uploading' as const,
        retryCount: 0,
      });

      const stats = await getQueueStats();

      expect(stats.total).toBe(3);
      expect(stats.pending).toBe(1);
      expect(stats.uploading).toBe(1);
      expect(stats.failed).toBe(1);
      expect(stats.oldestItem).toBeDefined();
      expect(stats.newestItem).toBeDefined();
    });
  });

  describe('resetFailedItems', () => {
    it('should reset all failed items to pending', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/jpeg' });

      await addToQueue({
        imageBlob: mockBlob,
        userId: 'user-1',
        timestamp: new Date(),
        status: 'failed' as const,
        retryCount: 1,
      });

      await addToQueue({
        imageBlob: mockBlob,
        userId: 'user-2',
        timestamp: new Date(),
        status: 'failed' as const,
        retryCount: 2,
      });

      const resetCount = await resetFailedItems();

      expect(resetCount).toBe(2);

      const failedItems = await getFailedQueueItems();
      const pendingItems = await getPendingQueueItems();

      expect(failedItems).toHaveLength(0);
      expect(pendingItems).toHaveLength(2);
    });

    it('should respect max retries limit', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/jpeg' });

      await addToQueue({
        imageBlob: mockBlob,
        userId: 'user-1',
        timestamp: new Date(),
        status: 'failed' as const,
        retryCount: 2,
      });

      await addToQueue({
        imageBlob: mockBlob,
        userId: 'user-2',
        timestamp: new Date(),
        status: 'failed' as const,
        retryCount: 5,
      });

      const resetCount = await resetFailedItems(3);

      expect(resetCount).toBe(1); // Only user-1 should be reset
    });
  });

  describe('checkDatabaseHealth', () => {
    it('should return true when database is accessible', async () => {
      const isHealthy = await checkDatabaseHealth();
      expect(isHealthy).toBe(true);
    });
  });
});
