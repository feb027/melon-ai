/**
 * Integration tests for Feedback API
 * Tests feedback submission, validation, and error handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from '@/app/api/feedback/route';
import { NextRequest } from 'next/server';

// Create mock functions
const createMockSupabaseClient = () => {
  const mockSingle = vi.fn();
  const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
  const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
  const mockInsert = vi.fn();
  
  const mockFrom = vi.fn((table: string) => {
    if (table === 'analyses') {
      return { select: mockSelect };
    }
    if (table === 'feedbacks') {
      return {
        select: mockSelect,
        insert: mockInsert,
      };
    }
    return {};
  });
  
  return {
    from: mockFrom,
    mockSingle,
    mockInsert,
  };
};

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(),
}));

describe('POST /api/feedback', () => {
  const mockAnalysisId = '123e4567-e89b-12d3-a456-426614174000';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should successfully submit feedback', async () => {
    const { createClient } = await import('@supabase/supabase-js');
    const { mockSingle, mockInsert } = createMockSupabaseClient();
    
    vi.mocked(createClient).mockReturnValue(createMockSupabaseClient() as any);
    
    // Mock no existing feedback
    mockSingle
      .mockResolvedValueOnce({
        data: { id: mockAnalysisId, user_id: 'user-123' },
        error: null,
      })
      .mockResolvedValueOnce({
        data: null,
        error: null,
      });

    // Mock successful insert
    mockInsert.mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: { id: 'feedback-123' },
          error: null,
        }),
      }),
    });

    const request = new NextRequest('http://localhost:3000/api/feedback', {
      method: 'POST',
      body: JSON.stringify({
        analysisId: mockAnalysisId,
        isAccurate: true,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('id');
    expect(data.data).toHaveProperty('message');
    expect(data.data.message).toContain('Terima kasih');
  });

  it('should reject invalid analysis ID format', async () => {
    const request = new NextRequest('http://localhost:3000/api/feedback', {
      method: 'POST',
      body: JSON.stringify({
        analysisId: 'invalid-uuid',
        isAccurate: true,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });

  it('should reject missing analysisId', async () => {
    const request = new NextRequest('http://localhost:3000/api/feedback', {
      method: 'POST',
      body: JSON.stringify({
        isAccurate: true,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });

  it('should reject missing isAccurate field', async () => {
    const request = new NextRequest('http://localhost:3000/api/feedback', {
      method: 'POST',
      body: JSON.stringify({
        analysisId: mockAnalysisId,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });

  it('should reject notes longer than 200 characters', async () => {
    const longNotes = 'a'.repeat(201);

    const request = new NextRequest('http://localhost:3000/api/feedback', {
      method: 'POST',
      body: JSON.stringify({
        analysisId: mockAnalysisId,
        isAccurate: false,
        notes: longNotes,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });

  it('should reject invalid actualMaturity value', async () => {
    const request = new NextRequest('http://localhost:3000/api/feedback', {
      method: 'POST',
      body: JSON.stringify({
        analysisId: mockAnalysisId,
        isAccurate: false,
        actualMaturity: 'Invalid Status',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 404 when analysis not found', async () => {
    const { createClient } = await import('@supabase/supabase-js');
    const { mockSingle } = createMockSupabaseClient();
    
    vi.mocked(createClient).mockReturnValue(createMockSupabaseClient() as any);
    
    mockSingle.mockResolvedValueOnce({
      data: null,
      error: { message: 'Not found' },
    });

    const request = new NextRequest('http://localhost:3000/api/feedback', {
      method: 'POST',
      body: JSON.stringify({
        analysisId: mockAnalysisId,
        isAccurate: true,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('ANALYSIS_NOT_FOUND');
  });

  it('should return 409 when feedback already exists', async () => {
    const { createClient } = await import('@supabase/supabase-js');
    const { mockSingle } = createMockSupabaseClient();
    
    vi.mocked(createClient).mockReturnValue(createMockSupabaseClient() as any);
    
    mockSingle
      .mockResolvedValueOnce({
        data: { id: mockAnalysisId, user_id: 'user-123' },
        error: null,
      })
      .mockResolvedValueOnce({
        data: { id: 'existing-feedback-123' },
        error: null,
      });

    const request = new NextRequest('http://localhost:3000/api/feedback', {
      method: 'POST',
      body: JSON.stringify({
        analysisId: mockAnalysisId,
        isAccurate: true,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('FEEDBACK_ALREADY_EXISTS');
  });
});
