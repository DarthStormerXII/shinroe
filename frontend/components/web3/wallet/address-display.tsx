'use client'

import { useState } from 'react'
import { Copy, ExternalLink, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { formatAddress } from '@/lib/web3/format'
import type { AddressDisplayProps } from '@/lib/types/web3/components'

export function AddressDisplay({
  address,
  ensName,
  chainId,
  showCopy = true,
  showExplorer = true,
  explorerUrl,
  truncate = true,
  truncateLength = 6,
  className
}: AddressDisplayProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    if (!address) return
    
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy address:', err)
    }
  }

  const openExplorer = () => {
    if (!address || !explorerUrl) return
    window.open(`${explorerUrl}/address/${address}`, '_blank')
  }

  if (!address) return null

  const displayText = ensName || formatAddress(address, truncate, truncateLength)

  const tooltipText = ensName ? `${ensName} (${formatAddress(address, true, 6)})` : address
  const chainInfo = chainId ? `Chain ID: ${chainId}` : null

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="font-mono text-sm cursor-pointer">
              {displayText}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <div>
              <p className="font-medium">{tooltipText}</p>
              {chainInfo && <p className="text-xs text-muted-foreground">{chainInfo}</p>}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {showCopy && (
        <Button
          variant="ghost"
          size="sm"
          onClick={copyToClipboard}
          className="h-6 w-6 p-0 hover:bg-gray-100"
        >
          {copied ? (
            <Check className="h-3 w-3 text-green-600" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </Button>
      )}
      
      {showExplorer && explorerUrl && (
        <Button
          variant="ghost"
          size="sm"
          onClick={openExplorer}
          className="h-6 w-6 p-0 hover:bg-gray-100"
        >
          <ExternalLink className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}