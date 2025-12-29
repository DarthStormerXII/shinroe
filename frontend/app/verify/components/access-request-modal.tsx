'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Loader2, Send, CheckCircle } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'

interface AccessRequestModalProps {
  open: boolean
  onClose: () => void
  targetAddress: string
}

export function AccessRequestModal({ open, onClose, targetAddress }: AccessRequestModalProps) {
  const { t } = useTranslation()
  const [reason, setReason] = useState(() => t('demoPrefill.accessRequestReason'))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async () => {
    if (!reason.trim()) return
    setIsSubmitting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  const handleClose = () => {
    setReason('')
    setIsSubmitted(false)
    onClose()
  }

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border text-foreground sm:max-w-md">
        {isSubmitted ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-foreground">
                <CheckCircle className="h-5 w-5 text-success" />
                Request Sent
              </DialogTitle>
            </DialogHeader>
            <div className="py-6 text-center">
              <p className="text-muted-foreground">
                Your access request has been sent to {formatAddress(targetAddress)}. You&apos;ll be
                notified when they respond.
              </p>
            </div>
            <DialogFooter>
              <Button onClick={handleClose} className="w-full bg-violet hover:bg-violet/90">
                Done
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-foreground">Request Profile Access</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Explain why you&apos;d like to view {formatAddress(targetAddress)}&apos;s reputation
                score.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="reason" className="text-sm text-muted-foreground">
                Reason for request
              </Label>
              <Textarea
                id="reason"
                placeholder="e.g., I'm considering a business partnership and would like to verify your reputation..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-2 bg-background border-border text-foreground placeholder:text-muted-foreground min-h-[100px]"
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="ghost" onClick={handleClose} className="text-muted-foreground">
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!reason.trim() || isSubmitting}
                className="bg-violet hover:bg-violet/90"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Request
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
