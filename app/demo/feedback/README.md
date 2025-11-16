# Feedback System Demo

Demo page untuk menguji feedback system yang diimplementasikan pada Task 25.

## Akses Demo

```
http://localhost:3000/demo/feedback
```

## Fitur yang Diimplementasikan

### 1. Feedback API Endpoint
- **File**: `app/api/feedback/route.ts`
- **Method**: POST
- **Endpoint**: `/api/feedback`
- **Validasi**: Zod schema
- **Database**: Supabase PostgreSQL (table: feedbacks)

### 2. Feedback Dialog Component
- **File**: `components/feedback-dialog.tsx`
- **UI Components**: shadcn/ui Dialog, Textarea, Label, Button
- **Features**:
  - "Sesuai" / "Tidak Sesuai" buttons dengan icons
  - Optional notes input (max 200 characters)
  - Actual maturity selection (jika tidak akurat)
  - Character counter untuk notes
  - Loading state saat submit
  - Thank you message setelah submit
  - Auto-close setelah 2 detik
  - Duplicate prevention

### 3. Integration dengan Analysis Result
- **File**: `components/analysis-result.tsx`
- **Changes**:
  - Added "Beri Feedback" button dengan MessageSquare icon
  - Integrated FeedbackDialog component
  - State management untuk dialog open/close

## Cara Menggunakan

1. Buka demo page: `http://localhost:3000/demo/feedback`
2. Klik tombol "Beri Feedback" di bawah hasil analisis
3. Pilih apakah hasil analisis "Sesuai" atau "Tidak Sesuai"
4. Jika tidak sesuai, pilih kondisi sebenarnya (Matang/Belum Matang)
5. Tambahkan catatan opsional (maksimal 200 karakter)
6. Klik "Kirim Feedback"
7. Feedback akan disimpan ke database Supabase
8. Thank you message akan muncul dan dialog akan tertutup otomatis

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

## API Request Example

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

## API Response Example

### Success
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "message": "Terima kasih atas feedback Anda! Feedback Anda membantu kami meningkatkan akurasi AI."
  }
}
```

### Error
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

## Requirements Fulfilled

✅ **Requirement 7.1**: WHEN the MelonAI System displays an Analysis Result, THE MelonAI System SHALL provide a feedback button with options "Sesuai" or "Tidak Sesuai"

✅ **Requirement 7.2**: WHEN the User submits feedback, THE MelonAI System SHALL store the feedback along with the original image and analysis result in the Cloud Database

✅ **Requirement 7.3**: THE MelonAI System SHALL allow the User to provide additional notes with a maximum of 200 characters when submitting feedback

✅ **Requirement 7.4**: THE MelonAI System SHALL display a thank you message after feedback submission

✅ **Requirement 7.5**: WHEN feedback is submitted, THE MelonAI System SHALL update the AI model training dataset in the Cloud Database for future model improvements

## Technical Details

### Components Used
- **shadcn/ui**: Dialog, Textarea, Label, Button, Badge
- **Icons**: lucide-react (ThumbsUp, ThumbsDown, MessageSquare, Loader2)
- **Validation**: Zod schema
- **Database**: Supabase PostgreSQL
- **Toast**: Custom useToast hook (sonner)

### Error Handling
- Validation errors (Zod)
- Analysis not found (404)
- Duplicate feedback (409)
- Database errors (500)
- Network errors
- User-friendly Indonesian error messages

### Security Features
- Foreign key constraints
- Input validation
- SQL injection prevention (parameterized queries)
- XSS prevention (React escaping)
- Rate limiting ready (can be added)

## Testing

### Manual Testing
1. Test "Sesuai" feedback
2. Test "Tidak Sesuai" feedback dengan actual maturity
3. Test dengan notes (max 200 chars)
4. Test tanpa notes
5. Test duplicate feedback (should fail)
6. Test dengan invalid analysis ID (should fail)
7. Test dengan invalid user ID (should fail)

### Database Verification
```sql
-- Check feedback records
SELECT * FROM feedbacks ORDER BY created_at DESC LIMIT 10;

-- Check feedback with analysis details
SELECT 
  f.id,
  f.is_accurate,
  f.notes,
  f.actual_maturity,
  a.maturity_status as predicted_maturity,
  f.created_at
FROM feedbacks f
JOIN analyses a ON f.analysis_id = a.id
ORDER BY f.created_at DESC;
```

## Files Created/Modified

### Created
- ✅ `app/api/feedback/route.ts` - Feedback API endpoint
- ✅ `app/api/feedback/README.md` - API documentation
- ✅ `components/feedback-dialog.tsx` - Feedback dialog component
- ✅ `app/demo/feedback/page.tsx` - Demo page
- ✅ `app/demo/feedback/README.md` - This file

### Modified
- ✅ `components/analysis-result.tsx` - Added feedback button and dialog integration

### Installed
- ✅ `components/ui/textarea.tsx` - shadcn/ui Textarea component
- ✅ `components/ui/label.tsx` - shadcn/ui Label component

## Git Commit

```bash
git add .
git commit -m "feat(feedback): implement feedback system for AI accuracy

- Create POST /api/feedback endpoint with Zod validation
- Add FeedbackDialog component with Sesuai/Tidak Sesuai buttons
- Integrate feedback dialog with AnalysisResult component
- Add optional notes input (max 200 characters)
- Add actual maturity selection for incorrect predictions
- Implement thank you message and auto-close
- Add duplicate feedback prevention
- Save feedback to Supabase with analysis linkage
- Add comprehensive error handling
- Create demo page at /demo/feedback

Requirements: 7.1, 7.2, 7.3, 7.4, 7.5"
```

## Next Steps

1. Add rate limiting untuk prevent spam
2. Add analytics untuk feedback data
3. Add admin dashboard untuk review feedback
4. Implement AI model retraining dengan feedback data
5. Add email notification untuk admin saat feedback diterima
6. Add feedback history untuk user
