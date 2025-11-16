import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { analyzeImage, AIServiceError } from '@/lib/ai/orchestrator';
import { rateLimitSettings } from '@/lib/config';
import type { AnalysisMetadata } from '@/lib/types';

/**
 * Analysis API Route
 * 
 * Handles AI-powered watermelon analysis with the following features:
 * - Accepts image URL and user metadata
 * - Calls AI orchestrator service with automatic fallback
 * - Saves analysis result to Supabase database
 * - Implements rate limiting (100 requests/hour per user)
 * - Comprehensive error handling with user-friendly messages
 * 
 * Requirements: 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 6.1, 6.2
 */

// In-memory rate limiting store (for MVP - use Redis/Vercel KV in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Check if user has exceeded rate limit
 * @param userId - User ID to check
 * @returns true if rate limit exceeded, false otherwise
 */
function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitStore.get(userId);

  // If no record exists, create one
  if (!userLimit) {
    rateLimitStore.set(userId, {
      count: 1,
      resetTime: now + rateLimitSettings.windowMs,
    });
    return false;
  }

  // If reset time has passed, reset counter
  if (now > userLimit.resetTime) {
    rateLimitStore.set(userId, {
      count: 1,
      resetTime: now + rateLimitSettings.windowMs,
    });
    return false;
  }

  // Check if limit exceeded
  if (userLimit.count >= rateLimitSettings.requestsPerHour) {
    return true;
  }

  // Increment counter
  userLimit.count++;
  return false;
}

/**
 * Clean up expired rate limit entries (called periodically)
 */
function cleanupRateLimitStore(): void {
  const now = Date.now();
  for (const [userId, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(userId);
    }
  }
}

// Clean up every 5 minutes
setInterval(cleanupRateLimitStore, 5 * 60 * 1000);

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Parse request body
    const body = await request.json();
    const { imageUrl, userId, metadata } = body as {
      imageUrl?: string;
      userId?: string;
      metadata?: AnalysisMetadata;
    };

    // Validate required fields
    if (!imageUrl) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_IMAGE_URL',
            message: 'URL gambar tidak ditemukan.',
          },
        },
        { status: 400 }
      );
    }

    // userId is optional for demo (will be null if not provided)
    // In production with auth, this should be required

    // Validate image URL format
    try {
      new URL(imageUrl);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_IMAGE_URL',
            message: 'URL gambar tidak valid.',
          },
        },
        { status: 400 }
      );
    }

    // Check rate limit (skip if no userId for demo)
    if (userId && checkRateLimit(userId)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: `Anda telah mencapai batas maksimal ${rateLimitSettings.requestsPerHour} analisis per jam. Silakan coba lagi nanti.`,
          },
        },
        { status: 429 }
      );
    }

    console.log(`[Analysis API] Starting analysis for user ${userId}`);
    console.log(`[Analysis API] Image URL: ${imageUrl}`);

    // Call AI orchestrator to analyze image
    let aiResult;
    let aiProvider = 'unknown';
    let aiResponseTime = 0;

    try {
      const aiStartTime = Date.now();
      aiResult = await analyzeImage(imageUrl);
      aiResponseTime = Date.now() - aiStartTime;
      
      // Extract provider from the result (we'll need to track this in orchestrator)
      // For now, we'll use a placeholder - the orchestrator logs this internally
      aiProvider = 'gemini'; // This will be updated when we enhance the orchestrator
      
      console.log(`[Analysis API] AI analysis completed in ${aiResponseTime}ms`);
      console.log(`[Analysis API] Result: ${aiResult.maturityStatus} (${aiResult.confidence}% confidence)`);
    } catch (error) {
      console.error('[Analysis API] AI analysis failed:', error);

      if (error instanceof AIServiceError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'AI_SERVICE_ERROR',
              message: 'Layanan AI gagal menganalisis gambar. Silakan coba lagi.',
              details: error.message,
            },
          },
          { status: 503 }
        );
      }

      throw error; // Re-throw unexpected errors
    }

    // Extract image storage path from URL
    // Format: https://{project}.supabase.co/storage/v1/object/public/watermelon-images/{path}
    const imageStoragePath = imageUrl.split('/watermelon-images/')[1] || imageUrl;

    // Create Supabase client
    const supabase = await createClient();

    // Save analysis result to database
    const { data: analysisData, error: dbError } = await supabase
      .from('analyses')
      .insert({
        user_id: userId || null, // Allow null for demo without authentication
        image_url: imageUrl,
        image_storage_path: imageStoragePath,
        maturity_status: aiResult.maturityStatus,
        confidence: aiResult.confidence,
        sweetness_level: aiResult.sweetnessLevel,
        watermelon_type: aiResult.watermelonType,
        skin_quality: aiResult.skinQuality,
        ai_provider: aiProvider,
        ai_response_time: aiResponseTime,
        reasoning: aiResult.reasoning,
        metadata: metadata || null,
      })
      .select()
      .single();

    if (dbError) {
      console.error('[Analysis API] Database error:', dbError);
      
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Gagal menyimpan hasil analisis. Silakan coba lagi.',
            details: dbError.message,
          },
        },
        { status: 500 }
      );
    }

    const totalTime = Date.now() - startTime;
    console.log(`[Analysis API] ✓ Analysis completed successfully in ${totalTime}ms`);

    // Return success response with analysis result
    return NextResponse.json(
      {
        success: true,
        data: {
          id: analysisData.id,
          userId: analysisData.user_id,
          imageUrl: analysisData.image_url,
          imageStoragePath: analysisData.image_storage_path,
          maturityStatus: analysisData.maturity_status,
          confidence: analysisData.confidence,
          sweetnessLevel: analysisData.sweetness_level,
          watermelonType: analysisData.watermelon_type,
          skinQuality: analysisData.skin_quality,
          aiProvider: analysisData.ai_provider,
          aiResponseTime: analysisData.ai_response_time,
          reasoning: analysisData.reasoning,
          metadata: analysisData.metadata as AnalysisMetadata | undefined,
          createdAt: new Date(analysisData.created_at!),
        },
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('[Analysis API] Unexpected error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Terjadi kesalahan pada server. Silakan coba lagi.',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}
