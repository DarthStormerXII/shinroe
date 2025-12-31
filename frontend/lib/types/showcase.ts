import type { Token } from './web3/web3'
import type { NFTAttribute } from './web3/nft'

export interface NFT {
  address: string
  tokenId: string
  name: string
  description?: string
  image?: string
  attributes?: NFTAttribute[]
  collection?: string
}

export interface ShowcaseTransaction {
  hash: string
  from: string
  to?: string
  value: bigint
  status: 'pending' | 'confirmed' | 'failed'
  timestamp: number
  blockNumber?: number
  type?: 'transfer' | 'swap' | 'mint' | 'burn' | 'approve' | 'contract'
  token?: Token
  nft?: {
    address: string
    tokenId: string
    name: string
    collection: string
  }
}