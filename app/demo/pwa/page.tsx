import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PWAInstallPrompt } from '@/components/pwa-install-prompt';
import { CheckCircle2, Wifi, WifiOff, Download, Smartphone } from 'lucide-react';

export default function PWADemoPage() {
  return (
    <div className="py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">PWA Demo</h1>
        <p className="text-muted-foreground">
          Progressive Web App features demonstration
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* PWA Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              PWA Configuration
            </CardTitle>
            <CardDescription>
              MelonAI is configured as a Progressive Web App
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Service Worker</span>
                <Badge variant="secondary">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Manifest</span>
                <Badge variant="secondary">Configured</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Offline Support</span>
                <Badge variant="secondary">Ready</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Install Prompt</span>
                <Badge variant="secondary">Available</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              PWA Features
            </CardTitle>
            <CardDescription>
              What you get with MelonAI PWA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Download className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">Installable</p>
                  <p className="text-xs text-muted-foreground">
                    Add to home screen for quick access
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <WifiOff className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">Offline Mode</p>
                  <p className="text-xs text-muted-foreground">
                    Works without internet connection
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Wifi className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">Auto Sync</p>
                  <p className="text-xs text-muted-foreground">
                    Syncs data when connection is restored
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">Fast & Reliable</p>
                  <p className="text-xs text-muted-foreground">
                    Cached assets for instant loading
                  </p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Installation Instructions */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>How to Install</CardTitle>
            <CardDescription>
              Install MelonAI on your device for the best experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="mb-2 font-medium">Android (Chrome)</h4>
              <ol className="list-inside list-decimal space-y-1 text-sm text-muted-foreground">
                <li>Tap the menu icon (⋮) in the top right</li>
                <li>Select "Add to Home screen" or "Install app"</li>
                <li>Follow the prompts to install</li>
              </ol>
            </div>
            <div>
              <h4 className="mb-2 font-medium">iOS (Safari)</h4>
              <ol className="list-inside list-decimal space-y-1 text-sm text-muted-foreground">
                <li>Tap the Share button (square with arrow)</li>
                <li>Scroll down and tap "Add to Home Screen"</li>
                <li>Tap "Add" to confirm</li>
              </ol>
            </div>
            <div>
              <h4 className="mb-2 font-medium">Desktop (Chrome/Edge)</h4>
              <ol className="list-inside list-decimal space-y-1 text-sm text-muted-foreground">
                <li>Click the install icon in the address bar</li>
                <li>Or go to menu → "Install MelonAI"</li>
                <li>Click "Install" to confirm</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Offline Test */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Test Offline Mode</CardTitle>
            <CardDescription>
              Try these steps to test offline functionality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-inside list-decimal space-y-2 text-sm">
              <li>Open DevTools (F12) and go to the Network tab</li>
              <li>Check "Offline" to simulate no internet connection</li>
              <li>Navigate to <code className="rounded bg-muted px-1 py-0.5">/camera</code> or other pages</li>
              <li>You should see the offline fallback page at <code className="rounded bg-muted px-1 py-0.5">/_offline</code></li>
              <li>Uncheck "Offline" to restore connection</li>
            </ol>
          </CardContent>
        </Card>
      </div>

      {/* Install Prompt Component */}
      <PWAInstallPrompt />
    </div>
  );
}
