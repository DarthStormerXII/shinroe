import type { Address } from 'viem'

// Contract addresses organized by chain ID and categorized by type
export const ADDRESSES: Record<number, {
  erc20: Record<string, Address>
  erc721: Record<string, Address>
  other: Record<string, Address>
}> = {
  11155111: {
    erc20: {
      FreeMintERC20: '0xab11cda079c613eFA68C35dC46e4C05E0b1e1645',
    },
    erc721: {
      FreeMintERC721: '0xCAe1c804932AB07d3428774058eC14Fb4dfb2baB',
    },
    other: {
      Counter: '0x773d64029E11408B2D455e5931Bc5F1C2e828b6B',
    },
  },
} as const

// Helper function to get contract address by type and name
export function getContractAddress(chainId: number, type: 'erc20' | 'erc721' | 'other', contractName: string): Address | undefined {
  return ADDRESSES[chainId]?.[type]?.[contractName]
}

// Helper function to get all ERC20 tokens for a chain
export function getERC20Tokens(chainId: number): Record<string, Address> {
  return ADDRESSES[chainId]?.erc20 || {}
}

// Helper function to get all ERC721 collections for a chain
export function getERC721Collections(chainId: number): Record<string, Address> {
  return ADDRESSES[chainId]?.erc721 || {}
}

// Helper function to get all other contracts for a chain
export function getOtherContracts(chainId: number): Record<string, Address> {
  return ADDRESSES[chainId]?.other || {}
}

// Helper function to get all addresses for a chain (legacy support)
export function getChainAddresses(chainId: number): { erc20: Record<string, Address>, erc721: Record<string, Address>, other: Record<string, Address> } | undefined {
  return ADDRESSES[chainId]
}

// Helper function to check if contract is deployed on chain
export function isContractDeployed(chainId: number, type: 'erc20' | 'erc721' | 'other', contractName: string): boolean {
  const address = getContractAddress(chainId, type, contractName)
  return address !== undefined && address !== '0x0000000000000000000000000000000000000000'
}