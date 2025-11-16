# Analysis API Route

## Overview

The Analysis API route (`/api/analyze`) handles AI-powered watermelon analysis with automatic fallback, rate limiting, and comprehensive error handling.

## Endpoint

```
POST /api/analyze
```

## Request Body

```typescript
{
  imageUrl: string;      // Public URL of the uploaded watermelon image
  userId: string;        // User ID (UUID format)
  metadata?: {           // Optional metadata
    location?: string;   // Location where photo was taken
    batchId?: string;    // Batch ID for grouping analyses
    deviceInfo?: string; // Device information
  }
}
```

## Response

### Success Response (200)

```typescript
{
  success: true;
  data: {
    id: string;                    // Analysis ID (UUID)
    userId: string;                // User ID
    imageUrl: string;              // Image URL
    imageStoragePath: string;      // Storage path in Supabase
    maturityStatus: 'Matang' | 'Belum Matang';
    confidence: number;            // 0-100
    sweetnessLevel: number;        // 1-10
    watermelonType: 'merah' | 'kuning' | 'mini' | 'inul';
    skinQuality: 'baik' | 'sedang' | 'kurang baik';
    aiProvider: string;            // AI provider used
    aiResponseTime: number;        // Response time in ms
    reasoning: string | null;      // AI reasoning
    metadata?: object;             // User metadata
    createdAt: Date;               // Timestamp
  }
}
```

### Error Responses

#### 400 Bad Request
```typescript
{
  success: false;
  error: {
    code: 'MISSING_IMAGE_URL' | 'MISSING_USER_ID' | 'INVALID_IMAGE_URL';
    message: string;
  }
}
```

#### 429 Too Many Requests
```typescript
{
  success: false;
  error: {
    code: 'RATE_LIMIT_EXCEEDED';
    message: string;
  }
}
```

#### 503 Service Unavailable
```typescript
{
  success: false;
  error: {
    code: 'AI_SERVICE_ERROR';
    message: string;
    details?: string;
  }
}
```

#### 500 Internal Server Error
```typescript
{
  success: false;
  error: {
    code: 'DATABASE_ERROR' | 'INTERNAL_SERVER_ERROR';
    message: string;
    details?: string;
  }
}
```

## Features

### 1. AI Analysis with Fallback
- Automatically tries multiple AI providers (Gemini → GPT-4 → Claude)
- Retry logic with exponential backoff (max 2 retries per provider)
- Timeout handling (10 seconds max per provider)
- Performance logging to Supabase

### 2. Rate Limiting
- 100 requests per hour per user
- In-memory rate limiting (use Redis/Vercel KV in production)
- Automatic cleanup of expired entries

### 3. Database Integration
- Saves analysis results to Supabase
- Includes AI performance metrics
- Supports optional metadata

### 4. Error Handling
- User-friendly error messages in Indonesian
- Comprehensive error codes
- Detailed logging for debugging

## Usage Example

```typescript
// Client-side usage
async function analyzeWatermelon(imageUrl: string, userId: string) {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageUrl,
        userId,
        metadata: {
          location: 'Jakarta',
          deviceInfo: navigator.userAgent,
        },
      }),
    });

    const result = await response.json();

    if (!result.success) {
      console.error('Analysis failed:', result.error);
      return null;
    }

    console.log('Analysis result:', result.data);
    return result.data;
  } catch (error) {
    console.error('Network error:', error);
    return null;
  }
}
```

## Complete Flow

1. **Upload Image** → `/api/upload` (get imageUrl)
2. **Analyze Image** → `/api/analyze` (get analysis result)
3. **Display Result** → Show to user

```typescript
// Complete flow example
async function completeAnalysisFlow(imageFile: File, userId: string) {
  // Step 1: Upload image
  const formData = new FormData();
  formData.append('file', imageFile);
  formData.append('userId', userId);

  const uploadResponse = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  const uploadResult = await uploadResponse.json();
  if (!uploadResult.success) {
    throw new Error('Upload failed');
  }

  // Step 2: Analyze image
  const analysisResponse = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imageUrl: uploadResult.data.url,
      userId,
    }),
  });

  const analysisResult = await analysisResponse.json();
  if (!analysisResult.success) {
    throw new Error('Analysis failed');
  }

  // Step 3: Display result
  return analysisResult.data;
}
```

## Rate Limiting Details

- **Limit:** 100 requests per hour per user
- **Window:** Rolling 1-hour window
- **Storage:** In-memory (for MVP)
- **Production:** Use Redis or Vercel KV for distributed rate limiting

## Performance

- **Average Response Time:** 2-5 seconds (depends on AI provider)
- **Timeout:** 10 seconds per AI provider
- **Max Total Time:** ~30 seconds (if all providers fail)

## Requirements Covered

- ✅ 1.2: Cloud AI Service integration
- ✅ 1.3: AI analysis within 10 seconds
- ✅ 1.4: Display maturity status with confidence
- ✅ 2.1: Estimated sweetness level
- ✅ 2.2: Watermelon type classification
- ✅ 2.3: Skin quality assessment
- ✅ 2.4: Visual indicators (returned in response)
- ✅ 6.1: Multiple AI provider support
- ✅ 6.2: Automatic fallback mechanism

## Next Steps

1. Implement client-side analysis flow (Task 16)
2. Add caching with Vercel KV (optional)
3. Enhance rate limiting with Redis (production)
4. Add analytics tracking
