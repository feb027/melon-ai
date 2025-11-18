'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Calendar, Filter, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { AnalysisResult } from '@/components/analysis-result';
import type { Analysis, MaturityStatus, FruitType, FruitVariety, SkinQuality, AnalysisMetadata } from '@/lib/types';

interface HistoryResponse {
  success: boolean;
  data?: {
    analyses: Analysis[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
  error?: {
    code: string;
    message: string;
  };
}

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Filters
  const [maturityFilter, setMaturityFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  // Fetch analyses
  const fetchAnalyses = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
      });

      if (maturityFilter !== 'all') {
        params.append('maturityStatus', maturityFilter);
      }

      const response = await fetch(`/api/history?${params.toString()}`);
      const result: HistoryResponse = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error?.message || 'Failed to fetch history');
      }

      setAnalyses(result.data.analyses);
      setPagination({
        total: result.data.pagination.total,
        totalPages: result.data.pagination.totalPages,
        hasNextPage: result.data.pagination.hasNextPage,
        hasPreviousPage: result.data.pagination.hasPreviousPage,
      });
    } catch (err) {
      console.error('Failed to fetch analyses:', err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchAnalyses();
  }, [page, maturityFilter]);

  // Handle analysis click
  const handleAnalysisClick = (analysis: Analysis) => {
    setSelectedAnalysis(analysis);
    setDialogOpen(true);
  };

  // Format date
  const formatDate = (date: string | Date | null) => {
    if (!date) return 'Tanggal tidak tersedia';
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(date));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Riwayat Analisis</h1>
          <p className="text-muted-foreground">
            Lihat semua hasil analisis semangka yang telah dilakukan
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Select value={maturityFilter} onValueChange={(value) => {
              setMaturityFilter(value);
              setPage(1); // Reset to first page
            }}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="Matang">Matang</SelectItem>
                <SelectItem value="Belum Matang">Belum Matang</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Total count */}
          <div className="flex items-center text-sm text-muted-foreground">
            <Search className="mr-2 h-4 w-4" />
            {pagination.total} hasil ditemukan
          </div>
        </div>

        {/* Error State */}
        {error && (
          <Card className="mb-6 border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive text-center">{error}</p>
              <Button
                onClick={fetchAnalyses}
                variant="outline"
                className="mt-4 mx-auto block"
              >
                Coba Lagi
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="w-full aspect-video rounded-lg mb-3" />
                  <Skeleton className="h-6 w-24 mb-2" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && analyses.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Belum Ada Riwayat</h3>
              <p className="text-muted-foreground mb-4">
                Belum ada analisis yang dilakukan. Mulai analisis pertama Anda!
              </p>
              <Button asChild>
                <a href="/">Mulai Analisis</a>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Grid View */}
        {!loading && !error && analyses.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
              {analyses.map((analysis) => (
                <Card
                  key={analysis.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleAnalysisClick(analysis)}
                >
                  <CardContent className="p-4">
                    {/* Thumbnail */}
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted mb-3">
                      <Image
                        src={analysis.image_url}
                        alt="Foto semangka"
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    </div>

                    {/* Status Badge */}
                    <Badge
                      variant={analysis.maturity_status === 'Matang' ? 'default' : 'secondary'}
                      className="mb-2"
                    >
                      {analysis.maturity_status}
                    </Badge>

                    {/* Details */}
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Kemanisan:</span>
                        <span className="font-medium">{analysis.sweetness_level}/10</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Jenis:</span>
                        <span className="font-medium capitalize">{analysis.watermelon_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Keyakinan:</span>
                        <span className="font-medium">{Math.round(Number(analysis.confidence))}%</span>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                      <Calendar className="inline h-3 w-3 mr-1" />
                      {formatDate(analysis.created_at)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                Halaman {page} dari {pagination.totalPages}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!pagination.hasPreviousPage || loading}
                >
                  Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!pagination.hasNextPage || loading}
                >
                  Selanjutnya
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Detail Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detail Analisis</DialogTitle>
            </DialogHeader>
            {selectedAnalysis && (
              <AnalysisResult
                result={{
                  id: selectedAnalysis.id,
                  userId: selectedAnalysis.user_id,
                  imageUrl: selectedAnalysis.image_url,
                  imageStoragePath: selectedAnalysis.image_storage_path,
                  fruitType: (selectedAnalysis.watermelon_type?.split(':')[0] || 'semangka') as FruitType,
                  maturityStatus: selectedAnalysis.maturity_status as MaturityStatus,
                  confidence: Number(selectedAnalysis.confidence),
                  sweetnessLevel: selectedAnalysis.sweetness_level,
                  fruitVariety: (selectedAnalysis.watermelon_type?.split(':')[1] || selectedAnalysis.watermelon_type) as FruitVariety,
                  skinQuality: selectedAnalysis.skin_quality as SkinQuality,
                  aiProvider: selectedAnalysis.ai_provider,
                  aiResponseTime: selectedAnalysis.ai_response_time,
                  reasoning: selectedAnalysis.reasoning || null,
                  metadata: selectedAnalysis.metadata as AnalysisMetadata | undefined,
                  createdAt: new Date(selectedAnalysis.created_at || Date.now()),
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
