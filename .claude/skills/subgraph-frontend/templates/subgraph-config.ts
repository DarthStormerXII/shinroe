// ============================================================================
// TEMPLATE: Subgraph Configuration
// Replace: SUBGRAPH_NAME, chain IDs, endpoints
// ============================================================================

export interface SubgraphConfig {
  name: string
  thegraph: {
    endpoint: string
  }
  goldsky: {
    endpoint: string
  }
  activeProvider: 'thegraph' | 'goldsky'
}

// Per-chain subgraph configs
export const subgraphConfigs: Record<number, SubgraphConfig> = {
  // Sepolia (chainId: 11155111)
  11155111: {
    name: 'SUBGRAPH_NAME',
    thegraph: {
      endpoint:
        'https://api.studio.thegraph.com/query/[SUBGRAPH_ID]/SUBGRAPH_NAME/version/latest',
    },
    goldsky: {
      endpoint:
        'https://api.goldsky.com/api/public/[PROJECT_ID]/subgraphs/SUBGRAPH_NAME/prod/gn',
    },
    activeProvider: 'goldsky',
  },

  // Mainnet (chainId: 1)
  1: {
    name: 'SUBGRAPH_NAME',
    thegraph: {
      endpoint:
        'https://gateway.thegraph.com/api/[API_KEY]/subgraphs/id/[DEPLOYMENT_ID]',
    },
    goldsky: {
      endpoint:
        'https://api.goldsky.com/api/public/[PROJECT_ID]/subgraphs/SUBGRAPH_NAME/prod/gn',
    },
    activeProvider: 'goldsky',
  },
}

/**
 * Get subgraph endpoint for current chain
 */
export function getSubgraphEndpoint(chainId: number): string {
  const config = subgraphConfigs[chainId]
  if (!config) {
    throw new Error(`No subgraph config for chain ${chainId}`)
  }
  return config[config.activeProvider].endpoint
}

/**
 * Get all supported chain IDs
 */
export function getSupportedChainIds(): number[] {
  return Object.keys(subgraphConfigs).map(Number)
}
