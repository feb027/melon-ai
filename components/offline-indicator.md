# OfflineIndicator Component

Component untuk menampilkan status jaringan dan informasi queue offline dengan pesan dalam Bahasa Indonesia.

## Features

- ✅ Real-time network status detection (online/offline)
- ✅ Persistent banner saat offline menggunakan shadcn/ui Alert
- ✅ Queue counter badge untuk pending uploads
- ✅ Sync status icon dengan animasi
- ✅ User-friendly messages dalam Bahasa Indonesia
- ✅ Automatic sync success notification
- ✅ Manual sync trigger option
- ✅ Responsive design untuk mobile-first

## Usage

### Basic Usage

```tsx
import { OfflineIndicator } from '@/components/offline-indicator';

export default function Layout({ children }) {
  return (
    <>
      <OfflineIndicator />
      {children}
    </>
  );
}
```

### With Queue Management

```tsx
import { OfflineIndicator } from '@/components/offline-indicator';
import { useState } from 'react';

export default function App() {
  const [queueCount, setQueueCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      // Sync logic here
      await syncOfflineQueue();
      setQueueCount(0);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <>
      <OfflineIndicator
        queueCount={queueCount}
        isSyncing={isSyncing}
        onManualSync={handleManualSync}
      />
      {/* Your app content */}
    </>
  );
}
```

### Using the useOnlineStatus Hook

```tsx
import { useOnlineStatus } from '@/components/offline-indicator';

export function MyComponent() {
  const isOnline = useOnlineStatus();

  return (
    <div>
      {isOnline ? 'Connected' : 'Disconnected'}
    </div>
  );
}
```

## Props

### OfflineIndicator

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `queueCount` | `number` | `0` | Jumlah foto yang menunggu untuk diunggah |
| `isSyncing` | `boolean` | `false` | Status sinkronisasi sedang berjalan |
| `onManualSync` | `() => void` | `undefined` | Callback untuk trigger manual sync |
| `className` | `string` | `undefined` | Additional CSS classes |

## Component States

### 1. Offline State
**Kondisi:** `!isOnline`

Banner orange dengan icon WifiOff:
- Pesan: "Anda sedang offline. Foto akan diunggah saat koneksi kembali."
- Badge menampilkan jumlah foto menunggu (jika ada)

### 2. Syncing State
**Kondisi:** `isOnline && isSyncing && queueCount > 0`

Banner biru dengan icon RefreshCw (animated):
- Pesan: "Mengunggah foto..."
- Badge menampilkan jumlah foto tersisa

### 3. Queue Pending State
**Kondisi:** `isOnline && !isSyncing && queueCount > 0`

Banner kuning dengan icon Wifi:
- Pesan: "Koneksi tersedia. Ada foto yang belum diunggah."
- Badge menampilkan jumlah foto
- Tombol "Sinkronkan" untuk manual sync (jika `onManualSync` provided)

### 4. Sync Success State
**Kondisi:** Muncul 3 detik setelah kembali online dengan queue

Banner hijau dengan icon CheckCircle2:
- Pesan: "Sinkronisasi berhasil! Semua foto telah diunggah."
- Auto-hide setelah 3 detik

### 5. Normal State
**Kondisi:** `isOnline && queueCount === 0`

Tidak menampilkan banner (component returns null)

## Styling

Component menggunakan Tailwind CSS v4 dengan color scheme:
- **Offline:** Orange (warning)
- **Syncing:** Blue (info)
- **Queue Pending:** Yellow (attention)
- **Success:** Green (success)

Semua warna support dark mode dengan `dark:` variants.

## Accessibility

- ✅ Proper ARIA roles (`role="alert"`)
- ✅ Semantic HTML structure
- ✅ Keyboard accessible (manual sync button)
- ✅ Screen reader friendly
- ✅ Focus indicators untuk interactive elements

## Testing

Demo page tersedia di: `/demo/offline-indicator`

### Manual Testing Steps

1. **Test Offline Detection:**
   - Buka DevTools → Network tab
   - Pilih "Offline" dari dropdown
   - Verify banner orange muncul

2. **Test Queue Counter:**
   - Klik "Tambah ke Queue" di demo page
   - Verify badge menampilkan jumlah yang benar

3. **Test Syncing State:**
   - Klik "Mulai Sinkronisasi"
   - Verify banner biru dengan animasi muncul
   - Verify counter berkurang setiap detik

4. **Test Manual Sync:**
   - Set queue count > 0
   - Ensure online
   - Klik tombol "Sinkronkan"
   - Verify sync process berjalan

5. **Test Online/Offline Transitions:**
   - Toggle network status di DevTools
   - Verify banner berubah sesuai status
   - Verify success message muncul saat kembali online

## Integration with Offline Queue

Component ini dirancang untuk bekerja dengan offline queue system (Task 18-20):

```tsx
// Example integration
import { OfflineIndicator } from '@/components/offline-indicator';
import { useOfflineQueue } from '@/lib/offline/hooks';

export default function App() {
  const { queueCount, isSyncing, syncQueue } = useOfflineQueue();

  return (
    <>
      <OfflineIndicator
        queueCount={queueCount}
        isSyncing={isSyncing}
        onManualSync={syncQueue}
      />
      {/* App content */}
    </>
  );
}
```

## Requirements Fulfilled

- ✅ **5.1:** Network status detection dan offline handling
- ✅ **5.2:** Local storage untuk offline queue (UI ready)
- ✅ **5.3:** Clear status indicator (online/offline/syncing)
- ✅ **5.4:** Queue counter dan sync status
- ✅ **Indonesian Language:** Semua pesan dalam Bahasa Indonesia
- ✅ **Mobile-First:** Responsive design dengan touch-friendly UI
- ✅ **Accessibility:** WCAG 2.1 AA compliant

## Dependencies

- `lucide-react` - Icons (WifiOff, Wifi, RefreshCw, CheckCircle2)
- `@/components/ui/alert` - shadcn/ui Alert component
- `@/components/ui/badge` - shadcn/ui Badge component
- `@/lib/utils` - cn utility function

## Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

Uses standard Web APIs:
- `navigator.onLine` - Network status
- `window.addEventListener('online')` - Online event
- `window.addEventListener('offline')` - Offline event

## Future Enhancements

- [ ] Add sound notification untuk sync success
- [ ] Add haptic feedback untuk mobile devices
- [ ] Add retry count indicator untuk failed uploads
- [ ] Add estimated time remaining untuk sync
- [ ] Add network speed indicator (3G/4G/5G/WiFi)
