'use client'

import { useState, useRef, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Loader2, CheckCircle, Camera, X, Fingerprint } from 'lucide-react'
import { useRegistration } from '@/lib/hooks/use-registration'
import { useTranslation } from '@/lib/i18n'
import { toast } from 'sonner'
import Image from 'next/image'

interface ProfileSetupModalProps {
  open: boolean
  onComplete: () => void
  address: string
}

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

export function ProfileSetupModal({ open, onComplete, address }: ProfileSetupModalProps) {
  const { t } = useTranslation()
  const [displayName, setDisplayName] = useState(() => t('demoPrefill.displayName'))
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { did, updateProfile } = useRegistration()

  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB')
      return
    }

    setProfileImage(file)
    setError(null)

    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }, [])

  const removeImage = useCallback(() => {
    setProfileImage(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [])

  const handleSaveProfile = async () => {
    if (!displayName.trim()) {
      setError('Please enter a display name')
      return
    }

    setError(null)
    let avatarUrl: string | undefined

    // Upload image if provided
    if (profileImage) {
      setIsUploading(true)
      try {
        const result = await uploadToIPFS(profileImage)
        avatarUrl = result.gatewayUrl
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to upload image')
        setIsUploading(false)
        return
      }
      setIsUploading(false)
    }

    // Save profile (no gas required!)
    const toastId = toast.loading('Saving your profile...')
    try {
      const success = await updateProfile({
        displayName: displayName.trim(),
        avatarUrl,
      })

      if (success) {
        toast.success('Profile saved!', { id: toastId })
        onComplete()
      } else {
        throw new Error('Failed to save profile')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save profile', { id: toastId })
      setError(err instanceof Error ? err.message : 'Failed to save profile')
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="bg-card border-border sm:max-w-xl" hideClose>
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <User className="h-5 w-5 text-violet" />
            Set Up Your Profile
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            No gas required - your profile is ready instantly
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* DID Display */}
          {did && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 border border-success/20">
              <Fingerprint className="h-4 w-4 text-success shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Your DID (created instantly)</p>
                <p className="text-xs text-success font-mono truncate">{did}</p>
              </div>
              <CheckCircle className="h-4 w-4 text-success shrink-0" />
            </div>
          )}

          {/* Profile Picture */}
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
                    className="absolute -top-1 -right-1 p-1 bg-destructive rounded-full hover:bg-destructive/80"
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

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <Button
          onClick={handleSaveProfile}
          disabled={!displayName.trim() || isUploading}
          className="w-full bg-violet hover:bg-violet/90"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            'Save Profile'
          )}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
