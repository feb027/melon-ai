'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Camera, Info, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { FeedbackDialog } from '@/components/feedback-dialog';
import type { AnalysisResultProps } from '@/lib/types';

/**
 * AnalysisResult Component
 * 
 * Displays AI analysis results for watermelon maturity assessment
 * with visual indicators, confidence metrics, and detailed explanations.
 * 
 * Features:
 * - Color-coded maturity status badge (green=matang, orange=belum matang)
 * - Confidence percentage with progress bar
 * - Sweetness level visual indicator (1-10 scale)
 * - Watermelon type and skin quality display
 * - "Foto Lagi" button for quick re-analysis
 * - Detailed explanation modal/dialog
 * 
 * @param result - Analysis result data from AI
 * @param onRetry - Callback for "Foto Lagi" button
 * @param onFeedback - Callback for feedback submission
 */
export function AnalysisResult({ result, onRetry, onFeedback }: AnalysisResultProps) {
  // State for feedback dialog
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  
  // Determine badge variant based on maturity status
  const maturityVariant = result.maturityStatus === 'Matang' ? 'default' : 'secondary';
  
  // Format confidence as percentage
  const confidencePercentage = Math.round(result.confidence);
  
  // Get skin quality color
  const getSkinQualityColor = (quality: string) => {
    switch (quality) {
      case 'baik':
        return 'text-green-600 dark:text-green-400';
      case 'sedang':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'kurang baik':
        return 'text-orange-600 dark:text-orange-400';
      default:
        return 'text-muted-foreground';
    }
  };
  
  // Format watermelon type for display
  const formatWatermelonType = (type: string) => {
    const typeMap: Record<string, string> = {
      merah: 'Merah',
      kuning: 'Kuning',
      mini: 'Mini',
      inul: 'Inul',
    };
    return typeMap[type] || type;
  };
  
  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(date));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Hasil Analisis</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Image Thumbnail */}
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted">
          <Image
            src={result.imageUrl}
            alt="Foto semangka yang dianalisis"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
          />
        </div>
        
        {/* Maturity Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status Kematangan</span>
            <Badge variant={maturityVariant} className="text-base px-4 py-1">
              {result.maturityStatus}
            </Badge>
          </div>
          
          {/* Confidence Progress Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Tingkat Keyakinan</span>
              <span className="font-medium">{confidencePercentage}%</span>
            </div>
            <Progress value={result.confidence} className="h-2" />
          </div>
        </div>
        
        {/* Sweetness Level */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Tingkat Kemanisan</span>
            <span className="text-2xl font-bold text-primary">
              {result.sweetnessLevel}/10
            </span>
          </div>
          
          {/* Visual sweetness indicator */}
          <div className="flex gap-1">
            {Array.from({ length: 10 }, (_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  i < result.sweetnessLevel
                    ? 'bg-primary'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>
        
        {/* Watermelon Type and Skin Quality */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">Jenis Semangka</span>
            <p className="text-base font-medium capitalize">
              {formatWatermelonType(result.watermelonType)}
            </p>
          </div>
          
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">Kualitas Kulit</span>
            <p className={`text-base font-medium capitalize ${getSkinQualityColor(result.skinQuality)}`}>
              {result.skinQuality}
            </p>
          </div>
        </div>
        
        {/* Additional Info */}
        <div className="pt-4 border-t space-y-2 text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>AI Provider</span>
            <span className="font-medium text-foreground capitalize">{result.aiProvider}</span>
          </div>
          <div className="flex justify-between">
            <span>Waktu Analisis</span>
            <span className="font-medium text-foreground">{formatDate(result.createdAt)}</span>
          </div>
          <div className="flex justify-between">
            <span>Waktu Respons</span>
            <span className="font-medium text-foreground">{(result.aiResponseTime / 1000).toFixed(2)}s</span>
          </div>
        </div>
        
        {/* Detailed Explanation Dialog */}
        {result.reasoning && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full" size="lg">
                <Info className="mr-2 h-4 w-4" />
                Lihat Penjelasan Detail
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Penjelasan Detail Analisis</DialogTitle>
                <DialogDescription>
                  Berikut adalah penjelasan lengkap dari AI mengenai hasil analisis semangka Anda.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                {/* Summary */}
                <div className="space-y-2">
                  <h4 className="font-semibold">Ringkasan</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Status:</span>{' '}
                      <span className="font-medium">{result.maturityStatus}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Keyakinan:</span>{' '}
                      <span className="font-medium">{confidencePercentage}%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Kemanisan:</span>{' '}
                      <span className="font-medium">{result.sweetnessLevel}/10</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Jenis:</span>{' '}
                      <span className="font-medium capitalize">{formatWatermelonType(result.watermelonType)}</span>
                    </div>
                  </div>
                </div>
                
                {/* Reasoning */}
                <div className="space-y-2">
                  <h4 className="font-semibold">Analisis AI</h4>
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed prose prose-sm max-w-none dark:prose-invert">
                    {result.reasoning}
                  </div>
                </div>
                
                {/* Metadata if available */}
                {result.metadata && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">Informasi Tambahan</h4>
                    <div className="text-sm space-y-1">
                      {result.metadata.location && (
                        <div>
                          <span className="text-muted-foreground">Lokasi:</span>{' '}
                          <span className="font-medium">{result.metadata.location}</span>
                        </div>
                      )}
                      {result.metadata.batchId && (
                        <div>
                          <span className="text-muted-foreground">Batch ID:</span>{' '}
                          <span className="font-medium">{result.metadata.batchId}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
      
      <CardFooter className="flex gap-3">
        {/* Foto Lagi Button */}
        {onRetry && (
          <Button onClick={onRetry} size="lg" className="flex-1 min-h-11">
            <Camera className="mr-2 h-5 w-5" />
            Foto Lagi
          </Button>
        )}
        
        {/* Feedback Button */}
        {onFeedback && (
          <Button
            variant="outline"
            size="lg"
            className="flex-1 min-h-11"
            onClick={() => setFeedbackDialogOpen(true)}
          >
            <MessageSquare className="mr-2 h-5 w-5" />
            Beri Feedback
          </Button>
        )}
      </CardFooter>
      
      {/* Feedback Dialog */}
      <FeedbackDialog
        open={feedbackDialogOpen}
        onOpenChange={setFeedbackDialogOpen}
        analysisId={result.id}
        predictedMaturity={result.maturityStatus}
      />
    </Card>
  );
}
