/**
 * Integration tests for Analysis API
 * Tests AI analysis flow, rate limiting, and error handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from '@/app/api/analyze/route';
import { NextRequest } from 'next/server';

// Mock AI orchestrator
vi.mock('@/lib/ai/orchestrator', () => ({
  analyzeImage: vi.fn(),
  AIServiceError: class AIServiceError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'AIServiceError';
    }
  },
}));

// Mock Supabase client
const mockInsert = vi.fn();
const mockSelect = vi.fn();
const mockSingle = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      insert: mockInsert,
    })),
  })),
}));

describe('POST /api/analyze', () => {
  const mockImageUrl = 'https://test.supabase.co/storage/v1/object/public/watermelon-images/test/123.jpg';
  const mockUserId = 'test-user-123';

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Get the mocked function
    const { analyzeImage } = await import('@/lib/ai/orchestrator');
    vi.mocked(analyzeImage).mockClear();
    
    // Setup default mock chain
    mockSingle.mockResolvedValue({
      data: {
        id: 'analysis-123',
        user_id: mockUserId,
        image_url: mockImageUrl,
        image_storage_path: 'test/123.jpg',
        maturity_status: 'Matang',
        confidence: 85,
        sweetness_level: 8,
        watermelon_type: 'merah',
        skin_quality: 'baik',
        ai_provider: 'gemini',
        ai_response_time: 2500,
        reasoning: 'Test reasoning',
        metadata: null,
        created_at: new Date().toISOString(),
      },
      error: null,
    });
    
    mockSelect.mockReturnValue({ single: mockSingle });
    mockInsert.mockReturnValue({ select: mockSelect });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should successfully analyze image', async () => {
    const { analyzeImage } = await import('@/lib/ai/orchestrator');
    
    const mockAnalysisResult = {
      maturityStatus: 'Matang' as const,
      confidence: 85,
      sweetnessLevel: 8,
      watermelonType: 'merah' as const,
      skinQuality: 'baik' as const,
      reasoning: 'Test reasoning',
    };

    vi.mocked(analyzeImage).mockResolvedValueOnce(mockAnalysisResult);

    const request = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify({
        imageUrl: mockImageUrl,
        userId: mockUserId,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('id');
    expect(data.data.maturityStatus).toBe('Matang');
    expect(data.data.confidence).toBe(85);
    expect(data.data.sweetnessLevel).toBe(8);
    expect(analyzeImage).toHaveBeenCalledWith(mockImageUrl);
    expect(mockInsert).toHaveBeenCalledTimes(1);
  });

  it('should work without userId for demo', async () => {
    const { analyzeImage } = await import('@/lib/ai/orchestrator');
    
    const mockAnalysisResult = {
      maturityStatus: 'Belum Matang' as const,
      confidence: 75,
      sweetnessLevel: 6,
      watermelonType: 'kuning' as const,
      skinQuality: 'sedang' as const,
      reasoning: 'Test reasoning',
    };

    vi.mocked(analyzeImage).mockResolvedValueOnce(mockAnalysisResult);

    mockSingle.mockResolvedValueOnce({
      data: {
        id: 'analysis-456',
        user_id: null,
        image_url: mockImageUrl,
        image_storage_path: 'demo/123.jpg',
        maturity_status: 'Belum Matang',
        confidence: 75,
        sweetness_level: 6,
        watermelon_type: 'kuning',
        skin_quality: 'sedang',
        ai_provider: 'gemini',
        ai_response_time: 2000,
        reasoning: 'Test reasoning',
        metadata: null,
        created_at: new Date().toISOString(),
      },
      error: null,
    });

    const request = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify({
        imageUrl: mockImageUrl,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.userId).toBeNull();
  });

  it('should include metadata when provided', async () => {
    const { analyzeImage } = await import('@/lib/ai/orchestrator');
    
    const mockAnalysisResult = {
      maturityStatus: 'Matang' as const,
      confidence: 90,
      sweetnessLevel: 9,
      watermelonType: 'merah' as const,
      skinQuality: 'baik' as const,
      reasoning: 'Test reasoning',
    };

    const metadata = {
      location: 'Jakarta',
      batchId: 'batch-001',
    };

    vi.mocked(analyzeImage).mockResolvedValueOnce(mockAnalysisResult);

    const request = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify({
        imageUrl: mockImageUrl,
        userId: mockUserId,
        metadata,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    
    // Verify metadata was passed to insert
    const insertCall = mockInsert.mock.calls[0][0];
    expect(insertCall.metadata).toEqual(metadata);
  });

  it('should reject request without imageUrl', async () => {
    const { analyzeImage } = await import('@/lib/ai/orchestrator');
    
    const request = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify({
        userId: mockUserId,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('MISSING_IMAGE_URL');
    expect(analyzeImage).not.toHaveBeenCalled();
  });

  it('should reject invalid imageUrl', async () => {
    const { analyzeImage } = await import('@/lib/ai/orchestrator');
    
    const request = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify({
        imageUrl: 'not-a-valid-url',
        userId: mockUserId,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INVALID_IMAGE_URL');
    expect(analyzeImage).not.toHaveBeenCalled();
  });

  it('should handle AI service error', async () => {
    const { analyzeImage, AIServiceError } = await import('@/lib/ai/orchestrator');
    vi.mocked(analyzeImage).mockRejectedValueOnce(
      new AIServiceError('All AI providers failed')
    );

    const request = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify({
        imageUrl: mockImageUrl,
        userId: mockUserId,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('AI_SERVICE_ERROR');
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('should handle database error', async () => {
    const { analyzeImage } = await import('@/lib/ai/orchestrator');
    
    const mockAnalysisResult = {
      maturityStatus: 'Matang' as const,
      confidence: 85,
      sweetnessLevel: 8,
      watermelonType: 'merah' as const,
      skinQuality: 'baik' as const,
      reasoning: 'Test reasoning',
    };

    vi.mocked(analyzeImage).mockResolvedValueOnce(mockAnalysisResult);
    
    mockSingle.mockResolvedValueOnce({
      data: null,
      error: { message: 'Database error' },
    });

    const request = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify({
        imageUrl: mockImageUrl,
        userId: mockUserId,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('DATABASE_ERROR');
  });

  it('should enforce rate limiting', async () => {
    const { analyzeImage } = await import('@/lib/ai/orchestrator');
    
    const mockAnalysisResult = {
      maturityStatus: 'Matang' as const,
      confidence: 85,
      sweetnessLevel: 8,
      watermelonType: 'merah' as const,
      skinQuality: 'baik' as const,
      reasoning: 'Test reasoning',
    };

    vi.mocked(analyzeImage).mockResolvedValue(mockAnalysisResult);

    // Make 100 requests (the limit)
    for (let i = 0; i < 100; i++) {
      const request = new NextRequest('http://localhost:3000/api/analyze', {
        method: 'POST',
        body: JSON.stringify({
          imageUrl: mockImageUrl,
          userId: 'rate-limit-test-user',
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    }

    // 101st request should be rate limited
    const request = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify({
        imageUrl: mockImageUrl,
        userId: 'rate-limit-test-user',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('RATE_LIMIT_EXCEEDED');
  });

  it('should handle unexpected errors', async () => {
    const { analyzeImage } = await import('@/lib/ai/orchestrator');
    vi.mocked(analyzeImage).mockRejectedValueOnce(new Error('Unexpected error'));

    const request = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify({
        imageUrl: mockImageUrl,
        userId: mockUserId,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INTERNAL_SERVER_ERROR');
  });
});
