'use client'

import { useState } from 'react'
import { Check, ChevronDown, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import type { BridgeToken, TokenBalance } from '@/lib/types/bridge'
import type { Chain } from '@/lib/types/bridge'
import { BRIDGE_TOKENS, getSupportedTokens, getTokenAddress } from '@/lib/config/evm-config'

// Token logos mapping
const getTokenLogo = (symbol: string): string => {
  const logos: Record<string, string> = {
    ETH: '/tokens/eth.png',
    WETH: '/tokens/weth.png',
    USDC: '/tokens/usdc.png',
    USDT: '/tokens/usdt.png',
    MATIC: '/tokens/matic.png',
    AVAX: '/tokens/avax.png',
    BNB: '/tokens/bnb.png',
  }
  return logos[symbol] || '/tokens/unknown.png'
}

// Get tokens available for a chain
const getTokensForChain = (chain: Chain | null): BridgeToken[] => {
  if (!chain || typeof chain.id !== 'number') return []

  return Object.values(BRIDGE_TOKENS).filter(token =>
    getTokenAddress(token, chain.id as number)
  )
}

interface TokenSelectorProps {
  selectedToken: BridgeToken | null
  onTokenSelect: (token: BridgeToken) => void
  chain: Chain | null
  balances?: TokenBalance[]
  disabled?: boolean
  placeholder?: string
  showBalance?: boolean
}

export function TokenSelector({
  selectedToken,
  onTokenSelect,
  chain,
  balances = [],
  disabled = false,
  placeholder = 'Select token',
  showBalance = true,
}: TokenSelectorProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const availableTokens = getTokensForChain(chain)

  // Filter tokens based on search query
  const filteredTokens = availableTokens.filter((token) =>
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Get balance for a token
  const getTokenBalance = (token: BridgeToken): TokenBalance | undefined => {
    return balances.find((balance) =>
      balance.token.symbol === token.symbol
    )
  }

  const handleTokenSelect = (token: BridgeToken) => {
    onTokenSelect(token)
    setOpen(false)
    setSearchQuery('')
  }

  if (!chain) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Token</label>
        <Button
          variant="outline"
          disabled
          className="w-full justify-between h-14 text-left"
        >
          <span className="text-muted-foreground">Select chain first</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">Token</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="w-full justify-between h-14 text-left"
          >
            {selectedToken ? (
              <div className="flex items-center gap-3 flex-1">
                <img
                  src={selectedToken.logoUrl || getTokenLogo(selectedToken.symbol)}
                  alt={selectedToken.symbol}
                  className="w-8 h-8 rounded-full"
                  onError={(e) => {
                    e.currentTarget.src = '/tokens/unknown.png'
                  }}
                />
                <div className="flex-1">
                  <div className="font-medium">{selectedToken.symbol}</div>
                  <div className="text-xs text-muted-foreground">
                    {selectedToken.name}
                  </div>
                </div>
                {showBalance && (
                  <div className="text-right">
                    {(() => {
                      const balance = getTokenBalance(selectedToken)
                      return balance ? (
                        <div className="text-sm">
                          <div className="font-medium">
                            {parseFloat(balance.balanceFormatted).toFixed(4)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Balance
                          </div>
                        </div>
                      ) : null
                    })()}
                  </div>
                )}
              </div>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tokens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="max-h-64 overflow-auto">
            {filteredTokens.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                {searchQuery ? 'No tokens found' : 'No tokens available'}
              </div>
            ) : (
              filteredTokens.map((token) => {
                const balance = getTokenBalance(token)
                const tokenAddress = getTokenAddress(token, chain.id as number)
                return (
                  <button
                    key={`${token.symbol}-${tokenAddress}`}
                    onClick={() => handleTokenSelect(token)}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 hover:bg-muted transition-colors',
                      selectedToken?.symbol === token.symbol && 'bg-muted'
                    )}
                  >
                    <img
                      src={token.logoUrl || getTokenLogo(token.symbol)}
                      alt={token.symbol}
                      className="w-8 h-8 rounded-full"
                      onError={(e) => {
                        e.currentTarget.src = '/tokens/unknown.png'
                      }}
                    />
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{token.symbol}</span>
                        {chain.isTestnet && (
                          <Badge variant="secondary" className="text-xs">
                            Testnet
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {token.name}
                      </div>
                    </div>
                    {showBalance && balance && (
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {parseFloat(balance.balanceFormatted).toFixed(4)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Balance
                        </div>
                      </div>
                    )}
                    {selectedToken?.symbol === token.symbol && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </button>
                )
              })
            )}
          </div>
          {chain.isTestnet && (
            <div className="p-3 border-t bg-muted/50">
              <div className="text-xs text-muted-foreground text-center">
                These are testnet tokens with no real value
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}

interface TokenInputProps {
  selectedToken: BridgeToken | null
  onTokenSelect: (token: BridgeToken) => void
  amount: string
  onAmountChange: (amount: string) => void
  chain: Chain | null
  balances?: TokenBalance[]
  placeholder?: string
  disabled?: boolean
  label?: string
  showMaxButton?: boolean
}

export function TokenInput({
  selectedToken,
  onTokenSelect,
  amount,
  onAmountChange,
  chain,
  balances = [],
  placeholder = '0.0',
  disabled = false,
  label = 'Amount',
  showMaxButton = true,
}: TokenInputProps) {
  const balance = selectedToken
    ? balances.find((b) => b.token.symbol === selectedToken.symbol)
    : undefined

  const handleMaxClick = () => {
    if (balance) {
      onAmountChange(balance.balanceFormatted)
    }
  }

  const isAmountValid = () => {
    if (!amount || !balance) return true
    const amountNum = parseFloat(amount)
    const balanceNum = parseFloat(balance.balanceFormatted)
    return amountNum <= balanceNum && amountNum > 0
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">{label}</label>
        {balance && (
          <div className="text-xs text-muted-foreground">
            Balance: {parseFloat(balance.balanceFormatted).toFixed(4)} {selectedToken?.symbol}
          </div>
        )}
      </div>

      <div className="relative">
        <div className="flex">
          <div className="flex-1">
            <Input
              type="number"
              placeholder={placeholder}
              value={amount}
              onChange={(e) => onAmountChange(e.target.value)}
              disabled={disabled || !selectedToken}
              className={cn(
                'h-14 text-lg pr-20 rounded-r-none border-r-0',
                !isAmountValid() && 'border-destructive focus-visible:ring-destructive'
              )}
              step="any"
              min="0"
            />
            {showMaxButton && balance && parseFloat(balance.balanceFormatted) > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleMaxClick}
                disabled={disabled}
                className="absolute right-16 top-1/2 transform -translate-y-1/2 h-8 px-2 text-xs"
              >
                MAX
              </Button>
            )}
          </div>

          <div className="w-32">
            <TokenSelector
              selectedToken={selectedToken}
              onTokenSelect={onTokenSelect}
              chain={chain}
              balances={balances}
              disabled={disabled}
              placeholder="Token"
              showBalance={false}
            />
          </div>
        </div>

        {!isAmountValid() && (
          <div className="absolute -bottom-5 left-0 text-xs text-destructive">
            Insufficient balance
          </div>
        )}
      </div>
    </div>
  )
}

// Export token utilities
export { getTokensForChain, getTokenLogo }