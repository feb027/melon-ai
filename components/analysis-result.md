# AnalysisResult Component

## Overview

The `AnalysisResult` component displays AI analysis results for watermelon maturity assessment with visual indicators, confidence metrics, and detailed explanations.

## Features

- ✅ **Image Thumbnail**: Displays the analyzed watermelon image with Next.js Image optimization
- ✅ **Color-coded Maturity Badge**: Green for "Matang", Orange for "Belum Matang"
- ✅ **Confidence Progress Bar**: Visual representation of AI confidence (0-100%)
- ✅ **Sweetness Level Indicator**: Visual scale showing sweetness level (1-10)
- ✅ **Watermelon Type Display**: Shows type (merah, kuning, mini, inul)
- ✅ **Skin Quality Display**: Color-coded quality indicator (baik, sedang, kurang baik)
- ✅ **"Foto Lagi" Button**: Quick re-analysis button with camera icon
- ✅ **Detailed Explanation Modal**: Dialog showing full AI reasoning
- ✅ **Responsive Design**: Mobile-first, works on all screen sizes
- ✅ **Accessibility**: WCAG 2.1 AA compliant with proper ARIA labels
- ✅ **Indonesian Language**: All text in Bahasa Indonesia

## Usage

### Basic Usage

```tsx
import { AnalysisResult } from '@/components/analysis-result';
import type { AnalysisResult as AnalysisResultType } from '@/lib/types';

function MyPage() {
  const result: AnalysisResultType = {
    id: '123',
    userId: 'user-123',
    imageUrl: '/watermelon.jpg',
    imageStoragePath: 'path/to/image.jpg',
    maturityStatus: 'Matang',
    confidence: 87.5,
    sweetnessLevel: 8,
    watermelonType: 'merah',
    skinQuality: 'baik',
    aiProvider: 'gemini',
    aiResponseTime: 2340,
    reasoning: 'Detailed AI explanation...',
    createdAt: new Date(),
  };

  return (
    <AnalysisResult
      result={result}
      onRetry={() => console.log('Retry clicked')}
      onFeedback={() => console.log('Feedback clicked')}
    />
  );
}
```

### With Callbacks

```tsx
function AnalysisPage() {
  const handleRetry = () => {
    // Open camera for new analysis
    router.push('/');
  };

  const handleFeedback = (feedback: FeedbackRequest) => {
    // Submit feedback to API
    submitFeedback(feedback);
  };

  return (
    <AnalysisResult
      result={analysisResult}
      onRetry={handleRetry}
      onFeedback={handleFeedback}
    />
  );
}
```

### Without Callbacks (View Only)

```tsx
function HistoryItem() {
  return (
    <AnalysisResult result={historicalResult} />
  );
}
```

## Props

### `AnalysisResultProps`

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `result` | `AnalysisResult` | Yes | Analysis result data from AI |
| `onRetry` | `() => void` | No | Callback when "Foto Lagi" button is clicked |
| `onFeedback` | `(feedback: FeedbackRequest) => void` | No | Callback when feedback is submitted |

### `AnalysisResult` Type

```typescript
interface AnalysisResult {
  id: string;
  userId: string | null;
  imageUrl: string;
  imageStoragePath: string;
  maturityStatus: 'Matang' | 'Belum Matang';
  confidence: number; // 0-100
  sweetnessLevel: number; // 1-10
  watermelonType: 'merah' | 'kuning' | 'mini' | 'inul';
  skinQuality: 'baik' | 'sedang' | 'kurang baik';
  aiProvider: string;
  aiResponseTime: number; // milliseconds
  reasoning: string | null;
  metadata?: {
    location?: string;
    batchId?: string;
    deviceInfo?: string;
  };
  createdAt: Date;
}
```

## Visual Indicators

### Maturity Status Badge

- **Matang** (Ripe): Green badge with `variant="default"`
- **Belum Matang** (Unripe): Orange badge with `variant="secondary"`

### Confidence Progress Bar

- Visual progress bar showing AI confidence percentage
- Color: Primary theme color
- Range: 0-100%

### Sweetness Level

- Visual scale with 10 segments
- Filled segments indicate sweetness level
- Color: Primary theme color
- Range: 1-10

### Skin Quality

- **Baik** (Good): Green text
- **Sedang** (Medium): Yellow text
- **Kurang Baik** (Poor): Orange text

## Components Used

- `Card`, `CardContent`, `CardFooter`, `CardHeader`, `CardTitle` from `@/components/ui/card`
- `Badge` from `@/components/ui/badge`
- `Progress` from `@/components/ui/progress`
- `Button` from `@/components/ui/button`
- `Dialog`, `DialogContent`, `DialogDescription`, `DialogHeader`, `DialogTitle`, `DialogTrigger` from `@/components/ui/dialog`
- `Image` from `next/image`
- Icons: `Camera`, `Info` from `lucide-react`

## Accessibility

- All interactive elements have minimum 44x44px touch targets
- Proper ARIA labels for screen readers
- Keyboard navigation support
- Color contrast ratios meet WCAG 2.1 AA standards
- Focus indicators on all interactive elements

## Mobile Optimization

- Responsive design with mobile-first approach
- Touch-optimized buttons (min-h-11 for 44px height)
- Optimized image loading with Next.js Image
- Works on screen widths from 320px to desktop

## Styling

The component uses Tailwind CSS v4 with the following design tokens:

- Colors: Primary, secondary, muted, foreground
- Spacing: Consistent gap and padding
- Border radius: Rounded corners for modern look
- Shadows: Subtle shadows for depth

## Examples

See `analysis-result.example.tsx` for complete usage examples with sample data.

## Requirements Fulfilled

This component fulfills the following requirements from the spec:

- **Requirement 2.1**: Display estimated sweetness level (1-10 scale)
- **Requirement 2.2**: Display watermelon type classification
- **Requirement 2.3**: Display skin quality assessment
- **Requirement 2.4**: Visual indicators with color-coded badges
- **Requirement 10.1**: "Foto Lagi" button for quick re-analysis
- **Requirement 10.2**: Detailed explanation modal/dialog

## Future Enhancements

- Feedback submission UI (Task 25)
- Share/export functionality
- Comparison with previous analyses
- Offline support indicators
- Animation transitions

## Notes

- The component is a client component (`'use client'`) due to interactive elements
- Image optimization is handled by Next.js Image component
- All text is in Indonesian (Bahasa Indonesia)
- The component is fully typed with TypeScript
- Follows MelonAI design standards and best practices
