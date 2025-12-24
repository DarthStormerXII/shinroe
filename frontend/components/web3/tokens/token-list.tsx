'use client'

import { TokenBalance } from './token-display/token-balance'
import { cn } from '@/lib/utils'
import type { TokenListProps } from '@/lib/types/web3/components'

export function TokenList({
  tokens,
  onTokenSelect,
  showValue = false,
  loading = false,
  emptyMessage = 'No tokens found',
  className
}: TokenListProps) {
  if (loading) {
    return (
      <div className={cn('space-y-2', className)}>
        {[...Array(3)].map((_, i) => (
          <TokenBalance
            key={i}
            token={{
              address: '',
              symbol: '',
              name: '',
              decimals: 18,
              chainId: 1
            }}
            balance="0"
            loading={true}
          />
        ))}
      </div>
    )
  }

  if (tokens.length === 0) {
    return (
      <div className={cn('text-center py-8 text-gray-500', className)}>
        <p>{emptyMessage}</p>
      </div>
    )
  }

  // Sort tokens by value if showValue is true, otherwise by balance
  const sortedTokens = [...tokens].sort((a, b) => {
    if (showValue && a.value !== undefined && b.value !== undefined) {
      return b.value - a.value
    }
    return parseFloat(b.balance) - parseFloat(a.balance)
  })

  return (
    <div className={cn('space-y-2', className)}>
      {sortedTokens.map((token) => (
        <TokenBalance
          key={`${token.chainId}-${token.address}`}
          token={token}
          balance={token.balance}
          showUSD={showValue}
          onChange={onTokenSelect ? () => onTokenSelect(token) : undefined}
        />
      ))}
    </div>
  )
}