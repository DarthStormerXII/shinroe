'use client'

import { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { formatBalance, formatTokenAmountRaw } from '@/lib/web3/format'
import { formatPriceUSD as formatUSDPrice, getPriceColorClass as getPriceChangeColor } from '@/lib/web3/price'
import { getTokenPrice, getNativeTokenPrice } from '@/lib/web3/price'
import { getChainMetadata } from '@/lib/web3/assets'
import type { BalanceDisplayProps } from '@/lib/types/web3/components'

export function BalanceDisplay({
  balance,
  symbol = 'ETH',
  decimals = 18,
  showUSD = false,
  usdPrice,
  coingeckoId,
  chainId,
  loading = false,
  compact = false,
  className
}: BalanceDisplayProps) {
  const [fetchedPrice, setFetchedPrice] = useState<number | null>(null)
  const [priceChange, setPriceChange] = useState<number | undefined>()
  const [isLoadingPrice, setIsLoadingPrice] = useState(false)

  useEffect(() => {
    if (!showUSD || usdPrice !== undefined) return

    const fetchPrice = async () => {
      setIsLoadingPrice(true)
      try {
        let priceData
        
        if (coingeckoId) {
          priceData = await getTokenPrice(coingeckoId)
        } else if (chainId) {
          // Try to get native token price based on chain
          priceData = await getNativeTokenPrice(chainId)
        } else if (symbol === 'ETH') {
          // Default to Ethereum if no chain ID
          priceData = await getTokenPrice('ethereum')
        }

        if (priceData) {
          setFetchedPrice(priceData.usd)
          setPriceChange(priceData.usd_24h_change)
        }
      } catch (error) {
        console.error('Failed to fetch price:', error)
      }
      setIsLoadingPrice(false)
    }

    fetchPrice()
    // Refresh price every minute
    const interval = setInterval(fetchPrice, 60000)
    return () => clearInterval(interval)
  }, [showUSD, usdPrice, coingeckoId, chainId, symbol])
  if (loading) {
    return (
      <div className={cn('space-y-1', className)}>
        <Skeleton className="h-4 w-20" />
        {showUSD && <Skeleton className="h-3 w-16" />}
      </div>
    )
  }

  const formattedBalance = formatBalance(balance, decimals)
  const rawBalance = balance ? parseFloat(balance) : 0
  const finalPrice = usdPrice ?? fetchedPrice ?? 0
  const usdValue = rawBalance * finalPrice

  if (compact) {
    return (
      <div className={cn('text-right', className)}>
        <div className="font-medium">
          {formattedBalance} {symbol}
        </div>
        {showUSD && (isLoadingPrice ? (
          <Skeleton className="h-3 w-16 mt-1" />
        ) : usdValue > 0 ? (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">
              {formatUSDPrice(usdValue)}
            </span>
            {priceChange !== undefined && (
              <span className={cn('font-medium', getPriceChangeColor(priceChange))}>
                {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
              </span>
            )}
          </div>
        ) : null)}
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Balance</span>
        <span className="font-medium">
          {formattedBalance} {symbol}
        </span>
      </div>
      
      {showUSD && (isLoadingPrice ? (
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Value</span>
          <Skeleton className="h-3 w-16" />
        </div>
      ) : usdValue > 0 ? (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Value</span>
            <span className="text-xs font-medium">
              {formatUSDPrice(usdValue)}
            </span>
          </div>
          {priceChange !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">24h Change</span>
              <span className={cn('text-xs font-medium', getPriceChangeColor(priceChange))}>
                {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
              </span>
            </div>
          )}
        </div>
      ) : null)}
    </div>
  )
}