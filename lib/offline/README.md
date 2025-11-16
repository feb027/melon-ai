# Offline Queue Management with IndexedDB

This module provides offline queue management for MelonAI using IndexedDB (via Dexie.js). It allows users to capture watermelon images even when offline, with automatic synchronization when connection is restored.

## Features

- ✅ **Type-safe** IndexedDB wrapper using Dexie.js
- ✅ **CRUD operations** for queue management
- ✅ **Status tracking** (pending, uploading, failed)
- ✅ **Retry logic** with configurable max retries
- ✅ **Queue statistics** and monitoring
- ✅ **Automatic cleanup** of old items
- ✅ **Export/import** for debugging

## Installation

Already installed as part of the project:

```bash
bun add dexie
```

## Database Schema

### OfflineQueueItem

```typescript
interface OfflineQueueItem {
  id?: string;              // Auto-generated UUID
  imageBlob: Blob;          // The actual image data
  userId: string;           // User who captured the image
  metadata?: {
    location?: string;
    batchId?: string;
    deviceInfo?: string;
  };
  timestamp: Date;          // When the image was captured
  status: QueueStatus;      // 'pending' | 'uploading' | 'failed'
  retryCount: number;       // Number of upload attempts
  lastError?: string;       // Last error message if failed
  createdAt: Date;          // When added to queue
  updatedAt: Date;          // Last status update
}
```

## API Reference

### Queue Management

#### `addToQueue(item)`
Add a new item to the offline queue.

```typescript
const id = await addToQueue({
  imageBlob: blob,
  userId: 'user-123',
  timestamp: new Date(),
  status: 'pending',
  retryCount: 0,
});
```

#### `getQueueItem(id)`
Get a single queue item by id.

```typescript
const item = await getQueueItem('item-id');
```

#### `getAllQueueItems()`
Get all queue items, ordered by timestamp.

```typescript
const items = await getAllQueueItems();
```

#### `getPendingQueueItems()`
Get all pending items (ready to upload).

```typescript
const pending = await getPendingQueueItems();
```

#### `getFailedQueueItems()`
Get all failed items (need retry).

```typescript
const failed = await getFailedQueueItems();
```

#### `getQueueCount(status?)`
Get count of items in queue, optionally filtered by status.

```typescript
const total = await getQueueCount();
const pending = await getQueueCount('pending');
```

### Status Management

#### `updateQueueItemStatus(id, status, error?)`
Update the status of a queue item.

```typescript
// Mark as uploading
await updateQueueItemStatus('item-id', 'uploading');

// Mark as failed with error
await updateQueueItemStatus('item-id', 'failed', 'Network timeout');
```

#### `resetFailedItems(maxRetries?)`
Reset failed items to pending for retry.

```typescript
// Reset all failed items
const count = await resetFailedItems();

// Reset only items with less than 3 retries
const count = await resetFailedItems(3);
```

### Queue Operations

#### `removeQueueItem(id)`
Remove a single item from the queue.

```typescript
await removeQueueItem('item-id');
```

#### `removeQueueItems(ids)`
Remove multiple items from the queue.

```typescript
await removeQueueItems(['id1', 'id2', 'id3']);
```

#### `clearQueue()`
Clear all items from the queue (use with caution).

```typescript
await clearQueue();
```

#### `clearOldItems(olderThanDays)`
Clear items older than specified days.

```typescript
// Clear items older than 7 days
await clearOldItems(7);
```

### Statistics & Monitoring

#### `getQueueStats()`
Get comprehensive queue statistics.

```typescript
const stats = await getQueueStats();
// {
//   total: 10,
//   pending: 5,
//   uploading: 2,
//   failed: 3,
//   oldestItem: Date,
//   newestItem: Date
// }
```

#### `checkDatabaseHealth()`
Check if database is accessible.

```typescript
const isHealthy = await checkDatabaseHealth();
```

## Usage Examples

### Basic Usage

```typescript
import { addToQueue, getPendingQueueItems, removeQueueItem } from '@/lib/offline/db';

// Add image to queue
const id = await addToQueue({
  imageBlob: capturedImage,
  userId: currentUser.id,
  timestamp: new Date(),
  status: 'pending',
  retryCount: 0,
});

// Get pending items
const pending = await getPendingQueueItems();

// Remove after successful upload
await removeQueueItem(id);
```

### Offline/Online Flow

```typescript
import { addToQueue, getPendingQueueItems, updateQueueItemStatus, removeQueueItem } from '@/lib/offline/db';

async function handleImageCapture(imageBlob: Blob, userId: string) {
  if (navigator.onLine) {
    // Online: try immediate upload
    try {
      await uploadImage(imageBlob);
    } catch (error) {
      // Failed: add to queue
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
    await addToQueue({
      imageBlob,
      userId,
      timestamp: new Date(),
      status: 'pending',
      retryCount: 0,
    });
  }
}

// Process queue when online
async function processQueue() {
  const pending = await getPendingQueueItems();

  for (const item of pending) {
    try {
      await updateQueueItemStatus(item.id!, 'uploading');
      await uploadImage(item.imageBlob);
      await removeQueueItem(item.id!);
    } catch (error) {
      await updateQueueItemStatus(
        item.id!,
        'failed',
        error.message
      );
    }
  }
}

// Listen for online event
window.addEventListener('online', processQueue);
```

### React Hook Pattern

```typescript
import { useState, useEffect } from 'react';
import { getAllQueueItems, getQueueStats } from '@/lib/offline/db';

function useOfflineQueue() {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);

  const refresh = async () => {
    const [queueItems, queueStats] = await Promise.all([
      getAllQueueItems(),
      getQueueStats(),
    ]);
    setItems(queueItems);
    setStats(queueStats);
  };

  useEffect(() => {
    refresh();
    
    // Refresh every 5 seconds
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, []);

  return { items, stats, refresh };
}
```

### Retry Logic

```typescript
import { getFailedQueueItems, resetFailedItems, updateQueueItemStatus } from '@/lib/offline/db';

async function retryFailedUploads() {
  // Get failed items
  const failed = await getFailedQueueItems();

  // Filter items with less than 3 retries
  const retriable = failed.filter(item => item.retryCount < 3);

  // Reset to pending
  for (const item of retriable) {
    await updateQueueItemStatus(item.id!, 'pending');
  }

  // Process queue
  await processQueue();
}
```

## Best Practices

### 1. Always Check Online Status

```typescript
if (navigator.onLine) {
  // Try immediate upload
} else {
  // Add to queue
}
```

### 2. Handle Upload Failures Gracefully

```typescript
try {
  await uploadImage(blob);
} catch (error) {
  // Fallback to queue
  await addToQueue({ ... });
}
```

### 3. Limit Retry Attempts

```typescript
// Don't retry indefinitely
const MAX_RETRIES = 3;
if (item.retryCount >= MAX_RETRIES) {
  // Show error to user or remove from queue
}
```

### 4. Clean Up Old Items

```typescript
// On app startup
await clearOldItems(7); // Remove items older than 7 days
```

### 5. Monitor Queue Size

```typescript
const stats = await getQueueStats();
if (stats.total > 100) {
  // Warn user about large queue
}
```

## Error Handling

```typescript
import { addToQueue, checkDatabaseHealth } from '@/lib/offline/db';

try {
  // Check database health first
  const isHealthy = await checkDatabaseHealth();
  if (!isHealthy) {
    throw new Error('Database not accessible');
  }

  // Add to queue
  await addToQueue({ ... });
} catch (error) {
  console.error('Failed to add to queue:', error);
  // Show error to user
}
```

## Testing

See `db.example.ts` for comprehensive usage examples and test scenarios.

## Requirements Covered

This implementation satisfies the following requirements:

- **5.1**: Store images locally when offline
- **5.2**: Automatic sync when connection restored
- **5.5**: Queue management with status tracking

## Related Files

- `lib/offline/db.ts` - Main implementation
- `lib/offline/db.example.ts` - Usage examples
- `components/offline-indicator.tsx` - UI component for queue status
- `lib/hooks/use-analysis.ts` - Integration with analysis flow

## Next Steps

1. Integrate with camera capture component (Task 20)
2. Implement sync mechanism (Task 19)
3. Add UI for queue status display
4. Test offline/online transitions
