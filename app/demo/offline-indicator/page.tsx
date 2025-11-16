'use client';

import { useState } from 'react';
import { OfflineIndicator, useOnlineStatus } from '@/components/offline-indicator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

/**
 * Demo page for testing OfflineIndicator component
 * 
 * Features:
 * - Test different states (offline, syncing, queue pending)
 * - Simulate queue count changes
 * - Test manual sync trigger
 * - Real-time online/offline detection
 */
export default function OfflineIndicatorDemo() {
  const [queueCount, setQueueCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const isOnline = useOnlineStatus();

  const handleManualSync = () => {
    setIsSyncing(true);
    // Simulate sync process
    const interval = setInterval(() => {
      setQueueCount((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsSyncing(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const addToQueue = () => {
    setQueueCount((prev) => prev + 1);
  };

  const clearQueue = () => {
    setQueueCount(0);
    setIsSyncing(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Offline Indicator - Fixed at top */}
      <OfflineIndicator
        queueCount={queueCount}
        isSyncing={isSyncing}
        onManualSync={handleManualSync}
      />

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
                    onClick={addToQueue}
                    variant="outline"
                    size="sm"
                  >
                    Tambah ke Queue (+1)
                  </Button>
                  <Button
                    onClick={() => setQueueCount((prev) => prev + 5)}
                    variant="outline"
                    size="sm"
                  >
                    Tambah 5 Foto
                  </Button>
                  <Button
                    onClick={clearQueue}
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
                    onClick={handleManualSync}
                    disabled={queueCount === 0 || isSyncing || !isOnline}
                    size="sm"
                  >
                    Mulai Sinkronisasi
                  </Button>
                  <Button
                    onClick={() => setIsSyncing(!isSyncing)}
                    variant="outline"
                    size="sm"
                    disabled={queueCount === 0}
                  >
                    Toggle Syncing State
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
                    <strong>Test Queue:</strong> Klik "Tambah ke Queue" untuk simulasi foto pending
                  </li>
                  <li>
                    <strong>Test Sync:</strong> Klik "Mulai Sinkronisasi" untuk simulasi upload
                  </li>
                  <li>
                    <strong>Test Online → Offline:</strong> Toggle network status di DevTools
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
