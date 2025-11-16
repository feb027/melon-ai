/**
 * Application-specific types for MelonAI
 * These types are used throughout the application for type safety
 */

import type { Tables, TablesInsert, TablesUpdate } from './database.types';

// ============================================================================
// User Types
// ============================================================================

export type UserRole = 'petani' | 'pedagang' | 'admin';

export interface User extends Tables<'users'> {
  role: UserRole | null;
}

export type UserInsert = TablesInsert<'users'>;
export type UserUpdate = TablesUpdate<'users'>;

// ============================================================================
// Analysis Types
// ============================================================================

export type MaturityStatus = 'Matang' | 'Belum Matang';
export type WatermelonType = 'merah' | 'kuning' | 'mini' | 'inul';
export type SkinQuality = 'baik' | 'sedang' | 'kurang baik';

export interface AnalysisResult {
  id: string;
  userId: string | null;
  imageUrl: string;
  imageStoragePath: string;
  maturityStatus: MaturityStatus;
  confidence: number; // 0-100
  sweetnessLevel: number; // 1-10
  watermelonType: WatermelonType;
  skinQuality: SkinQuality;
  aiProvider: string;
  aiResponseTime: number; // milliseconds
  reasoning: string | null;
  metadata?: AnalysisMetadata;
  createdAt: Date;
}

export interface AnalysisMetadata {
  location?: string;
  batchId?: string;
  deviceInfo?: string;
}

export type Analysis = Tables<'analyses'>;
export type AnalysisInsert = TablesInsert<'analyses'>;
export type AnalysisUpdate = TablesUpdate<'analyses'>;

// ============================================================================
// Feedback Types
// ============================================================================

export interface Feedback extends Tables<'feedbacks'> {
  actualMaturity: MaturityStatus | null;
}

export type FeedbackInsert = TablesInsert<'feedbacks'>;
export type FeedbackUpdate = TablesUpdate<'feedbacks'>;

// ============================================================================
// AI Performance Log Types
// ============================================================================

export interface AIPerformanceLog extends Tables<'ai_performance_logs'> {}

export type AIPerformanceLogInsert = TablesInsert<'ai_performance_logs'>;
export type AIPerformanceLogUpdate = TablesUpdate<'ai_performance_logs'>;

// ============================================================================
// Analytics Types
// ============================================================================

export interface AnalyticsData {
  totalAnalyses: number;
  maturityRate: number; // percentage
  averageSweetness: number;
  typeDistribution: Record<WatermelonType, number>;
  trendData: Array<{ date: string; maturityRate: number }>;
}

export interface AnalyticsFilters {
  location?: string;
  watermelonType?: WatermelonType;
  startDate?: Date;
  endDate?: Date;
}

// ============================================================================
// Offline Queue Types (Client-side)
// ============================================================================

export type OfflineQueueStatus = 'pending' | 'uploading' | 'failed';

export interface OfflineQueueItem {
  id: string;
  imageBlob: Blob;
  userId: string;
  metadata?: AnalysisMetadata;
  timestamp: Date;
  status: OfflineQueueStatus;
  retryCount: number;
  lastError?: string;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface AnalyzeRequest {
  image: File | Blob;
  userId: string;
  metadata?: AnalysisMetadata;
}

export interface AnalyzeResponse {
  success: boolean;
  data?: AnalysisResult;
  error?: APIError;
}

export interface AnalyticsRequest {
  userId: string;
  startDate: string;
  endDate: string;
  filters?: AnalyticsFilters;
}

export interface AnalyticsResponse {
  success: boolean;
  data?: AnalyticsData;
  error?: APIError;
}

export interface FeedbackRequest {
  analysisId: string;
  userId: string;
  isAccurate: boolean;
  notes?: string;
  actualMaturity?: MaturityStatus;
}

export interface FeedbackResponse {
  success: boolean;
  error?: APIError;
}

export interface ExportRequest {
  userId: string;
  analysisIds: string[];
  format: 'pdf';
}

export interface ExportResponse {
  success: boolean;
  downloadUrl?: string;
  error?: APIError;
}

// ============================================================================
// Error Types
// ============================================================================

export type ErrorType =
  | 'NETWORK_ERROR'
  | 'CAMERA_ACCESS_DENIED'
  | 'IMAGE_TOO_LARGE'
  | 'INVALID_IMAGE_FORMAT'
  | 'AI_SERVICE_ERROR'
  | 'DATABASE_ERROR'
  | 'UNKNOWN_ERROR';

export interface AppError {
  type: ErrorType;
  message: string;
  userMessage: string; // Indonesian, user-friendly
  retryable: boolean;
  action?: () => void;
}

export interface APIError {
  code: string;
  message: string;
  details?: unknown;
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface CameraComponentProps {
  onCapture: (imageBlob: Blob) => void;
  onError: (error: AppError) => void;
}

export interface AnalysisResultProps {
  result: AnalysisResult;
  onRetry?: () => void;
  onFeedback?: (feedback: FeedbackRequest) => void;
}

export interface AnalyticsDashboardProps {
  userId: string;
  dateRange: { start: Date; end: Date };
  filters?: AnalyticsFilters;
}

export interface OfflineIndicatorProps {
  isOnline: boolean;
  queueCount: number;
  onSync?: () => void;
}

// ============================================================================
// AI Provider Types
// ============================================================================

export type AIProviderName = 'gemini' | 'gpt4-vision' | 'claude';

export interface AIProviderConfig {
  name: AIProviderName;
  priority: number;
  enabled: boolean;
}

export interface AIAnalysisInput {
  imageUrl: string;
  prompt: string;
}

export interface AIAnalysisOutput {
  maturityStatus: MaturityStatus;
  confidence: number;
  sweetnessLevel: number;
  watermelonType: WatermelonType;
  skinQuality: SkinQuality;
  reasoning: string;
}

// ============================================================================
// Utility Types
// ============================================================================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncResult<T> = Promise<T>;
