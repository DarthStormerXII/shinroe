// IPFS URL utilities

const IPFS_GATEWAY = 'https://ipfs.io/ipfs/'

/**
 * Converts an IPFS URI (ipfs://...) to a gateway URL
 */
export function getIpfsUrl(uri: string | undefined): string | null {
  if (!uri) return null

  if (uri.startsWith('ipfs://')) {
    return `${IPFS_GATEWAY}${uri.slice(7)}`
  }

  // Already a regular URL
  if (uri.startsWith('http://') || uri.startsWith('https://')) {
    return uri
  }

  // Assume it's an IPFS CID
  return `${IPFS_GATEWAY}${uri}`
}
