import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';

// Define styles for PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 30,
    borderBottom: '2 solid #10b981',
    paddingBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 3,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    borderBottom: '1 solid #e5e7eb',
    paddingBottom: 5,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    width: '40%',
    fontSize: 11,
    color: '#6b7280',
  },
  value: {
    width: '60%',
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginBottom: 15,
  },
  summaryCard: {
    width: '47%',
    padding: 15,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    border: '1 solid #e5e7eb',
  },
  summaryLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10b981',
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 8,
    borderBottom: '1 solid #d1d5db',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: '1 solid #e5e7eb',
  },
  tableCell: {
    fontSize: 10,
    color: '#1f2937',
  },
  tableCellHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151',
  },
  distributionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    marginBottom: 5,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
  },
  distributionLabel: {
    fontSize: 11,
    color: '#1f2937',
    textTransform: 'capitalize',
  },
  distributionValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#10b981',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: '#9ca3af',
    borderTop: '1 solid #e5e7eb',
    paddingTop: 10,
  },
  badge: {
    padding: '4 8',
    borderRadius: 4,
    fontSize: 9,
    fontWeight: 'bold',
  },
  badgeMatang: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
  },
  badgeBelumMatang: {
    backgroundColor: '#fed7aa',
    color: '#92400e',
  },
});

interface ReportData {
  generatedAt: string;
  period: {
    startDate: string;
    endDate: string;
  };
  filters: {
    location: string;
    watermelonType: string;
  };
  summary: {
    totalAnalyses: number;
    maturityRate: number;
    averageSweetness: number;
    averageConfidence: number;
  };
  typeDistribution: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  skinQualityDistribution: Array<{
    quality: string;
    count: number;
    percentage: number;
  }>;
  recentAnalyses: Array<{
    date: string;
    maturityStatus: string;
    confidence: number;
    sweetnessLevel: number;
    watermelonType: string;
    skinQuality: string;
  }>;
}

interface AnalyticsReportDocumentProps {
  data: ReportData;
}

export function AnalyticsReportDocument({ data }: AnalyticsReportDocumentProps) {
  return (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Laporan Analitik MelonAI</Text>
        <Text style={styles.subtitle}>
          Periode: {data.period.startDate} - {data.period.endDate}
        </Text>
        <Text style={styles.subtitle}>
          Dibuat: {new Date(data.generatedAt).toLocaleString('id-ID')}
        </Text>
      </View>

      {/* Filter Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informasi Filter</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Lokasi:</Text>
          <Text style={styles.value}>{data.filters.location}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Jenis Semangka:</Text>
          <Text style={styles.value}>{data.filters.watermelonType}</Text>
        </View>
      </View>

      {/* Summary Cards */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ringkasan</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Analisis</Text>
            <Text style={styles.summaryValue}>{data.summary.totalAnalyses}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Tingkat Kematangan</Text>
            <Text style={styles.summaryValue}>{data.summary.maturityRate}%</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Rata-rata Kemanisan</Text>
            <Text style={styles.summaryValue}>{data.summary.averageSweetness}/10</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Rata-rata Confidence</Text>
            <Text style={styles.summaryValue}>{data.summary.averageConfidence}%</Text>
          </View>
        </View>
      </View>

      {/* Type Distribution */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Distribusi Jenis Semangka</Text>
        {data.typeDistribution.map((item, index) => (
          <View key={index} style={styles.distributionItem}>
            <Text style={styles.distributionLabel}>{item.type}</Text>
            <Text style={styles.distributionValue}>
              {item.count} ({item.percentage}%)
            </Text>
          </View>
        ))}
      </View>

      {/* Skin Quality Distribution */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Distribusi Kualitas Kulit</Text>
        {data.skinQualityDistribution.map((item, index) => (
          <View key={index} style={styles.distributionItem}>
            <Text style={styles.distributionLabel}>{item.quality}</Text>
            <Text style={styles.distributionValue}>
              {item.count} ({item.percentage}%)
            </Text>
          </View>
        ))}
      </View>

      {/* Footer */}
      <Text style={styles.footer}>
        Laporan ini dibuat secara otomatis oleh MelonAI • {new Date().getFullYear()}
      </Text>
    </Page>

    {/* Second Page - Recent Analyses */}
    {data.recentAnalyses.length > 0 && (
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Analisis Terbaru</Text>
          <Text style={styles.subtitle}>10 analisis terakhir dalam periode</Text>
        </View>

        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCellHeader, { width: '15%' }]}>Tanggal</Text>
            <Text style={[styles.tableCellHeader, { width: '18%' }]}>Status</Text>
            <Text style={[styles.tableCellHeader, { width: '15%' }]}>Confidence</Text>
            <Text style={[styles.tableCellHeader, { width: '15%' }]}>Kemanisan</Text>
            <Text style={[styles.tableCellHeader, { width: '17%' }]}>Jenis</Text>
            <Text style={[styles.tableCellHeader, { width: '20%' }]}>Kualitas</Text>
          </View>

          {/* Table Rows */}
          {data.recentAnalyses.map((analysis, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, { width: '15%' }]}>{analysis.date}</Text>
              <Text style={[styles.tableCell, { width: '18%' }]}>{analysis.maturityStatus}</Text>
              <Text style={[styles.tableCell, { width: '15%' }]}>{analysis.confidence}%</Text>
              <Text style={[styles.tableCell, { width: '15%' }]}>{analysis.sweetnessLevel}/10</Text>
              <Text style={[styles.tableCell, { width: '17%' }]}>{analysis.watermelonType}</Text>
              <Text style={[styles.tableCell, { width: '20%' }]}>{analysis.skinQuality}</Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Laporan ini dibuat secara otomatis oleh MelonAI • {new Date().getFullYear()} • Halaman 2
        </Text>
      </Page>
    )}
  </Document>
  );
}
