/**
 * Example usage of the offline database (IndexedDB with Dexie.js)
 * 
 * This file demonstrates how to use the offline queue management functions
 * for storing and syncing images when the user is offline.
 */

import {
  addToQueue,
  getAllQueueItems,
  getPendingQueueItems,
  getFailedQueueItems,
  getQueueCount,
  updateQueueItemStatus,
  removeQueueItem,
  getQueueStats,
  resetFailedItems,
  type OfflineQueueItem,
} from './db';

/**
 * Example 1: Add an image to the offline queue
 */
async function exampleAddToQueue() {
  // Simulate capturing an image (in real app, this comes from camera)
  const imageBlob = new Blob(['fake image data'], { type: 'image/jpeg' });

  // Add to queue
  const id = await addToQueue({
    imageBlob,
    userId: 'user-123',
    metadata: {
      location: 'Kebun Semangka A',
      batchId: 'batch-001',
      deviceInfo: navigator.userAgent,
    },
    timestamp: new Date(),
    status: 'pending',
    retryCount: 0,
  });

  console.log('Added to queue with id:', id);
  return id;
}

/**
 * Example 2: Get all pending items (ready to upload)
 */
async function exampleGetPendingItems() {
  const pendingItems = await getPendingQueueItems();
  
  console.log(`Found ${pendingItems.length} pending items`);
  
  pendingItems.forEach((item) => {
    console.log(`- Item ${item.id}: captured at ${item.timestamp}`);
  });

  return pendingItems;
}

/**
 * Example 3: Process queue items (upload when online)
 */
async function exampleProcessQueue() {
  // Check if online
  if (!navigator.onLine) {
    console.log('Offline - skipping upload');
    return;
  }

  // Get pending items
  const pendingItems = await getPendingQueueItems();

  for (const item of pendingItems) {
    try {
      // Update status to uploading
      await updateQueueItemStatus(item.id!, 'uploading');

      // Simulate upload (in real app, call API)
      console.log(`Uploading item ${item.id}...`);
      await simulateUpload(item);

      // Remove from queue after successful upload
      await removeQueueItem(item.id!);
      console.log(`Successfully uploaded and removed item ${item.id}`);
    } catch (error) {
      // Mark as failed
      await updateQueueItemStatus(
        item.id!,
        'failed',
        error instanceof Error ? error.message : 'Upload failed'
      );
      console.error(`Failed to upload item ${item.id}:`, error);
    }
  }
}

/**
 * Example 4: Retry failed items
 */
async function exampleRetryFailed() {
  // Get failed items
  const failedItems = await getFailedQueueItems();
  
  console.log(`Found ${failedItems.length} failed items`);

  // Reset failed items to pending (max 3 retries)
  const resetCount = await resetFailedItems(3);
  
  console.log(`Reset ${resetCount} items to pending`);

  // Process queue again
  await exampleProcessQueue();
}

/**
 * Example 5: Get queue statistics
 */
async function exampleGetStats() {
  const stats = await getQueueStats();

  console.log('Queue Statistics:');
  console.log(`- Total items: ${stats.total}`);
  console.log(`- Pending: ${stats.pending}`);
  console.log(`- Uploading: ${stats.uploading}`);
  console.log(`- Failed: ${stats.failed}`);
  
  if (stats.oldestItem) {
    console.log(`- Oldest item: ${stats.oldestItem.toLocaleString()}`);
  }
  
  if (stats.newestItem) {
    console.log(`- Newest item: ${stats.newestItem.toLocaleString()}`);
  }

  return stats;
}

/**
 * Example 6: Monitor queue in real-time (React hook pattern)
 */
function useOfflineQueue() {
  // In a real React component, use useState and useEffect
  // This is a simplified example showing the pattern

  async function refreshQueue() {
    const [items, count, stats] = await Promise.all([
      getAllQueueItems(),
      getQueueCount(),
      getQueueStats(),
    ]);

    return { items, count, stats };
  }

  return { refreshQueue };
}

/**
 * Example 7: Handle offline/online transitions
 */
function exampleNetworkListener() {
  // Listen for online event
  window.addEventListener('online', async () => {
    console.log('Connection restored - processing queue');
    await exampleProcessQueue();
  });

  // Listen for offline event
  window.addEventListener('offline', () => {
    console.log('Connection lost - items will be queued');
  });
}

/**
 * Example 8: Camera capture with offline support
 */
async function exampleCaptureWithOffline(imageBlob: Blob, userId: string) {
  if (navigator.onLine) {
    // Online: upload immediately
    try {
      console.log('Online - uploading immediately');
      await simulateUpload({ imageBlob, userId } as OfflineQueueItem);
      console.log('Upload successful');
    } catch (error) {
      // Failed: add to queue
      console.log('Upload failed - adding to queue');
      await addToQueue({
        imageBlob,
        userId,
        timestamp: new Date(),
        status: 'pending',
        retryCount: 0,
      });
    }
  } else {
    // Offline: add to queue
    console.log('Offline - adding to queue');
    const id = await addToQueue({
      imageBlob,
      userId,
      timestamp: new Date(),
      status: 'pending',
      retryCount: 0,
    });
    console.log(`Added to queue: ${id}`);
  }
}

/**
 * Example 9: Clear old completed items (cleanup)
 */
async function exampleCleanup() {
  // This would typically run on app startup or periodically
  const stats = await getQueueStats();
  
  console.log(`Queue has ${stats.total} items`);

  // Note: In the real implementation, completed items are removed immediately
  // This is just for demonstration of the cleanup pattern
  
  if (stats.total > 100) {
    console.log('Queue is large - consider clearing old items');
  }
}

/**
 * Example 10: Complete offline flow
 */
async function exampleCompleteFlow() {
  console.log('=== Complete Offline Flow Example ===\n');

  // 1. Add some items to queue
  console.log('1. Adding items to queue...');
  await exampleAddToQueue();
  await exampleAddToQueue();
  await exampleAddToQueue();

  // 2. Check stats
  console.log('\n2. Queue statistics:');
  await exampleGetStats();

  // 3. Process queue (simulate online)
  console.log('\n3. Processing queue...');
  await exampleProcessQueue();

  // 4. Check stats again
  console.log('\n4. Queue statistics after processing:');
  await exampleGetStats();

  // 5. Simulate some failures
  console.log('\n5. Simulating failures...');
  const id = await exampleAddToQueue();
  await updateQueueItemStatus(id, 'failed', 'Network timeout');

  // 6. Retry failed items
  console.log('\n6. Retrying failed items...');
  await exampleRetryFailed();

  // 7. Final stats
  console.log('\n7. Final queue statistics:');
  await exampleGetStats();
}

/**
 * Helper: Simulate upload (replace with real API call)
 */
async function simulateUpload(_item: OfflineQueueItem): Promise<void> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Simulate random failure (10% chance)
  if (Math.random() < 0.1) {
    throw new Error('Network timeout');
  }

  console.log('Upload successful');
}

/**
 * Run examples (uncomment to test)
 */
// exampleCompleteFlow().catch(console.error);

export {
  exampleAddToQueue,
  exampleGetPendingItems,
  exampleProcessQueue,
  exampleRetryFailed,
  exampleGetStats,
  useOfflineQueue,
  exampleNetworkListener,
  exampleCaptureWithOffline,
  exampleCleanup,
  exampleCompleteFlow,
};
