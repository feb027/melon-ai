/**
 * Centralized Configuration Management for MelonAI
 * 
 * This file provides type-safe access to environment variables and application configuration.
 * All environment variables are validated at runtime to ensure required values are present.
 */

// Supabase Configuration
export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
} as const;

// AI Provider Configuration
export const aiConfig = {
  google: {
    apiKey: process.env.GOOGLE_API_KEY,
    model: 'gemini-2.0-flash-exp',
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4-vision-preview',
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: 'claude-3-5-sonnet-20241022',
  },
} as const;

// Vercel KV (Redis) Configuration - Optional for MVP
export const kvConfig = {
  url: process.env.KV_URL,
  restApiUrl: process.env.KV_REST_API_URL,
  restApiToken: process.env.KV_REST_API_TOKEN,
  restApiReadOnlyToken: process.env.KV_REST_API_READ_ONLY_TOKEN,
  enabled: Boolean(process.env.KV_URL && process.env.KV_REST_API_TOKEN),
} as const;

// Application Configuration
export const appConfig = {
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  env: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
} as const;

// AI Provider Settings
export const aiSettings = {
  maxRetries: 2,
  timeout: 10000, // 10 seconds
  fallbackChain: ['google', 'openai', 'anthropic'] as const,
} as const;

// Image Upload Settings
export const imageSettings = {
  maxSizeMB: 2,
  maxSizeBytes: 2 * 1024 * 1024, // 2MB
  allowedFormats: ['image/jpeg', 'image/png'] as const,
  compressionQuality: 0.8,
} as const;

// Rate Limiting Settings
export const rateLimitSettings = {
  requestsPerHour: 100,
  windowMs: 60 * 60 * 1000, // 1 hour
} as const;

// Cache Settings
export const cacheSettings = {
  analyticsTTL: 15 * 60, // 15 minutes in seconds
  aiResponseTTL: 60 * 60, // 1 hour in seconds
} as const;

// Offline Queue Settings
export const offlineSettings = {
  maxQueueSize: 10,
  syncRetryDelay: 5000, // 5 seconds
  maxRetries: 3,
} as const;

/**
 * Validates that all required environment variables are present
 * @throws {Error} If required environment variables are missing
 */
export function validateConfig(): void {
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please check your .env.local file and ensure all required variables are set.'
    );
  }

  // Validate Supabase URL format
  if (!supabaseConfig.url.startsWith('https://')) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL must be a valid HTTPS URL');
  }

  // Warn if AI API keys are missing (not required for initial setup)
  const aiKeys = [
    { name: 'GOOGLE_API_KEY', value: aiConfig.google.apiKey },
    { name: 'OPENAI_API_KEY', value: aiConfig.openai.apiKey },
    { name: 'ANTHROPIC_API_KEY', value: aiConfig.anthropic.apiKey },
  ];

  const missingAiKeys = aiKeys.filter((key) => !key.value);

  if (missingAiKeys.length === aiKeys.length) {
    console.warn(
      '⚠️  Warning: No AI API keys configured. AI analysis features will not work.\n' +
      'Please add at least one AI provider API key to .env.local'
    );
  } else if (missingAiKeys.length > 0) {
    console.warn(
      `⚠️  Warning: Some AI API keys are missing: ${missingAiKeys.map(k => k.name).join(', ')}\n` +
      'Fallback to available providers will be used.'
    );
  }
}

/**
 * Gets the list of available AI providers based on configured API keys
 * @returns Array of available provider names
 */
export function getAvailableAIProviders(): Array<'google' | 'openai' | 'anthropic'> {
  const providers: Array<'google' | 'openai' | 'anthropic'> = [];

  if (aiConfig.google.apiKey) providers.push('google');
  if (aiConfig.openai.apiKey) providers.push('openai');
  if (aiConfig.anthropic.apiKey) providers.push('anthropic');

  return providers;
}

/**
 * Checks if caching is enabled (Vercel KV configured)
 * @returns true if caching is available
 */
export function isCachingEnabled(): boolean {
  return kvConfig.enabled;
}

// Export all configurations as a single object for convenience
export const config = {
  supabase: supabaseConfig,
  ai: aiConfig,
  kv: kvConfig,
  app: appConfig,
  aiSettings,
  imageSettings,
  rateLimitSettings,
  cacheSettings,
  offlineSettings,
} as const;

// Type exports for use in other files
export type AIProvider = 'google' | 'openai' | 'anthropic';
export type ImageFormat = typeof imageSettings.allowedFormats[number];
