import Link from 'next/link';
import { History, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * History Demo Page
 * 
 * Demonstrates the analysis history feature with links to the actual page
 */
export default function HistoryDemoPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Demo: Riwayat Analisis</h1>
          <p className="text-muted-foreground">
            Halaman riwayat menampilkan semua hasil analisis semangka yang telah dilakukan
          </p>
        </div>

        <div className="space-y-6">
          {/* Feature Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Fitur Riwayat Analisis
              </CardTitle>
              <CardDescription>
                Lihat semua hasil analisis dengan filter dan pagination
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Fitur Utama:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Tampilan grid responsif dengan thumbnail gambar</li>
                  <li>Filter berdasarkan status kematangan (Matang/Belum Matang)</li>
                  <li>Pagination untuk navigasi hasil (12 item per halaman)</li>
                  <li>Detail lengkap saat klik pada analisis</li>
                  <li>Desain mobile-first yang responsif</li>
                  <li>Loading states dengan skeleton loaders</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Informasi yang Ditampilkan:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Foto semangka (thumbnail)</li>
                  <li>Status kematangan dengan badge berwarna</li>
                  <li>Tingkat kemanisan (1-10)</li>
                  <li>Jenis semangka</li>
                  <li>Tingkat keyakinan AI</li>
                  <li>Tanggal dan waktu analisis</li>
                </ul>
              </div>

              <div className="pt-4">
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link href="/history">
                    Buka Halaman Riwayat
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* API Information */}
          <Card>
            <CardHeader>
              <CardTitle>API Endpoint</CardTitle>
              <CardDescription>
                GET /api/history - Mengambil data riwayat analisis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Query Parameters:</h3>
                <div className="bg-muted p-3 rounded-lg text-sm font-mono space-y-1">
                  <div>page: number (default: 1)</div>
                  <div>limit: number (default: 12, max: 100)</div>
                  <div>maturityStatus: &quot;Matang&quot; | &quot;Belum Matang&quot; (optional)</div>
                  <div>startDate: ISO string (optional)</div>
                  <div>endDate: ISO string (optional)</div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Contoh Request:</h3>
                <div className="bg-muted p-3 rounded-lg text-sm font-mono">
                  GET /api/history?page=1&limit=12&maturityStatus=Matang
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Response:</h3>
                <div className="bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto">
                  <pre>{`{
  "success": true,
  "data": {
    "analyses": [...],
    "pagination": {
      "page": 1,
      "limit": 12,
      "total": 50,
      "totalPages": 5,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}`}</pre>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technical Details */}
          <Card>
            <CardHeader>
              <CardTitle>Detail Teknis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Frontend:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Next.js 16 App Router</li>
                    <li>• Client Component (use client)</li>
                    <li>• shadcn/ui components</li>
                    <li>• Responsive grid layout</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Backend:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Next.js API Route</li>
                    <li>• Supabase PostgreSQL</li>
                    <li>• Server-side pagination</li>
                    <li>• Query filtering</li>
                  </ul>
                </div>
              </div>

              <div className="pt-2">
                <h4 className="font-semibold mb-2 text-sm">Komponen yang Digunakan:</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-muted rounded text-xs">Card</span>
                  <span className="px-2 py-1 bg-muted rounded text-xs">Badge</span>
                  <span className="px-2 py-1 bg-muted rounded text-xs">Button</span>
                  <span className="px-2 py-1 bg-muted rounded text-xs">Select</span>
                  <span className="px-2 py-1 bg-muted rounded text-xs">Dialog</span>
                  <span className="px-2 py-1 bg-muted rounded text-xs">Skeleton</span>
                  <span className="px-2 py-1 bg-muted rounded text-xs">Next Image</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Requirements Fulfilled</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400">✓</span>
                  <span>
                    <strong>Requirement 10.3:</strong> Display analysis history with thumbnails
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400">✓</span>
                  <span>
                    <strong>Requirement 10.4:</strong> Filter by maturity status and date
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400">✓</span>
                  <span>
                    Global access (no user authentication required)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400">✓</span>
                  <span>
                    Pagination support for large datasets
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400">✓</span>
                  <span>
                    Detail view on click with full analysis information
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400">✓</span>
                  <span>
                    Mobile-first responsive design
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
