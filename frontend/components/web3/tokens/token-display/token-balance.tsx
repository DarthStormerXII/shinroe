'use client'

import { useEffect, useState } from 'react'
import { usePublicClient } from '@/lib/web3'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
import { TokenIcon } from './token-icon'
import { cn } from '@/lib/utils'
import { formatBalance, formatTokenAmountRaw } from '@/lib/web3/format'
import { formatPriceUSD as formatUSD, formatPercentChange, getPriceColorClass as getPriceChangeColor } from '@/lib/web3/price'
import { getTokenPrice, getMultiChainTokenPrices } from '@/lib/web3/price'
import { getTokenMetadata } from '@/lib/web3/assets'
import { readContract } from '@/lib/web3/contracts'
import { ERC20ABI } from '@/lib/web3/abis'
import type { TokenBalanceProps } from '@/lib/types/web3/components'

export function TokenBalance({
  token,
  balance: providedBalance,
  userAddress,
  showUSD = false,
  onChange,
  loading: externalLoading = false,
  className
}: TokenBalanceProps) {
  const [priceData, setPriceData] = useState<{ usd: number; change?: number } | null>(null)
  const [isLoadingPrice, setIsLoadingPrice] = useState(false)
  const [balance, setBalance] = useState<string | null>(providedBalance || null)
  const [isLoadingBalance, setIsLoadingBalance] = useState(!providedBalance && !!userAddress)
  
  const { publicClient } = usePublicClient({ chainId: token.chainId })

  // Fetch balance if not provided but userAddress is available
  useEffect(() => {
    if (providedBalance || !userAddress || !publicClient) {
      setIsLoadingBalance(false)
      return
    }

    const fetchBalance = async () => {
      try {
        const balanceResult = await readContract(publicClient, {
          address: token.address as `0x${string}`,
          abi: [...ERC20ABI],
          functionName: 'balanceOf',
          args: [userAddress as `0x${string}`]
        })

        if (balanceResult !== undefined && balanceResult !== null) {
          setBalance(balanceResult.toString())
        }
      } catch (error) {
        console.error('Failed to fetch token balance:', error)
        setBalance('0')
      } finally {
        setIsLoadingBalance(false)
      }
    }

    fetchBalance()
  }, [publicClient, token.address, userAddress, providedBalance])

  // Update balance when providedBalance changes
  useEffect(() => {
    if (providedBalance !== undefined) {
      setBalance(providedBalance)
    }
  }, [providedBalance])

  // Fetch price data
  useEffect(() => {
    if (!showUSD && !token.price) return

    const fetchPrice = async () => {
      setIsLoadingPrice(true)
      try {
        // Try to get token metadata to find coingecko ID
        const metadata = getTokenMetadata(token.address, token.chainId)
        
        if (metadata?.coingeckoId) {
          const data = await getTokenPrice(metadata.coingeckoId)
          if (data) {
            setPriceData({ usd: data.usd, change: data.usd_24h_change })
          }
        } else {
          // Try batch fetching with address
          const prices = await getMultiChainTokenPrices([
            { address: token.address, chainId: token.chainId }
          ])
          const key = `${token.chainId}-${token.address.toLowerCase()}`
          const data = prices[key]
          if (data) {
            setPriceData({ usd: data.usd, change: data.usd_24h_change })
          }
        }
      } catch (error) {
        console.error('Failed to fetch token price:', error)
      }
      setIsLoadingPrice(false)
    }

    fetchPrice()
    // Refresh price every minute
    const interval = setInterval(fetchPrice, 60000)
    return () => clearInterval(interval)
  }, [showUSD, token])

  const loading = externalLoading || isLoadingBalance

  if (loading) {
    return (
      <Card className={cn('p-4', className)}>
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-16 mb-1" />
            <Skeleton className="h-3 w-12" />
          </div>
          <div className="text-right">
            <Skeleton className="h-4 w-20 mb-1" />
            {showUSD && <Skeleton className="h-3 w-16" />}
          </div>
        </div>
      </Card>
    )
  }

  const displayBalance = balance || '0'
  const formattedBalance = formatBalance(displayBalance, token.decimals)
  
  // Handle both string and bigint balances
  const rawBalance = displayBalance 
    ? typeof displayBalance === 'string' && displayBalance.match(/^\d+$/)
      ? formatTokenAmountRaw(BigInt(displayBalance), token.decimals)
      : parseFloat(displayBalance) 
    : 0
    
  const price = token.price ?? priceData?.usd ?? 0
  const usdValue = rawBalance * price
  const priceChange = priceData?.change

  return (
    <Card 
      className={cn(
        'transition-colors',
        onChange && 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800',
        className
      )}
    >
      <div 
        className="p-4 flex items-center gap-3"
        onClick={onChange}
      >
        <TokenIcon token={token} size="lg" />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium truncate">{token.symbol}</h3>
            {(price > 0 || isLoadingPrice) && (
              <div className="flex items-center gap-1">
                {isLoadingPrice ? (
                  <Skeleton className="h-4 w-12" />
                ) : price > 0 ? (
                  <>
                    <span className="text-sm text-muted-foreground">
                      {formatUSD(price)}
                    </span>
                    {priceChange !== undefined && (
                      <span className={cn('text-xs font-medium', getPriceChangeColor(priceChange))}>
                        {formatPercentChange(priceChange)}
                      </span>
                    )}
                  </>
                ) : null}
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate">{token.name}</p>
        </div>
        
        <div className="text-right">
          <div className="font-medium">
            {formattedBalance}
          </div>
          {showUSD && (isLoadingPrice ? (
            <Skeleton className="h-4 w-16 mt-1" />
          ) : usdValue > 0 ? (
            <div className="text-sm text-muted-foreground">
              {formatUSD(usdValue)}
            </div>
          ) : null)}
        </div>
      </div>
    </Card>
  )
}