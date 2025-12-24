// DID Resolver Configuration for VeryChain
import { getResolver as getEthrResolver } from 'ethr-did-resolver'
import { Resolver } from 'did-resolver'

// VeryChain configuration
export const VERYCHAIN_CHAIN_ID = 4613
export const VERYCHAIN_CHAIN_ID_HEX = `0x${VERYCHAIN_CHAIN_ID.toString(16)}`

// RPC endpoint for VeryChain
const VERYCHAIN_RPC_URL =
  process.env.NEXT_PUBLIC_VERYCHAIN_RPC_URL || 'https://rpc.verylabs.io'

// ethr-did-resolver provider configuration for VeryChain
export const ethrDidConfig = {
  networks: [
    {
      name: 'verychain',
      chainId: VERYCHAIN_CHAIN_ID,
      rpcUrl: VERYCHAIN_RPC_URL,
      // Optional: If using on-chain DID registry
      // registry: '0x...' // ERC1056 Registry address on VeryChain
    },
  ],
}

// Create resolver for did:ethr method
export function createDIDResolver(): Resolver {
  const ethrResolver = getEthrResolver(ethrDidConfig)
  return new Resolver({
    ...ethrResolver,
  })
}

// Singleton resolver instance
let resolverInstance: Resolver | null = null

export function getDIDResolver(): Resolver {
  if (!resolverInstance) {
    resolverInstance = createDIDResolver()
  }
  return resolverInstance
}
