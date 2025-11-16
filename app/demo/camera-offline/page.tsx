/**
 * Camera with Offline Mode Demo
 * 
 * This demo page showcases the complete offline mode integration:
 * - Camera capture with offline detection
 * - Automatic save to IndexedDB when offline
 * - Queue counter display
 * - Manual sync trigger
 * - Automatic sync when connection is restored
 * 
 * Test Flow:
 * 1. Open DevTools → Network tab → Set to "Offline"
 * 2. Capture a photo → Should save to queue
 * 3. See queue counter increase
 * 4. Set network back to "Online"
 * 5. Click "Sinkronkan" or wait for auto-sync
 * 6. Verify photo is uploaded and queue is cleared
 */

'use client';

import { useState } from 'react';
import { CameraCapture } from '@/components/camera-capture';
import { OfflineIndicator } from '@/components/offline-indicator';
import { AnalysisResult } from '@/components/analysis-result';
import { useAnalysis } from '@/lib/hooks/use-analysis';
import { useOfflineSync } from '@/lib/hooks/use-offline-sync';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Camera, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle2,
  AlertCircle,
  Info
} from 'lucide-react';

export default function CameraOfflineDemoPage() {
  const [capturedImage, setCapturedImage] = useState<Blob | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const { 
    isLoading, 
    result, 
    error, 
    analyzeImage, 
    reset 
  } = useAnalysis();
  
  const { 
    isOnline, 
    isSyncing, 
    queueCount, 
    syncQueue,
    refreshQueueCount 
  } = useOfflineSync();

  /**
   * Handle image capture from camera
   */
  const handleCapture = async (imageBlob: Blob) => {
    console.log('[Demo] Image captured:', imageBlob.size, 'bytes');
    
    // Store captured image
    setCapturedImage(imageBlob);
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(imageBlob);
    setImagePreview(previewUrl);
    
    // Start analysis (will handle offline mode automatically)
    await analyzeImage(imageBlob, 'demo-user', {
      location: 'Demo Location',
      deviceInfo: navigator.userAgent,
    });
    
    // Refresh queue count
    await refreshQueueCount();
  };

  /**
   * Handle camera errors
   */
  const handleError = (error: any) => {
    console.error('[Demo] Camera error:', error);
  };

  /**
   * Reset and take another photo
   */
  const handleReset = () => {
    reset();
    setCapturedImage(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
  };

  /**
   * Manual sync trigger
   */
  const handleManualSync = async () => {
    await syncQueue();
    await refreshQueueCount();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Offline Indicator */}
      <OfflineIndicator />

      <div className="container mx-auto px-4 py-8 pt-20">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Camera + Offline Mode Demo</h1>
          <p className="text-muted-foreground">
            Test offline mode integration with camera capture
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Network Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                {isOnline ? (
                  <>
                    <Wifi className="h-4 w-4 text-green-600" />
                    Online
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4 text-orange-600" />
                    Offline
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {isOnline 
                  ? 'Koneksi internet tersedia' 
                  : 'Tidak ada koneksi internet'}
              </p>
            </CardContent>
          </Card>

          {/* Queue Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin text-blue-600' : 'text-muted-foreground'}`} />
                Antrian
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold">{queueCount}</p>
                <Badge variant={queueCount > 0 ? 'default' : 'secondary'}>
                  {queueCount > 0 ? 'Menunggu' : 'Kosong'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Sync Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                {isSyncing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                    Syncing
                  </>
                ) : queueCount === 0 ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Synced
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    Pending
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isOnline && queueCount > 0 && !isSyncing && (
                <Button 
                  size="sm" 
                  onClick={handleManualSync}
                  className="w-full"
                >
                  Sinkronkan Sekarang
                </Button>
              )}
              {isSyncing && (
                <p className="text-xs text-muted-foreground">
                  Mengunggah foto...
                </p>
              )}
              {queueCount === 0 && (
                <p className="text-xs text-muted-foreground">
                  Semua foto telah diunggah
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Alert className="mb-8">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Test Instructions:</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
              <li>Open DevTools → Network tab → Set to "Offline"</li>
              <li>Capture a photo → Should save to queue</li>
              <li>See queue counter increase</li>
              <li>Set network back to "Online"</li>
              <li>Click "Sinkronkan" or wait for auto-sync</li>
              <li>Verify photo is uploaded and queue is cleared</li>
            </ol>
          </AlertDescription>
        </Alert>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Camera Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Camera Capture
              </CardTitle>
              <CardDescription>
                Ambil foto semangka untuk dianalisis
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!capturedImage ? (
                <div className="aspect-[4/3] bg-black rounded-lg overflow-hidden">
                  <CameraCapture 
                    onCapture={handleCapture}
                    onError={handleError}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="aspect-[4/3] bg-black rounded-lg overflow-hidden">
                      <img 
                        src={imagePreview} 
                        alt="Captured watermelon"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  {/* Actions */}
                  <Button 
                    onClick={handleReset}
                    variant="outline"
                    className="w-full"
                  >
                    Foto Lagi
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Result Section */}
          <Card>
            <CardHeader>
              <CardTitle>Analysis Result</CardTitle>
              <CardDescription>
                Hasil analisis AI atau status antrian
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <RefreshCw className="h-12 w-12 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">
                    {!isOnline ? 'Menyimpan ke antrian...' : 'Menganalisis...'}
                  </p>
                </div>
              )}

              {error && !result && (
                <Alert variant={!isOnline ? 'default' : 'destructive'}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {result && (
                <AnalysisResult 
                  result={result}
                  onRetry={handleReset}
                />
              )}

              {!isLoading && !error && !result && (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
                  <Camera className="h-12 w-12 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Ambil foto untuk memulai analisis
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Debug Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-sm">Debug Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <p className="font-medium text-muted-foreground">Network</p>
                <p className="font-mono">{isOnline ? 'Online' : 'Offline'}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Queue Count</p>
                <p className="font-mono">{queueCount}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Syncing</p>
                <p className="font-mono">{isSyncing ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Has Result</p>
                <p className="font-mono">{result ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
