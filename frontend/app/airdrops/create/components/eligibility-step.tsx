'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BadgeType, BADGE_METADATA } from '@/lib/types/shinroe'
import { EligibleUsersPreview } from './eligible-users-preview'

export interface EligibilityStepData {
  requiresRegistration: boolean
  minScore: number
  requiredBadges: number[]
  badgeRequirement: 'any' | 'all'
  minEndorsementWeight: string
}

interface EligibilityStepProps {
  data: EligibilityStepData
  onUpdate: (data: Partial<EligibilityStepData>) => void
  onNext: () => void
  onBack: () => void
}

const AVAILABLE_BADGES = [
  BadgeType.VERIFIED_IDENTITY,
  BadgeType.TRUSTED_TRADER,
  BadgeType.COMMUNITY_BUILDER,
  BadgeType.EARLY_ADOPTER,
  BadgeType.ELITE_SCORE,
]

export function EligibilityStep({ data, onUpdate, onNext, onBack }: EligibilityStepProps) {
  const handleBadgeToggle = (badgeType: BadgeType) => {
    const currentBadges = data.requiredBadges
    const newBadges = currentBadges.includes(badgeType)
      ? currentBadges.filter((b) => b !== badgeType)
      : [...currentBadges, badgeType]
    onUpdate({ requiredBadges: newBadges })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Eligibility Criteria</h2>
        <p className="text-muted-foreground text-sm">
          Define who can claim your airdrop based on reputation criteria.
        </p>
      </div>

      <div className="space-y-6">
        {/* Registration Requirement */}
        <div className="flex items-center gap-3">
          <Checkbox
            id="requiresRegistration"
            checked={data.requiresRegistration}
            onCheckedChange={(checked) => onUpdate({ requiresRegistration: checked === true })}
          />
          <Label htmlFor="requiresRegistration" className="cursor-pointer">
            Require on-chain registration
          </Label>
        </div>

        {/* Minimum Score */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Minimum Reputation Score</Label>
            <span className="text-lg font-semibold text-violet">{data.minScore}</span>
          </div>
          <Slider
            value={[data.minScore]}
            onValueChange={([value]) => onUpdate({ minScore: value })}
            max={1000}
            step={50}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0 (No minimum)</span>
            <span>500 (Building)</span>
            <span>1000 (Elite)</span>
          </div>
        </div>

        {/* Required Badges */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Required Badges</Label>
            {data.requiredBadges.length > 1 && (
              <div className="flex items-center gap-2">
                <span className={`text-xs ${data.badgeRequirement === 'any' ? 'text-foreground' : 'text-muted-foreground'}`}>
                  Any
                </span>
                <Switch
                  checked={data.badgeRequirement === 'all'}
                  onCheckedChange={(checked) => onUpdate({ badgeRequirement: checked ? 'all' : 'any' })}
                />
                <span className={`text-xs ${data.badgeRequirement === 'all' ? 'text-foreground' : 'text-muted-foreground'}`}>
                  All
                </span>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {data.badgeRequirement === 'all'
              ? 'User must hold ALL selected badges'
              : 'User must hold at least ONE of the selected badges'}
          </p>
          <div className="grid grid-cols-2 gap-3">
            {AVAILABLE_BADGES.map((badgeType) => {
              const badge = BADGE_METADATA[badgeType]
              const isSelected = data.requiredBadges.includes(badgeType)
              return (
                <div
                  key={badgeType}
                  onClick={() => handleBadgeToggle(badgeType)}
                  className={`
                    p-3 rounded-lg border cursor-pointer transition-all
                    ${isSelected ? 'border-violet bg-violet/10' : 'border-border hover:border-violet/50'}
                  `}
                >
                  <div className="flex items-center gap-2">
                    <Checkbox checked={isSelected} className="pointer-events-none" />
                    <div>
                      <p className="text-sm font-medium">{badge.name}</p>
                      <p className="text-xs text-muted-foreground">{badge.requirement}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Minimum Endorsement Weight */}
        <div className="space-y-2">
          <Label htmlFor="minEndorsementWeight">Minimum Endorsement Weight</Label>
          <div className="relative">
            <Input
              id="minEndorsementWeight"
              type="number"
              step="0.01"
              placeholder="0.0"
              value={data.minEndorsementWeight}
              onChange={(e) => onUpdate({ minEndorsementWeight: e.target.value })}
              className="pr-12"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              VERY
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Total value of endorsements received by the user (in VERY)
          </p>
        </div>
      </div>

      {/* Eligible Users Preview */}
      <Card className="bg-muted/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Eligibility Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <EligibleUsersPreview criteria={data} />
        </CardContent>
      </Card>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} className="bg-violet hover:bg-violet/90">
          Next Step
        </Button>
      </div>
    </div>
  )
}
