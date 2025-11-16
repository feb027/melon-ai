# Feedback API

API endpoint untuk menerima feedback dari pengguna tentang akurasi analisis AI.

## Endpoint

```
POST /api/feedback
```

## Request Body

```typescript
{
  analysisId: string;      // UUID dari analisis yang diberi feedback
  userId: string;          // UUID dari user yang memberi feedback
  isAccurate: boolean;     // true = Sesuai, false = Tidak Sesuai
  notes?: string;          // Catatan tambahan (max 200 karakter)
  actualMaturity?: 'Matang' | 'Belum Matang';  // Kondisi sebenarnya (jika tidak akurat)
}
```

## Response

### Success (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "message": "Terima kasih atas feedback Anda! Feedback Anda membantu kami meningkatkan akurasi AI."
  }
}
```

### Error Responses

#### 400 Bad Request - Validation Error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Data tidak valid",
    "details": [...]
  }
}
```

#### 404 Not Found - Analysis Not Found
```json
{
  "success": false,
  "error": {
    "code": "ANALYSIS_NOT_FOUND",
    "message": "Analisis tidak ditemukan"
  }
}
```

#### 409 Conflict - Feedback Already Exists
```json
{
  "success": false,
  "error": {
    "code": "FEEDBACK_ALREADY_EXISTS",
    "message": "Anda sudah memberikan feedback untuk analisis ini"
  }
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "error": {
    "code": "DATABASE_ERROR",
    "message": "Gagal menyimpan feedback"
  }
}
```

## Database Schema

```sql
CREATE TABLE feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES analyses(id),
  user_id UUID NOT NULL REFERENCES users(id),
  is_accurate BOOLEAN NOT NULL,
  notes TEXT,
  actual_maturity TEXT CHECK (actual_maturity IN ('Matang', 'Belum Matang')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Features

- ✅ Validation dengan Zod schema
- ✅ Foreign key validation (analysis & user must exist)
- ✅ Duplicate prevention (one feedback per analysis per user)
- ✅ Optional notes (max 200 characters)
- ✅ Optional actual maturity (if prediction was wrong)
- ✅ Comprehensive error handling
- ✅ Indonesian error messages

## Usage Example

```typescript
const response = await fetch('/api/feedback', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    analysisId: '231a402e-1a7e-4966-8c68-03df82b6bacb',
    userId: '00000000-0000-0000-0000-000000000001',
    isAccurate: false,
    notes: 'Semangka sebenarnya belum matang',
    actualMaturity: 'Belum Matang',
  }),
});

const result = await response.json();
```

## Requirements Fulfilled

- **7.1**: Feedback button with "Sesuai" / "Tidak Sesuai" options
- **7.2**: Store feedback with original image and analysis result
- **7.3**: Optional notes with 200 character limit
- **7.4**: Thank you message after submission
- **7.5**: Update AI training dataset in database

## Related Files

- `app/api/feedback/route.ts` - API endpoint
- `components/feedback-dialog.tsx` - Feedback dialog component
- `components/analysis-result.tsx` - Analysis result with feedback button
- `app/demo/feedback/page.tsx` - Demo page
