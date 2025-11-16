/**
 * Analytics Insights Generator
 * 
 * Generates actionable insights and recommendations based on historical
 * watermelon analysis data using simple pattern detection algorithms.
 */

export interface AnalyticsData {
  totalAnalyses: number;
  maturityRate: number;
  averageSweetness: number;
  averageConfidence: number;
  typeDistribution: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  trendData: Array<{
    date: string;
    total: number;
    mature: number;
    maturityRate: number;
  }>;
  skinQualityDistribution: Array<{
    quality: string;
    count: number;
    percentage: number;
  }>;
  sweetnessDistribution: Array<{
    level: string;
    count: number;
    percentage: number;
  }>;
}

export interface Insight {
  id: string;
  type: 'success' | 'warning' | 'info' | 'tip';
  title: string;
  description: string;
  recommendation?: string;
  priority: number; // 1-5, higher is more important
}

/**
 * Generate insights from analytics data
 * @param data - Aggregated analytics data
 * @returns Array of insights sorted by priority
 */
export function generateInsights(data: AnalyticsData): Insight[] {
  const insights: Insight[] = [];
  
  // Insight 1: Maturity rate trend
  if (data.totalAnalyses >= 10) {
    insights.push(generateMaturityInsight(data));
  }
  
  // Insight 2: Sweetness level analysis
  if (data.totalAnalyses >= 5) {
    insights.push(generateSweetnessInsight(data));
  }
  
  // Insight 3: Type distribution insight
  if (data.typeDistribution.length > 0) {
    insights.push(generateTypeInsight(data));
  }
  
  // Insight 4: Skin quality insight
  if (data.skinQualityDistribution.length > 0) {
    insights.push(generateSkinQualityInsight(data));
  }
  
  // Insight 5: Trend analysis (week-over-week)
  if (data.trendData.length >= 7) {
    const trendInsight = generateTrendInsight(data);
    if (trendInsight) {
      insights.push(trendInsight);
    }
  }
  
  // Insight 6: Confidence level insight
  if (data.totalAnalyses >= 5) {
    insights.push(generateConfidenceInsight(data));
  }
  
  // Sort by priority (highest first)
  return insights.sort((a, b) => b.priority - a.priority);
}

/**
 * Generate maturity rate insight
 */
function generateMaturityInsight(data: AnalyticsData): Insight {
  const { maturityRate } = data;
  
  if (maturityRate >= 70) {
    return {
      id: 'maturity-high',
      type: 'success',
      title: `${Math.round(maturityRate)}% semangka sudah matang`,
      description: `Sebagian besar semangka sudah dalam kondisi matang dan siap panen.`,
      recommendation: 'Waktu yang tepat untuk panen! Pastikan untuk memanen dalam 2-3 hari ke depan untuk kualitas optimal.',
      priority: 5,
    };
  } else if (maturityRate >= 40) {
    return {
      id: 'maturity-medium',
      type: 'info',
      title: `${Math.round(maturityRate)}% semangka sudah matang`,
      description: `Sekitar setengah semangka yang dianalisis sudah matang.`,
      recommendation: 'Lakukan panen bertahap. Panen yang sudah matang terlebih dahulu, sisanya tunggu 3-5 hari lagi.',
      priority: 4,
    };
  } else {
    return {
      id: 'maturity-low',
      type: 'warning',
      title: `Hanya ${Math.round(maturityRate)}% semangka yang matang`,
      description: `Sebagian besar semangka masih belum matang.`,
      recommendation: 'Tunggu 5-7 hari lagi sebelum panen. Periksa kembali secara berkala untuk memastikan kematangan optimal.',
      priority: 5,
    };
  }
}

/**
 * Generate sweetness level insight
 */
function generateSweetnessInsight(data: AnalyticsData): Insight {
  const { averageSweetness } = data;
  
  if (averageSweetness >= 8) {
    return {
      id: 'sweetness-high',
      type: 'success',
      title: `Tingkat kemanisan sangat baik (${averageSweetness.toFixed(1)}/10)`,
      description: `Semangka Anda memiliki tingkat kemanisan yang sangat baik, cocok untuk pasar premium.`,
      recommendation: 'Pertahankan praktik budidaya saat ini. Semangka dengan kemanisan tinggi bisa dijual dengan harga lebih tinggi.',
      priority: 4,
    };
  } else if (averageSweetness >= 6) {
    return {
      id: 'sweetness-medium',
      type: 'info',
      title: `Tingkat kemanisan sedang (${averageSweetness.toFixed(1)}/10)`,
      description: `Semangka Anda memiliki tingkat kemanisan yang cukup baik untuk pasar umum.`,
      recommendation: 'Untuk meningkatkan kemanisan, pastikan penyiraman teratur dan cukup sinar matahari pada fase akhir pertumbuhan.',
      priority: 3,
    };
  } else {
    return {
      id: 'sweetness-low',
      type: 'warning',
      title: `Tingkat kemanisan perlu ditingkatkan (${averageSweetness.toFixed(1)}/10)`,
      description: `Semangka Anda memiliki tingkat kemanisan yang kurang optimal.`,
      recommendation: 'Kurangi penyiraman 1-2 minggu sebelum panen dan pastikan tanaman mendapat cukup sinar matahari untuk meningkatkan kadar gula.',
      priority: 4,
    };
  }
}

/**
 * Generate type distribution insight
 */
function generateTypeInsight(data: AnalyticsData): Insight {
  const { typeDistribution } = data;
  
  if (typeDistribution.length === 0) {
    return {
      id: 'type-none',
      type: 'info',
      title: 'Belum ada data jenis semangka',
      description: 'Mulai analisis untuk melihat distribusi jenis semangka.',
      priority: 1,
    };
  }
  
  const topType = typeDistribution[0];
  const diversityScore = typeDistribution.length;
  
  if (diversityScore === 1 && topType) {
    return {
      id: 'type-single',
      type: 'info',
      title: `Semua semangka berjenis ${topType.type}`,
      description: `Semua semangka yang dianalisis adalah jenis ${topType.type}.`,
      recommendation: 'Pertimbangkan untuk menanam varietas lain untuk diversifikasi pasar dan mengurangi risiko.',
      priority: 2,
    };
  } else if (topType) {
    return {
      id: 'type-diverse',
      type: 'success',
      title: `Jenis semangka terpopuler: ${topType.type} (${Math.round(topType.percentage)}%)`,
      description: `Anda menanam ${diversityScore} jenis semangka berbeda. Jenis ${topType.type} mendominasi dengan ${topType.count} buah.`,
      recommendation: 'Diversifikasi jenis yang baik! Fokuskan pemasaran pada jenis yang paling diminati pasar.',
      priority: 3,
    };
  }
  
  return {
    id: 'type-none',
    type: 'info',
    title: 'Belum ada data jenis semangka',
    description: 'Mulai analisis untuk melihat distribusi jenis semangka.',
    priority: 1,
  };
}

/**
 * Generate skin quality insight
 */
function generateSkinQualityInsight(data: AnalyticsData): Insight {
  const { skinQualityDistribution } = data;
  
  const goodQuality = skinQualityDistribution.find(q => q.quality === 'baik');
  const goodPercentage = goodQuality ? goodQuality.percentage : 0;
  
  if (goodPercentage >= 70) {
    return {
      id: 'skin-quality-good',
      type: 'success',
      title: `${Math.round(goodPercentage)}% semangka memiliki kualitas kulit baik`,
      description: `Sebagian besar semangka Anda memiliki kondisi kulit yang sangat baik.`,
      recommendation: 'Kualitas kulit yang baik menunjukkan perawatan yang tepat. Pertahankan praktik ini untuk hasil panen berkualitas.',
      priority: 3,
    };
  } else if (goodPercentage >= 40) {
    return {
      id: 'skin-quality-medium',
      type: 'info',
      title: `${Math.round(goodPercentage)}% semangka memiliki kualitas kulit baik`,
      description: `Sekitar setengah semangka Anda memiliki kondisi kulit yang baik.`,
      recommendation: 'Perhatikan perlindungan dari hama dan cuaca ekstrem untuk meningkatkan kualitas kulit semangka.',
      priority: 3,
    };
  } else {
    return {
      id: 'skin-quality-poor',
      type: 'warning',
      title: `Hanya ${Math.round(goodPercentage)}% semangka dengan kualitas kulit baik`,
      description: `Sebagian besar semangka memiliki kondisi kulit yang kurang optimal.`,
      recommendation: 'Tingkatkan perlindungan dari hama, penyakit, dan cuaca. Gunakan mulsa untuk melindungi buah dari kontak langsung dengan tanah.',
      priority: 4,
    };
  }
}

/**
 * Generate trend insight (week-over-week comparison)
 */
function generateTrendInsight(data: AnalyticsData): Insight | null {
  const { trendData } = data;
  
  if (trendData.length < 7) {
    return null;
  }
  
  // Compare last 7 days vs previous 7 days
  const lastWeek = trendData.slice(0, 7);
  const previousWeek = trendData.slice(7, 14);
  
  if (previousWeek.length < 7) {
    return null;
  }
  
  const lastWeekMaturityRate = lastWeek.reduce((sum, d) => sum + d.maturityRate, 0) / lastWeek.length;
  const previousWeekMaturityRate = previousWeek.reduce((sum, d) => sum + d.maturityRate, 0) / previousWeek.length;
  
  const change = lastWeekMaturityRate - previousWeekMaturityRate;
  const changePercentage = Math.abs(change);
  
  if (changePercentage < 5) {
    return {
      id: 'trend-stable',
      type: 'info',
      title: 'Tingkat kematangan stabil minggu ini',
      description: `Tingkat kematangan semangka relatif stabil dibanding minggu lalu (${Math.round(lastWeekMaturityRate)}% vs ${Math.round(previousWeekMaturityRate)}%).`,
      recommendation: 'Kondisi pertumbuhan konsisten. Lanjutkan perawatan rutin untuk hasil yang stabil.',
      priority: 2,
    };
  } else if (change > 0) {
    return {
      id: 'trend-increasing',
      type: 'success',
      title: `Tingkat kematangan meningkat ${Math.round(changePercentage)}% minggu ini`,
      description: `Tingkat kematangan semangka meningkat dari ${Math.round(previousWeekMaturityRate)}% menjadi ${Math.round(lastWeekMaturityRate)}% minggu ini.`,
      recommendation: 'Tren positif! Bersiaplah untuk panen dalam waktu dekat. Pastikan logistik panen dan distribusi sudah siap.',
      priority: 5,
    };
  } else {
    return {
      id: 'trend-decreasing',
      type: 'warning',
      title: `Tingkat kematangan menurun ${Math.round(changePercentage)}% minggu ini`,
      description: `Tingkat kematangan semangka menurun dari ${Math.round(previousWeekMaturityRate)}% menjadi ${Math.round(lastWeekMaturityRate)}% minggu ini.`,
      recommendation: 'Periksa kondisi tanaman. Pastikan tidak ada masalah dengan penyiraman, nutrisi, atau serangan hama yang menghambat pematangan.',
      priority: 4,
    };
  }
}

/**
 * Generate confidence level insight
 */
function generateConfidenceInsight(data: AnalyticsData): Insight {
  const { averageConfidence } = data;
  
  if (averageConfidence >= 85) {
    return {
      id: 'confidence-high',
      type: 'success',
      title: `Tingkat kepercayaan AI sangat tinggi (${Math.round(averageConfidence)}%)`,
      description: `AI dapat menganalisis semangka Anda dengan tingkat kepercayaan yang sangat baik.`,
      recommendation: 'Kualitas foto yang baik! Terus ambil foto dengan pencahayaan yang cukup dan fokus yang jelas.',
      priority: 2,
    };
  } else if (averageConfidence >= 70) {
    return {
      id: 'confidence-medium',
      type: 'info',
      title: `Tingkat kepercayaan AI cukup baik (${Math.round(averageConfidence)}%)`,
      description: `AI dapat menganalisis semangka Anda dengan tingkat kepercayaan yang cukup.`,
      recommendation: 'Untuk hasil lebih akurat, pastikan foto diambil dengan pencahayaan yang baik dan fokus pada seluruh permukaan semangka.',
      priority: 2,
    };
  } else {
    return {
      id: 'confidence-low',
      type: 'warning',
      title: `Tingkat kepercayaan AI perlu ditingkatkan (${Math.round(averageConfidence)}%)`,
      description: `AI mengalami kesulitan menganalisis beberapa foto semangka Anda.`,
      recommendation: 'Tips foto yang baik: gunakan pencahayaan alami, fokus pada semangka, hindari bayangan, dan pastikan seluruh permukaan terlihat jelas.',
      priority: 3,
    };
  }
}

/**
 * Get actionable recommendations based on insights
 * @param insights - Array of generated insights
 * @returns Array of top recommendations
 */
export function getTopRecommendations(insights: Insight[]): string[] {
  return insights
    .filter(insight => insight.recommendation)
    .slice(0, 3) // Top 3 recommendations
    .map(insight => insight.recommendation!);
}

/**
 * Format insight for display
 * @param insight - Insight object
 * @returns Formatted insight text
 */
export function formatInsight(insight: Insight): string {
  let text = `${insight.title}\n\n${insight.description}`;
  
  if (insight.recommendation) {
    text += `\n\n💡 Rekomendasi: ${insight.recommendation}`;
  }
  
  return text;
}
