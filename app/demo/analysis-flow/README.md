# Analysis Flow Demo

This demo page showcases the complete client-side analysis flow for MelonAI.

## Features Demonstrated

### 1. Camera Capture
- Opens device camera
- Captures watermelon image
- Creates preview

### 2. Image Upload
- Uploads to Supabase Storage
- Shows progress bar (0-100%)
- Handles upload errors

### 3. AI Analysis
- Sends image to AI API
- Shows loading skeleton
- Displays spinner animation

### 4. Result Display
- Shows maturity status with badge
- Displays confidence percentage
- Shows sweetness level, type, and quality
- Provides "Foto Lagi" button for quick re-analysis

### 5. Error Handling
- Network errors
- Upload failures
- AI service errors
- User-friendly messages in Indonesian

### 6. Toast Notifications
- Loading: "Mengunggah gambar..." → "Menganalisis semangka..."
- Success: "Analisis selesai!" with summary
- Error: "Analisis gagal" with error message

## Components Used

- `CameraCapture` - Camera interface
- `AnalysisResult` - Result display
- `useAnalysis` - Custom hook for analysis flow
- `Progress` - Upload progress bar (shadcn/ui)
- `Skeleton` - Loading placeholder (shadcn/ui)
- `Toaster` - Toast notifications (Sonner)

## How to Test

1. Navigate to `/demo/analysis-flow`
2. Click "Buka Kamera"
3. Allow camera permissions
4. Position watermelon in frame
5. Click capture button
6. Watch the upload progress
7. Wait for AI analysis
8. View results
9. Click "Foto Lagi" to retry

## Requirements Covered

- ✅ 1.1: Camera capture interface
- ✅ 1.2: Image upload to cloud
- ✅ 1.3: AI analysis with cloud processing
- ✅ 1.4: Result display with confidence
- ✅ 2.1: Display maturity status and quality metrics
- ✅ 10.1: Quick re-analysis with "Foto Lagi" button

## Technical Details

### Upload Flow
1. User captures image → Blob
2. Create FormData with file and userId
3. POST to `/api/upload`
4. Receive public URL
5. Update progress bar (simulated)

### Analysis Flow
1. Receive image URL from upload
2. POST to `/api/analyze` with URL and metadata
3. AI orchestrator analyzes image
4. Save result to database
5. Return structured result

### Loading States
- `isUploading`: Shows progress bar
- `isAnalyzing`: Shows skeleton loader
- `isLoading`: Combined loading state

### Error States
- Upload errors: File too large, invalid format
- Network errors: Connection issues
- AI errors: All providers failed
- Rate limit: Too many requests

## Toast Messages (Indonesian)

### Loading
- "Mengunggah gambar..."
- "Menganalisis semangka..."

### Success
- "Analisis selesai!"
- Description: "Semangka matang dengan tingkat kepercayaan 95%"

### Error
- "Analisis gagal"
- Description: Error message from API

## State Management

The `useAnalysis` hook manages:
- Upload progress (0-100)
- Loading states (uploading, analyzing)
- Result data
- Error messages
- Reset functionality

## Optimistic UI

The hook implements optimistic UI patterns:
- Immediate feedback on actions
- Progress indicators during async operations
- Smooth transitions between states
- No blocking UI during processing

## Next Steps

After this demo works:
1. Integrate into main app flow
2. Add offline queue support
3. Implement analytics tracking
4. Add feedback mechanism
5. Create history view
