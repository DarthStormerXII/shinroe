'use client'

import { useState } from 'react'
import { Check, ChevronDown, ArrowLeftRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import type { Chain } from '@/lib/types/bridge'
import { EVM_NETWORKS } from '@/lib/config/evm-config'

// Convert EVM networks to chain objects
const AVAILABLE_CHAINS: Chain[] = Object.values(EVM_NETWORKS).map(network => ({
  id: network.chainId,
  name: network.name,
  type: 'evm' as const,
  rpcUrl: network.rpcUrl,
  explorerUrl: network.explorerUrl,
  isTestnet: network.isTestnet,
  nativeCurrency: network.nativeCurrency,
}))

// Chain logos mapping
const getChainLogo = (chainId: string | number): string => {
  const logos: Record<string, string> = {
    '1': '/chains/ethereum.png',
    '11155111': '/chains/ethereum.png',
    '137': '/chains/polygon.png',
    '42161': '/chains/arbitrum.png',
    '10': '/chains/optimism.png',
    '8453': '/chains/base.png',
  }
  return logos[chainId.toString()] || '/chains/unknown.png'
}

interface ChainSelectorProps {
  selectedChain: Chain | null
  onChainSelect: (chain: Chain) => void
  label: string
  excludeChain?: Chain | null
  showTestnets?: boolean
  type?: 'source' | 'destination'
}

export function ChainSelector({
  selectedChain,
  onChainSelect,
  label,
  excludeChain,
  showTestnets = true,
  type = 'source',
}: ChainSelectorProps) {
  const [open, setOpen] = useState(false)

  // Filter chains based on settings and bridge constraints
  const filteredChains = AVAILABLE_CHAINS.filter((chain) => {
    // Exclude the specified chain (usually the other selector's selection)
    if (excludeChain && chain.id === excludeChain.id) return false

    // Filter by testnet preference
    if (!showTestnets && chain.isTestnet) return false

    return true
  })

  const handleChainSelect = (chain: Chain) => {
    onChainSelect(chain)
    setOpen(false)
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-14 text-left"
          >
            {selectedChain ? (
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                    {selectedChain.nativeCurrency.symbol.slice(0, 2)}
                  </div>
                  {selectedChain.isTestnet && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border border-background" />
                  )}
                </div>
                <div>
                  <div className="font-medium">{selectedChain.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {selectedChain.nativeCurrency.symbol}
                    {selectedChain.isTestnet && ' • Testnet'}
                  </div>
                </div>
              </div>
            ) : (
              <span className="text-muted-foreground">Select chain</span>
            )}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <div className="max-h-64 overflow-auto">
            {filteredChains.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No chains available
              </div>
            ) : (
              filteredChains.map((chain) => (
                <button
                  key={chain.id}
                  onClick={() => handleChainSelect(chain)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 hover:bg-muted transition-colors',
                    selectedChain?.id === chain.id && 'bg-muted'
                  )}
                >
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                      {chain.nativeCurrency.symbol.slice(0, 2)}
                    </div>
                    {chain.isTestnet && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border border-background" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{chain.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {chain.nativeCurrency.symbol}
                      {chain.isTestnet && ' • Testnet'}
                    </div>
                  </div>
                  {selectedChain?.id === chain.id && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </button>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

interface ChainSelectorPairProps {
  sourceChain: Chain | null
  destinationChain: Chain | null
  onSourceChainSelect: (chain: Chain) => void
  onDestinationChainSelect: (chain: Chain) => void
  onSwapChains: () => void
  showTestnets?: boolean
}

export function ChainSelectorPair({
  sourceChain,
  destinationChain,
  onSourceChainSelect,
  onDestinationChainSelect,
  onSwapChains,
  showTestnets = true,
}: ChainSelectorPairProps) {
  const canSwap = sourceChain && destinationChain

  // Auto-select destination chain when source is selected
  const handleSourceChainSelect = (chain: Chain) => {
    onSourceChainSelect(chain)

    // Auto-select a default destination chain
    if (!destinationChain || destinationChain.id === chain.id) {
      const availableDestinations = AVAILABLE_CHAINS.filter(c =>
        c.id !== chain.id &&
        (!showTestnets ? !c.isTestnet : true)
      )

      if (availableDestinations.length > 0) {
        // Prefer same testnet status, otherwise just pick the first
        const preferredChain = chain.isTestnet
          ? availableDestinations.find(c => c.isTestnet) || availableDestinations[0]
          : availableDestinations.find(c => !c.isTestnet) || availableDestinations[0]
        onDestinationChainSelect(preferredChain)
      }
    }
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">EVM ↔ EVM Bridge</h3>
          {showTestnets && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-2 h-2 bg-orange-500 rounded-full" />
              Testnet Available
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
          <ChainSelector
            selectedChain={sourceChain}
            onChainSelect={handleSourceChainSelect}
            label="From"
            excludeChain={destinationChain}
            showTestnets={showTestnets}
            type="source"
          />

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 md:block hidden">
            <Button
              variant="outline"
              size="icon"
              onClick={onSwapChains}
              disabled={!canSwap}
              className="w-10 h-10 rounded-full border-2 bg-background shadow-sm hover:shadow-md transition-all disabled:opacity-50"
            >
              <ArrowLeftRight className="h-4 w-4" />
            </Button>
          </div>

          <ChainSelector
            selectedChain={destinationChain}
            onChainSelect={onDestinationChainSelect}
            label="To"
            excludeChain={sourceChain}
            showTestnets={showTestnets}
            type="destination"
          />
        </div>

        {/* Mobile swap button */}
        <div className="md:hidden flex justify-center">
          <Button
            variant="outline"
            onClick={onSwapChains}
            disabled={!canSwap}
            className="flex items-center gap-2"
          >
            <ArrowLeftRight className="h-4 w-4" />
            Swap Networks
          </Button>
        </div>

        {/* Info text */}
        <div className="text-xs text-muted-foreground text-center">
          Bridge tokens between different EVM chains
        </div>
      </div>
    </Card>
  )
}

// Export available chains for use in other components
export { AVAILABLE_CHAINS, getChainLogo }