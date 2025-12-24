'use client'

import { useAccount, useGasPrice } from '@/lib/web3'
import { Fuel, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { formatGasPrice, formatUSD } from '@/lib/web3/format'

interface GasPriceDisplayProps {
  showUSD?: boolean
  ethPrice?: number
  className?: string
}

export function GasPriceDisplay({
  showUSD = true,
  ethPrice = 2500, // Default ETH price for demo
  className
}: GasPriceDisplayProps) {
  const { isConnected, chain } = useAccount()
  const { gasPrice, isLoading, refetch, error } = useGasPrice()

  const isError = !isLoading && !gasPrice && isConnected

  if (!isConnected) {
    return (
      <div className={cn('flex items-center gap-2 text-gray-500', className)}>
        <Fuel className="h-4 w-4" />
        <span className="text-sm">Connect wallet to see gas prices</span>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Skeleton className="h-5 w-5 rounded" />
        <Skeleton className="h-4 w-20" />
      </div>
    )
  }

  if (isError || !gasPrice) {
    return (
      <div className={cn('space-y-2', className)}>
        <div className="flex items-center gap-2 text-gray-500">
          <Fuel className="h-4 w-4" />
          <span className="text-sm">Unable to fetch gas price</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={refetch}
            className="h-6 w-6 p-0"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
        {error && (
          <p className="text-xs text-muted-foreground">{error}</p>
        )}
      </div>
    )
  }

  const gasPriceGwei = formatGasPrice(gasPrice)

  // Calculate cost for a simple ETH transfer (21000 gas)
  const transferGasLimit = 21000n
  const transferCostWei = gasPrice * transferGasLimit
  const transferCostEth = Number(transferCostWei) / 1e18
  const transferCostUSD = transferCostEth * ethPrice

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Fuel className="h-4 w-4 text-orange-600" />
          <span className="text-sm font-medium">Current Gas Price</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={refetch}
          className="h-6 w-6 p-0"
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      </div>
      
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="text-lg px-3 py-1">
          {gasPriceGwei}
        </Badge>
        {chain?.name && (
          <span className="text-xs text-muted-foreground">
            on {chain.name}
          </span>
        )}
      </div>

      {showUSD && (
        <div className="text-sm text-muted-foreground">
          <p>Simple transfer would cost:</p>
          <p className="font-medium text-foreground">
            ~{transferCostEth.toFixed(6)} {chain?.nativeCurrency?.symbol ?? 'ETH'}
            <span className="text-muted-foreground ml-2">
              ({formatUSD(transferCostUSD)})
            </span>
          </p>
        </div>
      )}
    </div>
  )
}