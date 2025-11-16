# Analytics Dashboard

Dashboard analitik untuk menampilkan statistik dan tren analisis semangka.

## Features

### 1. Summary Cards
- Total Analisis
- Tingkat Kematangan (%)
- Rata-rata Kemanisan (1-10)
- Rata-rata Confidence (%)

### 2. Filters
- **Date Range Picker**: Filter berdasarkan tanggal mulai dan akhir
- **Location Filter**: Filter berdasarkan lokasi
- **Watermelon Type Filter**: Filter berdasarkan jenis semangka (merah, kuning, mini, inul)

### 3. Charts (Tabs)

#### Tab 1: Tren
- **Line Chart**: Menampilkan tren tingkat kematangan dalam 30 hari terakhir
- X-axis: Tanggal
- Y-axis: Persentase kematangan

#### Tab 2: Jenis
- **Pie Chart**: Distribusi jenis semangka dengan persentase
- **Bar Chart**: Jumlah analisis per jenis semangka

#### Tab 3: Kualitas
- **Pie Chart**: Distribusi kualitas kulit dengan persentase
- **Bar Chart**: Jumlah analisis per kualitas kulit

## Technology Stack

- **Next.js 16**: App Router dengan Server Components
- **Recharts**: Chart library untuk visualisasi data
- **shadcn/ui**: UI components (Tabs, Card, Button, etc.)
- **Tailwind CSS v4**: Styling

## API Integration

Menggunakan `/api/analytics` endpoint dengan query parameters:
- `startDate`: ISO date string
- `endDate`: ISO date string
- `location`: Optional location filter
- `watermelonType`: Optional type filter

## Usage

```bash
# Navigate to analytics page
http://localhost:3000/analytics
```

### Filter Data
1. Pilih tanggal mulai dan akhir
2. (Optional) Masukkan lokasi
3. (Optional) Pilih jenis semangka
4. Klik "Terapkan Filter"
5. Klik "Reset" untuk mengembalikan ke default (30 hari terakhir)

### View Charts
1. Klik tab "Tren" untuk melihat line chart
2. Klik tab "Jenis" untuk melihat distribusi jenis
3. Klik tab "Kualitas" untuk melihat distribusi kualitas

## Responsive Design

- Mobile-first design
- Responsive grid layout untuk summary cards
- Responsive charts dengan ResponsiveContainer
- Tabs untuk navigasi antar chart sections

## Color Palette

- Primary (Green): `#10b981` - Matang
- Secondary (Orange): `#f59e0b` - Belum Matang
- Tertiary (Blue): `#3b82f6`
- Quaternary (Purple): `#8b5cf6`
- Quinary (Pink): `#ec4899`

## Requirements Fulfilled

- ✅ 4.1: Display aggregated data from Cloud Database
- ✅ 4.2: Display percentage of mature watermelons
- ✅ 4.3: Display trend chart showing maturity rates
- ✅ 4.4: Allow filtering by date range, location, and type

## Future Enhancements

- Export to PDF functionality (Task 27)
- Insights and recommendations (Task 24)
- Real-time updates with Supabase Realtime
- More chart types (scatter plot, heatmap)
