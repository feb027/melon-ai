# E2E Tests - MelonAI

End-to-End tests for MelonAI using Playwright.

## Overview

This directory contains E2E tests that verify critical user flows and functionality across the MelonAI application.

## Test Files

### 1. `analysis-flow.spec.ts`
Tests the complete analysis flow from camera capture to result display.

**Test Cases:**
- Complete analysis flow (camera → upload → result)
- Navigation to demo pages
- Analysis result display
- Loading states
- Error handling
- UI accessibility (touch targets, Indonesian language)

### 2. `offline-mode.spec.ts`
Tests offline functionality including capture, queue, and sync.

**Test Cases:**
- Offline indicator display
- Queue counter for pending uploads
- IndexedDB storage when offline
- Auto-sync when connection restored
- Offline capture handling
- Queue management
- Manual sync trigger
- Service worker registration
- Static asset caching

### 3. `analytics-dashboard.spec.ts`
Tests analytics dashboard functionality including data display, filters, and charts.

**Test Cases:**
- Dashboard page load
- Summary statistics display
- Chart rendering (maturity rate, type distribution, sweetness)
- Date range, type, and location filters
- Filter application and data updates
- Insights and recommendations
- Trend analysis
- PDF export functionality
- Performance (load time < 3 seconds)
- Mobile responsiveness

## Running Tests

### Run all E2E tests
```bash
bun run test:e2e
```

### Run tests in UI mode (interactive)
```bash
bun run test:e2e:ui
```

### Run tests in headed mode (see browser)
```bash
bun run test:e2e:headed
```

### Run specific test file
```bash
bunx playwright test e2e/analysis-flow.spec.ts
```

### Run tests on specific browser
```bash
bunx playwright test --project=chromium
bunx playwright test --project=firefox
bunx playwright test --project=webkit
```

### Run tests on mobile viewports
```bash
bunx playwright test --project="Mobile Chrome"
bunx playwright test --project="Mobile Safari"
```

## Configuration

Tests are configured in `playwright.config.ts`:

- **Test Directory:** `./e2e`
- **Base URL:** `http://localhost:3000`
- **Browsers:** Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Web Server:** Automatically starts dev server before tests
- **Retries:** 2 retries on CI, 0 locally
- **Reporter:** HTML report

## Test Strategy

### 1. Critical User Flows
- Camera capture → Upload → AI analysis → Result display
- Offline capture → Queue → Online → Auto-sync
- Analytics dashboard → Filters → Charts → Export

### 2. Accessibility
- Touch target sizes (min 44x44px)
- Keyboard navigation
- Screen reader support
- Indonesian language

### 3. Performance
- Page load time < 3 seconds
- Analytics load time < 3 seconds
- Responsive on mobile viewports

### 4. Offline Functionality
- Service worker registration
- IndexedDB storage
- Auto-sync mechanism
- Queue management

## Best Practices

### 1. Use Data Test IDs
```typescript
// In component
<div data-testid="camera-capture">...</div>

// In test
await page.locator('[data-testid="camera-capture"]').click();
```

### 2. Wait for Elements
```typescript
// Wait for element to be visible
await expect(page.locator('h1')).toBeVisible({ timeout: 5000 });

// Wait for network to be idle
await page.waitForLoadState('networkidle');
```

### 3. Use Fallback Selectors
```typescript
// Try multiple selectors
const button = page.locator('button:has-text("Foto")')
  .or(page.locator('[data-testid="capture-button"]'));
```

### 4. Test Mobile-First
```typescript
// Set mobile viewport
await page.setViewportSize({ width: 375, height: 667 });
```

### 5. Handle Async Operations
```typescript
// Wait for timeout when needed
await page.waitForTimeout(1000);

// Use proper async/await
await page.goto('/');
await page.click('button');
```

## Debugging

### View Test Report
```bash
bunx playwright show-report
```

### Debug Specific Test
```bash
bunx playwright test --debug e2e/analysis-flow.spec.ts
```

### Generate Trace
```bash
bunx playwright test --trace on
```

### View Trace
```bash
bunx playwright show-trace trace.zip
```

## CI/CD Integration

Tests run automatically on CI with:
- Headless mode
- 2 retries per test
- HTML report uploaded as artifact

## Notes

### Camera Testing
- Actual camera testing requires mocking `MediaDevices` API
- Current tests verify UI elements are present
- Consider using `page.evaluate()` to mock camera access

### Offline Testing
- Use `context.setOffline(true)` to simulate offline mode
- Service worker may not register in test environment
- IndexedDB is available in Playwright

### Performance Testing
- Load times may vary in test environment
- Allow margin for slower CI environments
- Focus on relative performance, not absolute numbers

## Requirements Coverage

These E2E tests cover the following requirements from the spec:

- **Requirement 1:** Camera capture and image upload
- **Requirement 2:** Analysis result display
- **Requirement 3:** User-friendly interface (Indonesian, touch targets)
- **Requirement 4:** Analytics dashboard and trends
- **Requirement 5:** Offline functionality and sync
- **Requirement 8:** Mobile responsiveness
- **Requirement 10:** Quick re-analysis flow

## Future Improvements

1. Add visual regression testing
2. Mock camera API for actual capture testing
3. Add performance benchmarks
4. Test PWA installation flow
5. Add accessibility audit with axe-core
6. Test real AI API integration (with mocks)
7. Add load testing for concurrent users
8. Test push notifications
