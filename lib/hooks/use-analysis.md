# useAnalysis Hook

Custom React hook for managing the complete watermelon analysis flow in MelonAI.

## Overview

The `useAnalysis` hook handles the entire analysis workflow:
1. Image upload to Supabase Storage
2. AI analysis via API
3. Result display with loading states
4. Error handling with toast notifications

## Installation

The hook is already included in the project. Import it from:

```typescript
import { useAnalysis } from '@/lib/hooks/use-analysis';
```

## API Reference

### State

```typescript
interface UseAnalysisReturn {
  // Loading states
  isUploading: boolean;      // True during image upload
  isAnalyzing: boolean;      // True during AI analysis
  isLoading: boolean;        // True during upload OR analysis
  uploadProgress: number;    // Upload progress (0-100)
  
  // Data
  result: AnalysisResult | null;  // Analysis result when complete
  error: string | null;           // Error message if failed
  
  // Actions
  analyzeImage: (imageBlob: Blob, userId: string, metadata?: AnalysisMetadata) => Promise<void>;
  reset: () => void;              // Reset all state
}
```

### Methods

#### `analyzeImage(imageBlob, userId, metadata?)`

Starts the complete analysis flow.

**Parameters:**
- `imageBlob: Blob` - Image to analyze (from camera or file input)
- `userId: string` - User ID for tracking
- `metadata?: AnalysisMetadata` - Optional metadata (location, batchId, deviceInfo)

**Returns:** `Promise<void>`

**Example:**
```typescript
const { analyzeImage } = useAnalysis();

await analyzeImage(imageBlob, 'user-123', {
  location: 'Kebun A',
  batchId: 'batch-001',
});
```

#### `reset()`

Resets all state to initial values.

**Example:**
```typescript
const { reset } = useAnalysis();

reset(); // Clear result, error, and loading states
```

## Usage Examples

### Basic Usage

```typescript
'use client';

import { useAnalysis } from '@/lib/hooks/use-analysis';
import { Button } from '@/components/ui/button';

export function AnalysisComponent() {
  const { analyzeImage, isLoading, result, error } = useAnalysis();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const blob = new Blob([await file.arrayBuffer()], { type: file.type });
    await analyzeImage(blob, 'user-123');
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileSelect} />
      
      {isLoading && <p>Menganalisis...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {result && (
        <div>
          <h3>{result.maturityStatus}</h3>
          <p>Kepercayaan: {result.confidence}%</p>
        </div>
      )}
    </div>
  );
}
```

### With Loading States

```typescript
'use client';

import { useAnalysis } from '@/lib/hooks/use-analysis';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

export function AnalysisWithLoading() {
  const {
    analyzeImage,
    isUploading,
    isAnalyzing,
    uploadProgress,
    result,
  } = useAnalysis();

  return (
    <div className="space-y-4">
      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Mengunggah gambar...</span>
          </div>
          <Progress value={uploadProgress} />
          <p className="text-sm">{uploadProgress}%</p>
        </div>
      )}

      {/* Analysis Loading */}
      {isAnalyzing && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Menganalisis dengan AI...</span>
          </div>
          <Skeleton className="h-20 w-full" />
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="rounded-lg border p-4">
          <h3 className="font-semibold">{result.maturityStatus}</h3>
          <p>Tingkat kepercayaan: {result.confidence}%</p>
        </div>
      )}
    </div>
  );
}
```

### With Camera Integration

```typescript
'use client';

import { useState } from 'react';
import { useAnalysis } from '@/lib/hooks/use-analysis';
import { CameraCapture } from '@/components/camera-capture';
import { AnalysisResult } from '@/components/analysis-result';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';

export function AnalysisWithCamera() {
  const [showCamera, setShowCamera] = useState(false);
  const { analyzeImage, isLoading, result, reset } = useAnalysis();

  const handleCapture = async (imageBlob: Blob) => {
    setShowCamera(false);
    await analyzeImage(imageBlob, 'user-123');
  };

  const handleRetry = () => {
    reset();
    setShowCamera(true);
  };

  return (
    <div className="space-y-4">
      {!showCamera && !result && (
        <Button onClick={() => setShowCamera(true)} size="lg">
          <Camera className="mr-2 h-5 w-5" />
          Ambil Foto
        </Button>
      )}

      {showCamera && (
        <CameraCapture onCapture={handleCapture} onError={console.error} />
      )}

      {isLoading && <p>Memproses...</p>}

      {result && (
        <>
          <AnalysisResult result={result} onRetry={handleRetry} />
          <Button onClick={handleRetry}>Foto Lagi</Button>
        </>
      )}
    </div>
  );
}
```

## Toast Notifications

The hook automatically shows toast notifications using Sonner:

### Loading States
- **Upload:** "Mengunggah gambar..."
- **Analysis:** "Menganalisis semangka..."

### Success
- **Title:** "Analisis selesai!"
- **Description:** "Semangka matang dengan tingkat kepercayaan 95%"

### Error
- **Title:** "Analisis gagal"
- **Description:** Error message from API

## Error Handling

The hook handles various error scenarios:

### Upload Errors
- File too large (> 2MB)
- Invalid format (not JPEG/PNG)
- Network errors
- Storage errors

### Analysis Errors
- AI service unavailable
- All providers failed
- Rate limit exceeded
- Invalid image URL

All errors are:
1. Logged to console
2. Stored in `error` state
3. Shown via toast notification
4. Displayed in Indonesian

## State Flow

```
Initial State
  ↓
User calls analyzeImage()
  ↓
isUploading = true
uploadProgress = 0-100
  ↓
Upload complete
  ↓
isAnalyzing = true
  ↓
Analysis complete
  ↓
result = AnalysisResult
  ↓
Toast: "Analisis selesai!"
```

## Requirements Covered

- ✅ **1.1:** Camera capture and image upload
- ✅ **1.2:** Cloud-based AI analysis
- ✅ **1.3:** Result display with confidence
- ✅ **1.4:** Error handling with user messages
- ✅ **2.1:** Display analysis results
- ✅ **10.1:** Quick re-analysis flow

## Technical Details

### Upload Implementation
- Uses FormData for multipart upload
- Simulates progress (fetch doesn't support upload progress)
- Updates progress every 200ms
- Completes at 100% when upload finishes

### Analysis Implementation
- Calls `/api/analyze` with image URL
- Waits for AI orchestrator response
- Saves result to Supabase database
- Returns structured AnalysisResult

### Optimistic UI
- Immediate feedback on actions
- Progress indicators during async operations
- Smooth state transitions
- No blocking UI

## Dependencies

- `sonner` - Toast notifications
- `@/lib/types` - TypeScript types
- `/api/upload` - Upload endpoint
- `/api/analyze` - Analysis endpoint

## Testing

See `/app/demo/analysis-flow` for a complete demo page.

## Future Enhancements

- [ ] Real upload progress tracking (using XHR)
- [ ] Offline queue integration
- [ ] Result caching
- [ ] Analytics tracking
- [ ] Retry with exponential backoff
