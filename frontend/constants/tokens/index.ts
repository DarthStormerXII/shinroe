import type { Address } from 'viem'

// Token types
export interface ERC20Token {
  address: Address
  name: string
  symbol: string
  decimals: number
  logoURI?: string
}

export interface ERC721Token {
  address: Address
  name: string
  symbol: string
  logoURI?: string
}

// Import token data for each chain
import chain_1_erc20 from './1/erc20.json'
import chain_1_erc721 from './1/erc721.json'
import chain_10_erc20 from './10/erc20.json'
import chain_10_erc721 from './10/erc721.json'
import chain_56_erc20 from './56/erc20.json'
import chain_56_erc721 from './56/erc721.json'
import chain_100_erc20 from './100/erc20.json'
import chain_100_erc721 from './100/erc721.json'
import chain_137_erc20 from './137/erc20.json'
import chain_137_erc721 from './137/erc721.json'
import chain_1135_erc20 from './1135/erc20.json'
import chain_1135_erc721 from './1135/erc721.json'
import chain_5000_erc20 from './5000/erc20.json'
import chain_5000_erc721 from './5000/erc721.json'
import chain_8453_erc20 from './8453/erc20.json'
import chain_8453_erc721 from './8453/erc721.json'
import chain_34443_erc20 from './34443/erc20.json'
import chain_34443_erc721 from './34443/erc721.json'
import chain_42161_erc20 from './42161/erc20.json'
import chain_42161_erc721 from './42161/erc721.json'
import chain_43114_erc20 from './43114/erc20.json'
import chain_43114_erc721 from './43114/erc721.json'
import chain_44787_erc20 from './44787/erc20.json'
import chain_44787_erc721 from './44787/erc721.json'
import chain_59144_erc20 from './59144/erc20.json'
import chain_59144_erc721 from './59144/erc721.json'
import chain_81457_erc20 from './81457/erc20.json'
import chain_81457_erc721 from './81457/erc721.json'
import chain_84532_erc20 from './84532/erc20.json'
import chain_84532_erc721 from './84532/erc721.json'
import chain_421614_erc20 from './421614/erc20.json'
import chain_421614_erc721 from './421614/erc721.json'
import chain_534352_erc20 from './534352/erc20.json'
import chain_534352_erc721 from './534352/erc721.json'
import chain_7777777_erc20 from './7777777/erc20.json'
import chain_7777777_erc721 from './7777777/erc721.json'
import chain_11155111_erc20 from './11155111/erc20.json'
import chain_11155111_erc721 from './11155111/erc721.json'
import chain_11155420_erc20 from './11155420/erc20.json'
import chain_11155420_erc721 from './11155420/erc721.json'

// Token registry by chain ID
const ERC20_TOKENS: Record<number, ERC20Token[]> = {
  1: chain_1_erc20 as ERC20Token[],
  10: chain_10_erc20 as ERC20Token[],
  56: chain_56_erc20 as ERC20Token[],
  100: chain_100_erc20 as ERC20Token[],
  137: chain_137_erc20 as ERC20Token[],
  1135: chain_1135_erc20 as ERC20Token[],
  5000: chain_5000_erc20 as ERC20Token[],
  8453: chain_8453_erc20 as ERC20Token[],
  34443: chain_34443_erc20 as ERC20Token[],
  42161: chain_42161_erc20 as ERC20Token[],
  43114: chain_43114_erc20 as ERC20Token[],
  44787: chain_44787_erc20 as ERC20Token[],
  59144: chain_59144_erc20 as ERC20Token[],
  81457: chain_81457_erc20 as ERC20Token[],
  84532: chain_84532_erc20 as ERC20Token[],
  421614: chain_421614_erc20 as ERC20Token[],
  534352: chain_534352_erc20 as ERC20Token[],
  7777777: chain_7777777_erc20 as ERC20Token[],
  11155111: chain_11155111_erc20 as ERC20Token[],
  11155420: chain_11155420_erc20 as ERC20Token[],
}

const ERC721_TOKENS: Record<number, ERC721Token[]> = {
  1: chain_1_erc721 as ERC721Token[],
  10: chain_10_erc721 as ERC721Token[],
  56: chain_56_erc721 as ERC721Token[],
  100: chain_100_erc721 as ERC721Token[],
  137: chain_137_erc721 as ERC721Token[],
  1135: chain_1135_erc721 as ERC721Token[],
  5000: chain_5000_erc721 as ERC721Token[],
  8453: chain_8453_erc721 as ERC721Token[],
  34443: chain_34443_erc721 as ERC721Token[],
  42161: chain_42161_erc721 as ERC721Token[],
  43114: chain_43114_erc721 as ERC721Token[],
  44787: chain_44787_erc721 as ERC721Token[],
  59144: chain_59144_erc721 as ERC721Token[],
  81457: chain_81457_erc721 as ERC721Token[],
  84532: chain_84532_erc721 as ERC721Token[],
  421614: chain_421614_erc721 as ERC721Token[],
  534352: chain_534352_erc721 as ERC721Token[],
  7777777: chain_7777777_erc721 as ERC721Token[],
  11155111: chain_11155111_erc721 as ERC721Token[],
  11155420: chain_11155420_erc721 as ERC721Token[],
}

// Supported chain IDs
export const SUPPORTED_CHAIN_IDS = [1, 10, 56, 100, 137, 1135, 5000, 8453, 34443, 42161, 43114, 44787, 59144, 81457, 84532, 421614, 534352, 7777777, 11155111, 11155420] as const
export type SupportedChainId = typeof SUPPORTED_CHAIN_IDS[number]

// Helper functions
export function getERC20Tokens(chainId: number): ERC20Token[] {
  return ERC20_TOKENS[chainId] || []
}

export function getERC721Tokens(chainId: number): ERC721Token[] {
  return ERC721_TOKENS[chainId] || []
}

export function getERC20TokenByAddress(chainId: number, address: string): ERC20Token | undefined {
  return getERC20Tokens(chainId).find(
    (token) => token.address.toLowerCase() === address.toLowerCase()
  )
}

export function getERC721TokenByAddress(chainId: number, address: string): ERC721Token | undefined {
  return getERC721Tokens(chainId).find(
    (token) => token.address.toLowerCase() === address.toLowerCase()
  )
}

export function isChainSupported(chainId: number): boolean {
  return SUPPORTED_CHAIN_IDS.includes(chainId as SupportedChainId)
}

// Get all tokens for a chain (combined ERC20 and ERC721)
export function getAllTokens(chainId: number): (ERC20Token | ERC721Token)[] {
  return [...getERC20Tokens(chainId), ...getERC721Tokens(chainId)]
}

// Search tokens by symbol or name
export function searchTokens(chainId: number, query: string): ERC20Token[] {
  const tokens = getERC20Tokens(chainId)
  const lowercaseQuery = query.toLowerCase()
  return tokens.filter(
    (token) =>
      token.symbol.toLowerCase().includes(lowercaseQuery) ||
      token.name.toLowerCase().includes(lowercaseQuery)
  )
}
