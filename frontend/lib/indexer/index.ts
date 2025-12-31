/**
 * Indexer Module
 *
 * Unified indexer integration for The Graph and Goldsky
 */

// Types
export * from './types';

// Providers
export * from './providers';

// Re-export commonly used items
export {
  getProvider,
  getAllProviders,
  getProviderInfoList,
  isValidProvider,
  detectProviderFromEndpoint,
} from './providers';

export { theGraphProvider } from './providers/thegraph';
export { goldskyProvider } from './providers/goldsky';
