// Subgraph endpoint configurations
// Each subgraph supports both TheGraph and Goldsky endpoints

export interface IndexedContract {
  name: string
  address: string
  chainId: number
  chainName: string
  explorerUrl: string
  startBlock: number
}

export interface SubgraphConfig {
  name: string
  description?: string
  thegraph: {
    endpoint: string
  }
  goldsky: {
    endpoint: string
    versionEndpoint?: string
  }
  activeProvider: 'thegraph' | 'goldsky'
  // Contracts indexed by this subgraph
  contracts: IndexedContract[]
  schemaContent?: string
}

// Import chain-specific configs
import { freemintSubgraph } from './11155111/freemint'
import { freemintSubgraph as freemintAmoySubgraph } from './80002/freemint'
import { shinroeSubgraph } from './80002/shinroe'

// Subgraph registry by chainId
export const subgraphs: Record<number, Record<string, SubgraphConfig>> = {
  11155111: {
    freemint: freemintSubgraph,
  },
  80002: {
    freemint: freemintAmoySubgraph,
    shinroe: shinroeSubgraph,
  },
}

/**
 * Get the active endpoint URL for a subgraph
 */
export function getSubgraphEndpoint(chainId: number, name: string): string {
  const chainSubgraphs = subgraphs[chainId]
  if (!chainSubgraphs) {
    throw new Error(`No subgraphs configured for chain ${chainId}`)
  }

  const config = chainSubgraphs[name]
  if (!config) {
    throw new Error(`Subgraph "${name}" not found for chain ${chainId}`)
  }

  return config[config.activeProvider].endpoint
}

/**
 * Get all subgraph configs for a chain
 */
export function getChainSubgraphs(chainId: number): Record<string, SubgraphConfig> {
  return subgraphs[chainId] ?? {}
}

/**
 * Check if a subgraph exists for a chain
 */
export function hasSubgraph(chainId: number, name: string): boolean {
  return Boolean(subgraphs[chainId]?.[name])
}

/**
 * Get all subgraphs that have a valid endpoint for the specified provider
 */
export function getSubgraphsByProvider(provider: 'thegraph' | 'goldsky'): SubgraphConfig[] {
  const result: SubgraphConfig[] = []
  for (const chainSubgraphs of Object.values(subgraphs)) {
    for (const config of Object.values(chainSubgraphs)) {
      // Include if the provider has a valid endpoint
      if (config[provider].endpoint) {
        result.push(config)
      }
    }
  }
  return result
}

/**
 * Get all configured subgraphs as a flat array
 */
export function getAllSubgraphs(): SubgraphConfig[] {
  const result: SubgraphConfig[] = []
  for (const chainSubgraphs of Object.values(subgraphs)) {
    for (const config of Object.values(chainSubgraphs)) {
      result.push(config)
    }
  }
  return result
}
