'use client';

import { OfflineIndicator } from '@/components/offline-indicator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useOfflineSync } from '@/lib/hooks/use-offline-sync';
import { addToQueue, clearQueue as clearQueueDb } from '@/lib/offline/db';

/**
 * Demo page for testing OfflineIndicator component
 * 
 * Features:
 * - Test different states (offline, syncing, queue pending)
 * - Real queue management with IndexedDB
 * - Test manual sync trigger
 * - Real-time online/offline detection
 * 
 * Note: This demo now uses the real offline sync mechanism.
 * For a more comprehensive demo, see /demo/offline-sync
 */
export default function OfflineIndicatorDemo() {
  const { isOnline, isSyncing, queueCount, syncQueue, refreshQueueCount } = useOfflineSync();

  const handleAddToQueue = async () => {
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

    await refreshQueueCount();
  };

  const handleAddMultiple = async () => {
    for (let i = 0; i < 5; i++) {
      await handleAddToQueue();
    }
  };

  const handleClearQueue = async () => {
    if (confirm('Hapus semua item dari queue?')) {
      await clearQueueDb();
      await refreshQueueCount();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Offline Indicator - Fixed at top */}
      <OfflineIndicator />

      {/* Demo Content */}
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Offline Indicator Demo</CardTitle>
              <CardDescription>
                Test berbagai state dari offline indicator component
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Status */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Status Saat Ini</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={isOnline ? 'default' : 'destructive'}>
                    {isOnline ? 'Online' : 'Offline'}
                  </Badge>
                  <Badge variant="secondary">
                    Queue: {queueCount} foto
                  </Badge>
                  {isSyncing && (
                    <Badge variant="outline">
                      Syncing...
                    </Badge>
                  )}
                </div>
              </div>

              {/* Queue Controls */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Kontrol Queue</h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={handleAddToQueue}
                    variant="outline"
                    size="sm"
                  >
                    Tambah ke Queue (+1)
                  </Button>
                  <Button
                    onClick={handleAddMultiple}
                    variant="outline"
                    size="sm"
                  >
                    Tambah 5 Foto
                  </Button>
                  <Button
                    onClick={handleClearQueue}
                    variant="outline"
                    size="sm"
                  >
                    Kosongkan Queue
                  </Button>
                </div>
              </div>

              {/* Sync Controls */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Kontrol Sinkronisasi</h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={syncQueue}
                    disabled={queueCount === 0 || isSyncing || !isOnline}
                    size="sm"
                  >
                    Mulai Sinkronisasi
                  </Button>
                  <Button
                    onClick={refreshQueueCount}
                    variant="outline"
                    size="sm"
                  >
                    Refresh Queue Count
                  </Button>
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-2 pt-4 border-t">
                <h3 className="text-sm font-medium">Cara Testing</h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>
                    <strong>Test Offline:</strong> Buka DevTools → Network → Pilih "Offline"
                  </li>
                  <li>
                    <strong>Test Queue:</strong> Klik "Tambah ke Queue" untuk menambah item ke IndexedDB
                  </li>
                  <li>
                    <strong>Test Sync:</strong> Klik "Mulai Sinkronisasi" untuk upload real
                  </li>
                  <li>
                    <strong>Test Auto-Sync:</strong> Tambah item saat offline, lalu kembali online
                  </li>
                  <li>
                    <strong>Full Demo:</strong> Kunjungi <a href="/demo/offline-sync" className="text-primary hover:underline">/demo/offline-sync</a> untuk demo lengkap
                  </li>
                </ul>
              </div>

              {/* Component States */}
              <div className="space-y-2 pt-4 border-t">
                <h3 className="text-sm font-medium">State yang Ditampilkan</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>
                    <strong>Offline + Queue:</strong> Banner orange dengan pesan offline
                  </li>
                  <li>
                    <strong>Online + Syncing:</strong> Banner biru dengan animasi loading
                  </li>
                  <li>
                    <strong>Online + Queue Pending:</strong> Banner kuning dengan tombol sync
                  </li>
                  <li>
                    <strong>Sync Success:</strong> Banner hijau (muncul 3 detik)
                  </li>
                  <li>
                    <strong>Online + No Queue:</strong> Tidak ada banner
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
