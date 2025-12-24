import { defineChain } from 'viem'

// Proxy URL to avoid CORS issues with VeryChain RPC
// Uses Next.js API route /api/rpc/verychain which proxies to https://rpc.verylabs.io
const VERYCHAIN_RPC_URL = '/api/rpc/verychain'

export const verychain = defineChain({
  id: 4613,
  name: 'VeryChain',
  network: 'verychain',
  nativeCurrency: {
    name: 'VERY',
    symbol: 'VERY',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [VERYCHAIN_RPC_URL],
    },
    public: {
      http: [VERYCHAIN_RPC_URL],
    },
  },
  blockExplorers: {
    default: {
      name: 'VeryScan',
      url: 'https://www.veryscan.io',
    },
  },
})

// Direct RPC URL for server-side usage (no CORS issues)
export const VERYCHAIN_DIRECT_RPC = 'https://rpc.verylabs.io'
