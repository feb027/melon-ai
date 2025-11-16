import { Database } from './database.types'

// Application-specific types based on database schema
export type User = Database['public']['Tables']['users']['Row']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type UserUpdate = Database['public']['Tables']['users']['Update']

export type Analysis = Database['public']['Tables']['analyses']['Row']
export type AnalysisInsert = Database['public']['Tables']['analyses']['Insert']
export type AnalysisUpdate = Database['public']['Tables']['analyses']['Update']

export type Feedback = Database['public']['Tables']['feedbacks']['Row']
export type FeedbackInsert = Database['public']['Tables']['feedbacks']['Insert']
export type FeedbackUpdate = Database['public']['Tables']['feedbacks']['Update']

export type AIPerformanceLog = Database['public']['Tables']['ai_performance_logs']['Row']
export type AIPerformanceLogInsert = Database['public']['Tables']['ai_performance_logs']['Insert']
export type AIPerformanceLogUpdate = Database['public']['Tables']['ai_performance_logs']['Update']

// Analysis Result type for AI responses
export interface AnalysisResult {
  id: string
  imageUrl: string
  maturityStatus: 'Matang' | 'Belum Matang'
  confidence: number // 0-100
  sweetnessLevel: number // 1-10
  watermelonType: 'merah' | 'kuning' | 'mini' | 'inul'
  skinQuality: 'baik' | 'sedang' | 'kurang baik'
  aiProvider: string
  aiResponseTime: number
  reasoning: string
  timestamp: Date
}

// User roles
export type UserRole = 'petani' | 'pedagang' | 'admin'

// Maturity status
export type MaturityStatus = 'Matang' | 'Belum Matang'

// Watermelon types
export type WatermelonType = 'merah' | 'kuning' | 'mini' | 'inul'

// Skin quality
export type SkinQuality = 'baik' | 'sedang' | 'kurang baik'

// Analytics data
export interface AnalyticsData {
  totalAnalyses: number
  maturityRate: number // percentage
  averageSweetness: number
  typeDistribution: Record<WatermelonType, number>
  trendData: Array<{ date: string; maturityRate: number }>
}

// Offline queue item (client-side only)
export interface OfflineQueueItem {
  id: string
  imageBlob: Blob
  userId: string
  metadata?: {
    location?: string
    batchId?: string
  }
  timestamp: Date
  status: 'pending' | 'uploading' | 'failed'
  retryCount: number
  lastError?: string
}

// Error types
export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  CAMERA_ACCESS_DENIED = 'CAMERA_ACCESS_DENIED',
  IMAGE_TOO_LARGE = 'IMAGE_TOO_LARGE',
  INVALID_IMAGE_FORMAT = 'INVALID_IMAGE_FORMAT',
  AI_SERVICE_ERROR = 'AI_SERVICE_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface AppError {
  type: ErrorType
  message: string
  userMessage: string // Indonesian, user-friendly
  retryable: boolean
  action?: () => void
}
