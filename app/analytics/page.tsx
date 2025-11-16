'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell 
} from 'recharts';
import { Filter, TrendingUp, Lightbulb, CheckCircle2, AlertCircle, Info, Download, Loader2 } from 'lucide-react';
import { generateInsights, type Insight } from '@/lib/analytics/insights';
import { toast } from 'sonner';

interface AnalyticsData {
  totalAnalyses: number;
  maturityRate: number;
  averageSweetness: number;
  averageConfidence: number;
  typeDistribution: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  trendData: Array<{
    date: string;
    total: number;
    mature: number;
    maturityRate: number;
  }>;
  skinQualityDistribution: Array<{
    quality: string;
    count: number;
    percentage: number;
  }>;
  sweetnessDistribution: Array<{
    level: string;
    count: number;
    percentage: number;
  }>;
}

interface FilterState {
  startDate: string;
  endDate: string;
  location: string;
  watermelonType: string;
}

// Color palette for charts
const COLORS = {
  primary: '#10b981', // green
  secondary: '#f59e0b', // orange
  tertiary: '#3b82f6', // blue
  quaternary: '#8b5cf6', // purple
  quinary: '#ec4899', // pink
};

const PIE_COLORS = [COLORS.primary, COLORS.secondary, COLORS.tertiary, COLORS.quaternary, COLORS.quinary];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] || '',
    endDate: new Date().toISOString().split('T')[0] || '',
    location: '',
    watermelonType: '',
  });

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append('startDate', new Date(filters.startDate).toISOString());
      params.append('endDate', new Date(filters.endDate).toISOString());
      
      if (filters.location) {
        params.append('location', filters.location);
      }
      if (filters.watermelonType) {
        params.append('watermelonType', filters.watermelonType);
      }

      const response = await fetch(`/api/analytics?${params.toString()}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Gagal mengambil data analitik');
      }

      setData(result.data);
      
      // Generate insights from analytics data
      if (result.data) {
        const generatedInsights = generateInsights(result.data);
        setInsights(generatedInsights);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleApplyFilters = () => {
    fetchAnalytics();
  };

  const handleResetFilters = () => {
    setFilters({
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] || '',
      endDate: new Date().toISOString().split('T')[0] || '',
      location: '',
      watermelonType: '',
    });
  };

  const handleExportPDF = async () => {
    setExportLoading(true);

    try {
      const response = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: filters.startDate,
          endDate: filters.endDate,
          location: filters.location || undefined,
          watermelonType: filters.watermelonType || undefined,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Gagal membuat PDF');
      }

      // Download the PDF
      const link = document.createElement('a');
      link.href = result.data.downloadUrl;
      link.download = result.data.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('PDF berhasil dibuat', {
        description: 'Laporan akan kedaluwarsa dalam 1 jam',
      });
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Gagal membuat PDF', {
        description: err instanceof Error ? err.message : 'Terjadi kesalahan',
      });
    } finally {
      setExportLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-3 space-y-3">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-3 grid-cols-2">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-3">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={fetchAnalytics} className="mt-3 w-full">
          Coba Lagi
        </Button>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Analitik</h1>
          <p className="text-muted-foreground">
            Statistik dan tren analisis semangka
          </p>
        </div>
        <Button 
          onClick={handleExportPDF} 
          disabled={exportLoading || !data}
          className="w-full md:w-auto"
        >
          {exportLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Membuat PDF...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Ekspor PDF
            </>
          )}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label htmlFor="startDate" className="text-sm font-medium">
                Tanggal Mulai
              </label>
              <input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="endDate" className="text-sm font-medium">
                Tanggal Akhir
              </label>
              <input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-medium">
                Lokasi
              </label>
              <input
                id="location"
                type="text"
                placeholder="Semua lokasi"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="watermelonType" className="text-sm font-medium">
                Jenis Semangka
              </label>
              <select
                id="watermelonType"
                value={filters.watermelonType}
                onChange={(e) => setFilters({ ...filters, watermelonType: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Semua jenis</option>
                <option value="merah">Merah</option>
                <option value="kuning">Kuning</option>
                <option value="mini">Mini</option>
                <option value="inul">Inul</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex gap-2">
            <Button onClick={handleApplyFilters}>
              Terapkan Filter
            </Button>
            <Button variant="outline" onClick={handleResetFilters}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Analisis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.totalAnalyses}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tingkat Kematangan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{data.maturityRate}%</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Rata-rata Kemanisan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.averageSweetness}/10</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Rata-rata Confidence</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.averageConfidence}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Insights & Recommendations */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Wawasan & Rekomendasi
            </CardTitle>
            <CardDescription>
              Analisis otomatis berdasarkan data historis Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.slice(0, 5).map((insight) => {
                // Determine icon and variant based on insight type
                let Icon = Info;
                let variant: 'default' | 'destructive' = 'default';
                
                if (insight.type === 'success') {
                  Icon = CheckCircle2;
                } else if (insight.type === 'warning') {
                  Icon = AlertCircle;
                  variant = 'destructive';
                } else if (insight.type === 'tip') {
                  Icon = Lightbulb;
                }
                
                return (
                  <Alert key={insight.id} variant={variant}>
                    <Icon className="h-4 w-4" />
                    <AlertTitle>{insight.title}</AlertTitle>
                    <AlertDescription>
                      <p className="mb-2">{insight.description}</p>
                      {insight.recommendation && (
                        <div className="mt-3 rounded-md bg-muted/50 p-3">
                          <p className="text-sm font-medium flex items-start gap-2">
                            <Lightbulb className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span>{insight.recommendation}</span>
                          </p>
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Tabs */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">Tren</TabsTrigger>
          <TabsTrigger value="types">Jenis</TabsTrigger>
          <TabsTrigger value="sweetness">Kemanisan</TabsTrigger>
          <TabsTrigger value="quality">Kualitas</TabsTrigger>
        </TabsList>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Tren Tingkat Kematangan
              </CardTitle>
              <CardDescription>
                Persentase semangka matang dalam 30 hari terakhir
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={data.trendData.slice().reverse()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString('id-ID')}
                    formatter={(value: number) => [`${value}%`, 'Tingkat Kematangan']}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="maturityRate" 
                    stroke={COLORS.primary} 
                    strokeWidth={2}
                    name="Tingkat Kematangan (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Types Tab */}
        <TabsContent value="types" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Distribusi Jenis Semangka</CardTitle>
                <CardDescription>Persentase berdasarkan jenis</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.typeDistribution}
                      dataKey="count"
                      nameKey="type"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {data.typeDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Jumlah per Jenis</CardTitle>
                <CardDescription>Total analisis per jenis semangka</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.typeDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill={COLORS.primary} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sweetness Tab */}
        <TabsContent value="sweetness" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Distribusi Tingkat Kemanisan</CardTitle>
                <CardDescription>Persentase berdasarkan tingkat kemanisan</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.sweetnessDistribution}
                      dataKey="count"
                      nameKey="level"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {data.sweetnessDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Jumlah per Tingkat Kemanisan</CardTitle>
                <CardDescription>Total analisis per tingkat kemanisan</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.sweetnessDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="level" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill={COLORS.tertiary} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Quality Tab */}
        <TabsContent value="quality" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Distribusi Kualitas Kulit</CardTitle>
                <CardDescription>Persentase berdasarkan kualitas</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.skinQualityDistribution}
                      dataKey="count"
                      nameKey="quality"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {data.skinQualityDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Jumlah per Kualitas</CardTitle>
                <CardDescription>Total analisis per kualitas kulit</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.skinQualityDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="quality" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill={COLORS.secondary} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
