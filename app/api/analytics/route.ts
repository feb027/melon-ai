import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Vercel KV is optional - only used in production
let kv: any = null;
try {
  // Only import if environment variables are set
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    kv = require('@vercel/kv').kv;
  }
} catch (error) {
  console.log('Vercel KV not available, caching disabled');
}

/**
 * Analytics Data Aggregation API
 * 
 * GET /api/analytics
 * 
 * Query Parameters:
 * - startDate: ISO date string (default: 30 days ago)
 * - endDate: ISO date string (default: now)
 * - location: Filter by location (optional)
 * - watermelonType: Filter by type (optional)
 * 
 * Returns aggregated analytics data with caching (15 min TTL)
 */

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
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse query parameters
    const endDate = searchParams.get('endDate') || new Date().toISOString();
    const startDate = searchParams.get('startDate') || 
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const location = searchParams.get('location');
    const watermelonType = searchParams.get('watermelonType');
    
    // Generate cache key based on parameters
    const cacheKey = `analytics:${startDate}:${endDate}:${location || 'all'}:${watermelonType || 'all'}`;
    
    // Try to get from cache (if KV is available)
    if (kv) {
      try {
        const cached = await kv.get(cacheKey) as AnalyticsData | null;
        if (cached) {
          return NextResponse.json({
            success: true,
            data: cached,
            cached: true,
          });
        }
      } catch (error) {
        console.log('Cache read failed, continuing without cache:', error);
      }
    }
    
    // Create Supabase client
    const supabase = await createClient();
    
    // Build base query
    let query = supabase
      .from('analyses')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate);
    
    // Apply filters
    if (location) {
      query = query.eq('metadata->>location', location);
    }
    if (watermelonType) {
      query = query.eq('watermelon_type', watermelonType);
    }
    
    const { data: analyses, error } = await query;
    
    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Gagal mengambil data analitik',
            details: error.message,
          },
        },
        { status: 500 }
      );
    }
    
    if (!analyses || analyses.length === 0) {
      const emptyData: AnalyticsData = {
        totalAnalyses: 0,
        maturityRate: 0,
        averageSweetness: 0,
        averageConfidence: 0,
        typeDistribution: [],
        trendData: [],
        skinQualityDistribution: [],
      };
      
      return NextResponse.json({
        success: true,
        data: emptyData,
        cached: false,
      });
    }
    
    // Calculate aggregated metrics
    const totalAnalyses = analyses.length;
    const matureCount = analyses.filter(a => a.maturity_status === 'Matang').length;
    const maturityRate = Math.round((matureCount / totalAnalyses) * 100 * 100) / 100;
    
    const averageSweetness = Math.round(
      (analyses.reduce((sum, a) => sum + (a.sweetness_level || 0), 0) / totalAnalyses) * 100
    ) / 100;
    
    const averageConfidence = Math.round(
      (analyses.reduce((sum, a) => sum + (a.confidence || 0), 0) / totalAnalyses) * 100
    ) / 100;
    
    // Calculate type distribution
    const typeCount = analyses.reduce((acc, a) => {
      const type = a.watermelon_type as string;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const typeDistribution = Object.entries(typeCount)
      .map(([type, count]) => ({
        type,
        count: count as number,
        percentage: Math.round(((count as number) / totalAnalyses) * 100 * 100) / 100,
      }))
      .sort((a, b) => b.count - a.count);
    
    // Calculate skin quality distribution
    const qualityCount = analyses.reduce((acc, a) => {
      const quality = a.skin_quality as string;
      acc[quality] = (acc[quality] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const skinQualityDistribution = Object.entries(qualityCount)
      .map(([quality, count]) => ({
        quality,
        count: count as number,
        percentage: Math.round(((count as number) / totalAnalyses) * 100 * 100) / 100,
      }))
      .sort((a, b) => b.count - a.count);
    
    // Calculate trend data (group by date)
    const trendMap = analyses.reduce((acc, a) => {
      const createdAt = a.created_at as string | undefined;
      if (!createdAt) return acc;
      
      const dateStr = new Date(createdAt).toISOString().split('T')[0];
      if (!dateStr) return acc;
      
      if (!acc[dateStr]) {
        acc[dateStr] = { total: 0, mature: 0 };
      }
      acc[dateStr].total++;
      if (a.maturity_status === 'Matang') {
        acc[dateStr].mature++;
      }
      return acc;
    }, {} as Record<string, { total: number; mature: number }>);
    
    const trendData = Object.entries(trendMap)
      .map(([date, data]) => {
        const trendItem = data as { total: number; mature: number };
        return {
          date,
          total: trendItem.total,
          mature: trendItem.mature,
          maturityRate: Math.round((trendItem.mature / trendItem.total) * 100 * 100) / 100,
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 30); // Last 30 days
    
    const analyticsData: AnalyticsData = {
      totalAnalyses,
      maturityRate,
      averageSweetness,
      averageConfidence,
      typeDistribution,
      trendData,
      skinQualityDistribution,
    };
    
    // Cache the result for 15 minutes (900 seconds) if KV is available
    if (kv) {
      try {
        await kv.set(cacheKey, analyticsData, { ex: 900 });
      } catch (error) {
        console.log('Cache write failed, continuing without cache:', error);
      }
    }
    
    return NextResponse.json({
      success: true,
      data: analyticsData,
      cached: false,
    });
    
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Terjadi kesalahan saat memproses analitik',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}
