'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import {
  type EndorsementType,
  type RegisteredUser,
  ENDORSEMENT_TYPES,
  MIN_ENDORSEMENT_STAKE,
} from '@/lib/types/shinroe'
import { useEndorsementContract } from '@/lib/hooks/use-endorsement-contract'
import { useRegistration } from '@/lib/hooks/use-registration'
import { parseEther, formatEther } from 'viem'
import { UserSelector } from './user-selector'
import { VeryChatContacts } from './verychat-contacts'
import { useAccount } from '@/lib/web3'
import { toast } from 'sonner'
import { useTranslation } from '@/lib/i18n'

const EXPLORER_URL = 'https://www.veryscan.io/tx/'

interface EndorseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const FEE_PERCENTAGE = 1

type Step = 'form' | 'registering' | 'closed-for-tx' | 'success' | 'error'

export function EndorseModal({ open, onOpenChange, onSuccess }: EndorseModalProps) {
  const { address: currentUserAddress } = useAccount()
  const { t } = useTranslation()
  const [selectedUser, setSelectedUser] = useState<RegisteredUser | null>(null)
  const [type, setType] = useState<EndorsementType>('general')
  const [stakeAmount, setStakeAmount] = useState('0.1')
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<Step>('form')

  const {
    createEndorsement,
    reset: resetContract,
  } = useEndorsementContract()

  const { isOnchainRegistered, ensureRegistered } = useRegistration()

  const resetState = () => {
    setSelectedUser(null)
    setType('general')
    setStakeAmount('')
    setError(null)
    setStep('form')
    resetContract()
  }

  useEffect(() => {
    if (!open) {
      resetState()
    }
  }, [open])

  const validateForm = (): boolean => {
    if (!selectedUser) {
      setError('Please select a user to endorse')
      return false
    }
    if (!stakeAmount) {
      setError('Stake amount is required')
      return false
    }
    try {
      const stake = parseEther(stakeAmount)
      if (stake < MIN_ENDORSEMENT_STAKE) {
        setError(`Minimum stake is ${formatEther(MIN_ENDORSEMENT_STAKE)} VERY`)
        return false
      }
    } catch {
      setError('Invalid stake amount')
      return false
    }
    setError(null)
    return true
  }

  const handleSubmit = async () => {
    if (!validateForm() || !selectedUser) return

    // Ensure on-chain registration first (DID-first flow)
    if (!isOnchainRegistered) {
      setStep('registering')
      const regToastId = toast.loading('Registering on VeryChain first...')
      try {
        await ensureRegistered()
        toast.success('Registered! Now creating endorsement...', { id: regToastId })
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Registration failed', { id: regToastId })
        setError('On-chain registration required to create endorsements')
        setStep('error')
        return
      }
    }

    // IMPORTANT: Close the dialog BEFORE executing the transaction
    // This is necessary because WEPIN opens its own confirmation widget,
    // and our dialog's overlay would block user interaction with it
    setStep('closed-for-tx')

    const toastId = toast.loading(t('endorseModal.creating'))

    try {
      const stake = parseEther(stakeAmount)
      const result = await createEndorsement(selectedUser.address, type, stake)

      if (!result.success) {
        throw new Error('Endorsement transaction failed')
      }

      toast.success(t('endorseModal.created'), {
        id: toastId,
        action: {
          label: t('common.viewTx'),
          onClick: () => window.open(`${EXPLORER_URL}${result.hash}`, '_blank'),
        },
      })
      setStep('success')

      setTimeout(() => {
        if (onSuccess) onSuccess()
        onOpenChange(false)
        resetState()
      }, 1500)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Endorsement failed'
      toast.error(errorMsg, { id: toastId })
      setError(errorMsg)
      setStep('error')
    }
  }

  const stakeValue = stakeAmount ? parseFloat(stakeAmount) : 0
  const fee = stakeValue * (FEE_PERCENTAGE / 100)
  const total = stakeValue + fee
  const isTransacting = step === 'closed-for-tx' || step === 'registering'

  // Hide dialog when transaction is in progress (WEPIN widget needs to be on top)
  const isDialogOpen = open && step !== 'closed-for-tx' && step !== 'registering'

  const handleRetry = () => {
    setStep('form')
    setError(null)
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={step === 'form' ? onOpenChange : undefined}>
      <DialogContent className="bg-card border-border max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground">Endorse Someone</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Vouch for a registered user by staking tokens on their reputation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <VeryChatContacts />

          <UserSelector
            selectedUser={selectedUser}
            onSelectUser={(user) => {
              setSelectedUser(user)
              if (error) setError(null)
            }}
            currentUserAddress={currentUserAddress}
            disabled={isTransacting}
          />

          <div className="space-y-3">
            <Label className="text-foreground">Endorsement Type</Label>
            <RadioGroup
              value={type}
              onValueChange={(v) => setType(v as EndorsementType)}
              disabled={isTransacting}
              className="grid grid-cols-3 gap-2"
            >
              {Object.entries(ENDORSEMENT_TYPES).map(([key, config]) => (
                <div key={key}>
                  <RadioGroupItem value={key} id={key} className="peer sr-only" />
                  <Label
                    htmlFor={key}
                    className="flex flex-col items-center justify-center rounded-md border-2 border-border bg-background p-3 hover:bg-secondary peer-data-[state=checked]:border-[var(--endorsement-color)] cursor-pointer transition-colors"
                    style={{ '--endorsement-color': config.color } as React.CSSProperties}
                  >
                    <span style={{ color: config.color }} className="font-medium text-sm">
                      {config.label}
                    </span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stake" className="text-foreground">
              Stake Amount (VERY)
            </Label>
            <Input
              id="stake"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.01"
              value={stakeAmount}
              onChange={(e) => {
                setStakeAmount(e.target.value)
                if (error) setError(null)
              }}
              disabled={isTransacting}
              className="bg-background border-border text-foreground"
            />
            <p className="text-xs text-muted-foreground">
              Minimum: {formatEther(MIN_ENDORSEMENT_STAKE)} VERY
            </p>
          </div>

          {stakeValue > 0 && (
            <div className="bg-background rounded-md p-3 space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Stake</span>
                <span>{stakeValue.toFixed(4)} VERY</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Protocol Fee ({FEE_PERCENTAGE}%)</span>
                <span>{fee.toFixed(4)} VERY</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between text-foreground font-medium">
                <span>Total</span>
                <span>{total.toFixed(4)} VERY</span>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          {step === 'success' && (
            <div className="flex items-center gap-2 text-success text-sm">
              <CheckCircle2 className="h-4 w-4" />
              <span>{t('endorseModal.createdSuccess')}</span>
            </div>
          )}

          <div className="flex gap-3">
            {step === 'error' && (
              <Button variant="outline" onClick={handleRetry} className="flex-1 border-border">
                Try Again
              </Button>
            )}
            <Button
              onClick={handleSubmit}
              disabled={step !== 'form' || !selectedUser}
              className="flex-1 bg-violet hover:bg-violet/90 text-violet-foreground"
            >
              Create Endorsement
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
