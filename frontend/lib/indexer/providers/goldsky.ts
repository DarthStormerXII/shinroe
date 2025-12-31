/**
 * Goldsky Provider Implementation
 */

import { BaseIndexerProvider } from './base';
import {
  ProviderInfo,
  NetworkConfig,
  EndpointConfig,
  DeploymentStep,
  DeploymentConfig,
} from '../types';

export class GoldskyProvider extends BaseIndexerProvider {
  readonly id = 'goldsky' as const;
  readonly name = 'Goldsky';

  readonly info: ProviderInfo = {
    id: 'goldsky',
    name: 'Goldsky',
    description: 'High-performance managed indexing infrastructure. Up to 6x faster with 99.9%+ uptime and instant subgraphs.',
    features: [
      'Up to 6x faster indexing',
      '99.9%+ uptime SLA',
      'Instant subgraphs from ABI',
      'Native webhook support',
      'Mirror pipelines to databases',
      'Version tags for endpoints',
      'Cross-chain subgraphs',
      'Visual Flow builder',
    ],
    documentationUrl: 'https://docs.goldsky.com/',
  };

  getNetworks(): NetworkConfig[] {
    return [
      { id: 'mainnet', name: 'Ethereum Mainnet', chainId: 1, isTestnet: false, explorerUrl: 'https://etherscan.io' },
      { id: 'sepolia', name: 'Sepolia', chainId: 11155111, isTestnet: true, explorerUrl: 'https://sepolia.etherscan.io' },
      { id: 'polygon', name: 'Polygon', chainId: 137, isTestnet: false, explorerUrl: 'https://polygonscan.com' },
      { id: 'polygon-amoy', name: 'Polygon Amoy', chainId: 80002, isTestnet: true },
      { id: 'arbitrum-one', name: 'Arbitrum One', chainId: 42161, isTestnet: false, explorerUrl: 'https://arbiscan.io' },
      { id: 'arbitrum-sepolia', name: 'Arbitrum Sepolia', chainId: 421614, isTestnet: true },
      { id: 'optimism', name: 'Optimism', chainId: 10, isTestnet: false, explorerUrl: 'https://optimistic.etherscan.io' },
      { id: 'base', name: 'Base', chainId: 8453, isTestnet: false, explorerUrl: 'https://basescan.org' },
      { id: 'base-sepolia', name: 'Base Sepolia', chainId: 84532, isTestnet: true },
      { id: 'avalanche', name: 'Avalanche C-Chain', chainId: 43114, isTestnet: false, explorerUrl: 'https://snowtrace.io' },
      { id: 'bsc', name: 'BNB Chain', chainId: 56, isTestnet: false, explorerUrl: 'https://bscscan.com' },
      { id: 'gnosis', name: 'Gnosis', chainId: 100, isTestnet: false, explorerUrl: 'https://gnosisscan.io' },
      { id: 'celo', name: 'Celo', chainId: 42220, isTestnet: false, explorerUrl: 'https://celoscan.io' },
      { id: 'scroll', name: 'Scroll', chainId: 534352, isTestnet: false, explorerUrl: 'https://scrollscan.com' },
      { id: 'linea', name: 'Linea', chainId: 59144, isTestnet: false, explorerUrl: 'https://lineascan.build' },
      { id: 'zksync-era', name: 'zkSync Era', chainId: 324, isTestnet: false, explorerUrl: 'https://explorer.zksync.io' },
      { id: 'fantom', name: 'Fantom Opera', chainId: 250, isTestnet: false, explorerUrl: 'https://ftmscan.com' },
      { id: 'moonbeam', name: 'Moonbeam', chainId: 1284, isTestnet: false, explorerUrl: 'https://moonscan.io' },
      { id: 'telos', name: 'Telos', chainId: 40, isTestnet: false, explorerUrl: 'https://teloscan.io' },
      { id: 'sei', name: 'Sei', chainId: 1329, isTestnet: false },
      { id: 'blast', name: 'Blast', chainId: 81457, isTestnet: false, explorerUrl: 'https://blastscan.io' },
      { id: 'mode', name: 'Mode', chainId: 34443, isTestnet: false },
      { id: 'lisk', name: 'Lisk', chainId: 1135, isTestnet: false },
    ];
  }

  buildEndpoint(config: EndpointConfig): string {
    const { subgraphSlug, version, tag, projectId } = config;

    if (!projectId) {
      // Assume it's a complete URL
      return subgraphSlug;
    }

    // Use tag if provided, otherwise use version
    const versionOrTag = tag || version || 'latest';

    return `https://api.goldsky.com/api/public/${projectId}/subgraphs/${subgraphSlug}/${versionOrTag}/gn`;
  }

  parseEndpoint(url: string): Partial<EndpointConfig> | null {
    // Parse Goldsky URL
    const match = url.match(
      /api\.goldsky\.com\/api\/public\/([^\/]+)\/subgraphs\/([^\/]+)\/([^\/]+)/
    );

    if (match) {
      const versionOrTag = match[3].replace('/gn', '');
      return {
        provider: 'goldsky',
        projectId: match[1],
        subgraphSlug: match[2],
        // Could be version or tag
        version: versionOrTag,
        tag: versionOrTag,
      };
    }

    return null;
  }

  getDeploymentSteps(): DeploymentStep[] {
    return [
      {
        id: 'install',
        title: 'Install Goldsky CLI',
        description: 'Install the Goldsky CLI (macOS/Linux uses curl, Windows uses npm)',
        command: 'curl https://goldsky.com | sh',
      },
      {
        id: 'login',
        title: 'Login to Goldsky',
        description: 'Authenticate with your API key from the dashboard',
        command: 'goldsky login',
      },
      {
        id: 'deploy-source',
        title: 'Deploy from Source',
        description: 'Deploy your subgraph from local source files',
        command: 'goldsky subgraph deploy <name>/<version> --path .',
      },
      {
        id: 'deploy-abi',
        title: 'Deploy Instant Subgraph',
        description: 'Create an instant subgraph from contract ABI (no code required)',
        command: 'goldsky subgraph deploy <name>/<version> --from-abi <path-to-abi.json>',
        isOptional: true,
      },
      {
        id: 'tag',
        title: 'Create Tag',
        description: 'Create a tag for stable endpoint URLs',
        command: 'goldsky subgraph tag create <name>/<version> --tag prod',
        isOptional: true,
      },
    ];
  }

  getCliInstallCommand(): string {
    // Check platform
    if (typeof window !== 'undefined') {
      const userAgent = window.navigator.userAgent.toLowerCase();
      if (userAgent.includes('windows')) {
        return 'npm install -g @goldskycom/cli';
      }
    }
    return 'curl https://goldsky.com | sh';
  }

  getDeployCommand(config: DeploymentConfig): string {
    const { subgraphName, version } = config;
    return `goldsky subgraph deploy ${subgraphName}/${version} --path .`;
  }

  /**
   * Get command for deploying an instant subgraph from ABI
   */
  getInstantSubgraphCommand(
    name: string,
    version: string,
    abiPath: string,
    contractAddress: string,
    network: string,
    startBlock?: number
  ): string {
    let command = `goldsky subgraph deploy ${name}/${version} --from-abi ${abiPath}`;
    command += ` --address ${contractAddress}`;
    command += ` --network ${network}`;
    if (startBlock) {
      command += ` --start-block ${startBlock}`;
    }
    return command;
  }

  /**
   * Get command for creating a tag
   */
  getTagCommand(name: string, version: string, tag: string): string {
    return `goldsky subgraph tag create ${name}/${version} --tag ${tag}`;
  }
}

// Singleton instance
export const goldskyProvider = new GoldskyProvider();
