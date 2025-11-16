// Centralized configuration management for MelonAI

export const config = {
  // Supabase configuration
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  },

  // AI providers configuration
  ai: {
    gemini: {
      apiKey: process.env.GOOGLE_API_KEY,
      model: 'gemini-2.0-flash-exp',
      enabled: !!process.env.GOOGLE_API_KEY,
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      model: 'gpt-4-vision-preview',
      enabled: !!process.env.OPENAI_API_KEY,
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: 'claude-3-5-sonnet-20241022',
      enabled: !!process.env.ANTHROPIC_API_KEY,
    },
  },

  // Image upload configuration
  upload: {
    maxSizeBytes: 2 * 1024 * 1024, // 2MB
    allowedFormats: ['image/jpeg', 'image/png', 'image/jpg'],
    compressionQuality: 0.8,
  },

  // Storage configuration
  storage: {
    bucketName: 'watermelon-images',
  },

  // Rate limiting configuration
  rateLimit: {
    maxRequestsPerHour: 100,
    windowMs: 60 * 60 * 1000, // 1 hour
  },

  // AI timeout configuration
  timeout: {
    aiAnalysis: 10000, // 10 seconds
    imageUpload: 30000, // 30 seconds
  },

  // Retry configuration
  retry: {
    maxRetries: 2,
    backoffMs: 1000,
  },

  // Cache configuration
  cache: {
    analyticsTTL: 15 * 60, // 15 minutes in seconds
    aiResponseTTL: 60 * 60, // 1 hour in seconds
  },

  // App metadata
  app: {
    name: 'MelonAI',
    description: 'Sistem analisis kematangan semangka menggunakan AI',
    version: '0.1.0',
    language: 'id', // Indonesian
  },
} as const

// Validate required environment variables
export function validateConfig() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ]

  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    )
  }

  // Warn if no AI providers are configured
  const hasAnyAI = config.ai.gemini.enabled || config.ai.openai.enabled || config.ai.anthropic.enabled
  if (!hasAnyAI) {
    console.warn('⚠️  No AI providers configured. Please add at least one AI API key.')
  }
}

// Export individual configs for convenience
export const supabaseConfig = config.supabase
export const aiConfig = config.ai
export const uploadConfig = config.upload
export const storageConfig = config.storage
export const rateLimitConfig = config.rateLimit
export const timeoutConfig = config.timeout
export const retryConfig = config.retry
export const cacheConfig = config.cache
export const appConfig = config.app
