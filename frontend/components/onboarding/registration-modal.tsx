'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ShieldCheck, Loader2, CheckCircle, XCircle, User, MessageCircle, Camera, X } from 'lucide-react'
import { useRegistrationContract } from '@/lib/hooks/use-registration-contract'
import { useVeryChatAuth } from '@/lib/hooks/use-verychat-auth'
import { userMetadataService } from '@/lib/services/user-metadata-service'
import { useTranslation } from '@/lib/i18n'
import { toast } from 'sonner'
import Image from 'next/image'

interface RegistrationModalProps {
  open: boolean
  onComplete: () => void
  address: string
}

type Step = 'info' | 'uploading' | 'closed-for-tx' | 'success' | 'error'

async function uploadToIPFS(file: File): Promise<{ ipfsHash: string; gatewayUrl: string }> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('name', `profile-${Date.now()}.${file.name.split('.').pop()}`)

  const response = await fetch('/api/ipfs/file', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to upload to IPFS')
  }

  return response.json()
}

export function RegistrationModal({ open, onComplete, address }: RegistrationModalProps) {
  const { t } = useTranslation()
  const [displayName, setDisplayName] = useState(() => t('demoPrefill.displayName'))
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [step, setStep] = useState<Step>('info')
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { user: veryChatUser } = useVeryChatAuth()
  const { registerUser, reset: resetContract } = useRegistrationContract()

  // Pre-fill display name from VeryChat if available
  useEffect(() => {
    if (veryChatUser?.profileName && !displayName) {
      setDisplayName(veryChatUser.profileName)
    }
  }, [veryChatUser, displayName])

  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB')
      return
    }

    setProfileImage(file)
    setError(null)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }, [])

  const removeImage = useCallback(() => {
    setProfileImage(null)
    setImagePreview(null)
    setAvatarUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  // Handle registration flow
  const handleRegister = async () => {
    if (!displayName.trim()) {
      setError('Please enter a display name')
      return
    }

    setError(null)
    let uploadedAvatarUrl: string | null = null

    // Upload image to IPFS if provided
    if (profileImage) {
      setStep('uploading')
      try {
        const result = await uploadToIPFS(profileImage)
        uploadedAvatarUrl = result.gatewayUrl
        setAvatarUrl(uploadedAvatarUrl)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to upload image')
        setStep('error')
        return
      }
    }

    // IMPORTANT: Close the dialog BEFORE executing the transaction
    // This is necessary because WEPIN opens its own confirmation widget,
    // and our dialog's overlay would block user interaction with it
    setStep('closed-for-tx')

    const toastId = toast.loading('Registering your account...')
    const explorerUrl = 'https://www.veryscan.io/tx/'

    try {
      const registerResult = await registerUser()
      if (!registerResult.success) {
        throw new Error('Registration transaction failed')
      }

      // Store metadata including avatar URL
      await userMetadataService.setMetadata({
        address,
        displayName: displayName.trim(),
        avatarUrl: uploadedAvatarUrl || undefined,
      })

      toast.success('Registration complete! Welcome to Shinroe', {
        id: toastId,
        action: {
          label: 'View TX',
          onClick: () => window.open(`${explorerUrl}${registerResult.hash}`, '_blank'),
        },
      })
      setStep('success')

      setTimeout(() => {
        onComplete()
        resetState()
      }, 1500)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Registration failed', { id: toastId })
      setError(err instanceof Error ? err.message : 'Registration failed')
      setStep('error')
    }
  }

  const resetState = () => {
    setStep('info')
    setError(null)
    setProfileImage(null)
    setImagePreview(null)
    setAvatarUrl(null)
    resetContract()
  }

  const handleRetry = () => {
    resetState()
  }

  const renderStepContent = () => {
    switch (step) {
      case 'info':
        return (
          <div className="space-y-4">
            {/* Profile Picture Upload */}
            <div className="flex flex-col items-center gap-3">
              <Label className="text-muted-foreground self-start">Profile Picture (Optional)</Label>
              <div className="relative">
                {imagePreview ? (
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-violet">
                      <Image
                        src={imagePreview}
                        alt="Profile preview"
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-1 -right-1 p-1 bg-destructive rounded-full hover:bg-destructive/80 transition-colors"
                    >
                      <X className="h-3 w-3 text-destructive-foreground" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 rounded-full bg-background border-2 border-dashed border-border hover:border-violet transition-colors flex items-center justify-center"
                  >
                    <Camera className="h-8 w-8 text-muted-foreground" />
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>
              <p className="text-xs text-muted-foreground">Uploaded to IPFS for permanent storage</p>
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-muted-foreground">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
                className="bg-background border-border text-foreground"
              />
            </div>

            {veryChatUser && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-violet/10 border border-violet/20">
                <MessageCircle className="h-4 w-4 text-violet" />
                <span className="text-sm text-muted-foreground">
                  VeryChat linked: <span className="text-violet">{veryChatUser.profileId}</span>
                </span>
              </div>
            )}

            <div className="flex items-start gap-3 p-3 rounded-lg bg-background">
              <ShieldCheck className="h-5 w-5 text-violet mt-0.5" />
              <div>
                <p className="text-sm text-foreground font-medium">Verified Identity Badge</p>
                <p className="text-xs text-muted-foreground">
                  You&apos;ll receive a soulbound NFT badge confirming your verified identity
                </p>
              </div>
            </div>
          </div>
        )
      case 'uploading':
        return (
          <div className="flex flex-col items-center py-8 gap-4">
            <div className="p-6 rounded-full bg-violet/20">
              <Loader2 className="h-12 w-12 text-violet animate-spin" />
            </div>
            <p className="text-muted-foreground">Uploading profile picture to IPFS...</p>
          </div>
        )
      case 'success':
        return (
          <div className="flex flex-col items-center py-8 gap-4">
            <div className="p-6 rounded-full bg-success/20 animate-bounce-in">
              <CheckCircle className="h-12 w-12 text-success" />
            </div>
            <div className="text-center">
              <p className="text-foreground font-medium">Registration Complete!</p>
              <p className="text-sm text-muted-foreground">Welcome to Shinroe</p>
            </div>
          </div>
        )
      case 'error':
        return (
          <div className="flex flex-col items-center py-8 gap-4">
            <div className="p-6 rounded-full bg-destructive/20">
              <XCircle className="h-12 w-12 text-destructive" />
            </div>
            <div className="text-center">
              <p className="text-destructive font-medium">Registration Failed</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  // Hide dialog when transaction is in progress (WEPIN widget needs to be on top)
  const isDialogOpen = open && step !== 'closed-for-tx'

  return (
    <Dialog open={isDialogOpen} onOpenChange={() => {}}>
      <DialogContent className="bg-card border-border sm:max-w-md" hideClose>
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <User className="h-5 w-5 text-violet" />
            Complete Registration
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Set up your reputation profile on VeryChain
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {renderStepContent()}
        </div>

        <div className="flex gap-3">
          {step === 'info' && (
            <Button
              onClick={handleRegister}
              disabled={!displayName.trim()}
              className="w-full bg-violet hover:bg-violet/90"
            >
              Register & Get Badge
            </Button>
          )}
          {step === 'error' && (
            <Button onClick={handleRetry} className="w-full bg-violet hover:bg-violet/90">
              Try Again
            </Button>
          )}
          {step === 'uploading' && (
            <Button disabled className="w-full bg-violet/50">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
