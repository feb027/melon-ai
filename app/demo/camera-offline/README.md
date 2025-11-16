# Camera + Offline Mode Integration Demo

This demo showcases the complete offline mode integration with camera capture, demonstrating how the MelonAI system handles network disconnections gracefully.

## Features Demonstrated

### 1. Offline Detection
- Real-time network status monitoring
- Visual indicators for online/offline state
- Persistent banner when offline

### 2. Offline Queue Management
- Automatic save to IndexedDB when offline
- Queue counter badge showing pending uploads
- Visual feedback for queued items

### 3. Automatic Sync
- Auto-sync when connection is restored
- Retry logic with exponential backoff
- Real-time sync progress updates

### 4. Manual Sync Trigger
- Manual sync button when online
- Sync status indicators
- Success/error notifications

### 5. User Experience
- User-friendly messages in Indonesian
- Toast notifications for all states
- Seamless transition between online/offline modes

## How to Test

### Test 1: Basic Offline Capture

1. **Open the demo page:**
   ```
   http://localhost:3000/demo/camera-offline
   ```

2. **Simulate offline mode:**
   - Open Chrome DevTools (F12)
   - Go to Network tab
   - Select "Offline" from the throttling dropdown

3. **Capture a photo:**
   - Click the camera button
   - Take a photo of a watermelon (or any object)
   - Observe the offline indicator banner
   - Check that queue counter increases

4. **Verify offline storage:**
   - Open Application tab in DevTools
   - Navigate to IndexedDB → MelonAI_OfflineDB → offlineQueue
   - Verify the captured image is stored

5. **Go back online:**
   - Set network throttling back to "No throttling"
   - Observe the "Sinkronkan" button appears
   - Wait for auto-sync or click "Sinkronkan"

6. **Verify sync:**
   - Check that queue counter decreases to 0
   - Verify success notification appears
   - Check that image was uploaded to Supabase

### Test 2: Multiple Offline Captures

1. **Set to offline mode** (DevTools → Network → Offline)

2. **Capture multiple photos:**
   - Take 3-5 photos in succession
   - Click "Foto Lagi" after each capture
   - Observe queue counter increasing

3. **Verify queue:**
   - Check IndexedDB has all images
   - Verify queue counter shows correct count

4. **Go online and sync:**
   - Set network back to online
   - Click "Sinkronkan" or wait for auto-sync
   - Watch queue counter decrease as items sync
   - Verify all photos are uploaded

### Test 3: Sync Failure and Retry

1. **Set to offline mode**

2. **Capture a photo** → Saved to queue

3. **Go online briefly:**
   - Set network to "Online"
   - Immediately set back to "Offline" (before sync completes)

4. **Observe retry behavior:**
   - Check that item status changes to "failed"
   - Wait for automatic retry (exponential backoff)
   - Set network to "Online" permanently
   - Verify item eventually syncs successfully

### Test 4: Network Interruption During Upload

1. **Start in online mode**

2. **Capture a photo** → Upload starts

3. **Quickly go offline:**
   - Set network to "Offline" during upload
   - Observe error handling

4. **Go back online:**
   - Verify retry mechanism kicks in
   - Check that upload completes successfully

### Test 5: PWA Offline Mode

1. **Install PWA:**
   - Visit the app in Chrome
   - Click "Install" when prompted
   - Open as standalone app

2. **Test offline in PWA:**
   - Close all network connections (airplane mode)
   - Open PWA app
   - Capture photos
   - Verify offline queue works

3. **Restore connection:**
   - Turn off airplane mode
   - Verify auto-sync works in PWA

## Expected Behavior

### When Offline:
- ✅ Orange banner: "Anda sedang offline. Foto akan diunggah saat koneksi kembali."
- ✅ Queue counter badge shows number of pending items
- ✅ Photos are saved to IndexedDB
- ✅ Toast notification: "Mode offline - Foto disimpan..."

### When Online with Queue:
- ✅ Yellow banner: "Koneksi tersedia. Ada foto yang belum diunggah."
- ✅ "Sinkronkan" button is visible
- ✅ Auto-sync starts automatically
- ✅ Queue counter decreases as items sync

### During Sync:
- ✅ Blue banner: "Mengunggah foto..."
- ✅ Spinning sync icon
- ✅ Queue counter shows remaining items
- ✅ Toast notifications for progress

### After Sync:
- ✅ Green banner: "Sinkronisasi berhasil! Semua foto telah diunggah."
- ✅ Queue counter shows 0
- ✅ Success toast notification
- ✅ Banner auto-hides after 3 seconds

## Status Cards

The demo page includes three status cards:

### 1. Network Status
- Shows current online/offline state
- Green (Wifi icon) = Online
- Orange (WifiOff icon) = Offline

### 2. Queue Status
- Shows number of items in queue
- Badge: "Menunggu" (pending) or "Kosong" (empty)
- Updates in real-time

### 3. Sync Status
- Shows current sync state
- "Syncing" = Upload in progress
- "Synced" = All items uploaded
- "Pending" = Items waiting to sync
- Manual sync button when applicable

## Debug Info

The debug panel at the bottom shows:
- Network status (Online/Offline)
- Queue count (number)
- Syncing status (Yes/No)
- Has result (Yes/No)

Use this to verify internal state during testing.

## Troubleshooting

### Queue not clearing after sync
- Check browser console for errors
- Verify API endpoints are accessible
- Check Supabase credentials in .env.local

### Photos not saving to queue
- Check IndexedDB is enabled in browser
- Verify browser supports IndexedDB
- Check browser console for errors

### Auto-sync not triggering
- Verify network event listeners are working
- Check that sync manager is initialized
- Look for errors in browser console

### Sync failing repeatedly
- Check API rate limits
- Verify Supabase storage bucket exists
- Check image size (should be < 2MB)

## Requirements Covered

This demo validates the following requirements:

- **5.1**: Store images locally when offline
- **5.2**: Auto-upload when connection restored
- **5.3**: Clear status indicator (online/offline)
- **5.4**: Image compression (max 2MB)
- **5.5**: Queue management (add, remove, clear)

## Technical Implementation

### Components Used:
- `CameraCapture` - Camera with offline detection
- `OfflineIndicator` - Network status banner
- `useAnalysis` - Analysis hook with offline support
- `useOfflineSync` - Sync manager hook

### Storage:
- IndexedDB (Dexie.js) for offline queue
- Supabase Storage for uploaded images
- Supabase PostgreSQL for analysis results

### Sync Strategy:
- Exponential backoff (1s → 2s → 4s → 8s → 16s → 60s max)
- Max 5 retries per item
- Auto-sync every 30 seconds when online
- Manual sync trigger available

## Next Steps

After validating this demo:
1. Integrate with authentication (replace 'demo-user')
2. Add analytics tracking for offline usage
3. Implement background sync API for PWA
4. Add conflict resolution for duplicate uploads
5. Optimize IndexedDB storage limits

## Related Files

- `/components/camera-capture.tsx` - Camera component
- `/components/offline-indicator.tsx` - Status banner
- `/lib/hooks/use-analysis.ts` - Analysis hook
- `/lib/hooks/use-offline-sync.ts` - Sync hook
- `/lib/offline/db.ts` - IndexedDB wrapper
- `/lib/offline/sync.ts` - Sync manager

---

**Status**: ✅ Task 20 Complete - Offline mode fully integrated with camera capture
