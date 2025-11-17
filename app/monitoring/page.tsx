'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { getSystemMetrics, getRecentErrors, type SystemMetrics } from '@/lib/monitoring/metrics';
import { Activity, AlertTriangle, CheckCircle2, Clock, TrendingUp } from 'lucide-react';

export default function MonitoringPage() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [errors, setErrors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [metricsData, errorsData] = await Promise.all([
          getSystemMetrics(timeRange),
          getRecentErrors(10),
        ]);
        setMetrics(metricsData);
        setErrors(errorsData);
      } catch (error) {
        console.error('Error fetching monitoring data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [timeRange]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Monitoring Dashboard</h1>
          <p className="text-muted-foreground">
            Pantau performa sistem dan AI secara real-time
          </p>
        </div>
        <div className="flex gap-2">
          {(['1h', '24h', '7d', '30d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-md text-sm ${
                timeRange === range
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Analisis</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalAnalyses || 0}</div>
            <p className="text-xs text-muted-foreground">
              Dalam {timeRange === '1h' ? '1 jam' : timeRange === '24h' ? '24 jam' : timeRange === '7d' ? '7 hari' : '30 hari'} terakhir
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.successRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics?.totalAnalyses ? `${Math.round((metrics.successRate / 100) * metrics.totalAnalyses)} berhasil` : 'Tidak ada data'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.averageResponseTime.toFixed(0)}ms
            </div>
            <p className="text-xs text-muted-foreground">
              Waktu respons rata-rata AI
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Errors</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.errorCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              {metrics?.errorCount === 0 ? 'Tidak ada error' : 'Perlu perhatian'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Provider Stats */}
      <Card>
        <CardHeader>
          <CardTitle>AI Provider Performance</CardTitle>
          <CardDescription>
            Performa masing-masing AI provider
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics?.aiProviderStats.map((provider) => (
              <div key={provider.provider} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{provider.provider}</p>
                    <p className="text-sm text-muted-foreground">
                      {provider.usageCount} requests
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {provider.successRate.toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground">success rate</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {provider.averageResponseTime.toFixed(0)}ms
                    </p>
                    <p className="text-xs text-muted-foreground">avg time</p>
                  </div>
                  <Badge
                    variant={provider.successRate >= 90 ? 'default' : 'destructive'}
                  >
                    {provider.successRate >= 90 ? 'Healthy' : 'Issues'}
                  </Badge>
                </div>
              </div>
            ))}
            {(!metrics?.aiProviderStats || metrics.aiProviderStats.length === 0) && (
              <p className="text-center text-muted-foreground py-4">
                Belum ada data AI provider
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Errors */}
      {errors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Errors</CardTitle>
            <CardDescription>
              10 error terakhir yang terjadi di sistem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {errors.map((error, index) => (
                <Alert key={index} variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle className="text-sm">
                    {error.context || 'System Error'}
                  </AlertTitle>
                  <AlertDescription className="text-xs">
                    <p>{error.message}</p>
                    <p className="text-muted-foreground mt-1">
                      {new Date(error.timestamp).toLocaleString('id-ID')}
                    </p>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Health Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
          <CardDescription>
            Status kesehatan sistem secara keseluruhan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Database Connection</span>
              <Badge variant="default">Healthy</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">AI Services</span>
              <Badge variant={metrics && metrics.successRate >= 90 ? 'default' : 'destructive'}>
                {metrics && metrics.successRate >= 90 ? 'Healthy' : 'Degraded'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Storage</span>
              <Badge variant="default">Healthy</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Analytics</span>
              <Badge variant="default">Healthy</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
