// Story Protocol Types

import { Address } from 'viem'
import { StoryClient } from '@story-protocol/core-sdk'

// ============================================
// Creator and Metadata Types
// ============================================

export interface IpCreator {
  name: string
  address: string
  contributionPercent: number
  description?: string
  role?: string
}

export interface IpMetadata {
  title: string
  description?: string
  createdAt?: string
  ipType?: string
  image?: string
  imageHash?: string
  mediaUrl?: string
  mediaHash?: string
  mediaType?: string
  creators?: IpCreator[]
  tags?: string[]
}

export interface NftMetadata {
  name: string
  description?: string
  image?: string
  attributes?: Array<{ trait_type: string; value: string }>
}

// ============================================
// Collection Types
// ============================================

export interface UserCollection {
  collectionAddress: string
  collectionName?: string
  collectionMetadata?: {
    name?: string
    symbol?: string
    chain?: string
    address?: string
    totalSupply?: string
    tokenType?: string
    contractDeployer?: string
    deployedBlockNumber?: number
  }
  assetCount?: number
  licensesCount?: number
  createdAt?: string
  updatedAt?: string
  resolvedDisputeCount?: number
  cancelledDisputeCount?: number
  raisedDisputeCount?: number
  judgedDisputeCount?: number
}

// ============================================
// License Types
// ============================================

export interface LicenseTerms {
  transferable: boolean
  commercialUse: boolean
  commercialAttribution: boolean
  commercialRevShare: number
  defaultMintingFee: bigint | string
  derivativesAllowed: boolean
  derivativesAttribution: boolean
  derivativesApproval: boolean
  derivativesReciprocal: boolean
  expiration: bigint | string
  currency: string
  uri?: string
}

export interface FetchedLicense {
  licenseTermsId: string
  licenseTemplate: Address
  terms: LicenseTerms
}

export interface AttachedLicense {
  id?: string
  licenseTermsId: string
  licensingConfig?: {
    commercialRevShare?: number
    mintingFee?: string
    disabled?: boolean
  }
  terms?: Partial<LicenseTerms>
}

export interface OwnedLicenseToken {
  tokenId: string
  licensorIpId: string
  licenseTermsId: string
  transferable: boolean
  ownerAddress: string
  burnedAt?: string
  expiresAt?: string
  blockNumber?: string
  blockTimestamp?: string
  licenseTerms?: Partial<LicenseTerms>
}

// ============================================
// IP Asset Types
// ============================================

export interface IPAsset {
  ipId: string
  chainId?: string
  tokenContract?: string
  tokenId?: string
  ownerAddress?: string
  name?: string
  title?: string
  description?: string
  uri?: string
  registrationDate?: string
  createdAt?: string
  blockNumber?: string
  blockTimestamp?: string
  metadata?: {
    name?: string
    description?: string
    image?: string
    hash?: string
    registrationDate?: string
    registrant?: string
    uri?: string
  }
  nftMetadata?: {
    name?: string
    description?: string
    image?: {
      cachedUrl?: string
      thumbnailUrl?: string
      pngUrl?: string
      originalUrl?: string
      contentType?: string
    }
    tokenContract?: string
    tokenId?: string
    tokenUri?: string
  }
  licenses?: AttachedLicense[]
}

// Alias for backwards compatibility
export type IPAssetData = IPAsset

// Specialized type for License Tab with required fields
export interface LicenseTabIPAsset {
  ipId: string
  tokenId: string
  nftMetadata?: {
    name?: string
    image?: {
      cachedUrl?: string
      thumbnailUrl?: string
      originalUrl?: string
    }
  }
  metadata?: {
    name?: string
  }
  licenses?: Array<{
    licenseTermsId: string
    terms?: {
      commercialUse?: boolean
      derivativesAllowed?: boolean
      commercialRevShare?: number
      defaultMintingFee?: bigint | string
      transferable?: boolean
    }
  }>
}

// ============================================
// Dispute Types
// ============================================

export interface DisputeEvidence {
  title: string
  description: string
  disputeReason: string
  originalWorkDetails?: {
    title?: string
    creator?: string
    creationDate?: string
    registrationUrl?: string
  }
  proofUrls: string[]
  additionalNotes?: string
  timestamp: string
  disputant?: string
}

export interface DisputeData {
  id: string
  disputeId: string
  targetIpId: string
  targetTag: string
  initiator: string
  currentTag?: string
  status?: string
  arbitrationPolicy?: string
  evidenceLink?: string
  blockNumber?: string
  blockTimestamp?: string
  resolvedAt?: string
}

// ============================================
// Transaction Types
// ============================================

export interface TransactionData {
  txHash: string
  eventType: string
  ipId?: string
  initiator?: string
  resourceId?: string
  blockNumber: string
  blockTimestamp: string
  actionType?: string
  details?: Record<string, unknown>
}

// ============================================
// Relationship Types
// ============================================

export interface IPAssetEdge {
  parentIpId: string
  childIpId: string
  licenseTermsId?: string
  blockNumber?: string
  blockTimestamp?: string
}

// ============================================
// Result Types
// ============================================

export interface RegistrationResult {
  txHash?: string
  ipId?: string
  tokenId?: string
  licenseTermsIds?: string[]
}

export interface LicenseResult {
  txHash?: string
  licenseTermsId?: string
}

export interface MintResult {
  txHash?: string
  licenseTokenIds?: string[]
}

export interface DisputeResult {
  txHash?: string
  disputeId?: string
}

export interface RoyaltyResult {
  txHashes?: string[]
  claimedAmount?: string
}

export interface PaymentResult {
  txHash?: string
}

// ============================================
// Component Props Types
// ============================================

export interface StoryTabProps {
  getClient: () => Promise<StoryClient | null>
  address: string | undefined
}

export interface MyAssetsTabProps {
  address: string | undefined
}

// ============================================
// API Response Types
// ============================================

export interface StoryApiResponse<T> {
  data: T[]
  pagination?: {
    limit: number
    offset: number
    total?: number
  }
}

// ============================================
// Mint & Registration Types
// ============================================

export interface MintableIPA extends IPAsset {
  licenses?: Array<{
    licenseTermsId: string
    terms?: Partial<LicenseTerms>
  }>
}

export interface ParentIPSelection {
  parentIpId: string
  licenseTermsId: string
  licenseTokenId?: string
}
