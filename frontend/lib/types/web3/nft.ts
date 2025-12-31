export interface NFTAttribute {
  trait_type: string
  value: string | number
  display_type?: string
}

export interface NFTMetadata {
  name?: string
  description?: string
  image?: string
  attributes?: NFTAttribute[]
  animation_url?: string
  external_url?: string
}

export interface NFTCollection {
  address: string
  name: string
  symbol: string
  description?: string
  image?: string
  totalSupply?: number
  floorPrice?: number
  verified?: boolean
}