/**
 * Indexer Providers Index
 */

export * from './base';
export * from './thegraph';
export * from './goldsky';

import { theGraphProvider } from './thegraph';
import { goldskyProvider } from './goldsky';
import { IIndexerProvider, IndexerProvider, ProviderInfo } from '../types';

// Provider registry
const providers: Record<IndexerProvider, IIndexerProvider> = {
  thegraph: theGraphProvider,
  goldsky: goldskyProvider,
};

/**
 * Get provider instance by ID
 */
export function getProvider(id: IndexerProvider): IIndexerProvider {
  const provider = providers[id];
  if (!provider) {
    throw new Error(`Unknown provider: ${id}`);
  }
  return provider;
}

/**
 * Get all available providers
 */
export function getAllProviders(): IIndexerProvider[] {
  return Object.values(providers);
}

/**
 * Get provider info for display
 */
export function getProviderInfoList(): ProviderInfo[] {
  return getAllProviders().map((p) => p.info);
}

/**
 * Check if a provider ID is valid
 */
export function isValidProvider(id: string): id is IndexerProvider {
  return id in providers;
}

/**
 * Parse an endpoint URL to determine the provider
 */
export function detectProviderFromEndpoint(url: string): IndexerProvider | null {
  for (const provider of getAllProviders()) {
    const parsed = provider.parseEndpoint(url);
    if (parsed) {
      return provider.id;
    }
  }
  return null;
}
