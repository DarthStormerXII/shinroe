'use client'

import { useEffect, useState } from 'react'
import { RefreshCw, Fuel, Info } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { formatGasPrice, formatUSD } from '@/lib/web3/format'
import type { GasEstimatorProps } from '@/lib/types/web3/components'
import { useAccount, useGasPrice, useEstimateGas, useBalance } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import type { GasEstimate } from '@/lib/types/web3/web3'

interface GasEstimatorWithDataProps extends GasEstimatorProps {
  // Transaction data for automatic estimation
  to?: string
  value?: string
  data?: string
  // Whether to use automatic fetching
  autoFetch?: boolean
}

export function GasEstimator({
  estimate: providedEstimate,
  onRefresh,
  loading: externalLoading = false,
  showDetails = false,
  className,
  // Transaction data props
  to,
  value,
  data,
  autoFetch = false
}: GasEstimatorWithDataProps) {
  const { address, isConnected } = useAccount()
  const { data: gasPrice, refetch: refetchGasPrice, isError: gasPriceError } = useGasPrice()
  const { data: balance } = useBalance({ address })
  const [estimate, setEstimate] = useState<GasEstimate | undefined>(providedEstimate)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Parse value for transaction
  let parsedValue = BigInt(0)
  if (autoFetch && value) {
    try {
      if (parseFloat(value) > 0) {
        parsedValue = parseEther(value)
      }
    } catch {
      // Invalid value
    }
  }

  // Prepare transaction for estimation
  const transaction = autoFetch && parsedValue > 0 ? {
    to: (to || '0x0000000000000000000000000000000000000001') as `0x${string}`,
    value: parsedValue,
    data: data as `0x${string}` | undefined,
  } : null

  const { data: gasLimit, refetch: refetchGasLimit, isError: gasLimitError } = useEstimateGas(
    transaction && isConnected ? {
      ...transaction,
      account: address,
    } : undefined as any
  )

  // Update estimate when providedEstimate changes
  useEffect(() => {
    if (providedEstimate) {
      setEstimate(providedEstimate)
    }
  }, [providedEstimate])

  // Auto-fetch gas estimate when enabled
  useEffect(() => {
    if (!autoFetch) return
    
    setError(null)
    
    if (!isConnected) {
      setEstimate(undefined)
      return
    }

    if (!value || parseFloat(value) <= 0) {
      setEstimate(undefined)
      setError('Enter a valid amount')
      return
    }

    if (gasPriceError || gasLimitError) {
      setError('Failed to estimate gas. Please try again.')
      return
    }

    if (gasLimit && gasPrice) {
      setLoading(true)
      
      try {
        // Calculate estimated cost
        const estimatedCostWei = gasLimit * gasPrice
        const estimatedCostEth = formatEther(estimatedCostWei)
        
        // For demo purposes, using a fixed ETH price
        // In production, you'd fetch this from a price API
        const ethPriceUSD = 2500
        const estimatedCostUSD = parseFloat(estimatedCostEth) * ethPriceUSD

        setEstimate({
          gasLimit: gasLimit.toString(),
          gasPrice: gasPrice.toString(),
          estimatedCost: estimatedCostEth,
          estimatedCostUSD,
        })
        setError(null)
      } catch (err) {
        setError('Error calculating gas estimate')
        console.error('Gas calculation error:', err)
      }
      
      setLoading(false)
    }
  }, [autoFetch, gasLimit, gasPrice, isConnected, value, gasPriceError, gasLimitError])

  const handleRefresh = async () => {
    if (onRefresh) {
      await onRefresh()
    } else if (autoFetch) {
      setLoading(true)
      setError(null)
      try {
        await Promise.all([
          refetchGasPrice(),
          refetchGasLimit()
        ])
      } catch {
        setError('Failed to refresh gas estimate')
      }
      setLoading(false)
    }
  }

  const isLoading = externalLoading || loading

  // Show error messages
  if (error && autoFetch) {
    return (
      <div className="text-sm text-red-600">
        {error}
      </div>
    )
  }

  // Show balance warning if auto-fetching
  if (autoFetch && balance && parsedValue > balance.value) {
    return (
      <div className="text-sm text-yellow-600">
        Warning: Amount exceeds your balance ({formatEther(balance.value)} {balance.symbol})
      </div>
    )
  }

  if (!estimate) {
    return isLoading ? (
      <Skeleton className="h-6 w-32" />
    ) : null
  }

  const content = (
    <Badge 
      variant="secondary" 
      className={cn("gap-1.5", className)}
    >
      <Fuel className="h-3 w-3" />
      {isLoading ? (
        <Skeleton className="h-3 w-16" />
      ) : (
        <span className="font-medium">
          {formatGasPrice(estimate.gasPrice || '0')} gwei
        </span>
      )}
      {(onRefresh || autoFetch) && (
        <RefreshCw 
          className={cn(
            "h-3 w-3 cursor-pointer hover:opacity-70 transition-opacity",
            isLoading && "animate-spin"
          )}
          onClick={(e) => {
            e.stopPropagation()
            handleRefresh()
          }}
        />
      )}
    </Badge>
  )

  if (!showDetails) {
    return content
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="inline-flex cursor-pointer">
          {content}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-muted-foreground" />
            <h4 className="font-medium">Gas Estimate Details</h4>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gas Price:</span>
              {isLoading ? (
                <Skeleton className="h-4 w-20" />
              ) : (
                <span className="font-mono">
                  {formatGasPrice(estimate.gasPrice || '0')} gwei
                </span>
              )}
            </div>
            
            {estimate.gasLimit && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gas Limit:</span>
                {isLoading ? (
                  <Skeleton className="h-4 w-20" />
                ) : (
                  <span className="font-mono">
                    {parseInt(estimate.gasLimit).toLocaleString()}
                  </span>
                )}
              </div>
            )}
            
            {estimate.estimatedCost && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Est. Cost:</span>
                  {isLoading ? (
                    <Skeleton className="h-4 w-20" />
                  ) : (
                    <span className="font-mono">
                      {parseFloat(estimate.estimatedCost).toFixed(6)} ETH
                    </span>
                  )}
                </div>
                
                {estimate.estimatedCostUSD && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Est. Cost (USD):</span>
                    {isLoading ? (
                      <Skeleton className="h-4 w-20" />
                    ) : (
                      <span className="font-mono">
                        {formatUSD(estimate.estimatedCostUSD)}
                      </span>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
          
          {(onRefresh || autoFetch) && (
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="w-full text-sm text-primary hover:underline disabled:opacity-50"
            >
              Refresh estimate
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}