# AI Module - MelonAI

This module handles AI-powered watermelon analysis using multiple AI providers with automatic fallback and retry logic.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     AI Orchestrator                          │
│  - Provider selection & fallback                             │
│  - Retry logic with exponential backoff                      │
│  - Timeout handling (10s per provider)                       │
│  - Performance logging to Supabase                           │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Gemini     │    │  GPT-4 Vision│    │   Claude     │
│  (Primary)   │    │  (Secondary) │    │  (Tertiary)  │
│  Priority 1  │    │  Priority 2  │    │  Priority 3  │
└──────────────┘    └──────────────┘    └──────────────┘
```

## Files

- **`providers.ts`** - AI provider configuration and schemas
- **`orchestrator.ts`** - Main orchestrator with fallback logic
- **`orchestrator.example.ts`** - Usage examples
- **`README.md`** - This documentation

## Quick Start

### Basic Usage

```typescript
import { analyzeImage } from '@/lib/ai/orchestrator';

// Analyze a watermelon image
const result = await analyzeImage('https://example.com/watermelon.jpg');

console.log(result.maturityStatus); // 'Matang' or 'Belum Matang'
console.log(result.confidence);     // 0-100
console.log(result.sweetnessLevel); // 1-10
console.log(result.watermelonType); // 'merah', 'kuning', 'mini', 'inul'
console.log(result.skinQuality);    // 'baik', 'sedang', 'kurang baik'
console.log(result.reasoning);      // Detailed explanation in Indonesian
```

### Advanced Usage

```typescript
import { aiOrchestrator } from '@/lib/ai/orchestrator';

// Analyze image
const result = await aiOrchestrator.analyzeImage(imageUrl);

// Get provider statistics
const stats = await aiOrchestrator.getProviderStatistics(100);
console.log(stats);
// [
//   {
//     provider: 'gemini',
//     totalRequests: 50,
//     successRate: 98.5,
//     avgResponseTime: 1200
//   },
//   ...
// ]
```

### Error Handling

```typescript
import { analyzeImage, AIServiceError } from '@/lib/ai/orchestrator';

try {
  const result = await analyzeImage(imageUrl);
  // Handle success
} catch (error) {
  if (error instanceof AIServiceError) {
    console.error('AI Service Error:', error.message);
    console.error('Failed Provider:', error.provider);
    // Implement fallback logic:
    // - Save to offline queue
    // - Show user-friendly error message
    // - Retry later
  }
}
```

## Features

### 1. Multi-Provider Fallback

The orchestrator automatically tries providers in priority order:

1. **Gemini 2.5 Flash** (Primary) - Fast & cost-effective
2. **GPT-4 Vision** (Secondary) - High accuracy fallback
3. **Claude 3.5 Sonnet** (Tertiary) - Advanced reasoning

If one provider fails, it automatically moves to the next.

### 2. Retry Logic

Each provider gets **2 retry attempts** with exponential backoff:

- Attempt 1: Immediate
- Attempt 2: Wait 1 second
- Attempt 3: Wait 2 seconds (if configured)

### 3. Timeout Handling

Each provider has a **10-second timeout** to prevent hanging requests.

### 4. Performance Logging

All requests are logged to Supabase `ai_performance_logs` table:

```sql
CREATE TABLE ai_performance_logs (
  id UUID PRIMARY KEY,
  provider TEXT NOT NULL,
  response_time INTEGER NOT NULL,
  success BOOLEAN NOT NULL,
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  error_message TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);
```

### 5. Structured Output

Uses Zod schema for type-safe, validated responses:

```typescript
{
  maturityStatus: 'Matang' | 'Belum Matang',
  confidence: number,        // 0-100
  sweetnessLevel: number,    // 1-10
  watermelonType: 'merah' | 'kuning' | 'mini' | 'inul',
  skinQuality: 'baik' | 'sedang' | 'kurang baik',
  reasoning: string          // Indonesian explanation
}
```

## Configuration

### Environment Variables

Set at least one AI provider API key:

```bash
# .env.local
GOOGLE_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key

# Supabase (for performance logging)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Provider Configuration

Edit `providers.ts` to customize:

```typescript
export const aiProviders: AIProvider[] = [
  {
    name: 'gemini',
    model: google('gemini-2.0-flash-exp'),
    priority: 1,  // Lower = higher priority
    description: 'Google Gemini 2.5 Flash',
  },
  // Add more providers...
];
```

### Orchestrator Settings

Edit `orchestrator.ts` to customize:

```typescript
class AIProviderManager {
  private maxRetriesPerProvider = 2;  // Max retries per provider
  private timeoutMs = 10000;          // 10 seconds timeout
}
```

## Analysis Prompt

The analysis prompt is defined in `providers.ts` and includes:

- Maturity assessment criteria
- Sweetness level estimation
- Watermelon type identification
- Skin quality evaluation
- Visual indicators to look for
- Indonesian language instructions

## Performance Monitoring

### Get Provider Statistics

```typescript
const stats = await aiOrchestrator.getProviderStatistics(100);

stats.forEach(stat => {
  console.log(`${stat.provider}:`);
  console.log(`  Requests: ${stat.totalRequests}`);
  console.log(`  Success Rate: ${stat.successRate}%`);
  console.log(`  Avg Response Time: ${stat.avgResponseTime}ms`);
});
```

### Query Performance Logs

```sql
-- Get recent performance logs
SELECT * FROM ai_performance_logs
ORDER BY timestamp DESC
LIMIT 100;

-- Get provider statistics
SELECT 
  provider,
  COUNT(*) as total_requests,
  AVG(response_time) as avg_response_time,
  SUM(CASE WHEN success THEN 1 ELSE 0 END)::float / COUNT(*) * 100 as success_rate
FROM ai_performance_logs
GROUP BY provider;
```

## Cost Optimization

### Estimated Costs (per 1000 analyses)

- **Gemini 2.5 Flash**: ~$0.10 (primary, 95% of requests)
- **GPT-4 Vision**: ~$10 (fallback, 4% of requests)
- **Claude 3.5 Sonnet**: ~$5 (rare, 1% of requests)

**Total**: ~$0.60 per 1000 analyses

### Optimization Tips

1. **Cache Results**: Cache identical images using Vercel KV
2. **Gemini First**: Always try Gemini first (cheapest)
3. **Rate Limiting**: Prevent abuse with rate limits
4. **Image Compression**: Compress images before analysis

## Testing

### Unit Tests

```bash
bun test lib/ai/orchestrator.test.ts
```

### Integration Tests

```bash
# Test with real API keys
bun test lib/ai/orchestrator.integration.test.ts
```

### Manual Testing

```typescript
import { analyzeImage } from '@/lib/ai/orchestrator';

// Test with a real watermelon image
const result = await analyzeImage('https://example.com/watermelon.jpg');
console.log(result);
```

## Troubleshooting

### All Providers Failing

1. Check API keys are set correctly
2. Verify network connectivity
3. Check provider status pages
4. Review error logs in Supabase

### Slow Response Times

1. Check provider statistics
2. Consider increasing timeout
3. Optimize image size
4. Use caching for repeated requests

### High Error Rates

1. Review error messages in logs
2. Check API rate limits
3. Verify image URLs are accessible
4. Test with different images

## Future Enhancements

- [ ] Add more AI providers (Anthropic, Cohere, etc.)
- [ ] Implement response caching with Vercel KV
- [ ] Add A/B testing for provider comparison
- [ ] Implement adaptive provider selection based on performance
- [ ] Add batch analysis support
- [ ] Implement cost tracking and budgets

## References

- [Vercel AI SDK Documentation](https://sdk.vercel.ai/docs)
- [Google Gemini API](https://ai.google.dev/docs)
- [OpenAI Vision API](https://platform.openai.com/docs/guides/vision)
- [Anthropic Claude API](https://docs.anthropic.com/claude/docs)
- [Supabase Documentation](https://supabase.com/docs)
