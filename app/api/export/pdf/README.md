# PDF Export API

API endpoint untuk mengekspor laporan analitik dalam format PDF.

## Endpoint

```
POST /api/export/pdf
```

## Request Body

```json
{
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "location": "Jakarta",
  "watermelonType": "merah"
}
```

### Parameters

- `startDate` (required): Tanggal mulai periode laporan (ISO 8601 format)
- `endDate` (required): Tanggal akhir periode laporan (ISO 8601 format)
- `location` (optional): Filter berdasarkan lokasi
- `watermelonType` (optional): Filter berdasarkan jenis semangka (merah, kuning, mini, inul)

## Response

### Success (200)

```json
{
  "success": true,
  "data": {
    "downloadUrl": "https://project.supabase.co/storage/v1/object/sign/...",
    "fileName": "analytics-report-1234567890.pdf",
    "expiresIn": 3600,
    "expiresAt": "2024-01-31T12:00:00.000Z"
  }
}
```

### Error Responses

#### 400 - Missing Parameters
```json
{
  "success": false,
  "error": {
    "code": "MISSING_PARAMETERS",
    "message": "Tanggal mulai dan tanggal akhir harus diisi"
  }
}
```

#### 404 - No Data
```json
{
  "success": false,
  "error": {
    "code": "NO_DATA",
    "message": "Tidak ada data untuk periode yang dipilih"
  }
}
```

#### 500 - Internal Error
```json
{
  "success": false,
  "error": {
    "code": "DATABASE_ERROR",
    "message": "Gagal mengambil data analisis",
    "details": "Error details..."
  }
}
```

## Implementation Details

### PDF Generation

Menggunakan `@react-pdf/renderer` untuk membuat PDF dengan React components:

1. **Data Fetching**: Mengambil data analisis dari Supabase berdasarkan filter
2. **Metrics Calculation**: Menghitung metrik analitik (tingkat kematangan, rata-rata kemanisan, dll)
3. **PDF Generation**: Membuat PDF menggunakan React components
4. **Storage Upload**: Upload PDF ke Supabase Storage
5. **Signed URL**: Membuat signed URL yang berlaku 1 jam

### PDF Content

Laporan PDF mencakup:

**Halaman 1:**
- Header dengan periode laporan
- Informasi filter (lokasi, jenis semangka)
- Ringkasan metrik (total analisis, tingkat kematangan, rata-rata kemanisan, confidence)
- Distribusi jenis semangka
- Distribusi kualitas kulit

**Halaman 2:**
- Tabel 10 analisis terbaru
- Detail setiap analisis (tanggal, status, confidence, kemanisan, jenis, kualitas)

### Security

- Menggunakan `SUPABASE_SERVICE_ROLE_KEY` untuk operasi server-side
- Signed URL dengan expiry 1 jam untuk keamanan
- Validasi input untuk mencegah injection attacks

### Performance

- Stream-based PDF generation untuk memory efficiency
- Caching tidak diimplementasikan karena data bersifat dinamis
- Limit 10 analisis terbaru untuk menghindari PDF terlalu besar

## Usage Example

```typescript
const response = await fetch('/api/export/pdf', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    location: 'Jakarta',
    watermelonType: 'merah',
  }),
});

const result = await response.json();

if (result.success) {
  // Download PDF
  window.open(result.data.downloadUrl, '_blank');
}
```

## Storage Setup

✅ **Storage bucket `reports` sudah dikonfigurasi dengan:**
- Allowed MIME types: `application/pdf`
- File size limit: 50MB
- RLS policies:
  - `anon`: INSERT & SELECT (untuk API tanpa service role key)
  - `authenticated`: INSERT & SELECT
  - `service_role`: ALL

Bucket dibuat otomatis menggunakan Supabase MCP tools.

## Environment Variables

Required:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (server-side only, recommended)
  - Falls back to `NEXT_PUBLIC_SUPABASE_ANON_KEY` if not available
  - Note: Using anon key requires proper RLS policies on storage bucket

## Dependencies

- `@react-pdf/renderer`: PDF generation library
- `@supabase/supabase-js`: Supabase client

## Related Files

- `/lib/pdf/analytics-report.tsx`: PDF document component
- `/app/analytics/page.tsx`: Analytics dashboard with export button
