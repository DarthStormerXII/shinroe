/**
 * IPFS utilities for fetching NFT metadata
 */

import type { NFTMetadata } from '@/lib/types/web3/nft'

// IPFS Gateways to try in order
const IPFS_GATEWAYS = [
  'https://gateway.pinata.cloud/ipfs/',
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://gateway.ipfs.io/ipfs/',
]

/**
 * Convert IPFS URI to HTTP URL
 */
export function ipfsToHttp(uri: string, gatewayIndex = 0): string {
  if (!uri) return ''
  
  // If it's already an HTTP URL, return as is
  if (uri.startsWith('http://') || uri.startsWith('https://')) {
    return uri
  }
  
  // Handle ipfs:// protocol
  if (uri.startsWith('ipfs://')) {
    const hash = uri.replace('ipfs://', '')
    return IPFS_GATEWAYS[gatewayIndex] + hash
  }
  
  // Handle plain IPFS hash
  if (uri.startsWith('Qm') || uri.startsWith('baf')) {
    return IPFS_GATEWAYS[gatewayIndex] + uri
  }
  
  // Handle /ipfs/ prefix
  if (uri.startsWith('/ipfs/')) {
    return IPFS_GATEWAYS[gatewayIndex] + uri.replace('/ipfs/', '')
  }
  
  return uri
}

/**
 * Fetch metadata from IPFS with fallback gateways
 */
export async function fetchIPFSMetadata(uri: string): Promise<NFTMetadata | null> {
  if (!uri) return null
  
  // Try each gateway until one works
  for (let i = 0; i < IPFS_GATEWAYS.length; i++) {
    try {
      const url = ipfsToHttp(uri, i)
      const response = await fetch(url, {
        signal: AbortSignal.timeout(10000), // 10 second timeout
      })
      
      if (!response.ok) continue
      
      const metadata = await response.json()
      
      // Convert image URI to HTTP if needed
      if (metadata.image) {
        metadata.image = ipfsToHttp(metadata.image)
      }
      
      // Convert animation_url if present
      if (metadata.animation_url) {
        metadata.animation_url = ipfsToHttp(metadata.animation_url)
      }
      
      return metadata as NFTMetadata
    } catch (error) {
      console.warn(`Failed to fetch from gateway ${i}:`, error)
      continue
    }
  }
  
  console.error('Failed to fetch metadata from all gateways')
  return null
}

/**
 * Fetch and cache NFT metadata
 */
const metadataCache = new Map<string, NFTMetadata>()

export async function getCachedIPFSMetadata(uri: string): Promise<NFTMetadata | null> {
  if (!uri) return null
  
  // Check cache first
  const cached = metadataCache.get(uri)
  if (cached) return cached
  
  // Fetch metadata
  const metadata = await fetchIPFSMetadata(uri)
  
  // Cache successful fetch
  if (metadata) {
    metadataCache.set(uri, metadata)
  }
  
  return metadata
}

/**
 * Validate NFT metadata structure
 */
export function validateNFTMetadata(metadata: any): metadata is NFTMetadata {
  return (
    metadata &&
    typeof metadata === 'object' &&
    (typeof metadata.name === 'string' || typeof metadata.title === 'string')
  )
}

/**
 * Format metadata for display
 */
export function formatNFTMetadata(metadata: any): NFTMetadata {
  if (!metadata) {
    return {
      name: 'Unknown NFT',
      description: 'No metadata available',
    }
  }
  
  return {
    name: metadata.name || metadata.title || 'Unknown NFT',
    description: metadata.description || 'No description available',
    image: metadata.image || metadata.image_url || metadata.imageUrl,
    attributes: Array.isArray(metadata.attributes) ? metadata.attributes : [],
  }
}