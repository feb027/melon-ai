/**
 * Integration tests for Image Upload API
 * Tests file upload, validation, and error handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from '@/app/api/upload/route';
import { NextRequest } from 'next/server';

// Mock Supabase client
const mockUpload = vi.fn();
const mockGetPublicUrl = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    storage: {
      from: vi.fn(() => ({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
      })),
    },
  })),
}));

describe('POST /api/upload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should successfully upload a valid JPEG image', async () => {
    // Create mock file
    const mockFile = new File(['test image content'], 'test.jpg', {
      type: 'image/jpeg',
    });

    // Create form data
    const formData = new FormData();
    formData.append('file', mockFile);
    formData.append('userId', 'test-user-123');

    // Create mock request
    const request = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    });

    // Mock successful upload
    mockUpload.mockResolvedValueOnce({ error: null });
    mockGetPublicUrl.mockReturnValueOnce({
      data: {
        publicUrl: 'https://test.supabase.co/storage/v1/object/public/watermelon-images/test-user-123/123456.jpg',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('url');
    expect(data.data).toHaveProperty('fileName');
    expect(data.data.type).toBe('image/jpeg');
    expect(mockUpload).toHaveBeenCalledTimes(1);
  });

  it('should successfully upload a valid PNG image', async () => {
    const mockFile = new File(['test image content'], 'test.png', {
      type: 'image/png',
    });

    const formData = new FormData();
    formData.append('file', mockFile);
    formData.append('userId', 'test-user-123');

    const request = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    });

    mockUpload.mockResolvedValueOnce({ error: null });
    mockGetPublicUrl.mockReturnValueOnce({
      data: {
        publicUrl: 'https://test.supabase.co/storage/v1/object/public/watermelon-images/test-user-123/123456.png',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.type).toBe('image/png');
  });

  it('should use demo folder when userId is not provided', async () => {
    const mockFile = new File(['test image content'], 'test.jpg', {
      type: 'image/jpeg',
    });

    const formData = new FormData();
    formData.append('file', mockFile);

    const request = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    });

    mockUpload.mockResolvedValueOnce({ error: null });
    mockGetPublicUrl.mockReturnValueOnce({
      data: {
        publicUrl: 'https://test.supabase.co/storage/v1/object/public/watermelon-images/demo/123456.jpg',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.fileName).toContain('demo/');
  });

  it('should reject request without file', async () => {
    const formData = new FormData();
    formData.append('userId', 'test-user-123');

    const request = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('MISSING_FILE');
    expect(mockUpload).not.toHaveBeenCalled();
  });

  it('should reject invalid file type', async () => {
    const mockFile = new File(['test content'], 'test.txt', {
      type: 'text/plain',
    });

    const formData = new FormData();
    formData.append('file', mockFile);
    formData.append('userId', 'test-user-123');

    const request = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INVALID_IMAGE_FORMAT');
    expect(mockUpload).not.toHaveBeenCalled();
  });

  it('should reject file larger than 2MB', async () => {
    // Create a file larger than 2MB
    const largeContent = new Uint8Array(3 * 1024 * 1024); // 3MB
    const mockFile = new File([largeContent], 'large.jpg', {
      type: 'image/jpeg',
    });

    const formData = new FormData();
    formData.append('file', mockFile);
    formData.append('userId', 'test-user-123');

    const request = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(413);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('IMAGE_TOO_LARGE');
    expect(mockUpload).not.toHaveBeenCalled();
  });

  it('should handle Supabase upload error', async () => {
    const mockFile = new File(['test image content'], 'test.jpg', {
      type: 'image/jpeg',
    });

    const formData = new FormData();
    formData.append('file', mockFile);
    formData.append('userId', 'test-user-123');

    const request = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    });

    mockUpload.mockResolvedValueOnce({
      error: { message: 'Storage error' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('UPLOAD_FAILED');
  });

  it('should handle file already exists error', async () => {
    const mockFile = new File(['test image content'], 'test.jpg', {
      type: 'image/jpeg',
    });

    const formData = new FormData();
    formData.append('file', mockFile);
    formData.append('userId', 'test-user-123');

    const request = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    });

    mockUpload.mockResolvedValueOnce({
      error: { message: 'File already exists' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('FILE_ALREADY_EXISTS');
  });

  it('should handle unexpected errors', async () => {
    const mockFile = new File(['test image content'], 'test.jpg', {
      type: 'image/jpeg',
    });

    const formData = new FormData();
    formData.append('file', mockFile);
    formData.append('userId', 'test-user-123');

    const request = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    });

    mockUpload.mockRejectedValueOnce(new Error('Unexpected error'));

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INTERNAL_SERVER_ERROR');
  });
});
