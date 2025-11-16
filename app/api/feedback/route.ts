import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
// Use service role key if available, otherwise use anon key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Validation schema for feedback submission
// Note: No user authentication required - system is for educational purposes only
const feedbackSchema = z.object({
  analysisId: z.string().uuid('Invalid analysis ID'),
  isAccurate: z.boolean(),
  notes: z.string().max(200, 'Notes must be 200 characters or less').optional(),
  actualMaturity: z.enum(['Matang', 'Belum Matang']).optional(),
});

export type FeedbackRequest = z.infer<typeof feedbackSchema>;

export interface FeedbackResponse {
  success: boolean;
  data?: {
    id: string;
    message: string;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * POST /api/feedback
 * 
 * Submit user feedback for AI analysis accuracy
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 * 
 * @param request - Feedback data (analysisId, userId, isAccurate, notes, actualMaturity)
 * @returns Success response with feedback ID or error
 */
export async function POST(request: NextRequest): Promise<NextResponse<FeedbackResponse>> {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = feedbackSchema.parse(body);

    // Verify analysis exists
    const { data: analysis, error: analysisError } = await supabase
      .from('analyses')
      .select('id, user_id')
      .eq('id', validatedData.analysisId)
      .single();

    if (analysisError || !analysis) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ANALYSIS_NOT_FOUND',
            message: 'Analisis tidak ditemukan',
            details: analysisError,
          },
        },
        { status: 404 }
      );
    }

    // Check if feedback already exists for this analysis
    const { data: existingFeedback } = await supabase
      .from('feedbacks')
      .select('id')
      .eq('analysis_id', validatedData.analysisId)
      .single();

    if (existingFeedback) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FEEDBACK_ALREADY_EXISTS',
            message: 'Feedback untuk analisis ini sudah ada',
          },
        },
        { status: 409 }
      );
    }

    // Insert feedback into database (no user_id required)
    const { data: feedback, error: insertError } = await supabase
      .from('feedbacks')
      .insert({
        analysis_id: validatedData.analysisId,
        user_id: null, // No user authentication in this system
        is_accurate: validatedData.isAccurate,
        notes: validatedData.notes || null,
        actual_maturity: validatedData.actualMaturity || null,
      })
      .select('id')
      .single();

    if (insertError || !feedback) {
      console.error('Failed to insert feedback:', insertError);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Gagal menyimpan feedback',
            details: insertError,
          },
        },
        { status: 500 }
      );
    }

    // Return success response
    return NextResponse.json(
      {
        success: true,
        data: {
          id: feedback.id,
          message: 'Terima kasih atas feedback Anda! Feedback Anda membantu kami meningkatkan akurasi AI.',
        },
      },
      { status: 201 }
    );
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Data tidak valid',
            details: error.issues,
          },
        },
        { status: 400 }
      );
    }

    // Handle unexpected errors
    console.error('Unexpected error in feedback API:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
            code: 'INTERNAL_ERROR',
            message: 'Terjadi kesalahan pada server',
          },
        },
        { status: 500 }
      );
  }
}
