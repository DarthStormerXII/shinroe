'use client'

import { useState } from 'react'
import { ChevronDown, Wallet, LogOut, Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AccountAvatar } from '../account-avatar'
import { AddressDisplay } from '../address-display'
import { BalanceDisplay } from '../balance-display'
import { cn } from '@/lib/utils'
import { getExplorerUrl } from '@/lib/config/chains'
import { getChainMetadata } from '@/lib/web3/assets'
import type { ConnectWalletProps } from '@/lib/types/web3/components'

export function ConnectWallet({
  address,
  chainId,
  isConnected = false,
  balance,
  ensName,
  ensAvatar,
  onConnect,
  onDisconnect,
  mintTestTokens,
  mintLabel = 'Mint Test Tokens',
  showBalance = true,
  className
}: ConnectWalletProps) {
  const [connecting, setConnecting] = useState(false)
  const [minting, setMinting] = useState(false)

  const handleConnect = async () => {
    setConnecting(true)
    try {
      await onConnect()
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    } finally {
      setConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      await onDisconnect()
    } catch (error) {
      console.error('Failed to disconnect wallet:', error)
    }
  }

  const handleMint = async () => {
    if (!mintTestTokens) return
    
    setMinting(true)
    try {
      await mintTestTokens()
    } catch (error) {
      console.error('Failed to mint test tokens:', error)
    } finally {
      setMinting(false)
    }
  }

  const explorerUrl = chainId ? getExplorerUrl(chainId) : undefined

  if (!isConnected) {
    return (
      <Button
        onClick={handleConnect}
        disabled={connecting}
        className={cn('min-w-[140px]', className)}
      >
        {connecting ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border border-current border-r-transparent" />
            Connecting...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Connect Wallet
          </div>
        )}
      </Button>
    )
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className={cn('min-w-[160px]', className)}>
            <div className="flex items-center gap-3 w-full">
              <AccountAvatar 
                address={address}
                ensAvatar={ensAvatar}
                size="sm"
              />
              <div className="flex-1 text-left">
                <AddressDisplay 
                  address={address}
                  ensName={ensName}
                  showCopy={false}
                  showExplorer={false}
                  truncateLength={4}
                />
              </div>
              <ChevronDown className="h-4 w-4 shrink-0" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-64">
          <div className="p-3">
            <div className="flex items-center gap-3 mb-3">
              <AccountAvatar 
                address={address}
                ensAvatar={ensAvatar}
                size="md"
              />
              <div className="flex-1">
                <AddressDisplay 
                  address={address}
                  ensName={ensName}
                  chainId={chainId}
                  explorerUrl={explorerUrl}
                  truncateLength={6}
                />
              </div>
            </div>
            
            {showBalance && balance && (
              <BalanceDisplay 
                balance={balance}
                symbol={chainId ? getChainMetadata(chainId).symbol : 'ETH'}
                chainId={chainId}
                showUSD={true}
                compact
                className="mb-3"
              />
            )}
          </div>
          
          <DropdownMenuSeparator />
          
          {mintTestTokens && (
            <>
              <DropdownMenuItem 
                onClick={handleMint}
                disabled={minting}
                className="cursor-pointer"
              >
                {minting ? (
                  <div className="flex items-center">
                    <div className="h-4 w-4 animate-spin rounded-full border border-current border-r-transparent mr-2" />
                    Minting...
                  </div>
                ) : (
                  <>
                    <Gift className="h-4 w-4 mr-2" />
                    {mintLabel}
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          
          <DropdownMenuItem
            onClick={handleDisconnect}
            className="cursor-pointer text-red-600 focus:text-red-600"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}