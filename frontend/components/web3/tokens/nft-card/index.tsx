'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { ExternalLink, Send, Tag } from 'lucide-react'
import { usePublicClient } from '@/lib/web3'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { formatAddress } from '@/lib/web3/format'
import { getExplorerUrl } from '@/lib/config/chains'
import { getCachedIPFSMetadata, formatNFTMetadata } from '@/lib/web3/ipfs'
import { readContract } from '@/lib/web3/contracts'
import { ERC721ABI } from '@/lib/web3/abis'
import type { NFTCardProps } from '@/lib/types/web3/components'
import type { NFTMetadata } from '@/lib/types/web3/nft'

export function NFTCard({
  tokenId,
  contractAddress,
  metadata: providedMetadata,
  chainId,
  owner: providedOwner,
  onTransfer,
  onSell,
  onView,
  showActions = true,
  expandable = true,
  className,
  fetchOnChain = false // New prop to enable on-chain fetching
}: NFTCardProps & { fetchOnChain?: boolean }) {
  const [open, setOpen] = useState(false)
  const [metadata, setMetadata] = useState<NFTMetadata | null>(providedMetadata || null)
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(fetchOnChain && !providedMetadata)
  const [owner, setOwner] = useState<string | null>(providedOwner || null)
  const [isLoadingOwner, setIsLoadingOwner] = useState(fetchOnChain && !providedOwner)
  
  const { publicClient } = usePublicClient({ chainId })

  // Fetch metadata if enabled and not provided
  useEffect(() => {
    if (!fetchOnChain || providedMetadata || !publicClient) {
      setIsLoadingMetadata(false)
      return
    }

    const fetchMetadata = async () => {
      try {
        // Fetch tokenURI from contract
        const tokenURI = await readContract(publicClient, {
          address: contractAddress as `0x${string}`,
          abi: [...ERC721ABI],
          functionName: 'tokenURI',
          args: [BigInt(tokenId)]
        })

        if (tokenURI) {
          // Fetch metadata from IPFS
          const fetchedMetadata = await getCachedIPFSMetadata(tokenURI as string)
          if (fetchedMetadata) {
            setMetadata(formatNFTMetadata(fetchedMetadata))
          }
        }
      } catch (error) {
        console.error('Failed to fetch NFT metadata:', error)
      } finally {
        setIsLoadingMetadata(false)
      }
    }

    fetchMetadata()
  }, [fetchOnChain, publicClient, contractAddress, tokenId, providedMetadata])

  // Fetch owner if enabled and not provided
  useEffect(() => {
    if (!fetchOnChain || providedOwner || !publicClient) {
      setIsLoadingOwner(false)
      return
    }

    const fetchOwner = async () => {
      try {
        const ownerAddress = await readContract(publicClient, {
          address: contractAddress as `0x${string}`,
          abi: [...ERC721ABI],
          functionName: 'ownerOf',
          args: [BigInt(tokenId)]
        })

        if (ownerAddress) {
          setOwner(ownerAddress as string)
        }
      } catch (error) {
        console.error('Failed to fetch NFT owner:', error)
      } finally {
        setIsLoadingOwner(false)
      }
    }

    fetchOwner()
  }, [fetchOnChain, publicClient, contractAddress, tokenId, providedOwner])

  const explorerUrl = getExplorerUrl(chainId)
  const tokenName = metadata?.name || `#${tokenId}`
  const imageUrl = metadata?.image || '/images/nft-placeholder.svg'
  const description = metadata?.description || 'No description available'

  const handleView = () => {
    if (onView) {
      onView(tokenId, contractAddress)
    }
    if (explorerUrl) {
      window.open(`${explorerUrl}/token/${contractAddress}?a=${tokenId}`, '_blank')
    }
  }

  const loading = isLoadingMetadata || isLoadingOwner

  const cardContent = (
    <Card className={cn('overflow-hidden hover:shadow-lg transition-shadow', className)}>
      <CardHeader className="p-0">
        <div className="aspect-square relative overflow-hidden">
          {loading ? (
            <Skeleton className="w-full h-full" />
          ) : (
            <Image
              src={imageUrl}
              alt={tokenName}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              onError={() => {
                setMetadata(prev => prev ? {...prev, image: '/images/nft-placeholder.svg'} : null)
              }}
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {loading ? (
          <>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-4 w-40" />
          </>
        ) : (
          <>
            <CardTitle className="text-lg mb-2">{tokenName}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Tag className="h-3 w-3" />
              <span>#{tokenId}</span>
            </div>
            {owner && (
              <div className="mt-2 text-sm">
                <span className="text-muted-foreground">Owner: </span>
                <span className="font-mono">{formatAddress(owner, true, 4)}</span>
              </div>
            )}
          </>
        )}
      </CardContent>
      {showActions && !loading && (
        <CardFooter className="p-4 pt-0 gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleView}
            className="flex-1"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            View
          </Button>
          {onTransfer && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onTransfer(tokenId, contractAddress)}
              className="flex-1"
            >
              <Send className="h-3 w-3 mr-1" />
              Transfer
            </Button>
          )}
          {onSell && (
            <Button
              variant="default"
              size="sm"
              onClick={() => onSell(tokenId, contractAddress)}
              className="flex-1"
            >
              Sell
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  )

  if (!expandable) {
    return cardContent
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="cursor-pointer">
          {cardContent}
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{tokenName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="aspect-video relative overflow-hidden rounded-lg">
            {loading ? (
              <Skeleton className="w-full h-full" />
            ) : (
              <Image
                src={imageUrl}
                alt={tokenName}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
                className="object-contain bg-muted"
                onError={() => {
                  setMetadata(prev => prev ? {...prev, image: '/images/nft-placeholder.svg'} : null)
                }}
              />
            )}
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold">Description</h3>
            {loading ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Details</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Token ID: </span>
                <span className="font-mono">#{tokenId}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Contract: </span>
                <span className="font-mono">{formatAddress(contractAddress, true, 4)}</span>
              </div>
              {owner && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Owner: </span>
                  {loading ? (
                    <Skeleton className="inline-block h-4 w-32" />
                  ) : (
                    <span className="font-mono">{formatAddress(owner, true, 6)}</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {metadata?.attributes && metadata.attributes.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Attributes</h3>
              <div className="grid grid-cols-2 gap-2">
                {metadata.attributes.map((attr, index) => (
                  <Badge key={index} variant="secondary" className="justify-between">
                    <span className="text-muted-foreground">{attr.trait_type}:</span>
                    <span className="ml-2">{attr.value}</span>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={handleView} className="flex-1">
              <ExternalLink className="h-4 w-4 mr-2" />
              View on Explorer
            </Button>
            {onTransfer && (
              <Button
                variant="outline"
                onClick={() => {
                  setOpen(false)
                  onTransfer(tokenId, contractAddress)
                }}
                className="flex-1"
              >
                <Send className="h-4 w-4 mr-2" />
                Transfer
              </Button>
            )}
            {onSell && (
              <Button
                variant="default"
                onClick={() => {
                  setOpen(false)
                  onSell(tokenId, contractAddress)
                }}
                className="flex-1"
              >
                Sell NFT
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}