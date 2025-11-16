/**
 * Offline Sync Demo Page
 * 
 * Demonstrates the offline sync mechanism with:
 * - Network status detection
 * - Queue management
 * - Automatic sync when online
 * - Manual sync trigger
 * - Retry with exponential backoff
 * - Toast notifications
 */

'use client';

import { useState, useEffect } from 'react';
import { WifiOff, Wifi, Upload, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OfflineIndicator } from '@/components/offline-indicator';
import { useOfflineSync } from '@/lib/hooks/use-offline-sync';
import {
  addToQueue,
  getAllQueueItems,
  clearQueue,
  getQueueStats,
  type OfflineQueueItem,
} from '@/lib/offline/db';

export default function OfflineSyncDemoPage() {
  const { isOnline, isSyncing, queueCount, syncQueue, refreshQueueCount } = useOfflineSync();
  const [queueItems, setQueueItems] = useState<OfflineQueueItem[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    uploading: 0,
    failed: 0,
  });

  // Load queue items
  const loadQueueItems = async () => {
    const items = await getAllQueueItems();
    setQueueItems(items);

    const queueStats = await getQueueStats();
    setStats(queueStats);
  };

  // Add test item to queue
  const addTestItem = async () => {
    // Create a test image blob (1x1 red pixel PNG)
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'red';
      ctx.fillRect(0, 0, 1, 1);
    }

    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b!), 'image/png');
    });

    await addToQueue({
      imageBlob: blob,
      userId: 'demo-user',
      metadata: {
        location: 'Demo Location',
        batchId: `batch-${Date.now()}`,
      },
      timestamp: new Date(),
      status: 'pending',
      retryCount: 0,
    });

    await loadQueueItems();
    await refreshQueueCount();
  };

  // Clear all queue items
  const handleClearQueue = async () => {
    if (confirm('Hapus semua item dari queue?')) {
      await clearQueue();
      await loadQueueItems();
      await refreshQueueCount();
    }
  };

  // Manual sync
  const handleManualSync = async () => {
    await syncQueue();
    await loadQueueItems();
  };

  // Load items on mount and periodically
  useEffect(() => {
    loadQueueItems();

    const interval = setInterval(() => {
      loadQueueItems();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Offline Indicator */}
      <OfflineIndicator />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Offline Sync Demo</h1>
          <p className="text-muted-foreground">
            Test offline sync mechanism dengan network detection, automatic sync, dan retry logic
          </p>
        </div>

        {/* Network Status Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isOnline ? (
                <>
                  <Wifi className="h-5 w-5 text-green-600" />
                  Online
                </>
              ) : (
                <>
                  <WifiOff className="h-5 w-5 text-orange-600" />
                  Offline
                </>
              )}
            </CardTitle>
            <CardDescription>
              Status koneksi internet saat ini
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status Sinkronisasi:</span>
                <Badge variant={isSyncing ? 'default' : 'secondary'}>
                  {isSyncing ? 'Syncing...' : 'Idle'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Queue Count:</span>
                <Badge variant={queueCount > 0 ? 'destructive' : 'secondary'}>
                  {queueCount} items
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Queue Statistics Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Queue Statistics</CardTitle>
            <CardDescription>
              Statistik item dalam offline queue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                <div className="text-xs text-muted-foreground">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.uploading}</div>
                <div className="text-xs text-muted-foreground">Uploading</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
                <div className="text-xs text-muted-foreground">Failed</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 mb-6">
          <Button onClick={addTestItem} variant="default">
            <Upload className="h-4 w-4 mr-2" />
            Add Test Item
          </Button>
          <Button
            onClick={handleManualSync}
            variant="secondary"
            disabled={!isOnline || isSyncing || queueCount === 0}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            Manual Sync
          </Button>
          <Button
            onClick={handleClearQueue}
            variant="destructive"
            disabled={queueCount === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Queue
          </Button>
        </div>

        {/* Queue Items List */}
        <Card>
          <CardHeader>
            <CardTitle>Queue Items</CardTitle>
            <CardDescription>
              {queueItems.length === 0
                ? 'Tidak ada item dalam queue'
                : `${queueItems.length} item dalam queue`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {queueItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Queue kosong. Tambahkan test item untuk mencoba sync.
              </div>
            ) : (
              <div className="space-y-2">
                {queueItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {item.metadata?.batchId || 'No batch ID'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(item.timestamp).toLocaleString('id-ID')}
                      </div>
                      {item.lastError && (
                        <div className="text-xs text-red-600 mt-1">
                          Error: {item.lastError}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          item.status === 'pending'
                            ? 'secondary'
                            : item.status === 'uploading'
                            ? 'default'
                            : 'destructive'
                        }
                      >
                        {item.status}
                      </Badge>
                      {item.retryCount > 0 && (
                        <Badge variant="outline">
                          Retry: {item.retryCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Testing Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>1. Click "Add Test Item" to add items to the offline queue</p>
            <p>2. Items will automatically sync when online</p>
            <p>3. Use browser DevTools to simulate offline mode (Network tab → Offline)</p>
            <p>4. Add items while offline, then go back online to see automatic sync</p>
            <p>5. Failed items will retry with exponential backoff</p>
            <p>6. Use "Manual Sync" to trigger sync immediately</p>
            <p className="text-muted-foreground italic">
              Note: Test items use 1x1 pixel images and will fail upload validation (max 2MB check).
              This is expected for demo purposes to test retry logic.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
