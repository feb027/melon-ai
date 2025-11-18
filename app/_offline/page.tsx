import { WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <WifiOff className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle>Anda Sedang Offline</CardTitle>
          <CardDescription>
            Koneksi internet tidak tersedia. Beberapa fitur mungkin tidak dapat diakses.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 text-sm">
            <p className="mb-2 font-medium">Yang Masih Bisa Dilakukan:</p>
            <ul className="list-inside list-disc space-y-1 text-muted-foreground">
              <li>Ambil foto (akan diunggah saat online)</li>
              <li>Lihat hasil analisis sebelumnya</li>
              <li>Jelajahi aplikasi</li>
            </ul>
          </div>
          
          <div className="rounded-lg border border-warning/20 bg-warning/10 p-4 text-sm">
            <p className="mb-2 font-medium text-warning-foreground">Catatan:</p>
            <p className="text-muted-foreground">
              Foto yang diambil saat offline akan otomatis diunggah dan dianalisis ketika koneksi internet kembali tersedia.
            </p>
          </div>

          <Button 
            className="w-full" 
            onClick={() => window.location.reload()}
          >
            Coba Lagi
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
