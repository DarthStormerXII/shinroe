'use client'

import { useState, useCallback, type ReactNode } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ShieldCheck, Loader2, AlertTriangle } from 'lucide-react'
import { useRegistration } from '@/lib/hooks/use-registration'
import { toast } from 'sonner'

interface OnchainActionWrapperProps {
  children: ReactNode
  actionLabel?: string
  onAction: () => Promise<void>
  disabled?: boolean
}

export function OnchainActionWrapper({
  children,
  actionLabel = 'this action',
  onAction,
  disabled = false,
}: OnchainActionWrapperProps) {
  const { isOnchainRegistered, isCheckingRegistration, ensureRegistered } = useRegistration()
  const [showModal, setShowModal] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)

  const handleClick = useCallback(async () => {
    if (disabled) return

    // If already registered on-chain, proceed with action
    if (isOnchainRegistered) {
      await onAction()
      return
    }

    // Show registration prompt
    setShowModal(true)
  }, [disabled, isOnchainRegistered, onAction])

  const handleRegisterAndProceed = useCallback(async () => {
    setIsRegistering(true)
    const toastId = toast.loading('Registering on VeryChain...')

    try {
      // Close modal BEFORE transaction (WEPIN widget needs to be on top)
      setShowModal(false)

      await ensureRegistered()
      toast.success('Registration complete!', { id: toastId })

      // Proceed with the original action
      await onAction()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed', { id: toastId })
      setShowModal(true) // Reopen modal on error
    } finally {
      setIsRegistering(false)
    }
  }, [ensureRegistered, onAction])

  const handleCancel = useCallback(() => {
    setShowModal(false)
  }, [])

  if (isCheckingRegistration) {
    return (
      <div className="opacity-50 cursor-not-allowed">
        {children}
      </div>
    )
  }

  return (
    <>
      <div onClick={handleClick} className={disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}>
        {children}
      </div>

      <Dialog open={showModal && !isRegistering} onOpenChange={setShowModal}>
        <DialogContent className="bg-card border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-violet" />
              On-Chain Registration Required
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              To {actionLabel}, you need to be registered on VeryChain.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="p-4 rounded-lg bg-background border border-border">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-warning mt-0.5 shrink-0" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">This is a one-time action</p>
                  <p>
                    Registration creates your permanent identity on VeryChain. This requires a
                    small gas fee but only needs to be done once.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-success" />
                <span>Your DID is already created (gasless)</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-success" />
                <span>Your profile data is saved off-chain</span>
              </div>
              <div className="flex items-center gap-2 text-violet">
                <Loader2 className="h-4 w-4" />
                <span>On-chain registration pending</span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              onClick={handleRegisterAndProceed}
              className="bg-violet hover:bg-violet/90"
              disabled={isRegistering}
            >
              {isRegistering ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Registering...
                </>
              ) : (
                'Register & Continue'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
