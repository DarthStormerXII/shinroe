'use client'

import { useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Fingerprint, ChevronDown, ChevronUp, Info, ShieldCheck, Loader2 } from 'lucide-react'
import { useRegistration } from '@/lib/hooks/use-registration'
import { toast } from 'sonner'

interface OnchainStatusBannerProps {
  did: string
  onRegistrationComplete?: () => void
}

export function OnchainStatusBanner({ did, onRegistrationComplete }: OnchainStatusBannerProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const { ensureRegistered } = useRegistration()

  const handleRegister = async () => {
    setIsRegistering(true)
    const toastId = toast.loading('Registering on VeryChain...')

    try {
      await ensureRegistered()
      toast.success('Successfully registered on VeryChain!', { id: toastId })
      // Notify parent that registration is complete
      onRegistrationComplete?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed', { id: toastId })
    } finally {
      setIsRegistering(false)
    }
  }

  return (
    <Alert className="bg-violet/5 border-violet/20">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Fingerprint className="h-5 w-5 text-violet mt-0.5" />
          <div className="space-y-1">
            <AlertDescription className="text-foreground font-medium">
              Your DID is active - on-chain registration is optional
            </AlertDescription>
            <p className="text-sm text-muted-foreground">
              You can use most features now. On-chain registration is only needed for endorsements and badges.
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="shrink-0"
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-violet/20 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="p-3 rounded-lg bg-background border border-border">
              <div className="flex items-center gap-2 text-success mb-2">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-sm font-medium">Available Now</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>Profile setup & editing</li>
                <li>View reputation scores</li>
                <li>Search for users</li>
                <li>VeryChat messaging</li>
              </ul>
            </div>

            <div className="p-3 rounded-lg bg-background border border-border">
              <div className="flex items-center gap-2 text-violet mb-2">
                <Info className="h-4 w-4" />
                <span className="text-sm font-medium">Requires On-Chain</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>Give endorsements</li>
                <li>Receive endorsements</li>
                <li>Claim badges</li>
                <li>Public on-chain profile</li>
              </ul>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-background border border-border">
            <div>
              <p className="text-sm font-medium text-foreground">Ready to go on-chain?</p>
              <p className="text-xs text-muted-foreground">One-time registration, small gas fee</p>
            </div>
            <Button
              onClick={handleRegister}
              disabled={isRegistering}
              size="sm"
              className="bg-violet hover:bg-violet/90"
            >
              {isRegistering ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Registering...
                </>
              ) : (
                'Register Now'
              )}
            </Button>
          </div>
        </div>
      )}
    </Alert>
  )
}
