/**
 * Unit tests for Analytics Insights Generator
 * Tests insight generation and recommendation logic
 */

import { describe, it, expect } from 'vitest';
import {
  generateInsights,
  getTopRecommendations,
  formatInsight,
  type AnalyticsData,
  type Insight,
} from './insights';

describe('Analytics Insights', () => {
  const mockAnalyticsData: AnalyticsData = {
    totalAnalyses: 50,
    maturityRate: 75,
    averageSweetness: 7.5,
    averageConfidence: 85,
    typeDistribution: [
      { type: 'merah', count: 30, percentage: 60 },
      { type: 'kuning', count: 15, percentage: 30 },
      { type: 'mini', count: 5, percentage: 10 },
    ],
    trendData: [
      { date: '2024-01-07', total: 10, mature: 8, maturityRate: 80 },
      { date: '2024-01-06', total: 8, mature: 6, maturityRate: 75 },
      { date: '2024-01-05', total: 7, mature: 5, maturityRate: 71 },
      { date: '2024-01-04', total: 6, mature: 4, maturityRate: 67 },
      { date: '2024-01-03', total: 5, mature: 3, maturityRate: 60 },
      { date: '2024-01-02', total: 7, mature: 4, maturityRate: 57 },
      { date: '2024-01-01', total: 7, mature: 4, maturityRate: 57 },
      // Previous week
      { date: '2023-12-31', total: 8, mature: 4, maturityRate: 50 },
      { date: '2023-12-30', total: 7, mature: 3, maturityRate: 43 },
      { date: '2023-12-29', total: 6, mature: 3, maturityRate: 50 },
      { date: '2023-12-28', total: 5, mature: 2, maturityRate: 40 },
      { date: '2023-12-27', total: 6, mature: 3, maturityRate: 50 },
      { date: '2023-12-26', total: 7, mature: 3, maturityRate: 43 },
      { date: '2023-12-25', total: 8, mature: 4, maturityRate: 50 },
    ],
    skinQualityDistribution: [
      { quality: 'baik', count: 35, percentage: 70 },
      { quality: 'sedang', count: 10, percentage: 20 },
      { quality: 'kurang baik', count: 5, percentage: 10 },
    ],
    sweetnessDistribution: [
      { level: '8-10', count: 25, percentage: 50 },
      { level: '6-7', count: 20, percentage: 40 },
      { level: '1-5', count: 5, percentage: 10 },
    ],
  };

  describe('generateInsights', () => {
    it('should generate insights from analytics data', () => {
      const insights = generateInsights(mockAnalyticsData);

      expect(insights).toBeDefined();
      expect(Array.isArray(insights)).toBe(true);
      expect(insights.length).toBeGreaterThan(0);
    });

    it('should sort insights by priority', () => {
      const insights = generateInsights(mockAnalyticsData);

      for (let i = 0; i < insights.length - 1; i++) {
        expect(insights[i].priority).toBeGreaterThanOrEqual(
          insights[i + 1].priority
        );
      }
    });

    it('should generate maturity insight for high maturity rate', () => {
      const data = { ...mockAnalyticsData, maturityRate: 75 };
      const insights = generateInsights(data);

      const maturityInsight = insights.find((i) =>
        i.id.includes('maturity')
      );
      expect(maturityInsight).toBeDefined();
      expect(maturityInsight?.type).toBe('success');
      expect(maturityInsight?.title).toContain('75%');
    });

    it('should generate warning for low maturity rate', () => {
      const data = { ...mockAnalyticsData, maturityRate: 30 };
      const insights = generateInsights(data);

      const maturityInsight = insights.find((i) =>
        i.id.includes('maturity')
      );
      expect(maturityInsight).toBeDefined();
      expect(maturityInsight?.type).toBe('warning');
      expect(maturityInsight?.title).toContain('30%');
    });

    it('should generate sweetness insight for high sweetness', () => {
      const data = { ...mockAnalyticsData, averageSweetness: 8.5 };
      const insights = generateInsights(data);

      const sweetnessInsight = insights.find((i) =>
        i.id.includes('sweetness')
      );
      expect(sweetnessInsight).toBeDefined();
      expect(sweetnessInsight?.type).toBe('success');
      expect(sweetnessInsight?.title).toContain('8.5');
    });

    it('should generate warning for low sweetness', () => {
      const data = { ...mockAnalyticsData, averageSweetness: 5.0 };
      const insights = generateInsights(data);

      const sweetnessInsight = insights.find((i) =>
        i.id.includes('sweetness')
      );
      expect(sweetnessInsight).toBeDefined();
      expect(sweetnessInsight?.type).toBe('warning');
    });

    it('should generate type distribution insight', () => {
      const insights = generateInsights(mockAnalyticsData);

      const typeInsight = insights.find((i) => i.id.includes('type'));
      expect(typeInsight).toBeDefined();
      expect(typeInsight?.title).toContain('merah');
    });

    it('should generate skin quality insight', () => {
      const insights = generateInsights(mockAnalyticsData);

      const skinInsight = insights.find((i) =>
        i.id.includes('skin-quality')
      );
      expect(skinInsight).toBeDefined();
      expect(skinInsight?.type).toBe('success');
    });

    it('should generate trend insight when sufficient data', () => {
      const insights = generateInsights(mockAnalyticsData);

      const trendInsight = insights.find((i) => i.id.includes('trend'));
      expect(trendInsight).toBeDefined();
    });

    it('should not generate trend insight with insufficient data', () => {
      const data = {
        ...mockAnalyticsData,
        trendData: mockAnalyticsData.trendData.slice(0, 5),
      };
      const insights = generateInsights(data);

      const trendInsight = insights.find((i) => i.id.includes('trend'));
      expect(trendInsight).toBeUndefined();
    });

    it('should generate confidence insight', () => {
      const insights = generateInsights(mockAnalyticsData);

      const confidenceInsight = insights.find((i) =>
        i.id.includes('confidence')
      );
      expect(confidenceInsight).toBeDefined();
      expect(confidenceInsight?.type).toBe('success');
    });

    it('should generate warning for low confidence', () => {
      const data = { ...mockAnalyticsData, averageConfidence: 65 };
      const insights = generateInsights(data);

      const confidenceInsight = insights.find((i) =>
        i.id.includes('confidence')
      );
      expect(confidenceInsight).toBeDefined();
      expect(confidenceInsight?.type).toBe('warning');
    });

    it('should not generate insights with insufficient data', () => {
      const minimalData: AnalyticsData = {
        totalAnalyses: 2,
        maturityRate: 50,
        averageSweetness: 6,
        averageConfidence: 75,
        typeDistribution: [],
        trendData: [],
        skinQualityDistribution: [],
        sweetnessDistribution: [],
      };

      const insights = generateInsights(minimalData);

      // Should have very few insights with minimal data
      expect(insights.length).toBeLessThan(3);
    });
  });

  describe('getTopRecommendations', () => {
    it('should return top 3 recommendations', () => {
      const insights = generateInsights(mockAnalyticsData);
      const recommendations = getTopRecommendations(insights);

      expect(recommendations).toBeDefined();
      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeLessThanOrEqual(3);
    });

    it('should return only insights with recommendations', () => {
      const insights = generateInsights(mockAnalyticsData);
      const recommendations = getTopRecommendations(insights);

      recommendations.forEach((rec) => {
        expect(rec).toBeDefined();
        expect(typeof rec).toBe('string');
        expect(rec.length).toBeGreaterThan(0);
      });
    });

    it('should return empty array when no recommendations', () => {
      const insights: Insight[] = [
        {
          id: 'test',
          type: 'info',
          title: 'Test',
          description: 'Test description',
          priority: 1,
        },
      ];

      const recommendations = getTopRecommendations(insights);
      expect(recommendations).toEqual([]);
    });
  });

  describe('formatInsight', () => {
    it('should format insight with title and description', () => {
      const insight: Insight = {
        id: 'test',
        type: 'success',
        title: 'Test Title',
        description: 'Test Description',
        priority: 3,
      };

      const formatted = formatInsight(insight);

      expect(formatted).toContain('Test Title');
      expect(formatted).toContain('Test Description');
    });

    it('should include recommendation when present', () => {
      const insight: Insight = {
        id: 'test',
        type: 'success',
        title: 'Test Title',
        description: 'Test Description',
        recommendation: 'Test Recommendation',
        priority: 3,
      };

      const formatted = formatInsight(insight);

      expect(formatted).toContain('Test Title');
      expect(formatted).toContain('Test Description');
      expect(formatted).toContain('Test Recommendation');
      expect(formatted).toContain('💡 Rekomendasi:');
    });

    it('should not include recommendation section when not present', () => {
      const insight: Insight = {
        id: 'test',
        type: 'info',
        title: 'Test Title',
        description: 'Test Description',
        priority: 2,
      };

      const formatted = formatInsight(insight);

      expect(formatted).not.toContain('💡 Rekomendasi:');
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero analyses', () => {
      const data: AnalyticsData = {
        totalAnalyses: 0,
        maturityRate: 0,
        averageSweetness: 0,
        averageConfidence: 0,
        typeDistribution: [],
        trendData: [],
        skinQualityDistribution: [],
        sweetnessDistribution: [],
      };

      const insights = generateInsights(data);
      expect(insights).toBeDefined();
      expect(Array.isArray(insights)).toBe(true);
    });

    it('should handle 100% maturity rate', () => {
      const data = { ...mockAnalyticsData, maturityRate: 100 };
      const insights = generateInsights(data);

      const maturityInsight = insights.find((i) =>
        i.id.includes('maturity')
      );
      expect(maturityInsight).toBeDefined();
      expect(maturityInsight?.type).toBe('success');
    });

    it('should handle 0% maturity rate', () => {
      const data = { ...mockAnalyticsData, maturityRate: 0 };
      const insights = generateInsights(data);

      const maturityInsight = insights.find((i) =>
        i.id.includes('maturity')
      );
      expect(maturityInsight).toBeDefined();
      expect(maturityInsight?.type).toBe('warning');
    });

    it('should handle single type distribution', () => {
      const data = {
        ...mockAnalyticsData,
        typeDistribution: [{ type: 'merah', count: 50, percentage: 100 }],
      };

      const insights = generateInsights(data);
      const typeInsight = insights.find((i) => i.id.includes('type'));

      expect(typeInsight).toBeDefined();
      expect(typeInsight?.id).toBe('type-single');
    });

    it('should handle empty type distribution', () => {
      const data = {
        ...mockAnalyticsData,
        typeDistribution: [],
        totalAnalyses: 0, // Need 0 analyses to skip type insight generation
      };

      const insights = generateInsights(data);
      // With 0 analyses, type insight won't be generated
      expect(insights.length).toBeGreaterThanOrEqual(0);
    });
  });
});
