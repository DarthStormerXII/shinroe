// Indexer URL configuration
// Constructs the subgraph URL from the base indexer URL

const SUBGRAPH_NAME = 'shinroe'

/**
 * Get the full subgraph URL for querying
 * Throws if NEXT_PUBLIC_INDEXER_URL is not configured
 */
export function getSubgraphUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_INDEXER_URL
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_INDEXER_URL is required but not configured')
  }
  // Remove trailing slash if present
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
  return `${cleanBaseUrl}/subgraphs/name/${SUBGRAPH_NAME}`
}

/**
 * Check if indexer is configured
 */
export function isIndexerConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_INDEXER_URL
}
