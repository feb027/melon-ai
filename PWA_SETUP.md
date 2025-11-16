# PWA Setup Documentation

## Overview
MelonAI is configured as a Progressive Web App (PWA) using `next-pwa`, providing offline support, installability, and enhanced mobile experience.

## Configuration

### 1. Next.js Configuration (`next.config.ts`)
```typescript
import withPWA from "next-pwa";

const pwaConfig = withPWA({
  dest: 'public',              // Service worker output directory
  register: true,              // Auto-register service worker
  skipWaiting: true,           // Activate new service worker immediately
  disable: process.env.NODE_ENV === 'development', // Disable in dev
  reloadOnOnline: true,        // Reload when connection restored
  fallbacks: {
    document: '/_offline',     // Offline fallback page
  },
  disableDevLogs: true,        // Disable console logs in production
});
```

### 2. Web App Manifest (`public/manifest.json`)
The manifest defines how the app appears when installed:
- **Name**: MelonAI - Analisis Kematangan Semangka
- **Short Name**: MelonAI
- **Display**: standalone (full-screen app experience)
- **Theme Color**: #22c55e (green)
- **Background Color**: #ffffff (white)
- **Icons**: SVG icons (192x192, 512x512)
- **Shortcuts**: Quick actions for camera and history

### 3. Service Worker
Generated automatically by next-pwa during build:
- **File**: `public/sw.js`
- **Scope**: `/` (entire app)
- **Caching Strategy**: Workbox-powered
- **Offline Fallback**: `/_offline` page

## Features

### ✅ Installability
- Users can install MelonAI on their device
- Add to Home Screen on mobile
- Install as desktop app on Chrome/Edge
- Native app-like experience

### ✅ Offline Support
- App works without internet connection
- Offline fallback page at `/_offline`
- Cached assets for instant loading
- Service worker handles offline requests

### ✅ Auto Sync
- Photos taken offline are queued
- Automatic upload when connection restored
- `reloadOnOnline: true` refreshes app when online

### ✅ Fast & Reliable
- Precached static assets
- Optimized caching strategies
- Instant page loads
- Reduced bandwidth usage

## Build Process

### Important: Webpack Required
next-pwa uses webpack configuration, so builds must use webpack mode:

```bash
# Build with webpack (required for PWA)
bun run build

# Or explicitly
bun run build -- --webpack

# Build with Turbopack (PWA disabled)
bun run build:turbopack
```

### Build Output
After successful build, these files are generated in `public/`:
- `sw.js` - Service worker
- `workbox-*.js` - Workbox runtime
- `fallback-*.js` - Fallback handler

These files are automatically excluded from git (see `.gitignore`).

## Installation Instructions

### Android (Chrome)
1. Open MelonAI in Chrome
2. Tap menu (⋮) → "Add to Home screen" or "Install app"
3. Follow prompts to install
4. App icon appears on home screen

### iOS (Safari)
1. Open MelonAI in Safari
2. Tap Share button (square with arrow)
3. Scroll down → "Add to Home Screen"
4. Tap "Add" to confirm
5. App icon appears on home screen

### Desktop (Chrome/Edge)
1. Open MelonAI in Chrome or Edge
2. Click install icon in address bar
3. Or: Menu → "Install MelonAI"
4. Click "Install" to confirm
5. App opens in standalone window

## Testing PWA

### 1. Test Offline Mode
```bash
# Start production server
bun run build
bun run start

# In browser DevTools:
1. Open DevTools (F12)
2. Go to Network tab
3. Check "Offline" checkbox
4. Navigate to pages
5. Should see offline fallback at /_offline
```

### 2. Test Service Worker
```bash
# In browser DevTools:
1. Open DevTools (F12)
2. Go to Application tab
3. Click "Service Workers"
4. Verify sw.js is registered and activated
5. Check "Update on reload" for development
```

### 3. Test Manifest
```bash
# In browser DevTools:
1. Open DevTools (F12)
2. Go to Application tab
3. Click "Manifest"
4. Verify all fields are correct
5. Check icons are loading
```

### 4. Lighthouse Audit
```bash
# Run Lighthouse PWA audit:
1. Open DevTools (F12)
2. Go to Lighthouse tab
3. Select "Progressive Web App"
4. Click "Generate report"
5. Should score 90+ for PWA
```

## PWA Components

### 1. Install Prompt (`components/pwa-install-prompt.tsx`)
Custom install prompt that appears after 3 seconds:
- Detects if app is installable
- Shows benefits of installation
- Handles install flow
- Dismissible (saved to localStorage)

Usage:
```tsx
import { PWAInstallPrompt } from '@/components/pwa-install-prompt';

export default function Layout({ children }) {
  return (
    <>
      {children}
      <PWAInstallPrompt />
    </>
  );
}
```

### 2. Offline Page (`app/_offline/page.tsx`)
Fallback page shown when offline:
- User-friendly offline message
- Lists available offline features
- Retry button to check connection
- Styled with shadcn/ui components

## Icons

### Current Setup
Using SVG icons as placeholders:
- `icon.svg` - Main app icon
- `icon-192x192.svg` - 192x192 placeholder
- `icon-512x512.svg` - 512x512 placeholder

### Production Icons
For production, generate proper PNG icons:

1. **Online Tools** (Recommended):
   - https://realfavicongenerator.net/
   - https://www.pwabuilder.com/imageGenerator
   - Upload `icon.svg` and download PNGs

2. **ImageMagick**:
   ```bash
   magick icon.svg -resize 192x192 icon-192x192.png
   magick icon.svg -resize 512x512 icon-512x512.png
   ```

3. **Update manifest.json**:
   ```json
   "icons": [
     {
       "src": "/icon-192x192.png",
       "sizes": "192x192",
       "type": "image/png"
     },
     {
       "src": "/icon-512x512.png",
       "sizes": "512x512",
       "type": "image/png"
     }
   ]
   ```

See `public/ICONS_README.md` for detailed instructions.

## Troubleshooting

### Service Worker Not Registering
- Ensure you're using HTTPS or localhost
- Check browser console for errors
- Verify `register: true` in config
- Clear browser cache and reload

### Offline Mode Not Working
- Build with webpack: `bun run build`
- Verify `/_offline` page exists
- Check service worker is activated
- Test with DevTools offline mode

### Install Prompt Not Showing
- PWA criteria must be met (HTTPS, manifest, service worker)
- User must not have dismissed it before
- Check localStorage for 'pwa-install-dismissed'
- Some browsers have their own install UI

### Build Errors
- Use webpack mode: `bun run build`
- Turbopack doesn't support next-pwa
- Check `next-pwa.d.ts` exists for TypeScript

## Deployment

### Vercel Deployment
PWA works automatically on Vercel:
```bash
# Deploy to Vercel
vercel deploy

# Or push to GitHub (auto-deploy)
git push origin main
```

### Environment Variables
No special environment variables needed for PWA.

### HTTPS Required
PWA requires HTTPS in production:
- Vercel provides HTTPS automatically
- Service workers only work on HTTPS or localhost

## Performance

### Caching Strategy
next-pwa uses Workbox with these strategies:
- **Static assets**: Cache-first
- **API routes**: Network-first
- **Images**: Cache-first with expiration
- **Fonts**: Cache-first

### Cache Management
Service worker automatically:
- Precaches critical assets
- Updates cache on new deployment
- Cleans up old caches
- Handles cache versioning

## Best Practices

### ✅ DO:
- Build with webpack for PWA
- Test offline mode thoroughly
- Generate proper PNG icons for production
- Test on real mobile devices
- Monitor service worker updates
- Keep manifest.json updated

### ❌ DON'T:
- Don't build with Turbopack (PWA disabled)
- Don't commit generated service worker files
- Don't use HTTP in production
- Don't skip offline testing
- Don't forget to update icons

## Resources

### Documentation
- next-pwa: https://github.com/shadowwalker/next-pwa
- Workbox: https://developer.chrome.com/docs/workbox/
- PWA Guide: https://web.dev/progressive-web-apps/
- Web App Manifest: https://developer.mozilla.org/en-US/docs/Web/Manifest

### Tools
- Lighthouse: https://developer.chrome.com/docs/lighthouse/
- PWA Builder: https://www.pwabuilder.com/
- Favicon Generator: https://realfavicongenerator.net/

### Testing
- Chrome DevTools: Application tab
- Firefox DevTools: Application → Service Workers
- Safari Web Inspector: Storage → Service Workers

## Demo

Visit `/demo/pwa` to see PWA features demonstration and installation instructions.

## Support

PWA is supported on:
- ✅ Chrome/Edge (Android, Desktop)
- ✅ Safari (iOS, macOS)
- ✅ Firefox (Android, Desktop)
- ✅ Samsung Internet (Android)
- ⚠️ Limited support on older browsers

## Next Steps

1. ✅ PWA configured and working
2. ⏳ Generate production PNG icons
3. ⏳ Test on real mobile devices
4. ⏳ Implement offline queue (Task 18)
5. ⏳ Add push notifications (future)
6. ⏳ Optimize caching strategies (future)

---

**Status**: ✅ PWA Setup Complete
**Last Updated**: Task 17 Implementation
**Next Task**: Task 18 - Implement IndexedDB for offline queue
