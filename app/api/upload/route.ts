import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { imageSettings } from '@/lib/config';

/**
 * Image Upload API Route
 * 
 * Handles image upload to Supabase Storage with validation
 * - Validates image format (JPEG, PNG only)
 * - Validates image size (max 2MB)
 * - Generates unique filename with user ID and timestamp
 * - Returns public URL for uploaded image
 * 
 * Requirements: 1.1, 1.2, 5.1, 9.2
 */

// Allowed MIME types
const ALLOWED_TYPES = ['image/jpeg', 'image/png'];

// Maximum file size (2MB)
const MAX_FILE_SIZE = imageSettings.maxSizeBytes;

export async function POST(request: NextRequest) {
  try {
    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const userId = formData.get('userId') as string | null;

    // Validate file presence
    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_FILE',
            message: 'File tidak ditemukan. Mohon pilih gambar untuk diunggah.',
          },
        },
        { status: 400 }
      );
    }

    // Validate user ID
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_USER_ID',
            message: 'User ID tidak ditemukan.',
          },
        },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_IMAGE_FORMAT',
            message: 'Format gambar tidak valid. Hanya JPEG dan PNG yang diperbolehkan.',
          },
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'IMAGE_TOO_LARGE',
            message: `Ukuran gambar terlalu besar. Maksimal ${imageSettings.maxSizeMB}MB.`,
          },
        },
        { status: 413 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.type === 'image/jpeg' ? 'jpg' : 'png';
    const fileName = `${userId}/${timestamp}.${fileExtension}`;

    // Create Supabase client
    const supabase = await createClient();

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { error } = await supabase.storage
      .from('watermelon-images')
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      
      // Handle specific error cases
      if (error.message.includes('already exists')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'FILE_ALREADY_EXISTS',
              message: 'File sudah ada. Silakan coba lagi.',
            },
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UPLOAD_FAILED',
            message: 'Gagal mengunggah gambar. Silakan coba lagi.',
            details: error.message,
          },
        },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('watermelon-images')
      .getPublicUrl(fileName);

    // Return success response
    return NextResponse.json(
      {
        success: true,
        data: {
          url: publicUrl,
          fileName,
          size: file.size,
          type: file.type,
        },
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Upload API error:', error);

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
