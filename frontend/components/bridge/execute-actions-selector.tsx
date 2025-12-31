'use client'

import { useState } from 'react'
import { Check, ChevronDown, ArrowRightLeft, Coins, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import type { Chain, ExecuteAction, SwapAction, StakeAction, CustomAction } from '@/lib/types/bridge'

// Available actions based on chain (EVM only)
const getAvailableActions = (chain: Chain) => {
  return [
    {
      type: 'swap' as const,
      name: 'Swap Tokens',
      description: 'Exchange for another token',
      icon: ArrowRightLeft,
      protocols: ['Uniswap', '1inch', 'SushiSwap'],
    },
    {
      type: 'stake' as const,
      name: 'Stake Tokens',
      description: 'Stake tokens to earn rewards',
      icon: Coins,
      protocols: ['Lido', 'Rocket Pool'],
    },
    {
      type: 'custom' as const,
      name: 'Custom Action',
      description: 'Execute custom contract function',
      icon: TrendingUp,
      protocols: ['Custom Contract'],
    },
  ]
}

// Mock tokens for swapping (EVM only)
const getSwapTokens = (chain: Chain) => {
  return [
    { symbol: 'ETH', name: 'Ethereum' },
    { symbol: 'USDC', name: 'USD Coin' },
    { symbol: 'USDT', name: 'Tether USD' },
    { symbol: 'WETH', name: 'Wrapped Ethereum' },
  ]
}

interface ExecuteActionsSelectorProps {
  chain: Chain
  onActionSelect: (action: ExecuteAction | undefined) => void
  selectedAction?: ExecuteAction
}

export function ExecuteActionsSelector({
  chain,
  onActionSelect,
  selectedAction,
}: ExecuteActionsSelectorProps) {
  const [selectedType, setSelectedType] = useState<string | undefined>(selectedAction?.type)
  const availableActions = getAvailableActions(chain)

  const handleActionTypeSelect = (type: string) => {
    setSelectedType(type)

    // Create default action based on type
    let defaultAction: ExecuteAction

    switch (type) {
      case 'swap':
        defaultAction = {
          type: 'swap',
          protocol: availableActions.find(a => a.type === 'swap')?.protocols[0] || '',
          parameters: {
            outputToken: 'USDC',
            minOutputAmount: '0',
            slippage: 1,
            dex: availableActions.find(a => a.type === 'swap')?.protocols[0] || '',
          },
          enabled: true,
        }
        break
      case 'stake':
        defaultAction = {
          type: 'stake',
          protocol: availableActions.find(a => a.type === 'stake')?.protocols[0] || '',
          parameters: {
            autoCompound: true,
          },
          enabled: true,
        }
        break
      case 'custom':
        defaultAction = {
          type: 'custom',
          protocol: 'Custom Contract',
          parameters: {
            contractAddress: '',
            functionName: '',
            functionArgs: [],
            typeArgs: [],
          },
          enabled: true,
        }
        break
      default:
        return
    }

    onActionSelect(defaultAction)
  }

  const handleActionUpdate = (updates: Partial<ExecuteAction>) => {
    if (!selectedAction) return

    const updatedAction = {
      ...selectedAction,
      ...updates,
      parameters: {
        ...selectedAction.parameters,
        ...updates.parameters,
      },
    } as ExecuteAction

    onActionSelect(updatedAction)
  }

  const renderActionConfig = () => {
    if (!selectedAction) return null

    switch (selectedAction.type) {
      case 'swap':
        return <SwapActionConfig action={selectedAction as SwapAction} onUpdate={handleActionUpdate} chain={chain} />
      case 'stake':
        return <StakeActionConfig action={selectedAction as StakeAction} onUpdate={handleActionUpdate} chain={chain} />
      case 'custom':
        return <CustomActionConfig action={selectedAction as CustomAction} onUpdate={handleActionUpdate} chain={chain} />
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      {/* Action Type Selector */}
      <div className="space-y-2">
        <Label>Action Type</Label>
        <Select value={selectedType} onValueChange={handleActionTypeSelect}>
          <SelectTrigger>
            <SelectValue placeholder="Select action type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">
              <div className="text-muted-foreground">No action</div>
            </SelectItem>
            {availableActions.map((action) => {
              const Icon = action.icon
              return (
                <SelectItem key={action.type} value={action.type}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <div>
                      <div>{action.name}</div>
                      <div className="text-xs text-muted-foreground">{action.description}</div>
                    </div>
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Action Configuration */}
      {renderActionConfig()}

      {/* Clear Action */}
      {selectedAction && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSelectedType(undefined)
            onActionSelect(undefined)
          }}
          className="w-full"
        >
          Clear Action
        </Button>
      )}
    </div>
  )
}

// Swap Action Configuration
function SwapActionConfig({
  action,
  onUpdate,
  chain,
}: {
  action: SwapAction
  onUpdate: (updates: Partial<ExecuteAction>) => void
  chain: Chain
}) {
  const availableTokens = getSwapTokens(chain)
  const availableProtocols = getAvailableActions(chain).find(a => a.type === 'swap')?.protocols || []

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
      <div className="flex items-center gap-2">
        <ArrowRightLeft className="h-4 w-4" />
        <span className="font-medium">Swap Configuration</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Output Token</Label>
          <Select
            value={action.parameters.outputToken}
            onValueChange={(value) => onUpdate({
              parameters: { ...action.parameters, outputToken: value }
            })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableTokens.map((token) => (
                <SelectItem key={token.symbol} value={token.symbol}>
                  {token.symbol} - {token.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>DEX</Label>
          <Select
            value={action.parameters.dex}
            onValueChange={(value) => onUpdate({
              protocol: value,
              parameters: { ...action.parameters, dex: value }
            })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableProtocols.map((protocol) => (
                <SelectItem key={protocol} value={protocol}>
                  {protocol}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Slippage Tolerance (%)</Label>
        <Input
          type="number"
          value={action.parameters.slippage}
          onChange={(e) => onUpdate({
            parameters: { ...action.parameters, slippage: parseFloat(e.target.value) || 0 }
          })}
          placeholder="1.0"
          step="0.1"
          min="0"
          max="50"
        />
      </div>
    </div>
  )
}

// Stake Action Configuration
function StakeActionConfig({
  action,
  onUpdate,
  chain,
}: {
  action: StakeAction
  onUpdate: (updates: Partial<ExecuteAction>) => void
  chain: Chain
}) {
  const availableProtocols = getAvailableActions(chain).find(a => a.type === 'stake')?.protocols || []

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
      <div className="flex items-center gap-2">
        <Coins className="h-4 w-4" />
        <span className="font-medium">Staking Configuration</span>
      </div>

      <div className="space-y-2">
        <Label>Staking Protocol</Label>
        <Select
          value={action.protocol}
          onValueChange={(value) => onUpdate({ protocol: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableProtocols.map((protocol) => (
              <SelectItem key={protocol} value={protocol}>
                {protocol}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="autoCompound"
          checked={action.parameters.autoCompound}
          onChange={(e) => onUpdate({
            parameters: { ...action.parameters, autoCompound: e.target.checked }
          })}
          className="rounded border-gray-300"
        />
        <Label htmlFor="autoCompound">Auto-compound rewards</Label>
      </div>
    </div>
  )
}

// Custom Action Configuration
function CustomActionConfig({
  action,
  onUpdate,
  chain,
}: {
  action: CustomAction
  onUpdate: (updates: Partial<ExecuteAction>) => void
  chain: Chain
}) {
  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4" />
        <span className="font-medium">Custom Action Configuration</span>
      </div>

      <div className="space-y-2">
        <Label>Contract Address</Label>
        <Input
          value={action.parameters.contractAddress}
          onChange={(e) => onUpdate({
            parameters: { ...action.parameters, contractAddress: e.target.value }
          })}
          placeholder="0x..."
        />
      </div>

      <div className="space-y-2">
        <Label>Function Name</Label>
        <Input
          value={action.parameters.functionName}
          onChange={(e) => onUpdate({
            parameters: { ...action.parameters, functionName: e.target.value }
          })}
          placeholder="transfer"
        />
      </div>

      <div className="space-y-2">
        <Label>Function Arguments (JSON array)</Label>
        <textarea
          value={JSON.stringify(action.parameters.functionArgs, null, 2)}
          onChange={(e) => {
            try {
              const args = JSON.parse(e.target.value)
              onUpdate({
                parameters: { ...action.parameters, functionArgs: args }
              })
            } catch {
              // Invalid JSON, ignore
            }
          }}
          placeholder='["0x123...", "1000"]'
          className="w-full h-20 p-2 border rounded-md text-sm font-mono"
        />
      </div>

      <div className="text-xs text-muted-foreground">
        <p>⚠️ Custom actions require advanced knowledge of smart contracts.</p>
        <p>Ensure you understand the function you're calling to avoid loss of funds.</p>
      </div>
    </div>
  )
}