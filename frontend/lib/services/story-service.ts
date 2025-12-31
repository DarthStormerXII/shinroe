// Story Protocol Service - Stub implementation
// TODO: Implement full Story Protocol SDK integration when needed

import type { IPAsset } from '@/lib/types/story'

export function getAssetDisplayName(asset: IPAsset | null): string {
  if (!asset) return 'Unknown Asset'
  return asset.nftMetadata?.name || asset.tokenId || 'Unnamed Asset'
}

export function getLicenseTypeLabel(licenseType: number | unknown): string {
  // Handle case where terms object is passed instead of number
  if (typeof licenseType !== 'number') {
    const terms = licenseType as { commercialUse?: boolean; derivativesAllowed?: boolean } | undefined
    if (!terms) return 'Unknown'
    if (terms.commercialUse && terms.derivativesAllowed) return 'Commercial Remix'
    if (terms.commercialUse) return 'Commercial Use'
    return 'Non-Commercial Social Remixing'
  }
  const labels: Record<number, string> = {
    0: 'Non-Commercial Social Remixing',
    1: 'Commercial Use',
    2: 'Commercial Remix',
  }
  return labels[licenseType] || `License Type ${licenseType}`
}

export function formatMintingFee(fee: string | bigint | undefined): string {
  if (!fee) return '0'
  const value = typeof fee === 'bigint' ? fee : BigInt(fee)
  return (Number(value) / 1e18).toFixed(4)
}

export function getAssetImageUrl(asset: IPAsset | null): string | undefined {
  if (!asset) return undefined
  const image = asset.nftMetadata?.image
  if (!image) return undefined
  if (typeof image === 'string') return image
  return image.cachedUrl || image.originalUrl || image.thumbnailUrl || undefined
}

export function formatTimestamp(timestamp: string | number | undefined): string {
  if (!timestamp) return 'Unknown'
  const date = new Date(typeof timestamp === 'number' ? timestamp * 1000 : timestamp)
  return date.toLocaleDateString()
}

class StoryService {
  async getIPAsset(_ipId: string): Promise<IPAsset | null> {
    return null
  }

  async getUserAssets(_address: string): Promise<IPAsset[]> {
    return []
  }
}

export const storyService = new StoryService()
