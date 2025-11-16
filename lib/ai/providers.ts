/**
 * AI Provider Configuration for MelonAI
 * 
 * This module configures multiple AI providers with fallback mechanism:
 * - Primary: Google Gemini 2.5 Flash (fast & cost-effective)
 * - Secondary: OpenAI GPT-4 Vision (high accuracy)
 * - Tertiary: Anthropic Claude 3.5 Sonnet (advanced reasoning)
 * 
 * Uses Vercel AI SDK for unified interface across providers.
 */

import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';

/**
 * Zod schema for structured watermelon analysis output
 * Ensures consistent response format across all AI providers
 */
export const analysisSchema = z.object({
  maturityStatus: z.enum(['Matang', 'Belum Matang']).describe('Status kematangan semangka'),
  confidence: z.number().min(0).max(100).describe('Tingkat kepercayaan analisis (0-100)'),
  sweetnessLevel: z.number().min(1).max(10).describe('Perkiraan tingkat kemanisan (1-10)'),
  watermelonType: z.enum(['merah', 'kuning', 'mini', 'inul']).describe('Jenis semangka'),
  skinQuality: z.enum(['baik', 'sedang', 'kurang baik']).describe('Kualitas kulit semangka'),
  reasoning: z.string().describe('Penjelasan detail hasil analisis dalam Bahasa Indonesia'),
});

/**
 * TypeScript type inferred from Zod schema
 */
export type AnalysisOutput = z.infer<typeof analysisSchema>;

/**
 * AI Provider configuration interface
 */
export interface AIProvider {
  name: string;
  model: ReturnType<typeof google> | ReturnType<typeof openai> | ReturnType<typeof anthropic>;
  priority: number;
  description: string;
}

/**
 * Configure AI providers with priority order
 * Priority 1 = Primary, 2 = Secondary, 3 = Tertiary
 */
export const aiProviders: AIProvider[] = [
  {
    name: 'gemini',
    model: google('gemini-2.0-flash-exp'),
    priority: 1,
    description: 'Google Gemini 2.5 Flash - Fast & cost-effective',
  },
  {
    name: 'gpt4-vision',
    model: openai('gpt-4-vision-preview'),
    priority: 2,
    description: 'OpenAI GPT-4 Vision - High accuracy fallback',
  },
  {
    name: 'claude',
    model: anthropic('claude-3-5-sonnet-20241022'),
    priority: 3,
    description: 'Anthropic Claude 3.5 Sonnet - Advanced reasoning',
  },
];

/**
 * Analysis prompt in Indonesian for watermelon assessment
 * Used consistently across all AI providers
 */
export const analysisPrompt = `Analisis gambar semangka ini dan berikan penilaian yang akurat:

**Kriteria Penilaian:**

1. **Status Kematangan**: Tentukan apakah semangka ini sudah matang atau belum matang
   - Matang: Siap dipanen dan dikonsumsi
   - Belum Matang: Perlu waktu lebih lama untuk matang

2. **Tingkat Kemanisan**: Perkirakan tingkat kemanisan pada skala 1-10
   - 1-3: Kurang manis
   - 4-6: Manis sedang
   - 7-10: Sangat manis

3. **Jenis Semangka**: Identifikasi jenis semangka
   - merah: Semangka merah biasa
   - kuning: Semangka kuning
   - mini: Semangka mini/kecil
   - inul: Semangka inul (varietas lokal)

4. **Kualitas Kulit**: Nilai kondisi kulit semangka
   - baik: Kulit mulus, tidak ada kerusakan
   - sedang: Ada sedikit goresan atau noda
   - kurang baik: Banyak kerusakan atau busuk

**Dasar Analisis:**
- Keseragaman warna kulit (hijau tua = matang)
- Keberadaan dan warna bercak kuning/field spot (kuning = matang)
- Kondisi tangkai (kering = matang, hijau = belum matang)
- Tekstur dan kilau permukaan (kusam = matang, mengkilap = belum matang)
- Simetri bentuk dan ukuran
- Pola garis-garis pada kulit

**Penting:**
- Berikan penjelasan dalam Bahasa Indonesia yang mudah dipahami petani
- Jelaskan alasan di balik setiap penilaian
- Berikan tips praktis jika diperlukan

Berikan analisis yang objektif dan akurat berdasarkan gambar yang diberikan.`;

/**
 * Get available AI providers sorted by priority
 */
export function getAvailableProviders(): AIProvider[] {
  return aiProviders
    .filter(provider => {
      // Check if API key is configured
      const apiKey = getProviderApiKey(provider.name);
      return !!apiKey;
    })
    .sort((a, b) => a.priority - b.priority);
}

/**
 * Get API key for a specific provider
 */
function getProviderApiKey(providerName: string): string | undefined {
  switch (providerName) {
    case 'gemini':
      return process.env.GOOGLE_API_KEY;
    case 'gpt4-vision':
      return process.env.OPENAI_API_KEY;
    case 'claude':
      return process.env.ANTHROPIC_API_KEY;
    default:
      return undefined;
  }
}

/**
 * Validate that at least one AI provider is configured
 */
export function validateProviderConfiguration(): {
  isValid: boolean;
  message: string;
  availableProviders: string[];
} {
  const available = getAvailableProviders();
  
  if (available.length === 0) {
    return {
      isValid: false,
      message: 'No AI providers configured. Please set at least one API key in environment variables.',
      availableProviders: [],
    };
  }

  return {
    isValid: true,
    message: `${available.length} AI provider(s) configured successfully`,
    availableProviders: available.map(p => p.name),
  };
}
