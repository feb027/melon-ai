import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import ReactPDF from '@react-pdf/renderer';
import { AnalyticsReportDocument } from '@/lib/pdf/analytics-report';

// Initialize Supabase client with service role for server-side operations
// Falls back to anon key if service role key is not available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase configuration');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { startDate, endDate, location, fruitType, fruitVariety } = body;

    // Validate required fields
    if (!startDate || !endDate) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_PARAMETERS',
            message: 'Tanggal mulai dan tanggal akhir harus diisi',
          },
        },
        { status: 400 }
      );
    }

    // Fetch analytics data from Supabase
    let query = supabase
      .from('analyses')
      .select('*')
      .gte('created_at', new Date(startDate).toISOString())
      .lte('created_at', new Date(endDate).toISOString())
      .order('created_at', { ascending: false });

    if (location) {
      query = query.eq('location', location);
    }

    if (fruitType) {
      query = query.like('watermelon_type', `${fruitType}:%`);
    }
    
    if (fruitVariety) {
      query = query.like('watermelon_type', `%:${fruitVariety}`);
    }

    const { data: analyses, error: fetchError } = await query;

    if (fetchError) {
      console.error('Error fetching analyses:', fetchError);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Gagal mengambil data analisis',
            details: fetchError.message,
          },
        },
        { status: 500 }
      );
    }

    if (!analyses || analyses.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NO_DATA',
            message: 'Tidak ada data untuk periode yang dipilih',
          },
        },
        { status: 404 }
      );
    }

    // Calculate analytics metrics
    const totalAnalyses = analyses.length;
    const matureCount = analyses.filter((a) => a.maturity_status === 'Matang').length;
    const maturityRate = Math.round((matureCount / totalAnalyses) * 100);
    
    const averageSweetness = Math.round(
      analyses.reduce((sum, a) => sum + (a.sweetness_level || 0), 0) / totalAnalyses
    );
    
    const averageConfidence = Math.round(
      analyses.reduce((sum, a) => sum + (a.confidence || 0), 0) / totalAnalyses
    );

    // Type distribution
    const typeCount: Record<string, number> = {};
    analyses.forEach((a) => {
      const type = a.watermelon_type || 'unknown';
      typeCount[type] = (typeCount[type] || 0) + 1;
    });

    const typeDistribution = Object.entries(typeCount).map(([type, count]) => ({
      type,
      count,
      percentage: Math.round((count / totalAnalyses) * 100),
    }));

    // Skin quality distribution
    const qualityCount: Record<string, number> = {};
    analyses.forEach((a) => {
      const quality = a.skin_quality || 'unknown';
      qualityCount[quality] = (qualityCount[quality] || 0) + 1;
    });

    const skinQualityDistribution = Object.entries(qualityCount).map(([quality, count]) => ({
      quality,
      count,
      percentage: Math.round((count / totalAnalyses) * 100),
    }));

    // Prepare data for PDF
    const reportData = {
      generatedAt: new Date().toISOString(),
      period: {
        startDate: new Date(startDate).toLocaleDateString('id-ID'),
        endDate: new Date(endDate).toLocaleDateString('id-ID'),
      },
      filters: {
        location: location || 'Semua lokasi',
        fruitType: fruitType || 'Semua buah',
        fruitVariety: fruitVariety || 'Semua varietas',
      },
      summary: {
        totalAnalyses,
        maturityRate,
        averageSweetness,
        averageConfidence,
      },
      typeDistribution,
      skinQualityDistribution,
      recentAnalyses: analyses.slice(0, 10).map((a) => ({
        date: new Date(a.created_at).toLocaleDateString('id-ID'),
        maturityStatus: a.maturity_status,
        confidence: a.confidence,
        sweetnessLevel: a.sweetness_level,
        fruitVariety: a.watermelon_type?.split(':')[1] || a.watermelon_type,
        skinQuality: a.skin_quality,
      })),
    };

    // Generate PDF using React PDF
    const pdfStream = await ReactPDF.renderToStream(
      <AnalyticsReportDocument data={reportData} />
    );

    // Convert stream to buffer
    const chunks: Buffer[] = [];
    for await (const chunk of pdfStream) {
      chunks.push(Buffer.from(chunk));
    }
    const pdfBuffer = Buffer.concat(chunks);

    // Upload PDF to Supabase Storage
    const fileName = `analytics-report-${Date.now()}.pdf`;
    const filePath = fileName; // No subfolder needed
    
    // Try to use 'reports' bucket first, fallback to 'watermelon-images'
    const bucketName = 'reports';

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, pdfBuffer, {
        contentType: 'application/pdf',
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading PDF:', uploadError);
      
      // Provide helpful error message for MIME type issue
      const errorMessage = uploadError.message.includes('mime type')
        ? 'Storage bucket tidak mendukung PDF. Silakan buat bucket "reports" dengan allowed_mime_types: ["application/pdf"]. Lihat STORAGE_SETUP.md untuk panduan.'
        : 'Gagal mengunggah PDF ke storage';
      
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UPLOAD_ERROR',
            message: errorMessage,
            details: uploadError.message,
          },
        },
        { status: 500 }
      );
    }

    // Create signed URL that expires in 1 hour
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, 3600); // 1 hour = 3600 seconds

    if (signedUrlError || !signedUrlData) {
      console.error('Error creating signed URL:', signedUrlError);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SIGNED_URL_ERROR',
            message: 'Gagal membuat URL download',
            details: signedUrlError?.message,
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        downloadUrl: signedUrlData.signedUrl,
        fileName,
        expiresIn: 3600, // seconds
        expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
      },
    });
  } catch (error) {
    console.error('PDF export error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Terjadi kesalahan saat membuat PDF',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}
