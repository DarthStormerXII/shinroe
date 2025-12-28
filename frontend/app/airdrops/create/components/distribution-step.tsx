'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DateTimePicker } from '@/components/ui/datetime-picker'
import { Calendar } from 'lucide-react'

export interface DistributionStepData {
  amountPerClaim: string
  totalAmount: string
  startTime: Date
  endTime: Date
}

interface DistributionStepProps {
  data: DistributionStepData
  tokenSymbol: string
  maxSupply: string
  onUpdate: (data: Partial<DistributionStepData>) => void
  onNext: () => void
  onBack: () => void
}

const ALLOCATION_PERCENTAGES = [20, 50, 75, 100] as const

export function DistributionStep({ data, tokenSymbol, maxSupply, onUpdate, onNext, onBack }: DistributionStepProps) {
  const maxSupplyNum = parseFloat(maxSupply) || 0

  const maxClaimers =
    data.amountPerClaim && data.totalAmount && parseFloat(data.amountPerClaim) > 0
      ? Math.floor(parseFloat(data.totalAmount) / parseFloat(data.amountPerClaim))
      : 0

  const durationDays = Math.ceil((data.endTime.getTime() - data.startTime.getTime()) / (1000 * 60 * 60 * 24))

  const totalAmountNum = parseFloat(data.totalAmount) || 0
  const exceedsMaxSupply = maxSupplyNum > 0 && totalAmountNum > maxSupplyNum

  const handlePercentageClick = (percentage: number) => {
    if (maxSupplyNum > 0) {
      const amount = (maxSupplyNum * percentage) / 100
      onUpdate({ totalAmount: amount.toString() })
    }
  }

  const handleTotalAmountChange = (value: string) => {
    const numValue = parseFloat(value) || 0
    // Cap at max supply if exceeded
    if (maxSupplyNum > 0 && numValue > maxSupplyNum) {
      onUpdate({ totalAmount: maxSupplyNum.toString() })
    } else {
      onUpdate({ totalAmount: value })
    }
  }

  const canProceed =
    parseFloat(data.amountPerClaim) > 0 &&
    parseFloat(data.totalAmount) > 0 &&
    !exceedsMaxSupply &&
    data.startTime < data.endTime &&
    data.startTime > new Date()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Distribution Settings</h2>
        <p className="text-muted-foreground text-sm">
          Configure how tokens will be distributed to claimants.
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amountPerClaim">Amount per claim</Label>
            <div className="relative">
              <Input
                id="amountPerClaim"
                type="number"
                placeholder="100"
                value={data.amountPerClaim}
                onChange={(e) => onUpdate({ amountPerClaim: e.target.value })}
                className="pr-16"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                {tokenSymbol || 'TOKEN'}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="totalAmount">Total allocation</Label>
            <div className="relative">
              <Input
                id="totalAmount"
                type="number"
                placeholder="10000"
                value={data.totalAmount}
                onChange={(e) => handleTotalAmountChange(e.target.value)}
                className="pr-16"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                {tokenSymbol || 'TOKEN'}
              </span>
            </div>
            {maxSupplyNum > 0 && (
              <div className="flex gap-2">
                {ALLOCATION_PERCENTAGES.map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handlePercentageClick(pct)}
                    className="text-xs text-violet hover:text-violet/80 hover:underline transition-colors"
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {maxClaimers > 0 && (
          <p className="text-sm text-muted-foreground">
            Maximum claimers: <span className="text-foreground font-medium">{maxClaimers} users</span>
          </p>
        )}

        <div className="space-y-4 pt-4">
          <Label className="flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Duration
          </Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                Start Date & Time
              </Label>
              <DateTimePicker
                date={data.startTime}
                onDateChange={(date) => onUpdate({ startTime: date })}
                minDate={new Date()}
                placeholder="Select start date & time"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                End Date & Time
              </Label>
              <DateTimePicker
                date={data.endTime}
                onDateChange={(date) => onUpdate({ endTime: date })}
                minDate={data.startTime}
                placeholder="Select end date & time"
              />
            </div>
          </div>
          {durationDays > 0 && (
            <p className="text-sm text-muted-foreground">
              Duration: <span className="text-foreground font-medium">{durationDays} days</span>
            </p>
          )}
        </div>
      </div>

      <Card className="bg-muted/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Distribution Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-violet">
                {data.amountPerClaim || '0'}
              </p>
              <p className="text-xs text-muted-foreground">{tokenSymbol || 'TOKEN'} per claim</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-violet">{maxClaimers || '0'}</p>
              <p className="text-xs text-muted-foreground">max claimers</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-violet">{durationDays || '0'}</p>
              <p className="text-xs text-muted-foreground">days</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} disabled={!canProceed} className="bg-violet hover:bg-violet/90">
          Next Step
        </Button>
      </div>
    </div>
  )
}
