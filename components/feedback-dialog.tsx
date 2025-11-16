'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { FeedbackRequest, FeedbackResponse } from '@/app/api/feedback/route';

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analysisId: string;
  predictedMaturity: 'Matang' | 'Belum Matang';
}

/**
 * FeedbackDialog Component
 * 
 * Dialog for submitting user feedback on AI analysis accuracy
 * 
 * Features:
 * - "Sesuai" / "Tidak Sesuai" buttons
 * - Optional notes input (max 200 characters)
 * - Optional actual maturity selection (if not accurate)
 * - Thank you message after submission
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */
export function FeedbackDialog({
  open,
  onOpenChange,
  analysisId,
  predictedMaturity,
}: FeedbackDialogProps) {
  const [isAccurate, setIsAccurate] = useState<boolean | null>(null);
  const [notes, setNotes] = useState('');
  const [actualMaturity, setActualMaturity] = useState<'Matang' | 'Belum Matang' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  // Reset state when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset after a delay to avoid visual glitch
      setTimeout(() => {
        setIsAccurate(null);
        setNotes('');
        setActualMaturity(null);
        setSubmitted(false);
      }, 200);
    }
    onOpenChange(newOpen);
  };

  // Handle feedback submission
  const handleSubmit = async () => {
    if (isAccurate === null) {
      toast({
        title: 'Pilih feedback',
        description: 'Silakan pilih apakah hasil analisis sesuai atau tidak.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const feedbackData: FeedbackRequest = {
        analysisId,
        isAccurate,
        notes: notes.trim() || undefined,
        actualMaturity: !isAccurate && actualMaturity ? actualMaturity : undefined,
      };

      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData),
      });

      const result: FeedbackResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Gagal mengirim feedback');
      }

      // Show success state
      setSubmitted(true);

      // Show success toast
      toast({
        title: 'Feedback terkirim!',
        description: result.data?.message || 'Terima kasih atas feedback Anda!',
      });

      // Close dialog after 2 seconds
      setTimeout(() => {
        handleOpenChange(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      toast({
        title: 'Gagal mengirim feedback',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan. Silakan coba lagi.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Character count for notes
  const notesLength = notes.length;
  const maxNotesLength = 200;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        {!submitted ? (
          <>
            <DialogHeader>
              <DialogTitle>Beri Feedback</DialogTitle>
              <DialogDescription>
                Apakah hasil analisis AI sesuai dengan kondisi sebenarnya?
                Feedback Anda membantu kami meningkatkan akurasi sistem.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Accuracy Selection */}
              <div className="space-y-3">
                <Label>Hasil Analisis</Label>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant={isAccurate === true ? 'default' : 'outline'}
                    className="flex-1 h-auto py-4"
                    onClick={() => {
                      setIsAccurate(true);
                      setActualMaturity(null);
                    }}
                  >
                    <ThumbsUp className="mr-2 h-5 w-5" />
                    <div className="text-left">
                      <div className="font-semibold">Sesuai</div>
                      <div className="text-xs opacity-80">Hasil analisis benar</div>
                    </div>
                  </Button>

                  <Button
                    type="button"
                    variant={isAccurate === false ? 'default' : 'outline'}
                    className="flex-1 h-auto py-4"
                    onClick={() => setIsAccurate(false)}
                  >
                    <ThumbsDown className="mr-2 h-5 w-5" />
                    <div className="text-left">
                      <div className="font-semibold">Tidak Sesuai</div>
                      <div className="text-xs opacity-80">Hasil analisis salah</div>
                    </div>
                  </Button>
                </div>
              </div>

              {/* Actual Maturity (shown if not accurate) */}
              {isAccurate === false && (
                <div className="space-y-3">
                  <Label>Kondisi Sebenarnya</Label>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant={actualMaturity === 'Matang' ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => setActualMaturity('Matang')}
                    >
                      Matang
                    </Button>
                    <Button
                      type="button"
                      variant={actualMaturity === 'Belum Matang' ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => setActualMaturity('Belum Matang')}
                    >
                      Belum Matang
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    AI memprediksi: <span className="font-medium">{predictedMaturity}</span>
                  </p>
                </div>
              )}

              {/* Optional Notes */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notes">Catatan Tambahan (Opsional)</Label>
                  <span className="text-xs text-muted-foreground">
                    {notesLength}/{maxNotesLength}
                  </span>
                </div>
                <Textarea
                  id="notes"
                  placeholder="Tambahkan catatan jika ada hal yang ingin Anda sampaikan..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value.slice(0, maxNotesLength))}
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isAccurate === null || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  'Kirim Feedback'
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Terima Kasih! 🎉</DialogTitle>
              <DialogDescription>
                Feedback Anda telah berhasil dikirim dan akan membantu kami meningkatkan akurasi AI.
              </DialogDescription>
            </DialogHeader>
            <div className="py-6 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <ThumbsUp className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                Dialog akan ditutup otomatis...
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
