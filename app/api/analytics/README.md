# Analytics API

API endpoint untuk mengambil data analitik agregat dari analisis semangka.

## Endpoint

```
GET /api/analytics
```

## Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `startDate` | ISO Date String | No | 30 days ago | Tanggal mulai filter |
| `endDate` | ISO Date String | No | Now | Tanggal akhir filter |
| `location` | String | No | - | Filter berdasarkan lokasi |
| `watermelonType` | String | No | - | Filter berdasarkan jenis semangka (merah, kuning, mini, inul) |

## Response

### Success Response (200)

```json
{
  "success": true,
  "data": {
    "totalAnalyses": 9,
    "maturityRate": 66.67,
    "averageSweetness": 6.33,
    "averageConfidence": 82.22,
    "typeDistribution": [
      {
        "type": "merah",
        "count": 5,
        "percentage": 55.56
      }
    ],
    "trendData": [
      {
        "date": "2025-11-16",
        "total": 9,
        "mature": 6,
        "maturityRate": 66.67
      }
    ],
    "skinQualityDistribution": [
      {
        "quality": "baik",
        "count": 8,
        "percentage": 88.89
      }
    ]
  },
  "cached": false
}
```

### Error Response (500)

```json
{
  "success": false,
  "error": {
    "code": "DATABASE_ERROR",
    "message": "Gagal mengambil data analitik",
    "details": "Error details"
  }
}
```

## Caching

- Data di-cache menggunakan Vercel KV dengan TTL 15 menit (900 detik)
- Cache key berdasarkan parameter query
- Jika Vercel KV tidak tersedia (development), caching dinonaktifkan
- Response header `cached: true` menunjukkan data dari cache

## Examples

### Get all analytics (last 30 days)
```bash
curl http://localhost:3000/api/analytics
```

### Filter by watermelon type
```bash
curl "http://localhost:3000/api/analytics?watermelonType=merah"
```

### Filter by date range
```bash
curl "http://localhost:3000/api/analytics?startDate=2025-11-01&endDate=2025-11-30"
```

### Filter by location and type
```bash
curl "http://localhost:3000/api/analytics?location=Jakarta&watermelonType=mini"
```

## Data Aggregations

### Metrics Calculated
- **totalAnalyses**: Total jumlah analisis dalam periode
- **maturityRate**: Persentase semangka matang (%)
- **averageSweetness**: Rata-rata tingkat kemanisan (1-10)
- **averageConfidence**: Rata-rata confidence AI (0-100%)

### Type Distribution
Distribusi jenis semangka dengan count dan persentase

### Trend Data
Data tren harian dengan:
- Total analisis per hari
- Jumlah semangka matang per hari
- Maturity rate per hari

### Skin Quality Distribution
Distribusi kualitas kulit semangka (baik, sedang, kurang baik)

## Requirements

- Supabase database dengan tabel `analyses`
- Vercel KV (optional, untuk caching di production)
- Environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `KV_REST_API_URL` (optional)
  - `KV_REST_API_TOKEN` (optional)
