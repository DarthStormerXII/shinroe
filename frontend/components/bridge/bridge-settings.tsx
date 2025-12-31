'use client'

import { useState } from 'react'
import { Settings, Info, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface BridgeSettingsProps {
  slippage: number
  onSlippageChange: (slippage: number) => void
  customRecipient: boolean
  onCustomRecipientChange: (enabled: boolean) => void
  destinationAddress: string
  onDestinationAddressChange: (address: string) => void
}

export function BridgeSettings({
  slippage,
  onSlippageChange,
  customRecipient,
  onCustomRecipientChange,
  destinationAddress,
  onDestinationAddressChange,
}: BridgeSettingsProps) {
  const [slippageInput, setSlippageInput] = useState(slippage.toString())

  // Predefined slippage values
  const presetSlippages = [0.1, 0.5, 1.0, 2.0]

  const handleSlippageChange = (value: string) => {
    setSlippageInput(value)
    const numValue = parseFloat(value)
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 50) {
      onSlippageChange(numValue)
    }
  }

  const handlePresetSlippage = (value: number) => {
    setSlippageInput(value.toString())
    onSlippageChange(value)
  }

  const isSlippageHigh = slippage > 5
  const isSlippageLow = slippage < 0.1
  const isAddressValid = (address: string) => {
    if (!address) return true
    // Basic validation - in real app, use proper address validation
    return address.startsWith('0x') && address.length > 10
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Settings className="h-4 w-4" />
          Bridge Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Slippage Tolerance */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Label>Slippage Tolerance</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Maximum price movement you're willing to accept.
                    Higher slippage = faster execution but potentially worse rates.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Preset Buttons */}
          <div className="flex gap-2">
            {presetSlippages.map((preset) => (
              <Button
                key={preset}
                variant={slippage === preset ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePresetSlippage(preset)}
                className="flex-1"
              >
                {preset}%
              </Button>
            ))}
          </div>

          {/* Custom Input */}
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={slippageInput}
              onChange={(e) => handleSlippageChange(e.target.value)}
              placeholder="0.5"
              step="0.1"
              min="0"
              max="50"
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground">%</span>
          </div>

          {/* Slippage Warnings */}
          {isSlippageHigh && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                High slippage tolerance may result in poor rates. Consider lowering it.
              </AlertDescription>
            </Alert>
          )}

          {isSlippageLow && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Very low slippage may cause transactions to fail. Consider increasing it.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Custom Recipient */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label>Custom Recipient</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Send tokens to a different address on the destination chain.
                      Default is your connected wallet address.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Switch
              checked={customRecipient}
              onCheckedChange={onCustomRecipientChange}
            />
          </div>

          {customRecipient && (
            <div className="space-y-2">
              <Input
                value={destinationAddress}
                onChange={(e) => onDestinationAddressChange(e.target.value)}
                placeholder="Enter destination address..."
                className={!isAddressValid(destinationAddress) ? 'border-destructive' : ''}
              />
              {destinationAddress && !isAddressValid(destinationAddress) && (
                <p className="text-sm text-muted-foreground">
                  Invalid address format
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Double-check this address. Sending to wrong address may result in permanent loss of funds.
              </p>
            </div>
          )}
        </div>

        {/* Advanced Settings Info */}
        <div className="pt-3 border-t">
          <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
            <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium mb-1">Advanced Settings</p>
              <ul className="space-y-1">
                <li>• Lower slippage = better rates but higher failure risk</li>
                <li>• Custom recipient allows sending to any address</li>
                <li>• Always verify destination addresses carefully</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Compact settings for inline use
export function CompactBridgeSettings({
  slippage,
  onSlippageChange,
}: {
  slippage: number
  onSlippageChange: (slippage: number) => void
}) {
  const [slippageInput, setSlippageInput] = useState(slippage.toString())
  const presetSlippages = [0.1, 0.5, 1.0, 2.0]

  const handleSlippageChange = (value: string) => {
    setSlippageInput(value)
    const numValue = parseFloat(value)
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 50) {
      onSlippageChange(numValue)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm">Slippage</Label>
        <div className="flex items-center gap-1">
          <Input
            type="number"
            value={slippageInput}
            onChange={(e) => handleSlippageChange(e.target.value)}
            className="w-16 h-8 text-xs text-center"
            step="0.1"
            min="0"
            max="50"
          />
          <span className="text-xs text-muted-foreground">%</span>
        </div>
      </div>

      <div className="flex gap-1">
        {presetSlippages.map((preset) => (
          <Button
            key={preset}
            variant={slippage === preset ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setSlippageInput(preset.toString())
              onSlippageChange(preset)
            }}
            className="text-xs h-7 px-2 flex-1"
          >
            {preset}%
          </Button>
        ))}
      </div>
    </div>
  )
}