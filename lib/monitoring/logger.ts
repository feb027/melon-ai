/**
 * Custom logging utility for MelonAI monitoring
 * Logs AI performance, errors, and system events to Supabase
 */

import { createClient } from '@/lib/supabase/client';

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  metadata?: Record<string, any>;
  timestamp?: Date;
}

export interface AIPerformanceLog {
  provider: string;
  responseTime: number;
  success: boolean;
  errorMessage?: string;
  promptTokens?: number;
  completionTokens?: number;
  imageUrl?: string;
  userId?: string;
}

/**
 * Log AI performance metrics to Supabase
 */
export async function logAIPerformance(log: AIPerformanceLog): Promise<void> {
  try {
    const supabase = createClient();
    
    const { error } = await supabase.from('ai_performance_logs').insert({
      provider: log.provider,
      response_time: log.responseTime,
      success: log.success,
      error_message: log.errorMessage,
      prompt_tokens: log.promptTokens,
      completion_tokens: log.completionTokens,
      image_url: log.imageUrl,
      user_id: log.userId,
      timestamp: new Date().toISOString(),
    });

    if (error) {
      console.error('Failed to log AI performance:', error);
    }
  } catch (error) {
    // Fail silently to not disrupt main application flow
    console.error('Error logging AI performance:', error);
  }
}

/**
 * Log general application events
 */
export async function logEvent(entry: LogEntry): Promise<void> {
  const timestamp = entry.timestamp || new Date();
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    const logFn = entry.level === 'error' ? console.error : 
                  entry.level === 'warn' ? console.warn : 
                  console.log;
    
    logFn(`[${timestamp.toISOString()}] [${entry.level.toUpperCase()}] ${entry.context ? `[${entry.context}] ` : ''}${entry.message}`, 
          entry.metadata || '');
  }

  // In production, you could send to external logging service
  // For now, we'll just use console and Supabase for critical errors
  if (entry.level === 'error' && process.env.NODE_ENV === 'production') {
    try {
      const supabase = createClient();
      
      await supabase.from('error_logs').insert({
        level: entry.level,
        message: entry.message,
        context: entry.context,
        metadata: entry.metadata,
        timestamp: timestamp.toISOString(),
      });
    } catch (error) {
      console.error('Failed to log error to Supabase:', error);
    }
  }
}

/**
 * Log error with stack trace
 */
export function logError(error: Error, context?: string, metadata?: Record<string, any>): void {
  logEvent({
    level: 'error',
    message: error.message,
    context,
    metadata: {
      ...metadata,
      stack: error.stack,
      name: error.name,
    },
  });
}

/**
 * Log warning
 */
export function logWarning(message: string, context?: string, metadata?: Record<string, any>): void {
  logEvent({
    level: 'warn',
    message,
    context,
    metadata,
  });
}

/**
 * Log info
 */
export function logInfo(message: string, context?: string, metadata?: Record<string, any>): void {
  logEvent({
    level: 'info',
    message,
    context,
    metadata,
  });
}

/**
 * Log debug (only in development)
 */
export function logDebug(message: string, context?: string, metadata?: Record<string, any>): void {
  if (process.env.NODE_ENV === 'development') {
    logEvent({
      level: 'debug',
      message,
      context,
      metadata,
    });
  }
}
