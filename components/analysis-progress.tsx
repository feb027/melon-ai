'use client';

import { CheckCircle2, Circle, Loader2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type AnalysisStage = 
  | 'idle'
  | 'validating-image'
  | 'uploading'
  | 'checking-watermelon'
  | 'analyzing-ripeness'
  | 'complete'
  | 'error';

interface AnalysisProgressProps {
  currentStage: AnalysisStage;
  className?: string;
}

interface Stage {
  id: AnalysisStage;
  label: string;
  description: string;
}

const stages: Stage[] = [
  {
    id: 'validating-image',
    label: 'Validasi Gambar',
    description: 'Memeriksa kualitas gambar',
  },
  {
    id: 'uploading',
    label: 'Mengunggah',
    description: 'Mengunggah ke cloud storage',
  },
  {
    id: 'checking-watermelon',
    label: 'Deteksi Objek',
    description: 'Memastikan objek adalah semangka',
  },
  {
    id: 'analyzing-ripeness',
    label: 'Analisis Kematangan',
    description: 'Menganalisis indikator kematangan',
  },
];

/**
 * AnalysisProgress Component
 * 
 * Displays progressive feedback during watermelon analysis
 * Shows current stage with visual indicators
 */
export function AnalysisProgress({ currentStage, className }: AnalysisProgressProps) {
  // Don't show if idle
  if (currentStage === 'idle') {
    return null;
  }

  // Get current stage index
  const currentIndex = stages.findIndex(s => s.id === currentStage);
  const isComplete = currentStage === 'complete';
  const isError = currentStage === 'error';

  return (
    <div className={cn('w-full space-y-4', className)}>
      {/* Progress Steps */}
      <div className="space-y-3">
        {stages.map((stage, index) => {
          const isPast = index < currentIndex || isComplete;
          const isCurrent = index === currentIndex && !isComplete && !isError;
          const isFuture = index > currentIndex && !isComplete;

          return (
            <div
              key={stage.id}
              className={cn(
                'flex items-start gap-3 transition-all duration-300',
                isCurrent && 'scale-105',
                isFuture && 'opacity-40'
              )}
            >
              {/* Icon */}
              <div className="flex-shrink-0 mt-0.5">
                {isPast && (
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                )}
                {isCurrent && (
                  <Loader2 className="h-5 w-5 text-primary animate-spin" />
                )}
                {isFuture && (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
                {isError && index === currentIndex && (
                  <XCircle className="h-5 w-5 text-destructive" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    'text-sm font-medium transition-colors',
                    isPast && 'text-green-600 dark:text-green-400',
                    isCurrent && 'text-foreground',
                    isFuture && 'text-muted-foreground',
                    isError && index === currentIndex && 'text-destructive'
                  )}
                >
                  {stage.label}
                </p>
                <p
                  className={cn(
                    'text-xs transition-colors',
                    isPast && 'text-green-600/70 dark:text-green-400/70',
                    isCurrent && 'text-muted-foreground',
                    isFuture && 'text-muted-foreground/60',
                    isError && index === currentIndex && 'text-destructive/70'
                  )}
                >
                  {stage.description}
                </p>
              </div>

              {/* Status Badge */}
              {isPast && (
                <div className="flex-shrink-0">
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                    Selesai
                  </span>
                </div>
              )}
              {isCurrent && (
                <div className="flex-shrink-0">
                  <span className="text-xs text-primary font-medium">
                    Sedang proses...
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Complete State */}
      {isComplete && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-900 dark:text-green-100">
              Analisis Selesai!
            </p>
            <p className="text-xs text-green-700 dark:text-green-300">
              Hasil analisis siap ditampilkan
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-destructive">
              Analisis Gagal
            </p>
            <p className="text-xs text-destructive/70">
              Silakan coba lagi atau periksa koneksi internet
            </p>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {!isComplete && !isError && (
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{
              width: `${((currentIndex + 1) / stages.length) * 100}%`,
            }}
          />
        </div>
      )}
    </div>
  );
}
