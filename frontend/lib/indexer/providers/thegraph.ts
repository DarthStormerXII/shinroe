/**
 * The Graph Provider Implementation
 */

import { BaseIndexerProvider } from './base';
import {
  ProviderInfo,
  NetworkConfig,
  EndpointConfig,
  DeploymentStep,
  DeploymentConfig,
} from '../types';

export class TheGraphProvider extends BaseIndexerProvider {
  readonly id = 'thegraph' as const;
  readonly name = 'The Graph';

  readonly info: ProviderInfo = {
    id: 'thegraph',
    name: 'The Graph',
    description: 'Decentralized protocol for indexing and querying blockchain data. The industry standard for Web3 data infrastructure.',
    features: [
      'Decentralized indexing network',
      'GraphQL API for querying',
      'Support for 40+ networks',
      'Subgraph Studio for development',
      'Community of indexers',
      'Open source tooling',
    ],
    documentationUrl: 'https://thegraph.com/docs/',
  };

  getNetworks(): NetworkConfig[] {
    return [
      { id: 'mainnet', name: 'Ethereum Mainnet', chainId: 1, isTestnet: false, explorerUrl: 'https://etherscan.io' },
      { id: 'sepolia', name: 'Sepolia', chainId: 11155111, isTestnet: true, explorerUrl: 'https://sepolia.etherscan.io' },
      { id: 'polygon', name: 'Polygon', chainId: 137, isTestnet: false, explorerUrl: 'https://polygonscan.com' },
      { id: 'polygon-amoy', name: 'Polygon Amoy', chainId: 80002, isTestnet: true, explorerUrl: 'https://amoy.polygonscan.com' },
      { id: 'arbitrum-one', name: 'Arbitrum One', chainId: 42161, isTestnet: false, explorerUrl: 'https://arbiscan.io' },
      { id: 'arbitrum-sepolia', name: 'Arbitrum Sepolia', chainId: 421614, isTestnet: true, explorerUrl: 'https://sepolia.arbiscan.io' },
      { id: 'optimism', name: 'Optimism', chainId: 10, isTestnet: false, explorerUrl: 'https://optimistic.etherscan.io' },
      { id: 'optimism-sepolia', name: 'Optimism Sepolia', chainId: 11155420, isTestnet: true },
      { id: 'base', name: 'Base', chainId: 8453, isTestnet: false, explorerUrl: 'https://basescan.org' },
      { id: 'base-sepolia', name: 'Base Sepolia', chainId: 84532, isTestnet: true, explorerUrl: 'https://sepolia.basescan.org' },
      { id: 'avalanche', name: 'Avalanche', chainId: 43114, isTestnet: false, explorerUrl: 'https://snowtrace.io' },
      { id: 'bsc', name: 'BNB Chain', chainId: 56, isTestnet: false, explorerUrl: 'https://bscscan.com' },
      { id: 'gnosis', name: 'Gnosis', chainId: 100, isTestnet: false, explorerUrl: 'https://gnosisscan.io' },
      { id: 'celo', name: 'Celo', chainId: 42220, isTestnet: false, explorerUrl: 'https://celoscan.io' },
      { id: 'scroll', name: 'Scroll', chainId: 534352, isTestnet: false, explorerUrl: 'https://scrollscan.com' },
      { id: 'linea', name: 'Linea', chainId: 59144, isTestnet: false, explorerUrl: 'https://lineascan.build' },
      { id: 'zksync-era', name: 'zkSync Era', chainId: 324, isTestnet: false, explorerUrl: 'https://explorer.zksync.io' },
      { id: 'fantom', name: 'Fantom', chainId: 250, isTestnet: false, explorerUrl: 'https://ftmscan.com' },
    ];
  }

  buildEndpoint(config: EndpointConfig): string {
    const { subgraphSlug, version, apiKey, studioId, subgraphId } = config;

    // Decentralized network endpoint (production)
    if (subgraphId && apiKey) {
      return `https://gateway.thegraph.com/api/${apiKey}/subgraphs/id/${subgraphId}`;
    }

    // Subgraph Studio endpoint (development)
    if (studioId) {
      const versionPath = version || 'version/latest';
      return `https://api.studio.thegraph.com/query/${studioId}/${subgraphSlug}/${versionPath}`;
    }

    // Fallback - assume it's a complete URL
    return subgraphSlug;
  }

  parseEndpoint(url: string): Partial<EndpointConfig> | null {
    // Parse Studio URL
    const studioMatch = url.match(
      /api\.studio\.thegraph\.com\/query\/(\d+)\/([^\/]+)\/([^\/]+)/
    );
    if (studioMatch) {
      return {
        provider: 'thegraph',
        studioId: studioMatch[1],
        subgraphSlug: studioMatch[2],
        version: studioMatch[3],
      };
    }

    // Parse Gateway URL
    const gatewayMatch = url.match(
      /gateway\.thegraph\.com\/api\/([^\/]+)\/subgraphs\/id\/([^\/]+)/
    );
    if (gatewayMatch) {
      return {
        provider: 'thegraph',
        apiKey: gatewayMatch[1],
        subgraphId: gatewayMatch[2],
      };
    }

    return null;
  }

  getDeploymentSteps(): DeploymentStep[] {
    return [
      {
        id: 'install',
        title: 'Install The Graph CLI',
        description: 'Install the Graph CLI globally using npm',
        command: 'npm install -g @graphprotocol/graph-cli',
      },
      {
        id: 'init',
        title: 'Initialize Subgraph',
        description: 'Create a new subgraph from your contract',
        command: 'graph init --studio <SUBGRAPH_SLUG>',
      },
      {
        id: 'auth',
        title: 'Authenticate',
        description: 'Login to Subgraph Studio with your deploy key',
        command: 'graph auth --studio <DEPLOY_KEY>',
      },
      {
        id: 'codegen',
        title: 'Generate Types',
        description: 'Generate AssemblyScript types from your schema and ABIs',
        command: 'graph codegen',
      },
      {
        id: 'build',
        title: 'Build Subgraph',
        description: 'Compile your subgraph to WebAssembly',
        command: 'graph build',
      },
      {
        id: 'deploy',
        title: 'Deploy to Studio',
        description: 'Deploy your subgraph to Subgraph Studio for testing',
        command: 'graph deploy --studio <SUBGRAPH_SLUG>',
      },
      {
        id: 'publish',
        title: 'Publish to Network',
        description: 'Publish your subgraph to the decentralized network (optional)',
        command: 'graph publish --subgraph-id <SUBGRAPH_ID>',
        isOptional: true,
      },
    ];
  }

  getCliInstallCommand(): string {
    return 'npm install -g @graphprotocol/graph-cli';
  }

  getDeployCommand(config: DeploymentConfig): string {
    const { subgraphName, version } = config;
    return `graph deploy --studio ${subgraphName} --version-label ${version}`;
  }
}

// Singleton instance
export const theGraphProvider = new TheGraphProvider();
