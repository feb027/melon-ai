import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/history
 * 
 * Fetches global analysis history (all analyses, no user filtering)
 * Supports pagination and filtering by maturity status and date range
 * 
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 12)
 * - maturityStatus: Filter by 'Matang' or 'Belum Matang' (optional)
 * - startDate: Filter analyses after this date (ISO string, optional)
 * - endDate: Filter analyses before this date (ISO string, optional)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const maturityStatus = searchParams.get('maturityStatus');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_PARAMETERS',
            message: 'Invalid pagination parameters',
          },
        },
        { status: 400 }
      );
    }

    const offset = (page - 1) * limit;
    const supabase = await createClient();

    // Build query
    let query = supabase
      .from('analyses')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (maturityStatus && (maturityStatus === 'Matang' || maturityStatus === 'Belum Matang')) {
      query = query.eq('maturity_status', maturityStatus);
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    // Execute query
    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to fetch analysis history',
            details: error.message,
          },
        },
        { status: 500 }
      );
    }

    // Calculate pagination metadata
    const totalPages = count ? Math.ceil(count / limit) : 0;
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return NextResponse.json({
      success: true,
      data: {
        analyses: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages,
          hasNextPage,
          hasPreviousPage,
        },
      },
    });
  } catch (error) {
    console.error('History API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      },
      { status: 500 }
    );
  }
}
