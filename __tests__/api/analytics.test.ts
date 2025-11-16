/**
 * Integration tests for Analytics API
 * Tests data aggregation, filtering, and caching
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET } from '@/app/api/analytics/route';
import { NextRequest } from 'next/server';

// Mock Supabase client
const mockSelect = vi.fn();
const mockGte = vi.fn();
const mockLte = vi.fn();
const mockEq = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: mockSelect,
    })),
  })),
}));

// Mock Vercel KV (optional)
vi.mock('@vercel/kv', () => ({
  kv: {
    get: vi.fn(),
    set: vi.fn(),
  },
}));

describe('GET /api/analytics', () => {
  const mockAnalyses = [
    {
      id: '1',
      user_id: 'user-1',
      maturity_status: 'Matang',
      confidence: 85,
      sweetness_level: 8,
      watermelon_type: 'merah',
      skin_quality: 'baik',
      created_at: '2024-01-15T10:00:00Z',
      metadata: { location: 'Jakarta' },
    },
    {
      id: '2',
      user_id: 'user-1',
      maturity_status: 'Belum Matang',
      confidence: 75,
      sweetness_level: 6,
      watermelon_type: 'kuning',
      skin_quality: 'sedang',
      created_at: '2024-01-16T10:00:00Z',
      metadata: { location: 'Bandung' },
    },
    {
      id: '3',
      user_id: 'user-2',
      maturity_status: 'Matang',
      confidence: 90,
      sweetness_level: 9,
      watermelon_type: 'merah',
      skin_quality: 'baik',
      created_at: '2024-01-17T10:00:00Z',
      metadata: { location: 'Jakarta' },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock chain
    mockEq.mockReturnThis();
    mockLte.mockReturnThis();
    mockGte.mockReturnValue({
      lte: mockLte,
    });
    mockSelect.mockReturnValue({
      gte: mockGte,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return aggregated analytics data', async () => {
    mockLte.mockResolvedValueOnce({
      data: mockAnalyses,
      error: null,
    });

    const request = new NextRequest('http://localhost:3000/api/analytics');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('totalAnalyses');
    expect(data.data).toHaveProperty('maturityRate');
    expect(data.data).toHaveProperty('averageSweetness');
    expect(data.data).toHaveProperty('typeDistribution');
    expect(data.data).toHaveProperty('trendData');
    
    // Verify calculations
    expect(data.data.totalAnalyses).toBe(3);
    expect(data.data.maturityRate).toBe(66.67); // 2 out of 3 mature
    expect(data.data.averageSweetness).toBe(7.67); // (8+6+9)/3
  });

  it('should calculate type distribution correctly', async () => {
    mockLte.mockResolvedValueOnce({
      data: mockAnalyses,
      error: null,
    });

    const request = new NextRequest('http://localhost:3000/api/analytics');

    const response = await GET(request);
    const data = await response.json();

    expect(data.data.typeDistribution).toHaveLength(2);
    
    const merahType = data.data.typeDistribution.find((t: any) => t.type === 'merah');
    expect(merahType.count).toBe(2);
    expect(merahType.percentage).toBe(66.67);
    
    const kuningType = data.data.typeDistribution.find((t: any) => t.type === 'kuning');
    expect(kuningType.count).toBe(1);
    expect(kuningType.percentage).toBe(33.33);
  });

  it('should calculate skin quality distribution', async () => {
    mockLte.mockResolvedValueOnce({
      data: mockAnalyses,
      error: null,
    });

    const request = new NextRequest('http://localhost:3000/api/analytics');

    const response = await GET(request);
    const data = await response.json();

    expect(data.data.skinQualityDistribution).toHaveLength(2);
    
    const baikQuality = data.data.skinQualityDistribution.find((q: any) => q.quality === 'baik');
    expect(baikQuality.count).toBe(2);
    
    const sedangQuality = data.data.skinQualityDistribution.find((q: any) => q.quality === 'sedang');
    expect(sedangQuality.count).toBe(1);
  });

  it('should calculate sweetness distribution by ranges', async () => {
    mockLte.mockResolvedValueOnce({
      data: mockAnalyses,
      error: null,
    });

    const request = new NextRequest('http://localhost:3000/api/analytics');

    const response = await GET(request);
    const data = await response.json();

    expect(data.data.sweetnessDistribution.length).toBeGreaterThan(0);
    
    // Check that sweetness levels are grouped correctly
    const ranges = data.data.sweetnessDistribution.map((s: any) => s.level);
    expect(ranges).toContain('4-6 (Sedang)'); // sweetness 6
    expect(ranges).toContain('7-8 (Manis)'); // sweetness 8
    expect(ranges).toContain('9-10 (Sangat Manis)'); // sweetness 9
  });

  it('should generate trend data grouped by date', async () => {
    mockLte.mockResolvedValueOnce({
      data: mockAnalyses,
      error: null,
    });

    const request = new NextRequest('http://localhost:3000/api/analytics');

    const response = await GET(request);
    const data = await response.json();

    expect(data.data.trendData).toHaveLength(3);
    expect(data.data.trendData[0]).toHaveProperty('date');
    expect(data.data.trendData[0]).toHaveProperty('total');
    expect(data.data.trendData[0]).toHaveProperty('mature');
    expect(data.data.trendData[0]).toHaveProperty('maturityRate');
  });

  it('should filter by date range', async () => {
    mockLte.mockResolvedValueOnce({
      data: [mockAnalyses[0]],
      error: null,
    });

    const startDate = '2024-01-15T00:00:00Z';
    const endDate = '2024-01-15T23:59:59Z';

    const request = new NextRequest(
      `http://localhost:3000/api/analytics?startDate=${startDate}&endDate=${endDate}`
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(mockGte).toHaveBeenCalledWith('created_at', startDate);
    expect(mockLte).toHaveBeenCalledWith('created_at', endDate);
  });

  it('should filter by location', async () => {
    const jakartaAnalyses = mockAnalyses.filter(
      a => a.metadata?.location === 'Jakarta'
    );

    // Mock the full chain including eq
    const mockEqChain = vi.fn().mockReturnThis();
    mockLte.mockReturnValue({
      eq: mockEqChain,
    });
    mockEqChain.mockResolvedValueOnce({
      data: jakartaAnalyses,
      error: null,
    });

    const request = new NextRequest(
      'http://localhost:3000/api/analytics?location=Jakarta'
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.totalAnalyses).toBe(2);
  });

  it('should filter by watermelon type', async () => {
    const merahAnalyses = mockAnalyses.filter(
      a => a.watermelon_type === 'merah'
    );

    // Mock the full chain including eq
    const mockEqChain = vi.fn().mockReturnThis();
    mockLte.mockReturnValue({
      eq: mockEqChain,
    });
    mockEqChain.mockResolvedValueOnce({
      data: merahAnalyses,
      error: null,
    });

    const request = new NextRequest(
      'http://localhost:3000/api/analytics?watermelonType=merah'
    );

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.totalAnalyses).toBe(2);
  });

  it('should return empty data when no analyses exist', async () => {
    mockLte.mockResolvedValueOnce({
      data: [],
      error: null,
    });

    const request = new NextRequest('http://localhost:3000/api/analytics');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.totalAnalyses).toBe(0);
    expect(data.data.maturityRate).toBe(0);
    expect(data.data.typeDistribution).toEqual([]);
  });

  it('should handle database errors', async () => {
    mockLte.mockResolvedValueOnce({
      data: null,
      error: { message: 'Database connection failed' },
    });

    const request = new NextRequest('http://localhost:3000/api/analytics');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('DATABASE_ERROR');
  });

  it('should handle unexpected errors', async () => {
    mockLte.mockRejectedValueOnce(new Error('Unexpected error'));

    const request = new NextRequest('http://localhost:3000/api/analytics');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INTERNAL_ERROR');
  });

  it('should use default date range when not provided', async () => {
    mockLte.mockResolvedValueOnce({
      data: mockAnalyses,
      error: null,
    });

    const request = new NextRequest('http://localhost:3000/api/analytics');

    await GET(request);

    // Verify that gte was called with a date (30 days ago by default)
    expect(mockGte).toHaveBeenCalled();
    const gteCall = mockGte.mock.calls[0];
    expect(gteCall[0]).toBe('created_at');
    expect(typeof gteCall[1]).toBe('string');
  });

  it('should calculate average confidence', async () => {
    mockLte.mockResolvedValueOnce({
      data: mockAnalyses,
      error: null,
    });

    const request = new NextRequest('http://localhost:3000/api/analytics');

    const response = await GET(request);
    const data = await response.json();

    // (85 + 75 + 90) / 3 = 83.33
    expect(data.data.averageConfidence).toBe(83.33);
  });
});
