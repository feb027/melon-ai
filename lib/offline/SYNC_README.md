# Offline Sync Mechanism

This directory contains the offline sync mechanism for MelonAI, which handles automatic synchronization of offline queue items when network connection is restored.

## Features

✅ **Network Status Detection** - Uses `navigator.onLine` to detect online/offline status  
✅ **Automatic Sync** - Automatically syncs when connection is restored  
✅ **Retry Logic** - Exponential backoff for failed uploads (max 5 retries)  
✅ **Real-time Updates** - Queue status updates in real-time  
✅ **Toast Notifications** - User-friendly notifications for sync progress  
✅ **Graceful Error Handling** - Handles network errors, timeouts, and API failures  

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Offline Sync Flow                        │
└─────────────────────────────────────────────────────────────┘

1. User captures image while offline
   ↓
2. Image saved to IndexedDB (db.ts)
   ↓
3. Network connection restored
   ↓
4. SyncManager detects online status (sync.ts)
   ↓
5. Automatic sync triggered
   ↓
6. For each queue item:
   a. Upload image to /api/upload
   b. Analyze image via /api/analyze
   c. Remove from queue on success
   d. Retry with backoff on failure
   ↓
7. Toast notifications show progress
   ↓
8. Queue cleared when all items synced
```

## Files

### `sync.ts`
Core sync manager that handles:
- Network status detection
- Automatic sync when online
- Retry logic with exponential backoff
- Queue item processing
- Event notifications

**Key Classes:**
- `SyncManager` - Main sync manager class
- `getSyncManager()` - Get singleton instance
- `useSyncManager()` - React hook for sync manager

**Configuration:**
```typescript
const BACKOFF_CONFIG = {
  initialDelay: 1000,    // 1 second
  maxDelay: 60000,       // 60 seconds
  multiplier: 2,         // Exponential multiplier
  maxRetries: 5,         // Max retry attempts
};
```

### `db.ts`
IndexedDB wrapper using Dexie.js for offline queue management.

**Key Functions:**
- `addToQueue()` - Add item to queue
- `getPendingQueueItems()` - Get items ready to sync
- `getFailedQueueItems()` - Get items that need retry
- `updateQueueItemStatus()` - Update item status
- `removeQueueItem()` - Remove item after successful sync

### `use-offline-sync.ts`
React hook that integrates sync manager with toast notifications.

**Returns:**
```typescript
{
  isOnline: boolean;        // Network status
  isSyncing: boolean;       // Sync in progress
  queueCount: number;       // Number of items in queue
  syncStatus: SyncStatus;   // Current sync status
  syncQueue: () => Promise<void>;  // Manual sync trigger
  refreshQueueCount: () => Promise<void>;  // Refresh count
}
```

## Usage

### Basic Usage

```typescript
import { useOfflineSync } from '@/lib/hooks/use-offline-sync';

function MyComponent() {
  const { isOnline, isSyncing, queueCount, syncQueue } = useOfflineSync();

  return (
    <div>
      <p>Status: {isOnline ? 'Online' : 'Offline'}</p>
      <p>Queue: {queueCount} items</p>
      {isSyncing && <p>Syncing...</p>}
      <button onClick={syncQueue}>Manual Sync</button>
    </div>
  );
}
```

### With Offline Indicator

```typescript
import { OfflineIndicator } from '@/components/offline-indicator';

function App() {
  return (
    <div>
      <OfflineIndicator />
      {/* Your app content */}
    </div>
  );
}
```

### Manual Sync Manager Control

```typescript
import { getSyncManager } from '@/lib/offline/sync';

const syncManager = getSyncManager();

// Start auto-sync
syncManager.startAutoSync();

// Manual sync
const result = await syncManager.syncQueue();
console.log(`Uploaded: ${result.uploaded}, Failed: ${result.failed}`);

// Listen to sync events
const unsubscribe = syncManager.onSyncEvent((event) => {
  console.log('Sync status:', event.status);
  console.log('Queue count:', event.queueCount);
});

// Stop auto-sync
syncManager.stopAutoSync();

// Cleanup
unsubscribe();
```

## Sync Flow

### 1. Network Detection

The sync manager listens to browser events:
```typescript
window.addEventListener('online', handleOnline);
window.addEventListener('offline', handleOffline);
```

### 2. Automatic Sync

When connection is restored:
1. `handleOnline` event fires
2. `startAutoSync()` is called
3. Sync runs immediately
4. Periodic sync every 30 seconds

### 3. Item Processing

For each queue item:
```typescript
1. Update status to 'uploading'
2. Upload image to /api/upload
3. Analyze image via /api/analyze
4. On success: Remove from queue
5. On failure: Update status to 'failed', schedule retry
```

### 4. Retry Logic

Failed items are retried with exponential backoff:
```typescript
Attempt 1: 1 second delay
Attempt 2: 2 seconds delay
Attempt 3: 4 seconds delay
Attempt 4: 8 seconds delay
Attempt 5: 16 seconds delay
Max: 60 seconds delay
```

After 5 failed attempts, item remains in queue with 'failed' status.

## Error Handling

### Network Errors
- Detected via fetch failures
- Item marked as 'failed'
- Retry scheduled with backoff

### API Errors
- Upload validation errors (format, size)
- AI service errors (timeout, provider failure)
- Database errors (save failure)
- Item marked as 'failed' with error message

### User Notifications
- Toast shown for each error
- Error message in Indonesian
- Retry count displayed in UI

## Testing

### Demo Page
Visit `/demo/offline-sync` to test the sync mechanism:
1. Add test items to queue
2. Simulate offline mode in DevTools
3. Add more items while offline
4. Go back online to see automatic sync
5. View retry logic for failed items

### Manual Testing
```bash
# Start dev server
bun run dev

# Open browser
http://localhost:3000/demo/offline-sync

# Open DevTools → Network tab
# Select "Offline" to simulate offline mode
# Add test items
# Select "Online" to trigger sync
```

### Browser DevTools
1. **Network Tab** - Simulate offline/online
2. **Application Tab** - View IndexedDB data
3. **Console** - View sync logs

## Performance

### Optimization
- Items synced sequentially (not parallel) to avoid rate limits
- Queue count cached and refreshed every 5 seconds
- Auto-sync runs every 30 seconds (not every second)
- Retry delays increase exponentially to reduce server load

### Memory
- Sync manager is singleton (one instance per app)
- Event listeners cleaned up on unmount
- Retry timeouts cleared when not needed

## Requirements Fulfilled

✅ **5.1** - Store images locally when offline  
✅ **5.2** - Automatic upload when connection restored  
✅ **5.3** - Clear status indicator (online/offline)  
✅ **5.4** - Image compression (max 2MB)  
✅ **5.5** - Queue management with retry  

## Future Enhancements

- [ ] Parallel sync with concurrency limit
- [ ] Priority queue (urgent items first)
- [ ] Bandwidth detection (slow connection handling)
- [ ] Background sync API (Service Worker)
- [ ] Conflict resolution (duplicate detection)
- [ ] Sync analytics (success rate, avg time)

## Troubleshooting

### Sync not starting
- Check network status: `navigator.onLine`
- Verify sync manager initialized: `getSyncManager()`
- Check browser console for errors

### Items stuck in queue
- Check retry count (max 5)
- View error message in queue item
- Manually trigger sync: `syncQueue()`
- Clear queue if needed: `clearQueue()`

### Toast not showing
- Verify Toaster component in layout
- Check sonner installation: `bun add sonner`
- View browser console for errors

## Related Files

- `/components/offline-indicator.tsx` - UI component for offline status
- `/app/api/upload/route.ts` - Image upload endpoint
- `/app/api/analyze/route.ts` - Image analysis endpoint
- `/lib/hooks/use-analysis.ts` - Analysis hook with offline support

## References

- [Navigator.onLine - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/onLine)
- [Online and offline events - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/Online_and_offline_events)
- [Exponential Backoff - Wikipedia](https://en.wikipedia.org/wiki/Exponential_backoff)
- [Dexie.js Documentation](https://dexie.org/)
