/**
 * Metrics collection and monitoring utilities
 * Tracks performance, errors, and system health
 */

import { createClient } from '@/lib/supabase/client';

export interface SystemMetrics {
  totalAnalyses: number;
  successRate: number;
  averageResponseTime: number;
  errorCount: number;
  aiProviderStats: {
    provider: string;
    successRate: number;
    averageResponseTime: number;
    usageCount: number;
  }[];
}

/**
 * Get system metrics for monitoring dashboard
 */
export async function getSystemMetrics(timeRange: '1h' | '24h' | '7d' | '30d' = '24h'): Promise<SystemMetrics> {
  const supabase = createClient();
  
  // Calculate time range
  const now = new Date();
  const startTime = new Date();
  
  switch (timeRange) {
    case '1h':
      startTime.setHours(now.getHours() - 1);
      break;
    case '24h':
      startTime.setDate(now.getDate() - 1);
      break;
    case '7d':
      startTime.setDate(now.getDate() - 7);
      break;
    case '30d':
      startTime.setDate(now.getDate() - 30);
      break;
  }

  try {
    // Get AI performance logs
    const { data: aiLogs, error: aiError } = await supabase
      .from('ai_performance_logs')
      .select('*')
      .gte('timestamp', startTime.toISOString());

    if (aiError) throw aiError;

    // Calculate metrics
    const totalAnalyses = aiLogs?.length || 0;
    const successfulAnalyses = aiLogs?.filter(log => log.success).length || 0;
    const successRate = totalAnalyses > 0 ? (successfulAnalyses / totalAnalyses) * 100 : 0;
    
    const totalResponseTime = aiLogs?.reduce((sum, log) => sum + (log.response_time || 0), 0) || 0;
    const averageResponseTime = totalAnalyses > 0 ? totalResponseTime / totalAnalyses : 0;
    
    const errorCount = totalAnalyses - successfulAnalyses;

    // Calculate per-provider stats
    const providerMap = new Map<string, { success: number; total: number; totalTime: number }>();
    
    aiLogs?.forEach(log => {
      const stats = providerMap.get(log.provider) || { success: 0, total: 0, totalTime: 0 };
      stats.total++;
      stats.totalTime += log.response_time || 0;
      if (log.success) stats.success++;
      providerMap.set(log.provider, stats);
    });

    const aiProviderStats = Array.from(providerMap.entries()).map(([provider, stats]) => ({
      provider,
      successRate: (stats.success / stats.total) * 100,
      averageResponseTime: stats.totalTime / stats.total,
      usageCount: stats.total,
    }));

    return {
      totalAnalyses,
      successRate,
      averageResponseTime,
      errorCount,
      aiProviderStats,
    };
  } catch (error) {
    console.error('Error fetching system metrics:', error);
    return {
      totalAnalyses: 0,
      successRate: 0,
      averageResponseTime: 0,
      errorCount: 0,
      aiProviderStats: [],
    };
  }
}

/**
 * Get error logs for monitoring
 */
export async function getRecentErrors(limit: number = 50) {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('error_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching error logs:', error);
    return [];
  }
}

/**
 * Track custom event for analytics
 */
export function trackEvent(eventName: string, properties?: Record<string, any>): void {
  // In production with Vercel Analytics, events are automatically tracked
  // This function can be extended to send custom events
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    // Custom event tracking can be added here
    console.log('Event tracked:', eventName, properties);
  }
}

/**
 * Track page view
 */
export function trackPageView(pageName: string, properties?: Record<string, any>): void {
  trackEvent('page_view', { page: pageName, ...properties });
}

/**
 * Track user action
 */
export function trackUserAction(action: string, properties?: Record<string, any>): void {
  trackEvent('user_action', { action, ...properties });
}
