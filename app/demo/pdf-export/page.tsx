'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function PDFExportDemoPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    downloadUrl: string;
    fileName: string;
    expiresAt: string;
  } | null>(null);

  const handleExport = async () => {
    setLoading(true);
    setResult(null);

    try {
      // Use last 30 days as default
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const response = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error?.message || 'Gagal membuat PDF');
      }

      setResult(data.data);
      toast.success('PDF berhasil dibuat!', {
        description: 'Klik tombol download untuk mengunduh laporan',
      });
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Gagal membuat PDF', {
        description: error instanceof Error ? error.message : 'Terjadi kesalahan',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (result) {
      const link = document.createElement('a');
      link.href = result.downloadUrl;
      link.download = result.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Demo: PDF Export</h1>
        <p className="text-muted-foreground">
          Test ekspor laporan analitik ke format PDF
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ekspor Laporan Analitik</CardTitle>
          <CardDescription>
            Membuat laporan PDF untuk 30 hari terakhir
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Isi Laporan:</h3>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Ringkasan metrik (total analisis, tingkat kematangan, dll)</li>
              <li>Distribusi jenis semangka</li>
              <li>Distribusi kualitas kulit</li>
              <li>10 analisis terbaru</li>
            </ul>
          </div>

          <Button
            onClick={handleExport}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Membuat PDF...
              </>
            ) : (
              <>
                <Download className="mr-2 h-5 w-5" />
                Buat Laporan PDF
              </>
            )}
          </Button>

          {result && (
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="flex-1 space-y-3">
                    <div>
                      <p className="font-semibold">PDF Berhasil Dibuat!</p>
                      <p className="text-sm text-muted-foreground">
                        File: {result.fileName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Kedaluwarsa: {new Date(result.expiresAt).toLocaleString('id-ID')}
                      </p>
                    </div>
                    <Button onClick={handleDownload} className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-blue-900">Informasi:</p>
                <ul className="mt-1 text-blue-800 space-y-1">
                  <li>• Link download berlaku selama 1 jam</li>
                  <li>• PDF disimpan di Supabase Storage bucket "reports"</li>
                  <li>• Memerlukan data analisis di database (saat ini: 12 data)</li>
                  <li>• Storage bucket sudah dikonfigurasi dengan RLS policies</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Cara Kerja</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Fetch data analisis dari Supabase (30 hari terakhir)</li>
            <li>Hitung metrik analitik (tingkat kematangan, rata-rata, dll)</li>
            <li>Generate PDF menggunakan @react-pdf/renderer</li>
            <li>Upload PDF ke Supabase Storage</li>
            <li>Buat signed URL yang berlaku 1 jam</li>
            <li>Return URL download ke client</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
