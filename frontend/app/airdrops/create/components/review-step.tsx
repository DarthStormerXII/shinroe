'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Upload, Check, Image as ImageIcon } from 'lucide-react'
import { BADGE_METADATA, BadgeType } from '@/lib/types/shinroe'
import type { TokenStepData } from './token-step'
import type { DistributionStepData } from './distribution-step'
import type { EligibilityStepData } from './eligibility-step'

export interface MetadataStepData {
  name: string
  description: string
  imageFile: File | null
}

interface ReviewStepProps {
  tokenData: TokenStepData
  distributionData: DistributionStepData
  eligibilityData: EligibilityStepData
  metadataData: MetadataStepData
  onUpdateMetadata: (data: Partial<MetadataStepData>) => void
  onBack: () => void
  onSubmit: () => void
  isSubmitting: boolean
  currentStep: 'idle' | 'uploading' | 'approving' | 'creating'
}

export function ReviewStep({
  tokenData,
  distributionData,
  eligibilityData,
  metadataData,
  onUpdateMetadata,
  onBack,
  onSubmit,
  isSubmitting,
  currentStep,
}: ReviewStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onUpdateMetadata({ imageFile: file })
      const reader = new FileReader()
      reader.onload = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const maxClaimers =
    parseFloat(distributionData.amountPerClaim) > 0
      ? Math.floor(parseFloat(distributionData.totalAmount) / parseFloat(distributionData.amountPerClaim))
      : 0

  const durationDays = Math.ceil(
    (distributionData.endTime.getTime() - distributionData.startTime.getTime()) / (1000 * 60 * 60 * 24)
  )

  const getTokenInfo = () => {
    if (tokenData.mode === 'create' && tokenData.newTokenParams) {
      return `${tokenData.tokenSymbol} (new, ${tokenData.newTokenParams.totalSupply} supply)`
    }
    return `${tokenData.tokenSymbol} (existing)`
  }

  const getBadgeNames = () => {
    if (eligibilityData.requiredBadges.length === 0) return 'None required'
    return eligibilityData.requiredBadges
      .map((b) => BADGE_METADATA[b as BadgeType]?.name || 'Unknown')
      .join(', ')
  }

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  const getStepLabel = () => {
    switch (currentStep) {
      case 'uploading': return 'Uploading metadata...'
      case 'approving': return 'Approving token...'
      case 'creating': return 'Creating airdrop...'
      default: return 'Create Airdrop'
    }
  }

  const canSubmit = metadataData.name.trim().length > 0 && metadataData.description.trim().length > 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Details & Review</h2>
        <p className="text-muted-foreground text-sm">Add airdrop details and review your configuration.</p>
      </div>

      {/* Metadata Input */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="airdropName">Airdrop Name</Label>
          <Input
            id="airdropName"
            placeholder="Early Supporter Rewards"
            value={metadataData.name}
            onChange={(e) => onUpdateMetadata({ name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Rewarding our first verified community members..."
            rows={3}
            value={metadataData.description}
            onChange={(e) => onUpdateMetadata({ description: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Image (Optional)</Label>
          <div className="flex items-center gap-4">
            <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageChange} className="hidden" />
            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" /> Upload Image
            </Button>
            {imagePreview && (
              <div className="relative w-12 h-12 rounded-lg overflow-hidden border">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <Check className="absolute bottom-1 right-1 h-4 w-4 text-green-500" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">📋 Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Token:</span>
            <span>{getTokenInfo()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Distribution:</span>
            <span>
              {distributionData.amountPerClaim} {tokenData.tokenSymbol} × {maxClaimers} claims ={' '}
              {distributionData.totalAmount} {tokenData.tokenSymbol}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Duration:</span>
            <span>
              {formatDate(distributionData.startTime)} - {formatDate(distributionData.endTime)} ({durationDays} days)
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Min Score:</span>
            <span>{eligibilityData.minScore}+</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Badges:</span>
            <span>{getBadgeNames()}</span>
          </div>
          {eligibilityData.requiresRegistration && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Registration:</span>
              <span>Required</span>
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center">(2 transactions required: approve token + create airdrop)</p>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
          Back
        </Button>
        <Button onClick={onSubmit} disabled={!canSubmit || isSubmitting} className="bg-violet hover:bg-violet/90">
          {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {getStepLabel()}</> : 'Create Airdrop'}
        </Button>
      </div>
    </div>
  )
}
