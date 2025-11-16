/**
 * AI Orchestrator Service for MelonAI
 * 
 * Manages multiple AI providers with automatic fallback and retry logic.
 * Implements performance logging to Supabase for monitoring and optimization.
 * 
 * Features:
 * - Multi-provider fallback chain (Gemini → GPT-4 → Claude)
 * - Automatic retry with exponential backoff (max 2 retries per provider)
 * - Timeout handling (10 seconds max per provider)
 * - Performance logging to Supabase
 * - Structured output using Zod schema
 * - Error handling with detailed logging
 */

import { generateObject } from 'ai';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../database.types';
import {
  analysisPrompt,
  analysisSchema,
  getAvailableProviders,
  type AnalysisOutput,
  type AIProvider,
} from './providers';

/**
 * AI Service Error class for better error handling
 */
export class AIServiceError extends Error {
  constructor(
    message: string,
    public provider: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'AIServiceError';
  }
}

/**
 * Performance metrics for AI analysis
 */
interface PerformanceMetrics {
  provider: string;
  responseTime: number;
  success: boolean;
  promptTokens?: number;
  completionTokens?: number;
  errorMessage?: string;
}

/**
 * AI Provider Manager
 * Handles provider selection, fallback, retry logic, and performance logging
 */
export class AIProviderManager {
  private supabase: ReturnType<typeof createClient<Database>>;
  private maxRetriesPerProvider = 2;
  private timeoutMs = 10000; // 10 seconds

  constructor() {
    // Initialize Supabase client for performance logging
    this.supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  /**
   * Analyze watermelon image with automatic fallback and retry
   * 
   * @param imageUrl - Public URL of the watermelon image
   * @returns Analysis result with maturity status, confidence, sweetness, etc.
   * @throws {AIServiceError} When all AI providers fail
   */
  async analyzeImage(imageUrl: string): Promise<AnalysisOutput> {
    const providers = getAvailableProviders();

    if (providers.length === 0) {
      throw new AIServiceError(
        'No AI providers configured. Please set at least one API key.',
        'none'
      );
    }

    console.log(`[AI Orchestrator] Starting analysis with ${providers.length} provider(s)`);

    // Try each provider in priority order
    for (const provider of providers) {
      console.log(`[AI Orchestrator] Trying provider: ${provider.name} (priority ${provider.priority})`);

      // Retry logic for current provider
      for (let attempt = 1; attempt <= this.maxRetriesPerProvider; attempt++) {
        try {
          const result = await this.analyzeWithProvider(provider, imageUrl, attempt);
          console.log(`[AI Orchestrator] ✓ Success with ${provider.name} on attempt ${attempt}`);
          return result;
        } catch (error) {
          const isLastAttempt = attempt === this.maxRetriesPerProvider;
          const isLastProvider = provider === providers[providers.length - 1];

          console.error(
            `[AI Orchestrator] ✗ ${provider.name} failed (attempt ${attempt}/${this.maxRetriesPerProvider}):`,
            error instanceof Error ? error.message : 'Unknown error'
          );

          // If this is the last attempt with the last provider, throw error
          if (isLastAttempt && isLastProvider) {
            throw new AIServiceError(
              'All AI providers failed after retries',
              provider.name,
              error
            );
          }

          // If not the last attempt, wait before retry (exponential backoff)
          if (!isLastAttempt) {
            const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
            console.log(`[AI Orchestrator] Retrying in ${backoffMs}ms...`);
            await this.sleep(backoffMs);
          }
        }
      }

      // Move to next provider
      console.log(`[AI Orchestrator] Moving to next provider...`);
    }

    // This should never be reached due to the throw above, but TypeScript needs it
    throw new AIServiceError('All AI providers failed', 'all');
  }

  /**
   * Analyze image with a specific provider
   * Includes timeout handling and performance logging
   */
  private async analyzeWithProvider(
    provider: AIProvider,
    imageUrl: string,
    _attempt: number
  ): Promise<AnalysisOutput> {
    const startTime = Date.now();
    let metrics: PerformanceMetrics = {
      provider: provider.name,
      responseTime: 0,
      success: false,
    };

    try {
      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Timeout after ${this.timeoutMs}ms`));
        }, this.timeoutMs);
      });

      // Create analysis promise
      const analysisPromise = generateObject({
        model: provider.model,
        schema: analysisSchema,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: analysisPrompt },
              { type: 'image', image: imageUrl },
            ],
          },
        ],
        maxRetries: 0, // We handle retries ourselves
      });

      // Race between analysis and timeout
      const result = await Promise.race([analysisPromise, timeoutPromise]);

      // Calculate response time
      const responseTime = Date.now() - startTime;

      // Update metrics
      // Note: Vercel AI SDK v4+ uses inputTokens/outputTokens instead of promptTokens/completionTokens
      metrics = {
        provider: provider.name,
        responseTime,
        success: true,
        promptTokens: result.usage?.inputTokens,
        completionTokens: result.usage?.outputTokens,
      };

      // Log performance (non-blocking)
      this.logPerformance(metrics).catch(err => {
        console.error('[AI Orchestrator] Failed to log performance:', err);
      });

      return result.object;
    } catch (error) {
      // Calculate response time even for failures
      const responseTime = Date.now() - startTime;

      // Update metrics for failure
      metrics = {
        provider: provider.name,
        responseTime,
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };

      // Log performance (non-blocking)
      this.logPerformance(metrics).catch(err => {
        console.error('[AI Orchestrator] Failed to log performance:', err);
      });

      // Re-throw error for retry logic
      throw error;
    }
  }

  /**
   * Log performance metrics to Supabase
   * Non-blocking operation - errors are logged but don't affect analysis
   */
  private async logPerformance(metrics: PerformanceMetrics): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('ai_performance_logs')
        .insert({
          provider: metrics.provider,
          response_time: metrics.responseTime,
          success: metrics.success,
          prompt_tokens: metrics.promptTokens ?? null,
          completion_tokens: metrics.completionTokens ?? null,
          error_message: metrics.errorMessage ?? null,
        });

      if (error) {
        console.error('[AI Orchestrator] Supabase logging error:', error);
      } else {
        console.log(
          `[AI Orchestrator] Logged performance: ${metrics.provider} - ${metrics.responseTime}ms - ${metrics.success ? 'success' : 'failed'}`
        );
      }
    } catch (error) {
      console.error('[AI Orchestrator] Failed to log to Supabase:', error);
    }
  }

  /**
   * Sleep utility for retry backoff
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get provider statistics from Supabase
   * Useful for monitoring and optimization
   */
  async getProviderStatistics(limit = 100): Promise<{
    provider: string;
    totalRequests: number;
    successRate: number;
    avgResponseTime: number;
  }[]> {
    try {
      const { data, error } = await this.supabase
        .from('ai_performance_logs')
        .select('provider, response_time, success')
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) throw error;
      if (!data) return [];

      // Aggregate statistics by provider
      const stats = new Map<string, {
        total: number;
        successes: number;
        totalResponseTime: number;
      }>();

      for (const log of data) {
        const current = stats.get(log.provider) || {
          total: 0,
          successes: 0,
          totalResponseTime: 0,
        };

        current.total++;
        if (log.success) current.successes++;
        current.totalResponseTime += log.response_time;

        stats.set(log.provider, current);
      }

      // Convert to array format
      return Array.from(stats.entries()).map(([provider, data]) => ({
        provider,
        totalRequests: data.total,
        successRate: (data.successes / data.total) * 100,
        avgResponseTime: data.totalResponseTime / data.total,
      }));
    } catch (error) {
      console.error('[AI Orchestrator] Failed to get statistics:', error);
      return [];
    }
  }
}

/**
 * Singleton instance of AIProviderManager
 * Use this for all AI analysis operations
 */
export const aiOrchestrator = new AIProviderManager();

/**
 * Convenience function for analyzing watermelon images
 * 
 * @param imageUrl - Public URL of the watermelon image
 * @returns Analysis result
 * 
 * @example
 * ```typescript
 * const result = await analyzeImage('https://example.com/watermelon.jpg');
 * console.log(result.maturityStatus); // 'Matang' or 'Belum Matang'
 * console.log(result.confidence); // 0-100
 * console.log(result.sweetnessLevel); // 1-10
 * ```
 */
export async function analyzeImage(imageUrl: string): Promise<AnalysisOutput> {
  return aiOrchestrator.analyzeImage(imageUrl);
}
